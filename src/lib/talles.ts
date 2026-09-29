/**
 * Fuente única de la guía de talles. La consumen el modal global, la ficha de
 * producto y la página de información (antes estaba duplicada en dos lugares).
 */
export interface TablaTalles {
  key: 'ropa' | 'jeans';
  label: string;
  columnas: string[];
  filas: [string, ...string[]][];
}

export const TABLAS_TALLES: TablaTalles[] = [
  {
    key: 'ropa',
    label: 'Remeras, buzos y camperas',
    columnas: ['Talle', 'Pecho', 'Hombros', 'Largo', 'Cintura'],
    filas: [
      ['S', '86–92', '42–44', '68', '72–78'],
      ['M', '94–100', '45–47', '70', '80–86'],
      ['L', '102–108', '48–50', '72', '88–94'],
      ['XL', '110–116', '51–53', '74', '96–102'],
      ['XXL', '118–124', '54–56', '76', '104–110'],
    ],
  },
  {
    key: 'jeans',
    label: 'Jeans y pantalones',
    columnas: ['Talle', 'Cintura', 'Cadera', 'Largo', 'Tiro'],
    filas: [
      ['S', '72–78', '92–96', '100', '28'],
      ['M', '80–86', '98–102', '102', '29'],
      ['L', '88–94', '104–108', '104', '30'],
      ['XL', '96–102', '110–114', '106', '31'],
      ['XXL', '104–110', '116–120', '108', '32'],
    ],
  },
];

export const TIP_TALLES =
  'Medí una prenda tuya que te quede bien y compará con la tabla. Si estás entre dos talles, ' +
  'elegí el mayor: nuestros cortes baggy y oversize quedan mejor holgados.';

/** Qué tabla corresponde a cada categoría del stock. */
export function tablaParaCategoria(categoria?: string): TablaTalles {
  return categoria === 'pantalon' ? TABLAS_TALLES[1] : TABLAS_TALLES[0];
}
