import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { marketingCopy } from "@/lib/constants/copy";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.2),_transparent_30%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
        <header className="flex items-center justify-between">
          <div>
            <BrandLogo priority className="w-40" />
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">
              {marketingCopy.brand.eyebrow}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/login">{marketingCopy.actions.login}</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">{marketingCopy.actions.signup}</Link>
            </Button>
          </div>
        </header>

        <section className="flex flex-1 items-center py-16">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.32em] text-indigo-300">
                {marketingCopy.hero.kicker}
              </p>
              <h2 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
                {marketingCopy.hero.title}
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                {marketingCopy.hero.description}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/signup">{marketingCopy.actions.getStarted}</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/dashboard">{marketingCopy.actions.previewDashboard}</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.95)] backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1120] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      {marketingCopy.preview.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold">
                      {marketingCopy.preview.amount}
                    </p>
                  </div>
                  <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    {marketingCopy.preview.badge}
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  {marketingCopy.preview.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
