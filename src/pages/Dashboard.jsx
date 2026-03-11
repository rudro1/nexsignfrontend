// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
// import { base44 } from '@/api/base44Client';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Plus, Search, FileText, Clock, CheckCircle2, Send } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import StatsCard from '../components/dashboard/StatsCard';
// import DocumentCard from '../components/dashboard/DocumentCard';

// export default function Dashboard() {
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const loadUser = async () => {
//       const authed = await base44.auth.isAuthenticated();
//       if (!authed) {
//         base44.auth.redirectToLogin(createPageUrl('Dashboard'));
//         return;
//       }
//       const u = await base44.auth.me();
//       setUser(u);
//     };
//     loadUser();
//   }, []);

//   const { data: documents = [], isLoading } = useQuery({
//     queryKey: ['documents'],
//     queryFn: () => base44.entities.Document.list('-created_date', 100),
//     enabled: !!user,
//   });

//   const stats = {
//     total: documents.length,
//     inProgress: documents.filter(d => d.status === 'in_progress').length,
//     completed: documents.filter(d => d.status === 'completed').length,
//     pending: documents.filter(d => d.status === 'pending' || d.status === 'draft').length,
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
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
//             Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your documents and signing workflows</p>
//         </div>
//         <Link to={createPageUrl('DocumentEditor')}>
//           <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 shadow-lg shadow-sky-500/25">
//             <Plus className="w-4 h-4" />
//             New Document
//           </Button>
//         </Link>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Documents" value={stats.total} icon={FileText} color="sky" />
//         <StatsCard label="In Progress" value={stats.inProgress} icon={Send} color="amber" />
//         <StatsCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
//         <StatsCard label="Drafts" value={stats.pending} icon={Clock} color="violet" />
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-6">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <Input
//             placeholder="Search documents..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             className="pl-10 rounded-xl border-slate-200 dark:border-slate-700"
//           />
//         </div>
//         <Tabs value={statusFilter} onValueChange={setStatusFilter}>
//           <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl">
//             <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
//             <TabsTrigger value="draft" className="rounded-lg">Drafts</TabsTrigger>
//             <TabsTrigger value="in_progress" className="rounded-lg">Active</TabsTrigger>
//             <TabsTrigger value="completed" className="rounded-lg">Done</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       {/* Document Grid */}
//       {isLoading ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {Array(6).fill(0).map((_, i) => (
//             <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
//               <Skeleton className="h-10 w-10 rounded-xl mb-4" />
//               <Skeleton className="h-4 w-3/4 mb-2" />
//               <Skeleton className="h-3 w-1/2" />
//             </div>
//           ))}
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-20">
//           <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
//             <FileText className="w-8 h-8 text-slate-400" />
//           </div>
//           <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No documents found</h3>
//           <p className="text-slate-400 mt-1">Create your first document to get started</p>
//           <Link to={createPageUrl('DocumentEditor')}>
//             <Button className="mt-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2">
//               <Plus className="w-4 h-4" />
//               New Document
//             </Button>
//           </Link>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map(doc => (
//             <DocumentCard key={doc.id} doc={doc} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Plus, Search, FileText, Clock, CheckCircle2, Send } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import StatsCard from '../components/dashboard/StatsCard';
// import DocumentCard from '../components/dashboard/DocumentCard';

// export default function Dashboard() {
//   const { user, loading: authLoading } = useAuth() || {};
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [documents, setDocuments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchDocs = async () => {
//       setIsLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch('http://localhost:5001/api/documents/user', {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         const data = await res.json();
//         setDocuments(data);
//       } catch (err) {
//         console.error('Error fetching documents:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDocs();
//   }, []);

//   const stats = {
//     total: documents.length,
//     inProgress: documents.filter(d => d.status === 'in_progress').length,
//     completed: documents.filter(d => d.status === 'completed').length,
//     pending: documents.filter(d => d.status === 'pending' || d.status === 'draft').length,
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
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
//             Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your documents and signing workflows</p>
//         </div>
//         <Link to={createPageUrl('DocumentEditor')}>
//           <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 shadow-lg shadow-sky-500/25">
//             <Plus className="w-4 h-4" />
//             New Document
//           </Button>
//         </Link>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Documents" value={stats.total} icon={FileText} color="sky" />
//         <StatsCard label="In Progress" value={stats.inProgress} icon={Send} color="amber" />
//         <StatsCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
//         <StatsCard label="Drafts" value={stats.pending} icon={Clock} color="violet" />
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-6">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <Input
//             placeholder="Search documents..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-sky-500"
//           />
//         </div>
//         <Tabs value={statusFilter} onValueChange={setStatusFilter}>
//           <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl">
//             <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
//             <TabsTrigger value="draft" className="rounded-lg">Drafts</TabsTrigger>
//             <TabsTrigger value="in_progress" className="rounded-lg">Active</TabsTrigger>
//             <TabsTrigger value="completed" className="rounded-lg">Done</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       {/* Document Grid */}
//       {isLoading ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {Array(6).fill(0).map((_, i) => (
//             <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
//               <Skeleton className="h-10 w-10 rounded-xl mb-4" />
//               <Skeleton className="h-4 w-3/4 mb-2" />
//               <Skeleton className="h-3 w-1/2" />
//             </div>
//           ))}
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-20">
//           <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
//             <FileText className="w-8 h-8 text-slate-400" />
//           </div>
//           <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No documents found</h3>
//           <p className="text-slate-400 mt-1">Create your first document to get started</p>
//           <Link to={createPageUrl('DocumentEditor')}>
//             <Button className="mt-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2">
//               <Plus className="w-4 h-4" />
//               New Document
//             </Button>
//           </Link>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map(doc => (
//             <DocumentCard key={doc._id} doc={doc} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Plus, Search, FileText, Clock, CheckCircle2, Send } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import StatsCard from '../components/dashboard/StatsCard';
// import DocumentCard from '../components/dashboard/DocumentCard';

// export default function Dashboard() {
//   const { user, loading: authLoading } = useAuth() || {};
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [documents, setDocuments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchDocs = async () => {
//       setIsLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const res = await fetch('http://localhost:5001/api/documents/user', {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         const data = await res.json();
        
//         // ✅ Check if data is array
//         if (Array.isArray(data)) {
//           setDocuments(data);
//         } else {
//           console.error("❌ Documents is not an array:", data);
//           setDocuments([]);
//         }
//       } catch (err) {
//         console.error('Error fetching documents:', err);
//         setDocuments([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDocs();
//   }, []);

//   const stats = {
//     total: documents.length,
//     inProgress: documents.filter(d => d.status === 'in_progress').length,
//     completed: documents.filter(d => d.status === 'completed').length,
//     pending: documents.filter(d => d.status === 'pending' || d.status === 'draft').length,
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
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
//             Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your documents and signing workflows</p>
//         </div>
//         <Link to={createPageUrl('DocumentEditor')}>
//           <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 shadow-lg shadow-sky-500/25">
//             <Plus className="w-4 h-4" />
//             New Document
//           </Button>
//         </Link>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Documents" value={stats.total} icon={FileText} color="sky" />
//         <StatsCard label="In Progress" value={stats.inProgress} icon={Send} color="amber" />
//         <StatsCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
//         <StatsCard label="Drafts" value={stats.pending} icon={Clock} color="violet" />
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-6">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <Input
//             placeholder="Search documents..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-sky-500"
//           />
//         </div>
//         <Tabs value={statusFilter} onValueChange={setStatusFilter}>
//           <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl">
//             <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
//             <TabsTrigger value="draft" className="rounded-lg">Drafts</TabsTrigger>
//             <TabsTrigger value="in_progress" className="rounded-lg">Active</TabsTrigger>
//             <TabsTrigger value="completed" className="rounded-lg">Done</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       {/* Document Grid */}
//       {isLoading ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {Array(6).fill(0).map((_, i) => (
//             <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
//               <Skeleton className="h-10 w-10 rounded-xl mb-4" />
//               <Skeleton className="h-4 w-3/4 mb-2" />
//               <Skeleton className="h-3 w-1/2" />
//             </div>
//           ))}
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-20">
//           <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
//             <FileText className="w-8 h-8 text-slate-400" />
//           </div>
//           <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No documents found</h3>
//           <p className="text-slate-400 mt-1">Create your first document to get started</p>
//           <Link to={createPageUrl('DocumentEditor')}>
//             <Button className="mt-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2">
//               <Plus className="w-4 h-4" />
//               New Document
//             </Button>
//           </Link>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map(doc => (
//             <DocumentCard key={doc._id} doc={doc} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
// import { useAuth } from '@/lib/AuthContext'; // আপনার লোকাল অথ
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Plus, Search, FileText, Clock, CheckCircle2, Send } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';

// // নিচের কম্পোনেন্টগুলো যদি আলাদা ফাইলে থাকে তবে সেগুলো ইমপোর্ট ঠিক থাকবে
// // আমি এখানে ডিজাইন কোডগুলো ঠিক করে দিচ্ছি
// import StatsCard from '../components/dashboard/StatsCard';
// import DocumentCard from '../components/dashboard/DocumentCard';

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const { user, loading: authLoading } = useAuth() || {};
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [documents, setDocuments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // ইউজার না থাকলে লগইনে পাঠানো (যদি লগইন পেজ থাকে)
//     if (!authLoading && !user) {
//       // navigate('/login'); 
//     }

//     // ব্যাকএন্ড রেডি না হওয়া পর্যন্ত ডামি ডেটা দিয়ে ইন্টারফেস দেখাচ্ছি
//     const fetchDocs = async () => {
//       setIsLoading(true);
//       try {
//         // ভবিষ্যতে এখানে এপিআই কল হবে: const res = await api.get('/documents');
//         const dummyDocs = [
//           { id: '1', title: 'Partnership Agreement', status: 'completed', created_date: new Date() },
//           { id: '2', title: 'Project Proposal', status: 'in_progress', created_date: new Date() },
//           { id: '3', title: 'NDA Draft', status: 'draft', created_date: new Date() },
//         ];
//         setDocuments(dummyDocs);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDocs();
//   }, [user, authLoading]);

//   const stats = {
//     total: documents.length,
//     inProgress: documents.filter(d => d.status === 'in_progress').length,
//     completed: documents.filter(d => d.status === 'completed').length,
//     pending: documents.filter(d => d.status === 'pending' || d.status === 'draft').length,
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
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
//             Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your documents and signing workflows</p>
//         </div>
//         <Link to={createPageUrl('DocumentEditor')}>
//           <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 shadow-lg shadow-sky-500/25">
//             <Plus className="w-4 h-4" />
//             New Document
//           </Button>
//         </Link>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Documents" value={stats.total} icon={FileText} color="sky" />
//         <StatsCard label="In Progress" value={stats.inProgress} icon={Send} color="amber" />
//         <StatsCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
//         <StatsCard label="Drafts" value={stats.pending} icon={Clock} color="violet" />
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-6">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <Input
//             placeholder="Search documents..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-sky-500"
//           />
//         </div>
//         <Tabs value={statusFilter} onValueChange={setStatusFilter}>
//           <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl">
//             <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
//             <TabsTrigger value="draft" className="rounded-lg">Drafts</TabsTrigger>
//             <TabsTrigger value="in_progress" className="rounded-lg">Active</TabsTrigger>
//             <TabsTrigger value="completed" className="rounded-lg">Done</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       {/* Document Grid */}
//       {isLoading ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {Array(6).fill(0).map((_, i) => (
//             <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
//               <Skeleton className="h-10 w-10 rounded-xl mb-4" />
//               <Skeleton className="h-4 w-3/4 mb-2" />
//               <Skeleton className="h-3 w-1/2" />
//             </div>
//           ))}
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-20">
//           <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
//             <FileText className="w-8 h-8 text-slate-400" />
//           </div>
//           <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No documents found</h3>
//           <p className="text-slate-400 mt-1">Create your first document to get started</p>
//           <Link to={createPageUrl('DocumentEditor')}>
//             <Button className="mt-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2">
//               <Plus className="w-4 h-4" />
//               New Document
//             </Button>
//           </Link>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map(doc => (
//             <DocumentCard key={doc.id} doc={doc} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // এপিআই কলের জন্য
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Plus, Search, FileText, Clock, CheckCircle2, Send } from 'lucide-react';
// import { Skeleton } from '@/components/ui/skeleton';
// import StatsCard from '../components/dashboard/StatsCard';
// import DocumentCard from '../components/dashboard/DocumentCard';

// export default function Dashboard() {
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [documents, setDocuments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // ব্যাকএন্ড থেকে ডাটা ফেচ করা
//   useEffect(() => {
//     const fetchDocs = async () => {
//       setIsLoading(true);
//       try {
//         // আপনার ব্যাকএন্ড পোর্ট যদি ৫০MDE১ হয়
//         const res = await axios.get('http://localhost:5001/api/documents');
//         setDocuments(res.data);
//       } catch (err) {
//         console.error("Dashboard Fetch Error:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchDocs();
//   }, []);

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
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
//             NexSign Dashboard
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your documents and signing workflows</p>
//         </div>
//         <Link to="/DocumentEditor">
//           <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 shadow-lg shadow-sky-500/25">
//             <Plus className="w-4 h-4" /> New Document
//           </Button>
//         </Link>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Docs" value={stats.total} icon={FileText} color="sky" />
//         <StatsCard label="Active" value={stats.inProgress} icon={Send} color="amber" />
//         <StatsCard label="Done" value={stats.completed} icon={CheckCircle2} color="green" />
//         <StatsCard label="Drafts" value={stats.drafts} icon={Clock} color="violet" />
//       </div>

//       {/* Search & Tabs */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-6">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <Input
//             placeholder="Search by title..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             className="pl-10 rounded-xl"
//           />
//         </div>
//         <Tabs value={statusFilter} onValueChange={setStatusFilter}>
//           <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl">
//             <TabsTrigger value="all">All</TabsTrigger>
//             <TabsTrigger value="draft">Drafts</TabsTrigger>
//             <TabsTrigger value="in_progress">Active</TabsTrigger>
//             <TabsTrigger value="completed">Done</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       {/* Document Grid */}
//       {isLoading ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-20 border-2 border-dashed rounded-3xl border-slate-200">
//           <p className="text-slate-400">No documents matching your criteria.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map(doc => <DocumentCard key={doc._id} doc={doc} />)}
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, FileText, Clock, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '../components/dashboard/StatsCard';
import DocumentCard from '../components/dashboard/DocumentCard';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function Dashboard() {

  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/documents');
      
      // 🌟 FORCE SORT LOGIC: 
      // আমরা updatedAt এবং createdAt দুইটাই চেক করছি যাতে পুরাতন ফাইলও সর্ট হয়।
      const sortedDocs = res.data.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA; // লেটেস্ট অ্যাক্টিভিটি সবার আগে
      });

      setDocuments(sortedDocs);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("ডকুমেন্ট লোড করতে সমস্যা হচ্ছে।");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: documents.length,
    inProgress: documents.filter(d => d.status === 'in_progress').length,
    completed: documents.filter(d => d.status === 'completed').length,
    drafts: documents.filter(d => d.status === 'draft').length,
  };

  const filtered = documents.filter(doc => {
    const matchSearch = !search || doc.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          {/* <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">NexSign Dashboard</h1> */}

<h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome, {user?.full_name || 'User'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">সব ডকুমেন্ট এবং সাইনিং প্রসেস ম্যানেজ করুন</p>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="টাইটেল দিয়ে খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border">
            <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
            <TabsTrigger value="draft" className="rounded-lg">Drafts</TabsTrigger>
            <TabsTrigger value="in_progress" className="rounded-lg">Active</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">Done</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
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