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

const nombre = ref('')
const primerApellido = ref('')
const segundoApellido = ref('')
const nombreUsuario = ref('')
const correo = ref('')
const telefono = ref('')
const documento = ref('')
const clave = ref('')
const repetirClave = ref('')
const verClave = ref(false)
const cargando = ref(false)
const mensajeError = ref('')

/**
 * Reviso el formulario antes de enviarlo: nombre y primer apellido
 * obligatorios, CI / NIT obligatorio (con eso se emite la factura), usuario
 * de 3 letras o más, correo, clave de 6 o más y que las dos claves
 * coincidan. Igual el backend valida todo otra vez.
 */
const puedeEnviar = computed(
  () =>
    nombre.value.trim().length > 0 &&
    primerApellido.value.trim().length > 0 &&
    documento.value.trim().length > 0 &&
    nombreUsuario.value.trim().length >= 3 &&
    correo.value.trim().length > 0 &&
    clave.value.length >= 6 &&
    repetirClave.value === clave.value &&
    !cargando.value,
)

/**
 * Mando el registro a la API. Si sale bien, el store guarda la sesión y, si
 * el usuario venía del carrito, se lo vuelvo a abrir para que pague.
 * Si el correo o el usuario ya existen (409) muestro ese mensaje.
 */
async function onSubmit() {
  if (!puedeEnviar.value) return
  mensajeError.value = ''
  cargando.value = true

  try {
    const destino = await sesion.registrar({
      nombre: nombre.value.trim(),
      primerApellido: primerApellido.value.trim(),
      segundoApellido: segundoApellido.value.trim() || undefined,
      nombreUsuario: nombreUsuario.value.trim(),
      correo: correo.value.trim(),
      telefono: telefono.value.trim() || undefined,
      documento: documento.value.trim(),
      clave: clave.value,
    })

    notify.success(`¡Bienvenido, ${sesion.nombreCompleto || sesion.usuario}!`)

    if (carrito.pendienteCheckout) {
      carrito.pendienteCheckout = false
      if (!carrito.nombreCliente.trim()) {
        carrito.nombreCliente = sesion.nombreCompleto
      }
      carrito.abrir()
    }

    await router.replace(destino)
  } catch (error) {
    const err = error as AxiosError<{ message?: string | string[] }>
    const estado = err.response?.status
    mensajeError.value =
      estado === 409
        ? 'Ese usuario o correo ya está registrado. Inicia sesión con tus credenciales.'
        : mensajeDeError(error, 'No se pudo completar el registro. Inténtalo otra vez.')
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

            <h2>Regístrate y empieza a comprar en minutos.</h2>
            <p>
              Necesitas una cuenta de usuario para confirmar el pago de tu pedido y elegir la
              sucursal de retiro.
            </p>
          </div>

          <ul class="login-benefits">
            <li><i class="pi pi-check-circle"></i><span>Pago por transferencia, QR o efectivo</span></li>
            <li><i class="pi pi-check-circle"></i><span>Historial de tus compras</span></li>
            <li><i class="pi pi-check-circle"></i><span>Datos personales seguros</span></li>
          </ul>
        </aside>

        <div class="login-form">
          <h3>Registro de usuario nuevo</h3>
          <p class="login-form__hint">Completa tus datos para crear tu cuenta de cliente.</p>

          <form novalidate @submit.prevent="onSubmit">
            <div class="row g-2">
              <div class="col-12 col-sm-6 field-group">
                <label for="registro-nombre">Nombre</label>
                <input id="registro-nombre" v-model="nombre" class="form-control" type="text"
                  autocomplete="given-name" placeholder="Ej: Juan" />
              </div>
              <div class="col-12 col-sm-6 field-group">
                <label for="registro-primer-apellido">Primer apellido</label>
                <input id="registro-primer-apellido" v-model="primerApellido" class="form-control" type="text"
                  autocomplete="family-name" placeholder="Ej: Pérez" />
              </div>
              <div class="col-12 field-group">
                <label for="registro-segundo-apellido">Segundo apellido (opcional)</label>
                <input id="registro-segundo-apellido" v-model="segundoApellido" class="form-control" type="text"
                  autocomplete="additional-name" placeholder="Ej: Gómez" />
              </div>
            </div>

            <div class="field-group">
              <label for="registro-usuario">Nombre de usuario</label>
              <input id="registro-usuario" v-model="nombreUsuario" class="form-control" type="text"
                autocomplete="username" placeholder="Ej: juan.perez" />
            </div>

            <div class="field-group">
              <label for="registro-correo">Correo electrónico</label>
              <input id="registro-correo" v-model="correo" class="form-control" type="email"
                autocomplete="email" placeholder="correo@ejemplo.com" />
            </div>

            <div class="row g-2">
              <div class="col-12 col-sm-6 field-group">
                <label for="registro-documento">NIT / CI</label>
                <input id="registro-documento" v-model="documento" class="form-control" type="text"
                  inputmode="numeric" maxlength="30" autocomplete="off" placeholder="Ej: 7123456" />
              </div>
              <div class="col-12 col-sm-6 field-group">
                <label for="registro-telefono">Teléfono / celular (opcional)</label>
                <input id="registro-telefono" v-model="telefono" class="form-control" type="tel"
                  autocomplete="tel" placeholder="Ej: 71234567" />
              </div>
            </div>

            <div class="field-group">
              <label for="registro-clave">Contraseña</label>
              <div class="position-relative">
                <input id="registro-clave" v-model="clave" class="form-control pe-5"
                  :type="verClave ? 'text' : 'password'" autocomplete="new-password"
                  placeholder="Mínimo 6 caracteres" />
                <button type="button"
                  class="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary px-3 py-0"
                  :aria-label="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="verClave = !verClave">
                  <i :class="verClave ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>

            <div class="field-group">
              <label for="registro-repetir-clave">Repetir contraseña</label>
              <input id="registro-repetir-clave" v-model="repetirClave" class="form-control"
                :type="verClave ? 'text' : 'password'" autocomplete="new-password"
                placeholder="Repite tu contraseña" />
              <small v-if="repetirClave && repetirClave !== clave" class="text-danger">
                Las contraseñas no coinciden.
              </small>
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
              <i v-else class="pi pi-user-plus"></i>
              <span>{{ cargando ? 'Creando cuenta…' : 'Registrarme y pagar' }}</span>
            </button>
          </form>

          <p class="text-center small text-muted mt-4 mb-0">
            ¿Ya tienes cuenta?
            <RouterLink to="/login" class="fw-semibold">Inicia sesión</RouterLink>
            · <RouterLink to="/" class="fw-semibold">Volver al catálogo</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
