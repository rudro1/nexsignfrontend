
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
//   Shield, Users, Clock, Search, 
//   Trash2, Loader2, Activity, ChevronLeft, ChevronRight, 
//   MapPin, Globe, Laptop, Calendar, Plus, History,
//   FileText 
// } from 'lucide-react';
// import { format, isValid } from 'date-fns';
// //import StatsCard from '../components/dashboard/StatsCard';
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

//   // --- Data Fetching Functions ---
//   const fetchUsers = useCallback(async () => {
//     setLoading(prev => ({ ...prev, users: true }));
//     try {
//       const res = await api.get('/admin/users');
//       setUsers(Array.isArray(res.data) ? res.data : (res.data?.users || []));
//     } catch { toast.error("User list error"); }
//     finally { setLoading(prev => ({ ...prev, users: false })); }
//   }, []);

//   const fetchDocs = useCallback(async () => {
//     setLoading(prev => ({ ...prev, docs: true }));
//     try {
//       const res = await api.get('/admin/documents');
//       setDocuments(Array.isArray(res.data) ? res.data : (res.data?.documents || []));
//     } catch  { toast.error("Docs error"); }
//     finally { setLoading(prev => ({ ...prev, docs: false })); }
//   }, []);

//   const fetchLogs = useCallback(async (pageNo = 1) => {
//     setLoading(prev => ({ ...prev, logs: true }));
//     try {
//       const res = await api.get(`/admin/audit-logs?page=${pageNo}`);
//       // Audit log backend sometimes wraps data in 'logs' or 'data' property
//       const logData = res.data?.logs || res.data?.data || (Array.isArray(res.data) ? res.data : []);
//       setLogs(logData);
//       setHasMoreLogs(logData.length >= 10);
//       setLogPage(pageNo);
//     } catch (err) { 
//       console.error("Log fetch error:", err);
//       toast.error("Audit logs could not be loaded"); 
//     }
//     finally { setLoading(prev => ({ ...prev, logs: false })); }
//   }, []);

//   const refreshAll = () => {
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
//       toast.success("User deleted successfully");
//     } catch  { toast.error("Delete failed"); }
//   };

//   const safeFormatDate = (dateStr, fStr = 'hh:mm aa, d MMM yyyy') => {
//     const d = new Date(dateStr);
//     return isValid(d) ? format(d, fStr) : 'N/A';
//   };

//   const handleDeleteDoc = async (docId) => {
//   if (!window.confirm("Are you sure? This will remove access for all parties!")) return;
//   try {
//     await api.delete(`/admin/documents/${docId}`);
//     setDocuments(documents.filter(d => d._id !== docId));
//     toast.success("Document removed successfully");
//   } catch {
//     toast.error("Failed to delete document");
//   }
// };
//   // --- Filtering Logic ---
//   const filteredUsers = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
//   const filteredDocs = documents.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()));
//   const filteredLogs = logs.filter(l => !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()));

//   if (authLoading) return <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4"><Loader2 className="animate-spin text-sky-600 w-12 h-12" /><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Authenticating...</p></div>;

//   return (
//     <div className="w-full mx-auto px-4 md:px-8 py-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen font-sans transition-all">
      
//       {/* Header Container */}
//       <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
//         <div>
//           <div className="flex items-center gap-2 mb-2">
//             <Shield className="text-sky-600 w-5 h-5" />
//             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600">Secure Admin Environment</span>
//           </div>
//           <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Management Console</h1>
//         </div>
        
//         <div className="flex gap-3">
//           <Link to="/DocumentEditor">
//             <Button className="bg-sky-600 hover:bg-sky-700 text-white rounded-2xl px-2 py-4 md:px-8 md:h-12 font-black shadow-xl shadow-sky-200 dark:shadow-none transition-transform active:scale-95">
//               <Plus className="mr-0 md:mr-2 w-5 h-5" /> NEW DOC
//             </Button>
//           </Link>
//           <Button onClick={refreshAll} variant="outline" className="rounded-2xl px-2 py-4 md:px-8  md:h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50">
//             <Activity size={18} className={`mr-2 text-emerald-500 ${(loading.users || loading.docs) ? 'animate-spin' : 'animate-pulse'}`}/> REFRESH
//           </Button>
//         </div>
//       </div>

//       {/* Dynamic Tabs Section */}
//       <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="max-w-[1600px] mx-auto space-y-8">
       
//        <TabsList className="bg-slate-200/40 dark:bg-slate-900/50 p-1.5 rounded-[20px] w-full md:w-fit border">

