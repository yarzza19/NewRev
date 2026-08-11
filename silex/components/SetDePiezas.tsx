import Link from 'next/link';
import type { Corte } from '@/lib/catalogo';
import Plancha from './Plancha';
import Revelado from './Revelado';
import estilos from './SetDePiezas.module.css';

/**
 * El pliego de planchas: en un espécimen es la parrilla de caracteres
 * completa, aquí son todas las piezas dibujadas al mismo tamaño para
 * poder compararlas.
 *
 * No lleva caja por pieza ni precio: el precio ya está en la cascada
 * y en el índice del pie, y una caja alrededor de una plancha que ya
 * tiene su propio marco es un marco dentro de otro marco.
 */

export default function SetDePiezas({ cortes }: { cortes: Corte[] }) {
  return (
    <section className={estilos.set} aria-labelledby="titulo-set">
      <div className={estilos.encabezado}>
        <h2 id="titulo-set" className="seccion">
          Todas las planchas
        </h2>
        <p className={`margenNota ${estilos.pieEncabezado}`}>
          Al mismo tamaño, para poder compararlas
        </p>
      </div>

      <Revelado className={estilos.hoja}>
        {cortes.map((corte) => (
          <Link key={corte.slug} href={`/corte/${corte.slug}`} className={estilos.pieza}>
            <Plancha corte={corte} detalle="seco" />
            <p className={estilos.leyenda}>
              <span className={`dato ${estilos.refPieza}`}>{corte.ref}</span>
              <span className={estilos.nombrePieza}>{corte.nombre}</span>
            </p>
          </Link>
        ))}
      </Revelado>
    </section>
  );
}
