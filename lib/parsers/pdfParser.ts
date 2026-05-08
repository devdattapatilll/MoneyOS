"use server";

import pdfParse from "pdf-parse";
import { normalizeDate, parseAmount, sanitizeText } from "@/lib/helpers";

export interface RawTransaction {
  date: string;
  description: string;
  amount: number;
  type: string;
}

// Normalize PDF text by cleaning up whitespace and common artifacts
function normalizePdfText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

// Extract merchant/description from a transaction line
function extractDescription(line: string, dateMatch: string, amountMatch: string): string {
  let desc = line
    .replace(dateMatch, "")
    .replace(amountMatch, "")
    .replace(/\b(?:dr|cr|debit|credit)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  
  // Remove leading/trailing special characters
  desc = desc.replace(/^[\s\-_|]+|[\s\-_|]+$/g, "");
  
  return desc.length > 3 ? desc : "Unknown";
}

// Check if a line looks like a transaction
function isTransactionLine(line: string): { isValid: boolean; date?: string; amount?: string; type?: string } {
  // Date patterns
  const datePatterns = [
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,  // 12/05/2024 or 12-05-2024
    /\b(\d{1,2}[\/\-][A-Za-z]{3}[\/\-]\d{2,4})\b/,  // 12/May/2024 or 12-May-2024
    /\b(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\b/,  // 12 May 2024
    /\b([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})\b/,  // May 12, 2024
  ];
  
  // Amount patterns - look for numbers with decimal places or currency symbols
  const amountPatterns = [
    /(?:Rs\.?|₹|\$)?\s*([\d,]+\.\d{2})/,  // Rs. 1,234.56 or ₹1,234.56
    /(?:Rs\.?|₹|\$)?\s*([\d,]+)/,  // Rs. 1,234 or ₹1,234
    /\b([\d,]+\.\d{2})\b/,  // Just 1,234.56
  ];
  
  let dateMatch: string | undefined;
  let amountMatch: string | undefined;
  
  // Try to find date
  for (const pattern of datePatterns) {
    const match = line.match(pattern);
    if (match) {
      dateMatch = match[1];
      break;
    }
  }
  
  // Try to find amount
  for (const pattern of amountPatterns) {
    const match = line.match(pattern);
    if (match) {
      const val = parseAmount(match[1]);
      if (val !== null && val > 0) {
        amountMatch = match[1];
        break;
      }
    }
  }
  
  if (!dateMatch || !amountMatch) {
    return { isValid: false };
  }
  
  // Infer transaction type
  const lowerLine = line.toLowerCase();
  let type = "debit";
  
  if (/\bcr\b|\bcredit\b|\breceived\b|\bsalary\b|\bdeposit\b/.test(lowerLine)) {
    type = "credit";
  } else if (/\bdr\b|\bdebit\b|\bpaid\b|\bsent\b|\bupi\/pay\b/.test(lowerLine)) {
    type = "debit";
  }
  
  return { isValid: true, date: dateMatch, amount: amountMatch, type };
}

export async function parsePDF(buffer: Buffer): Promise<RawTransaction[]> {
  const data = await pdfParse(buffer);
  const normalizedText = normalizePdfText(data.text);
  const lines = normalizedText.split("\n");
  
  const rows: RawTransaction[] = [];
  let skippedLines = 0;
  
  for (const line of lines) {
    // Skip header lines and common noise
    const trimmed = line.trim();
    if (trimmed.length < 10) continue;
    if (/^(date|transaction|balance|account|page|statement)/i.test(trimmed)) continue;
    if (/^\d+\/\d+$/.test(trimmed)) continue;  // Page numbers
    
    const result = isTransactionLine(trimmed);
    if (!result.isValid || !result.date || !result.amount) {
      skippedLines++;
      continue;
    }
    
    const d = normalizeDate(result.date);
    const a = parseAmount(result.amount);
    
    if (!d || a === null || a <= 0) {
      console.warn(`Skipping PDF line with invalid date/amount: ${trimmed.substring(0, 50)}`);
      skippedLines++;
      continue;
    }
    
    const description = extractDescription(trimmed, result.date, result.amount);
    
    rows.push({
      date: d.toISOString(),
      description: sanitizeText(description),
      amount: a,
      type: result.type || "debit",
    });
  }
  
  if (rows.length === 0) {
    console.error(`No transactions extracted. Skipped ${skippedLines} lines.`);
    throw new Error("Could not extract transactions from PDF. Try a CSV export or check if the PDF is text-based.");
  }
  
  console.log(`Extracted ${rows.length} transactions from PDF (${skippedLines} lines skipped)`);
  return rows;
}
