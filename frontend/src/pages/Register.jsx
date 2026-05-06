// frontend/src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useValidation, rules } from '../hooks/useValidation'

const validationRules = {
  nombre:   [rules.required('El nombre es obligatorio'), rules.minLen(2, 'Mínimo 2 caracteres')],
  email:    [rules.required('El correo es obligatorio'), rules.email()],
  password: [rules.required('La contraseña es obligatoria'), rules.minLen(6, 'Mínimo 6 caracteres')],
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <div className="field-error">
      <span className="material-icons-round" style={{ fontSize: 13 }}>error_outline</span>
      {msg}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ nombre: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { validate, touch, touchAll, getFieldError } = useValidation(validationRules)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Indicador de fortaleza de contraseña
  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][strength]
  const strengthColor = ['', '#EF4444', '#F26522', '#F59E0B', 'var(--lime)'][strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    touchAll(form)
    if (!validate(form)) return

    setLoading(true)
    setError('')
    try {
      const { data } = await authAPI.register(form)
      localStorage.setItem('gym_token', data.token)
      localStorage.setItem('gym_nombre', data.nombre)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la cuenta. Intenta con otro correo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex' }}>

      {/* ── Panel izquierdo formulario ── */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
        borderRight: '1px solid var(--border)',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{
              width: '36px', height: '36px', background: 'var(--lime)',
              borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-icons-round" style={{ fontSize: '20px', color: '#080A0C' }}>fitness_center</span>
            </div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '18px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text)' }}>
              GYMEXPERT <span style={{ color: 'var(--lime)' }}>AI</span>
            </div>
          </div>

          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '30px', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text)' }}>
              Crear tu cuenta
            </h2>
            <p style={{ color: 'var(--muted)', marginTop: '6px', fontSize: '14px' }}>
              Comienza a entrenar con un plan adaptado a ti
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Nombre */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted2)', marginBottom: '8px' }}>
                Nombre completo
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-icons-round" style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', color: 'var(--muted)',
                }}>person_outline</span>
                <input
                  type="text"
                  className={`gym-input${getFieldError('nombre') ? ' error' : ''}`}
                  style={{ paddingLeft: '44px' }}
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={e => set('nombre', e.target.value)}
                  onBlur={() => touch('nombre')}
                />
              </div>
              <FieldError msg={getFieldError('nombre')} />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted2)', marginBottom: '8px' }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-icons-round" style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', color: 'var(--muted)',
                }}>mail_outline</span>
                <input
                  type="email"
                  className={`gym-input${getFieldError('email') ? ' error' : ''}`}
                  style={{ paddingLeft: '44px' }}
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  onBlur={() => touch('email')}
                />
              </div>
              <FieldError msg={getFieldError('email')} />
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted2)', marginBottom: '8px' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-icons-round" style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', color: 'var(--muted)',
                }}>lock_outline</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`gym-input${getFieldError('password') ? ' error' : ''}`}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onBlur={() => touch('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
                    display: 'flex',
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: '18px' }}>
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <FieldError msg={getFieldError('password')} />

              {/* Indicador de fortaleza */}
              {form.password && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: i <= strength ? strengthColor : 'var(--border2)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Error del servidor */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--red)' }}>error_outline</span>
                <span style={{ fontSize: '14px', color: '#FCA5A5' }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '15px', marginTop: '4px' }}>
              {loading ? (
                <>
                  <span className="material-icons-round animate-spin" style={{ fontSize: '18px' }}>refresh</span>
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta gratis
                  <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: '14px' }}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: 'var(--lime)', fontWeight: 600, textDecoration: 'none' }}>
                Iniciar sesión
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* ── Panel derecho beneficios ── */}
      <div style={{
        flex: '0 0 48%',
        background: 'var(--card)',
        padding: '48px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(198,241,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(198,241,53,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px', pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--orange)' }} />

        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--orange)', marginBottom: '20px', position: 'relative',
        }}>
          Por qué usar GymExpert
        </div>
        <h2 style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '42px', lineHeight: 1.05, marginBottom: '36px', position: 'relative',
          color: 'var(--text)',
        }}>
          CIENCIA REAL<br/>
          <span style={{ color: 'var(--lime)' }}>RESULTADOS REALES</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
          {[
            {
              icon: 'psychology',
              title: 'Más de 25 variables analizadas',
              desc: 'El sistema evalúa tu perfil físico completo para determinar exactamente qué rutina necesitas.',
            },
            {
              icon: 'calculate',
              title: 'Cálculos metabólicos precisos',
              desc: 'BMR y TDEE calculados con fórmulas científicas para que consumas exactamente lo que tu cuerpo necesita.',
            },
            {
              icon: 'trending_up',
              title: 'Simulación de 8 semanas',
              desc: 'Proyección de progreso corporal semana a semana para que veas el camino antes de empezar.',
            },
            {
              icon: 'history',
              title: 'Historial completo de planes',
              desc: 'Guarda todos tus planes anteriores y accede a ellos en cualquier momento para comparar tu evolución.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              display: 'flex', gap: '16px', padding: '18px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '10px', alignItems: 'flex-start',
            }}>
              <div style={{
                width: '38px', height: '38px', background: 'rgba(198,241,53,0.1)',
                borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span className="material-icons-round" style={{ fontSize: '20px', color: 'var(--lime)' }}>{icon}</span>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}