import RetailOrderDetailsPage from "@/components/RetailOrderDetailsPage ";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();
  return <RetailOrderDetailsPage id={id} />;
}
