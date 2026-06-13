"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClipboard } from "@/hooks/useClipboard";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";
import { linkCopy } from "@/lib/constants/copy";
import { toFixedPercent } from "@/lib/utils/analytics";
import { formatCurrency } from "@/lib/utils/format";

export function LinksPageContent() {
  // Client component on purpose: list state is fetched and refreshed with
  // React Query, and row interactions will be progressively enhanced.
  const { copy } = useClipboard();
  const { links, isLoading, isError, error, deleteLink, toggleLinkActive } = usePaymentLinks();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [linkToDelete, setLinkToDelete] = useState<{ id: string; title: string } | null>(null);

  const confirmDelete = () => {
    if (!linkToDelete) {
      return;
    }

    deleteLink.mutate(linkToDelete.id, {
      onSuccess: () => setLinkToDelete(null),
    });
  };

  const filteredLinks = useMemo(() => {
    const searchNormalized = search.trim().toLowerCase();
    return links.filter((link) => {
      const matchesSearch =
        searchNormalized.length === 0 ||
        link.title.toLowerCase().includes(searchNormalized) ||
        link.slug.toLowerCase().includes(searchNormalized);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && link.is_active) ||
        (statusFilter === "inactive" && !link.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [links, search, statusFilter]);

  useEffect(() => {
    if (isError) {
      const message = error instanceof Error ? error.message : linkCopy.errors.generic;
      toast.error(message);
    }
  }, [error, isError]);

  const handleCopy = async (slug: string) => {
    try {
      const appUrl = window.location.origin;
      await copy(`${appUrl}/pay/${slug}`);
      toast.success(linkCopy.form.feedback.copySuccess);
    } catch {
      toast.error(linkCopy.form.feedback.copyError);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            {linkCopy.overview.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {linkCopy.overview.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-400">
            {linkCopy.overview.description}
          </p>
        </div>
        <Button asChild>
          <Link href="/links/new">{linkCopy.overview.createAction}</Link>
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <Input
          placeholder={linkCopy.filters.searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}
        >
          <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#141414] text-white">
            <SelectItem value="all">{linkCopy.filters.statusAll}</SelectItem>
            <SelectItem value="active">{linkCopy.filters.statusActive}</SelectItem>
            <SelectItem value="inactive">{linkCopy.filters.statusInactive}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-white/10 bg-[#1a1a1a] text-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="space-y-2 p-8 text-center">
              <p className="text-lg font-medium">{linkCopy.list.emptyTitle}</p>
              <p className="text-sm text-zinc-400">{linkCopy.list.emptyDescription}</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="[&_tr]:border-white/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-5 py-3">{linkCopy.list.table.title}</TableHead>
                  <TableHead className="px-5 py-3">{linkCopy.list.table.amount}</TableHead>
                  <TableHead className="px-5 py-3">{linkCopy.list.table.views}</TableHead>
                  <TableHead className="px-5 py-3">{linkCopy.list.table.payments}</TableHead>
                  <TableHead className="px-5 py-3">{linkCopy.list.table.conversion}</TableHead>
                  <TableHead className="px-5 py-3">{linkCopy.list.table.slug}</TableHead>
                  <TableHead className="px-5 py-3">{linkCopy.list.table.status}</TableHead>
                  <TableHead className="px-5 py-3">{linkCopy.list.table.createdAt}</TableHead>
                  <TableHead className="px-5 py-3 text-right">{linkCopy.list.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.length === 0 ? (
                  <TableRow className="border-white/5">
                    <TableCell colSpan={9} className="py-8 text-center text-zinc-400">
                      {linkCopy.list.emptyDescription}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLinks.map((link) => (
                    <TableRow key={link.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="px-5 py-4">{link.title}</TableCell>
                    <TableCell className="px-5 py-4">
                      {formatCurrency(link.amount, link.currency)}
                    </TableCell>
                    <TableCell className="px-5 py-4">{link.views_count ?? 0}</TableCell>
                    <TableCell className="px-5 py-4">{link.payments_count ?? 0}</TableCell>
                    <TableCell className="px-5 py-4">
                      {toFixedPercent(link.conversion_rate ?? 0)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-zinc-300">/pay/{link.slug}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        variant="secondary"
                        className={`border-0 ${
                          link.is_active
                            ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                            : "bg-zinc-500/20 text-zinc-300 hover:bg-zinc-500/20"
                        }`}
                      >
                        {link.is_active
                          ? linkCopy.list.status.active
                          : linkCopy.list.status.inactive}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-zinc-400">
                      {new Date(link.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-white/10 bg-[#141414] text-white"
                        >
                          <DropdownMenuItem onClick={() => void handleCopy(link.slug)}>
                            {linkCopy.actions.copy}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/links/${link.id}`}>{linkCopy.actions.analytics}</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/links/${link.id}/edit`}>{linkCopy.actions.edit}</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toggleLinkActive.mutate({
                                id: link.id,
                                isActive: !link.is_active,
                              })
                            }
                          >
                            {link.is_active
                              ? linkCopy.actions.deactivate
                              : linkCopy.actions.activate}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-rose-300 focus:text-rose-200"
                            onSelect={() =>
                              setLinkToDelete({ id: link.id, title: link.title })
                            }
                          >
                            {linkCopy.actions.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(linkToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setLinkToDelete(null);
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#141414] text-white">
          <DialogHeader>
            <DialogTitle>{linkCopy.list.deleteConfirm.title}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {linkCopy.list.deleteConfirm.description}
            </DialogDescription>
          </DialogHeader>
          {linkToDelete ? (
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
              {linkToDelete.title}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLinkToDelete(null)}
            >
              {linkCopy.list.deleteConfirm.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteLink.isPending}
              onClick={confirmDelete}
            >
              {deleteLink.isPending
                ? linkCopy.list.deleteConfirm.deleting
                : linkCopy.list.deleteConfirm.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
