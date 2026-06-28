<<<<<<< HEAD
import { useState, useRef } from 'react';
import { exportDB, importDB, persistDB } from './db/database.js';

export default function Settings({ onShowDashboard, onToggleSidebar }) {
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [replaceMode, setReplaceMode] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  function handleExport() {
    try {
      const data = exportDB();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ops-center-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg('Exportación completada');
      setError(null);
    } catch (e) {
      setError('Error al exportar: ' + e.message);
      setMsg(null);
    }
  }

  async function processFile(file) {
    if (!file) return;
    try {
      let text = await file.text();
      text = text.replace(/^\uFEFF/, '').trim();
      const data = JSON.parse(text);
      importDB(data, replaceMode ? 'replace' : 'add');
      await persistDB();
      setMsg(replaceMode ? 'Importación completada. Recargando…' : 'Datos fusionados. Recargando…');
      setError(null);
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      setError('Error al importar: ' + e.message);
      setMsg(null);
    }
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    await processFile(file);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  async function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      await processFile(file);
    } else {
      setError('Solo se aceptan archivos .json');
      setMsg(null);
    }
  }

  function handleDownloadTemplate() {
    const template = {
      _meta: {
        description: 'Formato completo de exportacion para Ops Center. Todos los campos son opcionales al importar.',
        statuses: ['activo', 'esperando', 'esperando_contrato', 'standby', 'cerrado', 'estrategico', 'prospecto', 'optimizado', 'terminado', 'mv_terminado', 'pendientes'],
        priorities: ['critica', 'alta', 'media', 'baja'],
        section_types: ['checklist', 'list', 'note', 'pipeline', 'history'],
        energy_levels: [null, 'alta', 'media', 'baja'],
        tag_presets: ['bug', 'feature', 'mejora', 'urgente', 'idea', 'seguimiento'],
        recurrence_options: [null, 'daily', 'weekdays', 'weekly', 'monthly', 'yearly'],
      },
      export_version: 1,
      exported_at: new Date().toISOString(),
      categories: [
        { id: 'cat_1', name: 'Ejemplo', sort_order: 0 },
      ],
      projects: [
        { id: 'proj_1', name: 'Proyecto Ejemplo', category: 'Ejemplo', status: 'activo', priority: 'media', notes: 'Nota del proyecto' },
      ],
      sections: [
        { id: 'sec_1', project_id: 'proj_1', title: 'Tareas', type: 'checklist', sort_order: 0, text: null },
        { id: 'sec_2', project_id: 'proj_1', title: 'Ideas', type: 'list', sort_order: 1, text: null },
        { id: 'sec_3', project_id: 'proj_1', title: 'Descripcion', type: 'note', sort_order: 2, text: 'Bloque de texto libre' },
        { id: 'sec_4', project_id: 'proj_1', title: 'Pipeline', type: 'pipeline', sort_order: 3, text: null },
      ],
      items: [
        { id: 'item_1', section_id: 'sec_1', text: 'Tarea con todo configurado', done: 0, tag: 'feature', sort_order: 0, due_date: '2026-07-01', recurrence: 'weekly', done_at: null, energy: 'alta' },
        { id: 'item_2', section_id: 'sec_1', text: 'Tarea basica', done: 0, tag: null, sort_order: 1, due_date: null, recurrence: null, done_at: null, energy: null },
        { id: 'item_3', section_id: 'sec_1', text: 'Tarea completada', done: 1, tag: 'urgente', sort_order: 2, due_date: '2026-06-20', recurrence: null, done_at: '2026-06-20T10:30:00', energy: 'media' },
      ],
      pipeline_steps: [
        { id: 'ps_1', section_id: 'sec_4', text: 'Paso 1', active: 1, sort_order: 0 },
        { id: 'ps_2', section_id: 'sec_4', text: 'Paso 2', active: 0, sort_order: 1 },
      ],
      app_state: {},
    };
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ops-center-formato.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMsg('Formato descargado');
    setError(null);
  }

  function handleDownloadInstruction() {
    const md = `# Ops Center — Instruccion para exportar datos

Eres un agente de IA que ayuda al usuario a extraer y analizar datos del tablero **Ops Center**.

---

## 1. Estructura del archivo JSON

El usuario puede proporcionarte un archivo JSON exportado desde Ops Center. Tiene esta estructura:

\`\`\`json
{
  "export_version": 1,
  "exported_at": "ISO-8601",
  "categories": [...],
  "projects": [...],
  "sections": [...],
  "items": [...],
  "pipeline_steps": [...],
  "app_state": {...}
}
\`\`\`

---

## 2. Tablas y campos

### categories
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | text | Identificador unico |
| name | text | Nombre de la categoria (unico) |
| sort_order | integer | Orden de aparicion |

Categorias por defecto: Clientes, Activos Estrategicos, Negocios, Proyectos Futuros, Personal.

### projects
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | text | Identificador unico |
| name | text | Nombre del proyecto |
| category | text | Nombre de la categoria (FK a categories.name) |
| status | text | Estado del proyecto |
| priority | text | Prioridad del proyecto |
| notes | text | Notas largas del proyecto |

**Valores de status:** activo, esperando, esperando_contrato, standby, cerrado, estrategico, prospecto, optimizado, terminado, mv_terminado, pendientes

**Valores de priority:** critica, alta, media, baja

### sections
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | text | Identificador unico |
| project_id | text | FK a projects.id |
| title | text | Titulo de la seccion |
| type | text | Tipo de seccion |
| sort_order | integer | Orden dentro del proyecto |
| text | text | Contenido (solo para type='note') |

**Valores de type:** checklist, list, note, pipeline, history

### items
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | text | Identificador unico |
| section_id | text | FK a sections.id |
| text | text | Texto de la tarea |
| done | integer | 0 = pendiente, 1 = completada |
| tag | text | Etiqueta (ver opciones abajo) |
| sort_order | integer | Orden dentro de la seccion |
| due_date | text | Fecha de vencimiento (YYYY-MM-DD) |
| recurrence | text | Frecuencia de repeticion |
| done_at | text | Timestamp de completado (ISO-8601) |
| energy | text | Nivel de energia requerido |

**Valores de tag (presets):** bug, feature, mejora, urgente, idea, seguimiento (tambien acepta valores personalizados)

**Valores de recurrence:** daily, weekdays, weekly, monthly, yearly (null = no repetir)

**Valores de energy:** alta, media, baja (null = sin energia)

### pipeline_steps
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | text | Identificador unico |
| section_id | text | FK a sections.id (type='pipeline') |
| text | text | Nombre del paso |
| active | integer | 0 = inactivo, 1 = activo/pasado |
| sort_order | integer | Orden izquierda a derecha |

### app_state
Objeto clave-valor con estado de la UI:
- \`quote_0\`, \`quote_1\`, ... : Frases rotatorias
- \`quote_index\`: Indice de frase actual
- \`cat_collapsed\`: JSON con categorias colapsadas
- \`sec_collapsed\`: JSON con secciones colapsadas
- \`active_project_id\`: ID del proyecto activo

---

## 3. Relaciones

\`\`\`
categories.name <── projects.category
projects.id      <── sections.project_id
sections.id      <── items.section_id
sections.id      <── pipeline_steps.section_id
\`\`\`

Un proyecto tiene multiples secciones. Una seccion tiene multiples items O multiples pipeline_steps (segun el type).

---

## 4. Instrucciones de exportacion

Cuando el usuario te pida exportar o resumir datos:

1. **Lee el JSON** proporcionado.
2. **Identifica el alcance**: ¿todo el tablero o un proyecto especifico?
3. **Extrae metricas clave**:
   - Total de proyectos por categoria y status
   - Tareas pendientes vs completadas
   - Tareas vencidas (due_date < hoy y done = 0)
   - Distribucion por prioridad
   - Distribucion por tag y energy
   - Pipeline: pasos activos vs totales
4. **Presenta el resumen** en formato legible (tabla o lista).
5. **Si piden un proyecto especifico**: filtra por project_id y muestra todas sus secciones, items e historial.

---

## 5. Ejemplo de analisis

Dado un JSON, puedes responder preguntas como:

- "Cuantas tareas tengo pendientes con energy='alta'?"
- "Cuales proyectos estan en status='esperando'?"
- "Que tareas estan vencidas?"
- "Resumen del proyecto X"
- "Cual es la distribucion de tags?"
- "Que pasos del pipeline estan activos?"

Siempre presenta los datos en **espanol** y usa tablas o listas para claridad.
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ops-center-instruccion.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMsg('Instruccion descargada');
    setError(null);
  }

  return (
    <div className="pt-6 max-w-[640px] animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <button
          type="button"
          aria-label="Abrir menú de proyectos"
          onClick={onToggleSidebar}
          className="lg:hidden flex items-center justify-center w-7 h-7 -ml-1 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-text-primary">Ajustes</h2>
      </div>
      <p className="text-xs text-text-tertiary mb-6">Exportar e importar datos de la base local</p>

      {msg && (
        <div className="mb-4 px-3 py-2 rounded-sm bg-accent/10 border border-accent/25 text-xs text-accent animate-fade-in">
          {msg}
        </div>
      )}
      {error && (
        <div className="mb-4 px-3 py-2 rounded-sm bg-red-400/10 border border-red-400/25 text-xs text-red-400 animate-fade-in">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 transition-all hover:border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1v10M4 7l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-text-primary">Exportar</h3>
              <p className="text-xs text-text-tertiary mt-0.5">Descarga un JSON con todos los datos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="w-full px-3 py-1.5 text-xs font-medium rounded-sm bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors"
          >
            Descargar JSON
          </button>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 transition-all hover:border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 15V5M4 9l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 3h12" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-text-primary">Importar</h3>
              <p className="text-xs text-text-tertiary mt-0.5">Carga un archivo JSON de respaldo</p>
            </div>
          </div>
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-accent bg-accent/5'
                : 'border-border-light hover:border-text-tertiary bg-transparent'
            }`}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <svg className={`w-6 h-6 mx-auto mb-2 transition-colors ${dragOver ? 'text-accent' : 'text-text-tertiary'}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M8 11V1M4 5l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" strokeLinecap="round" />
            </svg>
            <p className={`text-xs mb-1 ${dragOver ? 'text-accent font-medium' : 'text-text-secondary'}`}>
              {dragOver ? 'Soltar archivo aquí' : 'Arrastra un archivo .json'}
            </p>
            <p className="text-[10px] text-text-tertiary">o haz clic para seleccionar</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={replaceMode}
              onChange={e => setReplaceMode(e.target.checked)}
              className="accent-accent w-3.5 h-3.5"
            />
            <span className="text-xs text-text-secondary">Reemplazar datos actuales</span>
          </label>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors underline underline-offset-2 self-start"
          >
            Descargar formato
          </button>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 transition-all hover:border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2h12v10H8l-4 3v-3H2V2z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 6h6M5 8.5h4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-text-primary">Instruccion para agente</h3>
              <p className="text-xs text-text-tertiary mt-0.5">Genera un .md con las instrucciones para exportar datos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadInstruction}
            className="w-full px-3 py-1.5 text-xs font-medium rounded-sm bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors"
          >
            Descargar instruccion
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onShowDashboard}
        className="mt-6 flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
      >
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 3l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver al Dashboard
      </button>
    </div>
  );
}
=======
import { useState, useRef } from 'react';
import { exportDB, importDB, persistDB } from './db/database.js';

export default function Settings({ onShowDashboard, onToggleSidebar }) {
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [replaceMode, setReplaceMode] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  function handleExport() {
    try {
      const data = exportDB();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ops-center-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg('Exportación completada');
      setError(null);
    } catch (e) {
      setError('Error al exportar: ' + e.message);
      setMsg(null);
    }
  }

  async function processFile(file) {
    if (!file) return;
    try {
      let text = await file.text();
      text = text.replace(/^\uFEFF/, '').trim();
      const data = JSON.parse(text);
      importDB(data, replaceMode ? 'replace' : 'add');
      await persistDB();
      setMsg(replaceMode ? 'Importación completada. Recargando…' : 'Datos fusionados. Recargando…');
      setError(null);
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      setError('Error al importar: ' + e.message);
      setMsg(null);
    }
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    await processFile(file);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  async function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      await processFile(file);
    } else {
      setError('Solo se aceptan archivos .json');
      setMsg(null);
    }
  }

  function handleDownloadTemplate() {
    const template = {
      _meta: {
        description: 'Formato completo de exportacion para Ops Center. Todos los campos son opcionales al importar.',
        statuses: ['activo', 'esperando', 'esperando_contrato', 'standby', 'cerrado', 'estrategico', 'prospecto', 'optimizado', 'terminado', 'mv_terminado', 'pendientes'],
        priorities: ['critica', 'alta', 'media', 'baja'],
        section_types: ['checklist', 'list', 'note', 'pipeline', 'history'],
        energy_levels: [null, 'alta', 'media', 'baja'],
        tag_presets: ['bug', 'feature', 'mejora', 'urgente', 'idea', 'seguimiento'],
        recurrence_options: [null, 'daily', 'weekdays', 'weekly', 'monthly', 'yearly'],
      },
      export_version: 1,
      exported_at: new Date().toISOString(),
      categories: [
        { id: 'cat_1', name: 'Ejemplo', sort_order: 0 },
      ],
      projects: [
        { id: 'proj_1', name: 'Proyecto Ejemplo', category: 'Ejemplo', status: 'activo', priority: 'media', notes: 'Nota del proyecto' },
      ],
      sections: [
        { id: 'sec_1', project_id: 'proj_1', title: 'Tareas', type: 'checklist', sort_order: 0, text: null },
        { id: 'sec_2', project_id: 'proj_1', title: 'Ideas', type: 'list', sort_order: 1, text: null },
        { id: 'sec_3', project_id: 'proj_1', title: 'Descripcion', type: 'note', sort_order: 2, text: 'Bloque de texto libre' },
        { id: 'sec_4', project_id: 'proj_1', title: 'Pipeline', type: 'pipeline', sort_order: 3, text: null },
      ],
      items: [
        { id: 'item_1', section_id: 'sec_1', text: 'Tarea con todo configurado', done: 0, tag: 'feature', sort_order: 0, due_date: '2026-07-01', recurrence: 'weekly', done_at: null, energy: 'alta' },
        { id: 'item_2', section_id: 'sec_1', text: 'Tarea basica', done: 0, tag: null, sort_order: 1, due_date: null, recurrence: null, done_at: null, energy: null },
        { id: 'item_3', section_id: 'sec_1', text: 'Tarea completada', done: 1, tag: 'urgente', sort_order: 2, due_date: '2026-06-20', recurrence: null, done_at: '2026-06-20T10:30:00', energy: 'media' },
      ],
      pipeline_steps: [
        { id: 'ps_1', section_id: 'sec_4', text: 'Paso 1', active: 1, sort_order: 0 },
        { id: 'ps_2', section_id: 'sec_4', text: 'Paso 2', active: 0, sort_order: 1 },
      ],
      app_state: {},
    };
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ops-center-formato.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMsg('Formato descargado');
    setError(null);
  }

  function handleDownloadInstruction() {
    const md = `# Ops Center — Instruccion para exportar datos

Eres un agente de IA que ayuda al usuario a extraer y analizar datos del tablero **Ops Center**.

---

## 1. Estructura del archivo JSON

El usuario puede proporcionarte un archivo JSON exportado desde Ops Center. Tiene esta estructura:

\`\`\`json
{
  "export_version": 1,
  "exported_at": "ISO-8601",
  "categories": [...],
  "projects": [...],
  "sections": [...],
  "items": [...],
  "pipeline_steps": [...],
  "app_state": {...}
}
\`\`\`

---

## 2. Tablas y campos

### categories
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | text | Identificador unico |
| name | text | Nombre de la categoria (unico) |
| sort_order | integer | Orden de aparicion |

Categorias por defecto: Clientes, Activos Estrategicos, Negocios, Proyectos Futuros, Personal.

### projects
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | text | Identificador unico |
| name | text | Nombre del proyecto |
| category | text | Nombre de la categoria (FK a categories.name) |
| status | text | Estado del proyecto |
| priority | text | Prioridad del proyecto |
| notes | text | Notas largas del proyecto |

**Valores de status:** activo, esperando, esperando_contrato, standby, cerrado, estrategico, prospecto, optimizado, terminado, mv_terminado, pendientes

**Valores de priority:** critica, alta, media, baja

### sections
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | text | Identificador unico |
| project_id | text | FK a projects.id |
| title | text | Titulo de la seccion |
| type | text | Tipo de seccion |
| sort_order | integer | Orden dentro del proyecto |
| text | text | Contenido (solo para type='note') |

**Valores de type:** checklist, list, note, pipeline, history

### items
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | text | Identificador unico |
| section_id | text | FK a sections.id |
| text | text | Texto de la tarea |
| done | integer | 0 = pendiente, 1 = completada |
| tag | text | Etiqueta (ver opciones abajo) |
| sort_order | integer | Orden dentro de la seccion |
| due_date | text | Fecha de vencimiento (YYYY-MM-DD) |
| recurrence | text | Frecuencia de repeticion |
| done_at | text | Timestamp de completado (ISO-8601) |
| energy | text | Nivel de energia requerido |

**Valores de tag (presets):** bug, feature, mejora, urgente, idea, seguimiento (tambien acepta valores personalizados)

**Valores de recurrence:** daily, weekdays, weekly, monthly, yearly (null = no repetir)

**Valores de energy:** alta, media, baja (null = sin energia)

### pipeline_steps
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | text | Identificador unico |
| section_id | text | FK a sections.id (type='pipeline') |
| text | text | Nombre del paso |
| active | integer | 0 = inactivo, 1 = activo/pasado |
| sort_order | integer | Orden izquierda a derecha |

### app_state
Objeto clave-valor con estado de la UI:
- \`quote_0\`, \`quote_1\`, ... : Frases rotatorias
- \`quote_index\`: Indice de frase actual
- \`cat_collapsed\`: JSON con categorias colapsadas
- \`sec_collapsed\`: JSON con secciones colapsadas
- \`active_project_id\`: ID del proyecto activo

---

## 3. Relaciones

\`\`\`
categories.name <── projects.category
projects.id      <── sections.project_id
sections.id      <── items.section_id
sections.id      <── pipeline_steps.section_id
\`\`\`

Un proyecto tiene multiples secciones. Una seccion tiene multiples items O multiples pipeline_steps (segun el type).

---

## 4. Instrucciones de exportacion

Cuando el usuario te pida exportar o resumir datos:

1. **Lee el JSON** proporcionado.
2. **Identifica el alcance**: ¿todo el tablero o un proyecto especifico?
3. **Extrae metricas clave**:
   - Total de proyectos por categoria y status
   - Tareas pendientes vs completadas
   - Tareas vencidas (due_date < hoy y done = 0)
   - Distribucion por prioridad
   - Distribucion por tag y energy
   - Pipeline: pasos activos vs totales
4. **Presenta el resumen** en formato legible (tabla o lista).
5. **Si piden un proyecto especifico**: filtra por project_id y muestra todas sus secciones, items e historial.

---

## 5. Ejemplo de analisis

Dado un JSON, puedes responder preguntas como:

- "Cuantas tareas tengo pendientes con energy='alta'?"
- "Cuales proyectos estan en status='esperando'?"
- "Que tareas estan vencidas?"
- "Resumen del proyecto X"
- "Cual es la distribucion de tags?"
- "Que pasos del pipeline estan activos?"

Siempre presenta los datos en **espanol** y usa tablas o listas para claridad.
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ops-center-instruccion.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMsg('Instruccion descargada');
    setError(null);
  }

  return (
    <div className="pt-6 max-w-[640px] animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <button
          type="button"
          aria-label="Abrir menú de proyectos"
          onClick={onToggleSidebar}
          className="lg:hidden flex items-center justify-center w-7 h-7 -ml-1 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-text-primary">Ajustes</h2>
      </div>
      <p className="text-xs text-text-tertiary mb-6">Exportar e importar datos de la base local</p>

      {msg && (
        <div className="mb-4 px-3 py-2 rounded-sm bg-accent/10 border border-accent/25 text-xs text-accent animate-fade-in">
          {msg}
        </div>
      )}
      {error && (
        <div className="mb-4 px-3 py-2 rounded-sm bg-red-400/10 border border-red-400/25 text-xs text-red-400 animate-fade-in">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 transition-all hover:border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1v10M4 7l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-text-primary">Exportar</h3>
              <p className="text-xs text-text-tertiary mt-0.5">Descarga un JSON con todos los datos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="w-full px-3 py-1.5 text-xs font-medium rounded-sm bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors"
          >
            Descargar JSON
          </button>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 transition-all hover:border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 15V5M4 9l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 3h12" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-text-primary">Importar</h3>
              <p className="text-xs text-text-tertiary mt-0.5">Carga un archivo JSON de respaldo</p>
            </div>
          </div>
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-accent bg-accent/5'
                : 'border-border-light hover:border-text-tertiary bg-transparent'
            }`}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <svg className={`w-6 h-6 mx-auto mb-2 transition-colors ${dragOver ? 'text-accent' : 'text-text-tertiary'}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M8 11V1M4 5l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" strokeLinecap="round" />
            </svg>
            <p className={`text-xs mb-1 ${dragOver ? 'text-accent font-medium' : 'text-text-secondary'}`}>
              {dragOver ? 'Soltar archivo aquí' : 'Arrastra un archivo .json'}
            </p>
            <p className="text-[10px] text-text-tertiary">o haz clic para seleccionar</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={replaceMode}
              onChange={e => setReplaceMode(e.target.checked)}
              className="accent-accent w-3.5 h-3.5"
            />
            <span className="text-xs text-text-secondary">Reemplazar datos actuales</span>
          </label>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors underline underline-offset-2 self-start"
          >
            Descargar formato
          </button>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 transition-all hover:border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2h12v10H8l-4 3v-3H2V2z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 6h6M5 8.5h4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-text-primary">Instruccion para agente</h3>
              <p className="text-xs text-text-tertiary mt-0.5">Genera un .md con las instrucciones para exportar datos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadInstruction}
            className="w-full px-3 py-1.5 text-xs font-medium rounded-sm bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors"
          >
            Descargar instruccion
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onShowDashboard}
        className="mt-6 flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
      >
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 3l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver al Dashboard
      </button>
    </div>
  );
}
>>>>>>> a73b4e1 (feat: re-inicialización de git)
