"use client";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button } from "../ui/button";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { redirect } from "next/navigation";

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

  const following = useQuery(
    api.follow.GetFollowing,
    user ? { userId: user._id } : "skip",
  );

  const follow = useMutation(api.follow.ToggleFollow);
  const handleFollow = async (id: any) => {
    try {
      await follow({ followingId: id });
      if (
        !followers?.some((follower) => follower.followerId === currentUser?._id)
      ) {
        await addNoti({
          type: "follow",
          userId: id,
          message: `${currentUser?.name} followed you`,
        });
      }
      toast.success(
        `${user?.name} ${
          followers?.some(
            (follower) => follower.followerId === currentUser?._id,
          )
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
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>{user?.name}</p>
      <p>{user?.email}</p>
      <p>Followers: {followers?.length}</p>
      <p>Following: {following?.length}</p>
      <Button onClick={() => handleFollow(user?._id)}>
        {followers?.some((follower) => follower.followerId === currentUser?._id)
          ? "Unfollow"
          : "Follow"}
      </Button>
    </div>
  );
};

export default UserProfile;
