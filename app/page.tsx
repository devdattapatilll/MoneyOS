"use client";

import { useState, useMemo } from "react";
import { Upload, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import KpiCards from "@/components/KpiCards";
import Charts from "@/components/Charts";
import LeakDetection from "@/components/LeakDetection";
import Recommendations from "@/components/Recommendations";
import WellnessGauge from "@/components/WellnessGauge";
import { computeInsights } from "@/lib/analytics/insights";
import { computeWellnessScore } from "@/lib/analytics/scoring";
import { detectLeaks } from "@/lib/analytics/leakDetector";
import { generateRecommendations } from "@/lib/analytics/recommendations";
import { processCSV, loadSampleData } from "@/app/actions";

export default function Home() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const insights = useMemo(() => (rows ? computeInsights(rows) : null), [rows]);
  const scoreData = useMemo(() => (rows ? computeWellnessScore(rows) : null), [rows]);
  const leaks = useMemo(() => (rows ? detectLeaks(rows) : null), [rows]);
  const recs = useMemo(() => (rows ? generateRecommendations(rows) : null), [rows]);

  async function handleFileUpload(file: File) {
    setError(null);
    setIsLoading(true);
    
    try {
      const isCSV = file.name.toLowerCase().endsWith('.csv');
      
      if (!isCSV) {
        throw new Error("Only CSV files are supported");
      }
      
      const text = await file.text();
      const data = await processCSV(text);
      
      if (!data || data.length === 0) {
        throw new Error("No valid transactions found in the file");
      }
      
      setRows(data);
    } catch (err: any) {
      console.error("File upload error:", err);
      setError(err.message || "Failed to process file");
    } finally {
      setIsLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const isCSV = file.name.toLowerCase().endsWith('.csv');
      if (isCSV) {
        handleFileUpload(file);
      } else {
        setError("Only CSV files are supported");
      }
    }
  }

  async function handleLoadSample() {
    setError(null);
    setIsLoading(true);
    try {
      const data = await loadSampleData();
      setRows(data);
    } catch (err: any) {
      setError(err.message || "Failed to load sample data");
    } finally {
      setIsLoading(false);
    }
  }

  function resetData() {
    setRows(null);
    setError(null);
  }

  // Landing Page View
  if (!rows) {
    return (
      <div
        className="relative min-h-screen overflow-hidden bg-[#05070a] flex items-center justify-center p-6 font-sans"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_42%,rgba(39,196,166,0.10),transparent_30%),radial-gradient(circle_at_50%_45%,rgba(38,124,164,0.08),transparent_34%),linear-gradient(180deg,#080d15_0%,#05070a_70%)]" />
        <div className="relative w-full max-w-7xl">
          <div className="absolute -inset-8 rounded-[2rem] bg-[radial-gradient(circle_at_18%_50%,rgba(64,255,203,0.20),transparent_32%),linear-gradient(90deg,rgba(65,222,186,0.14),rgba(75,180,236,0.11),rgba(42,80,160,0.07))] blur-3xl opacity-70 transition duration-1000"></div>
          <div className={`relative flex w-full min-h-[500px] flex-col items-stretch overflow-hidden rounded-[22px] border bg-[#0d121b]/92 shadow-[0_0_70px_rgba(49,173,220,0.18)] backdrop-blur md:flex-row ${isDragging ? "border-cyan-300/60" : "border-cyan-300/40"}`}>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[48%] bg-[radial-gradient(circle_at_8%_48%,rgba(99,255,204,0.20),rgba(45,178,172,0.11)_34%,transparent_72%)]"></div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(85,255,207,0.08),rgba(26,111,146,0.06)_38%,rgba(21,24,47,0.13)_72%)]"></div>

            <div className="relative flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 md:px-16 lg:px-20">
              <span className="text-[13px] font-bold uppercase tracking-[0.24em] text-slate-400/80">
                Personal Finance Tracker
              </span>
              <h1 className="mt-[2mm] text-5xl font-bold tracking-normal text-white sm:text-6xl lg:text-7xl">
                Money<span className="text-[#5fe8ee] drop-shadow-[0_0_24px_rgba(95,232,238,0.45)]">OS</span>
              </h1>
              <p className="mt-[5mm] max-w-2xl text-base italic font-semibold leading-relaxed text-white/80 sm:text-lg">
                UPI Spend Analyser and Financial Health Tracker.
              </p>
            </div>
            <div className="relative hidden w-[1px] bg-gradient-to-b from-transparent via-slate-500/35 to-transparent my-12 md:block"></div>
            <div className="relative flex flex-1 flex-col items-center justify-center space-y-7 px-8 py-12 text-center sm:px-12 md:px-16 lg:px-20">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-white">Upload Statement</h2>
                <p className="text-base text-slate-400">
                  Drop in a CSV statement to build your dashboard.
                </p>
              </div>
              
              {error && (
                <div className="w-full max-w-md flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <label className={`w-full max-w-xl group/btn flex items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-5 text-lg transition-all duration-300 cursor-pointer ${isDragging ? "border-cyan-300 bg-cyan-400/12" : "border-cyan-400/35 bg-cyan-500/5 hover:border-cyan-300 hover:bg-cyan-500/10"} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#4fd1ed] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-[#4fd1ed]" />
                )}
                <span className="text-[#5fe8ee] font-semibold">
                  {isLoading ? 'Processing...' : 'Click to upload CSV'}
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
              <button 
                onClick={handleLoadSample}
                disabled={isLoading}
                className="flex items-center gap-3 rounded-xl border border-slate-500/60 bg-[#151b25]/80 px-7 py-3 text-base font-semibold text-slate-200 shadow-inner transition-all hover:border-cyan-300/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex items-center gap-2 rounded-lg border border-sky-300/50 bg-sky-400/10 px-3 py-2 font-bold text-sky-200 transition hover:border-sky-200 hover:bg-sky-400/20 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-white">Money<span className="text-cyan-400">OS</span> Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
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
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {insights && scoreData && leaks && recs && (
          <div className="flex flex-col gap-6">
            {/* KPI Cards */}
            <KpiCards
              totalSpend={insights.totalSpend}
              totalIncome={insights.totalIncome}
              savings={insights.savings}
              score={scoreData.score}
              grade={scoreData.grade}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Charts Section - Takes 3 columns */}
              <div className="xl:col-span-3">
                <Charts
                  categorySpend={insights.categorySpend}
                  categoryPct={insights.categoryPct}
                  monthlySpend={insights.monthlySpend}
                  monthlyIncome={insights.monthlyIncome}
                  monthlyBalance={insights.monthlyBalance}
                  rows={rows}
                />
              </div>

              {/* Sidebar - Takes 1 column */}
              <div className="xl:col-span-1 flex flex-col gap-4">
                <WellnessGauge score={scoreData.score} />
                
                <div className="glass-card">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-3">Behavior</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Daily Avg:</span>
                      <span className="text-slate-200">₹{insights.dailyAvg.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Weekday Avg:</span>
                      <span className="text-slate-200">₹{insights.weekdayAvg.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Weekend Avg:</span>
                      <span className="text-slate-200">₹{insights.weekendAvg.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Late Night Avg:</span>
                      <span className="text-slate-200">₹{insights.nightAvg.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-3">Top Merchants / Services</h4>
                  <ul className="space-y-2 text-sm">
                    {insights.topMerchants.slice(0, 5).map(([name, amt]: any, i: number) => (
                      <li key={i} className="flex justify-between items-center">
                        <span className="text-slate-300 truncate max-w-[120px]" title={name}>{name}</span>
                        <span className="font-medium text-slate-100 text-right">₹{Number(amt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Leak Detection */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Leak Detection</h2>
              <LeakDetection leaks={leaks} />
            </div>

            {/* Recommendations */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Personalized Recommendations</h2>
              <Recommendations recs={recs} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
