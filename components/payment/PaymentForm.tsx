"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";

import { BrandingPanel } from "@/components/payment/BrandingPanel";
import { LinkPreview } from "@/components/payment/LinkPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useClipboard } from "@/hooks/useClipboard";
import { useLinkForm } from "@/hooks/useLinkForm";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";
import { linkCopy } from "@/lib/constants/copy";
import { linkInputSchema } from "@/lib/validations/link.schema";

const currencies = ["USD", "EUR", "GBP", "INR"] as const;

type CreatedLinkState = {
  id: string;
  shareUrl: string;
};

export function PaymentForm() {
  // Client component on purpose: this is an interactive multi-step form with
  // optimistic UI feedback, live preview updates, and user-triggered mutations.
  const { profile } = useAuth();
  const { copied, copy } = useClipboard();
  const { createLink } = usePaymentLinks();
  const { form, preview, setManualSlug, slugStatus, step, setStep } = useLinkForm({
    defaultBrandColor: profile?.brand_color,
  });

  const [createdLink, setCreatedLink] = useState<CreatedLinkState | null>(null);
  const normalizedAmount =
    typeof preview.amount === "number"
      ? preview.amount
      : Number.isFinite(Number(preview.amount))
        ? Number(preview.amount)
        : 0;
  const previewValues = {
    title: preview.title ?? "",
    description: preview.description ?? "",
    amount: normalizedAmount,
    currency: preview.currency ?? "USD",
    slug: preview.slug ?? "",
    expiresAt: preview.expiresAt ?? "",
    isActive: preview.isActive ?? true,
    brandColor: preview.brandColor ?? "#6366f1",
  };

  const slugHint =
    slugStatus === "checking"
      ? linkCopy.form.feedback.slugChecking
      : slugStatus === "ready"
        ? linkCopy.form.feedback.slugAvailable
        : undefined;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const validated = linkInputSchema.parse(values);
      const result = await createLink.mutateAsync(validated);
      setCreatedLink({ id: result.link.id, shareUrl: result.shareUrl });
    } catch (error) {
      const message = error instanceof Error ? error.message : linkCopy.errors.generic;
      toast.error(message);
    }
  });

  const handleCopy = async () => {
    if (!createdLink) {
      return;
    }

    try {
      await copy(createdLink.shareUrl);
      toast.success(linkCopy.form.feedback.copySuccess);
    } catch {
      toast.error(linkCopy.form.feedback.copyError);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-white/10 bg-[#1a1a1a] text-white">
        <CardHeader>
          <CardTitle>{linkCopy.form.title}</CardTitle>
          <CardDescription className="text-zinc-400">
            {linkCopy.form.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
            <span className={step === 0 ? "text-indigo-300" : ""}>{linkCopy.form.steps.details}</span>
            <span>/</span>
            <span className={step === 1 ? "text-indigo-300" : ""}>{linkCopy.form.steps.branding}</span>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.div
                  key="details-step"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="link-title">{linkCopy.form.fields.title.label}</Label>
                    <Input
                      id="link-title"
                      placeholder={linkCopy.form.fields.title.placeholder}
                      {...form.register("title")}
                    />
                    {form.formState.errors.title ? (
                      <p className="text-sm text-rose-400">
                        {form.formState.errors.title.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link-description">
                      {linkCopy.form.fields.description.label}
                    </Label>
                    <Textarea
                      id="link-description"
                      placeholder={linkCopy.form.fields.description.placeholder}
                      {...form.register("description")}
                    />
                    {form.formState.errors.description ? (
                      <p className="text-sm text-rose-400">
                        {form.formState.errors.description.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="link-amount">{linkCopy.form.fields.amount.label}</Label>
                      <Input
                        id="link-amount"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder={linkCopy.form.fields.amount.placeholder}
                        {...form.register("amount", { valueAsNumber: true })}
                      />
                      {form.formState.errors.amount ? (
                        <p className="text-sm text-rose-400">
                          {form.formState.errors.amount.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="link-currency">{linkCopy.form.fields.currency.label}</Label>
                      <Controller
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                              id="link-currency"
                              className="h-11 rounded-2xl border-white/10 bg-white/5 text-white"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-[#141414] text-white">
                            {currencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link-expiresAt">{linkCopy.form.fields.expiresAt.label}</Label>
                    <Input id="link-expiresAt" type="datetime-local" {...form.register("expiresAt")} />
                    {form.formState.errors.expiresAt ? (
                      <p className="text-sm text-rose-400">
                        {form.formState.errors.expiresAt.message}
                      </p>
                    ) : null}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="branding-step"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  <Controller
                    name="slug"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <BrandingPanel
                        slugValue={field.value}
                        slugError={fieldState.error?.message}
                        isActive={form.watch("isActive") ?? true}
                        brandColor={form.watch("brandColor") ?? "#6366f1"}
                        onSlugChange={setManualSlug}
                        onColorChange={(value) =>
                          form.setValue("brandColor", value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        onActiveChange={(checked) =>
                          form.setValue("isActive", checked, {
                            shouldDirty: true,
                          })
                        }
                      />
                    )}
                  />
                  {slugHint ? <p className="text-xs text-zinc-400">{slugHint}</p> : null}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0}
              >
                {linkCopy.form.actions.back}
              </Button>

              {step === 0 ? (
                <Button type="button" onClick={() => setStep(1)}>
                  {linkCopy.form.actions.next}
                </Button>
              ) : (
                <Button type="submit" disabled={createLink.isPending}>
                  {createLink.isPending
                    ? linkCopy.form.actions.creating
                    : linkCopy.form.actions.create}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <LinkPreview values={previewValues} />
      </div>

      <Dialog
        open={Boolean(createdLink)}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedLink(null);
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#141414] text-white">
          <DialogHeader>
            <DialogTitle>{linkCopy.share.title}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {linkCopy.share.description}
            </DialogDescription>
          </DialogHeader>
          {createdLink ? (
            <div className="space-y-4">
              <Input readOnly value={createdLink.shareUrl} />
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={handleCopy}>
                  {copied ? linkCopy.form.feedback.copySuccess : linkCopy.share.copyAction}
                </Button>
                <Button asChild variant="secondary">
                  <Link href={createdLink.shareUrl} target="_blank">
                    {linkCopy.share.openAction}
                  </Link>
                </Button>
                <Button type="button" variant="ghost" onClick={() => setCreatedLink(null)}>
                  {linkCopy.share.doneAction}
                </Button>
              </div>
              <Image
                className="h-32 w-32 rounded-xl border border-white/10 bg-white p-2"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(
                  createdLink.shareUrl,
                )}`}
                alt={linkCopy.share.qrAlt}
                width={128}
                height={128}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
