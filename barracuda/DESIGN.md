---
name: Barracuda
description: Catálogo de ocho objetos compuesto como el pliego de espécimen de una fundición tipográfica.
colors:
  papel: "#ffffff"
  tinta: "#121110"
  tinta-media: "#6b6759"
  amarillo: "#ffe500"
  amarillo-hondo: "#e5cd00"
  amarillo-sombra: "#6b5f00"
  sobre-amarillo-medio: "#6b5a00"
  filete: "rgba(18, 17, 16, 0.22)"
  filete-firme: "rgba(18, 17, 16, 0.55)"
typography:
  espectro:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "min(calc(100cqi / (var(--caracteres) * 0.605) * var(--ajuste, 1)), 52vh)"
    fontWeight: 700
    lineHeight: 0.82
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 100, 'wght' 700, 'opsz' 96"
  titular:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 7.2vw, 6.2rem)"
    fontWeight: 620
    lineHeight: 0.92
    letterSpacing: "-0.032em"
  seccion:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.028em"
  parrafo:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1.35vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.58
    letterSpacing: "normal"
  cuerpo:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  margen-nota:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  accion:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.1em"
  dato:
    fontFamily: "Martian Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.06em"
    fontFeature: "tabular-nums"
  dato-menor:
    fontFamily: "Martian Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.04em"
    fontFeature: "tabular-nums"
  cifra:
    fontFamily: "Martian Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums lining-nums"
  marca:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 88"
  nombre-banda:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5.5vw, 3.5rem)"
    fontWeight: 650
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  nombre-linea:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  nombre-leyenda:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1.5vw, 1.4rem)"
    fontWeight: 620
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  precio-banda:
    fontFamily: "Martian Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.03em"
    fontFeature: "tabular-nums lining-nums"
  suma:
    fontFamily: "Martian Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "clamp(1.75rem, 5vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.03em"
    fontFeature: "tabular-nums lining-nums"
  detalle:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  prosa-nota:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.8vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  precio-ficha:
    fontFamily: "Martian Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "clamp(2rem, 4.5vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
    fontFeature: "tabular-nums lining-nums"
rounded:
  nulo: "0"
spacing:
  margen: "clamp(1.125rem, 4vw, 3.5rem)"
  canal: "clamp(1.5rem, 3vw, 2.75rem)"
  pliegue: "clamp(5rem, 11vw, 10rem)"
components:
  accion-principal:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    typography: "{typography.accion}"
    rounded: "{rounded.nulo}"
    padding: "0.95rem 1.35rem"
  accion-principal-hover:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.tinta}"
  boton-anadir:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.tinta}"
    typography: "{typography.accion}"
    rounded: "{rounded.nulo}"
    padding: "1rem 1.4rem"
  boton-anadir-hover:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.amarillo}"
  boton-orden:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.tinta}"
    typography: "{typography.accion}"
    rounded: "{rounded.nulo}"
    padding: "0.5rem 0.75rem"
  boton-orden-hover:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.amarillo}"
  boton-tramitar:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    typography: "{typography.accion}"
    rounded: "{rounded.nulo}"
    padding: "1rem 1.25rem"
  campo-tirada:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.nulo}"
    padding: "0.65rem 0"
  aviso:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.nulo}"
    padding: "0.9rem 1.1rem"
    width: "min(24rem, calc(100vw - 2.5rem))"
  cajon-orden:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.nulo}"
    width: "min(30rem, 100%)"
  plancha:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.nulo}"
---

# Design System: Barracuda

## Overview

**Creative North Star: "El pliego de espécimen"**

Barracuda se compone como el pliego que una fundición tipográfica imprime para enseñar una cara: papel blanco a sangre, una sola tinta negra, un campo amarillo macizo que ocupa regiones enteras del pliego, filetes de 1px que dividen sin decorar y datos en mono tabular que declaran medida. El tamaño no es jerarquía decorativa: en un espécimen el tamaño **es** el contenido, y por eso el nombre de la casa ocupa el ancho entero de su columna y cada escalón del catálogo baja un peldaño de cuerpo.

