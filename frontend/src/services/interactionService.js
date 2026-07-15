import api from "./api";

export const askAI = async (notes) => {
  const response = await api.post("/interaction/ai", {
    notes,
  });

  return response.data;
};