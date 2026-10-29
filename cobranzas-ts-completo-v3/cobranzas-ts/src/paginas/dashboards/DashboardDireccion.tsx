import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import EtiquetaEstado from '../../componentes/EtiquetaEstado'
import TarjetaMetrica from '../../componentes/TarjetaMetrica'
import { useDatos } from '../../contextos/DatosContext'
import { formatoMoneda } from '../../utils/finanzas'
import { datosDeProyecto, flujoMensual, proyectosEnAtencion, resumenFinanciero } from '../../utils/indicadores'

export default function DashboardDireccion() {
  const { proyectos, contratos, cuotas, cobros } = useDatos()

  const global = resumenFinanciero(contratos, cuotas, cobros)
  const alertas = proyectosEnAtencion(proyectos, contratos, cuotas, cobros)
  const flujo = flujoMensual(cuotas, contratos, cobros)

  const porProyecto = proyectos
    .map((p) => {
      const d = datosDeProyecto(p.id, contratos, cuotas)
      const r = resumenFinanciero(d.contratos, d.cuotas, cobros)
      return { proyecto: p.nombre, Cobrado: r.cobrado, 'Por cobrar': r.porCobrar }
    })
    .filter((d) => d.Cobrado + d['Por cobrar'] > 0)

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaMetrica titulo="Total contratado" valor={formatoMoneda(global.contratado)} detalle={`${contratos.length} contratos`} />
        <TarjetaMetrica titulo="Cobrado" valor={formatoMoneda(global.cobrado)} tono="ok" detalle={`${global.progresoCobro} % del total`} />
        <TarjetaMetrica titulo="Por cobrar" valor={formatoMoneda(global.porCobrar)} />
        <TarjetaMetrica titulo="Vencido" valor={formatoMoneda(global.vencido)} tono={global.vencido > 0 ? 'peligro' : 'neutro'} />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-600">Cobrado vs. por cobrar por proyecto</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porProyecto}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="proyecto" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(valor) => formatoMoneda(Number(valor))} />
                <Legend />
                <Bar dataKey="Cobrado" stackId="a" fill="#16a34a" />
                <Bar dataKey="Por cobrar" stackId="a" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-600">Flujo mensual: proyectado vs. ejecutado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flujo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(valor) => formatoMoneda(Number(valor))} />
                <Legend />
                <Bar dataKey="Proyectado" fill="#94a3b8" />
                <Bar dataKey="Ejecutado" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-medium text-slate-600">Proyectos que requieren atención ({alertas.length})</h3>
        {alertas.length === 0 && <p className="text-sm text-slate-400">Todos los proyectos están en orden</p>}
        <ul className="space-y-3">
          {alertas.map((a) => (
            <li key={a.proyecto.id} className="rounded-lg border border-slate-100 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <Link to={`/proyectos/${a.proyecto.id}`} className="font-medium text-blue-700 hover:underline">
                  {a.proyecto.codigo} · {a.proyecto.nombre}
                </Link>
                <EtiquetaEstado estado={a.proyecto.estado} />
              </div>
              <ul className="mt-1 list-disc pl-5 text-slate-600">
                {a.motivos.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
