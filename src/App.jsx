import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Sidebar from './Sidebar.jsx';
import MainHeader from './MainHeader.jsx';
import SectionCard from './SectionCard.jsx';
import Dashboard from './Dashboard.jsx';
import Settings from './Settings.jsx';
import QuickSearch from './components/QuickSearch.jsx';
import {
  initDB, getProjects, getCategories, getProjectsByCategory, getQuotes,
  getAppState, setAppState, getSections, getItems, getPipelineSteps,
  toggleItem, persistDB,
  createProject, updateProject, deleteProject,
  createCategory, updateCategory, deleteCategory,
  createSection, deleteSection, updateSection,
  createItem, deleteItem, updateItem, reorderItems, reorderSections,
  getDashboardData, ensureHistorySection, getDoneItemsByProject,
  createPipelineStep, updatePipelineStep, deletePipelineStep, reorderPipelineSteps,
  moveItem,
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
      // Ensure history sections for all existing projects
      const allProjs = getProjects();
      for (const p of allProjs) ensureHistorySection(p.id);
      if (allProjs.length > 0) { setDataVersion(v => v + 1); }
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
          } else {
            setActiveProjectId(null);
            setView('dashboard');
          }
        }
      } else {
        setActiveProjectId(null);
        setView('dashboard');
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
      if (sec.type === 'history') {
        itemsMap[sec.id] = getDoneItemsByProject(activeProjectId);
      } else {
        itemsMap[sec.id] = getItems(sec.id);
        if (sec.type === 'checklist') {
          itemsMap[sec.id] = itemsMap[sec.id].filter(i => !i.done);
        }
      }
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

  // Pipeline
  const handleAddPipelineStep = useCallback((sectionId, text) => {
    createPipelineStep(sectionId, text);
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  const handleUpdatePipelineStep = useCallback((stepId, fields) => {
    if (typeof fields === 'string') fields = { text: fields };
    updatePipelineStep(stepId, fields);
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  const handleDeletePipelineStep = useCallback((stepId) => {
    deletePipelineStep(stepId);
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  const handleReorderPipelineSteps = useCallback((sectionId, stepIds) => {
    reorderPipelineSteps(sectionId, stepIds);
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

  const handleShowSettings = useCallback(() => {
    setView('settings');
    setActiveProjectId(null);
    setSidebarOpen(false);
  }, []);

  const handleDashboardSelectProject = useCallback((id) => {
    setActiveProjectId(id);
    setView('project');
    setAppState('active_project_id', id);
    persistDB();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function itemCollisionDetection(args) {
    const { active, droppableContainers, ...rest } = args;
    const activeType = active.data.current?.type;

    if (activeType === 'section') {
      return closestCenter({
        ...rest,
        active,
        droppableContainers: droppableContainers.filter(c => c.data.current?.type === 'section'),
      });
    }

    if (activeType === 'item') {
      return closestCenter({
        ...rest,
        active,
        droppableContainers: droppableContainers.filter(
          c => c.data.current?.type === 'item' || c.data.current?.type === 'section-drop'
        ),
      });
    }

    return closestCenter(args);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeType = active.data.current?.type;

    if (activeType === 'section') {
      if (over.data.current?.type !== 'section') return;
      const ids = sections.map(s => s.id);
      const oldIdx = ids.indexOf(active.id);
      const newIdx = ids.indexOf(over.id);
      if (oldIdx === -1 || newIdx === -1) return;
      ids.splice(oldIdx, 1);
      ids.splice(newIdx, 0, active.id);
      reorderSections(activeProjectId, ids);
      persistDB();
      setDataVersion(v => v + 1);
      return;
    }

    if (activeType === 'item') {
      const activeSectionId = active.data.current?.sectionId;
      const overType = over.data.current?.type;

      if (overType === 'section-drop') {
        const targetSectionId = over.data.current?.sectionId;
        if (!targetSectionId || targetSectionId === activeSectionId) return;
        const targetItems = itemsBySection[targetSectionId] || [];
        moveItem(active.id, targetSectionId, targetItems.length);
        persistDB();
        setDataVersion(v => v + 1);
        return;
      }

      if (overType === 'item') {
        const overSectionId = over.data.current?.sectionId;
        if (activeSectionId === overSectionId) {
          const itemIds = (itemsBySection[activeSectionId] || []).map(i => i.id);
          const oldIdx = itemIds.indexOf(active.id);
          const newIdx = itemIds.indexOf(over.id);
          if (oldIdx === -1 || newIdx === -1) return;
          itemIds.splice(oldIdx, 1);
          itemIds.splice(newIdx, 0, active.id);
          reorderItems(activeSectionId, itemIds);
        } else {
          const targetItems = itemsBySection[overSectionId] || [];
          const overIdx = targetItems.findIndex(i => i.id === over.id);
          moveItem(active.id, overSectionId, overIdx);
        }
        persistDB();
        setDataVersion(v => v + 1);
        return;
      }
    }
  }

  const handleSectionReorderItems = useCallback((sectionId, itemIds) => {
    reorderItems(sectionId, itemIds);
    persistDB();
    setDataVersion(v => v + 1);
  }, []);

  const handleDashboardToggleItem = useCallback((itemId) => {
    toggleItem(itemId);
    persistDB();
    setDashboardData(getDashboardData());
    setDataVersion(v => v + 1);
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
      targetUrl = `/${encodeURIComponent(activeProject.category.toLowerCase())}/${activeProject.id}`;
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
        onShowSettings={handleShowSettings}
        sidebarOpen={sidebarOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateProject={handleSelectProject}
        onCreateCategory={handleCreateCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        onUpdateProject={handleUpdateProject}
      />

      {quickSearchOpen && (
        <QuickSearch
          projects={projects}
          onSelect={handleQuickSelect}
          onClose={() => setQuickSearchOpen(false)}
        />
      )}

      <main className="flex-1 h-screen overflow-y-auto flex flex-col">

        {view === 'project' && activeProject && (
          <MainHeader
            project={activeProject}
            totalItems={totalItems}
            doneItems={doneItems}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onAddSection={handleAddSection}
            onToggleSidebar={handleToggleSidebar}
          />
        )}

        <div className={`flex-1 px-8 pb-12 max-sm:px-3 ${view === 'dashboard' ? '' : 'max-w-[1200px] max-sm:max-w-full'}`}>
          {view === 'settings' ? (
            <Settings onShowDashboard={handleShowDashboard} onToggleSidebar={handleToggleSidebar} />
          ) : view === 'dashboard' || !activeProject ? (
            <Dashboard projects={dashboardData} onSelectProject={handleDashboardSelectProject} onToggleItem={handleDashboardToggleItem} onToggleSidebar={handleToggleSidebar} />
          ) : (
            <div className="pt-6">
              <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={itemCollisionDetection}>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {sections.map((sec, i) => (
                    <div key={sec.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <SectionCard
                    section={sec}
                    items={itemsBySection[sec.id] || []}
                    pipelineSteps={pipelineBySection[sec.id] || []}
                    collapsed={sectionCollapsed[sec.id]}
                    onToggle={() => handleToggleSection(sec.id)}
                    onToggleItem={handleToggleItem}
                    onDeleteItem={handleDeleteItem}
                    onUpdateItem={handleUpdateItem}
                    onAddItem={handleAddItem}
                    onDeleteSection={handleDeleteSection}
                    onRenameSection={handleRenameSection}
                    onReorderItems={handleSectionReorderItems}
                    onAddPipelineStep={handleAddPipelineStep}
                    onUpdatePipelineStep={handleUpdatePipelineStep}
                    onDeletePipelineStep={handleDeletePipelineStep}
                    onReorderPipelineSteps={handleReorderPipelineSteps}
                  />
                    </div>
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
