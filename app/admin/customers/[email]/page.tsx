// Server Component (no "use client")

import CustomerDetailClient from "@/components/admin/customer/CustomerDetailClient";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email } = await params; // <-- Next 15: params is a Promise
  return <CustomerDetailClient email={decodeURIComponent(email)} />;
}
