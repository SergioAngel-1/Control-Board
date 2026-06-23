import initSqlJs from 'sql.js';
import localforage from 'localforage';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let db = null;
const DB_KEY = 'ops-center-v2';
let persistQueue = Promise.resolve();

let _idCounter = Date.now();
export function uid() { return 'id_' + (_idCounter++); }

const STATUSES = ['activo','esperando','esperando_contrato','standby','cerrado','estrategico','prospecto','optimizado','terminado','mv_terminado','pendientes'];
const PRIORITIES = ['critica','alta','media','baja'];

export function formatDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('es-ES', { day:'2-digit', month:'short' });
}

export function isOverdue(d) {
  if (!d) return false;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return false;
  return dt < new Date(new Date().toDateString());
}

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
    status TEXT NOT NULL, priority TEXT NOT NULL, notes TEXT DEFAULT '')`);
  db.run(`CREATE TABLE IF NOT EXISTS sections (
    id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'checklist', sort_order INTEGER NOT NULL DEFAULT 0,
    text TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)`);
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY, section_id TEXT NOT NULL, text TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0, tag TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0, due_date TEXT,
    recurrence TEXT, done_at TEXT, energy TEXT,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE)`);
  db.run(`CREATE TABLE IF NOT EXISTS pipeline_steps (
    id TEXT PRIMARY KEY, section_id TEXT NOT NULL, text TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE)`);
  db.run(`CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
}

function seed() {
  const cats = ['Clientes','Activos Estrategicos','Negocios','Proyectos Futuros','Personal'];
  const cStmt = db.prepare('INSERT INTO categories VALUES (?,?,?)');
  cats.forEach((c, i) => cStmt.run([uid(), c, i]));
  cStmt.free();
}

function migrateSchema() {
  const tables = (db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0]?.values || []).map(r => r[0]);
  // Add categories table if missing
  if (!tables.includes('categories')) {
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0)`);
    const cats = ['Clientes','Activos Estrategicos','Negocios','Proyectos Futuros','Personal'];
    const stmt = db.prepare('INSERT INTO categories VALUES (?,?,?)');
    cats.forEach((c, i) => stmt.run([uid(), c, i]));
    stmt.free();
  }
  // Add notes column to projects if missing
  const projCols = db.exec("PRAGMA table_info('projects')")[0]?.values.map(c => c[1]) || [];
  if (!projCols.includes('notes')) {
    db.run("ALTER TABLE projects ADD COLUMN notes TEXT DEFAULT ''");
  }
  // Add text column to sections if missing
  const secCols = db.exec("PRAGMA table_info('sections')")[0]?.values.map(c => c[1]) || [];
  if (!secCols.includes('text')) {
    db.run("ALTER TABLE sections ADD COLUMN text TEXT");
  }
  // Add due_date column to items if missing
  const itemCols = db.exec("PRAGMA table_info('items')")[0]?.values.map(c => c[1]) || [];
  if (!itemCols.includes('due_date')) {
    db.run("ALTER TABLE items ADD COLUMN due_date TEXT");
  }
  if (!itemCols.includes('recurrence')) {
    db.run("ALTER TABLE items ADD COLUMN recurrence TEXT");
  }
  if (!itemCols.includes('done_at')) {
    db.run("ALTER TABLE items ADD COLUMN done_at TEXT");
  }
  if (!itemCols.includes('energy')) {
    db.run("ALTER TABLE items ADD COLUMN energy TEXT");
  }
}

export async function initDB() {
  if (db) return db;
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('reset')) {
    await dropDB();
    window.history.replaceState({}, '', window.location.pathname);
  }
  const wasmResponse = await fetch(sqlWasmUrl);
  const wasmBinary = await wasmResponse.arrayBuffer();
  const SQL = await initSqlJs({ wasmBinary });
  const saved = await localforage.getItem(DB_KEY);
  if (saved) {
    db = new SQL.Database(new Uint8Array(saved));
    db.run('PRAGMA foreign_keys = ON');
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    if (tables.length === 0) { createTables(); seed(); }
    else { migrateSchema(); await persistDB(); }
  } else {
    db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON');
    createTables();
    seed();
  }
  return db;
}

export async function dropDB() {
  if (db) db.close();
  db = null;
  await localforage.removeItem(DB_KEY);
}

