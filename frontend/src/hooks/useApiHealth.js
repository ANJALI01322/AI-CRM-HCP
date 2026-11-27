import { useEffect, useState } from "react";
import api from "../services/api";

const POLL_MS = 60000;

const toStatus = (body) => {
  if (!body || body.db !== "ok") {
    return { label: "Offline", detail: body ? `DB: ${body.db}` : "API unreachable" };
  }
  if (!String(body.llm || "").startsWith("ok")) {
    return { label: "Live (Postgres) • AI offline", detail: `AI: ${body.llm}` };
  }
  return { label: "Live (Postgres)", detail: `DB: ok • AI: ${body.llm}` };
};

/** Polls /api/health; returns { label, detail } for display. */
export default function useApiHealth() {
  const [status, setStatus] = useState({ label: "Checking…", detail: "" });

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (document.hidden) return;
      try {
        const { data } = await api.get("/health");
        if (!cancelled) setStatus(toStatus(data));
      } catch (err) {
        // 503 still carries the {status, db, llm} body.
        if (!cancelled) setStatus(toStatus(err?.response?.data));
      }
    };
    check();
    const id = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return status;
}
