// app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // assuming you already have this

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth(); // your AuthContext should return user info + role
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login"); // not logged in
      } else if (!user.isAdmin) {
        router.replace("/"); // logged in but not admin
      }
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}
