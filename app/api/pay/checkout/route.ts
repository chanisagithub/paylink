import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { payCopy } from "@/lib/constants/copy";
import { getStripeServerClient } from "@/lib/stripe/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { checkoutInputSchema } from "@/lib/validations/pay.schema";

export async function POST(request: NextRequest) {
  try {
    const rawBody = (await request.json()) as unknown;
    const payload = checkoutInputSchema.parse(rawBody);
    const supabase = createAdminSupabaseClient();

    const { data: link, error } = await supabase
      .from("payment_links")
      .select("id,slug,title,currency,is_active,expires_at,stripe_price_id")
      .eq("slug", payload.slug)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!link) {
      return NextResponse.json({ message: payCopy.errors.notFound }, { status: 404 });
    }

    if (!link.is_active) {
      return NextResponse.json({ message: payCopy.errors.inactive }, { status: 400 });
    }

    if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ message: payCopy.errors.expired }, { status: 400 });
    }

    if (!link.stripe_price_id) {
      return NextResponse.json({ message: payCopy.feedback.checkoutError }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const stripe = getStripeServerClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: link.stripe_price_id, quantity: 1 }],
      success_url: `${appUrl}/pay/${link.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pay/${link.slug}`,
      metadata: {
        link_id: link.id,
        slug: link.slug,
      },
    });

    if (!session.url) {
      return NextResponse.json({ message: payCopy.feedback.checkoutError }, { status: 500 });
    }

    return NextResponse.json({ url: session.url }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: payCopy.errors.invalidPayload }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : payCopy.feedback.checkoutError;
    return NextResponse.json({ message }, { status: 500 });
  }
}

