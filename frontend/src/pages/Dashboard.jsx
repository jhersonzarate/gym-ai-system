// frontend/src/pages/Dashboard.jsx
import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: 'psychology',
    title: 'Motor de Inferencia Prolog',
    desc: '25+ reglas expertas determinan frecuencia, tipo de rutina, intensidad y uso de cardio segun tu perfil exacto.',
    accent: 'var(--gym-lime)',
    bg: 'rgba(198,241,53,0.05)',
    border: 'rgba(198,241,53,0.15)',
  },
  {
    icon: 'code',
    title: 'Generador Scala',
    desc: 'Motor funcional que construye rutinas dinamicas: FullBody, Upper/Lower, PPL, Torso/Pierna, Especializado.',
    accent: '#60A5FA',
    bg: 'rgba(96,165,250,0.05)',
    border: 'rgba(96,165,250,0.15)',
  },
  {
    icon: 'monitor_weight',
    title: 'Calculos Antropometricos',
    desc: 'IMC, BMR (Mifflin-St Jeor) y TDEE calculados con precision. Macros ajustados al objetivo corporal.',
    accent: 'var(--gym-orange)',
    bg: 'rgba(242,101,34,0.05)',
    border: 'rgba(242,101,34,0.15)',
  },
  {
    icon: 'show_chart',
    title: 'Simulacion 8 Semanas',
    desc: 'Proyeccion grafica del progreso esperado semana a semana para perder grasa, ganar musculo o mantenerse.',
    accent: '#A78BFA',
    bg: 'rgba(167,139,250,0.05)',
    border: 'rgba(167,139,250,0.15)',
  },
]

const steps = [
  { num: '01', label: 'Ingresas tu perfil', desc: 'Datos fisicos y objetivo', icon: 'person_outline' },
  { num: '02', label: 'Prolog razona',      desc: 'Motor IA decide parametros',  icon: 'psychology' },
  { num: '03', label: 'Scala genera',       desc: 'Rutina dinamica creada',     icon: 'code' },
  { num: '04', label: 'Obtienes tu plan',   desc: 'Rutina + nutricion + progreso', icon: 'assignment_turned_in' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('gym_nombre') || 'Atleta'

  return (
    <div className="animate-fade-up" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Hero section */}
      <div style={{
        background: 'var(--gym-card)',
        border: '1px solid var(--gym-border)',
        borderRadius: '16px',
        padding: '40px 48px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Accent top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--gym-lime), var(--gym-orange))' }} />

        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(198,241,53,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(198,241,53,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            <div className="label-tag" style={{ color: 'var(--gym-lime)', marginBottom: '12px' }}>
              Bienvenido de vuelta
            </div>
            <h1 className="font-display" style={{ fontSize: '52px', lineHeight: 1, marginBottom: '12px' }}>
              {nombre.split(' ')[0].toUpperCase()}<br/>
              <span style={{ color: 'var(--gym-lime)' }}>LISTO PARA ENTRENAR</span>
            </h1>
            <p style={{ color: 'var(--gym-muted2)', fontSize: '15px', maxWidth: '440px', lineHeight: 1.6 }}>
              Sistema experto multilenguaje que analiza tu perfil y genera planes de entrenamiento y nutricion personalizados con inteligencia artificial.
            </p>
          </div>

          <button
            onClick={() => navigate('/formulario')}
            className="btn-primary"
            style={{ padding: '18px 36px', fontSize: '18px', flexShrink: 0, letterSpacing: '0.08em' }}
          >
            <span className="material-icons-round" style={{ fontSize: '22px' }}>bolt</span>
            Generar Plan
          </button>
        </div>
      </div>

      {/* Features grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {features.map(({ icon, title, desc, accent, bg, border }, i) => (
          <div key={title} className={`animate-fade-up stagger-${i + 1}`} style={{
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: '12px',
            padding: '24px',
          }}>
            <div style={{
              width: '42px', height: '42px',
              background: `${accent}18`,
              border: `1px solid ${accent}30`,
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <span className="material-icons-round" style={{ fontSize: '22px', color: accent }}>{icon}</span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gym-text)', marginBottom: '8px' }}>{title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--gym-muted)', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Como funciona */}
      <div style={{
        background: 'var(--gym-card)',
        border: '1px solid var(--gym-border)',
        borderRadius: '16px',
        padding: '32px 36px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <div className="label-tag" style={{ marginBottom: '6px' }}>Flujo del sistema</div>
            <h2 className="font-condensed" style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.02em' }}>
              Como funciona GymExpert
            </h2>
          </div>
          <button
            onClick={() => navigate('/formulario')}
            className="btn-ghost"
            style={{ fontSize: '13px' }}
          >
            Empezar ahora
            <span className="material-icons-round" style={{ fontSize: '16px' }}>arrow_forward</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', gap: '0', position: 'relative' }}>
          {steps.map(({ num, label, desc, icon }, i) => (
            <div key={num} style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '0' }}>
              <div style={{ flex: 1, padding: '0 16px 0 0' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '36px', height: '36px',
                    background: 'rgba(198,241,53,0.1)',
                    border: '1px solid rgba(198,241,53,0.2)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span className="material-icons-round" style={{ fontSize: '17px', color: 'var(--gym-lime)' }}>{icon}</span>
                  </div>
                  <span className="font-condensed" style={{ fontSize: '28px', fontWeight: 700, color: 'rgba(198,241,53,0.25)' }}>{num}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gym-text)', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--gym-muted)' }}>{desc}</div>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingTop: '18px',
                  marginRight: '16px',
                  flexShrink: 0,
                }}>
                  <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--gym-border2)' }}>chevron_right</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}