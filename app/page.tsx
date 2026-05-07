"use client";

import { useState, useMemo } from "react";
import { Upload, FileText, ArrowLeft } from "lucide-react";
import KpiCards from "@/components/KpiCards";
import Charts from "@/components/Charts";
import LeakDetection from "@/components/LeakDetection";
import Recommendations from "@/components/Recommendations";
import WellnessGauge from "@/components/WellnessGauge";
import AnomalyAlerts from "@/components/AnomalyAlerts";
import { computeInsights } from "@/lib/analytics/insights";
import { computeWellnessScore } from "@/lib/analytics/scoring";
import { detectLeaks } from "@/lib/analytics/leakDetector";
import { generateRecommendations } from "@/lib/analytics/recommendations";
import { processCSV, loadSampleData } from "@/app/actions";

export default function Home() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const insights = useMemo(() => (rows ? computeInsights(rows) : null), [rows]);
  const scoreData = useMemo(() => (rows ? computeWellnessScore(rows) : null), [rows]);
  const leaks = useMemo(() => (rows ? detectLeaks(rows) : null), [rows]);
  const recs = useMemo(() => (rows ? generateRecommendations(rows) : null), [rows]);

  async function handleFileUpload(file: File) {
    const text = await file.text();
    const data = await processCSV(text);
    setRows(data);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.pdf'))) {
      handleFileUpload(file);
    }
  }

  async function handleLoadSample() {
    const data = await loadSampleData();
    setRows(data);
  }

  function resetData() {
    setRows(null);
  }

  // Landing Page View
  if (!rows) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 font-sans">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
          <div className="relative flex flex-col md:flex-row items-stretch bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-5xl min-h-[400px] overflow-hidden shadow-2xl">
            <div className="flex-1 p-12 flex flex-col justify-center space-y-4">
              <span className="text-[10px] tracking-[0.2em] font-bold text-gray-500 uppercase">
                Personal Finance Analyzer
              </span>
              <h1 className="text-6xl font-bold tracking-tight text-white">
                Money <span className="text-[#4fd1ed]">OS</span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
                Your AI-Powered Financial Health Mapper for UPI Spending & Financial Wellness
              </p>
            </div>
            <div className="hidden md:block w-[1px] bg-gradient-to-b from-transparent via-gray-700 to-transparent my-12"></div>
            <div className="flex-1 p-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Upload Statement</h2>
                <p className="text-gray-500 text-sm">
                  Drop in a CSV or PDF statement to build your dashboard.
                </p>
              </div>
              <label className="w-full max-w-xs group/btn flex items-center justify-center gap-3 px-6 py-4 bg-cyan-500/5 border border-dashed border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all duration-300 cursor-pointer">
                <Upload className="w-5 h-5 text-[#4fd1ed]" />
                <span className="text-[#4fd1ed] font-medium">Click to upload CSV / PDF</span>
                <input
                  type="file"
                  accept=".csv,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <button 
                onClick={handleLoadSample}
                className="flex items-center gap-2 px-6 py-3 bg-[#161b22] border border-gray-700 hover:border-gray-500 text-gray-300 rounded-xl text-sm transition-all shadow-inner"
              >
                <FileText className="w-4 h-4" />
                Load Sample CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <main className="min-h-screen bg-[#0a0f1c]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={resetData}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-white">Money <span className="text-cyan-400">OS</span> Dashboard</h1>
          </div>
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
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            Download CSV
          </a>
        </div>

        {insights && scoreData && leaks && recs && (
          <div className="flex flex-col gap-6">
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
          </div>
        )}
      </div>
    </main>
  );
}
