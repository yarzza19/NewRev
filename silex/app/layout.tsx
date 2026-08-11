import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Archivo, Martian_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { estudio } from '@/lib/catalogo';
import { ProveedorCarrito } from '@/components/Carrito';
import Cabecera from '@/components/Cabecera';
import Pie from '@/components/Pie';
import './globals.css';

/* El display lleva ejes variables porque el probador del primer
   pliego los mueve en vivo: la cara ES el material del mundo. */
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz', 'wdth'],
  display: 'swap',
  variable: '--fuente-display',
});

const texto = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fuente-texto',
});

const dato = Martian_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--fuente-dato',
});

export const metadata: Metadata = {
  title: {
    default: `${estudio.nombre} — ${estudio.descriptor}`,
    template: `%s — ${estudio.nombre}`,
  },
  description:
    'Ocho objetos de acero, piedra y latón. Fundidos, rectificados y numerados antes de entrar en el catálogo.',
};

export const viewport: Viewport = {
  themeColor: '#ffe500',
};

/* Contrato de dirección. Sobrevive al build de producción a
   propósito: es lo que se audita en la revisión de cierre. */
const CONTRATO = `<!--
THESIS: un catálogo de objetos compuesto como el pliego de espécimen de una fundición tipográfica; rechaza la rejilla de tarjetas con foto grande y botón que repite la categoría.
OWN-WORLD: papel blanco, una tinta negra, campo amarillo #FFE500 macizo que ocupa regiones enteras; filetes de 1px, datos en mono tabular, planchas dibujadas a tinta. Sin tarjetas, sin sombras, sin degradados.
STORY: el visitante entiende que son ocho objetos numerados y a la venta, cree que están hechos con precisión medida, y entra en un corte o lo añade.
FIRST VIEWPORT: SILEX a sangre en variable, ejes wdth/wght vivos bajo el puntero con lectura en mono; a la derecha la línea de oferta y la acción; banda amarilla inferior con el corte 01.
FORM: pliego de espécimen, candidata 4 de 7 de la lista ordenada por resonancia, semilla 70790d9e.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable} ${dato.variable}`}>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRATO }} />
        <a className="aOido" href="#catalogo">
          Saltar al catálogo
        </a>
        <ProveedorCarrito>
          <Cabecera />
          <main id="principal">{children}</main>
          <Pie />
          <Toaster
            position="bottom-right"
            gap={8}
            offset={20}
            toastOptions={{
              unstyled: true,
              classNames: {
                toast: 'avisoSilex',
                title: 'avisoSilexTitulo',
                description: 'avisoSilexDescripcion',
              },
            }}
          />
        </ProveedorCarrito>
      </body>
    </html>
  );
}
