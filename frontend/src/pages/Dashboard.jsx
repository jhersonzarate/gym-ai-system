// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gymAPI } from '../services/api'

const TECNOLOGIAS = [
  {
    tag: 'Prolog',
    icon: 'psychology',
    titulo: 'Motor de Inferencia',
    desc: 'Un sistema experto con más de 25 reglas determina tu frecuencia, tipo de rutina, intensidad y cardio según tu perfil físico real.',
    accent: 'var(--gym-lime)',
    bg: 'rgba(198,241,53,0.05)',
    border: 'rgba(198,241,53,0.14)',
  },
  {
    tag: 'Scala',
    icon: 'code',
    titulo: 'Generador de Rutinas',
    desc: 'Motor funcional que construye rutinas completas: Full Body, Upper/Lower, PPL, Torso/Pierna y Especializado con ejercicios reales.',
    accent: '#60A5FA',
    bg: 'rgba(96,165,250,0.05)',
    border: 'rgba(96,165,250,0.14)',
  },
  {
    tag: 'Python',
    icon: 'calculate',
    titulo: 'Cálculos Metabólicos',
    desc: 'BMR con fórmula Mifflin-St Jeor, TDEE según actividad real, distribución de macros por objetivo y simulación de progreso semanal.',
    accent: 'var(--gym-orange)',
    bg: 'rgba(242,101,34,0.05)',
    border: 'rgba(242,101,34,0.14)',
  },
]

const FLUJO = [
  { num: '01', label: 'Ingresas tu perfil',       desc: 'Datos físicos y objetivo corporal', icon: 'person_outline'       },
  { num: '02', label: 'Prolog razona',             desc: 'Motor IA evalúa 25+ reglas',       icon: 'psychology'           },
  { num: '03', label: 'Scala construye',           desc: 'Genera tu rutina completa',        icon: 'code'                 },
  { num: '04', label: 'Obtienes tu plan',          desc: 'Rutina + Nutrición + Progreso',    icon: 'assignment_turned_in' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const nombre   = localStorage.getItem('gym_nombre') || 'Atleta'
  const [ultimoPlan, setUltimoPlan] = useState(null)

  useEffect(() => {
    // Intentar cargar el último plan del usuario
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem('gym_saved_results') || '[]') } catch { return [] }
    })()
    if (saved.length > 0) setUltimoPlan(saved[0])
    else {
      gymAPI.getHistory()
        .then(({ data }) => {
          const items = data.historial || []
          if (items.length > 0) setUltimoPlan(items[0])
        })
        .catch(() => {})
    }
  }, [])

  const OBJETIVO_META = {
    perder_grasa:  { label: 'Perder Grasa',  color: '#F26522' },
    ganar_musculo: { label: 'Ganar Músculo', color: '#C6F135' },
    mantener:      { label: 'Mantener',      color: '#60A5FA' },
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'var(--gym-card)',
        border: '1px solid var(--gym-border)',
        borderRadius: 16,
        padding: '38px 44px',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Línea superior */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, var(--gym-lime) 0%, var(--gym-orange) 100%)',
        }} />
        {/* Grid de fondo */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(198,241,53,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(198,241,53,0.025) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div className="label-tag" style={{ color: 'var(--gym-lime)', marginBottom: 10 }}>
              Bienvenido de vuelta
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(40px, 5vw, 58px)', lineHeight: 1, marginBottom: 14 }}>
              {nombre.split(' ')[0].toUpperCase()}
              <br />
              <span style={{ color: 'var(--gym-lime)' }}>LISTO PARA ENTRENAR</span>
            </h1>
            <p style={{ color: 'var(--gym-muted2)', fontSize: 15, maxWidth: 440, lineHeight: 1.65 }}>
              Sistema experto multilenguaje que analiza tu perfil físico y genera planes de entrenamiento y nutrición personalizados con inteligencia artificial real.
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

      {/* ── Último plan (si existe) ── */}
      {ultimoPlan && (() => {
        const perfil  = ultimoPlan.perfil || ultimoPlan.resultado?.perfil || {}
        const macros  = ultimoPlan.macros || ultimoPlan.resultado?.nutricion || {}
        const rutina  = ultimoPlan.rutina || ultimoPlan.resultado?.rutina || {}
        const objetivo = perfil.objetivo || 'mantener'
        const objMeta  = OBJETIVO_META[objetivo] || OBJETIVO_META.mantener
        const tipo     = {
          fullbody: 'Full Body', upper_lower: 'Upper / Lower',
          ppl: 'PPL', torso_pierna: 'Torso / Pierna', especializado: 'Especializado',
        }[rutina.tipo_rutina] || '—'

        return (
          <div style={{
            background: 'var(--gym-card)',
            border: '1px solid var(--gym-border)',
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
                <span className="material-icons-round" style={{ fontSize: 22, color: 'var(--gym-lime)' }}>assignment</span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gym-muted)', marginBottom: 3 }}>Tu último plan generado</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--gym-text)' }}>{tipo}</span>
                  <span style={{ fontSize: 12, color: objMeta.color, fontWeight: 600 }}>· {objMeta.label}</span>
                  {macros.calorias_objetivo && (
                    <span style={{ fontSize: 12, color: 'var(--gym-muted)' }}>· {macros.calorias_objetivo.toLocaleString()} kcal/día</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/resultados')}
              className="btn-ghost"
              style={{ fontSize: 13, flexShrink: 0 }}
            >
              Ver plan
              <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </div>
        )
      })()}

      {/* ── Stack tecnológico ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {TECNOLOGIAS.map(({ tag, icon, titulo, desc, accent, bg, border }) => (
          <div key={tag} style={{
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
              <span style={{
                fontSize: 11, fontWeight: 700, color: accent,
                fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em',
              }}>{tag}</span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gym-text)', marginBottom: 8 }}>{titulo}</h3>
            <p style={{ fontSize: 13, color: 'var(--gym-muted)', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* ── Cómo funciona ── */}
      <div style={{
        background: 'var(--gym-card)',
        border: '1px solid var(--gym-border)',
        borderRadius: 14,
        padding: '28px 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <div>
            <div className="label-tag" style={{ marginBottom: 5 }}>Flujo del sistema</div>
            <h2 className="font-condensed" style={{ fontSize: 21, fontWeight: 700, letterSpacing: '0.02em' }}>
              Cómo funciona GymExpert
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
                  <span className="material-icons-round" style={{ fontSize: 16, color: 'var(--gym-lime)' }}>{icon}</span>
                </div>
                <span className="font-condensed" style={{ fontSize: 26, fontWeight: 700, color: 'rgba(198,241,53,0.2)' }}>{num}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gym-text)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--gym-muted)' }}>{desc}</div>
              {i < FLUJO.length - 1 && (
                <span className="material-icons-round" style={{
                  position: 'absolute', right: -10, top: 8,
                  fontSize: 16, color: 'var(--gym-border2)',
                }}>chevron_right</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}