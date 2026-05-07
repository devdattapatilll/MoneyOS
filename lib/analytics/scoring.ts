import { NON_ESSENTIAL } from "@/lib/categorizer/rules";

export function computeWellnessScore(rows: any[]) {
  const debits = rows.filter((r) => r.type === "debit");
  const credits = rows.filter((r) => r.type === "credit");
  const totalIncome = credits.reduce((s, r) => s + r.amount, 0);
  const totalSpend = debits.reduce((s, r) => s + r.amount, 0);

  let score = 50;
  const details: Record<string, any> = {};

  const savingsRatio = totalIncome > 0 ? (totalIncome - totalSpend) / totalIncome : -1;
  details.savingsRatio = Math.round(savingsRatio * 100) / 100;
  if (savingsRatio >= 0.3) score += 20;
  else if (savingsRatio >= 0.15) score += 10;
  else if (savingsRatio >= 0) score += 0;
  else score -= 15;

  const nonEssential = debits.filter((r) => NON_ESSENTIAL.has(r.category)).reduce((s, r) => s + r.amount, 0);
  const nePct = totalSpend > 0 ? nonEssential / totalSpend : 0;
  details.nonEssentialPct = Math.round(nePct * 100) / 100;
  if (nePct <= 0.25) score += 15;
  else if (nePct <= 0.4) score += 5;
  else score -= 10;

  const subRows = debits.filter((r) => r.category === "Subscription");
  const subCount = new Set(subRows.map((r) => r.merchant_clean)).size;
  details.subscriptionCount = subCount;
  if (subCount <= 2) score += 10;
  else if (subCount <= 4) score += 5;
  else score -= 5 * (subCount - 4);

  const bnplRows = debits.filter((r) => r.category === "BNPL");
  const bnplCount = bnplRows.length;
  details.bnplCount = bnplCount;
  if (bnplCount === 0) score += 5;
  else score -= Math.min(10, bnplCount * 2);

  const monthlySpend: Record<string, number> = {};
  const monthlyIncome: Record<string, number> = {};
  for (const r of rows) {
    const m = r.month;
    if (r.type === "debit") monthlySpend[m] = (monthlySpend[m] || 0) + r.amount;
    else monthlyIncome[m] = (monthlyIncome[m] || 0) + r.amount;
  }
  let negativeMonths = 0;
  for (const m of Object.keys(monthlySpend)) {
    if ((monthlyIncome[m] || 0) - monthlySpend[m] < 0) negativeMonths++;
  }
  details.negativeMonths = negativeMonths;
  if (negativeMonths === 0) score += 10;
  else if (negativeMonths <= 1) score += 5;
  else score -= 5 * negativeMonths;

  score = Math.max(0, Math.min(100, score));

  let grade = "Risky";
  if (score >= 80) grade = "Excellent";
  else if (score >= 60) grade = "Good";
  else if (score >= 40) grade = "Moderate";

  return {
    score: Math.round(score * 10) / 10,
    grade,
    details,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalSpend: Math.round(totalSpend * 100) / 100,
  };
}
