import { NON_ESSENTIAL } from "@/lib/categorizer/rules";

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthRange(rows: any[]): string[] {
  const validMonths = rows
    .map((row) => {
      const date = new Date(row.date);
      if (Number.isNaN(date.getTime())) return null;
      return monthKey(date);
    })
    .filter(Boolean) as string[];

  if (validMonths.length === 0) return [];

  const sortedMonths = validMonths.sort();
  const start = sortedMonths[0];
  const endMonthKey = sortedMonths[sortedMonths.length - 1];
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = endMonthKey.split("-").map(Number);
  const cursor = new Date(startYear, startMonth - 1, 1);
  const end = new Date(endYear, endMonth - 1, 1);
  const months: string[] = [];

  while (cursor <= end) {
    months.push(monthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

export function computeInsights(rows: any[]) {
  const debits = rows.filter((r) => r.type === "debit");
  const credits = rows.filter((r) => r.type === "credit");

  const totalSpend = debits.reduce((s, r) => s + r.amount, 0);
  const totalIncome = credits.reduce((s, r) => s + r.amount, 0);
  const savings = totalIncome - totalSpend;

  const catSpend: Record<string, number> = {};
  for (const r of debits) {
    const category = r.category || "Miscellaneous";
    catSpend[category] = (catSpend[category] || 0) + r.amount;
  }
  const sortedCats = Object.entries(catSpend).sort((a, b) => b[1] - a[1]);
  const catPct: Record<string, number> = {};
  for (const [k, v] of sortedCats) {
    catPct[k] = totalSpend > 0 ? Math.round((v / totalSpend) * 1000) / 10 : 0;
  }

  const monthlySpend: Record<string, number> = {};
  const monthlyIncome: Record<string, number> = {};
  for (const r of rows) {
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) continue;
    const m = monthKey(d);
    if (r.type === "debit") monthlySpend[m] = (monthlySpend[m] || 0) + r.amount;
    else monthlyIncome[m] = (monthlyIncome[m] || 0) + r.amount;
  }
  const months = buildMonthRange(rows);
  const monthlyBalance: Record<string, number> = {};
  for (const m of months) {
    monthlySpend[m] = monthlySpend[m] || 0;
    monthlyIncome[m] = monthlyIncome[m] || 0;
    monthlyBalance[m] = (monthlyIncome[m] || 0) - monthlySpend[m];
  }

  const topCategory = sortedCats[0]?.[0] || "N/A";
  const weekendDebits = debits.filter((r) => r.is_weekend);
  const weekdayDebits = debits.filter((r) => !r.is_weekend);
  const nightDebits = debits.filter((r) => r.is_night);
  const weekendSpend = weekendDebits.reduce((s, r) => s + r.amount, 0);
  const weekdaySpend = weekdayDebits.reduce((s, r) => s + r.amount, 0);
  const nightSpend = nightDebits.reduce((s, r) => s + r.amount, 0);

  const dates = [...new Set(debits.map((r) => new Date(r.date).toDateString()))];
  const dailyAvg = dates.length > 0 ? Math.round((totalSpend / dates.length) * 100) / 100 : 0;
  const weekendDates = [...new Set(weekendDebits.map((r) => new Date(r.date).toDateString()))];
  const weekdayDates = [...new Set(weekdayDebits.map((r) => new Date(r.date).toDateString()))];
  const nightDates = [...new Set(nightDebits.map((r) => new Date(r.date).toDateString()))];
  const weekendAvg = weekendDates.length > 0 ? Math.round((weekendSpend / weekendDates.length) * 100) / 100 : 0;
  const weekdayAvg = weekdayDates.length > 0 ? Math.round((weekdaySpend / weekdayDates.length) * 100) / 100 : 0;
  const nightAvg = nightDates.length > 0 ? Math.round((nightSpend / nightDates.length) * 100) / 100 : 0;

  const nonEssential = debits.filter((r) => NON_ESSENTIAL.has(r.category)).reduce((s, r) => s + r.amount, 0);
  const nonEssentialPct = totalSpend > 0 ? Math.round((nonEssential / totalSpend) * 1000) / 10 : 0;

  const merchSpend: Record<string, number> = {};
  for (const r of debits) {
    merchSpend[r.merchant_clean] = (merchSpend[r.merchant_clean] || 0) + r.amount;
  }
  const topMerchants = Object.entries(merchSpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const anomalies = detectAnomalies(debits);

  return {
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    categorySpend: sortedCats,
    categoryPct: catPct,
    monthlySpend,
    monthlyIncome,
    monthlyBalance,
    topCategory,
    weekendSpend: Math.round(weekendSpend * 100) / 100,
    weekdaySpend: Math.round(weekdaySpend * 100) / 100,
    nightSpend: Math.round(nightSpend * 100) / 100,
    dailyAvg,
    weekendAvg,
    weekdayAvg,
    nightAvg,
    nonEssentialSpend: Math.round(nonEssential * 100) / 100,
    nonEssentialPct,
    topMerchants,
    anomalies,
  };
}

function detectAnomalies(debits: any[]) {
  if (debits.length === 0) return [];
  const stats: Record<string, { mean: number; std: number; threshold: number }> = {};
  const byCat: Record<string, number[]> = {};
  for (const r of debits) {
    byCat[r.category] = byCat[r.category] || [];
    byCat[r.category].push(r.amount);
  }
  for (const [cat, arr] of Object.entries(byCat)) {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    const std = Math.sqrt(variance);
    stats[cat] = { mean, std, threshold: mean + 2.5 * std };
  }
  const out = debits
    .filter((r) => r.amount > (stats[r.category]?.threshold ?? Infinity))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
  return out.map((r) => ({
    date: r.date,
    description: r.description,
    category: r.category,
    amount: r.amount,
  }));
}
