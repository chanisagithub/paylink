"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { dashboardCopy } from "@/lib/constants/copy";
import { toFixedPercent } from "@/lib/utils/analytics";
import { formatCurrency } from "@/lib/utils/format";

function CountUpValue({ value }: { value: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {value}
    </motion.span>
  );
}

export function DashboardOverview() {
  // Client component on purpose: stats are fetched with React Query and animated
  // on the client as live values change from new payment and view events.
  const statsQuery = useDashboardStats();

  const stats = useMemo(() => {
    if (!statsQuery.data) {
      return [];
    }

    return [
      {
        label: dashboardCopy.stats.revenue,
        value: formatCurrency(statsQuery.data.totalRevenue, "USD"),
      },
      {
        label: dashboardCopy.stats.links,
        value: String(statsQuery.data.totalLinks),
      },
      {
        label: dashboardCopy.stats.views,
        value: String(statsQuery.data.totalViews),
      },
      {
        label: dashboardCopy.stats.conversion,
        value: toFixedPercent(statsQuery.data.averageConversion),
      },
    ];
  }, [statsQuery.data]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-white/40">
          {dashboardCopy.overview.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          {dashboardCopy.overview.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-400">
          {dashboardCopy.overview.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsQuery.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-white/10 bg-[#1a1a1a] text-white">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-28 rounded bg-white/10" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-24 rounded bg-white/10" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.24 }}
              >
                <Card className="border-white/10 bg-[#1a1a1a] text-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-zinc-400">
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">
                      <CountUpValue value={stat.value} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      <Card className="border-white/10 bg-[#1a1a1a] text-white">
        <CardHeader>
          <CardTitle>{dashboardCopy.overview.nextStepTitle}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-zinc-400">
          {dashboardCopy.overview.nextStepDescription}
        </CardContent>
      </Card>
    </div>
  );
}

