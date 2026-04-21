import { z } from "zod";

export const checkoutInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required.")
    .max(80, "Invalid slug.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format."),
});

export const trackViewInputSchema = z.object({
  linkId: z.string().uuid("Invalid link identifier."),
});

export const confirmPaymentInputSchema = z.object({
  sessionId: z.string().trim().min(1, "Session identifier is required."),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
