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

<<<<<<< HEAD
| Capa        | Tecnología                  | Notas |
|-------------|-----------------------------|-------|
| UI          | React 19                    | Componentes funcionales + hooks |
| Build/dev   | Vite 7 (Rollup/esbuild)     | **No** usar Vite 8/rolldown (binarios nativos por plataforma → builds no reproducibles) |
| Estilos     | Tailwind CSS 3              | Tema oscuro definido en `tailwind.config.js` |
| Datos       | sql.js (SQLite WASM)        | WASM resuelto por Vite (import `?url`), sin CDN |
| Persistencia| localforage (IndexedDB)     | Clave `ops-center-v2` |
| Lint        | ESLint 10 (flat config)     | `eslint.config.js` |
=======
| Capa          | Tecnología                       | Notas |
|---------------|----------------------------------|-------|
| UI            | React 19                         | Componentes funcionales + hooks |
| Drag & drop   | `@dnd-kit/core` + `@dnd-kit/sortable` | Reordenación de secciones, items y pipeline steps |
| Build/dev     | Vite 7 (Rollup/esbuild)          | **No** usar Vite 8/rolldown (binarios nativos → builds no reproducibles) |
| Estilos       | Tailwind CSS 3                   | Tema oscuro definido en `tailwind.config.js` |
| Datos         | sql.js (SQLite WASM)             | WASM resuelto por Vite (import `?url`), sin CDN |
| Persistencia  | localforage (IndexedDB)          | Clave `ops-center-v2` |
| Lint          | ESLint 10 (flat config)          | `eslint.config.js` |
>>>>>>> a73b4e1 (feat: re-inicialización de git)

## 3. Estructura del repositorio

```
<<<<<<< HEAD
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
=======
index.html                  # entrada; carga fuente Inter, favicon, monta #root
vite.config.js              # base:'./' (rutas relativas → build servible offline), puerto 7777
postcss.config.js           # Tailwind + autoprefixer
tailwind.config.js          # paleta, tipografía, radios, animaciones
eslint.config.js            # ESLint flat config
. Agentes.md                  # este archivo
.gitignore
package.json                # ops-center v0.1.0

public/
  favicon.svg
  favicon/                  # favicons multi-plataforma (32x32, apple-touch, etc.)
    favicon.ico, manifest.json, browserconfig.xml, ...

src/
  main.jsx                  # bootstrap de React con ModalProvider
  index.css                 # capas Tailwind + foco visible, reduced-motion, scrollbar
  App.jsx                   # estado global, init de DB, orquestación de la UI, drag-and-drop central
  db/
    database.js             # esquema SQLite, funciones CRUD, persistencia, export/import
    seed.json               # datos de arranque (vacío por defecto; el usuario carga datos via Settings)
  constants/
    colors.js               # STATUS_DOT, STATUS, PRIORITY (mapas de color centralizados)
  hooks/
    useConfirm.js           # hook + context para confirmación asíncrona
  components/
    AddItemInput.jsx        # input inline para añadir items (checklist)
    AlertConfirm.jsx        # modal de confirmación reutilizable
    ConfirmDialog.jsx       # modal alternativo más simple
    DropdownPortal.jsx      # menú flotante posicionado vía portal (tags, energía, recurrencia)
    ModalProvider.jsx       # provider que expone `confirm()` mediante contexto
    QuickSearch.jsx         # paleta Cmd+K para buscar proyectos
  Sidebar.jsx               # panel lateral: nav, búsqueda, categorías, drag entre categorías
    MetricsMini.jsx         # métricas compactas (arriba del nav)
    NavSection.jsx          # categoría colapsable + lista de proyectos con drag
    QuoteFooter.jsx         # frase rotatoria (clic = siguiente)
  MainHeader.jsx            # título editable, StatusBadge, PriorityBadge, progreso, notas, borrar
  SectionCard.jsx           # sección colapsable con droppable; delega según section.type
    ChecklistSection.jsx    # ítems con checkbox, fecha, tag, energía, recurrencia
    ChecklistItem.jsx       # item individual con inline editing, datepicker, dropdowns
    ListSection.jsx         # lista simple (bullets) con fecha opcional
    PipelineSection.jsx     # pasos de pipeline (chips horizontales reordenables)
    NoteSection.jsx         # bloque de texto plano
    HistorySection.jsx      # tareas completadas del proyecto
  StatusBadge.jsx           # badge con color desde constants/colors.js
  PriorityBadge.jsx         # badge con color desde constants/colors.js
  Dashboard.jsx             # dashboard con top 8 proyectos, próxima tarea, métricas
    DashboardTrace.jsx      # tarjetas de trazabilidad (completadas hoy/semana, vencidas, etc.)
  RecurrencePicker.jsx      # selector de recurrencia (daily/weekdays/weekly/monthly/yearly)
  Settings.jsx              # exportar/importar JSON, descargar formato/instrucción

scripts/                    # (vacío — reservado para utilidades futuras)
```
>>>>>>> a73b4e1 (feat: re-inicialización de git)

