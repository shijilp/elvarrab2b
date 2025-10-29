// app/account/rfqs/[id]/page.tsx

import RFQDetailClient from "@/components/Rfq-Detail-Client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Next 15: unwrap params here
  return <RFQDetailClient id={id} />;
}
