import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { corte } from '@/lib/catalogo';

/**
 * Crea la sesión de pago de Stripe Checkout. Este es el único punto
 * de la plantilla que toca dinero, y por eso las dos reglas de aquí
 * abajo no son negociables:
 *
 * 1. El precio nunca llega desde el navegador. El cliente sólo puede
 *    decir «qué referencia» y «cuántas unidades»; el precio se relee
 *    siempre de lib/catalogo.ts, la misma fuente que compone la
 *    ficha del producto. Aceptar un precio que venga del cliente es
 *    dejar que cualquiera pague lo que quiera por lo que quiera.
 * 2. Este servidor nunca ve un número de tarjeta. Stripe Checkout es
 *    una página alojada por Stripe: el dato sensible viaja del
 *    navegador del comprador a Stripe directamente.
 */

export const runtime = 'nodejs';

type LineaPedida = { slug: string; unidades: number };

export async function POST(request: Request) {
  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) {
    return NextResponse.json(
      { error: 'Falta configurar STRIPE_SECRET_KEY en el servidor. Ver README → Pagos.' },
      { status: 501 },
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido.' }, { status: 400 });
  }

  const lineas = leerLineas(cuerpo);
  if (lineas.length === 0) {
    return NextResponse.json({ error: 'La orden está vacía.' }, { status: 400 });
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const linea of lineas) {
    const pieza = corte(linea.slug);
    if (!pieza || pieza.agotado) {
      return NextResponse.json({ error: `«${linea.slug}» ya no está disponible.` }, { status: 409 });
    }
    lineItems.push({
      quantity: linea.unidades,
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(pieza.precio * 100),
        product_data: {
          name: `${pieza.nombre} (${pieza.ref})`,
          description: pieza.sumario || undefined,
        },
      },
    });
  }

  const origen = origenDeConfianza(request);
  const stripe = new Stripe(clave);

  try {
    const sesion = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origen}/orden/exito?sesion={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origen}/orden/cancelada`,
    });
    return NextResponse.json({ url: sesion.url });
  } catch (error) {
    console.error('Stripe checkout.sessions.create falló', error);
    return NextResponse.json({ error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' }, { status: 502 });
  }
}

function leerLineas(cuerpo: unknown): LineaPedida[] {
  if (!cuerpo || typeof cuerpo !== 'object') return [];
  const brutas = (cuerpo as Record<string, unknown>).lineas;
  if (!Array.isArray(brutas)) return [];

  const limpias: LineaPedida[] = [];
  for (const bruta of brutas) {
    if (!bruta || typeof bruta !== 'object') continue;
    const registro = bruta as Record<string, unknown>;
    const slug = registro.slug;
    if (typeof slug !== 'string' || !slug) continue;
    const unidades = Math.floor(Number(registro.unidades));
    if (!Number.isFinite(unidades) || unidades < 1 || unidades > 99) continue;
    limpias.push({ slug, unidades });
  }
  return limpias;
}

/**
 * El destino del redirect tras el pago sale de una variable de
 * entorno cuando existe (lo fiable en producción, detrás de proxy o
 * CDN); si no, del origen de la propia petición. Nunca del precio ni
 * de ningún otro dato que decida el importe.
 */
function origenDeConfianza(request: Request): string {
  const fijado = process.env.NEXT_PUBLIC_SITE_URL;
  if (fijado) return fijado.replace(/\/$/, '');
  const origen = request.headers.get('origin');
  if (origen) return origen;
  return new URL(request.url).origin;
}
