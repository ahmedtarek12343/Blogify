import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    body: v.string(),
    authorId: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  })
    .searchIndex("by_search_title", {
      searchField: "title",
    })
    .searchIndex("by_search_body", {
      searchField: "body",
    }),
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.string(),
    authorName: v.string(),
    parentCommentId: v.optional(v.id("comments")),
    body: v.string(),
    isEdited: v.optional(v.boolean()),
  })
    .index("by_post_id", {
      fields: ["postId"],
    })
    .index("by_parent_comment_id", {
      fields: ["parentCommentId"],
    }),
  likedcomments: defineTable({
    authorId: v.string(),
    commentId: v.id("comments"),
  })
    .index("by_author_id", {
      fields: ["authorId"],
    })
    .index("by_comment_id", {
      fields: ["commentId"],
    })
    .index("by_author_and_comment", {
      fields: ["authorId", "commentId"],
    }),
  likedposts: defineTable({
    authorId: v.string(),
    postId: v.id("posts"),
  })
    .index("by_author_id", {
      fields: ["authorId"],
    })
    .index("by_post_id", {
      fields: ["postId"],
    }),
  follow: defineTable({
    followerId: v.string(),
    followingId: v.string(),
  })
    .index("by_follower_id", {
      fields: ["followerId"],
    })
    .index("by_following_id", {
      fields: ["followingId"],
    })
    .index("by_follower_and_following", {
      fields: ["followerId", "followingId"],
    }),
  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    triggeredBy: v.string(),
  }).index("by_user_id", {
    fields: ["userId"],
  }),
});
