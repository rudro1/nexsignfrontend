import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, FileText, CheckCircle2, 
  Send, Loader2, RefreshCw
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import DocumentCard from '@/components/dashboard/DocumentCard';
import { useAuth } from '@/lib/AuthContext';

const LIMIT = 9; 

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documents, setDocuments]     = useState(() => {
    try {
      const cached = localStorage.getItem(`nexsign_docs_${user?.email}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading]     = useState(!documents.length);
  const [isSyncing, setIsSyncing]     = useState(false);
  const [fetchError, setFetchError]   = useState(null);

  const abortRef = useRef(null);

  const fetchDocuments = useCallback(async (silent = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      if (!silent && !documents.length) setIsLoading(true);
      else setIsSyncing(true);
      setFetchError(null);

      const res = await api.get('/documents', {
        signal: abortRef.current.signal,
      });

      const rawData = res.data?.documents || [];
      setDocuments(rawData);
      localStorage.setItem(`nexsign_docs_${user?.email}`, JSON.stringify(rawData));
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setFetchError('Failed to load documents. Click to retry.');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }

    fetchDocuments();

    const interval = setInterval(() => {
      fetchDocuments(true); 
    }, 15000); 

    return () => {
      abortRef.current?.abort();
      clearInterval(interval);
    };
  }, [isAdmin, authLoading, navigate, fetchDocuments]);

  const stats = useMemo(() => ({
    total:      documents.length,
    inProgress: documents.filter(d => d.status === 'in_progress' || d.status === 'sent').length,
    completed:  documents.filter(d => d.status === 'completed').length,
  }), [documents]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return documents.filter(doc => {
      const titleMatch = !q || (doc.title || '').toLowerCase().includes(q);
      const statusMatch = statusFilter === 'all' || doc.status === statusFilter;
      return titleMatch && statusMatch;
    });
  }, [documents, search, statusFilter]);

  if (authLoading || isAdmin) return null;

  return (
    <div className="w-full mx-auto px-4 md:px-8 py-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'there'} 👋
              </h1>
              {isSyncing && <Loader2 className="w-4 h-4 animate-spin text-[#28ABDF]" />}
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
              Your Digital Signature Workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/DocumentEditor?id=new">
              <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-2xl h-12 px-8 font-black shadow-xl shadow-sky-500/20 transition-all active:scale-95 gap-2">
                <Plus className="w-5 h-5" /> NEW DOC
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => fetchDocuments()}
              className="rounded-2xl border-slate-200 dark:border-slate-800 h-12 w-12 p-0 flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm"
            >
              <RefreshCw className={`w-5 h-5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatsCard label="Total Documents" value={stats.total} icon={FileText} color="sky" />
          <StatsCard label="Awaiting Signature" value={stats.inProgress} icon={Send} color="amber" />
          <StatsCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
        </div>

        {/* ── Filters ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-14 border-none bg-transparent h-14 text-base focus-visible:ring-0 font-medium dark:text-white w-full"
            />
          </div>
          
          <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v)} className="shrink-0 w-full sm:w-auto">
            <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 h-12 border dark:border-slate-700">
              <TabsTrigger value="all" className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#28ABDF]">All</TabsTrigger>
              <TabsTrigger value="in_progress" className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#28ABDF]">Active</TabsTrigger>
              <TabsTrigger value="completed" className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#28ABDF]">Done</TabsTrigger>
              <TabsTrigger value="draft" className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#28ABDF]">Drafts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ── List ───────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-xl">
            <p className="text-slate-500 font-black uppercase tracking-widest mb-6">{fetchError}</p>
            <Button onClick={() => fetchDocuments()} variant="outline" className="rounded-2xl border-[#28ABDF] text-[#28ABDF] h-12 px-8 font-black">
              TRY AGAIN
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">No documents found</h3>
            <p className="text-slate-400 font-medium mb-8">Ready to send your first document for signature?</p>
            <Link to="/DocumentEditor?id=new">
              <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-2xl h-14 px-10 font-black shadow-xl shadow-sky-500/20 uppercase tracking-widest">
                Create Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(doc => (
              <DocumentCard key={doc._id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
