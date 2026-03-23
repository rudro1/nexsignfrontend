
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, FileText, Clock, CheckCircle2, Send } from 'lucide-react';
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

  // ১. ডেটা ফেচিং ফাংশন (useCallback দিয়ে অপ্টিমাইজড)
  const fetchDocuments = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/documents');
      
      const sortedDocs = res.data.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA; 
      });

      setDocuments(sortedDocs);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("ডকুমেন্ট লোড করতে সমস্যা হচ্ছে।");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ২. অটো-রিফ্রেশ লজিক (Polling: প্রতি ৫ সেকেন্ডে আপডেট হবে)
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      fetchDocuments(true); // প্রথমবার লোডার দেখাবে

      const interval = setInterval(() => {
        fetchDocuments(false); // পরের বারগুলো ব্যাকগ্রাউন্ডে আপডেট হবে (UI কাঁপবে না)
      }, 5000); 

      return () => clearInterval(interval); // পেজ থেকে চলে গেলে বন্ধ হবে
    }

    if (!authLoading && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, authLoading, navigate, fetchDocuments]);

  // ৩. মেমোইজড স্ট্যাটাস ক্যালকুলেশন (পারফরম্যান্স ফিক্স)
  const stats = useMemo(() => ({
    total: documents.length,
    inProgress: documents.filter(d => d.status === 'in_progress').length,
    completed: documents.filter(d => d.status === 'completed').length,
    drafts: documents.filter(d => d.status === 'draft').length,
  }), [documents]);

  // ৪. মেমোইজড ফিল্টার লজিক
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
           className="pl-10 rounded-xl focus:!ring-0 " />
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(doc => <DocumentCard key={doc._id} doc={doc} />)}
        </div>
      )}
    </div>
  );
}