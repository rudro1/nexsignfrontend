
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Plus, Search, FileText, Clock, CheckCircle2, Send, Loader2, ChevronDown } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import StatsCard from '../components/dashboard/StatsCard';
// import DocumentCard from '../components/dashboard/DocumentCard';
// import { useAuth } from '@/lib/AuthContext';

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const { user, isAdmin, loading: authLoading } = useAuth();
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [documents, setDocuments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Pagination states for faster initial response
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [isFetchingMore, setIsFetchingMore] = useState(false);
//   const LIMIT = 6; 

//   // fetchDocuments with Local Storage Cache & Pagination logic
//   const fetchDocuments = useCallback(async (pageNum = 1, isInitial = false) => {
//     if (isInitial) {
//       // 🌟 ট্রিক: আগের জমানো ডাটা থাকলে সাথে সাথে সেট করে দিন (Instant Load)
//       const cached = localStorage.getItem('nexsign_cache');
//       if (cached) {
//         setDocuments(JSON.parse(cached));
//         setIsLoading(false); // ডাটা থাকলে স্কেলিটন অফ করে দিন
//       } else {
//         setIsLoading(true);
//       }
//     } else {
//       setIsFetchingMore(true);
//     }
    
//     setError(null);
//     try {
//       // Fetching with limit for faster server response
//       const res = await api.get(`/documents?page=${pageNum}&limit=${LIMIT}`);
//       const rawData = Array.isArray(res.data) ? res.data : (res.data.documents || []);
      
//       const newDocs = rawData.sort((a, b) => {
//         const dateA = new Date(a.updatedAt || a.createdAt || 0);
//         const dateB = new Date(b.updatedAt || b.createdAt || 0);
//         return dateB - dateA;
//       });

//       if (isInitial) {
//         setDocuments(newDocs);
//         // 🌟 পরবর্তী সময়ের জন্য প্রথম ৩-৪টি ফাইল ক্যাশ করে রাখুন
//         localStorage.setItem('nexsign_cache', JSON.stringify(newDocs.slice(0, 4)));
//       } else {
//         setDocuments(prev => [...prev, ...newDocs]);
//       }

//       setHasMore(newDocs.length === LIMIT);
//     } catch (err) {
//       console.error("Dashboard Fetch Error:", err);
//       setError("ডকুমেন্ট লোড করতে সমস্যা হচ্ছে।");
//     } finally {
//       setIsLoading(false);
//       setIsFetchingMore(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!authLoading && !isAdmin) {
//       fetchDocuments(1, true);
//     }
//     if (!authLoading && isAdmin) {
//       navigate('/admin', { replace: true });
//     }
//   }, [isAdmin, authLoading, navigate, fetchDocuments]);

//   const handleLoadMore = () => {
//     const nextPage = page + 1;
//     setPage(nextPage);
//     fetchDocuments(nextPage, false);
//   };

//   const stats = useMemo(() => ({
//     total: documents.length,
//     inProgress: documents.filter(d => d.status === 'in_progress').length,
//     completed: documents.filter(d => d.status === 'completed').length,
//     drafts: documents.filter(d => d.status === 'draft').length,
//   }), [documents]);

//   const filtered = useMemo(() => {
//     return documents.filter(doc => {
//       const matchSearch = !search || doc.title?.toLowerCase().includes(search.toLowerCase());
//       const matchStatus = statusFilter === 'all' || doc.status === statusFilter;
//       return matchSearch && matchStatus;
//     });
//   }, [documents, search, statusFilter]);

//   if (authLoading || isAdmin) return null;

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
//             Welcome, {user?.full_name || 'User'} 👋
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all documents and the signing process.</p>
//         </div>
//         <Link to="/DocumentEditor">
//           <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 shadow-lg px-6">
//             <Plus className="w-4 h-4" /> New Document
//           </Button>
//         </Link>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Docs" value={stats.total} icon={FileText} color="sky" />
//         <StatsCard label="Active" value={stats.inProgress} icon={Send} color="amber" />
//         <StatsCard label="Done" value={stats.completed} icon={CheckCircle2} color="green" />
//         <StatsCard label="Drafts" value={stats.drafts} icon={Clock} color="violet" />
//       </div>

//       <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
//         <div className="relative flex-1 w-full sm:max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 " />
//           <Input placeholder="Search by title…" value={search} onChange={e => setSearch(e.target.value)}
//            className="pl-10 rounded-xl focus:outline-none " />
//         </div>
//         <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
//           <TabsList className="bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border">
//             <TabsTrigger value="all" className="rounded-lg data-[state=active]:text-sky-600">All</TabsTrigger>
//             <TabsTrigger value="draft" className="rounded-lg data-[state=active]:text-sky-600">Drafts</TabsTrigger>
//             <TabsTrigger value="in_progress" className="rounded-lg data-[state=active]:text-sky-600">Active</TabsTrigger>
//             <TabsTrigger value="completed" className="rounded-lg data-[state=active]:text-sky-600">Done</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       {isLoading && documents.length === 0 ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
//         </div>
//       ) : (
//         <>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filtered.map(doc => <DocumentCard key={doc._id} doc={doc} />)}
//           </div>

//           {hasMore && documents.length >= LIMIT && (
//             <div className="flex justify-center mt-10 mb-6">
//               <Button 
//                 variant="outline" 
//                 onClick={handleLoadMore} 
//                 disabled={isFetchingMore}
//                 className="rounded-full border-sky-200 text-sky-600 hover:bg-sky-50 px-8"
//               >
//                 {isFetchingMore ? (
//                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                 ) : (
//                   <ChevronDown className="w-4 h-4 mr-2" />
//                 )}
//                 {isFetchingMore ? 'Loading...' : 'Show More'}
//               </Button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Plus, Search, FileText, CheckCircle2, Send, Loader2, ChevronDown, Layout } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import StatsCard from '../components/dashboard/StatsCard';
// import DocumentCard from '../components/dashboard/DocumentCard';
// import { useAuth } from '@/lib/AuthContext';

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const { user, isAdmin, loading: authLoading } = useAuth();
  
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [documents, setDocuments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(false);
//   const [isFetchingMore, setIsFetchingMore] = useState(false);
  
//   const LIMIT = 6; 

//   const fetchDocuments = useCallback(async (pageNum = 1, isInitial = false) => {
//     try {
//       if (isInitial) {
//         setIsLoading(true);
//         // ক্যাশ থেকে ডাটা লোড করা (Optional কিন্তু ভালো UX দেয়)
//         const cached = localStorage.getItem('nexsign_cache');
//         if (cached) setDocuments(JSON.parse(cached));
//       } else {
//         setIsFetchingMore(true);
//       }
      
//       const res = await api.get(`/documents`, {
//         params: { page: pageNum, limit: LIMIT }
//       });

//       // ফিক্স: ব্যাকএন্ড থেকে আসা ডাটা স্ট্রাকচার চেক করা
//       const rawData = res.data.documents || [];
//       const serverHasMore = res.data.hasMore;
      
//       if (isInitial) {
//         setDocuments(rawData);
//         // প্রথম ৪টি ফাইল ক্যাশ করে রাখা
//         localStorage.setItem('nexsign_cache', JSON.stringify(rawData.slice(0, 4)));
//       } else {
//         setDocuments(prev => {
//           const existingIds = new Set(prev.map(d => d._id));
//           const uniqueNewDocs = rawData.filter(d => !existingIds.has(d._id));
//           return [...prev, ...uniqueNewDocs];
//         });
//       }
//       setHasMore(serverHasMore);
//     } catch (err) {
//       console.error("Dashboard Fetch Error:", err);
//     } finally {
//       setIsLoading(false);
//       setIsFetchingMore(false);
//     }
//   }, []);

//   // ইউজার অথেন্টিকেশন চেক এবং প্রথমবার ডাটা লোড
//   useEffect(() => {
//     if (!authLoading) {
//       if (isAdmin) {
//         navigate('/admin', { replace: true });
//       } else {
//         fetchDocuments(1, true);
//       }
//     }
//   }, [isAdmin, authLoading, navigate, fetchDocuments]);

//   // ফিক্স: লোড মোর ফাংশন
//   const handleLoadMore = () => {
//     const nextPage = page + 1;
//     setPage(nextPage); // স্টেট আপডেট
//     fetchDocuments(nextPage, false); // সরাসরি পরবর্তী পেজ কল করা
//   };

//   // স্ট্যাটাস পরিসংখ্যান
//   const stats = useMemo(() => ({
//     total: documents.filter(d => !d.isTemplate).length,
//     inProgress: documents.filter(d => d.status === 'in_progress' && !d.isTemplate).length,
//     completed: documents.filter(d => d.status === 'completed' && !d.isTemplate).length,
//     templates: documents.filter(d => d.isTemplate === true).length,
//   }), [documents]);

//   // ফিল্টারিং লজিক
//   const filtered = useMemo(() => {
//     return documents.filter(doc => {
//       const titleMatch = (doc.title || '').toLowerCase().includes(search.toLowerCase());
      
//       if (statusFilter === 'templates') {
//         return titleMatch && doc.isTemplate === true;
//       }
      
//       const statusMatch = statusFilter === 'all' || doc.status === statusFilter;
//       // ড্যাশবোর্ডে আমরা টেমপ্লেট ছাড়া বাকি ফাইল দেখাব যদি না টেমপ্লেট ট্যাব সিলেক্ট করা হয়
//       return titleMatch && statusMatch && !doc.isTemplate;
//     });
//   }, [documents, search, statusFilter]);

//   if (authLoading || isAdmin) return null;

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
//             Welcome, {user?.full_name?.split(' ')[0] || 'User'} 👋
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your documents and signatures.</p>
//         </div>
//         <Link to="/DocumentEditor?id=new">
//           <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl gap-2 shadow-lg px-6 py-6 transition-all active:scale-95">
//             <Plus className="w-5 h-5" /> New Document
//           </Button>
//         </Link>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Docs" value={stats.total} icon={FileText} color="sky" />
//         <StatsCard label="Active" value={stats.inProgress} icon={Send} color="amber" />
//         <StatsCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
//         <StatsCard label="Templates" value={stats.templates} icon={Layout} color="violet" />
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
//         <div className="relative flex-1 w-full sm:max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <Input 
//             placeholder="Search documents..." 
//             value={search} 
//             onChange={e => setSearch(e.target.value)} 
//             className="pl-10 rounded-xl border-slate-200 focus:border-[#28ABDF] focus:ring-[#28ABDF]" 
//           />
//         </div>
//         <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
//           <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
//             <TabsTrigger value="all">All</TabsTrigger>
//             <TabsTrigger value="templates">Templates</TabsTrigger>
//             <TabsTrigger value="in_progress">Active</TabsTrigger>
//             <TabsTrigger value="completed">Done</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       {/* Documents Grid */}
//       {isLoading && documents.length === 0 ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
//           <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
//           <p className="text-slate-500">No documents found matching your criteria.</p>
//         </div>
//       ) : (
//         <>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filtered.map(doc => (
//               <DocumentCard key={doc._id} doc={doc} />
//             ))}
//           </div>
          
//           {/* Pagination Button */}
//           {hasMore && (
//             <div className="flex justify-center mt-12">
//               <Button 
//                 variant="outline" 
//                 onClick={handleLoadMore} 
//                 disabled={isFetchingMore} 
//                 className="rounded-full border-[#28ABDF] text-[#28ABDF] hover:bg-[#28ABDF] hover:text-white px-8 transition-all"
//               >
//                 {isFetchingMore ? (
//                   <Loader2 className="animate-spin mr-2 w-4 h-4" />
//                 ) : (
//                   <ChevronDown className="mr-2 w-4 h-4" />
//                 )}
//                 Load More Documents
//               </Button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, FileText, CheckCircle2, Send, Loader2, ChevronDown, Layout } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/dashboard/StatsCard';
import DocumentCard from '@/components/dashboard/DocumentCard';
import { useAuth } from '@/lib/AuthContext';

const LIMIT = 6; // 3-column grid looks best with multiples of 3

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documents, setDocuments]     = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [fetchError, setFetchError]   = useState(null);

  // ✅ FIX: use AbortController to cancel in-flight requests on unmount
  const abortRef = useRef(null);

  // const fetchDocuments = useCallback(async (pageNum = 1, append = false) => {
  //   // Cancel previous request if still running
  //   abortRef.current?.abort();
  //   abortRef.current = new AbortController();

  //   try {
  //     if (!append) setIsLoading(true);
  //     else setIsFetchingMore(true);
  //     setFetchError(null);

  //     const res = await api.get('/documents', {
  //       params: { page: pageNum, limit: LIMIT },
  //       signal: abortRef.current.signal,
  //     });

  //     const rawData      = res.data?.documents || [];
  //     const serverHasMore = !!res.data?.hasMore;

  //     if (append) {
  //       setDocuments(prev => {
  //         const existingIds = new Set(prev.map(d => d._id));
  //         return [...prev, ...rawData.filter(d => !existingIds.has(d._id))];
  //       });
  //     } else {
  //       setDocuments(rawData);
  //     }
  //     setHasMore(serverHasMore);
  //     setPage(pageNum);
  //   } catch (err) {
  //     if (err.name === 'CanceledError' || err.name === 'AbortError') return;
  //     console.error('Dashboard fetch error:', err);
  //     setFetchError('Failed to load documents. Please refresh.');
  //   } finally {
  //     setIsLoading(false);
  //     setIsFetchingMore(false);
  //   }
  // }, []);

  // ✅ FIX: redirect admin, fetch on mount — no localStorage cache
 
 const fetchDocuments = useCallback(async (pageNum = 1, append = false, silent = false) => {
  abortRef.current?.abort();
  abortRef.current = new AbortController();

  try {
    // শুধুমাত্র প্রথমবার বা পেজ লোডের সময় মেইন লোডার দেখাবে
    if (!append && !silent) setIsLoading(true);
    if (silent) setIsSyncing(true);
    if (append) setIsFetchingMore(true);
    setFetchError(null);

    const res = await api.get('/documents', {
      params: { 
        page: pageNum, 
        limit: LIMIT,
        select: 'title status createdAt isTemplate parties.status parties.name fileUrl' 
      },
      signal: abortRef.current.signal,
    });

    const rawData = res.data?.documents || [];
    const serverHasMore = !!res.data?.hasMore;

    if (append) {
      setDocuments(prev => {
        const existingIds = new Set(prev.map(d => d._id));
        return [...prev, ...rawData.filter(d => !existingIds.has(d._id))];
      });
    } else {
      // সাইলেন্ট আপডেট হলে ডাটা রিপ্লেস হবে কিন্তু ইউজার টের পাবে না
      setDocuments(rawData);
    }
    setHasMore(serverHasMore);
    setPage(pageNum);
  } catch (err) {
    if (err.name === 'CanceledError' || err.name === 'AbortError') return;
    setFetchError('Failed to load. Click to retry.');
  } finally {
    setIsLoading(false);
    setIsFetchingMore(false);
    setIsSyncing(false);
  }
}, []);
 
useEffect(() => {
  if (authLoading) return;
  if (isAdmin) {
    navigate('/admin', { replace: true });
    return;
  }

  // প্রথমবার ডাটা আনা
  fetchDocuments(1, false);

  // অটো-রিফ্রেশ লজিক (রিলোড ছাড়া আপডেট)
  const interval = setInterval(() => {
    fetchDocuments(1, false, true); 
  }, 15000); 

  return () => {
    abortRef.current?.abort();
    clearInterval(interval);
  };
}, [isAdmin, authLoading, navigate, fetchDocuments]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) fetchDocuments(page + 1, true);
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      documents.filter(d => !d.isTemplate).length,
    inProgress: documents.filter(d => d.status === 'in_progress' && !d.isTemplate).length,
    completed:  documents.filter(d => d.status === 'completed'   && !d.isTemplate).length,
    templates:  documents.filter(d => d.isTemplate === true).length,
  }), [documents]);

  // ── Client-side filter (fast — no extra API call) ──────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return documents.filter(doc => {
      const titleMatch = !q || (doc.title || '').toLowerCase().includes(q);
      if (statusFilter === 'templates') return titleMatch && doc.isTemplate === true;
      const statusMatch = statusFilter === 'all' || doc.status === statusFilter;
      return titleMatch && statusMatch && !doc.isTemplate;
    });
  }, [documents, search, statusFilter]);

  // Don't render while checking auth / redirecting admin
  if (authLoading || isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage and track your documents &amp; signatures.
          </p>
          
        </div> */}


        <div>
  <div className="flex items-center gap-2">
    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
      Welcome back, {user?.full_name?.split(' ')[0] || 'there'} 👋
    </h1>
    {/* সাইলেন্ট আপডেট হওয়ার সময় এই আইকনটি ঘুরবে */}
    {isSyncing && <Loader2 className="w-5 h-5 animate-spin text-[#28ABDF] mt-1" />}
  </div>
  <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
    {isSyncing ? "Syncing latest data..." : "Manage and track your documents & signatures."}
  </p>
