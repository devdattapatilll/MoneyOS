"use server";

import fs from "fs";
import path from "path";
import { parseCSV } from "@/lib/parsers/csvParser";
import { parsePDF } from "@/lib/parsers/pdfParser";
import { cleanDataframe } from "@/lib/cleaner";
import { categorizeTransactions } from "@/lib/categorizer/engine";
import { supabase } from "@/lib/supabaseClient";

export async function processCSV(csvText: string) {
  const raw = parseCSV(csvText);
  const cleaned = cleanDataframe(raw);
  const categorized = categorizeTransactions(cleaned);
  return categorized;
}

export async function processPDF(buffer: Buffer) {
  const raw = await parsePDF(buffer);
  const cleaned = cleanDataframe(raw);
  const categorized = categorizeTransactions(cleaned);
  return categorized;
}

export async function loadSampleData() {
  const filePath = path.join(process.cwd(), "data", "sample_transactions.csv");
  const text = fs.readFileSync(filePath, "utf-8");
  return processCSV(text);
}

export async function saveToSupabase(rows: any[]) {
  const { error } = await supabase.from("transactions").insert(
    rows.map((r) => ({
      date: r.date,
      description: r.description,
      merchant_clean: r.merchant_clean,
      amount: r.amount,
      type: r.type,
      category: r.category,
      month: r.month,
      day_of_week: r.day_of_week,
      hour: r.hour,
      is_weekend: r.is_weekend,
      is_night: r.is_night,
    }))
  );
  if (error) {
    console.error("Supabase insert error:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
