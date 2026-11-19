import { reactive, readonly } from 'vue'

export type TipoNotificacion = 'success' | 'error' | 'info' | 'warn'

export interface Notificacion {
  id: number
  tipo: TipoNotificacion
  mensaje: string
}

const estado = reactive<{ articulos: Notificacion[] }>({ articulos: [] })
let secuencia = 0

/** Convierte la respuesta de NestJS (string | string[]) en un texto legible. */
export function normalizarMensaje(mensaje: unknown): string {
  if (typeof mensaje === 'string') return mensaje
  if (Array.isArray(mensaje)) return mensaje.filter(Boolean).join(' · ')
  return ''
}

/** Extrae el mensaje de error del backend con un texto de respaldo. */
export function mensajeDeError(error: unknown, respaldo: string): string {
  const respuesta = (error as { response?: { data?: { message?: unknown } } })?.response?.data
  const mensaje = normalizarMensaje(respuesta?.message)
  return mensaje || respaldo
}

function descartar(id: number) {
  const indice = estado.articulos.findIndex((n) => n.id === id)
  if (indice !== -1) estado.articulos.splice(indice, 1)
}

function push(tipo: TipoNotificacion, mensaje: unknown, duracion = 4200) {
  const texto = normalizarMensaje(mensaje) || String(mensaje ?? '')
  if (!texto) return
  const id = ++secuencia
  estado.articulos.push({ id, tipo, mensaje: texto })
  if (estado.articulos.length > 4) estado.articulos.shift()
  window.setTimeout(() => descartar(id), duracion)
}

export const notify = {
  success: (mensaje: unknown, duracion?: number) => push('success', mensaje, duracion),
  error: (mensaje: unknown, duracion?: number) => push('error', mensaje, duracion ?? 5200),
  warn: (mensaje: unknown, duracion?: number) => push('warn', mensaje, duracion),
  info: (mensaje: unknown, duracion?: number) => push('info', mensaje, duracion),
}

export function useNotificaciones() {
  return { notificaciones: readonly(estado).articulos, descartar }
}
