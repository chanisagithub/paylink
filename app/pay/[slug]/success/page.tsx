import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { payCopy } from "@/lib/constants/copy";

export default function PaySuccessPage({
  params,
}: {
  params: { slug: string };
}) {
  // Server component on purpose: this success state is static content driven by
  // route params and does not require client-side interactivity.
  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-slate-200 bg-white text-center shadow-sm">
          <CardHeader className="items-center">
            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
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

