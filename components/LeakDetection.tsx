"use client";
// Leak detection component for financial insights

import {
  AlertTriangle,
  Baby,
  Banknote,
  Briefcase,
  Car,
  Clapperboard,
  CreditCard,
  Dumbbell,
  Fuel,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home,
  IndianRupee,
  Landmark,
  PawPrint,
  Plane,
  PlugZap,
  ReceiptText,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Utensils,
  WalletCards,
  Wrench,
  Zap,
} from "lucide-react";

interface Props {
  leaks: any;
}

const ICON_BY_KEY: Record<string, any> = {
  subscriptions: CreditCard,
  bnpl: WalletCards,
  foodDelivery: Utensils,
  shopping: ShoppingBag,
  restaurants: Utensils,
  groceries: ShoppingBag,
  transport: Car,
  fuel: Fuel,
  travel: Plane,
  entertainment: Clapperboard,
  gaming: Gamepad2,
  recharge: Smartphone,
  bills: ReceiptText,
  rent: Home,
  healthcare: HeartPulse,
  insurance: ShieldCheck,
  emi: CreditCard,
  bankCharges: Landmark,
  atmCash: Banknote,
  transfers: IndianRupee,
  beauty: Scissors,
  fitness: Dumbbell,
  homeServices: Wrench,
  education: GraduationCap,
  taxes: Landmark,
  donations: HeartPulse,
  office: Briefcase,
  kids: Baby,
  pets: PawPrint,
  largeOneOff: AlertTriangle,
  lateNight: Zap,
  weekend: PlugZap,
  smallFrequent: ReceiptText,
  misc: TrendingUp,
};
const COLORS = ["text-cyan-400", "text-yellow-400", "text-emerald-400", "text-rose-400", "text-violet-400", "text-orange-400"];

function formatNum(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return Math.round(value).toLocaleString();
}

export default function LeakDetection({ leaks }: Props) {
  if (!leaks) return null;

  const topLeaks =
    leaks.topLeaks?.length > 0
      ? leaks.topLeaks
      : [
          { title: "Subscriptions", count: leaks.subscriptions?.unique ?? 0, total: leaks.subscriptions?.total ?? 0, unit: "merchants" },
          { title: "BNPL Usage", count: leaks.bnpl?.count ?? 0, total: leaks.bnpl?.total ?? 0, unit: "txns" },
          { title: "Food Delivery", count: leaks.foodDelivery?.count ?? 0, total: leaks.foodDelivery?.total ?? 0, unit: "orders" },
          { title: "Shopping Spikes", count: leaks.shoppingSpikes?.spikeCount ?? 0, total: leaks.shoppingSpikes?.avgMonthly ?? 0, unit: "spikes" },
        ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {topLeaks.slice(0, 4).map((leak: any, index: number) => {
        const Icon = ICON_BY_KEY[leak.key] || TrendingUp;
        const color = COLORS[index % COLORS.length];
        return (
          <div key={leak.key || leak.title} className="glass-card p-4">
            <div className={`mb-3 flex items-center gap-2 ${color}`}>
              <Icon className="h-5 w-5 flex-shrink-0" />
              <h4 className="font-semibold text-sm">{leak.title}</h4>
            </div>
            <p className="text-2xl font-bold text-slate-100">{leak.count ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">
              {leak.unit || "txns"} · ₹{formatNum(leak.total)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