export async function persistDB() {
  if (!db) return;
  const data = db.export();
  const task = persistQueue.then(() => localforage.setItem(DB_KEY, data));
  persistQueue = task.catch(() => {});
  return task;
}

function query(sql, params = []) {
  if (!db) return [];
  const stmt = db.prepare(sql);
  if (!stmt) return [];
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function exec(sql, params = []) {
  if (!db) return;
  if (Array.isArray(params[0])) {
    for (const p of params) db.run(sql, p);
  } else {
    db.run(sql, params);
  }
}

// === PROJECTS ===

export function getProjects() {
  return query(`SELECT p.* FROM projects p
    LEFT JOIN categories c ON c.name = p.category
    ORDER BY COALESCE(c.sort_order, 999), p.name`);
}

export function getDashboardData() {
  const projects = query('SELECT * FROM projects ORDER BY name ASC');
  if (projects.length === 0) return [];
  const pIds = projects.map(p => p.id);
  const ph = pIds.map(() => '?').join(',');
  const sections = query(`SELECT * FROM sections WHERE project_id IN (${ph}) ORDER BY sort_order`, pIds);
  const secIds = sections.map(s => s.id);
  const itemsBySection = {};
  if (secIds.length > 0) {
    const sh = secIds.map(() => '?').join(',');
    const items = query(`SELECT * FROM items WHERE section_id IN (${sh}) ORDER BY sort_order`, secIds);
    for (const item of items) {
      if (!itemsBySection[item.section_id]) itemsBySection[item.section_id] = [];
      itemsBySection[item.section_id].push(item);
    }
  }
  const sectionsByProject = {};
  for (const sec of sections) {
    if (!sectionsByProject[sec.project_id]) sectionsByProject[sec.project_id] = [];
    sectionsByProject[sec.project_id].push(sec);
  }
  return projects.map(p => ({
    ...p,
    sections: sectionsByProject[p.id] || [],
    itemsBySection,
  }));
}

export function getAllItemsFlat() {
  return query(`SELECT i.*, s.project_id FROM items i
    JOIN sections s ON s.id = i.section_id
    ORDER BY i.due_date ASC`);
}

export function getCategories() {
  return query('SELECT * FROM categories ORDER BY sort_order');
}

export function createCategory(name) {
  const id = uid();
  const ord = query('SELECT COALESCE(MAX(sort_order),-1) + 1 AS n FROM categories')[0].n;
  exec('INSERT INTO categories VALUES (?,?,?)', [id, name, ord]);
  return id;
}

export function updateCategory(id, fields) {
  if (fields.name !== undefined) {
    const old = query('SELECT name FROM categories WHERE id = ?', [id]);
    if (old.length > 0) {
      exec('UPDATE categories SET name = ? WHERE id = ?', [fields.name, id]);
      exec('UPDATE projects SET category = ? WHERE category = ?', [fields.name, old[0].name]);
    }
  }
  if (fields.sort_order !== undefined) exec('UPDATE categories SET sort_order = ? WHERE id = ?', [fields.sort_order, id]);
}

export function deleteCategory(id) {
  const cat = query('SELECT name FROM categories WHERE id = ?', [id]);
  if (cat.length === 0) return;
  exec('UPDATE projects SET category = ? WHERE category = ?', ['Sin categoria', cat[0].name]);
  exec('DELETE FROM categories WHERE id = ?', [id]);
}

export function getProjectsByCategory(category) {
  return query('SELECT * FROM projects WHERE category = ? ORDER BY name', [category]);
}

export function ensureHistorySection(projectId) {
  const existing = query("SELECT id FROM sections WHERE project_id = ? AND type = 'history'", [projectId]);
  if (existing.length > 0) return;
  const ord = query('SELECT COALESCE(MAX(sort_order),-1) + 1 AS n FROM sections WHERE project_id = ?', [projectId])[0].n;
  exec("INSERT INTO sections VALUES (?,?,?,?,?,?)", [uid(), projectId, 'Historial de tareas', 'history', ord, null]);
}

export function createProject(name, category, status, priority, notes) {
  const id = uid();
  exec('INSERT INTO projects VALUES (?,?,?,?,?,?)', [id, name, category, status || 'activo', priority || 'media', notes || '']);
  // Create default sections
  const s1id = uid();
  const s2id = uid();
  exec('INSERT INTO sections VALUES (?,?,?,?,?,?)', [s1id, id, 'Proximo paso', 'checklist', 0, null]);
  exec('INSERT INTO sections VALUES (?,?,?,?,?,?)', [s2id, id, 'Futuro', 'list', 1, null]);
  ensureHistorySection(id);
  return id;
}

export function updateProject(id, fields) {
  const allowed = ['name', 'category', 'status', 'priority', 'notes'];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      exec(`UPDATE projects SET ${key} = ? WHERE id = ?`, [fields[key], id]);
    }
  }
}

