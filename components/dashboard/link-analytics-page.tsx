"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { ViewsLineChart, StatusPieChart } from "@/components/dashboard/conversion-chart";
import { RecentPayments } from "@/components/dashboard/recent-payments";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useClipboard } from "@/hooks/useClipboard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { linkCopy } from "@/lib/constants/copy";
import { formatCurrency } from "@/lib/utils/format";

export function LinkAnalyticsPage({ linkId }: { linkId: string }) {
  // Client component on purpose: analytics are loaded and refreshed with
  // React Query to keep charts and recent payments live without full reloads.
  const { copy } = useClipboard();
  const analytics = useAnalytics(linkId);
  useEffect(() => {
    if (analytics.error) {
      const message =
        analytics.error instanceof Error
          ? analytics.error.message
          : linkCopy.errors.loadAnalytics;
      toast.error(message);
    }
  }, [analytics.error]);

  const shareUrl = useMemo(() => {
    if (!analytics.data) {
      return "";
    }

    const origin =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
        : window.location.origin;
    return `${origin}/pay/${analytics.data.link.slug}`;
  }, [analytics.data]);

  const handleCopy = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await copy(shareUrl);
      toast.success(linkCopy.form.feedback.copySuccess);
    } catch {
      toast.error(linkCopy.form.feedback.copyError);
    }
  };

  if (analytics.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-3xl bg-white/5" />
        <Skeleton className="h-72 rounded-3xl bg-white/5" />
        <Skeleton className="h-72 rounded-3xl bg-white/5" />
      </div>
    );
  }

  if (analytics.error || !analytics.data) {
    return (
      <Card className="border-white/10 bg-[#1a1a1a] text-white">
        <CardHeader>
          <CardTitle>{linkCopy.errors.loadAnalytics}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            {linkCopy.analytics.title}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{analytics.data.link.title}</h1>
          <p className="mt-2 text-zinc-400">{linkCopy.analytics.subtitle}</p>
        </div>
        <Button asChild variant="secondary">
          <Link href={`/links/${linkId}/edit`}>{linkCopy.actions.edit}</Link>
        </Button>
      </div>

      <Card className="border-white/10 bg-[#1a1a1a] text-white">
        <CardHeader>
          <CardTitle>{linkCopy.analytics.shareLabel}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input value={shareUrl} readOnly />
          <Button onClick={handleCopy}>{linkCopy.actions.copy}</Button>
          <div className="text-sm text-zinc-400">
            {formatCurrency(analytics.data.link.amount, analytics.data.link.currency)}
          </div>
        </CardContent>
      </Card>

      <ErrorBoundary title="Views chart failed">
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-white/10 bg-[#1a1a1a] text-white">
            <CardHeader>
              <CardTitle>{linkCopy.analytics.viewsChartTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <ViewsLineChart data={analytics.data.viewsOverTime} />
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[#1a1a1a] text-white">
            <CardHeader>
              <CardTitle>{linkCopy.analytics.statusChartTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusPieChart data={analytics.data.statusBreakdown} />
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>

      <ErrorBoundary title="Recent payments section failed">
        <RecentPayments payments={analytics.data.recentPayments} />
      </ErrorBoundary>
    </div>
  );
}
