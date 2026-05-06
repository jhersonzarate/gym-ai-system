// frontend/src/components/ExplicacionCard.jsx
import { useState } from 'react'

export default function ExplicacionCard({ explicaciones = [] }) {
  const [open, setOpen] = useState(true)

  // Limpiar y filtrar explicaciones válidas
  const cleaned = (Array.isArray(explicaciones) ? explicaciones : [])
    .map(e => (typeof e === 'string' ? e.trim() : ''))
    .filter(Boolean)

  // Explicaciones de respaldo cuando el sistema no devuelve ninguna
  const FALLBACK = [
    'Tu nivel de entrenamiento determina la frecuencia y el tipo de rutina asignada para optimizar tu adaptación.',
    'Tu objetivo principal define la distribución calórica diaria y la intensidad del trabajo en cada sesión.',
    'Tu composición corporal (IMC y somatotipo) ajusta si se incluye cardio y con qué cargas debes entrenar.',
    'Tu disponibilidad semanal define cuántos días y cómo se distribuyen los grupos musculares a lo largo de la semana.',
    'Tu rango de edad influye en la intensidad máxima recomendada para proteger tu recuperación y prevenir lesiones.',
  ]

  const items = cleaned.length > 0 ? cleaned : FALLBACK
  const esReal = cleaned.length > 0

  return (
    <div style={{
      background: 'rgba(198,241,53,0.04)',
      border: '1px solid rgba(198,241,53,0.18)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Header del acordeón */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,241,53,0.03)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'rgba(198,241,53,0.12)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--lime)' }}>lightbulb</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: '15px',
              letterSpacing: '0.04em', color: 'var(--lime)',
            }}>
              POR QUÉ ESTE PLAN PARA TI
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
              {esReal
                ? `${items.length} factores analizados de tu perfil`
                : 'El sistema analizó tu perfil completo'}
            </div>
          </div>
        </div>
        <span className="material-icons-round" style={{
          fontSize: '20px',
          color: 'var(--lime)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>expand_more</span>
      </button>

      {/* Contenido expandible */}
      {open && (
        <div style={{ padding: '0 22px 22px', borderTop: '1px solid rgba(198,241,53,0.1)' }}>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((e, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div style={{
                  width: '22px', height: '22px',
                  background: 'rgba(198,241,53,0.15)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '1px',
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 700, color: 'var(--lime)',
                  }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted2)', lineHeight: 1.6, margin: 0 }}>{e}</p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '14px',
            padding: '10px 14px',
            background: 'rgba(198,241,53,0.05)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span className="material-icons-round" style={{ fontSize: '14px', color: 'var(--muted)' }}>info</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
              Estas decisiones fueron tomadas automáticamente por el sistema experto basado en tu perfil físico y objetivo personal.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}