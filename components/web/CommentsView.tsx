"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { MessageSquare } from "lucide-react";
import Comment from "./Comment";

const CommentsView = ({
  comments,
  users,
}: {
  comments: Doc<"comments">[] | undefined;
  users: any;
}) => {
  const topLevelComments = comments?.filter(
    (comment) => !comment.parentCommentId,
  );

  if (comments === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-muted-foreground animate-pulse">
        <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
        <p>Loading comments...</p>
      </div>
    );
  }

  if (!topLevelComments || topLevelComments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30 text-muted-foreground">
        <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-sm font-medium">No comments yet</p>
        <p className="text-xs opacity-70">
          Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
      {topLevelComments.map((comment) => (
        <Comment key={comment._id} comment={comment} depth={0} users={users} />
      ))}
    </div>
  );
};

export default CommentsView;
