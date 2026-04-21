import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { authCopy } from "@/lib/constants/copy";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  alternateHref: string;
  alternateLabel: string;
  alternateAction: string;
  children: React.ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  alternateHref,
  alternateLabel,
  alternateAction,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_24%)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">
              {authCopy.brandLabel}
            </p>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-[-0.04em] text-white">
              {title}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              {description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {authCopy.highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-3xl border border-white/10 bg-[#0f172acc] p-4"
              >
                <p className="text-sm font-medium text-white">{highlight.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-xl border-white/10 bg-[#0f172a]/95 shadow-[0_50px_120px_-55px_rgba(15,23,42,0.95)]">
            <CardContent className="space-y-6 p-8 sm:p-10">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-indigo-300">
                  {eyebrow}
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {description}
                </p>
              </div>

              {children}

              <p className="text-sm text-slate-400">
                {alternateLabel}{" "}
                <Link
                  href={alternateHref}
                  className="font-medium text-indigo-300 transition hover:text-indigo-200"
                >
                  {alternateAction}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
