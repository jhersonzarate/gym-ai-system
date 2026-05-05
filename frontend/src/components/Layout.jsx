// frontend/src/components/Layout.jsx
import { Outlet } from 'react-router-dom'
import Navbar  from './Navbar'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--gym-black)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: 'var(--gym-black)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}