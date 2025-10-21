export interface Observacion {
  id: string
  fecha: string
  texto: string
  autor: string
}

/**
 * Observación “compacta” que devuelve el backend en `observacionesList`
 * (texto + fecha, ordenadas de más reciente a más antigua).
 */
export type ObsItem = {
  texto: string
  fecha: string
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

  /**
   * Historial de observaciones “antiguo” de la app.
   * Lo dejamos como opcional para no forzar a mapearlo
   * cuando vengas directo del backend nuevo.
   */
  observaciones?: Observacion[]

  /**
   * NUEVO: lista de observaciones que viene del backend,
   * cada una con {texto, fecha}. Orden: más reciente arriba.
   */
  observacionesList?: ObsItem[]

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

  /**
   * Agrego "ASIGNADO" porque es el valor que retorna tu Sheet.
   * (Si luego lo mapeás a tus estados, lo podemos volver a restringir.)
   */
  estado: "Activo" | "Pendiente" | "Cerrado" | "Cancelado" | "ASIGNADO"
}
