// import React, { useState, useEffect } from 'react';
// import { base44 } from '@/api/base44Client';
// import { createPageUrl } from '@/utils';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow
// } from '@/components/ui/table';
// import {
//   Shield, Users, FileText, CheckCircle2, Clock,
//   Search, UserX, UserCheck, AlertTriangle
// } from 'lucide-react';
// import { format } from 'date-fns';
// import StatsCard from '../components/dashboard/StatsCard';

// export default function AdminDashboard() {
//   const [user, setUser] = useState(null);
//   const [tab, setTab] = useState('users');
//   const [search, setSearch] = useState('');
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     const init = async () => {
//       const authed = await base44.auth.isAuthenticated();
//       if (!authed) {
//         base44.auth.redirectToLogin(createPageUrl('AdminDashboard'));
//         return;
//       }
//       const u = await base44.auth.me();
//       if (u.role !== 'admin') {
//         window.location.href = createPageUrl('Dashboard');
//         return;
//       }
//       setUser(u);
//     };
//     init();
//   }, []);

//   const { data: users = [] } = useQuery({
//     queryKey: ['admin-users'],
//     queryFn: () => base44.entities.User.list('-created_date', 200),
//     enabled: !!user,
//   });

//   const { data: documents = [] } = useQuery({
//     queryKey: ['admin-documents'],
//     queryFn: () => base44.entities.Document.list('-created_date', 200),
//     enabled: !!user,
//   });

//   const { data: auditLogs = [] } = useQuery({
//     queryKey: ['admin-audit'],
//     queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
//     enabled: !!user,
//   });

//   const toggleBlock = useMutation({
//     mutationFn: async ({ userId, currentRole }) => {
//       const newRole = currentRole === 'blocked' ? 'user' : 'blocked';
//       await base44.entities.User.update(userId, { role: newRole });
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
//   });

//   const filteredUsers = users.filter(u =>
//     !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   const stats = {
//     totalUsers: users.length,
//     totalDocs: documents.length,
//     completedDocs: documents.filter(d => d.status === 'completed').length,
//     activeDocs: documents.filter(d => d.status === 'in_progress').length,
//   };

//   if (!user) return null;

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex items-center gap-3 mb-8">
//         <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
//           <Shield className="w-5 h-5 text-sky-500" />
//         </div>
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
//           <p className="text-sm text-slate-500">Monitor platform usage and manage users</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Users" value={stats.totalUsers} icon={Users} color="sky" />
//         <StatsCard label="Total Documents" value={stats.totalDocs} icon={FileText} color="violet" />
//         <StatsCard label="Completed" value={stats.completedDocs} icon={CheckCircle2} color="green" />
//         <StatsCard label="Active" value={stats.activeDocs} icon={Clock} color="amber" />
//       </div>

//       <Tabs value={tab} onValueChange={setTab} className="mb-6">
//         <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl">
//           <TabsTrigger value="users" className="rounded-lg gap-1.5"><Users className="w-3.5 h-3.5" /> Users</TabsTrigger>
//           <TabsTrigger value="documents" className="rounded-lg gap-1.5"><FileText className="w-3.5 h-3.5" /> Documents</TabsTrigger>
//           <TabsTrigger value="audit" className="rounded-lg gap-1.5"><Shield className="w-3.5 h-3.5" /> Audit Log</TabsTrigger>
//         </TabsList>
//       </Tabs>

//       {tab === 'users' && (
//         <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
//           <div className="p-4 border-b border-slate-200 dark:border-slate-700">
//             <div className="relative max-w-sm">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-lg" />
//             </div>
//           </div>
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-slate-50 dark:bg-slate-800/50">
//                 <TableHead>User</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead>Role</TableHead>
//                 <TableHead>Joined</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredUsers.map(u => (
//                 <TableRow key={u.id}>
//                   <TableCell>
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 text-sm font-bold">
//                         {u.full_name?.[0]?.toUpperCase() || '?'}
//                       </div>
//                       <span className="font-medium text-slate-900 dark:text-white">{u.full_name || 'Unknown'}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-slate-500">{u.email}</TableCell>
//                   <TableCell>
//                     <Badge className={
//                       u.role === 'admin' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' :
//                       u.role === 'blocked' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
//                       'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
//                     }>
//                       {u.role || 'user'}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-slate-400 text-sm">
//                     {u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : '-'}
//                   </TableCell>
//                   <TableCell>
//                     {u.role !== 'admin' && u.id !== user.id && (
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => toggleBlock.mutate({ userId: u.id, currentRole: u.role })}
//                         className={u.role === 'blocked' ? 'text-green-600 hover:text-green-700' : 'text-red-500 hover:text-red-600'}
//                       >
//                         {u.role === 'blocked' ? (
//                           <><UserCheck className="w-4 h-4 mr-1" /> Unblock</>
//                         ) : (
//                           <><UserX className="w-4 h-4 mr-1" /> Block</>
//                         )}
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Card>
//       )}

//       {tab === 'documents' && (
//         <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-slate-50 dark:bg-slate-800/50">
//                 <TableHead>Title</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Parties</TableHead>
//                 <TableHead>Created By</TableHead>
//                 <TableHead>Created</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {documents.map(d => (
//                 <TableRow key={d.id}>
//                   <TableCell className="font-medium text-slate-900 dark:text-white">{d.title}</TableCell>
//                   <TableCell>
//                     <Badge className={
//                       d.status === 'completed' ? 'bg-green-100 text-green-700' :
//                       d.status === 'in_progress' ? 'bg-sky-100 text-sky-700' :
//                       'bg-slate-100 text-slate-600'
//                     }>
//                       {d.status}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-slate-500">{d.parties?.length || 0}</TableCell>
//                   <TableCell className="text-slate-400 text-sm">{d.created_by}</TableCell>
//                   <TableCell className="text-slate-400 text-sm">
//                     {d.created_date ? format(new Date(d.created_date), 'MMM d, yyyy') : '-'}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Card>
//       )}

//       {tab === 'audit' && (
//         <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-slate-50 dark:bg-slate-800/50">
//                 <TableHead>Action</TableHead>
//                 <TableHead>Party</TableHead>
//                 <TableHead>Details</TableHead>
//                 <TableHead>Time</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {auditLogs.map(log => (
//                 <TableRow key={log.id}>
//                   <TableCell>
//                     <Badge className={
//                       log.action === 'signed' ? 'bg-green-100 text-green-700' :
//                       log.action === 'sent' ? 'bg-sky-100 text-sky-700' :
//                       log.action === 'completed' ? 'bg-emerald-100 text-emerald-700' :
//                       log.action === 'opened' ? 'bg-amber-100 text-amber-700' :
//                       'bg-slate-100 text-slate-600'
//                     }>
//                       {log.action}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-slate-500">{log.party_name || '-'}</TableCell>
//                   <TableCell className="text-slate-600 dark:text-slate-300 text-sm">{log.details}</TableCell>
//                   <TableCell className="text-slate-400 text-sm">
//                     {log.timestamp ? format(new Date(log.timestamp), 'MMM d, HH:mm') : '-'}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Card>
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect } from 'react';
// import { api } from '@/api/apiClient'; // আপনার নতুন এপিআই ক্লায়েন্ট
// import { useAuth } from '@/lib/AuthContext';
// import { createPageUrl } from '@/utils';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow
// } from '@/components/ui/table';
// import {
//   Shield, Users, FileText, CheckCircle2, Clock,
//   Search, UserX, UserCheck
// } from 'lucide-react';
// import { format } from 'date-fns';
// import StatsCard from '../components/dashboard/StatsCard';

// export default function AdminDashboard() {
//   const { user } = useAuth();
//   const [tab, setTab] = useState('users');
//   const [search, setSearch] = useState('');
//   const [users, setUsers] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [auditLogs, setAuditLogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // শুধুমাত্র অ্যাডমিন এক্সেস নিশ্চিত করা
//     if (user && user.role !== 'admin') {
//       window.location.href = createPageUrl('Dashboard');
//       return;
//     }
//     fetchAdminData();
//   }, [user]);

//   const fetchAdminData = async () => {
//     setLoading(true);
//     try {
//       // আপনার ব্যাকএন্ড এপিআই থেকে ডেটা আনা
//       const [usersRes, docsRes, auditRes] = await Promise.all([
//         api.get('/admin/users'),
//         api.get('/admin/documents'),
//         api.get('/admin/audit-logs')
//       ]);
//       setUsers(usersRes.data);
//       setDocuments(docsRes.data);
//       setAuditLogs(auditRes.data);
//     } catch (error) {
//       console.error("Admin data fetch error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleBlock = async (userId, currentRole) => {
//     const newRole = currentRole === 'blocked' ? 'user' : 'blocked';
//     try {
//       await api.put(`/admin/users/${userId}/role`, { role: newRole });
//       fetchAdminData(); // লিস্ট রিফ্রেশ করা
//     } catch (error) {
//       console.error("Action failed");
//     }
//   };

//   const filteredUsers = users.filter(u =>
//     !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   const stats = {
//     totalUsers: users.length,
//     totalDocs: documents.length,
//     completedDocs: documents.filter(d => d.status === 'completed').length,
//     activeDocs: documents.filter(d => d.status === 'in_progress').length,
//   };

//   if (!user || user.role !== 'admin') return null;

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex items-center gap-3 mb-8">
//         <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
//           <Shield className="w-5 h-5 text-sky-500" />
//         </div>
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
//           <p className="text-sm text-slate-500">Monitor platform usage and manage users</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Users" value={stats.totalUsers} icon={Users} color="sky" />
//         <StatsCard label="Total Documents" value={stats.totalDocs} icon={FileText} color="violet" />
//         <StatsCard label="Completed" value={stats.completedDocs} icon={CheckCircle2} color="green" />
//         <StatsCard label="Active" value={stats.activeDocs} icon={Clock} color="amber" />
//       </div>

//       <Tabs value={tab} onValueChange={setTab} className="mb-6">
//         <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
//           <TabsTrigger value="users" className="rounded-lg gap-1.5"><Users className="w-3.5 h-3.5" /> Users</TabsTrigger>
//           <TabsTrigger value="documents" className="rounded-lg gap-1.5"><FileText className="w-3.5 h-3.5" /> Documents</TabsTrigger>
//           <TabsTrigger value="audit" className="rounded-lg gap-1.5"><Shield className="w-3.5 h-3.5" /> Audit Log</TabsTrigger>
//         </TabsList>
//       </Tabs>

