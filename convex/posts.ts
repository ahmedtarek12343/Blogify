import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";
import { Doc } from "./_generated/dataModel";

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
    const blogArticle = await ctx.db.insert("posts", {
      title: args.title,
      body: args.body,
      authorId: user._id,
      imageStorageId: args.image,
    });
    return blogArticle;
  },
});

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();
    if (!posts) {
      throw new ConvexError("Something went wrong");
    }

    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
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

    return postsWithAuthors;
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
      .filter((q) => q.eq(q.field("postId"), args.id))
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
