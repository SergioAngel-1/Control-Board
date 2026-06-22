import initSqlJs from 'sql.js';
import localforage from 'localforage';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let db = null;
const DB_KEY = 'ops-center-v2';

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
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)`);
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY, section_id TEXT NOT NULL, text TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0, tag TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0, due_date TEXT,
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
  // Add due_date column to items if missing
  const itemCols = db.exec("PRAGMA table_info('items')")[0]?.values.map(c => c[1]) || [];
  if (!itemCols.includes('due_date')) {
    db.run("ALTER TABLE items ADD COLUMN due_date TEXT");
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
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    if (tables.length === 0) { createTables(); seed(); }
    else { migrateSchema(); await persistDB(); }
  } else {
    db = new SQL.Database();
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
  await localforage.setItem(DB_KEY, data);
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
  const projects = query(`SELECT * FROM projects ORDER BY
    CASE priority WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 END,
    name ASC
    LIMIT 8`);
  return projects.map(p => {
    const sections = getSections(p.id);
    const itemsBySection = {};
    for (const sec of sections) {
      itemsBySection[sec.id] = getItems(sec.id);
    }
    return { ...p, sections, itemsBySection };
  });
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

export function createProject(name, category, status, priority, notes) {
  const id = uid();
  exec('INSERT INTO projects VALUES (?,?,?,?,?,?)', [id, name, category, status || 'activo', priority || 'media', notes || '']);
  // Create default sections
  const s1id = uid();
  const s2id = uid();
  exec('INSERT INTO sections VALUES (?,?,?,?,?)', [s1id, id, 'Proximo paso', 'checklist', 0]);
  exec('INSERT INTO sections VALUES (?,?,?,?,?)', [s2id, id, 'Futuro', 'list', 1]);
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
  exec('INSERT INTO sections VALUES (?,?,?,?,?)', [id, projectId, title, type || 'checklist', ord]);
  return id;
}

export function updateSection(id, fields) {
  if (fields.title !== undefined) exec('UPDATE sections SET title = ? WHERE id = ?', [fields.title, id]);
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

export function createItem(sectionId, text, tag, due_date) {
  const id = uid();
  const ord = query('SELECT COALESCE(MAX(sort_order),-1) + 1 AS n FROM items WHERE section_id = ?', [sectionId])[0].n;
  exec('INSERT INTO items VALUES (?,?,?,?,?,?,?)', [id, sectionId, text, 0, tag || null, ord, due_date || null]);
  return id;
}

export function updateItem(id, fields) {
  if (fields.text !== undefined) exec('UPDATE items SET text = ? WHERE id = ?', [fields.text, id]);
  if (fields.tag !== undefined) exec('UPDATE items SET tag = ? WHERE id = ?', [fields.tag, id]);
  if (fields.done !== undefined) exec('UPDATE items SET done = ? WHERE id = ?', [fields.done ? 1 : 0, id]);
  if (fields.due_date !== undefined) exec('UPDATE items SET due_date = ? WHERE id = ?', [fields.due_date, id]);
}

export function deleteItem(id) {
  exec('DELETE FROM items WHERE id = ?', [id]);
}

export function toggleItem(itemId) {
  const rows = query('SELECT done FROM items WHERE id = ?', [itemId]);
  if (rows.length === 0) return;
  exec('UPDATE items SET done = ? WHERE id = ?', [rows[0].done ? 0 : 1, itemId]);
}

// === PIPELINE ===

export function getPipelineSteps(sectionId) {
  return query('SELECT * FROM pipeline_steps WHERE section_id = ? ORDER BY sort_order', [sectionId]);
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


export { STATUSES, PRIORITIES };
