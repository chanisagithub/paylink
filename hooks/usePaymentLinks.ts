"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { linkCopy } from "@/lib/constants/copy";
import {
  type LinkInput,
  type UpdateLinkInput,
  linkInputSchema,
  updateLinkInputSchema,
} from "@/lib/validations/link.schema";

type PaymentLinkListItem = {
  id: string;
  slug: string;
  title: string;
  amount: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  views_count?: number;
  payments_count?: number;
  conversion_rate?: number;
};

type LinksResponse = {
  links: PaymentLinkListItem[];
};

type CreatedLinkResponse = {
  link: PaymentLinkListItem;
  shareUrl: string;
};

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, init);
    const body = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      throw new Error(body?.message ?? linkCopy.errors.generic);
    }

    return body as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : linkCopy.errors.generic;
    throw new Error(message);
  }
}

export function usePaymentLinks() {
  const queryClient = useQueryClient();

  const linksQuery = useQuery({
    queryKey: ["payment-links"],
    queryFn: () => request<LinksResponse>("/api/links"),
  });

  const createLinkMutation = useMutation({
    mutationFn: async (payload: LinkInput) => {
      const validated = linkInputSchema.parse(payload);

      return request<CreatedLinkResponse>("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validated),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payment-links"] });
      toast.success(linkCopy.form.feedback.createSuccess);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateLinkInput }) => {
      const validated = updateLinkInputSchema.parse(payload);
      return request<{ link: PaymentLinkListItem }>(`/api/links/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validated),
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payment-links"] });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      return request<{ success: true }>(`/api/links/${id}`, {
        method: "DELETE",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payment-links"] });
    },
  });

  const toggleLinkActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return request<{ link: PaymentLinkListItem }>(`/api/links/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });
    },
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ["payment-links"] });
      const previous = queryClient.getQueryData<LinksResponse>(["payment-links"]);

      queryClient.setQueryData<LinksResponse>(["payment-links"], (current) => {
        if (!current) {
          return current;
        }

        return {
          links: current.links.map((link) =>
            link.id === id ? { ...link, is_active: isActive } : link,
          ),
        };
      });

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["payment-links"], context.previous);
      }
      toast.error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payment-links"] });
    },
  });

  return {
    links: linksQuery.data?.links ?? [],
    isLoading: linksQuery.isLoading,
    isFetching: linksQuery.isFetching,
    createLink: createLinkMutation,
    updateLink: updateLinkMutation,
    deleteLink: deleteLinkMutation,
    toggleLinkActive: toggleLinkActiveMutation,
  };
}

export type { PaymentLinkListItem, CreatedLinkResponse };
