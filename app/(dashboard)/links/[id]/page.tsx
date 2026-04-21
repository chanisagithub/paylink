import { LinkAnalyticsPage } from "@/components/dashboard/link-analytics-page";

export default function LinkAnalyticsRoute({
  params,
}: {
  params: { id: string };
}) {
  // Server component on purpose: route param handling and dashboard shell remain
  // server-rendered while interactive analytics are delegated to a client child.
  return <LinkAnalyticsPage linkId={params.id} />;
}

