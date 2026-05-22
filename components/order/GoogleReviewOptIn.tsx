"use client";

import Script from "next/script";

type Props = {
  orderId: string;
  email: string;
  country: string;
  estimatedDeliveryDate: string;
};

export default function GoogleReviewOptIn({
  orderId,
  email,
  country,
  estimatedDeliveryDate,
}: Props) {
  const handleLoad = () => {
    // @ts-expect-error Google gapi is injected by external script
    window.gapi.load("surveyoptin", () => {
      // @ts-expect-error Google gapi is injected by external script
      window.gapi.surveyoptin.render({
        merchant_id: 5716668045,
        order_id: orderId,
        email,
        delivery_country: country,
        estimated_delivery_date: estimatedDeliveryDate,
      });
    });
  };

  return (
    <Script
      src="https://apis.google.com/js/platform.js"
      strategy="afterInteractive"
      onLoad={handleLoad}
    />
  );
}