</div>
        <Link to="/DocumentEditor?id=new">
          <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl gap-2 shadow-lg px-6 py-5 transition-all active:scale-95 font-semibold">
            <Plus className="w-5 h-5" /> New Document
          </Button>
        </Link>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Docs"  value={stats.total}      icon={FileText}    color="sky"    />
        <StatsCard label="Active"       value={stats.inProgress} icon={Send}        color="amber"  />
        <StatsCard label="Completed"    value={stats.completed}  icon={CheckCircle2} color="green"  />
        <StatsCard label="Templates"    value={stats.templates}  icon={Layout}      color="violet" />
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 focus:border-[#28ABDF] focus:ring-[#28ABDF] h-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v)} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-full sm:w-auto grid grid-cols-4 sm:flex">
            <TabsTrigger value="all"         className="text-xs font-semibold">All</TabsTrigger>
            <TabsTrigger value="templates"   className="text-xs font-semibold">Templates</TabsTrigger>
            <TabsTrigger value="in_progress" className="text-xs font-semibold">Active</TabsTrigger>
            <TabsTrigger value="completed"   className="text-xs font-semibold">Done</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ── Document Grid ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : fetchError ? (
        <div className="text-center py-16 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-dashed border-red-200">
          <p className="text-red-500 font-medium mb-3">{fetchError}</p>
          <Button variant="outline" onClick={() => fetchDocuments(1, false)} className="rounded-xl">
            Try Again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium mb-1">No documents found</p>
          <p className="text-slate-400 text-sm">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Create your first document to get started.'}
          </p>
          {!search && statusFilter === 'all' && (
            <Link to="/DocumentEditor?id=new" className="mt-4 inline-block">
              <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl mt-4 gap-2">
                <Plus className="w-4 h-4" /> Create Document
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(doc => (
              <DocumentCard key={doc._id} doc={doc} />
            ))}
          </div> */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
  {filtered.map(doc => (
    <DocumentCard key={doc._id} doc={doc} />
  ))}
</div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-10">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isFetchingMore}
                className="rounded-full border-[#28ABDF] text-[#28ABDF] hover:bg-[#28ABDF] hover:text-white px-8 h-11 font-semibold transition-all"
              >
                {isFetchingMore
                  ? <Loader2 className="animate-spin mr-2 w-4 h-4" />
                  : <ChevronDown className="mr-2 w-4 h-4" />
                }
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}