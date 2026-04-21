"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";
import { linkCopy } from "@/lib/constants/copy";

export function LinksPageContent() {
  // Client component on purpose: list state is fetched and refreshed with
  // React Query, and row interactions will be progressively enhanced.
  const { links, isLoading } = usePaymentLinks();

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
                  <TableHead className="px-5 py-3">{linkCopy.list.table.slug}</TableHead>
                  <TableHead className="px-5 py-3">{linkCopy.list.table.status}</TableHead>
                  <TableHead className="px-5 py-3">{linkCopy.list.table.createdAt}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="px-5 py-4">{link.title}</TableCell>
                    <TableCell className="px-5 py-4">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: link.currency,
                        }).format(link.amount)}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
