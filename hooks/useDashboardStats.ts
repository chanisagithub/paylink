"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardCopy } from "@/lib/constants/copy";

type DashboardStatsResponse = {
  totalRevenue: number;
  totalLinks: number;
  totalViews: number;
  averageConversion: number;
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      const data = (await response.json()) as DashboardStatsResponse | { message?: string };
      const errorMessage = "message" in data ? data.message : undefined;

      if (!response.ok) {
        throw new Error(errorMessage ?? dashboardCopy.errors.loadStats);
      }

      return data as DashboardStatsResponse;
    },
  });
}

export type { DashboardStatsResponse };
