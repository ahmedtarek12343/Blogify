import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

export const AddPost = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    image: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }
    const followersForSignedInUser = await ctx.db
      .query("follow")
      .withIndex("by_follower_id", (q) => q.eq("followerId", user._id))
      .collect();

    const blogArticle = await ctx.db.insert("posts", {
      title: args.title,
      body: args.body,
      authorId: user._id,
      imageStorageId: args.image,
    });
    for (const follower of followersForSignedInUser) {
      await ctx.db.insert("notifications", {
        type: "post",
        userId: follower.followingId,
        isRead: false,
        triggeredBy: user._id,
        postId: blogArticle,
        message: `${user?.name} created a new post`,
      });
    }
    return blogArticle;
  },
});

export const toggleLikePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }
    const likeExists = await ctx.db
      .query("likedposts")
      .withIndex("by_author_and_post", (q) =>
        q.eq("authorId", user._id).eq("postId", args.postId),
      )
      .unique();
    if (likeExists) {
      await ctx.db.delete(likeExists._id);
    } else {
      await ctx.db.insert("likedposts", {
        authorId: user._id,
        postId: args.postId,
      });
    }
  },
});

export const isLikedPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }
    const likeExists = await ctx.db
      .query("likedposts")
      .withIndex("by_author_and_post", (q) =>
        q.eq("authorId", user._id).eq("postId", args.postId),
      )
      .unique();
    return likeExists !== null;
  },
});

export const getUserLikedPosts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likedposts")
      .withIndex("by_author_id", (q) => q.eq("authorId", args.userId))
      .collect();
    const posts = await Promise.all(
      likes.map(async (like) => {
        const post = await ctx.db.get(like.postId);
        if (!post) {
          throw new ConvexError("Post not found");
        }
        const user = await authComponent.getAnyUserById(ctx, post.authorId);
        const resolvedImageUrl =
          post.imageStorageId !== undefined
            ? await ctx.storage.getUrl(post.imageStorageId)
            : null;
        return {
          ...post,
          author: user,
          imageUrl: resolvedImageUrl,
        };
      }),
    );
    return posts;
  },
});

export const getPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db
      .query("posts")
      .order("desc")
      .paginate(args.paginationOpts);
    if (!posts) {
      throw new ConvexError("Something went wrong");
    }

    const postsWithAuthors = await Promise.all(
      posts.page.map(async (post) => {
        const user = await authComponent.getAnyUserById(ctx, post.authorId);
        const likes = await ctx.db
          .query("likedposts")
          .withIndex("by_post_id", (q) => q.eq("postId", post._id))
          .collect();
        const resolvedImageUrl =
          post.imageStorageId !== undefined
            ? await ctx.storage.getUrl(post.imageStorageId)
            : null;
        return {
          ...post,
          author: user,
          imageUrl: resolvedImageUrl,
          likes: likes.length,
        };
      }),
    );

    return {
      ...posts,
      page: postsWithAuthors,
    };
  },
});

export const deletePost = mutation({
  args: {
    id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post_id", (q) => q.eq("postId", args.id))
      .collect();
    if (!post) {
      throw new ConvexError("Post not found");
    }
    await ctx.db.delete(args.id);
    await Promise.all(
      comments.map(async (comment) => {
        await ctx.db.delete(comment._id);
      }),
    );
    return post;
  },
});

export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const getPostById = query({
  args: {
    id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new ConvexError("Post not found");
    }
    const user = await authComponent.getAnyUserById(ctx, post.authorId);
    const resolvedImageUrl =
      post.imageStorageId !== undefined
        ? await ctx.storage.getUrl(post.imageStorageId)
        : null;
    return {
      ...post,
      author: user,
      imageUrl: resolvedImageUrl,
    };
  },
});

interface SearchResult {
  post: Doc<"posts">;
  imageURL: string | null;
}

