import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <LoadingSkeleton key={index} className="h-36 rounded-3xl bg-white/5" />
      ))}
    </div>
  );
}
