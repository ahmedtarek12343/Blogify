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

export default function DeleteModal({
  comment,
  open,
  onOpenChange,
}: {
  comment: Doc<"comments">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteComment = useMutation(api.comments.DeleteComment);

  const handleDelete = async () => {
    try {
      await deleteComment({
        commentId: comment._id,
      });
      toast.success("Comment deleted successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Okay</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
