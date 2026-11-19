import { computed, ref, watch } from 'vue'

// Cuántas filas muestro por página en las tablas y cuántos números de página
// muestro juntos antes de pasar al bloque siguiente (de 10 en 10).
export const FILAS_POR_PAGINA = 15
export const PAGINAS_POR_BLOQUE = 10

/**
 * Paginación para las tablas (inventario y clientes).
 * Recibo la lista ya filtrada y devuelvo solo las filas de la página actual,
 * más los datos que necesita la barra de páginas. Hago la cuenta a mano porque
 * así controlo el bloque de 10 números y el rango "mostrando X–Y de Z".
 */
export function usePaginacion<T>(
  filas: { readonly value: T[] },
  opciones: { porPagina?: number; porBloque?: number } = {},
) {
  const porPagina = opciones.porPagina ?? FILAS_POR_PAGINA
  const porBloque = opciones.porBloque ?? PAGINAS_POR_BLOQUE
  const paginaActual = ref(1)

  // Mínimo 1 página para no dividir entre cero cuando el filtro no devuelve nada.
  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(filas.value.length / porPagina)),
  )

  // Solo las filas que corresponden a la página en la que estoy parado.
  const filasPagina = computed(() => {
    const inicio = (paginaActual.value - 1) * porPagina
    return filas.value.slice(inicio, inicio + porPagina)
  })

  const inicioRango = computed(() =>
    filas.value.length === 0 ? 0 : (paginaActual.value - 1) * porPagina + 1,
  )
  const finRango = computed(() =>
    Math.min(paginaActual.value * porPagina, filas.value.length),
  )

  // Bloque de 10 números donde cae la página actual.
  const bloqueActual = computed(() => Math.ceil(paginaActual.value / porBloque))
  const totalBloques = computed(() => Math.max(1, Math.ceil(totalPaginas.value / porBloque)))

  const paginasBloque = computed(() => {
    const inicio = (bloqueActual.value - 1) * porBloque + 1
    const fin = Math.min(totalPaginas.value, inicio + porBloque - 1)
    const paginas: number[] = []
    for (let pagina = inicio; pagina <= fin; pagina++) paginas.push(pagina)
    return paginas
  })

  function irAPagina(pagina: number) {
    paginaActual.value = Math.min(Math.max(1, pagina), totalPaginas.value)
  }

  // Salto un bloque de 10 páginas hacia adelante o hacia atrás.
  function irABloque(delta: number) {
    irAPagina(paginaActual.value + delta * porBloque)
  }

  // Si la lista se achica (al filtrar o al borrar un registro) y la página
  // actual queda fuera de rango, me muevo a la última que existe.
  watch(totalPaginas, (total) => {
    if (paginaActual.value > total) paginaActual.value = total
  })

  return {
    porPagina,
    paginaActual,
    totalPaginas,
    filasPagina,
    inicioRango,
    finRango,
    bloqueActual,
    totalBloques,
    paginasBloque,
    irAPagina,
    irABloque,
  }
}
