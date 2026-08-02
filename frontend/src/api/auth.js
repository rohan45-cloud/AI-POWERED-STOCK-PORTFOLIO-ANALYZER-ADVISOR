import api from "./client.js";

export const authApi = {
<<<<<<< HEAD
  signup: (data) => api.post("/auth/signup", data).then((res) => res.data),
  login: (data) => api.post("/auth/login", data).then((res) => res.data),
  logout: () => api.post("/auth/logout").then((res) => res.data),
  getMe: () => api.get("/auth/me").then((res) => res.data),
};
=======
    signup: (data) => api.post("/auth/signup", data).then((res) => res.data),
    login: (data) => api.post("/auth/login", data).then((res) => res.data),
    logout: () => api.post("/auth/logout").then((res) => res.data),
    getMe: () => api.get("/auth/me").then((res) => res.data),
};
>>>>>>> 7e8e71fb96d264e4c700db1e196f0c9b90176e58
