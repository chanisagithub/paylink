import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardCopy } from "@/lib/constants/copy";

const stats = [
  { label: dashboardCopy.stats.revenue, value: "$0.00" },
  { label: dashboardCopy.stats.links, value: "0" },
  { label: dashboardCopy.stats.views, value: "0" },
  { label: dashboardCopy.stats.conversion, value: "0%" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-white/40">
          {dashboardCopy.overview.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          {dashboardCopy.overview.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-zinc-400">
          {dashboardCopy.overview.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-white/10 bg-[#1a1a1a] text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-[#1a1a1a] text-white">
        <CardHeader>
          <CardTitle>{dashboardCopy.overview.nextStepTitle}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-zinc-400">
          {dashboardCopy.overview.nextStepDescription}
        </CardContent>
      </Card>
    </div>
  );
}
