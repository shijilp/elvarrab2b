"use client";
import { Sidebar } from "@/components/admin/AdminSidebar";
import AdminWalletAdjustCard from "@/components/admin/customer/AdminWalletAdjustCard";
import React, { useState } from "react";

const Page = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-[100svh] bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 overflow-x-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      {/* Main */}
      <main className="flex-1 min-w-0 mx-auto w-full max-w-[1400px] px-4 mt-5">
        <div>
          <AdminWalletAdjustCard />
        </div>
      </main>
    </div>
  );
};

export default Page;
