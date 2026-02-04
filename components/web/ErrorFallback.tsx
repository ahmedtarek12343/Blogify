"use client";

import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div className="min-h-screen mt-20">
      <Alert variant="destructive" className="max-w-3xl mx-auto p-6 ">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            Unable to load content
          </AlertTitle>
        </div>

        <AlertDescription className="text-base mt-2">
          Something went wrong! you can try again or contact support
        </AlertDescription>
        <div className="mt-4 flex gap-2 items-center">
          <Button
            className="w-[100px] "
            variant="destructive"
            onClick={resetErrorBoundary}
          >
            Retry
          </Button>
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            Go to Home
          </Link>
        </div>
      </Alert>
    </div>
  );
};

export default ErrorFallback;
