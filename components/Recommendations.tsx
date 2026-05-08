"use client";

import { Rec } from "@/lib/analytics/recommendations";
import { ExternalLink } from "lucide-react";

interface Props {
  recs: Rec[];
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "high") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-red-400 bg-red-500/20 text-[10px] font-bold text-red-200 shadow-[0_0_14px_rgba(248,113,113,0.25)]">H</span>
        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">High</span>
      </div>
    );
  }
  if (priority === "medium") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-yellow-400 bg-yellow-500/20 text-[10px] font-bold text-yellow-200 shadow-[0_0_14px_rgba(250,204,21,0.22)]">M</span>
        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Medium</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/20 text-[10px] font-bold text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.22)]">L</span>
      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Low</span>
    </div>
  );
}

function formatSavings(value: number | null): string {
  if (value === null || value === undefined || isNaN(value) || value <= 0) return "";
  return `₹${value.toLocaleString()}`;
}

function priorityCardClass(priority: string): string {
  if (priority === "high") return "border-red-400/25 bg-red-500/[0.03]";
  if (priority === "medium") return "border-yellow-400/25 bg-yellow-500/[0.03]";
  return "border-emerald-400/25 bg-emerald-500/[0.03]";
}

function savingsClass(priority: string): string {
  return "text-emerald-300";
}

export default function Recommendations({ recs }: Props) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedRecs = [...recs]
    .sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {sortedRecs.map((r, i) => (
        <div key={i} className={`glass-card p-4 ${priorityCardClass(r.priority)}`}>
          <PriorityBadge priority={r.priority} />
          <h4 className="mt-3 text-base font-semibold text-slate-100">{r.title}</h4>
          <p className="mt-1 text-sm text-slate-300">{r.text}</p>
          {r.savings != null && !isNaN(r.savings) && r.savings > 0 && (
            <p className={`mt-2 text-xs font-semibold ${savingsClass(r.priority)}`}>
              Potential monthly savings: {formatSavings(r.savings)}
            </p>
          )}
          {r.resource && (
            <a
              href={r.resource.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-sky-400/50 px-3 py-1.5 text-xs font-medium text-sky-300 transition hover:border-sky-300 hover:bg-sky-400/10 hover:text-sky-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {r.resource.label}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
