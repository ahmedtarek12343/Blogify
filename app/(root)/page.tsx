"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import HomePostCard from "@/components/web/HomePostCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Clock } from "lucide-react";

export default function Page() {
  const mostLikedPosts = useQuery(api.posts.getMostLiked, { limit: 6 });
  const recentPosts = useQuery(api.posts.getRecentPosts, { limit: 6 });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

        <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <Sparkles className="mr-1 h-3 w-3" />
            <span>Welcome to Blogify</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl">
            Discover Stories That <span className="text-primary">Matter</span>
          </h1>

          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
            A community-driven platform for sharing ideas, stories, and
            knowledge. Join the conversation and start writing today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 min-w-[200px]">
            <Button size="lg" asChild className="gap-2">
              <Link href="/blog">
                Start Reading <ArrowRight className="w-4 h-4 animate-pulse" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Most Liked Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container flex flex-col px-4 md:px-6 mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Trending Now
              </h2>
            </div>
            <Button
              variant="ghost"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/blog">View all</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mostLikedPosts === undefined ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[350px] rounded-xl bg-muted animate-pulse"
                />
              ))
            ) : mostLikedPosts.length > 0 ? (
              mostLikedPosts.map((post) => (
                <HomePostCard key={post._id} post={post} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-10">
                No trending posts yet. Be the first to start a trend!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Latest Stories Section */}
      <section className="py-12 md:py-16">
        <div className="container flex flex-col justify-between px-4 md:px-6 mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Latest Stories
              </h2>
            </div>
            <Button
              variant="ghost"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/blog">View all</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts === undefined ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[350px] rounded-xl bg-muted animate-pulse"
                />
              ))
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <HomePostCard key={post._id} post={post} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-10">
                No posts yet. Why not create one?
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
