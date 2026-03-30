import React, {
  useState, useEffect, useCallback,
  useMemo, useRef,
} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, apiCache } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import {
  Plus, Search, FileText, CheckCircle2,
  Send, RefreshCw, X, AlertTriangle,
  Clock, Loader2, LayoutGrid, List,
} from 'lucide-react';
import StatsCard    from '@/components/dashboard/StatsCard';
import DocumentCard from '@/components/dashboard/DocumentCard';
import { useAuth }  from '@/lib/AuthContext';
import usePolling   from '@/hooks/usePolling';

// ════════════════════════════════════════════════════════════════
// CACHE
// ════════════════════════════════════════════════════════════════
const CACHE_PREFIX = 'nexsign_docs_';

const readCache = (uid) => {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const writeCache = (uid, data) => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${uid}`, JSON.stringify(data));
  } catch {}
};

// ════════════════════════════════════════════════════════════════
// STATUS TABS
// ════════════════════════════════════════════════════════════════
const STATUS_TABS = [
  { value: 'all',         label: 'All'      },
  { value: 'in_progress', label: 'Active'   },
  { value: 'completed',   label: 'Done'     },
  { value: 'draft',       label: 'Drafts'   },
  { value: 'declined',    label: 'Declined' },
];

// ════════════════════════════════════════════════════════════════
// SKELETONS
// ════════════════════════════════════════════════════════════════
function DocSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900
                    border border-slate-100 dark:border-slate-800
                    overflow-hidden animate-pulse">
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl bg-slate-100
                            dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-100 dark:bg-slate-800
                              rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800
                              rounded w-1/2" />
            </div>
          </div>
          <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800
                          rounded-lg ml-3" />
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800
                        rounded-full w-full" />
        <div className="flex items-center justify-between pt-1
                        border-t border-slate-50 dark:border-slate-800">
          <div className="flex gap-1">
            {[1,2,3].map(i => (
              <div key={i} className="w-7 h-7 rounded-full
                                      bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
          <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800
                          rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// EMPTY STATE
// ════════════════════════════════════════════════════════════════
function EmptyState({ isFiltered, onClear }) {
  if (isFiltered) return (
    <div className="col-span-full flex flex-col items-center
                    justify-center py-20 text-center
                    bg-white dark:bg-slate-900 rounded-2xl
                    border border-dashed border-slate-200
                    dark:border-slate-800">
      <div className="w-12 h-12 rounded-2xl bg-slate-50
                      dark:bg-slate-800 flex items-center
                      justify-center mb-4">
        <Search className="w-5 h-5 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
        No results found
      </p>
      <p className="text-sm text-slate-400 mb-5">
        Try adjusting your search or filter
      </p>
      <Button
        variant="outline" size="sm" onClick={onClear}
        className="rounded-xl gap-1.5 text-sm border-slate-200
                   dark:border-slate-700 hover:border-sky-400
                   hover:text-sky-500"
      >
        <X className="w-3.5 h-3.5" /> Clear filters
      </Button>
    </div>
  );

  return (
    <div className="col-span-full">
      <div className="relative overflow-hidden bg-gradient-to-br
                      from-sky-50 via-white to-indigo-50
                      dark:from-slate-900 dark:via-slate-900
                      dark:to-slate-900 rounded-2xl border
                      border-dashed border-sky-200
                      dark:border-slate-700 py-20 text-center">
        <div className="absolute top-0 right-0 w-64 h-64
                        bg-sky-100/50 dark:bg-sky-900/10 rounded-full
                        -translate-y-1/2 translate-x-1/2 blur-3xl
                        pointer-events-none" />
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br
                          from-sky-400/20 to-indigo-400/20
                          flex items-center justify-center
                          mx-auto mb-5 shadow-lg shadow-sky-100
                          dark:shadow-none">
            <FileText className="w-9 h-9 text-sky-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800
                         dark:text-white mb-2">
            No documents yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm
                        mb-8 max-w-xs mx-auto leading-relaxed">
            Upload your first PDF and send it for signatures
          </p>
          <Link to="/documents/new">
            <Button className="bg-sky-500 hover:bg-sky-600
                               text-white h-11 px-8 rounded-xl
                               font-semibold shadow-lg
                               shadow-sky-400/30 gap-2
                               hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" /> Create First Document
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const navigate                                = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  // ── State ────────────────────────────────────────────────────
  const [documents,   setDocuments]   = useState(
    () => readCache(user?.id || user?._id)
  );
  const [isLoading,   setIsLoading]   = useState(
    () => readCache(user?.id || user?._id).length === 0
  );
  const [isSyncing,   setIsSyncing]   = useState(false);
  const [fetchError,  setFetchError]  = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [activeTab,   setActiveTab]   = useState('all');
  const [viewMode,    setViewMode]    = useState('grid');

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Redirect admin ───────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, authLoading, navigate]);

  // ── Fetch ────────────────────────────────────────────────────
  const uid = user?.id || user?._id;

  const fetchDocuments = useCallback(async (silent = false) => {
    if (!uid) return;
    silent ? setIsSyncing(true) : setIsLoading(true);
    setFetchError(null);

    try {
      const res  = await api.get('/documents', { noCache: true });
      const docs = res.data?.documents ?? res.data?.data ?? [];

      if (!mountedRef.current) return;
      setDocuments(docs);
      writeCache(uid, docs);
    } catch (err) {
      if (err?.__cancelled) return;
      if (!mountedRef.current) return;
      // Cache আছে তো error দেখাবো না
      const cached = readCache(uid);
      if (!cached.length) setFetchError('Failed to load documents.');
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsSyncing(false);
      }
    }
  }, [uid]);

  // ── Initial load ─────────────────────────────────────────────
  useEffect(() => {
    if (authLoading || isAdmin || !uid) return;

    const cached = readCache(uid);
    if (cached.length) {
      setDocuments(cached);
      setIsLoading(false);
      fetchDocuments(true);  // background sync
    } else {
      fetchDocuments(false); // full load
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdmin, uid]);

  // ── Smart Polling — 30s interval ─────────────────────────────
  // Tab focus হলে তুরন্ত refresh
  // Tab hidden হলে pause
  const silentFetch = useCallback(
    () => fetchDocuments(true),
    [fetchDocuments],
  );

  usePolling(silentFetch, {
    interval:  30_000,
    enabled:   !authLoading && !isAdmin && !!uid,
    immediate: false,
  });

  // ── Search debounce ──────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Optimistic delete ────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    setDocuments(prev => {
      const next = prev.filter(d => d._id !== id);
      writeCache(uid, next);
      return next;
    });
  }, [uid]);

  // ── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      documents.length,
    inProgress: documents.filter(
      d => d.status === 'in_progress' || d.status === 'sent'
    ).length,
    completed:  documents.filter(d => d.status === 'completed').length,
    drafts:     documents.filter(d => d.status === 'draft').length,
  }), [documents]);

  // ── Filtered ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return documents.filter(doc => {
      const matchTitle =
        !q || (doc.title || '').toLowerCase().includes(q);
      const matchStatus =
        activeTab === 'all' ? true
        : activeTab === 'in_progress'
          ? doc.status === 'in_progress' || doc.status === 'sent'
          : doc.status === activeTab;
      return matchTitle && matchStatus;
    });
  }, [documents, search, activeTab]);

  const isFiltered = search.trim() !== '' || activeTab !== 'all';

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setActiveTab('all');
  }, []);

  const tabCount = useCallback((value) => {
    if (value === 'all') return documents.length;
    if (value === 'in_progress')
      return documents.filter(
        d => d.status === 'in_progress' || d.status === 'sent'
      ).length;
    return documents.filter(d => d.status === value).length;
  }, [documents]);

  const greet = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = useMemo(
    () => (user?.name || user?.full_name || 'there').split(' ')[0],
    [user],
  );

  if (authLoading || isAdmin) return null;

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                      py-6 sm:py-10">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center
                        sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold
                             text-slate-900 dark:text-white
                             tracking-tight">
                {greet},{' '}
                <span className="text-sky-500">{firstName}</span>
                {' '}👋
              </h1>
              {isSyncing && (
                <Loader2 className="w-4 h-4 animate-spin
                                    text-sky-400 shrink-0 mt-1" />
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage and track all your signature requests
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline" size="icon"
              onClick={() => fetchDocuments(false)}
              disabled={isLoading || isSyncing}
              className="h-10 w-10 rounded-xl border-slate-200
                         dark:border-slate-700 bg-white
                         dark:bg-slate-900 shadow-sm
                         hover:border-sky-400 hover:text-sky-500
                         disabled:opacity-40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4
                ${isLoading || isSyncing ? 'animate-spin' : ''}`}
              />
            </Button>
            <Link to="/documents/new">
              <Button className="h-10 px-5 rounded-xl font-semibold
                                 bg-sky-500 hover:bg-sky-600
                                 text-white shadow-md
                                 shadow-sky-400/25 gap-2
                                 hover:-translate-y-0.5
                                 transition-all">
                <Plus className="w-4 h-4" /> New Document
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4
                        gap-3 sm:gap-4 mb-8">
          <StatsCard
            label="Total" value={stats.total}
            icon={FileText} color="sky" loading={isLoading}
          />
          <StatsCard
            label="Awaiting" value={stats.inProgress}
            icon={Send} color="amber" loading={isLoading}
          />
          <StatsCard
            label="Completed" value={stats.completed}
            icon={CheckCircle2} color="green" loading={isLoading}
            trend={
              stats.total > 0
                ? `${Math.round((stats.completed / stats.total) * 100)}%`
                : undefined
            }
          />
          <StatsCard
            label="Drafts" value={stats.drafts}
            icon={Clock} color="purple" loading={isLoading}
          />
        </div>

        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl
                        border border-slate-100 dark:border-slate-800
                        shadow-sm mb-5 overflow-hidden">

          {/* Search + view toggle */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3
                          border-b border-slate-50
                          dark:border-slate-800/80">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2
                                 -translate-y-1/2 w-4 h-4
                                 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search documents..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-10 pr-9 h-10 border-slate-200
                           dark:border-slate-700 rounded-xl
                           bg-slate-50 dark:bg-slate-800 text-sm
                           focus-visible:ring-sky-400/30
                           focus-visible:border-sky-400
                           dark:text-white"
              />
              {searchInput && (
                <button type="button"
                        onClick={() => setSearchInput('')}
                        className="absolute right-3 top-1/2
                                   -translate-y-1/2 text-slate-400
                                   hover:text-slate-600 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl
                            bg-slate-100 dark:bg-slate-800
                            border border-slate-200
                            dark:border-slate-700 shrink-0">
              {[
                { mode: 'grid', Icon: LayoutGrid },
                { mode: 'list', Icon: List },
              ].map(({ mode, Icon }) => (
                <button key={mode} type="button"
                        onClick={() => setViewMode(mode)}
                        className={`p-1.5 rounded-lg transition-all
                          ${viewMode === mode
                            ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                          }`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 px-3 py-2
                          overflow-x-auto scrollbar-none">
            {STATUS_TABS.map(tab => {
              const count  = tabCount(tab.value);
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value} type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-2
                              rounded-xl text-sm font-medium
                              whitespace-nowrap transition-all
                              ${active
                                ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-500'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-[10px] font-bold
                                      px-1.5 py-0.5 rounded-full
                                      min-w-[18px] text-center
                                      ${active
                                        ? 'bg-sky-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                      }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results info */}
        {!isLoading && documents.length > 0 && (
          <div className="flex items-center justify-between
                          mb-4 px-0.5">
            <p className="text-xs text-slate-400 font-medium">
              {isFiltered
                ? `${filtered.length} of ${documents.length} documents`
                : `${documents.length} document${documents.length !== 1 ? 's' : ''}`
              }
            </p>
            {isFiltered && (
              <button type="button" onClick={clearFilters}
                      className="text-xs text-sky-500 font-semibold
                                 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Document Grid/List ───────────────────────────── */}
        {isLoading ? (
          <div className={
            viewMode === 'grid'
              ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }>
            {Array.from({ length: 6 }, (_, i) => <DocSkeleton key={i} />)}
          </div>

        ) : fetchError && documents.length === 0 ? (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20
                          border border-red-100 dark:border-red-900
                          px-6 py-5 flex items-center
                          justify-between gap-4">
            <div className="flex items-center gap-3
                            text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{fetchError}</span>
            </div>
            <Button size="sm" variant="outline"
                    onClick={() => fetchDocuments(false)}
                    className="rounded-xl border-red-200 text-red-500
                               hover:bg-red-50 font-semibold shrink-0">
              Retry
            </Button>
          </div>

        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }>
            {filtered.length === 0
              ? <EmptyState isFiltered={isFiltered} onClear={clearFilters} />
              : filtered.map(doc => (
                  <DocumentCard
                    key={doc._id}
                    doc={doc}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                  />
                ))
            }
          </div>
        )}

        {/* Soft error banner */}
        {fetchError && documents.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3
                          rounded-xl bg-amber-50 dark:bg-amber-900/20
                          border border-amber-200/70
                          dark:border-amber-800/50 mt-6">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400
                          font-medium flex-1">
              Showing cached data — couldn't sync latest.
            </p>
            <button type="button"
                    onClick={() => fetchDocuments(true)}
                    className="text-xs font-semibold text-amber-600
                               hover:underline shrink-0">
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}