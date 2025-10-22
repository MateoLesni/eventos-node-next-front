"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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
  UploadCloud,
} from "lucide-react"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://eventos-node-express-back.vercel.app"

type ObsItem = { texto: string; fecha: string }

interface ClienteDetailProps {
  cliente: Cliente
  onBack: () => void
}

// --- helper para normalizar cualquier cosa a ObsItem ---
function normalizeObservaciones(input: unknown): ObsItem[] {
  if (!Array.isArray(input)) return []
  return input
    .map((o: any) => {
      if (typeof o === "string") return { texto: o, fecha: "" }
      const texto = typeof o?.texto === "string" ? o.texto : (typeof o === "string" ? o : "")
      const fecha = typeof o?.fecha === "string" ? o.fecha : ""
      return { texto: String(texto ?? ""), fecha: String(fecha ?? "") }
    })
    .filter((o) => o.texto && typeof o.texto === "string")
}

export function ClienteDetail({ cliente, onBack }: ClienteDetailProps) {
  const router = useRouter()

  const [newObservacion, setNewObservacion] = useState("")
  const [obsSaving, setObsSaving] = useState(false)

  // 1) Tomamos observaciones del cliente y las normalizamos
  const initialObservaciones: ObsItem[] = useMemo(() => {
    const fromList = (cliente as any)?.observacionesList
    if (Array.isArray(fromList)) return normalizeObservaciones(fromList)

    // fallback por si existiera aún `cliente.observaciones`
    const legacy = (cliente as any)?.observaciones
    if (Array.isArray(legacy)) return normalizeObservaciones(legacy)

    return []
  }, [cliente])

  const [observaciones, setObservaciones] = useState<ObsItem[]>(initialObservaciones)

  useEffect(() => {
    setObservaciones(initialObservaciones)
  }, [initialObservaciones])

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

  const nowAR = () => {
    try {
      return new Intl.DateTimeFormat("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date())
    } catch {
      return new Date().toISOString()
    }
  }

  // Navegar al formulario de carga con el ID preseleccionado
  const goToCarga = () => {
    router.push(`/carga?id=${encodeURIComponent(cliente.id)}`)
  }

  // Guardar observación en Sheets (columna ObservacionN libre) + fecha en FechaObsN
  const handleAddObservacion = async () => {
    const texto = newObservacion.trim()
    if (!texto) return

    setObsSaving(true)
    const fecha = nowAR()

    // Optimista: insertar arriba
    setObservaciones((prev) => [{ texto, fecha }, ...prev])
    setNewObservacion("")

    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${cliente.id}/observaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      })

      if (!res.ok) {
        // revert si falla
        setObservaciones((prev) => prev.filter((o) => !(o.texto === texto && o.fecha === fecha)))
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson?.message || errJson?.error || "No se pudo guardar la observación")
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

        <div className="flex items-center gap-2">
          <Badge variant={getEstadoBadgeVariant(cliente.estado)} className="text-sm px-3 py-1">
            {cliente.estado}
          </Badge>

          {/* Botón NUEVO: Cargar datos */}
          <Button onClick={goToCarga} className="ml-2">
            <UploadCloud className="mr-2 size-4" />
            Cargar datos
          </Button>
        </div>
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
              <p className="text-sm font-medium mb-1">Mensaje del Cliente</p>
              <p className="text-sm text-muted-foreground">{cliente.observacion}</p>
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
            {observaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin observaciones</p>
            ) : (
              observaciones.map((o, i) => {
                const safeKey = `${i}-${(typeof o?.texto === "string" ? o.texto : "").slice(0, 10)}`
                return (
                  <div key={safeKey} className="border-l-2 border-primary pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">{o?.fecha || "—"}</p>
                      <Badge variant="outline" className="text-xs">Sistema</Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{o?.texto}</p>
                  </div>
                )
              })
            )}
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
