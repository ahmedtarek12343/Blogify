"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "../ui/card";
import LazyImage from "./LazyImage";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Heart } from "lucide-react";
import { Badge } from "../ui/badge";

interface HomePostCardProps {
  post: Doc<"posts"> & {
    author: any; // Using any for simplicity as authComponent return type is complex, but effectively User
    imageUrl: string | null;
    likesCount: number;
  };
}

export default function HomePostCard({ post }: HomePostCardProps) {
  return (
    <Link href={`/blog/${post._id}`}>
      <Card className="h-full pt-0 overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="relative aspect-video w-full overflow-hidden">
          <LazyImage src={post.imageUrl ?? "/download.png"} alt={post.title} />
          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            {post.likesCount}
          </div>
        </div>
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="font-normal">
              Article
            </Badge>
            <span>•</span>
            <span>{new Date(post._creationTime).toLocaleDateString()}</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {post.body}
          </p>

          <div className="flex items-center gap-2 mt-auto pt-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={post.author?.image} />
              <AvatarFallback>
                {post.author?.name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-muted-foreground">
              {post.author?.name || "Unknown"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