export const searchPosts = query({
  args: {
    term: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const limit = args.limit;
    const results: SearchResult[] = [];
    const seen = new Set();

    const pushDocs = async (docs: Array<Doc<"posts">>) => {
      for (const doc of docs) {
        if (seen.has(doc._id)) continue;
        seen.add(doc._id);

        const resolvedImageUrl =
          doc.imageStorageId !== undefined
            ? await ctx.storage.getUrl(doc.imageStorageId)
            : null;
        results.push({
          post: doc,
          imageURL: resolvedImageUrl,
        });

        if (results.length >= limit) break;
      }
    };

    const titleResults = await ctx.db
      .query("posts")
      .withSearchIndex("by_search_title", (q) => q.search("title", args.term))
      .take(limit);
    await pushDocs(titleResults);

    if (results.length < limit) {
      const bodyResults = await ctx.db
        .query("posts")
        .withSearchIndex("by_search_body", (q) => q.search("body", args.term))
        .take(limit);
      await pushDocs(bodyResults);
    }

    return results;
  },
});

export const getMostLiked = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const allLikes = await ctx.db.query("likedposts").collect();
    const likeCounts = new Map<string, number>();

    for (const like of allLikes) {
      const current = likeCounts.get(like.postId) || 0;
      likeCounts.set(like.postId, current + 1);
    }

    const sortedIds = Array.from(likeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, args.limit)
      .map((entry) => entry[0] as Id<"posts">);

    const posts = await Promise.all(
      sortedIds.map(async (id) => {
        const post = (await ctx.db.get(id)) as Doc<"posts"> | null;
        if (!post) return null;
        const user = await authComponent.getAnyUserById(ctx, post.authorId);
        const resolvedImageUrl =
          post.imageStorageId !== undefined
            ? await ctx.storage.getUrl(post.imageStorageId)
            : null;
        return {
          ...post,
          author: user,
          imageUrl: resolvedImageUrl,
          likesCount: likeCounts.get(id) || 0,
        };
      }),
    );

    return posts.filter((p) => p !== null);
  },
});

export const getRecentPosts = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("posts").order("desc").take(args.limit);

    const postsWithData = await Promise.all(
      posts.map(async (post) => {
        const user = await authComponent.getAnyUserById(ctx, post.authorId);
        const resolvedImageUrl =
          post.imageStorageId !== undefined
            ? await ctx.storage.getUrl(post.imageStorageId)
            : null;

        // Efficient enough for now: fetch like count for each recent post
        // Check if there's an index by postId in likedposts, yes there is "by_post_id"
        // But count() is not directly available, we have to collect().length which is okay for small scale
        // Optimization: For "Recent", maybe we don't strictly need the count on the card immediately?
        // User asked for "most liked blogs ... latest blogs".
        // I'll skip precise count for "latest" to avoid N+1 slow queries if not needed,
        // OR I can just do it because Convex is fast. Let's do it for better UI.
        const likes = await ctx.db
          .query("likedposts")
          .withIndex("by_post_id", (q) => q.eq("postId", post._id))
          .collect();

        return {
          ...post,
          author: user,
          imageUrl: resolvedImageUrl,
          likesCount: likes.length,
        };
      }),
    );

    return postsWithData;
  },
});

export const getPostsByAuthor = query({
  args: {
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author_id", (q) => q.eq("authorId", args.authorId))
      .order("desc") // recent first
      .take(10); // Limit to 10 for now or paginate?? User didn't specify.

    const postsWithData = await Promise.all(
      posts.map(async (post) => {
        const user = await authComponent.getAnyUserById(ctx, post.authorId);
        const resolvedImageUrl =
          post.imageStorageId !== undefined
            ? await ctx.storage.getUrl(post.imageStorageId)
            : null;

        const likes = await ctx.db
          .query("likedposts")
          .withIndex("by_post_id", (q) => q.eq("postId", post._id))
          .collect();

        return {
          ...post,
          author: user,
          imageUrl: resolvedImageUrl,
          likesCount: likes.length,
        };
      }),
    );

    return postsWithData;
  },
});
