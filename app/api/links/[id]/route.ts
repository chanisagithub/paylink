import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { linkCopy } from "@/lib/constants/copy";
import { getStripeServerClient } from "@/lib/stripe/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateConversionRate } from "@/lib/utils/analytics";
import {
  linkIdParamSchema,
  updateLinkInputSchema,
} from "@/lib/validations/link.schema";

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
      .select("id,slug,title,description,amount,currency,is_active,created_at,expires_at")
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
        supabase.from("link_views").select("id").eq("link_id", id),
        supabase.from("payments").select("status").eq("link_id", id),
      ]);

    if (viewsError) {
      return NextResponse.json({ message: viewsError.message }, { status: 500 });
    }

    if (paymentsError) {
      return NextResponse.json({ message: paymentsError.message }, { status: 500 });
    }

    const viewsCount = views.length;
    const paymentsCount = payments.filter((payment) => payment.status === "completed").length;
    const conversionRate = calculateConversionRate(viewsCount, paymentsCount);

    return NextResponse.json({
      link: {
        ...link,
        views_count: viewsCount,
        payments_count: paymentsCount,
        conversion_rate: conversionRate,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: linkCopy.errors.invalidPayload }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : linkCopy.errors.generic;
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
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
    const rawBody = (await request.json()) as unknown;
    const payload = updateLinkInputSchema.parse(rawBody);

    const { data: existingLink, error: existingError } = await supabase
      .from("payment_links")
      .select("id,merchant_id,title,description,amount,currency,stripe_price_id")
      .eq("id", id)
      .eq("merchant_id", user.id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ message: existingError.message }, { status: 500 });
    }

    if (!existingLink) {
      return NextResponse.json({ message: linkCopy.errors.notFound }, { status: 404 });
    }

    let stripePriceId = existingLink.stripe_price_id;

    if (
      (payload.amount && payload.amount !== existingLink.amount) ||
      (payload.currency && payload.currency !== existingLink.currency)
    ) {
      const stripe = getStripeServerClient();
      const stripePrice = await stripe.prices.create({
        unit_amount: Math.round((payload.amount ?? existingLink.amount) * 100),
        currency: (payload.currency ?? existingLink.currency).toLowerCase(),
        product_data: {
          name: payload.title ?? existingLink.title,
        },
      });
      stripePriceId = stripePrice.id;
    }

    const expiresAt =
      payload.expiresAt && payload.expiresAt.length > 0
        ? new Date(payload.expiresAt).toISOString()
        : payload.expiresAt === ""
          ? null
          : undefined;

    const { data: updatedLink, error: updateError } = await supabase
      .from("payment_links")
      .update({
        title: payload.title,
        description:
          payload.description !== undefined
            ? payload.description || null
            : undefined,
        amount: payload.amount,
        currency: payload.currency,
        slug: payload.slug,
        is_active: payload.isActive,
        expires_at: expiresAt,
        stripe_price_id: stripePriceId,
      })
      .eq("id", id)
      .eq("merchant_id", user.id)
      .select("id,slug,title,amount,currency,is_active,created_at,expires_at")
      .single();

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    if (payload.brandColor) {
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ brand_color: payload.brandColor })
        .eq("id", user.id);

      if (profileUpdateError) {
        return NextResponse.json({ message: profileUpdateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ link: updatedLink });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: linkCopy.errors.invalidPayload }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : linkCopy.errors.generic;
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
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

    const { data: relatedPayment, error: paymentCheckError } = await supabase
      .from("payments")
      .select("id")
      .eq("link_id", id)
      .limit(1)
      .maybeSingle();

    if (paymentCheckError) {
      return NextResponse.json({ message: paymentCheckError.message }, { status: 500 });
    }

    if (relatedPayment) {
      return NextResponse.json(
        { message: linkCopy.errors.deleteBlockedByPayments },
        { status: 409 },
      );
    }

    const { error } = await supabase
      .from("payment_links")
      .delete()
      .eq("id", id)
      .eq("merchant_id", user.id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true as const });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: linkCopy.errors.invalidPayload }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : linkCopy.errors.generic;
    return NextResponse.json({ message }, { status: 500 });
  }
}
