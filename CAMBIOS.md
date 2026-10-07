# Cambios — Pasada de mejoras (UI, a11y, móvil, animación)

Resumen de las modificaciones aplicadas sobre `diet-app` siguiendo los estándares de
`emil-design-eng`, `animate`, `mobile-native`, `break-ui` y `review-animations`.
**No se alteró la funcionalidad ni los datos de `foodDatabase.json` / `categories.json`.**

---

## 1. Accesibilidad

### Focus visible y de contraste suficiente
- **`src/styles/global.css`** — Añadido token `--focus-ring: 0 0 0 3px rgba(124,108,240,0.6)`
  y subido el `:focus-visible` global de `0.5` → `0.85` de opacidad (regla WCAG de foco visible).
- **`Home.module.css`, `MealSection.module.css`, `SearchFood.module.css`, `AddFoodForm.module.css`, `MealDialog.module.css`** — Sustituido el anillo casi invisible
  `box-shadow: 0 0 0 4px var(--accent-soft)` (14 % de opacidad) por `var(--focus-ring)`
  en todos los `input`/`textarea`/`select`. En `MealDialog` los inputs que solo cambiaban el
  borde ahora también muestran el anillo.

### Diálogo modal accesible (`MealDialog.jsx`)
- Foco movido al abrir (al botón de cierre), restaurado al cerrar.
- Cierre con tecla `Escape`.
- **Focus trap**: `Tab`/`Shift+Tab` no salen del modal.
- `tabIndex={-1}` en el contenedor `role="dialog"` para el manejo de foco.

### Errores de formulario anunciados (`AddFoodForm.jsx`)
- Cada mensaje de error ahora tiene `id` + `role="alert"` y su input referencia
  `aria-describedby`, de modo que los lectores de pantalla anuncian el error y lo asocian
  al campo correspondiente (antes eran `<span>` silenciosos).

---

## 2. Móvil / responsive

- **`global.css`** — Baseline de `mobile-native`:
  - `-webkit-tap-highlight-color: transparent` (elimina el flash gris/azul al tocar).
  - `overscroll-behavior-y: none` en `html` (evita que el pull-to-refresh se lleve el scroll).
  - `touch-action: manipulation` y `user-select: none` en `button` y `[role='button']`.
  - `input, textarea, select { font-size: 16px }` (evita el zoom de iOS en inputs).
  - `min-height: 100dvh` con fallback `100vh` en `body` (bug de 100vh).
- **`index.html`** — `viewport-fit=cover` + `interactive-widget=resizes-content` y
  `color-scheme: light` (habilita `env(safe-area-inset-*)`).
- **Hover gateado** — Todos los `:hover` (17 reglas en 7 módulos CSS) quedaron envueltos en
  `@media (hover: hover) and (pointer: fine)`, eliminando el "hover pegajoso" en táctil.
- **Tap targets ≥44×44** — Botones de icono (`removeBtn`, `remove`, `close`, `addFoodClose`,
  `clear`) conservan su tamaño visual pero ganan un área táctil de 44px vía `::after { inset: -8px }`.
- **Safe areas** — `.page` (padding top/bottom) y `.overlay` del modal añaden `env(safe-area-inset-*)`.
- **16px en inputs del diálogo** — `.input` y `.qtyInput` de `MealDialog.module.css` suben de
  `0.88rem` (14px) a `1rem`, evitando el zoom automático de iOS.
- `max-height: 88dvh` (con fallback `88vh`) en el modal.

---

## 3. Animación (motion con propósito, `animate` + `review-animations`)

- **`global.css`** — Tokens de easing fuertes: `--ease-out: cubic-bezier(0.23,1,0.32,1)` y
  `--ease-in-out: cubic-bezier(0.77,0,0.175,1)`.
- **Entrada del modal** (`MealDialog.module.css`) — `overlay-in 200ms var(--ease-out)`
  (opacity) y `modal-in 250ms var(--ease-out)` (`translateY(12px) scale(0.96) → 0/1`,
  nunca desde `scale(0)`). Objetivo: *prevenir un cambio brusco*. Frecuencia: ocasional.
- **Feedback de pulsación** — Botones primarios (`.addFoodBtn`, `.aiBtn`, `.confirm`,
  `.addBtn`, `.submit`, `.primary`) y `.addToggle` ahora hacen `transform: scale(0.97)` en
  `:active` (regla "buttons must feel responsive", 100–160ms, `ease-out`). El hover
  `translateY(-1px)` quedó gateado por separado.