## 4. Dónde están los datos (NO viven en el repo)

- **Datos de arranque (seed):** archivo `src/db/seed.json`
<<<<<<< HEAD
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
=======
  Está **vacío** por defecto (`"projects": [], "sections": [], ...`). El usuario
  importa sus datos reales desde Ajustes → Importar. Es la única fuente de datos
  versionada y contienen datos reales — trátalo con cuidado.
- **Estado en vivo del usuario:** IndexedDB del navegador, base `ops-center-v2`
  (ítems, proyectos, secciones, estado de UI). Inspeccionable en DevTools →
  Application → IndexedDB.
- **Reset:** navegar a `?reset=true` borra IndexedDB y recarga del seed (vacío).
  También desde Settings → Importar con "Reemplazar datos actuales".

## 5. Modelo de datos (esquema SQLite)

```sql
categories(id TEXT PK, name TEXT UNIQUE, sort_order INT)
projects(id TEXT PK, name TEXT, category TEXT, status TEXT, priority TEXT, notes TEXT DEFAULT '')
sections(id TEXT PK, project_id TEXT FK, title TEXT, type TEXT, sort_order INT, text TEXT NULL)
  -- type ∈ checklist | list | pipeline | note | history
items(id TEXT PK, section_id TEXT FK, text TEXT, done INT DEFAULT 0, tag TEXT,
      sort_order INT, due_date TEXT, recurrence TEXT, done_at TEXT, energy TEXT)
  -- recurrence ∈ null | daily | weekdays | weekly | monthly | yearly
  -- energy ∈ null | alta | media | baja
  -- tag: valores libres (presets: bug, feature, mejora, urgente, idea, seguimiento)
pipeline_steps(id TEXT PK, section_id TEXT FK, text TEXT, active INT DEFAULT 0, sort_order INT)
app_state(key TEXT PK, value TEXT) -- quote_index, cat_collapsed, sec_collapsed, active_project_id
```

Categorías predefinidas: `Clientes → Activos Estrategicos → Negocios → Proyectos Futuros → Personal`
(orden fijo via `ORDER BY CASE` en `database.js`).

**Status disponibles:** activo, esperando, esperando_contrato, standby, cerrado,
estrategico, prospecto, optimizado, terminado, mv_terminado, pendientes

**Prioridades:** critica, alta, media, baja
>>>>>>> a73b4e1 (feat: re-inicialización de git)

## 6. Convenciones

- Componentes funcionales, un componente por archivo, `export default`.
- Estilos con clases utilitarias de Tailwind; usa los tokens del tema
<<<<<<< HEAD
  (`bg-surface`, `text-text-secondary`, `accent`, etc.), no colores hardcodeados,
  salvo los mapas de estado existentes.
- Todo cambio que deba persistir pasa por la capa de `db/database.js` seguido de
  `persistDB()` (que vuelca la base a IndexedDB). El estado de React es solo el
  reflejo en memoria.
- Texto de la UI en **español**.
- Accesibilidad: los elementos interactivos son `<button>` o tienen `role`,
  `tabIndex` y manejo de teclado; respeta `:focus-visible` y `prefers-reduced-motion`.
=======
  (`bg-surface`, `text-text-secondary`, `accent`, etc.), no colores hardcodeados.
  Los mapas de estado/prioridad están centralizados en `src/constants/colors.js`.
  **No** duplicar esos mapas en componentes.
- **Persistencia:** todo cambio que deba persistir pasa por la capa de
  `db/database.js` seguido de `persistDB()` (vuelca la base a IndexedDB).
  El estado de React es solo el reflejo en memoria. Tras persistir, se incrementa
  `dataVersion` para forzar re-render.
- **IDs:** usar `uid()` de `database.js` que genera IDs únicos con prefijo.
- Texto de la UI en **español**.
- Accesibilidad: elementos interactivos son `<button>` o tienen `role`, `tabIndex`
  y manejo de teclado; respeta `:focus-visible` y `prefers-reduced-motion`.
