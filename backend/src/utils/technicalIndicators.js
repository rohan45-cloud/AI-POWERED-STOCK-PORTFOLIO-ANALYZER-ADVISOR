/**
 * Pure functions for common technical indicators, computed from an array
 * of closing prices (oldest first). Used to enrich the stock detail page
 * and, later, the AI insights module's recommendation scoring.
 */

/**
 * Simple Moving Average over the last `period` closes.
 * Returns an array the same length as `closes`, with `null` for indices
 * where there isn't enough preceding data yet.
 */
export const calculateSMA = (closes, period) => {
    return closes.map((_, i) => {
        if (i < period - 1) return null;
        const window = closes.slice(i - period + 1, i + 1);
        const sum = window.reduce((a, b) => a + b, 0);
        return Number((sum / period).toFixed(2));
    });
};

/**
 * Relative Strength Index (Wilder's smoothing), standard 14-period default.
 * Returns an array aligned with `closes`; early indices are `null` until
 * enough data exists to compute the first average gain/loss.
 */
export const calculateRSI = (closes, period = 14) => {
    if (closes.length < period + 1) {
        return closes.map(() => null);
    }

    const rsi = new Array(closes.length).fill(null);
    const gains = [];
    const losses = [];

    for (let i = 1; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1];
        gains.push(Math.max(change, 0));
        losses.push(Math.max(-change, 0));
    }

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    rsi[period] = computeRsiValue(avgGain, avgLoss);

    for (let i = period; i < gains.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        rsi[i + 1] = computeRsiValue(avgGain, avgLoss);
    }

    return rsi;
};

function computeRsiValue(avgGain, avgLoss) {
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return Number((100 - 100 / (1 + rs)).toFixed(2));
}

/**
 * Latest-value summary used by the AI scoring engine and the detail page's
 * "at a glance" indicator panel. Returns nulls gracefully if there isn't
 * enough history yet, rather than throwing.
 */
export const getIndicatorSnapshot = (closes) => {
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const rsi14 = calculateRSI(closes, 14);

    const lastClose = closes[closes.length - 1] ?? null;
    const lastSma20 = sma20[sma20.length - 1];
    const lastSma50 = sma50[sma50.length - 1];
    const lastRsi = rsi14[rsi14.length - 1];

    let trend = "neutral";
    if (lastSma20 !== null && lastSma50 !== null) {
        trend = lastSma20 > lastSma50 ? "bullish" : lastSma20 < lastSma50 ? "bearish" : "neutral";
    }

    let rsiSignal = "neutral";
    if (lastRsi !== null) {
        if (lastRsi >= 70) rsiSignal = "overbought";
        else if (lastRsi <= 30) rsiSignal = "oversold";
    }

    return {
        lastClose,
        sma20: lastSma20,
        sma50: lastSma50,
        rsi14: lastRsi,
        trend,
        rsiSignal,
    };
};