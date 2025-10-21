"use client"

import { useState } from "react"
import type { Cliente } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface ClientesTableProps {
  clientes: Cliente[]
  onClienteSelect: (cliente: Cliente) => void
}

export function ClientesTable({ clientes, onClienteSelect }: ClientesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClientes = clientes.filter((cliente) =>
    Object.values(cliente).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
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
              {filteredClientes.map((cliente) => (
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
                  <td className="px-4 py-3 text-sm">{cliente.fechaEvento}</td>
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
        {searchTerm && ` · Filtrado por "${searchTerm}"`}
      </div>
    </div>
  )
}
