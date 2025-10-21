"use client"

import { useState } from "react"
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
  const [observaciones, setObservaciones] = useState(cliente.observaciones)

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

  const handleAddObservacion = () => {
    if (newObservacion.trim()) {
      const nuevaObs = {
        id: `obs-${Date.now()}`,
        fecha: new Date().toLocaleString("es-ES"),
        texto: newObservacion,
        autor: "Usuario Actual",
      }
      setObservaciones([...observaciones, nuevaObs])
      setNewObservacion("")
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
          <div className="space-y-3">
            {observaciones.map((obs) => (
              <div key={obs.id} className="border-l-2 border-primary pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">{obs.fecha}</p>
                  <Badge variant="outline" className="text-xs">
                    {obs.autor}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed">{obs.texto}</p>
              </div>
            ))}
          </div>

          <Separator />

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
            <Button onClick={handleAddObservacion} className="w-full" disabled={!newObservacion.trim()}>
              <Plus className="size-4 mr-2" />
              Añadir Observación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
