import { relativeDays } from "./format";

const BAR_COLORS = {
  Strong: "bg-emerald-500",
  Healthy: "bg-teal-500",
  Watch: "bg-amber-500",
  "At Risk": "bg-rose-500",
};

/** Display info for an HCP, derived from server-computed fields (never hardcoded per priority/status). */
export const relationshipInfo = (doc) => {
  const health = doc.healthLabel || "At Risk";
  const visits30d = doc.interactionsLast30Days || 0;
  return {
    health,
    score: doc.healthScore ?? 0,
    barColor: BAR_COLORS[health] || BAR_COLORS["At Risk"],
    activity: `${visits30d} in 30d`,
    trendType: visits30d > 0 ? "up" : "neutral",
    lastTouch: relativeDays(doc.daysSinceLastVisit),
    nextAction:
      doc.nextFollowUpAction ||
      (health === "At Risk" || health === "Watch" ? "Schedule a visit" : "No open follow-up"),
  };
};

export const placeLabel = (doc) => [doc.city, doc.state].filter(Boolean).join(", ");
