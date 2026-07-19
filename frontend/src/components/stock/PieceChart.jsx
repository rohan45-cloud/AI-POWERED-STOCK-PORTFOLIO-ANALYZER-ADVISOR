import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "../../utils/format.js";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 text-[var(--color-ink-3)]">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="font-mono tabular"
          style={{ color: entry.color }}
        >
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

/**
 * Renders closing-price history as an area chart, with optional SMA20/SMA50
 * overlay lines. Data must already be aligned: candles, sma20, sma50 arrays
 * of equal length, oldest first.
 */
export default function PriceChart({ timestamps, closes, sma20, sma50 }) {
  const data = timestamps.map((t, i) => ({
    date: new Date(t * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    close: closes[i],
    sma20: sma20?.[i] ?? null,
    sma50: sma50?.[i] ?? null,
  }));

  const isPositive =
    data.length > 1 && data[data.length - 1].close >= data[0].close;

  return (
    <div className="h-80 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-1)] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? "var(--color-gain)" : "var(--color-loss)"}
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? "var(--color-gain)" : "var(--color-loss)"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-line-soft)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--color-ink-3)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-line)" }}
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: "var(--color-ink-3)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="close"
            name="Price"
            stroke={isPositive ? "var(--color-gain)" : "var(--color-loss)"}
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
          {sma20 && (
            <Line
              type="monotone"
              dataKey="sma20"
              name="SMA 20"
              stroke="var(--color-accent)"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          )}
          {sma50 && (
            <Line
              type="monotone"
              dataKey="sma50"
              name="SMA 50"
              stroke="var(--color-ink-2)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              connectNulls
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
