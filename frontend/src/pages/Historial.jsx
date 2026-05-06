// frontend/src/pages/Historial.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gymAPI } from '../services/api'

function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 40px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        background: 'rgba(198,241,53,0.06)',
        border: '1px solid rgba(198,241,53,0.15)',
        borderRadius: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <span className="material-icons-round" style={{ fontSize: '32px', color: 'var(--gym-lime)' }}>
          history
        </span>
      </div>
      <h3 className="font-condensed" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gym-text)', marginBottom: '10px', letterSpacing: '0.02em' }}>
        Sin historial aún
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--gym-muted)', maxWidth: '320px', lineHeight: 1.7 }}>
        Genera tu primer plan personalizado y aparecerá aquí para que puedas consultarlo cuando quieras.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: 'var(--gym-card)',
          border: '1px solid var(--gym-border)',
          borderRadius: '12px',
          padding: '22px 24px',
          opacity: 1 - i * 0.2,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--gym-border)', borderRadius: '10px' }} />
              <div>
                <div style={{ width: '140px', height: '14px', background: 'var(--gym-border)', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ width: '100px', height: '11px', background: 'var(--gym-border)', borderRadius: '4px' }} />
              </div>
            </div>
            <div style={{ width: '60px', height: '24px', background: 'var(--gym-border)', borderRadius: '6px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const TIPO_LABELS = {
  fullbody: 'Full Body',
  upper_lower: 'Upper / Lower',
  ppl: 'Push Pull Legs',
  torso_pierna: 'Torso / Pierna',
  especializado: 'Especializado',
}

const OBJETIVO_COLORS = {
  perder_grasa:  { color: 'var(--gym-orange)', bg: 'rgba(242,101,34,0.1)', label: 'Perder Grasa',   icon: 'trending_down' },
  ganar_musculo: { color: 'var(--gym-lime)',   bg: 'rgba(198,241,53,0.1)', label: 'Ganar Músculo', icon: 'trending_up'   },
  mantener:      { color: '#60A5FA',           bg: 'rgba(96,165,250,0.1)', label: 'Mantener',      icon: 'balance'       },
}

const NIVEL_ICONS = {
  principiante: 'energy_savings_leaf',
  intermedio:   'local_fire_department',
  avanzado:     'whatshot',
}

function HistorialItem({ item, index, isOpen, onToggle }) {
  const perfil  = typeof item.perfil  === 'string' ? JSON.parse(item.perfil)  : item.perfil
  const macros  = typeof item.macros  === 'string' ? JSON.parse(item.macros)  : item.macros
  const rutina  = typeof item.rutina  === 'string' ? JSON.parse(item.rutina)  : item.rutina

  const fecha   = new Date(item.fecha)
  const fechaStr = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
  const horaStr  = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

  const objetivo  = OBJETIVO_COLORS[perfil?.objetivo] || OBJETIVO_COLORS.mantener
  const tipoLabel = TIPO_LABELS[rutina?.tipo_rutina] || rutina?.tipo_rutina?.toUpperCase() || 'N/A'

  return (
    <div
      className={`animate-fade-up stagger-${Math.min(index + 1, 4)}`}
      style={{
        background: 'var(--gym-card)',
        border: isOpen ? '1px solid rgba(198,241,53,0.2)' : '1px solid var(--gym-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s',
          gap: '16px',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        {/* Left: icon + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
          {/* Plan number badge */}
          <div style={{
            width: '44px',
            height: '44px',
            background: isOpen ? 'var(--gym-lime)' : 'rgba(198,241,53,0.08)',
            border: `1px solid ${isOpen ? 'var(--gym-lime)' : 'rgba(198,241,53,0.2)'}`,
            borderRadius: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}>
            <span className="font-condensed" style={{
              fontSize: '16px',
              fontWeight: 700,
              color: isOpen ? '#080A0C' : 'var(--gym-lime)',
            }}>
              #{item.id}
            </span>
          </div>

          {/* Info */}
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
              <span className="font-condensed" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gym-text)', letterSpacing: '0.02em' }}>
                {tipoLabel}
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 10px',
                background: objetivo.bg,
                borderRadius: '100px',
                flexShrink: 0,
              }}>
                <span className="material-icons-round" style={{ fontSize: '12px', color: objetivo.color }}>{objetivo.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: objetivo.color, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em' }}>
                  {objetivo.label}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--gym-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="material-icons-round" style={{ fontSize: '13px' }}>calendar_today</span>
                {fechaStr}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gym-muted)' }}>·</span>
              <span style={{ fontSize: '12px', color: 'var(--gym-muted)' }}>{horaStr}</span>
            </div>
          </div>
        </div>

        {/* Right: kcal + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div className="font-condensed" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gym-lime)', lineHeight: 1 }}>
              {macros?.calorias_objetivo?.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--gym-muted)', letterSpacing: '0.06em' }}>KCAL / DÍA</div>
          </div>
          <span className="material-icons-round" style={{
            fontSize: '20px',
            color: 'var(--gym-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
          }}>
            expand_more
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div style={{
          padding: '0 24px 24px',
          borderTop: '1px solid var(--gym-border)',
          paddingTop: '20px',
          animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>
          {/* Physical stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Nivel',       value: perfil?.nivel,                            icon: NIVEL_ICONS[perfil?.nivel] || 'military_tech', color: '#60A5FA' },
              { label: 'Días/sem',    value: `${perfil?.dias_disponibles} días`,        icon: 'calendar_today',                              color: '#A78BFA' },
              { label: 'IMC',         value: perfil?.imc?.toString() || '—',            icon: 'monitor_weight',                              color: 'var(--gym-lime)' },
              { label: 'Somatotipo',  value: perfil?.somatotipo || '—',                 icon: 'accessibility_new',                           color: 'var(--gym-orange)' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--gym-border)',
                borderRadius: '8px',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span className="material-icons-round" style={{ fontSize: '13px', color }}>{icon}</span>
                  <span style={{ fontSize: '10px', color: 'var(--gym-muted)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {label}
                  </span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gym-text)', textTransform: 'capitalize' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Macros row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { label: 'Proteínas',     value: macros?.proteinas_g,     unit: 'g', color: '#60A5FA', icon: 'egg_alt' },
              { label: 'Carbohidratos', value: macros?.carbohidratos_g, unit: 'g', color: '#F59E0B', icon: 'grain'   },
              { label: 'Grasas',        value: macros?.grasas_g,        unit: 'g', color: 'var(--gym-orange)', icon: 'opacity' },
            ].map(({ label, value, unit, color, icon }) => (
              <div key={label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--gym-border)',
                borderRadius: '8px',
                padding: '12px 14px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: `${color}15`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span className="material-icons-round" style={{ fontSize: '16px', color }}>{icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--gym-muted)', marginBottom: '3px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {label}
                  </div>
                  <div className="font-condensed" style={{ fontSize: '20px', fontWeight: 700, color, lineHeight: 1 }}>
                    {value}<span style={{ fontSize: '12px', color: 'var(--gym-muted)', marginLeft: '2px', fontFamily: 'Barlow, sans-serif', fontWeight: 400 }}>{unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Historial() {
  const navigate = useNavigate()
  const [items,      setItems]      = useState([])
  const [savedItems, setSavedItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gym_saved_results') || '[]')
    } catch {
      return []
    }
  })
  const [loading,    setLoading]    = useState(true)
  const [open,       setOpen]       = useState(null)
  const [error,      setError]      = useState('')

  useEffect(() => {
    gymAPI.getHistory()
      .then(({ data }) => setItems(data.historial || []))
      .catch(() => setError('No se pudo cargar el historial. Verifica tu conexión.'))
      .finally(() => setLoading(false))
  }, [])

  const handleViewSaved = (item) => {
    localStorage.setItem('gym_resultado', JSON.stringify(item.resultado))
    navigate('/resultados')
  }

  const handleDeleteSaved = (id) => {
    const next = savedItems.filter(item => item.id !== id)
    localStorage.setItem('gym_saved_results', JSON.stringify(next))
    setSavedItems(next)
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px' }}>
        <div>
          <div className="label-tag" style={{ marginBottom: '6px', color: 'var(--gym-lime)' }}>Registro</div>
          <h1 className="font-condensed" style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.02em' }}>
            Historial de Planes
          </h1>
          <p style={{ color: 'var(--gym-muted)', fontSize: '13px', marginTop: '4px' }}>
            {items.length > 0 ? `${items.length} planes generados` : 'Sin historial en servidor'}
            {savedItems.length > 0 ? ` · ${savedItems.length} guardados locales` : ''}
          </p>
        </div>

        {items.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(198,241,53,0.06)',
            border: '1px solid rgba(198,241,53,0.15)',
            borderRadius: '8px',
          }}>
            <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--gym-lime)' }}>
              check_circle
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gym-lime)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em' }}>
              {items.length} planes guardados
            </span>
          </div>
        )}
      </div>

      {savedItems.length > 0 && (
        <div style={{ marginBottom: '24px', padding: '20px', background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <div className="label-tag" style={{ marginBottom: '6px', color: 'var(--gym-lime)' }}>Guardados</div>
              <h2 className="font-condensed" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.02em' }}>
                Planes guardados localmente
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--gym-muted)', marginTop: '4px' }}>
                Selecciona un plan para verlo en la pantalla de Resultados.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
            {savedItems.map((item) => {
              const perfil = item.perfil
              const objetivo = OBJETIVO_COLORS[perfil?.objetivo] || OBJETIVO_COLORS.mantener
              const fecha = new Date(item.fecha)
              const fechaStr = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
              return (
                <div key={item.id} style={{ background: 'var(--gym-dark)', border: '1px solid var(--gym-border)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gym-text)' }}>
                        {OBJETIVO_COLORS[perfil?.objetivo]?.label || 'Plan guardado'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gym-muted)', marginTop: '5px' }}>
                        {fechaStr}
                      </div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: objetivo.bg, borderRadius: '999px', color: objetivo.color, fontSize: '11px', fontWeight: 700 }}>
                      <span className="material-icons-round" style={{ fontSize: '14px' }}>{objetivo.icon}</span>
                      {objetivo.label}
                    </div>
                  </div>

                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gym-lime)' }}>
                    {item.resultado?.nutricion?.calorias_objetivo?.toLocaleString() || '—'} kcal/día
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleViewSaved(item)}
                      className="btn-ghost"
                      style={{ flex: 1, padding: '10px 14px', fontSize: '12px' }}
                    >
                      Ver resultado
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSaved(item.id)}
                      className="btn-ghost"
                      style={{ flex: 1, padding: '10px 14px', fontSize: '12px', borderColor: 'rgba(239,68,68,0.35)', color: '#F87171' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats summary bar — solo si hay items */}
      {!loading && items.length > 0 && (() => {
        const perfilesValidos = items.map(i => {
          try { return typeof i.perfil === 'string' ? JSON.parse(i.perfil) : i.perfil } catch { return null }
        }).filter(Boolean)

        const objetivos = perfilesValidos.reduce((acc, p) => {
          if (p?.objetivo) acc[p.objetivo] = (acc[p.objetivo] || 0) + 1
          return acc
        }, {})

        const masComun = Object.entries(objetivos).sort((a, b) => b[1] - a[1])[0]?.[0]
        const masComonLabel = OBJETIVO_COLORS[masComun]?.label || masComun

        const macrosArr = items.map(i => {
          try { return typeof i.macros === 'string' ? JSON.parse(i.macros) : i.macros } catch { return null }
        }).filter(Boolean)

        const avgKcal = macrosArr.length
          ? Math.round(macrosArr.reduce((s, m) => s + (m?.calorias_objetivo || 0), 0) / macrosArr.length)
          : 0

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Total de planes',    value: items.length.toString(),   icon: 'assignment',      accent: 'var(--gym-lime)' },
              { label: 'Objetivo frecuente', value: masComonLabel || '—',      icon: 'flag',            accent: 'var(--gym-orange)' },
              { label: 'Promedio kcal/día',  value: avgKcal ? `${avgKcal.toLocaleString()} kcal` : '—', icon: 'local_fire_department', accent: '#F59E0B' },
            ].map(({ label, value, icon, accent }) => (
              <div key={label} style={{
                background: 'var(--gym-card)',
                border: '1px solid var(--gym-border)',
                borderRadius: '10px',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: `${accent}12`,
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span className="material-icons-round" style={{ fontSize: '18px', color: accent }}>{icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gym-muted)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gym-text)', textTransform: 'capitalize' }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span className="material-icons-round" style={{ fontSize: '20px', color: 'var(--gym-red)' }}>error_outline</span>
          <span style={{ fontSize: '14px', color: '#FCA5A5' }}>{error}</span>
        </div>
      ) : items.length === 0 && savedItems.length === 0 ? (
        <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px' }}>
          <EmptyState />
        </div>
      ) : items.length === 0 ? (
        <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gym-text)', marginBottom: '10px' }}>No hay historial en el servidor</div>
          <div style={{ fontSize: '14px', color: 'var(--gym-muted)' }}>Sin embargo, tienes resultados guardados localmente que puedes abrir desde arriba.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item, i) => (
            <HistorialItem
              key={item.id}
              item={item}
              index={i}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}

          <p style={{ fontSize: '11px', color: 'var(--gym-muted)', textAlign: 'center', marginTop: '8px', letterSpacing: '0.02em' }}>
            Se muestran los últimos 10 planes · Los planes más antiguos se archivan automáticamente
          </p>
        </div>
      )}
    </div>
  )
}