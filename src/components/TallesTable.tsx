import type { TablaTalles } from '@/lib/talles';

export function TallesTable({ tabla }: { tabla: TablaTalles }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[26rem] border-collapse text-[0.82rem]">
        <caption className="sr-only">{tabla.label} — medidas en centímetros</caption>
        <thead>
          <tr>
            {tabla.columnas.map((c) => (
              <th
                key={c}
                scope="col"
                className="border-b border-line px-3 py-2.5 text-left text-[0.66rem] font-medium tracking-[0.14em] whitespace-nowrap text-ink-3 uppercase"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.filas.map((fila) => (
            <tr key={fila[0]}>
              <th
                scope="row"
                className="border-b border-line px-3 py-2.5 text-left font-bold whitespace-nowrap text-ink"
              >
                {fila[0]}
              </th>
              {fila.slice(1).map((celda, i) => (
                <td
                  key={i}
                  className="border-b border-line px-3 py-2.5 whitespace-nowrap text-ink-2 tabular-nums"
                >
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
