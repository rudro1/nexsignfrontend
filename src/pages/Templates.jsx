// src/pages/Templates.jsx

import React, {
  useEffect, useMemo, useState, useCallback, useRef,
} from 'react';
import { Link } from 'react-router-dom';
import { api }  from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Badge }  from '@/components/ui/badge';
import { toast }  from 'sonner';
import {
  LayoutTemplate, Plus, Send, Loader2, Clock3,
  BarChart3, Upload, Users, CheckCircle2, X,
  Search, AlertTriangle, FileSpreadsheet,
  TrendingUp, Zap, RefreshCw, ChevronRight,
  Star, Eye,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────────
const CACHE_PREFIX = 'nexsign_tpls_';
const EMPTY_SIGNER = { name: '', email: '' };

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function readCache(uid) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function writeCache(uid, data) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${uid}`, JSON.stringify(data));
  } catch {}
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

/* Skeleton card */
function TplSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100
                    dark:border-slate-800 p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-slate-100 dark:bg-slate-800
                      rounded w-3/4" />
      <div className="h-3 bg-slate-100 dark:bg-slate-800
                      rounded w-1/2" />
      <div className="flex gap-2 pt-1">
        <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
        <div className="h-5 w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
      </div>
    </div>
  );
}

/* Stat pill */
function StatPill({ icon: Icon, label, value, color }) {
  const colors = {
    sky:   'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2
                     rounded-xl text-xs font-semibold ${colors[color]}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="text-slate-500 dark:text-slate-400 font-normal">
        {label}:
      </span>
      <span>{value}</span>
    </div>
  );
}

/* Template card */
function TemplateCard({ tpl, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2
                  transition-all duration-200 group
                  hover:shadow-md hover:-translate-y-0.5
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[#28ABDF]/40
        ${isSelected
          ? 'border-[#28ABDF] bg-sky-50/60 dark:bg-sky-900/15 shadow-md shadow-sky-100 dark:shadow-sky-900/20'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
    >
      {/* Logo + title */}
      <div className="flex items-start gap-3 mb-3">
        {tpl.companyLogo ? (
          <img
            src={tpl.companyLogo}
            alt={tpl.companyName || 'Logo'}
            className="h-8 max-w-[72px] object-contain shrink-0 mt-0.5"
          />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-slate-100
                          dark:bg-slate-800 flex items-center
                          justify-center shrink-0">
            <LayoutTemplate className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-white
                        truncate text-sm leading-tight">
            {tpl.title}
          </p>
          {tpl.companyName && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {tpl.companyName}
            </p>
          )}
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-[#28ABDF]
                          flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-[11px]
                      text-slate-400">
        <span className="flex items-center gap-1">
          <Clock3 className="w-3 h-3" />
          {fmtDate(tpl.updatedAt || tpl.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {tpl.usageCount || 0} uses
        </span>
      </div>

      {/* Status badge */}
      <div className="mt-2.5">
        {tpl.isParty1Signed ? (
          <Badge className="text-[10px] px-2 py-0.5 rounded-full
                           bg-emerald-100 text-emerald-700
                           dark:bg-emerald-900/40 dark:text-emerald-400
                           border-0 gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Ready to send
          </Badge>
        ) : (
          <Badge className="text-[10px] px-2 py-0.5 rounded-full
                           bg-amber-100 text-amber-700
                           dark:bg-amber-900/40 dark:text-amber-400
                           border-0">
            Awaiting your signature
          </Badge>
        )}
      </div>
    </button>
  );
}

/* Section card wrapper */
function Panel({ className = '', children }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl
                     border border-slate-100 dark:border-slate-800
                     shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/* Panel header */
function PanelHeader({ icon: Icon, iconColor, title, right }) {
  return (
    <div className="flex items-center justify-between
                    px-5 py-4 border-b border-slate-50
                    dark:border-slate-800">
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h2 className="font-semibold text-sm text-slate-800
                       dark:text-white">
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function Templates() {
  const { user } = useAuth();

  // ── State ─────────────────────────────────────────────────────
  const [templates,    setTemplates]   = useState(() => readCache(user?._id));
  const [loading,      setLoading]     = useState(true);
  const [fetchError,   setFetchError]  = useState(null);
  const [search,       setSearch]      = useState('');
  const [selected,     setSelected]    = useState(null);

  // Use template form
  const [signers,   setSigners]   = useState([{ ...EMPTY_SIGNER }]);
  const [ccEmails,  setCcEmails]  = useState('');
  const [sending,   setSending]   = useState(false);
  const [signerErrors, setSignerErrors] = useState([]);

  // Usage / analytics
  const [usage,        setUsage]        = useState([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageStatus,  setUsageStatus]  = useState('all');
  const [usageDays,    setUsageDays]    = useState(30);

  // Bulk CSV
  const [csvRows,     setCsvRows]     = useState([]);
  const [bulkSending, setBulkSending] = useState(false);
  const [csvError,    setCsvError]    = useState('');

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Load templates ────────────────────────────────────────────
  const loadTemplates = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setFetchError(null);
    try {
      const res  = await api.get('/templates');
      const data = res.data?.templates ?? [];
      if (mountedRef.current) {
        setTemplates(data);
        writeCache(user?._id, data);
      }
    } catch {
      if (mountedRef.current) setFetchError('Failed to load templates.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    const cached = readCache(user?._id);
    if (cached.length) {
      setTemplates(cached);
      setLoading(false);
      loadTemplates(true);
    } else {
      loadTemplates(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load usage ────────────────────────────────────────────────
  const loadUsage = useCallback(async (id) => {
    if (!id) return;
    setUsageLoading(true);
    try {
      const res = await api.get(`/templates/${id}/usage`);
      if (mountedRef.current) setUsage(res.data?.usage ?? []);
    } catch {
      toast.error('Failed to load usage history.');
    } finally {
      if (mountedRef.current) setUsageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected?._id) loadUsage(selected._id);
    else setUsage([]);
  }, [selected?._id, loadUsage]);

  // ── Signer helpers ─────────────────────────────────────────
  const addSigner = useCallback(() => {
    setSigners(p => [...p, { ...EMPTY_SIGNER }]);
    setSignerErrors(p => [...p, {}]);
  }, []);

  const removeSigner = useCallback((i) => {
    setSigners(p => p.filter((_, idx) => idx !== i));
    setSignerErrors(p => p.filter((_, idx) => idx !== i));
  }, []);

  const updateSigner = useCallback((i, key, val) => {
    setSigners(p => p.map((s, idx) =>
      idx === i ? { ...s, [key]: val } : s
    ));
    // Clear error on edit
    setSignerErrors(p => p.map((e, idx) =>
      idx === i ? { ...e, [key]: '' } : e
    ));
  }, []);

  // ── Validate signers ──────────────────────────────────────
  const validateSigners = useCallback(() => {
    const errs = signers.map(s => {
      const e = {};
      if (!s.name.trim())          e.name  = 'Required';
      if (!isValidEmail(s.email))  e.email = 'Invalid email';
      return e;
    });
    setSignerErrors(errs);
    return errs.every(e => Object.keys(e).length === 0);
  }, [signers]);

  // ── Use template ──────────────────────────────────────────
  const useTemplate = useCallback(async () => {
    if (!selected?._id) return;
    if (!validateSigners()) {
      toast.error('Fix signer errors first.');
      return;
    }

    const ccList = ccEmails
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(isValidEmail)
      .map(email => ({ email, name: '' }));

    setSending(true);
    // Optimistic reset
    const prevSelected = selected;
    setSelected(null);
    setSigners([{ ...EMPTY_SIGNER }]);
    setCcEmails('');
    setSignerErrors([]);

    try {
      await api.post(`/templates/${prevSelected._id}/use`, {
        signers: signers.map(s => ({
          name:  s.name.trim(),
          email: s.email.trim().toLowerCase(),
        })),
        ccList,
      });
      toast.success('Document sent for signing! ✉️');
      loadTemplates(true);
      loadUsage(prevSelected._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send.');
      // Restore on failure
      setSelected(prevSelected);
    } finally {
      if (mountedRef.current) setSending(false);
    }
  }, [selected, signers, ccEmails, validateSigners, loadTemplates, loadUsage]);

  // ── CSV parse ─────────────────────────────────────────────
  const parseCsv = useCallback(async (file) => {
    const text    = await file.text();
    const lines   = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new Error('CSV is empty.');
    const [hdr, ...rows] = lines;
    const headers = hdr.split(',').map(h => h.trim().toLowerCase());
    const ni = headers.indexOf('name');
    const ei = headers.indexOf('email');
    if (ni === -1 || ei === -1)
      throw new Error('CSV must have "name" and "email" columns.');
    return rows
      .map(r => {
        const c = r.split(',').map(x => x.trim());
        return {
          name:  c[ni]  || '',
          email: (c[ei] || '').toLowerCase(),
        };
      })
      .filter(r => r.name && isValidEmail(r.email));
  }, []);

  const handleCsvUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError('');
    try {
      const rows = await parseCsv(file);
      if (!rows.length) throw new Error('No valid rows found in CSV.');
      setCsvRows(rows);
      toast.success(`${rows.length} employees loaded from CSV`);
    } catch (err) {
      setCsvError(err.message || 'Invalid CSV file.');
      setCsvRows([]);
    } finally {
      e.target.value = '';
    }
  }, [parseCsv]);

  // ── Bulk send ─────────────────────────────────────────────
  const handleBulkSend = useCallback(async () => {
    if (!selected?._id) { toast.error('Select a template first.'); return; }
    if (!csvRows.length) { toast.error('Upload a CSV first.'); return; }

    const ccList = ccEmails
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(isValidEmail)
      .map(email => ({ email, name: '' }));

    setBulkSending(true);
    const prevRows = csvRows;
    setCsvRows([]);
    toast.success(`Sending to ${prevRows.length} employees…`);

    try {
      await api.post(`/templates/${selected._id}/use-bulk`, {
        employees: prevRows,
        ccList,
      });
      toast.success('Bulk send complete! ✅');
      loadUsage(selected._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk send failed.');
      setCsvRows(prevRows); // restore
    } finally {
      if (mountedRef.current) setBulkSending(false);
    }
  }, [selected, csvRows, ccEmails, loadUsage]);

  // ── Analytics ─────────────────────────────────────────────
  const filteredUsage = useMemo(() => {
    const span = usageDays * 86_400_000;
    const now  = Date.now();
    return usage.filter(u => {
      const t  = new Date(u.createdAt || u.updatedAt || 0).getTime();
      const ok = usageStatus === 'all' || u.status === usageStatus;
      return now - t <= span && ok;
    });
  }, [usage, usageDays, usageStatus]);

  const buckets = useMemo(() => {
    const map = {};
    filteredUsage.forEach(u => {
      const k = new Date(
        u.createdAt || u.updatedAt || Date.now()
      ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .slice(-10);
  }, [filteredUsage]);

  const maxBucket = Math.max(1, ...buckets.map(b => b.count));

  // ── Filtered templates ────────────────────────────────────
  const filteredTemplates = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return templates;
    return templates.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.companyName || '').toLowerCase().includes(q)
    );
  }, [templates, search]);

  // ── Analytics summary ─────────────────────────────────────
  const analyticsSummary = useMemo(() => ({
    total:     filteredUsage.length,
    completed: filteredUsage.filter(u => u.status === 'completed').length,
    rate:      filteredUsage.length
      ? Math.round(
          (filteredUsage.filter(u => u.status === 'completed').length
            / filteredUsage.length) * 100
        )
      : 0,
  }), [filteredUsage]);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                      py-6 sm:py-10 space-y-6">

        {/* ══════════════════════════════════════════════════════
            PAGE HEADER
        ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center
                        justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold
                           text-slate-900 dark:text-white
                           tracking-tight">
              Templates
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create once, reuse instantly for bulk signing workflows
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadTemplates()}
              disabled={loading}
              aria-label="Refresh"
              className="h-10 w-10 rounded-xl border-slate-200
                         dark:border-slate-700 hover:border-[#28ABDF]
                         hover:text-[#28ABDF] transition-colors"
            >
              <RefreshCw className={`w-4 h-4
                ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
            <Link to="/templates/new">
              <Button
                className="h-10 px-5 rounded-xl font-semibold
                           bg-[#28ABDF] hover:bg-[#2399c8] text-white
                           shadow-md shadow-sky-400/25 gap-2
                           transition-all hover:-translate-y-0.5
                           active:translate-y-0"
              >
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MAIN GRID
        ══════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── LEFT: template list ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2
                                 -translate-y-1/2 w-4 h-4
                                 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search templates…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl border-slate-200
                           dark:border-slate-700 bg-white
                           dark:bg-slate-900 text-sm
                           focus-visible:ring-[#28ABDF]/30
                           focus-visible:border-[#28ABDF]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Error */}
            {fetchError && (
              <div className="flex items-center gap-3 p-4 rounded-xl
                              bg-red-50 dark:bg-red-900/20
                              border border-red-100 dark:border-red-900">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400
                              flex-1">
                  {fetchError}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadTemplates()}
                  className="rounded-lg border-red-200 text-red-500 text-xs"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <TplSkeleton key={i} />)}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="py-20 text-center
                              bg-white dark:bg-slate-900 rounded-2xl
                              border-2 border-dashed
                              border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 rounded-2xl
                                bg-slate-50 dark:bg-slate-800
                                flex items-center justify-center
                                mx-auto mb-4">
                  <LayoutTemplate className="w-6 h-6 text-slate-300
                                              dark:text-slate-600" />
                </div>
                <p className="font-semibold text-slate-700
                              dark:text-slate-300 mb-1">
                  {search ? 'No templates match your search' : 'No templates yet'}
                </p>
                <p className="text-sm text-slate-400 mb-5">
                  {search
                    ? 'Try a different keyword'
                    : 'Create your first template to get started'
                  }
                </p>
                {!search && (
                  <Link to="/templates/new">
                    <Button
                      size="sm"
                      className="rounded-xl bg-[#28ABDF]
                                 hover:bg-[#2399c8] text-white gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Template
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredTemplates.map(tpl => (
                  <TemplateCard
                    key={tpl._id}
                    tpl={tpl}
                    isSelected={selected?._id === tpl._id}
                    onClick={() => setSelected(
                      prev => prev?._id === tpl._id ? null : tpl
                    )}
                  />
                ))}
              </div>
            )}

            {/* Count */}
            {!loading && filteredTemplates.length > 0 && (
              <p className="text-xs text-slate-400 px-0.5">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                {search && ` matching "${search}"`}
              </p>
            )}
          </div>

          {/* ── RIGHT: Use template panel ────────────────────── */}
          <Panel>
            <PanelHeader
              icon={Send}
              iconColor="text-[#28ABDF]"
              title="Use Template"
            />

            <div className="p-5">
              {!selected ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl
                                  bg-slate-50 dark:bg-slate-800
                                  flex items-center justify-center
                                  mx-auto mb-3">
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500
                                dark:text-slate-400 font-medium">
                    Select a template
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click a template card on the left
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected template */}
                  <div className="flex items-center gap-3 p-3
                                  bg-sky-50 dark:bg-sky-900/20
                                  rounded-xl border border-sky-100
                                  dark:border-sky-800">
                    {selected.companyLogo && (
                      <img
                        src={selected.companyLogo}
                        alt="Logo"
                        className="h-7 max-w-[64px] object-contain shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sky-700
                                    dark:text-sky-300 truncate">
                        {selected.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="text-sky-400 hover:text-sky-600
                                 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Signers */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-slate-500
                                  dark:text-slate-400 uppercase
                                  tracking-wider">
                      Signers
                    </p>

                    {signers.map((s, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full
                                          bg-[#28ABDF]/10 text-[#28ABDF]
                                          text-[10px] font-bold
                                          flex items-center justify-center
                                          shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-[11px] text-slate-400
                                        font-medium">
                            Signer {i + 1}
                          </p>
                          {signers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSigner(i)}
                              className="ml-auto text-[11px]
                                         text-red-400 hover:text-red-500
                                         flex items-center gap-0.5
                                         transition-colors"
                            >
                              <X className="w-2.5 h-2.5" /> Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Input
                              value={s.name}
                              onChange={e =>
                                updateSigner(i, 'name', e.target.value)
                              }
                              placeholder="Full name"
                              className={`h-9 text-xs rounded-xl
                                ${signerErrors[i]?.name
                                  ? 'border-red-400 focus-visible:ring-red-400'
                                  : 'border-slate-200 dark:border-slate-700'
                                }`}
                            />
                            {signerErrors[i]?.name && (
                              <p className="text-[10px] text-red-500 mt-0.5">
                                {signerErrors[i].name}
                              </p>
                            )}
                          </div>
                          <div>
                            <Input
                              value={s.email}
                              type="email"
                              onChange={e =>
                                updateSigner(i, 'email', e.target.value)
                              }
                              placeholder="Email"
                              className={`h-9 text-xs rounded-xl
                                ${signerErrors[i]?.email
                                  ? 'border-red-400 focus-visible:ring-red-400'
                                  : 'border-slate-200 dark:border-slate-700'
                                }`}
                            />
                            {signerErrors[i]?.email && (
                              <p className="text-[10px] text-red-500 mt-0.5">
                                {signerErrors[i].email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSigner}
                      className="w-full h-8 rounded-xl text-xs
                                 border-slate-200 dark:border-slate-700
                                 hover:border-[#28ABDF] hover:text-[#28ABDF]
                                 transition-colors gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Signer
                    </Button>
                  </div>

                  {/* CC */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500
                                  dark:text-slate-400 uppercase tracking-wider">
                      CC <span className="normal-case font-normal
                                          text-slate-400">(optional)</span>
                    </p>
                    <Input
                      value={ccEmails}
                      onChange={e => setCcEmails(e.target.value)}
                      placeholder="email1@co.com, email2@co.com"
                      className="h-9 text-xs rounded-xl
                                 border-slate-200 dark:border-slate-700
                                 focus-visible:ring-[#28ABDF]/30"
                    />
                    <p className="text-[10px] text-slate-400">
                      Separate multiple emails with commas
                    </p>
                  </div>

                  {/* Send button */}
                  <Button
                    onClick={useTemplate}
                    disabled={sending}
                    className="w-full h-10 rounded-xl font-semibold
                               bg-[#28ABDF] hover:bg-[#2399c8] text-white
                               shadow-md shadow-sky-400/25 gap-2
                               transition-all hover:-translate-y-0.5
                               active:translate-y-0
                               disabled:opacity-60"
                  >
                    {sending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                    {sending ? 'Sending…' : 'Send for Signing'}
                  </Button>
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* ══════════════════════════════════════════════════════
            ANALYTICS + BULK
        ══════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* ── Analytics ──────────────────────────────────── */}
          <Panel>
            <PanelHeader
              icon={BarChart3}
              iconColor="text-[#28ABDF]"
              title="Usage Analytics"
              right={usageLoading && (
                <Loader2 className="w-4 h-4 animate-spin
                                    text-[#28ABDF]" />
              )}
            />

            <div className="p-5">
              {!selected ? (
                <div className="py-8 text-center text-slate-400">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    Select a template to view analytics
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary pills */}
                  <div className="flex flex-wrap gap-2">
                    <StatPill
                      icon={TrendingUp}
                      label="Sent"
                      value={analyticsSummary.total}
                      color="sky"
                    />
                    <StatPill
                      icon={CheckCircle2}
                      label="Completed"
                      value={analyticsSummary.completed}
                      color="green"
                    />
                    <StatPill
                      icon={Star}
                      label="Rate"
                      value={`${analyticsSummary.rate}%`}
                      color="amber"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={usageStatus}
                      onChange={e => setUsageStatus(e.target.value)}
                      className="h-9 rounded-xl border border-slate-200
                                 dark:border-slate-700 px-2.5 text-xs
                                 bg-white dark:bg-slate-800
                                 text-slate-700 dark:text-slate-300
                                 focus:outline-none focus:border-[#28ABDF]"
                    >
                      <option value="all">All statuses</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <select
                      value={usageDays}
                      onChange={e => setUsageDays(Number(e.target.value))}
                      className="h-9 rounded-xl border border-slate-200
                                 dark:border-slate-700 px-2.5 text-xs
                                 bg-white dark:bg-slate-800
                                 text-slate-700 dark:text-slate-300
                                 focus:outline-none focus:border-[#28ABDF]"
                    >
                      <option value={7}>Last 7 days</option>
                      <option value={30}>Last 30 days</option>
                      <option value={90}>Last 90 days</option>
                    </select>
                  </div>

                  {/* Bar chart */}
                  {buckets.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <p className="text-sm">
                        No data in selected range
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {buckets.map(b => (
                        <div key={b.date}
                             className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400
                                           w-16 shrink-0 text-right">
                            {b.date}
                          </span>
                          <div className="flex-1 h-2 bg-slate-100
                                          dark:bg-slate-800 rounded-full
                                          overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r
                                         from-[#28ABDF] to-sky-400
                                         rounded-full transition-all
                                         duration-700"
                              style={{
                                width: `${(b.count / maxBucket) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold
                                           text-slate-700 dark:text-slate-300
                                           w-5 text-right shrink-0">
                            {b.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Panel>

          {/* ── Bulk CSV ───────────────────────────────────── */}
          <Panel>
            <PanelHeader
              icon={FileSpreadsheet}
              iconColor="text-emerald-500"
              title="Bulk Send via CSV"
            />

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50
                              dark:bg-slate-800/60
                              border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Required CSV format:
                </p>
                <code className="text-xs font-mono text-emerald-600
                                 dark:text-emerald-400 mt-1 block">
                  name,email<br />
                  John Doe,john@company.com
                </code>
              </div>

              {/* Upload zone */}
              <label className={`flex items-center gap-3 p-4
                                 rounded-xl border-2 border-dashed
                                 cursor-pointer transition-all group
                ${csvError
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                  : csvRows.length > 0
                    ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#28ABDF] hover:bg-sky-50/30 dark:hover:bg-sky-900/10'
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center
                                 justify-center shrink-0 transition-colors
                  ${csvRows.length > 0
                    ? 'bg-emerald-100 dark:bg-emerald-900/40'
                    : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30'
                  }`}>
                  {csvRows.length > 0
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <Upload className="w-4 h-4 text-slate-400 group-hover:text-[#28ABDF]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  {csvError ? (
                    <p className="text-xs font-medium text-red-600">
                      {csvError}
                    </p>
                  ) : csvRows.length > 0 ? (
                    <>
                      <p className="text-xs font-semibold text-emerald-700
                                    dark:text-emerald-400">
                        {csvRows.length} employees loaded
                      </p>
                      <p className="text-[11px] text-emerald-600/70 mt-0.5">
                        Click to replace file
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-medium text-slate-600
                                    dark:text-slate-400">
                        Choose CSV file
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        .csv files only
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </label>

              {/* Preview */}
              {csvRows.length > 0 && (
                <div className="rounded-xl border border-slate-100
                                dark:border-slate-700 overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800
                                  border-b border-slate-100 dark:border-slate-700
                                  flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500
                                  uppercase tracking-wide">
                      Preview
                    </p>
                    <button
                      type="button"
                      onClick={() => setCsvRows([])}
                      className="text-[11px] text-red-400
                                 hover:text-red-500 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-32 overflow-auto divide-y
                                  divide-slate-50 dark:divide-slate-800">
                    {csvRows.slice(0, 8).map((r, i) => (
                      <div key={i}
                           className="flex items-center gap-3 px-3 py-2">
                        <div className="w-5 h-5 rounded-full
                                        bg-slate-100 dark:bg-slate-800
                                        text-[10px] font-bold
                                        text-slate-400 flex items-center
                                        justify-center shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-xs text-slate-700
                                         dark:text-slate-300 font-medium
                                         truncate flex-1">
                          {r.name}
                        </span>
                        <span className="text-[11px] text-slate-400
                                         truncate max-w-[120px]">
                          {r.email}
                        </span>
                      </div>
                    ))}
                    {csvRows.length > 8 && (
                      <div className="px-3 py-2 text-[11px] text-slate-400">
                        +{csvRows.length - 8} more employees
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No template warning */}
              {!selected && csvRows.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl
                                bg-amber-50 dark:bg-amber-900/20
                                border border-amber-100 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Select a template before sending
                  </p>
                </div>
              )}

              <Button
                onClick={handleBulkSend}
                disabled={bulkSending || !selected || !csvRows.length}
                className="w-full h-10 rounded-xl font-semibold
                           bg-emerald-500 hover:bg-emerald-600 text-white
                           shadow-md shadow-emerald-400/25 gap-2
                           transition-all hover:-translate-y-0.5
                           active:translate-y-0
                           disabled:opacity-50 disabled:cursor-not-allowed
                           disabled:hover:translate-y-0"
              >
                {bulkSending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
                {bulkSending
                  ? 'Sending…'
                  : csvRows.length > 0
                    ? `Send to ${csvRows.length} Employees`
                    : 'Send Bulk'
                }
              </Button>
            </div>
          </Panel>
        </div>

      </div>
    </div>
  );
}