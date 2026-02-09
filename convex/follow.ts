import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

export const ToggleFollow = mutation({
  args: {
    followingId: v.string(),
  },
  handler: async (ctx, { followingId }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("User not authenticated");
    }
    if (user._id === followingId) {
      throw new ConvexError("You cannot follow yourself");
    }
    const follow = await ctx.db
      .query("follow")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", user._id).eq("followingId", followingId),
      )
      .unique();
    if (follow) {
      ctx.db.delete("follow", follow._id);
    } else {
      ctx.db.insert("follow", {
        followerId: user._id,
        followingId,
      });
    }
  },
});

export const GetFollowers = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const followers = await ctx.db
      .query("follow")
      .withIndex("by_following_id", (q) => q.eq("followingId", userId))
      .collect();
    return followers;
  },
});

export const GetFollowing = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const following = await ctx.db
      .query("follow")
      .withIndex("by_follower_id", (q) => q.eq("followerId", userId))
      .collect();
    return following;
  },
});
