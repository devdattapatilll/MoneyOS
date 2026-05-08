import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket for statements
export const STATEMENTS_BUCKET = "statements";

// Upload file to Supabase Storage
export async function uploadStatement(file: File, filename: string) {
  const { data, error } = await supabase.storage
    .from(STATEMENTS_BUCKET)
    .upload(`${Date.now()}_${filename}`, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return data.path;
}

// Database types
export interface UploadRecord {
  id?: string;
  filename: string;
  filetype: string;
  storage_path: string;
  created_at?: string;
}

export interface TransactionRecord {
  id?: string;
  upload_id: string;
  date: string;
  description: string;
  merchant_clean: string;
  category: string;
  amount: number;
  type: string;
  month: string;
  day_of_week: string;
  hour: number;
  is_weekend: boolean;
  is_night: boolean;
  created_at?: string;
}

// Create upload record
export async function createUpload(record: UploadRecord) {
  const { data, error } = await supabase
    .from("uploads")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Database insert error (uploads):", error);
    throw new Error(`Failed to create upload record: ${error.message}`);
  }

  return data;
}

// Store transactions
export async function storeTransactions(transactions: TransactionRecord[]) {
  const { data, error } = await supabase
    .from("transactions")
    .insert(transactions)
    .select();

  if (error) {
    console.error("Database insert error (transactions):", error);
    throw new Error(`Failed to store transactions: ${error.message}`);
  }

  return data;
}

// Get transactions by upload ID
export async function getTransactionsByUpload(uploadId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("upload_id", uploadId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Database query error:", error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data || [];
}

// Get all uploads
export async function getUploads() {
  const { data, error } = await supabase
    .from("uploads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Database query error:", error);
    throw new Error(`Failed to fetch uploads: ${error.message}`);
  }

  return data || [];
}
