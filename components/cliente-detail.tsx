"use client"

import { useEffect, useState } from "react"
import type { Cliente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  Users,
  Building2,
  DollarSign,
  User,
  Plus,
  MessageSquare,
} from "lucide-react"

interface ClienteDetailProps {
  cliente: Cliente
  onBack: () => void
}

export function ClienteDetail({ cliente, onBack }: ClienteDetailProps) {
  const [newObservacion, setNewObservacion] = useState("")
  // Observaciones ahora vienen del backend como string[]
  const [observaciones, setObservaciones] = useState<string[]>([])
  const [obsLoading, setObsLoading] = useState(false)
  const [obsSaving, setObsSaving] = useState(false)

  // Cargar observaciones del backend (más reciente arriba)
  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        setObsLoading(true)
        const res = await fetch(`/api/eventSheet/${cliente.id}/observaciones`)
        const json = await res.json()
        if (!abort && res.ok) {
          setObservaciones(Array.isArray(json.data) ? json.data : [])
        } else if (!abort) {
          setObservaciones([])
        }
      } catch (e) {
        console.error("Error cargando observaciones:", e)
        if (!abort) setObservaciones([])
      } finally {
        if (!abort) setObsLoading(false)
      }
    }
    if (cliente?.id) load()
    return () => {
      abort = true
    }
  }, [cliente?.id])

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

  // Guardar observación en Sheets (columna ObservacionN libre)
  const handleAddObservacion = async () => {
    const texto = newObservacion.trim()
    if (!texto) return

    setObsSaving(true)

    // Actualización optimista: insertar arriba
    setObservaciones((prev) => [texto, ...prev])
    setNewObservacion("")

    try {
      const res = await fetch(`/api/eventSheet/${cliente.id}/observaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      })

      if (!res.ok) {
        // Revertir si falla
        setObservaciones((prev) => prev.filter((t) => t !== texto))
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson?.error || "No se pudo guardar la observación")
      }

      // Refetch para asegurar consistencia con el backend
      const ref = await fetch(`/api/eventSheet/${cliente.id}/observaciones`)
      const j = await ref.json()
      if (ref.ok && Array.isArray(j.data)) {
        setObservaciones(j.data)
      }
    } catch (e: any) {
      console.error(e)
      alert(e?.message || "Error al guardar observación")
    } finally {
      setObsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{cliente.nombre}</h1>
            <p className="text-sm text-muted-foreground">ID: {cliente.id}</p>
          </div>
        </div>
        <Badge variant={getEstadoBadgeVariant(cliente.estado)} className="text-sm px-3 py-1">
          {cliente.estado}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Teléfono</p>
                <p className="text-sm text-muted-foreground">{cliente.telefono}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{cliente.mail}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Lugar</p>
                <p className="text-sm text-muted-foreground">{cliente.lugar}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalles del Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fecha del Evento</p>
                <p className="text-sm text-muted-foreground">{cliente.fechaEvento}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Horario</p>
                <p className="text-sm text-muted-foreground">
                  {cliente.horarioInicioEvento} - {cliente.horarioFinalizacionEvento}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Cantidad de Personas</p>
                <p className="text-sm text-muted-foreground">{cliente.cantidadPersonas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Comercial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Vendedor Asignado</p>
                <p className="text-sm text-muted-foreground">{cliente.vendedorComercialAsignado}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Asignación Comercial</p>
                <p className="text-sm text-muted-foreground">{cliente.asignacionComercial}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Sector</p>
                <p className="text-sm text-muted-foreground">{cliente.sector}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Presupuesto y Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Presupuesto</p>
                <p className="text-sm text-muted-foreground">{cliente.presupuesto}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fecha Presupuesto Enviado</p>
                <p className="text-sm text-muted-foreground">{cliente.fechaPresupEnviado}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Demora</p>
                <p className="text-sm text-muted-foreground">{cliente.demora}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium mb-1">Canal</p>
              <p className="text-sm text-muted-foreground">{cliente.canal}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Redirección</p>
              <p className="text-sm text-muted-foreground">{cliente.redireccion}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Respuesta vía Mail</p>
              <p className="text-sm text-muted-foreground">{cliente.respuestaViaMail}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Marca Temporal</p>
              <p className="text-sm text-muted-foreground">{cliente.marcaTemporal}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">ID Fecha Cliente</p>
              <p className="text-sm text-muted-foreground">{cliente.idFechaCliente}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Hora Cliente</p>
              <p className="text-sm text-muted-foreground">{cliente.horaCliente}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-muted-foreground" />
            <CardTitle className="text-lg">Observaciones</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de observaciones desde el backend */}
          <div className="space-y-3">
            {obsLoading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : observaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin observaciones</p>
            ) : (
              observaciones.map((texto, i) => (
                <div key={`${i}-${texto.slice(0, 10)}`} className="border-l-2 border-primary pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    {/* Por ahora no hay fecha/autor: mostramos placeholders */}
                    <p className="text-xs text-muted-foreground">—</p>
                    <Badge variant="outline" className="text-xs">
                      Sistema
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed">{texto}</p>
                </div>
              ))
            )}
          </div>

          <Separator />

          {/* Form para añadir nueva observación */}
          <div className="space-y-3">
            <Label htmlFor="nueva-observacion">Añadir Nueva Observación</Label>
            <Textarea
              id="nueva-observacion"
              value={newObservacion}
              onChange={(e) => setNewObservacion(e.target.value)}
              placeholder="Escriba su observación aquí..."
              rows={3}
              className="resize-none"
            />
            <Button onClick={handleAddObservacion} className="w-full" disabled={!newObservacion.trim() || obsSaving}>
              <Plus className="size-4 mr-2" />
              {obsSaving ? "Guardando..." : "Añadir Observación"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
