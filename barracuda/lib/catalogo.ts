import datos from '@/data/products.json';

export type Forma = 'hoja' | 'losa' | 'cuenco' | 'varilla' | 'aro' | 'gancho';

export type Corte = {
  ref: string;
  slug: string;
  nombre: string;
  sumario: string;
  descripcion: string;
  precio: number;
  materiales: string[];
  medidas: string;
  peso: string;
  acabado: string;
  edicion: string;
  plancha: { forma: Forma; fondo: 'papel' | 'amarillo' };
  imagen?: string;
  agotado: boolean;
};

export type Estudio = {
  nombre: string;
  descriptor: string;
  temporada: string;
  nota: string;
  correo: string;
  telefono: string;
};

const FORMAS: Forma[] = ['hoja', 'losa', 'cuenco', 'varilla', 'aro', 'gancho'];

/**
 * Cada campo se lee a la defensiva: el catálogo lo edita una persona a mano en
 * un JSON, así que un campo que falta o viene con otro tipo tiene que degradar
 * a algo publicable en lugar de tumbar la página.
 */
function normalizarCorte(bruto: unknown, indice: number): Corte | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const c = bruto as Record<string, unknown>;

  const nombre = texto(c.nombre) || `Corte ${indice + 1}`;
  const slug = texto(c.slug) || aSlug(nombre);
  const forma = FORMAS.includes(c.plancha_forma as Forma)
    ? (c.plancha_forma as Forma)
    : leerForma(c.plancha, indice);

  return {
    ref: texto(c.ref) || `BC-${String(indice + 1).padStart(2, '0')}`,
    slug,
    nombre,
    sumario: texto(c.sumario),
    descripcion: texto(c.descripcion),
    precio: Number.isFinite(Number(c.precio)) ? Number(c.precio) : 0,
    materiales: Array.isArray(c.materiales) ? c.materiales.map(texto).filter(Boolean) : [],
    medidas: texto(c.medidas),
    peso: texto(c.peso),
    acabado: texto(c.acabado),
    edicion: texto(c.edicion),
    plancha: {
      forma,
      fondo: leerFondo(c.plancha),
    },
    imagen: texto(c.imagen) || undefined,
    agotado: c.agotado === true,
  };
}

function leerForma(plancha: unknown, indice: number): Forma {
  if (plancha && typeof plancha === 'object') {
    const f = (plancha as Record<string, unknown>).forma;
    if (FORMAS.includes(f as Forma)) return f as Forma;
  }
  // Sin forma declarada, se reparten en orden para que un catálogo recién
  // empezado no salga con ocho dibujos idénticos.
  return FORMAS[indice % FORMAS.length];
}

function leerFondo(plancha: unknown): 'papel' | 'amarillo' {
  if (plancha && typeof plancha === 'object') {
    if ((plancha as Record<string, unknown>).fondo === 'amarillo') return 'amarillo';
  }
  return 'papel';
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

function aSlug(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const brutos = Array.isArray((datos as Record<string, unknown>).cortes)
  ? ((datos as Record<string, unknown>).cortes as unknown[])
  : [];

export const cortes: Corte[] = brutos
  .map(normalizarCorte)
  .filter((c): c is Corte => c !== null);

const estudioBruto = ((datos as Record<string, unknown>).estudio ?? {}) as Record<string, unknown>;

export const estudio: Estudio = {
  nombre: texto(estudioBruto.nombre) || 'Barracuda',
  descriptor: texto(estudioBruto.descriptor) || 'Fundición de objetos',
  temporada: texto(estudioBruto.temporada) || 'Catálogo',
  nota: texto(estudioBruto.nota),
  correo: texto(estudioBruto.correo),
  telefono: texto(estudioBruto.telefono),
};

export function corte(slug: string): Corte | undefined {
  return cortes.find((c) => c.slug === slug);
}

export function otrosCortes(slug: string, cuantos = 4): Corte[] {
  const resto = cortes.filter((c) => c.slug !== slug);
  return resto.slice(0, cuantos);
}

const formateadorEuro = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function euros(cantidad: number): string {
  return formateadorEuro.format(cantidad);
}

/** Clave de localStorage de la orden. Compartida entre el carrito y
 * la página de confirmación, que la vacía tras un pago confirmado. */
export const CLAVE_ORDEN = 'silex.orden.v1';
