# Datos de reglas 11e

Estos JSON son la fuente de contenido para las fases y superficies del rediseño.

## Convención de contenido

- Todo nodo de contenido tiene un `id` estable y único dentro del conjunto de datos.
- Todo nodo citado tiene `cita` con el número de sección (`"24.27"`, `"08.03"`, etc.) y `pagina` con la página del PDF.
- Si la fuente suministrada no confirma un dato, el nodo lleva `no_confirmado: true` y una `nota` breve. No se presenta como regla confirmada ni se rellena desde memoria.
- `ver_tambien` contiene únicamente IDs, nunca HTML ni texto de interfaz.
- `fase` es un array con los valores `mando`, `movimiento`, `disparo`, `carga`, `combate` o `cualquiera`.
- En `stratagems.json`, `momento.tipo` es `tu_turno`, `turno_rival` o `cualquiera`; `momento.paso` conserva el momento operativo literal.
- `flavor` es texto de ambientación y debe omitirse en Modo Mesa.
- La terminología oficial de perfiles es `M`, `R`, `S`, `S Inv`, `H`, `L`, `CO`; los perfiles de armas usan `Alc`, `A`, `HP`, `HA`, `F`, `FP`, `D`.

## Archivos

- `rules.json`: secciones `01`–`24`, sus pasos, referencias cruzadas, actualizaciones explícitas y límites de confirmación.
- `abilities.json`: habilidades de armas y reglas universales básicas, con fase aplicable.
- `stratagems.json`: las 10 estratagemas básicas, con PM, fase, momento y campos literales `cuando`, `blanco`, `efecto`, `restricciones`.
- `keywords.json`: claves indexables; las claves sin definición independiente en los PDFs están marcadas `no_confirmado`.
- `tables.json`: tablas de herir, salvaciones, críticos, cobertura, coherencia, objetivos, reservas y acobardamiento.
- `formulas.json`: secuencias resumidas y fórmulas citadas de las cinco fases; sus referencias cruzadas contienen únicamente IDs.
- `roster/`: reservado para datos de roster/patrulla en una fase posterior. No se incluyen aquí reglas de construcción de ejército no confirmadas.

## Fuentes y límites

Los datos proceden de `/home/ubuntu/work/pdf/11e-digest.md`, cuya fuente son los dos PDFs suministrados. El PDF básico no confirma destacamentos, puntos, mejoras ni límites de lista; tampoco es un changelog completo 10e→11e. Las cuatro actualizaciones explícitas y la transición `[PISTOLA]`/`[A QUEMARROPA]` están codificadas en `rules.json`.
