import { LinkAnalyticsPage } from "@/components/dashboard/link-analytics-page";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function LinkAnalyticsRoute({
  params,
}: {
  params: { id: string };
}) {
  // Server component on purpose: route param handling and dashboard shell remain
  // server-rendered while interactive analytics are delegated to a client child.
  return (
    <ErrorBoundary title="Analytics section failed to load">
      <LinkAnalyticsPage linkId={params.id} />
    </ErrorBoundary>
  );
}
