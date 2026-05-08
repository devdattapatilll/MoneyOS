import { CATEGORY_KEYWORDS } from "@/lib/categorizer/rules";

export interface Leaks {
  subscriptions: {
    unique: number;
    total: number;
    count: number;
    merchants: string[];
  };
  bnpl: {
    count: number;
    total: number;
  };
  foodDelivery: {
    count: number;
    total: number;
    overuse: boolean;
  };
  shoppingSpikes: {
    spikeCount: number;
    avgMonthly: number;
  };
  recurringPayments: {
    count: number;
    total: number;
    merchants: string[];
  };
}

function countKeywordMatches(desc: string, keywords: string[]): number {
  const d = desc.toLowerCase();
  return keywords.filter((k) => d.includes(k.toLowerCase())).length;
}

export function detectLeaks(rows: any[]): Leaks {
  const debits = rows.filter((r) => r.type === "debit");

  // Subscriptions
  const subs = debits.filter(
    (r) =>
      countKeywordMatches(r.description, CATEGORY_KEYWORDS.Subscription) > 0 ||
      countKeywordMatches(r.merchant_clean || "", CATEGORY_KEYWORDS.Subscription) > 0
  );
  const subMerchants = [...new Set(subs.map((r) => r.merchant_clean).filter(Boolean))];
  const subTotal = subs.reduce((s, r) => s + r.amount, 0);

  // BNPL
  const bnpls = debits.filter(
    (r) =>
      countKeywordMatches(r.description, CATEGORY_KEYWORDS.BNPL) > 0 ||
      countKeywordMatches(r.merchant_clean || "", CATEGORY_KEYWORDS.BNPL) > 0
  );
  const bnplTotal = bnpls.reduce((s, r) => s + r.amount, 0);

  // Food delivery
  const food = debits.filter(
    (r) =>
      countKeywordMatches(r.description, CATEGORY_KEYWORDS.Food) > 0 ||
      countKeywordMatches(r.merchant_clean || "", CATEGORY_KEYWORDS.Food) > 0
  );
  const foodTotal = food.reduce((s, r) => s + r.amount, 0);
  const foodAvg = food.length > 0 ? foodTotal / food.length : 0;
  const foodOveruse = food.length > 15 || foodAvg > 400;

  // Shopping spikes
  const shopping = debits.filter(
    (r) =>
      countKeywordMatches(r.description, CATEGORY_KEYWORDS.Shopping) > 0 ||
      countKeywordMatches(r.merchant_clean || "", CATEGORY_KEYWORDS.Shopping) > 0
  );
  const shoppingTotal = shopping.reduce((s, r) => s + r.amount, 0);
  const shoppingAvg = shopping.length > 0 ? shoppingTotal / shopping.length : 0;
  const spikeCount = shopping.filter((r) => r.amount > shoppingAvg * 2).length;

  // Recurring same-amount payments
  const freq: Record<string, { count: number; amount: number; merchants: string[] }> = {};
  for (const r of debits) {
    const k = `${r.merchant_clean}_${Math.round(r.amount / 100) * 100}`;
    if (!freq[k]) freq[k] = { count: 0, amount: r.amount, merchants: [] };
    freq[k].count += 1;
    if (!freq[k].merchants.includes(r.merchant_clean)) {
      freq[k].merchants.push(r.merchant_clean);
    }
  }
  const recs = Object.values(freq).filter((v) => v.count >= 3);
  const recurringMerchants = recs.flatMap((r) => r.merchants);
  const recurringTotal = recs.reduce((s, r) => s + r.amount * r.count, 0);

  return {
    subscriptions: {
      unique: subMerchants.length,
      total: subTotal,
      count: subs.length,
      merchants: subMerchants.slice(0, 5),
    },
    bnpl: {
      count: bnpls.length,
      total: bnplTotal,
    },
    foodDelivery: {
      count: food.length,
      total: foodTotal,
      overuse: foodOveruse,
    },
    shoppingSpikes: {
      spikeCount,
      avgMonthly: Math.round(shoppingTotal / 3),
    },
    recurringPayments: {
      count: recs.length,
      total: recurringTotal,
      merchants: [...new Set(recurringMerchants)].slice(0, 5),
    },
  };
}
