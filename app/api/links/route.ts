import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { linkCopy } from "@/lib/constants/copy";
import { getStripeServerClient } from "@/lib/stripe/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  linkInputSchema,
  linkSlugAvailabilitySchema,
} from "@/lib/validations/link.schema";
import { createAlternateSlug, normalizeSlugInput } from "@/lib/utils/slug";

async function resolveSlug(supabase: ReturnType<typeof createServerSupabaseClient>, rawSlug: string) {
  let candidate = normalizeSlugInput(rawSlug);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data } = await supabase
      .from("payment_links")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) {
      return { available: true, slug: candidate };
    }

    candidate = createAlternateSlug(candidate);
  }

  return { available: false, slug: candidate };
}

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: linkCopy.errors.unauthorized }, { status: 401 });
    }

    const maybeSlug = request.nextUrl.searchParams.get("slug");

    if (maybeSlug) {
      const parsed = linkSlugAvailabilitySchema.safeParse({ slug: maybeSlug });

      if (!parsed.success) {
        return NextResponse.json({ message: linkCopy.errors.invalidPayload }, { status: 400 });
      }

      const result = await resolveSlug(supabase, parsed.data.slug);
      return NextResponse.json(result);
    }

    const { data, error } = await supabase
      .from("payment_links")
      .select("id,slug,title,amount,currency,is_active,created_at,expires_at")
      .eq("merchant_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ links: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : linkCopy.errors.generic;
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: linkCopy.errors.unauthorized }, { status: 401 });
    }

    const rawBody = (await request.json()) as unknown;
    const payload = linkInputSchema.parse(rawBody);

    const slugResolution = await resolveSlug(supabase, payload.slug);

    if (!slugResolution.available) {
      return NextResponse.json({ message: linkCopy.form.feedback.slugUnavailable }, { status: 409 });
    }

    const stripe = getStripeServerClient();
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(payload.amount * 100),
      currency: payload.currency.toLowerCase(),
      product_data: {
        name: payload.title,
      },
    });

    const expiresAt =
      payload.expiresAt && payload.expiresAt.length > 0
        ? new Date(payload.expiresAt).toISOString()
        : null;

    const { data: createdLink, error: insertError } = await supabase
      .from("payment_links")
      .insert({
        merchant_id: user.id,
        slug: slugResolution.slug,
        title: payload.title,
        description: payload.description || null,
        amount: payload.amount,
        currency: payload.currency,
        is_active: payload.isActive,
        stripe_price_id: stripePrice.id,
        expires_at: expiresAt,
      })
      .select("id,slug,title,amount,currency,is_active,created_at,expires_at")
      .single();

    if (insertError) {
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ brand_color: payload.brandColor })
      .eq("id", user.id);

    if (profileUpdateError) {
      return NextResponse.json({ message: profileUpdateError.message }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const shareUrl = `${appUrl}/pay/${createdLink.slug}`;

    return NextResponse.json({ link: createdLink, shareUrl }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: linkCopy.errors.invalidPayload }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : linkCopy.errors.generic;
    return NextResponse.json({ message }, { status: 500 });
  }
}
