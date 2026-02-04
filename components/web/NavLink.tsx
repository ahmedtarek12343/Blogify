"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={
        pathname === href
          ? "h-full px-5 bg-foreground/10 border-b-2 border-foreground transition flex items-center"
          : "h-full px-5 hover:bg-foreground/10 border-b-2 border-transparent hover:border-foreground transition flex items-center"
      }
    >
      {children}
    </Link>
  );
};
