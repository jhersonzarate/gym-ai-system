// frontend/src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { Dumbbell, Loader2 } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await authAPI.register(form)
      localStorage.setItem('gym_token',  data.token)
      localStorage.setItem('gym_nombre', data.nombre)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={28} className="text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
          <p className="text-gray-400 text-sm mt-1">Únete al sistema experto</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 space-y-4">
          {[
            { key: 'nombre',   label: 'Nombre completo', type: 'text',     ph: 'Juan Pérez' },
            { key: 'email',    label: 'Email',            type: 'email',    ph: 'tu@email.com' },
            { key: 'password', label: 'Contraseña',       type: 'password', ph: '••••••••' },
          ].map(({ key, label, type, ph }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm({...form, [key]: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 transition"
                placeholder={ph}
                required
              />
            </div>
          ))}
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-green-400 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}