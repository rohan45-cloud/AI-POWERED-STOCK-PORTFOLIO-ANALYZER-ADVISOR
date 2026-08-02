import Holding from "../models/Holding.js";
import Transaction from "../models/Transaction.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { getPortfolioForUser } from "../services/portfolioService.js";
import { getQuotes } from "../services/finnhubService.js";
import { captureSnapshot, getSnapshotHistory } from "../services/portfolioSnapshotService.js";

/**
 * @route   GET /api/v1/portfolio
 * @desc    Returns all holdings for the logged-in user plus computed summary
 * @access  Private
 */
export const getPortfolio = catchAsync(async (req, res) => {
  const data = await getPortfolioForUser(req.user._id);

  // Fire-and-forget: record today's snapshot for the performance chart.
  // Not awaited so a snapshot-write hiccup never delays or breaks the
  // portfolio response the user is actually waiting on.
  if (data.summary.holdingsCount > 0) {
    captureSnapshot(req.user._id).catch((err) =>
      console.error("Failed to capture portfolio snapshot:", err.message)
    );
  }

  res.status(200).json({ success: true, ...data });
});

/**
 * @route   POST /api/v1/portfolio/holdings
 * @desc    Add a new holding. If the symbol already exists for this user,
 *          average the buy price into the existing position instead of
 *          creating a duplicate (mirrors how brokerages handle repeat buys).
 * @access  Private
 */
export const addHolding = catchAsync(async (req, res, next) => {
  const {
    symbol,
    companyName,
    quantity,
    avgBuyPrice,
    currentPrice,
    sector,
    purchaseDate,
    notes,
  } = req.body;

  const normalizedSymbol = symbol.toUpperCase().trim();

  const existing = await Holding.findOne({
    user: req.user._id,
    symbol: normalizedSymbol,
  });

  if (existing) {
    // Weighted average buy price across old + new quantity
    const totalQuantity = existing.quantity + Number(quantity);
    const totalCost =
      existing.quantity * existing.avgBuyPrice +
      Number(quantity) * Number(avgBuyPrice);

    existing.quantity = totalQuantity;
    existing.avgBuyPrice = totalCost / totalQuantity;
    if (currentPrice !== undefined) existing.currentPrice = currentPrice;
    if (companyName) existing.companyName = companyName;
    if (sector) existing.sector = sector;

    await existing.save();

    await Transaction.create({
      user: req.user._id,
      holding: existing._id,
      symbol: normalizedSymbol,
      type: "BUY",
      quantity: Number(quantity),
      price: Number(avgBuyPrice),
      notes,
    });

    return res.status(200).json({
      success: true,
      message: `Added to existing ${normalizedSymbol} position.`,
      holding: existing,
    });
  }

  const holding = await Holding.create({
    user: req.user._id,
    symbol: normalizedSymbol,
    companyName,
    quantity,
    avgBuyPrice,
    currentPrice: currentPrice ?? avgBuyPrice,
    sector,
    purchaseDate,
    notes,
  });

  await Transaction.create({
    user: req.user._id,
    holding: holding._id,
    symbol: normalizedSymbol,
    type: "BUY",
    quantity: Number(quantity),
    price: Number(avgBuyPrice),
    notes,
    executedAt: purchaseDate || Date.now(),
  });

  res.status(201).json({ success: true, holding });
});

/**
 * @route   PATCH /api/v1/portfolio/holdings/:id
 * @access  Private
 */
export const updateHolding = catchAsync(async (req, res, next) => {
  const holding = await Holding.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!holding) {
    return next(new AppError("Holding not found.", 404));
  }

  const allowedFields = [
    "quantity",
    "avgBuyPrice",
    "currentPrice",
    "companyName",
    "sector",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      holding[field] = req.body[field];
    }
  });

  await holding.save();

  res.status(200).json({ success: true, holding });
});

/**
 * @route   DELETE /api/v1/portfolio/holdings/:id
 * @access  Private
 */