La densidad es alta y deliberadamente técnica. No hay tarjetas: las planchas llevan su propio marco de 1px y se apoyan sobre la hoja, y la retícula del catálogo no dibuja celdas ni fondos por pieza. La página no tiene profundidad simulada —cero sombras, cero degradados, cero radios— y toda la sensación de capas viene del filete, del cambio de campo (papel ↔ amarillo) y del orden tabular. El único momento de autoría en movimiento es el probador del primer pliego: el nombre entra condensado y ligero y se abre hasta su reposo, y después el puntero manda sobre los ejes `wdth`/`wght` con lectura numérica en mono.

El mundo rechaza expresamente la rejilla de tarjetas con foto grande y botón que repite la categoría. Lo que sustituye a la foto no es un hueco: son planchas SVG dibujadas a tinta, con trama de semitono, marcas de registro y cota acotada, de modo que un catálogo sin una sola fotografía sigue pareciendo hecho.

**Key Characteristics:**
- Dos superficies y nada más: papel blanco y campo amarillo #FFE500 macizo.
- Una tinta negra; el blanco dentro de un dibujo es papel visto a través de la tinta, no un segundo color.
- Radio 0 en todo el sistema; sin sombras ni degradados en ninguna superficie.
- Filete de 1px como único separador, en dos firmezas.
- Mono tabular reservada a lo que se mide; la cara de texto para prosa y acciones.
- Tipo medido, no elegido: el nombre del estudio se dimensiona por número de caracteres dentro de una container query.
- Todo visible por defecto; la animación sólo retira estados que ya parten de visible.

## Colors

Paleta de dos superficies y una tinta: no hay grises de sistema, no hay color de estado, no hay acento secundario.

### Primary
- **Amarillo espécimen** (`{colors.amarillo}`): el campo, no el acento. Se aplica macizo a regiones enteras —la banda del primer corte, la nota del taller, la cabeza del cajón de la orden, el aviso— y como relleno de estado en el barrido de un escalón del catálogo, la fila de la tabla del pie y el hover de una pieza vecina. También es el color de `::selection` y el `themeColor` del navegador.
- **Amarillo hondo** (`{colors.amarillo-hondo}`): sólo como color de subrayado y de filete de foco cuando el amarillo macizo sería demasiado (enlace del cajón vacío, foco del campo de tirada).
- **Amarillo sombra** (`{colors.amarillo-sombra}`): reservado al pulgar de la barra de scroll en hover. Ni texto ni fondo.

### Neutral
- **Papel** (`{colors.papel}`): fondo global, fondo de cajón y de pieza, y el "blanco" de los dibujos (bisel, veta, hueco).
- **Tinta** (`{colors.tinta}`): texto principal, todos los trazos de dibujo e icono, bordes firmes de estructura, foco y velo del cajón al 44 % de opacidad. Contraste medido 18,86:1 sobre papel y 14,78:1 sobre amarillo.
- **Tinta media** (`{colors.tinta-media}`): el único tono secundario de texto sobre papel —referencias, cotas, términos de tabla, notas al margen, cabeceras de columna. Contraste medido 5,66:1 sobre papel; por debajo de esto no se compone nada legible.
- **Sobre amarillo medio** (`{colors.sobre-amarillo-medio}`): el secundario cuando el fondo es amarillo. Es el mismo tono teñido del propio amarillo, nunca un gris. Contraste medido 5,33:1 sobre el campo.
- **Filete** y **filete firme** (`{colors.filete}`, `{colors.filete-firme}`): las dos únicas divisiones. El suave separa filas dentro de un bloque; el firme cierra bloques y enmarca planchas.

### Named Rules
**La regla del campo, no del acento.** El amarillo no salpica: ocupa. Se aplica a una banda, una sección o una fila entera, con su borde de 1px de tinta. Un punto, una pastilla o un icono amarillo suelto no pertenece a este sistema.

