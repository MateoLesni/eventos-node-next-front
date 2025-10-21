export interface Observacion {
  id: string
  fecha: string
  texto: string
  autor: string
}

export interface Cliente {
  id: string
  idFechaCliente: string
  horaCliente: string
  nombre: string
  telefono: string
  mail: string
  lugar: string
  cantidadPersonas: number
  observacion: string
  observaciones: Observacion[]
  redireccion: string
  canal: string
  respuestaViaMail: string
  asignacionComercial: string
  horarioInicioEvento: string
  horarioFinalizacionEvento: string
  fechaEvento: string
  sector: string
  vendedorComercialAsignado: string
  marcaTemporal: string
  demora: string
  presupuesto: string
  fechaPresupEnviado: string
  estado: "Activo" | "Pendiente" | "Cerrado" | "Cancelado"
}
