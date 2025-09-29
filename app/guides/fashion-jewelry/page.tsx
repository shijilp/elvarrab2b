import PageShell, { paletteForTheme } from "@/components/PageShell";
import Link from "next/link";

export default function Page() {
  const palette = paletteForTheme("dark");
  return (
    <PageShell
      theme="dark"
      trail="Fashion Jewelry"
      title="Guide: Fashion Jewelry"
      subtitle="How to choose, style, and care for everyday pieces."
    >
      <div className={`${palette.card} ${palette.ring} rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Choosing Fashion Jewelry</h2>
        <p className={`mt-2 text-sm ${palette.subfg}`}>
          Balance occasion, personal style, and budget. Fashion pieces let you
          try bold designs without fine-jewelry pricing.
        </p>
      </div>

      <div className={`${palette.card} ${palette.ring} rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Styling Basics</h2>
        <ul className={`mt-2 list-disc pl-5 text-sm ${palette.subfg}`}>
          <li>Layer chains of varied lengths (choker + mid + pendant).</li>
          <li>Stack rings with one focal statement piece.</li>
          <li>Mix metals intentionally for a modern look.</li>
        </ul>
      </div>

      <div className={`${palette.card} ${palette.ring} rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Care Essentials</h2>
        <p className={`mt-2 text-sm ${palette.subfg}`}>
          Last on, first off. Keep dry, wipe after wear, and store separately.
        </p>
      </div>

      <div className={`${palette.card} ${palette.ring} rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Materials Snapshot</h2>
        <p className={`mt-2 text-sm ${palette.subfg}`}>
          316L stainless, sterling silver, brass with plating. Learn more in{" "}
          <Link className="underline" href="/guides/materials-guide">
            Materials Guide
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
