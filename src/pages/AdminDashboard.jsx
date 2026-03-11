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
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, FileText, CheckCircle2, Clock, Search, Trash2, Loader2, Activity, ChevronLeft, ChevronRight, MapPin, Globe, Laptop, Mail } from 'lucide-react';
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

  // ১. ইউজার ডাটা ফেচ
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { toast.error("User list error"); }
    finally { setLoading(prev => ({ ...prev, users: false })); }
  }, []);

  // ২. ডকুমেন্ট ডাটা ফেচ
  const fetchDocs = useCallback(async () => {
    try {
      const res = await api.get('/admin/documents');
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err) { toast.error("Docs error"); }
    finally { setLoading(prev => ({ ...prev, docs: false })); }
  }, []);

  // ৩. অডিট লগ ফেচ (Pagination সহ)
  const fetchLogs = useCallback(async (pageNo = 1) => {
    setLoading(prev => ({ ...prev, logs: true }));
    try {
      const res = await api.get(`/admin/audit-logs?page=${pageNo}`);
      const newData = Array.isArray(res.data) ? res.data : [];
      setLogs(newData);
      setHasMoreLogs(newData.length === 10);
      setLogPage(pageNo);
    } catch (err) { toast.error("Logs error"); }
    finally { setLoading(prev => ({ ...prev, logs: false })); }
  }, []);

  const refreshAll = () => {
    setLoading({ users: true, docs: true, logs: true });
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
      toast.success("User deleted");
    } catch (error) { toast.error("Delete failed"); }
  };

  // তারিখ এবং AM/PM ফরম্যাট করার ফাংশন
  const safeFormatDate = (dateStr, fStr = 'hh:mm aa, d MMM yyyy') => {
    const d = new Date(dateStr);
    return isValid(d) ? format(d, fStr) : 'N/A';
  };

  const filteredUsers = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredDocs = documents.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredLogs = logs.filter(l => !search || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase()));

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 bg-slate-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-100 rounded-lg"><Shield className="text-sky-600 w-6 h-6" /></div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admin Control Panel</h1>
        </div>
        <Button onClick={refreshAll} variant="outline" className="rounded-xl bg-white shadow-sm h-10">
          <Activity size={16} className="mr-2 text-emerald-500"/> Refresh
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatsCard label="Users" value={users.length} icon={Users} color="sky" />
        <StatsCard label="Docs" value={documents.length} icon={FileText} color="violet" />
        <StatsCard label="Done" value={documents.filter(d => d.status === 'completed').length} icon={CheckCircle2} color="green" />
        <StatsCard label="Active" value={documents.filter(d => d.status === 'in_progress').length} icon={Clock} color="amber" />
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="mb-6">
        <TabsList className="bg-white border p-1 w-full sm:w-auto overflow-x-auto justify-start rounded-xl shadow-sm">
          <TabsTrigger value="users" className="px-4 sm:px-8">Users</TabsTrigger>
          <TabsTrigger value="documents" className="px-4 sm:px-8">Documents</TabsTrigger>
          <TabsTrigger value="logs" className="px-4 sm:px-8">Logs</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-2xl overflow-hidden border-slate-200 shadow-lg bg-white">
        <div className="p-4 border-b bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9 rounded-xl border-slate-200 h-10" 
            />
          </div>
          <Badge variant="secondary" className="w-fit self-center">Showing {tab.toUpperCase()}</Badge>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading[tab] ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="animate-spin" /> <p className="text-sm">Loading data...</p>
            </div>
          ) : (
            <>
              {/* Users Tab */}
              {tab === 'users' && (
                <Table className="min-w-[600px]">
                  <TableHeader><TableRow className="bg-slate-50"><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredUsers.map(u => (
                      <TableRow key={u._id} className="hover:bg-slate-50/50">
                        <TableCell><div className="flex flex-col"><span className="font-semibold text-sm">{u.full_name}</span><span className="text-[11px] text-slate-500">{u.email}</span></div></TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{u.role?.toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-xs text-slate-500">{safeFormatDate(u.createdAt, 'd MMM yyyy')}</TableCell>
                        <TableCell className="text-right">
                          {u.role !== 'super_admin' && <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:bg-red-50"><Trash2 size={16}/></Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Documents Tab - UPDATED with Security Info & AM/PM */}
              {tab === 'documents' && (
                <Table className="min-w-[1000px]">
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Document & Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Signers Activity (IP, Device, Location)</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs.map(d => (
                      <TableRow key={d._id} className="align-top hover:bg-slate-50/50">
                        <TableCell className="max-w-[200px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm truncate">{d.title}</span>
                            <span className="text-[10px] text-slate-500">By: {d.owner?.full_name || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge className={d.status === 'completed' ? 'bg-emerald-500' : 'bg-sky-500'}>{d.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {d.parties?.map((p, idx) => (
                              <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/40 text-[11px] space-y-1">
                                <div className="flex justify-between font-bold text-sky-700">
                                  <span>{p.name} ({p.status})</span>
                                  <span className="text-slate-400 font-normal">{p.email}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-slate-500">
                                  <span className="flex items-center gap-1 text-[10px]"><Globe size={12}/> IP: {p.ipAddress || 'N/A'}</span>
                                  <span className="flex items-center gap-1 text-[10px]"><MapPin size={12}/> {p.location || 'N/A'}</span>
                                  <span className="col-span-2 flex items-center gap-1 text-[10px]"><Laptop size={12}/> {p.device || 'Unknown Device'}</span>
                                  {p.signedAt && <span className="col-span-2 text-emerald-600 font-semibold italic">✅ Signed: {safeFormatDate(p.signedAt)}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{safeFormatDate(d.createdAt, 'd MMM yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Logs Tab */}
              {tab === 'logs' && (
                <>
                  <Table className="min-w-[700px]">
                    <TableHeader><TableRow className="bg-slate-50"><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Document</TableHead><TableHead>Time (AM/PM)</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredLogs.map(log => (
                        <TableRow key={log._id} className="hover:bg-slate-50/50">
                          <TableCell><div className="flex flex-col"><span className="font-semibold text-xs">{log.performed_by?.name || 'System'}</span><span className="text-[10px] text-slate-400">{log.performed_by?.email}</span></div></TableCell>
                          <TableCell><Badge variant="outline" className="text-[9px]">{log.action}</Badge></TableCell>
                          <TableCell><span className="text-xs text-slate-600 font-medium">{log.document_id?.title || 'N/A'}</span></TableCell>
                          <TableCell className="text-[10px] text-slate-500">{safeFormatDate(log.timestamp, 'hh:mm aa, d MMM')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-center gap-4 p-4 border-t">
                    <Button onClick={() => fetchLogs(logPage - 1)} disabled={logPage === 1 || loading.logs} variant="outline" size="sm" className="rounded-xl"><ChevronLeft size={16}/></Button>
                    <span className="text-sm font-medium">Page {logPage}</span>
                    <Button onClick={() => fetchLogs(logPage + 1)} disabled={!hasMoreLogs || loading.logs} variant="outline" size="sm" className="rounded-xl"><ChevronRight size={16}/></Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}