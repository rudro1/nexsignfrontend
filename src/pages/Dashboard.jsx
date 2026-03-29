import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, FileText, CheckCircle2, 
  Send, Loader2, Layout, Settings2,
  RefreshCw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/dashboard/StatsCard';
import DocumentCard from '@/components/dashboard/DocumentCard';
import { useAuth } from '@/lib/AuthContext';

const LIMIT = 9; 

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documents, setDocuments]     = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [isSyncing, setIsSyncing]     = useState(false);
  const [fetchError, setFetchError]   = useState(null);

  const abortRef = useRef(null);

  const fetchDocuments = useCallback(async (silent = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      if (!silent) setIsLoading(true);
      else setIsSyncing(true);
      setFetchError(null);

      const res = await api.get('/documents', {
        signal: abortRef.current.signal,
      });

      const rawData = res.data?.documents || [];
      setDocuments(rawData);
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
    }, 30000); 

    return () => {
      abortRef.current?.abort();
      clearInterval(interval);
    };
  }, [isAdmin, authLoading, navigate, fetchDocuments]);

  const stats = useMemo(() => ({
    total:      documents.length,
    inProgress: documents.filter(d => d.status === 'in_progress').length,
    completed:  documents.filter(d => d.status === 'completed').length,
    templates:  0, // We handle templates in a separate view
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            {isSyncing && <Loader2 className="w-5 h-5 animate-spin text-[#28ABDF]" />}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage and track your digital signatures effortlessly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/DocumentEditor?id=new">
            <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl gap-2 shadow-lg shadow-sky-100 h-11 px-6 font-bold transition-all active:scale-95">
              <Plus className="w-5 h-5" /> New Document
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => fetchDocuments()}
            className="rounded-xl border-slate-200 dark:border-slate-700 h-11 w-11 p-0 flex items-center justify-center bg-white dark:bg-slate-900"
          >
            <RefreshCw className={`w-5 h-5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatsCard label="All Documents" value={stats.total} icon={FileText} color="sky" />
        <StatsCard label="Pending" value={stats.inProgress} icon={Send} color="amber" />
        <StatsCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 focus:border-[#28ABDF] h-10 text-sm"
          />
        </div>
        
        <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v)} className="shrink-0">
          <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 h-10">
            <TabsTrigger value="all" className="text-xs font-bold px-4 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#28ABDF] data-[state=active]:shadow-sm">All</TabsTrigger>
            <TabsTrigger value="in_progress" className="text-xs font-bold px-4 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#28ABDF] data-[state=active]:shadow-sm">Active</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs font-bold px-4 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#28ABDF] data-[state=active]:shadow-sm">Done</TabsTrigger>
            <TabsTrigger value="draft" className="text-xs font-bold px-4 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#28ABDF] data-[state=active]:shadow-sm">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ── DOCUMENT LIST ── */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : fetchError ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 font-medium mb-4">{fetchError}</p>
          <Button onClick={() => fetchDocuments()} variant="outline" className="rounded-xl border-[#28ABDF] text-[#28ABDF]">
            Try Again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No documents found</h3>
          <p className="text-slate-500 text-sm mb-6">Start by creating your first digital signature request.</p>
          <Link to="/DocumentEditor?id=new">
            <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl font-bold">
              Create Document
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(doc => (
            <DocumentCard key={doc._id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