**La regla de la tinta única.** Hay una sola tinta. Un blanco dentro de una forma es papel visto a través de la tinta (trazo `--papel` al 55 % o hueco relleno de papel), nunca un segundo color de dibujo.

**La regla del secundario teñido.** Sobre amarillo, el texto secundario se tiñe del propio tono (`{colors.sobre-amarillo-medio}`). Un gris sobre el campo amarillo está prohibido y se ve inmediatamente sucio.

## Typography

**Display Font:** Bricolage Grotesque variable, ejes `opsz` y `wdth` (con `system-ui`, `sans-serif`)
**Body Font:** Archivo (con `system-ui`, `sans-serif`)
**Label/Mono Font:** Martian Mono, pesos 400/500/600 (con `ui-monospace`, `SFMono-Regular`, `monospace`)

**Character:** Una grotesca variable de nariz corta que puede condensarse y engordar en vivo, apoyada en una neogrotesca de texto sobria y una mono ancha y técnica que hace que las cifras parezcan medidas. El conjunto suena a taller: rótulo, prosa y registro de control.

### Hierarchy
- **Espectro** (700, medido, `line-height` 0.82, `letter-spacing` -0.035em, versalitas altas): el nombre del estudio a sangre en el primer pliego y en la firma del pie. Su cuerpo no viene de la escala: se calcula.
- **Titular** (620, `clamp(2.6rem, 7.2vw, 6.2rem)`, 0.92): título de sección grande y nombre de corte en su ficha.
- **Sección** (600, `clamp(1.75rem, 3.4vw, 3rem)`, 1): encabezados de bloque en el pliego.
- **Escalón** (640, `calc(clamp(2rem, 6.4vw, 5.25rem) * --escala)`, 1.02, `wdth` variable): el nombre de cada corte en la cascada, cuyo cuerpo desciende un peldaño por posición.
- **Párrafo** (400, `clamp(1.0625rem, 1.35vw, 1.3125rem)`, 1.58, máx. 68ch): prosa larga. Sumarios cortos se limitan a 44ch, el texto de la nota del taller a 62ch.
- **Cuerpo** (400, 1rem, 1.5): base del documento.
- **Nota al margen** (400, 0.875rem, en tinta media): anotación corta que acompaña a un bloque; clase `.margenNota`.
- **Acción** (600, 0.8125rem, `letter-spacing` 0.1em, caja alta, cara de texto): todo botón y todo enlace de acción; clase `.accion`.
- **Dato** (500, 0.75rem, `letter-spacing` 0.06em, caja alta, mono tabular): referencias, cotas, ejes, cabeceras de tabla, recuentos, leyendas de plancha; clase `.dato`. Variante menor a 0.6875rem para descripción de aviso y micro-leyenda.
- **Cifra** (mono, tabular + lining, `letter-spacing` -0.01em): precios y sumas, a cualquier cuerpo; clase `.cifra`.

### Named Rules
**La regla de la mono que mide.** La mono es exclusivamente para lo que se mide o se identifica: referencias, medidas, precios, valores de eje, cabeceras de tabla y recuentos. Prosa y acciones van en la cara de texto (`.margenNota` y `.accion`). Un botón no mide nada, así que no va en mono.

**La regla del tipo medido.** El nombre del estudio no tiene cuerpo fijo: se calcula con `100cqi` dividido entre su número de caracteres (`--caracteres`) por 0.605 en el primer pliego y por 0.618 en la firma del pie, dentro de un contenedor con `container-type: inline-size`, y se afina con el factor medido `--ajuste` (acotado entre 0.6 y 1.8). Cambiar el nombre del estudio no puede romper esto: pasa el nuevo recuento de caracteres, nunca un `font-size` a mano.

