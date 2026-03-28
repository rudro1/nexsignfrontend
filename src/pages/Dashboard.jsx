

// import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Plus, Search, FileText, CheckCircle2, Send, Loader2, ChevronDown, Layout } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import StatsCard from '@/components/dashboard/StatsCard';
// import DocumentCard from '@/components/dashboard/DocumentCard';
// import { useAuth } from '@/lib/AuthContext';

// const LIMIT = 6; // 3-column grid looks best with multiples of 3

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const { user, isAdmin, loading: authLoading } = useAuth();

//   const [search, setSearch]           = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [documents, setDocuments]     = useState([]);
//   const [isLoading, setIsLoading]     = useState(true);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [page, setPage]               = useState(1);
//   const [hasMore, setHasMore]         = useState(false);
//   const [isFetchingMore, setIsFetchingMore] = useState(false);
//   const [fetchError, setFetchError]   = useState(null);

//   // ✅ FIX: use AbortController to cancel in-flight requests on unmount
//   const abortRef = useRef(null);

//   // const fetchDocuments = useCallback(async (pageNum = 1, append = false) => {
//   //   // Cancel previous request if still running
//   //   abortRef.current?.abort();
//   //   abortRef.current = new AbortController();

//   //   try {
//   //     if (!append) setIsLoading(true);
//   //     else setIsFetchingMore(true);
//   //     setFetchError(null);

//   //     const res = await api.get('/documents', {
//   //       params: { page: pageNum, limit: LIMIT },
//   //       signal: abortRef.current.signal,
//   //     });

//   //     const rawData      = res.data?.documents || [];
//   //     const serverHasMore = !!res.data?.hasMore;

//   //     if (append) {
//   //       setDocuments(prev => {
//   //         const existingIds = new Set(prev.map(d => d._id));
//   //         return [...prev, ...rawData.filter(d => !existingIds.has(d._id))];
//   //       });
//   //     } else {
//   //       setDocuments(rawData);
//   //     }
//   //     setHasMore(serverHasMore);
//   //     setPage(pageNum);
//   //   } catch (err) {
//   //     if (err.name === 'CanceledError' || err.name === 'AbortError') return;
//   //     console.error('Dashboard fetch error:', err);
//   //     setFetchError('Failed to load documents. Please refresh.');
//   //   } finally {
//   //     setIsLoading(false);
//   //     setIsFetchingMore(false);
//   //   }
//   // }, []);

//   // ✅ FIX: redirect admin, fetch on mount — no localStorage cache
 
//  const fetchDocuments = useCallback(async (pageNum = 1, append = false, silent = false) => {
//   abortRef.current?.abort();
//   abortRef.current = new AbortController();

//   try {
//     // শুধুমাত্র প্রথমবার বা পেজ লোডের সময় মেইন লোডার দেখাবে
//     if (!append && !silent) setIsLoading(true);
//     if (silent) setIsSyncing(true);
//     if (append) setIsFetchingMore(true);
//     setFetchError(null);

//     const res = await api.get('/documents', {
//       params: { 
//         page: pageNum, 
//         limit: LIMIT,
//         select: 'title status createdAt isTemplate parties.status parties.name fileUrl' 
//       },
//       signal: abortRef.current.signal,
//     });

//     const rawData = res.data?.documents || [];
//     const serverHasMore = !!res.data?.hasMore;

//     if (append) {
//       setDocuments(prev => {
//         const existingIds = new Set(prev.map(d => d._id));
//         return [...prev, ...rawData.filter(d => !existingIds.has(d._id))];
//       });
//     } else {
//       // সাইলেন্ট আপডেট হলে ডাটা রিপ্লেস হবে কিন্তু ইউজার টের পাবে না
//       setDocuments(rawData);
//     }
//     setHasMore(serverHasMore);
//     setPage(pageNum);
//   } catch (err) {
//     if (err.name === 'CanceledError' || err.name === 'AbortError') return;
//     setFetchError('Failed to load. Click to retry.');
//   } finally {
//     setIsLoading(false);
//     setIsFetchingMore(false);
//     setIsSyncing(false);
//   }
// }, []);
 
