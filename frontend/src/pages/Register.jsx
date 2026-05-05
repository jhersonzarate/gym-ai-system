// frontend/src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await authAPI.register(form)
      localStorage.setItem('gym_token', data.token)
      localStorage.setItem('gym_nombre', data.nombre)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

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
  const strengthColor = ['', '#EF4444', '#F26522', '#F59E0B', 'var(--gym-lime)'][strength]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gym-black)',
      display: 'flex',
    }}>
      {/* Panel izquierdo - formulario */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        borderRight: '1px solid var(--gym-border)',
      }}>
        <div className="animate-fade-up" style={{ width: '100%', maxWidth: '440px' }}>
          {/* Logo mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'var(--gym-lime)',
              borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-icons-round" style={{ fontSize: '20px', color: '#080A0C' }}>fitness_center</span>
            </div>
            <div className="font-condensed" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.06em' }}>
              GYMEXPERT <span style={{ color: 'var(--gym-lime)' }}>AI</span>
            </div>
          </div>

          <div style={{ marginBottom: '36px' }}>
            <h2 className="font-condensed" style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '0.02em' }}>
              Crear tu cuenta
            </h2>
            <p style={{ color: 'var(--gym-muted)', marginTop: '6px', fontSize: '14px' }}>
              Comienza a entrenar con inteligencia artificial
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Nombre */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--gym-muted2)', marginBottom: '8px' }}>
                Nombre completo
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-icons-round" style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', color: 'var(--gym-muted)',
                }}>person_outline</span>
                <input
                  type="text"
                  className="gym-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="Juan Pérez"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--gym-muted2)', marginBottom: '8px' }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-icons-round" style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', color: 'var(--gym-muted)',
                }}>mail_outline</span>
                <input
                  type="email"
                  className="gym-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--gym-muted2)', marginBottom: '8px' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-icons-round" style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '18px', color: 'var(--gym-muted)',
                }}>lock_outline</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="gym-input"
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gym-muted)',
                    display: 'flex',
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: '18px' }}>
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Indicador de fortaleza */}
              {form.password && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: i <= strength ? strengthColor : 'var(--gym-border2)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--gym-red)' }}>error_outline</span>
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

          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--gym-border)', textAlign: 'center' }}>
            <span style={{ color: 'var(--gym-muted)', fontSize: '14px' }}>
              Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: 'var(--gym-lime)', fontWeight: 600, textDecoration: 'none' }}>
                Iniciar sesión
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Panel derecho - beneficios */}
      <div style={{
        flex: '0 0 48%',
        background: 'var(--gym-card)',
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(198,241,53,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(198,241,53,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: 'var(--gym-orange)',
        }} />

        <div className="label-tag" style={{ color: 'var(--gym-orange)', marginBottom: '20px', position: 'relative' }}>
          Por que usar GymExpert
        </div>
        <h2 className="font-display" style={{ fontSize: '42px', lineHeight: 1.05, marginBottom: '36px', position: 'relative' }}>
          CIENCIA REAL<br/>
          <span style={{ color: 'var(--gym-lime)' }}>RESULTADOS REALES</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
          {[
            {
              icon: 'psychology',
              title: 'Motor Prolog con 25+ reglas',
              desc: 'Inferencia simbólica real: intensidad, frecuencia, tipo de rutina y cardio basados en tu perfil exacto.',
            },
            {
              icon: 'calculate',
              title: 'Calculos BMR y TDEE precisos',
              desc: 'Formula Mifflin-St Jeor con distribución de macros adaptada a tu objetivo corporal.',
            },
            {
              icon: 'trending_up',
              title: 'Simulación de 8 semanas',
              desc: 'Proyección de progreso corporal semana a semana para mantenerte motivado.',
            },
            {
              icon: 'history',
              title: 'Historial completo',
              desc: 'Guarda todos tus planes anteriores para analizar tu evolución en el tiempo.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              display: 'flex',
              gap: '16px',
              padding: '18px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--gym-border)',
              borderRadius: '10px',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: '38px', height: '38px',
                background: 'rgba(198,241,53,0.1)',
                borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span className="material-icons-round" style={{ fontSize: '20px', color: 'var(--gym-lime)' }}>{icon}</span>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gym-text)', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: 'var(--gym-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}