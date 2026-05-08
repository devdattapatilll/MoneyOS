import { CATEGORY_KEYWORDS } from "@/lib/categorizer/rules";

export interface Leak {
  date: string;
  description: string;
  merchant: string;
  amount: number;
  category?: string;
}

export interface LeakBucket {
  key: string;
  title: string;
  count: number;
  total: number;
  unit: string;
  items: Leak[];
}

export interface Leaks {
  subscriptions: { unique: number; total: number; items: Leak[] };
  bnpl: { count: number; total: number; items: Leak[] };
  foodDelivery: { count: number; total: number; overuse: boolean; items: Leak[] };
  shoppingSpikes: { spikeCount: number; avgMonthly: number; items: Leak[] };
  topLeaks: LeakBucket[];
}

const LEAK_RULES: Array<{ key: string; title: string; unit: string; categories?: string[]; keywords: string[]; minCount?: number; minTotal?: number }> = [
  { key: "subscriptions", title: "Subscriptions", unit: "txns", categories: ["Subscription"], keywords: ["subscription", "membership", "netflix", "spotify", "prime", "hotstar"], minCount: 2 },
  { key: "bnpl", title: "BNPL Usage", unit: "txns", categories: ["BNPL"], keywords: CATEGORY_KEYWORDS.BNPL, minCount: 1 },
  { key: "foodDelivery", title: "Food Delivery", unit: "orders", categories: ["Food Delivery"], keywords: ["swiggy", "zomato", "food delivery"], minCount: 3 },
  { key: "shopping", title: "Shopping", unit: "txns", categories: ["Shopping", "Fashion", "Electronics"], keywords: ["amazon", "flipkart", "myntra", "ajio", "meesho"], minCount: 3 },
  { key: "restaurants", title: "Dining Out", unit: "visits", categories: ["Restaurants"], keywords: ["restaurant", "cafe", "coffee", "pizza", "burger"], minCount: 3 },
  { key: "groceries", title: "Grocery Runs", unit: "txns", categories: ["Groceries"], keywords: ["grocery", "bigbasket", "blinkit", "zepto", "dmart"], minCount: 6 },
  { key: "transport", title: "Cab & Transit", unit: "rides", categories: ["Transport"], keywords: ["uber", "ola", "rapido", "cab", "metro"], minCount: 5 },
  { key: "fuel", title: "Fuel Spend", unit: "fills", categories: ["Fuel"], keywords: ["fuel", "petrol", "diesel", "hpcl", "bpcl"], minCount: 3 },
  { key: "travel", title: "Travel Spend", unit: "txns", categories: ["Travel", "Hotels"], keywords: ["flight", "hotel", "trip", "makemytrip", "goibibo"], minCount: 2 },
  { key: "entertainment", title: "Entertainment", unit: "txns", categories: ["Entertainment"], keywords: ["movie", "pvr", "inox", "bookmyshow", "event"], minCount: 2 },
  { key: "gaming", title: "Gaming", unit: "txns", categories: ["Gaming"], keywords: ["gaming", "steam", "dream11", "rummy", "fantasy"], minCount: 1 },
  { key: "recharge", title: "Recharge", unit: "txns", categories: ["Recharge"], keywords: ["recharge", "airtel", "jio", "vi", "dth"], minCount: 3 },
  { key: "bills", title: "Bills", unit: "bills", categories: ["Bills"], keywords: ["electricity", "water", "gas", "broadband", "bill"], minCount: 2 },
  { key: "rent", title: "Rent & Maintenance", unit: "txns", categories: ["Rent"], keywords: ["rent", "maintenance", "society"], minCount: 1 },
  { key: "healthcare", title: "Healthcare", unit: "txns", categories: ["Healthcare", "Pharmacy"], keywords: ["hospital", "doctor", "pharmacy", "medicine", "diagnostic"], minCount: 2 },
  { key: "insurance", title: "Insurance Premiums", unit: "txns", categories: ["Insurance"], keywords: ["insurance", "premium", "lic", "policy"], minCount: 1 },
  { key: "emi", title: "EMI Load", unit: "payments", categories: ["EMI"], keywords: ["emi", "loan repayment", "bajaj finserv"], minCount: 1 },
  { key: "bankCharges", title: "Bank Charges", unit: "charges", categories: ["Bank Charges"], keywords: ["charge", "fee", "penalty", "bounce"], minCount: 1 },
  { key: "atmCash", title: "Cash Withdrawals", unit: "withdrawals", categories: ["ATM Cash"], keywords: ["atm", "cash withdrawal"], minCount: 2 },
  { key: "transfers", title: "Transfers", unit: "txns", categories: ["Transfer", "Family & Friends"], keywords: ["transfer", "sent to", "p2p", "friend", "family"], minCount: 8 },
  { key: "beauty", title: "Beauty & Salon", unit: "txns", categories: ["Beauty", "Personal Care"], keywords: ["salon", "spa", "beauty", "skincare"], minCount: 2 },
  { key: "fitness", title: "Fitness", unit: "txns", categories: ["Fitness"], keywords: ["gym", "fitness", "cult fit", "yoga"], minCount: 1 },
  { key: "homeServices", title: "Home Services", unit: "txns", categories: ["Home Services"], keywords: ["urban company", "repair", "laundry", "cleaning"], minCount: 2 },
  { key: "education", title: "Education", unit: "txns", categories: ["Education"], keywords: ["school", "tuition", "course", "fees"], minCount: 1 },
  { key: "taxes", title: "Taxes & Fines", unit: "txns", categories: ["Taxes", "Government"], keywords: ["tax", "challan", "fine", "rto"], minCount: 1 },
  { key: "donations", title: "Donations", unit: "txns", categories: ["Donations"], keywords: ["donation", "charity", "temple", "ngo"], minCount: 1 },
  { key: "office", title: "Office & Business", unit: "txns", categories: ["Office & Business"], keywords: ["office", "printing", "courier", "razorpay"], minCount: 2 },
  { key: "kids", title: "Kids & Family", unit: "txns", categories: ["Kids & Family"], keywords: ["kids", "baby", "toys", "firstcry"], minCount: 1 },
  { key: "pets", title: "Pet Care", unit: "txns", categories: ["Pets"], keywords: ["pet", "vet", "pet food"], minCount: 1 },
  { key: "largeOneOff", title: "Large One-Time Purchases", unit: "purchases", keywords: [], minCount: 1 },
  { key: "lateNight", title: "Late-Night Spend", unit: "txns", keywords: [], minCount: 2 },
  { key: "weekend", title: "Weekend Spend", unit: "txns", keywords: [], minCount: 5 },
  { key: "smallFrequent", title: "Frequent Small Spends", unit: "txns", keywords: [], minCount: 10 },
  { key: "misc", title: "Miscellaneous", unit: "txns", categories: ["Miscellaneous"], keywords: [], minCount: 3 },
];

