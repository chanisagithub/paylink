import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hexColorPattern = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

export const supportedCurrencies = ["USD", "EUR", "GBP", "INR"] as const;

export const linkInputSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title must be 120 characters or fewer."),
  description: z.string().max(500, "Description must be 500 characters or fewer.").optional().default(""),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero.")
    .max(100000, "Amount must be less than 100000."),
  currency: z.enum(supportedCurrencies).default("USD"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(80, "Slug must be 80 characters or fewer.")
    .regex(slugPattern, "Slug can only include lowercase letters, numbers, and hyphens."),
  expiresAt: z
    .string()
    .optional()
    .nullable()
    .refine(
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
      "Expiry date must be a valid date.",
    ),
  isActive: z.boolean().default(true),
  brandColor: z
    .string()
    .trim()
    .regex(hexColorPattern, "Brand color must be a valid hex color.")
    .default("#6366f1"),
});

export const linkIdParamSchema = z.object({
  id: z.string().uuid("Invalid link identifier."),
});

export const linkSlugAvailabilitySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(80, "Slug must be 80 characters or fewer.")
    .regex(slugPattern, "Invalid slug format."),
});

export const updateLinkInputSchema = linkInputSchema.partial().extend({
  title: linkInputSchema.shape.title.optional(),
  amount: linkInputSchema.shape.amount.optional(),
  currency: linkInputSchema.shape.currency.optional(),
  slug: linkInputSchema.shape.slug.optional(),
  brandColor: linkInputSchema.shape.brandColor.optional(),
});

export type LinkInput = z.infer<typeof linkInputSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkInputSchema>;
