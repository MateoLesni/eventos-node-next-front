"use client"

import { useState, useEffect } from "react"
import type { Cliente, Observacion } from "@/lib/types"
/* import { clientesData } from "@/lib/data" */
import { ClientesTable } from "@/components/clientes-table"
import { ClienteDetail } from "@/components/cliente-detail"
import { Users } from "lucide-react"

export default function Home() {
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [clientesData, setClientesData] = useState<Cliente[]>([])
  
  useEffect(()=>{
    async function fetchClientes() {
      try {
        const response = await fetch('https://eventos-node-express-back.vercel.app/api/eventSheet');
        const data = await response.json();
        const eventSheetMapped = mapClientes(data.data)
        console.log(eventSheetMapped, 'google sheet data')
        setClientesData(eventSheetMapped);
      } catch (error) {
        console.error('Error fetching clientes:', error);
      }
    }
    fetchClientes();
  },[])

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
                <p className="text-muted-foreground">Haz doble clic en un cliente para ver los detalles completos</p>
              </div>
            </div>
            <ClientesTable clientes={clientesData} onClienteSelect={setSelectedCliente} />
          </div>
        ) : (
          <ClienteDetail cliente={selectedCliente} onBack={() => setSelectedCliente(null)} />
        )}
      </div>
    </main>
  )
}

function mapClientes(data: any[]): Cliente[] {
  return data.map((item) => {
    const observacion: Observacion = {
      id: item.id,
      fecha: item.fechaCliente || '',
      texto: item.observacion || '',
      autor: item.vendedorComercialAsignado || 'Sistema',
    }

    return {
      id: item.id,
      idFechaCliente: item.fechaCliente || '',
      horaCliente: item.horaCliente || '',
      nombre: item.nombre || '',
      telefono: item.telefono || '',
      mail: item.mail || '',
      lugar: item.lugar || '',
      cantidadPersonas: Number(item.cantidadPersonas) || 0,
      observacion: item.observacion || '',
      observaciones: [observacion], // se crea un array con 1 observación base
      redireccion: item.redireccion || '',
      canal: item.canal || '',
      respuestaViaMail: item.respuestaViaMail || '',
      asignacionComercial: item.asignacionComercialMail || '',
      horarioInicioEvento: item.horarioInicioEvento || '',
      horarioFinalizacionEvento: item.horarioFinalizacionEvento || '',
      fechaEvento: item.fechaEvento || '',
      sector: item.sector || '',
      vendedorComercialAsignado: item.vendedorComercialAsignado || '',
      marcaTemporal: item.marcaTemporal || '',
      demora: item.demora || '',
      presupuesto: item.presupuesto || '',
      fechaPresupEnviado: item.fechaPresupEnviado || '',
      // se traduce el estado original
      estado: item.estado || 'N/A',
    }
  })
}