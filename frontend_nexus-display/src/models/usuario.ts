export interface Usuario {
  id: number
  idRol: number
  nombreUsuario: string
  nombre?: string
  primerApellido?: string
  segundoApellido?: string | null
  correo: string
  telefono?: string
  documento?: string | null
  clave?: string
  rol: 'ADMIN' | 'VENDEDOR' | 'CLIENTE'
  idAlmacen?: number | null
  activo: boolean
}