export const deleteHolding = catchAsync(async (req, res, next) => {
  const holding = await Holding.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!holding) {
    return next(new AppError("Holding not found.", 404));
  }

  // Removing a holding entirely is logged as a full SELL at current price
  // (or avg buy price if no current price is set), so transaction history
  // stays complete even when a position is closed via "Remove" rather than
  // the dedicated sell flow.
  await Transaction.create({
    user: req.user._id,
    symbol: holding.symbol,
    type: "SELL",
    quantity: holding.quantity,
    price: holding.currentPrice ?? holding.avgBuyPrice,
    notes: "Position removed",
  });

  await holding.deleteOne();

  res.status(200).json({ success: true, message: "Holding removed." });
});

/**
 * @route   POST /api/v1/portfolio/holdings/:id/sell
 * @desc    Sells a specified quantity from a holding. If the sold quantity
 *          equals the full position, the holding is deleted; otherwise the
 *          remaining quantity is reduced. Always logs a SELL transaction.
 * @access  Private
 */
export const sellHolding = catchAsync(async (req, res, next) => {
  const { quantity, price } = req.body;
  const sellQuantity = Number(quantity);

  if (!sellQuantity || sellQuantity <= 0) {
    return next(new AppError("Sell quantity must be greater than 0.", 400));
  }

  const holding = await Holding.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!holding) {
    return next(new AppError("Holding not found.", 404));
  }

  if (sellQuantity > holding.quantity) {
    return next(
      new AppError(
        `Cannot sell ${sellQuantity} shares — you only hold ${holding.quantity}.`,
        400
      )
    );
  }

  const sellPrice = price !== undefined ? Number(price) : holding.currentPrice ?? holding.avgBuyPrice;

  await Transaction.create({
    user: req.user._id,
    holding: holding._id,
    symbol: holding.symbol,
    type: "SELL",
    quantity: sellQuantity,
    price: sellPrice,
  });

  const remainingQuantity = holding.quantity - sellQuantity;

  if (remainingQuantity <= 0) {
    await holding.deleteOne();
    return res.status(200).json({
      success: true,
      message: `Sold full position in ${holding.symbol}.`,
      holding: null,
    });
  }

  holding.quantity = remainingQuantity;
  await holding.save();

  res.status(200).json({
    success: true,
    message: `Sold ${sellQuantity} shares of ${holding.symbol}.`,
    holding,
  });
});

/**
 * @route   GET /api/v1/portfolio/performance?days=90
 * @desc    Returns daily portfolio value snapshots for charting performance
 *          over time.
 * @access  Private
 */
export const getPerformanceHistory = catchAsync(async (req, res) => {
  const days = Math.min(Number(req.query.days) || 90, 365);
  const history = await getSnapshotHistory(req.user._id, days);
  res.status(200).json({ success: true, history });
});

/**
 * @route   GET /api/v1/portfolio/transactions
 * @desc    Returns the logged-in user's full buy/sell transaction history,
 *          most recent first. Optional ?symbol=AAPL filters to one stock.
 * @access  Private
 */
export const getTransactionHistory = catchAsync(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.symbol) {
    filter.symbol = req.query.symbol.toUpperCase();
  }

  const transactions = await Transaction.find(filter)
    .sort({ executedAt: -1 })
    .limit(200);

  res.status(200).json({ success: true, transactions });
});

/**
 * @route   POST /api/v1/portfolio/refresh-prices
 * @desc    Fetches live quotes for every symbol the user holds and updates
 *          each holding's currentPrice in one batch, then returns the
 *          recomputed portfolio summary.
 * @access  Private
 */
export const refreshPrices = catchAsync(async (req, res) => {
  const holdings = await Holding.find({ user: req.user._id });

  if (holdings.length === 0) {
    const data = await getPortfolioForUser(req.user._id);
    return res.status(200).json({ success: true, ...data });
  }

  const symbols = holdings.map((h) => h.symbol);
  const quotes = await getQuotes(symbols);

  await Promise.all(
    holdings.map((h) => {
      const quote = quotes[h.symbol];
      if (quote && quote.current) {
        h.currentPrice = quote.current;
        return h.save();
      }
      return Promise.resolve();
    })
  );

  const data = await getPortfolioForUser(req.user._id);
  res.status(200).json({
    success: true,
    ...data,
    pricesUpdatedAt: new Date().toISOString(),
  });
});
