import Link from 'next/link';

export default function OrdenCancelada() {
  return (
    <section
      style={{
        padding: 'clamp(6rem, 16vh, 10rem) var(--margen) var(--pliegue)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '1.25rem',
        maxWidth: '38rem',
      }}
    >
      <p className="dato" style={{ color: 'var(--tinta-media)' }}>
        Pago no completado
      </p>
      <h1 className="titular" style={{ maxWidth: '16ch' }}>
        La orden sigue en tu cesta
      </h1>
      <p className="parrafo">
        No se ha realizado ningún cargo. Puedes volver al catálogo y retomar la orden cuando
        quieras: nada se ha borrado.
      </p>
      <Link
        href="/#catalogo"
        className="accion"
        style={{
          marginTop: '0.5rem',
          padding: '1rem 1.4rem',
          background: 'var(--amarillo)',
          border: '1px solid var(--tinta)',
          textDecoration: 'none',
        }}
      >
        Volver al catálogo
      </Link>
    </section>
  );
}
