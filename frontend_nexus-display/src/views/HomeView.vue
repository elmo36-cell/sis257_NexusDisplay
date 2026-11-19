<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import clienteApi from '@/plugins/axios'
import { useSesionStore } from '@/stores'
import { useCarritoStore } from '@/stores/carrito'
import { formatearMoneda, iniciales } from '@/helpers'
import { coincideBusqueda } from '@/helpers/busqueda'
import { notify } from '@/helpers/notificaciones'
import type { Pantalla } from '@/models/pantalla'
import type { Marca } from '@/models/marca'
import type { Calidad } from '@/models/calidad'
import type { Categoria } from '@/models/categoria'
import type { Almacen } from '@/models/almacen'

interface VendedorContacto {
  id: number
  nombreUsuario: string
  correo: string
  telefono?: string
  rol: string
}

const sesion = useSesionStore()
const carrito = useCarritoStore()

const pantallas = ref<Pantalla[]>([])
const marcas = ref<Marca[]>([])
const calidades = ref<Calidad[]>([])
const categorias = ref<Categoria[]>([])
const almacenes = ref<Almacen[]>([])
const vendedores = ref<VendedorContacto[]>([])

const cargando = ref(true)
const errorCarga = ref('')

const busqueda = ref('')
const filtroMarca = ref('')
const filtroCalidad = ref('')
const filtroCategoria = ref('')
// Una sola casilla para el marco: si está tildada solo muestro las pantallas
// armadas (con marco); si está destildada muestro todo el catálogo.
const soloConMarco = ref(false)

// Paginación del catálogo: cuántos productos veo por página y en cuál estoy.
// Dejo 12 por defecto porque la grilla se acomoda de a 6 columnas en pantallas anchas.
const OPCIONES_POR_PAGINA: number[] = [12, 24, 48]
const porPagina = ref<number>(12)
const paginaActual = ref(1)

const IMAGEN_FALLBACK =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#0b1220"/><rect x="152" y="66" width="96" height="168" rx="14" fill="none" stroke="#22d3ee" stroke-width="4"/><circle cx="200" cy="214" r="7" fill="#22d3ee"/></svg>',
  )

async function cargarLista<T>(url: string): Promise<{ datos: T[]; ok: boolean }> {
  try {
    const { data } = await clienteApi.get(url)
    return { datos: (Array.isArray(data) ? data : []) as T[], ok: true }
  } catch {
    return { datos: [] as T[], ok: false }
  }
}

async function cargarCatalogo() {
  cargando.value = true
  errorCarga.value = ''

  const [resPantallas, resMarcas, resCalidades, resCategorias, resAlmacenes, resVendedores] =
    await Promise.all([
      cargarLista<Pantalla>('pantallas'),
      cargarLista<Marca>('marcas'),
      cargarLista<Calidad>('calidades'),
      cargarLista<Categoria>('categorias'),
      cargarLista<Almacen>('almacenes'),
      cargarLista<VendedorContacto>('usuarios/contactos-vendedores'),
    ])

  pantallas.value = resPantallas.datos
  marcas.value = resMarcas.datos
  calidades.value = resCalidades.datos
  categorias.value = resCategorias.datos
  almacenes.value = resAlmacenes.datos
  vendedores.value = resVendedores.datos

  if (!resPantallas.ok) {
    errorCarga.value =
      'No se pudo conectar con el servidor. Verifica que la API esté disponible e inténtalo de nuevo.'
  }

  cargando.value = false

  // Si es un cliente registrado en una sucursal, dejo el carrito apuntando a esa
  // sucursal para que el stock que se valida al comprar sea el de su tienda.
  if (sesion.esCliente && idAlmacenSesion.value && !carrito.idAlmacen) {
    carrito.seleccionarAlmacen(idAlmacenSesion.value)
  }
}

// Sucursal de la persona logueada: el vendedor y el cliente miran el stock de
// la sucursal que tienen asignada (el cliente, la tienda donde se registró).
// Un visitante sin sesión o el admin ven el stock sumado de todas las tiendas.
const idAlmacenSesion = computed(() =>
  sesion.estaAutenticado && sesion.tieneSucursal ? Number(sesion.idAlmacen) : 0,
)

