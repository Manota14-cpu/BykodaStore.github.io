/**
 * "Stock y precios en vivo": todo el catálogo sale de la plataforma, así que se
 * muestra mientras esté respondiendo.
 */
export function EstadoConexion({
  caida,
  actualizado,
  cargando,
}: {
  caida: boolean;
  actualizado: number | null;
  cargando: boolean;
}) {
  if (cargando || caida) return null;
  const hora = actualizado
    ? new Date(actualizado).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <p
      role="status"
      title={hora ? `Última actualización: ${hora}` : undefined}
      className="inline-flex items-center gap-2.5 rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-2"
    >
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-exito opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-exito" />
      </span>
      Stock y precios en vivo
    </p>
  );
}
