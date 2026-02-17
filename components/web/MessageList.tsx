// components/web/MessageList.tsx
"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2, MessageSquare } from "lucide-react";
import { NewMessageDialog } from "./NewMessageDialog";

const MessageList = () => {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const user = useQuery(api.auth.getCurrentUser);
  const pathname = usePathname();

  const conversationPartners = useQuery(
    api.user.getRecentConversationPartners,
    user ? {} : "skip",
  );

  if (user === null) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
        <div>
          <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">Sign in to see messages</p>
        </div>
      </div>
    );
  }

  if (conversationPartners === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-row items-center md:items-start md:flex-col">
      <div className="mb-3 p-2 border-b">
        <Button
          onClick={() => setShowNewMessage(true)}
          className="w-full"
          size="sm"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          <span className="hidden md:block">New Message</span>
        </Button>
      </div>

      <div className="flex-1 md:overflow-y-auto overflow-x-auto">
        {conversationPartners.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start a new conversation
            </p>
          </div>
        ) : (
          <div className="space-y-1 flex flex-row md:flex-col p-2">
            {conversationPartners.map((partner) => {
              const isActive = pathname === `/messages/${partner._id}`;
              const hasUnread = partner.unreadCount > 0;

              return (
                <Link
                  key={partner._id}
                  href={`/messages/${partner._id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg p-3 transition-colors",
                    "hover:bg-secondary-foreground/5",
                    isActive &&
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  <div className="relative shrink-0">
                    <Image
                      src={partner.image ?? "/download.png"}
                      alt={partner.name}
                      width={25}
                      height={25}
                      className="rounded-full object-cover aspect-square"
                    />
                    {hasUnread && (
                      <div className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                        {partner.unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 hidden md:block">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-sm",
                          hasUnread && !isActive && "font-semibold",
                        )}
                      >
                        {partner.name || partner.email}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <NewMessageDialog
        open={showNewMessage}
        onOpenChange={setShowNewMessage}
      />
    </div>
  );
};

export default MessageList;
