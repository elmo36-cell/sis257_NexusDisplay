<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import http from '@/plugins/axios'
import type { Pantalla } from '@/models/pantalla'
import type { Marca } from '@/models/marca'
import type { Calidad } from '@/models/calidad'
import type { Categoria } from '@/models/categoria'
import type { Almacen } from '@/models/almacen'
import { useAuthStore } from '@/stores'
import { Button, Dialog, InputText, Select } from 'primevue'
import router from '@/router'
import type { AxiosError } from 'axios'

const authStore = useAuthStore()
const pantallas = ref<Pantalla[]>([])
const marcas = ref<Marca[]>([])
const calidades = ref<Calidad[]>([])
const categorias = ref<Categoria[]>([])
const almacenes = ref<Almacen[]>([])
const vendedoresContacto = ref<
  { id: number; nombreUsuario: string; correo: string; telefono: string; rol: string }[]
>([])

const busqueda = ref('')
const idMarcaSeleccionada = ref<number | null>(null)
const idCalidadSeleccionada = ref<number | null>(null)
const idCategoriaSeleccionada = ref<number | null>(null)

const mostrarCarrito = ref(false)
const nombreCliente = ref('')
const documentoCliente = ref('')
const idAlmacenSeleccionado = ref<number | null>(null)
const carrito = ref<{ pantalla: Pantalla; cantidad: number }[]>([])

async function obtenerCatalogo() {
  const [resPantallas, resMarcas, resCalidades, resCategorias, resAlmacenes, resVendedores] =
    await Promise.all([
      http.get('pantallas'),
      http.get('marcas'),
      http.get('calidades'),
      http.get('categorias'),
      http.get('almacenes'),
      http.get('usuarios/contactos-vendedores'),
    ])
  pantallas.value = resPantallas.data
  marcas.value = resMarcas.data
  calidades.value = resCalidades.data
  categorias.value = resCategorias.data
  almacenes.value = resAlmacenes.data
  vendedoresContacto.value = resVendedores.data

  if (almacenes.value.length > 0 && !idAlmacenSeleccionado.value) {
    idAlmacenSeleccionado.value = almacenes.value[0]?.id ?? null
  }
}

function obtenerStockTotal(pantalla: Pantalla): number {
  return pantalla.inventarios?.reduce((acc, inv) => acc + Number(inv.cantidad), 0) || 0
}

const pantallasFiltradas = computed(() => {
  return pantallas.value.filter((p) => {
    const q = busqueda.value.toLowerCase()
    const coincideTexto =
      p.nombre.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q) ||
      (p.modelo?.nombre ?? '').toLowerCase().includes(q) ||
      (p.modelo?.marca?.nombre ?? '').toLowerCase().includes(q) ||
      (p.categoria?.nombre ?? '').toLowerCase().includes(q)

    const coincideMarca = !idMarcaSeleccionada.value || p.modelo?.idMarca === idMarcaSeleccionada.value
    const coincideCalidad = !idCalidadSeleccionada.value || p.idCalidad === idCalidadSeleccionada.value
    const coincideCategoria =
      !idCategoriaSeleccionada.value || p.idCategoria === idCategoriaSeleccionada.value

    return coincideTexto && coincideMarca && coincideCalidad && coincideCategoria
  })
})

function seleccionarMarcaTarjeta(idMarca: number) {
  idMarcaSeleccionada.value = idMarcaSeleccionada.value === idMarca ? null : idMarca
}

function agregarAlCarrito(pantalla: Pantalla) {
  if (!authStore.token) {
    router.push('/login')
    return
  }

  const stockMax = obtenerStockTotal(pantalla)
  if (stockMax <= 0) {
    alert('Esta pantalla no tiene stock disponible.')
    return
  }

  if (!nombreCliente.value && authStore.user) {
    nombreCliente.value = authStore.user
  }

  // Seleccionar automáticamente el almacén donde haya stock de esta pantalla
  const invConStock = pantalla.inventarios?.find((inv) => Number(inv.cantidad) > 0)
  if (invConStock) {
    idAlmacenSeleccionado.value = invConStock.idAlmacen
  }

  const existente = carrito.value.find((c) => c.pantalla.id === pantalla.id)
  if (existente) {
    if (existente.cantidad < stockMax) {
      existente.cantidad++
    } else {
      alert(`Solo hay ${stockMax} unidades disponibles en stock.`)
    }
  } else {
    carrito.value.push({ pantalla, cantidad: 1 })
  }

  mostrarCarrito.value = true
}