//       {tab === 'users' && (
//         <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
//           <div className="p-4 border-b border-slate-200 dark:border-slate-700">
//             <div className="relative max-w-sm">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-lg" />
//             </div>
//           </div>
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-slate-50 dark:bg-slate-800/50">
//                 <TableHead>User</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead>Role</TableHead>
//                 <TableHead>Joined</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredUsers.map(u => (
//                 <TableRow key={u.id}>
//                   <TableCell>
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
//                         {u.full_name?.[0]?.toUpperCase() || '?'}
//                       </div>
//                       <span className="font-medium">{u.full_name || 'Unknown'}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-slate-500">{u.email}</TableCell>
//                   <TableCell>
//                     <Badge className={u.role === 'admin' ? 'bg-sky-100 text-sky-700' : u.role === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}>
//                       {u.role || 'user'}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-slate-400 text-sm">
//                     {u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : '-'}
//                   </TableCell>
//                   <TableCell>
//                     {u.role !== 'admin' && u.id !== user.id && (
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleToggleBlock(u.id, u.role)}
//                         className={u.role === 'blocked' ? 'text-green-600' : 'text-red-500'}
//                       >
//                         {u.role === 'blocked' ? <><UserCheck className="w-4 h-4 mr-1" /> Unblock</> : <><UserX className="w-4 h-4 mr-1" /> Block</>}
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Card>
//       )}

//       {/* Documents & Audit Tab (আগের মতোই থাকবে কিন্তু API কল api.get দিয়ে হবে) */}
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow
// } from '@/components/ui/table';
// import {
//   Shield, Users, FileText, CheckCircle2, Clock,
//   Search, UserX, UserCheck, Loader2
// } from 'lucide-react';
// import { format } from 'date-fns';
// import StatsCard from '../components/dashboard/StatsCard';
// import { toast } from 'sonner';

// export default function AdminDashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [tab, setTab] = useState('users');
//   const [search, setSearch] = useState('');
//   const [users, setUsers] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // ১. অথ লোডিং শেষ না হওয়া পর্যন্ত অপেক্ষা করুন
//     if (authLoading) return;

//     // ২. রোল চেক: super_admin অথবা admin কিনা নিশ্চিত করুন
//     const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';
    
//     if (!user || !hasAccess) {
//       toast.error("আপনার এই পেজে ঢোকার অনুমতি নেই!");
//       navigate('/dashboard'); // সাধারণ ইউজার হলে সাধারণ ড্যাশবোর্ডে পাঠিয়ে দিবে
//       return;
//     }

//     fetchAdminData();
//   }, [user, authLoading, navigate]);

//   const fetchAdminData = async () => {
//     setLoading(true);
//     try {
//       // ব্যাকএন্ড এপিআই কল
//       const [usersRes, docsRes] = await Promise.all([
//         api.get('/admin/users'),
//         api.get('/admin/documents')
//       ]);
//       setUsers(usersRes.data);
//       setDocuments(docsRes.data);
//     } catch (error) {
//       console.error("Admin data fetch error:", error);
//       toast.error("ডেটা লোড করতে সমস্যা হয়েছে।");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleBlock = async (userId, currentRole) => {
//     const newRole = currentRole === 'blocked' ? 'user' : 'blocked';
//     try {
//       await api.put(`/admin/users/${userId}/role`, { role: newRole });
//       toast.success("ইউজার স্ট্যাটাস আপডেট হয়েছে।");
//       fetchAdminData(); 
//     } catch (error) {
//       toast.error("অ্যাকশন সফল হয়নি।");
//     }
//   };

//   const filteredUsers = users.filter(u =>
//     !search || 
//     u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
//     u.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   const stats = {
//     totalUsers: users.length,
//     totalDocs: documents.length,
//     completedDocs: documents.filter(d => d.status === 'completed').length,
//     activeDocs: documents.filter(d => d.status === 'in_progress').length,
//   };

//   // লোডিং বা এক্সেস না থাকলে কিছুই দেখাবে না
//   if (authLoading || !user || (user.role !== 'super_admin' && user.role !== 'admin')) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex items-center gap-3 mb-8">
//         <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
//           <Shield className="w-5 h-5 text-sky-500" />
//         </div>
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
//           <p className="text-sm text-slate-500">Monitor platform usage and manage users</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Users" value={stats.totalUsers} icon={Users} color="sky" />
//         <StatsCard label="Total Documents" value={stats.totalDocs} icon={FileText} color="violet" />
//         <StatsCard label="Completed" value={stats.completedDocs} icon={CheckCircle2} color="green" />
//         <StatsCard label="Active" value={stats.activeDocs} icon={Clock} color="amber" />
//       </div>

//       <Tabs value={tab} onValueChange={setTab} className="mb-6">
//         <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
//           <TabsTrigger value="users" className="rounded-lg gap-1.5"><Users className="w-3.5 h-3.5" /> Users</TabsTrigger>
//           <TabsTrigger value="documents" className="rounded-lg gap-1.5"><FileText className="w-3.5 h-3.5" /> Documents</TabsTrigger>
//         </TabsList>
//       </Tabs>

//       {tab === 'users' && (
//         <Card className="border-slate-200 dark:border-slate-700 overflow-hidden rounded-2xl">
//           <div className="p-4 border-b border-slate-200 dark:border-slate-700">
//             <div className="relative max-w-sm">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <Input 
//                 placeholder="Search users..." 
//                 value={search} 
//                 onChange={e => setSearch(e.target.value)} 
//                 className="pl-10 rounded-xl border-slate-200" 
//               />
//             </div>
//           </div>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-slate-50 dark:bg-slate-800/50">
//                   <TableHead>User</TableHead>
//                   <TableHead>Email</TableHead>
//                   <TableHead>Role</TableHead>
//                   <TableHead>Joined</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {loading ? (
//                   <TableRow><TableCell colSpan={5} className="text-center py-10">Loading users...</TableCell></TableRow>
//                 ) : filteredUsers.map(u => (
//                   <TableRow key={u._id}>
//                     <TableCell>
//                       <div className="flex items-center gap-3">
//                         <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
//                           {u.full_name?.[0]?.toUpperCase() || '?'}
//                         </div>
//                         <span className="font-medium text-slate-900 dark:text-white">{u.full_name}</span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-slate-500">{u.email}</TableCell>
//                     <TableCell>
//                       <Badge className={
//                         u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
//                         u.role === 'admin' ? 'bg-sky-100 text-sky-700' : 
//                         u.role === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
//                       }>
//                         {u.role}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="text-slate-400 text-sm">
//                       {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '-'}
//                     </TableCell>
//                     <TableCell>
//                       {/* সুপার অ্যাডমিনকে ব্লক করা যাবে না */}
//                       {u.role !== 'super_admin' && u._id !== user.id && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleToggleBlock(u._id, u.role)}
//                           className={u.role === 'blocked' ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}
//                         >
//                           {u.role === 'blocked' ? <><UserCheck className="w-4 h-4 mr-1" /> Unblock</> : <><UserX className="w-4 h-4 mr-1" /> Block</>}
//                         </Button>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Shield, Users, FileText, CheckCircle2, Clock, Search, Trash2, Loader2, ExternalLink } from 'lucide-react';
// import { format } from 'date-fns';
// import StatsCard from '../components/dashboard/StatsCard';
// import { toast } from 'sonner';

// export default function AdminDashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [tab, setTab] = useState('users');
//   const [search, setSearch] = useState('');
//   const [users, setUsers] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (authLoading) return;
//     const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';
//     if (!user || !hasAccess) {
//       navigate('/dashboard');
//       return;
//     }
//     fetchAdminData();
//   }, [user, authLoading]);

//   const fetchAdminData = async () => {
//     setLoading(true);
//     try {
//       const [usersRes, docsRes] = await Promise.all([
//         api.get('/admin/users'),
//         api.get('/admin/documents')
//       ]);
//       setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
//       setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("ডাটা লোড করতে সমস্যা হয়েছে।");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm("আপনি কি নিশ্চিত? এই ইউজারকে চিরতরে ডিলিট করা হবে!")) return;
//     try {
//       await api.delete(`/admin/users/${userId}`);
//       setUsers(users.filter(u => u._id !== userId));
//       toast.success("ইউজার ডিলিট হয়েছে।");
//     } catch (error) {
//       toast.error("ডিলিট করা সম্ভব হয়নি।");
//     }
//   };

//   // ইউজার ফিল্টারিং
//   const filteredUsers = users.filter(u => 
//     !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   // ডকুমেন্ট ফিল্টারিং
//   const filteredDocs = documents.filter(d =>
//     !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.owner?.full_name?.toLowerCase().includes(search.toLowerCase())
//   );

//   const stats = {
//     totalUsers: users.length,
//     totalDocs: documents.length,
//     completedDocs: documents.filter(d => d.status === 'completed').length,
//     activeDocs: documents.filter(d => d.status === 'in_progress').length,
//   };

//   if (authLoading || loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <div className="flex items-center gap-3 mb-8">
//         <Shield className="text-sky-500 w-8 h-8" />
//         <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Users" value={stats.totalUsers} icon={Users} color="sky" />
//         <StatsCard label="Total Documents" value={stats.totalDocs} icon={FileText} color="violet" />
//         <StatsCard label="Completed" value={stats.completedDocs} icon={CheckCircle2} color="green" />
//         <StatsCard label="Active" value={stats.activeDocs} icon={Clock} color="amber" />
//       </div>

//       <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="mb-6">
//         <TabsList className="bg-slate-100 p-1">
//           <TabsTrigger value="users">Users</TabsTrigger>
//           <TabsTrigger value="documents">Documents</TabsTrigger>
//         </TabsList>
//       </Tabs>

//       <Card className="rounded-2xl overflow-hidden border-slate-200">
//         <div className="p-4 bg-white border-b">
//           <div className="relative max-w-sm">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//             <Input 
//               placeholder={tab === 'users' ? "Search users..." : "Search documents..."} 
//               value={search} 
//               onChange={e => setSearch(e.target.value)} 
//               className="pl-10" 
//             />
//           </div>
//         </div>