- **Drag & drop:** usa `@dnd-kit`. Las secciones se reordenan verticalmente,
  los items (checklist/list) dentro de una sección también. Los items pueden
  moverse entre secciones. Los pipeline steps se reordenan horizontalmente.
  Los proyectos se pueden arrastrar entre categorías en la sidebar.
- **URL:** la app sincroniza la URL con el proyecto activo
  (`/categoria/project-id`). Soporta navegación atrás/adelante con `popstate`.
>>>>>>> a73b4e1 (feat: re-inicialización de git)

## 7. Flujo de trabajo local

```bash
npm install
<<<<<<< HEAD
npm run dev       # desarrollo con HMR
npm run lint      # antes de dar por terminado un cambio
npm run build     # build de producción → dist/
npm run preview   # verifica dist/ servido en local (offline)
=======
npm run dev       # desarrollo con HMR en http://localhost:7777
npm run lint      # ESLint — antes de dar por terminado un cambio
npm run build     # build de producción → dist/ (servible offline)
npm run preview   # verifica dist/ servido en local
>>>>>>> a73b4e1 (feat: re-inicialización de git)
```

Antes de cerrar una tarea: `npm run lint` y `npm run build` deben pasar, y la app
debe arrancar e inicializar la DB sin errores en consola.

<<<<<<< HEAD
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
=======
## 8. Componentes reutilizables importantes

- **`ModalProvider`** + **`useConfirm`**: patrón de confirmación asíncrona.
  Envuelve la app en `main.jsx`. Uso: `const ok = await confirm({ title, message })`.
  Renderiza `AlertConfirm` como modal.
- **`DropdownPortal`**: menú contextual posicionado mediante portal React.
  Se usa para tags, energía, recurrencia. Recibe `triggerRef`, `open`, `onClose`.
- **`QuickSearch`**: paleta Cmd+K para buscar y navegar a proyectos.
- **`RecurrencePicker`**: selector de recurrencia para items de checklist.
- **`formatDate` / `isOverdue`**: utilidades de `database.js` para fechas.
- **`STATUS_DOT`**: mapa color → punto usado en sidebar y quicksearch.

## 9. Funcionalidades CRUD actuales

| Entidad         | Crear | Leer | Actualizar | Borrar | Reordenar |
|-----------------|-------|------|------------|--------|-----------|
| Categorías      | Sidebar | Sí  | Renombrar  | Sí     | —         |
| Proyectos       | Sidebar | Sí  | Nombre, status, prioridad, notas | Sí | Arrastrar entre categorías |
| Secciones       | Header  | Sí  | Título     | Sí     | Drag vertical |
| Items (checklist)| Inline | Sí  | Texto, fecha, tag, energía, recurrencia | Sí | Drag vertical, entre secciones |
| Items (list)    | Inline  | Sí  | Texto, fecha | Sí   | Drag vertical |
| Pipeline steps  | Inline  | Sí  | Texto, activo | Sí  | Drag horizontal |
| Toggle done     | ✓       | —   | —          | —      | —            |

Los items completados se mueven a la sección `history` del proyecto.

## 10. Cómo ayudar más allá del código

Además de corregir bugs, ideas de mayor impacto:

1. **Validaciones y UX pulida** — feedback visual en CRUD, undo, atajos de teclado.
2. **Filtros avanzados en Dashboard** — por categoría, etiqueta, energía.
3. **Estadísticas y gráficos** — sobre la base de trazabilidad.
4. **Notificaciones/recordatorios** — usando Notification API.
5. **Exportación a PDF/CSV** de proyectos individuales.
6. **Tema claro** además del oscuro.
7. **Tests** — no hay cobertura actualmente.
>>>>>>> a73b4e1 (feat: re-inicialización de git)

Al proponer arquitectura, mantén el principio rector: **simple, local, sin
backend**. No introduzcas dependencias pesadas ni servicios remotos sin
justificarlo y consultarlo.

<<<<<<< HEAD
## 9. Errores conocidos / trampas
=======
## 11. Errores conocidos / trampas
>>>>>>> a73b4e1 (feat: re-inicialización de git)

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
<<<<<<< HEAD
=======
- El seed.json está **vacío** por diseño. No asumas que contiene datos de ejemplo.
  El usuario importa su JSON de respaldo desde Settings.
- Al añadir un nuevo campo a la base, actualiza `migrateSchema()` en `database.js`
  para añadirlo en tablas existentes con `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
>>>>>>> a73b4e1 (feat: re-inicialización de git)
