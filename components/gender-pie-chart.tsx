"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

// use Fractal decorative/brand tokens via CSS variables so colors adapt to theme
const COLORS = [
  "var(--color-decorative-blue-70)",
  "var(--color-decorative-pink-70)",
  "var(--color-decorative-yellow-70)",
  "var(--color-decorative-purple-70)",
  "var(--color-brand-primary)"
];

interface GenderData {
  name: string;
  value: number;
}

interface GenderPieChartProps {
  data?: GenderData[];
}

export function GenderPieChart({ data }: GenderPieChartProps) {
  // Default sample data if none provided
  const chartData: GenderData[] = data || [
    { name: "Male", value: 120 },
    { name: "Female", value: 95 },
    { name: "Non-binary", value: 25 },
    { name: "Prefer not to say", value: 15 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => {
              const name = props.name ?? "";
              const value = props.value ?? 0;
              const percent = props.percent ?? 0;
              const pct = (percent * 100).toFixed(0);
              return `${name}: ${value} (${pct}%)`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | string | undefined) => `${value ?? 0}`}
            contentStyle={{
              backgroundColor: "var(--color-bg-body-white)",
              border: "2px solid var(--color-border-default)",
              borderRadius: "8px",
              color: "var(--color-text-default)"
            }}
            labelStyle={{
              color: "var(--color-text-default)"
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
