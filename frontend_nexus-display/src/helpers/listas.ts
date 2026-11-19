import clienteApi from '@/plugins/axios'
import { mensajeDeError, notify } from '@/helpers/notificaciones'

/**
 * Traigo una lista desde la API y la dejo en la referencia que me pasan. Si la
 * petición falla, aviso con el mensaje de respaldo y dejo intacto lo que ya
 * estaba en pantalla, igual que hacía cada tabla por su cuenta.
 */
export async function cargarRegistros<T>(
  destino: { value: T[] },
  ruta: string,
  mensajeError: string,
): Promise<void> {
  try {
    const { data } = await clienteApi.get(ruta)
    destino.value = Array.isArray(data) ? data : []
  } catch (error) {
    notify.error(mensajeDeError(error, mensajeError))
  }
}
