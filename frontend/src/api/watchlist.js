import api from "./client.js";
<<<<<<< HEAD
=======

>>>>>>> 7e8e71fb96d264e4c700db1e196f0c9b90176e58
export const watchlistApi = {
    getWatchlist: () => api.get("/watchlist").then((res) => res.data),
    addToWatchlist: (data) => api.post("/watchlist", data).then((res) => res.data),
    updateWatchlistItem: (id, data) =>
        api.patch(`/watchlist/${id}`, data).then((res) => res.data),
    removeFromWatchlist: (id) =>
        api.delete(`/watchlist/${id}`).then((res) => res.data),
};