export interface Usuario {
  id: number
  idRol: number
  nombreUsuario: string
  correo: string
  telefono?: string
  clave?: string
  rol: 'ADMIN' | 'VENDEDOR' | 'CLIENTE'
  activo: boolean
}
