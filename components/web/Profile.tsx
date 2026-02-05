"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

const Profile = () => {
  const user = useQuery(api.auth.getCurrentUser);
  if (user === undefined) {
    return <p>Loading...</p>;
  }
  if (user === null) {
    return <p>No user found</p>;
  }
  return (
    <div>
      <div className="flex justify-center">
        <Image
          src={user.image || "/download.png"}
          alt="Profile image"
          width={100}
          height={100}
          className="rounded-full "
        />
      </div>
      <p> {user.name}</p>
      <p> {user.email}</p>
    </div>
  );
};

export default Profile;
