"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export default function GoogleButton() {
  const btnRef = useRef<HTMLDivElement>(null);
  const { googleLogin, loading } = useAuth();

  useEffect(() => {
    // @ts-expect-error @typescript-eslint/ban-ts-comment
    if (window.google && btnRef.current) {
      // @ts-expect-error @typescript-eslint/ban-ts-comment
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async ({ credential }: { credential: string }) => {
          await googleLogin(credential);
        },
      });
      // @ts-expect-error @typescript-eslint/ban-ts-comment
      google.accounts.id.renderButton(btnRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "left",
      });
    }
  }, [googleLogin]);

  return <div ref={btnRef} aria-disabled={loading} />;
}
