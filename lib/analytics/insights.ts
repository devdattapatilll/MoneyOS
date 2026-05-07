import { NON_ESSENTIAL } from "@/lib/categorizer/rules";

export function computeInsights(rows: any[]) {
  const debits = rows.filter((r) => r.type === "debit");
  const credits = rows.filter((r) => r.type === "credit");

  const totalSpend = debits.reduce((s, r) => s + r.amount, 0);
  const totalIncome = credits.reduce((s, r) => s + r.amount, 0);
  const savings = totalIncome - totalSpend;

  const catSpend: Record<string, number> = {};
  for (const r of debits) {
    catSpend[r.category] = (catSpend[r.category] || 0) + r.amount;
  }
  const sortedCats = Object.entries(catSpend).sort((a, b) => b[1] - a[1]);
  const catPct: Record<string, number> = {};
  for (const [k, v] of sortedCats) {
    catPct[k] = totalSpend > 0 ? Math.round((v / totalSpend) * 1000) / 10 : 0;
  }

  const monthlySpend: Record<string, number> = {};
  const monthlyIncome: Record<string, number> = {};
  for (const r of rows) {
    const m = r.month;
    if (r.type === "debit") monthlySpend[m] = (monthlySpend[m] || 0) + r.amount;
    else monthlyIncome[m] = (monthlyIncome[m] || 0) + r.amount;
  }
  const months = Object.keys(monthlySpend).sort();
  const monthlyBalance: Record<string, number> = {};
  for (const m of months) {
    monthlyBalance[m] = (monthlyIncome[m] || 0) - monthlySpend[m];
  }

  const topCategory = sortedCats[0]?.[0] || "N/A";
  const weekendSpend = debits.filter((r) => r.is_weekend).reduce((s, r) => s + r.amount, 0);
  const nightSpend = debits.filter((r) => r.is_night).reduce((s, r) => s + r.amount, 0);

  const dates = [...new Set(debits.map((r) => new Date(r.date).toDateString()))];
  const dailyAvg = dates.length > 0 ? Math.round((totalSpend / dates.length) * 100) / 100 : 0;

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
    nightSpend: Math.round(nightSpend * 100) / 100,
    dailyAvg,
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
