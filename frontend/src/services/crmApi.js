import api from "./api";

const PAGE_SIZE = 200; // backend maximum

export const errorMessage = (err) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) {
    const field = detail[0].loc?.slice(-1)[0];
    return field ? `${field}: ${detail[0].msg}` : detail[0].msg;
  }
  return err?.message || "Request failed";
};

const fetchAll = async (path) => {
  const items = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await api.get(path, { params: { limit: PAGE_SIZE, offset } });
    items.push(...data.items);
    if (data.items.length === 0 || items.length >= data.total) return items;
  }
};

// ---- HCPs ----

const HCP_FIELDS = [
  "name", "qualification", "specialty", "hospital", "department", "city", "state",
  "tier", "priority", "status", "email", "phone", "preferredTime",
  "prescribingPotential", "productsOfInterest", "notes", "avatar",
];

const toApiHCP = (hcp) =>
  Object.fromEntries(HCP_FIELDS.filter((k) => hcp[k] !== undefined).map((k) => [k, hcp[k]]));

const fromApiHCP = (h) => h;

export const listHCPs = async () => (await fetchAll("/hcps")).map(fromApiHCP);

export const createHCP = async (hcp) =>
  fromApiHCP((await api.post("/hcps", toApiHCP(hcp))).data);

export const updateHCP = async (hcp) =>
  fromApiHCP((await api.patch(`/hcps/${hcp.id}`, toApiHCP(hcp))).data);

export const deleteHCP = async (id) => {
  await api.delete(`/hcps/${id}`);
  return id;
};

// ---- Interactions ----

const fromApiInteraction = (i) => {
  const at = new Date(i.occurredAt);
  return {
    id: i.id,
    hcpId: i.hcpId,
    doctorName: i.hcpName,
    specialty: i.hcpSpecialty,
    hospital: i.hcpHospital,
    date: at.toLocaleDateString("en-CA"),
    time: at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    visitType: i.channel,
    products: i.products,
    rawNotes: i.notes,
    objections: i.objections,
    sentiment: i.sentiment,
    followUpDate: i.followUpDate,
    aiSummary: {
      doctorName: i.hcpName,
      hospital: i.hcpHospital,
      productsDiscussed: i.products,
      summary: i.summary,
      sentiment: i.sentiment,
      followUpAction: i.followUpAction,
    },
  };
};

export const listInteractions = async () =>
  (await fetchAll("/interactions")).map(fromApiInteraction);

export const createInteraction = async (payload) =>
  fromApiInteraction((await api.post("/interactions", payload)).data);

export const deleteInteraction = async (id) => {
  await api.delete(`/interactions/${id}`);
  return id;
};

// ---- Follow-ups ----

export const listFollowUps = async (status) => {
  const items = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await api.get("/follow-ups", {
      params: { limit: PAGE_SIZE, offset, ...(status ? { status } : {}) },
    });
    items.push(...data.items);
    if (data.items.length === 0 || items.length >= data.total) return items;
  }
};

export const updateFollowUp = async (id, patch) => (await api.patch(`/follow-ups/${id}`, patch)).data;

// ---- Search, team, export ----

export const searchHCPs = async (q, signal) =>
  (await api.get("/hcps", { params: { q, limit: 6 }, signal })).data.items;

export const getTeamActivity = async () => (await api.get("/team/activity")).data;

/** Downloads a server-generated CSV (scoped to the signed-in user's role). */
export const downloadCsv = async (path) => {
  const res = await api.get(path, { responseType: "blob" });
  const filename =
    /filename="([^"]+)"/.exec(res.headers["content-disposition"] || "")?.[1] || "export.csv";
  const url = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return filename;
};
