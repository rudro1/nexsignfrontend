
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, FileText, Clock, CheckCircle2, Send, Loader2, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '../components/dashboard/StatsCard';
import DocumentCard from '../components/dashboard/DocumentCard';
import { useAuth } from '@/lib/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states for faster initial response
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const LIMIT = 6; 

  // fetchDocuments with Local Storage Cache & Pagination logic
  const fetchDocuments = useCallback(async (pageNum = 1, isInitial = false) => {
    if (isInitial) {
      // 🌟 ট্রিক: আগের জমানো ডাটা থাকলে সাথে সাথে সেট করে দিন (Instant Load)
      const cached = localStorage.getItem('nexsign_cache');
      if (cached) {
        setDocuments(JSON.parse(cached));
        setIsLoading(false); // ডাটা থাকলে স্কেলিটন অফ করে দিন
      } else {
        setIsLoading(true);
      }
    } else {
      setIsFetchingMore(true);
    }
    
    setError(null);
    try {
      // Fetching with limit for faster server response
      const res = await api.get(`/documents?page=${pageNum}&limit=${LIMIT}`);
      const rawData = Array.isArray(res.data) ? res.data : (res.data.documents || []);
      
      const newDocs = rawData.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });

      if (isInitial) {
        setDocuments(newDocs);
        // 🌟 পরবর্তী সময়ের জন্য প্রথম ৩-৪টি ফাইল ক্যাশ করে রাখুন
        localStorage.setItem('nexsign_cache', JSON.stringify(newDocs.slice(0, 4)));
      } else {
        setDocuments(prev => [...prev, ...newDocs]);
      }

      setHasMore(newDocs.length === LIMIT);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("ডকুমেন্ট লোড করতে সমস্যা হচ্ছে।");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      fetchDocuments(1, true);
    }
    if (!authLoading && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, authLoading, navigate, fetchDocuments]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDocuments(nextPage, false);
  };

  const stats = useMemo(() => ({
    total: documents.length,
    inProgress: documents.filter(d => d.status === 'in_progress').length,
    completed: documents.filter(d => d.status === 'completed').length,
    drafts: documents.filter(d => d.status === 'draft').length,
  }), [documents]);

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = !search || doc.title?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [documents, search, statusFilter]);

  if (authLoading || isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome, {user?.full_name || 'User'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all documents and the signing process.</p>
        </div>
        <Link to="/DocumentEditor">
          <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 shadow-lg px-6">
            <Plus className="w-4 h-4" /> New Document
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Docs" value={stats.total} icon={FileText} color="sky" />
        <StatsCard label="Active" value={stats.inProgress} icon={Send} color="amber" />
        <StatsCard label="Done" value={stats.completed} icon={CheckCircle2} color="green" />
        <StatsCard label="Drafts" value={stats.drafts} icon={Clock} color="violet" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 " />
          <Input placeholder="Search by title…" value={search} onChange={e => setSearch(e.target.value)}
           className="pl-10 rounded-xl focus:outline-none " />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:text-sky-600">All</TabsTrigger>
            <TabsTrigger value="draft" className="rounded-lg data-[state=active]:text-sky-600">Drafts</TabsTrigger>
            <TabsTrigger value="in_progress" className="rounded-lg data-[state=active]:text-sky-600">Active</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:text-sky-600">Done</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading && documents.length === 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(doc => <DocumentCard key={doc._id} doc={doc} />)}
          </div>

          {hasMore && documents.length >= LIMIT && (
            <div className="flex justify-center mt-10 mb-6">
              <Button 
                variant="outline" 
                onClick={handleLoadMore} 
                disabled={isFetchingMore}
                className="rounded-full border-sky-200 text-sky-600 hover:bg-sky-50 px-8"
              >
                {isFetchingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-2" />
                )}
                {isFetchingMore ? 'Loading...' : 'Show More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
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

//   // 🌟 ফাস্ট লোডিংয়ের জন্য প্যাগিনেশন স্টেট
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [isFetchingMore, setIsFetchingMore] = useState(false);
//   const LIMIT = 6; 

//   // ১. ডেটা ফেচিং ফাংশন (Limit & Page প্যারামিটার সহ)
//   const fetchDocuments = useCallback(async (pageNum = 1, isInitial = false) => {
//     if (isInitial) setIsLoading(true);
//     else setIsFetchingMore(true);
    
//     setError(null);
//     try {
//       // সার্ভার থেকে অল্প অল্প করে ডেটা আনা হচ্ছে
//       const res = await api.get(`/documents?page=${pageNum}&limit=${LIMIT}`);
//       const newDocs = Array.isArray(res.data) ? res.data : (res.data.documents || []);
      
//       if (isInitial) {
//         setDocuments(newDocs);
//       } else {
//         setDocuments(prev => [...prev, ...newDocs]);
//       }

//       // যদি লিমিটের চেয়ে কম ডেটা আসে, তারমানে আর ডেটা নেই
//       if (newDocs.length < LIMIT) setHasMore(false);
//       else setHasMore(true);

//     } catch (err) {
//       console.error("Dashboard Fetch Error:", err);
//       setError("ডকুমেন্ট লোড করতে সমস্যা হচ্ছে।");
//     } finally {
//       setIsLoading(false);
//       setIsFetchingMore(false);
//     }
//   }, []);

//   // ২. ইনিশিয়াল লোড লজিক (৫ সেকেন্ড পোলিং সরানো হয়েছে পারফরম্যান্সের জন্য)
//   useEffect(() => {
//     if (!authLoading && !isAdmin) {
//       fetchDocuments(1, true);
//     }

//     if (!authLoading && isAdmin) {
//       navigate('/admin', { replace: true });
//     }
//   }, [isAdmin, authLoading, navigate, fetchDocuments]);

//   // ৩. লোড মোর হ্যান্ডলার
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
//            className="pl-10 rounded-xl focus:!ring-0 " />
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
//           {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
//         </div>
//       ) : (
//         <>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filtered.map(doc => <DocumentCard key={doc._id} doc={doc} />)}
//           </div>

//           {/* 🌟 লোড মোর সেকশন (শুধুমাত্র যখন আরও ডাটা থাকবে) */}
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