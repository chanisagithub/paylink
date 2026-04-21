import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function DashboardPage() {
  return (
    <ErrorBoundary title="Dashboard failed to load">
      <DashboardOverview />
    </ErrorBoundary>
  );
}
