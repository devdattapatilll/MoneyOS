import Papa from "papaparse";
import { normalizeDate, parseAmount, sanitizeText } from "@/lib/helpers";

export interface RawTransaction {
  date: string;
  description: string;
  amount: number;
  type: string;
  [key: string]: any;
}

export interface ParseResult {
  transactions: RawTransaction[];
  warnings: string[];
  confidence: number;
  totalRows: number;
  skippedRows: number;
  mappedColumns: {
    dateCol?: string;
    descCol?: string;
    amtCol?: string;
    debitCol?: string;
    creditCol?: string;
    typeCol?: string;
  };
}

const DATE_ALIASES = [
  "date",
  "txn date",
  "value date",
  "posting date",
  "transaction date",
  "dates",
  "ts",
  "timestamp",
  "time stamp",
  "transaction timestamp",
  "created at",
  "transaction time",
  "dt",
  "tran date",
  "booking date",
];
const DESC_ALIASES = [
  "description",
  "narration",
  "particulars",
  "details",
  "remarks",
  "merchant",
  "payee",
  "payee name",
  "beneficiary",
  "beneficiary name",
  "receiver",
  "receiver name",
  "transaction details",
  "transaction remarks",
  "narrative",
  "memo",
  "reference",
  "name",
];
const AMOUNT_ALIASES = ["amount", "amount inr", "txn amount", "transaction amount", "net amount", "value", "paid amount", "transaction value"];
const DEBIT_ALIASES = ["debit", "withdrawal", "withdrawn", "debit amount", "dr amount", "withdrawal amt", "debit amt", "money out"];
const CREDIT_ALIASES = ["credit", "deposit", "deposited", "credit amount", "cr amount", "deposit amt", "credit amt", "money in"];
const TYPE_ALIASES = ["type", "dr/cr", "debit/credit", "txn type", "transaction type", "cr/dr", "transaction nature", "nature"];

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

function findBestColumn(headers: string[], aliases: string[]): string | undefined {
  const normalizedAliases = aliases.map(normalizeHeader);
  const compactAliases = normalizedAliases.map((alias) => alias.replace(/\s+/g, ""));
  return headers.find((header) => {
    const normalized = normalizeHeader(header);
    const compact = normalized.replace(/\s+/g, "");
    return normalizedAliases.some((alias, index) => normalized.includes(alias) || compact.includes(compactAliases[index]));
  });
}

function findColumnBySample(
  rows: Record<string, string>[],
  headers: string[],
  predicate: (value: string) => boolean,
  minMatches = 2
): string | undefined {
  let best: { header: string; count: number } | null = null;
  for (const header of headers) {
    let count = 0;
    for (const row of rows.slice(0, 25)) {
      if (predicate(String(row[header] || "").trim())) count += 1;
    }
    if (count >= minMatches && (!best || count > best.count)) {
      best = { header, count };
    }
  }
  return best?.header;
}

function hasUsableContent(row: Record<string, string>): boolean {
  return Object.values(row).some((value) => String(value || "").trim().length > 0);
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  if (!text) return false;
  const amount = parseAmount(text);
  return amount !== null && amount > 0;
}

function parseSignedAmount(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  return parseAmount(text);
}

function inferFromType(typeValue: string): "credit" | "debit" | null {
  const text = typeValue.toLowerCase().trim();
  if (/\b(cr|credit|deposit|deposited|received|receipt|inflow)\b/.test(text)) return "credit";
  if (/\b(dr|debit|withdrawal|withdrawn|paid|sent|outflow)\b/.test(text)) return "debit";
  return null;
}

function inferFromDescription(description: string): "credit" | "debit" {
  if (/\b(salary|refund|deposit|deposited|cashback|reversal|received|credited)\b/i.test(description)) {
    return "credit";
  }
  return "debit";
}

