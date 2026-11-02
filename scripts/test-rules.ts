import { calcularVuelto } from "../src/lib/money";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(calcularVuelto(50, 30) === 20, "vuelto 50-30");
assert(calcularVuelto(20, 30) === 0, "vuelto no negativo");
assert(calcularVuelto(0, 10) === 0, "sin pago");

console.log("test:rules OK");
