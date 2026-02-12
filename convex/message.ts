import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

const createConversation = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join("_");
};

export const sendMessage = mutation({
  args: {
    senderId: v.string(),
    receiverId: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const { senderId, receiverId, body } = args;
    await ctx.db.insert("messages", {
      conversationId: createConversation(senderId, receiverId),
      senderId,
      receiverId,
      body,
      isRead: false,
    });
  },
});

export const getMessages = query({
  args: {
    senderId: v.string(),
    receiverId: v.string(),
  },
  handler: async (ctx, args) => {
    const { senderId, receiverId } = args;
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", createConversation(senderId, receiverId)),
      )
      .order("asc")
      .collect();
  },
});

export const markAsRead = mutation({
  args: {
    senderId: v.string(),
    receiverId: v.string(),
  },
  handler: async (ctx, args) => {
    const { senderId, receiverId } = args;
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", createConversation(senderId, receiverId)),
      )
      .filter((q) => q.eq(q.field("receiverId"), receiverId))
      .collect();
    messages.forEach((message) => {
      ctx.db.patch(message._id, {
        isRead: true,
      });
    });
  },
});

export const getUnreadMessages = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("receiverId"), userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();
  },
});
