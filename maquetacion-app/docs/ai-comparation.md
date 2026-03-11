En este documento registraré una comparación detallada entre diferentes herramientas de inteligencia artificial utilizadas durante el desarrollo del proyecto. El objetivo es analizar las fortalezas, debilidades y casos de uso más adecuados para cada una.
Contenido previsto

Tabla comparativa de herramientas (ChatGPT, Claude, Cursor, Copilot, etc.)
Evaluación por criterios: precisión, velocidad, facilidad de uso, integración con el flujo de trabajo
Casos de uso donde cada herramienta destaca
Conclusiones y recomendaciones según el tipo de tarea

# Comparación de Herramientas de IA

## Propósito

El ecosistema de herramientas de IA para desarrollo de software crece a un ritmo acelerado, y elegir la herramienta adecuada para cada tarea puede marcar una diferencia real en productividad y calidad del trabajo. Sin una comparación sistemática, es fácil caer en el uso indiscriminado de una sola herramienta, perdiendo las ventajas que otras podrían ofrecer.

Este documento existe para construir un criterio propio y fundamentado. No se trata de reproducir benchmarks genéricos de internet, sino de registrar observaciones de primera mano: qué herramienta respondió mejor ante un problema concreto, cuál generó código más limpio en un contexto específico, cuál entendió mejor el objetivo sin necesitar aclaraciones extra.

---

## Índice

