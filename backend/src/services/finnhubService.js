import axios from "axios";
import cache from "../utils/cache.js";
import {
  getMockQuote,
  getMockProfile,
  getMockCandles,
  getMockNews,
} from "../utils/mockStockData.js";

const BASE_URL = "https://finnhub.io/api/v1";

// Cache TTLs, in seconds. Quotes change fastest so they get the shortest TTL;
// profile/company data barely changes so it's cached much longer.
const TTL = {
  QUOTE: 30,
  PROFILE: 60 * 60 * 24, // 24h
  CANDLES: 60 * 15, // 15 min
  NEWS: 60 * 10, // 10 min
};

const hasApiKey = () =>
  Boolean(process.env.FINNHUB_API_KEY && process.env.FINNHUB_API_KEY !== "your_finnhub_api_key_here");

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

const withToken = (params = {}) => ({
  ...params,
  token: process.env.FINNHUB_API_KEY,
});

/**
 * Fetches a real-time quote for a symbol. Falls back to deterministic mock
 * data if no API key is configured, or if the live call fails (e.g. rate
 * limited), so the rest of the app keeps working in development.
 */
export const getQuote = async (symbol) => {
  const cacheKey = `quote:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) {
    const mock = getMockQuote(symbol);
    cache.set(cacheKey, mock, TTL.QUOTE);
    return mock;
  }

  try {
    const { data } = await client.get("/quote", {
      params: withToken({ symbol }),
    });

    // Finnhub returns all zeros for an invalid/unknown symbol rather than a 404
    if (data.c === 0 && data.pc === 0) {
      throw new Error(`No quote data for symbol "${symbol}"`);
    }

    const quote = {
      symbol,
      current: data.c,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      change: data.d,
      changePercent: data.dp,
      isMock: false,
    };

    cache.set(cacheKey, quote, TTL.QUOTE);
    return quote;
  } catch (err) {
    console.warn(`Finnhub quote fetch failed for ${symbol}, using mock data:`, err.message);
    const mock = getMockQuote(symbol);
    cache.set(cacheKey, mock, TTL.QUOTE);
    return mock;
  }
};

/**
 * Fetches quotes for multiple symbols in parallel, respecting the cache
 * per-symbol so repeated dashboard polls don't burn through rate limits.
 */
export const getQuotes = async (symbols) => {
  const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const results = await Promise.all(uniqueSymbols.map((s) => getQuote(s)));
  return Object.fromEntries(uniqueSymbols.map((s, i) => [s, results[i]]));
};

export const getCompanyProfile = async (symbol) => {
  const cacheKey = `profile:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) {
    const mock = getMockProfile(symbol);
    cache.set(cacheKey, mock, TTL.PROFILE);
    return mock;
  }

  try {
    const { data } = await client.get("/stock/profile2", {
      params: withToken({ symbol }),
    });

    if (!data || !data.name) {
      throw new Error(`No profile data for symbol "${symbol}"`);
    }

    const profile = {
      symbol,
      name: data.name,
      industry: data.finnhubIndustry,
      marketCapitalization: data.marketCapitalization,
      logo: data.logo,
      weburl: data.weburl,
      isMock: false,
    };

    cache.set(cacheKey, profile, TTL.PROFILE);
    return profile;
  } catch (err) {
    console.warn(`Finnhub profile fetch failed for ${symbol}, using mock data:`, err.message);
    const mock = getMockProfile(symbol);
    cache.set(cacheKey, mock, TTL.PROFILE);
    return mock;
  }
};

/**
 * Fetches daily candle (OHLC) data for the last `days` days.
 * Used by the technical-indicator scoring in the AI insights module.
 */
export const getCandles = async (symbol, days = 60) => {
  const cacheKey = `candles:${symbol}:${days}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) {
    const mock = getMockCandles(symbol, days);
    cache.set(cacheKey, mock, TTL.CANDLES);
    return mock;
  }

  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - days * 86400;

    const { data } = await client.get("/stock/candle", {
      params: withToken({ symbol, resolution: "D", from, to }),
    });

    if (data.s !== "ok") {
      throw new Error(`No candle data for symbol "${symbol}" (status: ${data.s})`);
    }

    const candles = { c: data.c, t: data.t, s: data.s, isMock: false };
    cache.set(cacheKey, candles, TTL.CANDLES);
    return candles;
  } catch (err) {
    console.warn(`Finnhub candle fetch failed for ${symbol}, using mock data:`, err.message);
    const mock = getMockCandles(symbol, days);
    cache.set(cacheKey, mock, TTL.CANDLES);
    return mock;
  }
};

/**
 * Fetches recent company news with Finnhub's built-in sentiment is NOT
 * included here (that requires the /news-sentiment endpoint, which is
 * used separately in the AI insights module). This returns raw headlines.
 */
export const getCompanyNews = async (symbol, daysBack = 7) => {
  const cacheKey = `news:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!hasApiKey()) {
    const mock = getMockNews(symbol);
    cache.set(cacheKey, mock, TTL.NEWS);
    return mock;
  }

  try {
    const to = new Date();
    const from = new Date(Date.now() - daysBack * 86400 * 1000);
    const fmt = (d) => d.toISOString().split("T")[0];

    const { data } = await client.get("/company-news", {
      params: withToken({
        symbol,
        from: fmt(from),
        to: fmt(to),
      }),
    });

    const news = (Array.isArray(data) ? data : [])
      .slice(0, 10)
      .map((item) => ({
        id: String(item.id),
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
        datetime: item.datetime,
        isMock: false,
      }));

    cache.set(cacheKey, news, TTL.NEWS);
    return news;
  } catch (err) {
    console.warn(`Finnhub news fetch failed for ${symbol}, using mock data:`, err.message);
    const mock = getMockNews(symbol);
    cache.set(cacheKey, mock, TTL.NEWS);
    return mock;
  }
};

export const isUsingLiveData = () => hasApiKey();