const nombreAlmacenSesion = computed(
  () => almacenes.value.find((almacen) => almacen.id === idAlmacenSesion.value)?.nombre ?? '',
)

function stockTotal(pantalla: Pantalla): number {
  const inventarios = pantalla.inventarios ?? []
  // Cuando hay sucursal en la sesión solo sumo las cantidades de esa sucursal,
  // así no ofrezco un producto que en su tienda no está disponible.
  const disponibles = idAlmacenSesion.value
    ? inventarios.filter((inv) => Number(inv.idAlmacen) === idAlmacenSesion.value)
    : inventarios
  return disponibles.reduce((acc, inv) => acc + Number(inv.cantidad || 0), 0)
}

const pantallasFiltradas = computed(() =>
  pantallas.value.filter((pantalla) => {
    const coincideTexto = coincideBusqueda(busqueda.value, [
      pantalla.nombre,
      pantalla.codigo,
      pantalla.modelo?.nombre,
      pantalla.modelo?.marca?.nombre,
      pantalla.categoria?.nombre,
      pantalla.calidad?.nombre,
    ])
    const coincideMarca = !filtroMarca.value || String(pantalla.modelo?.idMarca) === filtroMarca.value
    const coincideCalidad = !filtroCalidad.value || String(pantalla.idCalidad) === filtroCalidad.value
    const coincideCategoria =
      !filtroCategoria.value || String(pantalla.idCategoria) === filtroCategoria.value
    // La casilla de marco es opcional y solo aplica a Pantallas: si no está
    // tildada (o la categoría no es Pantallas) no filtra nada.
    const coincideMarco = !marcoDisponible.value || !soloConMarco.value || pantalla.conMarco

    return coincideTexto && coincideMarca && coincideCalidad && coincideCategoria && coincideMarco
  }),
)

const categoriasConConteo = computed(() =>
  categorias.value.map((categoria) => ({
    ...categoria,
    total: pantallas.value.filter((pantalla) => pantalla.idCategoria === categoria.id).length,
  })),
)

const categoriaActiva = computed(
  () => categorias.value.find((categoria) => String(categoria.id) === filtroCategoria.value)?.nombre ?? '',
)

// El marco solo existe en la categoría "Pantallas": las baterías, los pines de
// carga y las entradas de carga no se arman con marco, así que la casilla de
// "Con marco" queda deshabilitada cuando se elige cualquiera de esas categorías.
const marcoDisponible = computed(
  () => categoriaActiva.value.trim().toLowerCase() === 'pantallas',
)

// La calidad es un atributo de las Pantallas: en el resto de las categorías el
// select queda deshabilitado para no ofrecer un filtro que no aplica.
const calidadDisponible = computed(
  () => categoriaActiva.value.trim().toLowerCase() === 'pantallas',
)

// El título del buscador acompaña a la categoría elegida, porque el catálogo no
// es solo de pantallas.
const tituloBuscador = computed(() =>
  categoriaActiva.value ? `Buscar ${categoriaActiva.value.toLowerCase()}` : 'Buscar pantalla',
)

const hayFiltros = computed(
  () =>
    busqueda.value.trim() !== '' ||
    filtroMarca.value !== '' ||
    filtroCalidad.value !== '' ||
    filtroCategoria.value !== '' ||
    soloConMarco.value,
)

const conStock = computed(() => pantallas.value.filter((p) => stockTotal(p) > 0).length)

// Ordeno la lista ya filtrada: primero los que tienen stock y al final los
// agotados. Dentro de cada grupo ordeno por nombre para que el orden sea estable
// y no se muevan las tarjetas entre páginas.
const pantallasOrdenadas = computed(() =>
  [...pantallasFiltradas.value].sort((a, b) => {
    const stockA = stockTotal(a)
    const stockB = stockTotal(b)
    const tieneStockA = stockA > 0
    const tieneStockB = stockB > 0

    if (tieneStockA !== tieneStockB) return tieneStockA ? -1 : 1
    return (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es')
  }),
)

// Cantidad total de páginas según los resultados actuales (mínimo 1 para no
// dividir entre cero cuando el filtro no devuelve nada).
const totalPaginas = computed(() =>
  Math.max(1, Math.ceil(pantallasOrdenadas.value.length / porPagina.value)),
)

// Solo las tarjetas de la página en la que estoy parado.
const productosPagina = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value
  return pantallasOrdenadas.value.slice(inicio, inicio + porPagina.value)
})

