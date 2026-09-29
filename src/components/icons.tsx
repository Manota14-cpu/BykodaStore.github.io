/**
 * Iconos SVG compartidos. Antes el path de WhatsApp estaba copiado en cuatro
 * componentes distintos (~1 KB duplicado por copia en el bundle).
 */

interface IconProps {
  size?: number;
  className?: string;
}

export function IconWhatsapp({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.48.676 4.8 1.852 6.788L2 30l7.404-1.824A13.936 13.936 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 01-5.896-1.612l-.42-.252-4.396 1.084 1.112-4.272-.276-.44A11.554 11.554 0 014.4 16C4.4 9.592 9.592 4.4 16 4.4S27.6 9.592 27.6 16 22.408 27.6 16 27.6zm6.34-8.664c-.348-.176-2.06-1.016-2.38-1.132-.32-.116-.552-.176-.784.176-.232.348-.9 1.132-1.104 1.364-.2.232-.404.26-.752.084-.348-.176-1.468-.54-2.796-1.724-1.032-.924-1.728-2.064-1.932-2.412-.2-.348-.02-.536.152-.708.156-.156.348-.404.524-.608.176-.2.232-.348.348-.58.116-.232.06-.436-.028-.612-.088-.176-.784-1.892-1.076-2.592-.284-.68-.572-.588-.784-.596l-.668-.012c-.232 0-.608.088-.928.436-.316.348-1.212 1.184-1.212 2.888s1.24 3.352 1.412 3.584c.176.232 2.44 3.728 5.916 5.228.828.356 1.472.568 1.976.728.832.264 1.588.228 2.184.14.668-.1 2.06-.844 2.348-1.66.292-.816.292-1.516.204-1.664-.084-.148-.316-.232-.664-.408z" />
    </svg>
  );
}

export function IconInstagram({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function IconFlecha({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconCorazon({
  lleno = false,
  size = 18,
}: IconProps & { lleno?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={lleno ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21.2l7.7-7.8 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
