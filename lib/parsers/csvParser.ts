import Papa from "papaparse";
import { normalizeDate, parseAmount, sanitizeText, inferTransactionType } from "@/lib/helpers";

export interface RawTransaction {
  date: string;
  description: string;
  amount: number;
  type: string;
  [key: string]: any;
}

// Flexible column name mappings for various bank formats
const COLUMN_MAPPINGS = {
  date: [
    "date", "txn date", "value date", "transaction date", "posting date",
    "tran date", "trxn date", "dt", "transaction dt", "value dt",
    "transaction date/time", "date/time", "time stamp", "timestamp",
    "initiated date", "completion date", "txn time"
  ],
  description: [
    "description", "narration", "particulars", "details", "remarks",
    "transaction details", "merchant", "payee", "beneficiary", "name",
    "transaction description", "desc", "narration details", "transaction particulars",
    "utr", "transaction id", "ref no", "reference", "ref number", "reference number",
    "utr no", "utr number", "transaction ref", "note", "transaction note",
    "to", "from", "sender", "receiver", "account", "account name"
  ],
  amount: [
    "amount", "txn amount", "transaction amount", "debit", "credit",
    "withdrawal", "deposit", "amt", "trxn amount", "transaction amt",
    "dr amount", "cr amount", "debit amount", "credit amount",
    "withdrawal amount", "deposit amount", "transaction value"
  ],
  debitAmount: [
    "debit", "withdrawal", "dr", "debit amount", "dr amount", "outflow",
    "withdrawal amt", "debited", "money out", "paid", "sent"
  ],
  creditAmount: [
    "credit", "deposit", "cr", "credit amount", "cr amount", "inflow",
    "deposit amt", "credited", "money in", "received", "got"
  ],
  type: [
    "type", "dr/cr", "debit/credit", "txn type", "transaction type",
    "nature", "transaction nature", "debit/credit indicator",
    "transaction status", "status"
  ]
};

function findColumn(headers: string[], alternatives: string[]): string | undefined {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim().replace(/\s+/g, " "));
  
  // First try exact matches
  for (const alt of alternatives) {
    const normalizedAlt = alt.toLowerCase().trim();
    const exactMatch = normalizedHeaders.find(h => h === normalizedAlt);
    if (exactMatch) return headers[normalizedHeaders.indexOf(exactMatch)];
  }
  
  // Then try partial matches where alternative is contained in header
  for (const alt of alternatives) {
    const normalizedAlt = alt.toLowerCase().trim();
    const partialMatch = normalizedHeaders.find(h => h.includes(normalizedAlt));
    if (partialMatch) return headers[normalizedHeaders.indexOf(partialMatch)];
  }
  
  // Then try partial matches where header is contained in alternative
  for (const alt of alternatives) {
    const normalizedAlt = alt.toLowerCase().trim();
    const partialMatch = normalizedHeaders.find(h => normalizedAlt.includes(h) && h.length > 2);
    if (partialMatch) return headers[normalizedHeaders.indexOf(partialMatch)];
  }
  
  return undefined;
}

// Smart column guessing based on content analysis
function guessColumnsByContent(headers: string[]): { dateCol?: string; descCol?: string; amtCol?: string } {
  const result: { dateCol?: string; descCol?: string; amtCol?: string } = {};
  
  for (const header of headers) {
    const lower = header.toLowerCase();
    
    // Date detection - contains date-like words
    if (/date|time|dt|day|month|year/.test(lower)) {
      result.dateCol = header;
    }
    
    // Description detection - contains description-like words
    if (/desc|narr|partic|detail|remark|note|merchant|payee|beneficiary|name|to|from|utr|ref/.test(lower)) {
      result.descCol = header;
    }
    
    // Amount detection - contains amount-like words (but not 'date')
    if ((/amount|amt|debit|credit|withdrawal|deposit|dr|cr|money|value|sum/.test(lower)) && !/date/.test(lower)) {
      result.amtCol = header;
    }
  }
  
  return result;
}

function parseAmountFromRow(row: Record<string, string>, amtCol?: string, debitCol?: string, creditCol?: string): { amount: number | null; type: string } {
  // If we have separate debit/credit columns
  if (debitCol && creditCol) {
    const debitVal = row[debitCol]?.trim() || "";
    const creditVal = row[creditCol]?.trim() || "";
    
    if (debitVal && debitVal !== "0" && debitVal !== "") {
      const amount = parseAmount(debitVal);
      if (amount !== null) return { amount, type: "debit" };
    }
    
    if (creditVal && creditVal !== "0" && creditVal !== "") {
      const amount = parseAmount(creditVal);
      if (amount !== null) return { amount, type: "credit" };
    }
  }
  
  // If we have a single amount column with type indicator
  if (amtCol) {
    const amtVal = row[amtCol]?.trim() || "";
    const amount = parseAmount(amtVal);
    
    if (amount !== null) {
      // Try to infer type from surrounding columns
      const type = inferTransactionType(row);
      return { amount, type };
    }
  }
  
  // Fallback: scan all columns for amounts
  for (const [key, val] of Object.entries(row)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("debit") || lowerKey.includes("dr")) {
      const amount = parseAmount(val);
      if (amount !== null) return { amount, type: "debit" };
    }
    if (lowerKey.includes("credit") || lowerKey.includes("cr")) {
      const amount = parseAmount(val);
      if (amount !== null) return { amount, type: "credit" };
    }
  }
  
  return { amount: null, type: "debit" };
}

