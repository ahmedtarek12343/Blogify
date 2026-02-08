import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const ToggleFollow = mutation({
  args: {
    followingId: v.id("user"),
  },
  handler: async (ctx, { followingId }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("User not authenticated");
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
