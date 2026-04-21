import { NextResponse } from "next/server";

import { dashboardCopy } from "@/lib/constants/copy";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateConversionRate } from "@/lib/utils/analytics";

export async function GET() {
  const supabase = createServerSupabaseClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: dashboardCopy.errors.loadStats }, { status: 401 });
    }

    const { data: links, error: linksError } = await supabase
      .from("payment_links")
      .select("id")
      .eq("merchant_id", user.id);

    if (linksError) {
      return NextResponse.json({ message: linksError.message }, { status: 500 });
    }

    const linkIds = links.map((link) => link.id);

    if (linkIds.length === 0) {
      return NextResponse.json({
        totalRevenue: 0,
        totalLinks: 0,
        totalViews: 0,
        averageConversion: 0,
      });
    }

    const [{ data: views, error: viewsError }, { data: payments, error: paymentsError }] =
      await Promise.all([
        supabase.from("link_views").select("id").in("link_id", linkIds),
        supabase
          .from("payments")
          .select("amount_paid,status")
          .in("link_id", linkIds),
      ]);

    if (viewsError) {
      return NextResponse.json({ message: viewsError.message }, { status: 500 });
    }

    if (paymentsError) {
      return NextResponse.json({ message: paymentsError.message }, { status: 500 });
    }

    const completedPayments = payments.filter((payment) => payment.status === "completed");
    const totalRevenue = completedPayments.reduce(
      (sum, payment) => sum + payment.amount_paid,
      0,
    );
    const totalViews = views.length;
    const averageConversion = calculateConversionRate(totalViews, completedPayments.length);

    return NextResponse.json({
      totalRevenue,
      totalLinks: linkIds.length,
      totalViews,
      averageConversion,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : dashboardCopy.errors.loadStats;
    return NextResponse.json({ message }, { status: 500 });
  }
}

