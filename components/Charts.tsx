"use client";
// Charts component for data visualization

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#38bdf8", "#4ade80", "#facc15", "#f87171", "#a78bfa", "#fb923c", "#22d3ee", "#e879f9"];

interface Props {
  categorySpend: [string, number][];
  categoryPct: Record<string, number>;
  monthlySpend: Record<string, number>;
  monthlyIncome: Record<string, number>;
  monthlyBalance: Record<string, number>;
  rows: any[];
}

export default function Charts({ categorySpend, monthlySpend, monthlyIncome, rows }: Props) {
  const pieData = categorySpend.map(([name, value]) => ({ name, value }));
  const months = Object.keys(monthlySpend).sort();
  const trendData = months.map((m) => ({
    month: m,
    spend: monthlySpend[m] || 0,
    income: monthlyIncome[m] || 0,
  }));
  const topCatData = categorySpend.slice(0, 8).map(([name, value]) => ({ name, value }));

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const debits = rows.filter((r) => r.type === "debit");
  const wdSpend: Record<string, number> = {};
  for (const r of debits) {
    const short = weekDays[dayNames.indexOf(r.day_of_week)];
    if (short) wdSpend[short] = (wdSpend[short] || 0) + r.amount;
  }
  const wdData = weekDays.map((d) => ({ day: d, amount: wdSpend[d] || 0 }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="glass-card">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Spend Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(15,23,42,0.8)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Monthly Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey="spend" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Top Categories</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topCatData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
            <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Weekday Analysis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={wdData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
            <Bar dataKey="amount" fill="#4ade80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
