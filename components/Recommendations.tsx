"use client";

import { Rec } from "@/lib/analytics/recommendations";

interface Props {
  recs: Rec[];
}

// Priority shape components with geometric shapes
function HighPriorityShape() {
  return (
    <div className="flex items-center gap-2">
      {/* Red Octagon - Critical Alert */}
      <div 
        className="w-4 h-4 bg-red-500 flex items-center justify-center"
        style={{ 
          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
        }}
      />
      <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Critical</span>
    </div>
  );
}

function MediumPriorityShape() {
  return (
    <div className="flex items-center gap-2">
      {/* Yellow Triangle - Warning */}
      <div 
        className="w-0 h-0"
        style={{
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderBottom: "14px solid #facc15",
        }}
      />
      <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Warning</span>
    </div>
  );
}

function LowPriorityShape() {
  return (
    <div className="flex items-center gap-2">
      {/* Green Circle - Info */}
      <div className="w-4 h-4 rounded-full bg-emerald-500" />
      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Info</span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "high") return <HighPriorityShape />;
  if (priority === "medium") return <MediumPriorityShape />;
  return <LowPriorityShape />;
}

// Helper to safely format savings
function formatSavings(value: number | null): string {
  if (value === null || value === undefined || isNaN(value) || value <= 0) return "";
  return `₹${value.toLocaleString()}`;
}

export default function Recommendations({ recs }: Props) {
  // Sort by priority (high > medium > low) and take only top 4
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedRecs = [...recs]
    .sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {sortedRecs.map((r, i) => (
        <div key={i} className="glass-card p-4">
          <PriorityBadge priority={r.priority} />
          <h4 className="mt-3 text-base font-semibold text-slate-100">{r.title}</h4>
          <p className="mt-1 text-sm text-slate-300">{r.text}</p>
          {r.savings != null && !isNaN(r.savings) && r.savings > 0 && (
            <p className="mt-2 text-xs text-emerald-400">
              Potential monthly savings: {formatSavings(r.savings)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
