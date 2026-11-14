import { defineStore } from 'pinia'
import { getTokenFromLocalStorage, parseJwt } from '@/helpers'
import http from '@/plugins/axios'
import router from '@/router'

function obtenerDatosDesdeToken(): { user: string; rol: string; userId: number } {
  const token = getTokenFromLocalStorage()
  if (!token) {
    return { user: '', rol: '', userId: 0 }
  }
  const payload = parseJwt(token)
  return {
    user: payload?.nombreUsuario || localStorage.getItem('user') || '',
    rol: payload?.rol || localStorage.getItem('rol') || '',
    userId: Number(payload?.sub || localStorage.getItem('userId') || 0),
  }
}

const useAuthStore = defineStore('auth', {
  state: () => {
    const datos = obtenerDatosDesdeToken()
    return {
      user: datos.user,
      rol: datos.rol,
      userId: datos.userId,
      token: getTokenFromLocalStorage(),
      returnUrl: null as string | null,
    }
  },
  getters: {
    isAdmin: (state) => state.rol === 'ADMIN',
    isVendedor: (state) => state.rol === 'VENDEDOR' || state.rol === 'ADMIN',
    isCliente: (state) => state.rol === 'CLIENTE',
  },
  actions: {
    async login(nombreUsuario: string, clave: string) {
      const response = await http.post('auth/login', { nombreUsuario, clave })
      this.token = response.data.access_token

      const payload = parseJwt(this.token || '')
      this.rol = response.data.usuario?.rol || payload?.rol || 'CLIENTE'
      this.user = response.data.usuario?.nombreUsuario || payload?.nombreUsuario || nombreUsuario
      this.userId = Number(response.data.usuario?.id || payload?.sub || 1)

      localStorage.setItem('token', this.token || '')
      localStorage.setItem('user', this.user)
      localStorage.setItem('rol', this.rol)
      localStorage.setItem('userId', String(this.userId))

      if (this.rol === 'ADMIN') {
        router.push('/pantallas')
      } else if (this.rol === 'VENDEDOR') {
        router.push('/ventas')
      } else {
        router.push('/')
      }
    },
    logout() {
      localStorage.clear()
      this.user = ''
      this.rol = ''
      this.userId = 0
      this.token = null
      router.push('/login')
    },
  },
})

export { useAuthStore }
