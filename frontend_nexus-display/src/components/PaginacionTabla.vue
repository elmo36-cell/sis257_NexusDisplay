<script setup lang="ts">
// Barra de páginas de las tablas. Antes cada listado copiaba el mismo bloque de
// botones, así que lo saco aquí: el listado solo pasa los datos de
// usePaginacion y yo aviso hacia atrás cuando eligen otra página o bloque.
const props = withDefaults(
  defineProps<{
    paginaActual: number
    totalPaginas: number
    inicioRango: number
    finRango: number
    totalRegistros: number
    paginasBloque: number[]
    etiqueta?: string
    ariaLabel?: string
  }>(),
  {
    etiqueta: 'registros',
    ariaLabel: 'Paginación de la tabla',
  },
)

const emit = defineEmits<{ irAPagina: [pagina: number]; irABloque: [delta: number] }>()
</script>

<template>
  <!-- Si el filtro no devuelve nada no muestro la barra, para no dejar un
       "Mostrando 0–0 de 0" colgando debajo de la tabla vacía. -->
  <div v-if="props.totalRegistros"
    class="d-flex flex-wrap align-items-center justify-content-between gap-2">
    <span class="tabla-paginacion__info">
      Mostrando <strong>{{ inicioRango }}–{{ finRango }}</strong> de {{ totalRegistros }} {{ etiqueta }}
      <span v-if="totalPaginas > 1">· página {{ paginaActual }} de {{ totalPaginas }}</span>
    </span>

    <nav v-if="totalPaginas > 1" class="tabla-paginacion m-0" :aria-label="ariaLabel">
      <button type="button" class="tabla-paginacion__btn" :disabled="paginaActual === 1"
        aria-label="Bloque anterior de páginas" @click="emit('irABloque', -1)">
        <i class="pi pi-angle-double-left"></i>
      </button>
      <button type="button" class="tabla-paginacion__btn" :disabled="paginaActual === 1"
        aria-label="Página anterior" @click="emit('irAPagina', paginaActual - 1)">
        <i class="pi pi-angle-left"></i>
      </button>

      <button v-for="pagina in paginasBloque" :key="`pagina-${pagina}`" type="button"
        class="tabla-paginacion__btn" :class="{ 'is-active': pagina === paginaActual }"
        :aria-current="pagina === paginaActual ? 'page' : undefined"
        @click="emit('irAPagina', pagina)">
        {{ pagina }}
      </button>

      <button type="button" class="tabla-paginacion__btn" :disabled="paginaActual === totalPaginas"
        aria-label="Página siguiente" @click="emit('irAPagina', paginaActual + 1)">
        <i class="pi pi-angle-right"></i>
      </button>
      <button type="button" class="tabla-paginacion__btn" :disabled="paginaActual === totalPaginas"
        aria-label="Bloque siguiente de páginas" @click="emit('irABloque', 1)">
        <i class="pi pi-angle-double-right"></i>
      </button>
    </nav>
  </div>
</template>
