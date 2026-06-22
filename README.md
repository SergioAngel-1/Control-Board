# Centro de Operaciones (ops-center)

Dashboard **100% local** para gestionar proyectos, entregables, métricas y pipeline
personal. No tiene backend: todos los datos viven en el navegador en una base
SQLite (vía `sql.js`) que se persiste en IndexedDB con `localforage`.

## Stack

- **React 19** + **Vite 7** (build estable basado en Rollup/esbuild)
- **Tailwind CSS 3** (tema oscuro, estilo Linear)
- **sql.js** — SQLite compilado a WebAssembly, corriendo en el navegador
- **localforage** — persistencia en IndexedDB

## Requisitos

- Node.js 20+ y npm

## Puesta en marcha

```bash
npm install      # instala dependencias
npm run dev      # servidor de desarrollo con HMR (http://localhost:5173)
npm run build    # build de producción en dist/
npm run preview  # sirve dist/ en local para verificar el build
npm run lint     # ESLint
```

## Funcionamiento offline

El binario WASM de SQLite lo resuelve Vite como asset desde `sql.js` (import
`?url` en `src/db/database.js`), no desde un CDN. El build usa rutas relativas
(`base: './'`) y emite el `.wasm` en `dist/assets/`, por lo que `dist/` funciona
sin conexión con cualquier servidor estático. La única dependencia externa es la
fuente Inter (Google Fonts); si no hay red, degrada al stack del sistema sin
romper nada.

## Datos

Los datos iniciales (proyectos, secciones, ítems, métricas, frases) se definen como
*seed* en `src/db/database.js` y se cargan la primera vez. A partir de ahí, los
cambios del usuario (ítems marcados, frase actual, secciones colapsadas, proyecto
activo) se guardan en IndexedDB. Para reiniciar a los datos *seed*, borra la base
`ops-center-v2` de IndexedDB en las DevTools del navegador.

Ver `AGENTS.md` para el contexto completo de arquitectura y convenciones.
