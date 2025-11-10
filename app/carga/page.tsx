"use client"

import React, { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2 } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

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
  // meta (solo lectura; NO se envía)
  estado?: string
}

type HistItem = { campo: string; antes: string; despues: string; fechaISO: string }

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://eventos-node-express-back.vercel.app"

const LUGARES = ["CoChinChina", "Kona", "Costa7070", "CruzaPolo", "MilVidas", "We Enjoy"]
const CANALES = ["Whatsapp NG", "Instagram", "Linkedin", "Web", "Mail Directo", "Referido"]
const COMERCIALES = ["Pilar", "Tano", "Johanna Gatti", "Traianna Rosas", "Delfina Herrera Paz"]

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
    // meta (solo lectura)
    estado: "",
  })

  const [originalData, setOriginalData] = useState<SheetEvent | null>(null)
  const [loadingId, setLoadingId] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 🔒 Cooldown de guardado (10s) — estado para UI y ref para bloqueo sincrónico
  const [saveLocked, setSaveLocked] = useState(false)
  const saveLockRef = useRef(false) // ← candado inmediato para evitar doble click en el mismo tick
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
    }
  }, [])

  // utils
  const cleanStr = (v: any) => String(v ?? "").trim()
  function onlyHHmm(s: string) {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(s).trim())
    return m ? `${m[1]}:${m[2]}` : ""
  }

  const resetForm = () => {
    setOriginalData(null)
    setFormData({
      nombre: "",
      telefono: "",
      mail: "",
      lugar: "",
      cantidadPersonas: "",
      observacion: "",
      canal: "",
      fechaEvento: "",
      horarioInicioEvento: "",
      horarioFinalizacionEvento: "",
      sector: "",
      vendedorComercialAsignado: "",
      presupuesto: "",
      estado: "",
    })
    setErrorMsg(null)
  }

  // fetch by id when query provides one
  useEffect(() => {
    if (idFromQuery) {
      setIdCliente(idFromQuery)
      // si viene 0 por query, resetea
      if (cleanStr(idFromQuery) === "0") {
        resetForm()
      } else {
        void fetchById(idFromQuery)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFromQuery])

  async function fetchById(id: string) {
    const cleanId = cleanStr(id)
    if (!cleanId) return
    if (cleanId === "0") { // 0 = creación -> limpiar
      resetForm()
      return
    }
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
        // meta (solo lectura)
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

  // Si el usuario escribe manualmente 0 o deja vacío, entramos en modo creación y limpiamos
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setIdCliente(v)
    const vv = cleanStr(v)
    if (vv === "" || vv === "0") {
      resetForm()
    }
  }

  const onBlurId = () => {
    const id = cleanStr(idCliente)
    if (!id || id === "0") {
      resetForm()
      return
    }
    void fetchById(id)
  }

  // handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Historial de cambios (EXCLUYE 'estado' porque es fórmula y NO se escribe)
  function buildHistorialCambios(o: SheetEvent | null, n: Omit<SheetEvent, "id">): HistItem[] {
    if (!o) return []
    const campos: (keyof Omit<SheetEvent, "id">)[] = [
      // cliente
      "nombre","telefono","mail","lugar","cantidadPersonas","observacion","canal",
      // evento
      "fechaEvento","horarioInicioEvento","horarioFinalizacionEvento","sector",
      "vendedorComercialAsignado","presupuesto",
      // meta: estado EXCLUIDO
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

    // 🔒 Candado sincrónico: si ya estamos guardando o en cooldown, salir
    if (saveLockRef.current) return
    saveLockRef.current = true
    setSaveLocked(true)
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
    cooldownTimerRef.current = setTimeout(() => {
      saveLockRef.current = false
      setSaveLocked(false)
    }, 10_000)

    setErrorMsg(null)

    const id = cleanStr(idCliente)
    const esCreacion = !id || id === "0"

    const baseNormalized: Omit<SheetEvent, "id"> = {
      ...formData,
      horarioInicioEvento: onlyHHmm(formData.horarioInicioEvento),
      horarioFinalizacionEvento: onlyHHmm(formData.horarioFinalizacionEvento),
      // estado se mantiene solo lectura; no lo enviaremos
    }

    if (esCreacion) {
      // no escribir ID; tu script lo genera en A
      if (!cleanStr(formData.nombre)) {
        setErrorMsg("Para crear un cliente nuevo, completá el Nombre.")
        return
      }

      // Payload de creación: EXCLUIR 'estado'
      const { estado: _omitEstado, ...payloadCreate } = baseNormalized as any

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
          resetForm()
        }, 900)
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

    // Detectar cambios (EXCLUYENDO 'estado')
    const changed: Record<string, string> = {}
    ;(Object.keys(baseNormalized) as (keyof typeof baseNormalized)[]).forEach((k) => {
      if (k === "estado") return // no se envía ni compara para escribir
      const oldVal = cleanStr((originalData as any)[k] ?? "")
      const newVal =
        k === "horarioInicioEvento" || k === "horarioFinalizacionEvento"
          ? onlyHHmm((baseNormalized as any)[k])
          : cleanStr((baseNormalized as any)[k])
      if (oldVal !== newVal) changed[k as string] = newVal
    })

    if (Object.keys(changed).length === 0) {
      setErrorMsg("No hay cambios para guardar.")
      return
    }

    // Historial EXCLUYENDO 'estado'
    const hist = buildHistorialCambios(originalData, baseNormalized)

    try {
      const res = await fetch(`${API_BASE}/api/eventSheet/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...changed,                // ← sin 'estado'
          __historialCambios: hist,  // metadato opcional si lo consumís en el back
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || "No se pudo guardar")

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        void fetchById(id)
      }, 900)
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
                  quedará vacía (tu script la completa). El <strong>Estado</strong> se calcula por{" "}
                  fórmula en Sheets (no se escribe desde acá).
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
                  onChange={handleIdChange}
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
                    <Label>Canal</Label>
                    <Select
                      value={formData.canal}
                      onValueChange={(val) => setFormData((p) => ({ ...p, canal: val }))}
                    >
                      <SelectTrigger id="canal">
                        <SelectValue placeholder="Elegí un canal" />
                      </SelectTrigger>
                      <SelectContent>
                        {CANALES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Lugar</Label>
                    <Select
                      value={formData.lugar}
                      onValueChange={(val) => setFormData((p) => ({ ...p, lugar: val }))}
                    >
                      <SelectTrigger id="lugar">
                        <SelectValue placeholder="Seleccioná un local" />
                      </SelectTrigger>
                      <SelectContent>
                        {LUGARES.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <Label>Comercial Asignado</Label>
                  <Select
                    value={formData.vendedorComercialAsignado}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, vendedorComercialAsignado: val }))
                    }
                  >
                    <SelectTrigger id="vendedorComercialAsignado">
                      <SelectValue placeholder="Elegí un comercial" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMERCIALES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    El <strong>Estado</strong> se calcula automáticamente por fórmula en Sheets.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full ${saveLocked ? "pointer-events-none opacity-80" : ""}`}
                size="lg"
                disabled={saveLocked}
                aria-disabled={saveLocked}
              >
                {saveLocked ? "Guardando… (esperá 10s)" : "Guardar"}
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
