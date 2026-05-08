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
import { processCSV, processPDF, loadSampleData } from "@/app/actions";

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
      const isPDF = file.name.toLowerCase().endsWith('.pdf');
      
      if (!isCSV && !isPDF) {
        throw new Error("Only CSV and PDF files are supported");
      }
      
      let data;
      
      if (isCSV) {
        const text = await file.text();
        data = await processCSV(text);
      } else {
        // PDF: read as ArrayBuffer and convert to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        data = await processPDF(buffer);
      }
      
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
      const isPDF = file.name.toLowerCase().endsWith('.pdf');
      if (isCSV || isPDF) {
        handleFileUpload(file);
      } else {
        setError("Only CSV and PDF files are supported");
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
              
              {error && (
                <div className="w-full max-w-xs flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <label className={`w-full max-w-xs group/btn flex items-center justify-center gap-3 px-6 py-4 bg-cyan-500/5 border border-dashed border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all duration-300 cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#4fd1ed] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-[#4fd1ed]" />
                )}
                <span className="text-[#4fd1ed] font-medium">
                  {isLoading ? 'Processing...' : 'Click to upload CSV / PDF'}
                </span>
                <input
                  type="file"
                  accept=".csv,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
              <button 
                onClick={handleLoadSample}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-[#161b22] border border-gray-700 hover:border-gray-500 text-gray-300 rounded-xl text-sm transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <span className="text-slate-400">Top:</span>
                      <span className="text-slate-200">{insights.topCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Daily Avg:</span>
                      <span className="text-slate-200">₹{insights.dailyAvg.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Weekend:</span>
                      <span className="text-slate-200">₹{insights.weekendSpend.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Late Night:</span>
                      <span className="text-slate-200">₹{insights.nightSpend.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-3">Top Merchants</h4>
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
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Recommendations</h2>
              <Recommendations recs={recs} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
