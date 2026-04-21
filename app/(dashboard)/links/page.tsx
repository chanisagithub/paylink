import { LinksPageContent } from "@/components/dashboard/links-page-content";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function LinksPage() {
  // Server component on purpose: route shell and auth gating are handled on
  // the server layout; interactive data logic is delegated to a client child.
  return (
    <ErrorBoundary title="Links section failed to load">
      <LinksPageContent />
    </ErrorBoundary>
  );
}
