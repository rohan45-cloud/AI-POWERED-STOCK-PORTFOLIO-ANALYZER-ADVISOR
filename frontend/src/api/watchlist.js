import api from "./client.js";
export const watchlistApi = {
    getWatchlist: () => api.get("/watchlist").then((res) => res.data),
    addToWatchlist: (data) => api.post("/watchlist", data).then((res) => res.data),
    updateWatchlistItem: (id, data) =>
        api.patch(`/watchlist/${id}`, data).then((res) => res.data),
    removeFromWatchlist: (id) =>
        api.delete(`/watchlist/${id}`).then((res) => res.data),
};