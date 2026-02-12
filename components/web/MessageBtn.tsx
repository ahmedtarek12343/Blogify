import { buttonVariants } from "../ui/button";
import { MessageSquareIcon } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const MessageBtn = () => {
  const user = useQuery(api.auth.getCurrentUser);
  const unreadMessages = useQuery(
    api.message.getUnreadMessages,
    user
      ? {
          userId: user._id,
        }
      : "skip",
  );
  const isUnread = unreadMessages?.some(
    (unreadMessage) => unreadMessage.receiverId === user?._id,
  );
  return (
    <div>
      <Link
        href="/messages"
        className={buttonVariants({ variant: "ghost" }) + " relative"}
      >
        <MessageSquareIcon className="h-5 w-5" />
        {isUnread && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full"></span>
        )}
      </Link>
    </div>
  );
};

export default MessageBtn;
