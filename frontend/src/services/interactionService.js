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

/** Dashboard numbers computed server-side from the caller's scoped data. */
export const getDashboardStats = async () => {
  const { data } = await api.get("/dashboard/stats");
  return data;
};
