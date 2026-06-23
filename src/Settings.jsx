import { useState, useRef } from 'react';
import { exportDB, importDB, persistDB } from './db/database.js';

export default function Settings({ onShowDashboard, onToggleSidebar }) {
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [replaceMode, setReplaceMode] = useState(true);
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

  async function handleImport(e) {
    const file = e.target.files[0];
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
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleDownloadTemplate() {
    const template = {
      export_version: 1,
      exported_at: new Date().toISOString(),
      categories: [
        { id: 'cat_1', name: 'Ejemplo', sort_order: 0 },
      ],
      projects: [
        { id: 'proj_1', name: 'Proyecto Ejemplo', category: 'Ejemplo', status: 'activo', priority: 'media', notes: '' },
      ],
      sections: [
        { id: 'sec_1', project_id: 'proj_1', title: 'Tareas', type: 'checklist', sort_order: 0 },
      ],
      items: [
        { id: 'item_1', section_id: 'sec_1', text: 'Hacer algo', done: 0, tag: null, sort_order: 0, due_date: null },
      ],
      pipeline_steps: [],
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

  return (
    <div className="pt-6 max-w-[600px]">
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
        <div className="mb-4 px-3 py-2 rounded-sm bg-accent/10 border border-accent/25 text-xs text-accent">
          {msg}
        </div>
      )}
      {error && (
        <div className="mb-4 px-3 py-2 rounded-sm bg-red-400/10 border border-red-400/25 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-primary mb-1">Exportar</h3>
          <p className="text-xs text-text-tertiary mb-3">
            Descarga un archivo JSON con todos los proyectos, tareas y configuración.
          </p>
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-medium rounded-sm bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors"
          >
            Descargar JSON
          </button>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-primary mb-1">Importar</h3>
          <p className="text-xs text-text-tertiary mb-3">
            {replaceMode
              ? 'Reemplaza todos los datos actuales con un archivo JSON. Esta acción no se puede deshacer.'
              : 'Fusiona los datos del archivo: actualiza proyectos existentes por ID y añade los nuevos.'}
          </p>
          <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={replaceMode}
              onChange={e => setReplaceMode(e.target.checked)}
              className="accent-accent w-3.5 h-3.5"
            />
            <span className="text-xs text-text-secondary">Reemplazar datos actuales</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="block text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:text-xs file:font-medium file:rounded-sm file:border file:border-accent/25 file:bg-accent/15 file:text-accent hover:file:bg-accent/25 file:transition-colors file:cursor-pointer"
          />
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="mt-2 text-xs text-text-tertiary hover:text-text-secondary transition-colors underline underline-offset-2"
          >
            Descargar formato
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onShowDashboard}
        className="mt-6 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
      >
        &larr; Volver al Dashboard
      </button>
    </div>
  );
}
