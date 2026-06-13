"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { payCopy } from "@/lib/constants/copy";

type PayActionsProps = {
  slug: string;
};

export function PayActions({ slug }: PayActionsProps) {
  // Client component on purpose: checkout creation and browser redirection
  // are user-triggered interactive flows that require client-side mutations.
  const [isPreparing, setIsPreparing] = useState(false);

  const handlePayNow = async () => {
    try {
      setIsPreparing(true);

      const response = await fetch("/api/pay/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });
      const data = (await response.json()) as { url?: string; message?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.message ?? payCopy.feedback.checkoutError);
      }

      // Keep the button in its loading state through the redirect so it cannot
      // be triggered twice while the browser navigates to Stripe.
      window.location.href = data.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : payCopy.feedback.checkoutError;
      toast.error(message);
      setIsPreparing(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={isPreparing}
        onClick={handlePayNow}
      >
        {isPreparing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {payCopy.page.creatingSession}
          </>
        ) : (
          payCopy.page.payNow
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <Lock className="h-3.5 w-3.5" />
        {payCopy.page.securedByStripe}
      </p>
    </div>
  );
}
