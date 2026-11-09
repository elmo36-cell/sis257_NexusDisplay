import type { Rol } from './rol'

export interface Usuario {
  id: number
  usuario: string
  clave?: string
  email: string
  idRol: number
  rol?: Rol
}
