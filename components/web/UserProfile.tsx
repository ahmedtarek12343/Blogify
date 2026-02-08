"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

const UserProfile = ({ id }: { id: string }) => {
  const user = useQuery(api.auth.getUserById, {
    id,
  });
  return (
    <div>
      <p>{user?.name}</p>
      <p>{user?.email}</p>
    </div>
  );
};

export default UserProfile;
