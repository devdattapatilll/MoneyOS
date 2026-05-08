"use client";
// Leak detection component for financial insights

import { CreditCard, ShoppingBag, Utensils, Zap } from "lucide-react";

interface Props {
  leaks: any;
}

export default function LeakDetection({ leaks }: Props) {
  if (!leaks) return null;
  const { subscriptions, bnpl, foodDelivery, shoppingSpikes } = leaks;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="glass-card">
        <div className="mb-2 flex items-center gap-2 text-cyan-400">
          <CreditCard className="h-5 w-5" />
          <h4 className="font-semibold">Subscriptions</h4>
        </div>
        <p className="text-2xl font-bold text-slate-100">{subscriptions?.unique ?? 0}</p>
        <p className="text-xs text-slate-400">merchants · ₹ {subscriptions?.total?.toLocaleString() ?? 0}</p>
      </div>

      <div className="glass-card">
        <div className="mb-2 flex items-center gap-2 text-yellow-400">
          <Zap className="h-5 w-5" />
          <h4 className="font-semibold">BNPL Usage</h4>
        </div>
        <p className="text-2xl font-bold text-slate-100">{bnpl?.count ?? 0}</p>
        <p className="text-xs text-slate-400">txns · ₹ {bnpl?.total?.toLocaleString() ?? 0}</p>
      </div>

      <div className="glass-card">
        <div className="mb-2 flex items-center gap-2 text-emerald-400">
          <Utensils className="h-5 w-5" />
          <h4 className="font-semibold">Food Delivery</h4>
        </div>
        <p className="text-2xl font-bold text-slate-100">{foodDelivery?.count ?? 0}</p>
        <p className="text-xs text-slate-400">orders · ₹ {foodDelivery?.total?.toLocaleString() ?? 0}</p>
      </div>

      <div className="glass-card">
        <div className="mb-2 flex items-center gap-2 text-rose-400">
          <ShoppingBag className="h-5 w-5" />
          <h4 className="font-semibold">Shopping Spikes</h4>
        </div>
        <p className="text-2xl font-bold text-slate-100">{shoppingSpikes?.spikeCount ?? 0}</p>
        <p className="text-xs text-slate-400">spike months · avg ₹ {shoppingSpikes?.avgMonthly?.toLocaleString() ?? 0}</p>
      </div>
    </div>
  );
}
