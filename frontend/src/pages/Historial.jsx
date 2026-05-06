// frontend/src/pages/Historial.jsx
import { useEffect, useState, useRef } from 'react'
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
  const navigate = useNavigate()
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [error,    setError]    = useState('')
  const [deleting, setDeleting] = useState(null)   // id del item que se está borrando

  // ✅ ARREGLO: useRef para rastrear si el componente está montado
  const isMountedRef = useRef(true)

  // ✅ ARREGLO: Envolver cargarHistorial en una función que se ejecuta con effect
  useEffect(() => {
    let didCleanup = false

    const cargarHistorial = async () => {
      setLoading(true)
      try {
        const { data } = await gymAPI.getHistory()
        if (!didCleanup && isMountedRef.current) {
          setItems(data.historial || [])
          setError('')
        }
      } catch {
        if (!didCleanup && isMountedRef.current) {
          setError('No se pudo cargar el historial. Verifica tu conexión.')
        }
      } finally {
        if (!didCleanup && isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    cargarHistorial()

    return () => {
      didCleanup = true
    }
  }, [])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Cargar un plan del historial como resultado activo → ir a Resultados
  const verPlanCompleto = (item) => {
    const perfil     = typeof item.perfil      === 'string' ? JSON.parse(item.perfil)      : item.perfil
    const rutina     = typeof item.rutina      === 'string' ? JSON.parse(item.rutina)      : item.rutina
    const macros     = typeof item.macros      === 'string' ? JSON.parse(item.macros)      : item.macros
    const ia_raw     = typeof item.ia_decision === 'string' ? JSON.parse(item.ia_decision) : item.ia_decision

    // Usar ia_decision real si existe en el registro, sino reconstruir básico
    const ia_decision = ia_raw || {
      tipo_rutina:  rutina?.tipo_rutina,
      frecuencia:   perfil?.dias_disponibles,
      intensidad:   perfil?.nivel === 'principiante' ? 'baja'
                  : perfil?.nivel === 'intermedio'   ? 'moderada' : 'alta',
      usa_cardio:   perfil?.objetivo === 'perder_grasa',
      objetivo:     perfil?.objetivo,
      explicacion: [
        `Tu nivel ${perfil?.nivel || '—'} determina la frecuencia y tipo de rutina asignada.`,
        `Tu objetivo de ${(perfil?.objetivo || '').replace(/_/g, ' ')} define la distribución calórica.`,
        `Con ${perfil?.dias_disponibles || '—'} días disponibles se optimizó el tipo de entrenamiento.`,
        `Tu IMC de ${perfil?.imc || '—'} (${(perfil?.imc_categoria || '').replace(/_/g, ' ')}) ajusta la intensidad.`,
      ],
    }

    // ✅ ARREGLO 3: Garantizar que TODOS los datos de nutrición se persistan correctamente
    const resultado = {
      id:        item.id,   // ← incluir id para verificación en Resultados.jsx
      perfil: {
        ...perfil,
        bmr:  perfil?.bmr || macros?.bmr,      // Asegurar BMR
        tdee: perfil?.tdee || macros?.tdee,    // Asegurar TDEE
      },
      nutricion:  {
        ...macros,
        calorias_objetivo:  macros?.calorias_objetivo,
        proteinas_g:        macros?.proteinas_g,
        carbohidratos_g:    macros?.carbohidratos_g,
        grasas_g:           macros?.grasas_g,
      },
      ia_decision,
      rutina,
      progreso_simulado: generarProgreso(perfil?.objetivo),
    }

    localStorage.setItem('gym_resultado', JSON.stringify(resultado))
    navigate('/resultados')
  }

  // Eliminar un plan del historial
  const eliminarPlan = async (e, itemId) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este plan del historial?')) return

    setDeleting(itemId)
    try {
      await gymAPI.deleteHistoryItem(itemId)

      // Si el plan activo en localStorage es este, limpiarlo
      const localRaw = localStorage.getItem('gym_resultado')
      if (localRaw) {
        try {
          const local = JSON.parse(localRaw)
          if (local?.id === itemId) {
            localStorage.removeItem('gym_resultado')
          }
        } catch {/* */}
      }

      // Actualizar lista local
      setItems(prev => prev.filter(i => i.id !== itemId))
      if (expanded !== null && items[expanded]?.id === itemId) {
        setExpanded(null)
      }
    } catch {
      alert('No se pudo eliminar el plan. Intenta de nuevo.')
    } finally {
      setDeleting(null)
    }
  }

  // Progreso simple para planes cargados desde historial
  const generarProgreso = (objetivo) => {
    const factores_grasa   = [0.9, 0.8, 0.7, 0.6, 0.55, 0.5, 0.45, 0.4]
    const factores_musculo = [0.15, 0.20, 0.25, 0.28, 0.28, 0.26, 0.25, 0.22]
    let acumulado = 0
    return Array.from({ length: 8 }, (_, i) => {
      const delta = objetivo === 'perder_grasa'
        ? -factores_grasa[i]
        : objetivo === 'ganar_musculo'
        ? factores_musculo[i]
        : 0
      acumulado = Math.round((acumulado + delta) * 10) / 10
      return { semana: i + 1, cambio_kg: acumulado }
    })
  }

  // ✅ ARREGLO: Función para reintentar carga
  const reintentar = async () => {
    let didCleanup = false
    setLoading(true)
    try {
      const { data } = await gymAPI.getHistory()
      if (!didCleanup && isMountedRef.current) {
        setItems(data.historial || [])
        setError('')
      }
    } catch {
      if (!didCleanup && isMountedRef.current) {
        setError('No se pudo cargar el historial. Verifica tu conexión.')
      }
    } finally {
      if (!didCleanup && isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  /* ── Estados de carga / error / vacío ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', flexDirection: 'column', gap: 16 }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid var(--border)', borderTopColor: 'var(--lime)',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 14, color: 'var(--muted)' }}>Cargando historial...</span>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', flexDirection: 'column', gap: 12 }}>
      <span className="material-icons-round" style={{ fontSize: 40, color: 'var(--red)' }}>error_outline</span>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>{error}</p>
      <button onClick={reintentar} className="btn-ghost" style={{ fontSize: 13 }}>
        <span className="material-icons-round" style={{ fontSize: 16 }}>refresh</span>
        Reintentar
      </button>
    </div>
  )

  if (!items.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '360px', flexDirection: 'column', gap: 16 }}>
      <div style={{
        width: 72, height: 72,
        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-icons-round" style={{ fontSize: 32, color: 'var(--border2)' }}>history</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Sin historial todavía</p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Genera tu primer plan para verlo aquí</p>
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
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 11, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: 6,
          }}>Registro de sesiones</div>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 28, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text)',
          }}>
            Historial de planes
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            {items.length} {items.length === 1 ? 'plan generado' : 'planes generados'} — haz clic en cualquiera para ver el detalle
          </p>
        </div>

        {/* Stats rápidas */}
        <div style={{ display: 'flex', gap: 12 }}>
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
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '12px 18px',
              textAlign: 'center', minWidth: 120,
            }}>
              <span className="material-icons-round" style={{ fontSize: 16, color: 'var(--lime)', display: 'block', marginBottom: 4 }}>{icon}</span>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lista de planes ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
          // Número de plan para el usuario: posición en la lista (más reciente = #1)
          const numPlan    = items.length - i

          return (
            <div
              key={item.id}
              style={{
                background: 'var(--card)',
                border: `1px solid ${isOpen ? 'rgba(198,241,53,0.2)' : 'var(--border)'}`,
                borderRadius: 12, overflow: 'hidden',
                transition: 'border-color 0.2s',
                opacity: deleting === item.id ? 0.5 : 1,
              }}
            >
              {/* Cabecera */}
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 22px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {/* Número de plan */}
                <div style={{
                  width: 44, height: 44,
                  background: isOpen ? 'rgba(198,241,53,0.12)' : 'var(--dark)',
                  border: `1px solid ${isOpen ? 'rgba(198,241,53,0.25)' : 'var(--border2)'}`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all 0.15s',
                }}>
                  <span style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: 18, fontWeight: 700,
                    color: isOpen ? 'var(--lime)' : 'var(--muted)',
                  }}>
                    #{numPlan}
                  </span>
                </div>

                {/* Info principal */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: 17, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text)',
                    }}>{tipo}</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 10px', borderRadius: 100,
                      background: `${obj.color}12`, border: `1px solid ${obj.color}25`,
                      fontSize: 11, fontWeight: 700, color: obj.color,
                      fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em',
                    }}>
                      <span className="material-icons-round" style={{ fontSize: 12 }}>{obj.icon}</span>
                      {obj.l?.toUpperCase()}
                    </span>
                    <span style={{
                      padding: '3px 10px', borderRadius: 100,
                      background: `${nivelColor}12`, border: `1px solid ${nivelColor}25`,
                      fontSize: 11, fontWeight: 700, color: nivelColor,
                      fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      {perfil?.nivel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-icons-round" style={{ fontSize: 13 }}>calendar_today</span>
                      {fechaStr}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-icons-round" style={{ fontSize: 13 }}>schedule</span>
                      {horaStr}
                    </span>
                    {macros?.calorias_objetivo && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-icons-round" style={{ fontSize: 13 }}>local_fire_department</span>
                        {macros.calorias_objetivo} kcal/día
                      </span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <span className="material-icons-round" style={{
                  fontSize: 22,
                  color: isOpen ? 'var(--lime)' : 'var(--muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s, color 0.15s',
                  flexShrink: 0,
                }}>expand_more</span>
              </button>

              {/* ── Detalle expandido ── */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '20px 22px' }}>
                  {/* Datos físicos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                      { l: 'Peso',     v: `${perfil?.peso} kg`,           icon: 'monitor_weight' },
                      { l: 'Altura',   v: `${perfil?.altura} cm`,         icon: 'height'         },
                      { l: 'Edad',     v: `${perfil?.edad} años`,         icon: 'cake'           },
                      { l: 'Sexo',     v: perfil?.sexo,                   icon: 'person'         },
                      { l: 'IMC',      v: perfil?.imc ? String(perfil.imc) : '—', icon: 'analytics' },
                      { l: 'Días/sem', v: `${perfil?.dias_disponibles}`,  icon: 'calendar_today' },
                    ].map(({ l, v, icon }) => (
                      <div key={l} style={{
                        background: 'var(--dark)', borderRadius: 8, padding: '12px 14px',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <span className="material-icons-round" style={{ fontSize: 16, color: 'var(--muted)' }}>{icon}</span>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>{l}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{v}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Macros resumidos */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
                    padding: 16,
                    background: 'rgba(198,241,53,0.04)',
                    border: '1px solid rgba(198,241,53,0.12)',
                    borderRadius: 10, marginBottom: 16,
                  }}>
                    {[
                      { l: 'Calorías',      v: macros?.calorias_objetivo,    unit: 'kcal', color: 'var(--lime)'  },
                      { l: 'Proteínas',     v: `${macros?.proteinas_g}g`,     unit: '',    color: '#60A5FA'      },
                      { l: 'Carbohidratos', v: `${macros?.carbohidratos_g}g`, unit: '',    color: '#F59E0B'      },
                      { l: 'Grasas',        v: `${macros?.grasas_g}g`,        unit: '',    color: 'var(--orange)'},
                    ].map(({ l, v, unit, color }) => (
                      <div key={l} style={{ textAlign: 'center' }}>
                        <div style={{
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontSize: 22, fontWeight: 700, color, lineHeight: 1,
                        }}>{v}</div>
                        {unit && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{unit}</span>}
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => verPlanCompleto(item)}
                      className="btn-primary"
                      style={{ flex: 1, padding: 13, fontSize: 14 }}
                    >
                      <span className="material-icons-round" style={{ fontSize: 18 }}>open_in_full</span>
                      Ver plan completo con rutina y nutrición
                    </button>
                    <button
                      onClick={(e) => eliminarPlan(e, item.id)}
                      disabled={deleting === item.id}
                      style={{
                        padding: '13px 16px',
                        background: 'rgba(239,68,68,0.07)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 8,
                        color: '#FCA5A5',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 500,
                        transition: 'all 0.15s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                      title="Eliminar este plan"
                    >
                      {deleting === item.id
                        ? <span className="material-icons-round animate-spin" style={{ fontSize: 17 }}>refresh</span>
                        : <span className="material-icons-round" style={{ fontSize: 17 }}>delete_outline</span>
                      }
                      Eliminar
                    </button>
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