export function parseCSV(csvText: string): RawTransaction[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (!parsed.data || parsed.data.length === 0) {
    throw new Error("CSV is empty or malformed.");
  }

  if (parsed.errors && parsed.errors.length > 0) {
    console.warn("CSV parsing warnings:", parsed.errors);
  }

  const headers = Object.keys(parsed.data[0]);
  const cols = headers.map((c) => c.toLowerCase().trim().replace(/\s+/g, " "));

  // Find columns with flexible matching
  let dateCol = findColumn(headers, COLUMN_MAPPINGS.date);
  let descCol = findColumn(headers, COLUMN_MAPPINGS.description);
  let amtCol = findColumn(headers, COLUMN_MAPPINGS.amount);
  const debitCol = findColumn(headers, COLUMN_MAPPINGS.debitAmount);
  const creditCol = findColumn(headers, COLUMN_MAPPINGS.creditAmount);
  const typeCol = findColumn(headers, COLUMN_MAPPINGS.type);

  // Fallback: try to guess columns by content analysis
  const guessed = guessColumnsByContent(headers);
  if (!dateCol && guessed.dateCol) dateCol = guessed.dateCol;
  if (!descCol && guessed.descCol) descCol = guessed.descCol;
  if (!amtCol && guessed.amtCol) amtCol = guessed.amtCol;

  // Last resort: position-based fallback (standard bank CSV format)
  // Usually: [Date, Description, Amount/Debit/Credit, ...]
  if (!dateCol && headers.length >= 1) {
    dateCol = headers[0]; // First column is usually date
    console.warn(`Using position-based fallback for date column: ${dateCol}`);
  }
  if (!descCol && headers.length >= 2) {
    descCol = headers[1]; // Second column is usually description
    console.warn(`Using position-based fallback for description column: ${descCol}`);
  }
  if (!amtCol && !debitCol && !creditCol && headers.length >= 3) {
    amtCol = headers[2]; // Third column is usually amount
    console.warn(`Using position-based fallback for amount column: ${amtCol}`);
  }

  // Validate required columns
  if (!dateCol) {
    throw new Error(`Could not find date column. Detected columns: ${cols.join(", ")}`);
  }
  if (!descCol) {
    throw new Error(`Could not find description column. Detected columns: ${cols.join(", ")}`);
  }
  if (!amtCol && !debitCol && !creditCol) {
    throw new Error(`Could not find amount column. Detected columns: ${cols.join(", ")}`);
  }

  const rows: RawTransaction[] = [];
  let skippedRows = 0;

  for (const r of parsed.data) {
    try {
      const dateVal = r[dateCol];
      const d = normalizeDate(dateVal);
      
      if (!d) {
        console.warn(`Skipping row with invalid date: ${dateVal}`);
        skippedRows++;
        continue;
      }

      const { amount, type } = parseAmountFromRow(r, amtCol, debitCol, creditCol);
      
      if (amount === null || amount <= 0) {
        console.warn(`Skipping row with invalid amount: ${r[amtCol || debitCol || creditCol || ""]}`);
        skippedRows++;
        continue;
      }

      // Allow type override from explicit type column
      let finalType = type;
      if (typeCol) {
        const typeVal = r[typeCol]?.toLowerCase()?.trim() || "";
        if (typeVal) {
          if (/cr|credit|deposit|inflow/.test(typeVal)) {
            finalType = "credit";
          } else if (/dr|debit|withdrawal|outflow/.test(typeVal)) {
            finalType = "debit";
          }
        }
      }

      rows.push({
        ...r,
        date: d.toISOString(),
        description: sanitizeText(r[descCol] || ""),
        amount,
        type: finalType,
      });
    } catch (err) {
      console.warn("Skipping malformed row:", err);
      skippedRows++;
    }
  }

  if (rows.length === 0) {
    throw new Error(`No valid transactions found in CSV. ${skippedRows > 0 ? `Skipped ${skippedRows} malformed rows.` : ""}`);
  }

  console.log(`Parsed ${rows.length} transactions from CSV (${skippedRows} rows skipped)`);
  return rows;
}
