import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "../../utils/format.js";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 text-[var(--color-ink-3)]">{label}</p>
      <p className="font-mono tabular text-[var(--color-ink-1)]">
        Value: {formatCurrency(point.totalCurrentValue)}
      </p>
      <p
        className={`font-mono tabular ${
          point.totalProfitLoss >= 0
            ? "text-[var(--color-gain)]"
            : "text-[var(--color-loss)]"
        }`}
      >
        P&L: {formatCurrency(point.totalProfitLoss)}
      </p>
    </div>
  );
}

/**
 * Renders portfolio value over time from daily snapshots. Shows an empty
 * state if there's less than 2 data points (a single point can't form a
 * meaningful trend line).
 */
export default function PerformanceChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-line)] text-center">
        <p className="text-sm text-[var(--color-ink-2)]">
          Performance history will appear here once your portfolio has been
          tracked for a couple of days.
        </p>
      </div>
    );
  }

  const data = history.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    totalCurrentValue: point.totalCurrentValue,
    totalProfitLoss: point.totalProfitLoss,
  }));

  const isPositive =
    data[data.length - 1].totalCurrentValue >= data[0].totalCurrentValue;

  return (
    <div className="h-72 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-1)] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
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
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="totalCurrentValue"
            name="Portfolio Value"
            stroke={isPositive ? "var(--color-gain)" : "var(--color-loss)"}
            strokeWidth={2}
            fill="url(#perfGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
