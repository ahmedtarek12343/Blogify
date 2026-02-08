import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Doc } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Input } from "../ui/input";

export default function EditModal({
  comment,
  open,
  onOpenChange,
}: {
  comment: Doc<"comments">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const editComment = useMutation(api.comments.EditComment);
  const [body, setBody] = useState(comment.body);

  const handleEdit = async () => {
    try {
      const res = await editComment({
        body,
        commentId: comment._id,
      });
      if (!res) {
        toast.success("Comment edited successfully");
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("Failed to edit comment");
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="text-sm"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleEdit}>Okay</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
