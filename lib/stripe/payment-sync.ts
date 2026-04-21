import type Stripe from "stripe";

import { getSessionAmountMajorUnit } from "@/lib/stripe/webhook";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/types/database";

type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type PaymentStatus = PaymentInsert["status"];

export function normalizePaymentStatus(session: Stripe.Checkout.Session) {
  return (session.payment_status === "paid" ? "completed" : "pending") as PaymentStatus;
}

export async function upsertPaymentFromSession(
  session: Stripe.Checkout.Session,
  forcedStatus?: Extract<PaymentStatus, "completed" | "failed">,
) {
  const linkId = session.metadata?.link_id;

  if (!linkId) {
    throw new Error("Missing link_id in Stripe Checkout Session metadata.");
  }

  const supabase = createAdminSupabaseClient();
  const derivedStatus: PaymentStatus = forcedStatus ?? normalizePaymentStatus(session);
  const paidAt =
    derivedStatus === "completed"
      ? new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000).toISOString()
      : null;
  const metadata: Json = Object.fromEntries(
    Object.entries(session.metadata ?? {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );

  const basePayload: PaymentInsert = {
    link_id: linkId,
    stripe_session_id: session.id,
    amount_paid: getSessionAmountMajorUnit(session),
    currency: (session.currency ?? "usd").toUpperCase(),
    payer_email: session.customer_details?.email ?? session.customer_email ?? null,
    status: derivedStatus,
    paid_at: paidAt,
    metadata,
  };

  const { data: existingPayment, error: existingError } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (!existingPayment) {
    const { error: insertError } = await supabase.from("payments").insert(basePayload);

    if (insertError) {
      throw new Error(insertError.message);
    }

    return;
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      amount_paid: basePayload.amount_paid,
      currency: basePayload.currency,
      payer_email: basePayload.payer_email,
      status: basePayload.status,
      paid_at: basePayload.paid_at,
      metadata: basePayload.metadata,
    })
    .eq("id", existingPayment.id);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

