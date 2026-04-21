"use client";

import { useEffect } from "react";

type ConfirmPaymentSyncProps = {
  sessionId?: string;
};

export function ConfirmPaymentSync({ sessionId }: ConfirmPaymentSyncProps) {
  // Client component on purpose: this recovery sync runs after redirect from
  // Stripe success and helps persist payments when webhook delivery is delayed.
  useEffect(() => {
    if (!sessionId) {
      return;
    }

    void fetch("/api/pay/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {
      // Recovery sync is best-effort and intentionally non-blocking.
    });
  }, [sessionId]);

  return null;
}

