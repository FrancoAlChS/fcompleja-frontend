export interface EstadoReporte {
  id?:number
  status:"pending" | "completed" | "download" | "in progress" | "error",
  type:"autorizaciones" | "monitoreo" | "pacientes",
  fechaCreacion:string,
  fechaFin:string,
  fechaIni:string
}