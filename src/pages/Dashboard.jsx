
// import React, { useState, useEffect } from 'react';
// import {useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Plus, Search, FileText, Clock, CheckCircle2, Send} from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import StatsCard from '../components/dashboard/StatsCard';
// import DocumentCard from '../components/dashboard/DocumentCard';
// import { useAuth } from '@/lib/AuthContext';
// //import { toast } from 'sonner';

// export default function Dashboard() {

// const navigate = useNavigate();
// const { user, isAdmin, loading: authLoading } = useAuth();
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [documents, setDocuments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // useEffect(() => {
//   //   fetchDocuments();
//   // }, []);

// useEffect(() => {
//     if (!authLoading && !isAdmin) {
//       fetchDocuments();
//     }
//     // 🌟 অ্যাডমিন হলে অটোমেটিক এডমিন প্যানেলে পাঠিয়ে দাও
//     if (!authLoading && isAdmin) {
//       navigate('/admin', { replace: true });
//     }
//   }, [isAdmin, authLoading, navigate]);

// if (authLoading || isAdmin) return null;

//   const fetchDocuments = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await api.get('/documents');
      
//       // 🌟 FORCE SORT LOGIC: 
//       // আমরা updatedAt এবং createdAt দুইটাই চেক করছি যাতে পুরাতন ফাইলও সর্ট হয়।
//       const sortedDocs = res.data.sort((a, b) => {
//         const dateA = new Date(a.updatedAt || a.createdAt || 0);
//         const dateB = new Date(b.updatedAt || b.createdAt || 0);
//         return dateB - dateA; 
//       });

//       setDocuments(sortedDocs);
//     } catch (err) {
//       console.error("Dashboard Fetch Error:", err);
//       setError("ডকুমেন্ট লোড করতে সমস্যা হচ্ছে।");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const stats = {
//     total: documents.length,
//     inProgress: documents.filter(d => d.status === 'in_progress').length,
//     completed: documents.filter(d => d.status === 'completed').length,
//     drafts: documents.filter(d => d.status === 'draft').length,
//   };

//   const filtered = documents.filter(doc => {
//     const matchSearch = !search || doc.title?.toLowerCase().includes(search.toLowerCase());
//     const matchStatus = statusFilter === 'all' || doc.status === statusFilter;
//     return matchSearch && matchStatus;
//   });

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//         <div>
//           {/* <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">NexSign Dashboard</h1> */}

// <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
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
//            className="pl-10 rounded-xl  focus:outline-none " />
//         </div>
//         <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
//           <TabsList className="bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border">
//             <TabsTrigger value="all" className="rounded-lg data-[state=active]:text-sky-600">All</TabsTrigger>
//             <TabsTrigger value="draft" className="rounded-lg  data-[state=active]:text-sky-600">Drafts</TabsTrigger>
//             <TabsTrigger value="in_progress" className="rounded-lg  data-[state=active]:text-sky-600">Active</TabsTrigger>
//             <TabsTrigger value="completed" className="rounded-lg  data-[state=active]:text-sky-600">Done</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       {isLoading ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filtered.map(doc => <DocumentCard key={doc._id} doc={doc} />)}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, FileText, Clock, CheckCircle2, Send, AlertCircle } from 'lucide-react';
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

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/documents');
      
      // 🌟 Enhanced Sorting: Latest first
      const sortedDocs = res.data.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA; 
      });

      setDocuments(sortedDocs);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to load documents. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        fetchDocuments();
      }
    }
  }, [isAdmin, authLoading, navigate, fetchDocuments]);

  // Backend Enum-এর সাথে ম্যাচ করে স্ট্যাটাস ফিল্টারিং
  const stats = {
    total: documents.length,
    // Active মানে 'in_progress', 'sent' অথবা 'signed' (যেগুলো এখনো পুরোপুরি 'completed' হয়নি)
    inProgress: documents.filter(d => ['in_progress', 'sent', 'signed'].includes(d.status)).length,
    completed: documents.filter(d => d.status === 'completed').length,
    drafts: documents.filter(d => d.status === 'draft').length,
  };

  const filtered = documents.filter(doc => {
    const matchSearch = !search || doc.title?.toLowerCase().includes(search.toLowerCase());
    
    let matchStatus = false;
    if (statusFilter === 'all') {
      matchStatus = true;
    } else if (statusFilter === 'in_progress') {
      // ড্যাশবোর্ডে 'Active' সিলেক্ট করলে sent/signed/in_progress সব দেখাবে
      matchStatus = ['in_progress', 'sent', 'signed'].includes(doc.status);
    } else {
      matchStatus = doc.status === statusFilter;
    }
    
    return matchSearch && matchStatus;
  });

  if (authLoading || isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome, {user?.full_name || user?.name || 'User'} 👋
          </h1>
          <p className="text-slate-500 mt-1">Manage all documents and the signing process.</p>
        </div>
        <Link to="/DocumentEditor">
          <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl gap-2 shadow-lg px-6 transition-all active:scale-95">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search documents..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-xl focus:ring-[#28ABDF] border-slate-200" 
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 rounded-xl p-1 border">
            <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
            <TabsTrigger value="draft" className="rounded-lg">Drafts</TabsTrigger>
            <TabsTrigger value="in_progress" className="rounded-lg">Active</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">Done</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-2xl bg-slate-100" />)}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-slate-600 font-medium">{error}</p>
          <Button variant="link" onClick={fetchDocuments} className="text-[#28ABDF]">Try Again</Button>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {filtered.map(doc => <DocumentCard key={doc._id} doc={doc} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
          <FileText className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-500">No documents found.</p>
          {search || statusFilter !== 'all' ? (
            <Button variant="link" onClick={() => { setSearch(''); setStatusFilter('all'); }} className="text-[#28ABDF]">
              Clear filters
            </Button>
          ) : (
            <Link to="/DocumentEditor">
              <Button variant="link" className="text-[#28ABDF]">Create your first document</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}