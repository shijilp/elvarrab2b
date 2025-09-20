import { Suspense } from "react";
import { SkeletonCard } from "@/components/ui/SkeltonCard";
import PrintStockLabelsPage from "@/components/admin/StockLabelPage";

function PageFallback() {
  return (
    <main className="container mx-auto py-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </main>
  );
}

export default function StockLabelPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <PrintStockLabelsPage />
    </Suspense>
  );
}
