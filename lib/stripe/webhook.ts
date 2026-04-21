import Stripe from "stripe";

import { getStripeServerClient } from "@/lib/stripe/client";

export function constructStripeWebhookEvent(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  }

  const stripe = getStripeServerClient();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export function getSessionAmountMajorUnit(session: Stripe.Checkout.Session) {
  const amountTotal = session.amount_total ?? 0;
  return amountTotal / 100;
}

