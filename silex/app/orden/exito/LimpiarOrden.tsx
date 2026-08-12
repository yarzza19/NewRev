'use client';

import { useEffect } from 'react';

const CLAVE = 'silex.orden.v1';

/**
 * Vacía la orden guardada sólo cuando Stripe confirma el pago. Si el
 * pago no se pudo confirmar, la orden se deja intacta: el visitante
 * no debe perder su cesta por un fallo de red al leer la sesión.
 */
export default function LimpiarOrden({ confirmado }: { confirmado: boolean }) {
  useEffect(() => {
    if (!confirmado) return;
    try {
      window.localStorage.removeItem(CLAVE);
    } catch {
      /* Un almacenamiento bloqueado no es un error del pedido. */
    }
  }, [confirmado]);

  return null;
}
