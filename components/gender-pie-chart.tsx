"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#FF6B9D", "#4A90E2", "#F5A623", "#7ED321", "#BD10E0"];

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
            label={({ name, value, percent }) =>
              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
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
            formatter={(value: number) => `${value}`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "2px solid #000",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
