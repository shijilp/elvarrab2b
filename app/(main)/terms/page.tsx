// app/(main)/legal/terms/page.tsx
import LegalLayout from "@/components/ui/LegalLayout";
import type { Metadata } from "next";

const LAST_UPDATED = "October 9, 2025";

export const metadata: Metadata = {
  title: "Terms of Service • Elvarra",
  description:
    "Elvarra Terms of Service: orders, returns, wallet, referrals, liabilities, and acceptable use.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/legal/terms" },
  openGraph: {
    title: "Terms of Service • Elvarra",
    description:
      "Elvarra Terms of Service: orders, returns, wallet, referrals, liabilities, and acceptable use.",
    url: "/legal/terms",
    type: "article",
  },
};

export default function Page() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TermsOfService",
            name: "Elvarra Terms of Service",
            dateModified: LAST_UPDATED,
            url: "https://www.elvarra.com/legal/terms",
            publisher: { "@type": "Organization", name: "Elvarra" },
          }),
        }}
      />
      <LegalLayout
        title="Terms of Service"
        intro={`Last updated: ${LAST_UPDATED}`}
      >
        <p>
          Welcome to Elvarra. By accessing or using our website, you agree to
          these Terms. If you do not agree, please do not use our services.
        </p>

        <h2 id="accounts">1. Accounts</h2>
        <p>
          You are responsible for the accuracy of your information and keeping
          credentials secure. We may suspend or terminate accounts for misuse or
          violation of these Terms.
        </p>

        <h2 id="orders">2. Orders & Pricing</h2>
        <ul>
          <li>
            Orders are offers to purchase; we may accept or decline at our
            discretion (e.g., stock errors or fraud checks).
          </li>
          <li>
            Prices and availability are subject to change. Displayed prices may
            exclude taxes, duties, or shipping unless stated.
          </li>
        </ul>

        <h2 id="payments">3. Payments</h2>
        <p>
          Payments are processed by compliant providers. If your wallet balance
          fully covers the order, we may mark it paid without external capture.
        </p>

        <h2 id="shipping">4. Shipping & Delivery</h2>
        <p>
          Delivery estimates are indicative. Title and risk pass per applicable
          law and carrier terms. You are responsible for providing accurate
          delivery information.
        </p>

        <h2 id="returns">5. Returns & Refunds</h2>
        <p>
          Return eligibility and timelines are specified in our Returns Policy.
          Refunds may be issued to the original method or to your Elvarra
          wallet, subject to policy and law.
        </p>

        <h2 id="wallet">6. Wallet</h2>
        <p>
          Wallet credits may arise from refunds, promotions, or referral
          rewards. Wallet is not a bank account, non-transferable, and may be
          subject to expiry or reversal in cases like order cancellation or
          fraud.
        </p>

        <h2 id="referrals">7. Referral & Affiliate Program</h2>
        <p>
          We may provide referral codes/links. Rewards post per program rules
          and may be reversed for returns, cancellations, or abuse. One account
          per person; self-referrals are not allowed.
        </p>

        <h2 id="acceptable-use">8. Acceptable Use</h2>
        <p>
          You agree not to misuse the site (e.g., hacking, scraping beyond
          permitted use, infringing IP, fraudulent behavior, or violating laws).
        </p>

        <h2 id="ip">9. Intellectual Property</h2>
        <p>
          All content, trademarks, and designs are owned by Elvarra or its
          licensors. You may not reproduce without permission.
        </p>

        <h2 id="disclaimers">10. Disclaimers & Liability</h2>
        <p>
          Services are provided “as is” to the extent permitted by law. We do
          not exclude liability that cannot be excluded by applicable law but
          otherwise limit indirect or consequential damages.
        </p>

        <h2 id="governing-law">11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of your selling entity’s
          jurisdiction (set this to your operating country) without regard to
          conflict of law principles.
        </p>

        <h2 id="changes">12. Changes</h2>
        <p>
          We may update these Terms. Material changes will be posted on this
          page and effective when published unless stated otherwise.
        </p>

        <h2 id="contact">13. Contact</h2>
        <p>
          Email: <a href="mailto:elvarra@elvarra.com">elvarra@elvarra.com</a> •
          Support: <a href="mailto:support@elvarra.com">support@elvarra.com</a>
        </p>
      </LegalLayout>
    </>
  );
}