const rangoInicio = computed(() =>
  pantallasOrdenadas.value.length === 0 ? 0 : (paginaActual.value - 1) * porPagina.value + 1,
)

const rangoFin = computed(() =>
  Math.min(paginaActual.value * porPagina.value, pantallasOrdenadas.value.length),
)

// Muestro solo unas páginas alrededor de la actual, así la barra no crece
// demasiado cuando hay cientos de productos.
const paginasVisibles = computed(() => {
  const ventana = 2
  const inicio = Math.max(1, paginaActual.value - ventana)
  const fin = Math.min(totalPaginas.value, paginaActual.value + ventana)
  const paginas: number[] = []

  for (let pagina = inicio; pagina <= fin; pagina++) paginas.push(pagina)
  return paginas
})

function irAPagina(pagina: number) {
  paginaActual.value = Math.min(Math.max(1, pagina), totalPaginas.value)
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroMarca.value = ''
  filtroCalidad.value = ''
  filtroCategoria.value = ''
  soloConMarco.value = false
  paginaActual.value = 1
}

function alternarMarca(idMarca: number) {
  filtroMarca.value = filtroMarca.value === String(idMarca) ? '' : String(idMarca)
}

function usarFallback(evento: Event) {
  const img = evento.target as HTMLImageElement
  if (img.src !== IMAGEN_FALLBACK) img.src = IMAGEN_FALLBACK
}

function agregarAlCarrito(pantalla: Pantalla) {
  const resultado = carrito.agregar(pantalla)

  if (!resultado.ok) {
    if (resultado.motivo === 'SIN_STOCK') {
      notify.error(`"${pantalla.nombre}" está agotado por el momento`)
    } else {
      notify.warn(`Solo hay ${resultado.disponible} unidad(es) disponibles de "${pantalla.nombre}"`)
    }
    return
  }

  if (!carrito.nombreCliente && sesion.estaAutenticado) {
    carrito.nombreCliente = sesion.nombreCompleto || sesion.usuario
  }

  notify.success(`"${pantalla.nombre}" agregado al carrito`)
  carrito.abrir()
}

// Si cambio cualquier filtro o el tamaño de página, vuelvo a la primera página
// para no quedar parado en una página que ya no existe.
watch(
  [busqueda, filtroMarca, filtroCalidad, filtroCategoria, soloConMarco, porPagina],
  () => {
    paginaActual.value = 1
  },
)

// Red de seguridad por si la lista se achica (por ejemplo al recargar catálogo)
// y la página actual queda fuera de rango.
watch(totalPaginas, (total) => {
  if (paginaActual.value > total) paginaActual.value = total
})

// Si cambio a una categoría que no es Pantallas, destildo "Con marco" para que
// no quede un filtro activo que ya no se puede usar.
watch(marcoDisponible, (disponible) => {
  if (!disponible) soloConMarco.value = false
})

// Igual con la calidad: al pasar a una categoría que no la usa, la saco del
// filtro para no dejar resultados escondidos por un select deshabilitado.
watch(calidadDisponible, (disponible) => {
  if (!disponible) filtroCalidad.value = ''
})

watch(
  () => carrito.catalogoVersion,
  () => cargarCatalogo(),
)

