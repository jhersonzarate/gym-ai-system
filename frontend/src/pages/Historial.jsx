// frontend/src/pages/Historial.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gymAPI } from '../services/api'

const OBJETIVO_LABEL = {
  perder_grasa:  { l: 'Perder grasa',  color: 'var(--orange)', icon: 'trending_down' },
  ganar_musculo: { l: 'Ganar músculo', color: 'var(--lime)',   icon: 'trending_up'   },
  mantener:      { l: 'Mantener peso', color: '#60A5FA',       icon: 'balance'       },
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
  const navigate   = useNavigate()
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [error, setError]       = useState('')

  useEffect(() => {
    gymAPI.getHistory()
      .then(({ data }) => setItems(data.historial || []))
      .catch(() => setError('No se pudo cargar el historial. Verifica tu conexión.'))
      .finally(() => setLoading(false))
  }, [])

  // Cargar un plan del historial como resultado activo y navegar a resultados
  const verPlanCompleto = (item) => {
    // Parsear los campos del historial
    const perfil  = typeof item.perfil === 'string' ? JSON.parse(item.perfil)  : item.perfil
    const rutina  = typeof item.rutina === 'string' ? JSON.parse(item.rutina)  : item.rutina
    const macros  = typeof item.macros === 'string' ? JSON.parse(item.macros)  : item.macros

    // Reconstruir la estructura que espera Resultados.jsx
    const resultado = {
      perfil:   perfil,
      nutricion: macros,
      ia_decision: {
        tipo_rutina:  rutina?.tipo_rutina,
        frecuencia:   perfil?.dias_disponibles,
        intensidad:   perfil?.nivel === 'principiante' ? 'baja' : perfil?.nivel === 'intermedio' ? 'moderada' : 'alta',
        usa_cardio:   perfil?.objetivo === 'perder_grasa',
        objetivo:     perfil?.objetivo,
        // Generar explicaciones básicas si no hay del backend
        explicacion: [
          `Tu nivel ${perfil?.nivel} determina la frecuencia y tipo de rutina asignada.`,
          `Tu objetivo de ${(perfil?.objetivo || '').replace(/_/g, ' ')} define la distribución calórica.`,
          `Con ${perfil?.dias_disponibles} días disponibles se optimizó el tipo de entrenamiento.`,
          `Tu IMC de ${perfil?.imc || '—'} (${(perfil?.imc_categoria || '').replace(/_/g, ' ')}) ajusta la intensidad.`,
        ],
      },
      rutina:   rutina,
      progreso_simulado: generarProgreso(perfil?.objetivo),
    }

    // Guardar como resultado activo y navegar
    localStorage.setItem('gym_resultado', JSON.stringify(resultado))
    navigate('/resultados')
  }

  // Generar progreso simple para planes del historial
  const generarProgreso = (objetivo) => {
    return Array.from({ length: 8 }, (_, i) => ({
      semana: i + 1,
      cambio_kg: objetivo === 'perder_grasa'
        ? parseFloat((-0.4 * (i + 1)).toFixed(1))
        : objetivo === 'ganar_musculo'
        ? parseFloat((0.25 * (i + 1)).toFixed(1))
        : 0,
    }))
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--lime)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Cargando historial...</span>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', flexDirection: 'column', gap: '12px' }}>
      <span className="material-icons-round" style={{ fontSize: '40px', color: 'var(--red)' }}>error_outline</span>
      <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{error}</p>
    </div>
  )

  if (!items.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '360px', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        width: '72px', height: '72px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-icons-round" style={{ fontSize: '32px', color: 'var(--border2)' }}>history</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Sin historial todavía</p>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Genera tu primer plan para verlo aquí</p>
        <button onClick={() => navigate('/formulario')} className="btn-primary" style={{ fontSize: 13, padding: '10px 20px' }}>
          <span className="material-icons-round" style={{ fontSize: 16 }}>add</span>
          Crear mi primer plan
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '11px', fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '6px',
          }}>Registro de sesiones</div>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '28px', fontWeight: 700, letterSpacing: '0.02em',
            color: 'var(--text)',
          }}>
            Historial de planes
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
            Últimos {items.length} planes generados — haz clic en cualquiera para ver el detalle
          </p>
        </div>

        {/* Stats rápidas */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { label: 'Planes totales', value: items.length, icon: 'assignment' },
            {
              label: 'Último objetivo',
              value: (() => {
                const p = typeof items[0]?.perfil === 'string' ? JSON.parse(items[0].perfil) : items[0]?.perfil
                return OBJETIVO_LABEL[p?.objetivo]?.l || '-'
              })(),
              icon: 'flag',
            },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '12px 18px',
              textAlign: 'center',
              minWidth: '120px',
            }}>
              <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--lime)', display: 'block', marginBottom: '4px' }}>{icon}</span>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{value}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lista de planes ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, i) => {
          const perfil     = typeof item.perfil === 'string' ? JSON.parse(item.perfil) : item.perfil
          const macros     = typeof item.macros === 'string' ? JSON.parse(item.macros) : item.macros
          const rutina     = typeof item.rutina === 'string' ? JSON.parse(item.rutina) : item.rutina
          const obj        = OBJETIVO_LABEL[perfil?.objetivo] || { l: perfil?.objetivo, color: 'var(--muted)', icon: 'flag' }
          const tipo       = TIPO_LABEL[rutina?.tipo_rutina] || rutina?.tipo_rutina || '—'
          const nivelColor = NIVEL_COLOR[perfil?.nivel] || 'var(--muted)'
          const isOpen     = expanded === i
          const fecha      = new Date(item.fecha)
          const fechaStr   = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
          const horaStr    = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

          return (
            <div
              key={item.id}
              style={{
                background: 'var(--card)',
                border: `1px solid ${isOpen ? 'rgba(198,241,53,0.2)' : 'var(--border)'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Cabecera — clic expande el detalle */}
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
                {/* Número de plan */}
                <div style={{
                  width: '44px', height: '44px',
                  background: isOpen ? 'rgba(198,241,53,0.12)' : 'var(--dark)',
                  border: `1px solid ${isOpen ? 'rgba(198,241,53,0.25)' : 'var(--border2)'}`,
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}>
                  <span style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '18px', fontWeight: 700,
                    color: isOpen ? 'var(--lime)' : 'var(--muted)',
                  }}>
                    #{item.id}
                  </span>
                </div>

                {/* Info principal */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: '17px', fontWeight: 700, letterSpacing: '0.02em',
                      color: 'var(--text)',
                    }}>
                      {tipo}
                    </span>
                    {/* Badge objetivo */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px', borderRadius: '100px',
                      background: `${obj.color}12`,
                      border: `1px solid ${obj.color}25`,
                      fontSize: '11px', fontWeight: 700, color: obj.color,
                      fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em',
                    }}>
                      <span className="material-icons-round" style={{ fontSize: '12px' }}>{obj.icon}</span>
                      {obj.l?.toUpperCase()}
                    </span>
                    {/* Badge nivel */}
                    <span style={{
                      padding: '3px 10px', borderRadius: '100px',
                      background: `${nivelColor}12`,
                      border: `1px solid ${nivelColor}25`,
                      fontSize: '11px', fontWeight: 700, color: nivelColor,
                      fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      {perfil?.nivel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-icons-round" style={{ fontSize: '13px' }}>calendar_today</span>
                      {fechaStr}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-icons-round" style={{ fontSize: '13px' }}>schedule</span>
                      {horaStr}
                    </span>
                    {macros?.calorias_objetivo && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-icons-round" style={{ fontSize: '13px' }}>local_fire_department</span>
                        {macros.calorias_objetivo} kcal/día
                      </span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <span className="material-icons-round" style={{
                  fontSize: '22px',
                  color: isOpen ? 'var(--lime)' : 'var(--muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s, color 0.15s',
                  flexShrink: 0,
                }}>expand_more</span>
              </button>

              {/* ── Detalle expandido ── */}
              {isOpen && (
                <div style={{
                  borderTop: '1px solid var(--border)',
                  padding: '20px 22px',
                }}>
                  {/* Datos físicos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                    {[
                      { l: 'Peso',    v: `${perfil?.peso} kg`,          icon: 'monitor_weight'  },
                      { l: 'Altura',  v: `${perfil?.altura} cm`,        icon: 'height'          },
                      { l: 'Edad',    v: `${perfil?.edad} años`,        icon: 'cake'            },
                      { l: 'Sexo',    v: perfil?.sexo,                   icon: 'person'          },
                      { l: 'IMC',     v: perfil?.imc || '—',             icon: 'analytics'       },
                      { l: 'Días/sem',v: `${perfil?.dias_disponibles}`,  icon: 'calendar_today'  },
                    ].map(({ l, v, icon }) => (
                      <div key={l} style={{
                        background: 'var(--dark)',
                        borderRadius: '8px', padding: '12px 14px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                      }}>
                        <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--muted)' }}>{icon}</span>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em' }}>{l}</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{v}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Macros resumidos */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px',
                    padding: '16px',
                    background: 'rgba(198,241,53,0.04)',
                    border: '1px solid rgba(198,241,53,0.12)',
                    borderRadius: '10px',
                    marginBottom: '16px',
                  }}>
                    {[
                      { l: 'Calorías',      v: macros?.calorias_objetivo,   unit: 'kcal', color: 'var(--lime)'  },
                      { l: 'Proteínas',     v: `${macros?.proteinas_g}g`,    unit: '',     color: '#60A5FA'      },
                      { l: 'Carbohidratos', v: `${macros?.carbohidratos_g}g`,unit: '',     color: '#F59E0B'      },
                      { l: 'Grasas',        v: `${macros?.grasas_g}g`,       unit: '',     color: 'var(--orange)'},
                    ].map(({ l, v, unit, color }) => (
                      <div key={l} style={{ textAlign: 'center' }}>
                        <div style={{
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontSize: '22px', fontWeight: 700, color, lineHeight: 1,
                        }}>{v}</div>
                        {unit && <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{unit}</span>}
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{l}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── BOTÓN VER PLAN COMPLETO ── */}
                  <button
                    onClick={() => verPlanCompleto(item)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '13px', fontSize: 14 }}
                  >
                    <span className="material-icons-round" style={{ fontSize: 18 }}>open_in_full</span>
                    Ver plan completo con rutina y nutrición
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}