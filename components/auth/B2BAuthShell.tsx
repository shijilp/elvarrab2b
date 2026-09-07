import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, CheckCircle2, Headphones, ShieldCheck } from "lucide-react";

type B2BAuthShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export const tradeInputClass =
  "w-full rounded-2xl border border-slate-700 bg-slate-950/65 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-4 focus:ring-cyan-500/10";

export const tradeLabelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400";

export const tradePrimaryButtonClass =
  "w-full rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_55px_-24px_rgba(34,211,238,.9)] transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60";

export default function B2BAuthShell({
  eyebrow = "Elvarra Trade Portal",
  title,
  description,
  children,
  footer,
}: B2BAuthShellProps) {
  return (
    <main className="relative isolate min-h-[calc(100svh-7rem)] overflow-hidden bg-[#06111f] text-slate-100">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_36%),radial-gradient(circle_at_82%_24%,rgba(14,165,233,0.14),transparent_30%),linear-gradient(180deg,#06111f_0%,#081827_50%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:py-14">
        <section className="relative hidden overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/55 p-8 shadow-2xl lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-[0_0_30px_rgba(34,211,238,.12)]">
                <Image src="/logowhite.svg" width={28} height={28} alt="Elvarra" />
              </span>
              <span>
                <span className="block text-lg font-bold tracking-[0.18em] text-white">
                  ELVARRA
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  <Building2 className="h-3 w-3" /> Wholesale
                </span>
              </span>
            </Link>

            <div className="mt-12">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-300">
                Built for trade buyers
              </div>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
                Your wholesale account, in the same Elvarra B2B experience.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
                Access trade pricing, build repeat orders and manage your Elvarra wholesale relationship from one account.
              </p>
            </div>

            <div className="mt-8 grid gap-3">
              {[
                { icon: CheckCircle2, text: "Wholesale catalog and trade pricing access" },
                { icon: ShieldCheck, text: "Secure account and checkout workflow" },
                { icon: Headphones, text: "Trade support for wholesale and resale enquiries" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/55 p-4 text-sm text-slate-300"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Resale support available
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Interested in reselling Elvarra products? Contact Trade Support or use the site chat for program details and onboarding guidance.
            </p>
            <Link
              href="/contact?topic=resale"
              className="mt-3 inline-flex text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
            >
              Contact Trade Support →
            </Link>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2rem] border border-slate-800 bg-slate-950/75 p-5 shadow-2xl backdrop-blur sm:p-8 lg:p-10">
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {eyebrow}
              </div>
              <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
            </div>

            {children}

            {footer && (
              <div className="mt-6 border-t border-slate-800 pt-5 text-sm text-slate-400">
                {footer}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
