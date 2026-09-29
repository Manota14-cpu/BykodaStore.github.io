/**
 * Enriquece public/stock.json con: subcategoria, calce, tela, composicion,
 * cuidados y descripcion. Idempotente: no pisa valores ya cargados a mano.
 * Uso: node scripts/enrich-stock.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const RUTA = new URL('../public/stock.json', import.meta.url);
const productos = JSON.parse(readFileSync(RUTA, 'utf8'));

/** Ficha técnica por subcategoría. */
const FICHAS = {
  jean: {
    calce: 'Regular',
    tela: 'Denim de algodón rígido, gramaje medio-pesado',
    composicion: '98% algodón · 2% elastano',
    cuidados: 'Lavar del revés con agua fría. No usar lavandina. Secar a la sombra.',
    descripcion:
      'Jean de denim premium con caída estructurada y terminaciones reforzadas.',
  },
  'jean-baggy': {
    calce: 'Baggy',
    tela: 'Denim de algodón rígido, gramaje pesado',
    composicion: '100% algodón',
    cuidados: 'Lavar del revés con agua fría. No usar lavandina. Secar a la sombra.',
    descripcion:
      'Jean baggy de tiro alto y pierna ancha, con caída suelta sobre el calzado.',
  },
  'jean-cargo': {
    calce: 'Baggy',
    tela: 'Denim de algodón rígido con bolsillos cargo reforzados',
    composicion: '100% algodón',
    cuidados: 'Lavar del revés con agua fría. No usar lavandina. Secar a la sombra.',
    descripcion:
      'Jean cargo carpintero de pierna amplia, con bolsillos laterales y presillas utilitarias.',
  },
  jogger: {
    calce: 'Regular',
    tela: 'Tricot deportivo liviano con forro de malla',
    composicion: '100% poliéster',
    cuidados: 'Lavar a máquina en frío, ciclo suave. No planchar sobre los apliques.',
    descripcion:
      'Pantalón deportivo de tricot con cintura elástica, cordón ajustable y puños tobilleros.',
  },
  remera: {
    calce: 'Regular',
    tela: 'Jersey de algodón peinado 24/1',
    composicion: '100% algodón',
    cuidados: 'Lavar del revés con agua fría. Planchar del revés a temperatura media.',
    descripcion:
      'Remera de algodón peinado con cuello reforzado y estampa de alta durabilidad.',
  },
  'remera-oversize': {
    calce: 'Oversize',
    tela: 'Jersey de algodón peinado 20/1, gramaje pesado',
    composicion: '100% algodón',
    cuidados: 'Lavar del revés con agua fría. Planchar del revés a temperatura media.',
    descripcion:
      'Remera oversize de corte boxy, hombro caído y gramaje pesado que mantiene la forma.',
  },
  hoodie: {
    calce: 'Oversize',
    tela: 'Frisa perchada premium con interior afelpado',
    composicion: '80% algodón · 20% poliéster',
    cuidados:
      'Lavar del revés con agua fría. No secar en secarropas. No planchar la estampa.',
    descripcion:
      'Buzo canguro de frisa perchada, con capucha forrada, puños acanalados y caída oversize.',
  },
  sweater: {
    calce: 'Regular',
    tela: 'Hilo de algodón tejido, punto cerrado',
    composicion: '70% algodón · 30% acrílico',
    cuidados: 'Lavar a mano o ciclo lana en frío. Secar en plano, sin colgar.',
    descripcion: 'Sweater de punto con cuello redondo, puños y cintura acanalados.',
  },
  campera: {
    calce: 'Regular',
    tela: 'Gabardina de algodón con bordado aplicado',
    composicion: '100% algodón',
    cuidados:
      'Lavar del revés con agua fría. Planchar a temperatura media sin tocar el bordado.',
    descripcion:
      'Campera de gabardina con bordado, forro interior y cierre metálico de alta resistencia.',
  },
  'track-jacket': {
    calce: 'Regular',
    tela: 'Tricot deportivo liviano con forro de malla',
    composicion: '100% poliéster',
    cuidados: 'Lavar a máquina en frío, ciclo suave. No planchar sobre los apliques.',
    descripcion:
      'Campera deportiva de tricot con cierre completo, cuello mao y bandas laterales.',
  },
};

/** Deduce la subcategoría a partir del nombre y la categoría. */
function deducirSubcategoria(producto) {
  const n = `${producto.nombre} ${producto.id}`.toLowerCase();
  if (producto.categoria === 'pantalon') {
    if (/jogger|track ?pant/.test(n)) return 'jogger';
    if (/cargo|carpintero/.test(n)) return 'jean-cargo';
    if (/baggy|skate/.test(n)) return 'jean-baggy';
    return 'jean';
  }
  if (producto.categoria === 'remera') {
    if (/oversize|boxy/.test(n)) return 'remera-oversize';
    return 'remera';
  }
  if (/track ?jacket|jacket|racer|tactical|campera|snow|zip hoodie/.test(n)) {
    return /zip hoodie/.test(n)
      ? 'hoodie'
      : /campera/.test(n)
        ? 'campera'
        : 'track-jacket';
  }
  if (/hoodie|buzo|canguro/.test(n)) return 'hoodie';
  if (/sweater|sweter/.test(n)) return 'sweater';
  return 'hoodie';
}

let cambios = 0;
for (const producto of productos) {
  const sub = producto.subcategoria || deducirSubcategoria(producto);
  const ficha = FICHAS[sub];
  const antes = JSON.stringify(producto);

  producto.subcategoria = sub;
  producto.calce = producto.calce || ficha.calce;
  producto.tela = producto.tela || ficha.tela;
  producto.composicion = producto.composicion || ficha.composicion;
  producto.cuidados = producto.cuidados || ficha.cuidados;
  if (!producto.descripcion) producto.descripcion = ficha.descripcion;

  if (JSON.stringify(producto) !== antes) cambios++;
}

writeFileSync(RUTA, JSON.stringify(productos, null, 2) + '\n', 'utf8');
console.log(`✓ ${cambios}/${productos.length} productos enriquecidos.`);
