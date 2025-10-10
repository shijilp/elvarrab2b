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
  const { user, initialized } = useAuth(); // your AuthContext should return user info + role
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (!user) router.replace("/login?next=/admin");
    else if (!user.isAdmin) router.replace("/");
  }, [initialized, user, router]);

  if (!initialized) return <p>Loading...</p>;

  return <>{children}</>;
}
