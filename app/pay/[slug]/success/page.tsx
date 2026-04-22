import Link from "next/link";

import { ConfirmPaymentSync } from "@/components/payment/confirm-payment-sync";
import { SuccessCelebrationIcon } from "@/components/payment/success-celebration";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { payCopy } from "@/lib/constants/copy";

export default function PaySuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { session_id?: string };
}) {
  // Server component on purpose: success UI is route-driven and static, while
  // a tiny client child handles non-blocking payment sync recovery.
  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-12 text-slate-900">
      <ConfirmPaymentSync sessionId={searchParams.session_id} />
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-slate-200 bg-white text-center shadow-sm">
          <CardHeader className="items-center">
            <BrandLogo className="w-36" />
            <SuccessCelebrationIcon />
            <CardTitle className="pt-3 font-heading text-3xl">{payCopy.success.title}</CardTitle>
            <CardDescription className="max-w-xl text-slate-600">
              {payCopy.success.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="secondary">
              <Link href={`/pay/${params.slug}`}>{payCopy.success.backToPay}</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">{payCopy.page.createAccountCta}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
