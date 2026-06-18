import { Suspense } from "react";
import { SkeletonCard } from "@/components/ui/SkeltonCard";
import Catalogpage from "@/components/pages/Catalogpage";

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

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Catalogpage />
    </Suspense>
  );
}