- **Barra de progreso en GPU** (`ProgressBar`) — Cambiado el relleno de `width` a
  `transform: scaleX(...)` con `transform-origin: left` (antes animaba `width`, propiedad de
  layout; ahora solo `transform`/`opacity`).
- **Gráfica de calorías** (`CalorieChart.module.css`) — `stroke-dashoffset 0.6s ease` →
  `0.5s var(--ease-out)`.
- **Reduced motion** — cubierto por el `@media (prefers-reduced-motion: reduce)` global que
  anula `animation/transition-duration`; no se anima ninguna acción de alta frecuencia
  (búsqueda/teclado).

---

## 4. Edge cases (`break-ui`)

- **`MealSection.jsx` / `MealDialog.jsx`** — Los nombres truncados con `text-overflow: ellipsis`
  ahora tienen `title={…}`, así el valor completo es accesible (antes se perdía sin forma de leerlo).
- Números con `font-variant-numeric: tabular-nums` en `.statValue` (evita el "jitter" al actualizar).
- `foodDatabase.json` quedó **intacto**. Durante la pasada se agregaron por error 3 quesos
  (uno duplicaba el "Queso fresco, semiduro, semigraso, tipo campesino" ya existente en la
  línea 74); el Lead revirtió ese cambio y restauró el archivo original.

---

## 5. Calidad de código

- Sin cambios estructurales de gran calado (se respetó Liquid Glass + CSS Modules).
- Recomendaciones pendientes (fuera de esta pasada para no bifurcar el sistema):
  deduplicar el botón primario con gradiente (repetido en 6 módulos) en un token
  `--btn-gradient`; unificar la validación (3 copias: `AddFoodForm.validate`,
  `useFoodDatabase.addCustomFood`, `MealDialog.handleAddAll`); y añadir confirmación
  antes de `Reiniciar día` (pérdida de datos sin confirmar).

---

## Verificación

`npm run build` **confirmado por el Lead**: compila sin errores (`✓ 59 modules transformed`,
~8 s). El agente no pudo ejecutarlo por la restricción de sandbox (`spawn EPERM` de esbuild),
pero como alternativa validó la sintaxis de todos los JS/JSX (`@babel/parser`) y CSS (`postcss`).

---

## Recomendaciones aplicadas (2ª pasada)

### 1. Confirmación antes de "Reiniciar día"
- **`src/pages/Home/Home.jsx`** — Nuevo handler `handleResetDay` que pide confirmación con
  `window.confirm('¿Reiniciar el día? Se borrarán todos los alimentos registrados de hoy.')`
  antes de llamar a `resetDay()`. El botón ahora usa `onClick={handleResetDay}`.
  Evita la pérdida accidental de los datos del día.

### 2. Token `--btn-gradient` (deduplicar botón primario)
- **`src/styles/global.css`** — Nuevo token
  `--btn-gradient: linear-gradient(135deg, var(--accent), var(--accent-2))`.
- Referenciado (antes repetido literalmente) en 5 módulos CSS:
  - `Home.module.css` (`.addFoodBtn`)
  - `MealSection.module.css` (`.confirm`)
  - `FoodCard.module.css` (`.addBtn`)
  - `AddFoodForm.module.css` (`.submit`)
  - `MealDialog.module.css` (`.primary`)
- Apariencia idéntica. `.aiBtn` conserva su propio gradiente (colores distintos, no es el primario).

### 3. Validación unificada (`validateFoodFields`)
- **Nuevo `src/utils/validateFood.js`** — `validateFoodFields(fields)` es ahora la única fuente
  de verdad de validación: nombre, categoría, porción y calorías (más macros opcionales),
  devolviendo errores indexados por campo y tolerando valores `string` (formulario) y
  `number` (parser de IA).
- **`AddFoodForm.jsx`** — Eliminada la `validate` local; usa `validateFoodFields`.
- **`useFoodDatabase.js`** — `addCustomFood` valida con `validateFoodFields` (misma lógica de
  decisión; el mensaje de categoría se unificó a "Elige o escribe una categoría.").
- **`MealDialog.jsx`** — `handleAddAll` valida cada ítem `new` con `validateFoodFields` y toma
  el primer error por fila. El copy de error del diálogo IA ahora es consistente con el del
  formulario (ligeramente más descriptivo); la lógica de aceptación/rechazo es idéntica.

### Verificación (2ª pasada)
`npm run build` vuelve a fallar en el sandbox (`spawn EPERM` de esbuild, restricción de named
pipes) — no es el código. Se validó la sintaxis de todos los JS/JSX con `@babel/parser` y de
todos los CSS con `postcss`: **todo parsea sin errores** (incluido el nuevo `validateFood.js`).
