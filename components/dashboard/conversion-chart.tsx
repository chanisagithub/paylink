"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ViewsOverTimeItem = {
  date: string;
  viewsCount: number;
};

type StatusBreakdownItem = {
  status: "pending" | "completed" | "failed" | "refunded";
  count: number;
};

const pieColors: Record<StatusBreakdownItem["status"], string> = {
  completed: "#22c55e",
  pending: "#f59e0b",
  failed: "#ef4444",
  refunded: "#8b5cf6",
};

export function ViewsLineChart({ data }: { data: ViewsOverTimeItem[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46" }}
          />
          <Line
            type="monotone"
            dataKey="viewsCount"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusPieChart({ data }: { data: StatusBreakdownItem[] }) {
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    fill: pieColors[item.status],
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={95} />
          <Tooltip
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

