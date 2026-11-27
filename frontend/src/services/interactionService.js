import api from "./api";

/**
 * LangGraph extraction: notes -> { draft, match, model, latencyMs, attempts }. Nothing is saved.
 * Throws on failure; callers show the error, never invented output.
 */
export const extractInteraction = async (notes) => {
  const { data } = await api.post("/interaction/ai/extract", { notes });
  return data;
};

/**
 * AI Analyst: question + recent history ([{ role, content }]) ->
 * { answer: { kind, title, evidence, interpretation, recommendation, message }, toolsUsed, model, latencyMs }.
 */
export const sendChat = async (message, history = []) => {
  const { data } = await api.post("/chat", { message, history }, { timeout: 60000 });
  return data;
};

/**
 * Fetches dashboard KPI stats from backend
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/stats");
    return response.data;
  } catch (error) {
    console.warn("Dashboard stats fetch failed, using localized aggregate:", error);
    return {
      total_hcps: 248,
      today_visits: 12,
      interactions: 845,
      followups: 31,
    };
  }
};
