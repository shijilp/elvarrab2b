"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function BuildQuoteFromRFQ({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const unwrapped = React.use(params); // ✅ unwrap the async params
  const id = unwrapped.id;

  const [status, setStatus] = React.useState<"loading" | "error" | "done">(
    "loading"
  );
  const [message, setMessage] = React.useState("Creating quote...");

  React.useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.post(`/b2b/rfq/${id}/build-quote/`);
        if (data?.id) {
          router.replace(`/admin/quotes/${data.id}`);
        } else {
          throw new Error("No ID returned");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setMessage("Failed to build quote");
      }
    };
    run();
  }, [id, router]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
      {status === "loading" && (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
          <p className="mt-4 text-sm text-zinc-400">{message}</p>
        </>
      )}
      {status === "error" && (
        <div className="text-center">
          <p className="text-red-400 font-medium">{message}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Back
          </button>
        </div>
      )}
    </main>
  );
}
