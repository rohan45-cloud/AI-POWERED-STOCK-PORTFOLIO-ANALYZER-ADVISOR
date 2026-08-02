import api from "./client.js";

export const insightsApi = {
  getInsights: () => api.get("/insights").then((res) => res.data),
};
