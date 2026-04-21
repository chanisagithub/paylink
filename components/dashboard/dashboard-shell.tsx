"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, LayoutDashboard, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { dashboardCopy } from "@/lib/constants/copy";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: dashboardCopy.nav.overview,
    icon: LayoutDashboard,
  },
  {
    href: "/links",
    label: dashboardCopy.nav.links,
    icon: CreditCard,
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  // Client component on purpose: sidebar state, active route styling, and sign-out
  // are interactive concerns that benefit from browser APIs and client navigation.
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user } = useAuth();

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(dashboardCopy.feedback.signOutError);
      return;
    }

    toast.success(dashboardCopy.feedback.signOutSuccess);
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-4 lg:px-6 lg:pb-4">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 lg:hidden">
          <div>
            <BrandLogo className="w-28" />
            <p className="mt-1 text-sm font-medium text-white">
              {profile?.business_name ?? dashboardCopy.sidebar.fallbackBusinessName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-300"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid min-h-[calc(100vh-2rem)] gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden rounded-[2rem] border border-white/10 bg-[#141414] p-5 lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-2rem)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <BrandLogo className="w-32" />
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
                  {dashboardCopy.brandLabel}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                {profile?.business_name?.slice(0, 1) ?? user.email?.slice(0, 1) ?? "P"}
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/8 bg-white/5 p-4">
              <p className="text-sm text-zinc-500">{dashboardCopy.sidebar.businessName}</p>
              <p className="mt-2 text-lg font-medium text-white">
                {profile?.business_name ?? dashboardCopy.sidebar.fallbackBusinessName}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
            </div>

            <nav className="mt-8 space-y-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                      isActive
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Button
              variant="secondary"
              className="mt-8 w-full justify-start border border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {dashboardCopy.actions.signOut}
            </Button>
          </aside>

        <div className="rounded-[2rem] border border-white/10 bg-[#141414] p-6 lg:p-8">
          {children}
        </div>
      </div>

      <motion.nav
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-white/10 bg-[#141414]/95 p-2 backdrop-blur lg:hidden"
      >
        <div className="grid grid-cols-3 gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition",
                  isActive
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            {dashboardCopy.actions.signOut}
          </button>
        </div>
      </motion.nav>
      </div>
    </div>
  );
}