function cambiarCantidadCarrito(index: number, delta: number) {
  const item = carrito.value[index]
  if (!item) return
  const stockMax = obtenerStockTotal(item.pantalla)
  const nuevaCant = item.cantidad + delta
  if (nuevaCant >= 1 && nuevaCant <= stockMax) {
    item.cantidad = nuevaCant
  }
}

function quitarDelCarrito(idPantalla: number) {
  carrito.value = carrito.value.filter((c) => c.pantalla.id !== idPantalla)
}

const totalCarrito = computed(() =>
  carrito.value.reduce((acc, item) => acc + Number(item.cantidad) * Number(item.pantalla.precioVenta), 0),
)

async function confirmarCompra() {
  if (carrito.value.length === 0) return

  if (!idAlmacenSeleccionado.value) {
    alert('Seleccione la sucursal / almacén de retiro.')
    return
  }

  try {
    await http.post('ventas', {
      idUsuario: Number(authStore.userId || 1),
      idAlmacen: Number(idAlmacenSeleccionado.value),
      nombreCliente: nombreCliente.value.trim() || authStore.user || 'CLIENTE WEB',
      documentoCliente: documentoCliente.value.trim() || '0',
      detalles: carrito.value.map((c) => ({
        idVenta: 1,
        idPantalla: Number(c.pantalla.id),
        cantidad: Number(c.cantidad),
        precioUnitario: Number(c.pantalla.precioVenta),
      })),
    })

    carrito.value = []
    mostrarCarrito.value = false
    await obtenerCatalogo()
    alert('¡Tu compra fue registrada con éxito! Puedes verla en la sección Mis Compras.')
  } catch (error) {
    const err = error as AxiosError<{ message?: string | string[] }>
    const msg = Array.isArray(err.response?.data?.message)
      ? err.response?.data?.message.join(', ')
      : err.response?.data?.message
    alert(msg || 'Error al procesar la compra')
  }
}

onMounted(() => {
  obtenerCatalogo()
})
</script>

