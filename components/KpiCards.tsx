"use client";

import { ArrowDown, ArrowUp, PiggyBank, Activity } from "lucide-react";

interface Props {
  totalSpend: number;
  totalIncome: number;
  savings: number;
  score: number;
  grade: string;
}

export default function KpiCards({ totalSpend, totalIncome, savings, score, grade }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="glass-card flex items-center gap-4">
        <div className="rounded-full bg-red-500/20 p-3 text-red-400">
          <ArrowDown className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Total Spend</p>
          <p className="text-lg font-bold text-slate-100">₹ {totalSpend.toLocaleString()}</p>
        </div>
      </div>
      <div className="glass-card flex items-center gap-4">
        <div className="rounded-full bg-emerald-500/20 p-3 text-emerald-400">
          <ArrowUp className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Total Income</p>
          <p className="text-lg font-bold text-slate-100">₹ {totalIncome.toLocaleString()}</p>
        </div>
      </div>
      <div className="glass-card flex items-center gap-4">
        <div className="rounded-full bg-blue-500/20 p-3 text-blue-400">
          <PiggyBank className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Net Savings</p>
          <p className="text-lg font-bold text-slate-100">₹ {savings.toLocaleString()}</p>
        </div>
      </div>
      <div className="glass-card flex items-center gap-4">
        <div className="rounded-full bg-cyan-500/20 p-3 text-cyan-400">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Wellness Score</p>
          <p className="text-lg font-bold text-slate-100">{score}/100 <span className="text-sm font-normal text-slate-400">({grade})</span></p>
        </div>
      </div>
    </div>
  );
}
