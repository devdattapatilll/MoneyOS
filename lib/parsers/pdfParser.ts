"use server";

import pdfParse from "pdf-parse";
import { normalizeDate, parseAmount, sanitizeText } from "@/lib/helpers";

export interface RawTransaction {
  date: string;
  description: string;
  amount: number;
  type: string;
}

export async function parsePDF(buffer: Buffer): Promise<RawTransaction[]> {
  const data = await pdfParse(buffer);
  const lines = data.text.split(/\r?\n/);
  const rows: RawTransaction[] = [];
  for (const line of lines) {
    const dateMatch = line.match(/(\d{1,2}[\/-][A-Za-z]{3}[\/-]\d{2,4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/);
    const amountMatch = line.match(/([\d,]+\.\d{2})/);
    if (dateMatch && amountMatch) {
      const d = normalizeDate(dateMatch[1]);
      const a = parseAmount(amountMatch[1]);
      if (d && a) {
        const low = line.toLowerCase();
        const ttype = /cr|credit|deposit|salary/.test(low) ? "credit" : "debit";
        rows.push({
          date: d.toISOString(),
          description: sanitizeText(line),
          amount: a,
          type: ttype,
        });
      }
    }
  }
  if (rows.length === 0) {
    throw new Error("Could not extract transactions from PDF. Try a CSV export.");
  }
  return rows;
}
