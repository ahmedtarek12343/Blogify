"use client";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button } from "../ui/button";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import HomePostCard from "./HomePostCard";
import {
  CalendarIcon,
  MailIcon,
  PenIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "lucide-react";

export interface userType {
  _id: string;
  name: string;
  email: string;
  image: string;
  displayUsername: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  updatedAt: string;
  userId: string;
  username: string;
  _creationTime: string;
}

const UserProfile = ({ id }: { id: string }) => {
  const user = useQuery(api.auth.getUserById, {
    id,
  });
  const addNoti = useMutation(api.notifications.AddNotifications);
  const currentUser = useQuery(api.auth.getCurrentUser);
  if (currentUser?._id === id) {
    return redirect("/profile");
  }
  const followers = useQuery(
    api.follow.GetFollowers,
    user ? { userId: user._id } : "skip",
  );
  console.log(followers);

  const following = useQuery(
    api.follow.GetFollowing,
    user ? { userId: user._id } : "skip",
  );

  const posts = useQuery(
    api.posts.getPostsByAuthor,
    user ? { authorId: user._id } : "skip",
  );

  const follow = useMutation(api.follow.ToggleFollow);
  const handleFollow = async (id: any) => {
    try {
      await follow({ followingId: id });
      if (!followers?.some((follower) => follower?._id === currentUser?._id)) {
        await addNoti({
          type: "follow",
          userId: id,
          message: `${currentUser?.name} followed you`,
        });
      }
      toast.success(
        `${user?.name} ${
          followers?.some((follower) => follower?._id === currentUser?._id)
            ? "unfollowed"
            : "followed"
        } successfully`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? error.data : "Failed to follow";
      toast.error(errorMessage);
    }
  };
  if (!user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <Card className="pt-0 overflow-hidden border-none shadow-md bg-card/60 backdrop-blur-sm">
        <div className="h-48 md:h-64 relative bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 w-full">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <CardContent className="relative pt-0 px-6 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 mb-6 gap-6">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl">
              <AvatarImage
                src={user.image || undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl font-bold bg-muted text-muted-foreground">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-2 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {user.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MailIcon className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {user._creationTime && (
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      Joined {new Date(user._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handleFollow(user._id)}
                variant={
                  followers?.some(
                    (follower) => follower?._id === currentUser?._id,
                  )
                    ? "secondary"
                    : "default"
                }
                className="gap-2 min-w-[120px]"
              >
                {followers?.some(
                  (follower) => follower?._id === currentUser?._id,
                ) ? (
                  <>
                    <UserMinusIcon className="w-4 h-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="w-4 h-4" />
                    Follow
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t pt-6 max-w-2xl px-4 md:px-0">
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold text-primary">
                {posts ? posts.length : 0}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Posts
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold text-primary">
                {followers ? followers.length : 0}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Followers
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold text-primary">
                {following ? following.length : 0}
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Following
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Recent Posts</h2>

        {posts === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="py-12 border-dashed flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <PenIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No posts yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              This user hasn't posted anything yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <HomePostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
    <div className="h-48 md:h-64 bg-muted rounded-xl w-full" />
    <div className="h-24 bg-muted/50 rounded-xl w-full max-w-lg mx-auto md:mx-0 md:w-1/2 -mt-12 relative z-10" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="h-[300px] bg-muted rounded-xl" />
      <div className="h-[300px] bg-muted rounded-xl" />
      <div className="h-[300px] bg-muted rounded-xl" />
    </div>
  </div>
);

export default UserProfile;
