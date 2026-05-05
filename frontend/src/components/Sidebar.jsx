// frontend/src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',           icon: 'space_dashboard', label: 'Dashboard'    },
  { to: '/formulario', icon: 'tune',            label: 'Nuevo Plan'   },
  { to: '/resultados', icon: 'assignment',      label: 'Resultados'   },
  { to: '/historial',  icon: 'history',         label: 'Historial'    },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: '220px',
      background: 'var(--gym-card)',
      borderRight: '1px solid var(--gym-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--gym-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'var(--gym-lime)',
          borderRadius: '9px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span className="material-icons-round" style={{ fontSize: '20px', color: '#080A0C' }}>fitness_center</span>
        </div>
        <div>
          <div className="font-condensed" style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.1 }}>
            GYMEXPERT
          </div>
          <div style={{ fontSize: '10px', color: 'var(--gym-muted)', letterSpacing: '0.1em' }}>AI SYSTEM</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div className="label-tag" style={{ paddingInline: '8px', marginBottom: '10px' }}>Menu</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#080A0C' : 'var(--gym-muted2)',
                background: isActive ? 'var(--gym-lime)' : 'transparent',
                transition: 'all 0.15s',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.style.background.includes('C6F135')) {
                  e.currentTarget.style.background = 'rgba(198,241,53,0.06)'
                  e.currentTarget.style.color = 'var(--gym-text)'
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--gym-muted2)'
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <span className="material-icons-round" style={{ fontSize: '19px', color: isActive ? '#080A0C' : 'inherit' }}>
                    {icon}
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Stack badge */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--gym-border)',
        margin: '0 12px 16px',
        background: 'rgba(198,241,53,0.04)',
        borderRadius: '8px',
        border: '1px solid rgba(198,241,53,0.12)',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--gym-lime)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
          POWERED BY
        </div>
        {[['Prolog', 'Motor IA'], ['Scala', 'Generador'], ['Python', 'API Backend']].map(([lang, role]) => (
          <div key={lang} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, color: 'var(--gym-text)' }}>{lang}</span>
            <span style={{ fontSize: '11px', color: 'var(--gym-muted)' }}>{role}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}