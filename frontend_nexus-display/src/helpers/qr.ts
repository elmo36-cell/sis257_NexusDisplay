// El dibujo del QR es de 21x21 celdas, el mismo tamaño que declara la grilla
// .qr-demo en app.css. Si cambia uno hay que cambiar el otro.
const LADO_QR = 21

/**
 * Armo el patrón decorativo de celdas de un QR de demostración (no procesa
 * pagos reales). Uso una semilla fija para que el dibujo salga siempre igual y
 * no cambie en cada render.
 */
export function generarPatronQr(): boolean[] {
  const celdas: boolean[] = []
  let semilla = 20261118
  for (let indice = 0; indice < LADO_QR * LADO_QR; indice += 1) {
    semilla = (semilla * 1103515245 + 12345) % 2147483648
    celdas.push(semilla % 100 > 46)
  }
  return celdas
}
