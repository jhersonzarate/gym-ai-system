// frontend/src/components/ProgressChart.jsx
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const CustomTooltip = ({ active, payload, label, objetivo }) => {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  const color = objetivo === 'perder_grasa' ? '#F26522' : objetivo === 'ganar_musculo' ? '#C6F135' : '#60A5FA'
  return (
    <div style={{
      background: '#1A1D22',
      border: '1px solid #252B34',
      borderRadius: '8px',
      padding: '10px 14px',
    }}>
      <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px', letterSpacing: '0.04em' }}>SEMANA {label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color, fontFamily: 'Barlow Condensed, sans-serif' }}>
        {val > 0 ? '+' : ''}{val} kg
      </div>
    </div>
  )
}

export default function ProgressChart({ data = [], objetivo }) {
  const color = objetivo === 'perder_grasa' ? '#F26522'
    : objetivo === 'ganar_musculo' ? '#C6F135'
    : '#60A5FA'

  const label = objetivo === 'perder_grasa' ? 'Perdida de grasa estimada'
    : objetivo === 'ganar_musculo' ? 'Ganancia muscular estimada'
    : 'Balance corporal'

  const lastVal = data[data.length - 1]?.cambio_kg || 0

  return (
    <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div className="label-tag" style={{ marginBottom: '6px' }}>Simulacion de progreso</div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gym-text)' }}>{label}</h3>
          <p style={{ fontSize: '12px', color: 'var(--gym-muted)', marginTop: '3px' }}>Proyeccion basada en adherencia optima al plan</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="font-display" style={{ fontSize: '36px', color, lineHeight: 1 }}>
            {lastVal > 0 ? '+' : ''}{lastVal}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gym-muted)', letterSpacing: '0.04em' }}>KG A 8 SEMANAS</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2229" vertical={false} />
          <XAxis
            dataKey="semana"
            tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Barlow Condensed' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `S${v}`}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <ReferenceLine y={0} stroke="#252B34" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip objetivo={objetivo} />} />
          <Area
            type="monotone"
            dataKey="cambio_kg"
            stroke={color}
            strokeWidth={2.5}
            fill="url(#grad)"
            dot={{ fill: color, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: color, stroke: '#080A0C', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}