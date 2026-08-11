import Link from 'next/link';
import { euros, type Corte } from '@/lib/catalogo';
import Plancha from './Plancha';
import Revelado from './Revelado';
import estilos from './SetDePiezas.module.css';

/**
 * El set de piezas: en un espécimen es la parrilla de caracteres,
 * aquí es el catálogo completo a un solo tamaño. Sin tarjetas —los
 * filetes de la retícula son la única separación.
 */

export default function SetDePiezas({ cortes }: { cortes: Corte[] }) {
  return (
    <section className={estilos.set} aria-labelledby="titulo-set">
      <div className={estilos.encabezado}>
        <h2 id="titulo-set" className="seccion">
          El set completo
        </h2>
        <p className={`dato ${estilos.pieEncabezado}`}>Todas las piezas al mismo tamaño</p>
      </div>

      <Revelado className={estilos.parrilla}>
        {cortes.map((corte) => (
          <Link key={corte.slug} href={`/corte/${corte.slug}`} className={estilos.celda}>
            <Plancha corte={corte} detalle="seco" />
            <div className={estilos.pieCelda}>
              <span className={`dato ${estilos.refCelda}`}>{corte.ref}</span>
              <span className={estilos.nombreCelda}>{corte.nombre}</span>
              <span className={`cifra ${estilos.precioCelda}`}>
                {corte.agotado ? 'Agotado' : euros(corte.precio)}
              </span>
            </div>
          </Link>
        ))}
      </Revelado>
    </section>
  );
}
