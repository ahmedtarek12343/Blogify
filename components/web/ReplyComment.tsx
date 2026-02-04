"use client";
import { Controller } from "react-hook-form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentsSchema } from "@/schemas/comment";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { useQuery } from "convex/react";
import { formatRelativeTime } from "@/lib/utils";
import { User, MessageSquare } from "lucide-react";

const ReplyComment = ({
  comment,
  replyComments,
}: {
  comment: Doc<"comments">;
  replyComments: Doc<"comments">[] | undefined;
}) => {
  const { control, reset, handleSubmit } = useForm({
    resolver: zodResolver(commentsSchema),
    defaultValues: {
      body: "",
    },
  });

  const AddComment = useMutation(api.comments.AddComment);
  async function onSubmit(data: { body: string }) {
    try {
      await AddComment({
        body: data.body,
        postId: comment.postId,
        parentCommentId: comment._id,
      });
      toast.success("Comment added successfully");
      reset();
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to add comment");
      }
    }
  }
  if (replyComments === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-muted-foreground animate-pulse">
        <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
        <p>Loading comments...</p>
      </div>
    );
  }
  return (
    <>
      {replyComments?.map((replyComment) => (
        <div key={replyComment._id} className="ml-5">
          <div className="flex gap-3 group">
            <div className="shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="flex flex-col w-full bg-muted/40 p-3 rounded-lg rounded-tl-none border border-border/50 hover:bg-muted/60 transition-colors">
              <div className="flex justify-between">
                <div className="">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {replyComment.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(replyComment._creationTime)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {replyComment.body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(onSubmit)();
          }
        }}
        className="w-[93%] ml-auto mr-5"
      >
        <div className="flex flex-col gap-2">
          <Controller
            name="body"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input {...field} />
                {fieldState.error && (
                  <p className="text-red-500 text-sm">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />{" "}
        </div>
      </form>
    </>
  );
};

export default ReplyComment;
