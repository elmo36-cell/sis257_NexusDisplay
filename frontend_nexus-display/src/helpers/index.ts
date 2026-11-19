export interface CargaJwt {
  sub?: string
  nombreUsuario?: string
  rol?: string
  exp?: number
  iat?: number
  [key: string]: unknown
}

/** Decodifica el cargaUtil de un JWT sin lanzar excepciones por tokens inválidos. */
export function decodificarJwt(token: string): CargaJwt | null {
  if (!token || token.split('.').length < 2) return null
  try {
    const base64Url = token.split('.')[1] ?? ''
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const conRelleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const contenidoToken = decodeURIComponent(
      window
        .atob(conRelleno)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(contenidoToken) as CargaJwt
  } catch {
    return null
  }
}

const CLAVES_SESION = [
  'token',
  'user',
  'rol',
  'userId',
  'idAlmacen',
  'nombre',
  'primerApellido',
  'segundoApellido',
] as const

/** Devuelve el token vigente; si está expirado o es inválido limpia la sesión. */
export function obtenerTokenDeSesion(): string | null {
  const token = localStorage.getItem('token')
  if (!token) return null

  const cargaUtil = decodificarJwt(token)
  const ahora = Date.now() / 1000

  if (!cargaUtil || typeof cargaUtil.exp !== 'number' || cargaUtil.exp <= ahora) {
    limpiarSesionLocal()
    return null
  }

  return token
}

export function limpiarSesionLocal() {
  CLAVES_SESION.forEach((clave) => localStorage.removeItem(clave))
}

const formatoMoneda = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formatea un monto como "Bs. 1.234,50". */
export function formatearMoneda(valor: number | string | null | undefined): string {
  const numero = Number(valor ?? 0)
  if (!Number.isFinite(numero)) return 'Bs. 0,00'
  return `Bs. ${formatoMoneda.format(numero)}`
}

/** Formatea una fecha ISO de forma legible (dd/mm/aaaa hh:mm). */
export function formatearFecha(valor: string | Date | null | undefined): string {
  if (!valor) return '—'
  const fecha = valor instanceof Date ? valor : new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Pasa una fecha ISO al formato que espera un <input type="datetime-local">
 * (aaaa-mm-ddThh:mm) en hora local. Con toISOString la fecha se correría por la
 * zona horaria, así que le resto el desfase antes de cortarla.
 */
export function aFechaLocal(valor?: string | Date | null): string {
  if (!valor) return ''
  const fecha = valor instanceof Date ? valor : new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''
  const desfase = fecha.getTimezoneOffset() * 60000
  return new Date(fecha.getTime() - desfase).toISOString().slice(0, 16)
}

/** Devuelve las iniciales de un nombre para avatares o marcas sin logo. */
export function iniciales(texto: string | null | undefined): string {
  return (texto ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
}
