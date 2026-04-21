import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditLinkPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Card className="border-white/10 bg-[#1a1a1a] text-white">
      <CardHeader>
        <CardTitle>Edit flow is next</CardTitle>
        <CardDescription className="text-zinc-400">
          Link editing is reserved for the next iteration. For now, use analytics
          and active-state toggles from the links table.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href={`/links/${params.id}`}>Back to analytics</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

