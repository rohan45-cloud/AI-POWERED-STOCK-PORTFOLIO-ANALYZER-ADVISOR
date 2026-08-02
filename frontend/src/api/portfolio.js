import api from "./client.js";

export const portfolioApi = {
  getPortfolio: () => api.get("/portfolio").then((res) => res.data),
  addHolding: (data) =>
    api.post("/portfolio/holdings", data).then((res) => res.data),
  updateHolding: (id, data) =>
    api.patch(`/portfolio/holdings/${id}`, data).then((res) => res.data),
  deleteHolding: (id) =>
    api.delete(`/portfolio/holdings/${id}`).then((res) => res.data),
  sellHolding: (id, data) =>
    api.post(`/portfolio/holdings/${id}/sell`, data).then((res) => res.data),
  getTransactions: (symbol) =>
    api
      .get("/portfolio/transactions", { params: symbol ? { symbol } : {} })
      .then((res) => res.data),
  getPerformance: (days = 90) =>
    api
      .get("/portfolio/performance", { params: { days } })
      .then((res) => res.data),
};
