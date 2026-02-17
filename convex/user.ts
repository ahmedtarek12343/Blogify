// convex/users.ts
import { query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const discoverUsers = query({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.safeGetAuthUser(ctx);
    if (!currentUser) return [];

    const limit = args.limit ?? 20;

    // Strategy 1: Get users from your network
    const followers = await ctx.db
      .query("follow")
      .withIndex("by_following_id", (q) => q.eq("followingId", currentUser._id))
      .take(50);

    const following = await ctx.db
      .query("follow")
      .withIndex("by_follower_id", (q) => q.eq("followerId", currentUser._id))
      .take(50);

    // Strategy 2: Get active users (who posted recently)
    const recentPosts = await ctx.db.query("posts").order("desc").take(100);

    // Strategy 3: Get users who commented recently
    const recentComments = await ctx.db
      .query("comments")
      .order("desc")
      .take(100);

    // Collect all unique user IDs
    const userIds = new Set<string>();

    followers.forEach((f) => userIds.add(f.followerId));
    following.forEach((f) => userIds.add(f.followingId));
    recentPosts.forEach((p) => userIds.add(p.authorId));
    recentComments.forEach((c) => userIds.add(c.authorId));

    // Remove current user
    userIds.delete(currentUser._id);

    // Fetch user details
    const users = (
      await Promise.all(
        Array.from(userIds).map(async (id) => {
          const user = await authComponent.getAnyUserById(ctx, id);
          if (!user) return null;

          // Count their activity for relevance scoring
          const postCount = await ctx.db
            .query("posts")
            .withIndex("by_author_id", (q) => q.eq("authorId", id))
            .collect();

          const isFollowing = following.some((f) => f.followingId === id);
          const isFollower = followers.some((f) => f.followerId === id);

          return {
            _id: user._id,
            name: user.name || "",
            email: user.email || "",
            image: user.image,
            // Metadata for sorting
            postCount: postCount.length,
            isFollowing,
            isFollower,
            isMutual: isFollowing && isFollower,
          };
        }),
      )
    ).filter((u) => u !== null) as Array<{
      _id: string;
      name: string;
      email: string;
      image?: string;
      postCount: number;
      isFollowing: boolean;
      isFollower: boolean;
      isMutual: boolean;
    }>;

    // Filter by search query if provided
    let filtered = users;
    if (args.query && args.query.length >= 2) {
      const searchLower = args.query.toLowerCase();
      filtered = users.filter((user) => {
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort by relevance:
    // 1. Mutual follows first
    // 2. Then followers
    // 3. Then following
    // 4. Then by activity (post count)
    filtered.sort((a, b) => {
      if (a.isMutual !== b.isMutual) return a.isMutual ? -1 : 1;
      if (a.isFollower !== b.isFollower) return a.isFollower ? -1 : 1;
      if (a.isFollowing !== b.isFollowing) return a.isFollowing ? -1 : 1;
      return b.postCount - a.postCount;
    });

    return filtered.slice(0, limit);
  },
});

// Get suggested users to message (users you already have conversations with)
export const getRecentConversationPartners = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await authComponent.safeGetAuthUser(ctx);
    if (!currentUser) return [];

    // Get all messages involving current user
    const sentMessages = await ctx.db
      .query("messages")
      .withIndex("by_sender_id", (q) => q.eq("senderId", currentUser._id))
      .collect();

    const receivedMessages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("receiverId"), currentUser._id))
      .collect();

    // Find unique conversation partners with last message time
    const partnerMap = new Map<string, number>();

    [...sentMessages, ...receivedMessages].forEach((msg) => {
      const partnerId =
        msg.senderId === currentUser._id ? msg.receiverId : msg.senderId;

      const existing = partnerMap.get(partnerId);
      if (!existing || msg._creationTime > existing) {
        partnerMap.set(partnerId, msg._creationTime);
      }
    });

    // Fetch user details and sort by recency
    const partners = await Promise.all(
      Array.from(partnerMap.entries()).map(
        async ([userId, lastMessageTime]) => {
          const user = await authComponent.getAnyUserById(ctx, userId);
          if (!user) return null;

          const unreadCount = await ctx.db
            .query("messages")
            .filter((q) =>
              q.and(
                q.eq(q.field("senderId"), userId),
                q.eq(q.field("receiverId"), currentUser._id),
                q.eq(q.field("isRead"), false),
              ),
            )
            .collect();

          return {
            _id: user._id,
            name: user.name || "",
            email: user.email || "",
            image: user.image,
            lastMessageTime,
            unreadCount: unreadCount.length,
          };
        },
      ),
    );

    return partners
      .filter((p) => p !== null)
      .sort((a, b) => b!.lastMessageTime - a!.lastMessageTime);
  },
});

// Quick search - only search among people you can already reach
export const quickSearchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.safeGetAuthUser(ctx);
    if (!currentUser) return [];

    if (args.query.length < 2) return [];

    const limit = args.limit ?? 10;
    const searchLower = args.query.toLowerCase();

    // Only search among followers and following for privacy
    const followers = await ctx.db
      .query("follow")
      .withIndex("by_following_id", (q) => q.eq("followingId", currentUser._id))
      .collect();

    const following = await ctx.db
      .query("follow")
      .withIndex("by_follower_id", (q) => q.eq("followerId", currentUser._id))
      .collect();

    const userIds = new Set<string>();
    followers.forEach((f) => userIds.add(f.followerId));
    following.forEach((f) => userIds.add(f.followingId));

    // Fetch and filter
    const users = await Promise.all(
      Array.from(userIds).map((id) => authComponent.getAnyUserById(ctx, id)),
    );

    return users
      .filter((user) => {
        if (!user) return false;
        const nameMatch = user.name?.toLowerCase().includes(searchLower);
        const emailMatch = user.email?.toLowerCase().includes(searchLower);
        return nameMatch || emailMatch;
      })
      .slice(0, limit)
      .map((user) => ({
        _id: user!._id,
        name: user!.name || "",
        email: user!.email || "",
        image: user!.image,
      }));
  },
});
