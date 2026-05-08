"use server";

import fs from "fs";
import path from "path";
import { parseCSV } from "@/lib/parsers/csvParser";
import { parsePDF } from "@/lib/parsers/pdfParser";
import { cleanDataframe } from "@/lib/cleaner";
import { categorizeTransactions } from "@/lib/categorizer/engine";
import { uploadStatement, createUpload, storeTransactions } from "@/lib/supabase";

export async function processCSV(csvText: string, uploadToSupabase = false, filename?: string) {
  const raw = parseCSV(csvText);
  const cleaned = cleanDataframe(raw);
  const categorized = categorizeTransactions(cleaned);
  
  if (uploadToSupabase && filename) {
    // Create upload record and store transactions
    const upload = await createUpload({
      filename,
      filetype: "csv",
      storage_path: "",
    });
    
    const transactions = categorized.map((t) => ({
      upload_id: upload.id!,
      date: t.date,
      description: t.description,
      merchant_clean: t.merchant_clean,
      category: t.category,
      amount: t.amount,
      type: t.type,
      month: t.month,
      day_of_week: t.day_of_week,
      hour: t.hour,
      is_weekend: t.is_weekend,
      is_night: t.is_night,
    }));
    
    await storeTransactions(transactions);
  }
  
  return categorized;
}

export async function processPDF(buffer: Buffer, uploadToSupabase = false, filename?: string) {
  const raw = await parsePDF(buffer);
  const cleaned = cleanDataframe(raw);
  const categorized = categorizeTransactions(cleaned);
  
  if (uploadToSupabase && filename) {
    // Create upload record and store transactions
    const upload = await createUpload({
      filename,
      filetype: "pdf",
      storage_path: "",
    });
    
    const transactions = categorized.map((t) => ({
      upload_id: upload.id!,
      date: t.date,
      description: t.description,
      merchant_clean: t.merchant_clean,
      category: t.category,
      amount: t.amount,
      type: t.type,
      month: t.month,
      day_of_week: t.day_of_week,
      hour: t.hour,
      is_weekend: t.is_weekend,
      is_night: t.is_night,
    }));
    
    await storeTransactions(transactions);
  }
  
  return categorized;
}

export async function loadSampleData() {
  const filePath = path.join(process.cwd(), "data", "sample_transactions.csv");
  const text = fs.readFileSync(filePath, "utf-8");
  return processCSV(text);
}

export async function saveToSupabase(rows: any[], filename: string, filetype: string) {
  // Create upload record
  const upload = await createUpload({
    filename,
    filetype,
    storage_path: "",
  });
  
  // Store transactions
  const transactions = rows.map((t) => ({
    upload_id: upload.id!,
    date: t.date,
    description: t.description,
    merchant_clean: t.merchant_clean,
    category: t.category,
    amount: t.amount,
    type: t.type,
    month: t.month,
    day_of_week: t.day_of_week,
    hour: t.hour,
    is_weekend: t.is_weekend,
    is_night: t.is_night,
  }));
  
  await storeTransactions(transactions);
  
  return { success: true, uploadId: upload.id };
}
