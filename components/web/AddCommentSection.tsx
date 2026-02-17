"use client";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentsSchema } from "@/schemas/comment";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import CommentsView from "./CommentsView";

const CommentSection = ({ postId }: { postId: Id<"posts"> }) => {
  const { control, reset, handleSubmit } = useForm({
    resolver: zodResolver(commentsSchema),
    defaultValues: {
      body: "",
    },
  });
  const AddComment = useMutation(api.comments.AddComment);
  const comments = useQuery(api.comments.getCommentsByPostId, { postId });
  const onSubmit = async (data: { body: string }) => {
    try {
      await AddComment({
        body: data.body,
        postId: postId as Id<"posts">,
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
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <MessageSquare />
        <p className="text-xl font-bold">
          {comments?.comments.length} Comments
        </p>
      </CardHeader>
      <CardContent className="md:px-6 px-1">
        <CommentsView comments={comments?.comments} users={comments?.users} />
        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        >
          <div className="flex flex-col gap-2">
            <Controller
              name="body"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    placeholder="Add a comment..."
                    {...field}
                    className="mt-5"
                  />
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
      </CardContent>
    </Card>
  );
};

export default CommentSection;
