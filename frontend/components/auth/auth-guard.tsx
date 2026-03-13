"use client"

import { useAuth } from "./auth-provider";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || (!user && typeof window !== "undefined")) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Checking session...</div>;
  }

  return <>{children}</>;
}
