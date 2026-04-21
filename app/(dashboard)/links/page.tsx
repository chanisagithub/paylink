import { LinksPageContent } from "@/components/dashboard/links-page-content";

export default function LinksPage() {
  // Server component on purpose: route shell and auth gating are handled on
  // the server layout; interactive data logic is delegated to a client child.
  return <LinksPageContent />;
}