//                 <TabsTrigger
//                     value="users"
//                       className="px-1 md:px-12 py-3 text-[10px] font-black uppercase tracking-widest
                     
//                      data-[state=active]:bg-transparent data-[state=active]:text-sky-600 boder-0">
//                       Users
//                     </TabsTrigger>

//                    <TabsTrigger
//                      value="documents"
//                         className="px-1 md:px-12 py-3 text-[10px] font-black uppercase tracking-widest
                         
//                           data-[state=active]:bg-transparent data-[state=active]:text-sky-600">
//                            Documents
//                     </TabsTrigger>

//                       <TabsTrigger
//                          value="logs"
//                          className="px-1 md:px-12 py-3 text-[10px] font-black uppercase tracking-widest
                          
//                           data-[state=active]:bg-transparent data-[state=active]:text-sky-600">
//                              Audit Logs
//                          </TabsTrigger>

//                  </TabsList>

//         {/* Global Search Bar */}
//         <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center">
//           <div className="relative flex-1">
//             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
//             <Input 
//               placeholder={`Search across ${tab} records...`} 
//               value={search} 
//               onChange={e => setSearch(e.target.value)} 
//               className="pl-14 border-none bg-transparent h-14 text-base focus-visible:ring-0 placeholder:text-slate-300 font-medium" 
//             />
//           </div>
//           {loading[tab] && <Loader2 className="animate-spin text-sky-500 mr-4 w-5 h-5" />}
//         </div>

//         {/* Main Content Area with Loading States */}
//         <div className="transition-all duration-500">
//           {loading[tab] ? (
//             <div className="flex flex-col items-center justify-center py-40 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
//                <div className="relative h-20 w-20 mb-6">
//                   <div className="absolute inset-0 rounded-full border-4 border-sky-100 dark:border-sky-900/30"></div>
//                   <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
//                </div>
//                <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Retrieving Secure Data...</p>
//             </div>
//           ) : (
//             <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              
//               {/* Documents View - Full Grid Logic */}
             

// {tab === 'documents' && (
//   <div className="flex flex-col gap-6 md:gap-10">
//     {filteredDocs.length === 0 ? (
//       <div className="text-center py-16 md:py-20 text-slate-400 font-bold uppercase text-xs tracking-widest">
//         No Documents Found
//       </div>
//     ) : (
//       filteredDocs.map(d => (
//         <Card
//           key={d._id}
//           className="rounded-[1.5rem] md:rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
//         >
//           {/* HEADER - Responsive Layout */}
//           <div className="p-5 md:p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            
//             <div className="space-y-3 flex-1 min-w-0">
//               <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-tight break-words">
//                 {d.title}
//               </h2>

//               <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
//                 <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
//                   <Users size={12} className="text-sky-500" />
//                   {d.owner?.full_name}
//                 </span>
//                 <span className="flex items-center gap-2">
//                   <Calendar size={12} className="text-sky-500" />
//                   {safeFormatDate(d.createdAt)}
//                 </span>
//               </div>
//             </div>

//             {/* Actions: View, Status, and Delete (Auto-stacks on mobile) */}
//             <div className="flex flex-wrap items-center gap-2 sm:gap-4 border-t lg:border-none pt-4 lg:pt-0">
              
//               {/* VIEW FINAL - Completed Only */}
//               {d.status === 'completed' && d.fileUrl && (
//                 <Button
//                   onClick={() => window.open(d.fileUrl, '_blank')}
//                   className="flex-1 sm:flex-initial bg-white dark:bg-slate-800 text-sky-600 border border-sky-100 hover:bg-sky-50 px-4 h-11 md:h-14 rounded-xl md:rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-sm"
//                 >
//                   <FileText size={16} className="mr-2" />
//                   VIEW
//                 </Button>
//               )}

//               <Badge
//                 className={`flex-1 sm:flex-initial justify-center px-4 h-11 md:h-14 md:px-10 rounded-xl md:rounded-3xl text-[10px] font-black uppercase tracking-[0.2em]
//                   ${d.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white'}
//                 `}
//               >
//                 {d.status}
//               </Badge>

//               <Button
//                 onClick={() => handleDeleteDoc(d._id)}
//                 className="text-slate-300 hover:text-red-500 rounded-xl md:rounded-2xl h-11 w-11 md:h-14 md:w-14 p-0 bg-transparent hover:bg-red-50"
//               >
//                 <Trash2 size={20} />
//               </Button>
//             </div>
//           </div>

