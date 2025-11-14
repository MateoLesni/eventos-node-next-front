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

  // 1) Traer clientes (ya incluye observacionesList y ComercialFinal desde el backend)
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

  // 2) Al seleccionar, ya tenemos observaciones en el cliente — no hace falta fetch extra
  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
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
    // normalizamos observacionesList
    const observacionesList: Observacion[] = Array.isArray(item.observacionesList)
      ? item.observacionesList
          .map((o: any) => {
            if (typeof o === "string") return { texto: o, fecha: "" }
            return {
              texto: typeof o?.texto === "string" ? o.texto : "",
              fecha: typeof o?.fecha === "string" ? o.fecha : "",
            }
          })
          .filter((o: any) => o.texto)
      : []

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

      // ya no usamos una lista “manual” de observaciones base
      observaciones: [],

      // lista completa de observaciones (texto + fecha) que viene del back
      observacionesList,

      redireccion: item.redireccion || "",
      canal: item.canal || "",
      respuestaViaMail: item.respuestaViaMail || "",

      // 👇 NUEVO: solo mostramos el ComercialFinal (columna AP en Sheets)
      comercialFinal: item.ComercialFinal || "",

      // el resto de los campos de detalle del evento
      horarioInicioEvento: item.horarioInicioEvento || "",
      horarioFinalizacionEvento: item.horarioFinalizacionEvento || "",
      fechaEvento: item.fechaEvento || "",
      sector: item.sector || "",
      marcaTemporal: item.marcaTemporal || "",
      demora: item.demora || "",
      presupuesto: item.presupuesto || "",
      fechaPresupEnviado: item.fechaPresupEnviado || "",
      estado: item.estado || "N/A",
    }
  })
}
