import { defineStore } from 'pinia'
import { obtenerTokenDeSesion, limpiarSesionLocal, decodificarJwt } from '@/helpers'
import clienteApi from '@/plugins/axios'

export type Rol = 'ADMIN' | 'VENDEDOR' | 'CLIENTE'

export interface DatosRegistro {
  nombre: string
  primerApellido: string
  segundoApellido?: string
  nombreUsuario: string
  correo: string
  telefono?: string
  clave: string
}

/** Página inicial sugerida según el rol del usuario. */
export function rutaInicialPorRol(rol: string | null | undefined): string {
  if (rol === 'ADMIN') return '/pantallas'
  if (rol === 'VENDEDOR') return '/ventas'
  return '/'
}

function leerSesionInicial() {
  const token = obtenerTokenDeSesion()
  if (!token) {
    return {
      usuario: '',
      rol: '',
      userId: 0,
      idAlmacen: 0,
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      token: null as string | null,
    }
  }

  const cargaUtil = decodificarJwt(token)
  return {
    usuario: cargaUtil?.nombreUsuario || localStorage.getItem('user') || '',
    rol: cargaUtil?.rol || localStorage.getItem('rol') || '',
    userId: Number(cargaUtil?.sub ?? localStorage.getItem('userId') ?? 0),
    idAlmacen: Number(cargaUtil?.idAlmacen ?? localStorage.getItem('idAlmacen') ?? 0),
    nombre: localStorage.getItem('nombre') || '',
    primerApellido: localStorage.getItem('primerApellido') || '',
    segundoApellido: localStorage.getItem('segundoApellido') || '',
    token,
  }
}

export const useSesionStore = defineStore('auth', {
  state: () => {
    const sesion = leerSesionInicial()
    return {
      usuario: sesion.usuario,
      rol: sesion.rol as Rol | '',
      userId: sesion.userId,
      idAlmacen: sesion.idAlmacen,
      nombre: sesion.nombre,
      primerApellido: sesion.primerApellido,
      segundoApellido: sesion.segundoApellido,
      token: sesion.token,
      rutaRetorno: null as string | null,
    }
  },
  getters: {
    estaAutenticado: (state) => Boolean(state.token),
    esAdmin: (state) => state.rol === 'ADMIN',
    esVendedor: (state) => state.rol === 'VENDEDOR' || state.rol === 'ADMIN',
    esCliente: (state) => state.rol === 'CLIENTE',
    puedeGestionar: (state) => state.rol === 'ADMIN' || state.rol === 'VENDEDOR',
    rolEtiqueta: (state) => state.rol || 'VISITANTE',
    tieneSucursal: (state) => Number(state.idAlmacen) > 0,
    nombreCompleto: (state) =>
      [state.nombre, state.primerApellido, state.segundoApellido]
        .filter((parte) => Boolean(parte && parte.trim()))
        .join(' ')
        .trim(),
  },
  actions: {
    /** Guarda el token y los datos de la sesión devueltos por el API. */
    aplicarSesion(respuesta: any, usuarioPorDefecto = '') {
      const token: string = respuesta?.access_token ?? ''

      if (!token) {
        throw new Error('El servidor no devolvió un token de acceso')
      }

      const cargaUtil = decodificarJwt(token)

      this.token = token
      this.rol = (respuesta?.usuario?.rol ?? cargaUtil?.rol ?? 'CLIENTE') as Rol
      this.usuario =
        respuesta?.usuario?.nombreUsuario ?? cargaUtil?.nombreUsuario ?? usuarioPorDefecto
      this.userId = Number(respuesta?.usuario?.id ?? cargaUtil?.sub ?? 0)
      this.idAlmacen = Number(respuesta?.usuario?.idAlmacen ?? cargaUtil?.idAlmacen ?? 0)
      this.nombre = respuesta?.usuario?.nombre ?? ''
      this.primerApellido = respuesta?.usuario?.primerApellido ?? ''
      this.segundoApellido = respuesta?.usuario?.segundoApellido ?? ''

      localStorage.setItem('token', token)
      localStorage.setItem('user', this.usuario)
      localStorage.setItem('rol', this.rol)
      localStorage.setItem('userId', String(this.userId))
      localStorage.setItem('idAlmacen', String(this.idAlmacen))
      localStorage.setItem('nombre', this.nombre)
      localStorage.setItem('primerApellido', this.primerApellido)
      localStorage.setItem('segundoApellido', this.segundoApellido)
    },

    /** Autentica al usuario y devuelve la ruta a la que debe navegar. */
    async iniciarSesion(nombreUsuario: string, clave: string): Promise<string> {
      const { data: respuesta } = await clienteApi.post('auth/login', { nombreUsuario, clave })
      this.aplicarSesion(respuesta, nombreUsuario)

      const destino =
        this.rutaRetorno && this.rutaRetorno !== '/login' && this.rutaRetorno !== '/registro'
          ? this.rutaRetorno
          : rutaInicialPorRol(this.rol)
      this.rutaRetorno = null
      return destino
    },

    /** Registra a un visitante como cliente nuevo e inicia su sesión. */
    async registrar(datos: DatosRegistro): Promise<string> {
      const { data: respuesta } = await clienteApi.post('auth/registro', datos)
      this.aplicarSesion(respuesta, datos.nombreUsuario)

      const destino =
        this.rutaRetorno && this.rutaRetorno !== '/login' && this.rutaRetorno !== '/registro'
          ? this.rutaRetorno
          : rutaInicialPorRol(this.rol)
      this.rutaRetorno = null
      return destino
    },

    /** Borra la sesión del estado y del almacenamiento local. */
    limpiarSesion() {
      limpiarSesionLocal()
      this.token = null
      this.usuario = ''
      this.rol = ''
      this.userId = 0
      this.idAlmacen = 0
      this.nombre = ''
      this.primerApellido = ''
      this.segundoApellido = ''
    },
    cerrarSesion() {
      this.limpiarSesion()
      this.rutaRetorno = null
    },
  },
})
