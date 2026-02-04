import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="absolute top-15 left-15">
        <Link className={buttonVariants({ variant: "ghost" })} href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
      <div className="basis-1/2">{children}</div>
    </div>
  );
};

export default AuthLayout;