//           {/* PARTIES - Responsive Grid */}
//           <div className="p-5 md:p-10 grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
//             {d.parties?.map((p, idx) => (
//               <div key={idx} className="p-5 md:p-8 border-2 border-slate-50 dark:border-slate-800 rounded-2xl md:rounded-[2.5rem] bg-[#FCFEFF] dark:bg-slate-950/40">
//                 <div className="flex justify-between items-start mb-6 gap-2">
//                   <div className="min-w-0">
//                     <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm md:text-base uppercase truncate">{p.name}</h4>
//                     <p className="text-[10px] font-bold text-slate-400 truncate">{p.email}</p>
//                   </div>
//                   <Badge variant="outline" className={`text-[9px] font-black px-2 py-0.5 rounded-full ${p.status === 'signed' ? 'text-emerald-600 border-emerald-100' : 'text-amber-600 border-amber-100'}`}>
//                     {p.status}
//                   </Badge>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
//                   <div className="flex flex-col gap-1">
//                     <span className="text-[9px] font-black text-slate-300 uppercase">IP Address</span>
//                     <span className="text-[11px] font-bold truncate">{p.ipAddress || '---'}</span>
//                   </div>
//                   <div className="flex flex-col gap-1">
//                     <span className="text-[9px] font-black text-slate-300 uppercase">Location</span>
//                     <span className="text-[11px] font-bold truncate">{p.location || '---'}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>
//       ))
//     )}
//   </div>
// )}

//               {/* Audit Logs View - REPAIRED */}
//          {tab === 'logs' && (
//   <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
//     <div className="p-6 md:p-10">

//       {/* Header */}
//       <div className="flex items-center gap-3 mb-6 md:mb-8">
//         <History className="text-sky-500" size={24} />
//         <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
//           SYSTEM AUDIT TRAIL
//         </h3>
//       </div>

//       {/* Table / Cards */}
//       <div className="w-full">
//         <div className="hidden md:block w-full overflow-auto">
//           {/* Desktop Table */}
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-50 dark:border-slate-800">
//                 <th className="pb-4 px-4">PERFORMED BY</th>
//                 <th className="pb-4 px-4">ACTION</th>
//                 <th className="pb-4 px-4">TIMESTAMP</th>
//                 <th className="pb-4 px-4 text-right">STATUS</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
//               {filteredLogs.length === 0 ? (
//                 <tr>
//                   <td colSpan="4" className="py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
//                     No Activity Records Found
//                   </td>
//                 </tr>
//               ) : (
//                 filteredLogs.map((log, i) => (
//                   <tr key={log._id || i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
//                     <td className="py-6 px-4">
//                       <div className="font-bold text-slate-900 dark:text-white text-sm">{log.performed_by?.name || log.performed_by?.full_name || 'System'}</div>
//                       <div className="text-[10px] text-slate-400 font-medium">{log.performed_by?.email || 'automated@system.com'}</div>
//                     </td>
//                     <td className="py-6 px-4">
//                       <Badge className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none uppercase px-3 py-1">
//                         {log.action}
//                       </Badge>
//                     </td>
//                     <td className="py-6 px-4 text-[11px] font-bold text-slate-500 uppercase">{safeFormatDate(log.timestamp || log.createdAt)}</td>
//                     <td className="py-6 px-4 text-right">
//                       <div className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile Cards */}
//         <div className="md:hidden flex flex-col gap-4">
//           {filteredLogs.length === 0 ? (
//             <div className="py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
//               No Activity Records Found
//             </div>
//           ) : (
//             filteredLogs.map((log, i) => (
//               <div key={log._id || i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-md flex flex-col gap-3">
                
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <div className="font-bold text-slate-900 dark:text-white">{log.performed_by?.name || log.performed_by?.full_name || 'System'}</div>
//                     <div className="text-[10px] text-slate-400 font-medium">{log.performed_by?.email || 'automated@system.com'}</div>
//                   </div>
//                   <div className="flex items-center justify-center">
//                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap justify-between items-center gap-2">
//                   <Badge className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none uppercase px-3 py-1">
//                     {log.action}
//                   </Badge>
//                   <div className="text-[11px] font-bold text-slate-500 uppercase">{safeFormatDate(log.timestamp || log.createdAt)}</div>
//                 </div>

