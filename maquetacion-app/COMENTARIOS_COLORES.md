# Guía de colores del tema claro

Ubicación: `index.html` → bloque `<style>` → variables en `:root` (líneas ~26-127)

---

## Variables del tema claro (`--light-*`)

| Variable | Valor actual | Qué cambia si lo modificas |
|----------|--------------|----------------------------|
| `--light-bg-body` | #ffffff | Fondo de la página principal y del área central (main) |
| `--light-bg-header` | #ffffff | Fondo de la barra superior (logo, buscador, botones) |
| `--light-bg-sidebar` | #ffffff | Fondo del panel lateral y del pie de página |
| `--light-bg-card` | #ffffff | Fondo de las tarjetas de tarea y las 3 de estadísticas |
| `--light-bg-card-hover` | #fafafa | Fondo de la tarjeta al pasar el ratón |
| `--light-bg-card-done` | #f9fafb | Fondo de la tarjeta cuando está completada |
| `--light-bg-input` | #f9fafb | Fondo del buscador y del input del modal |
| `--light-bg-sidebar-stat` | #f9fafb | Fondo de las 3 cajas del sidebar (Total, Pendientes, Completadas) en modo claro |
| `--dark-bg-sidebar-stat` | rgb(31 41 55) | Fondo de las 3 cajas del sidebar en modo oscuro (azul/gris oscuro) |
| `--light-bg-stats-inner` | #f9fafb | Fondo interno de las estadísticas del sidebar |
| `--light-bg-badge` | #f3f4f6 | Badges, barra de progreso vacía, etiquetas activas |
| `--light-bg-button` | #4b5563 | Botones principales (Nueva tarea, Añadir, pestaña activa) |
| `--light-bg-button-hover` | #374151 | Mismo fondo de esos botones al hacer hover |
| `--light-border` | #e5e7eb | Bordes de header, aside, tarjetas, inputs |
| `--light-border-light` | #f3f4f6 | Bordes alternativos (no usado actualmente) |
| `--light-text` | #111827 | Texto principal (títulos, números, tareas) |
| `--light-text-muted` | #6b7280 | Texto secundario (labels, descripciones) |
| `--light-text-subtle` | #9ca3af | Texto más sutil (no usado actualmente) |
| `--light-check-border` | #d1d5db | Borde del círculo check antes de marcar |
| `--light-check-done` | #9ca3af | Color del check cuando la tarea está completada |
| `--light-progress-from` | #9ca3af | Inicio del gradiente de la barra de progreso |
| `--light-progress-to` | #6b7280 | Fin del gradiente de la barra de progreso |
| `--light-shadow` | rgba(0,0,0,0.08) | Sombra de la tarjeta al hacer hover |

---

## Variables globales (tema oscuro / utilidades)

| Variable | Qué cambia si lo modificas |
|----------|----------------------------|
| `--color-primario` | Púrpura: borde de tarjeta al hover en modo oscuro |
| `--color-primario-hover` | Púrpura hover en modo oscuro |
| `--color-fondo-oscuro` | Fondo de las tarjetas en modo oscuro |
| `--color-borde-oscuro` | Bordes en modo oscuro |
| `--color-exito` | Verde de tarea completada (check y borde en oscuro) |
| `--color-exito-fondo` | Fondo verde suave de tarjeta completada en oscuro |
| `--color-error` | Rojo del borde del input cuando hay error de validación |

---

## Si no ves los comentarios en el index.html

1. **Cerrar y volver a abrir** `index.html` en el editor.
2. **Desplázate hacia arriba**: el bloque TEMA CLARO empieza en la línea 26, justo después de `<style>`.
3. **Descartar cambios sin guardar**: Cmd+Z o "Revert File" si tenías otra versión abierta.