//         {/* ✅ ইউজার টেবিল */}
//         {tab === 'users' && (
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-slate-50">
//                 <TableHead>User</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead>Role</TableHead>
//                 <TableHead>Joined</TableHead>
//                 <TableHead className="text-right">Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredUsers.length === 0 ? (
//                 <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">No users found</TableCell></TableRow>
//               ) : filteredUsers.map(u => (
//                 <TableRow key={u._id}>
//                   <TableCell className="font-medium">{u.full_name}</TableCell>
//                   <TableCell>{u.email}</TableCell>
//                   <TableCell>
//                     <Badge variant="secondary" className={u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : ''}>
//                       {u.role}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-sm text-slate-400">{format(new Date(u.createdAt), 'MMM d, yyyy')}</TableCell>
//                   <TableCell className="text-right">
//                     {u.role !== 'super_admin' && (
//                       <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:bg-red-50">
//                         <Trash2 className="w-4 h-4" />
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}

//         {/* ✅ ডকুমেন্ট টেবিল (এটি আগে ছিল না) */}
//         {tab === 'documents' && (
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-slate-50">
//                 <TableHead>Document Title</TableHead>
//                 <TableHead>Owner</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Parties</TableHead>
//                 <TableHead>Date Created</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredDocs.length === 0 ? (
//                 <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">No documents found</TableCell></TableRow>
//               ) : filteredDocs.map(d => (
//                 <TableRow key={d._id}>
//                   <TableCell className="font-medium">
//                     <div className="flex flex-col">
//                       <span>{d.title}</span>
//                       <span className="text-[10px] text-sky-500 font-mono truncate w-32">{d._id}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-sm">
//                     <div className="flex flex-col">
//                       <span className="font-medium">{d.owner?.full_name || 'Deleted User'}</span>
//                       <span className="text-xs text-slate-400">{d.owner?.email}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <Badge className={
//                       d.status === 'completed' ? 'bg-green-100 text-green-700' : 
//                       d.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
//                     }>
//                       {d.status}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-sm">
//                     <div className="flex items-center gap-1">
//                       <Users className="w-3 h-3 text-slate-400" />
//                       {d.parties?.length || 0}
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-sm text-slate-400">
//                     {format(new Date(d.createdAt), 'MMM d, yyyy')}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}
//       </Card>
//     </div>
//   );
// }
//fixed uporer ta

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Shield, Users, FileText, CheckCircle2, Clock, Search, Trash2, Loader2, Activity } from 'lucide-react';
// import { format } from 'date-fns';
// import StatsCard from '../components/dashboard/StatsCard';
// import { toast } from 'sonner';

// export default function AdminDashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [tab, setTab] = useState('users');
//   const [search, setSearch] = useState('');
//   const [users, setUsers] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [logs, setLogs] = useState([]); // ✅ অডিট লগের জন্য স্টেট
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (authLoading) return;
//     const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';
//     if (!user || !hasAccess) {
//       navigate('/dashboard');
//       return;
//     }
//     fetchAdminData();
//   }, [user, authLoading]);

//   const fetchAdminData = async () => {
//     setLoading(true);
//     try {
//       // ✅ সব ডাটা একসাথে ফেচ করা হচ্ছে
//       const [usersRes, docsRes, logsRes] = await Promise.all([
//         api.get('/admin/users'),
//         api.get('/admin/documents'),
//         api.get('/admin/audit-logs') 
//       ]);
//       setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
//       setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
//       setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("ডাটা লোড করতে সমস্যা হয়েছে।");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm("আপনি কি নিশ্চিত? এই ইউজারকে চিরতরে ডিলিট করা হবে!")) return;
//     try {
//       await api.delete(`/admin/users/${userId}`);
//       setUsers(users.filter(u => u._id !== userId));
//       toast.success("ইউজার ডিলিট হয়েছে।");
//     } catch (error) {
//       toast.error("ডিলিট করা সম্ভব হয়নি।");
//     }
//   };

//   // ফিল্টারিং লজিক
//   const filteredUsers = users.filter(u => 
//     !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   const filteredDocs = documents.filter(d =>
//     !search || d.title?.toLowerCase().includes(search.toLowerCase())
//   );

//   const filteredLogs = logs.filter(l =>
//     !search || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase())
//   );

//   const stats = {
//     totalUsers: users.length,
//     totalDocs: documents.length,
//     completedDocs: documents.filter(d => d.status === 'completed').length,
//     activeDocs: documents.filter(d => d.status === 'in_progress').length,
//   };

//   if (authLoading || loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <div className="flex items-center gap-3 mb-8">
//         <Shield className="text-sky-500 w-8 h-8" />
//         <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard label="Total Users" value={stats.totalUsers} icon={Users} color="sky" />
//         <StatsCard label="Total Documents" value={stats.totalDocs} icon={FileText} color="violet" />
//         <StatsCard label="Completed" value={stats.completedDocs} icon={CheckCircle2} color="green" />
//         <StatsCard label="Active" value={stats.activeDocs} icon={Clock} color="amber" />
//       </div>

//       <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="mb-6">
//         <TabsList className="bg-slate-100 p-1">
//           <TabsTrigger value="users" className="gap-2"><Users size={16}/> Users</TabsTrigger>
//           <TabsTrigger value="documents" className="gap-2"><FileText size={16}/> Documents</TabsTrigger>
//           <TabsTrigger value="logs" className="gap-2"><Activity size={16}/> Activity Logs</TabsTrigger>
//         </TabsList>
//       </Tabs>

//       <Card className="rounded-2xl overflow-hidden border-slate-200">
//         <div className="p-4 bg-white border-b flex justify-between items-center">
//           <div className="relative max-w-sm w-full">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//             <Input 
//               placeholder={`Search in ${tab}...`} 
//               value={search} 
//               onChange={e => setSearch(e.target.value)} 
//               className="pl-10" 
//             />
//           </div>
//           <Button onClick={fetchAdminData} variant="outline" size="sm">Refresh Data</Button>
//         </div>

//         {/* ✅ ইউজার টেবিল */}
//         {tab === 'users' && (
//           <Table>
//             <TableHeader><TableRow className="bg-slate-50"><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
//             <TableBody>
//               {filteredUsers.map(u => (
//                 <TableRow key={u._id}>
//                   <TableCell className="font-medium">{u.full_name}</TableCell>
//                   <TableCell>{u.email}</TableCell>
//                   <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
//                   <TableCell className="text-sm text-slate-400">{format(new Date(u.createdAt), 'MMM d, yyyy')}</TableCell>
//                   <TableCell className="text-right">
//                     {u.role !== 'super_admin' && (
//                       <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}

//         {/* ✅ অ্যাক্টিভিটি লগ টেবিল (Email & IP ট্র্যাকিং) */}
//         {tab === 'logs' && (
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-slate-50">
//                 <TableHead>User / Email</TableHead>
//                 <TableHead>Action</TableHead>
//                 <TableHead>IP Address</TableHead>
//                 <TableHead>Time</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredLogs.length === 0 ? (
//                 <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">No activity logs found</TableCell></TableRow>
//               ) : filteredLogs.map(log => (
//                 <TableRow key={log._id}>
//                   <TableCell>
//                     <div className="flex flex-col">
//                       <span className="font-medium text-slate-900">{log.performed_by?.name || 'Unknown'}</span>
//                       <span className="text-xs text-slate-500">{log.performed_by?.email}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell><Badge variant="outline" className="capitalize">{log.action}</Badge></TableCell>
//                   <TableCell>
//                     <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-sky-600 font-mono">
//                       {log.ip_address || '0.0.0.0'}
//                     </code>
//                   </TableCell>
//                   <TableCell className="text-xs text-slate-400">
//                     {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}

//         {/* ✅ ডকুমেন্ট টেবিল */}
//         {tab === 'documents' && (
//           <Table>
//             <TableHeader><TableRow className="bg-slate-50"><TableHead>Document Title</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
//             <TableBody>
//               {filteredDocs.map(d => (
//                 <TableRow key={d._id}>
//                   <TableCell className="font-medium">{d.title}</TableCell>
//                   <TableCell className="text-sm">{d.owner?.full_name}</TableCell>
//                   <TableCell><Badge className={d.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100'}>{d.status}</Badge></TableCell>
//                   <TableCell className="text-sm text-slate-400">{format(new Date(d.createdAt), 'MMM d, yyyy')}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}
//       </Card>
//     </div>
//   );
// }
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Card } from '@/components/ui/Card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Shield, Users, FileText, CheckCircle2, Clock, Search, Trash2, Loader2, Activity, ChevronLeft, ChevronRight, MapPin, Globe, Laptop, Mail, Calendar } from 'lucide-react';
// import { format, isValid } from 'date-fns';
// import StatsCard from '../components/dashboard/StatsCard';
// import { toast } from 'sonner';

// export default function AdminDashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [tab, setTab] = useState('users');
//   const [search, setSearch] = useState('');
  
//   const [users, setUsers] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [logs, setLogs] = useState([]); 
  
//   const [loading, setLoading] = useState({ users: true, docs: true, logs: true });
//   const [logPage, setLogPage] = useState(1);
//   const [hasMoreLogs, setHasMoreLogs] = useState(true);

//   const fetchUsers = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/users');
//       setUsers(Array.isArray(res.data) ? res.data : []);
//     } catch (err) { toast.error("User list error"); }
//     finally { setLoading(prev => ({ ...prev, users: false })); }
//   }, []);

//   const fetchDocs = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/documents');
//       setDocuments(Array.isArray(res.data) ? res.data : []);
//     } catch (err) { toast.error("Docs error"); }
//     finally { setLoading(prev => ({ ...prev, docs: false })); }
//   }, []);

//   const fetchLogs = useCallback(async (pageNo = 1) => {
//     setLoading(prev => ({ ...prev, logs: true }));
//     try {
//       const res = await api.get(`/admin/audit-logs?page=${pageNo}`);
//       const newData = Array.isArray(res.data) ? res.data : [];
//       setLogs(newData);
//       setHasMoreLogs(newData.length === 10);
//       setLogPage(pageNo);
//     } catch (err) { toast.error("Logs error"); }
//     finally { setLoading(prev => ({ ...prev, logs: false })); }
//   }, []);

