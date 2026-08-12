# Barracuda

Plantilla de tienda para un catálogo corto de producto de alta gama. Next.js (App Router) + TypeScript, sin CMS y sin base de datos: **todo el contenido sale de `data/products.json`**.

## Arrancar

```bash
cd barracuda
npm install
npm run dev      # http://localhost:3000
npm run build    # comprueba que todo compila antes de publicar
```

## Añadir un producto

Abre `data/products.json` y añade un objeto a la lista `cortes`. No hay que tocar nada más: la portada, la cascada, la rejilla, el índice del pie y la ficha `/corte/<slug>` se generan solas desde ahí.

```json
{
  "ref": "SX-09",
  "slug": "mi-pieza",
  "nombre": "Mi pieza",
  "sumario": "Una línea diciendo qué es",
  "descripcion": "Un párrafo.\n\nOtro párrafo: se separan con una línea en blanco.",
  "precio": 180,
  "materiales": ["Acero", "Nogal"],
  "medidas": "240 × 38 × 4 mm",
  "peso": "186 g",
  "acabado": "Rectificado a mano",
  "edicion": "40 piezas",
  "plancha": { "forma": "hoja", "fondo": "papel" }
}
```

### Los campos

| Campo | Obligatorio | Qué hace |
|---|---|---|
| `ref` | no | Referencia impresa en la ficha. Si falta se genera `SX-09` por posición. |
| `slug` | no | La URL: `/corte/<slug>`. Si falta se deriva del nombre. |
| `nombre` | sí | Se compone muy grande. Funciona mejor entre 4 y 16 caracteres. |
| `sumario` | sí | Una línea. Sale bajo el nombre en la cascada y en la ficha. |
| `descripcion` | no | Uno o varios párrafos, separados por `\n\n`. |
| `precio` | sí | Número en euros, sin símbolo: `180`. |
| `materiales` | no | Lista de textos. Se compone como datos tabulares. |
| `medidas`, `peso`, `acabado`, `edicion` | no | Texto corto. Las filas vacías no se pintan. |
| `plancha.forma` | no | Dibujo generado: `hoja`, `losa`, `cuenco`, `varilla`, `aro`, `gancho`. |
| `plancha.fondo` | no | `papel` (blanco) o `amarillo`. Alterna para dar ritmo a la rejilla. |
| `imagen` | no | Ruta a una foto en `public/`, ej. `/fotos/sx-09.jpg`. Sustituye al dibujo. |
| `agotado` | no | `true` desactiva la compra y marca la pieza como agotada. |

Un campo que falte degrada a algo publicable en lugar de romper la página: el catálogo lo edita una persona a mano y está previsto que se equivoque.

### Poner fotos en lugar de dibujos

Mientras no haya fotografías, cada pieza se dibuja a tinta desde `plancha.forma`. Cuando tengas fotos: mételas en `public/fotos/`, añade `"imagen": "/fotos/loquesea.jpg"` a la pieza y esa plancha pasa a ser la foto. Se recortan a 480×620 (vertical), así que sube verticales.

### Cambiar los datos del taller

El bloque `estudio` del mismo JSON controla el nombre de la casa, el descriptor de la cabecera, la temporada, la nota del taller y el contacto. **El nombre alimenta también el logotipo, el título gigante de la portada y la firma del pie**, y todos ellos calculan su cuerpo a partir del número de letras: cambia `nombre` por el que sea y siguen llenando la medida.

## Cambiar el aspecto

Todo el color, el tipo y el ritmo viven en `app/globals.css`, en el bloque `:root`. Los dos que importan:

```css
--amarillo: #ffe500;   /* el campo de color */
--tinta: #121110;      /* la tinta */
```

Si cambias el amarillo por un tono más claro u oscuro, revisa también `--sobre-amarillo-medio`, que es el texto secundario sobre ese campo y está calculado para mantener el contraste.

Las tres fuentes se declaran en `app/layout.tsx` con `next/font/google` (se auto-alojan en el build, no se piden a Google en tiempo de ejecución). La de titulares **tiene que ser variable con eje de ancho** (`wdth`) o el probador de la portada no tendrá nada que mover.

## Pagos: Stripe Checkout

El pago está conectado y funciona en cuanto le des tu clave; hasta entonces, «Tramitar la orden» avisa con claridad de que falta configurarlo, en vez de fingir que cobra.

1. Crea una cuenta en [stripe.com](https://stripe.com) si no tienes una.
2. Copia tu clave secreta de [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) — usa la de **modo prueba** (`sk_test_...`) mientras pruebas.
3. `cp .env.local.example .env.local` y pega la clave en `STRIPE_SECRET_KEY`.
4. `npm run dev` y prueba una compra con la tarjeta de pruebas de Stripe: número `4242 4242 4242 4242`, cualquier fecha futura, cualquier CVC.
5. Cuando publiques de verdad, sustituye la clave por la de producción (`sk_live_...`) en las variables de entorno de tu hosting — nunca en el código ni en el repositorio.

**Por qué es seguro con solo eso:**

- Tu servidor **nunca ve un número de tarjeta**. El botón redirige a una página de pago alojada por Stripe (Stripe Checkout); el dato sensible viaja del navegador del comprador a Stripe directamente. Esto te deja en el nivel más bajo de exigencia de cumplimiento PCI (SAQ A) — la carga de esa certificación es de Stripe, no tuya.
- El **precio que se cobra se relee siempre en el servidor** desde `data/products.json` (`app/api/checkout/route.ts`). El navegador sólo puede decir «qué referencia» y «cuántas unidades»; nunca «a qué precio». Aunque alguien manipule la petición para intentar pagar menos, el servidor ignora ese dato y usa el precio real del catálogo.
- Las claves de Stripe viven en `.env.local` (excluido de git) o en las variables de entorno de tu hosting, nunca en el código fuente.

**Lo que esto NO incluye**, para que no des por hecho más de lo que hay: no hay base de datos de pedidos — Stripe es tu único registro de lo cobrado, consúltalo en tu panel de Stripe; no hay envío de email de confirmación (Stripe puede mandarlo él mismo, actívalo en su panel); no hay webhook para reaccionar a pagos (recomendado si más adelante añades un backend que gestione stock o envíos).

## Lo que falta conectar

- **Avisos de tirada.** El formulario del pie valida el correo y no lo envía a ninguna parte. Enchufa tu proveedor en `components/AvisoTirada.tsx`.
- **Catálogo de muestra.** Las ocho piezas, sus precios, sus materiales y la nota del taller son material de relleno inventado. Sustitúyelo antes de publicar: hay un aviso a pie de página que también habrá que quitar.

## Estructura

```
barracuda/
├─ app/
│  ├─ layout.tsx          cabecera, pie, fuentes, carrito, avisos
│  ├─ page.tsx            portada
│  ├─ globals.css         tokens, base y superficies del navegador
│  └─ corte/[slug]/       ficha de producto (estática, una por pieza)
├─ components/            cada pieza de la portada, con su CSS al lado
├─ data/products.json     ← el catálogo
└─ lib/catalogo.ts        lectura y normalización del JSON
```

## Accesibilidad y movimiento

Navegación por teclado con foco visible en todos los controles, contraste comprobado sobre el amarillo, y `prefers-reduced-motion` respetado en toda la página: quien lo tenga activado pierde el desplazamiento pero conserva los cambios de estado. La página nace visible, así que un fallo de JavaScript no deja secciones en blanco.
