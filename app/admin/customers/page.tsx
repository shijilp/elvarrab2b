// app/admin/customers/page.tsx

import CustomersPageClient from "@/components/CustomersPageClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  // Server wrapper – all data loading done in client to allow search/sort/paginate
  return <CustomersPageClient />;
}