**La regla de la referencia a la base.** La referencia (`SLX-01`) vive en la línea de base del nombre al que pertenece, separada por un `gap`, nunca encima de él. Un dato colocado sobre el título sería un antetítulo, y esta casa no usa antetítulos ni kickers en ninguna superficie.

## Layout

El modelo es el pliego: un lienzo de ancho completo con un margen lateral común (`{spacing.margen}`), sin contenedor centrado de ancho máximo. Los bloques se separan verticalmente con el pliegue (`{spacing.pliegue}`) y las columnas con el canal (`{spacing.canal}`); ese es todo el ritmo global, y los ajustes finos dentro de un bloque se expresan en `clamp()` local.

Los bloques se cierran con `border-block: 1px solid var(--tinta)` en lugar de con fondo. Alineación de referencia: `align-items: baseline` en casi toda fila que mezcle nombre, dato y precio, para que la línea de base sea la retícula real.

Rejillas observadas:
- **Primer pliego**: nombre a sangre + columna de oferta/acción `minmax(17rem, 26rem)` al costado, con `border-block` de tinta; debajo, banda amarilla `auto / 1fr / auto`.
- **Cascada del catálogo**: lista de escalones a ancho completo, `5.5rem / auto / 1fr / auto / auto`, con reserva derecha de hasta 19rem para la plancha que sigue al puntero.
- **Hoja de piezas**: 4 columnas → 3 (≤64rem) → 2 (≤48rem), separadas sólo por `gap`, sin filetes de retícula.
- **Ficha de corte**: plancha `0.85fr` pegajosa (`top: 5.5rem`) junto a texto `1fr`; colapsa a una columna en ≤60rem.
- **Vecinos**: 4/3/2 columnas con `gap: 1px` sobre fondo `{colors.filete-firme}`, de modo que la separación es el propio filete.
- **Pie**: índice tabular `1.35fr` junto a lateral `1fr`, y la firma a sangre cortada por el borde inferior.

Puntos de ruptura: 64rem, 60rem, 48rem, 40rem, 30rem. El comportamiento estrecho no reordena por reordenar: colapsa a una columna y reubica la referencia y el precio en la primera línea del escalón para que la referencia nunca caiga sola a su renglón.

Movimiento: una sola curva de salida `cubic-bezier(0.16, 1, 0.3, 1)` con tres escalones (140 / 240 / 420 ms) y una entrada focal de 780 ms para los ejes del espectro. Todo parte de un estado ya visible: `[data-revelar]` es `opacity: 1` por defecto y sólo se oculta dentro de `prefers-reduced-motion: no-preference`. Con movimiento reducido, las transiciones caen a 0.01ms y no queda un solo elemento oculto.

### Named Rules
**La regla del ritmo de tres.** Sólo existen tres tokens de espacio de sistema —margen, canal y pliegue—. Un bloque nuevo se separa con pliegue y se margina con margen; inventar un cuarto valor global es drift.

**La regla del visible por defecto.** Ninguna entrada puede empezar oculta fuera de la consulta de movimiento. Si el script falla o el usuario reduce movimiento, la página se lee entera.

## Elevation & Depth

Sistema plano por definición: **cero sombras, cero degradados, cero radios** en toda la aplicación. No hay `box-shadow` en ningún archivo del build. La profundidad se transmite por tres medios: el filete de 1px (dos firmezas), el cambio de campo entre papel y amarillo, y el orden de apilado explícito de las capas fijas (cabecera 50, velo 60, cajón 61, plancha seguidora 2 dentro de su bloque).

La única capa que oscurece es el velo del cajón de la orden, `rgba(18, 17, 16, 0.44)` a pantalla completa: un plano de tinta translúcido, no un difuminado. El cajón se separa del velo con un borde izquierdo de 1px de tinta, no con sombra.

### Named Rules
**La regla del plano único.** Todo vive en el mismo plano de papel. Si un elemento necesita destacar, se le da filete, campo amarillo o cuerpo; nunca altura.

## Shapes

