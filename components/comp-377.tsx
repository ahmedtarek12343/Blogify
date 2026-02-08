import {
  BoltIcon,
  BookOpenIcon,
  ChevronDownIcon,
  Edit2Icon,
  HomeIcon,
  Layers2Icon,
  ListIcon,
  Loader2Icon,
  LogOutIcon,
  PinIcon,
  UserPenIcon,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SignedInMenu() {
  const user = useQuery(api.auth.getCurrentUser);
  if (user === undefined) {
    return <Loader2Icon className="animate-spin" />;
  }
  if (user === null) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-auto p-0 hover:bg-transparent" variant="ghost">
          <Avatar>
            {user.image && <AvatarImage alt="Profile image" src={user.image} />}
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <ChevronDownIcon
            aria-hidden="true"
            className="opacity-60"
            size={16}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-70">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-foreground text-sm">
            {user.name}
          </span>
          <span className="truncate font-normal text-muted-foreground text-xs">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/">
              <HomeIcon aria-hidden="true" className="opacity-60" size={16} />
              <span>Home</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/blog">
              <ListIcon aria-hidden="true" className="opacity-60" size={16} />
              <span>Blogs</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/create">
              <Edit2Icon aria-hidden="true" className="opacity-60" size={16} />
              <span>Create</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <PinIcon aria-hidden="true" className="opacity-60" size={16} />
            <span>Bookmarks</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserPenIcon
                aria-hidden="true"
                className="opacity-60"
                size={16}
              />
              <span>Account</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            className="w-full"
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    toast.success("Logged out");
                  },
                  onError: () => {
                    toast.error("Failed to log out");
                  },
                },
              })
            }
          >
            <LogOutIcon aria-hidden="true" className="opacity-60" size={16} />
            <span>Logout</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
