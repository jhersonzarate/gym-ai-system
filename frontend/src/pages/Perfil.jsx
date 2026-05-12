// frontend/src/pages/Perfil.jsx
import { useState, useEffect, useRef } from 'react'
import { perfilAPI } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'

/* ─── helpers ─── */
function FieldError({ msg }) {
  if (!msg) return null
  return (
    <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
      <span className="material-icons-round" style={{ fontSize: 13 }}>error_outline</span>
      {msg}
    </div>
  )
}

function Toast({ msg, type = 'ok', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200)
    return () => clearTimeout(t)
  }, [onClose])

  const bg    = type === 'ok' ? 'rgba(198,241,53,0.12)' : 'rgba(239,68,68,0.1)'
  const bord  = type === 'ok' ? 'rgba(198,241,53,0.3)'  : 'rgba(239,68,68,0.3)'
  const color = type === 'ok' ? 'var(--lime)'             : 'var(--red)'
  const icon  = type === 'ok' ? 'check_circle'            : 'error_outline'

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 999,
      background: bg, border: `1px solid ${bord}`,
      borderRadius: 10, padding: '12px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'fadeUp 0.3s ease forwards',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      <span className="material-icons-round" style={{ fontSize: 20, color }}>{icon}</span>
      <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{msg}</span>
    </div>
  )
}

function SectionCard({ icon, iconColor = 'var(--lime)', iconBg = 'rgba(198,241,53,0.1)', title, children }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '24px',
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 34, height: 34, background: iconBg, borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-icons-round" style={{ fontSize: 18, color: iconColor }}>{icon}</span>
        </div>
        <h2 style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 17, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text)',
        }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

