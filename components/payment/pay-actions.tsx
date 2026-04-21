"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { payCopy } from "@/lib/constants/copy";

type PayActionsProps = {
  slug: string;
};

export function PayActions({ slug }: PayActionsProps) {
  // Client component on purpose: checkout creation and browser redirection
  // are user-triggered interactive flows that require client-side mutations.
  const [isPending, startTransition] = useTransition();
  const [isPreparing, setIsPreparing] = useState(false);

  const handlePayNow = () => {
    startTransition(async () => {
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

        window.location.href = data.url;
      } catch (error) {
        const message = error instanceof Error ? error.message : payCopy.feedback.checkoutError;
        toast.error(message);
      } finally {
        setIsPreparing(false);
      }
    });
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={isPending || isPreparing}
        onClick={handlePayNow}
      >
        {isPending || isPreparing ? payCopy.page.creatingSession : payCopy.page.payNow}
      </Button>
      {isPending || isPreparing ? <Skeleton className="h-3 w-full rounded-full" /> : null}
    </div>
  );
}

