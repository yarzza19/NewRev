'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Drawer } from 'vaul';
import { toast } from 'sonner';
import { cortes, euros, type Corte } from '@/lib/catalogo';
import { IconoCruz, IconoMas, IconoMenos } from './Iconos';
import estilos from './Carrito.module.css';

type Linea = { slug: string; unidades: number };

type Contexto = {
  lineas: Linea[];
  piezas: number;
  total: number;
  anadir: (corte: Corte) => void;
  ajustar: (slug: string, delta: number) => void;
  quitar: (slug: string) => void;
  abrir: () => void;
  cerrar: () => void;
  abierto: boolean;
};

const CarritoCtx = createContext<Contexto | null>(null);
const CLAVE = 'silex.orden.v1';

export function ProveedorCarrito({ children }: { children: React.ReactNode }) {
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE);
      if (guardado) {
        const leido = JSON.parse(guardado);
        if (Array.isArray(leido)) setLineas(leido.filter((l) => typeof l?.slug === 'string'));
      }
    } catch {
      // Un almacenamiento bloqueado no puede impedir comprar.
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(lineas));
    } catch {
      /* idem */
    }
  }, [lineas, hidratado]);

  const anadir = useCallback((corte: Corte) => {
    setLineas((previas) => {
      const existente = previas.find((l) => l.slug === corte.slug);
      if (existente) {
        return previas.map((l) => (l.slug === corte.slug ? { ...l, unidades: l.unidades + 1 } : l));
      }
      return [...previas, { slug: corte.slug, unidades: 1 }];
    });
    // El nombre va en la descripción y no en el título: el catálogo lo
    // escribe el dueño de la tienda y «anotado» no puede concordar con
    // un nombre que puede ser femenino, plural o las dos cosas.
    toast('Anotado en la orden', {
      description: `${corte.ref} · ${corte.nombre} · ${euros(corte.precio)}`,
    });
  }, []);

  const ajustar = useCallback((slug: string, delta: number) => {
    setLineas((previas) =>
      previas
        .map((l) => (l.slug === slug ? { ...l, unidades: l.unidades + delta } : l))
        .filter((l) => l.unidades > 0),
    );
  }, []);

  const quitar = useCallback((slug: string) => {
    setLineas((previas) => previas.filter((l) => l.slug !== slug));
  }, []);

  const { piezas, total } = useMemo(() => {
    return lineas.reduce(
      (acc, linea) => {
        const corte = cortes.find((c) => c.slug === linea.slug);
        if (!corte) return acc;
        return {
          piezas: acc.piezas + linea.unidades,
          total: acc.total + corte.precio * linea.unidades,
        };
      },
      { piezas: 0, total: 0 },
    );
  }, [lineas]);

  const valor = useMemo<Contexto>(
    () => ({
      lineas,
      piezas,
      total,
      anadir,
      ajustar,
      quitar,
      abierto,
      abrir: () => setAbierto(true),
      cerrar: () => setAbierto(false),
    }),
    [lineas, piezas, total, anadir, ajustar, quitar, abierto],
  );

  return (
    <CarritoCtx.Provider value={valor}>
      {children}
      <CajonOrden />
    </CarritoCtx.Provider>
  );
}

export function useCarrito(): Contexto {
  const ctx = useContext(CarritoCtx);
  if (!ctx) throw new Error('useCarrito fuera del proveedor');
  return ctx;
}

function CajonOrden() {
  const { lineas, total, piezas, ajustar, quitar, abierto, cerrar } = useCarrito();

  const detalladas = lineas
    .map((linea) => ({ linea, corte: cortes.find((c) => c.slug === linea.slug) }))
    .filter((d): d is { linea: Linea; corte: Corte } => Boolean(d.corte));

  return (
    <Drawer.Root direction="right" open={abierto} onOpenChange={(v) => (v ? null : cerrar())}>
      <Drawer.Portal>
        <Drawer.Overlay className={estilos.velo} />
        <Drawer.Content className={estilos.cajon} aria-describedby={undefined}>
          <div className={estilos.cabezaCajon}>
            <Drawer.Title className={`dato ${estilos.tituloCajon}`}>
              Orden de compra · {piezas} {piezas === 1 ? 'pieza' : 'piezas'}
            </Drawer.Title>
            <button type="button" className={estilos.cerrar} onClick={cerrar} aria-label="Cerrar la orden">
              <IconoCruz />
            </button>
          </div>

          {detalladas.length === 0 ? (
            <div className={estilos.vacio}>
              <p className="seccion">La orden está en blanco.</p>
              <p className={estilos.vacioTexto}>
                Ocho cortes esperando. Se anotan desde la ficha de cada objeto o desde el índice.
              </p>
              <Link href="/#catalogo" className={`accion ${estilos.vacioEnlace}`} onClick={cerrar}>
                Ver el catálogo
              </Link>
            </div>
          ) : (
            <>
              <ul className={estilos.lineas}>
                {detalladas.map(({ linea, corte }) => (
                  <li key={corte.slug} className={estilos.linea}>
                    <div className={estilos.lineaTexto}>
                      <Link href={`/corte/${corte.slug}`} className={estilos.lineaNombre} onClick={cerrar}>
                        {corte.nombre}
                      </Link>
                      <span className={`dato ${estilos.lineaRef}`}>
                        {corte.ref} · {euros(corte.precio)}
                      </span>
                    </div>

                    <div className={estilos.contador}>
                      <button
                        type="button"
                        onClick={() => ajustar(corte.slug, -1)}
                        aria-label={`Quitar una unidad de ${corte.nombre}`}
                      >
                        <IconoMenos />
                      </button>
                      <span className="cifra" aria-live="polite">
                        {linea.unidades}
                      </span>
                      <button
                        type="button"
                        onClick={() => ajustar(corte.slug, 1)}
                        aria-label={`Añadir una unidad de ${corte.nombre}`}
                      >
                        <IconoMas />
                      </button>
                    </div>

                    <span className={`cifra ${estilos.lineaTotal}`}>
                      {euros(corte.precio * linea.unidades)}
                    </span>

                    <button
                      type="button"
                      className={estilos.borrar}
                      onClick={() => quitar(corte.slug)}
                      aria-label={`Borrar ${corte.nombre} de la orden`}
                    >
                      Borrar
                    </button>
                  </li>
                ))}
              </ul>

              <div className={estilos.piePedido}>
                <div className={estilos.sumaFila}>
                  <span className="dato">Suma</span>
                  <span className={`cifra ${estilos.suma}`}>{euros(total)}</span>
                </div>
                <p className={`margenNota ${estilos.nota}`}>
                  Plantilla de demostración: no hay pasarela de pago conectada.
                </p>
                <button
                  type="button"
                  className={`accion ${estilos.tramitar}`}
                  onClick={() =>
                    toast('Falta conectar la pasarela de pago', {
                      description: 'Enlaza aquí tu proveedor: Stripe, Shopify o el que uses.',
                    })
                  }
                >
                  Tramitar la orden
                </button>
              </div>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
