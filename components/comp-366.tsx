import { EllipsisIcon, Trash2Icon, Edit2Icon, FlagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EllipsisMenuProps {
  isAuthor: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function EllipsisMenu({
  isAuthor,
  onEdit,
  onDelete,
}: EllipsisMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open menu"
          className="rounded-full shadow-none h-8 w-8 p-0"
          variant="ghost"
        >
          <EllipsisIcon aria-hidden="true" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isAuthor && onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit2Icon className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {isAuthor && onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-red-500 font-medium focus:text-red-500 focus:bg-red-50"
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
