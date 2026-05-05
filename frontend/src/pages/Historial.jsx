// frontend/src/pages/Historial.jsx
import { useEffect, useState } from 'react'
import { gymAPI } from '../services/api'
import { History, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

export default function Historial() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    gymAPI.getHistory()
      .then(({ data }) => setItems(data.historial || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="animate-spin text-green-500" size={24} />
    </div>
  )

  if (!items.length) return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
      <History size={32} className="mb-2" />
      <p>No hay historial aún</p>
      <p className="text-xs mt-1">Genera tu primer plan en "Nuevo Plan"</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-white">Historial de Planes</h1>
        <p className="text-gray-400 text-sm mt-0.5">Últimos 10 planes generados</p>
      </div>

      {items.map((item, i) => {
        const perfil = typeof item.perfil === 'string' ? JSON.parse(item.perfil) : item.perfil
        const macros = typeof item.macros === 'string' ? JSON.parse(item.macros) : item.macros
        const rutina = typeof item.rutina === 'string' ? JSON.parse(item.rutina) : item.rutina

        return (
          <div key={item.id} className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition"
            >
              <div className="text-left">
                <div className="text-sm font-medium text-white">
                  Plan #{item.id} · {rutina?.tipo_rutina?.toUpperCase()}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {new Date(item.fecha).toLocaleString('es-PE')}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-green-400">{macros?.calorias_objetivo} kcal</span>
                {open === i ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>
            </button>

            {open === i && (
              <div className="px-5 pb-5 space-y-3 animate-fade-in border-t border-[#1f1f1f] pt-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { l: 'Nivel',    v: perfil?.nivel },
                    { l: 'Objetivo', v: perfil?.objetivo?.replace('_', ' ') },
                    { l: 'Días',     v: `${perfil?.dias_disponibles} días` },
                  ].map(({ l, v }) => (
                    <div key={l} className="bg-[#0a0a0a] rounded-lg p-3">
                      <div className="text-xs text-gray-400">{l}</div>
                      <div className="text-sm font-medium text-white capitalize mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-[#0a0a0a] rounded-lg p-2">
                    <div className="text-gray-400">Proteínas</div>
                    <div className="text-blue-400 font-medium">{macros?.proteinas_g}g</div>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-2">
                    <div className="text-gray-400">Carbos</div>
                    <div className="text-yellow-400 font-medium">{macros?.carbohidratos_g}g</div>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-lg p-2">
                    <div className="text-gray-400">Grasas</div>
                    <div className="text-orange-400 font-medium">{macros?.grasas_g}g</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}