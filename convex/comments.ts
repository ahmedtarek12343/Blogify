import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getCommentsByPostId = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .order("desc")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .collect();
    return comments;
  },
});

export const getReplyComments = query({
  args: { parentCommentId: v.id("comments") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .order("asc")
      .filter((q) => q.eq(q.field("parentCommentId"), args.parentCommentId))
      .collect();
    return comments;
  },
});

export const AddComment = mutation({
  args: {
    postId: v.id("posts"),
    parentCommentId: v.optional(v.id("comments")),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }
    await ctx.db.insert("comments", {
      ...args,
      authorId: user._id,
      authorName: user.name,
    });
  },
});

export const DeleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }
    const comment = await ctx.db.get("comments", args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }
    await ctx.db.delete("comments", args.commentId);
  },
});
