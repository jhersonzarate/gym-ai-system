// frontend/src/pages/Resultados.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, Flame, Dumbbell, Apple, ChevronDown, ChevronUp, RotateCcw
} from 'lucide-react'
import ExplicacionCard from '../components/ExplicacionCard'
import ProgressChart   from '../components/ProgressChart'

function StatCard({ icon: Icon, label, value, sub, color = 'text-green-400' }) {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  )
}

function MacroBar({ label, valor, total, color }) {
  const pct = Math.round((valor * (label === 'Proteínas' || label === 'Carbohidratos' ? 4 : 9)) / total * 100)
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{valor}g · {pct}%</span>
      </div>
      <div className="h-1.5 bg-[#1f1f1f] rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Resultados() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [openDia, setOpenDia] = useState(0)

  useEffect(() => {
    const raw = sessionStorage.getItem('gym_resultado')
    if (!raw) { navigate('/formulario'); return }
    setData(JSON.parse(raw))
  }, [])

  if (!data) return null

  const { perfil, nutricion, ia_decision, rutina, progreso_simulado } = data
  const explicaciones = typeof ia_decision.explicacion === 'string'
    ? ia_decision.explicacion.split('|')
    : ia_decision.explicacion

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Tu Plan Personalizado</h1>
          <p className="text-gray-400 text-xs mt-0.5">Generado por IA · Prolog + Scala</p>
        </div>
        <button
          onClick={() => navigate('/formulario')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 transition"
        >
          <RotateCcw size={14} /> Nuevo plan
        </button>
      </div>

      {/* Stats físicos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="IMC"      value={perfil.imc}  sub={perfil.imc_categoria} />
        <StatCard icon={Flame}    label="BMR"      value={perfil.bmr}  sub="kcal basales" color="text-orange-400" />
        <StatCard icon={Flame}    label="TDEE"     value={perfil.tdee} sub="kcal totales" color="text-red-400" />
        <StatCard icon={Dumbbell} label="Somatotipo" value={perfil.somatotipo} sub="" color="text-purple-400" />
      </div>

      {/* Nutrición */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Apple size={16} className="text-green-400" />
          <h3 className="font-semibold text-white text-sm">Plan Nutricional</h3>
          <span className="ml-auto text-green-400 font-bold">{nutricion.calorias_objetivo} kcal/día</span>
        </div>
        <div className="space-y-3">
          <MacroBar label="Proteínas"     valor={nutricion.proteinas_g}      total={nutricion.calorias_objetivo} color="bg-blue-500"   />
          <MacroBar label="Carbohidratos" valor={nutricion.carbohidratos_g}   total={nutricion.calorias_objetivo} color="bg-yellow-500" />
          <MacroBar label="Grasas"        valor={nutricion.grasas_g}          total={nutricion.calorias_objetivo} color="bg-orange-500" />
        </div>
      </div>

      {/* Decisión IA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'Tipo Rutina',  v: rutina.tipo_rutina },
          { l: 'Frecuencia',   v: `${ia_decision.frecuencia} días/sem` },
          { l: 'Intensidad',   v: ia_decision.intensidad },
          { l: 'Cardio',       v: ia_decision.usa_cardio ? 'Sí' : 'No' },
        ].map(({ l, v }) => (
          <div key={l} className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 text-center">
            <div className="text-xs text-gray-400 mb-1">{l}</div>
            <div className="text-sm font-semibold text-green-400 capitalize">{v}</div>
          </div>
        ))}
      </div>

      {/* Explicación Prolog */}
      <ExplicacionCard explicaciones={explicaciones} />

      {/* Rutina */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <Dumbbell size={16} className="text-green-400" />
            <h3 className="font-semibold text-white text-sm">Rutina Semanal</h3>
            <span className="text-xs text-gray-500 ml-auto">{rutina.generado_por}</span>
          </div>
        </div>
        <div className="divide-y divide-[#1f1f1f]">
          {rutina.dias?.map((dia, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenDia(openDia === i ? -1 : i)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition"
              >
                <span className="text-sm font-medium text-white">{dia.nombre}</span>
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  {dia.ejercicios?.length} ejercicios
                  {openDia === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>
              {openDia === i && (
                <div className="px-5 pb-4 space-y-2 animate-fade-in">
                  {dia.ejercicios?.map((ex, j) => (
                    <div key={j} className="flex items-center justify-between bg-[#0a0a0a] rounded-lg px-4 py-2.5">
                      <div>
                        <div className="text-sm text-white">{ex.nombre}</div>
                        <div className="text-xs text-gray-500 capitalize">{ex.grupo} · {ex.equipo}</div>
                      </div>
                      <div className="text-right">
                        {ex.grupo !== 'cardio' ? (
                          <div className="text-xs text-green-400 font-medium">
                            {ex.series} × {ex.repeticiones}
                          </div>
                        ) : (
                          <div className="text-xs text-blue-400 font-medium">{ex.repeticiones}</div>
                        )}
                        {ex.descanso_seg > 0 && (
                          <div className="text-xs text-gray-500">{ex.descanso_seg}s descanso</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico progreso */}
      <ProgressChart data={progreso_simulado} objetivo={ia_decision.objetivo} />
    </div>
  )
}