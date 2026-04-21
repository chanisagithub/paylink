import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { payCopy } from "@/lib/constants/copy";
import { upsertPaymentFromSession } from "@/lib/stripe/payment-sync";
import { getStripeServerClient } from "@/lib/stripe/client";
import { confirmPaymentInputSchema } from "@/lib/validations/pay.schema";

export async function POST(request: NextRequest) {
  try {
    const rawBody = (await request.json()) as unknown;
    const payload = confirmPaymentInputSchema.parse(rawBody);
    const stripe = getStripeServerClient();

    const session = await stripe.checkout.sessions.retrieve(payload.sessionId);
    await upsertPaymentFromSession(session);

    return NextResponse.json({ synced: true as const });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: payCopy.errors.invalidPayload }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : payCopy.feedback.checkoutError;
    return NextResponse.json({ message }, { status: 500 });
  }
}

