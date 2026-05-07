"use server";

import fs from "fs";
import path from "path";
import { parseCSV } from "@/lib/parsers/csvParser";
import { parsePDF } from "@/lib/parsers/pdfParser";
import { cleanDataframe } from "@/lib/cleaner";
import { categorizeTransactions } from "@/lib/categorizer/engine";

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
