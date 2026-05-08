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

const COLORS = ["#38bdf8", "#4ade80", "#facc15", "#f87171", "#a78bfa", "#fb923c", "#22d3ee", "#e879f9", "#34d399", "#f472b6"];

interface Props {
  categorySpend: [string, number][];
  categoryPct: Record<string, number>;
  monthlySpend: Record<string, number>;
  monthlyIncome: Record<string, number>;
  monthlyBalance: Record<string, number>;
  rows: any[];
}

function topWithMiscellaneous(categories: [string, number][], limit: number): [string, number][] {
  const valid = categories.filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]);
  const miscTotal = valid
    .filter(([name], index) => index >= limit - 1 || name === "Miscellaneous")
    .reduce((sum, [, value]) => sum + value, 0);
  const top = valid.filter(([name]) => name !== "Miscellaneous").slice(0, limit - 1);
  return miscTotal > 0 ? [...top, ["Miscellaneous", miscTotal]] : top.slice(0, limit);
}

function roundedAxisMax(value: number): number {
  if (value <= 0) return 100000;
  if (value >= 900000) return Math.ceil(value / 100000) * 100000;
  if (value <= 150000) return Math.ceil(value / 50000) * 50000;
  return Math.ceil(value / 100000) * 100000;
}

export default function Charts({ categorySpend, monthlySpend, monthlyIncome, rows }: Props) {
  const pieData = topWithMiscellaneous(categorySpend, 15).map(([name, value]) => ({ name, value }));
  
  const months = Object.keys(monthlySpend).sort();
  const trendData = months.map((m) => ({
    month: m,
    spend: monthlySpend[m] || 0,
    income: monthlyIncome[m] || 0,
  }));
  const trendAxisMax = roundedAxisMax(Math.max(...trendData.flatMap((item) => [item.spend, item.income]), 0));
  
  const topCatData = topWithMiscellaneous(categorySpend, 10).map(([name, value]) => ({ name, value }));
  const topCategoryAxisMax = roundedAxisMax(Math.max(...topCatData.map((item) => item.value), 0));

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const debits = rows.filter((r) => r.type === "debit");
  const wdSpend: Record<string, number> = {};
  for (const r of debits) {
    const short = weekDays[dayNames.indexOf(r.day_of_week)];
    if (short) wdSpend[short] = (wdSpend[short] || 0) + r.amount;
  }
  const wdData = weekDays.map((d) => ({ day: d, amount: wdSpend[d] || 0 }));
  const weekdayAxisMax = roundedAxisMax(Math.max(...wdData.map((item) => item.amount), 0));

  // Custom tooltip for better formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-200 font-medium">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ₹{Number(entry.value).toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Pie Chart - Spend Breakdown */}
      <div className="glass-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">Spend Breakdown</h3>
        <div className="h-[280px]">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={85}
                  innerRadius={55}
                  paddingAngle={2}
                >
                  {pieData.map((entry, i) => (
                    <Cell 
                      key={`cell-${i}`} 
                      fill={COLORS[i % COLORS.length]} 
                      stroke="rgba(15,23,42,0.8)" 
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ 
                    fontSize: '10px',
                    paddingTop: '10px',
                  }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '10px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No spending data available
            </div>
          )}
        </div>
      </div>

      {/* Line Chart - Monthly Trend */}
      <div className="glass-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">Monthly Trend</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                domain={[0, trendAxisMax]}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="line" formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>} />
              <Line 
                type="monotone" 
                dataKey="spend" 
                name="Spend" 
                stroke="#38bdf8" 
                strokeWidth={2.5} 
                dot={{ r: 4, strokeWidth: 2, fill: "#0f172a" }} 
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Income" 
                stroke="#4ade80" 
                strokeWidth={2.5} 
                dot={{ r: 4, strokeWidth: 2, fill: "#0f172a" }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Top Categories */}
      <div className="glass-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">Top Categories</h3>
        <div className="h-[280px]">
          {topCatData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCatData} margin={{ top: 5, right: 20, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  tick={{ fontSize: 11 }} 
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fontSize: 11 }} 
                  tickLine={false}
                  domain={[0, topCategoryAxisMax]}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Amount" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart - Weekday Analysis */}
      <div className="glass-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">Weekday Analysis</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wdData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis 
                dataKey="day" 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                domain={[0, weekdayAxisMax]}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" name="Spend" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