// useEffect(() => {
//   if (authLoading) return;
//   if (isAdmin) {
//     navigate('/admin', { replace: true });
//     return;
//   }

//   // প্রথমবার ডাটা আনা
//   fetchDocuments(1, false);

//   // অটো-রিফ্রেশ লজিক (রিলোড ছাড়া আপডেট)
//   const interval = setInterval(() => {
//     fetchDocuments(1, false, true); 
//   }, 15000); 

//   return () => {
//     abortRef.current?.abort();
//     clearInterval(interval);
//   };
// }, [isAdmin, authLoading, navigate, fetchDocuments]);

//   const handleLoadMore = () => {
//     if (!isFetchingMore && hasMore) fetchDocuments(page + 1, true);
//   };

//   // ── Stats ──────────────────────────────────────────────────────────────
//   const stats = useMemo(() => ({
//     total:      documents.filter(d => !d.isTemplate).length,
//     inProgress: documents.filter(d => d.status === 'in_progress' && !d.isTemplate).length,
//     completed:  documents.filter(d => d.status === 'completed'   && !d.isTemplate).length,
//     templates:  documents.filter(d => d.isTemplate === true).length,
//   }), [documents]);

//   // ── Client-side filter (fast — no extra API call) ──────────────────────
//   const filtered = useMemo(() => {
//     const q = search.toLowerCase().trim();
//     return documents.filter(doc => {
//       const titleMatch = !q || (doc.title || '').toLowerCase().includes(q);
//       if (statusFilter === 'templates') return titleMatch && doc.isTemplate === true;
//       const statusMatch = statusFilter === 'all' || doc.status === statusFilter;
//       return titleMatch && statusMatch && !doc.isTemplate;
//     });
//   }, [documents, search, statusFilter]);

//   // Don't render while checking auth / redirecting admin
//   if (authLoading || isAdmin) return null;

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* ── Header ─────────────────────────────────────────────────────── */}
 
// {/* ── Header ─────────────────────────────────── */}
// <div className="flex flex-col sm:flex-row sm:items-center
//                 justify-between gap-4 mb-8">
//   <div>
//     <div className="flex items-center gap-2">
//       <h1 className="text-2xl sm:text-3xl font-bold
//                      text-slate-900 dark:text-white tracking-tight">
//         Welcome back,{' '}
//         {user?.full_name?.split(' ')[0] || 'there'} 👋
//       </h1>
//       {isSyncing && (
//         <Loader2 className="w-5 h-5 animate-spin
//                             text-[#28ABDF] mt-1" />
//       )}
//     </div>
//     <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
//       {isSyncing
//         ? 'Syncing latest data...'
//         : 'Manage and track your documents & signatures.'}
//     </p>
//   </div>

//   {/* ── Two action buttons ── */}
//   <div className="flex gap-3 shrink-0">
//     <Link to="/DocumentEditor?id=new">
//       <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white
//                          rounded-xl gap-2 shadow-lg px-5 py-5
//                          transition-all active:scale-95 font-semibold">
//         <Plus className="w-4 h-4" /> New Document
//       </Button>
//     </Link>
//     <Link to="/new-template">
//       <Button variant="outline"
//               className="rounded-xl gap-2 px-5 py-5 font-semibold
//                          border-[#28ABDF] text-[#28ABDF]
//                          hover:bg-[#28ABDF] hover:text-white
//                          transition-all active:scale-95">
//         <Layout className="w-4 h-4" /> New Template
//       </Button>
//     </Link>
//   </div>
// </div>

//       {/* ── Stats ──────────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Docs"  value={stats.total}      icon={FileText}    color="sky"    />
//         <StatsCard label="Active"       value={stats.inProgress} icon={Send}        color="amber"  />
//         <StatsCard label="Completed"    value={stats.completed}  icon={CheckCircle2} color="green"  />
//         <StatsCard label="Templates"    value={stats.templates}  icon={Layout}      color="violet" />
//       </div>

