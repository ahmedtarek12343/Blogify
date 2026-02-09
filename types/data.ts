import { User2Icon, HeartIcon, BookTextIcon, LucideIcon } from "lucide-react";

export const notificationType: Record<
  string,
  { icons: LucideIcon; color: string }
> = {
  follow: {
    icons: User2Icon,
    color: "primary",
  },
  like: {
    icons: HeartIcon,
    color: "secondary",
  },
  comment: {
    icons: BookTextIcon,
    color: "success",
  },
} as const;
