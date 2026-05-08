export function getScoreLabel(score: number): { label: string; textClass: string; pillClass: string; fill: string } {
  const value = Number.isFinite(score) ? score : 0;
  if (value >= 85) {
    return {
      label: "Excellent",
      textClass: "text-emerald-300",
      pillClass: "border-emerald-400/70 bg-emerald-500/15 text-emerald-300",
      fill: "#34d399",
    };
  }
  if (value >= 65) {
    return {
      label: "Good",
      textClass: "text-lime-300",
      pillClass: "border-lime-400/70 bg-lime-500/15 text-lime-300",
      fill: "#84cc16",
    };
  }
  if (value >= 45) {
    return {
      label: "Average",
      textClass: "text-yellow-300",
      pillClass: "border-yellow-400/70 bg-yellow-500/15 text-yellow-300",
      fill: "#facc15",
    };
  }
  if (value >= 30) {
    return {
      label: "Low",
      textClass: "text-orange-300",
      pillClass: "border-orange-400/70 bg-orange-500/15 text-orange-300",
      fill: "#fb923c",
    };
  }
  return {
    label: "Critical",
    textClass: "text-red-300",
    pillClass: "border-red-400/70 bg-red-500/15 text-red-300",
    fill: "#f87171",
  };
}
