"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";
import { linkCopy } from "@/lib/constants/copy";
import { linkInputSchema } from "@/lib/validations/link.schema";

const currencies = ["USD", "EUR", "GBP", "INR"] as const;

type LinkDetailsResponse = {
  link: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    amount: number;
    currency: string;
    is_active: boolean;
    expires_at: string | null;
  };
};

export function EditLinkForm({ linkId }: { linkId: string }) {
  // Client component on purpose: this form owns interactive editing state and
  // performs a client mutation for persisted updates.
  const router = useRouter();
  const { updateLink } = usePaymentLinks();
  const form = useForm({
    resolver: zodResolver(linkInputSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      currency: "USD",
      slug: "",
      expiresAt: "",
      isActive: true,
      brandColor: "#6366f1",
    },
  });

  const linkQuery = useQuery({
    queryKey: ["payment-link", linkId],
    queryFn: async () => {
      const response = await fetch(`/api/links/${linkId}`);
      const data = (await response.json()) as LinkDetailsResponse | { message?: string };
      if (!response.ok) {
        const message = "message" in data ? data.message : undefined;
        throw new Error(message ?? linkCopy.errors.notFound);
      }
      return data as LinkDetailsResponse;
    },
  });

  useEffect(() => {
    if (!linkQuery.data) {
      return;
    }

    const { link } = linkQuery.data;
    const expiresAt = link.expires_at
      ? new Date(link.expires_at).toISOString().slice(0, 16)
      : "";

    form.reset({
      title: link.title,
      description: link.description ?? "",
      amount: link.amount,
      currency: (currencies.includes(link.currency as (typeof currencies)[number])
        ? link.currency
        : "USD") as (typeof currencies)[number],
      slug: link.slug,
      expiresAt,
      isActive: link.is_active,
      brandColor: "#6366f1",
    });
  }, [form, linkQuery.data]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateLink.mutateAsync({ id: linkId, payload: values });
      toast.success(linkCopy.form.feedback.updateSuccess);
      router.push(`/links/${linkId}`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : linkCopy.errors.generic;
      toast.error(message);
    }
  });

  if (linkQuery.isLoading) {
    return (
      <Card className="border-white/10 bg-[#1a1a1a] text-white">
        <CardContent className="p-6">
          <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  if (linkQuery.error) {
    return (
      <Card className="border-white/10 bg-[#1a1a1a] text-white">
        <CardHeader>
          <CardTitle>{linkCopy.errors.notFound}</CardTitle>
          <CardDescription className="text-zinc-400">
            {linkCopy.errors.generic}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-[#1a1a1a] text-white">
      <CardHeader>
        <CardTitle>{linkCopy.actions.edit}</CardTitle>
        <CardDescription className="text-zinc-400">
          Update title, pricing, availability, and slug for this payment link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-title">{linkCopy.form.fields.title.label}</Label>
            <Input id="edit-title" {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">{linkCopy.form.fields.description.label}</Label>
            <Textarea id="edit-description" {...form.register("description")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">{linkCopy.form.fields.amount.label}</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                {...form.register("amount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-currency">{linkCopy.form.fields.currency.label}</Label>
              <Controller
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="edit-currency">
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
            <Label htmlFor="edit-slug">{linkCopy.form.fields.slug.label}</Label>
            <Input id="edit-slug" {...form.register("slug")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-expires">{linkCopy.form.fields.expiresAt.label}</Label>
            <Input id="edit-expires" type="datetime-local" {...form.register("expiresAt")} />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Label htmlFor="edit-active">{linkCopy.form.fields.isActive.label}</Label>
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Switch id="edit-active" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push(`/links/${linkId}`)}>
              {linkCopy.form.actions.back}
            </Button>
            <Button type="submit" disabled={updateLink.isPending}>
              {updateLink.isPending ? linkCopy.form.actions.saving : linkCopy.form.actions.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
