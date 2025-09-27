"use client";
import { useAuth } from "@/context/AuthContext";
type Props = {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function LogoutButton({ setOpen }: Props) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <button
      onClick={() => {
        logout();
        setOpen?.(false);
      }}
      className="rounded-2xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-900 btn-gradient-accent cursor-pointer"
    >
      Logout
    </button>
  );
}
