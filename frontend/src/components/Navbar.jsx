// frontend/src/components/Navbar.jsx
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const nombre     = localStorage.getItem('gym_nombre') || 'Atleta'
  const fotoGuarda = localStorage.getItem('gym_foto')   || null
  const initial    = nombre.charAt(0).toUpperCase()

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <header style={{
      height: '60px',
      background: 'var(--gym-card)',
      borderBottom: '1px solid var(--gym-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingInline: '28px',
      flexShrink: 0,
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '6px', height: '6px',
          background: 'var(--gym-lime)',
          borderRadius: '50%',
        }} />
        <span style={{
          fontSize: '13px', color: 'var(--gym-muted)',
          fontFamily: 'Barlow Condensed, sans-serif',
          letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          GymExpert AI
        </span>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

        {/* Toggle modo claro/oscuro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--gym-muted)' }}>
            {theme === 'dark' ? 'dark_mode' : 'light_mode'}
          </span>
          <button
            onClick={toggleTheme}
            className={`theme-toggle${theme === 'light' ? ' active' : ''}`}
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            aria-label="Cambiar tema"
          />
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--gym-border)' }} />

        {/* Avatar + nombre — clic va al perfil */}
        <button
          onClick={() => navigate('/perfil')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            borderRadius: '8px', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,241,53,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
          title="Ver mi perfil"
        >
          {/* Avatar */}
          <div style={{
            width: '34px', height: '34px',
            background: 'rgba(198,241,53,0.12)',
            border: '1.5px solid rgba(198,241,53,0.25)',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {fotoGuarda ? (
              <img
                src={fotoGuarda}
                alt="Foto de perfil"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700, fontSize: '15px',
                color: 'var(--gym-lime)',
              }}>{initial}</span>
            )}
          </div>
          {/* Nombre */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gym-text)', lineHeight: 1.2 }}>{nombre}</div>
            <div style={{ fontSize: '11px', color: 'var(--gym-muted)', letterSpacing: '0.04em' }}>Mi perfil</div>
          </div>
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--gym-border)' }} />

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--gym-muted)',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', transition: 'color 0.2s',
            padding: '6px', borderRadius: '6px',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--gym-muted)'}
        >
          <span className="material-icons-round" style={{ fontSize: '18px' }}>logout</span>
          Salir
        </button>
      </div>
    </header>
  )
}