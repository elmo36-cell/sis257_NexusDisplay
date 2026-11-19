<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSesionStore } from '@/stores'
import { useCarritoStore } from '@/stores/carrito'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import type { AxiosError } from 'axios'

const sesion = useSesionStore()
const carrito = useCarritoStore()
const router = useRouter()

const nombreUsuario = ref('')
const clave = ref('')
const verClave = ref(false)
const cargando = ref(false)
const mensajeError = ref('')

const puedeEnviar = computed(
  () => nombreUsuario.value.trim().length > 0 && clave.value.length > 0 && !cargando.value,
)

async function onSubmit() {
  if (!puedeEnviar.value) return
  mensajeError.value = ''
  cargando.value = true

  try {
    const destino = await sesion.iniciarSesion(nombreUsuario.value.trim(), clave.value)
    notify.success(`Bienvenido, ${sesion.usuario}`)

    if (carrito.pendienteCheckout) {
      carrito.pendienteCheckout = false
      carrito.abrir()
    }

    await router.replace(destino)
  } catch (error) {
    const err = error as AxiosError<{ message?: string | string[] }>
    const estado = err.response?.status
    mensajeError.value =
      estado === 401
        ? 'Usuario o contraseña incorrectos.'
        : mensajeDeError(error, 'No se pudo iniciar sesión. Verifica tu conexión e inténtalo otra vez.')
    notify.error(mensajeError.value)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login-shell">
    <div class="container">
      <div class="login-card">
        <aside class="login-aside">
          <div>
            <RouterLink to="/" class="nexus-brand">
              <span class="nexus-brand__mark">N</span>
              <span class="nexus-brand__text">
                Nexus Display
                <small>Pantallas y repuestos</small>
              </span>
            </RouterLink>

            <h2>Todo el catálogo y el inventario en un solo lugar.</h2>
            <p>
              Consulta disponibilidad por sucursal, registra ventas y controla tus compras a
              proveedores con trazabilidad completa.
            </p>
          </div>

          <ul class="login-benefits">
            <li><i class="pi pi-check-circle"></i><span>Catálogo filtrado por marca, modelo y calidad</span></li>
            <li><i class="pi pi-check-circle"></i><span>Inventario actualizado por almacén</span></li>
            <li><i class="pi pi-check-circle"></i><span>Historial de compras para cada cliente</span></li>
          </ul>
        </aside>

        <div class="login-form">
          <h3>Iniciar sesión</h3>
          <p class="login-form__hint">Accede con las credenciales asignadas por tu administrador.</p>

          <form novalidate @submit.prevent="onSubmit">
            <div class="field-group">
              <label for="login-usuario">Nombre de usuario</label>
              <input id="login-usuario" v-model="nombreUsuario" class="form-control" type="text" autocomplete="username"
                placeholder="Ej: admin" autofocus />
            </div>

            <div class="field-group">
              <label for="login-clave">Contraseña</label>
              <div class="position-relative">
                <input id="login-clave" v-model="clave" class="form-control pe-5" :type="verClave ? 'text' : 'password'"
                  autocomplete="current-password" placeholder="Tu contraseña" />
                <button type="button"
                  class="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary px-3 py-0"
                  :aria-label="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="verClave = !verClave">
                  <i :class="verClave ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>

            <div v-if="mensajeError" class="alert alert-danger py-2 px-3 small d-flex align-articulos-start gap-2"
              role="alert">
              <i class="pi pi-exclamation-circle mt-1"></i>
              <span>{{ mensajeError }}</span>
            </div>

            <button type="submit"
              class="btn btn-primary w-100 mt-2 d-flex align-articulos-center justify-content-center gap-2"
              :disabled="!puedeEnviar">
              <span v-if="cargando" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <i v-else class="pi pi-sign-in"></i>
              <span>{{ cargando ? 'Verificando…' : 'Ingresar' }}</span>
            </button>
          </form>

          <p class="text-center small text-muted mt-4 mb-0">
            ¿Eres un cliente nuevo?
            <RouterLink to="/registro" class="fw-semibold">Regístrate aquí</RouterLink>
            <br />
            <RouterLink to="/" class="fw-semibold">Volver al catálogo</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
