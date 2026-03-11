Este documento recopila técnicas, patrones y aprendizajes sobre cómo escribir prompts efectivos para obtener los mejores resultados de los modelos de IA. Es una guía práctica basada en experimentación directa.
Contenido previsto

Principios básicos de un buen prompt (claridad, contexto, formato esperado)
Técnicas avanzadas: chain-of-thought, few-shot prompting, role prompting
Plantillas reutilizables para tareas comunes (generar código, revisar código, explicar errores)
Ejemplos de prompts que funcionaron bien vs. los que no
Cómo adaptar prompts según el modelo (GPT-4, Claude, Gemini, etc.)


# Ingeniería de Prompts

## Propósito

La calidad de lo que obtienes de un modelo de IA depende en gran medida de cómo le preguntas. Un prompt vago produce respuestas genéricas; un prompt bien construido puede generar código listo para producción, explicaciones precisas o análisis profundos.

Este documento recoge técnicas experimentadas directamente durante el desarrollo del proyecto TaskFlow, con ejemplos reales y la explicación de por qué cada prompt funciona bien.

---

## Índice

1. [Técnicas base](#1-técnicas-base)
2. [Prompts con rol definido (Role Prompting)](#2-prompts-con-rol-definido-role-prompting)
3. [Prompts con ejemplos (Few-shot Prompting)](#3-prompts-con-ejemplos-few-shot-prompting)
4. [Prompts con razonamiento paso a paso (Chain-of-Thought)](#4-prompts-con-razonamiento-paso-a-paso-chain-of-thought)
5. [Prompts con restricciones claras](#5-prompts-con-restricciones-claras)
6. [Prompts aplicados a TaskFlow](#6-prompts-aplicados-a-taskflow)
7. [Conclusiones](#7-conclusiones)

---

## 1. Técnicas base

Antes de ver los prompts, estas son las cuatro palancas que más impacto tienen en la calidad de una respuesta:

| Palanca | Sin aplicar | Aplicada |
|---|---|---|
| **Rol** | "Revisa mi código" | "Actúa como desarrollador senior y revisa mi código" |
| **Ejemplos** | "Escribe tests" | "Escribe tests como estos: [ejemplos]" |
| **Razonamiento** | "¿Por qué falla?" | "Razona paso a paso por qué podría fallar" |
| **Restricciones** | "Mejora la función" | "Mejora la función sin cambiar su firma ni usar librerías externas" |

Combinar varias palancas en un mismo prompt produce los mejores resultados.

---

## 2. Prompts con rol definido (Role Prompting)

Definir un rol hace que la IA adopte el nivel de experiencia, el tono y el enfoque de ese perfil. No es "magia" — le indica qué tipo de conocimiento priorizar y cómo estructurar la respuesta.

---

### Prompt 1 — Revisión de código como desarrollador senior

```
Actúa como un desarrollador senior de JavaScript con experiencia en proyectos de producción.

Revisa el siguiente código y proporciona un informe estructurado que incluya:
1. Bugs o errores potenciales (explica por qué y cómo reproducirlos si aplica).
2. Problemas de rendimiento (incluye alternativas más eficientes).
3. Malas prácticas (técnicas, de estilo o de arquitectura).
4. Mejoras de legibilidad y mantenibilidad (nombres, estructura, duplicación, etc.).

Sé directo y prioriza los hallazgos por gravedad usando las etiquetas:
- Crítico
- Importante
- Menor

Cuando sea posible, propone fragmentos de código concretos para ilustrar las mejoras.

[CÓDIGO]
```

**¿Por qué funciona bien?**
El rol "desarrollador senior" activa un enfoque crítico y experimentado. La lista numerada fuerza una respuesta estructurada. Pedir prioridad por gravedad evita que la IA trate igual un bug crítico que un comentario de estilo.

**Aplicado en TaskFlow:** detectó el error `texto: texto,a` como crítico y la reasignación de `actualizarContadores` como importante.

---

### Prompt 2 — Documentación como tech writer

```
Actúa como un technical writer especializado en documentación de APIs.
Escribe comentarios JSDoc para la siguiente función JavaScript.
El comentario debe incluir: descripción de una línea, @param con tipos
y descripción, @returns con tipo y descripción, y un @example de uso real.

[FUNCIÓN]
```

**¿Por qué funciona bien?**
El rol "technical writer" produce documentación más clara y orientada al lector que si simplemente pides "añade JSDoc". Especificar exactamente qué campos incluir (`@param`, `@returns`, `@example`) elimina la ambigüedad.

---

### Prompt 3 — Revisión de seguridad como auditor

```
Actúa como un auditor de seguridad web. Analiza el siguiente código
JavaScript que maneja entrada del usuario e identifica posibles
vulnerabilidades (XSS, inyección, exposición de datos, etc.).
Para cada vulnerabilidad encontrada, muestra: qué es, cómo se podría
explotar y cómo corregirlo.

[CÓDIGO]
```

**¿Por qué funciona bien?**
Sin el rol de auditor, la IA revisa el código desde una perspectiva funcional. Con el rol, cambia el enfoque a uno adversarial — busca activamente cómo podría romperse, no solo si funciona correctamente.

---

## 3. Prompts con ejemplos (Few-shot Prompting)

Proporcionar ejemplos del formato o estilo esperado es la técnica más efectiva para obtener consistencia. La IA "aprende" el patrón de los ejemplos y lo aplica al caso nuevo.

---

### Prompt 4 — Generar tests con ejemplos del patrón esperado

```
Escribe tests unitarios para la función `validarTextoNuevaTarea`.
Sigue exactamente este patrón para cada test:

// ✅ Caso válido
// Entrada: [valor]
// Esperado: { valido: true, error: "" }
test("descripción del caso", () => {
  expect(validarTextoNuevaTarea("[valor]")).toEqual({ valido: true, error: "" });
});

// ❌ Caso inválido
// Entrada: [valor]
// Esperado: { valido: false, error: "[mensaje]" }
test("descripción del caso", () => {
  expect(validarTextoNuevaTarea("[valor]")).toEqual({ valido: false, error: "[mensaje]" });
});

Genera al menos 6 tests: casos válidos, texto vacío, texto muy corto,
sin caracteres alfanuméricos y duplicado.
```

**¿Por qué funciona bien?**
Sin ejemplos, la IA elige su propio formato de test y puede variar entre casos. Con los ejemplos, todos los tests siguen exactamente la misma estructura, lo que hace el archivo de tests coherente y fácil de leer.

---

### Prompt 5 — Nombrar funciones siguiendo una convención

```
Necesito renombrar las siguientes funciones siguiendo la convención
de nombres en español con verbos en infinitivo. Aquí tienes ejemplos
del patrón que quiero:

- getData → obtenerDatos
- saveTask → guardarTarea
- updateUI → actualizarInterfaz
- checkValid → validarEntrada

Ahora renombra estas funciones siguiendo el mismo patrón:
- loadTasks
- deleteItem
- toggleDone
- renderList
- handleClick
```

**¿Por qué funciona bien?**
Sin ejemplos, la IA podría usar cualquier convención. Con 4 ejemplos claros del patrón, aprende la lógica (verbo en infinitivo + sustantivo en español) y la aplica consistentemente a todos los casos nuevos.

---

### Prompt 6 — Generar mensajes de commit siguiendo convención

```
Escribe mensajes de commit para los siguientes cambios,
siguiendo la convención Conventional Commits. Aquí tienes ejemplos:

- feat: add task search by text
- fix: correct localStorage key name
- refactor: extract progress logic to separate function
- docs: add JSDoc to validation functions
- style: format app.js with prettier

Ahora escribe los mensajes para estos cambios:
1. Se añadió validación de duplicados al crear tarea
2. Se corrigió el modo oscuro que no cambiaba el fondo del body
3. Se movió la lógica de filtros de index.html a app.js
4. Se añadieron comentarios JSDoc a todas las funciones
```

**¿Por qué funciona bien?**
Los mensajes de commit tienen un formato muy específico. Sin ejemplos, la IA escribe mensajes en cualquier estilo. Con ejemplos del patrón `tipo: descripción en inglés`, los genera consistentes con la convención del proyecto.

---

## 4. Prompts con razonamiento paso a paso (Chain-of-Thought)

Pedir razonamiento explícito obliga a la IA a "pensar en voz alta" antes de responder. Esto reduce errores porque la IA detecta sus propias contradicciones durante el razonamiento.

---

### Prompt 7 — Depuración paso a paso

```
El siguiente código tiene un bug. Antes de darme la solución,
razona paso a paso:

1. ¿Qué debería hacer el código?
2. ¿Qué hace realmente cuando se ejecuta?
3. ¿En qué línea exacta ocurre el problema y por qué?
4. ¿Cuál es la corrección mínima necesaria?
5. ¿Hay algún problema secundario que también debería corregirse?

[CÓDIGO CON BUG]
```

**¿Por qué funciona bien?**
Sin el razonamiento paso a paso, la IA a veces da una solución incorrecta con confianza. Forzar el análisis estructurado hace que llegue a la causa raíz en lugar de al síntoma visible. El paso 5 es clave — descubre problemas secundarios que un prompt directo ignoraría.

**Aplicado en TaskFlow:** con este prompt se descubrió que el bug del modo oscuro no era solo el toggle de la clase `dark`, sino que Tailwind no estaba configurado para aplicar variantes `dark:` al body.

---

### Prompt 8 — Decidir entre dos enfoques

```
Necesito decidir entre dos enfoques para implementar [funcionalidad].

Opción A: [descripción]
Opción B: [descripción]

Razona paso a paso evaluando cada opción en estos criterios:
1. Complejidad de implementación
2. Rendimiento
3. Mantenibilidad a largo plazo
4. Compatibilidad con el resto del proyecto

Al final, recomienda cuál usar y por qué.
```

**¿Por qué funciona bien?**
Pedir evaluación por criterios específicos evita respuestas vagas como "depende del caso". El razonamiento explícito hace transparente la lógica de la recomendación, lo que permite estar de acuerdo o no con cada punto.

---

## 5. Prompts con restricciones claras

Las restricciones eliminan la ambigüedad y acotan el espacio de respuestas posibles. Cuanto más específicas, más útil es el resultado.

---

### Prompt 9 — Refactorizar con restricciones estrictas

```
Refactoriza la siguiente función JavaScript con estas restricciones:
- NO cambies el nombre de la función ni sus parámetros
- NO uses librerías externas
- NO cambies el valor de retorno
- SÍ añade manejo de errores con try/catch donde sea necesario
- SÍ divide en subfunciones si la función supera 20 líneas
- SÍ añade comentarios JSDoc

[FUNCIÓN]
```

**¿Por qué funciona bien?**
Sin restricciones, la IA puede reescribir la función completamente cambiando la interfaz, lo que rompe el código que la llama. Las restricciones explícitas en formato SÍ/NO son fáciles de seguir y verificar. El resultado es predecible y seguro de aplicar.

---

### Prompt 10 — Generar código con restricciones de compatibilidad

```
Escribe una función JavaScript que [descripción de la funcionalidad].

Restricciones:
- Vanilla JS puro, sin frameworks ni librerías
- Compatible con los últimos 2 años de navegadores (sin features experimentales)
- Máximo 30 líneas incluyendo JSDoc
- Manejo de errores obligatorio para inputs inválidos
- Devuelve null en caso de error (no lanza excepciones)

El código será usado en un proyecto educativo, así que los nombres
de variables y comentarios deben ser en español.
```

**¿Por qué funciona bien?**
Cada restricción tiene un propósito claro: "vanilla JS" evita dependencias, "últimos 2 años" evita features experimentales, "máximo 30 líneas" evita sobre-ingeniería, "devuelve null" define el contrato de error. Sin estas restricciones, la IA hace elecciones por defecto que pueden no encajar con el proyecto.

---

### Prompt 11 — Explicar código con restricciones de audiencia

```
Explica el siguiente código JavaScript como si se lo explicaras a
un estudiante de primer año de DAM que sabe HTML y CSS pero lleva
poco tiempo con JavaScript.

Restricciones:
- No uses jerga técnica sin explicarla antes
- Usa analogías del mundo real cuando sea posible
- Máximo 150 palabras
- Termina con "Lo más importante a recordar es: [frase clave]"

[CÓDIGO]
```

**¿Por qué funciona bien?**
Definir la audiencia ("estudiante de primer año de DAM") calibra el nivel de la explicación. El límite de palabras fuerza concisión. La frase final obligatoria garantiza que siempre hay un takeaway claro, algo que se olvida en explicaciones largas.

---

## 6. Prompts aplicados a TaskFlow

Estos son los prompts combinados que más valor aportaron durante el desarrollo real del proyecto:

---

### Prompt 12 — Revisión completa combinando todas las técnicas

```
Actúa como un desarrollador senior de JavaScript revisando el código
de un estudiante de DAM antes de entregarlo.

Revisa el siguiente archivo y razona paso a paso:
1. ¿Qué hace bien el código? (menciona al menos 3 cosas)
2. ¿Qué errores o bugs tiene? (ordénalos de crítico a menor)
3. ¿Qué mejorarías si fuera código de producción?

Restricciones:
- Sé constructivo, no destructivo
- Para cada problema, muestra el código con el bug Y la corrección
- No propongas refactorizaciones que cambien la arquitectura general

[CÓDIGO DE TASKFLOW]
```

**¿Por qué funciona bien?**
Combina rol (desarrollador senior), razonamiento (paso a paso con estructura), restricciones (constructivo, mostrar antes/después, no cambiar arquitectura) y formato esperado (3 secciones claras). Es el prompt más completo y el que produjo la revisión más útil de todo el proyecto.

---

### Prompt 13 — Generar README con contexto del proyecto

```
Actúa como un technical writer. Escribe el README.md para el
siguiente proyecto siguiendo este esquema exacto:

## [Nombre del proyecto]
[Descripción en 2-3 frases]

## Características
[Lista de 5-7 características principales]

## Tecnologías usadas
[Lista con versiones]

## Cómo ejecutar el proyecto
[Pasos numerados]

## Estructura del proyecto
[Árbol de carpetas con descripción de cada archivo]

Restricciones:
- En español
- Tono profesional pero accesible
- Sin secciones vacías
- Los comandos deben estar en bloques de código

Información del proyecto: [descripción de TaskFlow]
```

**¿Por qué funciona bien?**
Proporcionar el esquema exacto garantiza que el README tenga todas las secciones necesarias en el orden correcto. Sin el esquema, la IA elige qué incluir y puede omitir secciones importantes. El rol de technical writer mejora la redacción.

---

## 7. Conclusiones

### ¿Qué técnica aporta más valor?

Después de experimentar con todas las técnicas en TaskFlow, el ranking personal es:

1. **Restricciones claras** — el impacto más inmediato. Un prompt sin restricciones puede dar una respuesta inútil aunque el rol y los ejemplos sean buenos.
2. **Rol definido** — cambia completamente el enfoque y la profundidad de la respuesta.
3. **Few-shot (ejemplos)** — imprescindible cuando el formato importa (tests, commits, JSDoc).
4. **Chain-of-thought** — más útil en debugging y decisiones de diseño que en generación de código.

### Errores comunes que hay que evitar

- **Prompt demasiado largo:** si supera 200 palabras, la IA puede perder el filo del objetivo principal. Mejor dividir en varios prompts.
- **Varios objetivos en un prompt:** "revisa, refactoriza y documenta" en un solo prompt suele dar resultados mediocres en todo. Mejor hacerlo en tres prompts separados.
- **No revisar el resultado:** ninguna técnica garantiza que el código generado sea correcto. Siempre hay que leerlo antes de aceptarlo.

### Frase resumen

> Un buen prompt es como un buen briefing: cuanto más claro eres sobre qué quieres, cómo lo quieres y qué no quieres, mejor es el resultado.

---

*Documento completado — Prácticas DAM · Proyecto TaskFlow*