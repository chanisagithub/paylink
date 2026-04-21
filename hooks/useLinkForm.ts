"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useDebounce } from "@/hooks/useDebounce";
import { linkCopy } from "@/lib/constants/copy";
import {
  linkInputSchema,
  linkSlugAvailabilitySchema,
} from "@/lib/validations/link.schema";
import { createSlugCandidate, normalizeSlugInput } from "@/lib/utils/slug";

type SlugAvailabilityResponse = {
  available: boolean;
  slug: string;
};

type LinkFormHookParams = {
  defaultBrandColor?: string;
};

export function useLinkForm({ defaultBrandColor }: LinkFormHookParams) {
  const [step, setStep] = useState(0);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [hasManualSlugInput, setHasManualSlugInput] = useState(false);

  const form = useForm({
    resolver: zodResolver(linkInputSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 49,
      currency: "USD",
      slug: "",
      expiresAt: "",
      isActive: true,
      brandColor: defaultBrandColor ?? "#6366f1",
    },
  });

  const values = useWatch({ control: form.control });
  const debouncedTitle = useDebounce(values.title, 300);
  const debouncedSlug = useDebounce(values.slug, 250);
  const preview = useDebounce(values, 200);

  useEffect(() => {
    if (!debouncedTitle || hasManualSlugInput) {
      return;
    }

    const generated = createSlugCandidate(debouncedTitle);
    form.setValue("slug", generated, { shouldDirty: true, shouldValidate: true });
  }, [debouncedTitle, form, hasManualSlugInput]);

  useEffect(() => {
    const checkSlug = async () => {
      const parsed = linkSlugAvailabilitySchema.safeParse({ slug: debouncedSlug });

      if (!parsed.success) {
        return;
      }

      try {
        setIsCheckingSlug(true);

        const response = await fetch(
          `/api/links?slug=${encodeURIComponent(parsed.data.slug)}`,
          { method: "GET" },
        );
        const json = (await response.json()) as SlugAvailabilityResponse | { message: string };

        if (!response.ok || !("available" in json)) {
          return;
        }

        if (!json.available) {
          if (hasManualSlugInput) {
            form.setError("slug", { message: linkCopy.form.feedback.slugUnavailable });
            return;
          }

          form.setValue("slug", json.slug, { shouldDirty: true, shouldValidate: true });
          return;
        }

        form.clearErrors("slug");
      } catch {
        form.setError("slug", { message: linkCopy.errors.generic });
      } finally {
        setIsCheckingSlug(false);
      }
    };

    void checkSlug();
  }, [debouncedSlug, form, hasManualSlugInput]);

  const slugStatus = useMemo(() => {
    if (isCheckingSlug) {
      return "checking";
    }
    if (form.formState.errors.slug) {
      return "error";
    }
    if (!values.slug) {
      return "idle";
    }
    return "ready";
  }, [form.formState.errors.slug, isCheckingSlug, values.slug]);

  const setManualSlug = (value: string) => {
    setHasManualSlugInput(true);
    form.setValue("slug", normalizeSlugInput(value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return {
    form,
    step,
    setStep,
    preview,
    isCheckingSlug,
    slugStatus,
    setManualSlug,
  };
}
