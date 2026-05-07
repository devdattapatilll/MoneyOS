export function normalizeDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const s = dateStr.trim();
  const formats = [
    /^\d{1,2}-\d{1,2}-\d{4}$/,
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{4}-\d{1,2}-\d{1,2}$/,
    /^\d{1,2}-[A-Za-z]{3}-\d{4}$/i,
    /^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/i,
    /^\d{1,2}-\d{1,2}-\d{2}$/,
    /^\d{1,2}\/[A-Za-z]{3}\/\d{2}$/i,
    /^[A-Za-z]{3}\s+\d{1,2},\s*\d{4}$/i,
  ];
  const tryParse = (input: string) => {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  };
  for (const fmt of formats) {
    if (fmt.test(s)) {
      if (s.includes("/")) {
        const parts = s.split("/");
        if (parts.length === 3) {
          const p0 = parseInt(parts[0], 10);
          const p1 = parseInt(parts[1], 10);
          const p2 = parseInt(parts[2], 10);
          if (p2 > 31) {
            return new Date(p2, p1 - 1, p0);
          }
        }
      }
      const d = tryParse(s.replace(/-/g, "/"));
      if (d) return d;
    }
  }
  return tryParse(s);
}

export function parseAmount(amountStr: string | number): number | null {
  if (typeof amountStr === "number") return isNaN(amountStr) ? null : amountStr;
  if (!amountStr) return null;
  let s = amountStr.toString().replace(/,/g, "").replace(/Rs/gi, "").replace(/₹/g, "");
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

export function sanitizeText(text: string): string {
  if (text == null) return "";
  return String(text).trim().replace(/\s+/g, " ");
}