//       {/* ── Filters ────────────────────────────────────────────────────── */}
//       <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
//         <div className="relative flex-1 w-full sm:max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
//           <Input
//             placeholder="Search documents..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 focus:border-[#28ABDF] focus:ring-[#28ABDF] h-10"
//           />
//         </div>
//         <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v)} className="w-full sm:w-auto">
//           <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-full sm:w-auto grid grid-cols-4 sm:flex">
//             <TabsTrigger value="all"         className="text-xs font-semibold">All</TabsTrigger>
//             <TabsTrigger value="templates"   className="text-xs font-semibold">Templates</TabsTrigger>
//             <TabsTrigger value="in_progress" className="text-xs font-semibold">Active</TabsTrigger>
//             <TabsTrigger value="completed"   className="text-xs font-semibold">Done</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       {/* ── Document Grid ──────────────────────────────────────────────── */}
//       {isLoading ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <Skeleton key={i} className="h-56 rounded-2xl" />
//           ))}
//         </div>
//       ) : fetchError ? (
//         <div className="text-center py-16 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-dashed border-red-200">
//           <p className="text-red-500 font-medium mb-3">{fetchError}</p>
//           <Button variant="outline" onClick={() => fetchDocuments(1, false)} className="rounded-xl">
//             Try Again
//           </Button>
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
//           <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
//           <p className="text-slate-500 font-medium mb-1">No documents found</p>
//           <p className="text-slate-400 text-sm">
//             {search || statusFilter !== 'all'
//               ? 'Try adjusting your search or filter.'
//               : 'Create your first document to get started.'}
//           </p>
//           {!search && statusFilter === 'all' && (
//             <Link to="/DocumentEditor?id=new" className="mt-4 inline-block">
//               <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl mt-4 gap-2">
//                 <Plus className="w-4 h-4" /> Create Document
//               </Button>
//             </Link>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filtered.map(doc => (
//               <DocumentCard key={doc._id} doc={doc} />
//             ))}
//           </div> */}
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
//   {filtered.map(doc => (
//     <DocumentCard key={doc._id} doc={doc} />
//   ))}
// </div>

