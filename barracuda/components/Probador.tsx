'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { estudio, euros, type Corte } from '@/lib/catalogo';
import Plancha from './Plancha';
import { IconoFlecha } from './Iconos';
import estilos from './Probador.module.css';

/**
 * El momento de autoría de la página. Un pliego de espécimen enseña
 * el rango de una cara moviendo sus ejes; aquí el nombre de la casa
 * es el espécimen y el visitante lo deforma con el puntero.
 *
 * Entra una vez, condensado y ligero, y se abre hasta su posición de
 * reposo. Después la transición se retira para que el arrastre vaya
 * al fotograma, sin arrastre de latencia.
 */

const REPOSO = { wdth: 100, wght: 700 };
const ARRANQUE = { wdth: 76, wght: 260 };

export default function Probador({ primero }: { primero: Corte | undefined }) {
  const [ejes, setEjes] = useState(ARRANQUE);
  const [vivo, setVivo] = useState(false);
  const [tocado, setTocado] = useState(false);
  const zona = useRef<HTMLDivElement>(null);
  const espectro = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducido) {
      setEjes(REPOSO);
      setVivo(true);
      return;
    }
    const cuadro = requestAnimationFrame(() => setEjes(REPOSO));
    const fin = window.setTimeout(() => setVivo(true), 820);
    return () => {
      cancelAnimationFrame(cuadro);
      window.clearTimeout(fin);
    };
  }, []);

  /**
   * El nombre tiene que llenar su columna sea cual sea: «Barracuda»
   * son nueve letras, pero esto es una plantilla y el siguiente
   * nombre puede tener otro largo. El CSS lo estima por número de
   * caracteres —así el primer pintado ya sale bien— y aquí se
   * corrige con la medida real de la caja del texto.
   */
  useEffect(() => {
    if (!vivo) return;
    const ajustar = () => {
      const nodo = espectro.current;
      if (!nodo) return;
      nodo.style.removeProperty('--ajuste');
      const rango = document.createRange();
      rango.selectNodeContents(nodo);
      const anchoTexto = rango.getBoundingClientRect().width;
      const disponible = nodo.clientWidth;
      if (!anchoTexto || !disponible) return;
      const factor = Math.min(Math.max(disponible / anchoTexto, 0.6), 1.8);
      nodo.style.setProperty('--ajuste', factor.toFixed(3));
    };
    ajustar();
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, [vivo]);

  const alMover = useCallback(
    (evento: React.PointerEvent<HTMLDivElement>) => {
      if (!vivo || !zona.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const caja = zona.current.getBoundingClientRect();
      const x = Math.min(Math.max((evento.clientX - caja.left) / caja.width, 0), 1);
      const y = Math.min(Math.max((evento.clientY - caja.top) / caja.height, 0), 1);
      setEjes({
        wdth: Math.round(75 + x * 25),
        wght: Math.round(300 + (1 - y) * 500),
      });
      setTocado(true);
    },
    [vivo],
  );

  const alSalir = useCallback(() => {
    if (!vivo) return;
    setEjes(REPOSO);
  }, [vivo]);

  return (
    <section className={estilos.primerPliego} aria-labelledby="titulo-silex">
      <div className={estilos.franjaAlta}>
        <p className={`dato ${estilos.lectura}`} aria-hidden="true">
          <span>wdth {ejes.wdth}</span>
          <span>wght {ejes.wght}</span>
        </p>
        {/* El gesto lo decide el CSS, no el JS: qué puntero hay es una
            consulta de medio, y así la frase es correcta ya en el HTML
            servido, sin esperar a la hidratación. */}
        <p className={`margenNota ${estilos.instruccion}`}>
          {tocado ? (
            'Suelta y vuelve a su corte'
          ) : (
            <>
              <span className={estilos.conPuntero}>Pasa por encima del nombre</span>
              <span className={estilos.conDedo}>Arrastra sobre el nombre</span>
            </>
          )}
        </p>
      </div>

      <div ref={zona} className={estilos.zonaEspectro} onPointerMove={alMover} onPointerLeave={alSalir}>
        <div className={estilos.cajaEspectro}>
          <h1
            id="titulo-silex"
            ref={espectro}
            className={`espectro ${estilos.espectro} ${vivo ? estilos.espectroVivo : ''}`}
            style={{
              fontVariationSettings: `"wdth" ${ejes.wdth}, "wght" ${ejes.wght}, "opsz" 96`,
              ['--caracteres' as string]: estudio.nombre.length,
            }}
          >
            {estudio.nombre}
          </h1>
        </div>

        {/* La oferta y la acción van al costado del nombre, no debajo:
            el primer pliego se lee en una sola mirada. */}
        <div className={estilos.bajada}>
          <p className={estilos.oferta}>
            Ocho objetos de acero, piedra y latón. Se funden, se rectifican y se numeran en el
            taller: lo que no pasa la plancha de control no se vende.
          </p>
          <div className={estilos.acciones}>
            <Link href="#catalogo" className={`accion ${estilos.accionPrincipal}`}>
              Ver los ocho cortes
              <IconoFlecha className={estilos.flecha} />
            </Link>
            <Link href="#taller" className={`accion ${estilos.accionSecundaria}`}>
              Nota del taller
            </Link>
          </div>
        </div>
      </div>

      {primero && (
        <div className={`enAmarillo ${estilos.bandaPrimero}`}>
          <div className={estilos.planchaPrimero}>
            <Plancha corte={primero} detalle="seco" prioridad />
          </div>
          <div className={estilos.textoPrimero}>
            <p className={estilos.lineaNombre}>
              <Link href={`/corte/${primero.slug}`} className={estilos.nombrePrimero}>
                {primero.nombre}
              </Link>
              <span className={`dato ${estilos.refPrimero}`}>{primero.ref}</span>
            </p>
            <p className={estilos.sumarioPrimero}>{primero.sumario}</p>
          </div>
          <p className={`cifra ${estilos.precioPrimero}`}>{euros(primero.precio)}</p>
        </div>
      )}
    </section>
  );
}