<template>
  <div>
    <!-- Encabezado del Catálogo -->
    <section class="hero-banner text-white py-5 mb-4">
      <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div>
          <span class="badge bg-info text-dark mb-2 px-3 py-1 fw-bold">CATÁLOGO OFICIAL</span>
          <h1 class="display-5 fw-bold m-0">Catálogo <em class="text-info fst-normal">Nexus Display</em></h1>
          <p class="lead mt-2 mb-0 text-light">
            Pantallas Originales, OLED, AMOLED e Incell clasificadas por Marca, Calidad y Categoría.
          </p>
        </div>
        <div class="mt-3 mt-md-0 d-flex gap-2">
          <a href="#contacto-vendedores" class="btn btn-outline-light">
            Contactar Vendedor
          </a>
          <Button v-if="authStore.token && (authStore.rol === 'ADMIN' || authStore.rol === 'VENDEDOR')" type="button"
            label="Categorías de Repuestos" severity="secondary" @click="router.push('/categorias')" />
          <Button v-if="authStore.token" type="button" :label="`Carrito (${carrito.length})`" severity="info"
            @click="mostrarCarrito = true" />
        </div>
      </div>
    </section>

    <div class="container pb-5">
      <!-- 1. Marcas disponibles -->
      <div v-if="marcas.length > 0" class="mb-4">
        <h5 class="fw-bold text-dark mb-3">Marcas Disponibles</h5>
        <div class="d-flex flex-wrap gap-3">
          <div v-for="m in marcas" :key="m.id" @click="seleccionarMarcaTarjeta(m.id)"
            class="bg-white px-3 py-2 rounded shadow-sm d-flex align-items-center gap-2 border"
            :class="idMarcaSeleccionada === m.id ? 'border-info border-2 bg-info-subtle' : ''" style="cursor: pointer">
            <img :src="m.fotografia" :alt="m.nombre" style="width: 32px; height: 32px; object-fit: contain" />
            <span class="fw-semibold text-dark">{{ m.nombre }}</span>
          </div>
        </div>
      </div>

      <!-- 2. Filtros con Select de Marca, Calidad y Categoría del Repuesto -->
      <div class="row g-3 mb-4 bg-white p-3 rounded shadow-sm align-items-end">
        <div class="col-12 col-md-3">
          <label class="form-label small fw-bold text-secondary mb-1">Buscar Pantalla</label>
          <InputText v-model="busqueda" placeholder="Modelo, marca o SKU..." class="w-100" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-bold text-secondary mb-1">Marca</label>
          <Select v-model="idMarcaSeleccionada" :options="marcas" optionLabel="nombre" optionValue="id"
            placeholder="Todas las Marcas" showClear class="w-100" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-bold text-secondary mb-1">Calidad</label>
          <Select v-model="idCalidadSeleccionada" :options="calidades" optionLabel="nombre" optionValue="id"
            placeholder="Todas las Calidades" showClear class="w-100" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-bold text-secondary mb-1">Categoría del Repuesto</label>
          <Select v-model="idCategoriaSeleccionada" :options="categorias" optionLabel="nombre" optionValue="id"
            placeholder="Todas las Categorías" showClear class="w-100" />
        </div>
      </div>

      <!-- 3. Grilla de Pantallas -->
      <div class="row g-4 mb-5">
        <div v-for="item in pantallasFiltradas" :key="item.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <div class="card h-100 border-0 shadow-sm product-card">
            <div class="position-relative bg-dark text-center">
              <img :src="item.fotografia" :alt="item.nombre" class="card-img-top"
                style="height: 220px; object-fit: cover" />
              <span class="position-absolute top-0 end-0 m-2 badge"
                :class="obtenerStockTotal(item) > 0 ? 'bg-success' : 'bg-danger'">
                {{ obtenerStockTotal(item) > 0 ? `Disponible (${obtenerStockTotal(item)})` : 'Agotado' }}
              </span>
              <span class="position-absolute top-0 start-0 m-2 badge bg-info text-dark">
                {{ item.calidad?.nombre }}
              </span>
            </div>

            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <div class="text-muted small fw-bold text-uppercase mb-1">
                  {{ item.modelo?.marca?.nombre }} - {{ item.modelo?.nombre }}
                </div>
                <h5 class="card-title fw-bold text-dark mb-2">{{ item.nombre }}</h5>
                <p class="card-text small text-secondary mb-2">
                  <strong>Categoría:</strong> {{ item.categoria?.nombre || 'General' }} <br />
                  <strong>SKU:</strong> {{ item.codigo }} <br />
                  <strong>Color:</strong> {{ item.color }} |
                  <strong>{{ item.conMarco ? 'Con Marco' : 'Sin Marco' }}</strong>
                </p>
              </div>

              <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-2">
                <span class="fs-5 fw-bold text-primary">Bs. {{ item.precioVenta }}</span>
                <Button type="button" label="Agregar al Carrito" size="small" :disabled="obtenerStockTotal(item) <= 0"
                  @click="agregarAlCarrito(item)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Contacto del Vendedor y Direcciones de Almacenes -->
      <section id="contacto-vendedores" class="bg-white p-4 rounded shadow-sm border-top border-4 border-info mt-5">
        <div class="row g-4">
          <div class="col-12 col-md-6">
            <h4 class="fw-bold text-dark mb-3">Contacto de Vendedores</h4>
            <p class="text-secondary small">
              Números de teléfono y correos electrónicos de atención:
            </p>
            <ul class="list-group list-group-flush">
              <li v-for="v in vendedoresContacto" :key="v.id"
                class="list-group-item d-flex justify-content-between align-items-center px-0 flex-wrap gap-2">
                <div>
                  <strong class="text-dark">{{ v.nombreUsuario }}</strong>
                  <span class="badge bg-secondary ms-2">{{ v.rol }}</span>
                  <div class="small text-dark mt-1">
                    <strong>Teléfono / Celular:</strong> {{ v.telefono || 'No registrado' }}
                  </div>
                  <div class="small text-muted">
                    <strong>Correo:</strong> {{ v.correo }}
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <a v-if="v.telefono" :href="`https://wa.me/591${v.telefono.replace(/\D/g, '')}`" target="_blank"
                    class="btn btn-sm btn-success">
                    WhatsApp
                  </a>
                  <a :href="`mailto:${v.correo}?subject=Consulta%20Catálogo%20Nexus%20Display`"
                    class="btn btn-sm btn-outline-primary">
                    Enviar Correo
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <div class="col-12 col-md-6">
            <h4 class="fw-bold text-dark mb-3">Dirección de Almacenes</h4>
            <div class="row g-3">
              <div v-for="alm in almacenes" :key="alm.id" class="col-12">
                <div class="p-3 bg-light rounded border">
                  <div class="fw-bold text-dark">{{ alm.nombre }}</div>
                  <div class="small text-secondary mt-1">
                    <strong>Dirección:</strong> {{ alm.direccion }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal del Carrito de Compras del Cliente -->
    <Dialog v-model:visible="mostrarCarrito" header="Mi Carrito de Compras" :style="{ width: '38rem' }" modal>
      <div v-if="carrito.length === 0" class="text-center py-4">
        Tu carrito está vacío. Selecciona una pantalla del catálogo para comprar.
      </div>
      <div v-else class="d-flex flex-column gap-3 pt-2">
        <div>
          <label class="fw-semibold d-block mb-1 small">Sucursal / Almacén de Retiro</label>
          <Select v-model="idAlmacenSeleccionado" :options="almacenes" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione almacén" class="w-100" />
        </div>

        <div class="row g-2">
          <div class="col-12 col-md-7">
            <label class="fw-semibold d-block mb-1 small">Nombre o Razón Social</label>
            <InputText v-model="nombreCliente" placeholder="Tu nombre o razón social" class="w-100" />
          </div>
          <div class="col-12 col-md-5">
            <label class="fw-semibold d-block mb-1 small">NIT / CI</label>
            <InputText v-model="documentoCliente" placeholder="NIT o CI" class="w-100" />
          </div>
        </div>

        <div class="border rounded p-2">
          <div v-for="(item, idx) in carrito" :key="item.pantalla.id"
            class="d-flex align-items-center justify-content-between border-bottom py-2 gap-2">
            <img :src="item.pantalla.fotografia"
              style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px" />
            <div class="flex-grow-1">
              <div class="fw-bold small">{{ item.pantalla.nombre }}</div>
              <div class="text-muted small">Bs. {{ item.pantalla.precioVenta }} c/u</div>
            </div>

            <div class="d-flex align-items-center gap-1">
              <Button type="button" label="-" size="small" severity="secondary"
                @click="cambiarCantidadCarrito(idx, -1)" />
              <span class="px-2 fw-bold">{{ item.cantidad }}</span>
              <Button type="button" label="+" size="small" severity="info" @click="cambiarCantidadCarrito(idx, 1)" />
            </div>

            <div class="fw-bold text-end" style="min-width: 85px">
              Bs. {{ (item.cantidad * Number(item.pantalla.precioVenta)).toFixed(2) }}
            </div>

            <Button type="button" label="Quitar" severity="danger" text size="small"
              @click="quitarDelCarrito(item.pantalla.id)" />
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center fw-bold fs-5 pt-2">
          <span>Total a Pagar:</span>
          <span class="text-info">Bs. {{ totalCarrito.toFixed(2) }}</span>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-2">
          <Button type="button" label="Seguir Viendo" severity="secondary" @click="mostrarCarrito = false" />
          <Button type="button" label="Confirmar Compra" @click="confirmarCompra" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.hero-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-bottom: 4px solid #06b6d4;
}

.product-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12) !important;
}
</style>
