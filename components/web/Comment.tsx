"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { formatRelativeTime } from "@/lib/utils";
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

interface CommentProps {
  comment: Doc<"comments">;
  depth?: number;
}

const Comment = ({ comment, depth = 0 }: CommentProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const user = useQuery(api.auth.getCurrentUser);
  const replies = useQuery(api.comments.getReplyComments, {
    parentCommentId: comment._id,
  });

  const AddComment = useMutation(api.comments.AddComment);

  const { control, reset, handleSubmit } = useForm({
    resolver: zodResolver(commentsSchema),
    defaultValues: {
      body: "",
    },
  });

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
        className="flex gap-3 group"
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <User className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col w-full bg-muted/40 p-3 rounded-lg rounded-tl-none border border-border/50 hover:bg-muted/60 transition-colors">
          <div className="flex justify-between items-center">
            <div className="">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {comment.authorName}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(comment._creationTime)}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {comment.body}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-2">
                {canReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="h-7 text-xs"
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
                    className="h-7 text-xs"
                  >
                    {showReplies ? (
                      <ChevronUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    )}
                    {replies.length}{" "}
                    {replies.length === 1 ? "reply" : "replies"}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {user?._id === comment.authorId && (
                <div className="flex items-center">
                  <div className="">
                    <Button variant="ghost" size="sm">
                      <Trash2Icon />
                    </Button>
                  </div>
                  <div className="">
                    <Button variant="ghost" size="sm">
                      <Edit2Icon />
                    </Button>
                  </div>
                </div>
              )}
              <div className="">
                <Button variant="ghost" size="sm">
                  <Heart />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div style={{ marginLeft: `${(depth + 1) * 40}px` }}>
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
                    className="text-sm"
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
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Post Reply
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReplyForm(false);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Replies - Collapsed by default */}
      {showReplies && hasReplies && (
        <div className="flex flex-col gap-2">
          {replies.map((reply) => (
            <Comment key={reply._id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
