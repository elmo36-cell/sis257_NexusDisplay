/**
 * Comparaciones del buscador de las tablas. Las centralizo acá para que todos
 * los listados comparen igual (sin mayúsculas ni espacios de sobra) y para no
 * repetir el mismo trim().toLowerCase() en cada componente.
 */

/** Paso el texto a minúsculas y le quito los espacios de los extremos. */
export function normalizarTexto(texto: string | null | undefined): string {
  return (texto ?? '').trim().toLowerCase()
}

/**
 * Dice si alguno de los campos coincide con lo escrito en el buscador. Los
 * campos se unen con un espacio, así una búsqueda puede cruzar nombre y código
 * (por ejemplo "samsung 24"). Con el buscador vacío todo coincide, que es lo
 * mismo que no filtrar.
 */
export function coincideBusqueda(
  texto: string,
  campos: (string | null | undefined)[],
): boolean {
  const buscado = normalizarTexto(texto)
  if (!buscado) return true
  return campos.join(' ').toLowerCase().includes(buscado)
}
