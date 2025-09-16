"use client";
import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <button
      onClick={logout}
      className="rounded-2xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-900 gradient-accent cursor-pointer"
    >
      Logout
    </button>
  );
}
