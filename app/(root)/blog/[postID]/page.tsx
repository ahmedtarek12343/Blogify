import { buttonVariants } from "@/components/ui/button";
import PostView from "@/components/web/PostView";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

const page = async ({ params }: { params: Promise<{ postID: string }> }) => {
  const { postID } = await params;
  return (
    <div className="py-12">
      <Link
        href="/blog"
        className={buttonVariants({ variant: "outline" }) + " mb-4"}
      >
        <ArrowLeftIcon /> Back to blogs
      </Link>
      <PostView postId={postID as Id<"posts">} />
    </div>
  );
};

export default page;
