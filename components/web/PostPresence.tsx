"use client";
import usePresence from "@convex-dev/presence/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FacePile from "@convex-dev/presence/facepile";

interface iAppProps {
  roomId: Id<"posts">;
  userId: string;
}

export const PostPresence = ({ roomId, userId }: iAppProps) => {
  const presenceState = usePresence(api.presence, roomId, userId);
  if (!presenceState || presenceState.length === 0) return null;

  return (
    <div className="flex flex-col justify-center gap-2">
      <div className="dark:text-black">
        <FacePile presenceState={presenceState} />
      </div>
      <p className="text-sm uppercase tracking-wide text-muted-foreground">
        {presenceState.filter((row) => row.online).length} users are currently
        viewing this post
      </p>
    </div>
  );
};
