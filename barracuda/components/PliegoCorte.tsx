import Link from 'next/link';
import { euros, type Corte } from '@/lib/catalogo';
import Plancha from './Plancha';
import BotonAnadir from './BotonAnadir';
import estilos from './PliegoCorte.module.css';

/**
 * El pliego desplegado de un corte: la plancha a tamaño y su tabla
 * de métricas. Es la misma anatomía en la portada y en la ficha, que
 * es lo que hace que el catálogo se lea como un catálogo.
 */

type Props = {
  corte: Corte;
  encabezado?: 'titulo' | 'enlace';
  prioridad?: boolean;
};

export default function PliegoCorte({ corte, encabezado = 'enlace', prioridad = false }: Props) {
  const Nombre = encabezado === 'titulo' ? 'h1' : 'h2';

  return (
    <article className={estilos.pliego}>
      <div className={estilos.columnaPlancha}>
        <Plancha corte={corte} prioridad={prioridad} />
      </div>

      <div className={estilos.columnaTexto}>
        <div className={estilos.identidad}>
          <Nombre className={`titular ${estilos.nombre}`}>
            {encabezado === 'enlace' ? (
              <Link href={`/corte/${corte.slug}`} className={estilos.enlaceNombre}>
                {corte.nombre}
              </Link>
            ) : (
              corte.nombre
            )}
            <span className={`dato ${estilos.ref}`}>{corte.ref}</span>
          </Nombre>
          <p className={estilos.sumario}>{corte.sumario}</p>
        </div>

        {corte.descripcion && (
          <div className={estilos.descripcion}>
            {corte.descripcion.split('\n\n').map((parrafo, i) => (
              <p key={i} className="parrafo">
                {parrafo}
              </p>
            ))}
          </div>
        )}

        <dl className={estilos.metricas}>
          <Metrica termino="Materiales" valor={corte.materiales.join(' · ')} />
          <Metrica termino="Medidas" valor={corte.medidas} />
          <Metrica termino="Peso" valor={corte.peso} />
          <Metrica termino="Acabado" valor={corte.acabado} />
          <Metrica termino="Edición" valor={corte.edicion} />
        </dl>

        <div className={estilos.compra}>
          <p className={`cifra ${estilos.precio}`}>{euros(corte.precio)}</p>
          <BotonAnadir corte={corte} />
        </div>
      </div>
    </article>
  );
}

function Metrica({ termino, valor }: { termino: string; valor: string }) {
  if (!valor) return null;
  return (
    <div className={estilos.metrica}>
      <dt className={`dato ${estilos.termino}`}>{termino}</dt>
      <dd className={estilos.valor}>{valor}</dd>
    </div>
  );
}
