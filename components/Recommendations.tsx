"use client";

import { Rec } from "@/lib/analytics/recommendations";

interface Props {
  recs: Rec[];
}

const badgeClass = {
  high: "badge-red",
  medium: "badge-yellow",
  low: "badge-green",
};

export default function Recommendations({ recs }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {recs.map((r, i) => (
        <div key={i} className="glass-card">
          <span className={`badge ${badgeClass[r.priority]}`}>{r.priority}</span>
          <h4 className="mt-2 text-base font-semibold text-slate-100">{r.title}</h4>
          <p className="mt-1 text-sm text-slate-300">{r.text}</p>
          {r.savings != null && (
            <p className="mt-2 text-xs text-emerald-400">Potential monthly savings: ₹ {r.savings.toLocaleString()}</p>
          )}
        </div>
      ))}
    </div>
  );
}
