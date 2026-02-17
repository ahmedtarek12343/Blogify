"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { formatRelativeTime } from "@/lib/utils";
import Image from "next/image";
import {
  User,
  Reply,
  ChevronDown,
  ChevronUp,
  Trash2Icon,
  Edit2Icon,
  Heart,
} from "lucide-react";

import { Button } from "../ui/button";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentsSchema } from "@/schemas/comment";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { Input } from "../ui/input";
import DeleteModal from "../comp-313";
import EditModal from "./EditModal";
import ShowLikesModal from "./ShowLikesModal";
import { AnimatePresence, motion } from "framer-motion";
import EllipsisMenu from "../comp-366";
import Link from "next/link";

interface CommentProps {
  comment: Doc<"comments">;
  depth?: number;
  users: any;
}

const Comment = ({ comment, depth = 0, users }: CommentProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLikedUsers, setShowLikedUsers] = useState(false);
  const user = useQuery(api.auth.getCurrentUser);
  const replies = useQuery(api.comments.getReplyComments, {
    parentCommentId: comment._id,
  });

  const AddNotification = useMutation(api.notifications.AddNotifications);

  const AddComment = useMutation(api.comments.AddComment);

  const { control, reset, handleSubmit } = useForm({
    resolver: zodResolver(commentsSchema),
    defaultValues: {
      body: "",
    },
  });

  const toggleLike = useMutation(api.comments.ToggleLike).withOptimisticUpdate(
    (localStore, { commentId }) => {
      const userId = user?._id;
      if (!userId) return;

      const likes = localStore.getQuery(api.comments.getLikesByCommentId, {
        commentId,
      });

      if (!likes) return;

      const alreadyLiked = likes.users.some((u) => u?._id === userId);

      if (alreadyLiked) {
        // remove like
        localStore.setQuery(
          api.comments.getLikesByCommentId,
          { commentId },
          {
            likes: likes.likes.filter((l) => l.authorId !== userId),
            users: likes.users.filter((u) => u?._id !== userId),
          },
        );
      } else {
        // add like
        localStore.setQuery(
          api.comments.getLikesByCommentId,
          { commentId },
          {
            likes: [...likes.likes, {} as any],
            users: [...likes.users, { _id: userId } as any],
          },
        );
      }
    },
  );
  const getLikesByCommentId = useQuery(api.comments.getLikesByCommentId, {
    commentId: comment._id,
  });

  const likeExists = getLikesByCommentId?.users.some(
    (like) => like?._id === user?._id,
  );
  async function onSubmit(data: { body: string }) {
    try {
      await AddComment({
        body: data.body,
        postId: comment.postId,
        parentCommentId: comment._id,
      });
      toast.success("Reply added successfully");
      reset();
      setShowReplyForm(false);
      setShowReplies(true);
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to add reply");
      }
    }
  }

  const hasReplies = replies && replies.length > 0;
  const maxDepth = 5;
  const canReply = depth < maxDepth;

  return (
    <div className="flex flex-col gap-2">
      {/* Main Comment */}
      <div
        className="flex gap-2 md:gap-3 group"
        style={{ marginLeft: `${depth * 20}px` } as any}
      >
        <div className="shrink-0">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            {users?.find((u: any) => u._id === comment.authorId)?.image ? (
              <Image
                src={users?.find((u: any) => u._id === comment.authorId)?.image}
                alt="User"
                width={32}
                height={32}
                className="rounded-full w-full h-full object-cover"
              />
            ) : (
              <User className="w-3 h-3 md:w-4 md:h-4" />
            )}
          </div>
        </div>

        <div className="flex flex-col w-full bg-muted/40 p-2 md:p-3 rounded-lg rounded-tl-none border border-border/50 hover:bg-muted/60 transition-colors">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                <Link
                  href={`/profile/${comment.authorId}`}
                  className="font-semibold text-sm truncate max-w-[150px] md:max-w-none"
                >
                  {comment.authorName}
                </Link>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(comment._creationTime)}
                </span>

                {comment.isEdited && (
                  <span className="text-xs text-muted-foreground">
                    (Edited)
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                {comment.body}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2">
                {canReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="h-6 px-2 text-xs md:h-7"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}

                {hasReplies && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplies(!showReplies)}
                    className="h-6 px-2 text-xs md:h-7"
                  >
                    {showReplies ? (
                      <ChevronUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    )}
                    {replies.length}{" "}
                    <span className="hidden sm:inline">
                      {replies.length === 1 ? "reply" : "replies"}
                    </span>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5 md:gap-1 shrink-0 -mt-1 md:mt-0">
              {/* Desktop Actions */}
              {user?._id === comment.authorId && (
                <div className="hidden md:flex items-center">
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setShowEditModal(true)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Edit2Icon className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center">
                <motion.div
                  whileTap={{ scale: 1.3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    onClick={() => {
                      try {
                        toggleLike({ commentId: comment._id });
                        if (!likeExists) {
                          AddNotification({
                            type: "like",
                            userId: comment.authorId,
                            message: `${user?.name} liked your comment : ${comment.body}`,
                            postId: comment.postId,
                            commentId: comment._id,
                          });
                        }
                      } catch (error) {
                        toast.error(
                          error instanceof ConvexError
                            ? error.message
                            : "Failed to like comment",
                        );
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 md:w-auto md:px-3"
                  >
                    {likeExists ? (
                      <Heart className="w-4 h-4 fill-red-500 stroke-red-500" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </Button>
                </motion.div>
                {getLikesByCommentId &&
                  getLikesByCommentId?.likes.length > 0 && (
                    <Button
                      variant={"link"}
                      onClick={() => setShowLikedUsers(true)}
                      className="text-foreground h-8 px-1 min-w-6"
                    >
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={getLikesByCommentId?.likes.length}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          layout
                          transition={{ duration: 0.2 }}
                          className="text-xs"
                        >
                          {getLikesByCommentId?.likes.length || ""}
                        </motion.p>
                      </AnimatePresence>
                    </Button>
                  )}
              </div>
              {/* Mobile Menu (Always shown but with different items based on auth) */}
              <div className="md:hidden">
                <EllipsisMenu
                  isAuthor={user?._id === comment.authorId}
                  onEdit={() => setShowEditModal(true)}
                  onDelete={() => setShowDeleteModal(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div
          style={{ marginLeft: `${(depth + 1) * 20}px` }}
          className="pl-2 md:pl-0"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2 p-3 bg-muted/20 rounded-lg border border-border/30"
          >
            <Controller
              name="body"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    {...field}
                    placeholder="Write a reply..."
                    className="text-sm h-9"
                    autoFocus
                  />
                  {fieldState.error && (
                    <p className="text-red-500 text-xs">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowReplyForm(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await AddNotification({
                      userId: comment.authorId,
                      message: `${user?.name} replied to your comment : ${comment.body}`,
                      type: "comment",
                      postId: comment.postId,
                      commentId: comment._id,
                    });
                  } catch (error) {
                    toast.error(
                      error instanceof ConvexError
                        ? error.message
                        : "Failed to add notification",
                    );
                  }
                }}
                type="submit"
                size="sm"
              >
                Reply
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Replies - Collapsed by default */}
      {showReplies && hasReplies && (
        <div className="flex flex-col gap-2">
          {replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              users={users}
            />
          ))}
        </div>
      )}
      <DeleteModal
        comment={comment}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
      <EditModal
        comment={comment}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
      <ShowLikesModal
        users={getLikesByCommentId?.users as any}
        open={showLikedUsers}
        onOpenChange={setShowLikedUsers}
      />
    </div>
  );
};

export default Comment;