/* ─── exportar PDF ─── */
async function exportarPDF(userData) {
  // Cargamos jsPDF desde CDN si no está disponible
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s.onload  = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
  }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W  = doc.internal.pageSize.getWidth()
  const mg = 20
  let y    = mg

  const line  = (txt, size = 11, bold = false, color = [30, 30, 30]) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    doc.text(txt, mg, y)
    y += size * 0.45 + 2
  }

  const sep = () => {
    doc.setDrawColor(220, 220, 220)
    doc.line(mg, y, W - mg, y)
    y += 5
  }

  // ── Encabezado ──
  doc.setFillColor(12, 15, 20)
  doc.rect(0, 0, W, 30, 'F')
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(198, 241, 53)
  doc.text('GYMEXPERT AI', mg, 19)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(160, 160, 160)
  doc.text('Plan de entrenamiento y nutrición personalizado', mg, 27)
  y = 40

  // ── Perfil del usuario ──
  line('INFORMACIÓN DE CUENTA', 13, true, [60, 60, 60])
  sep()
  line(`Nombre:  ${userData.nombre}`,  10)
  line(`Correo:  ${userData.email}`,   10)
  line(`Planes generados: ${userData.total_planes}`, 10)
  line(`Miembro desde: ${userData.created_at ? new Date(userData.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}`, 10)
  y += 4

  // ── Último plan ──
  const rawResultado = localStorage.getItem('gym_resultado')
  if (rawResultado) {
    let resultado = null
    try { resultado = JSON.parse(rawResultado) } catch { /* */ }

    if (resultado) {
      const perfil    = typeof resultado.perfil    === 'string' ? JSON.parse(resultado.perfil)    : resultado.perfil    || {}
      const nutricion = typeof resultado.nutricion === 'string' ? JSON.parse(resultado.nutricion) : resultado.nutricion || {}
      const ia        = typeof resultado.ia_decision === 'string' ? JSON.parse(resultado.ia_decision) : resultado.ia_decision || {}
      const rutina    = typeof resultado.rutina    === 'string' ? JSON.parse(resultado.rutina)    : resultado.rutina    || {}

      line('DATOS FÍSICOS', 13, true, [60, 60, 60])
      sep()
      const datos = [
        ['Edad',          `${perfil.edad || '—'} años`],
        ['Peso',          `${perfil.peso || '—'} kg`],
        ['Altura',        `${perfil.altura || '—'} cm`],
        ['Sexo',          perfil.sexo || '—'],
        ['IMC',           `${perfil.imc || '—'} (${(perfil.imc_categoria || '').replace(/_/g, ' ')})`],
        ['Somatotipo',    perfil.somatotipo || '—'],
        ['BMR',           `${perfil.bmr || '—'} kcal/día`],
        ['TDEE',          `${perfil.tdee || '—'} kcal/día`],
      ]
      datos.forEach(([k, v]) => {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(60, 60, 60)
        doc.text(`${k}:`, mg, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(30, 30, 30)
        doc.text(v, mg + 35, y)
        y += 7
      })
      y += 4

      line('DECISIONES DEL SISTEMA', 13, true, [60, 60, 60])
      sep()
      const TIPO_LABEL = {
        fullbody: 'Full Body', upper_lower: 'Upper / Lower',
        ppl: 'Push Pull Legs', torso_pierna: 'Torso / Pierna', especializado: 'Especializado',
      }
      const decisiones = [
        ['Objetivo',      (ia.objetivo || '').replace(/_/g, ' ')],
        ['Tipo rutina',   TIPO_LABEL[ia.tipo_rutina] || ia.tipo_rutina || '—'],
        ['Frecuencia',    `${ia.frecuencia || '—'} días por semana`],
        ['Intensidad',    ia.intensidad || '—'],
        ['Cardio',        ia.usa_cardio ? 'Incluido' : 'Sin cardio'],
        ['Nivel',         perfil.nivel || '—'],
        ['Días/semana',   `${perfil.dias_disponibles || '—'}`],
      ]
      decisiones.forEach(([k, v]) => {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(60, 60, 60)
        doc.text(`${k}:`, mg, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(30, 30, 30)
        doc.text(String(v), mg + 35, y)
        y += 7
      })
      y += 4

      line('PLAN NUTRICIONAL DIARIO', 13, true, [60, 60, 60])
      sep()
      const macros = [
        ['Calorías objetivo', `${nutricion.calorias_objetivo || '—'} kcal`],
        ['Proteínas',         `${nutricion.proteinas_g || '—'} g`],
        ['Carbohidratos',     `${nutricion.carbohidratos_g || '—'} g`],
        ['Grasas',            `${nutricion.grasas_g || '—'} g`],
      ]
      macros.forEach(([k, v]) => {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(60, 60, 60)
        doc.text(`${k}:`, mg, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(30, 30, 30)
        doc.text(v, mg + 45, y)
        y += 7
      })
      y += 4

      // ── Rutina semanal ──
      if (rutina.dias && rutina.dias.length > 0) {
        if (y > 220) { doc.addPage(); y = mg }
        line('RUTINA SEMANAL', 13, true, [60, 60, 60])
        sep()

        rutina.dias.forEach((dia) => {
          if (y > 250) { doc.addPage(); y = mg }
          line(dia.nombre || `Día ${dia.dia}`, 11, true, [40, 40, 40])
          ;(dia.ejercicios || []).forEach((ex) => {
            if (y > 270) { doc.addPage(); y = mg }
            const desc = ex.grupo === 'cardio'
              ? `   · ${ex.nombre} — ${ex.repeticiones}`
              : `   · ${ex.nombre} — ${ex.series} × ${ex.repeticiones} (${ex.descanso_seg || ex.descansoSeg || 0}s descanso)`
            line(desc, 9, false, [80, 80, 80])
          })
          y += 2
        })
      }

      // ── Razonamiento ──
      const exps = Array.isArray(ia.explicacion) ? ia.explicacion : []
      if (exps.length > 0) {
        if (y > 220) { doc.addPage(); y = mg }
        y += 4
        line('POR QUÉ ESTE PLAN', 13, true, [60, 60, 60])
        sep()
        exps.forEach((e, i) => {
          if (y > 265) { doc.addPage(); y = mg }
          const txt  = `${i + 1}. ${e}`
          const wrap = doc.splitTextToSize(txt, W - mg * 2)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(70, 70, 70)
          doc.text(wrap, mg, y)
          y += wrap.length * 5 + 2
        })
      }
    }
  }

  // ── Footer ──
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(170, 170, 170)
    doc.text(
      `GymExpert AI — Generado el ${new Date().toLocaleDateString('es-PE')} — Página ${i} de ${pages}`,
      W / 2, doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  doc.save(`gymexpert-plan-${new Date().toISOString().slice(0, 10)}.pdf`)
}

/* ══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function Perfil() {
  const { theme, toggleTheme } = useTheme()
  const fileRef = useRef(null)

  const [userData,    setUserData]    = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [toast,       setToast]       = useState(null)

  // Estados de formularios
  const [nombre,      setNombre]      = useState('')
  const [email,       setEmail]       = useState('')
  const [savingInfo,  setSavingInfo]  = useState(false)
  const [errInfo,     setErrInfo]     = useState('')

  const [passActual,  setPassActual]  = useState('')
  const [passNueva,   setPassNueva]   = useState('')
  const [passConf,    setPassConf]    = useState('')
  const [savingPass,  setSavingPass]  = useState(false)
  const [errPass,     setErrPass]     = useState('')
  const [showPass,    setShowPass]    = useState(false)

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [exportingPDF,   setExportingPDF]   = useState(false)

  const notify = (msg, type = 'ok') => setToast({ msg, type })

  /* ── Cargar datos del usuario ── */
  useEffect(() => {
    perfilAPI.getMe()
      .then(({ data }) => {
        setUserData(data)
        setNombre(data.nombre)
        setEmail(data.email)
        // Sincronizar foto en localStorage para el Navbar
        if (data.foto_perfil) {
          localStorage.setItem('gym_foto', data.foto_perfil)
        } else {
          localStorage.removeItem('gym_foto')
        }
      })
      .catch(() => notify('No se pudo cargar el perfil', 'err'))
      .finally(() => setLoading(false))
  }, [])

  /* ── Actualizar nombre y email ── */
  const handleSaveInfo = async (e) => {
    e.preventDefault()
    setErrInfo('')
    if (!nombre.trim() || nombre.trim().length < 2) {
      setErrInfo('El nombre debe tener al menos 2 caracteres')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrInfo('Ingresa un correo válido')
      return
    }
    setSavingInfo(true)
    try {
      const { data } = await perfilAPI.updateProfile({ nombre: nombre.trim(), email })
      // Actualizar token si el email cambió
      if (data.token) localStorage.setItem('gym_token', data.token)
      localStorage.setItem('gym_nombre', data.nombre)
      setUserData(prev => ({ ...prev, nombre: data.nombre, email: data.email }))
      notify('Perfil actualizado correctamente')
    } catch (err) {
      setErrInfo(err.response?.data?.detail || 'No se pudo actualizar el perfil')
    } finally {
      setSavingInfo(false)
    }
  }

  /* ── Cambiar contraseña ── */
  const handleSavePass = async (e) => {
    e.preventDefault()
    setErrPass('')
    if (!passActual) { setErrPass('Ingresa tu contraseña actual'); return }
    if (passNueva.length < 6) { setErrPass('La nueva contraseña debe tener al menos 6 caracteres'); return }
    if (passNueva !== passConf) { setErrPass('Las contraseñas nuevas no coinciden'); return }

    setSavingPass(true)
    try {
      await perfilAPI.changePassword({ password_actual: passActual, password_nueva: passNueva })
      setPassActual(''); setPassNueva(''); setPassConf('')
      notify('Contraseña actualizada correctamente')
    } catch (err) {
      setErrPass(err.response?.data?.detail || 'No se pudo cambiar la contraseña')
    } finally {
      setSavingPass(false)
    }
  }

  /* ── Subir foto ── */
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!TIPOS.includes(file.type)) {
      notify('Formato no permitido. Usa JPG, PNG, WEBP o GIF', 'err')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      notify('La imagen es demasiado grande. Máximo 2MB', 'err')
      return
    }

    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await perfilAPI.uploadPhoto(formData)
      localStorage.setItem('gym_foto', data.foto_perfil)
      setUserData(prev => ({ ...prev, foto_perfil: data.foto_perfil }))
      notify('Foto de perfil actualizada')
      // Forzar re-render del navbar sin recargar
      window.dispatchEvent(new Event('storage'))
    } catch (err) {
      notify(err.response?.data?.detail || 'No se pudo subir la foto', 'err')
    } finally {
      setUploadingPhoto(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  /* ── Eliminar foto ── */
  const handleDeletePhoto = async () => {
    if (!window.confirm('¿Eliminar tu foto de perfil?')) return
    setUploadingPhoto(true)
    try {
      await perfilAPI.deletePhoto()
      localStorage.removeItem('gym_foto')
      setUserData(prev => ({ ...prev, foto_perfil: null }))
      notify('Foto eliminada')
    } catch {
      notify('No se pudo eliminar la foto', 'err')
    } finally {
      setUploadingPhoto(false)
    }
  }

  /* ── Exportar PDF ── */
  const handleExportPDF = async () => {
    setExportingPDF(true)
    try {
      await exportarPDF(userData)
      notify('PDF exportado correctamente')
    } catch {
      notify('Ocurrió un error al generar el PDF', 'err')
    } finally {
      setExportingPDF(false)
    }
  }

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '360px', flexDirection: 'column', gap: 16 }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid var(--border)', borderTopColor: 'var(--lime)',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 14, color: 'var(--muted)' }}>Cargando perfil...</span>
    </div>
  )

  const initial = (userData?.nombre || 'A').charAt(0).toUpperCase()
  const miembroDesde = userData?.created_at
    ? new Date(userData.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })
    : '—'

  return (
    <div className="animate-fade-up" style={{ maxWidth: 860, margin: '0 auto' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="label-tag" style={{ marginBottom: 7 }}>Configuración de cuenta</div>
        <h1 style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 28, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text)',
        }}>Mi perfil</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
          Gestiona tu información personal, seguridad y preferencias
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18, alignItems: 'start' }}>

        {/* ── Columna izquierda: Avatar + stats ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Tarjeta de avatar */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '28px 20px',
            textAlign: 'center',
            transition: 'background 0.25s, border-color 0.25s',
          }}>
            {/* Foto de perfil */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <div style={{
                width: 96, height: 96,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--lime)',
                margin: '0 auto',
                background: 'rgba(198,241,53,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {userData?.foto_perfil ? (
                  <img
                    src={userData.foto_perfil}
                    alt="Foto de perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize: 40, color: 'var(--lime)', lineHeight: 1,
                  }}>{initial}</span>
                )}
              </div>

              {/* Botón de editar foto encima */}
              {uploadingPhoto ? (
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 30, height: 30,
                  background: 'var(--lime)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--card)',
                }}>
                  <span className="material-icons-round animate-spin" style={{ fontSize: 14, color: '#080A0C' }}>refresh</span>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 30, height: 30,
                    background: 'var(--lime)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--card)',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--lime2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--lime)'}
                  title="Cambiar foto de perfil"
                >
                  <span className="material-icons-round" style={{ fontSize: 14, color: '#080A0C' }}>photo_camera</span>
                </button>
              )}
            </div>

            {/* Input oculto para archivo */}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />

            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4,
            }}>{userData?.nombre}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>{userData?.email}</div>

            {/* Botones de foto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
              >
                <span className="material-icons-round" style={{ fontSize: 15 }}>upload</span>
                Subir foto
              </button>
              {userData?.foto_perfil && (
                <button
                  onClick={handleDeletePhoto}
                  disabled={uploadingPhoto}
                  style={{
                    width: '100%', padding: '8px', fontSize: 12,
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, color: '#FCA5A5',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: 5,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                >
                  <span className="material-icons-round" style={{ fontSize: 14 }}>delete_outline</span>
                  Eliminar foto
                </button>
              )}
            </div>

            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, lineHeight: 1.5 }}>
              JPG, PNG, WEBP o GIF — máximo 2MB
            </p>
          </div>

          {/* Stats */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '18px 20px',
            transition: 'background 0.25s',
          }}>
            <div className="label-tag" style={{ marginBottom: 14 }}>Estadísticas</div>
            {[
              { icon: 'assignment', label: 'Planes generados', value: userData?.total_planes ?? '—', color: 'var(--lime)'   },
              { icon: 'calendar_month', label: 'Miembro desde', value: miembroDesde,                  color: '#A78BFA'       },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 34, height: 34, background: `${color}12`,
                  border: `1px solid ${color}22`, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span className="material-icons-round" style={{ fontSize: 16, color }}>{icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 1 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Exportar PDF */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '18px 20px',
            transition: 'background 0.25s',
          }}>
            <div className="label-tag" style={{ marginBottom: 10 }}>Exportar</div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
              Descarga tu plan actual (rutina + nutrición + perfil) en formato PDF para imprimir o compartir.
            </p>
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF}
              className="btn-primary"
              style={{ width: '100%', fontSize: 13, padding: '11px' }}
            >
              {exportingPDF ? (
                <>
                  <span className="material-icons-round animate-spin" style={{ fontSize: 16 }}>refresh</span>
                  Generando...
                </>
              ) : (
                <>
                  <span className="material-icons-round" style={{ fontSize: 16 }}>picture_as_pdf</span>
                  Exportar PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Columna derecha: formularios ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Información personal */}
          <SectionCard icon="person" title="Información personal">
            <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted2)', marginBottom: 7 }}>
                  Nombre completo
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-icons-round" style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 17, color: 'var(--muted)', pointerEvents: 'none',
                  }}>badge</span>
                  <input
                    type="text"
                    className="gym-input"
                    style={{ paddingLeft: 44 }}
                    placeholder="Tu nombre completo"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    minLength={2} maxLength={100}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted2)', marginBottom: 7 }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-icons-round" style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 17, color: 'var(--muted)', pointerEvents: 'none',
                  }}>mail_outline</span>
                  <input
                    type="email"
                    className="gym-input"
                    style={{ paddingLeft: 44 }}
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {errInfo && <FieldError msg={errInfo} />}

              <button
                type="submit"
                disabled={savingInfo}
                className="btn-primary"
                style={{ alignSelf: 'flex-start', fontSize: 13, padding: '10px 22px' }}
              >
                {savingInfo ? (
                  <>
                    <span className="material-icons-round animate-spin" style={{ fontSize: 16 }}>refresh</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="material-icons-round" style={{ fontSize: 16 }}>save</span>
                    Guardar cambios
                  </>
                )}
              </button>
            </form>
          </SectionCard>

          {/* Cambiar contraseña */}
          <SectionCard icon="lock_outline" iconColor="#A78BFA" iconBg="rgba(167,139,250,0.1)" title="Cambiar contraseña">
            <form onSubmit={handleSavePass} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Contraseña actual',      val: passActual, set: setPassActual, placeholder: 'Tu contraseña actual'       },
                { label: 'Nueva contraseña',        val: passNueva,  set: setPassNueva,  placeholder: 'Mínimo 6 caracteres'        },
                { label: 'Confirmar nueva contraseña', val: passConf, set: setPassConf, placeholder: 'Repite la nueva contraseña' },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted2)', marginBottom: 7 }}>
                    {label}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-icons-round" style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 17, color: 'var(--muted)', pointerEvents: 'none',
                    }}>lock_outline</span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="gym-input"
                      style={{ paddingLeft: 44, paddingRight: 44 }}
                      placeholder={placeholder}
                      value={val}
                      onChange={e => set(e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {/* Toggle mostrar/ocultar */}
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  alignSelf: 'flex-start', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--muted)', fontSize: 12,
                  display: 'flex', alignItems: 'center', gap: 5, padding: 0,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
              >
                <span className="material-icons-round" style={{ fontSize: 15 }}>
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
                {showPass ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
              </button>

              {errPass && <FieldError msg={errPass} />}

              <button
                type="submit"
                disabled={savingPass}
                className="btn-primary"
                style={{ alignSelf: 'flex-start', fontSize: 13, padding: '10px 22px' }}
              >
                {savingPass ? (
                  <>
                    <span className="material-icons-round animate-spin" style={{ fontSize: 16 }}>refresh</span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <span className="material-icons-round" style={{ fontSize: 16 }}>lock_reset</span>
                    Actualizar contraseña
                  </>
                )}
              </button>
            </form>
          </SectionCard>

          {/* Apariencia */}
          <SectionCard icon="palette" iconColor="#F59E0B" iconBg="rgba(245,158,11,0.1)" title="Apariencia">
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '14px 16px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
              borderRadius: 10, border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38,
                  background: theme === 'dark' ? '#1E2229' : '#F0F2F5',
                  borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border2)',
                }}>
                  <span className="material-icons-round" style={{ fontSize: 20, color: theme === 'dark' ? '#A78BFA' : '#F59E0B' }}>
                    {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {theme === 'dark' ? 'Interfaz en tonos oscuros' : 'Interfaz en tonos claros'}
                  </div>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className={`theme-toggle${theme === 'light' ? ' active' : ''}`}
                title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
                aria-label="Cambiar tema"
              />
            </div>

            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.5 }}>
              El tema se guarda automáticamente en tu navegador.
            </p>
          </SectionCard>

        </div>
      </div>
    </div>
  )
}