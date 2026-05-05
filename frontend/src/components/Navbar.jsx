// frontend/src/components/Navbar.jsx
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('gym_nombre') || 'Atleta'
  const initial = nombre.charAt(0).toUpperCase()

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
    }}>
      {/* Breadcrumb / titulo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '6px', height: '6px',
          background: 'var(--gym-lime)',
          borderRadius: '50%',
        }} />
        <span style={{ fontSize: '13px', color: 'var(--gym-muted)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
          GymExpert AI
        </span>
      </div>

      {/* Usuario */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'rgba(198,241,53,0.12)',
            border: '1px solid rgba(198,241,53,0.25)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700,
            fontSize: '15px',
            color: 'var(--gym-lime)',
          }}>
            {initial}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gym-text)', lineHeight: 1.2 }}>{nombre}</div>
            <div style={{ fontSize: '11px', color: 'var(--gym-muted)', letterSpacing: '0.04em' }}>Atleta</div>
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--gym-border)' }} />

        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--gym-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            transition: 'color 0.2s',
            padding: '6px',
            borderRadius: '6px',
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