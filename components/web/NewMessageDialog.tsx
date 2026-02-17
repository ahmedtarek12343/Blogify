// components/web/NewMessageDialog.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "use-debounce";
import { Loader2, Search, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NewMessageDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const router = useRouter();

  // Get discovered users (followers, following, active users)
  const discoveredUsers = useQuery(api.user.discoverUsers, {
    query: debouncedSearch,
    limit: 20,
  });

  // Quick search among your network
  const searchResults = useQuery(
    api.user.quickSearchUsers,
    debouncedSearch.length >= 2
      ? { query: debouncedSearch, limit: 10 }
      : "skip",
  );

  const handleSelectUser = (userId: string) => {
    router.push(`/messages/${userId}`);
    onOpenChange(false);
    setSearch("");
  };

  const isSearching = debouncedSearch.length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Results */}
          <ScrollArea className="h-[400px]">
            {isSearching ? (
              // Search Results
              <div className="space-y-2">
                {searchResults === undefined ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No users found
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try searching for someone in your network
                    </p>
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <UserItem
                      key={user._id}
                      user={user}
                      onClick={() => handleSelectUser(user._id)}
                    />
                  ))
                )}
              </div>
            ) : (
              // Suggested Users
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Suggested
                  </p>
                </div>
                {discoveredUsers === undefined ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : discoveredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No users to show yet
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Follow people to expand your network
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {discoveredUsers.map((user) => (
                      <UserItem
                        key={user._id}
                        user={user}
                        onClick={() => handleSelectUser(user._id)}
                        showBadges
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// User Item Component
function UserItem({
  user,
  onClick,
  showBadges = false,
}: {
  user: any;
  onClick: () => void;
  showBadges?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.image} />
        <AvatarFallback>
          {user.name?.charAt(0).toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{user.name || "Unknown"}</p>
          {showBadges && (
            <>
              {user.isMutual && (
                <Badge variant="secondary" className="text-xs">
                  Mutual
                </Badge>
              )}
              {!user.isMutual && user.isFollower && (
                <Badge variant="outline" className="text-xs">
                  Follows you
                </Badge>
              )}
            </>
          )}
        </div>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
      </div>
    </button>
  );
}
