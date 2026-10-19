# El secreto del maletín

Aventura de investigación para explorar con una persona adulta. Tres pistas (4, 7 y 2) abren un maletín con herramientas para los momentos en que algo cuesta.

React 18, TypeScript y Vite. Sin backend ni cuentas.

## Scripts

- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm run preview`

El build deja el sitio en `dist/`.

## Progreso

La clave `mirarim-el-secreto-del-maletin-session-v1` de `sessionStorage` guarda solo el progreso técnico de la pestaña: pantalla, nivel, agentes, misiones, pistas y tableros.

Reflexiones, la herramienta elegida y las notas del adulto viven en memoria y no salen en el resumen.

## Imágenes

- Portada: `public/assets/illustrations/scenes/103261.jpg`
- Agentes y robot: `public/assets/illustrations/characters/`
- El logotipo de color se muestra en la portada y en la despedida.

## Video de la misión

Cuando exista el archivo, escribe su ruta en `public/assets/video/intro.json`, por ejemplo `{ "src": "/assets/video/intro.mp4" }`. Al terminar, el juego pasa al mapa. Si todavía no hay video, se muestra una invitación breve y sigue solo.

En la pantalla del cierre, la persona adulta puede elegir un video de este dispositivo. Si no hay archivo, queda el panel de reserva.
