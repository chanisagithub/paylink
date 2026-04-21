"use client";

import { useQuery } from "@tanstack/react-query";

import { linkCopy } from "@/lib/constants/copy";

type ViewsOverTimeItem = {
  date: string;
  viewsCount: number;
};

type StatusBreakdownItem = {
  status: "pending" | "completed" | "failed" | "refunded";
  count: number;
};

type RecentPaymentItem = {
  id: string;
  payer_email: string | null;
  amount_paid: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paid_at: string | null;
};

type AnalyticsResponse = {
  link: {
    id: string;
    slug: string;
    title: string;
    amount: number;
    currency: string;
    created_at: string;
  };
  viewsOverTime: ViewsOverTimeItem[];
  statusBreakdown: StatusBreakdownItem[];
  recentPayments: RecentPaymentItem[];
};

export function useAnalytics(linkId: string) {
  return useQuery({
    queryKey: ["link-analytics", linkId],
    queryFn: async () => {
      const response = await fetch(`/api/links/${linkId}/analytics`);
      const data = (await response.json()) as AnalyticsResponse | { message?: string };
      const errorMessage = "message" in data ? data.message : undefined;

      if (!response.ok) {
        throw new Error(errorMessage ?? linkCopy.errors.loadAnalytics);
      }

      return data as AnalyticsResponse;
    },
    enabled: Boolean(linkId),
  });
}

export type { AnalyticsResponse, ViewsOverTimeItem, StatusBreakdownItem, RecentPaymentItem };