function countKeywordMatches(desc: string, keywords: string[]): number {
  const d = (desc || "").toLowerCase();
  return keywords.filter((k) => d.includes(k.toLowerCase())).length;
}

function toLeak(row: any): Leak {
  return {
    date: row.date,
    description: row.description,
    merchant: row.merchant_clean || row.description,
    amount: row.amount,
    category: row.category,
  };
}

function matchesRule(row: any, rule: (typeof LEAK_RULES)[number], avgAmount: number): boolean {
  if (rule.key === "largeOneOff") return row.amount > avgAmount * 2.5;
  if (rule.key === "lateNight") return Boolean(row.is_night);
  if (rule.key === "weekend") return Boolean(row.is_weekend);
  if (rule.key === "smallFrequent") return row.amount <= 300;

  const categoryMatch = rule.categories?.includes(row.category);
  const keywordMatch =
    countKeywordMatches(row.description || "", rule.keywords) > 0 ||
    countKeywordMatches(row.merchant_clean || "", rule.keywords) > 0;
  return Boolean(categoryMatch || keywordMatch);
}

function buildBucket(rows: any[], rule: (typeof LEAK_RULES)[number], avgAmount: number): LeakBucket | null {
  const items = rows.filter((row) => matchesRule(row, rule, avgAmount));
  const total = items.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  if (items.length < (rule.minCount || 1) || total < (rule.minTotal || 0)) return null;

  return {
    key: rule.key,
    title: rule.title,
    count: items.length,
    total,
    unit: rule.unit,
    items: items.map(toLeak),
  };
}

export function detectLeaks(rows: any[] = []): Leaks {
  const debits = rows.filter((r) => r?.type === "debit");
  const totalDebit = debits.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const avgAmount = debits.length > 0 ? totalDebit / debits.length : 0;
  const buckets = LEAK_RULES.map((rule) => buildBucket(debits, rule, avgAmount)).filter(Boolean) as LeakBucket[];

  const getBucket = (key: string) => buckets.find((bucket) => bucket.key === key);
  const subscriptions = getBucket("subscriptions");
  const bnpl = getBucket("bnpl");
  const foodDelivery = getBucket("foodDelivery");
  const shopping = getBucket("shopping");

  const topLeaks = buckets
    .sort((a, b) => b.total * Math.log2(b.count + 1) - a.total * Math.log2(a.count + 1))
    .slice(0, 4);

  return {
    subscriptions: {
      unique: new Set(subscriptions?.items.map((item) => item.merchant) || []).size,
      total: subscriptions?.total || 0,
      items: subscriptions?.items || [],
    },
    bnpl: {
      count: bnpl?.count || 0,
      total: bnpl?.total || 0,
      items: bnpl?.items || [],
    },
    foodDelivery: {
      count: foodDelivery?.count || 0,
      total: foodDelivery?.total || 0,
      overuse: (foodDelivery?.count || 0) > 15 || (foodDelivery?.total || 0) / Math.max(foodDelivery?.count || 1, 1) > 400,
      items: foodDelivery?.items || [],
    },
    shoppingSpikes: {
      spikeCount: shopping?.count || 0,
      avgMonthly: shopping?.total || 0,
      items: shopping?.items || [],
    },
    topLeaks,
  };
}
