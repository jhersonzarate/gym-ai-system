// frontend/src/pages/Formulario.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gymAPI } from '../services/api'

const NIVEL_OPTS = [
  { v: 'principiante', l: 'Principiante', sub: '0 - 12 meses', icon: 'energy_savings_leaf' },
  { v: 'intermedio',   l: 'Intermedio',   sub: '1 - 3 años',   icon: 'local_fire_department' },
  { v: 'avanzado',     l: 'Avanzado',     sub: '3+ años',      icon: 'whatshot' },
]

const OBJETIVO_OPTS = [
  { v: 'perder_grasa',  l: 'Perder Grasa',    sub: 'Deficit calorico',    icon: 'trending_down', color: '#F26522' },
  { v: 'ganar_musculo', l: 'Ganar Musculo',   sub: 'Superavit calorico',  icon: 'trending_up',   color: 'var(--gym-lime)' },
  { v: 'mantener',      l: 'Mantener Peso',   sub: 'Balance calorico',    icon: 'balance',       color: '#60A5FA' },
]

const SEXO_OPTS = [
  { v: 'masculino', l: 'Masculino', icon: 'male' },
  { v: 'femenino',  l: 'Femenino',  icon: 'female' },
]

const DIAS_OPTS = [2, 3, 4, 5, 6]

function InputField({ label, icon, children, hint }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--gym-muted2)', marginBottom: '8px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span className="material-icons-round" style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '18px', color: 'var(--gym-muted)',
            pointerEvents: 'none',
          }}>{icon}</span>
        )}
        {children}
      </div>
      {hint && <p style={{ fontSize: '11px', color: 'var(--gym-muted)', marginTop: '5px' }}>{hint}</p>}
    </div>
  )
}

function NumericInput({ value, onChange, placeholder, icon, min, max, step = '0.1', unit }) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <span className="material-icons-round" style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '18px', color: 'var(--gym-muted)', pointerEvents: 'none',
        }}>{icon}</span>
      )}
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        className="gym-input"
        style={{ paddingLeft: icon ? '44px' : '16px', paddingRight: unit ? '48px' : '16px' }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      {unit && (
        <span style={{
          position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '13px', color: 'var(--gym-muted)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600,
        }}>{unit}</span>
      )}
    </div>
  )
}

