"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2 } from "lucide-react"

type SheetEvent = {
  id: string
  horarioInicioEvento: string
  horarioFinalizacionEvento: string
  sector: string
  vendedorComercialAsignado: string
  presupuesto: string
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://eventos-node-express-back.vercel.app"

export default function CargaPage() {
  const search = useSearchParams()
  const idFromQuery = search.get("id") ?? ""

  // --- estado del formulario ---
  const [submitted, setSubmitted] = useState(false)
  const [idCliente, setIdCliente] = useState(idFromQuery)
  const [formData, setFormData] = useState({
    horarioInicioEvento: "",
    horarioFinalizacionEvento: "",
    sector: "",
    vendedorComercialAsignado: "",
    presupuesto: "",
  })

  // Guarda lo que vino originalmente del sheet para poder bloquear
  const [originalData, setOriginalData] = useState<SheetEvent | null>(null)
  const [loadingId, setLoadingId] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // qué campos están bloqueados (porque ya tenían dato en el sheet)
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

  // Si viene el id por query param, intento cargar
  useEffect(() => {
    if (idFromQuery) {
      setIdCliente(idFromQuery)
      void fetchById(idFromQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFromQuery])

  // --- helpers ---
  function onlyHHmm(s: string) {
    // Acepta "16:30" y normaliza, para evitar valores raros.
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

      if (!res.ok || !json?.data) {
        throw new Error(json?.message || "No se encontró el cliente")
      }

      const ev = json.data as any
      const payload: SheetEvent = {
        id: ev.id ?? cleanId,
        horarioInicioEvento: ev.horarioInicioEvento || "",
        horarioFinalizacionEvento: ev.horarioFinalizacionEvento || "",
        sector: ev.sector || "",
        vendedorComercialAsignado: ev.vendedorComercialAsignado || "",
        presupuesto: ev.presupuesto || "",
      }

      setOriginalData(payload)
      setFormData({
        horarioInicioEvento: payload.horarioInicioEvento,
        horarioFinalizacionEvento: payload.horarioFinalizacionEvento,
        sector: payload.sector,
        vendedorComercialAsignado: payload.vendedorComercialAsignado,
        presupuesto: payload.presupuesto,
      })
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
      setErrorMsg(e?.message || "Error al buscar el cliente")
    } finally {
      setLoadingId(false)
    }
  }

  // Cuando salís del input de ID, intenta cargar
  const onBlurId = () => {
    if (idCliente.trim()) {
      void fetchById(idCliente)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "horarioInicioEvento" || name === "horarioFinalizacionEvento"
          ? value // el <input type="time" /> ya da HH:mm
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const cleanId = idCliente.trim()
    if (!cleanId) {
      setErrorMsg("Debes ingresar el ID Cliente")
      return
    }

    if (!originalData) {
      setErrorMsg("Primero busca un cliente válido por ID")
      return
    }

    // Construimos el payload SOLO con los campos que estaban vacíos y que ahora tienen valor
    const payload: Record<string, string> = {}

    // Horario Inicio
    if (!originalData.horarioInicioEvento && formData.horarioInicioEvento) {
      payload.horarioInicioEvento = onlyHHmm(formData.horarioInicioEvento)
    }

    // Horario Finalización
    if (!originalData.horarioFinalizacionEvento && formData.horarioFinalizacionEvento) {
      payload.horarioFinalizacionEvento = onlyHHmm(formData.horarioFinalizacionEvento)
    }

    // Sector
    if (!originalData.sector && formData.sector.trim()) {
      payload.sector = formData.sector.trim()
    }

    // Comercial Asignado
    if (!originalData.vendedorComercialAsignado && formData.vendedorComercialAsignado.trim()) {
      payload.vendedorComercialAsignado = formData.vendedorComercialAsignado.trim()
    }

    // Presupuesto
    if (!originalData.presupuesto && formData.presupuesto.trim()) {
      payload.presupuesto = formData.presupuesto.trim()
    }

    if (Object.keys(payload).length === 0) {
      setErrorMsg("No hay campos nuevos para agregar (todos ya tienen datos).")
      return
    }

    // IMPORTANTe: el backend debe poner los timestamps:
    // - Si se envía horarioInicioEvento o horarioFinalizacionEvento => setear "marcaTemporal" (col S)
    // - Si se envía "presupuesto" => setear "fechaPresupEnviado" (col V)
    // Si todavía no lo hace, avisame y te paso el cambio en el service.

    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${encodeURIComponent(cleanId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.message || "No se pudo guardar")
      }

      setSubmitted(true)

      // reset “visual” después del OK (y recargar desde sheet por si querés)
      setTimeout(() => {
        setSubmitted(false)
        // Volvemos a leer para dejar todo bloqueado
        void fetchById(cleanId)
      }, 2000)
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e?.message || "Error al guardar")
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
                <p className="text-muted-foreground">
                  La información ha sido registrada correctamente en el sistema.
                </p>
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
                  Ingresá el <strong>ID Cliente</strong>. Si el cliente existe, se completan los campos.
                  Sólo podrás agregar datos en los campos vacíos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID Cliente */}
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
                {loadingId && (
                  <p className="text-xs text-muted-foreground">Buscando cliente...</p>
                )}
                {errorMsg && (
                  <p className="text-xs text-red-600">{errorMsg}</p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Horario Inicio Evento (col N) */}
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
                  {locked.horarioInicioEvento && (
                    <p className="text-xs text-muted-foreground">Este dato ya existe y no puede editarse.</p>
                  )}
                </div>

                {/* Horario Finalización Evento (col O) */}
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
                  {locked.horarioFinalizacionEvento && (
                    <p className="text-xs text-muted-foreground">Este dato ya existe y no puede editarse.</p>
                  )}
                </div>
              </div>

              {/* Sector (col Q) */}
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
                {locked.sector && (
                  <p className="text-xs text-muted-foreground">Este dato ya existe y no puede editarse.</p>
                )}
              </div>

              {/* Comercial Asignado (col R) */}
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
                {locked.vendedorComercialAsignado && (
                  <p className="text-xs text-muted-foreground">Este dato ya existe y no puede editarse.</p>
                )}
              </div>

              {/* Presupuesto (col U) */}
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
                {locked.presupuesto && (
                  <p className="text-xs text-muted-foreground">Este dato ya existe y no puede editarse.</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg">
                Guardar
              </Button>

              <p className="text-xs text-muted-foreground mt-2">
                Al guardar: si cargás horarios, el sistema registra automáticamente la
                <strong> marca temporal</strong> (columna S). Si cargás presupuesto, registra la
                <strong> fecha de envío del presupuesto</strong> (columna V).
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
