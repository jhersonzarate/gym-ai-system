// frontend/src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useValidation, rules } from '../hooks/useValidation'

const validationRules = {
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

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { validate, touch, touchAll, getFieldError } = useValidation(validationRules)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    touchAll(form)
    if (!validate(form)) return

    setLoading(true)
    setError('')
    try {
      const { data } = await authAPI.login(form)
      localStorage.setItem('gym_token', data.token)
      localStorage.setItem('gym_nombre', data.nombre)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex' }}>

      {/* ── Panel izquierdo visual ── */}
      <div style={{
        flex: '0 0 52%',
        background: 'linear-gradient(145deg, #0F1114 0%, #13161A 100%)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Línea accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--lime)' }} />
        {/* Grid decorativo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(198,241,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(198,241,53,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{
            width: '40px', height: '40px', background: 'var(--lime)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-icons-round" style={{ fontSize: '22px', color: '#080A0C' }}>fitness_center</span>
          </div>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '20px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text)' }}>
              GYMEXPERT
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em' }}>AI SYSTEM</div>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative' }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontSize: '11px', fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '20px',
          }}>
            Sistema Inteligente de Entrenamiento
          </div>
          <h1 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(52px, 6vw, 80px)',
            lineHeight: 1, color: 'var(--text)', marginBottom: '24px',
          }}>
            ENTRENA<br/>
            <span style={{ color: 'var(--lime)' }}>INTELIGENTE</span>
          </h1>
          <p style={{ color: 'var(--muted2)', fontSize: '16px', lineHeight: 1.7, maxWidth: '400px' }}>
            Rutinas y planes nutricionales totalmente personalizados con inteligencia artificial y análisis de perfil físico real.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '32px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
            {[
              { num: '25+', label: 'Variables analizadas' },
              { num: '5',   label: 'Tipos de rutina'      },
              { num: '8',   label: 'Semanas simuladas'    },
            ].map(({ num, label }) => (
              <div key={label}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--lime)' }}>{num}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.04em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges de características */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative' }}>
          {['Análisis inteligente', 'Rutinas dinámicas', 'Plan nutricional', '100% personalizado'].map((t) => (
            <span key={t} style={{
              padding: '6px 14px',
              border: '1px solid var(--border2)',
              borderRadius: '100px',
              fontSize: '12px',
              color: 'var(--muted2)',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600, letterSpacing: '0.04em',
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Panel derecho formulario ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '32px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.02em' }}>
              Iniciar sesión
            </h2>
            <p style={{ color: 'var(--muted)', marginTop: '6px', fontSize: '14px' }}>
              Accede a tu plan personalizado
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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

            {/* Password */}
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
                  placeholder="Tu contraseña"
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
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: '18px' }}>
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <FieldError msg={getFieldError('password')} />
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

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '4px', padding: '15px' }}>
              {loading ? (
                <>
                  <span className="material-icons-round animate-spin" style={{ fontSize: '18px' }}>refresh</span>
                  Verificando...
                </>
              ) : (
                <>
                  Ingresar
                  <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '28px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ color: 'var(--muted)', fontSize: '14px' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" style={{ color: 'var(--lime)', fontWeight: 600, textDecoration: 'none' }}>
                Regístrate gratis
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}