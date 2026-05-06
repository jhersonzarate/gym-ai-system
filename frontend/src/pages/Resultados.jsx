// frontend/src/pages/Resultados.jsx
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ExplicacionCard from '../components/ExplicacionCard'
import ProgressChart   from '../components/ProgressChart'

/* ─── Helpers ─── */
function parseSafe(v) {
  if (!v) return null
  if (typeof v === 'object') return v
  try { return JSON.parse(v) } catch { return null }
}

/* ─── Sub-componentes ─── */
function StatCard({ icon, label, value, sub, accent = 'var(--lime)' }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span className="material-icons-round" style={{ fontSize: 17, color: accent }}>{icon}</span>
        <span style={{
          fontSize: 11, color: 'var(--muted)',
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600,
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>{label}</span>
      </div>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 30, fontWeight: 700, color: accent, lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, textTransform: 'capitalize' }}>{sub}</div>}
    </div>
  )
}

function MacroBar({ label, valor, kcal, pct, color, icon }) {
  return (
    <div style={{ padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-icons-round" style={{ fontSize: 16, color }}>{icon}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 21, fontWeight: 700, color,
          }}>{valor}g</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 6 }}>
            {kcal} kcal · {pct}%
          </span>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(pct, 100)}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  )
}

const TIPO_LABELS = {
  fullbody:      'Full Body',
  upper_lower:   'Upper / Lower',
  ppl:           'Push / Pull / Legs',
  torso_pierna:  'Torso / Pierna',
  especializado: 'Especializado',
}

const TABS = [
  { k: 'rutina',        l: 'Rutina Semanal',    icon: 'fitness_center' },
  { k: 'nutricion',     l: 'Nutrición',          icon: 'restaurant'    },
  { k: 'razonamiento',  l: 'Por qué este plan',  icon: 'lightbulb'     },
  { k: 'progreso',      l: 'Progreso Estimado',  icon: 'show_chart'    },
]

