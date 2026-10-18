# El secreto del maletín

Aplicación web jugable completa (primera versión funcional).

## Cómo abrir y probar

1. Abre `index.html` en un navegador moderno (Chrome, Firefox, Edge, Safari).
2. Mejor en pantalla horizontal 16:9 o tablet/celular girado.
3. No requiere servidor ni conexión a internet (funciona local).

## Imágenes

- Portada grupal: `images/103261.jpg`
- Robot: `images/103469.jpg`
- Logotipos MIRARIM: `images/84070.png` (color), `84071.png`, `84072.png`

**Personajes individuales (103269.jpg etc.) no estaban en los adjuntos.**  
Se usan tarjetas provisionales de colores con descripciones.  
Para reemplazar: coloca los archivos PNG/JPG transparentes o no en la carpeta `images/` y actualiza las rutas en `game.js` (CONFIG.agents).

## Cómo añadir el video de cierre

En el panel adulto o directamente en el código (`state.videoConfig.src`):
- Para prueba temporal: usa un input file y `URL.createObjectURL` (no implementado en esta versión base; se puede añadir fácilmente).
- Para publicación: coloca un MP4 en `images/video-cierre.mp4` y asigna la ruta.

Mientras no haya video, muestra el panel crema de reserva.

## Dónde modificar contenidos

- Textos, pistas, palabras clave, orden de escenas: objeto `CONFIG` en `game.js`.
- Niveles y modos: `state` y pantallas P02.
- Misiones: funciones `completeMission*` y pantallas dinámicas.
- Paleta y estilos: `styles.css`.

## Limitaciones reales de esta primera versión

- Actividades de misiones están simplificadas con botones de demostración para completar el recorrido (P07–P30 navegables).
- No hay arrastre real ni paneles de letras interactivos completos (se puede ampliar).
- Narración usa síntesis de voz del navegador (calidad variable).
- Personajes individuales son provisionales.
- Video es placeholder.
- Estado se guarda en sessionStorage (se pierde al cerrar la pestaña).
- No hay backend, cuentas ni envío de datos.

## Pruebas realizadas

- Navegación básica P01 → configuración → selección → robot → mapa → misiones simplificadas → cierre.
- Conservación de estado en sesión.
- Aviso de orientación vertical.
- Logotipos y recursos adjuntos integrados.

## Pruebas pendientes

- Actividades interactivas completas (formar CALMA, ordenar tarjetas A-B-C-D, panel PACIENCIA/IMPULSO).
- Turnos grupales con rotación real.
- Ayudas progresivas detalladas en cada paso.
- Carga de video local funcional.
- Impresión del resumen.

La aventura de investigación se conserva: tres pistas (4-7-2), maletín, herramientas finales para afrontar dificultades.

MIRARIM aparece solo como crédito discreto en portada y despedida, no en el nombre del juego ni diálogos.
