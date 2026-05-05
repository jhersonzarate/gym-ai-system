// frontend/src/components/Navbar.jsx
import { useNavigate } from 'react-router-dom'
import { LogOut, Dumbbell } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('gym_nombre') || 'Usuario'

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <header className="h-14 bg-[#111] border-b border-[#1f1f1f] flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Dumbbell className="text-green-500" size={20} />
        <span className="font-semibold text-white tracking-wide">GymExpert AI</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Hola, <span className="text-green-400">{nombre}</span></span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} /> Salir
        </button>
      </div>
    </header>
  )
}