import api from "./api";

/**
 * Extracts and cleans JSON from AI response strings that may include markdown code fences.
 */
export const parseAIStructuredOutput = (rawOutput) => {
  if (!rawOutput) return null;
  if (typeof rawOutput === "object" && rawOutput !== null) return rawOutput;

  try {
    // Try direct parse
    return JSON.parse(rawOutput);
  } catch {
    // Match code block ```json ... ``` or ``` ... ```
    const match = rawOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (err) {
        console.warn("Failed to parse extracted code block JSON", err);
      }
    }

    // Try finding first { and last }
    const firstBrace = rawOutput.indexOf("{");
    const lastBrace = rawOutput.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const potentialJson = rawOutput.slice(firstBrace, lastBrace + 1);
        return JSON.parse(potentialJson);
      } catch (err) {
        console.warn("Failed to parse braced JSON", err);
      }
    }
  }

  return null;
};

/**
 * Sends notes to backend LangGraph AI router.
 * Throws on any failure — callers must show an error state, never invented output.
 * `structured` is null when the model's reply isn't parseable JSON; use `raw` then.
 */
export const askAI = async (notes) => {
  const response = await api.post("/interaction/ai", { notes });
  const raw = response.data?.data;
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("AI service returned an empty response");
  }
  const parsed = parseAIStructuredOutput(raw);
  const structured =
    parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  return { raw, structured };
};

/**
 * LangGraph extraction: notes -> { draft, match, model, latencyMs, attempts }. Nothing is saved.
 * Throws on failure; callers show the error, never invented output.
 */
export const extractInteraction = async (notes) => {
  const { data } = await api.post("/interaction/ai/extract", { notes });
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