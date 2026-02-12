"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import Image from "next/image";

const MessageList = () => {
  const user = useQuery(api.auth.getCurrentUser);
  const pathname = usePathname();
  const unreadMessages = useQuery(
    api.message.getUnreadMessages,
    user
      ? {
          userId: user._id,
        }
      : "skip",
  );
  console.log(unreadMessages);

  const follower = useQuery(
    api.follow.GetFollowers,
    user
      ? {
          userId: user._id,
        }
      : "skip",
  );

  if (user === null) {
    return <div className="flex h-full">Sign in to see messages</div>;
  }

  if (follower === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {follower?.map((follower) => {
        const isUnread = unreadMessages?.some(
          (unreadMessage) => unreadMessage.senderId === follower?._id,
        );
        return (
          <Fragment key={follower?._id}>
            <Link
              className={
                pathname === `/messages/${follower?._id}`
                  ? "flex mb-2 items-center gap-2 p-2 mr-3 rounded hover:bg-primary/90 transition  bg-primary"
                  : "flex mb-2 items-center gap-2 p-2 mr-3 rounded hover:bg-background/20 transition "
              }
              href={`/messages/${follower?._id}`}
            >
              <Image
                src={follower?.image ?? "/download.png"}
                alt={follower?.name ?? ""}
                width={32}
                height={32}
                className="rounded-full aspect-square object-cover"
              ></Image>
              <p className="font-semibold">{follower?.name}</p>
              {isUnread && (
                <span className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              )}
            </Link>
          </Fragment>
        );
      })}
    </div>
  );
};

export default MessageList;
