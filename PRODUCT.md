# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React / Next.js — elegido por el usuario en la ronda de init, frente a HTML/CSS/JS plano. El resto del repo NewRev es estático; Silex vive en su propio subdirectorio con su propio build.

## Users

Dos audiencias, y la plantilla sirve a las dos:

- **El comprador.** Llega a un catálogo corto de producto de alta gama. No viene a comparar veinte referencias: viene a decidir sobre unas pocas piezas, quiere verlas grandes, entender de qué están hechas y comprar. Pocos productos significa que cada uno soporta el peso de una ficha completa.
- **El propietario del sitio (el usuario de este encargo).** Recibe el sitio vacío de contenido real y lo va llenando él. Su trabajo recurrente es añadir un producto, no editar diseño. Ese flujo tiene que ser un solo archivo y no debe poder romper la maquetación.

## Product Purpose

Una plantilla de tienda para un catálogo corto (del orden de 6-12 referencias) de producto de alta gama. El sitio existe para que un producto se desee y se compre, y para que el propietario pueda seguir añadiendo referencias sin tocar el diseño. Éxito: el propietario añade su tercer producto sin abrir un archivo de estilos, y el sitio sigue pareciendo hecho a mano.

## Positioning

Marca nueva e independiente. **No** es la tienda de Silex Media (`silex-media/`, estudio de marketing en este mismo repo) y no hereda nada de su identidad: comparte el nombre y nada más. Confirmado con el usuario en la ronda de init, y confirmado otra vez cuando pidió llamarla «Silex a secas, no Silex Media».

## Operating Context

- El contenido entra por `products.json`. Un producto es una entrada de ese archivo; el sitio se genera desde ahí, incluidas las rutas de ficha de producto.
- El propietario edita ese JSON a mano, en un editor de texto. Asumir errores humanos: campos que faltan, un producto sin foto, textos más largos de lo previsto. El diseño tiene que aguantarlos sin romperse.
- El número de productos varía con el tiempo y empieza siendo pequeño. La composición no puede depender de que haya exactamente N.

## Capabilities and Constraints

- Catálogo, ficha de producto por referencia, carrito y pago. El carrito es de cliente (localStorage); el pago se procesa con Stripe Checkout, alojado por Stripe — el servidor de la plantilla nunca ve ni guarda un número de tarjeta, y el precio que se cobra se relee siempre de `products.json` en el servidor, nunca del navegador. No hay backend de pedidos ni persistencia: Stripe es el único registro de lo cobrado, y la plantilla no debe fingir que guarda pedidos propios.
- Sin CMS, sin base de datos. `products.json` es la única fuente de verdad de contenido.
- Idioma: español.
- **Sin definir a propósito:** qué se vende exactamente. El usuario no lo ha fijado. La plantilla se entrega con un catálogo sintético, etiquetado como tal, que el propietario sustituirá. Ninguna decisión estructural puede depender de la categoría concreta.

## Brand Commitments

- Nombre: **Silex**. A secas — sin «Media», sin bajada de línea heredada del otro proyecto.
- Restricción visual fijada por el usuario: **amarillo y blanco como colores principales**. Vinculante. Registrada aquí tal cual, sin ampliarla.
- Referencia de nivel pedida: calidad de sitio premiado en Awwwards. Es una vara de calidad, no una dirección visual.

## Evidence on Hand

Ninguna. No hay fotos de producto reales, ni precios reales, ni clientes, ni reseñas, ni plazos de envío, ni datos de empresa. El trabajo futuro **no** puede inventar ninguna de esas cosas como si fueran ciertas: el catálogo de muestra y todo lo que lo acompaña se entrega marcado como material de relleno y con una lista de qué sustituir.

## Product Principles

1. **Añadir un producto es editar una línea de datos.** Si añadir la referencia número siete obliga a tocar HTML o CSS, la plantilla ha fallado en su trabajo principal.
2. **Pocas piezas, cada una con peso.** El catálogo corto es la premisa, no una limitación temporal: cada producto se muestra a un tamaño que un catálogo largo no se podría permitir.
3. **El contenido de muestra se declara.** Nada colocado como relleno puede leerse como un hecho comercial de la marca.
4. **Resistente al contenido real.** Textos largos, fotos que faltan, precios de distinta longitud y un catálogo que crece no pueden degradar la maquetación.
5. **Silex es una marca nueva.** Cualquier parecido con `silex-media/` sería un error, no una coherencia.

## Accessibility & Inclusion

Sin requisito específico establecido por el usuario. Se aplica el suelo del propio oficio: navegación por teclado, foco visible, contraste suficiente sobre el amarillo (que es un fondo traicionero para el texto), y respeto a `prefers-reduced-motion` — relevante porque el encargo pide animación abundante.
