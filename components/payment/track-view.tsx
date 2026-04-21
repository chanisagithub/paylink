"use client";

import { useEffect } from "react";

type TrackViewProps = {
  linkId: string;
};

export function TrackView({ linkId }: TrackViewProps) {
  // Client component on purpose: this non-blocking effect runs after page mount
  // so analytics writes never block server rendering of the payment page.
  useEffect(() => {
    void fetch("/api/pay/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ linkId }),
      keepalive: true,
    }).catch(() => {
      // Non-blocking analytics write: ignore transient tracking failures.
    });
  }, [linkId]);

  return null;
}

