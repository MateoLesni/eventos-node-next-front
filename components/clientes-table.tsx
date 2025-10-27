"use client"

import { useMemo, useState } from "react"
import type { Cliente } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
// debajo de imports…
const idToNumber = (id: string | number | undefined) => {
  const n = Number(id)
  return Number.isFinite(n) ? n : -Infinity // los que no tienen ID quedan al final
}


interface ClientesTableProps {
  clientes: Cliente[]
  onClienteSelect: (cliente: Cliente) => void
}

function toISODate(v?: string) {
  if (!v) return ""
  // Admite "YYYY-MM-DD" o "DD/MM/YYYY"
  const s = String(v).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const dd = m[1].padStart(2, "0")
    const mm = m[2].padStart(2, "0")
    const yyyy = m[3]
    return `${yyyy}-${mm}-${dd}`
  }
  return "" // formato no reconocido, no filtra por fecha
}

function getMonthKey(fechaEvento?: string) {
  const iso = toISODate(fechaEvento)
  if (!iso) return ""
  return iso.slice(0, 7) // YYYY-MM
}

export function ClientesTable({ clientes, onClienteSelect }: ClientesTableProps) {
  // --- Filtros ---
  const [searchTerm, setSearchTerm] = useState("")
  const [fechaDesde, setFechaDesde] = useState("") // YYYY-MM-DD
  const [fechaHasta, setFechaHasta] = useState("") // YYYY-MM-DD
  const [estado, setEstado] = useState<string>("") // todos
  const [comercial, setComercial] = useState<string>("")
  const [mes, setMes] = useState<string>("") // YYYY-MM
  const [localSel, setLocalSel] = useState<string>("") // lugar

  // --- Opciones únicas para selects (derivadas de la primera carga) ---
  const opciones = useMemo(() => {
    const estados = new Set<string>()
    const comerciales = new Set<string>()
    const meses = new Set<string>()
    const locales = new Set<string>()

    for (const c of clientes) {
      if (c.estado) estados.add(String(c.estado))
      const vend = (c as any)?.vendedorComercialAsignado || (c as any)?.comercial || ""
      if (vend) comerciales.add(String(vend))
      const mk = getMonthKey((c as any).fechaEvento || "")
      if (mk) meses.add(mk)
      if (c.lugar) locales.add(String(c.lugar))
    }

    // ordenamos meses descendente (más reciente primero)
    const mesesOrd = Array.from(meses).sort((a, b) => (a < b ? 1 : -1))

    return {
      estados: Array.from(estados).sort(),
      comerciales: Array.from(comerciales).sort(),
      meses: mesesOrd,
      locales: Array.from(locales).sort(),
    }
  }, [clientes])

  // --- Filtro acumulativo en memoria ---
  const filteredClientes = useMemo(() => {
    return clientes
      .filter((c) => {
        // 1) Fecha rango sobre fechaEvento
        const iso = toISODate((c as any).fechaEvento || "")
        if (fechaDesde && (!iso || iso < fechaDesde)) return false
        if (fechaHasta && (!iso || iso > fechaHasta)) return false

        // 2) Estado
        if (estado && String(c.estado || "") !== estado) return false

        // 3) Comercial
        const vend = (c as any)?.vendedorComercialAsignado || (c as any)?.comercial || ""
        if (comercial && String(vend) !== comercial) return false

        // 4) Mes (YYYY-MM de fechaEvento)
        const mk = getMonthKey((c as any).fechaEvento || "")
        if (mes && mk !== mes) return false

        // 5) Local
        if (localSel && String(c.lugar || "") !== localSel) return false

        // 6) Búsqueda global
        if (searchTerm) {
          const needle = searchTerm.toLowerCase()
          const hay = Object.values(c).some((v) =>
            (v ?? "").toString().toLowerCase().includes(needle),
          )
          if (!hay) return false
        }

        return true
      })
  }, [clientes, fechaDesde, fechaHasta, estado, comercial, mes, localSel, searchTerm])
  const orderedClientes = useMemo(
  () => [...filteredClientes].sort((a, b) => idToNumber(b.id) - idToNumber(a.id)),
  [filteredClientes]
)


  const getEstadoBadgeVariant = (estado: Cliente["estado"]) => {
    switch (estado) {
      case "Activo":
        return "default"
      case "Pendiente":
        return "secondary"
      case "Cerrado":
        return "outline"
      case "Cancelado":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros: Fecha, Estado, Comercial, Mes, Local, Búsqueda */}
      <div className="grid gap-3 md:grid-cols-6">
        {/* 1) Fecha (rango) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-14">Desde</span>
          <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-14">Hasta</span>
          <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>

        {/* 2) Estado */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">Estado</span>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Todos</option>
            {opciones.estados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {/* 3) Comercial */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20">Comercial</span>
          <select
            value={comercial}
            onChange={(e) => setComercial(e.target.value)}
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Todos</option>
            {opciones.comerciales.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {/* 4) Mes (YYYY-MM derivado de fechaEvento) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-10">Mes</span>
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Todos</option>
            {opciones.meses.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* 5) Local (lugar) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-12">Local</span>
          <select
            value={localSel}
            onChange={(e) => setLocalSel(e.target.value)}
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Todos</option>
            {opciones.locales.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Búsqueda global */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Lugar</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fecha Evento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Presupuesto</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orderedClientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  onDoubleClick={() => onClienteSelect(cliente)}
                  className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono">{cliente.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{cliente.nombre}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{cliente.telefono}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{cliente.mail}</td>
                  <td className="px-4 py-3 text-sm">{cliente.lugar}</td>
                  <td className="px-4 py-3 text-sm">{(cliente as any).fechaEvento || ""}</td>
                  <td className="px-4 py-3 text-sm font-medium">{cliente.presupuesto}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getEstadoBadgeVariant(cliente.estado)}>{cliente.estado}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredClientes.length} de {clientes.length} clientes
        {searchTerm && ` · Búsqueda: "${searchTerm}"`}
        {(fechaDesde || fechaHasta) && ` · Fecha: ${fechaDesde || "—"} → ${fechaHasta || "—"}`}
        {estado && ` · Estado: ${estado}`}
        {comercial && ` · Comercial: ${comercial}`}
        {mes && ` · Mes: ${mes}`}
        {localSel && ` · Local: ${localSel}`}
      </div>
    </div>
  )
}