//   const refreshAll = () => {
//     setLoading({ users: true, docs: true, logs: true });
//     fetchUsers();
//     fetchDocs();
//     fetchLogs(1);
//   };

//   useEffect(() => {
//     if (authLoading) return;
//     if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
//       navigate('/dashboard'); return;
//     }
//     refreshAll();
//   }, [user, authLoading]);

//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm("Are you sure?")) return;
//     try {
//       await api.delete(`/admin/users/${userId}`);
//       setUsers(users.filter(u => u._id !== userId));
//       toast.success("User deleted");
//     } catch (error) { toast.error("Delete failed"); }
//   };

//   const safeFormatDate = (dateStr, fStr = 'hh:mm aa, d MMM yyyy') => {
//     const d = new Date(dateStr);
//     return isValid(d) ? format(d, fStr) : 'N/A';
//   };

//   // const filteredUsers = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
//   // const filteredDocs = documents.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()));
//  const filteredUsers = users
//   .filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
//   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//  const filteredDocs = documents
//   .filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()))
//   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
 
//   // const filteredLogs = logs.filter(l => !search || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase()));
// const filteredLogs = logs
//   .filter(l => !search || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase()))
//   .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));


//   if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-sky-600 w-10 h-10" /></div>;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8 bg-[#F8FAFC] min-h-screen font-sans">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
//         <div>
//           <div className="flex items-center gap-2 mb-1">
//             <Shield className="text-sky-600 w-5 h-5" />
//             <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Administrator</span>
//           </div>
//           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">NexSign Dashboard</h1>
//         </div>
//         <Button onClick={refreshAll} className="rounded-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm px-6">
//           <Activity size={16} className="mr-2 text-emerald-500 animate-pulse"/> Update Live Data
//         </Button>
//       </div>

//       {/* Stats Section */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//         <StatsCard label="Total Users" value={users.length} icon={Users} color="sky" />
//         <StatsCard label="Documents" value={documents.length} icon={FileText} color="violet" />
//         <StatsCard label="Completed" value={documents.filter(d => d.status === 'completed').length} icon={CheckCircle2} color="green" />
//         <StatsCard label="Pending" value={documents.filter(d => d.status === 'in_progress').length} icon={Clock} color="amber" />
//       </div>

//       <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="space-y-6">
//         <TabsList className="bg-slate-200/50 p-1 rounded-xl w-fit">
//           <TabsTrigger value="users" className="rounded-lg px-6 font-semibold transition-all">Users</TabsTrigger>
//           <TabsTrigger value="documents" className="rounded-lg px-6 font-semibold transition-all">Documents</TabsTrigger>
//           <TabsTrigger value="logs" className="rounded-lg px-6 font-semibold transition-all">Activity Logs</TabsTrigger>
//         </TabsList>

//         <Card className="rounded-3xl shadow-xl shadow-slate-200/50 border-none bg-white overflow-hidden">
//           <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
//             <div className="relative w-full md:max-w-sm">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <Input 
//                 placeholder={`Search ${tab}...`} 
//                 value={search} 
//                 onChange={e => setSearch(e.target.value)} 
//                 className="pl-11 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white h-12 transition-all" 
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-slate-400">Total {tab}:</span>
//               <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50 border-none font-bold">
//                 {tab === 'users' ? filteredUsers.length : tab === 'documents' ? filteredDocs.length : filteredLogs.length}
//               </Badge>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             {loading[tab] ? (
//               <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
//                 <Loader2 className="animate-spin w-8 h-8 text-sky-500" />
//                 <p className="font-medium animate-pulse">Syncing Database...</p>
//               </div>
//             ) : (
//               <>
//                 {tab === 'users' && (
//                   <Table>
//                     <TableHeader className="bg-slate-50/50"><TableRow><TableHead className="font-bold py-4">User Details</TableHead><TableHead className="font-bold">Access Role</TableHead><TableHead className="font-bold">Join Date</TableHead><TableHead className="text-right font-bold">Manage</TableHead></TableRow></TableHeader>
//                     <TableBody>
//                       {filteredUsers.map(u => (
//                         <TableRow key={u._id} className="hover:bg-slate-50/30 transition-colors">
//                           <TableCell><div className="flex flex-col"><span className="font-bold text-slate-900">{u.full_name}</span><span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10}/>{u.email}</span></div></TableCell>
//                           <TableCell><Badge className={`rounded-md font-bold text-[10px] ${u.role === 'super_admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-600'}`} variant="outline">{u.role?.toUpperCase()}</Badge></TableCell>
//                           <TableCell className="text-xs text-slate-500 font-medium">{safeFormatDate(u.createdAt, 'd MMM, yyyy')}</TableCell>
//                           <TableCell className="text-right">{u.role !== 'super_admin' && <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u._id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash2 size={18}/></Button>}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 )}

//                 {tab === 'documents' && (
//                   <Table className="min-w-[1000px]">
//                     <TableHeader className="bg-slate-50/50"><TableRow><TableHead className="font-bold py-4">Document Details</TableHead><TableHead className="font-bold">Overall Status</TableHead><TableHead className="font-bold">Signers Tracking</TableHead><TableHead className="font-bold">Creation Date</TableHead></TableRow></TableHeader>
//                     <TableBody>
//                       {filteredDocs.map(d => (
//                         <TableRow key={d._id} className="align-top hover:bg-slate-50/30">
//                           <TableCell className="max-w-[220px]">
//                             <div className="flex flex-col gap-1.5 py-2">
//                               <span className="font-bold text-slate-900 text-base leading-tight">{d.title}</span>
//                               <div className="flex items-center gap-1.5 text-slate-400">
//                                 <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-[10px] text-sky-700 font-bold">
//                                   {d.owner?.full_name?.charAt(0)}
//                                 </div>
//                                 <span className="text-[11px] font-medium italic">{d.owner?.full_name}</span>
//                               </div>
//                             </div>
//                           </TableCell>
//                           <TableCell className="py-4">
//                             <Badge className={`px-3 py-1 rounded-full font-bold text-[10px] ${d.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
//                               {d.status?.toUpperCase()}
//                             </Badge>
//                           </TableCell>
//                           <TableCell className="py-4">
//                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
//                               {d.parties?.map((p, idx) => (
//                                 <div key={idx} className="p-4 border border-slate-100 rounded-2xl bg-[#FCFDFF] hover:border-sky-200 transition-all shadow-sm">
//                                   <div className="flex justify-between items-start mb-3">
//                                     <div className="flex flex-col">
//                                       <span className="font-extrabold text-slate-800 text-sm">{p.name}</span>
//                                       <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5"><Mail size={10}/>{p.email}</span>
//                                     </div>
//                                     <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${p.status === 'signed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
//                                       {p.status}
//                                     </div>
//                                   </div>
//                                   <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-2 border-t border-slate-50">
//                                     <div className="flex items-center gap-1.5 font-medium"><Globe size={11} className="text-slate-300"/>{p.ipAddress || '---'}</div>
//                                     <div className="flex items-center gap-1.5 font-medium"><MapPin size={11} className="text-slate-300"/>{p.location || 'Unknown'}</div>
//                                     <div className="col-span-2 flex items-center gap-1.5 font-medium truncate"><Laptop size={11} className="text-slate-300"/>{p.device || 'Mobile/PC'}</div>
//                                     {p.signedAt && <div className="col-span-2 flex items-center gap-1.5 font-bold text-emerald-600 mt-1 bg-emerald-50/50 p-1 rounded-md">
//                                       <Calendar size={11}/> {safeFormatDate(p.signedAt)}
//                                     </div>}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </TableCell>
//                           <TableCell className="text-xs text-slate-400 font-medium py-4">{safeFormatDate(d.createdAt, 'd MMM, yyyy')}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 )}

//                 {tab === 'logs' && (
//                   <>
//                     <Table>
//                       <TableHeader className="bg-slate-50/50"><TableRow><TableHead className="font-bold py-4">Actor</TableHead><TableHead className="font-bold">Action Taken</TableHead><TableHead className="font-bold">Document Title</TableHead><TableHead className="font-bold">Time Stamp</TableHead></TableRow></TableHeader>
//                       <TableBody>
//                         {filteredLogs.map(log => (
//                           <TableRow key={log._id} className="hover:bg-slate-50/30">
//                             <TableCell><div className="flex flex-col"><span className="font-bold text-slate-900 text-sm">{log.performed_by?.name || 'System'}</span><span className="text-[10px] text-slate-400 font-medium tracking-tight">{log.performed_by?.email}</span></div></TableCell>
//                             <TableCell><Badge variant="outline" className="text-[9px] font-black border-slate-200 text-slate-600 uppercase tracking-tighter bg-slate-50">{log.action}</Badge></TableCell>
//                             <TableCell><span className="text-xs text-slate-600 font-bold max-w-[180px] truncate block">{log.document_id?.title || 'N/A'}</span></TableCell>
//                             <TableCell className="text-[10px] text-slate-500 font-bold italic">{safeFormatDate(log.timestamp, 'hh:mm aa, d MMM')}</TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                     <div className="flex items-center justify-between p-6 border-t border-slate-50 bg-slate-50/20">
//                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Page {logPage}</p>
//                       <div className="flex gap-2">
//                         <Button onClick={() => fetchLogs(logPage - 1)} disabled={logPage === 1 || loading.logs} variant="outline" size="sm" className="rounded-xl bg-white h-9 w-9 p-0 shadow-sm"><ChevronLeft size={18}/></Button>
//                         <Button onClick={() => fetchLogs(logPage + 1)} disabled={!hasMoreLogs || loading.logs} variant="outline" size="sm" className="rounded-xl bg-white h-9 w-9 p-0 shadow-sm"><ChevronRight size={18}/></Button>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </>
//             )}
//           </div>
//         </Card>
//       </Tabs>
//     </div>
//   );
// }
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Card } from '@/components/ui/Card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Shield, Users, FileText, CheckCircle2, Clock, Search, Trash2, Loader2, Activity, ChevronLeft, ChevronRight, MapPin, Globe, Laptop, Mail, Calendar } from 'lucide-react';
// import { format, isValid } from 'date-fns';
// import StatsCard from '../components/dashboard/StatsCard';
// import { toast } from 'sonner';

// export default function AdminDashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [tab, setTab] = useState('users');
//   const [search, setSearch] = useState('');
  
