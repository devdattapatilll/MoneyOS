"use client";
// Wellness gauge component for score visualization

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  score: number;
}

export default function WellnessGauge({ score }: Props) {
  const remainder = 100 - score;
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: remainder },
  ];

  return (
    <div className="glass-card flex flex-col items-center justify-center">
      <h3 className="mb-2 text-sm font-semibold text-slate-300">Wellness Score</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            cx="50%"
            cy="80%"
            stroke="none"
          >
            <Cell fill="#38bdf8" />
            <Cell fill="rgba(51,65,85,0.5)" />
          </Pie>
          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="-mt-10 text-center">
        <p className="text-3xl font-bold text-slate-100">{score}</p>
        <p className="text-xs text-slate-400">/ 100</p>
      </div>
    </div>
  );
}
