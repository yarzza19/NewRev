import Link from 'next/link';
import { cortes, estudio, euros } from '@/lib/catalogo';
import AvisoTirada from './AvisoTirada';
import estilos from './Pie.module.css';

/**
 * El pie es el índice del pliego: todas las referencias en una tabla
 * densa, los datos del taller, y el nombre cortado por el borde
 * inferior como en la contracubierta de un catálogo.
 */

export default function Pie() {
  return (
    <footer className={estilos.pie}>
      <div className={estilos.superior}>
        <section className={estilos.indice} aria-labelledby="titulo-indice">
          <h2 id="titulo-indice" className={`dato ${estilos.tituloBloque}`}>
            Índice de referencias
          </h2>
          <table className={estilos.tabla}>
            <thead>
              <tr>
                <th scope="col" className="dato">
                  Ref
                </th>
                <th scope="col" className="dato">
                  Corte
                </th>
                <th scope="col" className={`dato ${estilos.columnaMaterial}`}>
                  Material principal
                </th>
                <th scope="col" className="dato">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody>
              {cortes.map((corte) => (
                <tr key={corte.slug}>
                  <td className="cifra">{corte.ref}</td>
                  <td>
                    <Link href={`/corte/${corte.slug}`} className={estilos.enlaceTabla}>
                      {corte.nombre}
                    </Link>
                  </td>
                  <td className={estilos.columnaMaterial}>{corte.materiales[0] ?? '—'}</td>
                  <td className="cifra">{corte.agotado ? 'Agotado' : euros(corte.precio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className={estilos.lateral}>
          <section aria-labelledby="titulo-taller-pie">
            <h2 id="titulo-taller-pie" className={`dato ${estilos.tituloBloque}`}>
              Taller
            </h2>
            <ul className={estilos.contacto}>
              <li>
                <a href={`mailto:${estudio.correo}`}>{estudio.correo}</a>
              </li>
              <li>
                <a href={`tel:${estudio.telefono.replace(/\s/g, '')}`}>{estudio.telefono}</a>
              </li>
            </ul>
          </section>

          <AvisoTirada />
        </div>
      </div>

      <p className={`margenNota ${estilos.legal}`}>
        <span>
          {estudio.nombre} · {estudio.temporada}
        </span>
        <span>Plantilla de demostración: catálogo, precios y textos son material de muestra.</span>
      </p>

      {/* El nombre cortado por el borde: cierre de contracubierta. */}
      <p
        className={estilos.firma}
        aria-hidden="true"
        style={{ ['--caracteres' as string]: estudio.nombre.length }}
      >
        {estudio.nombre}
      </p>
    </footer>
  );
}