export function deleteProject(id) {
  exec('DELETE FROM items WHERE section_id IN (SELECT id FROM sections WHERE project_id = ?)', [id]);
  exec('DELETE FROM pipeline_steps WHERE section_id IN (SELECT id FROM sections WHERE project_id = ?)', [id]);
  exec('DELETE FROM sections WHERE project_id = ?', [id]);
  exec('DELETE FROM projects WHERE id = ?', [id]);
}

// === SECTIONS ===

export function getSections(projectId) {
  return query('SELECT * FROM sections WHERE project_id = ? ORDER BY sort_order', [projectId]);
}

export function createSection(projectId, title, type) {
  const id = uid();
  const ord = query('SELECT COALESCE(MAX(sort_order),-1) + 1 AS n FROM sections WHERE project_id = ?', [projectId])[0].n;
  exec('INSERT INTO sections VALUES (?,?,?,?,?,?)', [id, projectId, title, type || 'checklist', ord, null]);
  return id;
}

export function updateSection(id, fields) {
  if (fields.title !== undefined) exec('UPDATE sections SET title = ? WHERE id = ?', [fields.title, id]);
  if (fields.text !== undefined) exec('UPDATE sections SET text = ? WHERE id = ?', [fields.text, id]);
}

export function reorderSections(projectId, sectionIds) {
  const params = sectionIds.map((id, idx) => [idx, projectId, id]);
  exec('UPDATE sections SET sort_order = ? WHERE project_id = ? AND id = ?', params);
}

export function deleteSection(id) {
  exec('DELETE FROM items WHERE section_id = ?', [id]);
  exec('DELETE FROM pipeline_steps WHERE section_id = ?', [id]);
  exec('DELETE FROM sections WHERE id = ?', [id]);
}

// === ITEMS ===

export function getItems(sectionId) {
  return query('SELECT * FROM items WHERE section_id = ? ORDER BY sort_order', [sectionId]);
}

export function createItem(sectionId, text, tag, due_date, recurrence, energy) {
  const id = uid();
  const ord = query('SELECT COALESCE(MAX(sort_order),-1) + 1 AS n FROM items WHERE section_id = ?', [sectionId])[0].n;
  exec('INSERT INTO items VALUES (?,?,?,?,?,?,?,?,?,?)', [id, sectionId, text, 0, tag || null, ord, due_date || null, recurrence || null, null, energy || null]);
  return id;
}

export function updateItem(id, fields) {
  if (fields.text !== undefined) exec('UPDATE items SET text = ? WHERE id = ?', [fields.text, id]);
  if (fields.tag !== undefined) exec('UPDATE items SET tag = ? WHERE id = ?', [fields.tag, id]);
  if (fields.done !== undefined) exec('UPDATE items SET done = ? WHERE id = ?', [fields.done ? 1 : 0, id]);
  if (fields.due_date !== undefined) exec('UPDATE items SET due_date = ? WHERE id = ?', [fields.due_date, id]);
  if (fields.recurrence !== undefined) exec('UPDATE items SET recurrence = ? WHERE id = ?', [fields.recurrence, id]);
  if (fields.energy !== undefined) exec('UPDATE items SET energy = ? WHERE id = ?', [fields.energy, id]);
}

export function deleteItem(id) {
  exec('DELETE FROM items WHERE id = ?', [id]);
}

export function reorderItems(sectionId, itemIds) {
  const params = itemIds.map((id, idx) => [idx, sectionId, id]);
  exec('UPDATE items SET sort_order = ? WHERE section_id = ? AND id = ?', params);
}

