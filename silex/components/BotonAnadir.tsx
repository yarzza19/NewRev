'use client';

import type { Corte } from '@/lib/catalogo';
import { useCarrito } from './Carrito';
import { IconoMas } from './Iconos';
import estilos from './BotonAnadir.module.css';

export default function BotonAnadir({ corte, ancho = false }: { corte: Corte; ancho?: boolean }) {
  const { anadir, abrir } = useCarrito();

  if (corte.agotado) {
    return (
      <p className={`margenNota ${estilos.agotado}`}>
        Edición agotada. Escribe al taller para entrar en la próxima tirada.
      </p>
    );
  }

  return (
    <button
      type="button"
      className={`accion ${estilos.boton} ${ancho ? estilos.ancho : ''}`}
      onClick={() => {
        anadir(corte);
        abrir();
      }}
    >
      <span>Anotar en la orden</span>
      <IconoMas className={estilos.icono} />
    </button>
  );
}
