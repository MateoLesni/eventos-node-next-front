"use client"

import React, { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2 } from "lucide-react"

export const dynamic = "force-dynamic"

type SheetEvent = {
  id: string
  horarioInicioEvento: string
  horarioFinalizacionEvento: string
  sector: string
  vendedorComercialAsignado: string
  presupuesto: string
  estado?: string
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://eventos-node-express-back.vercel.app"

function CargaPageInner() {
  const search = useSearchParams()
  const idFromQuery = search.get("id") ?? ""

  const [submitted, setSubmitted] = useState(false)
  const [idCliente, setIdCliente] = useState(idFromQuery)
  const [formData, setFormData] = useState({
    horarioInicioEvento: "",
    horarioFinalizacionEvento: "",
    sector: "",
    vendedorComercialAsignado: "",
    presupuesto: "",
  })

  const [originalData, setOriginalData] = useState<SheetEvent | null>(null)
  const [loadingId, setLoadingId] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Estado (W) + rechazo UI
  const [estado, setEstado] = useState<string>("")
  const [estadoSaving, setEstadoSaving] = useState(false)
  const [showRechazoInput, setShowRechazoInput] = useState(false)
  const [rechazoMotivo, setRechazoMotivo] = useState("")
  const [rechazoSaving, setRechazoSaving] = useState(false)
  const [estadoPrevio, setEstadoPrevio] = useState<string>("")

  const locked = useMemo(() => {
    const o = originalData
    return {
      horarioInicioEvento: !!o?.horarioInicioEvento,
      horarioFinalizacionEvento: !!o?.horarioFinalizacionEvento,
      sector: !!o?.sector,
      vendedorComercialAsignado: !!o?.vendedorComercialAsignado,
      presupuesto: !!o?.presupuesto,
    }
  }, [originalData])

  useEffect(() => {
    if (idFromQuery) {
      setIdCliente(idFromQuery)
      void fetchById(idFromQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFromQuery])

  function onlyHHmm(s: string) {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s.trim())
    return m ? `${m[1]}:${m[2]}` : ""
  }

  async function fetchById(id: string) {
    const cleanId = (id || "").trim()
    if (!cleanId) return

    setLoadingId(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${encodeURIComponent(cleanId)}`)
      const json = await res.json()
      if (!res.ok || !json?.data) throw new Error(json?.message || "No se encontró el cliente")

      const ev = json.data as any
      const payload: SheetEvent = {
        id: ev.id ?? cleanId,
        horarioInicioEvento: ev.horarioInicioEvento || "",
        horarioFinalizacionEvento: ev.horarioFinalizacionEvento || "",
        sector: ev.sector || "",
        vendedorComercialAsignado: ev.vendedorComercialAsignado || "",
        presupuesto: ev.presupuesto || "",
        estado: ev.estado || "",
      }

      setOriginalData(payload)
      setFormData({
        horarioInicioEvento: payload.horarioInicioEvento,
        horarioFinalizacionEvento: payload.horarioFinalizacionEvento,
        sector: payload.sector,
        vendedorComercialAsignado: payload.vendedorComercialAsignado,
        presupuesto: payload.presupuesto,
      })
      setEstado(payload.estado || "")
      setEstadoPrevio(payload.estado || "")
      setShowRechazoInput(false)
      setRechazoMotivo("")
    } catch (e: any) {
      console.error(e)
      setOriginalData(null)
      setFormData({
        horarioInicioEvento: "",
        horarioFinalizacionEvento: "",
        sector: "",
        vendedorComercialAsignado: "",
        presupuesto: "",
      })
      setEstado("")
      setEstadoPrevio("")
      setErrorMsg(e?.message || "Error al buscar el cliente")
    } finally {
      setLoadingId(false)
    }
  }

  const onBlurId = () => {
    if (idCliente.trim()) void fetchById(idCliente)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: (name === "horarioInicioEvento" || name === "horarioFinalizacionEvento") ? value : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const cleanId = idCliente.trim()
    if (!cleanId) return setErrorMsg("Debes ingresar el ID Cliente")
    if (!originalData) return setErrorMsg("Primero busca un cliente válido por ID")

    const payload: Record<string, string> = {}
    if (!originalData.horarioInicioEvento && formData.horarioInicioEvento) {
      payload.horarioInicioEvento = onlyHHmm(formData.horarioInicioEvento)
    }
    if (!originalData.horarioFinalizacionEvento && formData.horarioFinalizacionEvento) {
      payload.horarioFinalizacionEvento = onlyHHmm(formData.horarioFinalizacionEvento)
    }
    if (!originalData.sector && formData.sector.trim()) {
      payload.sector = formData.sector.trim()
    }
    if (!originalData.vendedorComercialAsignado && formData.vendedorComercialAsignado.trim()) {
      payload.vendedorComercialAsignado = formData.vendedorComercialAsignado.trim()
    }
    if (!originalData.presupuesto && formData.presupuesto.trim()) {
      payload.presupuesto = formData.presupuesto.trim()
    }

    if (Object.keys(payload).length === 0) {
      setErrorMsg("No hay campos nuevos para agregar (todos ya tienen datos).")
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${encodeURIComponent(cleanId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || "No se pudo guardar")

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        void fetchById(cleanId)
      }, 1500)
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e?.message || "Error al guardar")
    }
  }

  // Estado: Aprobado / Rechazado
  const isFinal = ["APROBADO", "RECHAZADO"].includes((estado || "").toUpperCase())

  const clickAprobado = async () => {
    if (!idCliente.trim() || !originalData) return
    if (isFinal || showRechazoInput) return
    setEstadoSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${encodeURIComponent(idCliente.trim())}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "APROBADO" }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.message || "No se pudo actualizar el estado")
      setEstado("APROBADO")
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e?.message || "Error al actualizar estado")
    } finally {
      setEstadoSaving(false)
    }
  }

  const clickRechazado = () => {
    if (!idCliente.trim() || !originalData) {
      setErrorMsg("Primero buscá un cliente válido por ID")
      return
    }
    setEstadoPrevio(estado)
    setEstado("RECHAZADO")
    setShowRechazoInput(true)
  }

  const cancelarRechazo = () => {
    setShowRechazoInput(false)
    setRechazoMotivo("")
    setEstado(estadoPrevio)
  }

  const confirmarRechazo = async () => {
    const motivo = rechazoMotivo.trim()
    if (!motivo) {
      setErrorMsg("Debes ingresar el motivo del rechazo.")
      return
    }
    setRechazoSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${encodeURIComponent(idCliente.trim())}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "RECHAZADO", rechazoMotivo: motivo }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.message || "No se pudo actualizar el estado/motivo")
      setShowRechazoInput(false)
      setRechazoMotivo("")
      setEstado("RECHAZADO")
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e?.message || "Error al guardar rechazo")
      cancelarRechazo()
    } finally {
      setRechazoSaving(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center justify-center size-16 rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Datos Enviados</h2>
                <p className="text-muted-foreground">La información ha sido registrada correctamente.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center size-12 rounded-lg bg-primary text-primary-foreground">
                <FileText className="size-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Formulario de Carga</CardTitle>
                <CardDescription>
                  Ingresá el <strong>ID Cliente</strong>. Si existe, se completan los campos. Sólo podrás agregar en los campos vacíos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Estado + acciones */}
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant={(estado || "").toUpperCase() === "APROBADO" ? "default" : "outline"}
                disabled={estadoSaving || isFinal || showRechazoInput}
                onClick={clickAprobado}
              >
                Aprobado
              </Button>
              <Button
                variant={(estado || "").toUpperCase() === "RECHAZADO" ? "destructive" : "outline"}
                disabled={estadoSaving || isFinal}
                onClick={clickRechazado}
              >
                Rechazado
              </Button>
              <span className="text-sm text-muted-foreground ml-2">Estado actual: <strong>{estado || "—"}</strong></span>
            </div>

            {showRechazoInput && (
              <div className="mb-6 border rounded-md p-4">
                <Label htmlFor="motivo-rechazo" className="text-destructive">Motivo del Rechazo</Label>
                <Textarea
                  id="motivo-rechazo"
                  value={rechazoMotivo}
                  onChange={(e) => setRechazoMotivo(e.target.value)}
                  placeholder="Ej: Cliente canceló por presupuesto / fecha / etc."
                  rows={3}
                  className="resize-none mt-2"
                />
                <div className="flex gap-3 mt-3">
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
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="idCliente">ID Cliente</Label>
                <Input
                  id="idCliente"
                  name="idCliente"
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  onBlur={onBlurId}
                  placeholder="Ej: 1"
                  required
                />
                {loadingId && <p className="text-xs text-muted-foreground">Buscando cliente...</p>}
                {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="horarioInicioEvento">Horario Inicio Evento</Label>
                  <Input
                    id="horarioInicioEvento"
                    name="horarioInicioEvento"
                    type="time"
                    value={formData.horarioInicioEvento || ""}
                    onChange={handleChange}
                    disabled={locked.horarioInicioEvento}
                  />
                  {locked.horarioInicioEvento && <p className="text-xs text-muted-foreground">Este dato ya existe y no puede editarse.</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horarioFinalizacionEvento">Horario Finalización Evento</Label>
                  <Input
                    id="horarioFinalizacionEvento"
                    name="horarioFinalizacionEvento"
                    type="time"
                    value={formData.horarioFinalizacionEvento || ""}
                    onChange={handleChange}
                    disabled={locked.horarioFinalizacionEvento}
                  />
                  {locked.horarioFinalizacionEvento && <p className="text-xs text-muted-foreground">Este dato ya existe y no puede editarse.</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  placeholder="Ej: Corporativo, Social, Cultural"
                  disabled={locked.sector}
                />
                {locked.sector && <p className="text-xs text-muted-foreground">Este dato ya existe y no puede editarse.</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendedorComercialAsignado">Comercial Asignado</Label>
                <Input
                  id="vendedorComercialAsignado"
                  name="vendedorComercialAsignado"
                  value={formData.vendedorComercialAsignado}
                  onChange={handleChange}
                  placeholder="Nombre del comercial"
                  disabled={locked.vendedorComercialAsignado}
                />
                {locked.vendedorComercialAsignado && <p className="text-xs text-muted-foreground">Este dato ya existe y no puede editarse.</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="presupuesto">Presupuesto</Label>
                <Input
                  id="presupuesto"
                  name="presupuesto"
                  value={formData.presupuesto}
                  onChange={handleChange}
                  placeholder="Monto / referencia"
                  disabled={locked.presupuesto}
                />
                {locked.presupuesto && <p className="text-xs text-muted-foreground">Este dato ya existe y no puede editarse.</p>}
              </div>

              <Button type="submit" className="w-full" size="lg">
                Guardar
              </Button>

              <p className="text-xs text-muted-foreground mt-2">
                Al guardar: si cargás horarios, se registra la <strong>marca temporal</strong> (columna S).
                Si cargás presupuesto, se registra la <strong>fecha de envío del presupuesto</strong> (columna V).
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CargaPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando formulario…</div>}>
      <CargaPageInner />
    </Suspense>
  )
}
