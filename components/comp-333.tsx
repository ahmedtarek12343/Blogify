"use client";

import { Loader2Icon, SearchIcon } from "lucide-react";
import * as React from "react";
import Image from "next/image";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDebounce } from "use-debounce";

export default function BlogSearch() {
  const [open, setOpen] = React.useState(false);
  const [term, setTerm] = useState("");
  const [debouncedValue] = useDebounce(term, 600);
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

  const results = useQuery(
    api.posts.searchPosts,
    debouncedValue.length >= 2
      ? {
          term: debouncedValue,
          limit: 10,
        }
      : "skip",
  );
  console.log(term, results);
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        className="inline-flex h-9 md:w-fit rounded-md border border-input bg-background px-3 py-2 text-foreground text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="flex grow items-center">
          <SearchIcon
            aria-hidden="true"
            className="-ms-1 md:me-3 text-muted-foreground/80"
            size={16}
          />
          <span className="hidden md:block font-normal text-muted-foreground/70">
            Search
          </span>
        </span>
        <kbd className="-me-1 ms-12 hidden md:inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
          ⌘K
        </kbd>
      </button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput
          value={term}
          onValueChange={(value) => {
            setTerm(value);
            setOpen(true);
          }}
          placeholder="Type a command or search..."
        />
        {debouncedValue.length > 0 && debouncedValue.length < 2 && (
          <CommandGroup>
            <CommandItem>Type at least 2 characters to search.</CommandItem>
          </CommandGroup>
        )}
        {results?.length === 0 && (
          <CommandGroup>
            <CommandItem>No results found.</CommandItem>
          </CommandGroup>
        )}
        <CommandList>
          {results && results.length > 0 && (
            <div>
              {results === undefined ? (
                <CommandItem>
                  <Loader2Icon className="animate-spin" />
                  Loading...
                </CommandItem>
              ) : (
                results.map((result) => (
                  <Link
                    href={`/blog/${result.post._id}`}
                    onClick={() => {
                      setOpen(false);
                      setTerm("");
                    }}
                    key={result.post._id}
                    className="w-full flex justify-between items-center p-4 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Image
                      src={result.imageURL ?? "/download.png"}
                      alt={result.post.title}
                      width={70}
                      height={70}
                      className="rounded-md object-cover"
                    />

                    <p className="text-sm font-semibold">{result.post.title}</p>
                  </Link>
                ))
              )}
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