/* ─── Página ─── */
export default function Resultados() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const [tab,     setTab]    = useState(TABS.find(t => t.k === tabParam) ? tabParam : 'rutina')
  const [openDia, setOpenDia] = useState(0)
  const [data] = useState(() => {
  const raw = localStorage.getItem('gym_resultado')
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem('gym_resultado')
    return null
  }
})

  const changeTab = (k) => {
    setTab(k)
    setSearchParams({ tab: k })
  }

  // ✅ Sin estado `checking` — la lectura de localStorage es instantánea
  if (!data) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '400px', flexDirection: 'column', gap: 16,
        textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-icons-round" style={{ fontSize: 32, color: 'var(--border2)' }}>
            assignment_late
          </span>
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            No hay ningún plan activo
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            Genera un plan personalizado para verlo aquí
          </p>
          <button
            onClick={() => navigate('/formulario')}
            className="btn-primary"
            style={{ fontSize: 13, padding: '11px 22px' }}
          >
            <span className="material-icons-round" style={{ fontSize: 17 }}>bolt</span>
            Generar mi plan
          </button>
        </div>
      </div>
    )
  }

  /* ── Extraer campos con fallback robusto ── */
  const perfil    = parseSafe(data.perfil)    || {}
  const nutricion = parseSafe(data.nutricion) || {}
  const ia        = parseSafe(data.ia_decision) || {}
  const rutina    = parseSafe(data.rutina)    || {}
  const progreso  = data.progreso_simulado    || []

  const objetivo = perfil.objetivo || ia.objetivo || 'mantener'

  const explicaciones = (() => {
    const raw = ia.explicacion
    if (!raw) return []
    if (Array.isArray(raw))      return raw.map(e => (typeof e === 'string' ? e.trim() : '')).filter(Boolean)
    if (typeof raw === 'string') return raw.trim() === '' ? [] : raw.split('|').map(s => s.trim()).filter(Boolean)
    return []
  })()

  const tipoLabel = TIPO_LABELS[rutina.tipo_rutina] || rutina.tipo_rutina || '—'

  const totalKcal = nutricion.calorias_objetivo || 1
  const protG     = nutricion.proteinas_g       || 0
  const carbsG    = nutricion.carbohidratos_g   || 0
  const grasasG   = nutricion.grasas_g          || 0

  const macro = (g, mult) => ({
    kcal: Math.round(g * mult),
    pct:  Math.round((g * mult) / totalKcal * 100),
  })

  const prot   = macro(protG,   4)
  const carbs  = macro(carbsG,  4)
  const grasas = macro(grasasG, 9)

  return (
    <div className="animate-fade-up" style={{ maxWidth: 1040, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 22, gap: 16,
      }}>
        <div>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 11, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--lime)', marginBottom: 6,
          }}>Plan generado</div>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 26, fontWeight: 700, letterSpacing: '0.02em',
            color: 'var(--text)',
          }}>
            Tu plan personalizado
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            {tipoLabel}
            {ia.frecuencia ? ` · ${ia.frecuencia} días por semana` : ''}
            {ia.intensidad ? ` · Intensidad ${ia.intensidad}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={() => navigate('/historial')} className="btn-ghost" style={{ fontSize: 13 }}>
            <span className="material-icons-round" style={{ fontSize: 16 }}>history</span>
            Historial
          </button>
          <button
            onClick={() => navigate('/formulario')}
            className="btn-primary"
            style={{ fontSize: 13, padding: '10px 18px' }}
          >
            <span className="material-icons-round" style={{ fontSize: 16 }}>refresh</span>
            Nuevo plan
          </button>
        </div>
      </div>

      {/* ── Stats físicos ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard icon="monitor_weight"        label="IMC"        value={perfil.imc || '—'}         sub={perfil.imc_categoria?.replace(/_/g, ' ')} />
        <StatCard icon="local_fire_department" label="BMR"        value={perfil.bmr || '—'}         sub="kcal basales"       accent="var(--orange)" />
        <StatCard icon="bolt"                  label="TDEE"       value={perfil.tdee || '—'}        sub="kcal con actividad" accent="#F59E0B"        />
        <StatCard icon="accessibility_new"     label="Somatotipo" value={perfil.somatotipo || '—'}  sub="tipo corporal"      accent="#A78BFA"        />
      </div>

      {/* ── Decisiones del sistema ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
        {[
          { l: 'Tipo Rutina', v: tipoLabel,                                          icon: 'fitness_center', accent: 'var(--lime)'   },
          { l: 'Frecuencia',  v: ia.frecuencia ? `${ia.frecuencia} días/sem` : '—',  icon: 'calendar_today', accent: '#60A5FA'       },
          { l: 'Intensidad',  v: ia.intensidad || '—',                               icon: 'speed',          accent: 'var(--orange)' },
          { l: 'Cardio',      v: ia.usa_cardio ? 'Incluido' : 'Sin cardio',          icon: 'directions_run', accent: ia.usa_cardio ? 'var(--lime)' : '#6B7280' },
        ].map(({ l, v, icon, accent }) => (
          <div key={l} style={{
            background: `${accent}08`,
            border: `1px solid ${accent}22`,
            borderRadius: 10, padding: '15px 14px', textAlign: 'center',
          }}>
            <span className="material-icons-round" style={{ fontSize: 20, color: accent, display: 'block', marginBottom: 7 }}>{icon}</span>
            <div style={{
              fontSize: 10, color: 'var(--muted)',
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3,
            }}>{l}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: 4,
        marginBottom: 18,
      }}>
        {TABS.map(({ k, l, icon }) => (
          <button
            key={k}
            onClick={() => changeTab(k)}
            style={{
              flex: 1, padding: '9px 10px', borderRadius: 7,
              border: 'none',
              background: tab === k ? 'var(--lime)' : 'transparent',
              color: tab === k ? '#080A0C' : 'var(--muted2)',
              fontSize: 12, fontWeight: tab === k ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em',
            }}
          >
            <span className="material-icons-round" style={{ fontSize: 15 }}>{icon}</span>
            {l}
          </button>
        ))}
      </div>

      {/* ── Contenido del tab ── */}
      <div key={tab}>

        {/* RUTINA */}
        {tab === 'rutina' && (
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 19, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text)',
                }}>
                  Rutina {tipoLabel}
                </h2>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {rutina.dias?.length || 0} días · Intensidad {ia.intensidad || '—'}
                </p>
              </div>
              <div style={{
                padding: '4px 12px',
                background: 'rgba(198,241,53,0.09)',
                border: '1px solid rgba(198,241,53,0.2)',
                borderRadius: 100,
                fontSize: 11, fontWeight: 700, color: 'var(--lime)',
                fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em',
              }}>PERSONALIZADO</div>
            </div>

            <div style={{ display: 'flex' }}>
              {/* Sidebar de días */}
              <div style={{ width: 210, borderRight: '1px solid var(--border)', flexShrink: 0 }}>
                {(rutina.dias || []).map((dia, i) => (
                  <button
                    key={i}
                    onClick={() => setOpenDia(i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '13px 16px',
                      background: openDia === i ? 'rgba(198,241,53,0.05)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      borderLeft: `3px solid ${openDia === i ? 'var(--lime)' : 'transparent'}`,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, flexShrink: 0,
                      background: openDia === i ? 'var(--lime)' : 'var(--border)',
                      borderRadius: 7,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 12,
                      color: openDia === i ? '#080A0C' : 'var(--muted)',
                      transition: 'all 0.12s',
                    }}>{i + 1}</div>
                    <div>
                      <div style={{
                        fontSize: 12, fontWeight: 600,
                        color: openDia === i ? 'var(--text)' : 'var(--muted2)',
                        lineHeight: 1.2,
                      }}>
                        {dia.nombre?.split('—')[1]?.trim() || dia.nombre}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                        {dia.ejercicios?.length || 0} ejercicios
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Ejercicios del día */}
              <div style={{ flex: 1, padding: '16px 18px' }}>
                {rutina.dias?.[openDia] && (() => {
                  const dia = rutina.dias[openDia]
                  return (
                    <>
                      <div style={{
                        marginBottom: 14, paddingBottom: 12,
                        borderBottom: '1px solid var(--border)',
                      }}>
                        <h3 style={{
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontSize: 17, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text)',
                        }}>{dia.nombre}</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {(dia.ejercicios || []).map((ex, j) => {
                          const isCardio = ex.grupo === 'cardio'
                          const aColor   = isCardio ? '#60A5FA' : 'var(--lime)'
                          const series   = ex.series
                          const reps     = ex.repeticiones || ex.reps
                          const descanso = ex.descanso_seg || ex.descansoSeg || 0
                          return (
                            <div key={j} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '11px 14px',
                              background: isCardio ? 'rgba(96,165,250,0.04)' : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${isCardio ? 'rgba(96,165,250,0.14)' : 'var(--border)'}`,
                              borderRadius: 8,
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 26, height: 26, flexShrink: 0,
                                  background: `${aColor}12`, borderRadius: 6,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <span className="material-icons-round" style={{ fontSize: 14, color: aColor }}>
                                    {isCardio ? 'directions_run' : 'fitness_center'}
                                  </span>
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{ex.nombre}</div>
                                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1, textTransform: 'capitalize' }}>
                                    {ex.grupo} · {(ex.equipo || '').replace(/_/g, ' ')}
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                {!isCardio ? (
                                  <div style={{
                                    fontFamily: 'Barlow Condensed, sans-serif',
                                    fontSize: 17, fontWeight: 700, color: 'var(--lime)',
                                  }}>
                                    {series} × {reps}
                                  </div>
                                ) : (
                                  <div style={{
                                    fontFamily: 'Barlow Condensed, sans-serif',
                                    fontSize: 17, fontWeight: 700, color: '#60A5FA',
                                  }}>
                                    {reps}
                                  </div>
                                )}
                                {descanso > 0 && (
                                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                                    {descanso}s descanso
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {/* NUTRICION */}
        {tab === 'nutricion' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 22,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                <h2 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 19, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text)',
                }}>Distribución de Macros</h2>
                <div>
                  <div style={{
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize: 34, color: 'var(--lime)', lineHeight: 1,
                  }}>
                    {totalKcal.toLocaleString()}
                    <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'Barlow, sans-serif', fontWeight: 400 }}> kcal</span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>
                Calorías diarias según tu metabolismo y objetivo ({objetivo.replace(/_/g, ' ')})
              </p>
              <MacroBar label="Proteínas"     valor={protG}   kcal={prot.kcal}   pct={prot.pct}   color="#60A5FA"       icon="egg_alt" />
              <MacroBar label="Carbohidratos" valor={carbsG}  kcal={carbs.kcal}  pct={carbs.pct}  color="#F59E0B"       icon="grain"   />
              <MacroBar label="Grasas"        valor={grasasG} kcal={grasas.kcal} pct={grasas.pct} color="var(--orange)" icon="opacity" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'BMR',  value: perfil.bmr,  sub: 'Calorías en reposo',    icon: 'bedtime', color: '#A78BFA' },
                { label: 'TDEE', value: perfil.tdee, sub: 'Calorías con actividad', icon: 'bolt',   color: '#F59E0B' },
                { label: 'META', value: totalKcal,   sub: 'Objetivo diario',        icon: 'flag',   color: 'var(--lime)' },
              ].map(({ label, value, sub, icon, color }) => (
                <div key={label} style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '16px 18px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                    <span className="material-icons-round" style={{ fontSize: 15, color }}>{icon}</span>
                    <span style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: 11, fontWeight: 600,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'var(--muted)',
                    }}>{label}</span>
                  </div>
                  <div style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: 26, fontWeight: 700, color, lineHeight: 1,
                  }}>
                    {value || '—'}
                    {value && <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Barlow, sans-serif', fontWeight: 400, marginLeft: 4 }}>kcal</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POR QUÉ ESTE PLAN */}
        {tab === 'razonamiento' && (
          <ExplicacionCard explicaciones={explicaciones} />
        )}

        {/* PROGRESO */}
        {tab === 'progreso' && (
          progreso.length > 0
            ? <ProgressChart data={progreso} objetivo={objetivo} />
            : (
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '48px 32px', textAlign: 'center',
              }}>
                <span className="material-icons-round" style={{ fontSize: 40, color: 'var(--muted)', display: 'block', marginBottom: 16 }}>
                  show_chart
                </span>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                  No hay datos de progreso disponibles en este plan.
                </p>
              </div>
            )
        )}
      </div>
    </div>
  )
}