onMounted(() => {
  cargarCatalogo()
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="nexus-hero">
      <div class="nexus-hero__glow" aria-hidden="true"></div>
      <div class="container">
        <div class="row align-articulos-center g-4">
          <div class="col-lg-7">
            <span class="nexus-hero__eyebrow"><i class="pi pi-bolt"></i>Catálogo oficial</span>
            <h1 class="nexus-hero__title">
              Pantallas y repuestos con <em>stock verificado</em> por sucursal
            </h1>
            <p class="nexus-hero__text">
              Explora el catálogo por categoría, marca y calidad. Consulta la disponibilidad real de
              cada almacén y registra tu pedido en minutos.
            </p>

            <div class="nexus-hero__actions">
              <a href="#catalogo" class="btn btn-info fw-bold">
                <i class="pi pi-search me-2"></i>Ver catálogo
              </a>
              <a href="#contacto-vendedores" class="btn btn-outline-light">
                <i class="pi pi-comments me-2"></i>Hablar con un vendedor
              </a>
              <button v-if="carrito.unidades" type="button" class="btn btn-outline-light" @click="carrito.abrir()">
                <i class="pi pi-shopping-cart me-2"></i>
                Carrito ({{ carrito.unidades }})
              </button>
            </div>

            <div class="nexus-hero__stats">
              <div class="hero-stat">
                <span class="hero-stat__value">{{ pantallas.length }}</span>
                <span class="hero-stat__label">Productos</span>
              </div>
              <div class="hero-stat">
                <span class="hero-stat__value">{{ conStock }}</span>
                <span class="hero-stat__label">Con stock</span>
              </div>
              <div class="hero-stat">
                <span class="hero-stat__value">{{ marcas.length }}</span>
                <span class="hero-stat__label">Marcas</span>
              </div>
            </div>

            <div class="hero-highlights">
              <span><i class="pi pi-verified"></i>Stock real por sucursal</span>
              <span><i class="pi pi-credit-card"></i>Transferencia, QR o efectivo</span>
              <span><i class="pi pi-truck"></i>Retiro en tienda</span>
            </div>
          </div>

          <div class="col-lg-5 d-none d-lg-flex justify-content-end">
            <div class="info-card hero-panel">
              <div class="d-flex align-articulos-center gap-2 mb-3">
                <span class="nexus-brand__mark" style="width: 30px; height: 30px; font-size: 0.85rem">
                  <i class="pi pi-shield"></i>
                </span>
                <strong class="text-white">Compra protegida</strong>
              </div>
              <ul class="hero-panel__list mb-0 ps-3">
                <li>Stock validado contra inventario real</li>
                <li>Retiro en la sucursal que elijas</li>
                <li>Pago por transferencia, QR o efectivo</li>
              </ul>
              <div class="hero-panel__foot">
                <i class="pi pi-headphones"></i> ¿Dudas? Escríbenos por WhatsApp
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div id="catalogo" class="container page-shell">
      <div v-if="errorCarga" class="alert alert-warning d-flex align-articulos-center gap-2 mb-4" role="alert">
        <i class="pi pi-exclamation-triangle"></i>
        <span class="flex-grow-1">{{ errorCarga }}</span>
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="cargarCatalogo">
          Reintentar
        </button>
      </div>

      <div class="catalog-head">
        <div>
          <span class="section-label">Catálogo</span>
          <h2 class="catalog-head__title">Encuentra la pantalla exacta</h2>
          <p class="catalog-head__text">
            Filtra por categoría, marca o calidad y agrega al carrito con stock real de tu sucursal.
          </p>
        </div>
        <div class="catalog-head__stat">
          <span>{{ pantallasFiltradas.length }}</span>
          <small>resultados</small>
        </div>
      </div>

      <!-- Marcas -->
      <section v-if="marcas.length" class="mb-3">
        <h2 class="section-label">Marcas disponibles</h2>
        <div class="d-flex flex-wrap gap-2">
          <button v-for="marca in marcas" :key="marca.id" type="button" class="brand-chip"
            :class="{ 'is-active': filtroMarca === String(marca.id) }" @click="alternarMarca(marca.id)">
            <img v-if="marca.fotografia" class="brand-chip__logo" :src="marca.fotografia" alt="" loading="lazy"
              @error="usarFallback" />
            <span v-else class="brand-chip__initial">{{ iniciales(marca.nombre) }}</span>
            <span>{{ marca.nombre }}</span>
          </button>
        </div>
      </section>

      <!-- Filtros -->
      <div class="filter-bar">
        <div class="filter-bar__category">
          <label class="form-label d-block mb-1" for="filtro-categoria">
            <i class="pi pi-th-large me-1"></i>Categoría
          </label>
          <select id="filtro-categoria" v-model="filtroCategoria" class="form-select">
            <option value="">Todas las categorías ({{ pantallas.length }})</option>
            <option v-for="categoria in categoriasConConteo" :key="categoria.id" :value="String(categoria.id)">
              {{ categoria.nombre }} ({{ categoria.total }})
            </option>
          </select>
        </div>

        <div class="filter-bar__search">
          <label class="form-label d-block mb-1" for="filtro-busqueda">{{ tituloBuscador }}</label>
          <div class="position-relative">
            <i class="pi pi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
              style="font-size: 0.85rem"></i>
            <input id="filtro-busqueda" v-model="busqueda" class="form-control ps-5" type="search"
              placeholder="Modelo, marca, SKU o categoría…" />
          </div>
        </div>

        <div>
          <label class="form-label d-block mb-1" for="filtro-calidad"
            :class="{ 'text-muted': !calidadDisponible }">Calidad</label>
          <select id="filtro-calidad" v-model="filtroCalidad" class="form-select"
            style="min-width: 9rem" :disabled="!calidadDisponible">
            <option value="">Todas las calidades</option>
            <option v-for="calidad in calidades" :key="calidad.id" :value="String(calidad.id)">
              {{ calidad.nombre }}
            </option>
          </select>
          <small v-if="!calidadDisponible" class="text-muted">Solo para Pantallas</small>
        </div>

        <div>
          <span class="form-label d-block mb-1"><i class="pi pi-check-square me-1"></i>Marco</span>
          <div class="form-check">
            <input id="filtro-con-marco" v-model="soloConMarco" class="form-check-input" type="checkbox"
              :disabled="!marcoDisponible" />
            <label class="form-check-label" :class="{ 'text-muted': !marcoDisponible }" for="filtro-con-marco">
              Con marco
            </label>
          </div>
          <small v-if="!marcoDisponible" class="text-muted">Solo para Pantallas</small>
        </div>

        <div class="align-self-end">
          <button type="button" class="btn btn-outline-secondary w-100" :disabled="!hayFiltros" @click="limpiarFiltros">
            <i class="pi pi-filter-slash me-1"></i>Limpiar
          </button>
        </div>
      </div>

      <div class="d-flex flex-wrap align-articulos-center justify-content-between gap-2 mb-3">
        <p class="m-0 muted small">
          Mostrando <strong class="text-dark">{{ rangoInicio }}–{{ rangoFin }}</strong> de
          <strong class="text-dark">{{ pantallasOrdenadas.length }}</strong> productos
          <span v-if="totalPaginas > 1" class="ms-1">(página {{ paginaActual }} de {{ totalPaginas }})</span>
          <span v-if="categoriaActiva" class="badge bg-info text-dark ms-1">{{ categoriaActiva }}</span>
          <span v-if="idAlmacenSesion" class="badge bg-light text-dark border ms-1">
            <i class="pi pi-building me-1"></i>Stock de {{ nombreAlmacenSesion || 'tu sucursal' }}
          </span>
        </p>
        <div class="d-flex align-articulos-center gap-2">
          <label class="muted small m-0" for="por-pagina">Por página</label>
          <select id="por-pagina" v-model.number="porPagina" class="form-select form-select-sm" style="width: auto">
            <option v-for="opcion in OPCIONES_POR_PAGINA" :key="opcion" :value="opcion">{{ opcion }}</option>
          </select>
          <button v-if="carrito.unidades" type="button" class="btn btn-sm btn-outline-primary" @click="carrito.abrir()">
            <i class="pi pi-shopping-cart me-1"></i>Ver carrito ({{ carrito.unidades }})
          </button>
        </div>
      </div>

      <!-- Grilla de productos -->
      <div v-if="cargando" class="row g-3">
        <div v-for="n in 12" :key="`skeleton-${n}`" class="col-6 col-md-4 col-lg-3 col-xxl-2">
          <div class="skeleton-card skeleton-card--compact"></div>
        </div>
      </div>

      <div v-else-if="pantallasOrdenadas.length" class="row g-3 product-grid">
        <div v-for="pantalla in productosPagina" :key="pantalla.id" class="col-6 col-md-4 col-lg-3 col-xxl-2">
          <article class="product-card product-card--compact">
            <div class="product-card__media">
              <img :src="pantalla.fotografia || IMAGEN_FALLBACK" :alt="pantalla.nombre" loading="lazy"
                @error="usarFallback" />
              <span class="product-card__tag product-card__tag--left">
                {{ pantalla.calidad?.nombre || 'Estándar' }}
              </span>
              <span class="product-card__tag product-card__tag--right"
                :class="stockTotal(pantalla) > 0 ? 'product-card__tag--ok' : 'product-card__tag--out'">
                {{ stockTotal(pantalla) > 0 ? `${stockTotal(pantalla)} stock` : 'Agotado' }}
              </span>
            </div>

            <div class="product-card__body">
              <div class="product-card__meta">
                {{ pantalla.modelo?.marca?.nombre || 'Genérico' }} · {{ pantalla.modelo?.nombre || 'Universal' }}
              </div>
              <h3 class="product-card__title" :title="pantalla.nombre">{{ pantalla.nombre }}</h3>

              <div class="product-card__tags">
                <span class="mini-tag">{{ pantalla.categoria?.nombre || 'General' }}</span>
                <span v-if="pantalla.color" class="mini-tag mini-tag--ghost">{{ pantalla.color }}</span>
                <span class="mini-tag mini-tag--ghost">{{ pantalla.conMarco ? 'Con marco' : 'Sin marco' }}</span>
              </div>

              <div class="product-card__footer">
                <div class="price">{{ formatearMoneda(pantalla.precioVenta) }}</div>
                <button type="button" class="btn btn-primary btn-sm product-card__add"
                  :disabled="stockTotal(pantalla) <= 0" title="Agregar al carrito"
                  :aria-label="`Agregar ${pantalla.nombre} al carrito`" @click="agregarAlCarrito(pantalla)">
                  <i class="pi pi-plus"></i>
                  <span class="d-none d-sm-inline ms-1">Agregar</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Paginación -->
      <nav v-if="!cargando && totalPaginas > 1" class="catalog-pagination" aria-label="Paginación del catálogo">
        <button type="button" class="catalog-pagination__btn" :disabled="paginaActual === 1"
          aria-label="Primera página" @click="irAPagina(1)">
          <i class="pi pi-angle-double-left"></i>
        </button>
        <button type="button" class="catalog-pagination__btn" :disabled="paginaActual === 1"
          aria-label="Página anterior" @click="irAPagina(paginaActual - 1)">
          <i class="pi pi-angle-left"></i>
        </button>

        <button v-for="pagina in paginasVisibles" :key="`pagina-${pagina}`" type="button"
          class="catalog-pagination__btn catalog-pagination__btn--num"
          :class="{ 'is-active': pagina === paginaActual }" :aria-current="pagina === paginaActual ? 'page' : undefined"
          @click="irAPagina(pagina)">
          {{ pagina }}
        </button>

        <button type="button" class="catalog-pagination__btn" :disabled="paginaActual === totalPaginas"
          aria-label="Página siguiente" @click="irAPagina(paginaActual + 1)">
          <i class="pi pi-angle-right"></i>
        </button>
        <button type="button" class="catalog-pagination__btn" :disabled="paginaActual === totalPaginas"
          aria-label="Última página" @click="irAPagina(totalPaginas)">
          <i class="pi pi-angle-double-right"></i>
        </button>
      </nav>

      <div v-if="!cargando && !pantallasOrdenadas.length && !errorCarga" class="surface-card empty-state">
        <div class="empty-state__icon"><i class="pi pi-inbox"></i></div>
        <h3 class="h5 mb-1">Sin resultados</h3>
        <p class="mb-3">
          No encontramos productos con esos filtros. Prueba con otra marca, calidad o categoría.
        </p>
        <button type="button" class="btn btn-outline-secondary" @click="limpiarFiltros">
          Limpiar filtros
        </button>
      </div>

      <!-- Contacto y almacenes -->
      <section class="row g-4 mt-5">
        <div id="contacto-vendedores" class="col-lg-6">
          <div class="info-card info-card--accent">
            <h2 class="h5 fw-bold mb-1">Contacto de vendedores</h2>
            <p class="small muted mb-2">Atención directa para consultas de stock y pedidos.</p>

            <div v-if="!vendedores.length" class="empty-state py-4">
              <i class="pi pi-user me-2"></i>No hay vendedores de contacto registrados.
            </div>

            <div v-for="vendedor in vendedores" :key="vendedor.id" class="contact-row">
              <div>
                <div class="contact-row__name">
                  {{ vendedor.nombreUsuario }}
                  <span class="badge bg-secondary ms-1">{{ vendedor.rol }}</span>
                </div>
                <div class="small text-secondary">
                  <i class="pi pi-phone me-1"></i>{{ vendedor.telefono || 'Teléfono no registrado' }}
                </div>
                <div class="small text-secondary">
                  <i class="pi pi-envelope me-1"></i>{{ vendedor.correo }}
                </div>
              </div>

              <div class="d-flex gap-2">
                <a v-if="vendedor.telefono" class="btn btn-sm btn-success"
                  :href="`https://wa.me/591${vendedor.telefono.replace(/\D/g, '')}`" target="_blank"
                  rel="noopener noreferrer">
                  <i class="pi pi-whatsapp me-1"></i>WhatsApp
                </a>
                <a class="btn btn-sm btn-outline-primary"
                  :href="`mailto:${vendedor.correo}?subject=Consulta%20Catálogo%20Nexus%20Display`">
                  <i class="pi pi-envelope me-1"></i>Correo
                </a>
              </div>
            </div>
          </div>
        </div>

        <div id="direcciones-almacenes" class="col-lg-6">
          <div class="info-card">
            <h2 class="h5 fw-bold mb-1">Direcciones de almacenes</h2>
            <p class="small muted mb-3">Sucursales disponibles para el retiro de tus compras.</p>

            <div v-if="!almacenes.length" class="empty-state py-4">
              <i class="pi pi-building me-2"></i>No hay almacenes registrados.
            </div>

            <div class="d-flex flex-column gap-2">
              <div v-for="almacen in almacenes" :key="almacen.id" class="warehouse-articulo">
                <div class="warehouse-item__name">{{ almacen.nombre }}</div>
                <div class="warehouse-item__address">
                  <i class="pi pi-map-marker me-1"></i>{{ almacen.direccion }}
                  <template v-if="almacen.telefono">
                    · <i class="pi pi-phone me-1"></i>{{ almacen.telefono }}
                  </template>
                </div>
              </div>
            </div>

            <p v-if="!sesion.estaAutenticado" class="small muted mt-3 mb-0">
              <RouterLink to="/registro" class="fw-semibold">Regístrate como usuario nuevo</RouterLink>
              o <RouterLink to="/login" class="fw-semibold">inicia sesión</RouterLink>
              para pagar y elegir tu sucursal de retiro.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Barra de paginación del catálogo: botones chicos y cuadrados, alineados al centro. */
.catalog-pagination {
  display: flex;
  flex-wrap: wrap;
  align-articulos: center;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 1.8rem;
}

.catalog-pagination__btn {
  display: grid;
  place-articulos: center;
  min-width: 38px;
  height: 38px;
  padding: 0 0.55rem;
  border: 1px solid var(--nexus-border);
  border-radius: 10px;
  background-color: var(--nexus-surface);
  color: var(--nexus-text);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.catalog-pagination__btn:hover:not(:disabled) {
  border-color: var(--nexus-accent);
  background-color: var(--nexus-accent-soft);
  color: var(--nexus-accent-strong);
}

.catalog-pagination__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.catalog-pagination__btn.is-active {
  border-color: var(--nexus-accent-strong);
  background-color: var(--nexus-accent-strong);
  color: #fff;
}

@media (max-width: 575.98px) {
  .catalog-pagination__btn {
    min-width: 34px;
    height: 34px;
  }
}
</style>
