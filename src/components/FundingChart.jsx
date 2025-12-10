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

  const data = metrics.points.map((point, index) => {
    const date = new Date(point.time)
    return {
      index,
      label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      ratePct: point.rate * 100
    }
  })

  return (
    <div style={{ width: '100%', height: 150 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
          <XAxis dataKey="index" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              background: '#020617',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
            formatter={(value) => `${Number(value).toFixed(4)} %`}
            labelFormatter={(_, payload) => {
              const label = payload?.[0]?.payload?.label
              return label ? `Funding du ${label}` : ''
            }}
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
