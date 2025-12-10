import { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

const DEFAULT_TIMEFRAMES = [5, 10, 15, 20]
const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})
const percentFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1
})

const clampDailyReturn = (value) => {
  if (!Number.isFinite(value)) {
    return 0
  }
  if (value < -0.95) {
    return -0.95
  }
  if (value > 1) {
    return 1
  }
  return value
}

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
  capital = 1000,
  timeframes = DEFAULT_TIMEFRAMES,
  historyData = null
}) {
  const filteredTokens = useMemo(() => {
    return tokensData.filter((token) => token?.source !== 'binance')
  }, [tokensData])

  const hasHistoricalReturns = useMemo(() => {
    if (!historyData || typeof historyData !== 'object') {
      return false
    }
    return Object.keys(historyData).length > 0
  }, [historyData])

  const normalizedCapital = useMemo(() => {
    const numeric = Number(capital)
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric
    }
    return 1000
  }, [capital])

  const normalizedWeights = useMemo(() => {
    if (!filteredTokens.length) {
      return {}
    }
    const sum = filteredTokens.reduce((acc, token) => acc + (weights?.[token.symbol] ?? 0), 0)
    if (sum > 0.0001) {
      return filteredTokens.reduce((acc, token) => {
        acc[token.symbol] = (weights?.[token.symbol] ?? 0) / sum
        return acc
      }, {})
    }
    const equalWeight = 1 / filteredTokens.length
    return filteredTokens.reduce((acc, token) => {
      acc[token.symbol] = equalWeight
      return acc
    }, {})
  }, [filteredTokens, weights])

  const [selectedDays, setSelectedDays] = useState(() => timeframes?.[0] ?? null)

  const safeSelectedDays = useMemo(() => {
    if (selectedDays != null && timeframes?.includes(selectedDays)) {
      return selectedDays
    }
    return timeframes?.[0] ?? null
  }, [selectedDays, timeframes])

  const chartData = useMemo(() => {
    if (!filteredTokens.length) {
      return []
    }
    return timeframes.map((days) => {
      const label = `J+${days}`
      const point = { label, days }
      let totalProjectedValue = 0

      filteredTokens.forEach((token) => {
        const weight = normalizedWeights[token.symbol] ?? 0
        const allocation = normalizedCapital * Math.max(0, weight)
        let pctChange = null

        if (hasHistoricalReturns) {
          const historyEntry = historyData?.[token.symbol]?.returns?.[days]
            ?? historyData?.[token.symbol?.toUpperCase()]?.returns?.[days]
          if (Number.isFinite(historyEntry)) {
            pctChange = historyEntry
          }
        }

        if (pctChange == null) {
          const normalizedDailyReturn = clampDailyReturn((token.deltaPct ?? 0) / 100)
          const growthFactor = Math.pow(1 + normalizedDailyReturn, days)
          pctChange = (growthFactor - 1) * 100
        }

        const multiplier = Number.isFinite(pctChange) ? (1 + (pctChange / 100)) : 1
        const projectedValue = allocation * multiplier

        point[token.symbol] = Number.isFinite(pctChange) ? pctChange : null
        totalProjectedValue += projectedValue
      })

      const portfolioPct = normalizedCapital > 0
        ? ((totalProjectedValue / normalizedCapital) - 1) * 100
        : 0
      point.portfolio = portfolioPct
      point.projectedValue = totalProjectedValue
      return point
    })
  }, [filteredTokens, normalizedWeights, normalizedCapital, timeframes, hasHistoricalReturns, historyData])

  const selectedPoint = useMemo(() => {
    if (!chartData.length) {
      return null
    }
    if (safeSelectedDays == null) {
      return chartData[0]
    }
    return chartData.find((point) => point.days === safeSelectedDays) ?? chartData[0]
  }, [chartData, safeSelectedDays])

  const tokenDetails = useMemo(() => {
    if (!selectedPoint) {
      return []
    }
    return filteredTokens
      .map((token) => ({
        symbol: token.symbol,
        name: token.name || token.symbol,
        color: token.color,
        value: selectedPoint[token.symbol]
      }))
      .sort((a, b) => {
        const aVal = Number(a.value)
        const bVal = Number(b.value)
        if (Number.isFinite(aVal) && Number.isFinite(bVal)) {
          return bVal - aVal
        }
        if (Number.isFinite(bVal)) return 1
        if (Number.isFinite(aVal)) return -1
        return a.symbol.localeCompare(b.symbol)
      })
  }, [filteredTokens, selectedPoint])

  if (!filteredTokens.length) {
    return (
      <div className="kitchen-projection-empty">
        Ajoute au moins un token Hyperliquid pour visualiser la projection multi-jours.
      </div>
    )
  }

  return (
    <div className="kitchen-projection-wrapper">
      <div className="kitchen-projection-summary">
        {chartData.map((point) => (
          <button
            key={point.label}
            type="button"
            className={`kitchen-projection-summary-card${selectedPoint?.label === point.label ? ' is-active' : ''}`}
            onClick={() => setSelectedDays(point.days)}
          >
            <span>{point.label}</span>
            <strong>{formatPercent(point.portfolio)}</strong>
            <small>{currencyFormatter.format(point.projectedValue)}</small>
          </button>
        ))}
      </div>

      {selectedPoint && (
        <div className="kitchen-projection-detail">
          <div className="kitchen-projection-detail-head">
            <div>
              <span>Variation sélectionnée</span>
              <strong>{selectedPoint.label}</strong>
            </div>
            <div>
              <span>Portefeuille pondéré</span>
              <strong>{formatPercent(selectedPoint.portfolio)}</strong>
              <small>{currencyFormatter.format(selectedPoint.projectedValue)}</small>
            </div>
          </div>
          <div className="kitchen-projection-detail-list">
            {tokenDetails.map((token) => (
              <div key={token.symbol} className="kitchen-projection-detail-item">
                <div className="kitchen-projection-detail-token">
                  <span
                    className="kitchen-projection-token-dot"
                    style={{ backgroundColor: token.color || '#38bdf8' }}
                  />
                  <div>
                    <p>{token.name}</p>
                    <small>{token.symbol}</small>
                  </div>
                </div>
                <strong className={Number(token.value) > 0 ? 'is-positive' : Number(token.value) < 0 ? 'is-negative' : ''}>
                  {Number.isFinite(Number(token.value)) ? formatPercent(token.value) : '--'}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="kitchen-projection-chart">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
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
            {filteredTokens.map((token) => (
              <Line
                key={token.symbol}
                type="monotone"
                dataKey={token.symbol}
                name={token.symbol}
                stroke={token.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            <Line
              type="monotone"
              dataKey="portfolio"
              name="Portefeuille pondéré"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ r: 3 }}
              strokeDasharray="4 2"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ProjectionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0]?.payload
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
      {point?.projectedValue != null && (
        <p>
          Valeur estimée :{' '}
          <strong>{currencyFormatter.format(point.projectedValue)}</strong>
        </p>
      )}
    </div>
  )
}
