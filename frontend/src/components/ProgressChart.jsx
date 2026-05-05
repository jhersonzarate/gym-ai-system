// frontend/src/components/ProgressChart.jsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

export default function ProgressChart({ data = [], objetivo }) {
  const color = objetivo === 'perder_grasa' ? '#f87171' : '#22c55e'

  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">
        Simulación de Progreso — 8 Semanas
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
          <XAxis
            dataKey="semana"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickFormatter={v => `S${v}`}
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color }}
          />
          <Line
            type="monotone"
            dataKey="cambio_kg"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}