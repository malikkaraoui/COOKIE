import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts'
import { useMemo } from 'react'
import { useFundingMetrics } from '../hooks/useFundingMetrics'

const MAX_SERIES = 4
const COLOR_PALETTE = ['#34d399', '#38bdf8', '#f472b6', '#c084fc', '#60a5fa']
const PORTFOLIO_COLOR = '#facc15'

const formatPercent = (value = 0) => `${value.toFixed(2)} %`

export default function FundingMultiChart({
  pairs = [],
  days = 20,
  visibleDays = 20,
  weightsMap = {}
}) {
  const trackedPairs = pairs.slice(0, MAX_SERIES)
  const symbols = trackedPairs.map(
    (entry) => entry?.pairSymbol ?? entry?.baseSymbol ?? null
  )
  const labels = trackedPairs.map((entry) => (entry?.baseSymbol ?? entry?.pairSymbol ?? '')?.toUpperCase())

  const metricsList = [
    useFundingMetrics(symbols[0], days),
    useFundingMetrics(symbols[1], days),
    useFundingMetrics(symbols[2], days),
    useFundingMetrics(symbols[3], days)
  ]

  const seriesDefinitions = trackedPairs.map((entry, index) => ({
    label: labels[index],
    color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    metrics: metricsList[index]
  })).filter((serie) => Boolean(serie.label))

  const chartData = useMemo(() => {
    const registry = new Map()

    const buildSeries = (label, metrics) => {
      if (!label || !metrics?.points?.length) {
        return
      }
      const intervalsPerDay = metrics.intervalsPerDay || 3
      const intervalsPerYear = Math.max(1, intervalsPerDay * 365)

      metrics.points.forEach((point) => {
        const time = Number(point.time)
        if (!Number.isFinite(time)) {
          return
        }
        const apy = (Math.pow(1 + point.rate, intervalsPerYear) - 1) * 100
        const key = String(time)
        if (!registry.has(key)) {
          registry.set(key, {
            time,
            label: new Date(time).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit'
            })
          })
        }
        const bucket = registry.get(key)
        bucket[label] = apy
      })
    }

    seriesDefinitions.forEach(({ label, metrics }) => {
      buildSeries(label, metrics.data)
    })

    const sorted = Array.from(registry.values()).sort((a, b) => a.time - b.time)
    if (!visibleDays || !sorted.length) {
      return sorted
    }
    const maxTime = sorted[sorted.length - 1].time
    const cutoff = maxTime - visibleDays * 24 * 60 * 60 * 1000
    return sorted.filter((row) => row.time >= cutoff)
  }, [seriesDefinitions, visibleDays])

  const anyLoading = seriesDefinitions.some((serie) => serie.metrics.loading)
  const errors = seriesDefinitions
    .map((serie) => serie.metrics.error)
    .filter(Boolean)
  const totalWeight = Object.values(weightsMap).reduce((sum, value) => sum + (Number(value) || 0), 0)

  const enhancedChartData = useMemo(() => {
    if (!chartData.length || totalWeight <= 0) {
      return chartData
    }
    return chartData.map((row) => {
      let weightedValue = 0
      let weightContribution = 0
      seriesDefinitions.forEach(({ label }) => {
        const tokenWeight = Number(weightsMap[label]) || 0
        const tokenValue = row[label]
        if (tokenWeight > 0 && Number.isFinite(tokenValue)) {
          weightedValue += tokenWeight * tokenValue
          weightContribution += tokenWeight
        }
      })
      if (weightContribution > 0) {
        return {
          ...row,
          __portfolio: weightedValue / weightContribution
        }
      }
      return row
    })
  }, [chartData, seriesDefinitions, totalWeight, weightsMap])

  const hasData = enhancedChartData.length > 0

  if (!seriesDefinitions.length) {
    return null
  }

  return (
    <div className="w-full rounded-2xl bg-slate-950/70 p-4 border border-slate-800/70">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <p className="text-sm text-slate-400">Courbes combinées</p>
          <p className="text-lg font-semibold text-white">APY projeté</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
          {seriesDefinitions.map((serie) => (
            <span key={serie.label} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: serie.color }}
              />
              {serie.label}
            </span>
          ))}
        </div>
      </div>

      {anyLoading && (
        <p className="text-xs text-slate-400 mb-2">Chargement des funding rates…</p>
      )}

      {errors.length > 0 && (
        <div className="text-xs text-rose-300 mb-2">
          {errors[0]}
        </div>
      )}

      {hasData ? (
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={enhancedChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis
                tickFormatter={formatPercent}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  background: '#020617',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  color: '#e2e8f0'
                }}
                formatter={(value) => formatPercent(Number(value ?? 0))}
                labelFormatter={(label) => `Période du ${label}`}
              />
              <Legend />
              {seriesDefinitions.map((serie) => (
                <Line
                  key={serie.label}
                  type="monotone"
                  dataKey={serie.label}
                  stroke={serie.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
              {totalWeight > 0 && (
                <Line
                  type="monotone"
                  dataKey="__portfolio"
                  stroke={PORTFOLIO_COLOR}
                  strokeWidth={3}
                  dot={false}
                  strokeDasharray="6 4"
                  name="Profil utilisateur"
                  isAnimationActive={false}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-slate-400">Pas assez de données pour tracer les courbes.</p>
      )}
    </div>
  )
}
