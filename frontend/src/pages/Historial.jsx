// frontend/src/pages/Historial.jsx
import { useEffect, useState } from 'react'
import { gymAPI } from '../services/api'

const OBJETIVO_LABEL = {
  perder_grasa:  { l: 'Perder grasa',   color: 'var(--gym-orange)', icon: 'trending_down' },
  ganar_musculo: { l: 'Ganar musculo',  color: 'var(--gym-lime)',   icon: 'trending_up' },
  mantener:      { l: 'Mantener peso',  color: '#60A5FA',           icon: 'balance' },
}

const TIPO_LABEL = {
  fullbody:      'Full Body',
  upper_lower:   'Upper / Lower',
  ppl:           'Push Pull Legs',
  torso_pierna:  'Torso / Pierna',
  especializado: 'Especializado',
}

const NIVEL_COLOR = {
  principiante: '#4ADE80',
  intermedio:   '#F59E0B',
  avanzado:     '#EF4444',
}

export default function Historial() {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [error, setError]   = useState('')

  useEffect(() => {
    gymAPI.getHistory()
      .then(({ data }) => setItems(data.historial || []))
      .catch(() => setError('No se pudo cargar el historial'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid var(--gym-border)',
        borderTopColor: 'var(--gym-lime)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '14px', color: 'var(--gym-muted)' }}>Cargando historial...</span>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', flexDirection: 'column', gap: '12px' }}>
      <span className="material-icons-round" style={{ fontSize: '40px', color: 'var(--gym-red)' }}>error_outline</span>
      <p style={{ color: 'var(--gym-muted)', fontSize: '14px' }}>{error}</p>
    </div>
  )

  if (!items.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '360px', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        width: '72px', height: '72px',
        background: 'var(--gym-card)',
        border: '1px solid var(--gym-border)',
        borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-icons-round" style={{ fontSize: '32px', color: 'var(--gym-border2)' }}>history</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gym-text)', marginBottom: '6px' }}>Sin historial todavia</p>
        <p style={{ fontSize: '13px', color: 'var(--gym-muted)' }}>Genera tu primer plan en la seccion "Nuevo Plan"</p>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-up" style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="label-tag" style={{ marginBottom: '6px' }}>Registro de sesiones</div>
          <h1 className="font-condensed" style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.02em' }}>
            Historial de planes
          </h1>
          <p style={{ color: 'var(--gym-muted)', fontSize: '13px', marginTop: '4px' }}>
            Ultimos {items.length} planes generados
          </p>
        </div>

        {/* Stats rapidas */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Planes totales',   value: items.length,  icon: 'assignment' },
            {
              label: 'Ultimo objetivo',
              value: (() => {
                const p = typeof items[0]?.perfil === 'string' ? JSON.parse(items[0].perfil) : items[0]?.perfil
                return OBJETIVO_LABEL[p?.objetivo]?.l || '-'
              })(),
              icon: 'flag',
            },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: 'var(--gym-card)',
              border: '1px solid var(--gym-border)',
              borderRadius: '10px',
              padding: '12px 18px',
              textAlign: 'center',
              minWidth: '120px',
            }}>
              <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--gym-lime)', display: 'block', marginBottom: '4px' }}>{icon}</span>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gym-text)' }}>{value}</div>
              <div style={{ fontSize: '11px', color: 'var(--gym-muted)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, i) => {
          const perfil = typeof item.perfil === 'string' ? JSON.parse(item.perfil) : item.perfil
          const macros = typeof item.macros === 'string' ? JSON.parse(item.macros) : item.macros
          const rutina = typeof item.rutina === 'string' ? JSON.parse(item.rutina) : item.rutina
          const obj    = OBJETIVO_LABEL[perfil?.objetivo] || { l: perfil?.objetivo, color: 'var(--gym-muted)', icon: 'flag' }
          const tipo   = TIPO_LABEL[rutina?.tipo_rutina] || rutina?.tipo_rutina
          const nivelColor = NIVEL_COLOR[perfil?.nivel] || 'var(--gym-muted)'
          const isOpen = expanded === i
          const fecha  = new Date(item.fecha)
          const fechaStr = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
          const horaStr  = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

          return (
            <div
              key={item.id}
              className={`animate-fade-up stagger-${Math.min(i + 1, 4)}`}
              style={{
                background: 'var(--gym-card)',
                border: `1px solid ${isOpen ? 'rgba(198,241,53,0.2)' : 'var(--gym-border)'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Cabecera del plan */}
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '18px 22px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {/* Numero */}
                <div style={{
                  width: '44px', height: '44px',
                  background: isOpen ? 'rgba(198,241,53,0.12)' : 'var(--gym-dark)',
                  border: `1px solid ${isOpen ? 'rgba(198,241,53,0.25)' : 'var(--gym-border2)'}`,
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}>
                  <span className="font-condensed" style={{ fontSize: '18px', fontWeight: 700, color: isOpen ? 'var(--gym-lime)' : 'var(--gym-muted)' }}>
                    #{item.id}
                  </span>
                </div>

                {/* Info principal */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span className="font-condensed" style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--gym-text)' }}>
                      {tipo}
                    </span>
                    {/* Objetivo badge */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      background: `${obj.color}12`,
                      border: `1px solid ${obj.color}25`,
                      fontSize: '11px', fontWeight: 700,
                      color: obj.color,
                      fontFamily: 'Barlow Condensed, sans-serif',
                      letterSpacing: '0.06em',
                    }}>
                      <span className="material-icons-round" style={{ fontSize: '12px' }}>{obj.icon}</span>
                      {obj.l?.toUpperCase()}
                    </span>
                    {/* Nivel badge */}
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '100px',
                      background: `${nivelColor}12`,
                      border: `1px solid ${nivelColor}25`,
                      fontSize: '11px', fontWeight: 700,
                      color: nivelColor,
                      fontFamily: 'Barlow Condensed, sans-serif',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      {perfil?.nivel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--gym-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-icons-round" style={{ fontSize: '13px' }}>calendar_today</span>
                      {fechaStr}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-icons-round" style={{ fontSize: '13px' }}>schedule</span>
                      {horaStr}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-icons-round" style={{ fontSize: '13px' }}>local_fire_department</span>
                      {macros?.calorias_objetivo} kcal/dia
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <span className="material-icons-round" style={{
                  fontSize: '22px',
                  color: isOpen ? 'var(--gym-lime)' : 'var(--gym-muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s, color 0.15s',
                  flexShrink: 0,
                }}>expand_more</span>
              </button>

              {/* Detalle expandido */}
              {isOpen && (
                <div style={{
                  borderTop: '1px solid var(--gym-border)',
                  padding: '20px 22px',
                  animation: 'fadeUp 0.3s ease forwards',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                    {/* Datos fisicos */}
                    {[
                      { l: 'Peso',    v: `${perfil?.peso} kg`,        icon: 'monitor_weight' },
                      { l: 'Altura',  v: `${perfil?.altura} cm`,      icon: 'height' },
                      { l: 'Edad',    v: `${perfil?.edad} anos`,      icon: 'cake' },
                      { l: 'Sexo',    v: perfil?.sexo,                 icon: 'person' },
                      { l: 'IMC',     v: perfil?.imc || '-',           icon: 'analytics' },
                      { l: 'Dias/sem',v: `${perfil?.dias_disponibles}`, icon: 'calendar_today' },
                    ].map(({ l, v, icon }) => (
                      <div key={l} style={{
                        background: 'var(--gym-dark)',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}>
                        <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--gym-muted)' }}>{icon}</span>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--gym-muted)', letterSpacing: '0.04em' }}>{l}</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gym-text)', textTransform: 'capitalize' }}>{v}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Macros */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                    padding: '16px',
                    background: 'rgba(198,241,53,0.04)',
                    border: '1px solid rgba(198,241,53,0.12)',
                    borderRadius: '10px',
                  }}>
                    {[
                      { l: 'Calorias',    v: macros?.calorias_objetivo,  unit: 'kcal', color: 'var(--gym-lime)' },
                      { l: 'Proteinas',   v: `${macros?.proteinas_g}g`,   unit: '',     color: '#60A5FA' },
                      { l: 'Carbohidratos',v: `${macros?.carbohidratos_g}g`,unit:'',    color: '#F59E0B' },
                      { l: 'Grasas',      v: `${macros?.grasas_g}g`,      unit: '',     color: 'var(--gym-orange)' },
                    ].map(({ l, v, unit, color }) => (
                      <div key={l} style={{ textAlign: 'center' }}>
                        <div className="font-condensed" style={{ fontSize: '22px', fontWeight: 700, color, lineHeight: 1 }}>{v}</div>
                        {unit && <span style={{ fontSize: '11px', color: 'var(--gym-muted)' }}>{unit}</span>}
                        <div style={{ fontSize: '11px', color: 'var(--gym-muted)', marginTop: '4px' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}