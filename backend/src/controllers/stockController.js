import * as finnhubService from "../services/finnhubService.js";
import { getIndicatorSnapshot, calculateSMA, calculateRSI } from "../utils/technicalIndicators.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

/**
 * @route   GET /api/v1/stocks/quote/:symbol
 * @access  Private
 */
export const getQuote = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();
  const quote = await finnhubService.getQuote(symbol);
  res.status(200).json({ success: true, quote, isLiveData: finnhubService.isUsingLiveData() });
});

/**
 * @route   GET /api/v1/stocks/profile/:symbol
 * @access  Private
 */
export const getProfile = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();
  const profile = await finnhubService.getCompanyProfile(symbol);
  res.status(200).json({ success: true, profile, isLiveData: finnhubService.isUsingLiveData() });
});

/**
 * @route   GET /api/v1/stocks/candles/:symbol?days=60
 * @access  Private
 */
export const getCandles = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();
  const days = Math.min(Number(req.query.days) || 60, 365);
  const candles = await finnhubService.getCandles(symbol, days);
  res.status(200).json({ success: true, candles, isLiveData: finnhubService.isUsingLiveData() });
});

/**
 * @route   GET /api/v1/stocks/news/:symbol
 * @access  Private
 */
export const getNews = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();
  const news = await finnhubService.getCompanyNews(symbol);
  res.status(200).json({ success: true, news, isLiveData: finnhubService.isUsingLiveData() });
});

/**
 * @route   GET /api/v1/stocks/quotes?symbols=AAPL,MSFT,GOOGL
 * @desc    Batch quote fetch — used by the dashboard to refresh all
 *          holdings' prices in a single request instead of one per row.
 * @access  Private
 */
export const getBatchQuotes = catchAsync(async (req, res, next) => {
  const symbolsParam = req.query.symbols;
  if (!symbolsParam) {
    return next(new AppError("Query param 'symbols' is required (comma-separated).", 400));
  }
  const symbols = symbolsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (symbols.length === 0) {
    return next(new AppError("At least one symbol is required.", 400));
  }
  if (symbols.length > 50) {
    return next(new AppError("Too many symbols requested at once (max 50).", 400));
  }

  const quotes = await finnhubService.getQuotes(symbols);
  res.status(200).json({ success: true, quotes, isLiveData: finnhubService.isUsingLiveData() });
});

/**
 * @route   GET /api/v1/stocks/detail/:symbol?days=90
 * @desc    One-call combined payload for the stock detail page: quote,
 *          company profile, candle history, computed technical indicator
 *          series (SMA20, SMA50, RSI14), a snapshot summary, and recent
 *          news. Saves the frontend from firing 4 separate requests on
 *          page load.
 * @access  Private
 */
export const getStockDetail = catchAsync(async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const days = Math.min(Number(req.query.days) || 90, 365);

  const [quote, profile, candles, news] = await Promise.all([
    finnhubService.getQuote(symbol),
    finnhubService.getCompanyProfile(symbol),
    finnhubService.getCandles(symbol, days),
    finnhubService.getCompanyNews(symbol),
  ]);

  const closes = candles.c || [];
  const indicators = {
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    rsi14: calculateRSI(closes, 14),
    snapshot: getIndicatorSnapshot(closes),
  };

  res.status(200).json({
    success: true,
    symbol,
    quote,
    profile,
    candles,
    indicators,
    news,
    isLiveData: finnhubService.isUsingLiveData(),
  });
});