export function moveItem(itemId, targetSectionId, targetIndex) {
  const rows = query('SELECT section_id FROM items WHERE id = ?', [itemId]);
  if (rows.length === 0) return;
  const sourceSectionId = rows[0].section_id;
  if (sourceSectionId === targetSectionId) return;

  // Move item to target section at targetIndex
  exec('UPDATE items SET section_id = ?, sort_order = ? WHERE id = ?', [targetSectionId, targetIndex, itemId]);

  // Re-index source section
  const sourceItems = query('SELECT id FROM items WHERE section_id = ? ORDER BY sort_order', [sourceSectionId]);
  const sourceParams = sourceItems.map((row, idx) => [idx, sourceSectionId, row.id]);
  if (sourceParams.length > 0) exec('UPDATE items SET sort_order = ? WHERE section_id = ? AND id = ?', sourceParams);

  // Re-index target section
  const targetItems = query('SELECT id FROM items WHERE section_id = ? ORDER BY sort_order', [targetSectionId]);
  const targetParams = targetItems.map((row, idx) => [idx, targetSectionId, row.id]);
  exec('UPDATE items SET sort_order = ? WHERE section_id = ? AND id = ?', targetParams);
}

export function calcNextDue(currentDue, recurrence) {
  const base = currentDue ? new Date(currentDue + 'T12:00:00') : new Date();
  if (isNaN(base.getTime())) return null;
  switch (recurrence) {
    case 'daily': base.setDate(base.getDate() + 1); break;
    case 'weekdays':
      base.setDate(base.getDate() + 1);
      while (base.getDay() === 0 || base.getDay() === 6) base.setDate(base.getDate() + 1);
      break;
    case 'weekly': base.setDate(base.getDate() + 7); break;
    case 'monthly': base.setMonth(base.getMonth() + 1); break;
    case 'yearly': base.setFullYear(base.getFullYear() + 1); break;
    default: return currentDue;
  }
  return base.toISOString().slice(0, 10);
}

export function toggleItem(itemId) {
  const rows = query('SELECT done, recurrence, section_id, text, tag, due_date FROM items WHERE id = ?', [itemId]);
  if (rows.length === 0) return;
  const item = rows[0];
  if (!item.done && item.recurrence) {
    exec("UPDATE items SET done = 1, done_at = datetime('now') WHERE id = ?", [itemId]);
    const nextDue = calcNextDue(item.due_date || new Date().toISOString().slice(0, 10), item.recurrence);
    createItem(item.section_id, item.text, item.tag, nextDue, item.recurrence, item.energy);
  } else if (!item.done) {
    exec("UPDATE items SET done = 1, done_at = datetime('now') WHERE id = ?", [itemId]);
  } else {
    exec('UPDATE items SET done = 0, done_at = NULL WHERE id = ?', [itemId]);
  }
}

// === TRACEABILITY ===

export function getTraceabilityMetrics() {
  return {
    completedToday: query("SELECT COUNT(*) AS c FROM items WHERE done = 1 AND done_at >= datetime('now')")[0]?.c || 0,
    pendingToday: query("SELECT COUNT(*) AS c FROM items WHERE done = 0 AND due_date = date('now')")[0]?.c || 0,
    completedWeek: query("SELECT COUNT(*) AS c FROM items WHERE done = 1 AND done_at >= datetime('now', 'weekday 1', '-7 days') AND done_at < datetime('now', 'weekday 1', '+7 days')")[0]?.c || 0,
    overdue: query("SELECT COUNT(*) AS c FROM items WHERE done = 0 AND due_date < date('now')")[0]?.c || 0,
    totalPending: query('SELECT COUNT(*) AS c FROM items WHERE done = 0')[0]?.c || 0,
  };
}

// === HISTORY ===

export function getDoneItemsByProject(projectId) {
  return query(`SELECT i.* FROM items i
    JOIN sections s ON s.id = i.section_id
    WHERE s.project_id = ? AND i.done = 1
    ORDER BY i.sort_order`, [projectId]);
}

// === PIPELINE ===

export function getPipelineSteps(sectionId) {
  return query('SELECT * FROM pipeline_steps WHERE section_id = ? ORDER BY sort_order', [sectionId]);
}

export function createPipelineStep(sectionId, text) {
  const id = uid();
  const ord = query('SELECT COALESCE(MAX(sort_order),-1) + 1 AS n FROM pipeline_steps WHERE section_id = ?', [sectionId])[0].n;
  exec('INSERT INTO pipeline_steps VALUES (?,?,?,?,?)', [id, sectionId, text, 0, ord]);
  return id;
}