//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Pagination */}
//       <div className="mt-6 md:mt-10 pt-6 md:pt-10 border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
//         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//           Records Page {logPage}
//         </p>
//         <div className="flex gap-4">
//           <Button onClick={() => fetchLogs(logPage - 1)} disabled={logPage === 1} variant="outline" className="rounded-xl h-12 w-12 p-0 border-slate-200">
//             <ChevronLeft size={20}/>
//           </Button>
//           <Button onClick={() => fetchLogs(logPage + 1)} disabled={!hasMoreLogs} variant="outline" className="rounded-xl h-12 w-12 p-0 border-slate-200">
//             <ChevronRight size={20}/>
//           </Button>
//         </div>
//       </div>

//     </div>
//   </Card>
// )}

//               {tab === 'users' && (

// <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-4 md:p-10">

// {/* Desktop Table */}

// <div className="hidden md:block">

// <table className="w-full text-left">

// <thead>
// <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-50 dark:border-slate-800">
// <th className="pb-6 px-4">USER PROFILE</th>
// <th className="pb-6 px-4">PERMISSION</th>
// <th className="pb-6 px-4">JOINED DATE</th>
// <th className="pb-6 px-4 text-right">OPERATIONS</th>
// </tr>
// </thead>

// <tbody className="divide-y divide-slate-50 dark:divide-slate-800">

// {filteredUsers.map(u => (

// <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">

// <td className="py-6 px-4">
// <div className="font-bold text-slate-900 dark:text-white text-base">{u.full_name}</div>
// <div className="text-xs text-slate-400 font-medium">{u.email}</div>
// </td>

// <td className="py-6 px-4">
// <Badge variant="outline" className="text-[9px] font-black uppercase px-4 py-1 border-slate-200">
// {u.role}
// </Badge>
// </td>

// <td className="py-6 px-4 text-[11px] font-black text-slate-500 uppercase">
// {safeFormatDate(u.createdAt, 'd MMM, yyyy')}
// </td>

// <td className="py-6 px-4 text-right">

// {u.role !== 'super_admin' && (
// <Button
// onClick={() => handleDeleteUser(u._id)}
// className="text-slate-300 hover:text-red-500 rounded-2xl h-12 w-12 p-0 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20"
// >
// <Trash2 size={20}/>
// </Button>
// )}

// </td>

// </tr>

// ))}

// </tbody>
// </table>

// </div>

// {/* Mobile Card Layout */}

// <div className="md:hidden flex flex-col gap-4">

// {filteredUsers.map(u => (

// <div
// key={u._id}
// className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm"
// >

// <div className="flex justify-between items-start mb-3">

// <div>
// <p className="font-bold text-slate-900 dark:text-white">{u.full_name}</p>
// <p className="text-xs text-slate-400">{u.email}</p>
// </div>

// <Badge variant="outline" className="text-[9px] font-black uppercase px-3 py-1">
// {u.role}
// </Badge>

// </div>

// <div className="flex justify-between items-center">

// <p className="text-xs font-bold text-slate-500 uppercase">
// {safeFormatDate(u.createdAt, 'd MMM, yyyy')}
// </p>

// {u.role !== 'super_admin' && (

// <Button
// onClick={() => handleDeleteUser(u._id)}
// className="text-slate-400 hover:text-red-500 rounded-xl h-9 w-9 p-0 bg-transparent"
// >
// <Trash2 size={18}/>
// </Button>

// )}

// </div>

// </div>

// ))}

// </div>

// </Card>

// )}

//             </div>
//           )}
//         </div>
//       </Tabs>
//     </div>
//   );
// }