function SelectButton({ opts, value, onChange, accentField }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {opts.map(opt => {
        const active = value === opt.v
        const accent = accentField && opt.color ? opt.color : 'var(--gym-lime)'
        return (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange(opt.v)}
            style={{
              flex: 1,
              padding: '14px 12px',
              borderRadius: '10px',
              border: active ? `1.5px solid ${accent}` : '1px solid var(--gym-border2)',
              background: active ? `${accent}12` : 'var(--gym-dark)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'center',
            }}
          >
            <span className="material-icons-round" style={{ fontSize: '22px', color: active ? accent : 'var(--gym-muted)', display: 'block', marginBottom: '6px' }}>
              {opt.icon}
            </span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: active ? 'var(--gym-text)' : 'var(--gym-muted2)', marginBottom: '2px' }}>
              {opt.l}
            </div>
            {opt.sub && (
              <div style={{ fontSize: '11px', color: active ? accent : 'var(--gym-muted)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em' }}>
                {opt.sub}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

const IMC_INFO = (imc) => {
  if (!imc) return null
  if (imc < 18.5) return { label: 'Bajo peso',   color: '#60A5FA' }
  if (imc < 25)   return { label: 'Normal',       color: 'var(--gym-lime)' }
  if (imc < 30)   return { label: 'Sobrepeso',    color: '#F59E0B' }
  return              { label: 'Obesidad',        color: '#EF4444' }
}

export default function Formulario() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    edad: '',
    peso: '',
    altura: '',
    sexo: 'masculino',
    nivel: 'principiante',
    objetivo: 'ganar_musculo',
    dias_disponibles: 4,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Convertir altura a centímetros: si es < 3, asumimos que son metros; si es >= 3, ya están en cm
  const normalizeHeight = (h) => {
    const num = parseFloat(h)
    if (!num) return null
    return num < 3 ? num * 100 : num // Si es menor a 3, multiplicar por 100 (metros a cm)
  }

  const heightInCm = normalizeHeight(form.altura)
  const imc = form.peso && heightInCm
    ? (parseFloat(form.peso) / Math.pow(heightInCm / 100, 2)).toFixed(1)
    : null

  const imcInfo = IMC_INFO(parseFloat(imc))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        edad:             parseInt(form.edad),
        peso:             parseFloat(form.peso),
        altura:           normalizeHeight(form.altura), // Usar altura normalizada en cm
        sexo:             form.sexo,
        nivel:            form.nivel,
        objetivo:         form.objetivo,
        dias_disponibles: form.dias_disponibles,
      }
      const { data } = await gymAPI.generateRoutine(payload)
      sessionStorage.setItem('gym_resultado', JSON.stringify(data))
      sessionStorage.setItem('gym_perfil_form', JSON.stringify(payload))
      navigate('/resultados')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al generar el plan. Verifica los datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div className="label-tag" style={{ marginBottom: '8px' }}>Analisis de perfil</div>
        <h1 className="font-condensed" style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '0.02em' }}>
          Configura tu plan personalizado
        </h1>
        <p style={{ color: 'var(--gym-muted)', marginTop: '6px', fontSize: '14px' }}>
          El motor de Prolog analizara estos datos para determinar tu rutina optima
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          {/* Formulario principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Datos fisicos */}
            <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(198,241,53,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons-round" style={{ fontSize: '17px', color: 'var(--gym-lime)' }}>person</span>
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Datos personales y fisicos</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Edad */}
                <InputField label="Edad" hint="Entre 15 y 80 años">
                  <NumericInput
                    value={form.edad}
                    onChange={e => set('edad', e.target.value)}
                    placeholder="25"
                    icon="cake"
                    min="15" max="80" step="1"
                    unit="años"
                  />
                </InputField>

                {/* Sexo */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--gym-muted2)', marginBottom: '8px' }}>
                    Sexo biologico
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {SEXO_OPTS.map(opt => {
                      const active = form.sexo === opt.v
                      return (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => set('sexo', opt.v)}
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: active ? '1.5px solid var(--gym-lime)' : '1px solid var(--gym-border2)',
                            background: active ? 'rgba(198,241,53,0.1)' : 'var(--gym-dark)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.15s',
                          }}
                        >
                          <span className="material-icons-round" style={{ fontSize: '16px', color: active ? 'var(--gym-lime)' : 'var(--gym-muted)' }}>{opt.icon}</span>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: active ? 'var(--gym-text)' : 'var(--gym-muted2)' }}>{opt.l}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Peso */}
                <InputField label="Peso corporal" hint="Usa decimales si es necesario: ej. 72.5">
                  <NumericInput
                    value={form.peso}
                    onChange={e => set('peso', e.target.value)}
                    placeholder="72.5"
                    icon="monitor_weight"
                    min="30" max="250" step="0.1"
                    unit="kg"
                  />
                </InputField>

                {/* Altura */}
                <InputField label="Altura" hint="Centímetros: 175 o Metros: 1.75 (el sistema detecta automáticamente)">
                  <NumericInput
                    value={form.altura}
                    onChange={e => set('altura', e.target.value)}
                    placeholder="175 o 1.75"
                    icon="height"
                    min="1.2" max="2.3" step="0.1"
                    unit="cm/m"
                  />
                </InputField>
              </div>
            </div>

            {/* Nivel */}
            <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(96,165,250,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons-round" style={{ fontSize: '17px', color: '#60A5FA' }}>military_tech</span>
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Nivel de entrenamiento</h2>
              </div>
              <SelectButton opts={NIVEL_OPTS} value={form.nivel} onChange={v => set('nivel', v)} />
            </div>

            {/* Objetivo */}
            <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(242,101,34,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons-round" style={{ fontSize: '17px', color: 'var(--gym-orange)' }}>flag</span>
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Objetivo principal</h2>
              </div>
              <SelectButton opts={OBJETIVO_OPTS} value={form.objetivo} onChange={v => set('objetivo', v)} accentField />
            </div>

            {/* Dias disponibles */}
            <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(167,139,250,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons-round" style={{ fontSize: '17px', color: '#A78BFA' }}>calendar_today</span>
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Dias disponibles por semana</h2>
                  <p style={{ fontSize: '12px', color: 'var(--gym-muted)', marginTop: '2px' }}>Prolog ajustara la frecuencia segun tu nivel</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {DIAS_OPTS.map(d => {
                  const active = form.dias_disponibles === d
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => set('dias_disponibles', d)}
                      style={{
                        flex: 1,
                        padding: '14px 8px',
                        borderRadius: '8px',
                        border: active ? '1.5px solid #A78BFA' : '1px solid var(--gym-border2)',
                        background: active ? 'rgba(167,139,250,0.1)' : 'var(--gym-dark)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'center',
                      }}
                    >
                      <div className="font-condensed" style={{ fontSize: '26px', fontWeight: 700, color: active ? '#A78BFA' : 'var(--gym-muted)', lineHeight: 1 }}>{d}</div>
                      <div style={{ fontSize: '10px', color: active ? 'var(--gym-text)' : 'var(--gym-muted)', marginTop: '4px', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600 }}>
                        {d === 1 ? 'dia' : 'dias'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Panel lateral - resumen + submit */}
          <div style={{ position: 'sticky', top: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* IMC en tiempo real */}
            {imc && imcInfo && (
              <div style={{
                background: 'var(--gym-card)',
                border: `1px solid ${imcInfo.color}30`,
                borderRadius: '12px',
                padding: '20px',
                animation: 'fadeUp 0.3s ease forwards',
              }}>
                <div className="label-tag" style={{ marginBottom: '10px' }}>IMC calculado</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '10px' }}>
                  <span className="font-display" style={{ fontSize: '52px', color: imcInfo.color, lineHeight: 1 }}>
                    {imc}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--gym-muted)', marginBottom: '8px' }}>kg/m²</span>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  background: `${imcInfo.color}15`,
                  border: `1px solid ${imcInfo.color}30`,
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: imcInfo.color }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: imcInfo.color, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em' }}>
                    {imcInfo.label}
                  </span>
                </div>
              </div>
            )}

            {/* Resumen del perfil */}
            <div style={{ background: 'var(--gym-card)', border: '1px solid var(--gym-border)', borderRadius: '12px', padding: '20px' }}>
              <div className="label-tag" style={{ marginBottom: '14px' }}>Resumen del perfil</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { l: 'Nivel', v: form.nivel, icon: 'military_tech' },
                  { l: 'Objetivo', v: form.objetivo?.replace('_', ' '), icon: 'flag' },
                  { l: 'Dias/semana', v: `${form.dias_disponibles} dias`, icon: 'calendar_today' },
                  { l: 'Sexo', v: form.sexo, icon: 'person' },
                ].map(({ l, v, icon }) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gym-muted)', fontSize: '13px' }}>
                      <span className="material-icons-round" style={{ fontSize: '15px' }}>{icon}</span>
                      {l}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gym-text)', textTransform: 'capitalize' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--gym-red)', flexShrink: 0 }}>error_outline</span>
                <span style={{ fontSize: '13px', color: '#FCA5A5', lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
            >
              {loading ? (
                <>
                  <span className="material-icons-round animate-spin" style={{ fontSize: '20px' }}>refresh</span>
                  Analizando con IA...
                </>
              ) : (
                <>
                  <span className="material-icons-round" style={{ fontSize: '20px' }}>auto_awesome</span>
                  Generar Plan con IA
                </>
              )}
            </button>

            {!loading && (
              <p style={{ fontSize: '11px', color: 'var(--gym-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                Motor Prolog con 25+ reglas expertas procesara tu perfil y generara una rutina dinamica con Scala
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}