Radio 0 sin excepciones, incluido el pulgar de la barra de scroll (`border-radius: 0` explícito). Los ángulos son rectos y los remates de icono también: un solo grosor de trazo (1.6), `stroke-linecap: square`, `stroke-linejoin: miter` y caja de 24 para todos los iconos, dibujados en el propio proyecto —ni glifos unicode, ni emoji, ni paquete de iconos.

El vocabulario de forma repetido es el marco: un rectángulo de 1px que declara un borde. La plancha lo lleva (`filete-firme`), los botones lo llevan (`tinta`), el aviso lo lleva, el cajón lo lleva en un solo lado. El subrayado es la otra forma recurrente: borde inferior de 2–3px que aparece en hover, o `text-decoration` de 1px con `text-underline-offset: 0.22em`.

El foco es un contorno de 2px de tinta con 3px de separación (4px dentro de `.enAmarillo`), nunca un halo.

## Components

### Buttons
- **Shape:** rectángulo recto (radio 0) con filete de 1px de tinta.
- **Acción principal** (`accion-principal`): tinta sólida sobre papel, tipo `.accion` en caja alta, `0.95rem 1.35rem`, con flecha dibujada de 17px. Hover: invierte a campo amarillo con texto tinta y la flecha avanza 4px.
- **Añadir a la orden** (`boton-anadir`) y **botón de orden en cabecera** (`boton-orden`): campo amarillo con filete de tinta; hover invierte a tinta con texto amarillo; `:active` baja 1px.
- **Tramitar** (`boton-tramitar`): tinta sólida a ancho de cajón; hover a campo amarillo.
- **Acción secundaria:** enlace subrayado con filete suave que se firma en tinta al hover; sin caja.
- **Agotado:** no es un botón deshabilitado; es una nota entre dos filetes suaves, máx. 34ch.
- **Hover / Focus:** transiciones de color a 240ms y de borde a 140ms con la curva de salida; foco siempre por `:focus-visible`.

### Cards / Containers
No hay tarjetas. La unidad contenedora es la **plancha**: figura con marco de 1px `filete-firme`, fondo papel o amarillo, dibujo en relación 480/620 y pie de leyenda separado por filete con la referencia a la izquierda y la naturaleza de la imagen a la derecha. Sin radio, sin sombra, sin relleno interior alrededor del dibujo.

### Inputs / Fields
- **Estilo:** campo sin caja. Fondo transparente, sin borde salvo un filete inferior de 1px de tinta que abarca campo y botón de envío; placeholder en tinta media.
- **Focus:** el filete inferior pasa a amarillo hondo mediante `:focus-within`; el propio `input` no dibuja outline.
- **Error:** texto de 0.875rem en tinta con un filete izquierdo de 1px, sin color de estado.

### Navigation
Cabecera fija en papel, sin sombra y con borde inferior transparente que se vuelve tinta al despegarse del scroll (`.posada`). Marca en display 800 con `wdth: 88` en caja alta; descriptor y separador en tinta media, ocultos por debajo de 60rem. Enlaces sin subrayado que ganan un filete inferior de 1px al hover, ocultos por debajo de 30rem dejando sólo el botón de orden.

### Cascada (componente firma)
La lista del catálogo. Cada escalón es una fila a ancho completo separada por filete suave; el nombre baja un peldaño de cuerpo por posición (`--escala`) y arranca condensado en `wdth: 92`. Al hover o `focus-within`, un pseudoelemento amarillo barre desde el margen izquierdo con `scaleX(0 → 1)` en 240ms —como una marca de revisión sobre el pliego—, los textos secundarios saltan de tinta media a sobre-amarillo-medio y el nombre se abre a `wdth: 100` en 420ms. A la derecha aparece la plancha del corte apuntado, sin eventos de puntero, que se oculta por completo bajo 64rem.

