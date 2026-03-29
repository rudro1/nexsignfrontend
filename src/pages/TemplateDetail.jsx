// src/pages/TemplateDetail.jsx
import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import useSocket from '@/hooks/useSocket';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────
const STATUS = {
  pending:     { label: 'Pending',     bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-400'   },
  in_progress: { label: 'In Progress', bg: 'bg-sky-100 dark:bg-sky-900/30',       text: 'text-sky-700 dark:text-sky-400',       dot: 'bg-sky-400'     },
  completed:   { label: 'Completed',   bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  declined:    { label: 'Declined',    bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-400',       dot: 'bg-red-500'     },
  voided:      { label: 'Voided',      bg: 'bg-slate-100 dark:bg-slate-800',      text: 'text-slate-500 dark:text-slate-400',   dot: 'bg-slate-400'   },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                      rounded-full text-xs font-semibold
                      ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────────
const IcArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const IcTemplate = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);
const IcUsers = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IcCrown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l3-8 5 5 4-9 3 8H3z" />
  </svg>
);
const IcSend = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);
const IcEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IcTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IcChart = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IcRefresh = ({ spin }) => (
  <svg className={`w-4 h-4 ${spin ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const IcCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IcClock = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);
const IcMail = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IcWarning = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IcSpinner = () => (
  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);
const IcDownload = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
const IcPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg ${className}`} />
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="h-8 w-64 rounded-xl" />
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  const colors = {
    sky:     { bg: 'bg-sky-50 dark:bg-sky-900/20',     text: 'text-sky-600 dark:text-sky-400',     bar: 'bg-sky-400'     },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-400'   },
    purple:  { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', bar: 'bg-purple-500' },
  };
  const c = colors[color] || colors.sky;
  return (
    <div className={`rounded-2xl p-5 ${c.bg} border border-white/60 dark:border-slate-700/50`}>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────────
function DeleteModal({ templateTitle, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl
                      border border-slate-100 dark:border-slate-800
                      p-6 w-full max-w-sm">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl
                        flex items-center justify-center mx-auto mb-4">
          <IcTrash />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center mb-1">
          Delete Template?
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            "{templateTitle}"
          </span>
          {' '}will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-10 rounded-xl border border-slate-200
                       dark:border-slate-700 text-sm font-semibold
                       text-slate-600 dark:text-slate-300
                       hover:bg-slate-50 dark:hover:bg-slate-800
                       transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600
                       text-white text-sm font-semibold transition-colors
                       flex items-center justify-center gap-2
                       disabled:opacity-60"
          >
            {loading ? <IcSpinner /> : <IcTrash />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Session Row
// ─────────────────────────────────────────────────────────────────
function SessionRow({ session, onRemind }) {
  const [reminding, setReminding] = useState(false);

  const handleRemind = async () => {
    setReminding(true);
    try {
      await onRemind(session._id);
    } finally {
      setReminding(false);
    }
  };

  const completedCount = (session.signers || []).filter(s => s.status === 'completed').length;
  const totalCount     = (session.signers || []).length;
  const pct            = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800
                    bg-white dark:bg-slate-900 hover:border-slate-200
                    dark:hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
            {session.employeeName || session.signers?.[0]?.name || 'Session'}
          </p>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {session.employeeEmail || session.signers?.[0]?.email}
          </p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {/* Progress */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {completedCount}/{totalCount} signed
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            {pct}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500
              ${pct === 100 ? 'bg-emerald-500' : 'bg-[#28ABDF]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <IcClock />
          {fmtDateTime(session.createdAt)}
        </span>
        {session.status === 'in_progress' && (
          <button
            onClick={handleRemind}
            disabled={reminding}
            className="flex items-center gap-1 text-xs font-semibold
                       text-[#28ABDF] hover:text-sky-700 transition-colors
                       disabled:opacity-50"
          >
            {reminding ? <IcSpinner /> : <IcMail />}
            Remind
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────
export default function TemplateDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const socket    = useSocket();

  const [template,      setTemplate]      = useState(null);
  const [sessions,      setSessions]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error,         setError]         = useState(null);
  const [activeTab,     setActiveTab]     = useState('overview');
  const [showDelete,    setShowDelete]    = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [sessionFilter, setSessionFilter] = useState('all');
  const [toast,         setToast]         = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Toast ─────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => { if (mountedRef.current) setToast(null); }, 3500);
  }, []);

  // ── Load template ─────────────────────────────────────────────
  const loadTemplate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/templates/${id}`);
      if (mountedRef.current) setTemplate(res.data?.template || res.data);
    } catch (err) {
      if (mountedRef.current)
        setError(err.response?.data?.message || 'Failed to load template.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [id]);

  // ── Load sessions ─────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get(`/templates/${id}/sessions`, { noCache: true });
      if (mountedRef.current) setSessions(res.data?.sessions ?? []);
    } catch {
      // non-critical
    } finally {
      if (mountedRef.current) setSessionsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTemplate();
    loadSessions();
  }, [loadTemplate, loadSessions]);

  // ── Socket realtime ───────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onSessionUpdate = (data) => {
      if (!mountedRef.current) return;
      if (data.templateId === id) {
        setSessions(prev =>
          prev.map(s => s._id === data._id ? { ...s, ...data } : s)
        );
      }
    };
    socket.on('session:updated', onSessionUpdate);
    return () => socket.off('session:updated', onSessionUpdate);
  }, [socket, id]);

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await api.delete(`/templates/${id}`);
      navigate('/templates', { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
      setShowDelete(false);
    } finally {
      if (mountedRef.current) setDeleting(false);
    }
  }, [id, navigate, showToast]);

  // ── Remind ────────────────────────────────────────────────────
  const handleRemind = useCallback(async (sessionId) => {
    try {
      await api.post(`/templates/${id}/sessions/${sessionId}/remind`);
      showToast('Reminder sent!', 'success');
    } catch {
      showToast('Failed to send reminder.', 'error');
    }
  }, [id, showToast]);

  // ── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total     = sessions.length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const pending   = sessions.filter(s => s.status === 'pending' || s.status === 'in_progress').length;
    const rate      = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, rate };
  }, [sessions]);

  // ── Filtered sessions ─────────────────────────────────────────
  const filteredSessions = useMemo(() => {
    if (sessionFilter === 'all') return sessions;
    return sessions.filter(s => s.status === sessionFilter);
  }, [sessions, sessionFilter]);

  // ── Bar chart data ────────────────────────────────────────────
  const chartData = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      const k = new Date(s.createdAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
      });
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count })).slice(-8);
  }, [sessions]);
  const maxChart = Math.max(1, ...chartData.map(d => d.count));

  // ─────────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]
                      flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl
                        border border-slate-100 dark:border-slate-800
                        p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30
                          rounded-2xl flex items-center justify-center mx-auto mb-4">
            <IcWarning />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            Failed to Load
          </h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/templates')}
              className="flex-1 h-10 rounded-xl border border-slate-200
                         dark:border-slate-700 text-sm font-semibold
                         text-slate-600 dark:text-slate-300
                         hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={loadTemplate}
              className="flex-1 h-10 rounded-xl bg-[#28ABDF] hover:bg-sky-600
                         text-white text-sm font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl
                         shadow-xl text-sm font-semibold text-white
                         transition-all animate-fade-in
                         ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Delete Modal ── */}
      {showDelete && (
        <DeleteModal
          templateTitle={template?.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* ══════════════════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-start
                        justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/templates')}
              className="h-9 w-9 rounded-xl border border-slate-200
                         dark:border-slate-700 bg-white dark:bg-slate-900
                         flex items-center justify-center shrink-0
                         hover:border-[#28ABDF] hover:text-[#28ABDF]
                         text-slate-600 dark:text-slate-300
                         transition-colors shadow-sm mt-0.5"
            >
              <IcArrowLeft />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                {template?.companyLogo ? (
                  <img
                    src={template.companyLogo}
                    alt="Logo"
                    className="h-7 max-w-[72px] object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-sky-100
                                  dark:bg-sky-900/40 flex items-center
                                  justify-center text-[#28ABDF]">
                    <IcTemplate />
                  </div>
                )}
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900
                               dark:text-white truncate">
                  {template?.title}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs
                              text-slate-400">
                {template?.companyName && (
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {template.companyName}
                  </span>
                )}
                <span>·</span>
                <span>Created {fmtDate(template?.createdAt)}</span>
                <span>·</span>
                <span>{template?.fields?.length || 0} fields</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => loadSessions()}
              className="h-9 w-9 rounded-xl border border-slate-200
                         dark:border-slate-700 bg-white dark:bg-slate-900
                         flex items-center justify-center
                         hover:border-[#28ABDF] hover:text-[#28ABDF]
                         text-slate-400 transition-colors shadow-sm"
              title="Refresh"
            >
              <IcRefresh spin={sessionsLoading} />
            </button>

            <Link
              to={`/templates/${id}/use`}
              className="h-9 px-4 rounded-xl bg-[#28ABDF] hover:bg-sky-600
                         text-white text-sm font-semibold flex items-center
                         gap-2 shadow-md shadow-sky-400/25 transition-all
                         hover:-translate-y-0.5 active:translate-y-0"
            >
              <IcSend />
              <span className="hidden sm:inline">Use Template</span>
            </Link>

            <button
              onClick={() => setShowDelete(true)}
              className="h-9 w-9 rounded-xl border border-slate-200
                         dark:border-slate-700 bg-white dark:bg-slate-900
                         flex items-center justify-center
                         hover:border-red-300 hover:text-red-500
                         text-slate-400 transition-colors shadow-sm"
              title="Delete template"
            >
              <IcTrash />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            STATS
        ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
          <StatCard
            label="Total Sessions"
            value={stats.total}
            sub={`${template?.usageCount || 0} total uses`}
            color="sky"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            sub={stats.total ? `${stats.rate}% rate` : undefined}
            color="emerald"
          />
          <StatCard
            label="In Progress"
            value={stats.pending}
            color="amber"
          />
          <StatCard
            label="Fields"
            value={template?.fields?.length || 0}
            sub="in template"
            color="purple"
          />
        </div>

        {/* ══════════════════════════════════════════════════════
            TABS
        ══════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900
                        rounded-xl border border-slate-100 dark:border-slate-800
                        shadow-sm w-fit mb-6">
          {[
            { id: 'overview',  label: 'Overview'  },
            { id: 'sessions',  label: `Sessions (${sessions.length})` },
            { id: 'analytics', label: 'Analytics' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold
                          transition-all
                ${activeTab === t.id
                  ? 'bg-[#28ABDF] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-5">

            {/* Template info */}
            <div className="lg:col-span-2 space-y-4">

              {/* Boss info */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl
                              border border-slate-100 dark:border-slate-800
                              shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-700
                               dark:text-slate-300 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-100
                                   dark:bg-purple-900/40 flex items-center
                                   justify-center text-purple-500">
                    <IcCrown />
                  </span>
                  Authoriser (Boss)
                </h3>

                {template?.boss ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl
                                  bg-purple-50 dark:bg-purple-900/20
                                  border border-purple-100 dark:border-purple-800/50">
                    <div className="w-10 h-10 rounded-xl bg-purple-500
                                    flex items-center justify-center
                                    text-white font-bold text-sm shrink-0">
                      {(template.boss.name || 'B')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800
                                    dark:text-white">
                        {template.boss.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {template.boss.email}
                      </p>
                    </div>
                    <StatusBadge
                      status={template.boss.signed ? 'completed' : 'pending'}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No boss configured.</p>
                )}
              </div>

              {/* Employees */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl
                              border border-slate-100 dark:border-slate-800
                              shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700
                                 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-100
                                     dark:bg-sky-900/40 flex items-center
                                     justify-center text-[#28ABDF]">
                      <IcUsers />
                    </span>
                    Employees ({template?.employees?.length || 0})
                  </h3>
                </div>

                {template?.employees?.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {template.employees.map((emp, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-xl
                                   hover:bg-slate-50 dark:hover:bg-slate-800
                                   transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-sky-100
                                        dark:bg-sky-900/40 text-[#28ABDF]
                                        text-xs font-bold flex items-center
                                        justify-center shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800
                                        dark:text-white truncate">
                            {emp.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No employees added yet.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Fields + Quick actions */}
            <div className="space-y-4">

              {/* Fields */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl
                              border border-slate-100 dark:border-slate-800
                              shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-700
                               dark:text-slate-300 mb-3">
                  Template Fields
                </h3>
                {template?.fields?.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {template.fields.map((f, i) => (
                      <div key={i}
                           className="flex items-center gap-2.5 px-2.5 py-2
                                      rounded-lg bg-slate-50 dark:bg-slate-800
                                      text-xs">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              f.partyIndex === 0 ? '#0ea5e9' : '#8b5cf6',
                          }}
                        />
                        <span className="capitalize font-medium text-slate-700
                                         dark:text-slate-300">
                          {f.type}
                        </span>
                        <span className="text-slate-400 ml-auto text-[11px]">
                          p.{f.page || 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No fields defined
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl
                              border border-slate-100 dark:border-slate-800
                              shadow-sm p-5 space-y-2">
                <h3 className="text-sm font-semibold text-slate-700
                               dark:text-slate-300 mb-3">
                  Quick Actions
                </h3>
                <Link
                  to={`/templates/${id}/use`}
                  className="flex items-center gap-3 p-3 rounded-xl
                             bg-sky-50 dark:bg-sky-900/20
                             hover:bg-sky-100 dark:hover:bg-sky-900/30
                             transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#28ABDF]
                                  flex items-center justify-center
                                  text-white shrink-0">
                    <IcSend />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-sky-700
                                  dark:text-sky-400">
                      Use Template
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Send to signers now
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => setShowDelete(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl
                             bg-red-50 dark:bg-red-900/10
                             hover:bg-red-100 dark:hover:bg-red-900/20
                             transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500
                                  flex items-center justify-center
                                  text-white shrink-0">
                    <IcTrash />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-red-600
                                  dark:text-red-400">
                      Delete Template
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Permanently remove
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: SESSIONS
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">

            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'pending', 'in_progress', 'completed', 'declined'].map(f => (
                <button
                  key={f}
                  onClick={() => setSessionFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold
                              capitalize transition-all
                    ${sessionFilter === f
                      ? 'bg-[#28ABDF] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    }`}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ')}
                  <span className="ml-1.5 opacity-70">
                    ({f === 'all'
                      ? sessions.length
                      : sessions.filter(s => s.status === f).length
                    })
                  </span>
                </button>
              ))}
            </div>

            {/* Sessions grid */}
            {sessionsLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-slate-900
                              rounded-2xl border border-dashed
                              border-slate-200 dark:border-slate-800">
                <IcUsers />
                <p className="text-sm font-semibold text-slate-500
                              dark:text-slate-400 mt-3">
                  No sessions found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {sessionFilter !== 'all'
                    ? 'Try a different filter'
                    : 'Use this template to create sessions'
                  }
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSessions.map(session => (
                  <SessionRow
                    key={session._id}
                    session={session}
                    onRemind={handleRemind}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: ANALYTICS
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="grid sm:grid-cols-2 gap-5">

            {/* Usage chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl
                            border border-slate-100 dark:border-slate-800
                            shadow-sm p-5 sm:col-span-2">
              <h3 className="text-sm font-semibold text-slate-700
                             dark:text-slate-300 mb-5 flex items-center gap-2">
                <IcChart />
                Sessions Over Time
              </h3>
              {chartData.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <p className="text-sm">No session data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chartData.map(d => (
                    <div key={d.date} className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400
                                       w-20 shrink-0 text-right">
                        {d.date}
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800
                                      rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#28ABDF]
                                     to-sky-400 rounded-full transition-all
                                     duration-700"
                          style={{ width: `${(d.count / maxChart) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700
                                       dark:text-slate-300 w-5 text-right shrink-0">
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completion rate */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl
                            border border-slate-100 dark:border-slate-800
                            shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700
                             dark:text-slate-300 mb-4">
                Completion Rate
              </h3>
              <div className="flex items-end gap-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9"
                      className="fill-none stroke-slate-100 dark:stroke-slate-800"
                      strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9"
                      className="fill-none stroke-[#28ABDF]"
                      strokeWidth="3"
                      strokeDasharray={`${stats.rate} ${100 - stats.rate}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-800 dark:text-white">
                      {stats.rate}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">Completed: {stats.completed}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-500">Pending: {stats.pending}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-slate-500">Total: {stats.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl
                            border border-slate-100 dark:border-slate-800
                            shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700
                             dark:text-slate-300 mb-4">
                Status Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(STATUS).map(([key, cfg]) => {
                  const count = sessions.filter(s => s.status === key).length;
                  const pct   = stats.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${cfg.text}`}>
                          {cfg.label}
                        </span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800
                                      rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cfg.dot} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}