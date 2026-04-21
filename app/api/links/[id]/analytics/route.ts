import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { linkCopy } from "@/lib/constants/copy";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { linkIdParamSchema } from "@/lib/validations/link.schema";

function dayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } },
) {
  const supabase = createServerSupabaseClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: linkCopy.errors.unauthorized }, { status: 401 });
    }

    const { id } = linkIdParamSchema.parse(context.params);
    const { data: link, error: linkError } = await supabase
      .from("payment_links")
      .select("id,slug,title,amount,currency,created_at")
      .eq("id", id)
      .eq("merchant_id", user.id)
      .maybeSingle();

    if (linkError) {
      return NextResponse.json({ message: linkError.message }, { status: 500 });
    }

    if (!link) {
      return NextResponse.json({ message: linkCopy.errors.notFound }, { status: 404 });
    }

    const [{ data: views, error: viewsError }, { data: payments, error: paymentsError }] =
      await Promise.all([
        supabase
          .from("link_views")
          .select("viewed_at")
          .eq("link_id", id)
          .order("viewed_at", { ascending: true }),
        supabase
          .from("payments")
          .select("id,payer_email,amount_paid,currency,status,paid_at")
          .eq("link_id", id)
          .order("paid_at", { ascending: false })
          .limit(20),
      ]);

    if (viewsError) {
      return NextResponse.json({ message: viewsError.message }, { status: 500 });
    }

    if (paymentsError) {
      return NextResponse.json({ message: paymentsError.message }, { status: 500 });
    }

    const viewBuckets = new Map<string, number>();

    for (const view of views) {
      const key = dayKey(view.viewed_at);
      viewBuckets.set(key, (viewBuckets.get(key) ?? 0) + 1);
    }

    const viewsOverTime = Array.from(viewBuckets.entries()).map(([date, viewsCount]) => ({
      date,
      viewsCount,
    }));

    const statusMap = new Map<"pending" | "completed" | "failed" | "refunded", number>([
      ["pending", 0],
      ["completed", 0],
      ["failed", 0],
      ["refunded", 0],
    ]);

    for (const payment of payments) {
      statusMap.set(payment.status, (statusMap.get(payment.status) ?? 0) + 1);
    }

    const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    return NextResponse.json({
      link,
      viewsOverTime,
      statusBreakdown,
      recentPayments: payments,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: linkCopy.errors.invalidPayload }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : linkCopy.errors.loadAnalytics;
    return NextResponse.json({ message }, { status: 500 });
  }
}

