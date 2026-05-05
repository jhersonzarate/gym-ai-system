// frontend/src/components/ExplicacionCard.jsx
import { Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function ExplicacionCard({ explicaciones = [] }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2 text-green-400 font-semibold">
          <Brain size={18} />
          Explicación del Sistema Experto (Prolog)
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-2 animate-fade-in">
          {explicaciones.map((e, i) => (
            <div key={i} className="flex gap-3 text-sm text-gray-300">
              <span className="text-green-500 font-bold mt-0.5">→</span>
              <span>{e}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}