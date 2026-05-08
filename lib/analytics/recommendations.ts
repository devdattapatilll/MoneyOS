import { computeInsights } from "./insights";
import { detectLeaks } from "./leakDetector";
import { computeWellnessScore } from "./scoring";
import { getScoreLabel } from "./scoreLabel";

export interface Rec {
  title: string;
  text: string;
  savings: number | null;
  priority: "high" | "medium" | "low";
  resource?: {
    label: string;
    url: string;
  };
}

const RESOURCES: Record<string, Rec["resource"]> = {
  bnpl: {
    label: "Read: RBI financial education",
    url: "https://www.rbi.org.in/FinancialEducation/Home.aspx",
  },
  foodDelivery: {
    label: "Watch: practical budgeting ideas",
    url: "https://www.youtube.com/results?search_query=reduce+food+delivery+spending+budget+india",
  },
  subscriptions: {
    label: "Read: subscription audit guide",
    url: "https://www.consumerfinance.gov/about-us/blog/consumer-advisory-stop-unwanted-subscription-charges/",
  },
  shopping: {
    label: "Read: needs vs wants",
    url: "https://www.rbi.org.in/FinancialEducation/Home.aspx",
  },
  safety: {
    label: "Read: UPI safety tips",
    url: "https://www.npci.org.in/what-we-do/upi/upi-safety-shield",
  },
  investing: {
    label: "Read: SEBI mutual fund basics",
    url: "https://investor.sebi.gov.in/understanding_mf.html",
  },
};

function priorityFor(total: number, spend: number): Rec["priority"] {
  const ratio = spend > 0 ? total / spend : 0;
  if (ratio > 0.12) return "high";
  if (ratio > 0.04) return "medium";
  return "low";
}

function withPriorityMix(recs: Rec[], scoreLabel: string): Rec[] {
  const ordered = [...recs].sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority] || (b.savings || 0) - (a.savings || 0);
  });
  const take = (priority: Rec["priority"], count: number) => ordered.filter((rec) => rec.priority === priority).slice(0, count);
  const healthyProfile = scoreLabel === "Excellent" || scoreLabel === "Good" || scoreLabel === "Average";
  const selected = healthyProfile ? [...take("medium", 2), ...take("low", 2)] : [...take("high", 2), ...take("medium", 1), ...take("low", 1)];
  const used = new Set(selected);

  for (const rec of ordered) {
    if (selected.length >= 4) break;
    if (!used.has(rec)) selected.push(rec);
  }

  const target: Rec["priority"][] = healthyProfile ? ["medium", "medium", "low", "low"] : ["high", "high", "medium", "low"];
  return selected.slice(0, 4).map((rec, index) => ({ ...rec, priority: target[index] || rec.priority }));
}

function recommendationForLeak(leak: any, totalSpend: number): Rec {
  const amount = Math.round(leak.total).toLocaleString();
  const base = {
    savings: Math.round(leak.total * 0.12),
    priority: priorityFor(leak.total, totalSpend),
    resource: undefined as Rec["resource"],
  };

  switch (leak.key) {
    case "bnpl":
      return {
        title: "Reduce BNPL Dependency",
        text: `${leak.count} BNPL payments total ₹${amount}. Clear the smallest dues first, then pause new pay-later purchases for one billing cycle.`,
        savings: Math.round(leak.total * 0.15),
        priority: priorityFor(leak.total, totalSpend),
        resource: RESOURCES.bnpl,
      };
    case "foodDelivery":
      return {
        title: "Reduce Food Delivery Spend",
        text: `${leak.count} orders total ₹${amount}. Pick two fixed delivery days and keep quick meals ready for the other nights.`,
        savings: Math.round(leak.total * 0.2),
        priority: priorityFor(leak.total, totalSpend),
        resource: RESOURCES.foodDelivery,
      };
    case "subscriptions":
      return {
        title: "Reduce Unused Subscriptions",
        text: `${leak.count} subscription hits total ₹${amount}. Cancel duplicate OTT or music plans and keep only the one used weekly.`,
        savings: Math.round(leak.total * 0.25),
        priority: priorityFor(leak.total, totalSpend),
        resource: RESOURCES.subscriptions,
      };
    case "shopping":
    case "largeOneOff":
      return {
        title: `Reduce ${leak.title}`,
        text: `${leak.count} entries total ₹${amount}. Use a 24-hour waitlist for cart purchases above ₹1,500 before paying.`,
        ...base,
        resource: RESOURCES.shopping,
      };
    case "transport":
    case "fuel":
      return {
        title: `Reduce ${leak.title}`,
        text: `${leak.count} trips/fills total ₹${amount}. Batch errands and compare cab, metro, and two-wheeler costs for repeat routes.`,
        ...base,
      };
    case "transfers":
      return {
        title: "Review Transfer Outflow",
        text: `${leak.count} transfers total ₹${amount}. Tag family, rent, and reimbursements separately so avoidable transfers stand out.`,
        ...base,
        resource: RESOURCES.safety,
      };
    case "lateNight":
      return {
        title: "Reduce Late-Night Purchases",
        text: `${leak.count} late-night spends total ₹${amount}. Add a next-morning confirmation rule for delivery, shopping, and recharge.`,
        savings: Math.round(leak.total * 0.15),
        priority: priorityFor(leak.total, totalSpend),
        resource: RESOURCES.foodDelivery,
      };
    default:
      return {
        title: `Reduce ${leak.title}`,
        text: `${leak.count} ${leak.unit} total ₹${amount}. Separate needs from repeat convenience spends and reduce the lowest-value repeat item this month.`,
        ...base,
        resource: leak.key === "gaming" || leak.key === "entertainment" ? RESOURCES.shopping : undefined,
      };
  }
}

export function generateRecommendations(rows: any[]): Rec[] {
  const insights = computeInsights(rows);
  const leaks = detectLeaks(rows);
  const scoreData = computeWellnessScore(rows);
  const scoreLabel = getScoreLabel(scoreData.score).label;
  const recs: Rec[] = [];

  for (const leak of leaks.topLeaks || []) {
    recs.push(recommendationForLeak(leak, insights.totalSpend));
  }

  const nonEssential = insights.nonEssentialSpend || 0;
  if (nonEssential > insights.totalSpend * 0.35) {
    recs.push({
      title: "Reduce Flexible Spending",
      text: "Create one weekly allowance for food, shopping, entertainment, and travel. Pause non-essential spends once that weekly allowance is used.",
      savings: Math.round(nonEssential * 0.12),
      priority: "medium",
      resource: RESOURCES.shopping,
    });
  }

  if (insights.nightAvg > insights.dailyAvg * 0.4 && insights.nightAvg > 0) {
    recs.push({
      title: "Reduce Late-Night Purchases",
      text: "Move delivery, shopping, and recharge decisions to daytime. Add a 12-hour wait rule for non-urgent night spends.",
      savings: Math.round(insights.nightSpend * 0.15),
      priority: "low",
      resource: RESOURCES.foodDelivery,
    });
  }

  if (insights.totalIncome > insights.totalSpend && insights.savings > 0) {
    recs.push({
      title: "Automate Savings First",
      text: "Move a fixed amount to savings or investments right after income arrives, before discretionary spending starts.",
      savings: Math.round(insights.savings * 0.1),
      priority: "low",
      resource: RESOURCES.investing,
    });
  }

  return withPriorityMix(recs, scoreLabel);
}
