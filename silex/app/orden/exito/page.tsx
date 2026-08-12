import Link from 'next/link';
import Stripe from 'stripe';
import LimpiarOrden from './LimpiarOrden';
import estilos from './exito.module.css';

/**
 * La confirmación relee la sesión desde Stripe (server-side, con la
 * clave secreta) en lugar de fiarse de nada que traiga la URL: el
 * parámetro `sesion` sólo sirve para saber a quién preguntarle a
 * Stripe, nunca para afirmar por sí solo que el pago se hizo.
 */

type Props = { searchParams: Promise<{ sesion?: string }> };

export default async function OrdenExito({ searchParams }: Props) {
  const { sesion } = await searchParams;
  const detalle = sesion ? await leerSesion(sesion) : null;

  return (
    <section className={estilos.pliego}>
      <LimpiarOrden confirmado={detalle?.pagada ?? false} />

      <p className="dato" style={{ color: 'var(--tinta-media)' }}>
        {detalle?.pagada ? 'Pago confirmado' : 'Orden recibida'}
      </p>
      <h1 className="titular" style={{ maxWidth: '16ch' }}>
        Gracias por el pedido
      </h1>
      <p className="parrafo">
        {detalle?.pagada
          ? 'El pago se ha confirmado en Stripe. Esta plantilla no guarda pedidos: apunta la referencia de abajo si necesitas localizarlo más tarde en tu panel de Stripe.'
          : 'No hemos podido confirmar el estado del pago todavía. Si Stripe te ha cobrado, el cargo aparecerá igualmente en tu panel de Stripe.'}
      </p>

      {detalle && (
        <dl className={estilos.recibo}>
          <div>
            <dt className="dato">Referencia de Stripe</dt>
            <dd className="cifra">{detalle.id}</dd>
          </div>
          {detalle.total !== null && (
            <div>
              <dt className="dato">Total cobrado</dt>
              <dd className="cifra">{detalle.total}</dd>
            </div>
          )}
        </dl>
      )}

      <Link href="/#catalogo" className="accion" style={{ textDecoration: 'underline', textUnderlineOffset: '0.25em' }}>
        Volver al catálogo
      </Link>
    </section>
  );
}

async function leerSesion(id: string) {
  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) return null;
  try {
    const stripe = new Stripe(clave);
    const s = await stripe.checkout.sessions.retrieve(id);
    const total =
      typeof s.amount_total === 'number' && s.currency
        ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: s.currency.toUpperCase() }).format(
            s.amount_total / 100,
          )
        : null;
    return { id: s.id, pagada: s.payment_status === 'paid', total };
  } catch (error) {
    console.error('No se pudo leer la sesión de Stripe', error);
    return null;
  }
}
