import { CATEGORY_KEYWORDS } from "./rules";

export function categorizeTransactions(rows: any[]) {
  return rows.map((t) => {
    const desc = t.description.toLowerCase();
    let bestCat = "Miscellaneous";
    let bestScore = 0;
    for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of kws) {
        if (desc.includes(kw)) {
          const score = kw.length;
          if (score > bestScore) {
            bestScore = score;
            bestCat = cat;
          }
        }
      }
    }
    return { ...t, category: bestCat };
  });
}
