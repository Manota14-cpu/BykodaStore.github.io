#!/usr/bin/env node
/**
 * Genera la entrada de un cupón para `public/cupones.json`, con el código
 * convertido en hash (el archivo es público y no debe mostrar los códigos).
 *
 *   npm run cupon -- CODIGO DESCUENTO [--vence AAAA-MM-DD] [--usos N] [--inactivo]
 *
 * Ejemplo:
 *   npm run cupon -- VERANO20 20 --vence 2027-01-31 --usos 1
 *
 * Pegá el resultado dentro de "cupones" y subí `VERSION` en src/api/local.ts.
 * Anotá el código real en el repo privado (bykoda-interno/marca/cupones.md).
 */
import { createHash } from 'node:crypto';

const SAL = 'bykoda:';
const args = process.argv.slice(2);

function opcion(nombre) {
  const i = args.indexOf(nombre);
  if (i === -1) return undefined;
  const valor = args[i + 1];
  args.splice(i, 2);
  return valor;
}

const inactivo = args.includes('--inactivo');
if (inactivo) args.splice(args.indexOf('--inactivo'), 1);
const vence = opcion('--vence') ?? null;
const usos = Number(opcion('--usos') ?? -1);
const [codigo, descuentoTexto] = args;
const descuento = Number(descuentoTexto);

if (!codigo || !Number.isInteger(descuento) || descuento <= 0 || descuento > 100) {
  console.error('Uso: npm run cupon -- CODIGO DESCUENTO [--vence AAAA-MM-DD] [--usos N] [--inactivo]');
  process.exit(1);
}
if (vence && !/^\d{4}-\d{2}-\d{2}$/.test(vence)) {
  console.error('La fecha de --vence tiene que ser AAAA-MM-DD.');
  process.exit(1);
}

const hash = createHash('sha256')
  .update(SAL + codigo.trim().toUpperCase())
  .digest('hex');

console.log(
  JSON.stringify({ hash, descuento, activo: !inactivo, usos_max: usos, vence }, null, 2),
);
