"use client";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useConvexAuth } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { NavLink } from "./NavLink";
import { motion } from "framer-motion";
import SignedInMenu from "../comp-377";
import BlogSearch from "../comp-333";
import NotificationBtn from "./NotificationBtn";
import MessageBtn from "./MessageBtn";

export function Navbar() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-16 container mx-auto flex items-center justify-between"
    >
      <div className="flex h-full items-center gap-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="transition hover:scale-105">
            <h1 className="text-2xl font-bold">
              Next<span className="text-blue-500">Pro</span>
            </h1>
          </Link>
        </div>
        <ul className="hidden md:flex h-full items-center">
          <li className="h-full flex items-center">
            <NavLink href="/">Home</NavLink>
          </li>
          <li className="h-full flex items-center">
            <NavLink href="/blog">Blog</NavLink>
          </li>
          <li className="h-full flex items-center">
            <NavLink href="/create">Create</NavLink>
          </li>
        </ul>
      </div>
      <div className="flex items-center gap-3">
        <BlogSearch />
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
        </div>
        <NotificationBtn />
        <MessageBtn />
        {isLoading && (
          <Button variant="outline">
            <Loader2Icon className="animate-spin" />
          </Button>
        )}
        {!isAuthenticated && !isLoading && (
          <>
            <Link className={buttonVariants()} href="/auth/signup">
              Sign up
            </Link>

            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/auth/login"
            >
              Sign in
            </Link>
          </>
        )}
        {isAuthenticated && !isLoading && <SignedInMenu />}
      </div>
    </motion.nav>
  );
}