//           {/* Load More */}
//           {hasMore && (
//             <div className="flex justify-center mt-10">
//               <Button
//                 variant="outline"
//                 onClick={handleLoadMore}
//                 disabled={isFetchingMore}
//                 className="rounded-full border-[#28ABDF] text-[#28ABDF] hover:bg-[#28ABDF] hover:text-white px-8 h-11 font-semibold transition-all"
//               >
//                 {isFetchingMore
//                   ? <Loader2 className="animate-spin mr-2 w-4 h-4" />
//                   : <ChevronDown className="mr-2 w-4 h-4" />
//                 }
//                 Load More
//               </Button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
// ════════════════════════════════════════════════════════════════
// FILE 1: src/pages/Dashboard.jsx
// ════════════════════════════════════════════════════════════════
/**
 * Dashboard.jsx — NeXsign Enterprise
 * Optimized: AbortController, silent 15s refresh, no localStorage, fast stats
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Search, FileText, CheckCircle2,
  Send, Loader2, ChevronDown, Layout, RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/dashboard/StatsCard';
import DocumentCard from '@/components/dashboard/DocumentCard';
import SEO from '@/components/seo/SEO';

const LIMIT = 9;

export default function Dashboard() {
  const navigate             = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [documents, setDocuments]         = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isSyncing, setIsSyncing]         = useState(false);
  const [page, setPage]                   = useState(1);
  const [hasMore, setHasMore]             = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [fetchError, setFetchError]       = useState(null);
  const abortRef                          = useRef(null);

  const fetchDocuments = useCallback(async (pageNum = 1, append = false, silent = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      if (!append && !silent) setIsLoading(true);
      if (silent)             setIsSyncing(true);
      if (append)             setIsFetchingMore(true);
      setFetchError(null);

      const res = await api.get('/documents', {
        params: { page: pageNum, limit: LIMIT },
        signal: abortRef.current.signal,
      });

      const rawData        = res.data?.documents || [];
      const serverHasMore  = !!res.data?.hasMore;

      setDocuments(prev => {
        if (!append) return rawData;
        const ids = new Set(prev.map(d => d._id));
        return [...prev, ...rawData.filter(d => !ids.has(d._id))];
      });
      setHasMore(serverHasMore);
      setPage(pageNum);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setFetchError('Failed to load. Click Refresh to retry.');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin)    { navigate('/admin', { replace: true }); return; }
    fetchDocuments(1, false, false);
    const interval = setInterval(() => fetchDocuments(1, false, true), 15000);
    return () => { abortRef.current?.abort(); clearInterval(interval); };
  }, [isAdmin, authLoading, navigate, fetchDocuments]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) fetchDocuments(page + 1, true, false);
  };

  const stats = useMemo(() => ({
    total:      documents.filter(d => !d.isTemplate).length,
    inProgress: documents.filter(d => (d.status === 'in_progress' || d.status === 'processing') && !d.isTemplate).length,
    completed:  documents.filter(d => d.status === 'completed' && !d.isTemplate).length,
    templates:  documents.filter(d => d.isTemplate).length,
  }), [documents]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return documents.filter(doc => {
      const titleOk  = !q || (doc.title || '').toLowerCase().includes(q);
      if (statusFilter === 'templates') return titleOk && doc.isTemplate;
      const statusOk = statusFilter === 'all' || doc.status === statusFilter;
      return titleOk && statusOk && !doc.isTemplate;
    });
  }, [documents, search, statusFilter]);

  if (authLoading || isAdmin) return null;

  return (
    <>
      <SEO
        title={`My Documents — NeXsign Dashboard`}
        description="Manage and track all your signature requests."
        noIndex
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'there'} 👋
              </h1>
              {isSyncing && <RefreshCw className="w-4 h-4 animate-spin text-[#28ABDF]" />}
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              {isSyncing ? 'Syncing…' : 'Manage and track your documents & signatures.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/DocumentEditor?id=new">
              <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl gap-2 shadow-md px-5 py-5 font-semibold active:scale-95 transition-all">
                <Plus className="w-5 h-5" /> New Document
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Total Docs"  value={stats.total}      icon={FileText}     color="sky"    />
          <StatsCard label="Active"       value={stats.inProgress} icon={Send}         color="amber"  />
          <StatsCard label="Completed"    value={stats.completed}  icon={CheckCircle2} color="green"  />
          <StatsCard label="Templates"    value={stats.templates}  icon={Layout}       color="violet" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search documents…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 h-10"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
            <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-full sm:w-auto grid grid-cols-4 sm:flex">
              <TabsTrigger value="all"         className="text-xs font-semibold rounded-lg">All</TabsTrigger>
              <TabsTrigger value="templates"   className="text-xs font-semibold rounded-lg">Templates</TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs font-semibold rounded-lg">Active</TabsTrigger>
              <TabsTrigger value="completed"   className="text-xs font-semibold rounded-lg">Done</TabsTrigger>
            </TabsList>
          </Tabs>
          {fetchError && (
            <Button variant="outline" size="sm" onClick={() => fetchDocuments(1, false, false)}
              className="rounded-xl text-xs gap-1.5 flex-shrink-0">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </Button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        ) : fetchError ? (
          <div className="text-center py-14 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-dashed border-red-200">
            <p className="text-red-500 font-medium mb-3 text-sm">{fetchError}</p>
            <Button variant="outline" onClick={() => fetchDocuments(1, false, false)} className="rounded-xl gap-1.5 text-sm">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium mb-1">No documents found</p>
            <p className="text-slate-400 text-sm mb-5">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first document to get started.'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link to="/DocumentEditor?id=new">
                <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl gap-2">
                  <Plus className="w-4 h-4" /> Create Document
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
              {filtered.map(doc => <DocumentCard key={doc._id} doc={doc} />)}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button variant="outline" onClick={handleLoadMore} disabled={isFetchingMore}
                  className="rounded-full border-[#28ABDF] text-[#28ABDF] hover:bg-[#28ABDF] hover:text-white px-8 h-11 font-semibold transition-all gap-2">
                  {isFetchingMore
                    ? <><Loader2 className="animate-spin w-4 h-4" />Loading...</>
                    : <><ChevronDown className="w-4 h-4" />Load More</>
                  }
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}