// // Helper Component for Documents
// function InfoLine({ icon, label, value, color = "text-slate-700 dark:text-slate-300" }) {
//   return (
//     <div className="flex justify-between items-center pr-4">
//       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
//         {React.cloneElement(icon, { size: 12, className: "text-sky-400" })} {label}
//       </span>
//       <span className={`text-xs font-bold truncate max-w-[140px] ${color}`}>{value || '---'}</span>
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
  Shield, Users, Clock, Search, 
  Trash2, Loader2, Activity, ChevronLeft, ChevronRight, 
  Calendar, Plus, History, FileText 
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]); 
  
  const [loading, setLoading] = useState({ users: true, docs: true, logs: true });
  const [logPage, setLogPage] = useState(1);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);

  // ১. ডেটা ফেচিং (Users)
  const fetchUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await api.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : (res.data?.users || []));
    } catch { toast.error("Failed to load user list"); }
    finally { setLoading(prev => ({ ...prev, users: false })); }
  }, []);

  // ২. ডেটা ফেচিং (Documents)
  const fetchDocs = useCallback(async () => {
    setLoading(prev => ({ ...prev, docs: true }));
    try {
      const res = await api.get('/admin/documents');
      const data = Array.isArray(res.data) ? res.data : (res.data?.documents || []);
      setDocuments(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch { toast.error("Failed to load documents"); }
    finally { setLoading(prev => ({ ...prev, docs: false })); }
  }, []);

  // ৩. ডেটা ফেচিং (Audit Logs with Pagination)
  const fetchLogs = useCallback(async (pageNo = 1) => {
    setLoading(prev => ({ ...prev, logs: true }));
    try {
      const res = await api.get(`/admin/audit-logs?page=${pageNo}&limit=15`);
      const logData = res.data?.logs || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setLogs(logData);
      setHasMoreLogs(logData.length >= 15);
      setLogPage(pageNo);
    } catch { toast.error("Audit logs could not be loaded"); }
    finally { setLoading(prev => ({ ...prev, logs: false })); }
  }, []);

  const refreshAll = () => {
    fetchUsers();
    fetchDocs();
    fetchLogs(1);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { navigate('/dashboard'); return; }
    refreshAll();
  }, [isAdmin, authLoading, navigate]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success("User deleted");
    } catch { toast.error("Deletion failed"); }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Remove this document permanently?")) return;
    try {
      await api.delete(`/admin/documents/${docId}`);
      setDocuments(documents.filter(d => d._id !== docId));
      toast.success("Document removed");
    } catch { toast.error("Delete failed"); }
  };

  const safeFormatDate = (dateStr, fStr = 'hh:mm aa, d MMM yyyy') => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isValid(d) ? format(d, fStr) : 'N/A';
  };

  // ফিল্টারিং লজিক
  const filteredUsers = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredDocs = documents.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredLogs = logs.filter(l => !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()));

  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
      <Loader2 className="animate-spin text-sky-600 w-12 h-12" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verifying Admin...</p>
    </div>
  );

  return (
    <div className="w-full mx-auto px-4 md:px-8 py-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen">
      
      {/* Header */}
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
            <Button className="bg-sky-600 hover:bg-sky-700 text-white rounded-2xl px-6 h-12 font-black shadow-xl">
              <Plus className="mr-2 w-5 h-5" /> NEW DOC
            </Button>
          </Link>
          <Button onClick={refreshAll} variant="outline" className="rounded-2xl px-6 h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50">
            <Activity size={18} className={`mr-2 text-emerald-500 ${(loading.users || loading.docs) ? 'animate-spin' : ''}`}/> REFRESH
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="max-w-[1600px] mx-auto space-y-8">
       
        <TabsList className="bg-slate-200/40 dark:bg-slate-900/50 p-1.5 rounded-[20px] w-full md:w-fit border">
          <TabsTrigger value="users" className="px-8 md:px-12 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-sky-600">Users</TabsTrigger>
          <TabsTrigger value="documents" className="px-8 md:px-12 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-sky-600">Documents</TabsTrigger>
          <TabsTrigger value="logs" className="px-8 md:px-12 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:text-sky-600">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Global Search */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <Input 
              placeholder={`Search ${tab}...`} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-14 border-none bg-transparent h-14 text-base focus-visible:ring-0 font-medium dark:text-white" 
            />
          </div>
          {loading[tab] && <Loader2 className="animate-spin text-sky-500 mr-4 w-5 h-5" />}
        </div>

        {/* Content Section */}
        <div className="animate-in fade-in duration-500">
          
          {/* DOCUMENTS VIEW */}
          {tab === 'documents' && (
            <div className="grid gap-6">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs bg-white dark:bg-slate-900 rounded-[2rem]">No Records Found</div>
              ) : (
                filteredDocs.map(d => (
                  <Card key={d._id} className="rounded-[2rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 md:p-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 border-b dark:border-slate-800 pb-8">
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">{d.title}</h2>
                        <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="flex items-center gap-2"><Users size={12} className="text-sky-500"/> {d.owner?.full_name || 'System'}</span>
                          <span className="flex items-center gap-2"><Calendar size={12} className="text-sky-500"/> {safeFormatDate(d.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full lg:w-auto">
                        {d.status === 'completed' && (
                          <Button onClick={() => window.open(d.fileUrl, '_blank')} className="flex-1 lg:flex-none bg-white dark:bg-slate-800 text-sky-600 border border-sky-100 h-12 px-6 rounded-2xl font-black">
                            <FileText size={16} className="mr-2" /> VIEW
                          </Button>
                        )}
                        <Badge className={`px-6 h-12 rounded-2xl justify-center text-[10px] font-black uppercase tracking-widest flex-1 lg:flex-none ${d.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white'}`}>
                          {d.status}
                        </Badge>
                        <Button onClick={() => handleDeleteDoc(d._id)} variant="ghost" className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 size={20}/>
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {d.parties?.map((p, i) => (
                        <div key={i} className="p-6 border border-slate-50 dark:border-slate-800 rounded-[1.5rem] bg-[#FCFEFF] dark:bg-slate-950/40">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-black text-slate-900 dark:text-slate-100 text-sm uppercase">{p.name}</span>
                            <Badge variant="outline" className={`text-[9px] font-black px-3 py-1 ${p.status === 'signed' ? 'text-emerald-500' : 'text-amber-500'}`}>{p.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 font-bold uppercase">
                            <div className="flex flex-col"><span>IP Address</span><span className="text-slate-900 dark:text-slate-300 truncate">{p.ipAddress || '---'}</span></div>
                            <div className="flex flex-col"><span>Location</span><span className="text-slate-900 dark:text-slate-300 truncate">{p.location || '---'}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* USERS VIEW (Desktop & Mobile) */}
          {tab === 'users' && (
            <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 md:p-10">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 dark:border-slate-800">
                      <th className="pb-6 px-4">User Profile</th>
                      <th className="pb-6 px-4">Role</th>
                      <th className="pb-6 px-4">Created</th>
                      <th className="pb-6 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                        <td className="py-6 px-4">
                          <div className="font-bold text-slate-900 dark:text-white text-base">{u.full_name}</div>
                          <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                        </td>
                        <td className="py-6 px-4">
                          <Badge variant="outline" className="text-[9px] font-black uppercase px-4 py-1 border-slate-200 text-sky-600">{u.role}</Badge>
                        </td>
                        <td className="py-6 px-4 text-[11px] font-black text-slate-500">{safeFormatDate(u.createdAt, 'd MMM, yyyy')}</td>
                        <td className="py-6 px-4 text-right">
                          {u.role !== 'super_admin' && (
                            <Button onClick={() => handleDeleteUser(u._id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl h-12 w-12 p-0 bg-transparent">
                              <Trash2 size={20}/>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div className="md:hidden flex flex-col gap-4">
                {filteredUsers.map(u => (
                  <div key={u._id} className="p-4 border dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/40">
                    <div className="flex justify-between items-start mb-2">
                      <div><p className="font-bold text-slate-900 dark:text-white">{u.full_name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                      <Badge className="text-[9px]">{u.role}</Badge>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{safeFormatDate(u.createdAt, 'd MMM, yyyy')}</span>
                      <Button onClick={() => handleDeleteUser(u._id)} variant="ghost" className="text-red-400 p-0 h-8 w-8"><Trash2 size={16}/></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AUDIT LOGS VIEW */}
          {tab === 'logs' && (
            <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <History className="text-sky-500" size={24} />
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Audit Trail</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 dark:border-slate-800">
                      <th className="pb-6 px-4">Performed By</th>
                      <th className="pb-6 px-4">Action</th>
                      <th className="pb-6 px-4">Timestamp</th>
                      <th className="pb-6 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {filteredLogs.map((log, i) => (
                      <tr key={log._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                        <td className="py-6 px-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{log.performed_by?.name || 'System'}</div>
                          <div className="text-[10px] text-slate-400">{log.performed_by?.email || 'automated@system.com'}</div>
                        </td>
                        <td className="py-6 px-4">
                          <Badge className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none uppercase px-3 py-1">
                            {log.action}
                          </Badge>
                        </td>
                        <td className="py-6 px-4 text-[11px] font-black text-slate-500 uppercase">{safeFormatDate(log.timestamp || log.createdAt)}</td>
                        <td className="py-6 px-4 text-right">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-10 pt-8 border-t dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {logPage}</span>
                <div className="flex gap-4">
                  <Button onClick={() => fetchLogs(logPage - 1)} disabled={logPage === 1} variant="outline" className="rounded-xl h-12 w-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"><ChevronLeft size={20}/></Button>
                  <Button onClick={() => fetchLogs(logPage + 1)} disabled={!hasMoreLogs} variant="outline" className="rounded-xl h-12 w-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"><ChevronRight size={20}/></Button>
                </div>
              </div>
            </Card>
          )}

        </div>
      </Tabs>
    </div>
  );
}