import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

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
