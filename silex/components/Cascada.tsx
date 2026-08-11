'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { euros, type Corte } from '@/lib/catalogo';
import Plancha from './Plancha';
import estilos from './Cascada.module.css';

/**
 * La cascada del espécimen. En un pliego de fundición es la misma
 * palabra repetida a tamaños decrecientes; aquí cada escalón es un
 * corte distinto, y el índice del catálogo y la muestra de tamaños
 * son la misma cosa.
 *
 * La plancha sigue al puntero por la banda derecha. Sin puntero
 * —teclado, táctil, movimiento reducido— se ancla y aparece sin
 * desplazamiento: la relación se explica igual.
 */

export default function Cascada({ cortes }: { cortes: Corte[] }) {
  const [activo, setActivo] = useState<Corte | null>(null);
  const seguidor = useRef<HTMLDivElement>(null);
  const destino = useRef({ y: 0 });
  const actual = useRef({ y: 0 });
  const cuadro = useRef<number | null>(null);
  const reducido = useRef(false);

  useEffect(() => {
    reducido.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const animar = useCallback(() => {
    const nodo = seguidor.current;
    if (!nodo) return;
    actual.current.y += (destino.current.y - actual.current.y) * 0.14;
    nodo.style.transform = `translate3d(0, ${actual.current.y.toFixed(1)}px, 0)`;
    if (Math.abs(destino.current.y - actual.current.y) > 0.4) {
      cuadro.current = requestAnimationFrame(animar);
    } else {
      cuadro.current = null;
    }
  }, []);

  const alMover = useCallback(
    (evento: React.PointerEvent<HTMLElement>) => {
      if (reducido.current || evento.pointerType !== 'mouse') return;
      const caja = evento.currentTarget.getBoundingClientRect();
      destino.current.y = evento.clientY - caja.top - 150;
      if (cuadro.current === null) cuadro.current = requestAnimationFrame(animar);
    },
    [animar],
  );

  useEffect(() => {
    return () => {
      if (cuadro.current !== null) cancelAnimationFrame(cuadro.current);
    };
  }, []);

  return (
    <section
      className={estilos.cascada}
      id="catalogo"
      aria-labelledby="titulo-cascada"
      onPointerMove={alMover}
    >
      <div className={estilos.encabezado}>
        <h2 id="titulo-cascada" className="seccion">
          El catálogo entero, en cascada
        </h2>
        <p className={`dato ${estilos.cuentaCortes}`}>
          {String(cortes.length).padStart(2, '0')} cortes
        </p>
      </div>

      <ol className={estilos.escalones}>
        {cortes.map((corte, indice) => {
          // Cada escalón baja un peldaño de tamaño hasta un suelo
          // legible: con veinte productos la cascada sigue siendo
          // una cascada y no un titular repetido.
          const escala = Math.max(0.42, 1 - indice * 0.11);
          // Y estrecha el eje de ancho a la vez: una cascada de
          // fundición muestra el rango de la cara, no sólo su cuerpo.
          const ancho = Math.max(78, 100 - indice * 3);
          return (
            <li
              key={corte.slug}
              className={estilos.escalon}
              style={{ ['--escala' as string]: escala, ['--ancho' as string]: ancho }}
              onPointerEnter={() => setActivo(corte)}
              onPointerLeave={() => setActivo(null)}
            >
              <Link
                href={`/corte/${corte.slug}`}
                className={estilos.enlaceEscalon}
                onFocus={() => setActivo(corte)}
                onBlur={() => setActivo(null)}
              >
                <span className={`dato ${estilos.refEscalon}`}>{corte.ref}</span>
                <span className={estilos.nombreEscalon}>{corte.nombre}</span>
                <span className={estilos.sumarioEscalon}>{corte.sumario}</span>
                {/* La cota al margen: el escalón de tamaño deja de ser
                    una gradación decorativa y pasa a ser un dato. */}
                <span className={`dato ${estilos.cotaEscalon}`}>{corte.medidas}</span>
                <span className={`cifra ${estilos.precioEscalon}`}>
                  {corte.agotado ? 'Agotado' : euros(corte.precio)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div
        ref={seguidor}
        className={`${estilos.seguidor} ${activo ? estilos.seguidorVisible : ''}`}
        aria-hidden="true"
      >
        {activo && (
          <div className={estilos.seguidorCaja} key={activo.slug}>
            <Plancha corte={activo} detalle="seco" />
          </div>
        )}
      </div>

    </section>
  );
}
