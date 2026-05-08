import { CATEGORY_KEYWORDS, CATEGORY_WEIGHTS } from "./rules";

function scoreText(text: string, keywords: string[], baseWeight: number): number {
  const searchText = text.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();
    if (searchText.includes(kw)) {
      score += kw.length * baseWeight;
    }
  }

  return score;
}

function bestCategoryFor(text: string): { category: string; score: number } {
  let best = { category: "Miscellaneous", score: 0 };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = scoreText(text, keywords, CATEGORY_WEIGHTS[category] || 1);
    if (score > best.score) {
      best = { category, score };
    }
  }

  return best.score >= 1 ? best : { category: "Miscellaneous", score: 0 };
}

export function categorizeTransactions(rows: any[]) {
  return rows.map((t) => {
    const description = t.description?.toString() || "";
    const merchant = t.merchant_clean?.toString() || "";

    const merchantMatch = bestCategoryFor(merchant);
    const match = merchantMatch.score >= 1 ? merchantMatch : bestCategoryFor(description);

    return { ...t, category: match.category || "Miscellaneous" };
  });
}