//   const [users, setUsers] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [logs, setLogs] = useState([]); 
  
//   const [loading, setLoading] = useState({ users: true, docs: true, logs: true });
//   const [logPage, setLogPage] = useState(1);
//   const [hasMoreLogs, setHasMoreLogs] = useState(true);

//   const fetchUsers = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/users');
//       setUsers(Array.isArray(res.data) ? res.data : []);
//     } catch (err) { toast.error("User list error"); }
//     finally { setLoading(prev => ({ ...prev, users: false })); }
//   }, []);

//   const fetchDocs = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/documents');
//       setDocuments(Array.isArray(res.data) ? res.data : []);
//     } catch (err) { toast.error("Docs error"); }
//     finally { setLoading(prev => ({ ...prev, docs: false })); }
//   }, []);

//   const fetchLogs = useCallback(async (pageNo = 1) => {
//     setLoading(prev => ({ ...prev, logs: true }));
//     try {
//       const res = await api.get(`/admin/audit-logs?page=${pageNo}`);
//       const newData = Array.isArray(res.data) ? res.data : [];
//       setLogs(newData);
//       setHasMoreLogs(newData.length === 10);
//       setLogPage(pageNo);
//     } catch (err) { toast.error("Logs error"); }
//     finally { setLoading(prev => ({ ...prev, logs: false })); }
//   }, []);

//   const refreshAll = () => {
//     setLoading({ users: true, docs: true, logs: true });
//     fetchUsers();
//     fetchDocs();
//     fetchLogs(1);
//   };

//   useEffect(() => {
//     if (authLoading) return;
//     if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
//       navigate('/dashboard'); return;
//     }
//     refreshAll();
//   }, [user, authLoading]);

//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm("Are you sure?")) return;
//     try {
//       await api.delete(`/admin/users/${userId}`);
//       setUsers(users.filter(u => u._id !== userId));
//       toast.success("User deleted");
//     } catch (error) { toast.error("Delete failed"); }
//   };

//   const safeFormatDate = (dateStr, fStr = 'hh:mm aa, d MMM yyyy') => {
//     const d = new Date(dateStr);
//     return isValid(d) ? format(d, fStr) : 'N/A';
//   };

//   const filteredUsers = users
//     .filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
//     .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

//   const filteredDocs = documents
//     .filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()))
//     .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

//   const filteredLogs = logs
//     .filter(l => !search || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase()))
//     .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

//   if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-sky-600 w-10 h-10" /></div>;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8 bg-[#F8FAFC] min-h-screen font-sans">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
//         <div>
//           <div className="flex items-center gap-2 mb-1">
//             <Shield className="text-sky-600 w-5 h-5" />
//             <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Administrator</span>
//           </div>
//           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">NexSign Dashboard</h1>
//         </div>
//         <Button onClick={refreshAll} className="rounded-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm px-6 w-full md:w-auto">
//           <Activity size={16} className="mr-2 text-emerald-500 animate-pulse"/> Update Live Data
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//         <StatsCard label="Total Users" value={users.length} icon={Users} color="sky" />
//         <StatsCard label="Documents" value={documents.length} icon={FileText} color="violet" />
//         <StatsCard label="Completed" value={documents.filter(d => d.status === 'completed').length} icon={CheckCircle2} color="green" />
//         <StatsCard label="Pending" value={documents.filter(d => d.status === 'in_progress').length} icon={Clock} color="amber" />
//       </div>

//       <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="space-y-6">
//         <TabsList className="bg-slate-200/50 p-1 rounded-xl w-full md:w-fit flex">
//           <TabsTrigger value="users" className="flex-1 md:flex-none rounded-lg px-6 font-semibold transition-all">Users</TabsTrigger>
//           <TabsTrigger value="documents" className="flex-1 md:flex-none rounded-lg px-6 font-semibold transition-all">Docs</TabsTrigger>
//           <TabsTrigger value="logs" className="flex-1 md:flex-none rounded-lg px-6 font-semibold transition-all">Logs</TabsTrigger>
//         </TabsList>

//         <Card className="rounded-3xl shadow-xl shadow-slate-200/50 border-none bg-white overflow-hidden">
//           <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
//             <div className="relative w-full md:max-w-sm">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <Input 
//                 placeholder={`Search ${tab}...`} 
//                 value={search} 
//                 onChange={e => setSearch(e.target.value)} 
//                 className="pl-11 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white h-12 transition-all w-full" 
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-slate-400">Total:</span>
//               <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50 border-none font-bold">
//                 {tab === 'users' ? filteredUsers.length : tab === 'documents' ? filteredDocs.length : filteredLogs.length}
//               </Badge>
//             </div>
//           </div>

//           <div className="p-0">
//             {loading[tab] ? (
//               <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
//                 <Loader2 className="animate-spin w-8 h-8 text-sky-500" />
//                 <p className="font-medium animate-pulse">Syncing Database...</p>
//               </div>
//             ) : (
//               <div className="w-full">
//                 {tab === 'users' && (
//                   <div className="grid grid-cols-1 divide-y divide-slate-100 md:block">
//                     {/* Desktop Header */}
//                     <div className="hidden md:grid md:grid-cols-4 bg-slate-50/50 p-4 font-bold text-slate-700 text-sm">
//                       <span>User Details</span><span>Access Role</span><span>Join Date</span><span className="text-right">Manage</span>
//                     </div>
//                     {filteredUsers.map(u => (
//                       <div key={u._id} className="p-4 md:grid md:grid-cols-4 md:items-center hover:bg-slate-50/30 transition-all flex flex-col gap-3">
//                         <div className="flex flex-col">
//                           <span className="font-bold text-slate-900">{u.full_name}</span>
//                           <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10}/>{u.email}</span>
//                         </div>
//                         <div className="flex items-center md:block">
//                           <Badge className={`rounded-md font-bold text-[10px] ${u.role === 'super_admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-600'}`} variant="outline">{u.role?.toUpperCase()}</Badge>
//                         </div>
//                         <span className="text-xs text-slate-500 font-medium">{safeFormatDate(u.createdAt, 'd MMM, yyyy')}</span>
//                         <div className="md:text-right">
//                           {u.role !== 'super_admin' && <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u._id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={18}/></Button>}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {tab === 'documents' && (
//                   <div className="grid grid-cols-1 divide-y divide-slate-100">
//                     {filteredDocs.map(d => (
//                       <div key={d._id} className="p-4 lg:p-6 hover:bg-slate-50/30 transition-all flex flex-col gap-4">
//                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                           <div className="flex flex-col gap-1.5">
//                             <span className="font-bold text-slate-900 text-lg leading-tight">{d.title}</span>
//                             <div className="flex items-center gap-1.5 text-slate-400">
//                               <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-[10px] text-sky-700 font-bold uppercase">{d.owner?.full_name?.charAt(0)}</div>
//                               <span className="text-[11px] font-medium italic">{d.owner?.full_name}</span>
//                               <span className="mx-1">•</span>
//                               <span className="text-[10px]">{safeFormatDate(d.createdAt, 'd MMM, yyyy')}</span>
//                             </div>
//                           </div>
//                           <Badge className={`w-fit px-3 py-1 rounded-full font-bold text-[10px] ${d.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
//                             {d.status?.toUpperCase()}
//                           </Badge>
//                         </div>
                        
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mt-2">
//                           {d.parties?.map((p, idx) => (
//                             <div key={idx} className="p-4 border border-slate-100 rounded-2xl bg-[#FCFDFF] shadow-sm">
//                               <div className="flex justify-between items-start mb-3">
//                                 <div className="flex flex-col">
//                                   <span className="font-extrabold text-slate-800 text-sm">{p.name}</span>
//                                   <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate max-w-[150px]"><Mail size={10}/>{p.email}</span>
//                                 </div>
//                                 <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${p.status === 'signed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
//                                   {p.status}
//                                 </div>
//                               </div>
//                               <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-2 border-t border-slate-50">
//                                 <div className="flex items-center gap-1.5 font-medium"><Globe size={11} className="text-slate-300"/>{p.ipAddress || '---'}</div>
//                                 <div className="flex items-center gap-1.5 font-medium"><MapPin size={11} className="text-slate-300"/>{p.location || 'Unknown'}</div>
//                                 <div className="col-span-2 flex items-center gap-1.5 font-medium truncate"><Laptop size={11} className="text-slate-300"/>{p.device || 'Mobile/PC'}</div>
//                                 {p.signedAt && <div className="col-span-2 flex items-center gap-1.5 font-bold text-emerald-600 mt-1 bg-emerald-50/50 p-1 rounded-md"><Calendar size={11}/> {safeFormatDate(p.signedAt)}</div>}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {tab === 'logs' && (
//                   <div className="grid grid-cols-1 divide-y divide-slate-100">
//                     {filteredLogs.map(log => (
//                       <div key={log._id} className="p-4 flex flex-col gap-2 hover:bg-slate-50/30">
//                         <div className="flex justify-between items-start">
//                           <div className="flex flex-col">
//                             <span className="font-bold text-slate-900 text-sm">{log.performed_by?.name || 'System'}</span>
//                             <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{log.performed_by?.email}</span>
//                           </div>
//                           <span className="text-[10px] text-slate-500 font-bold italic">{safeFormatDate(log.timestamp, 'hh:mm aa, d MMM')}</span>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <Badge variant="outline" className="text-[9px] font-black border-slate-200 text-slate-600 uppercase tracking-tighter bg-slate-50">{log.action}</Badge>
//                           <span className="text-xs text-slate-600 font-bold truncate">Doc: {log.document_id?.title || 'N/A'}</span>
//                         </div>
//                       </div>
//                     ))}
//                     <div className="flex items-center justify-between p-6 bg-slate-50/20">
//                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pg {logPage}</p>
//                       <div className="flex gap-2">
//                         <Button onClick={() => fetchLogs(logPage - 1)} disabled={logPage === 1 || loading.logs} variant="outline" size="sm" className="rounded-xl bg-white h-9 w-9 p-0 shadow-sm"><ChevronLeft size={18}/></Button>
//                         <Button onClick={() => fetchLogs(logPage + 1)} disabled={!hasMoreLogs || loading.logs} variant="outline" size="sm" className="rounded-xl bg-white h-9 w-9 p-0 shadow-sm"><ChevronRight size={18}/></Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </Card>
//       </Tabs>
//     </div>
//   );
// }
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Card } from '@/components/ui/Card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Shield, Users, FileText, CheckCircle2, Clock, Search, Trash2, Loader2, Activity, ChevronLeft, ChevronRight, MapPin, Globe, Laptop, Mail, Calendar, Plus } from 'lucide-react';
// import { format, isValid } from 'date-fns';
// import StatsCard from '../components/dashboard/StatsCard';
// import { toast } from 'sonner';

