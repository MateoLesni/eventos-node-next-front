"use client"

import { useState, useEffect } from "react"
import type { Cliente, Observacion } from "@/lib/types"
import { ClientesTable } from "@/components/clientes-table"
import { ClienteDetail } from "@/components/cliente-detail"
import { Users } from "lucide-react"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://eventos-node-express-back.vercel.app" // fallback

export default function Home() {
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [clientesData, setClientesData] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)

  // 1) Traer clientes
  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE}/api/eventSheet`)
        const json = await response.json()
        const eventSheetMapped = mapClientes(json.data || [])
        setClientesData(eventSheetMapped)
      } catch (error) {
        console.error("Error fetching clientes:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchClientes()
  }, [])

  // 2) Al seleccionar, traer observaciones del cliente y setearlas en el objeto seleccionado
  const handleSelectCliente = async (cliente: Cliente) => {
    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${cliente.id}/observaciones`)
      const json = await res.json()
      const arr: string[] = Array.isArray(json.data) ? json.data : []

      // Mapear string[] → Observacion[]
      const obs: Observacion[] = arr.map((texto, idx) => ({
        id: `obs-${idx}-${cliente.id}`,
        fecha: "",           // por ahora no viene del backend; si luego lo agregas, lo mapeamos acá
        texto,
        autor: "Sistema",    // placeholder
      }))

      setSelectedCliente({ ...cliente, observaciones: obs })
    } catch (e) {
      console.error("No se pudieron cargar observaciones:", e)
      // igual mostramos el cliente, con observaciones vacías si falla
      setSelectedCliente({ ...cliente, observaciones: [] })
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto py-8 px-4">
        {!selectedCliente ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-12 rounded-lg bg-primary text-primary-foreground">
                <Users className="size-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
                <p className="text-muted-foreground">
                  Haz doble clic en un cliente para ver los detalles completos
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando clientes…</p>
            ) : (
              <ClientesTable
                clientes={clientesData}
                onClienteSelect={handleSelectCliente}
              />
            )}
          </div>
        ) : (
          <ClienteDetail
            cliente={selectedCliente}
            onBack={() => setSelectedCliente(null)}
          />
        )}
      </div>
    </main>
  )
}

function mapClientes(data: any[]): Cliente[] {
  return data.map((item) => {
    const observacion: Observacion = {
      id: item.id,
      fecha: item.fechaCliente || "",
      texto: item.observacion || "",
      autor: item.vendedorComercialAsignado || "Sistema",
    }

    return {
      id: item.id,
      idFechaCliente: item.fechaCliente || "",
      horaCliente: item.horaCliente || "",
      nombre: item.nombre || "",
      telefono: item.telefono || "",
      mail: item.mail || "",
      lugar: item.lugar || "",
      cantidadPersonas: Number(item.cantidadPersonas) || 0,
      observacion: item.observacion || "",
      observaciones: [observacion], // valor inicial; se sobrescribe al seleccionar
      redireccion: item.redireccion || "",
      canal: item.canal || "",
      respuestaViaMail: item.respuestaViaMail || "",
      asignacionComercial: item.asignacionComercialMail || "",
      horarioInicioEvento: item.horarioInicioEvento || "",
      horarioFinalizacionEvento: item.horarioFinalizacionEvento || "",
      fechaEvento: item.fechaEvento || "",
      sector: item.sector || "",
      vendedorComercialAsignado: item.vendedorComercialAsignado || "",
      marcaTemporal: item.marcaTemporal || "",
      demora: item.demora || "",
      presupuesto: item.presupuesto || "",
      fechaPresupEnviado: item.fechaPresupEnviado || "",
      estado: item.estado || "N/A",
    }
  })
}
