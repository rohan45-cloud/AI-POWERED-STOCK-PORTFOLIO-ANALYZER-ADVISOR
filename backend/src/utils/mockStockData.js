/**
 * Deterministic-ish mock data so the app is fully usable in development
 * before a Finnhub API key is configured. Prices wiggle slightly on each
 * call (within a seeded range) to simulate "live" movement without being
 * literally random/unstable across renders.
 */
const MOCK_BASE_PRICES = {
    AAPL: 195.4,
    MSFT: 420.1,
    GOOGL: 175.8,
    AMZN: 185.2,
    TSLA: 248.5,
    NVDA: 135.6,
    META: 510.3,
    JPM: 215.7,
    V: 275.4,
    DIS: 112.3,
};

const seededWiggle = (symbol) => {
    // Simple hash of symbol + current minute so the price changes gently
    // over time but isn't wildly different between consecutive calls.
    const minuteBucket = Math.floor(Date.now() / 60000);
    let hash = 0;
    const str = symbol + minuteBucket;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) % 10000;
    }
    return (hash / 10000 - 0.5) * 0.06; // +/- 3% wiggle
};

export const getMockQuote = (symbol) => {
    const base = MOCK_BASE_PRICES[symbol] ?? (100 + (symbol.charCodeAt(0) % 50));
    const wiggle = seededWiggle(symbol);
    const current = Number((base * (1 + wiggle)).toFixed(2));
    const previousClose = base;
    const change = Number((current - previousClose).toFixed(2));
    const changePercent = Number(((change / previousClose) * 100).toFixed(2));

    return {
        symbol,
        current,
        high: Number((current * 1.015).toFixed(2)),
        low: Number((current * 0.985).toFixed(2)),
        open: previousClose,
        previousClose,
        change,
        changePercent,
        isMock: true,
    };
};

export const getMockProfile = (symbol) => ({
    symbol,
    name: MOCK_COMPANY_NAMES[symbol] || `${symbol} Inc.`,
    industry: "Technology",
    marketCapitalization: 500000 + (symbol.charCodeAt(0) % 10) * 100000,
    logo: "",
    weburl: "",
    isMock: true,
});

const MOCK_COMPANY_NAMES = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    TSLA: "Tesla Inc.",
    NVDA: "NVIDIA Corporation",
    META: "Meta Platforms Inc.",
    JPM: "JPMorgan Chase & Co.",
    V: "Visa Inc.",
    DIS: "The Walt Disney Company",
};

export const getMockCandles = (symbol, days = 30) => {
    const base = MOCK_BASE_PRICES[symbol] ?? 100;
    const closes = [];
    const timestamps = [];
    let price = base * 0.92;

    for (let i = days; i >= 0; i--) {
        // gentle upward-biased random walk so indicators have something to chew on
        const drift = (Math.sin(i * 0.3) + (i % 7 === 0 ? 0.4 : 0)) * 0.01;
        price = price * (1 + drift);
        closes.push(Number(price.toFixed(2)));
        timestamps.push(Math.floor(Date.now() / 1000) - i * 86400);
    }

    return {
        c: closes,
        t: timestamps,
        s: "ok",
        isMock: true,
    };
};

export const getMockNews = (symbol) => {
    const headlines = [
        `${symbol} shares move on broader market sentiment`,
        `Analysts weigh in on ${symbol}'s latest quarter`,
        `What's next for ${symbol} after recent volatility`,
        `${symbol} trading volume picks up this week`,
    ];
    return headlines.map((headline, i) => ({
        id: `mock-${symbol}-${i}`,
        headline,
        summary: "This is placeholder news used in development mode. Configure FINNHUB_API_KEY to fetch real news.",
        source: "Mock Feed",
        url: "",
        datetime: Math.floor(Date.now() / 1000) - i * 3600,
        isMock: true,
    }));
};