"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import LazyImage from "./LazyImage";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import CommentSection from "./AddCommentSection";
import { PostPresence } from "./PostPresence";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

const PostView = ({ postId }: { postId: Id<"posts"> }) => {
  const post = useQuery(api.posts.getPostById, { id: postId });
  const userId = useQuery(api.presence.getUserId);
  const likePost = useMutation(api.posts.toggleLikePost);
  const isLiked = useQuery(api.posts.isLikedPost, userId ? { postId } : "skip");
  if (post === undefined) {
    return <PostSkeleton />;
  }

  return (
    <div>
      <div className="relative h-[600px] aspect-video max-w-4xl mx-auto">
        <LazyImage src={post.imageUrl ?? "/download.png"} alt={post.title} />
      </div>
      <div className="w-full flex items-end mt-5 flex-col">
        <Button
          onClick={async () => {
            try {
              await likePost({
                postId,
              });
              toast.success(
                isLiked
                  ? "Post unliked successfully"
                  : "Post liked successfully",
              );
            } catch (error) {
              toast.error(
                error instanceof ConvexError
                  ? error.data
                  : "Something went wrong",
              );
            }
          }}
        >
          {isLiked ? "Unlike" : "Like"}
        </Button>
        <p className="text-muted-foreground text-sm">
          Posted by:{" "}
          {post.author?.name || post.author?.email || "Unknown Author"}
        </p>
        <p className="text-muted-foreground text-sm">
          Posted on: {new Date(post._creationTime).toLocaleDateString()}
        </p>{" "}
        {userId && <PostPresence roomId={post._id} userId={userId} />}
      </div>
      <Separator className="my-8" />
      <div className="w-full flex items-start flex-col">
        <h1 className="text-6xl font-bold">{post.title}</h1>
        <p className="text-muted-foreground leading-relaxed text-xl mt-2">
          {post.body}
        </p>
      </div>
      <Separator className="my-8" />
      <CommentSection postId={postId} />
    </div>
  );
};

export default PostView;

function PostSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="w-full h-150 max-w-4xl mx-auto" />
      <div className="w-full flex gap-2 items-end  flex-col">
        <Skeleton className="w-45 h-5" />
        <Skeleton className="w-30 h-5" />
      </div>
      <div className="w-full flex gap-2 items-start  flex-col">
        <Skeleton className="w-90 h-10" />
        <Skeleton className="w-25 h-10" />
      </div>
    </div>
  );
}
