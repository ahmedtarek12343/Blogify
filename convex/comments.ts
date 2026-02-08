import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";
import { authComponent } from "./auth";
import { Doc, Id } from "./_generated/dataModel";

export const getCommentsByPostId = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();
    const users = await Promise.all(
      comments.map(async (comment) => {
        const user = await authComponent.getAnyUserById(ctx, comment.authorId);
        return user;
      }),
    );
    return { comments, users };
  },
});

export const getReplyComments = query({
  args: { parentCommentId: v.id("comments") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_parent_comment_id", (q) =>
        q.eq("parentCommentId", args.parentCommentId),
      )
      .order("asc")
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
  handler: async (ctx, { commentId }) => {
    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    await deleteCommentTree(ctx, commentId);
  },
});

async function deleteCommentTree(ctx: MutationCtx, commentId: Id<"comments">) {
  // Find direct replies using the index
  const children = await ctx.db
    .query("comments")
    .withIndex("by_parent_comment_id", (q) =>
      q.eq("parentCommentId", commentId),
    )
    .collect();

  // Recursively delete all children
  for (const child of children) {
    await deleteCommentTree(ctx, child._id);
  }

  // Delete this comment
  await ctx.db.delete(commentId);
}

export const EditComment = mutation({
  args: { commentId: v.id("comments"), body: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }
    const comment = await ctx.db.get("comments", args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    const befUpdate = await ctx.db.get("comments", args.commentId);
    await ctx.db.patch(args.commentId, {
      body: args.body,
      isEdited: befUpdate?.isEdited || args.body !== befUpdate?.body,
    });
    return befUpdate?.body === args.body;
  },
});

export const ToggleLike = mutation({
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
    const exisitingLike = await ctx.db
      .query("likedcomments")
      .withIndex("by_author_and_comment", (q) =>
        q.eq("authorId", user._id).eq("commentId", args.commentId),
      )
      .unique();
    if (exisitingLike) {
      await ctx.db.delete(exisitingLike._id);
    } else {
      await ctx.db.insert("likedcomments", {
        authorId: user._id,
        commentId: args.commentId,
      });
    }
  },
});

export const getLikesByCommentId = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likedcomments")
      .withIndex("by_comment_id", (q) => q.eq("commentId", args.commentId))
      .collect();

    const users = await Promise.all(
      likes.map(async (like) => {
        const user = await authComponent.getAnyUserById(ctx, like.authorId);
        return user;
      }),
    );
    return { likes, users };
  },
});
