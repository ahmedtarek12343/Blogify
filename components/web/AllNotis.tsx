"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { notificationType } from "@/types/data";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const AllNotis = () => {
  const notifications = useQuery(api.notifications.GetNotifications);
  const user = useQuery(api.auth.getCurrentUser);
  const markAsRead = useMutation(api.notifications.MarkNotificationsAsRead);
  const router = useRouter();

  if (notifications === undefined || user === undefined) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  if (notifications === null || user === null) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Please sign in to view notifications.
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={() => markAsRead()}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <Check className="w-3 h-3" /> Mark all as read
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {notifications.map((notification) => {
          const { icons: Icon, color } = notificationType[
            notification.type
          ] || { icons: Check, color: "text-gray-500" };

          // Determine link target
          let linkTarget = "#";
          if (notification.type === "follow") {
            linkTarget = `/profile/${notification.triggeredBy}`;
          } else if (notification.postId) {
            linkTarget = `/blog/${notification.postId}`;
          }

          return (
            <div
              key={notification._id}
              onClick={() => {
                if (linkTarget !== "#") router.push(linkTarget);
              }}
              className={cn(
                "relative group cursor-pointer transition-all duration-200",
                "hover:bg-muted/50 rounded-xl overflow-hidden border",
                notification.isRead
                  ? "bg-card border-border/40"
                  : "bg-card border-primary/20 shadow-sm",
              )}
            >
              {!notification.isRead && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}

              <div className="flex gap-4 p-4">
                {/* Icon / Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={notification.senderImage} />
                    <AvatarFallback>
                      {notification.senderName?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 p-1 rounded-full bg-background border shadow-sm",
                      color,
                    )}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-sm">
                      {notification.senderName}
                      <span className="font-normal text-muted-foreground ml-1">
                        {notification.type === "like" && "liked your content"}
                        {notification.type === "comment" && "replied to you"}
                        {notification.type === "follow" && "followed you"}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(notification._creationTime).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>

                  <p className="text-sm text-foreground/80 line-clamp-2">
                    {notification.message.split(" : ")[1] ||
                      notification.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllNotis;