function extractAmountAndType(
  row: Record<string, string>,
  description: string,
  columns: { amtCol?: string; debitCol?: string; creditCol?: string; typeCol?: string }
): { amount: number | null; type: "credit" | "debit" } {
  const explicitType = columns.typeCol ? inferFromType(row[columns.typeCol] || "") : null;

  if (columns.debitCol && hasValue(row[columns.debitCol])) {
    return { amount: parseSignedAmount(row[columns.debitCol]), type: explicitType || "debit" };
  }

  if (columns.creditCol && hasValue(row[columns.creditCol])) {
    return { amount: parseSignedAmount(row[columns.creditCol]), type: explicitType || "credit" };
  }

  if (!columns.amtCol) {
    return { amount: null, type: explicitType || inferFromDescription(description) };
  }

  const rawAmount = row[columns.amtCol];
  const amount = parseSignedAmount(rawAmount);
  if (amount === null) {
    return { amount: null, type: explicitType || inferFromDescription(description) };
  }

  if (explicitType) return { amount, type: explicitType };
  if (String(rawAmount).trim().startsWith("-")) return { amount, type: "debit" };
  return { amount, type: inferFromDescription(description) };
}

export function parseCSV(csvText: string): RawTransaction[] {
  const result = parseCSVWithResult(csvText);
  if (result.transactions.length === 0) {
    throw new Error("No usable transactions were found in the CSV. Please check the statement columns and try again.");
  }
  return result.transactions;
}

export function parseCSVWithResult(csvText: string): ParseResult {
  if (!csvText || csvText.trim().length === 0) {
    return {
      transactions: [],
      warnings: ["CSV is empty."],
      confidence: 0,
      totalRows: 0,
      skippedRows: 0,
      mappedColumns: {},
    };
  }

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const data = (parsed.data || []).filter(hasUsableContent);
  const headers = Object.keys(data[0] || {});
  let dateCol = findBestColumn(headers, DATE_ALIASES);
  let descCol = findBestColumn(headers, DESC_ALIASES);
  const debitCol = findBestColumn(headers, DEBIT_ALIASES);
  const creditCol = findBestColumn(headers, CREDIT_ALIASES);
  const typeCol = findBestColumn(headers, TYPE_ALIASES);
  let amtCol = findBestColumn(
    headers.filter((header) => header !== debitCol && header !== creditCol),
    AMOUNT_ALIASES
  );
  if (!dateCol) dateCol = findColumnBySample(data, headers, (value) => normalizeDate(value) !== null);
  if (!amtCol && !debitCol && !creditCol) amtCol = findColumnBySample(data, headers, (value) => parseAmount(value) !== null && (parseAmount(value) || 0) > 0);
  if (!descCol) {
    descCol = findColumnBySample(
      data,
      headers.filter((header) => header !== dateCol && header !== amtCol && header !== debitCol && header !== creditCol),
      (value) => /[a-zA-Z]/.test(value) && value.length > 2,
      1
    );
  }

  const transactions: RawTransaction[] = [];
  let skippedRows = 0;

  for (const row of data) {
    const status = Object.entries(row).find(([key]) => normalizeHeader(key) === "status")?.[1];
    if (status && !/\b(success|successful|completed|posted|settled)\b/i.test(status)) {
      skippedRows += 1;
      continue;
    }

    const rawDate = dateCol ? row[dateCol] : "";
    const date = normalizeDate(rawDate);
    if (!date) {
      skippedRows += 1;
      continue;
    }

    const description = sanitizeText(descCol ? row[descCol] : "");
    if (description.length <= 1) {
      skippedRows += 1;
      continue;
    }
    const { amount, type } = extractAmountAndType(row, description, {
      amtCol,
      debitCol,
      creditCol,
      typeCol,
    });

    if (amount === null || amount <= 0) {
      skippedRows += 1;
      continue;
    }

    transactions.push({
      ...row,
      date: date.toISOString(),
      description,
      amount,
      type,
    });
  }

  const totalRows = data.length;
  const warnings = parsed.errors.map((error) => error.message);
  if (transactions.length === 0) {
    warnings.push("No usable transactions were extracted from the CSV.");
  }

  return {
    transactions,
    warnings,
    confidence: totalRows > 0 ? transactions.length / totalRows : 0,
    totalRows,
    skippedRows,
    mappedColumns: {
      dateCol,
      descCol,
      amtCol,
      debitCol,
      creditCol,
      typeCol,
    },
  };
}
