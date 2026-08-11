import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { corte, cortes, otrosCortes, euros } from '@/lib/catalogo';
import PliegoCorte from '@/components/PliegoCorte';
import Plancha from '@/components/Plancha';
import estilos from './corte.module.css';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return cortes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pieza = corte(slug);
  if (!pieza) return { title: 'Corte no encontrado' };
  return {
    title: `${pieza.nombre} · ${pieza.ref}`,
    description: pieza.sumario,
  };
}

export default async function FichaCorte({ params }: Props) {
  const { slug } = await params;
  const pieza = corte(slug);
  if (!pieza) notFound();

  const vecinos = otrosCortes(slug, 4);
  const posicion = cortes.findIndex((c) => c.slug === slug) + 1;

  return (
    <article className={estilos.ficha}>
      <nav className={estilos.migas} aria-label="Ruta">
        <Link href="/#catalogo" className="dato">
          Catálogo
        </Link>
        <span className={`dato ${estilos.separador}`} aria-hidden="true">
          /
        </span>
        <span className={`dato ${estilos.actual}`}>
          Corte {String(posicion).padStart(2, '0')} de {String(cortes.length).padStart(2, '0')}
        </span>
      </nav>

      <PliegoCorte corte={pieza} encabezado="titulo" prioridad />

      {vecinos.length > 0 && (
        <section className={estilos.vecinos} aria-labelledby="titulo-vecinos">
          <h2 id="titulo-vecinos" className={`dato ${estilos.tituloVecinos}`}>
            Otros cortes del catálogo
          </h2>
          <div className={estilos.parrillaVecinos}>
            {vecinos.map((vecino) => (
              <Link key={vecino.slug} href={`/corte/${vecino.slug}`} className={estilos.vecino}>
                <Plancha corte={vecino} detalle="seco" />
                <div className={estilos.pieVecino}>
                  <span className={`dato ${estilos.refVecino}`}>{vecino.ref}</span>
                  <span className={estilos.nombreVecino}>{vecino.nombre}</span>
                  <span className={`cifra ${estilos.precioVecino}`}>
                    {vecino.agotado ? 'Agotado' : euros(vecino.precio)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
