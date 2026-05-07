import { CATEGORY_KEYWORDS } from "@/lib/categorizer/rules";

export interface Leak {
  name: string;
  type: "subscription" | "bnpl" | "food_delivery" | "shopping" | "recurring";
  total: number;
  count: number;
  monthly_estimate: number;
  severity: "high" | "medium" | "low";
}

function countKeywordMatches(desc: string, keywords: string[]): number {
  const d = desc.toLowerCase();
  return keywords.filter((k) => d.includes(k.toLowerCase())).length;
}

export function detectLeaks(rows: any[]): Leak[] {
  const debits = rows.filter((r) => r.type === "debit");
  const leaks: Leak[] = [];

  // Subscriptions
  const subs = debits.filter((r) => countKeywordMatches(r.description, CATEGORY_KEYWORDS.Subscription) > 0 || countKeywordMatches(r.merchant_clean || "", CATEGORY_KEYWORDS.Subscription) > 0);
  if (subs.length > 0) {
    const total = subs.reduce((s, r) => s + r.amount, 0);
    leaks.push({
      name: "Subscriptions",
      type: "subscription",
      total,
      count: subs.length,
      monthly_estimate: Math.round(total / 3),
      severity: subs.length > 5 ? "high" : "medium",
    });
  }

  // BNPL
  const bnpls = debits.filter((r) => countKeywordMatches(r.description, CATEGORY_KEYWORDS.BNPL) > 0 || countKeywordMatches(r.merchant_clean || "", CATEGORY_KEYWORDS.BNPL) > 0);
  if (bnpls.length > 0) {
    const total = bnpls.reduce((s, r) => s + r.amount, 0);
    leaks.push({
      name: "BNPL Usage",
      type: "bnpl",
      total,
      count: bnpls.length,
      monthly_estimate: Math.round(total / 3),
      severity: bnpls.length > 3 ? "high" : "medium",
    });
  }

  // Food delivery
  const food = debits.filter((r) => countKeywordMatches(r.description, CATEGORY_KEYWORDS.Food) > 0 || countKeywordMatches(r.merchant_clean || "", CATEGORY_KEYWORDS.Food) > 0);
  if (food.length > 0) {
    const total = food.reduce((s, r) => s + r.amount, 0);
    const avg = total / food.length;
    leaks.push({
      name: "Food Delivery",
      type: "food_delivery",
      total,
      count: food.length,
      monthly_estimate: Math.round(total / 3),
      severity: avg > 300 ? "high" : food.length > 10 ? "medium" : "low",
    });
  }

  // Shopping spikes
  const shopping = debits.filter((r) => countKeywordMatches(r.description, CATEGORY_KEYWORDS.Shopping) > 0 || countKeywordMatches(r.merchant_clean || "", CATEGORY_KEYWORDS.Shopping) > 0);
  if (shopping.length > 0) {
    const total = shopping.reduce((s, r) => s + r.amount, 0);
    const avg = total / shopping.length;
    if (avg > 2000 || shopping.length > 5) {
      leaks.push({
        name: "Shopping Spikes",
        type: "shopping",
        total,
        count: shopping.length,
        monthly_estimate: Math.round(total / 3),
        severity: avg > 5000 ? "high" : "medium",
      });
    }
  }

  // Recurring same-amount payments
  const freq: Record<string, { count: number; amount: number; merchants: string[] }> = {};
  for (const r of debits) {
    const k = `${r.merchant_clean}_${Math.round(r.amount / 100) * 100}`;
    if (!freq[k]) freq[k] = { count: 0, amount: r.amount, merchants: [] };
    freq[k].count += 1;
    if (!freq[k].merchants.includes(r.merchant_clean)) freq[k].merchants.push(r.merchant_clean);
  }
  const recs = Object.values(freq).filter((v) => v.count >= 3);
  for (const r of recs) {
    leaks.push({
      name: `Recurring: ${r.merchants.slice(0, 2).join(", ")}`,
      type: "recurring",
      total: r.amount * r.count,
      count: r.count,
      monthly_estimate: r.amount,
      severity: r.count > 6 ? "high" : "medium",
    });
  }

  return leaks;
}
