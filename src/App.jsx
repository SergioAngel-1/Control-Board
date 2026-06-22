import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Sidebar from './Sidebar.jsx';
import MainHeader from './MainHeader.jsx';
import SectionCard from './SectionCard.jsx';
import Dashboard from './Dashboard.jsx';
import QuickSearch from './components/QuickSearch.jsx';
import {
  initDB, getProjects, getCategories, getProjectsByCategory, getQuotes,
  getAppState, setAppState, getSections, getItems, getPipelineSteps,
  toggleItem, persistDB,
  createProject, updateProject, deleteProject,
  createCategory, updateCategory, deleteCategory,
  createSection, deleteSection, updateSection,
  createItem, deleteItem, updateItem,
  getDashboardData,
} from './db/database.js';

export default function App() {
  const [ready, setReady] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projectsByCategory, setProjectsByCategory] = useState({});
  const [quotes, setQuotes] = useState([]);
  const [catCollapsed, setCatCollapsed] = useState({});
  const [sectionCollapsed, setSectionCollapsed] = useState({});
  const [initError, setInitError] = useState(null);
  const [view, setView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const quotesRef = useRef([]);
  const projectsRef = useRef([]);
  const [dataVersion, setDataVersion] = useState(0);

  // Init
  useEffect(() => {
    (async () => {
      try {
        await initDB();
      } catch (e) {
        console.error('initDB error:', e);
        setInitError(e.message || String(e));
        return;
      }
      refreshProjectData();
      // Parse URL for initial view
      const path = window.location.pathname;
      if (path !== '/') {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 2) {
          const projectId = decodeURIComponent(parts[parts.length - 1]);
          const projs = getProjects();
          if (projs.find(p => p.id === projectId)) {
            setActiveProjectId(projectId);
            setView('project');
            setAppState('active_project_id', projectId);
            persistDB();
          }
        }
      }
      setDashboardData(getDashboardData());
      const qs = getQuotes();
      quotesRef.current = qs;
      setQuotes(qs);
      setQuoteIndex(parseInt(getAppState('quote_index') || '0', 10));
      setCatCollapsed(JSON.parse(getAppState('cat_collapsed') || '{}'));
      setSectionCollapsed(JSON.parse(getAppState('sec_collapsed') || '{}'));
      setReady(true);
    })();
  }, []);

  // QuickSearch keyboard shortcut
  useEffect(() => {
    function handle(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setQuickSearchOpen(p => !p);
      }
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  function refreshProjectData() {
    const projs = getProjects();
    projectsRef.current = projs;
    const cats = getCategories();
    const byCat = {};
    for (const cat of cats) byCat[cat.name] = getProjectsByCategory(cat.name);
    const activeId = getAppState('active_project_id');
    // Ensure activeProjectId still exists
    const validId = activeId && projs.find(p => p.id === activeId) ? activeId : (projs.length > 0 ? projs[0].id : null);
    setProjects(projs);
    setCategories(cats);
    setProjectsByCategory(byCat);
    setActiveProjectId(validId);
    setDashboardData(getDashboardData());
    setDataVersion(v => v + 1);
  }

  // Section data for active project
  const { sections, itemsBySection, pipelineBySection } = useMemo(() => {
    void dataVersion;
    if (!ready || !activeProjectId) {
      return { sections: [], itemsBySection: {}, pipelineBySection: {} };
    }
    const secs = getSections(activeProjectId);
    const itemsMap = {};
    const pipeMap = {};
    for (const sec of secs) {
      itemsMap[sec.id] = getItems(sec.id);
      if (sec.type === 'pipeline') pipeMap[sec.id] = getPipelineSteps(sec.id);
    }
    return { sections: secs, itemsBySection: itemsMap, pipelineBySection: pipeMap };
  }, [ready, activeProjectId, dataVersion]);

  // === HANDLERS ===

  const refreshAll = useCallback(() => {
    refreshProjectData();
    const qs = getQuotes();
    quotesRef.current = qs;
    setQuotes(qs);
  }, []);

  // Project
  const handleSelectProject = useCallback((id, category, name, status, priority) => {
    if (category && name) {
      const pid = createProject(name, category, status, priority, '');
      setAppState('active_project_id', pid);
      persistDB();
      setActiveProjectId(pid);
      setView('project');
      setSearchQuery('');
      refreshAll();
      setSidebarOpen(false);
    } else if (id) {
      setActiveProjectId(id);
      setView('project');
      setAppState('active_project_id', id);
      persistDB();
      setSidebarOpen(false);
    }
  }, []);

  const handleUpdateProject = useCallback((id, fields) => {
    updateProject(id, fields);
    persistDB();
    refreshAll();
  }, []);

  const handleDeleteProject = useCallback((id) => {
    const next = projects.find(p => p.id !== id);
    deleteProject(id);
    persistDB();
    setActiveProjectId(next ? next.id : null);
    refreshAll();
  }, [projects]);

  // Section
  const handleAddSection = useCallback((projectId, title, type) => {
    createSection(projectId, title, type);
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  const handleDeleteSection = useCallback((sectionId) => {
    deleteSection(sectionId);
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  const handleRenameSection = useCallback((sectionId, title) => {
    updateSection(sectionId, { title });
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  // Item
  const handleToggleItem = useCallback((itemId) => {
    toggleItem(itemId);
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  const handleAddItem = useCallback((sectionId, text) => {
    createItem(sectionId, text);
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  const handleDeleteItem = useCallback((itemId) => {
    deleteItem(itemId);
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  const handleUpdateItem = useCallback((itemId, fields) => {
    if (typeof fields === 'string') fields = { text: fields };
    updateItem(itemId, fields);
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  // Categories
  const handleCreateCategory = useCallback((name) => {
    createCategory(name);
    persistDB();
    refreshAll();
  }, []);

  const handleRenameCategory = useCallback((id, name) => {
    updateCategory(id, { name });
    persistDB();
    refreshAll();
  }, []);

  const handleDeleteCategory = useCallback((id) => {
    deleteCategory(id);
    persistDB();
    refreshAll();
  }, []);

  // UI
  const handleShowDashboard = useCallback(() => {
    refreshProjectData();
    setView('dashboard');
    setActiveProjectId(null);
    setSidebarOpen(false);
  }, []);

  const handleDashboardSelectProject = useCallback((id) => {
    setActiveProjectId(id);
    setView('project');
    setAppState('active_project_id', id);
    persistDB();
  }, []);

  const handleToggleSidebar = useCallback(() => setSidebarOpen(p => !p), []);

  const handleNextQuote = useCallback(() => {
    setQuoteIndex(p => {
      const next = (p + 1) % (quotesRef.current.length || 1);
      setAppState('quote_index', String(next));
      persistDB();
      return next;
    });
  }, []);

  const handleToggleCategory = useCallback((cat) => {
    setCatCollapsed(p => {
      const next = { ...p, [cat]: !p[cat] };
      setAppState('cat_collapsed', JSON.stringify(next));
      persistDB();
      return next;
    });
  }, []);

  const handleToggleSection = useCallback((secId) => {
    setSectionCollapsed(p => {
      const next = { ...p, [secId]: !p[secId] };
      setAppState('sec_collapsed', JSON.stringify(next));
      persistDB();
      return next;
    });
  }, []);

  // QuickSearch
  const handleQuickSelect = useCallback((id) => {
    handleSelectProject(id);
    setQuickSearchOpen(false);
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const checklistSections = sections.filter(s => s.type === 'checklist');
  const totalItems = checklistSections.reduce((acc, s) => acc + (itemsBySection[s.id]?.length || 0), 0);
  const doneItems = checklistSections.reduce((acc, s) => acc + (itemsBySection[s.id]?.filter(i => i.done)?.length || 0), 0);

  // Sync URL with view
  useEffect(() => {
    if (!ready) return;
    let targetUrl = '/';
    if (view === 'project' && activeProject) {
      targetUrl = `/${encodeURIComponent(activeProject.category)}/${activeProject.id}`;
    }
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
  }, [view, activeProject, ready]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      if (path === '/') {
        setView('dashboard');
        setActiveProjectId(null);
      } else {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 2) {
          const projectId = decodeURIComponent(parts[parts.length - 1]);
          const project = projectsRef.current.find(p => p.id === projectId);
          if (project) {
            setActiveProjectId(projectId);
            setView('project');
            setAppState('active_project_id', projectId);
            persistDB();
          } else {
            setView('dashboard');
            setActiveProjectId(null);
          }
        } else {
          setView('dashboard');
          setActiveProjectId(null);
        }
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Wrapper for onToggleItem to handle section-level toggle
  const handleSectionToggleItem = useCallback((itemId) => {
    handleToggleItem(itemId);
  }, [handleToggleItem]);

  if (initError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-base text-red-400 text-sm p-8" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        Error de inicialización: {initError}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-base text-text-secondary text-sm" role="status" aria-live="polite">
        Inicializando…
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-base">
      <Sidebar
        categories={categories}
        projectsByCategory={projectsByCategory}
        activeProjectId={activeProjectId}
        view={view}
        catCollapsed={catCollapsed}
        quotes={quotes}
        quoteIndex={quoteIndex}
        onSelectProject={handleSelectProject}
        onToggleCategory={handleToggleCategory}
        onToggleSidebar={handleToggleSidebar}
        onNextQuote={handleNextQuote}
        onShowDashboard={handleShowDashboard}
        sidebarOpen={sidebarOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateProject={handleSelectProject}
        onCreateCategory={handleCreateCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {quickSearchOpen && (
        <QuickSearch
          projects={projects}
          onSelect={handleQuickSelect}
          onClose={() => setQuickSearchOpen(false)}
        />
      )}

      <main className="flex-1 h-screen overflow-y-auto flex flex-col">
        <button
          type="button"
          aria-label="Abrir menú de proyectos"
          aria-expanded={sidebarOpen}
          className="lg:hidden fixed top-3 left-3 z-30 w-9 h-9 rounded-sm bg-surface border border-border text-text-secondary text-lg flex items-center justify-center transition-colors hover:bg-surface-hover hover:text-text-primary"
          onClick={handleToggleSidebar}
        >
          &#9776;
        </button>

        <MainHeader
          project={activeProject}
          totalItems={totalItems}
          doneItems={doneItems}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onAddSection={handleAddSection}
        />

        <div className={`flex-1 px-8 pb-12 max-sm:px-4 ${view === 'dashboard' ? '' : 'max-w-[820px]'}`}>
          {view === 'dashboard' || !activeProject ? (
            <Dashboard projects={dashboardData} onSelectProject={handleDashboardSelectProject} />
          ) : (
            <div className="pt-6">
              {sections.map((sec, i) => (
                <div key={sec.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <SectionCard
                    section={sec}
                    items={itemsBySection[sec.id] || []}
                    pipelineSteps={pipelineBySection[sec.id] || []}
                    collapsed={sectionCollapsed[sec.id]}
                    onToggle={() => handleToggleSection(sec.id)}
                    onToggleItem={handleSectionToggleItem}
                    onDeleteItem={handleDeleteItem}
                    onUpdateItem={handleUpdateItem}
                    onAddItem={handleAddItem}
                    onDeleteSection={handleDeleteSection}
                    onRenameSection={handleRenameSection}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
