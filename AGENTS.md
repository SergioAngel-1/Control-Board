# AGENTS.md — Centro de Operaciones (ops-center)

Contexto para asistentes de IA que trabajen en este repositorio. Léelo completo
antes de proponer cambios. No contiene datos de los proyectos del usuario (esos
viven en el navegador); sí indica **dónde** encontrarlos.

---

## 1. Qué es este proyecto

Dashboard personal **100% local, sin backend**, para gestionar proyectos,
entregables, métricas y un pipeline comercial. Pensado para uso individual del
dueño (Sergi). Estética oscura tipo Linear, en español.

- **No hay servidor ni API.** Todo corre en el navegador.
- **Persistencia local:** SQLite compilado a WASM (`sql.js`) guardado en
  IndexedDB mediante `localforage`. La base se llama `ops-center-v2`.
- **Lineamiento base:** el desarrollo y el despliegue son **netamente locales**.
  No asumas servicios en la nube, contenedores ni CI a menos que se pida.

## 2. Stack y versiones

| Capa        | Tecnología                  | Notas |
|-------------|-----------------------------|-------|
| UI          | React 19                    | Componentes funcionales + hooks |
| Build/dev   | Vite 7 (Rollup/esbuild)     | **No** usar Vite 8/rolldown (binarios nativos por plataforma → builds no reproducibles) |
| Estilos     | Tailwind CSS 3              | Tema oscuro definido en `tailwind.config.js` |
| Datos       | sql.js (SQLite WASM)        | WASM resuelto por Vite (import `?url`), sin CDN |
| Persistencia| localforage (IndexedDB)     | Clave `ops-center-v2` |
| Lint        | ESLint 10 (flat config)     | `eslint.config.js` |

## 3. Estructura del repositorio

```
index.html              # entrada; carga fuente Inter, favicon, monta #root
vite.config.js          # base:'./' (rutas relativas → build servible offline)
tailwind.config.js      # paleta, tipografía, radios, animaciones
src/
  main.jsx              # bootstrap de React
  index.css             # capas Tailwind + foco visible, reduced-motion, scrollbar
  App.jsx               # estado global, init de DB, orquestación de la UI
  db/database.js        # esquema SQLite, datos SEED y toda la capa de acceso
  Sidebar.jsx           # contenedor del panel lateral
    MetricsMini.jsx     # métricas compactas (arriba del nav)
    NavSection.jsx      # categoría colapsable + lista de proyectos
    QuoteFooter.jsx     # frase rotatoria (clic = siguiente)
  MainHeader.jsx        # título, StatusBadge, PriorityBadge, barra de progreso
  SectionCard.jsx       # sección colapsable; delega según section.type
    ChecklistSection.jsx / ChecklistItem.jsx   # ítems con checkbox
    ListSection.jsx     # lista simple (bullets)
    PipelineSection.jsx # pasos de pipeline (chips)
    NoteSection.jsx     # bloque de texto
  StatusBadge.jsx / PriorityBadge.jsx          # badges con mapa de colores
  Dashboard.jsx         # dashboard inicial con top 5 proyectos por prioridad
public/
  favicon.svg, icons.svg
```

> `src/components/` existe pero está vacío. Si modularizas, ese es el destino
> natural; mantén las rutas de import coherentes.

## 4. Dónde están los datos (NO viven en el repo)

- **Datos de arranque (seed):** archivo `src/db/seed.json`
  (proyectos, secciones, ítems, pipeline, métricas, frases). Es la única fuente
  de datos versionada y es **dato real del usuario** — trátalo con cuidado.
- **Estado en vivo del usuario:** IndexedDB del navegador, base `ops-center-v2`
  (ítems marcados, proyecto activo, índice de frase, estados colapsados).
  Inspeccionable en DevTools → Application → IndexedDB. No es accesible desde el
  repositorio ni desde un agente sin abrir el navegador.
- **Reset:** borrar la base `ops-center-v2` en IndexedDB recarga el seed.

## 5. Modelo de datos (esquema SQLite)

