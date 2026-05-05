// frontend/src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, History, Dumbbell } from 'lucide-react'

const links = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/formulario', icon: ClipboardList,   label: 'Nuevo Plan' },
  { to: '/historial',  icon: History,         label: 'Historial'  },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-[#111] border-r border-[#1f1f1f] flex flex-col py-6 px-3">
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <Dumbbell size={16} className="text-black" />
        </div>
        <span className="font-bold text-white text-sm">GymExpert</span>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
               ${isActive
                 ? 'bg-green-500/10 text-green-400 font-medium'
                 : 'text-gray-400 hover:text-white hover:bg-white/5'
               }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}