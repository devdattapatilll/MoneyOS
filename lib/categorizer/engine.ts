import { CATEGORY_KEYWORDS, CATEGORY_WEIGHTS } from "./rules";

// Calculate weighted score for a category based on keyword matches
function calculateCategoryScore(
  text: string,
  merchant: string,
  keywords: string[],
  baseWeight: number
): number {
  let score = 0;
  const searchText = text.toLowerCase();
  const searchMerchant = merchant.toLowerCase();
  
  for (const kw of keywords) {
    const kwLower = kw.toLowerCase();
    
    // Merchant match gets higher weight
    if (searchMerchant.includes(kwLower)) {
      // Exact merchant match gets even higher score
      if (searchMerchant === kwLower) {
        score += kw.length * baseWeight * 3;
      } else {
        score += kw.length * baseWeight * 2;
      }
    }
    
    // Description match gets standard weight
    if (searchText.includes(kwLower)) {
      score += kw.length * baseWeight;
    }
    
    // Multi-word keywords get bonus
    if (kw.includes(" ") && (searchText.includes(kwLower) || searchMerchant.includes(kwLower))) {
      score += kw.length * baseWeight * 0.5;
    }
  }
  
  return score;
}

export function categorizeTransactions(rows: any[]) {
  return rows.map((t) => {
    const desc = t.description?.toString() || "";
    const merchant = t.merchant_clean?.toString() || desc;
    
    let bestCat = "Miscellaneous";
    let bestScore = 0;
    let secondBestCat = "Miscellaneous";
    let secondBestScore = 0;
    
    for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
      const weight = CATEGORY_WEIGHTS[cat] || 1;
      const score = calculateCategoryScore(desc, merchant, kws, weight);
      
      if (score > bestScore) {
        secondBestScore = bestScore;
        secondBestCat = bestCat;
        bestScore = score;
        bestCat = cat;
      } else if (score > secondBestScore) {
        secondBestScore = score;
        secondBestCat = cat;
      }
    }
    
    // If best and second best are very close, prefer Miscellaneous for uncertain cases
    if (bestScore > 0 && secondBestScore > 0) {
      const ratio = bestScore / secondBestScore;
      if (ratio < 1.3 && bestScore < 20) {
        // Too close to call confidently
        bestCat = "Miscellaneous";
      }
    }
    
    // Only categorize if we have a decent confidence score
    if (bestScore < 5) {
      bestCat = "Miscellaneous";
    }
    
    return { ...t, category: bestCat };
  });
}
