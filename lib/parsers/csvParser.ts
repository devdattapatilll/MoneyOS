import Papa from "papaparse";
import { normalizeDate, parseAmount, detectTransactionType, sanitizeText } from "@/lib/helpers";

export interface RawTransaction {
  date: string;
  description: string;
  amount: number;
  type: string;
  [key: string]: any;
}

export function parseCSV(csvText: string): RawTransaction[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (!parsed.data || parsed.data.length === 0) {
    throw new Error("CSV is empty or malformed.");
  }

  const cols = Object.keys(parsed.data[0]).map((c) => c.toLowerCase().trim().replace(/\s+/g, " "));

  const findCol = (alts: string[]) =>
    cols.find((c) => alts.some((a) => c.includes(a)));

  const dateCol = findCol(["date", "txn date", "value date", "dates"]);
  const descCol = findCol(["description", "narration", "particulars", "details", "remarks", "transaction details", "merchant"]);
  const amtCol = findCol(["amount", "txn amount", "transaction amount", "debit", "credit", "withdrawal", "deposit"]);
  const typeCol = findCol(["type", "dr/cr", "debit/credit", "txn type", "transaction type"]);

  if (!dateCol || !descCol || !amtCol) {
    throw new Error(`Missing required columns. Detected: ${cols.join(", ")}`);
  }

  const rows: RawTransaction[] = [];
  for (const r of parsed.data) {
    const d = normalizeDate(r[dateCol]);
    const a = parseAmount(r[amtCol]);
    if (!d || a == null) continue;
    let ttype = typeCol ? r[typeCol]?.toLowerCase()?.trim() || "" : "";
    if (!ttype) {
      ttype = detectTransactionType(r);
    } else {
      ttype = /cr|credit|deposit/.test(ttype) ? "credit" : "debit";
    }
    rows.push({
      date: d.toISOString(),
      description: sanitizeText(r[descCol] || ""),
      amount: a,
      type: ttype,
      ...r,
    });
  }

  if (rows.length === 0) {
    throw new Error("No valid transactions found in CSV.");
  }
  return rows;
}