// export default function AdminDashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [tab, setTab] = useState('users');
//   const [search, setSearch] = useState('');
  
//   const [users, setUsers] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [logs, setLogs] = useState([]); 
  
//   const [loading, setLoading] = useState({ users: true, docs: true, logs: true });
//   const [logPage, setLogPage] = useState(1);
//   const [hasMoreLogs, setHasMoreLogs] = useState(true);

//   const fetchUsers = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/users');
//       setUsers(Array.isArray(res.data) ? res.data : []);
//     } catch (err) { toast.error("User list error"); }
//     finally { setLoading(prev => ({ ...prev, users: false })); }
//   }, []);

//   const fetchDocs = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/documents');
//       setDocuments(Array.isArray(res.data) ? res.data : []);
//     } catch (err) { toast.error("Docs error"); }
//     finally { setLoading(prev => ({ ...prev, docs: false })); }
//   }, []);

//   const fetchLogs = useCallback(async (pageNo = 1) => {
//     setLoading(prev => ({ ...prev, logs: true }));
//     try {
//       const res = await api.get(`/admin/audit-logs?page=${pageNo}`);
//       const newData = Array.isArray(res.data) ? res.data : [];
//       setLogs(newData);
//       setHasMoreLogs(newData.length === 10);
//       setLogPage(pageNo);
//     } catch (err) { toast.error("Logs error"); }
//     finally { setLoading(prev => ({ ...prev, logs: false })); }
//   }, []);

//   const refreshAll = () => {
//     setLoading({ users: true, docs: true, logs: true });
//     fetchUsers();
//     fetchDocs();
//     fetchLogs(1);
//   };

//   useEffect(() => {
//     if (authLoading) return;
//     if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
//       navigate('/dashboard'); return;
//     }
//     refreshAll();
//   }, [user, authLoading]);

//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm("Are you sure?")) return;
//     try {
//       await api.delete(`/admin/users/${userId}`);
//       setUsers(users.filter(u => u._id !== userId));
//       toast.success("User deleted");
//     } catch (error) { toast.error("Delete failed"); }
//   };

//   const safeFormatDate = (dateStr, fStr = 'hh:mm aa, d MMM yyyy') => {
//     const d = new Date(dateStr);
//     return isValid(d) ? format(d, fStr) : 'N/A';
//   };

//   const filteredUsers = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
//   const filteredDocs = documents.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()));
//   const filteredLogs = logs.filter(l => !search || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase()));

//   if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-sky-600 w-10 h-10" /></div>;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
//         <div>
//           <div className="flex items-center gap-2 mb-1">
//             <Shield className="text-sky-600 w-5 h-5" />
//             <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Administrator Control</span>
//           </div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
//              Welcome, {user?.full_name || 'Admin'} 👋
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400 mt-1">পুরো সিস্টেমের অ্যাক্টিভিটি এখান থেকে মনিটর করুন</p>
//         </div>
        
//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//           <Link to="/DocumentEditor" className="w-full sm:w-auto">
//             <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 shadow-lg px-6">
//               <Plus className="w-4 h-4" /> New Document
//             </Button>
//           </Link>
//           <Button onClick={refreshAll} variant="outline" className="rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-sm px-6">
//             <Activity size={16} className="mr-2 text-emerald-500 animate-pulse"/> Sync Data
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
//         <StatsCard label="Total Users" value={users.length} icon={Users} color="sky" />
//         <StatsCard label="Documents" value={documents.length} icon={FileText} color="violet" />
//         <StatsCard label="Completed" value={documents.filter(d => d.status === 'completed').length} icon={CheckCircle2} color="green" />
//         <StatsCard label="Pending" value={documents.filter(d => d.status === 'in_progress').length} icon={Clock} color="amber" />
//       </div>

//       <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="space-y-6">
//         <TabsList className="bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-xl w-full md:w-fit flex border border-slate-200/50 dark:border-slate-800">
//           <TabsTrigger value="users" className="flex-1 md:flex-none rounded-lg px-6 font-semibold dark:data-[state=active]:bg-slate-800">Users</TabsTrigger>
//           <TabsTrigger value="documents" className="flex-1 md:flex-none rounded-lg px-6 font-semibold dark:data-[state=active]:bg-slate-800">Docs</TabsTrigger>
//           <TabsTrigger value="logs" className="flex-1 md:flex-none rounded-lg px-6 font-semibold dark:data-[state=active]:bg-slate-800">Logs</TabsTrigger>
//         </TabsList>

//         <Card className="rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border-none bg-white dark:bg-slate-900 overflow-hidden">
//           <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
//             <div className="relative w-full md:max-w-sm">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <Input 
//                 placeholder={`Search ${tab}...`} 
//                 value={search} 
//                 onChange={e => setSearch(e.target.value)} 
//                 className="pl-11 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 h-12 transition-all w-full text-slate-900 dark:text-slate-100" 
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-slate-400">Total:</span>
//               <Badge className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-none font-bold">
//                 {tab === 'users' ? filteredUsers.length : tab === 'documents' ? filteredDocs.length : filteredLogs.length}
//               </Badge>
//             </div>
//           </div>

//           <div className="p-0">
//             {loading[tab] ? (
//               <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
//                 <Loader2 className="animate-spin w-8 h-8 text-sky-500" />
//                 <p className="font-medium animate-pulse">Syncing Database...</p>
//               </div>
//             ) : (
//               <div className="w-full">
//                 {tab === 'users' && (
//                   <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800 md:block">
//                     <div className="hidden md:grid md:grid-cols-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 font-bold text-slate-700 dark:text-slate-300 text-sm">
//                       <span>User Details</span><span>Access Role</span><span>Join Date</span><span className="text-right">Manage</span>
//                     </div>
//                     {filteredUsers.map(u => (
//                       <div key={u._id} className="p-4 md:grid md:grid-cols-4 md:items-center hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all flex flex-col gap-3">
//                         <div className="flex flex-col">
//                           <span className="font-bold text-slate-900 dark:text-slate-100">{u.full_name}</span>
//                           <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10}/>{u.email}</span>
//                         </div>
//                         <div className="flex items-center md:block">
//                           <Badge className={`rounded-md font-bold text-[10px] ${u.role === 'super_admin' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`} variant="outline">{u.role?.toUpperCase()}</Badge>
//                         </div>
//                         <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{safeFormatDate(u.createdAt, 'd MMM, yyyy')}</span>
//                         <div className="md:text-right">
//                           {u.role !== 'super_admin' && <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u._id)} className="text-slate-300 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-all"><Trash2 size={18}/></Button>}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {tab === 'documents' && (
//                   <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">
//                     {filteredDocs.map(d => (
//                       <div key={d._id} className="p-4 lg:p-6 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all flex flex-col gap-4 text-slate-900 dark:text-slate-100">
//                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                           <div className="flex flex-col gap-1.5">
//                             <span className="font-bold text-lg leading-tight">{d.title}</span>
//                             <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
//                               <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-[10px] text-sky-700 dark:text-sky-400 font-bold uppercase">{d.owner?.full_name?.charAt(0)}</div>
//                               <span className="text-[11px] font-medium italic">{d.owner?.full_name}</span>
//                               <span className="mx-1">•</span>
//                               <span className="text-[10px]">{safeFormatDate(d.createdAt, 'd MMM, yyyy')}</span>
//                             </div>
//                           </div>
//                           <Badge className={`w-fit px-3 py-1 rounded-full font-bold text-[10px] ${d.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400'}`}>
//                             {d.status?.toUpperCase()}
//                           </Badge>
//                         </div>
//                         {/* Parties loop omitted for brevity, ensure it's closed correctly */}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {tab === 'logs' && (
//                   <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">
//                     {filteredLogs.map(log => (
//                       <div key={log._id} className="p-4 flex flex-col gap-2 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all">
//                         <div className="flex justify-between items-start">
//                           <div className="flex flex-col">
//                             <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{log.performed_by?.name || 'System'}</span>
//                             <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[200px]">{log.performed_by?.email}</span>
//                           </div>
//                           <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold italic">{safeFormatDate(log.timestamp, 'hh:mm aa, d MMM')}</span>
//                         </div>
//                       </div>
//                     ))}
//                     <div className="flex items-center justify-between p-6 bg-slate-50/20 dark:bg-slate-900/20 border-t dark:border-slate-800">
//                       <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Pg {logPage}</p>
//                       <div className="flex gap-2">
//                         <Button onClick={() => fetchLogs(logPage - 1)} disabled={logPage === 1 || loading.logs} variant="outline" size="sm" className="rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 h-9 w-9 p-0 shadow-sm"><ChevronLeft size={18}/></Button>
//                         <Button onClick={() => fetchLogs(logPage + 1)} disabled={!hasMoreLogs || loading.logs} variant="outline" size="sm" className="rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 h-9 w-9 p-0 shadow-sm"><ChevronRight size={18}/></Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </Card>
//       </Tabs>
//     </div>
//   );
// }
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Card } from '@/components/ui/Card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { 
//   Shield, Users, FileText, CheckCircle2, Clock, Search, 
//   Trash2, Loader2, Activity, ChevronLeft, ChevronRight, 
//   MapPin, Globe, Laptop, Mail, Calendar, Plus 
// } from 'lucide-react';
// import { format, isValid } from 'date-fns';
// import StatsCard from '../components/dashboard/StatsCard';
// import { toast } from 'sonner';

// export default function AdminDashboard() {
//   const { user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const [tab, setTab] = useState('users');
//   const [search, setSearch] = useState('');
  
//   const [users, setUsers] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [logs, setLogs] = useState([]); 
  
//   const [loading, setLoading] = useState({ users: true, docs: true, logs: true });
//   const [logPage, setLogPage] = useState(1);
//   const [hasMoreLogs, setHasMoreLogs] = useState(true);

