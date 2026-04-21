import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { linkCopy } from "@/lib/constants/copy";
import type { LinkInput } from "@/lib/validations/link.schema";

type LinkPreviewProps = {
  values: LinkInput;
};

export function LinkPreview({ values }: LinkPreviewProps) {
  return (
    <Card className="border-white/10 bg-[#121828] text-white">
      <CardHeader className="space-y-3">
        <div
          className="h-2 w-full rounded-full"
          style={{ backgroundColor: values.brandColor }}
        />
        <CardTitle className="text-xl">
          {values.title || linkCopy.preview.titleFallback}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-300">
        <p>
          {values.description || linkCopy.preview.descriptionFallback}
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {linkCopy.preview.amountLabel}
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: values.currency,
            }).format(values.amount || 0)}
          </p>
        </div>
        <div className="space-y-1 text-xs text-slate-400">
          <p>
            {linkCopy.preview.slugLabel}: /pay/
            {values.slug || linkCopy.preview.fallbackSlug}
          </p>
          <p>
            {linkCopy.preview.statusLabel}:{" "}
            {values.isActive ? linkCopy.preview.active : linkCopy.preview.inactive}
          </p>
          {values.expiresAt ? (
            <p>
              {linkCopy.preview.expiresLabel}: {values.expiresAt}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
