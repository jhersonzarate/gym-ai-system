// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Dashboard from './pages/Dashboard'
import Formulario from './pages/Formulario'
import Resultados from './pages/Resultados'
import Historial  from './pages/Historial'
import Layout     from './components/Layout'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('gym_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index             element={<Dashboard />} />
          <Route path="formulario" element={<Formulario />} />
          <Route path="resultados" element={<Resultados />} />
          <Route path="historial"  element={<Historial />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}