"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tokenStore, userStore } from "@/lib/api";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    const token = tokenStore.get();
    const user = userStore.get();

    if (!token || !user) {
      router.replace(`/auth/login?next=${encodeURIComponent(window.location.pathname)}`);
      setStatus("denied");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const dest =
        user.role === "doctor" ? "/dashboard/doctor"
        : user.role === "admin" ? "/dashboard/admin"
        : "/dashboard/patient";
      router.replace(dest);
      setStatus("denied");
      return;
    }

    setStatus("ok");
  }, [router, allowedRoles]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2C74B3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#0A2647] font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
