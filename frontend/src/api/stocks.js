import api from "./client.js";

export const stocksApi = {
<<<<<<< HEAD
  getQuote: (symbol) =>
    api.get(`/stocks/quote/${symbol}`).then((res) => res.data),
  getBatchQuotes: (symbols) =>
    api
      .get(`/stocks/quotes`, { params: { symbols: symbols.join(",") } })
      .then((res) => res.data),
  getProfile: (symbol) =>
    api.get(`/stocks/profile/${symbol}`).then((res) => res.data),
  getCandles: (symbol, days = 60) =>
    api
      .get(`/stocks/candles/${symbol}`, { params: { days } })
      .then((res) => res.data),
  getNews: (symbol) =>
    api.get(`/stocks/news/${symbol}`).then((res) => res.data),
  getDetail: (symbol, days = 90) =>
    api
      .get(`/stocks/detail/${symbol}`, { params: { days } })
      .then((res) => res.data),
};
=======
    getQuote: (symbol) =>
        api.get(`/stocks/quote/${symbol}`).then((res) => res.data),
    getBatchQuotes: (symbols) =>
        api
        .get(`/stocks/quotes`, { params: { symbols: symbols.join(",") } })
        .then((res) => res.data),
    getProfile: (symbol) =>
        api.get(`/stocks/profile/${symbol}`).then((res) => res.data),
    getCandles: (symbol, days = 60) =>
        api
        .get(`/stocks/candles/${symbol}`, { params: { days } })
        .then((res) => res.data),
    getNews: (symbol) =>
        api.get(`/stocks/news/${symbol}`).then((res) => res.data),
    getDetail: (symbol, days = 90) =>
        api
        .get(`/stocks/detail/${symbol}`, { params: { days } })
        .then((res) => res.data),
};
>>>>>>> 7e8e71fb96d264e4c700db1e196f0c9b90176e58
