/**
 * Iconos dibujados para esta casa: un solo grosor (1.6), remates
 * rectos, misma caja de 24. Nada de glifos unicode ni emoji.
 */

type Props = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
  focusable: false,
};

export function IconoOrden({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6h16v14H4z" />
      <path d="M8 6V4h8v2" />
      <path d="M8 11h8M8 15h5" />
    </svg>
  );
}

export function IconoCruz({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function IconoFlecha({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconoMas({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconoMenos({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14" />
    </svg>
  );
}
