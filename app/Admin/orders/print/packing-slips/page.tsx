import PrintAllPackingSlipsClient from "@/components/admin/Packing-slipsClient";
import { LoadingHint } from "@/components/LoadingHint";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<LoadingHint text="Preparing packing slips…" />}>
      <PrintAllPackingSlipsClient />
    </Suspense>
  );
}
