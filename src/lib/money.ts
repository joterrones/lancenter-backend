export function calcularVuelto(acuenta: number, totalPendiente: number): number {
  return Math.max(0, acuenta - totalPendiente);
}