1. [Explicación de conceptos técnicos](#1-explicación-de-conceptos-técnicos)
2. [Detección de bugs en código JavaScript](#2-detección-de-bugs-en-código-javascript)
3. [Generación de código desde lenguaje natural](#3-generación-de-código-desde-lenguaje-natural)
4. [Análisis y conclusiones finales](#4-análisis-y-conclusiones-finales)

---

## 1. Explicación de conceptos técnicos

**Prompt usado en ambos asistentes:**
> *"Explícame el concepto de [X] en JavaScript. Quiero entender qué es, cómo funciona internamente y ver un ejemplo práctico claro."*

Los tres conceptos evaluados son: **Closures**, **Event Loop** y **Hoisting**.

---

### 1.1 Closures

#### 💬 Prompt
> *"Explícame qué es un closure en JavaScript. Quiero entender qué es, cómo funciona internamente y ver un ejemplo práctico claro."*

---

#### 🤖 ChatGPT (GPT-4o)

Un **closure** es una función que recuerda el entorno léxico en el que fue creada, incluso después de que ese entorno haya terminado de ejecutarse.

```javascript
function contador() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}

const incrementar = contador();
console.log(incrementar()); // 1
console.log(incrementar()); // 2
console.log(incrementar()); // 3
```

La función interna "cierra sobre" la variable `count`. Aunque `contador()` ya terminó, la variable `count` sigue viva en memoria porque la función interna la referencia.

**Caso de uso real:** crear funciones con estado privado, como un módulo contador o un generador de IDs únicos.

---

#### 🤖 Claude (Sonnet)

Un closure ocurre cuando una función interna mantiene acceso a las variables de su función externa, incluso después de que la función externa haya retornado. Esto es posible porque JavaScript usa **ámbito léxico**: las funciones recuerdan el scope donde fueron *definidas*, no donde fueron *llamadas*.

Internamente, cuando el motor JS crea una función, le adjunta una referencia al **entorno léxico** actual (un objeto que contiene todas las variables disponibles en ese momento). Ese entorno no se destruye mientras alguna función lo referencie.

```javascript
function crearMultiplicador(factor) {
  // 'factor' queda capturado en el closure
  return function (numero) {
    return numero * factor;
  };
}

const doble = crearMultiplicador(2);
const triple = crearMultiplicador(3);

console.log(doble(5));  // 10
console.log(triple(5)); // 15
// Cada función tiene su propio 'factor' capturado de forma independiente
```

Un error clásico con closures en bucles:

```javascript
// ❌ Bug típico: todas las funciones comparten la misma 'i'
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // imprime 3, 3, 3
}

// ✅ Solución con let (scope de bloque)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // imprime 0, 1, 2
}
```

**Usos prácticos:** datos privados (patrón módulo), funciones de fábrica, memorización, callbacks con contexto.

---

#### 📊 Comparativa — Closures

| Criterio | ChatGPT | Claude |
|---|---|---|
| Claridad de la definición | ✅ Clara y directa | ✅ Clara + explica el *por qué* interno |
| Profundidad técnica | ⚠️ Superficial | ✅ Explica entorno léxico y motor JS |
| Calidad del ejemplo | ✅ Correcto y sencillo | ✅ Ejemplo + antipatrón común |
| Casos de uso | ✅ Menciona 1-2 | ✅ Lista varios patrones reales |
| Longitud | Concisa | Más extensa pero justificada |

---

### 1.2 Event Loop

#### 💬 Prompt
> *"Explícame cómo funciona el Event Loop en JavaScript. Quiero entender qué es, cómo funciona internamente y ver un ejemplo práctico claro."*

---

#### 🤖 ChatGPT (GPT-4o)

JavaScript es **single-threaded**, lo que significa que solo puede ejecutar una cosa a la vez. El Event Loop es el mecanismo que le permite manejar operaciones asíncronas sin bloquear el hilo principal.

Componentes clave:
- **Call Stack:** donde se ejecutan las funciones, en orden LIFO.
- **Web APIs:** donde se procesan tareas asíncronas (setTimeout, fetch, eventos).
- **Callback Queue:** cola de callbacks listos para ejecutarse.
- **Event Loop:** revisa constantemente si el Call Stack está vacío y, si lo está, mueve callbacks de la cola al stack.

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
console.log("3");
// Output: 1, 3, 2
```

Aunque el timeout es 0ms, el callback va a la cola y espera a que el stack esté vacío.

---

#### 🤖 Claude (Sonnet)

El Event Loop es el corazón del modelo de concurrencia de JavaScript. Para entenderlo hay que conocer todas las piezas que interactúan:

```
┌─────────────────────────┐
│       Call Stack        │  ← Ejecución síncrona (LIFO)
└────────────┬────────────┘
             │ vacío?
             ▼
┌─────────────────────────┐
│    Microtask Queue      │  ← Promises (.then), queueMicrotask
│  (prioridad más alta)   │     Se vacía COMPLETA antes de macrotareas
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│    Macrotask Queue      │  ← setTimeout, setInterval, I/O
│   (una por iteración)   │
└─────────────────────────┘
```

El Event Loop sigue este algoritmo en cada "tick":
1. Ejecuta todo el código síncrono del Call Stack hasta vaciarlo.
2. Vacía **completamente** la Microtask Queue (promesas).
3. Toma **una sola** macrotarea de la Macrotask Queue y la ejecuta.
4. Vuelve al paso 2.

```javascript
console.log("1 - síncrono");
setTimeout(() => console.log("2 - macrotarea"), 0);
Promise.resolve().then(() => console.log("3 - microtarea"));
console.log("4 - síncrono");

// Output:
// 1 - síncrono
// 4 - síncrono
// 3 - microtarea   ← las promesas tienen prioridad sobre setTimeout
// 2 - macrotarea
```

Esto explica por qué las Promesas resueltas se ejecutan *antes* que un `setTimeout(..., 0)`.

---

#### 📊 Comparativa — Event Loop

| Criterio | ChatGPT | Claude |
|---|---|---|
| Claridad | ✅ Muy clara para principiantes | ✅ Clara pero requiere más atención |
| Profundidad técnica | ⚠️ No distingue micro/macrotareas | ✅ Explica ambas colas y prioridad |
| Diagrama / visualización | ❌ Solo texto | ✅ Diagrama ASCII del flujo |
| Ejemplo de código | ✅ Básico y correcto | ✅ Múltiples ejemplos progresivos |
| Async/await | ❌ No mencionado | ✅ Conectado con el Event Loop |

---

### 1.3 Hoisting

#### 💬 Prompt
> *"Explícame qué es el hoisting en JavaScript. Quiero entender qué es, cómo funciona internamente y ver un ejemplo práctico claro."*

---

#### 🤖 ChatGPT (GPT-4o)

**Hoisting** es el comportamiento de JavaScript de "mover" las declaraciones de variables y funciones al inicio de su scope durante la fase de compilación, antes de ejecutar el código.

```javascript
console.log(nombre); // undefined (no da error)
var nombre = "Ana";

saludar(); // "Hola!" (funciona antes de declararse)
function saludar() {
  console.log("Hola!");
}
```

Las variables con `var` se elevan pero **sin su valor** (se inicializan como `undefined`). Las funciones declaradas se elevan **completamente**. Con `let` y `const` existe hoisting pero están en la "Temporal Dead Zone" hasta su declaración, por lo que acceder a ellas antes lanza un `ReferenceError`.

---

#### 🤖 Claude (Sonnet)

El hoisting no mueve código físicamente: es una característica de la **fase de creación del contexto de ejecución**. Antes de ejecutar cualquier código, el motor JS recorre el scope y registra todas las declaraciones, asignándoles espacio en memoria.

Hay cuatro comportamientos distintos según cómo se declare:

```javascript
// ── VAR ──────────────────────────────────────────
// Declaración hoisted + inicializada como undefined
console.log(x); // undefined (no error)
var x = 5;

// ── LET / CONST ──────────────────────────────────
// Declaración hoisted PERO en Temporal Dead Zone (TDZ)
console.log(y); // ❌ ReferenceError
let y = 10;

// ── FUNCTION DECLARATION ─────────────────────────
// Hoisted completa: nombre + cuerpo entero
saludar(); // ✅ "Hola" — funciona antes de la declaración
function saludar() { console.log("Hola"); }

// ── FUNCTION EXPRESSION ──────────────────────────
// Solo se eleva la variable, no la función
despedir(); // ❌ TypeError: despedir is not a function
var despedir = function () { console.log("Adiós"); };
```

---

#### 📊 Comparativa — Hoisting

| Criterio | ChatGPT | Claude |
|---|---|---|
| Definición conceptual | ✅ Correcta | ✅ Más precisa (fase de creación) |
| Cobertura de casos | ⚠️ var + functions | ✅ var, let, const, fn declaration, fn expression |
| Temporal Dead Zone | ✅ Mencionada brevemente | ✅ Explicada con ejemplo |
| Conexión con otros conceptos | ❌ Aislado | ✅ Conectado con closures y scope |

---

## 2. Detección de bugs en código JavaScript

**Prompt usado en ambos asistentes:**
> *"El siguiente código JavaScript tiene un bug intencional. Detéctalo, explica por qué es un error y muestra cómo corregirlo."*

---

### 2.1 Bug: Comparación con tipo incorrecto

#### 💬 Código con bug

```javascript
function esMayorDeEdad(edad) {
  if (edad == "18") {
    return true;
  }
  return edad > 18;
}

console.log(esMayorDeEdad(18));    // true
console.log(esMayorDeEdad("18"));  // true
console.log(esMayorDeEdad("19"));  // true
console.log(esMayorDeEdad("17"));  // ¿?
```

---

#### 🤖 ChatGPT

El bug está en usar `==` (igualdad débil) en lugar de `===`. Con `==`, JavaScript convierte los tipos automáticamente. El problema es la inconsistencia: la función acepta tanto números como strings, lo que puede llevar a comportamientos inesperados.

```javascript
function esMayorDeEdad(edad) {
  const edadNumerica = Number(edad);
  return edadNumerica >= 18;
}
```

---

#### 🤖 Claude

Hay dos problemas en este código:

**Problema 1 — Coerción de tipos con `==`:** La lógica está partida: una rama usa igualdad débil con string, la otra compara con número.

**Problema 2 — Bug silencioso con valores inválidos:**

```javascript
esMayorDeEdad("19abc")
// → "19abc" == "18" → false
// → "19abc" > 18 → NaN > 18 → false ❌ falla sin error
```

```javascript
// Corrección robusta
function esMayorDeEdad(edad) {
  const edadNumerica = Number(edad);
  if (isNaN(edadNumerica)) {
    throw new TypeError(`Edad inválida: ${edad}`);
  }
  return edadNumerica >= 18;
}
```

---

#### 📊 Comparativa — Bug 1

| Criterio | ChatGPT | Claude |
|---|---|---|
| Identificó el bug principal | ✅ | ✅ |
| Profundidad del análisis | ⚠️ Superficial | ✅ Traza todos los casos |
| Detectó bugs secundarios | ❌ | ✅ (NaN, lógica partida) |
| Corrección propuesta | ✅ Funcional | ✅ Robusta con validación |

---

### 2.2 Bug: Mutación inesperada de array

#### 💬 Código con bug

```javascript
function agregarElemento(arr, elemento) {
  arr.push(elemento);
  return arr;
}

const original = [1, 2, 3];
const nuevo = agregarElemento(original, 4);

console.log(original);         // ¿?
console.log(nuevo);
console.log(original === nuevo); // ¿?
```

---

#### 🤖 ChatGPT

El bug es que `arr.push()` muta el array original. Los arrays se pasan por referencia, así que `arr` apunta al mismo objeto que `original`.

```javascript
// Corrección
function agregarElemento(arr, elemento) {
  return [...arr, elemento];
}
```

---

#### 🤖 Claude

El bug es una **mutación no intencionada**. Este es uno de los bugs más peligrosos porque no lanza ningún error: falla silenciosamente.

```javascript
// Output real:
// [1, 2, 3, 4]  ← original fue mutado
// [1, 2, 3, 4]
// true           ← misma referencia en memoria
```

```javascript
// Opción 1: spread operator
function agregarElemento(arr, elemento) {
  return [...arr, elemento];
}

// Opción 2: concat (no muta)
function agregarElemento(arr, elemento) {
  return arr.concat(elemento);
}

// Opción 3: structuredClone para objetos anidados profundos
function agregarElemento(arr, elemento) {
  return [...structuredClone(arr), elemento];
}
```

---

#### 📊 Comparativa — Bug 2

| Criterio | ChatGPT | Claude |
|---|---|---|
| Identificó el bug | ✅ | ✅ |
| Explicación de referencias | ✅ Mencionada | ✅ Explicada con modelo mental |
| Gravedad del bug señalada | ❌ | ✅ ("falla silenciosamente") |
| Alternativas de corrección | ✅ 1 opción | ✅ 3 opciones con contexto |

---

### 2.3 Bug: `this` perdido en callback

#### 💬 Código con bug

```javascript
const persona = {
  nombre: "Ana",
  saludar: function () {
    setTimeout(function () {
      console.log("Hola, soy " + this.nombre);
    }, 100);
  },
};

persona.saludar(); // ¿?
```

---

#### 🤖 ChatGPT

Dentro de `setTimeout`, el callback regular tiene su propio `this` que apunta a `window` / `global`, no a `persona`. Por tanto `this.nombre` es `undefined`.

```javascript
// Solución 1: arrow function
saludar: function () {
  setTimeout(() => console.log("Hola, soy " + this.nombre), 100);
}

// Solución 2: guardar referencia
saludar: function () {
  const self = this;
  setTimeout(function () {
    console.log("Hola, soy " + self.nombre);
  }, 100);
}
```

---

#### 🤖 Claude

Este es el clásico problema de **pérdida de contexto de `this`**. En JavaScript, `this` no es léxico en funciones regulares: su valor depende de *cómo* se llama la función, no de *dónde* se define.

- En navegador (modo no estricto): `this` → `window` → `undefined`
- En Node.js: `this` → `global` → `undefined`
- En modo estricto: `this` → `undefined` → **TypeError**

```javascript
// ✅ Solución moderna: arrow function (hereda this léxicamente)
saludar: function () {
  setTimeout(() => {
    // hereda el 'this' del scope donde fue DEFINIDA = persona
    console.log("Hola, soy " + this.nombre); // "Hola, soy Ana"
  }, 100);
}

// ✅ Alternativa: .bind()
saludar: function () {
  setTimeout(function () {
    console.log("Hola, soy " + this.nombre);
  }.bind(this), 100);
}
```

La solución con arrow function es la preferida hoy porque es más legible y evita el patrón `const self = this` pre-ES6.

---

#### 📊 Comparativa — Bug 3

| Criterio | ChatGPT | Claude |
|---|---|---|
| Identificó el bug | ✅ | ✅ |
| Explicó la regla de `this` | ✅ Parcialmente | ✅ Con reglas detalladas |
| Consideró modo estricto | ❌ | ✅ |
| Soluciones ofrecidas | ✅ 2 | ✅ 2 + preferencia justificada |

---

## 3. Generación de código desde lenguaje natural

**Prompt usado en ambos asistentes:**
> *"Escribe en JavaScript la siguiente función: [descripción]. El código debe ser limpio, legible y con manejo de errores."*

---

### 3.1 Función: Agrupar array de objetos por propiedad

#### 💬 Descripción dada
> *"Crea una función que reciba un array de objetos y el nombre de una propiedad, y devuelva un objeto donde las claves sean los valores únicos de esa propiedad y los valores sean arrays con los objetos que tienen ese valor."*

---

#### 🤖 ChatGPT

```javascript
function agruparPor(array, propiedad) {
  return array.reduce((resultado, objeto) => {
    const clave = objeto[propiedad];
    if (!resultado[clave]) {
      resultado[clave] = [];
    }
    resultado[clave].push(objeto);
    return resultado;
  }, {});
}

const personas = [
  { nombre: "Ana", ciudad: "Madrid" },
  { nombre: "Luis", ciudad: "Barcelona" },
  { nombre: "María", ciudad: "Madrid" },
];

console.log(agruparPor(personas, "ciudad"));
// { Madrid: [{...}, {...}], Barcelona: [{...}] }
```

---

#### 🤖 Claude

```javascript
/**
 * Agrupa un array de objetos según el valor de una propiedad dada.
 * @param {Object[]} array - Array de objetos a agrupar
 * @param {string} propiedad - Nombre de la propiedad por la que agrupar
 * @returns {Object} Objeto con los grupos resultantes
 */
function agruparPor(array, propiedad) {
  if (!Array.isArray(array)) {
    throw new TypeError(`Se esperaba un array, se recibió: ${typeof array}`);
  }
  if (typeof propiedad !== "string" || propiedad.trim() === "") {
    throw new TypeError("La propiedad debe ser un string no vacío");
  }

  return array.reduce((grupos, elemento) => {
    const clave = elemento?.[propiedad] ?? "__sin_valor__";
    if (!Object.prototype.hasOwnProperty.call(grupos, clave)) {
      grupos[clave] = [];
    }
    grupos[clave].push(elemento);
    return grupos;
  }, Object.create(null)); // evita colisiones con prototype
}

const productos = [
  { nombre: "Manzana", categoria: "fruta" },
  { nombre: "Pera",    categoria: "fruta" },
  { nombre: "Zanahoria", categoria: "verdura" },
  { nombre: "Leche",   categoria: null },
];

console.log(agruparPor(productos, "categoria"));
// { fruta: [...], verdura: [...], __sin_valor__: [...] }
```

---

#### 📊 Comparativa — Función 1

| Criterio | ChatGPT | Claude |
|---|---|---|
| Corrección funcional | ✅ | ✅ |
| Manejo de errores | ❌ Sin validación | ✅ TypeError con mensajes claros |
| JSDoc | ❌ | ✅ |
| Casos edge (null, undefined) | ❌ | ✅ |
| Seguridad (prototype pollution) | ❌ | ✅ `Object.create(null)` |

---

### 3.2 Función: Debounce

#### 💬 Descripción dada
> *"Crea una función debounce que reciba una función y un tiempo en ms, y devuelva una nueva función que solo ejecute la original si han pasado X ms desde la última vez que fue invocada."*

---

#### 🤖 ChatGPT

```javascript
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const buscar = debounce((query) => {
  console.log("Buscando:", query);
}, 300);

buscar("j");
buscar("ja");
buscar("jav"); // Solo esta se ejecuta tras 300ms de inactividad
```

---

#### 🤖 Claude

```javascript
/**
 * Crea una versión debounced de una función.
 * @param {Function} fn - Función a envolver
 * @param {number} espera - Milisegundos de espera
 * @returns {Function} Función debounced con método .cancelar()
 */
function debounce(fn, espera) {
  if (typeof fn !== "function") {
    throw new TypeError("El primer argumento debe ser una función");
  }
  if (typeof espera !== "number" || espera < 0) {
    throw new TypeError("El tiempo de espera debe ser un número positivo");
  }

  let temporizador = null;

  function debounced(...args) {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      temporizador = null;
      fn.apply(this, args);
    }, espera);
  }

  // Permite cancelar una ejecución pendiente
  debounced.cancelar = function () {
    clearTimeout(temporizador);
    temporizador = null;
  };

  return debounced;
}

// Ejemplo: búsqueda que no lanza petición en cada tecla
const handleBusqueda = debounce(async (termino) => {
  console.log(`Lanzando búsqueda: "${termino}"`);
  // await fetch(`/api/search?q=${termino}`)
}, 400);
```

---

#### 📊 Comparativa — Función 2

| Criterio | ChatGPT | Claude |
|---|---|---|
| Lógica core correcta | ✅ | ✅ |
| Preserva contexto `this` | ✅ | ✅ |
| Validación de parámetros | ❌ | ✅ |
| API extendida | ❌ | ✅ `.cancelar()` |
| Ejemplo de caso real | ⚠️ Genérico | ✅ Búsqueda con async |

---

### 3.3 Función: Caché con tiempo de expiración (TTL)

#### 💬 Descripción dada
> *"Crea una función que implemente una caché con tiempo de expiración (TTL). Debe permitir guardar valores con una clave, recuperarlos (devolviendo null si expiraron), y limpiar entradas expiradas manualmente."*

---

#### 🤖 ChatGPT

```javascript
function crearCache(ttlMs) {
  const cache = {};

  return {
    set(clave, valor) {
      cache[clave] = { valor, expira: Date.now() + ttlMs };
    },
    get(clave) {
      const entrada = cache[clave];
      if (!entrada || Date.now() > entrada.expira) {
        delete cache[clave];
        return null;
      }
      return entrada.valor;
    },
    limpiar() {
      const ahora = Date.now();
      for (const clave in cache) {
        if (ahora > cache[clave].expira) delete cache[clave];
      }
    },
  };
}

const cache = crearCache(5000);
cache.set("usuario", { nombre: "Ana" });
console.log(cache.get("usuario")); // { nombre: "Ana" }
```

---

#### 🤖 Claude

```javascript
/**
 * Caché en memoria con tiempo de expiración por entrada (TTL).
 * @param {number} ttlPorDefecto - TTL en ms (por defecto 60 segundos)
 */
function crearCache(ttlPorDefecto = 60_000) {
  if (typeof ttlPorDefecto !== "number" || ttlPorDefecto <= 0) {
    throw new TypeError("El TTL debe ser un número positivo");
  }

  // Map evita colisiones con claves como 'constructor'
  const almacen = new Map();

  return {
    set(clave, valor, ttl = ttlPorDefecto) {
      almacen.set(clave, { valor, expiraEn: Date.now() + ttl });
    },

    get(clave) {
      const entrada = almacen.get(clave);
      if (!entrada) return null;
      if (Date.now() > entrada.expiraEn) {
        almacen.delete(clave); // lazy deletion
        return null;
      }
      return entrada.valor;
    },

    limpiar() {
      const ahora = Date.now();
      for (const [clave, entrada] of almacen) {
        if (ahora > entrada.expiraEn) almacen.delete(clave);
      }
    },

    delete(clave) { return almacen.delete(clave); },
    limpiarTodo() { almacen.clear(); },
    get tamaño()  { return almacen.size; },
  };
}

const cache = crearCache(5_000);
cache.set("sesion:abc", { usuario: "Ana" });
cache.set("config", { tema: "dark" }, 60_000); // TTL propio

console.log(cache.get("sesion:abc")); // { usuario: "Ana" }
console.log(cache.tamaño);            // 2
```

---

#### 📊 Comparativa — Función 3

| Criterio | ChatGPT | Claude |
|---|---|---|
| Corrección funcional | ✅ | ✅ |
| Uso de Map vs objeto plano | ❌ Usa `{}` | ✅ Usa `Map` |
| TTL por entrada individual | ❌ TTL global fijo | ✅ TTL personalizable por entrada |
| API completa | ⚠️ 3 métodos | ✅ 6 métodos + getter |
| JSDoc | ❌ | ✅ |

---

## 4. Análisis y conclusiones finales

### 4.1 Tabla resumen global

| Categoría | ChatGPT (GPT-4o) | Claude (Sonnet) |
|---|---|---|
| **Claridad para principiantes** | ✅✅ Muy alta | ✅ Alta |
| **Profundidad técnica** | ⚠️ Media | ✅✅ Alta |
| **Manejo de errores en código** | ❌ Rara vez | ✅✅ Sistemático |
| **Cobertura de casos edge** | ⚠️ Parcial | ✅✅ Completa |
| **Documentación (JSDoc)** | ❌ Ausente | ✅✅ Presente |
| **Detección de bugs secundarios** | ⚠️ Solo el obvio | ✅ Detecta implicaciones |
| **Calidad del código generado** | ✅ Funcional | ✅✅ Robusto y producción-ready |
| **Concisión** | ✅✅ Respuestas cortas | ⚠️ Más extensas |
| **Buenas prácticas modernas** | ✅ Básicas | ✅✅ Avanzadas |

---

### 4.2 ¿Cuándo usar cada uno?

**ChatGPT es mejor cuando...**
- Necesitas una respuesta rápida y directa al grano.
- Estás aprendiendo un concepto por primera vez y prefieres simplicidad.
- Quieres código funcional sin necesidad de robustez extrema.

**Claude es mejor cuando...**
- Necesitas código para un entorno real (validaciones, errores, edge cases).
- Quieres entender el *porqué* técnico detrás de un comportamiento.
- El bug tiene implicaciones secundarias que hay que identificar.
- Necesitas código bien documentado y mantenible.

---

### 4.3 Reflexión final

Ninguno de los dos asistentes reemplaza el criterio del desarrollador. Ambos pueden generar código incorrecto con total confianza, y ambos pueden omitir casos importantes si el prompt es vago.

La diferencia más relevante encontrada durante esta comparativa no es la corrección, sino la **amplitud del análisis**: ChatGPT tiende a responder exactamente lo que se pregunta, mientras que Claude tiende a responder lo que se pregunta *y* lo que probablemente necesitas saber también.

Para las prácticas de DAM, la estrategia más eficaz es usar cualquiera de los dos para generar un punto de partida rápido, y luego revisar críticamente el resultado antes de incorporarlo. La IA es más útil como **acelerador del trabajo propio** que como sustituto del razonamiento.

---

*Documento completado — Prácticas DAM · Módulo de Herramientas de IA*