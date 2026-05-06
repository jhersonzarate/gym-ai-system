// frontend/src/pages/Formulario.jsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { gymAPI } from '../services/api'

/* ─── Opciones ─── */
const NIVEL_OPTS = [
  { v: 'principiante', l: 'Principiante', sub: '0 – 12 meses',  icon: 'energy_savings_leaf' },
  { v: 'intermedio',   l: 'Intermedio',   sub: '1 – 3 años',    icon: 'local_fire_department' },
  { v: 'avanzado',     l: 'Avanzado',     sub: '3+ años',       icon: 'whatshot' },
]

const OBJETIVO_OPTS = [
  { v: 'perder_grasa',  l: 'Perder Grasa',   sub: 'Déficit calórico',   icon: 'trending_down', color: '#F26522' },
  { v: 'ganar_musculo', l: 'Ganar Músculo',  sub: 'Superávit calórico', icon: 'trending_up',   color: '#C6F135' },
  { v: 'mantener',      l: 'Mantener Peso',  sub: 'Balance calórico',   icon: 'balance',       color: '#60A5FA' },
]

const SEXO_OPTS = [
  { v: 'masculino', l: 'Masculino', icon: 'male'   },
  { v: 'femenino',  l: 'Femenino',  icon: 'female' },
]

const DIAS_OPTS = [2, 3, 4, 5, 6]

/* ─── IMC helper ─── */
function getImcInfo(imc) {
  const v = parseFloat(imc)
  if (!v || isNaN(v)) return null
  if (v < 18.5) return { label: 'Bajo peso',  color: '#60A5FA' }
  if (v < 25)   return { label: 'Normal',      color: '#C6F135' }
  if (v < 30)   return { label: 'Sobrepeso',   color: '#F59E0B' }
  return              { label: 'Obesidad',     color: '#EF4444' }
}

/* ─── Componente botón de selección ─── */
function ChoiceButton({ active, onClick, icon, label, sub, accent = 'var(--gym-lime)' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: '13px 10px',
        borderRadius: 10,
        border: active ? `1.5px solid ${accent}` : '1px solid var(--gym-border2)',
        background: active ? `${accent}12` : 'var(--gym-dark)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'center',
      }}
    >
      <span className="material-icons-round" style={{ fontSize: 21, color: active ? accent : 'var(--gym-muted)', display: 'block', marginBottom: 5 }}>
        {icon}
      </span>
      <div style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--gym-text)' : 'var(--gym-muted2)', marginBottom: 2 }}>{label}</div>
      {sub && (
        <div style={{ fontSize: 11, color: active ? accent : 'var(--gym-muted)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.03em' }}>
          {sub}
        </div>
      )}
    </button>
  )
}

/* ─── Campo de formulario ─── */
function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gym-muted2)', marginBottom: 7 }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--gym-muted)', marginTop: 5 }}>{hint}</p>}
    </div>
  )
}

/* ─── Input numérico ─── */
function NumInput({ value, onChange, placeholder, icon, min, max, step = '0.1', unit, required = true }) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <span className="material-icons-round" style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 17, color: 'var(--gym-muted)', pointerEvents: 'none',
        }}>{icon}</span>
      )}
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        className="gym-input"
        style={{ paddingLeft: icon ? 42 : 16, paddingRight: unit ? 46 : 16 }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {unit && (
        <span style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 12, color: 'var(--gym-muted)',
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600,
        }}>{unit}</span>
      )}
    </div>
  )
}