### Plancha (componente firma)
Sistema de dibujo autoral con seis formas (`hoja`, `losa`, `cuenco`, `varilla`, `aro`, `gancho`) sobre lienzo 480×620: trama de semitono de puntos a 45° (opacidad de relleno 0.07 sobre papel, 0.11 sobre amarillo), cuatro marcas de registro en las esquinas al 50 % de opacidad, y cota dimensional opcional con línea, topes y medida en mono de 15px al 75 %. Si la ficha trae fotografía, la foto sustituye al dibujo dentro del mismo marco y la leyenda lo declara.

### Probador (componente firma)
El momento focal de la página: el nombre del estudio como espécimen. Entra una vez desde `wdth 76 / wght 260` hasta `wdth 100 / wght 700` en 780ms con la curva de salida; al terminar, la transición se retira para que el arrastre del puntero vaya al fotograma. El puntero mapea X a `wdth` 75–100 e Y invertida a `wght` 300–800, con lectura numérica en mono en la franja alta. Con movimiento reducido salta directo al reposo y no responde al puntero.

### Cajón de la orden
Albarán, no modal: panel fijo a la derecha de `min(30rem, 100%)` en papel con filete izquierdo de tinta, cabeza en campo amarillo, líneas separadas por filete suave, contador con caja de filete firme cuyos botones se rellenan de amarillo al hover, y suma en cifra grande sobre el pie del pedido.

### Avisos
Sello sobre el pliego: campo amarillo con filete de 1px de tinta, radio 0, título en display 620 y descripción en mono menor en sobre-amarillo-medio. Aparecen abajo a la izquierda para no tapar el botón de tramitar del cajón.

## Do's and Don'ts

### Do:
- **Do** usar el amarillo como campo macizo con su filete de tinta: banda, sección o fila entera.
- **Do** teñir el texto secundario sobre amarillo con `{colors.sobre-amarillo-medio}` y mantener los mínimos medidos (18,86:1 tinta/papel, 5,66:1 secundario/papel, 14,78:1 tinta/amarillo, 5,33:1 secundario/amarillo).
- **Do** reservar la mono tabular para referencias, cotas, precios, valores de eje, cabeceras de tabla y recuentos.
- **Do** componer prosa y botones con la cara de texto mediante `.margenNota` y `.accion`.
- **Do** poner la referencia en la línea de base del nombre, en la misma fila.
- **Do** separar con filete de 1px y cerrar bloques con `border-block: 1px solid var(--tinta)`.
- **Do** usar sólo margen, canal y pliegue para el ritmo global, y `clamp()` local para el resto.
- **Do** dimensionar el nombre del estudio por recuento de caracteres dentro de la container query y afinarlo con `--ajuste`.
- **Do** dibujar cualquier icono nuevo en la caja de 24 con trazo 1.6, remate cuadrado y unión en inglete.
- **Do** dejar todo visible por defecto y verificar que con `prefers-reduced-motion: reduce` no queda ningún elemento oculto.
- **Do** animar con `cubic-bezier(0.16, 1, 0.3, 1)` en 140 / 240 / 420ms, reservando los 780ms a la entrada del espectro.

### Don't:
- **Don't** añadir sombras, degradados ni radios de esquina: el sistema es plano y recto en todas sus superficies.
- **Don't** meter el catálogo en tarjetas con fondo, celda o caja por pieza; las planchas llevan su propio marco y se apoyan en la hoja.
- **Don't** usar gris sobre el campo amarillo.
- **Don't** componer un botón, un enlace de acción o prosa en la mono.
- **Don't** colocar la referencia, una etiqueta de categoría o cualquier antetítulo encima del nombre.
- **Don't** introducir un tercer color ni un color de estado (verde de éxito, rojo de error): el error se marca con filete, no con color.
- **Don't** usar glifos unicode, emoji ni un paquete de iconos; los iconos de esta casa están dibujados.
- **Don't** fijar a mano el `font-size` del nombre del estudio ni de la firma del pie.
- **Don't** ocultar contenido en el estado inicial fuera de `prefers-reduced-motion: no-preference`.
