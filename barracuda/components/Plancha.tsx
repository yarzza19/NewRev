import type { Corte, Forma } from '@/lib/catalogo';
import estilos from './Plancha.module.css';

/**
 * La plancha del corte. Si la ficha trae foto, manda la foto. Si no,
 * se dibuja el objeto a tinta: un catálogo recién empezado tiene que
 * poder publicarse sin una sola fotografía y seguir pareciendo hecho.
 */

type Props = {
  corte: Corte;
  detalle?: 'completo' | 'seco';
  prioridad?: boolean;
};

const DIBUJOS: Record<Forma, React.ReactNode> = {
  hoja: (
    <g>
      <path d="M250 76 L296 316 Q298 330 284 330 L216 330 Q202 330 204 316 C212 234 230 146 250 76 Z" />
      <path d="M214 336 h72 v18 h-72 z" />
      <path d="M220 360 h60 c5 0 8 4 8 9 l-5 156 c0 8-6 13-13 13 h-40 c-7 0-13-5-13-13 l-5-156 c0-5 3-9 8-9 z" />
      <path className="brillo" d="M250 96 L288 314" />
      <circle className="brillo" cx="250" cy="430" r="7" />
    </g>
  ),
  losa: (
    <g>
      <path d="M104 196 h272 c9 0 16 7 16 16 v196 c0 9-7 16-16 16 h-272 c-9 0-16-7-16-16 v-196 c0-9 7-16 16-16 z" />
      <path className="brillo" d="M104 214 h272" />
      <path className="brillo" d="M132 250 c60 22 148 10 216 30" />
      <path className="brillo" d="M124 302 c74 -18 160 14 236 -6" />
      <path className="brillo" d="M140 356 c56 20 132 -12 200 8" />
    </g>
  ),
  cuenco: (
    <g>
      <path d="M126 268 a114 40 0 0 0 228 0 v4 c0 74-51 128-114 128 s-114-54-114-128 z" />
      <ellipse cx="240" cy="268" rx="114" ry="40" />
      <ellipse className="hueco" cx="240" cy="268" rx="92" ry="30" />
      <path className="brillo" d="M168 330 c14 46 40 66 72 70" />
    </g>
  ),
  varilla: (
    <g>
      <path d="M228 92 h24 c4 0 7 3 7 7 v268 h-38 v-268 c0-4 3-7 7-7 z" />
      <path d="M212 372 h56 v18 h-56 z" />
      <path d="M216 396 h48 c4 0 7 3 7 7 v122 c0 4-3 7-7 7 h-48 c-4 0-7-3-7-7 v-122 c0-4 3-7 7-7 z" />
      <circle className="hueco" cx="240" cy="502" r="9" />
      <path className="brillo" d="M240 112 v250" />
    </g>
  ),
  aro: (
    <g>
      {/* El aro y la barra de ferrocerio son dos piezas y se dibujan
          separadas: juntas se leían como un solo glifo. */}
      <path d="M240 128 a124 124 0 1 0 0.1 0 z m0 44 a80 80 0 1 1 -0.1 0 z" />
      <path d="M158 424 h164 c7 0 12 5 12 12 v20 c0 7-5 12-12 12 h-164 c-7 0-12-5-12-12 v-20 c0-7 5-12 12-12 z" />
      <path className="brillo" d="M196 190 a80 80 0 0 0 -24 62" />
      <path className="brillo" d="M164 436 v20" />
    </g>
  ),
  gancho: (
    <g>
      <path d="M148 118 h56 c5 0 9 4 9 9 v92 h-74 v-92 c0-5 4-9 9-9 z" />
      <path
        className="trazoGrueso"
        d="M176 236 v128 c0 62 62 96 118 62"
        fill="none"
        strokeWidth="30"
        strokeLinecap="round"
      />
      <circle className="hueco" cx="176" cy="146" r="9" />
      <circle className="hueco" cx="176" cy="192" r="9" />
    </g>
  ),
};

export default function Plancha({ corte, detalle = 'completo', prioridad = false }: Props) {
  const enAmarillo = corte.plancha.fondo === 'amarillo';

  if (corte.imagen) {
    return (
      <figure className={`${estilos.marco} ${enAmarillo ? estilos.amarillo : estilos.papel}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={estilos.foto}
          src={corte.imagen}
          alt={`${corte.nombre}. ${corte.sumario}`}
          loading={prioridad ? 'eager' : 'lazy'}
          decoding="async"
        />
        {detalle === 'completo' && <Pie corte={corte} />}
      </figure>
    );
  }

  return (
    <figure className={`${estilos.marco} ${enAmarillo ? estilos.amarillo : estilos.papel}`}>
      <svg
        className={estilos.dibujo}
        viewBox="0 0 480 620"
        role="img"
        aria-label={`Dibujo de ${corte.nombre}. ${corte.sumario}`}
      >
        <defs>
          <pattern
            id={`trama-${corte.slug}`}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <circle cx="1.5" cy="1.5" r="1.15" />
          </pattern>
        </defs>

        {/* Marcas de registro: el pliego declara sus propios bordes. */}
        <g className={estilos.registro}>
          <path d="M30 14 v22 M18 26 h22" />
          <path d="M450 14 v22 M442 26 h22" />
          <path d="M30 606 v-22 M18 594 h22" />
          <path d="M450 606 v-22 M442 594 h22" />
        </g>

        <rect className={estilos.trama} x="0" y="0" width="480" height="620" fill={`url(#trama-${corte.slug})`} />

        <g className={estilos.cuerpo}>{DIBUJOS[corte.plancha.forma]}</g>

        {detalle === 'completo' && corte.medidas && (
          <g className={estilos.cota}>
            <path d="M88 566 h304" />
            <path d="M88 558 v16 M392 558 v16" />
            <text x="240" y="550" textAnchor="middle">
              {corte.medidas}
            </text>
          </g>
        )}
      </svg>
      {detalle === 'completo' && <Pie corte={corte} />}
    </figure>
  );
}

function Pie({ corte }: { corte: Corte }) {
  return (
    <figcaption className={`dato ${estilos.leyenda}`}>
      <span>{corte.ref}</span>
      <span>{corte.imagen ? 'Fotografía' : 'Dibujo de taller'}</span>
    </figcaption>
  );
}