export function updatePipelineStep(id, fields) {
  if (fields.text !== undefined) exec('UPDATE pipeline_steps SET text = ? WHERE id = ?', [fields.text, id]);
  if (fields.active !== undefined) exec('UPDATE pipeline_steps SET active = ? WHERE id = ?', [fields.active ? 1 : 0, id]);
}

export function deletePipelineStep(id) {
  exec('DELETE FROM pipeline_steps WHERE id = ?', [id]);
}

export function reorderPipelineSteps(sectionId, stepIds) {
  const params = stepIds.map((id, idx) => [idx, sectionId, id]);
  exec('UPDATE pipeline_steps SET sort_order = ? WHERE section_id = ? AND id = ?', params);
}

// === APP STATE ===

export function getAppState(key) {
  const rows = query('SELECT value FROM app_state WHERE key = ?', [key]);
  return rows.length > 0 ? rows[0].value : null;
}

export function setAppState(key, value) {
  exec('INSERT OR REPLACE INTO app_state VALUES (?,?)', [key, value]);
}

export function getQuotes() {
  const rows = query("SELECT value FROM app_state WHERE key LIKE 'quote_%' ORDER BY key");
  return rows.map(r => r.value);
}

// === EXPORT / IMPORT ===

export function exportDB() {
  const data = {
    export_version: 1,
    exported_at: new Date().toISOString(),
    categories: query('SELECT * FROM categories ORDER BY sort_order'),
    projects: query('SELECT * FROM projects ORDER BY name'),
    sections: query('SELECT * FROM sections ORDER BY sort_order'),
    items: query('SELECT * FROM items ORDER BY sort_order'),
    pipeline_steps: query('SELECT * FROM pipeline_steps ORDER BY sort_order'),
    app_state: {},
  };
  const appRows = query('SELECT * FROM app_state');
  for (const row of appRows) data.app_state[row.key] = row.value;
  return data;
}

export function importDB(data, mode = 'replace') {
  if (!data || !data.export_version) throw new Error('Formato de exportación inválido');

  db.run('BEGIN TRANSACTION');
  try {
    if (mode === 'replace') {
      db.run('DELETE FROM items');
      db.run('DELETE FROM pipeline_steps');
      db.run('DELETE FROM sections');
      db.run('DELETE FROM projects');
      db.run('DELETE FROM categories');
      db.run('DELETE FROM app_state');
    }

    if (data.categories && data.categories.length) {
      const stmt = db.prepare('INSERT OR IGNORE INTO categories VALUES (?,?,?)');
      for (const c of data.categories) stmt.run([c.id, c.name, c.sort_order]);
      stmt.free();
    }

    if (data.projects && data.projects.length) {
      const stmt = db.prepare('INSERT OR REPLACE INTO projects VALUES (?,?,?,?,?,?)');
      for (const p of data.projects) stmt.run([p.id, p.name, p.category, p.status, p.priority, p.notes ?? '']);
      stmt.free();
    }

    if (data.sections && data.sections.length) {
      const stmt = db.prepare('INSERT OR REPLACE INTO sections VALUES (?,?,?,?,?,?)');
      for (const s of data.sections) stmt.run([s.id, s.project_id, s.title, s.type, s.sort_order, s.text || null]);
      stmt.free();
    }

    if (data.items && data.items.length) {
      const stmt = db.prepare('INSERT OR REPLACE INTO items VALUES (?,?,?,?,?,?,?,?,?,?)');
      for (const i of data.items) stmt.run([i.id, i.section_id, i.text, i.done ?? 0, i.tag ?? null, i.sort_order ?? 0, i.due_date ?? null, i.recurrence ?? null, i.done_at ?? null, i.energy ?? null]);
      stmt.free();
    }

    if (data.pipeline_steps && data.pipeline_steps.length) {
      const stmt = db.prepare('INSERT OR REPLACE INTO pipeline_steps VALUES (?,?,?,?,?)');
      for (const p of data.pipeline_steps) stmt.run([p.id, p.section_id, p.text, p.active, p.sort_order]);
      stmt.free();
    }

    if (data.app_state) {
      const stmt = db.prepare('INSERT OR REPLACE INTO app_state VALUES (?,?)');
      for (const [k, v] of Object.entries(data.app_state)) stmt.run([k, String(v)]);
      stmt.free();
    }

    db.run('COMMIT');
  } catch (e) {
    db.run('ROLLBACK');
    throw e;
  }
}


export { STATUSES, PRIORITIES };
