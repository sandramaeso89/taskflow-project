Este documento es un espacio de reflexión personal sobre la experiencia de trabajar junto a herramientas de inteligencia artificial. Aquí se recogen pensamientos críticos, aprendizajes profundos y una valoración honesta del impacto de la IA en el proceso de desarrollo.
Contenido previsto

¿Cómo ha cambiado mi forma de programar con la ayuda de IA?
Ventajas y riesgos de depender de herramientas de IA
Impacto en el aprendizaje: ¿ayuda a entender o genera dependencia?
Consideraciones éticas y de responsabilidad en el uso de IA
Reflexión final al cierre del proyecto: ¿qué cambiaría? ¿qué repetiría?

# Reflexión final: IA y programación

---

## En qué tareas la IA me ha ayudado más

Si soy honesta, hay lugares donde la colaboración entre IA y programador me parece genuinamente transformadora, no solo conveniente.

**El código repetitivo y predecible** es donde más valor aporto. No porque sea difícil, sino porque consume energía cognitiva que podría dedicarse a problemas más interesantes. Generar DTOs, escribir tests unitarios para casos obvios, montar la estructura inicial de un CRUD: son tareas donde el patrón es claro y la variación mínima. Liberarte de eso no es trampa, es sensatez.

**La exploración de APIs y librerías desconocidas** también es un área donde la asistencia IA cambia el ritmo de trabajo. En lugar de saltar entre documentación y editor, puedo preguntar directamente *"¿cómo autentico con OAuth2 en esta librería?"* y obtener un punto de partida funcional. Sigo leyendo la documentación oficial, pero el tiempo hasta el primer resultado útil se comprime enormemente.

**Depuración de errores crípticos** es quizás el uso más subestimado. Un stack trace oscuro de Kubernetes, un error de tipado en TypeScript con genéricos anidados, una condición de carrera en código asíncrono: tener un interlocutor que puede leer el error sin fatiga y sugerir vectores de investigación acelera algo que de otro modo sería frustrante.

Y hay algo más difícil de medir: **la reducción del bloqueo inicial**. La pantalla en blanco paraliza. Tener un borrador, aunque imperfecto, sobre el que trabajar cambia el estado mental. Editar es más fácil que crear desde cero.

---

## Casos donde la IA ha fallado o ha generado código incorrecto

Aquí es donde la honestidad importa más, porque los fallos tienen un patrón revelador.

**Confianza sin base real.** El problema más peligroso no es que la IA genere código incorrecto, sino que lo hace con el mismo tono seguro con el que genera código correcto. He visto casos donde se inventa métodos que no existen en una librería, nombres de parámetros incorrectos, o versiones de APIs que ya no están activas, todo presentado con la misma fluidez narrativa. Si no verificas, no lo sabes.

**Código que pasa los tests pero no el escenario real.** Es fácil generar lógica que funciona para los casos felices. Los edge cases, los datos malformados, los estados de error, las condiciones de carrera en producción: ahí la IA tiende a quedarse corta. Optimiza para el ejemplo, no para la realidad.

**Soluciones técnicamente correctas pero arquitectónicamente erróneas.** He visto propuestas que resuelven el problema inmediato pero introducen deuda técnica silenciosa: acoplamiento innecesario, abstracciones prematuras, patrones que no encajan con el resto del sistema. La IA no conoce tu arquitectura, tu equipo, ni tus decisiones previas. Tú sí.

**Código de seguridad.** Las vulnerabilidades sutiles, las inyecciones, los problemas de autorización que dependen del contexto de negocio: esto requiere un nivel de comprensión del sistema completo que no se transmite en un prompt. Nunca usaría código generado por IA en áreas críticas de seguridad sin una revisión exhaustiva y desconfiada.

---

## Los riesgos de depender demasiado de la IA

Este es el territorio incómodo. Y creo que vale la pena mirarlo directamente.

**La atrofia del músculo de la resolución de problemas.** Programar bien implica desarrollar una forma de pensar, no solo conocer sintaxis. Cuando acudes a la IA antes de intentar resolver el problema tú mismo, te privas del proceso donde ocurre el aprendizaje real. El error que tardas dos horas en resolver solo te enseña más que el que resuelves en dos minutos con ayuda externa. Si siempre tomas el camino corto, el camino largo te resulta cada vez más difícil.

**La ilusión de comprensión.** Puedes tener código funcionando que no entiendes. Eso no es programar, es copiar con pasos intermedios. El problema llega cuando ese código falla en producción a las 2 de la mañana y tienes que debugearlo, o cuando un compañero te pregunta por qué tomaste cierta decisión y no tienes respuesta. La comprensión no es opcional.

**La homogenización del pensamiento técnico.** Si todos usamos los mismos modelos para generar soluciones, tendemos hacia los mismos patrones, las mismas aproximaciones, los mismos sesgos. La diversidad de perspectivas en ingeniería tiene valor. Las soluciones no convencionales, las aproximaciones heterodoxas, el pensamiento que va contra el consenso del dataset de entrenamiento: eso se diluye cuando delegamos el pensamiento creativo.

**La dependencia como vulnerabilidad.** Una herramienta en la que confías sin límite se convierte en un punto de fallo. Si el servicio no está disponible, si los resultados se degradan, si el modelo cambia de comportamiento: ¿puedes seguir trabajando? ¿O te has vuelto incapaz de funcionar sin ella?

---

## Cuándo prefiero programar sin asistencia

Hay contextos donde deliberadamente elijo no usar IA, y no es por romanticismo tecnófobo.

**Cuando estoy aprendiendo algo nuevo.** La fricción es parte del proceso. Luchar con una abstracción nueva, cometer errores específicos, entender por qué algo no funciona antes de ver cómo funciona: eso construye un modelo mental que ningún atajo preserva. Aprendo peor con ayuda cuando lo que necesito es la dificultad misma.

**En decisiones de arquitectura y diseño de sistemas.** Estas decisiones requieren contexto que solo yo tengo: la historia del sistema, las capacidades del equipo, las restricciones de negocio, los compromisos ya adquiridos. Puedo usar la IA para explorar opciones o contrastar ideas, pero la decisión y su justificación tienen que ser mías.

**Cuando el problema es pequeño y claro.** Si sé exactamente qué quiero escribir, abrirlo en un prompt, esperar la respuesta y revisarla lleva más tiempo que escribirlo directamente. La eficiencia no siempre está del lado de la herramienta más sofisticada.

**Cuando necesito pensar, no producir.** A veces el valor no está en el código que sale, sino en el proceso de escribirlo. Explorar una idea a través del código, entender sus implicaciones mientras la implementas, descubrir que tu modelo mental era incorrecto: eso requiere presencia, no delegación.

---

## Conclusión

La IA como herramienta de programación no es buena ni mala. Es potente y eso la hace doble: amplifica tanto tu capacidad de construir como tu capacidad de construir sin entender.

Lo que he llegado a creer es esto: la IA debería bajar el coste de las partes mecánicas del trabajo para que puedas invertir más energía en las partes que requieren juicio, criterio y comprensión profunda. Si la usas al revés, para evitar el esfuerzo cognitivo en lugar de redirigirlo, el resultado neto es negativo.

---
