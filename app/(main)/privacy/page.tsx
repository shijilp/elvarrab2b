// app/(main)/legal/privacy/page.tsx
import LegalLayout from "@/components/ui/LegalLayout";
import type { Metadata } from "next";

const LAST_UPDATED = "October 9, 2025";

export const metadata: Metadata = {
  title: "Privacy Policy • Elvarra",
  description:
    "How Elvarra collects, uses, and protects your data. Learn about cookies, payments, and your rights.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/legal/privacy" },
  openGraph: {
    title: "Privacy Policy • Elvarra",
    description:
      "How Elvarra collects, uses, and protects your data. Learn about cookies, payments, and your rights.",
    url: "/legal/privacy",
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
            "@type": "PrivacyPolicy",
            name: "Elvarra Privacy Policy",
            dateModified: LAST_UPDATED,
            url: "https://www.elvarra.com/legal/privacy",
            publisher: { "@type": "Organization", name: "Elvarra" },
          }),
        }}
      />
      <LegalLayout
        title="Privacy Policy"
        intro={`Last updated: ${LAST_UPDATED}`}
      >
        <p>
          Welcome to Elvarra. We care about your privacy and are committed to
          protecting your personal data. This policy explains what we collect,
          why we collect it, and how you can exercise your rights.
        </p>

        <h2 id="data-we-collect">1. Data We Collect</h2>
        <ul>
          <li>
            <strong>Account & Contact:</strong> name, email, phone, addresses.
          </li>
          <li>
            <strong>Orders & Payments:</strong> order details and payment status
            (payments are processed by PCI-compliant providers; we do not store
            full card numbers).
          </li>
          <li>
            <strong>Usage Data:</strong> device info, pages viewed, referral
            codes, and cookies.
          </li>
          <li>
            <strong>Communications:</strong> support messages, email
            preferences.
          </li>
        </ul>

        <h2 id="how-we-use">2. How We Use Your Data</h2>
        <ul>
          <li>To process orders, deliveries, returns, and refunds.</li>
          <li>To manage wallet, referral, and affiliate features.</li>
          <li>To prevent fraud and ensure platform security.</li>
          <li>To improve our catalog, UX, and customer support.</li>
          <li>
            With your consent, to send offers and updates (opt-out anytime).
          </li>
        </ul>

        <h2 id="sharing">3. Sharing & Processors</h2>
        <p>
          We share data with trusted vendors strictly to provide our services:
          payment gateways (e.g., Razorpay), shipping providers (e.g.,
          Delhivery), email/SMS providers, analytics, and hosting. These
          processors are bound by data protection terms and only process data
          under our instructions.
        </p>

        <h2 id="cookies">4. Cookies & Tracking</h2>
        <p>
          We use essential, functional, and analytics cookies. Referral cookies
          help attribute rewards. You can control cookies in your browser; some
          features may not work without them.
        </p>

        <h2 id="lawful-basis">5. Lawful Basis</h2>
        <p>
          We rely on contract (to fulfill orders), legitimate interests (to run
          and secure our platform), legal obligations (tax and accounting), and
          consent (marketing).
        </p>

        <h2 id="retention">6. Retention</h2>
        <p>
          We retain data for as long as necessary to provide services and meet
          legal/accounting requirements, then delete or anonymize it.
        </p>

        <h2 id="your-rights">7. Your Rights</h2>
        <p>
          Subject to local laws, you may request access, correction, deletion,
          portability, or restriction of your data, and object to processing.
          Email <a href="mailto:privacy@elvarra.com">privacy@elvarra.com</a>.
        </p>

        <h2 id="security">8. Security</h2>
        <p>
          We apply administrative, technical, and physical safeguards. No method
          is 100% secure; report concerns to{" "}
          <a href="mailto:security@elvarra.com">security@elvarra.com</a>.
        </p>

        <h2 id="international">9. International Transfers</h2>
        <p>
          If data is transferred internationally, we use appropriate safeguards
          (e.g., SCCs) and vetted sub-processors.
        </p>

        <h2 id="children">10. Children</h2>
        <p>
          Our services are not intended for children under the age required by
          local law to consent. If you believe a child has provided data,
          contact us for removal.
        </p>

        <h2 id="updates">11. Changes to This Policy</h2>
        <p>
          We may update this policy. Material changes will be highlighted on
          this page.
        </p>

        <h2 id="contact">12. Contact</h2>
        <p>
          Email: <a href="mailto:elvarra@elvarra.com">elvarra@elvarra.com</a> •
          Support: <a href="mailto:support@elvarra.com">support@elvarra.com</a>
        </p>
      </LegalLayout>
    </>
  );
}