//   const fetchUsers = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/users');
//       setUsers(Array.isArray(res.data) ? res.data : []);
//     } catch (err) { toast.error("User list error"); }
//     finally { setLoading(prev => ({ ...prev, users: false })); }
//   }, []);

//   const fetchDocs = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/documents');
//       setDocuments(Array.isArray(res.data) ? res.data : []);
//     } catch (err) { toast.error("Docs error"); }
//     finally { setLoading(prev => ({ ...prev, docs: false })); }
//   }, []);

//   const fetchLogs = useCallback(async (pageNo = 1) => {
//     setLoading(prev => ({ ...prev, logs: true }));
//     try {
//       const res = await api.get(`/admin/audit-logs?page=${pageNo}`);
//       const newData = Array.isArray(res.data) ? res.data : [];
//       setLogs(newData);
//       setHasMoreLogs(newData.length === 10);
//       setLogPage(pageNo);
//     } catch (err) { toast.error("Logs error"); }
//     finally { setLoading(prev => ({ ...prev, logs: false })); }
//   }, []);

//   const refreshAll = () => {
//     setLoading({ users: true, docs: true, logs: true });
//     fetchUsers();
//     fetchDocs();
//     fetchLogs(1);
//   };

//   useEffect(() => {
//     if (authLoading) return;
//     if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
//       navigate('/dashboard'); return;
//     }
//     refreshAll();
//   }, [user, authLoading]);

//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm("Are you sure?")) return;
//     try {
//       await api.delete(`/admin/users/${userId}`);
//       setUsers(users.filter(u => u._id !== userId));
//       toast.success("User deleted");
//     } catch (error) { toast.error("Delete failed"); }
//   };

//   const safeFormatDate = (dateStr, fStr = 'hh:mm aa, d MMM yyyy') => {
//     const d = new Date(dateStr);
//     return isValid(d) ? format(d, fStr) : 'N/A';
//   };

//   const filteredUsers = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
//   const filteredDocs = documents.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()));
//   const filteredLogs = logs.filter(l => !search || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase()));

//   if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-sky-600 w-10 h-10" /></div>;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
      
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
//         <div>
//           <div className="flex items-center gap-2 mb-1">
//             <Shield className="text-sky-600 w-5 h-5" />
//             <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Administrator Control</span>
//           </div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
//              Welcome, {user?.full_name || 'Admin'} 👋
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400 mt-1">সিস্টেমের সকল কার্যক্রম এখান থেকে পরিচালনা করুন</p>
//         </div>
        
//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//           <Link to="/DocumentEditor" className="w-full sm:w-auto">
//             <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 shadow-lg px-6 font-bold">
//               <Plus className="w-4 h-4" /> New Document
//             </Button>
//           </Link>
//           <Button onClick={refreshAll} variant="outline" className="rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-sm px-6">
//             <Activity size={16} className="mr-2 text-emerald-500 animate-pulse"/> Sync Data
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
//         <StatsCard label="Total Users" value={users.length} icon={Users} color="sky" />
//         <StatsCard label="Documents" value={documents.length} icon={FileText} color="violet" />
//         <StatsCard label="Completed" value={documents.filter(d => d.status === 'completed').length} icon={CheckCircle2} color="green" />
//         <StatsCard label="Pending" value={documents.filter(d => d.status === 'in_progress').length} icon={Clock} color="amber" />
//       </div>

//       <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="space-y-6">
//         <TabsList className="bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-xl w-full md:w-fit flex border border-slate-200/50 dark:border-slate-800">
//           <TabsTrigger value="users" className="flex-1 md:flex-none rounded-lg px-6 font-semibold dark:data-[state=active]:bg-slate-800">Users</TabsTrigger>
//           <TabsTrigger value="documents" className="flex-1 md:flex-none rounded-lg px-6 font-semibold dark:data-[state=active]:bg-slate-800">Docs</TabsTrigger>
//           <TabsTrigger value="logs" className="flex-1 md:flex-none rounded-lg px-6 font-semibold dark:data-[state=active]:bg-slate-800">Logs</TabsTrigger>
//         </TabsList>

//         <Card className="rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border-none bg-white dark:bg-slate-900 overflow-hidden transition-all">
//           <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
//             <div className="relative w-full md:max-w-sm">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <Input 
//                 placeholder={`Search ${tab}...`} 
//                 value={search} 
//                 onChange={e => setSearch(e.target.value)} 
//                 className="pl-11 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 h-12 transition-all w-full text-slate-900 dark:text-slate-100" 
//               />
//             </div>
//             <Badge className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-none font-bold">
//                Count: {tab === 'users' ? filteredUsers.length : tab === 'documents' ? filteredDocs.length : filteredLogs.length}
//             </Badge>
//           </div>

//           <div className="p-0">
//             {loading[tab] ? (
//               <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
//                 <Loader2 className="animate-spin w-8 h-8 text-sky-500" />
//                 <p className="font-medium animate-pulse">Fetching Data...</p>
//               </div>
//             ) : (
//               <div className="w-full">
                
