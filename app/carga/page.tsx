"use client"

import React, { Suspense, useEffect, useState } from "react"
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
  // CLIENTE
  nombre: string
  telefono: string
  mail: string
  lugar: string
  cantidadPersonas: string
  observacion: string
  canal: string
  // EVENTO
  fechaEvento: string            // Columna P
  horarioInicioEvento: string
  horarioFinalizacionEvento: string
  sector: string
  vendedorComercialAsignado: string
  presupuesto: string
  // meta
  estado?: string                // no se muestra, pero lo usamos para enviar cambios
}

type HistItem = { campo: string; antes: string; despues: string; fechaISO: string }

const API_BASE =
  //process.env.NEXT_PUBLIC_API_BASE_URL || "https://eventos-node-express-back.vercel.app"
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
function CargaPageInner() {
  const search = useSearchParams()
  const idFromQuery = search.get("id") ?? ""

  const [submitted, setSubmitted] = useState(false)
  const [idCliente, setIdCliente] = useState(idFromQuery)

  const [formData, setFormData] = useState<Omit<SheetEvent, "id">>({
    // CLIENTE
    nombre: "",
    telefono: "",
    mail: "",
    lugar: "",
    cantidadPersonas: "",
    observacion: "",
    canal: "",
    // EVENTO
    fechaEvento: "",
    horarioInicioEvento: "",
    horarioFinalizacionEvento: "",
    sector: "",
    vendedorComercialAsignado: "",
    presupuesto: "",
    // meta
    estado: "",
  })

  const [originalData, setOriginalData] = useState<SheetEvent | null>(null)
  const [loadingId, setLoadingId] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // utils
  const cleanStr = (v: any) => String(v ?? "").trim()
  function onlyHHmm(s: string) {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(s).trim())
    return m ? `${m[1]}:${m[2]}` : ""
  }

  // fetch by id
  useEffect(() => {
    if (idFromQuery) {
      setIdCliente(idFromQuery)
      void fetchById(idFromQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFromQuery])

  async function fetchById(id: string) {
    const cleanId = cleanStr(id)
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
        // CLIENTE
        nombre: ev.nombre || "",
        telefono: ev.telefono || "",
        mail: ev.mail || "",
        lugar: ev.lugar || "",
        cantidadPersonas: ev.cantidadPersonas || "",
        observacion: ev.observacion || "",
        canal: ev.canal || "",
        // EVENTO
        fechaEvento: ev.fechaEvento || "",
        horarioInicioEvento: ev.horarioInicioEvento || "",
        horarioFinalizacionEvento: ev.horarioFinalizacionEvento || "",
        sector: ev.sector || "",
        vendedorComercialAsignado: ev.vendedorComercialAsignado || "",
        presupuesto: ev.presupuesto || "",
        estado: ev.estado || "",
      }

      setOriginalData(payload)
      setFormData({
        nombre: payload.nombre,
        telefono: payload.telefono,
        mail: payload.mail,
        lugar: payload.lugar,
        cantidadPersonas: payload.cantidadPersonas,
        observacion: payload.observacion,
        canal: payload.canal,
        fechaEvento: payload.fechaEvento,
        horarioInicioEvento: payload.horarioInicioEvento,
        horarioFinalizacionEvento: payload.horarioFinalizacionEvento,
        sector: payload.sector,
        vendedorComercialAsignado: payload.vendedorComercialAsignado,
        presupuesto: payload.presupuesto,
        estado: payload.estado || "",
      })
    } catch (e: any) {
      console.error(e)
      setOriginalData(null)
      setErrorMsg(e?.message || "Error al buscar el cliente")
    } finally {
      setLoadingId(false)
    }
  }

  const onBlurId = () => {
    const id = cleanStr(idCliente)
    if (id && id !== "0") void fetchById(id)
  }

  // handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function buildHistorialCambios(o: SheetEvent | null, n: Omit<SheetEvent, "id">): HistItem[] {
    if (!o) return []
    const campos: (keyof Omit<SheetEvent, "id">)[] = [
      // cliente
      "nombre","telefono","mail","lugar","cantidadPersonas","observacion","canal",
      // evento
      "fechaEvento","horarioInicioEvento","horarioFinalizacionEvento","sector",
      "vendedorComercialAsignado","presupuesto",
      // meta
      "estado",
    ]
    const now = new Date().toISOString()
    const hist: HistItem[] = []
    for (const c of campos) {
      const antes = cleanStr((o as any)[c])
      const despues =
        c === "horarioInicioEvento" || c === "horarioFinalizacionEvento"
          ? onlyHHmm((n as any)[c])
          : cleanStr((n as any)[c])
      if (antes !== despues) hist.push({ campo: String(c), antes, despues, fechaISO: now })
    }
    return hist
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const id = cleanStr(idCliente)
    const esCreacion = !id || id === "0"

    const baseNormalized: Omit<SheetEvent, "id"> = {
      ...formData,
      horarioInicioEvento: onlyHHmm(formData.horarioInicioEvento),
      horarioFinalizacionEvento: onlyHHmm(formData.horarioFinalizacionEvento),
    }

    if (esCreacion) {
      // no escribir ID; tu script lo genera en A
      if (!cleanStr(formData.nombre)) {
        setErrorMsg("Para crear un cliente nuevo, completá el Nombre.")
        return
      }
      // Si viene presupuesto en creación, forzar estado "PRESUPUESTO EN REVISIÓN"
      const payloadCreate: any = { ...baseNormalized }
      if (cleanStr(baseNormalized.presupuesto)) {
        payloadCreate.estado = "PRESUPUESTO EN REVISIÓN"
      }
      try {
        const res = await fetch(`${API_BASE}/api/eventSheet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadCreate),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.message || "No se pudo crear el registro")

        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          // reset para una nueva carga
          setIdCliente("")
          setOriginalData(null)
          setFormData({
            nombre: "", telefono: "", mail: "", lugar: "", cantidadPersonas: "",
            observacion: "", canal: "", fechaEvento: "", horarioInicioEvento: "",
            horarioFinalizacionEvento: "", sector: "", vendedorComercialAsignado: "",
            presupuesto: "", estado: "",
          })
        }, 1200)
      } catch (e: any) {
        console.error(e)
        setErrorMsg(e?.message || "Error al crear el registro")
      }
      return
    }

    // EDICIÓN
    if (!originalData) {
      setErrorMsg("Buscá primero un cliente válido por ID para editar.")
      return
    }

    // Detectar cambios y forzar estado si cambió 'presupuesto'
    const changed: Record<string, string> = {}
    ;(Object.keys(baseNormalized) as (keyof typeof baseNormalized)[]).forEach((k) => {
      const oldVal = cleanStr((originalData as any)[k] ?? "")
      const newVal =
        k === "horarioInicioEvento" || k === "horarioFinalizacionEvento"
          ? onlyHHmm((baseNormalized as any)[k])
          : cleanStr((baseNormalized as any)[k])
      if (oldVal !== newVal) changed[k as string] = newVal
    })

    const presupuestoCambio =
      "presupuesto" in changed ||
      (!cleanStr(originalData.presupuesto) && cleanStr(baseNormalized.presupuesto))

    if (presupuestoCambio) {
      changed["estado"] = "PRESUPUESTO EN REVISIÓN"
    }

    if (Object.keys(changed).length === 0) {
      setErrorMsg("No hay cambios para guardar.")
      return
    }

    // Historial con el posible cambio de estado incluido
    const hist = buildHistorialCambios(
      originalData,
      { ...baseNormalized, ...(changed.estado ? { estado: changed.estado } : {}) }
    )

    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...changed,
          __historialCambios: hist,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || "No se pudo guardar")

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        void fetchById(id)
      }, 1200)
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e?.message || "Error al guardar")
    }
  }

  // UI
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
                  La información ha sido registrada correctamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const esCreacion = !cleanStr(idCliente) || cleanStr(idCliente) === "0"

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
                  Ingresá el <strong>ID Cliente</strong> para editar. Si lo dejás vacío o ponés{" "}
                  <strong>0</strong>, se creará un nuevo registro y la columna <strong>A (ID)</strong>{" "}
                  quedará vacía (tu script la completa). Cuando cargues o edites{" "}
                  <strong>Presupuesto</strong>, el estado pasará a{" "}
                  <em>Presupuesto en Revisión</em>.
                </CardDescription>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {esCreacion ? (
                <span className="inline-block rounded px-2 py-1 border">Modo creación</span>
              ) : (
                <span className="inline-block rounded px-2 py-1 border">Modo edición</span>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ID */}
              <div className="space-y-2">
                <Label htmlFor="idCliente">ID Cliente</Label>
                <Input
                  id="idCliente"
                  name="idCliente"
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  onBlur={onBlurId}
                  placeholder="Vacío o 0 para crear"
                />
                {loadingId && <p className="text-xs text-muted-foreground">Buscando cliente...</p>}
                {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
              </div>

              {/* DATOS DEL CLIENTE */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Datos del Cliente</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Elena Gómez"
                      required={esCreacion}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej: 11 5555 5555"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mail">Mail</Label>
                    <Input
                      id="mail"
                      name="mail"
                      type="email"
                      value={formData.mail}
                      onChange={handleChange}
                      placeholder="cliente@mail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="canal">Canal</Label>
                    <Input
                      id="canal"
                      name="canal"
                      value={formData.canal}
                      onChange={handleChange}
                      placeholder="WhatsApp / Mail / Otro"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lugar">Lugar</Label>
                    <Input
                      id="lugar"
                      name="lugar"
                      value={formData.lugar}
                      onChange={handleChange}
                      placeholder="Ej: Cochinchina, Salón, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cantidadPersonas">Cantidad de Personas</Label>
                    <Input
                      id="cantidadPersonas"
                      name="cantidadPersonas"
                      type="number"
                      value={formData.cantidadPersonas}
                      onChange={handleChange}
                      placeholder="Ej: 80"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacion">Observación</Label>
                  <Textarea
                    id="observacion"
                    name="observacion"
                    value={formData.observacion}
                    onChange={handleChange}
                    placeholder="Notas generales…"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* DATOS DEL EVENTO */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Datos del Evento</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fechaEvento">Fecha Evento</Label>
                    <Input
                      id="fechaEvento"
                      name="fechaEvento"
                      type="date"
                      value={formData.fechaEvento}
                      onChange={handleChange}
                    />
                  </div>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horarioFinalizacionEvento">Horario Finalización Evento</Label>
                    <Input
                      id="horarioFinalizacionEvento"
                      name="horarioFinalizacionEvento"
                      type="time"
                      value={formData.horarioFinalizacionEvento || ""}
                      onChange={handleChange}
                    />
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendedorComercialAsignado">Comercial Asignado</Label>
                  <Input
                    id="vendedorComercialAsignado"
                    name="vendedorComercialAsignado"
                    value={formData.vendedorComercialAsignado}
                    onChange={handleChange}
                    placeholder="Nombre del comercial"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presupuesto">Presupuesto</Label>
                  <Input
                    id="presupuesto"
                    name="presupuesto"
                    value={formData.presupuesto}
                    onChange={handleChange}
                    placeholder="Monto / referencia"
                  />
                  <p className="text-xs text-muted-foreground">
                    Si cargas o modificás el presupuesto, el estado pasará a{" "}
                    <em>Presupuesto en Revisión</em>.
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Guardar
              </Button>
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
