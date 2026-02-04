"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Trash2Icon } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { useState } from "react";
import LazyImage from "./LazyImage";

const TaskView = () => {
  const user = useQuery(api.auth.getCurrentUser);
  const posts = useQuery(api.posts.getPosts);
  const deletePost = useMutation(api.posts.deletePost);
  const [filterPosts, setFilterPosts] = useState(false);

  if (posts === undefined) {
    return <BlogSkeleton />;
  }

  if (user === null) {
    return (
      <div className="flex justify-center flex-col items-center min-h-[200px]">
        <p className="text-gray-500">Not authenticated</p>
        <Link
          className={buttonVariants({ className: "mt-2" })}
          href="/auth/login"
        >
          Login
        </Link>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">No posts found</p>
      </div>
    );
  }

  const filteredPosts = filterPosts
    ? posts?.filter((post) => post.authorId === user?._id)
    : posts;

  async function handleDeletePost(id: Id<"posts">) {
    try {
      await deletePost({ id });
      toast.success("Post deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? error.data : "Failed to delete post";
      toast.error(errorMessage);
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => setFilterPosts(!filterPosts)}
          variant={filterPosts ? "default" : "outline"}
        >
          {filterPosts ? "Show All" : "Show My Posts"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPosts.length === 0 ? (
            <div className="flex justify-center col-span-full items-center min-h-[200px]">
              <p className="text-gray-500">No posts found</p>
            </div>
          ) : (
            filteredPosts?.map((post) => (
              <motion.div
                key={post._id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group pt-0 h-full hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
                  <div className="relative h-48">
                    <LazyImage
                      src={post.imageUrl ?? "/download.png"}
                      alt={post.title}
                    />
                    {post.authorId === user?._id && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post._id);
                        }}
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="line-clamp-1 text-lg font-bold text-foreground">
                        {post.title}
                      </CardTitle>
                    </div>
                    {post._creationTime && (
                      <CardDescription className="text-xs">
                        {new Date(post._creationTime).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.body.length > 100
                        ? post.body.slice(0, 50) + "..."
                        : post.body}
                    </p>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between text-xs text-muted-foreground border-t">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-medium text-foreground">
                        By:{" "}
                        {post.author?.name ||
                          post.author?.email ||
                          "Unknown Author"}
                      </span>
                      <Link
                        href={`/blog/${post._id}`}
                        className={buttonVariants({
                          size: "lg",
                        })}
                      >
                        Read More
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskView;

const BlogSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[350px] w-full rounded-xl" />
      ))}
    </div>
  );
};
