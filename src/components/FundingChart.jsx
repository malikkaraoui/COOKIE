import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

export default function FundingChart({ metrics }) {
  if (!metrics || !metrics.points || metrics.points.length === 0) {
    return null
  }

  const data = metrics.points.map((point) => ({
    time: new Date(point.time).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    ratePct: point.rate * 100
  }))

  return (
    <div style={{ width: '100%', height: 160 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={(v) => `${v.toFixed(2)}%`}
            width={55}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#020617',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
            formatter={(value) => `${Number(value).toFixed(4)} %`}
            labelFormatter={(label) => `Funding du ${label}`}
          />
          <Line
            type="monotone"
            dataKey="ratePct"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