//                 {/* Users View */}
//                 {tab === 'users' && (
//                   <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800 md:block">
//                     <div className="hidden md:grid md:grid-cols-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 font-bold text-slate-700 dark:text-slate-300 text-sm">
//                       <span>User Details</span><span>Role</span><span>Joined At</span><span className="text-right">Actions</span>
//                     </div>
//                     {filteredUsers.map(u => (
//                       <div key={u._id} className="p-4 md:grid md:grid-cols-4 md:items-center hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all flex flex-col gap-3">
//                         <div className="flex flex-col">
//                           <span className="font-bold text-slate-900 dark:text-slate-100">{u.full_name}</span>
//                           <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10}/>{u.email}</span>
//                         </div>
//                         <Badge variant="outline" className="w-fit dark:border-slate-700">{u.role?.toUpperCase()}</Badge>
//                         <span className="text-xs text-slate-500 dark:text-slate-400">{safeFormatDate(u.createdAt, 'd MMM, yyyy')}</span>
//                         <div className="md:text-right">
//                           {u.role !== 'super_admin' && <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u._id)} className="text-slate-300 hover:text-red-500 dark:hover:text-red-400"><Trash2 size={18}/></Button>}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Documents View - ALL DETAILS RESTORED */}
//                 {tab === 'documents' && (
//                   <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">
//                     {filteredDocs.map(d => (
//                       <div key={d._id} className="p-4 lg:p-6 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all flex flex-col gap-6">
//                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                           <div className="flex flex-col gap-1.5">
//                             <span className="font-bold text-slate-900 dark:text-slate-100 text-xl tracking-tight">{d.title}</span>
//                             <div className="flex items-center gap-2 text-slate-400 text-[11px]">
//                                 <span className="font-medium italic">Owner: {d.owner?.full_name}</span>
//                                 <span className="mx-1">•</span>
//                                 <span className="flex items-center gap-1"><Calendar size={10}/> {safeFormatDate(d.createdAt, 'd MMM, yyyy')}</span>
//                             </div>
//                           </div>
//                           <Badge className={`w-fit px-4 py-1.5 rounded-full font-bold text-[10px] shadow-sm ${d.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-sky-50 text-sky-600 border-sky-100'}`} variant="outline">
//                             {d.status?.toUpperCase()}
//                           </Badge>
//                         </div>
                        
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           {d.parties?.map((p, idx) => (
//                             <div key={idx} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-[#FCFDFF] dark:bg-slate-950/50 shadow-sm">
//                               <div className="flex justify-between items-start mb-3">
//                                 <div className="flex flex-col">
//                                     <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{p.name}</span>
//                                     <span className="text-[10px] text-slate-400">{p.email}</span>
//                                 </div>
//                                 <Badge variant="outline" className={`text-[9px] font-bold ${p.status === 'signed' ? 'text-emerald-500 bg-emerald-50/30' : 'text-amber-500 bg-amber-50/30'}`}>
//                                   {p.status?.toUpperCase()}
//                                 </Badge>
//                               </div>

//                               <div className="grid grid-cols-2 gap-y-2 mt-4 pt-4 border-t dark:border-slate-800/50">
//                                 <div className="flex items-center gap-2 text-slate-500">
//                                   <Globe size={11} className="text-slate-300"/>
//                                   <span className="text-[10px]">IP: <span className="text-slate-700 dark:text-slate-300">{p.ipAddress || '---'}</span></span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-slate-500">
//                                   <MapPin size={11} className="text-slate-300"/>
//                                   <span className="text-[10px]">Loc: <span className="text-slate-700 dark:text-slate-300 truncate">{p.location || '---'}</span></span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-slate-500">
//                                   <Laptop size={11} className="text-slate-300"/>
//                                   <span className="text-[10px]">Dev: <span className="text-slate-700 dark:text-slate-300 truncate">{p.device || '---'}</span></span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-slate-500">
//                                   <Clock size={11} className="text-slate-300"/>
//                                   <span className="text-[10px]">Time: <span className="text-slate-700 dark:text-slate-300">{p.signedAt ? safeFormatDate(p.signedAt, 'hh:mm aa, d MMM') : '---'}</span></span>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Logs View */}
//                 {tab === 'logs' && (
//                   <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">
//                     {filteredLogs.map(log => (
//                       <div key={log._id} className="p-4 flex flex-col gap-2 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all">
//                         <div className="flex justify-between items-start">
//                           <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{log.performed_by?.name || 'System'}</span>
//                           <span className="text-[10px] text-slate-500">{safeFormatDate(log.timestamp, 'hh:mm aa')}</span>
//                         </div>
//                         <Badge variant="outline" className="w-fit text-[9px] bg-slate-50 dark:bg-slate-800">{log.action}</Badge>
//                       </div>
//                     ))}
//                     <div className="flex items-center justify-between p-6 bg-slate-50/20 dark:bg-slate-900/20 border-t dark:border-slate-800">
//                       <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Page {logPage}</p>
//                       <div className="flex gap-2">
//                         <Button onClick={() => fetchLogs(logPage - 1)} disabled={logPage === 1} variant="outline" size="sm" className="rounded-xl h-9 w-9 p-0 dark:bg-slate-800"><ChevronLeft size={18}/></Button>
//                         <Button onClick={() => fetchLogs(logPage + 1)} disabled={!hasMoreLogs} variant="outline" size="sm" className="rounded-xl h-9 w-9 p-0 dark:bg-slate-800"><ChevronRight size={18}/></Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </Card>
//       </Tabs>
//     </div>
//   );
// }
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Users, FileText, CheckCircle2, Clock, Search, 
  Trash2, Loader2, Activity, ChevronLeft, ChevronRight, 
  MapPin, Globe, Laptop, Mail, Calendar, Plus, History 
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import StatsCard from '../components/dashboard/StatsCard';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]); 
  
  const [loading, setLoading] = useState({ users: true, docs: true, logs: true });
  const [logPage, setLogPage] = useState(1);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);

  // --- Data Fetching Functions ---
  const fetchUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await api.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : (res.data?.users || []));
    } catch (err) { toast.error("User list error"); }
    finally { setLoading(prev => ({ ...prev, users: false })); }
  }, []);

  const fetchDocs = useCallback(async () => {
    setLoading(prev => ({ ...prev, docs: true }));
    try {
      const res = await api.get('/admin/documents');
      setDocuments(Array.isArray(res.data) ? res.data : (res.data?.documents || []));
    } catch (err) { toast.error("Docs error"); }
    finally { setLoading(prev => ({ ...prev, docs: false })); }
  }, []);

  const fetchLogs = useCallback(async (pageNo = 1) => {
    setLoading(prev => ({ ...prev, logs: true }));
    try {
      const res = await api.get(`/admin/audit-logs?page=${pageNo}`);
      // Audit log backend sometimes wraps data in 'logs' or 'data' property
      const logData = res.data?.logs || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setLogs(logData);
      setHasMoreLogs(logData.length >= 10);
      setLogPage(pageNo);
    } catch (err) { 
      console.error("Log fetch error:", err);
      toast.error("Audit logs could not be loaded"); 
    }
    finally { setLoading(prev => ({ ...prev, logs: false })); }
  }, []);

  const refreshAll = () => {
    fetchUsers();
    fetchDocs();
    fetchLogs(1);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      navigate('/dashboard'); return;
    }
    refreshAll();
  }, [user, authLoading]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success("User deleted successfully");
    } catch (error) { toast.error("Delete failed"); }
  };

  const safeFormatDate = (dateStr, fStr = 'hh:mm aa, d MMM yyyy') => {
    const d = new Date(dateStr);
    return isValid(d) ? format(d, fStr) : 'N/A';
  };

  // --- Filtering Logic ---
  const filteredUsers = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredDocs = documents.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredLogs = logs.filter(l => !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()));

  if (authLoading) return <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4"><Loader2 className="animate-spin text-sky-600 w-12 h-12" /><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Authenticating...</p></div>;

  return (
    <div className="w-full mx-auto px-4 md:px-8 py-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans transition-all">
      
      {/* Header Container */}
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-sky-600 w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600">Secure Admin Environment</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Management Console</h1>
        </div>
        
        <div className="flex gap-3">
          <Link to="/DocumentEditor">
            <Button className="bg-sky-600 hover:bg-sky-700 text-white rounded-2xl px-8 h-12 font-black shadow-xl shadow-sky-200 dark:shadow-none transition-transform active:scale-95">
              <Plus className="mr-2 w-5 h-5" /> NEW DOC
            </Button>
          </Link>
          <Button onClick={refreshAll} variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50">
            <Activity size={18} className={`mr-2 text-emerald-500 ${(loading.users || loading.docs) ? 'animate-spin' : 'animate-pulse'}`}/> REFRESH
          </Button>
        </div>
      </div>

      {/* Dynamic Tabs Section */}
      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="max-w-[1600px] mx-auto space-y-8">
        <TabsList className="bg-slate-200/40 dark:bg-slate-900/50 p-1.5 rounded-[20px] w-full md:w-fit border border-slate-200/50 dark:border-slate-800">
          <TabsTrigger value="users" className="px-12 py-3 text-[10px] font-black uppercase tracking-widest">Users</TabsTrigger>
          <TabsTrigger value="documents" className="px-12 py-3 text-[10px] font-black uppercase tracking-widest">Documents</TabsTrigger>
          <TabsTrigger value="logs" className="px-12 py-3 text-[10px] font-black uppercase tracking-widest">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Global Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <Input 
              placeholder={`Search across ${tab} records...`} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-14 border-none bg-transparent h-14 text-base focus-visible:ring-0 placeholder:text-slate-300 font-medium" 
            />
          </div>
          {loading[tab] && <Loader2 className="animate-spin text-sky-500 mr-4 w-5 h-5" />}
        </div>

        {/* Main Content Area with Loading States */}
        <div className="transition-all duration-500">
          {loading[tab] ? (
            <div className="flex flex-col items-center justify-center py-40 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
               <div className="relative h-20 w-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-sky-100 dark:border-sky-900/30"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
               </div>
               <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Retrieving Secure Data...</p>
            </div>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Documents View - Full Grid Logic */}
              {tab === 'documents' && (
                <div className="flex flex-col gap-10">
                  {filteredDocs.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest">No Documents Found</div>
                  ) : filteredDocs.map(d => (
                    <Card key={d._id} className="rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                      <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="space-y-3">
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{d.title}</h2>
                          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full"><Users size={14} className="text-sky-500"/> OWNER: {d.owner?.full_name}</span>
                            <span className="flex items-center gap-2"><Calendar size={14} className="text-sky-500"/> {safeFormatDate(d.createdAt)}</span>
                          </div>
                        </div>
                        <Badge className={`px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] ${d.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white'}`}>
                          {d.status}
                        </Badge>
                      </div>
                      
                      <div className={`p-10 grid gap-8 ${d.parties?.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                        {d.parties?.map((p, idx) => (
                          <div key={idx} className="p-8 border-2 border-slate-50 dark:border-slate-800 rounded-[2.5rem] bg-[#FCFEFF] dark:bg-slate-950/40 hover:border-sky-100 transition-colors">
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-900 dark:text-slate-100 text-lg uppercase tracking-tight">{p.name}</h4>
                                    <p className="text-[11px] font-bold text-slate-400">{p.email}</p>
                                </div>
                                <div className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${p.status === 'signed' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                  {p.status}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 pt-8 border-t border-slate-50 dark:border-slate-800">
                              <InfoLine icon={<Globe size={14}/>} label="IP" value={p.ipAddress}/>
                              <InfoLine icon={<MapPin size={14}/>} label="LOC" value={p.location}/>
                              <InfoLine icon={<Laptop size={14}/>} label="DEV" value={p.device}/>
                              <InfoLine icon={<Clock size={14}/>} label="TIME" value={p.signedAt ? safeFormatDate(p.signedAt, 'hh:mm aa') : '---'} color="text-sky-600"/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Audit Logs View - REPAIRED */}
              {tab === 'logs' && (
                <Card className="rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                   <div className="p-10">
                      <div className="flex items-center gap-3 mb-8">
                        <History className="text-sky-500" size={24}/>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">SYSTEM AUDIT TRAIL</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-50 dark:border-slate-800">
                              <th className="pb-6 px-4">PERFORMED BY</th>
                              <th className="pb-6 px-4">ACTION</th>
                              <th className="pb-6 px-4">TIMESTAMP</th>
                              <th className="pb-6 px-4 text-right">STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredLogs.length === 0 ? (
                              <tr><td colSpan="4" className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">No Activity Records Found</td></tr>
                            ) : filteredLogs.map((log, i) => (
                              <tr key={log._id || i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                <td className="py-6 px-4">
                                  <div className="font-bold text-slate-900 dark:text-white text-sm">{log.performed_by?.name || log.performed_by?.full_name || 'System'}</div>
                                  <div className="text-[10px] text-slate-400 font-medium">{log.performed_by?.email || 'automated@system.com'}</div>
                                </td>
                                <td className="py-6 px-4">
                                  <Badge className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none uppercase px-3 py-1">{log.action}</Badge>
                                </td>
                                <td className="py-6 px-4 text-[11px] font-bold text-slate-500 uppercase">{safeFormatDate(log.timestamp || log.createdAt)}</td>
                                <td className="py-6 px-4 text-right"><div className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination UI */}
                      <div className="mt-10 pt-10 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Records Page {logPage}</p>
                          <div className="flex gap-4">
                            <Button onClick={() => fetchLogs(logPage - 1)} disabled={logPage === 1} variant="outline" className="rounded-xl h-12 w-12 p-0 border-slate-200"><ChevronLeft size={20}/></Button>
                            <Button onClick={() => fetchLogs(logPage + 1)} disabled={!hasMoreLogs} variant="outline" className="rounded-xl h-12 w-12 p-0 border-slate-200"><ChevronRight size={20}/></Button>
                          </div>
                      </div>
                   </div>
                </Card>
              )}

              {/* Users View */}
              {tab === 'users' && (
                <Card className="rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-10">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-50 dark:border-slate-800">
                          <th className="pb-6 px-4">USER PROFILE</th>
                          <th className="pb-6 px-4">PERMISSION</th>
                          <th className="pb-6 px-4">JOINED DATE</th>
                          <th className="pb-6 px-4 text-right">OPERATIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {filteredUsers.map(u => (
                          <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                            <td className="py-6 px-4">
                              <div className="font-bold text-slate-900 dark:text-white text-base">{u.full_name}</div>
                              <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                            </td>
                            <td className="py-6 px-4"><Badge variant="outline" className="text-[9px] font-black uppercase px-4 py-1 border-slate-200">{u.role}</Badge></td>
                            <td className="py-6 px-4 text-[11px] font-black text-slate-500 uppercase">{safeFormatDate(u.createdAt, 'd MMM, yyyy')}</td>
                            <td className="py-6 px-4 text-right">
                              {u.role !== 'super_admin' && <Button onClick={() => handleDeleteUser(u._id)} className="text-slate-300 hover:text-red-500 rounded-2xl h-12 w-12 p-0 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={20}/></Button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </Card>
              )}

            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}

// Helper Component for Documents
function InfoLine({ icon, label, value, color = "text-slate-700 dark:text-slate-300" }) {
  return (
    <div className="flex justify-between items-center pr-4">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        {React.cloneElement(icon, { size: 12, className: "text-sky-400" })} {label}
      </span>
      <span className={`text-xs font-bold truncate max-w-[140px] ${color}`}>{value || '---'}</span>
    </div>
  );
}