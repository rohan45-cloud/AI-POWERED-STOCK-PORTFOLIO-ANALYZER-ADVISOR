import Watchlist from "../models/Watchlist.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { getQuotes } from "../services/finnhubService.js";

/**
 * @route   GET /api/v1/watchlist
 * @desc    Returns all watched symbols enriched with a live quote each.
 * @access  Private
 */
export const getWatchlist = catchAsync(async (req, res) => {
  const items = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 });

  if (items.length === 0) {
    return res.status(200).json({ success: true, watchlist: [] });
  }

  const symbols = items.map((i) => i.symbol);
  const quotes = await getQuotes(symbols);

  const enriched = items.map((item) => ({
    id: item._id,
    symbol: item.symbol,
    companyName: item.companyName,
    note: item.note,
    targetPrice: item.targetPrice,
    alertDirection: item.alertDirection,
    alertEnabled: item.alertEnabled,
    alertTriggeredAt: item.alertTriggeredAt,
    quote: quotes[item.symbol] || null,
    addedAt: item.createdAt,
  }));

  res.status(200).json({ success: true, watchlist: enriched });
});

/**
 * @route   POST /api/v1/watchlist
 * @access  Private
 */
export const addToWatchlist = catchAsync(async (req, res, next) => {
  const { symbol, companyName, note, targetPrice, alertDirection } = req.body;
  const normalizedSymbol = symbol.toUpperCase().trim();

  const existing = await Watchlist.findOne({
    user: req.user._id,
    symbol: normalizedSymbol,
  });
  if (existing) {
    return next(new AppError(`${normalizedSymbol} is already on your watchlist.`, 409));
  }

  const item = await Watchlist.create({
    user: req.user._id,
    symbol: normalizedSymbol,
    companyName,
    note,
    targetPrice,
    alertDirection: alertDirection || "above",
  });

  res.status(201).json({ success: true, watchlist: item });
});

/**
 * @route   PATCH /api/v1/watchlist/:id
 * @access  Private
 */
export const updateWatchlistItem = catchAsync(async (req, res, next) => {
  const item = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) {
    return next(new AppError("Watchlist item not found.", 404));
  }

  const allowedFields = [
    "note",
    "targetPrice",
    "companyName",
    "alertDirection",
    "alertEnabled",
  ];

  // If targetPrice or alertDirection changes, re-arm the alert so it can
  // fire again under the new condition rather than staying "triggered"
  // from a previous, now-irrelevant target. Coerce targetPrice to Number
  // before comparing — request bodies may send it as a string.
  const incomingTargetPrice =
    req.body.targetPrice !== undefined ? Number(req.body.targetPrice) : undefined;
  const isRetargeting =
    (incomingTargetPrice !== undefined && incomingTargetPrice !== item.targetPrice) ||
    (req.body.alertDirection !== undefined && req.body.alertDirection !== item.alertDirection);

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      item[field] = req.body[field];
    }
  });

  if (isRetargeting) {
    item.alertTriggeredAt = null;
  }

  await item.save();
  res.status(200).json({ success: true, watchlist: item });
});

/**
 * @route   DELETE /api/v1/watchlist/:id
 * @access  Private
 */
export const removeFromWatchlist = catchAsync(async (req, res, next) => {
  const item = await Watchlist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) {
    return next(new AppError("Watchlist item not found.", 404));
  }
  res.status(200).json({ success: true, message: "Removed from watchlist." });
});
