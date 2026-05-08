"use client";
// Leak detection component for financial insights

import { CreditCard, ShoppingBag, Utensils, Zap } from "lucide-react";

interface Props {
  leaks: any;
}

// Helper to safely format numbers
function formatNum(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return value.toLocaleString();
}

export default function LeakDetection({ leaks }: Props) {
  if (!leaks) return null;
  const { subscriptions, bnpl, foodDelivery, shoppingSpikes } = leaks;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="glass-card p-4">
        <div className="mb-3 flex items-center gap-2 text-cyan-400">
          <CreditCard className="h-5 w-5 flex-shrink-0" />
          <h4 className="font-semibold text-sm">Subscriptions</h4>
        </div>
        <p className="text-2xl font-bold text-slate-100">{subscriptions?.unique ?? 0}</p>
        <p className="text-xs text-slate-400 mt-1">
          merchants · ₹{formatNum(subscriptions?.total)}
        </p>
      </div>

      <div className="glass-card p-4">
        <div className="mb-3 flex items-center gap-2 text-yellow-400">
          <Zap className="h-5 w-5 flex-shrink-0" />
          <h4 className="font-semibold text-sm">BNPL Usage</h4>
        </div>
        <p className="text-2xl font-bold text-slate-100">{bnpl?.count ?? 0}</p>
        <p className="text-xs text-slate-400 mt-1">
          txns · ₹{formatNum(bnpl?.total)}
        </p>
      </div>

      <div className="glass-card p-4">
        <div className="mb-3 flex items-center gap-2 text-emerald-400">
          <Utensils className="h-5 w-5 flex-shrink-0" />
          <h4 className="font-semibold text-sm">Food Delivery</h4>
        </div>
        <p className="text-2xl font-bold text-slate-100">{foodDelivery?.count ?? 0}</p>
        <p className="text-xs text-slate-400 mt-1">
          orders · ₹{formatNum(foodDelivery?.total)}
        </p>
      </div>

      <div className="glass-card p-4">
        <div className="mb-3 flex items-center gap-2 text-rose-400">
          <ShoppingBag className="h-5 w-5 flex-shrink-0" />
          <h4 className="font-semibold text-sm">Shopping Spikes</h4>
        </div>
        <p className="text-2xl font-bold text-slate-100">{shoppingSpikes?.spikeCount ?? 0}</p>
        <p className="text-xs text-slate-400 mt-1">
          spikes · avg ₹{formatNum(shoppingSpikes?.avgMonthly)}
        </p>
      </div>
    </div>
  );
}
