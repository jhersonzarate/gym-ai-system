// frontend/src/pages/Resultados.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExplicacionCard from '../components/ExplicacionCard'
import ProgressChart   from '../components/ProgressChart'

function StatCard({ icon, label, value, sub, accent = 'var(--gym-lime)' }) {
  return (
    <div style={{
      background: 'var(--gym-card)',
      border: '1px solid var(--gym-border)',
      borderRadius: '12px',
      padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span className="material-icons-round" style={{ fontSize: '18px', color: accent }}>{icon}</span>
        <span style={{ fontSize: '12px', color: 'var(--gym-muted)', letterSpacing: '0.04em', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div className="font-condensed" style={{ fontSize: '32px', fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--gym-muted)', marginTop: '5px' }}>{sub}</div>}
    </div>
  )
}

function MacroBar({ label, valor, kcal, pct, color, icon }) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--gym-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons-round" style={{ fontSize: '16px', color }}>{icon}</span>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{label}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="font-condensed" style={{ fontSize: '22px', fontWeight: 700, color }}>{valor}g</span>
          <span style={{ fontSize: '12px', color: 'var(--gym-muted)', marginLeft: '6px' }}>{kcal} kcal · {pct}%</span>
        </div>
      </div>
      <div style={{ height: '5px', background: 'var(--gym-border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color,
          borderRadius: '3px',
          transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  )
}

export default function Resultados() {
  const navigate = useNavigate()
  const [data] = useState(() => {
    const raw = sessionStorage.getItem('gym_resultado')
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? parsed : null
    } catch (err) {
      console.error('Error parsing gym_resultado:', err)
      sessionStorage.removeItem('gym_resultado')
      return null
    }
  })
  const [openDia, setOpenDia] = useState(0)
  const [tab, setTab]     = useState('rutina')

  useEffect(() => {
    if (!data) {
      navigate('/formulario')
    }
  }, [data, navigate])

  if (!data) return null

  const { perfil, nutricion, ia_decision, rutina, progreso_simulado } = data

  const explicaciones = typeof ia_decision.explicacion === 'string'
    ? ia_decision.explicacion.split('|')
    : (ia_decision.explicacion || [])

  const totalKcal = nutricion.calorias_objetivo
  const prot  = { v: nutricion.proteinas_g,    kcal: Math.round(nutricion.proteinas_g * 4),    pct: Math.round(nutricion.proteinas_g * 4 / totalKcal * 100) }
  const carbs  = { v: nutricion.carbohidratos_g, kcal: Math.round(nutricion.carbohidratos_g * 4), pct: Math.round(nutricion.carbohidratos_g * 4 / totalKcal * 100) }
  const grasas = { v: nutricion.grasas_g,       kcal: Math.round(nutricion.grasas_g * 9),       pct: Math.round(nutricion.grasas_g * 9 / totalKcal * 100) }

  const tipoLabel = {
    fullbody: 'Full Body',
    upper_lower: 'Upper / Lower',
    ppl: 'Push Pull Legs',
    torso_pierna: 'Torso / Pierna',
    especializado: 'Especializado',
  }[rutina?.tipo_rutina] || rutina?.tipo_rutina

  return (
    <div className="animate-fade-up" style={{ maxWidth: '1020px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
        <div>
          <div className="label-tag" style={{ marginBottom: '6px', color: 'var(--gym-lime)' }}>Plan generado</div>
          <h1 className="font-condensed" style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.02em' }}>
            Tu plan personalizado esta listo
          </h1>
          <p style={{ color: 'var(--gym-muted)', fontSize: '13px', marginTop: '4px' }}>
            Generado por Prolog (IA) + Scala · {rutina?.generado_por === 'scala_engine' ? 'Motor Scala activo' : 'Motor Python activo'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button onClick={() => navigate('/historial')} className="btn-ghost" style={{ fontSize: '13px' }}>
            <span className="material-icons-round" style={{ fontSize: '16px' }}>history</span>
            Historial
          </button>
          <button onClick={() => navigate('/formulario')} className="btn-primary" style={{ fontSize: '14px', padding: '10px 18px' }}>
            <span className="material-icons-round" style={{ fontSize: '16px' }}>refresh</span>
            Nuevo plan
          </button>
        </div>
      </div>

      {/* Stats fisicos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard icon="monitor_weight" label="IMC"       value={perfil.imc}       sub={perfil.imc_categoria?.replace('_', ' ')} />
        <StatCard icon="local_fire_department" label="BMR" value={`${perfil.bmr}`} sub="kcal en reposo" accent="var(--gym-orange)" />
        <StatCard icon="bolt" label="TDEE"                 value={`${perfil.tdee}`} sub="kcal con actividad" accent="#F59E0B" />
        <StatCard icon="accessibility_new" label="Somatotipo" value={perfil.somatotipo} sub="tipo corporal" accent="#A78BFA" />
      </div>

      {/* Decisiones IA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { l: 'Tipo Rutina',    v: tipoLabel,                         icon: 'fitness_center', accent: 'var(--gym-lime)' },
          { l: 'Frecuencia',     v: `${ia_decision.frecuencia} dias/sem`, icon: 'calendar_today', accent: '#60A5FA' },
          { l: 'Intensidad',     v: ia_decision.intensidad,            icon: 'speed',          accent: 'var(--gym-orange)' },
          { l: 'Cardio',         v: ia_decision.usa_cardio ? 'Incluido' : 'Sin cardio', icon: 'directions_run', accent: ia_decision.usa_cardio ? '#C6F135' : '#6B7280' },
        ].map(({ l, v, icon, accent }) => (
          <div key={l} style={{
            background: `${accent}08`,
            border: `1px solid ${accent}20`,
            borderRadius: '10px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <span className="material-icons-round" style={{ fontSize: '20px', color: accent, display: 'block', marginBottom: '8px' }}>{icon}</span>
            <div style={{ fontSize: '11px', color: 'var(--gym-muted)', letterSpacing: '0.06em', marginBottom: '4px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, textTransform: 'uppercase' }}>{l}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gym-text)', textTransform: 'capitalize' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--gym-card)', borderRadius: '10px', padding: '4px', border: '1px solid var(--gym-border)' }}>
        {[
          { k: 'rutina',    l: 'Rutina Semanal',    icon: 'fitness_center' },
          { k: 'nutricion', l: 'Plan Nutricional',   icon: 'restaurant' },
          { k: 'prolog',    l: 'Explicacion IA',     icon: 'psychology' },
          { k: 'progreso',  l: 'Progreso Estimado',  icon: 'show_chart' },
        ].map(({ k, l, icon }) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '7px',
              border: 'none',
              background: tab === k ? 'var(--gym-lime)' : 'transparent',
              color: tab === k ? '#080A0C' : 'var(--gym-muted2)',
              fontSize: '13px',
              fontWeight: tab === k ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontFamily: 'Barlow Condensed, sans-serif',
              letterSpacing: '0.04em',
            }}
          >
            <span className="material-icons-round" style={{ fontSize: '16px' }}>{icon}</span>
            {l}
          </button>
        ))}
      </div>

      {/* Contenido del tab */}
      <div className="animate-fade-up" key={tab}>
        {/* RUTINA */}
        {tab === 'rutina' && (
          <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gym-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 className="font-condensed" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.02em' }}>Rutina {tipoLabel}</h2>
                <p style={{ fontSize: '13px', color: 'var(--gym-muted)', marginTop: '2px' }}>
                  {rutina?.dias?.length} dias · Intensidad {ia_decision.intensidad}
                </p>
              </div>
              <div style={{
                padding: '4px 14px',
                background: 'rgba(198,241,53,0.1)',
                border: '1px solid rgba(198,241,53,0.2)',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--gym-lime)',
                fontFamily: 'Barlow Condensed, sans-serif',
                letterSpacing: '0.06em',
              }}>
                {rutina?.generado_por?.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0' }}>
              {/* Lista de dias */}
              <div style={{ width: '220px', borderRight: '1px solid var(--gym-border)', flexShrink: 0 }}>
                {rutina?.dias?.map((dia, i) => (
                  <button
                    key={i}
                    onClick={() => setOpenDia(i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 18px',
                      background: openDia === i ? 'rgba(198,241,53,0.06)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--gym-border)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderLeft: openDia === i ? '3px solid var(--gym-lime)' : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: '30px', height: '30px',
                      background: openDia === i ? 'var(--gym-lime)' : 'var(--gym-border)',
                      borderRadius: '7px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      color: openDia === i ? '#080A0C' : 'var(--gym-muted)',
                      transition: 'all 0.15s',
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: openDia === i ? 'var(--gym-text)' : 'var(--gym-muted2)', lineHeight: 1.2 }}>
                        {dia.nombre?.split('—')[1]?.trim() || dia.nombre}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gym-muted)', marginTop: '2px' }}>
                        {dia.ejercicios?.length} ejercicios
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Ejercicios del dia */}
              <div style={{ flex: 1, padding: '16px 20px' }}>
                {rutina?.dias?.[openDia] && (
                  <>
                    <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--gym-border)' }}>
                      <h3 className="font-condensed" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.02em' }}>
                        {rutina.dias[openDia].nombre}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {rutina.dias[openDia].ejercicios?.map((ex, j) => (
                        <div key={j} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: ex.grupo === 'cardio' ? 'rgba(96,165,250,0.05)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${ex.grupo === 'cardio' ? 'rgba(96,165,250,0.15)' : 'var(--gym-border)'}`,
                          borderRadius: '8px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '28px', height: '28px',
                              background: ex.grupo === 'cardio' ? 'rgba(96,165,250,0.1)' : 'rgba(198,241,53,0.08)',
                              borderRadius: '6px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <span className="material-icons-round" style={{
                                fontSize: '15px',
                                color: ex.grupo === 'cardio' ? '#60A5FA' : 'var(--gym-lime)',
                              }}>
                                {ex.grupo === 'cardio' ? 'directions_run' : 'fitness_center'}
                              </span>
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--gym-text)' }}>{ex.nombre}</div>
                              <div style={{ fontSize: '11px', color: 'var(--gym-muted)', marginTop: '1px', textTransform: 'capitalize' }}>
                                {ex.grupo} · {ex.equipo?.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            {ex.grupo !== 'cardio' ? (
                              <div className="font-condensed" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gym-lime)' }}>
                                {ex.series} × {ex.repeticiones}
                              </div>
                            ) : (
                              <div className="font-condensed" style={{ fontSize: '18px', fontWeight: 700, color: '#60A5FA' }}>
                                {ex.repeticiones}
                              </div>
                            )}
                            {(ex.descanso_seg > 0 || ex.descansoSeg > 0) && (
                              <div style={{ fontSize: '11px', color: 'var(--gym-muted)', marginTop: '2px' }}>
                                {ex.descanso_seg || ex.descansoSeg}s descanso
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NUTRICION */}
        {tab === 'nutricion' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
            <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h2 className="font-condensed" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.02em' }}>Distribucion de Macros</h2>
                <div className="font-display" style={{ fontSize: '36px', color: 'var(--gym-lime)', lineHeight: 1 }}>
                  {nutricion.calorias_objetivo}
                  <span style={{ fontSize: '14px', color: 'var(--gym-muted)', fontFamily: 'Barlow, sans-serif', fontWeight: 400 }}> kcal</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--gym-muted)', marginBottom: '20px' }}>Calorias diarias objetivo segun tu TDEE y objetivo</p>

              <MacroBar label="Proteinas"     valor={prot.v}   kcal={prot.kcal}   pct={prot.pct}   color="#60A5FA"            icon="egg_alt" />
              <MacroBar label="Carbohidratos" valor={carbs.v}  kcal={carbs.kcal}  pct={carbs.pct}  color="#F59E0B"            icon="grain" />
              <MacroBar label="Grasas"        valor={grasas.v} kcal={grasas.kcal} pct={grasas.pct} color="var(--gym-orange)"  icon="opacity" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'BMR',  value: perfil.bmr,  sub: 'Calorias en reposo',        icon: 'bedtime',    color: '#A78BFA' },
                { label: 'TDEE', value: perfil.tdee, sub: 'Calorias con actividad',     icon: 'bolt',       color: '#F59E0B' },
                { label: 'META', value: nutricion.calorias_objetivo, sub: 'Objetivo diario', icon: 'flag', color: 'var(--gym-lime)' },
              ].map(({ label, value, sub, icon, color }) => (
                <div key={label} style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '10px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="material-icons-round" style={{ fontSize: '16px', color }}>{icon}</span>
                    <span className="label-tag">{label}</span>
                  </div>
                  <div className="font-condensed" style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>
                    {value} <span style={{ fontSize: '13px', color: 'var(--gym-muted)', fontFamily: 'Barlow, sans-serif', fontWeight: 400 }}>kcal</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gym-muted)', marginTop: '4px' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROLOG */}
        {tab === 'prolog' && <ExplicacionCard explicaciones={explicaciones} />}

        {/* PROGRESO */}
        {tab === 'progreso' && <ProgressChart data={progreso_simulado} objetivo={ia_decision.objetivo} />}
      </div>
    </div>
  )
}