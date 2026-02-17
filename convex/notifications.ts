import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { paginationOptsValidator } from "convex/server";

export const AddNotifications = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    message: v.string(),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
    if (
      notifications.some(
        (notification) =>
          notification.type === args.type &&
          notification.triggeredBy === user._id &&
          notification.type === "follow",
      )
    ) {
      return;
    }

    if (user._id === args.userId) {
      return;
    }

    await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      triggeredBy: user._id,
    });
  },
});

export const GetNotifications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich notifications with sender info
    const enrichedNotifications = await Promise.all(
      notifications.page.map(async (n) => {
        const sender = await authComponent.getAnyUserById(ctx, n.triggeredBy);
        return {
          ...n,
          senderName: sender?.name || "Unknown",
          senderImage: sender?.image || "",
          senderId: sender?._id,
        };
      }),
    );

    return { ...notifications, page: enrichedNotifications };
  },
});

export const MarkNotificationsAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("User not authenticated");
    }
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();
    notifications.forEach((notification) => {
      ctx.db.patch(notification._id, {
        isRead: true,
      });
    });
  },
});
