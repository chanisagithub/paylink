import { NextRequest, NextResponse } from "next/server";

import { upsertPaymentFromSession } from "@/lib/stripe/payment-sync";
import { constructStripeWebhookEvent } from "@/lib/stripe/webhook";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ message: "Missing stripe signature." }, { status: 400 });
  }

  try {
    const payload = await request.text();
    const event = constructStripeWebhookEvent(payload, signature);

    switch (event.type) {
      case "checkout.session.completed": {
        await upsertPaymentFromSession(event.data.object, "completed");
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        await upsertPaymentFromSession(event.data.object, "failed");
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true as const });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handler failed.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
