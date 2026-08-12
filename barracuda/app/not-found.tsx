import Link from 'next/link';
import { cortes } from '@/lib/catalogo';

export default function NoEncontrado() {
  return (
    <section
      style={{
        padding: 'clamp(7rem, 20vh, 12rem) var(--margen) var(--pliegue)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        alignItems: 'flex-start',
      }}
    >
      <p className="dato" style={{ color: 'var(--tinta-media)' }}>
        Error 404
      </p>
      <h1 className="titular" style={{ maxWidth: '18ch' }}>
        Esa referencia no está en el pliego
      </h1>
      <p className="parrafo">
        El catálogo tiene {cortes.length} cortes y ninguno responde a esa dirección. Puede que la
        pieza saliera del catálogo o que el enlace venga mal copiado.
      </p>
      <Link
        href="/#catalogo"
        className="dato"
        style={{
          marginTop: '0.5rem',
          padding: '1rem 1.4rem',
          background: 'var(--amarillo)',
          border: '1px solid var(--tinta)',
          textDecoration: 'none',
        }}
      >
        Volver al índice
      </Link>
    </section>
  );
}
