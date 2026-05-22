import OrderDetailsPage from "@/components/pages/OrderDetailsPage ";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();
  return <OrderDetailsPage id={id} />;
}
