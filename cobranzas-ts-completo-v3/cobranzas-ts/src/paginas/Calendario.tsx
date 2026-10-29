import { useState } from 'react'
import { HOY } from '../datos/datosEjemplo'
import { useDatos } from '../contextos/DatosContext'
import { flujoEjecutado, flujoProyectado, formatoMoneda, redondear, sumarCelda } from '../utils/finanzas'
import type { FlujoPorProyecto } from '../tipos'

type Vista = 'proyectado' | 'ejecutado' | 'comparativo'

const MESES = ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02']
const VISTAS: Vista[] = ['proyectado', 'ejecutado', 'comparativo']

const diasDelMes = (mes: string): string[] => {
  const [anio, numero] = mes.split('-').map(Number)
  const total = new Date(anio, numero, 0).getDate()
  return Array.from({ length: total }, (_, i) => `${mes}-${String(i + 1).padStart(2, '0')}`)
}

const corto = (n: number): string => formatoMoneda(n).replace(',00', '')

export default function Calendario() {
  const { proyectos, contratos, cuotas, cobros } = useDatos()
  const [mes, setMes] = useState(HOY.slice(0, 7))
  const [vista, setVista] = useState<Vista>('proyectado')
  const [seleccion, setSeleccion] = useState<{ proyectoId: string; dia: string } | null>(null)

  const proy = flujoProyectado(cuotas, contratos)
  const ejec = flujoEjecutado(cobros, cuotas, contratos)
  const dias = diasDelMes(mes)

  const hayDato = (pid: string, dia: string): boolean => {
    if (vista === 'proyectado') return !!proy[pid]?.[dia]
    if (vista === 'ejecutado') return !!ejec[pid]?.[dia]
    return !!(proy[pid]?.[dia] || ejec[pid]?.[dia])
  }

  const valor = (pid: string, dia: string): number => {
    if (vista === 'proyectado') return sumarCelda(proy[pid]?.[dia])
    if (vista === 'ejecutado') return sumarCelda(ejec[pid]?.[dia])
    return redondear(sumarCelda(ejec[pid]?.[dia]) - sumarCelda(proy[pid]?.[dia]))
  }

  const totalFila = (pid: string) => redondear(dias.reduce((suma, d) => suma + valor(pid, d), 0))
  const totalDia = (dia: string) => redondear(proyectos.reduce((suma, p) => suma + valor(p.id, dia), 0))

  const bloqueDetalle = (titulo: string, flujo: FlujoPorProyecto) => {
    const items = seleccion ? flujo[seleccion.proyectoId]?.[seleccion.dia] ?? [] : []
    return (
      <div className="mt-2">
        <em className="text-slate-500">{titulo}</em>
        {items.length === 0 && <div>—</div>}
        {items.map((x, i) => (
          <div key={i}>
            {x.cuota.concepto} — {formatoMoneda(x.importe)} · entrega: {x.cuota.estadoEntrega}
            {x.cuota.fechaOriginal && x.cuota.fechaOriginal !== x.cuota.fechaProyectada && ` · reprogramada (original ${x.cuota.fechaOriginal})`}
            {x.cobro && ` · ${x.cobro.comprobante}`}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <h2 className="mb-4 text-xl font-semibold">Calendario financiero</h2>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          value={mes}
          onChange={(e) => { setMes(e.target.value); setSeleccion(null) }}
        >
          {MESES.map((m) => <option key={m}>{m}</option>)}
        </select>
        {VISTAS.map((v) => (
          <button
            key={v}
            onClick={() => setVista(v)}
            className={`rounded-md border px-3 py-1 text-sm ${vista === v ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
          >
            {v}
          </button>
        ))}
      </div>
      {vista === 'comparativo' && (
        <div className="mb-3 rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-800">Comparativo = ejecutado − proyectado, por día.</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="p-2 text-left font-medium">Proyecto</th>
              {dias.map((d) => <th key={d} className="p-2 text-right font-medium">{d.slice(8)}</th>)}
              <th className="p-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="whitespace-nowrap p-2">{p.nombre}</td>
                {dias.map((d) => {
                  const hay = hayDato(p.id, d)
                  const vencida = hay && vista === 'proyectado' && d < HOY
                  return (
                    <td
                      key={d}
                      onClick={() => hay && setSeleccion({ proyectoId: p.id, dia: d })}
                      className={`whitespace-nowrap p-2 text-right ${hay ? 'cursor-pointer hover:bg-blue-50' : 'text-slate-300'} ${vencida ? 'font-semibold text-red-700' : ''}`}
                    >
                      {hay ? corto(valor(p.id, d)) : '—'}
                    </td>
                  )
                })}
                <td className="whitespace-nowrap p-2 text-right font-semibold">{corto(totalFila(p.id))}</td>
              </tr>
            ))}
            <tr className="border-t border-slate-200 font-semibold">
              <td className="p-2">TOTAL</td>
              {dias.map((d) => <td key={d} className="whitespace-nowrap p-2 text-right">{totalDia(d) ? corto(totalDia(d)) : '—'}</td>)}
              <td className="whitespace-nowrap p-2 text-right">{corto(redondear(dias.reduce((suma, d) => suma + totalDia(d), 0)))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {seleccion && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <strong>{proyectos.find((p) => p.id === seleccion.proyectoId)?.nombre} · {seleccion.dia}</strong>
          {bloqueDetalle('Proyectado', proy)}
          {bloqueDetalle('Ejecutado', ejec)}
          <button onClick={() => setSeleccion(null)} className="mt-3 rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50">Cerrar</button>
        </div>
      )}
    </>
  )
}