/* ─── Sección con header ─── */
function Section({ icon, iconColor = 'var(--gym-lime)', iconBg = 'rgba(198,241,53,0.1)', title, children }) {
  return (
    <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: 12, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 30, height: 30, background: iconBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-icons-round" style={{ fontSize: 16, color: iconColor }}>{icon}</span>
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gym-text)' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

/* ─── Página principal ─── */
export default function Formulario() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    edad:             '',
    peso:             '',
    altura:           '',    // en metros (ej. 1.75)
    sexo:             'masculino',
    nivel:            'principiante',
    objetivo:         'ganar_musculo',
    dias_disponibles: 4,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Altura en metros -> cm (validación estricta)
  const alturaM  = parseFloat(form.altura)
  const alturaCm = !isNaN(alturaM) && alturaM >= 1.0 && alturaM <= 2.5 ? Math.round(alturaM * 100 * 10) / 10 : null

  // IMC en tiempo real
  const imcVal = useMemo(() => {
    if (!form.peso || !alturaCm) return null
    const m = alturaCm / 100
    return (parseFloat(form.peso) / (m * m)).toFixed(1)
  }, [form.peso, alturaCm])

  const imcInfo = getImcInfo(imcVal)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!alturaCm) {
      setError('Ingresa la altura en metros con punto decimal. Ejemplo: 1.75')
      return
    }
    if (parseInt(form.edad) < 15 || parseInt(form.edad) > 80) {
      setError('La edad debe estar entre 15 y 80 años.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        edad:             parseInt(form.edad),
        peso:             parseFloat(form.peso),
        altura:           alturaCm,
        sexo:             form.sexo,
        nivel:            form.nivel,
        objetivo:         form.objetivo,
        dias_disponibles: form.dias_disponibles,
      }

      const { data } = await gymAPI.generateRoutine(payload)
      localStorage.setItem('gym_resultado', JSON.stringify(data))

      // Guardar en historial local
      const saved = (() => {
        try { return JSON.parse(localStorage.getItem('gym_saved_results') || '[]') } catch { return [] }
      })()
      const next = [
        { id: Date.now(), fecha: new Date().toISOString(), perfil: payload, resultado: data },
        ...saved,
      ].slice(0, 15)
      localStorage.setItem('gym_saved_results', JSON.stringify(next))

      navigate('/resultados')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al generar el plan. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: 920, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <div className="label-tag" style={{ marginBottom: 7 }}>Análisis de perfil</div>
        <h1 className="font-condensed" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '0.02em' }}>
          Configura tu plan personalizado
        </h1>
        <p style={{ color: 'var(--gym-muted)', marginTop: 5, fontSize: 14 }}>
          El motor Prolog analizará estos datos para determinar tu rutina óptima
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>

          {/* ── Columna principal ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Datos físicos */}
            <Section icon="person" title="Datos personales y físicos">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Edad" hint="Entre 15 y 80 años">
                  <NumInput
                    value={form.edad}
                    onChange={e => set('edad', e.target.value)}
                    placeholder="25"
                    icon="cake"
                    min="15" max="80" step="1"
                    unit="años"
                  />
                </Field>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gym-muted2)', marginBottom: 7 }}>
                    Sexo biológico
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {SEXO_OPTS.map(opt => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => set('sexo', opt.v)}
                        style={{
                          flex: 1, padding: '10px 10px', borderRadius: 8,
                          border: form.sexo === opt.v ? '1.5px solid var(--gym-lime)' : '1px solid var(--gym-border2)',
                          background: form.sexo === opt.v ? 'rgba(198,241,53,0.09)' : 'var(--gym-dark)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'all 0.13s',
                        }}
                      >
                        <span className="material-icons-round" style={{ fontSize: 16, color: form.sexo === opt.v ? 'var(--gym-lime)' : 'var(--gym-muted)' }}>{opt.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: form.sexo === opt.v ? 'var(--gym-text)' : 'var(--gym-muted2)' }}>{opt.l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Peso corporal" hint="Usa decimales si es necesario: ej. 72.5">
                  <NumInput
                    value={form.peso}
                    onChange={e => set('peso', e.target.value)}
                    placeholder="72.5"
                    icon="monitor_weight"
                    min="30" max="250" step="0.1"
                    unit="kg"
                  />
                </Field>

                <Field label="Altura" hint="En metros con punto: 1.75 — no ingresar cm directamente">
                  <NumInput
                    value={form.altura}
                    onChange={e => set('altura', e.target.value)}
                    placeholder="1.75"
                    icon="height"
                    min="1.0" max="2.5" step="0.01"
                    unit="m"
                  />
                </Field>
              </div>
            </Section>

            {/* Nivel */}
            <Section icon="military_tech" iconColor="#60A5FA" iconBg="rgba(96,165,250,0.1)" title="Nivel de entrenamiento">
              <div style={{ display: 'flex', gap: 8 }}>
                {NIVEL_OPTS.map(opt => (
                  <ChoiceButton
                    key={opt.v}
                    active={form.nivel === opt.v}
                    onClick={() => set('nivel', opt.v)}
                    icon={opt.icon}
                    label={opt.l}
                    sub={opt.sub}
                  />
                ))}
              </div>
            </Section>

            {/* Objetivo */}
            <Section icon="flag" iconColor="var(--gym-orange)" iconBg="rgba(242,101,34,0.1)" title="Objetivo principal">
              <div style={{ display: 'flex', gap: 8 }}>
                {OBJETIVO_OPTS.map(opt => (
                  <ChoiceButton
                    key={opt.v}
                    active={form.objetivo === opt.v}
                    onClick={() => set('objetivo', opt.v)}
                    icon={opt.icon}
                    label={opt.l}
                    sub={opt.sub}
                    accent={opt.color}
                  />
                ))}
              </div>
            </Section>

            {/* Días disponibles */}
            <Section icon="calendar_today" iconColor="#A78BFA" iconBg="rgba(167,139,250,0.1)" title="Días disponibles por semana">
              <p style={{ fontSize: 12, color: 'var(--gym-muted)', marginBottom: 14 }}>
                Prolog ajustará la frecuencia y tipo de rutina según tu nivel y días disponibles.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {DIAS_OPTS.map(d => {
                  const active = form.dias_disponibles === d
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => set('dias_disponibles', d)}
                      style={{
                        flex: 1, padding: '13px 8px', borderRadius: 8, textAlign: 'center',
                        border: active ? '1.5px solid #A78BFA' : '1px solid var(--gym-border2)',
                        background: active ? 'rgba(167,139,250,0.1)' : 'var(--gym-dark)',
                        cursor: 'pointer', transition: 'all 0.13s',
                      }}
                    >
                      <div className="font-condensed" style={{ fontSize: 24, fontWeight: 700, color: active ? '#A78BFA' : 'var(--gym-muted)', lineHeight: 1 }}>{d}</div>
                      <div style={{ fontSize: 10, color: active ? 'var(--gym-text)' : 'var(--gym-muted)', marginTop: 4, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {d === 1 ? 'día' : 'días'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Section>
          </div>

          {/* ── Panel lateral ── */}
          <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* IMC en tiempo real */}
            {imcVal && imcInfo && (
              <div style={{
                background: 'var(--gym-card)',
                border: `1px solid ${imcInfo.color}30`,
                borderRadius: 12, padding: 18,
                animation: 'fadeUp 0.25s ease forwards',
              }}>
                <div className="label-tag" style={{ marginBottom: 10 }}>IMC calculado</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
                  <span className="font-display" style={{ fontSize: 50, color: imcInfo.color, lineHeight: 1 }}>{imcVal}</span>
                  <span style={{ fontSize: 13, color: 'var(--gym-muted)', marginBottom: 7 }}>kg/m²</span>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 100,
                  background: `${imcInfo.color}14`,
                  border: `1px solid ${imcInfo.color}28`,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: imcInfo.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: imcInfo.color, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em' }}>
                    {imcInfo.label}
                  </span>
                </div>
              </div>
            )}

            {/* Resumen del perfil */}
            <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: 12, padding: 18 }}>
              <div className="label-tag" style={{ marginBottom: 14 }}>Resumen del perfil</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { l: 'Nivel',      v: form.nivel,                       icon: 'military_tech'  },
                  { l: 'Objetivo',   v: form.objetivo?.replace(/_/g,' '), icon: 'flag'           },
                  { l: 'Días/sem',   v: `${form.dias_disponibles} días`,  icon: 'calendar_today' },
                  { l: 'Sexo',       v: form.sexo,                        icon: 'person'         },
                  { l: 'Altura',     v: alturaCm ? `${alturaCm} cm` : '—', icon: 'height'        },
                ].map(({ l, v, icon }) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--gym-muted)', fontSize: 13 }}>
                      <span className="material-icons-round" style={{ fontSize: 14 }}>{icon}</span>
                      {l}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gym-text)', textTransform: 'capitalize' }}>{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.22)',
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', gap: 9, alignItems: 'flex-start',
              }}>
                <span className="material-icons-round" style={{ fontSize: 17, color: 'var(--gym-red)', flexShrink: 0, marginTop: 1 }}>error_outline</span>
                <span style={{ fontSize: 13, color: '#FCA5A5', lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: 15, fontSize: 15 }}
            >
              {loading ? (
                <>
                  <span className="material-icons-round animate-spin" style={{ fontSize: 19 }}>refresh</span>
                  Analizando con IA...
                </>
              ) : (
                <>
                  <span className="material-icons-round" style={{ fontSize: 19 }}>auto_awesome</span>
                  Generar Plan con IA
                </>
              )}
            </button>

            {!loading && (
              <p style={{ fontSize: 11, color: 'var(--gym-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                Motor Prolog con 25+ reglas procesará tu perfil y Scala construirá tu rutina completa.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}