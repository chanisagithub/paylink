import { EditLinkForm } from "@/components/payment/edit-link-form";

export default function EditLinkPage({
  params,
}: {
  params: { id: string };
}) {
  return <EditLinkForm linkId={params.id} />;
}
