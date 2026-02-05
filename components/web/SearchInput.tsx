import { Loader2, Search, FileQuestion } from "lucide-react";
import { Input } from "../ui/input";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

const SearchInput = () => {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTerm(e.target.value);
    setOpen(true);
  }

  const results = useQuery(
    api.posts.searchPosts,
    term.length >= 2
      ? {
          term,
          limit: 10,
        }
      : "skip",
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          className="pl-9 h-10 w-full transition-colors focus-visible:ring-1"
          type="search"
          value={term}
          onChange={handleInputChange}
          onFocus={() => {
            if (term.length >= 2) setOpen(true);
          }}
        />
      </div>
      {open && term.length >= 2 && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          {results === undefined ? (
            <div className="flex h-16 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="flex h-20 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <FileQuestion className="size-5 opacity-50" />
              <p>No results found</p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto p-1.5 scrollbar-thin">
              {results.map((result) => (
                <Link
                  key={result.post._id}
                  onClick={() => {
                    setOpen(false);
                    setTerm("");
                  }}
                  href={`/blog/${result.post._id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {result.imageURL ? (
                    <img
                      src={result.imageURL}
                      alt={result.post.title}
                      className="size-8 rounded-md object-cover border"
                    />
                  ) : (
                    <div className="flex size-8 items-center justify-center rounded-md border bg-muted">
                      <Search className="size-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium leading-none">
                      {result.post.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
