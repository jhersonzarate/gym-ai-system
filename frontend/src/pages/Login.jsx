// frontend/src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await authAPI.login(form)
      localStorage.setItem('gym_token', data.token)
      localStorage.setItem('gym_nombre', data.nombre)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gym-black)',
      display: 'flex',
    }}>
      {/* Panel izquierdo - visual */}
      <div style={{
        flex: '0 0 52%',
        background: 'linear-gradient(145deg, #0F1114 0%, #13161A 100%)',
        borderRight: '1px solid var(--gym-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Accent line top */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: 'var(--gym-lime)',
        }} />

        {/* Grid decorativo */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(198,241,53,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(198,241,53,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--gym-lime)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-icons-round" style={{ fontSize: '22px', color: '#080A0C' }}>fitness_center</span>
          </div>
          <div>
            <div className="font-condensed" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--gym-text)' }}>
              GYMEXPERT
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gym-muted)', letterSpacing: '0.08em' }}>AI SYSTEM</div>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative' }}>
          <div className="label-tag" style={{ color: 'var(--gym-lime)', marginBottom: '20px' }}>
            Sistema Experto Multilenguaje
          </div>
          <h1 className="font-display" style={{
            fontSize: 'clamp(52px, 6vw, 80px)',
            lineHeight: 1,
            color: 'var(--gym-text)',
            marginBottom: '24px',
          }}>
            ENTRENA<br/>
            <span style={{ color: 'var(--gym-lime)' }}>INTELIGENTE</span>
          </h1>
          <p style={{ color: 'var(--gym-muted2)', fontSize: '16px', lineHeight: 1.7, maxWidth: '400px' }}>
            Rutinas y planes nutricionales generados por inteligencia artificial usando Prolog, Scala y Python.
          </p>

          {/* Stats bar */}
          <div style={{
            display: 'flex',
            gap: '32px',
            marginTop: '40px',
            paddingTop: '32px',
            borderTop: '1px solid var(--gym-border)',
          }}>
            {[
              { num: '25+', label: 'Reglas expertas' },
              { num: '5',   label: 'Tipos de rutina' },
              { num: '8',   label: 'Semanas simuladas' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="font-condensed" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gym-lime)' }}>{num}</div>
                <div style={{ fontSize: '12px', color: 'var(--gym-muted)', letterSpacing: '0.04em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stack tecnológico */}
        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
          {['Prolog', 'Scala', 'Python', 'React'].map((t) => (
            <span key={t} style={{
              padding: '6px 14px',
              border: '1px solid var(--gym-border2)',
              borderRadius: '100px',
              fontSize: '12px',
              color: 'var(--gym-muted2)',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
      }}>
        <div className="animate-fade-up" style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 className="font-condensed" style={{ fontSize: '32px', fontWeight: 700, color: 'var(--gym-text)', letterSpacing: '0.02em' }}>
              Iniciar sesión
            </h2>
            <p style={{ color: 'var(--gym-muted)', marginTop: '6px', fontSize: '14px' }}>
              Accede a tu plan personalizado
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--gym-muted2)', marginBottom: '8px', letterSpacing: '0.02em' }}>
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

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--gym-muted2)', marginBottom: '8px', letterSpacing: '0.02em' }}>
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gym-muted)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: '18px' }}>
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
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

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '4px', padding: '15px' }}>
              {loading ? (
                <>
                  <span className="material-icons-round animate-spin" style={{ fontSize: '18px' }}>refresh</span>
                  Verificando...
                </>
              ) : (
                <>
                  Ingresar al sistema
                  <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '28px', borderTop: '1px solid var(--gym-border)', textAlign: 'center' }}>
            <span style={{ color: 'var(--gym-muted)', fontSize: '14px' }}>
              No tienes cuenta?{' '}
              <Link to="/register" style={{ color: 'var(--gym-lime)', fontWeight: 600, textDecoration: 'none' }}>
                Regístrate gratis
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}