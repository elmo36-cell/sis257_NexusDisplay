import Axios, { type AxiosInstance } from 'axios'
import { obtenerTokenDeSesion } from '@/helpers'

export const EVENTO_NO_AUTORIZADO = 'nexus:unauthorized'

// Tiempo máximo que espero una respuesta antes de cortar la petición.
const TIEMPO_ESPERA_MS = 20000

const clienteApi: AxiosInstance = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_ENDPOINT || 'http://127.0.0.1:3000/api/v1/',
  timeout: TIEMPO_ESPERA_MS,
})

/**
 * Antes de cada petición le pego el token guardado en el header Authorization,
 * así no tengo que repetir esa línea en cada vista. Si no hay token (visitante),
 * me aseguro de que no quede un header viejo.
 */
clienteApi.interceptors.request.use((config) => {
  const token = obtenerTokenDeSesion()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (config.headers.Authorization) {
    delete config.headers.Authorization
  }
  if (config.data !== undefined && config.headers) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

/**
 * Si el backend responde 401 (token vencido o inválido) aviso con un evento para
 * que la app cierre la sesión y mande al login. El login se excluye porque ahí
 * el 401 significa clave incorrecta, no sesión vencida.
 */
clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url: string = error?.config?.url ?? ''
    // El endpoint de login devuelve 401 por credenciales, no por sesión vencida.
    if (status === 401 && !url.includes('auth/login')) {
      window.dispatchEvent(new Event(EVENTO_NO_AUTORIZADO))
    }
    return Promise.reject(error)
  },
)

export const api = clienteApi
export default clienteApi
