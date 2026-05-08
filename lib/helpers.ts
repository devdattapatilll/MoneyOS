export function normalizeDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const s = dateStr.trim();
  const withoutTime = s.match(/^(.+?)(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)$/);
  if (withoutTime) {
    const dateOnly = normalizeDate(withoutTime[1]);
    if (dateOnly) {
      const timeParts = s.match(/[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (timeParts) {
        dateOnly.setHours(Number(timeParts[1]), Number(timeParts[2]), Number(timeParts[3] || 0), 0);
      }
      return dateOnly;
    }
  }

  const monthNames: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  const normalizeYear = (year: string) => {
    const y = Number(year);
    return y < 100 ? 2000 + y : y;
  };

  const validDate = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day ? d : null;
  };

  const numeric = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
  if (numeric) {
    return validDate(normalizeYear(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1]));
  }

  const isoLike = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (isoLike) {
    return validDate(Number(isoLike[1]), Number(isoLike[2]) - 1, Number(isoLike[3]));
  }

  const dayMonthName = s.match(/^(\d{1,2})[\s/-]([A-Za-z]{3})[\s/-](\d{2}|\d{4})$/i);
  if (dayMonthName) {
    const month = monthNames[dayMonthName[2].toLowerCase()];
    if (month !== undefined) {
      return validDate(normalizeYear(dayMonthName[3]), month, Number(dayMonthName[1]));
    }
  }

  const monthNameDay = s.match(/^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{2}|\d{4})$/i);
  if (monthNameDay) {
    const month = monthNames[monthNameDay[1].toLowerCase()];
    if (month !== undefined) {
      return validDate(normalizeYear(monthNameDay[3]), month, Number(monthNameDay[2]));
    }
  }

  const tryParse = (input: string) => {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  };
  return tryParse(s);
}

export function parseAmount(amountStr: string | number): number | null {
  if (typeof amountStr === "number") return isNaN(amountStr) ? null : Math.abs(amountStr);
  if (!amountStr) return null;
  let s = amountStr
    .toString()
    .replace(/,/g, "")
    .replace(/Rs\.?/gi, "")
    .replace(/INR/gi, "")
    .replace(/\u20b9/g, "")
    .replace(/â‚¹/g, "");
  s = s.replace(/[^\d.\-]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.abs(n);
}

export function detectTransactionType(row: Record<string, string>): string {
  const text = Object.values(row).join(" ").toLowerCase();
  if (/cr|credit|received|salary|deposit|cashback/.test(text)) return "credit";
  if (/dr|debit|paid|sent|purchase|upi/.test(text)) return "debit";
  return "debit";
}

// More robust transaction type inference that scans all row values
export function inferTransactionType(row: Record<string, string>): string {
  const allText = Object.entries(row).map(([key, val]) => `${key} ${val}`).join(" ").toLowerCase();
  
  // Check for explicit credit indicators
  const creditPatterns = [
    /\bcr\b/, /\bcredit\b/, /\breceived\b/, /\bsalary\b/, 
    /\bdeposit\b/, /\bcashback\b/, /\brefund\b/, /\binflow\b/,
    /\bcredited\b/, /\breceived from\b/
  ];
  
  for (const pattern of creditPatterns) {
    if (pattern.test(allText)) return "credit";
  }
  
  // Check for explicit debit indicators
  const debitPatterns = [
    /\bdr\b/, /\bdebit\b/, /\bpaid\b/, /\bsent\b/, 
    /\bpurchase\b/, /\bwithdrawal\b/, /\boutflow\b/,
    /\bdebited\b/, /\bpaid to\b/, /\bupi\/pay\b/
  ];
  
  for (const pattern of debitPatterns) {
    if (pattern.test(allText)) return "debit";
  }
  
  // Default to debit if amount looks like an expense (common for bank statements)
  return "debit";
}

export function sanitizeText(text: string): string {
  if (text == null) return "";
  return String(text).trim().replace(/\s+/g, " ");
}
