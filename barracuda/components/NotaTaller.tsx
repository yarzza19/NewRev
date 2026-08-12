import { cortes, estudio } from '@/lib/catalogo';
import estilos from './NotaTaller.module.css';

/**
 * El campo amarillo a página completa. En un pliego de espécimen
 * esta es la nota del fundidor: quién cortó la cara y por qué.
 */

export default function NotaTaller() {
  const materiales = Array.from(new Set(cortes.flatMap((c) => c.materiales)))
    .slice(0, 6)
    .sort((a, b) => a.localeCompare(b, 'es'));

  return (
    <section className={`enAmarillo ${estilos.nota}`} id="taller" aria-labelledby="titulo-taller">
      <div className={estilos.cuerpo}>
        <h2 id="titulo-taller" className={`titular ${estilos.titulo}`}>
          Nota del taller
        </h2>
        <p className={`parrafo ${estilos.texto}`}>{estudio.nota}</p>
      </div>

      <aside className={estilos.margen} aria-label="Datos del taller">
        <dl className={estilos.marginalia}>
          <div>
            <dt className="dato">Piezas en catálogo</dt>
            <dd className="cifra">{String(cortes.length).padStart(2, '0')}</dd>
          </div>
          <div>
            <dt className="dato">Materiales en uso</dt>
            <dd>
              <ul className={estilos.listaMateriales}>
                {materiales.map((material) => (
                  <li key={material}>{material}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt className="dato">Temporada</dt>
            <dd>{estudio.temporada}</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}
