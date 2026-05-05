// frontend/src/pages/Formulario.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gymAPI } from '../services/api'
import { Loader2, Send } from 'lucide-react'

const CAMPOS = [
  { key: 'edad',   label: 'Edad (años)',     type: 'number', min: 15,  max: 80,  ph: '25'  },
  { key: 'peso',   label: 'Peso (kg)',        type: 'number', min: 30,  max: 200, ph: '75'  },
  { key: 'altura', label: 'Altura (cm)',      type: 'number', min: 140, max: 220, ph: '175' },
  { key: 'dias_disponibles', label: 'Días disponibles / semana', type: 'number', min: 1, max: 7, ph: '4' },
]

const SELECTS = [
  {
    key: 'sexo', label: 'Sexo biológico',
    opts: [{ v: 'masculino', l: '♂ Masculino' }, { v: 'femenino', l: '♀ Femenino' }]
  },
  {
    key: 'nivel', label: 'Nivel de entrenamiento',
    opts: [
      { v: 'principiante', l: '🟢 Principiante (0-1 año)' },
      { v: 'intermedio',   l: '🟡 Intermedio (1-3 años)'  },
      { v: 'avanzado',     l: '🔴 Avanzado (3+ años)'     },
    ]
  },
  {
    key: 'objetivo', label: 'Objetivo principal',
    opts: [
      { v: 'perder_grasa',  l: '🔥 Perder grasa'     },
      { v: 'ganar_musculo', l: '💪 Ganar músculo'     },
      { v: 'mantener',      l: '⚖️  Mantener peso'    },
    ]
  },
]

const INIT = {
  edad: '', peso: '', altura: '', dias_disponibles: '',
  sexo: 'masculino', nivel: 'principiante', objetivo: 'ganar_musculo'
}

export default function Formulario() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INIT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        edad:             parseInt(form.edad),
        peso:             parseFloat(form.peso),
        altura:           parseFloat(form.altura),
        dias_disponibles: parseInt(form.dias_disponibles),
      }
      const { data } = await gymAPI.generateRoutine(payload)
      sessionStorage.setItem('gym_resultado', JSON.stringify(data))
      sessionStorage.setItem('gym_perfil_form', JSON.stringify(payload))
      navigate('/resultados')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error generando el plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Nuevo Plan Personalizado</h1>
        <p className="text-gray-400 text-sm mt-1">La IA analizará tu perfil con Prolog + Scala</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {CAMPOS.map(({ key, label, type, min, max, ph }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
              <input
                type={type}
                min={min}
                max={max}
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={ph}
                required
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 transition"
              />
            </div>
          ))}
        </div>

        {SELECTS.map(({ key, label, opts }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-400 mb-2">{label}</label>
            <div className="flex flex-wrap gap-2">
              {opts.map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set(key, v)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                    ${form[key] === v
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-[#0a0a0a] border-[#1f1f1f] text-gray-400 hover:border-gray-500'
                    }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {loading ? 'Analizando con IA...' : 'Generar Plan Inteligente'}
        </button>
      </form>
    </div>
  )
}