// src/pages/Dashboard.jsx
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
  Clock, Loader2,
  TrendingUp, LayoutGrid, List,
} from 'lucide-react';
import StatsCard    from '@/components/dashboard/StatsCard';
import DocumentCard from '@/components/dashboard/DocumentCard';
import { useAuth }  from '@/lib/AuthContext';
import useSocket    from '@/hooks/useSocket';

// ─── Constants ───────────────────────────────────────────────────
const CACHE_PREFIX = 'nexsign_docs_';

const STATUS_TABS = [
  { value: 'all',         label: 'All'      },
  { value: 'in_progress', label: 'Active'   },
  { value: 'completed',   label: 'Done'     },
  { value: 'draft',       label: 'Drafts'   },
  { value: 'declined',    label: 'Declined' },
];

// ─── Cache helpers ────────────────────────────────────────────────
function getCacheKey(uid) {
  return uid ? `${CACHE_PREFIX}${uid}` : null;
}
function readCache(uid) {
  try {
    const key = getCacheKey(uid);
    if (!key) return [];
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function writeCache(uid, data) {
  try {
    const key = getCacheKey(uid);
    if (key) localStorage.setItem(key, JSON.stringify(data));
  } catch { /* quota */ }
}

// ─── DocSkeleton ─────────────────────────────────────────────────
function DocSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900
                    border border-slate-100 dark:border-slate-800
                    overflow-hidden animate-pulse">
      <div className="h-2 bg-slate-100 dark:bg-slate-800" />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-100 dark:bg-slate-800
                            rounded-lg w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800
                            rounded-lg w-1/2" />
          </div>
          <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800
                          rounded-full ml-3" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-slate-100 dark:bg-slate-800
                          rounded w-full" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800
                          rounded w-4/5" />
        </div>
        <div className="flex items-center justify-between pt-2
                        border-t border-slate-50 dark:border-slate-800">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-7 w-7 rounded-full
                                      bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
          <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800
                          rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────
function EmptyState({ isFiltered, onClear }) {
  if (isFiltered) {
    return (
      <div className="col-span-full">
        <div className="flex flex-col items-center justify-center
                        py-20 text-center bg-white dark:bg-slate-900
                        rounded-2xl border border-dashed
                        border-slate-200 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl
                          bg-slate-50 dark:bg-slate-800
                          flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-slate-300
                               dark:text-slate-600" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-300
                        mb-1">
            No results found
          </p>
          <p className="text-sm text-slate-400 mb-5">
            Try adjusting your search or filter
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="rounded-xl gap-1.5 text-sm font-medium
                       border-slate-200 dark:border-slate-700
                       hover:border-[#28ABDF] hover:text-[#28ABDF]
                       transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full">
      <div className="relative overflow-hidden
                      bg-gradient-to-br from-sky-50 via-white
                      to-indigo-50 dark:from-slate-900
                      dark:via-slate-900 dark:to-slate-900
                      rounded-2xl border border-dashed
                      border-sky-200 dark:border-slate-700
                      py-20 text-center">
        <div className="absolute top-0 right-0 w-64 h-64
                        bg-sky-100/50 dark:bg-sky-900/10 rounded-full
                        -translate-y-1/2 translate-x-1/2
                        blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl
                          bg-gradient-to-br from-[#28ABDF]/20
                          to-indigo-400/20 dark:from-sky-900/40
                          dark:to-indigo-900/40
                          flex items-center justify-center
                          mx-auto mb-5 shadow-lg
                          shadow-sky-100 dark:shadow-none">
            <FileText className="w-9 h-9 text-[#28ABDF]" />
          </div>
          <h3 className="text-xl font-bold text-slate-800
                         dark:text-white mb-2">
            No documents yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm
                        mb-8 max-w-xs mx-auto leading-relaxed">
            Upload your first PDF and send it for signature in minutes
          </p>
          <Link to="/documents/new">
            <Button className="bg-[#28ABDF] hover:bg-[#2399c8]
                               text-white h-12 px-8 rounded-xl
                               font-semibold shadow-lg
                               shadow-sky-400/30 gap-2
                               transition-all hover:shadow-sky-400/40
                               hover:-translate-y-0.5
                               active:translate-y-0">
              <Plus className="w-4 h-4" />
              Create First Document
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── SyncBanner ──────────────────────────────────────────────────
function SyncBanner({ onRetry }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl
                    bg-amber-50 dark:bg-amber-900/20
                    border border-amber-200/70 dark:border-amber-800/50
                    mt-6">
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
      <p className="text-xs text-amber-700 dark:text-amber-400
                    font-medium flex-1">
        Showing cached data — couldn&apos;t sync latest changes.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="text-xs font-semibold text-amber-600
                   hover:text-amber-700 hover:underline shrink-0"
      >
        Retry
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const navigate                          = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const socket                            = useSocket();

  const [documents,   setDocuments]   = useState(() => readCache(user?._id));
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSyncing,   setIsSyncing]   = useState(false);
  const [fetchError,  setFetchError]  = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [activeTab,   setActiveTab]   = useState('all');
  const [viewMode,    setViewMode]    = useState('grid');

  const mountedRef = useRef(true);

  // ── Cleanup ──────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Redirect admin ───────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, authLoading, navigate]);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchDocuments = useCallback(async (silent = false) => {
    silent ? setIsSyncing(true) : setIsLoading(true);
    setFetchError(null);

    // Cache bust করো — fresh data আনো
    apiCache.invalidatePattern('/documents');

    try {
      const res  = await api.get('/documents', { noCache: true });
      const docs = res.data?.documents ?? [];

      if (mountedRef.current) {
        setDocuments(docs);
        writeCache(user?._id, docs);
      }
    } catch (err) {
      // Cancelled → ignore
      if (err?.__cancelled) return;
      if (mountedRef.current) {
        setFetchError('Failed to load documents.');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsSyncing(false);
      }
    }
  }, [user?._id]);

  // ── Initial load ─────────────────────────────────────────────
  useEffect(() => {
    if (authLoading || isAdmin) return;
    const cached = readCache(user?._id);
    if (cached.length) {
      setDocuments(cached);
      setIsLoading(false);
      fetchDocuments(true);   // background sync
    } else {
      fetchDocuments(false);  // full load
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdmin]);

  // ── Socket events ────────────────────────────────────────────
  // useEffect(() => {
  //   if (!socket) return;

  //   const upsert = (payload) => {
  //     if (!mountedRef.current) return;
  //     // payload = full doc or { documentId, ... }
  //     const docData = payload?.document || payload;
  //     if (!docData?._id) return;

  //     setDocuments(prev => {
  //       const idx  = prev.findIndex(d => d._id === docData._id);
  //       const next = idx !== -1
  //         ? prev.map(d => d._id === docData._id ? { ...d, ...docData } : d)
  //         : [docData, ...prev];
  //       writeCache(user?._id, next);
  //       return next;
  //     });
  //   };

  //   const remove = (payload) => {
  //     if (!mountedRef.current) return;
  //     const id = payload?.documentId || payload?.id || payload?._id;
  //     if (!id) return;
  //     setDocuments(prev => {
  //       const next = prev.filter(d => d._id !== id);
  //       writeCache(user?._id, next);
  //       return next;
  //     });
  //   };

  //   // Refetch on these events (status changed)
  //   const refetch = () => fetchDocuments(true);

  //   socket.on('document:created',      upsert);
  //   socket.on('document:updated',      upsert);
  //   socket.on('document:party_signed', refetch);
  //   socket.on('document:completed',    refetch);
  //   socket.on('document:finalized',    refetch);
  //   socket.on('document:deleted',      remove);

  //   return () => {
  //     socket.off('document:created',      upsert);
  //     socket.off('document:updated',      upsert);
  //     socket.off('document:party_signed', refetch);
  //     socket.off('document:completed',    refetch);
  //     socket.off('document:finalized',    refetch);
  //     socket.off('document:deleted',      remove);
  //   };
  // }, [socket, user?._id, fetchDocuments]);
// ── Socket events ─────────────────────────────────────────────
useEffect(() => {
  if (!socket) return;

  const upsert = (payload) => {
    if (!mountedRef.current) return;
    const docData = payload?.document || payload;
    if (!docData?._id) return;

    setDocuments(prev => {
      const idx  = prev.findIndex(d => d._id === docData._id);
      const next = idx !== -1
        ? prev.map(d => d._id === docData._id ? { ...d, ...docData } : d)
        : [docData, ...prev];
      writeCache(user?._id, next);
      return next;
    });
  };

  const remove = (payload) => {
    if (!mountedRef.current) return;
    const id = payload?.documentId || payload?.id || payload?._id;
    if (!id) return;
    setDocuments(prev => {
      const next = prev.filter(d => d._id !== id);
      writeCache(user?._id, next);
      return next;
    });
  };

  // ✅ FIX: document:finalized এ signedFileUrl update
  const onFinalized = (payload) => {
    if (!mountedRef.current) return;
    const { documentId, signedPdfUrl } = payload;
    if (!documentId || !signedPdfUrl) return;

    setDocuments(prev => {
      const next = prev.map(d =>
        d._id === documentId
          ? { ...d, signedFileUrl: signedPdfUrl, status: 'completed' }
          : d
      );
      writeCache(user?._id, next);
      return next;
    });
  };

  const refetch = () => fetchDocuments(true);

  socket.on('document:created',      upsert);
  socket.on('document:updated',      upsert);
  socket.on('document:party_signed', refetch);
  socket.on('document:completed',    refetch);
  socket.on('document:finalized',    onFinalized); // ✅ FIX
  socket.on('document:deleted',      remove);

  return () => {
    socket.off('document:created',      upsert);
    socket.off('document:updated',      upsert);
    socket.off('document:party_signed', refetch);
    socket.off('document:completed',    refetch);
    socket.off('document:finalized',    onFinalized); // ✅ FIX
    socket.off('document:deleted',      remove);
  };
}, [socket, user?._id, fetchDocuments]);
  // ── Search debounce ──────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Optimistic delete ────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    setDocuments(prev => {
      const next = prev.filter(d => d._id !== id);
      writeCache(user?._id, next);
      return next;
    });
  }, [user?._id]);

  // ── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      documents.length,
    inProgress: documents.filter(
      d => d.status === 'in_progress' || d.status === 'sent',
    ).length,
    completed:  documents.filter(d => d.status === 'completed').length,
    drafts:     documents.filter(d => d.status === 'draft').length,
  }), [documents]);

  // ── Filtered docs ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return documents.filter(doc => {
      const matchTitle =
        !q || (doc.title || '').toLowerCase().includes(q);
      const matchStatus =
        activeTab === 'all'
          ? true
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

  const greet = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (authLoading || isAdmin) return null;

  // ── Tab counts ───────────────────────────────────────────────
  function tabCount(value) {
    if (value === 'all') return documents.length;
    if (value === 'in_progress')
      return documents.filter(
        d => d.status === 'in_progress' || d.status === 'sent',
      ).length;
    return documents.filter(d => d.status === value).length;
  }

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                      py-6 sm:py-10">

        {/* ════════════════════════════════════════════════════
            HEADER
        ════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center
                        sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold
                             text-slate-900 dark:text-white
                             tracking-tight">
                {greet},{' '}
                <span className="text-[#28ABDF]">
                  {user?.full_name?.split(' ')[0] || 'there'}
                </span>
                {' '}👋
              </h1>
              {isSyncing && (
                <Loader2 className="w-4 h-4 animate-spin
                                    text-[#28ABDF] shrink-0 mt-1" />
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage and track all your signature requests
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchDocuments(false)}
              disabled={isLoading || isSyncing}
              aria-label="Refresh"
              className="h-10 w-10 rounded-xl border-slate-200
                         dark:border-slate-700 bg-white
                         dark:bg-slate-900 shadow-sm
                         hover:border-[#28ABDF] hover:text-[#28ABDF]
                         disabled:opacity-40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4
                ${isLoading || isSyncing ? 'animate-spin' : ''}`}
              />
            </Button>

            <Link to="/documents/new">
              <Button className="h-10 px-5 rounded-xl font-semibold
                                 bg-[#28ABDF] hover:bg-[#2399c8]
                                 text-white shadow-md shadow-sky-400/25
                                 gap-2 transition-all
                                 hover:shadow-sky-400/40
                                 hover:-translate-y-0.5
                                 active:translate-y-0
                                 active:shadow-none">
                <Plus className="w-4 h-4" />
                New Document
              </Button>
            </Link>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            STATS
        ════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3
                        sm:gap-4 mb-8">
          <StatsCard
            label="Total"
            value={stats.total}
            icon={FileText}
            color="sky"
            loading={isLoading}
          />
          <StatsCard
            label="Awaiting"
            value={stats.inProgress}
            icon={Send}
            color="amber"
            loading={isLoading}
          />
          <StatsCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            color="green"
            loading={isLoading}
            trend={
              stats.completed > 0
                ? `${Math.round(
                    (stats.completed / Math.max(stats.total, 1)) * 100,
                  )}% rate`
                : undefined
            }
          />
          <StatsCard
            label="Drafts"
            value={stats.drafts}
            icon={Clock}
            color="purple"
            loading={isLoading}
          />
        </div>

        {/* ════════════════════════════════════════════════════
            TOOLBAR
        ════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl
                        border border-slate-100 dark:border-slate-800
                        shadow-sm mb-6 overflow-hidden">

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
                           focus-visible:ring-[#28ABDF]/30
                           focus-visible:border-[#28ABDF]
                           dark:text-white transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600
                             transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl
                            bg-slate-100 dark:bg-slate-800
                            border border-slate-200
                            dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-lg transition-all
                  ${viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-[#28ABDF] shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-1.5 rounded-lg transition-all
                  ${viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-[#28ABDF] shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 px-3 py-2
                          overflow-x-auto scrollbar-none">
            {STATUS_TABS.map(tab => {
              const count = tabCount(tab.value);
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1.5 px-4 py-2
                              rounded-xl text-sm font-medium
                              whitespace-nowrap transition-all
                              ${activeTab === tab.value
                                ? 'bg-[#28ABDF]/10 text-[#28ABDF]'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-[10px] font-bold
                                      px-1.5 py-0.5 rounded-full
                                      min-w-[18px] text-center
                                      ${activeTab === tab.value
                                        ? 'bg-[#28ABDF] text-white'
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
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-[#28ABDF] font-semibold
                           hover:underline transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            DOCUMENT GRID / LIST
        ════════════════════════════════════════════════════ */}
        {isLoading ? (
          <div className={
            viewMode === 'grid'
              ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
              : 'flex flex-col gap-3'
          }>
            {Array.from({ length: 6 }, (_, i) => (
              <DocSkeleton key={i} />
            ))}
          </div>

        ) : fetchError && documents.length === 0 ? (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20
                          border border-red-100 dark:border-red-900
                          px-6 py-5 flex items-center
                          justify-between gap-4">
            <div className="flex items-center gap-3 text-red-600
                            dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{fetchError}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchDocuments(false)}
              className="rounded-xl border-red-200 text-red-500
                         hover:bg-red-50 font-semibold shrink-0"
            >
              Retry
            </Button>
          </div>

        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
              : 'flex flex-col gap-3'
          }>
            {filtered.length === 0
              ? (
                <EmptyState
                  isFiltered={isFiltered}
                  onClear={clearFilters}
                />
              )
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
          <SyncBanner onRetry={() => fetchDocuments(true)} />
        )}
      </div>
    </div>
  );
}