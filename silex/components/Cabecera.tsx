'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { estudio } from '@/lib/catalogo';
import { useCarrito } from './Carrito';
import { IconoOrden } from './Iconos';
import estilos from './Cabecera.module.css';

export default function Cabecera() {
  const { piezas, abrir } = useCarrito();
  const [posada, setPosada] = useState(false);

  // La cabecera se asienta sobre el papel en cuanto el pliego se
  // mueve: el filete aparece, no estaba desde el principio.
  useEffect(() => {
    const alScroll = () => setPosada(window.scrollY > 24);
    alScroll();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  return (
    <header className={`${estilos.cabecera} ${posada ? estilos.posada : ''}`}>
      <Link href="/" className={estilos.marca} aria-label={`${estudio.nombre}, inicio`}>
        {estudio.nombre}
      </Link>

      <p className={`dato ${estilos.descriptor}`}>
        <span>{estudio.descriptor}</span>
        <span className={estilos.separador} aria-hidden="true">
          /
        </span>
        <span>{estudio.temporada}</span>
      </p>

      <nav className={estilos.navegacion}>
        <Link href="/#catalogo" className={`dato ${estilos.enlace}`}>
          Cortes
        </Link>
        <Link href="/#taller" className={`dato ${estilos.enlace}`}>
          Taller
        </Link>
        <button type="button" className={`dato ${estilos.orden}`} onClick={abrir}>
          <IconoOrden className={estilos.iconoOrden} />
          <span>Orden</span>
          <span className={`cifra ${estilos.cuenta}`} aria-live="polite">
            {String(piezas).padStart(2, '0')}
          </span>
        </button>
      </nav>
    </header>
  );
}
