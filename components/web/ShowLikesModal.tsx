import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type User = {
  _id: string;
  name: string;
  image: string;
};

export default function ShowLikesModal({
  users,
  open,
  onOpenChange,
}: {
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <X
          onClick={() => onOpenChange(false)}
          className="cursor-pointer absolute top-4 right-4 z-10"
        />
        <AlertDialogHeader>
          <AlertDialogTitle>{users?.length ?? "?"} Likes</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {users && users.length > 0 ? (
            users.map((user) => (
              <Link
                href={`/profile/${user._id}`}
                key={user._id}
                className="flex items-center gap-2 w-full hover:bg-muted p-2 rounded-md transition"
              >
                <Avatar>
                  <AvatarImage src={user?.image || ""} />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p>{user?.name}</p>
              </Link>
            ))
          ) : (
            <p>No likes</p>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
