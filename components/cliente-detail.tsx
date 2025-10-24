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

type ObsItem = { texto: string; fecha: string; tipo?: "rechazo" | "normal" }

interface ClienteDetailProps {
  cliente: Cliente
  onBack: () => void
}

function normalizeObservaciones(input: unknown): ObsItem[] {
  if (!Array.isArray(input)) return []
  return input
    .map((o: any) => {
      if (typeof o === "string") return { texto: o, fecha: "", tipo: "normal" }
      const texto = typeof o?.texto === "string" ? o.texto : (typeof o === "string" ? o : "")
      const fecha = typeof o?.fecha === "string" ? o.fecha : ""
      return { texto: String(texto ?? ""), fecha: String(fecha ?? ""), tipo: "normal" }
    })
    .filter((o) => o.texto && typeof o.texto === "string")
}

export function ClienteDetail({ cliente, onBack }: ClienteDetailProps) {
  const router = useRouter()

  const [newObservacion, setNewObservacion] = useState("")
  const [obsSaving, setObsSaving] = useState(false)

  // estado local para “Estado” (col W)
  const [estado, setEstado] = useState<string>(cliente.estado || "")
  const [estadoSaving, setEstadoSaving] = useState(false)

  // UI para rechazo
  const [showRechazoInput, setShowRechazoInput] = useState(false)
  const [rechazoMotivo, setRechazoMotivo] = useState("")
  const [rechazoSaving, setRechazoSaving] = useState(false)
  const [estadoPrevio, setEstadoPrevio] = useState<string>(estado)

  const initialObservaciones: ObsItem[] = useMemo(() => {
    const fromList = (cliente as any)?.observacionesList
    if (Array.isArray(fromList)) return normalizeObservaciones(fromList)
    const legacy = (cliente as any)?.observaciones
    if (Array.isArray(legacy)) return normalizeObservaciones(legacy)
    return []
  }, [cliente])

  const [observaciones, setObservaciones] = useState<ObsItem[]>(initialObservaciones)
  useEffect(() => { setObservaciones(initialObservaciones) }, [initialObservaciones])

  const getEstadoBadgeVariant = (value: string) => {
    const e = (value || "").toUpperCase()
    if (e === "APROBADO") return "default"
    if (e === "RECHAZADO") return "destructive"
    if (e === "ASIGNADO" || e === "PENDIENTE") return "secondary"
    return "outline"
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

  const goToCarga = () => {
    router.push(`/carga?id=${encodeURIComponent(cliente.id)}`)
  }

  // Observación normal
  const handleAddObservacion = async () => {
    const texto = newObservacion.trim()
    if (!texto) return
    setObsSaving(true)
    const fecha = nowAR()
    setObservaciones((prev) => [{ texto, fecha, tipo: "normal" }, ...prev])
    setNewObservacion("")
    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${cliente.id}/observaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      })
      if (!res.ok) {
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

  // --- APROBADO / RECHAZADO ---
  const isFinal = ["APROBADO", "RECHAZADO"].includes((estado || "").toUpperCase())

  const setEstadoSheet = async (nuevo: "APROBADO" | "RECHAZADO") => {
    if (!cliente?.id) return
    if (nuevo === "RECHAZADO") {
      // abrir input de motivo; no confirmamos aún
      setEstadoPrevio(estado)
      setEstado("RECHAZADO")
      setShowRechazoInput(true)
      return
    }
    if (isFinal) return
    setEstadoSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${encodeURIComponent(cliente.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "APROBADO" }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.message || "No se pudo actualizar el estado")
      setEstado("APROBADO")
    } catch (e: any) {
      console.error(e)
      alert(e?.message || "Error al actualizar estado")
    } finally {
      setEstadoSaving(false)
    }
  }

  const cancelarRechazo = () => {
    setShowRechazoInput(false)
    setRechazoMotivo("")
    setEstado(estadoPrevio) // vuelve al estado anterior
  }

  const confirmarRechazo = async () => {
    const motivo = rechazoMotivo.trim()
    if (!motivo) {
      alert("Debes escribir el motivo del rechazo.")
      return
    }
    setRechazoSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${encodeURIComponent(cliente.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "RECHAZADO", rechazoMotivo: motivo }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.message || "No se pudo actualizar el estado/motivo")
      // añadir observación “roja” al tope
      setObservaciones((prev) => [
        { texto: `Motivo de rechazo: ${motivo}`, fecha: nowAR(), tipo: "rechazo" },
        ...prev,
      ])
      setShowRechazoInput(false)
      setRechazoMotivo("")
      setEstado("RECHAZADO")
    } catch (e: any) {
      console.error(e)
      alert(e?.message || "Error al guardar rechazo")
      // rollback visual
      cancelarRechazo()
    } finally {
      setRechazoSaving(false)
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
          <Button
            variant={(estado || "").toUpperCase() === "APROBADO" ? "default" : "outline"}
            disabled={estadoSaving || isFinal || showRechazoInput}
            onClick={() => setEstadoSheet("APROBADO")}
          >
            Aprobado
          </Button>
          <Button
            variant={(estado || "").toUpperCase() === "RECHAZADO" ? "destructive" : "outline"}
            disabled={estadoSaving || isFinal}
            onClick={() => setEstadoSheet("RECHAZADO")}
          >
            Rechazado
          </Button>

          <Badge variant={getEstadoBadgeVariant(estado)} className="text-sm px-3 py-1">
            {estado || "—"}
          </Badge>

          <Button onClick={goToCarga} className="ml-2">
            <UploadCloud className="mr-2 size-4" />
            Cargar datos
          </Button>
        </div>
      </div>

      {/* input de motivo de rechazo */}
      {showRechazoInput && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Motivo del Rechazo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="motivo-rechazo">Describe brevemente el motivo</Label>
            <Textarea
              id="motivo-rechazo"
              value={rechazoMotivo}
              onChange={(e) => setRechazoMotivo(e.target.value)}
              placeholder="Ej: Cliente canceló por presupuesto / fecha / etc."
              rows={3}
              className="resize-none"
            />
            <div className="flex gap-3">
              <Button
                onClick={confirmarRechazo}
                disabled={!rechazoMotivo.trim() || rechazoSaving}
                variant="destructive"
              >
                {rechazoSaving ? "Guardando..." : "Confirmar rechazo"}
              </Button>
              <Button variant="outline" onClick={cancelarRechazo} disabled={rechazoSaving}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Información de Contacto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Teléfono</p><p className="text-sm text-muted-foreground">{cliente.telefono}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Email</p><p className="text-sm text-muted-foreground">{cliente.mail}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Lugar</p><p className="text-sm text-muted-foreground">{cliente.lugar}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Detalles del Evento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Fecha del Evento</p><p className="text-sm text-muted-foreground">{cliente.fechaEvento}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Horario</p><p className="text-sm text-muted-foreground">{cliente.horarioInicioEvento} - {cliente.horarioFinalizacionEvento}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Cantidad de Personas</p><p className="text-sm text-muted-foreground">{cliente.cantidadPersonas}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Información Comercial</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Vendedor Asignado</p><p className="text-sm text-muted-foreground">{cliente.vendedorComercialAsignado}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Asignación Comercial</p><p className="text-sm text-muted-foreground">{cliente.asignacionComercial}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Sector</p><p className="text-sm text-muted-foreground">{cliente.sector}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Presupuesto y Estado</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Presupuesto</p><p className="text-sm text-muted-foreground">{cliente.presupuesto}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Fecha Presupuesto Enviado</p><p className="text-sm text-muted-foreground">{cliente.fechaPresupEnviado}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="size-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-sm font-medium">Demora</p><p className="text-sm text-muted-foreground">{cliente.demora}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Información Adicional</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><p className="text-sm font-medium mb-1">Canal</p><p className="text-sm text-muted-foreground">{cliente.canal}</p></div>
            <div><p className="text-sm font-medium mb-1">Mensaje del Cliente</p><p className="text-sm text-muted-foreground">{cliente.observacion}</p></div>
            <div><p className="text-sm font-medium mb-1">Respuesta vía Mail</p><p className="text-sm text-muted-foreground">{cliente.respuestaViaMail}</p></div>
            <div><p className="text-sm font-medium mb-1">Marca Temporal</p><p className="text-sm text-muted-foreground">{cliente.marcaTemporal}</p></div>
            <div><p className="text-sm font-medium mb-1">ID Fecha Cliente</p><p className="text-sm text-muted-foreground">{cliente.idFechaCliente}</p></div>
            <div><p className="text-sm font-medium mb-1">Hora Cliente</p><p className="text-sm text-muted-foreground">{cliente.horaCliente}</p></div>
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
                const danger = o.tipo === "rechazo"
                return (
                  <div
                    key={safeKey}
                    className={`pl-4 py-2 border-l-2 ${danger ? "border-destructive/70 bg-destructive/5 rounded-sm" : "border-primary"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-xs ${danger ? "text-destructive" : "text-muted-foreground"}`}>
                        {o?.fecha || "—"}
                      </p>
                      <Badge variant={danger ? "destructive" : "outline"} className="text-xs">
                        {danger ? "Rechazo" : "Sistema"}
                      </Badge>
                    </div>
                    <p className={`text-sm leading-relaxed ${danger ? "text-destructive" : ""}`}>{o?.texto}</p>
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
