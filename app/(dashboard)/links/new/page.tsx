import Link from "next/link";

import { PaymentForm } from "@/components/payment/PaymentForm";
import { Button } from "@/components/ui/button";
import { linkCopy } from "@/lib/constants/copy";

export default function NewPaymentLinkPage() {
  // Server component on purpose: auth-gated route rendering is server-driven,
  // while the multi-step form itself remains a client component.
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            {linkCopy.overview.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {linkCopy.form.title}
          </h1>
        </div>
        <Button asChild variant="ghost">
          <Link href="/links">{linkCopy.form.actions.backToLinks}</Link>
        </Button>
      </div>
      <PaymentForm />
    </div>
  );
}
