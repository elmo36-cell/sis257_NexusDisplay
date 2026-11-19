import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'primeflex/primeflex.css'
import '@/assets/app.css'

import App from './App.vue'
import router from './router'
import { EVENTO_NO_AUTORIZADO } from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { notify } from '@/helpers/notificaciones.ts'
import { IDIOMA_PRIMEVUE } from '@/helpers/idioma-primevue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  license: import.meta.env.VITE_PRIMEUI_LICENSE,
  locale: IDIOMA_PRIMEVUE,
  theme: {
    preset: Aura,
    options: { prefix: 'p', darkModeSelector: 'none', cssLayer: false },
  },
})

// Sesión vencida o token rechazado por el backend.
window.addEventListener(EVENTO_NO_AUTORIZADO, () => {
  const sesion = useSesionStore()
  if (!sesion.estaAutenticado) return
  sesion.limpiarSesion()
  notify.warn('Tu sesión expiró. Inicia sesión nuevamente.')
  const destino = router.currentRoute.value?.fullPath
  if (destino && destino !== '/login') {
    sesion.rutaRetorno = destino
  }
  router.push({ name: 'login' })
})

app.mount('#app')
