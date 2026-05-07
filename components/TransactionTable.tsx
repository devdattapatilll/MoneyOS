"use client";

interface Props {
  rows: any[];
}

export default function TransactionTable({ rows }: Props) {
  const sorted = [...rows].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return (
    <div className="glass-card overflow-auto">
      <h3 className="mb-3 text-sm font-semibold text-slate-300">Transactions</h3>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Description</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Amount</th>
            <th className="py-2">Type</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/40">
              <td className="py-2 pr-4 text-slate-300">{new Date(r.date).toLocaleDateString()}</td>
              <td className="py-2 pr-4 text-slate-300">{r.description}</td>
              <td className="py-2 pr-4">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-cyan-300">{r.category}</span>
              </td>
              <td className="py-2 pr-4 font-medium text-slate-100">₹ {r.amount.toLocaleString()}</td>
              <td className="py-2">
                <span className={`rounded px-2 py-0.5 text-xs ${r.type === "credit" ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>
                  {r.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
