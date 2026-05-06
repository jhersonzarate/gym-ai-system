// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gymAPI } from '../services/api'

const BENEFICIOS = [
  {
    icon: 'psychology',
    titulo: 'Análisis inteligente',
    desc: 'El sistema evalúa más de 25 variables de tu perfil físico para determinar la rutina exacta que necesitas.',
    accent: 'var(--lime)',
    bg: 'rgba(198,241,53,0.05)',
    border: 'rgba(198,241,53,0.14)',
  },
  {
    icon: 'fitness_center',
    titulo: 'Rutinas personalizadas',
    desc: 'Full Body, Upper/Lower, Push-Pull-Legs, Torso/Pierna y Especializado. Cada plan es único para tu nivel y disponibilidad.',
    accent: '#60A5FA',
    bg: 'rgba(96,165,250,0.05)',
    border: 'rgba(96,165,250,0.14)',
  },
  {
    icon: 'restaurant',
    titulo: 'Plan nutricional exacto',
    desc: 'Calorías, proteínas, carbohidratos y grasas calculadas con fórmulas científicas adaptadas a tu objetivo corporal.',
    accent: 'var(--orange)',
    bg: 'rgba(242,101,34,0.05)',
    border: 'rgba(242,101,34,0.14)',
  },
]

const FLUJO = [
  { num: '01', label: 'Ingresa tu perfil',   desc: 'Datos físicos y objetivo',      icon: 'person_outline'       },
  { num: '02', label: 'El sistema analiza',  desc: 'Evaluación inteligente',        icon: 'psychology'           },
  { num: '03', label: 'Se genera tu plan',   desc: 'Rutina completa en segundos',   icon: 'auto_awesome'         },
  { num: '04', label: 'Entrena y progresa',  desc: 'Rutina + Nutrición + Progreso', icon: 'assignment_turned_in' },
]

const OBJETIVO_META = {
  perder_grasa:  { label: 'Perder Grasa',  color: '#F26522' },
  ganar_musculo: { label: 'Ganar Músculo', color: '#C6F135' },
  mantener:      { label: 'Mantener',      color: '#60A5FA' },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const nombre   = localStorage.getItem('gym_nombre') || 'Atleta'
  const [ultimoPlan, setUltimoPlan] = useState(() => {
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem('gym_saved_results') || '[]') } catch { return [] }
    })()
    return saved.length > 0 ? saved[0] : null
  })

  useEffect(() => {
    if (!ultimoPlan) {
      gymAPI.getHistory()
        .then(({ data }) => {
          const items = data.historial || []
          if (items.length > 0) setUltimoPlan(items[0])
        })
        .catch(() => {})
    }
  }, [ultimoPlan])

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '38px 44px',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Línea superior de acento */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, var(--lime) 0%, var(--orange) 100%)',
        }} />
        {/* Grid decorativo de fondo */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(198,241,53,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(198,241,53,0.025) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--lime)', marginBottom: 10,
            }}>
              Bienvenido de vuelta
            </div>
            <h1 style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(40px, 5vw, 58px)',
              lineHeight: 1, marginBottom: 14,
              color: 'var(--text)',
            }}>
              {nombre.split(' ')[0].toUpperCase()}
              <br />
              <span style={{ color: 'var(--lime)' }}>LISTO PARA ENTRENAR</span>
            </h1>
            <p style={{ color: 'var(--muted2)', fontSize: 15, maxWidth: 440, lineHeight: 1.65 }}>
              Sistema de recomendación inteligente que analiza tu perfil físico y genera planes de entrenamiento y nutrición completamente personalizados.
            </p>
          </div>

          <button
            onClick={() => navigate('/formulario')}
            className="btn-primary"
            style={{ padding: '17px 34px', fontSize: 17, flexShrink: 0, letterSpacing: '0.07em' }}
          >
            <span className="material-icons-round" style={{ fontSize: 21 }}>bolt</span>
            Generar Plan
          </button>
        </div>
      </div>

      {/* ── Banner del último plan (si existe) ── */}
      {ultimoPlan && (() => {
        const perfil  = typeof ultimoPlan.perfil === 'string' ? JSON.parse(ultimoPlan.perfil) : (ultimoPlan.perfil || {})
        const macros  = typeof ultimoPlan.macros === 'string' ? JSON.parse(ultimoPlan.macros) : (ultimoPlan.macros || ultimoPlan.resultado?.nutricion || {})
        const rutina  = typeof ultimoPlan.rutina === 'string' ? JSON.parse(ultimoPlan.rutina) : (ultimoPlan.rutina || ultimoPlan.resultado?.rutina || {})
        const objetivo = perfil.objetivo || 'mantener'
        const objMeta  = OBJETIVO_META[objetivo] || OBJETIVO_META.mantener
        const tipoMap  = {
          fullbody: 'Full Body', upper_lower: 'Upper / Lower',
          ppl: 'Push Pull Legs', torso_pierna: 'Torso / Pierna', especializado: 'Especializado',
        }
        const tipo = tipoMap[rutina.tipo_rutina] || rutina.tipo_rutina || '—'

        return (
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '18px 22px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44,
                background: 'rgba(198,241,53,0.09)',
                border: '1px solid rgba(198,241,53,0.2)',
                borderRadius: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span className="material-icons-round" style={{ fontSize: 22, color: 'var(--lime)' }}>assignment</span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 3 }}>Tu último plan generado</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{tipo}</span>
                  <span style={{ fontSize: 12, color: objMeta.color, fontWeight: 600 }}>· {objMeta.label}</span>
                  {macros.calorias_objetivo && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {macros.calorias_objetivo.toLocaleString()} kcal/día</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/resultados')}
              className="btn-ghost"
              style={{ fontSize: 13, flexShrink: 0 }}
            >
              Ver mi plan
              <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </div>
        )
      })()}

      {/* ── Beneficios del sistema ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {BENEFICIOS.map(({ icon, titulo, desc, accent, bg, border }) => (
          <div key={titulo} style={{
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: 12,
            padding: '22px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 38, height: 38,
                background: `${accent}16`,
                border: `1px solid ${accent}28`,
                borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-icons-round" style={{ fontSize: 20, color: accent }}>{icon}</span>
              </div>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{titulo}</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* ── Cómo funciona ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '28px 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--muted)', marginBottom: 5,
            }}>Proceso</div>
            <h2 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 21, fontWeight: 700, letterSpacing: '0.02em',
              color: 'var(--text)',
            }}>
              ¿Cómo funciona GymExpert?
            </h2>
          </div>
          <button onClick={() => navigate('/formulario')} className="btn-ghost" style={{ fontSize: 13 }}>
            Empezar ahora
            <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {FLUJO.map(({ num, label, desc, icon }, i) => (
            <div key={num} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 34, height: 34,
                  background: 'rgba(198,241,53,0.09)',
                  border: '1px solid rgba(198,241,53,0.2)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span className="material-icons-round" style={{ fontSize: 16, color: 'var(--lime)' }}>{icon}</span>
                </div>
                <span style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 26, fontWeight: 700,
                  color: 'rgba(198,241,53,0.2)',
                }}>{num}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
              {i < FLUJO.length - 1 && (
                <span className="material-icons-round" style={{
                  position: 'absolute', right: -10, top: 8,
                  fontSize: 16, color: 'var(--border2)',
                }}>chevron_right</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}