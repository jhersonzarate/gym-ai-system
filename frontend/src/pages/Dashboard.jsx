// frontend/src/pages/Dashboard.jsx
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Salad, Brain, TrendingUp, ArrowRight } from 'lucide-react'

const cards = [
  {
    icon: Brain,
    title: 'IA con Prolog',
    desc: 'Motor de inferencia con 25+ reglas expertas para decisiones personalizadas',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20'
  },
  {
    icon: Dumbbell,
    title: 'Rutinas Dinámicas',
    desc: 'Generadas por Scala: FullBody, Upper/Lower, PPL, Torso/Pierna, Especializado',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20'
  },
  {
    icon: Salad,
    title: 'Plan Nutricional',
    desc: 'Cálculo BMR + TDEE con distribución de macros según objetivo corporal',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20'
  },
  {
    icon: TrendingUp,
    title: 'Simulación 8 Semanas',
    desc: 'Proyección de progreso corporal según objetivo y plan asignado',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('gym_nombre') || 'Atleta'

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bienvenido, <span className="text-green-400">{nombre}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Sistema experto multilenguaje: Scala + Prolog + Python + React
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className={`rounded-xl border p-5 ${bg}`}>
            <Icon className={`${color} mb-3`} size={22} />
            <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">¿Listo para tu plan personalizado?</h2>
          <p className="text-gray-400 text-sm">Completa tu perfil y la IA generará tu rutina óptima</p>
        </div>
        <button
          onClick={() => navigate('/formulario')}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold px-5 py-2.5 rounded-xl transition text-sm"
        >
          Comenzar <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}