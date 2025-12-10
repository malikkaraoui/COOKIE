import { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

const DEFAULT_TIMEFRAMES = [5, 10, 15, 20]
const percentFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1
})

const formatPercent = (value) => {
  if (!Number.isFinite(value)) {
    return '--'
  }
  const formatted = percentFormatter.format(value)
  return value > 0 ? `+${formatted}` : formatted
}

export default function KitchenPerformanceChart({
  tokensData = [],
  weights = {},
  timeframes = DEFAULT_TIMEFRAMES,
  historyData = null,
  ccxtHistoryData = {},
  historyLoading = false,
  historyError = null
}) {
  const displayTokens = useMemo(() => {
    return tokensData.filter((token) => token?.symbol)
  }, [tokensData])

  const weightableTokens = useMemo(() => {
    return displayTokens.filter((token) => token?.source !== 'binance')
  }, [displayTokens])

  const normalizedWeights = useMemo(() => {
    if (!weightableTokens.length) {
      return {}
    }
    const sum = weightableTokens.reduce((acc, token) => acc + (weights?.[token.symbol] ?? 0), 0)
    if (sum > 0.0001) {
      return weightableTokens.reduce((acc, token) => {
        acc[token.symbol] = (weights?.[token.symbol] ?? 0) / sum
        return acc
      }, {})
    }
    const equalWeight = 1 / weightableTokens.length
    return weightableTokens.reduce((acc, token) => {
      acc[token.symbol] = equalWeight
      return acc
    }, {})
  }, [weightableTokens, weights])

  const [selectedDays, setSelectedDays] = useState(() => timeframes?.[0] ?? null)

  const safeSelectedDays = useMemo(() => {
    if (selectedDays != null && timeframes?.includes(selectedDays)) {
      return selectedDays
    }
    return timeframes?.[0] ?? null
  }, [selectedDays, timeframes])

  const performanceData = useMemo(() => {
    return buildPerformanceData({
      tokens: displayTokens,
      rangeDays: safeSelectedDays ?? timeframes?.[0] ?? DEFAULT_TIMEFRAMES[0],
      normalizedWeights,
      hyperliquidHistory: historyData,
      ccxtHistory: ccxtHistoryData
    })
  }, [displayTokens, safeSelectedDays, timeframes, normalizedWeights, historyData, ccxtHistoryData])

  const timeframeLabels = useMemo(() => {
    return timeframes.map((days) => ({
      days,
      label: `${days} jour${days > 1 ? 's' : ''}`
    }))
  }, [timeframes])

  if (!displayTokens.length) {
    return (
      <div className="kitchen-projection-empty">
        Ajoute au moins un token pour visualiser la performance multi-jours.
      </div>
    )
  }

  const hasLineSeries = performanceData.lineData.length >= 2 && performanceData.tokenMeta.length > 0
  const hasPortfolioLine = performanceData.lineData.some((point) => Number.isFinite(point.portfolio))
  const emptyMessage = historyLoading
    ? 'Chargement des historiques…'
    : historyError
      ? (historyError instanceof Error ? historyError.message : String(historyError))
      : 'Aucune donnée historique exploitable pour ces tokens.'

  return (
    <div className="kitchen-projection-wrapper">
      <div className="kitchen-projection-timeframes">
        {timeframeLabels.map((entry) => (
          <button
            key={entry.days}
            type="button"
            className={`kitchen-projection-tab${safeSelectedDays === entry.days ? ' is-active' : ''}`}
            onClick={() => setSelectedDays(entry.days)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {hasLineSeries ? (
        <div className="kitchen-projection-chart">
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={performanceData.lineData} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.2)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(0)}%`}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ProjectionTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 12 }} />
              {performanceData.tokenMeta.map((token) => (
                <Line
                  key={token.key}
                  type="monotone"
                  dataKey={token.key}
                  name={token.name}
                  stroke={token.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
              {hasPortfolioLine && (
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  name="Portefeuille pondéré"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  strokeDasharray="4 2"
                  isAnimationActive={false}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="kitchen-projection-empty">{emptyMessage}</div>
      )}
    </div>
  )
}

function ProjectionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="kitchen-projection-tooltip">
      <strong>{label}</strong>
      <ul>
        {payload.map((entry) => (
          <li key={entry.dataKey}>
            <span style={{ color: entry.color }}>{entry.name || entry.dataKey}</span>
            <span>{formatPercent(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short'
})

function formatDateLabel(timestamp) {
  if (!Number.isFinite(timestamp)) {
    return ''
  }
  try {
    return dateFormatter.format(new Date(timestamp))
  } catch {
    return ''
  }
}

function buildTokenKey(token) {
  const symbol = (token?.symbol || '').toUpperCase()
  if (!symbol) {
    return ''
  }
  const source = token?.source ? String(token.source).toUpperCase() : 'HYPERLIQUID'
  if (source === 'HYPERLIQUID') {
    return symbol
  }
  return `${symbol}-${source}`
}

function getTokenSeries(token, hyperliquidHistory, ccxtHistory) {
  const symbol = token?.symbol
  if (!symbol) {
    return []
  }
  if (token?.source === 'binance') {
    return ccxtHistory?.[symbol.toUpperCase()]?.series ?? []
  }
  return hyperliquidHistory?.[symbol]?.series
    ?? hyperliquidHistory?.[symbol.toUpperCase()]?.series
    ?? []
}

function normalizeSeries(series) {
  if (!Array.isArray(series)) {
    return []
  }
  return series
    .map((entry) => ({
      time: Number(entry?.time ?? entry?.t ?? entry?.timestamp),
      close: Number(entry?.close ?? entry?.c ?? entry?.price)
    }))
    .filter((entry) => Number.isFinite(entry.time) && Number.isFinite(entry.close) && entry.close > 0)
    .sort((a, b) => a.time - b.time)
}

function buildPerformanceData({ tokens, rangeDays, normalizedWeights, hyperliquidHistory, ccxtHistory }) {
  const buckets = new Map()
  const tokenMeta = []
  const safeRange = Math.max(1, rangeDays ?? DEFAULT_TIMEFRAMES[0])

  tokens.forEach((token) => {
    const series = normalizeSeries(getTokenSeries(token, hyperliquidHistory, ccxtHistory))
    if (series.length < 2) {
      return
    }
    const slice = series.slice(-(safeRange + 1))
    if (slice.length < 2) {
      return
    }
    const baseline = slice[0].close
    if (!Number.isFinite(baseline) || baseline <= 0) {
      return
    }

    const key = buildTokenKey(token)
    if (!key) {
      return
    }

    tokenMeta.push({
      key,
      symbol: token.symbol,
      name: token.source === 'binance' ? `${token.symbol} · Binance` : token.symbol,
      color: token.color || '#38bdf8'
    })

    slice.forEach((point) => {
      const label = formatDateLabel(point.time)
      if (!label) {
        return
      }
      let bucket = buckets.get(label)
      if (!bucket) {
        bucket = { label, timestamp: point.time }
        buckets.set(label, bucket)
      }
      bucket[key] = ((point.close - baseline) / baseline) * 100
    })
  })

  const lineData = Array.from(buckets.values()).sort((a, b) => a.timestamp - b.timestamp)

  lineData.forEach((point) => {
    let aggregated = 0
    let weightSum = 0
    tokenMeta.forEach((token) => {
      const weight = normalizedWeights[token.symbol] ?? 0
      const value = point[token.key]
      if (Number.isFinite(weight) && weight > 0 && Number.isFinite(value)) {
        aggregated += weight * value
        weightSum += weight
      }
    })
    if (weightSum > 0) {
      point.portfolio = aggregated
    }
  })

  return {
    lineData,
    tokenMeta
  }
}

