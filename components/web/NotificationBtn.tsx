"use client";
import { BellIcon, Loader2Icon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { notificationType } from "@/types/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Separator } from "../ui/separator";
import Link from "next/link";

export default function SignedInMenu() {
  const notifications = useQuery(api.notifications.GetNotifications);
  const markAllAsRead = useMutation(api.notifications.MarkNotificationsAsRead);
  if (notifications === undefined) {
    return <Loader2Icon className="animate-spin" />;
  }
  if (notifications === null) {
    return null;
  }

  const unReadNotifications = notifications.filter(
    (notification) => !notification.isRead,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          onPointerDown={() => {
            if (unReadNotifications.length > 0) {
              markAllAsRead();
            }
          }}
          className="h-auto p-0 hover:bg-transparent"
          variant="ghost"
        >
          <Avatar className="relative flex items-center justify-center overflow-visible">
            <BellIcon />
            {unReadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 rounded-full">
                {unReadNotifications.length}
              </span>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-70">
        {notifications.length === 0 ? (
          <DropdownMenuItem>
            <BellIcon aria-hidden="true" className="opacity-60" size={16} />
            <span>No notifications</span>
          </DropdownMenuItem>
        ) : (
          notifications.slice(0, 3).map((notification) => {
            const { icons: Icon, color } = notificationType[notification.type];
            return (
              <div key={notification._id}>
                <DropdownMenuItem className="p-3 overflow-y-auto max-h-50">
                  <Icon className="w-4 h-4" />
                  <span className="ml-2">
                    {notification.message.split(":")[0]}
                  </span>
                </DropdownMenuItem>
              </div>
            );
          })
        )}
        {notifications.length >= 4 && (
          <Link
            href="/notifications"
            className="text-center text-sm bg-primary transition hover:bg-primary/80 py-2 block"
          >
            View All
          </Link>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
