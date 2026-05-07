import { computeInsights } from "./insights";
import { detectLeaks } from "./leakDetector";
import { computeWellnessScore } from "./scoring";

export interface Rec {
  title: string;
  text: string;
  savings: number | null;
  priority: "high" | "medium" | "low";
}

export function generateRecommendations(rows: any[]): Rec[] {
  const recs: Rec[] = [];
  const insights = computeInsights(rows);
  const leaks = detectLeaks(rows);
  const scoreData = computeWellnessScore(rows);
  const debits = rows.filter((r) => r.type === "debit");

  const savingsRatio = scoreData.details.savingsRatio ?? 0;
  if (savingsRatio < 0) {
    recs.push({
      title: "Negative Savings Detected",
      text: `Expenses (${insights.totalSpend.toLocaleString()}) exceed income (${insights.totalIncome.toLocaleString()}).`,
      savings: null,
      priority: "high",
    });
  } else if (savingsRatio < 0.15) {
    recs.push({
      title: "Boost Your Savings",
      text: `Current savings ratio is ${Math.round(savingsRatio * 100)}%. Aim for at least 20%.`,
      savings: Math.round(insights.totalIncome * 0.05),
      priority: "medium",
    });
  } else {
    recs.push({
      title: "Healthy Savings Trend",
      text: `Great job saving ${Math.round(savingsRatio * 100)}% of your income. Keep it up!`,
      savings: null,
      priority: "low",
    });
  }

  const nePct = scoreData.details.nonEssentialPct ?? 0;
  if (nePct > 0.4) {
    recs.push({
      title: "Trim Non-Essential Spending",
      text: `${Math.round(nePct * 100)}% of spending is non-essential. A 15% cut can improve your score.`,
      savings: Math.round(insights.nonEssentialSpend * 0.15),
      priority: "high",
    });
  }

  if (leaks.subscriptions.unique > 3) {
    recs.push({
      title: "Subscription Audit Needed",
      text: `${leaks.subscriptions.unique} recurring subscriptions totaling ${leaks.subscriptions.total.toLocaleString()}.`,
      savings: Math.round(leaks.subscriptions.total * 0.2),
      priority: "medium",
    });
  }

  if (leaks.bnpl.count > 0) {
    recs.push({
      title: "Reduce BNPL Dependency",
      text: `${leaks.bnpl.count} BNPL transactions detected. Consolidate dues to avoid fees.`,
      savings: Math.round(leaks.bnpl.total * 0.1),
      priority: "high",
    });
  }

  if (leaks.foodDelivery.overuse) {
    recs.push({
      title: "Food Delivery Overuse",
      text: `${leaks.foodDelivery.count} food orders. Cooking twice more per week saves money.`,
      savings: Math.round(leaks.foodDelivery.total * 0.2),
      priority: "medium",
    });
  }

  if (insights.weekendSpend > insights.totalSpend * 0.3) {
    recs.push({
      title: "Weekend Spending Spike",
      text: `Weekends account for a large share (${insights.weekendSpend.toLocaleString()}) of total spend.`,
      savings: Math.round(insights.weekendSpend * 0.1),
      priority: "medium",
    });
  }

  if (insights.nightSpend > 5000) {
    recs.push({
      title: "Late-Night Spending",
      text: `${insights.nightSpend.toLocaleString()} spent during late hours. Impulse control helps.`,
      savings: Math.round(insights.nightSpend * 0.15),
      priority: "low",
    });
  }

  if (scoreData.details.negativeMonths > 1) {
    recs.push({
      title: "Deficit Months Alert",
      text: `${scoreData.details.negativeMonths} months had expenses exceeding income. Build a buffer.`,
      savings: null,
      priority: "high",
    });
  }

  if (insights.anomalies.length > 0) {
    recs.push({
      title: "Spending Anomalies Detected",
      text: `${insights.anomalies.length} unusually large transactions found. Review for accuracy.`,
      savings: null,
      priority: "medium",
    });
  }

  recs.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
  return recs.slice(0, 8);
}
