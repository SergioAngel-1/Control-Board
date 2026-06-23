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
