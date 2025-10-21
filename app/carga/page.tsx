"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2 } from "lucide-react"

export default function CargaPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    idPresupuesto: "",
    hrInicio: "",
    hrFinal: "",
    sector: "",
    vendedor: "",
    observaciones: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submitted:", formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        idPresupuesto: "",
        hrInicio: "",
        hrFinal: "",
        sector: "",
        vendedor: "",
        observaciones: "",
      })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
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
                <p className="text-muted-foreground">La información ha sido registrada correctamente en el sistema.</p>
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
                <CardDescription>Complete los siguientes campos para registrar la información</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="idPresupuesto">ID Presupuesto</Label>
                <Input
                  id="idPresupuesto"
                  name="idPresupuesto"
                  value={formData.idPresupuesto}
                  onChange={handleChange}
                  placeholder="Ej: PRES-2025-001"
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hrInicio">Hr Inicio</Label>
                  <Input
                    id="hrInicio"
                    name="hrInicio"
                    type="time"
                    value={formData.hrInicio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hrFinal">Hr Final</Label>
                  <Input
                    id="hrFinal"
                    name="hrFinal"
                    type="time"
                    value={formData.hrFinal}
                    onChange={handleChange}
                    required
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendedor">Vendedor</Label>
                <Input
                  id="vendedor"
                  name="vendedor"
                  value={formData.vendedor}
                  onChange={handleChange}
                  placeholder="Nombre del vendedor"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  placeholder="Ingrese cualquier observación relevante..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Enviar Datos
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
