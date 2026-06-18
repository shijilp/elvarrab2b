"use client";

import { useStoreSettings } from "@/context/StoreSettingsProvider";
import React from "react";
import ProductsCatalogClient from "./ProductsCatalogClient";
import MaintenancePage from "./Maintenance";

const Catalogpage = () => {
  const settings = useStoreSettings();
  console.log(settings);
  return (
    <div>
      {settings.b2bmaint ? <MaintenancePage /> : <ProductsCatalogClient />}
    </div>
  );
};

export default Catalogpage;
