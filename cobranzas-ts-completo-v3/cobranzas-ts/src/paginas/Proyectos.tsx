import { useState } from 'react'
import { Link } from 'react-router-dom'
import EtiquetaEstado from '../componentes/EtiquetaEstado'
import ModalNuevoProyecto from '../componentes/modales/ModalNuevoProyecto'
import { useAuth } from '../contextos/AuthContext'
import { useDatos } from '../contextos/DatosContext'
import { botonPrimario } from '../utils/estilos'
import { formatoFecha, formatoMoneda } from '../utils/finanzas'
import { datosDeProyecto, resumenFinanciero } from '../utils/indicadores'

export default function Proyectos() {
  const { usuario } = useAuth()
  const { clientes, proyectos, contratos, cuotas, cobros, asignaciones, desarrolladores } = useDatos()
  const [busqueda, setBusqueda] = useState('')
  const [creando, setCreando] = useState(false)

  const puedeCrear = usuario?.rol === 'administrador' || usuario?.rol === 'comercial'
  const verDinero = usuario?.rol !== 'desarrollador'
  const nombreCliente = (clienteId: string) => clientes.find((c) => c.id === clienteId)?.nombre ?? '—'

  const nombresDesarrolladores = (proyectoId: string): string =>
    asignaciones
      .filter((a) => a.proyectoId === proyectoId)
      .map((a) => desarrolladores.find((d) => d.id === a.desarrolladorId)?.nombre)
      .filter(Boolean)
      .join(', ') || 'Sin asignar'

  const filtrados = proyectos.filter((p) =>
    `${p.nombre} ${p.codigo} ${nombreCliente(p.clienteId)} ${p.estado}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Listado de proyectos</h2>
        {puedeCrear && <button className={botonPrimario} onClick={() => setCreando(true)}>+ Nuevo proyecto</button>}
      </div>
      <input
        className="mb-3 w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        placeholder="Buscar por cliente, proyecto o estado"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              {['Código', 'Proyecto', 'Cliente', 'Desarrollador', 'Estado', 'Entrega'].map((t) => <th key={t} className="p-3 font-medium">{t}</th>)}
              {verDinero && <th className="p-3 text-right font-medium">Saldo</th>}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => {
              const d = datosDeProyecto(p.id, contratos, cuotas)
              const resumen = resumenFinanciero(d.contratos, d.cuotas, cobros)
              return (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="p-3">{p.codigo}</td>
                  <td className="p-3"><Link to={`/proyectos/${p.id}`} className="text-blue-700 hover:underline">{p.nombre}</Link></td>
                  <td className="p-3">{nombreCliente(p.clienteId)}</td>
                  <td className="p-3">{nombresDesarrolladores(p.id)}</td>
                  <td className="p-3"><EtiquetaEstado estado={p.estado} /></td>
                  <td className="whitespace-nowrap p-3">{formatoFecha(p.fechaEntrega)}</td>
                  {verDinero && <td className="p-3 text-right tabular-nums">{formatoMoneda(resumen.porCobrar)}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {creando && <ModalNuevoProyecto onCerrar={() => setCreando(false)} />}
    </>
  )
}
