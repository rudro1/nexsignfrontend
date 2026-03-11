
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, FileText, CheckCircle2, Clock, Search, Trash2, Loader2, Activity } from 'lucide-react';
import { format } from 'date-fns';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const hasAccess = user?.role === 'super_admin' || user?.role === 'admin';
    if (!user || !hasAccess) {
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user, authLoading]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, docsRes, logsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/documents'),
        api.get('/admin/audit-logs') 
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("ডাটা লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("আপনি কি নিশ্চিত? এই ইউজারকে চিরতরে ডিলিট করা হবে!")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success("ইউজার ডিলিট হয়েছে।");
    } catch (error) {
      toast.error("ডিলিট করা সম্ভব হয়নি।");
    }
  };

  // ✅ ফিল্টারিং লজিক ফিক্সড (performed_by অবজেক্ট চেক করা হচ্ছে)
  const filteredUsers = users.filter(u => 
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDocs = documents.filter(d =>
    !search || d.title?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLogs = logs.filter(l =>
    !search || 
    l.performed_by?.email?.toLowerCase().includes(search.toLowerCase()) || 
    l.performed_by?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    totalDocs: documents.length,
    completedDocs: documents.filter(d => d.status === 'completed').length,
    activeDocs: documents.filter(d => d.status === 'in_progress').length,
  };

  if (authLoading || loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-sky-500 w-8 h-8" />
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Users" value={stats.totalUsers} icon={Users} color="sky" />
        <StatsCard label="Total Documents" value={stats.totalDocs} icon={FileText} color="violet" />
        <StatsCard label="Completed" value={stats.completedDocs} icon={CheckCircle2} color="green" />
        <StatsCard label="Active" value={stats.activeDocs} icon={Clock} color="amber" />
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(''); }} className="mb-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="users" className="gap-2"><Users size={16}/> Users</TabsTrigger>
          <TabsTrigger value="documents" className="gap-2"><FileText size={16}/> Documents</TabsTrigger>
          <TabsTrigger value="logs" className="gap-2"><Activity size={16}/> Activity Logs</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-2xl overflow-hidden border-slate-200">
        <div className="p-4 bg-white border-b flex justify-between items-center">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder={`Search in ${tab}...`} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-10" 
            />
          </div>
          <Button onClick={fetchAdminData} variant="outline" size="sm">Refresh Data</Button>
        </div>

        {tab === 'users' && (
          <Table>
            <TableHeader><TableRow className="bg-slate-50"><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredUsers.map(u => (
                <TableRow key={u._id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                  <TableCell className="text-sm text-slate-400">{format(new Date(u.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    {u.role !== 'super_admin' && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* ✅ ফিক্সড অ্যাক্টিভিটি লগ টেবিল */}
        {tab === 'logs' && (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>User / Email</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">No activity logs found</TableCell></TableRow>
              ) : filteredLogs.map(log => (
                <TableRow key={log._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{log.performed_by?.name || 'System'}</span>
                      <span className="text-[11px] text-slate-500">{log.performed_by?.email || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize font-normal ${
                      log.action === 'signed' ? 'border-green-500 text-green-600 bg-green-50' : 
                      log.action === 'opened' ? 'border-sky-500 text-sky-600 bg-sky-50' : ''
                    }`}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600 max-w-[150px] truncate block">
                      {log.document_id?.title || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-sky-600 font-mono">
                      {log.ip_address || '127.0.0.1'}
                    </code>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {log.timestamp ? format(new Date(log.timestamp), 'MMM d, HH:mm') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === 'documents' && (
          <Table>
            <TableHeader><TableRow className="bg-slate-50"><TableHead>Document Title</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredDocs.map(d => (
                <TableRow key={d._id}>
                  <TableCell className="font-medium">{d.title}</TableCell>
                  <TableCell className="text-sm">{d.owner?.full_name}</TableCell>
                  <TableCell><Badge className={d.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100'}>{d.status}</Badge></TableCell>
                  <TableCell className="text-sm text-slate-400">{format(new Date(d.createdAt), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}