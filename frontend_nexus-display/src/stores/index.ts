import { defineStore } from 'pinia'
import { getTokenFromLocalStorage } from '@/helpers'
import http from '@/plugins/axios'
import router from '@/router'

const useAuthStore = defineStore('auth', {
  state: () => ({
    user: localStorage.getItem('user') || '',
    token: getTokenFromLocalStorage(),
    returnUrl: '' as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(usuario: string, clave: string) {
      try {
        const response = await http.post('auth/login', { usuario, clave })

        this.user = response.data.usuario || response.data.user || usuario
        this.token = response.data.access_token || response.data.token

        localStorage.setItem(
          'user',
          typeof this.user === 'object' ? JSON.stringify(this.user) : this.user,
        )
        localStorage.setItem('token', this.token || '')

        router.push(this.returnUrl || '/pantallas')
        this.returnUrl = null
      } catch (error) {
        console.error('Error al iniciar sesión:', error)
        throw error
      }
    },
    logout() {
      localStorage.clear()
      this.$reset()
      router.push('/login')
    },
  },
})

export { useAuthStore }
