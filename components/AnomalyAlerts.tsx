"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
  anomalies: any[];
}

// Helper to safely format amount
function formatAmount(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return value.toLocaleString();
}

export default function AnomalyAlerts({ anomalies }: Props) {
  if (!anomalies || anomalies.length === 0) return null;
  return (
    <div className="glass-card p-4 mt-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-400">
        <AlertTriangle className="h-4 w-4" />
        Anomaly Alerts
      </h3>
      <div className="flex flex-col gap-2">
        {anomalies.slice(0, 5).map((a, i) => (
          <div key={i} className="rounded-lg bg-yellow-900/20 p-3 text-sm text-yellow-200">
            Unusually high <b>{a.category}</b> spend: ₹{formatAmount(a.amount)} on{" "}
            {a.date ? new Date(a.date).toLocaleDateString() : 'Unknown'} 
            {a.description && `(${a.description})`}
          </div>
        ))}
      </div>
    </div>
  );
}
