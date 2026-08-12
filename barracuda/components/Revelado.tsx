'use client';

import { useEffect, useRef } from 'react';

/**
 * Revelado por escalones para listas que aparecen como listas.
 * No es la entrada de todas las secciones: la portada tiene un solo
 * momento de autoría y está en el probador.
 *
 * El contenido nace visible; el estado de espera sólo se aplica si
 * hay script y no hay movimiento reducido, así que un fallo de JS
 * deja la página entera legible.
 */

export default function Revelado({
  children,
  retardoBase = 0,
  paso = 55,
  className,
}: {
  children: React.ReactNode;
  retardoBase?: number;
  paso?: number;
  className?: string;
}) {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodo = caja.current;
    if (!nodo) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const hijos = Array.from(nodo.children) as HTMLElement[];
    hijos.forEach((hijo) => hijo.setAttribute('data-revelar', 'espera'));

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          const hijo = entrada.target as HTMLElement;
          const indice = hijos.indexOf(hijo);
          // El escalonado se corta a 6: pasado ese punto deja de
          // leerse como una secuencia y empieza a leerse como espera.
          const retardo = retardoBase + Math.min(indice, 6) * paso;
          window.setTimeout(() => hijo.setAttribute('data-revelar', 'llega'), retardo);
          observador.unobserve(hijo);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
    );

    hijos.forEach((hijo) => observador.observe(hijo));
    return () => observador.disconnect();
  }, [retardoBase, paso]);

  return (
    <div ref={caja} className={className}>
      {children}
    </div>
  );
}
