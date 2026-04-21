import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-2xl bg-zinc-800", className)} />;
}
