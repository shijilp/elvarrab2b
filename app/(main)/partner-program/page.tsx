import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Boxes,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  Handshake,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { getResaleWhatsAppUrl } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Partner Program – General Terms | Elvarra B2B",
  description:
    "A simple overview of Elvarra's reseller and dropshipping partner program, including eligibility, pricing, orders, shipping, brand use and onboarding expectations.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/partner-program" },
  openGraph: {
    title: "Elvarra Partner Program – General Terms",
    description:
      "Understand the general terms and expectations for Elvarra reseller and dropshipping partners before applying.",
    url: "https://b2b.elvarra.in/partner-program",
    type: "website",
  },
};

const terms = [
  {
    icon: Users,
    title: "Who can apply",
    text: "Boutiques, online stores, social sellers, marketplace sellers and growing businesses may approach Elvarra for partnership. We may request basic business and contact information before approval.",
  },
  {
    icon: BadgeCheck,
    title: "Partner approval",
    text: "Partner access is subject to review and approval by Elvarra. Registration on Elvarra using the approved email address may be required before portal access is activated.",
  },
  {
    icon: CircleDollarSign,
    title: "Partner pricing & margins",
    text: "Eligible partners receive partner pricing through the applicable Elvarra portal. Margins and suggested selling prices may vary by product, category, promotion and current commercial terms.",
  },
  {
    icon: Boxes,
    title: "Products & availability",
    text: "Products are offered subject to current stock and availability. Catalog availability, variants and prices may change, so partners should rely on the latest information shown in the portal when placing an order.",
  },
  {
    icon: Truck,
    title: "Shipping",
    text: "Shipping charges or free-shipping eligibility may depend on order value, destination and partner profile. The applicable shipping information will be shown during ordering or in the partner portal.",
  },
  {
    icon: CreditCard,
    title: "Orders & payment",
    text: "Orders must follow the ordering and payment methods available in the Elvarra portal. Processing normally begins after successful order and payment confirmation, subject to stock and verification.",
  },
  {
    icon: Store,
    title: "Selling responsibly",
    text: "Partners are responsible for their own selling channels, customer communication and compliance with applicable business and marketplace rules. Product information should be presented accurately and without misleading claims.",
  },
  {
    icon: ShieldCheck,
    title: "Elvarra brand & content",
    text: "Approved Elvarra product images and descriptions may be used for genuine product promotion where permitted. Elvarra branding, product claims and content must not be misused, misrepresented or presented as an unauthorized official Elvarra account.",
  },
  {
    icon: PackageCheck,
    title: "Returns & order issues",
    text: "Returns, replacements, cancellations and refunds are handled according to the policy applicable to the order. Partners should report damaged, incorrect or delivery-related issues promptly with the required supporting information.",
  },
  {
    icon: RefreshCw,
    title: "Program updates",
    text: "Elvarra may update product pricing, shipping rules, program features or partner terms from time to time. Approved partners may be required to review and accept updated terms before continuing to use the partner portal.",
  },
];

export default function PartnerProgramPage() {
  const whatsappUrl = getResaleWhatsAppUrl(
    "Hi Elvarra, I reviewed the general partner terms and I'm interested in the reseller/dropshipping program. Please share the next steps.",
  );

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#06111f] text-slate-100">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#06111f_0%,#081827_48%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />

      <section className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <Handshake className="h-4 w-4" /> Elvarra Partner Program
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            General Partner Terms
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            A simple overview for businesses interested in reselling or
            dropshipping Elvarra products. This page is designed to help you
            understand the program before contacting our team.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.06] p-5 sm:p-6">
          <div className="flex gap-4">
            <FileCheck2 className="mt-0.5 h-6 w-6 shrink-0 text-cyan-300" />
            <div>
              <h2 className="font-semibold text-white">General information only</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                These are introductory terms, not the final partner agreement.
                Detailed commercial terms, applicable pricing, shipping rules,
                returns and other program conditions will be provided during
                onboarding or displayed in your Elvarra partner portal.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {terms.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-3xl border border-slate-800 bg-slate-950/55 p-6 shadow-[0_18px_60px_-45px_rgba(34,211,238,.65)]"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-slate-950/85 to-cyan-500/[0.06] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                Interested in partnering with Elvarra?
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white">
                Tell us about your business
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                If these general terms suit your business, contact our Trade
                Support team. We will guide you through eligibility, the most
                suitable partner option and onboarding.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/contact?topic=resale"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                Contact Trade Support
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/15"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Elvarra Partner Program – General Terms",
            url: "https://b2b.elvarra.in/partner-program",
            description:
              "General information for businesses interested in Elvarra reseller and dropshipping partnerships.",
          }),
        }}
      />
    </main>
  );
}
