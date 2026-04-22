import Link from "next/link";

import { PayActions } from "@/components/payment/pay-actions";
import { TrackView } from "@/components/payment/track-view";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { payCopy } from "@/lib/constants/copy";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const revalidate = 60;

function renderStateCard(title: string, description: string) {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">{title}</CardTitle>
            <CardDescription className="text-slate-600">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/signup" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              {payCopy.page.createAccountCta}
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default async function PaySlugPage({
  params,
}: {
  params: { slug: string };
}) {
  // Server component on purpose: public link data is fetched on the server and
  // revalidated via ISR so users get fast, cacheable payment landing pages.
  const supabase = createAdminSupabaseClient();
  const slug = params.slug;

  const { data: link, error: linkError } = await supabase
    .from("payment_links")
    .select(
      "id,merchant_id,slug,title,description,amount,currency,is_active,expires_at,created_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (linkError || !link) {
    return renderStateCard(payCopy.page.missingTitle, payCopy.page.missingDescription);
  }

  if (!link.is_active) {
    return renderStateCard(payCopy.page.inactiveTitle, payCopy.page.inactiveDescription);
  }

  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
    return renderStateCard(payCopy.page.expiredTitle, payCopy.page.expiredDescription);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name,logo_url,brand_color")
    .eq("id", link.merchant_id)
    .maybeSingle();

  const brandColor = profile?.brand_color ?? "#6366f1";
  const businessName = profile?.business_name || payCopy.page.defaultMerchant;
  const amountLabel = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: link.currency,
  }).format(link.amount);

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:py-12">
      <TrackView linkId={link.id} />
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <BrandLogo className="w-36" />
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            {payCopy.page.eyebrow}
          </p>
          <div className="flex items-center gap-4">
            {profile?.logo_url ? (
              <div
                aria-label={`${businessName} logo`}
                role="img"
                className="h-12 w-12 rounded-full border border-slate-200 bg-cover bg-center"
                style={{ backgroundImage: `url(${profile.logo_url})` }}
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: brandColor }}
              >
                {businessName.slice(0, 1)}
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500">{businessName}</p>
              <h1 className="font-heading text-4xl font-semibold tracking-tight">{link.title}</h1>
            </div>
          </div>

          {link.description ? (
            <p className="max-w-2xl text-base leading-7 text-slate-600">{link.description}</p>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {payCopy.page.amountLabel}
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight">{amountLabel}</p>
            {link.expires_at ? (
              <p className="mt-3 text-sm text-slate-500">
                {payCopy.page.expiresLabel}:{" "}
                {new Date(link.expires_at).toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>

        <Card className="h-fit border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <BrandLogo className="w-28" />
            <div className="h-2 rounded-full" style={{ backgroundColor: brandColor }} />
            <CardTitle className="mt-4 font-heading text-2xl">{payCopy.page.payNow}</CardTitle>
            <CardDescription className="text-slate-600">
              {payCopy.page.secureRedirectDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PayActions slug={link.slug} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
