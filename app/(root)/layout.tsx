"use client";

import { Navbar } from "@/components/web/Navbar";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/web/ErrorFallback";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Navbar />

      <ErrorBoundary
        resetKeys={[pathname]}
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorFallback
            error={error as Error}
            resetErrorBoundary={resetErrorBoundary}
          />
        )}
      >
        {children}
      </ErrorBoundary>
    </>
  );
}
