import { useState } from 'react'
import { NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom'
import {
  CalendarDays, FolderGit2, FolderOpen, History, Layers, LayoutDashboard, ListChecks, LogOut, MessagesSquare, PlusCircle, Receipt,
  RotateCcw, ShieldCheck, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../contextos/AuthContext'
import { useDatos } from '../contextos/DatosContext'
import type { Rol } from '../tipos'
import ModalNuevoProyecto from './modales/ModalNuevoProyecto'

interface Enlace {
  ruta: string
  texto: string
  icono: LucideIcon
  roles: Rol[]
}

const TODOS: Rol[] = ['administrador', 'comercial', 'finanzas', 'desarrollador']

const enlaces: Enlace[] = [
  { ruta: '/', texto: 'Dashboard', icono: LayoutDashboard, roles: TODOS },
  { ruta: '/proyectos', texto: 'Proyectos', icono: FolderGit2, roles: TODOS },
  { ruta: '/plan-pagos', texto: 'Plan de pagos', icono: ListChecks, roles: ['administrador', 'comercial', 'finanzas'] },
  { ruta: '/cobranza', texto: 'Control de cobranza', icono: Receipt, roles: ['administrador', 'finanzas'] },
  { ruta: '/calendario', texto: 'Calendario financiero', icono: CalendarDays, roles: ['administrador', 'comercial', 'finanzas'] },
  { ruta: '/reuniones', texto: 'Reuniones', icono: MessagesSquare, roles: TODOS },
  { ruta: '/documentos', texto: 'Documentación', icono: FolderOpen, roles: TODOS },
  { ruta: '/ampliaciones', texto: 'Ampliaciones', icono: Layers, roles: ['administrador', 'comercial'] },
  { ruta: '/desarrolladores', texto: 'Desarrolladores', icono: Users, roles: ['administrador'] },
  { ruta: '/auditoria', texto: 'Auditoría', icono: History, roles: ['administrador'] },
]

export default function Layout() {
  const { usuario, cerrarSesion } = useAuth()
  const { proyectos, restaurarDatos } = useDatos()
  const navegar = useNavigate()
  const coincidencia = useMatch('/proyectos/:id')
  const [creando, setCreando] = useState(false)

  if (!usuario) return null

  const puedeCrear = usuario.rol === 'administrador' || usuario.rol === 'comercial'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 selection:bg-indigo-500 selection:text-white">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">Cobranzas</span>
                <span className="hidden rounded border border-indigo-500/30 bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 sm:inline">
                  Control & Dossier
                </span>
              </div>
              <p className="hidden text-xs text-slate-400 md:block">Control documental y cobranzas de proyectos de software</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 transition-colors hover:bg-slate-800 lg:flex">
              <FolderGit2 className="mr-2 h-4 w-4 shrink-0 text-emerald-400" />
              <select
                aria-label="Ir a un proyecto"
                value={coincidencia?.params.id ?? ''}
                onChange={(e) => e.target.value && navegar(`/proyectos/${e.target.value}`)}
                className="max-w-[220px] cursor-pointer truncate bg-transparent text-sm font-medium text-slate-200 focus:outline-none"
              >
                <option value="" className="bg-slate-800">Ir a un proyecto…</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-800">{p.codigo} · {p.nombre}</option>
                ))}
              </select>
            </div>

            {puedeCrear && (
              <button
                onClick={() => setCreando(true)}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-teal-700 sm:text-sm"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo proyecto</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            )}

            <div className="hidden text-right md:block">
              <p className="text-sm font-medium leading-tight">{usuario.nombre}</p>
              <p className="text-xs capitalize leading-tight text-slate-400">{usuario.rol}</p>
            </div>

            {usuario.rol === 'administrador' && (
              <button
                onClick={() => window.confirm('¿Restaurar los datos de demostración?') && restaurarDatos()}
                title="Restaurar datos de demostración"
                aria-label="Restaurar demo"
                className="rounded-lg border border-transparent p-2 text-slate-400 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={cerrarSesion}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="rounded-lg border border-transparent p-2 text-slate-400 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
          {enlaces
            .filter((e) => e.roles.includes(usuario.rol))
            .map((e) => {
              const Icono = e.icono
              return (
                <NavLink
                  key={e.ruta}
                  to={e.ruta}
                  end={e.ruta === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-3 text-xs font-semibold transition-all sm:text-sm ${
                      isActive
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`
                  }
                >
                  <Icono className="h-4 w-4" />
                  {e.texto}
                </NavLink>
              )
            })}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white py-5 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Cobranzas</span>
            <span>• Plataforma de control documental y cobranzas de software · Datos demostrativos</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Control de hitos</span>
            <span>Comprobantes</span>
            <span>Flujo de caja</span>
            <span>Trazabilidad</span>
          </div>
        </div>
      </footer>

      {creando && <ModalNuevoProyecto onCerrar={() => setCreando(false)} />}
    </div>
  )
}
