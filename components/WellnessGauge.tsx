"use client";
// Wellness gauge component for score visualization

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getScoreLabel } from "@/lib/analytics/scoreLabel";

interface Props {
  score: number;
}

export default function WellnessGauge({ score }: Props) {
  const validScore = isNaN(score) ? 0 : Math.max(0, Math.min(100, score));
  const scoreLabel = getScoreLabel(validScore);
  const remainder = 100 - validScore;
  const data = [
    { name: "Score", value: validScore },
    { name: "Remaining", value: remainder },
  ];

  return (
    <div className="glass-card p-4 flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold text-slate-300">Wellness Score</h3>
      <p className={`mt-[5mm] mb-0 rounded-md border px-3 py-1 text-[13px] font-extrabold ${scoreLabel.pillClass}`}>{scoreLabel.label}</p>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
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
              <Cell fill={scoreLabel.fill} />
              <Cell fill="rgba(51,65,85,0.5)" />
            </Pie>
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="-mt-8 text-center">
        <p className="text-3xl font-bold text-slate-100">{validScore}</p>
        <p className="text-xs text-slate-400">/ 100</p>
      </div>
    </div>
  );
}