- `categories(id, name, sort_order)`
- `projects(id, name, category, status, priority, notes)`
- `sections(id, project_id, title, type, sort_order)` — `type` ∈
  `checklist | list | pipeline | note`
- `items(id, section_id, text, done, tag, sort_order, due_date)`
- `pipeline_steps(id, section_id, text, active, sort_order)`
- `app_state(key, value)` — frases (`quote_*`) y preferencias de UI

Categorías y su orden de render: `Clientes → Activos Estrategicos → Negocios →
Proyectos Futuros → Personal` (ver `ORDER BY CASE` en `getProjects`/`getCategories`).

Mapas de color de estado/prioridad: duplicados en `NavSection.jsx`,
`StatusBadge.jsx` y `PriorityBadge.jsx`. Si añades un estado, actualiza los tres
(candidato a centralizar en un único módulo `statusColors.js`).

## 6. Convenciones

- Componentes funcionales, un componente por archivo, `export default`.
- Estilos con clases utilitarias de Tailwind; usa los tokens del tema
  (`bg-surface`, `text-text-secondary`, `accent`, etc.), no colores hardcodeados,
  salvo los mapas de estado existentes.
- Todo cambio que deba persistir pasa por la capa de `db/database.js` seguido de
  `persistDB()` (que vuelca la base a IndexedDB). El estado de React es solo el
  reflejo en memoria.
- Texto de la UI en **español**.
- Accesibilidad: los elementos interactivos son `<button>` o tienen `role`,
  `tabIndex` y manejo de teclado; respeta `:focus-visible` y `prefers-reduced-motion`.

## 7. Flujo de trabajo local

```bash
npm install
npm run dev       # desarrollo con HMR
npm run lint      # antes de dar por terminado un cambio
npm run build     # build de producción → dist/
npm run preview   # verifica dist/ servido en local (offline)
```

Antes de cerrar una tarea: `npm run lint` y `npm run build` deben pasar, y la app
debe arrancar e inicializar la DB sin errores en consola.

## 8. Cómo ayudar más allá del código

Además de corregir bugs, puedes ayudar a estructurar mejor el producto. Ideas de
mayor impacto, en orden sugerido:

1. **CRUD real desde la UI.** Hoy solo se pueden marcar ítems; crear/editar/borrar
   proyectos, secciones e ítems requiere editar el seed a mano. Es la mejora más
   valiosa.
2. **Centralizar el mapa de estados/colores** (hoy triplicado).
3. **Modularizar** en `src/components/`, `src/db/`, `src/hooks/`.
4. **Exportar/importar** la base (backup en JSON o `.sqlite`) para no depender de
   un solo navegador.
5. **Migraciones de esquema** versionadas (hay una comprobación básica de tablas
   en `initDB`, pero no un sistema de versiones).
6. **Edición de métricas y pipeline** desde la UI.

Al proponer arquitectura, mantén el principio rector: **simple, local, sin
backend**. No introduzcas dependencias pesadas ni servicios remotos sin
justificarlo y consultarlo.

## 9. Errores conocidos / trampas

- **No vuelvas a Vite 8 / rolldown-vite.** Depende de `@rolldown/binding-<plataforma>`
  y el `package-lock` omite esas opcionales (bug de npm), rompiendo cualquier
  instalación limpia o build en otra máquina/SO con
  `Cannot find module '@rolldown/binding-...'`. Quédate en Vite 7 estable.
- **No cargues el WASM desde CDN.** Se importa con `sql.js/dist/sql-wasm.wasm?url`
  en `src/db/database.js` y Vite lo resuelve en dev y en build. Resolverlo con
  rutas relativas a mano (p.ej. `import.meta.env.BASE_URL`) falla en dev (devuelve
  el index.html → error `expected magic word 00 61 73 6d, found 3c 21 64 6f`).
- Si cambias `base` en `vite.config.js`, verifica que el WASM y los assets siguen
  resolviéndose (usa siempre rutas relativas, no absolutas a `/`).
