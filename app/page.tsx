"use client";

import { useState, useMemo } from "react";
import UploadSection from "@/components/UploadSection";
import KpiCards from "@/components/KpiCards";
import Charts from "@/components/Charts";
import LeakDetection from "@/components/LeakDetection";
import Recommendations from "@/components/Recommendations";
import WellnessGauge from "@/components/WellnessGauge";
import TransactionTable from "@/components/TransactionTable";
import AnomalyAlerts from "@/components/AnomalyAlerts";
import { computeInsights } from "@/lib/analytics/insights";
import { computeWellnessScore } from "@/lib/analytics/scoring";
import { detectLeaks } from "@/lib/analytics/leakDetector";
import { generateRecommendations } from "@/lib/analytics/recommendations";
import { saveToSupabase } from "@/app/actions";

export default function Home() {
  const [rows, setRows] = useState<any[] | null>(null);

  const insights = useMemo(() => (rows ? computeInsights(rows) : null), [rows]);
  const scoreData = useMemo(() => (rows ? computeWellnessScore(rows) : null), [rows]);
  const leaks = useMemo(() => (rows ? detectLeaks(rows) : null), [rows]);
  const recs = useMemo(() => (rows ? generateRecommendations(rows) : null), [rows]);

  async function handleSave() {
    if (!rows) return;
    const res = await saveToSupabase(rows);
    if (res.success) alert("Saved to Supabase!");
    else alert("Save failed: " + res.error);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-cyan-400">Money OS</h1>
        <p className="mt-2 text-slate-400">UPI Spend Analyzer & Personal Financial Health Mapper</p>
        <div className="divider" />
      </div>

      <UploadSection onData={setRows} />

      {rows && insights && scoreData && leaks && recs && (
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleSave}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
            >
              Save to Supabase
            </button>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                [
                  ["date", "description", "merchant_clean", "category", "amount", "type", "month"].join(","),
                  ...rows.map((r) =>
                    [r.date, r.description, r.merchant_clean, r.category, r.amount, r.type, r.month].join(",")
                  ),
                ].join("\n")
              )}`}
              download="money_os_export.csv"
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Download CSV
            </a>
          </div>

          <KpiCards
            totalSpend={insights.totalSpend}
            totalIncome={insights.totalIncome}
            savings={insights.savings}
            score={scoreData.score}
            grade={scoreData.grade}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <Charts
                categorySpend={insights.categorySpend}
                categoryPct={insights.categoryPct}
                monthlySpend={insights.monthlySpend}
                monthlyIncome={insights.monthlyIncome}
                monthlyBalance={insights.monthlyBalance}
                rows={rows}
              />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-1">
              <WellnessGauge score={scoreData.score} />
              <div className="glass-card">
                <h4 className="text-sm font-semibold text-cyan-400">Behavior</h4>
                <p className="mt-1 text-sm text-slate-300"><b>Top:</b> {insights.topCategory}</p>
                <p className="mt-1 text-sm text-slate-300"><b>Daily Avg:</b> ₹ {insights.dailyAvg.toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-300"><b>Weekend:</b> ₹ {insights.weekendSpend.toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-300"><b>Late Night:</b> ₹ {insights.nightSpend.toLocaleString()}</p>
              </div>
              <div className="glass-card">
                <h4 className="text-sm font-semibold text-cyan-400">Top Merchants</h4>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  {insights.topMerchants.map(([name, amt]: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span>{name}</span>
                      <span className="font-medium text-slate-100">₹ {amt.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="divider" />
          <h2 className="text-lg font-semibold text-slate-100">Leak Detection</h2>
          <LeakDetection leaks={leaks} />

          <div className="divider" />
          <h2 className="text-lg font-semibold text-slate-100">Recommendations</h2>
          <Recommendations recs={recs} />

          <AnomalyAlerts anomalies={insights.anomalies} />

          <div className="divider" />
          <TransactionTable rows={rows} />
        </div>
      )}
    </main>
  );
}
