// import React, { useEffect, useMemo, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { Card } from '@/components/ui/Card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { toast } from 'sonner';
// import { LayoutTemplate, Plus, Send, Loader2, Clock3, BarChart3, Upload } from 'lucide-react';

// const emptySigner = { name: '', email: '' };

// export default function Templates() {
//   const [templates, setTemplates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState(null);
//   const [parties, setParties] = useState([{ ...emptySigner }]);
//   const [ccEmails, setCcEmails] = useState('');
//   const [sending, setSending] = useState(false);
//   const [usage, setUsage] = useState([]);
//   const [usageLoading, setUsageLoading] = useState(false);
//   const [usageStatus, setUsageStatus] = useState('all');
//   const [usageRangeDays, setUsageRangeDays] = useState(30);
//   const [csvRows, setCsvRows] = useState([]);
//   const [bulkSending, setBulkSending] = useState(false);

//   const loadTemplates = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get('/documents/templates');
//       setTemplates(res.data?.templates || []);
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Failed to load templates');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadTemplates();
//   }, []);

//   const parsedCcEmails = useMemo(
//     () => ccEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean),
//     [ccEmails]
//   );

//   const addSigner = () => setParties(prev => [...prev, { ...emptySigner }]);
//   const removeSigner = (idx) => setParties(prev => prev.filter((_, i) => i !== idx));
//   const updateSigner = (idx, key, value) => {
//     setParties(prev => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
//   };

//   const useTemplate = async () => {
//     if (!selected?._id) return;
//     if (!parties.length || parties.some(p => !p.name.trim() || !p.email.trim())) {
//       toast.error('Please add valid signer names and emails');
//       return;
//     }
//     setSending(true);
//     try {
//       const res = await api.post(`/documents/templates/${selected._id}/use`, {
//         title: selected.title,
//         parties: parties.map(p => ({ name: p.name.trim(), email: p.email.trim().toLowerCase() })),
//         ccEmails: parsedCcEmails,
//       });
//       if (res.data?.success) {
//         toast.success('Template sent for signature');
//         setSelected(null);
//         setParties([{ ...emptySigner }]);
//         setCcEmails('');
//         loadTemplates();
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Failed to use template');
//     } finally {
//       setSending(false);
//     }
//   };

//   const loadUsage = async (templateId) => {
//     if (!templateId) return;
//     try {
//       setUsageLoading(true);
//       const res = await api.get(`/documents/templates/${templateId}/usage`);
//       setUsage(res.data?.usage || []);
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Failed to load usage history');
//     } finally {
//       setUsageLoading(false);
//     }
//   };

//   const parseCsvFile = async (file) => {
//     const text = await file.text();
//     const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
//     if (!lines.length) return [];

//     const [headerLine, ...rows] = lines;
//     const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());
//     const nameIdx = headers.indexOf('name');
//     const emailIdx = headers.indexOf('email');

//     if (nameIdx === -1 || emailIdx === -1) {
//       throw new Error('CSV must include headers: name,email');
//     }

//     return rows.map((row) => {
//       const cols = row.split(',').map((c) => c.trim());
//       return {
//         name: cols[nameIdx] || '',
//         email: (cols[emailIdx] || '').toLowerCase(),
//       };
//     }).filter((r) => r.name && r.email);
//   };

//   const handleCsvUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     try {
//       const rows = await parseCsvFile(file);
//       if (!rows.length) {
//         toast.error('No valid employee rows found in CSV');
//         return;
//       }
//       setCsvRows(rows);
//       toast.success(`${rows.length} employees loaded from CSV`);
//     } catch (err) {
//       toast.error(err.message || 'Invalid CSV format');
//     } finally {
//       e.target.value = '';
//     }
//   };

//   const handleBulkSend = async () => {
//     if (!selected?._id) {
//       toast.error('Select a template first');
//       return;
//     }
//     if (!csvRows.length) {
//       toast.error('Upload a CSV first');
//       return;
//     }
//     setBulkSending(true);
//     try {
//       const res = await api.post(`/documents/templates/${selected._id}/use-bulk`, {
//         title: selected.title,
//         employees: csvRows,
//         ccEmails: parsedCcEmails,
//       });
//       if (res.data?.success) {
//         toast.success(`Bulk send complete: ${res.data.created}/${res.data.total} created`);
//         loadUsage(selected._id);
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Bulk send failed');
//     } finally {
//       setBulkSending(false);
//     }
//   };

//   const filteredUsage = useMemo(() => {
//     const now = Date.now();
//     const rangeMs = usageRangeDays * 24 * 60 * 60 * 1000;
//     return usage.filter((u) => {
//       const t = new Date(u.createdAt || u.updatedAt || 0).getTime();
//       const inRange = now - t <= rangeMs;
//       const statusOk = usageStatus === 'all' || u.status === usageStatus;
//       return inRange && statusOk;
//     });
//   }, [usage, usageRangeDays, usageStatus]);

//   const usageBuckets = useMemo(() => {
//     const map = {};
//     filteredUsage.forEach((u) => {
//       const d = new Date(u.createdAt || u.updatedAt || Date.now());
//       const key = d.toLocaleDateString();
//       map[key] = (map[key] || 0) + 1;
//     });
//     const points = Object.entries(map).map(([date, count]) => ({ date, count }));
//     return points.slice(-10);
//   }, [filteredUsage]);

//   const maxBucket = Math.max(1, ...usageBuckets.map((b) => b.count || 0));

//   useEffect(() => {
//     if (selected?._id) {
//       loadUsage(selected._id);
//     } else {
//       setUsage([]);
//     }
//   }, [selected?._id]);

//   if (loading) {
//     return (
//       <div className="py-20 flex items-center justify-center">
//         <Loader2 className="w-6 h-6 animate-spin text-[#28ABDF]" />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
//       <div className="flex items-center justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Templates</h1>
//           <p className="text-sm text-slate-500">Create once, reuse for bulk signing.</p>
//         </div>
//         <Link to="/DocumentEditor?id=new">
//           <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl gap-2">
//             <Plus className="w-4 h-4" /> New Template Draft
//           </Button>
//         </Link>
//       </div>

//       <div className="grid lg:grid-cols-3 gap-5">
//         <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
//           {templates.length === 0 ? (
//             <Card className="p-8 text-center sm:col-span-2">
//               <LayoutTemplate className="w-12 h-12 mx-auto text-slate-300 mb-3" />
//               <p className="text-slate-500">No templates yet. Publish one from a document card.</p>
//             </Card>
//           ) : templates.map(tpl => (
//             <Card
//               key={tpl._id}
//               className={`p-4 border cursor-pointer transition ${selected?._id === tpl._id ? 'border-[#28ABDF]' : 'border-slate-200'}`}
//               onClick={() => setSelected(tpl)}
//             >
//               <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{tpl.title}</p>
//               <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
//                 <span className="inline-flex items-center gap-1"><Clock3 className="w-3 h-3" /> {new Date(tpl.updatedAt || tpl.createdAt).toLocaleDateString()}</span>
//                 <span>{tpl.usageCount || 0} uses</span>
//               </div>
//             </Card>
//           ))}
//         </div>

//         <Card className="p-4 space-y-3 h-fit">
//           <h2 className="font-semibold">Use Template</h2>
//           {!selected ? (
//             <p className="text-sm text-slate-500">Select a template from the left.</p>
//           ) : (
//             <>
//               <p className="text-sm text-slate-700 dark:text-slate-200 truncate">Template: <strong>{selected.title}</strong></p>
//               <div className="space-y-2">
//                 {parties.map((p, idx) => (
//                   <div key={idx} className="grid grid-cols-2 gap-2">
//                     <Input value={p.name} onChange={e => updateSigner(idx, 'name', e.target.value)} placeholder="Signer name" />
//                     <Input value={p.email} onChange={e => updateSigner(idx, 'email', e.target.value)} placeholder="email@example.com" />
//                     {parties.length > 1 && (
//                       <Button variant="outline" className="col-span-2" onClick={() => removeSigner(idx)}>
//                         Remove signer
//                       </Button>
//                     )}
//                   </div>
//                 ))}
//                 <Button variant="outline" className="w-full" onClick={addSigner}>Add signer</Button>
//               </div>
//               <Input
//                 value={ccEmails}
//                 onChange={e => setCcEmails(e.target.value)}
//                 placeholder="CC emails (comma separated)"
//               />
//               <Button
//                 onClick={useTemplate}
//                 disabled={sending}
//                 className="w-full bg-[#28ABDF] hover:bg-[#2399c8] text-white"
//               >
//                 {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
//                 Send using template
//               </Button>
//             </>
//           )}
//         </Card>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-5">
//         <Card className="p-4">
//           <div className="flex items-center justify-between mb-3">
//             <h2 className="font-semibold inline-flex items-center gap-2">
//               <BarChart3 className="w-4 h-4 text-[#28ABDF]" /> Usage Analytics
//             </h2>
//             {usageLoading && <Loader2 className="w-4 h-4 animate-spin text-[#28ABDF]" />}
//           </div>
//           {!selected ? (
//             <p className="text-sm text-slate-500">Select a template to view analytics.</p>
//           ) : (
//             <>
//               <div className="grid grid-cols-2 gap-2 mb-3">
//                 <select
//                   value={usageStatus}
//                   onChange={(e) => setUsageStatus(e.target.value)}
//                   className="h-9 rounded-lg border border-slate-200 px-2 text-sm bg-white"
//                 >
//                   <option value="all">All statuses</option>
//                   <option value="in_progress">In progress</option>
//                   <option value="completed">Completed</option>
//                 </select>
//                 <select
//                   value={usageRangeDays}
//                   onChange={(e) => setUsageRangeDays(Number(e.target.value))}
//                   className="h-9 rounded-lg border border-slate-200 px-2 text-sm bg-white"
//                 >
//                   <option value={7}>Last 7 days</option>
//                   <option value={30}>Last 30 days</option>
//                   <option value={90}>Last 90 days</option>
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 {usageBuckets.length === 0 ? (
//                   <p className="text-sm text-slate-500">No usage data in selected filter.</p>
//                 ) : usageBuckets.map((b) => (
//                   <div key={b.date} className="flex items-center gap-2">
//                     <span className="text-xs w-20 text-slate-500">{b.date}</span>
//                     <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
//                       <div
//                         className="h-2 bg-[#28ABDF]"
//                         style={{ width: `${(b.count / maxBucket) * 100}%` }}
//                       />
//                     </div>
//                     <span className="text-xs font-semibold text-slate-700 w-6 text-right">{b.count}</span>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-4 text-xs text-slate-500">
//                 Matched records: <strong>{filteredUsage.length}</strong>
//               </div>
//             </>
//           )}
//         </Card>

//         <Card className="p-4">
//           <h2 className="font-semibold inline-flex items-center gap-2 mb-3">
//             <Upload className="w-4 h-4 text-[#28ABDF]" /> Bulk One-to-Many Wizard (CSV)
//           </h2>
//           <p className="text-xs text-slate-500 mb-2">
//             CSV format: <code>name,email</code> (first row must be header).
//           </p>
//           <input
//             type="file"
//             accept=".csv,text/csv"
//             onChange={handleCsvUpload}
//             className="block w-full text-sm"
//           />
//           <div className="mt-3 text-sm">
//             Loaded employees: <strong>{csvRows.length}</strong>
//           </div>
//           {csvRows.length > 0 && (
//             <div className="mt-2 max-h-28 overflow-auto rounded-lg border border-slate-200 p-2 text-xs text-slate-600">
//               {csvRows.slice(0, 8).map((r, i) => (
//                 <div key={`${r.email}-${i}`}>{r.name} — {r.email}</div>
//               ))}
//               {csvRows.length > 8 && <div>...and {csvRows.length - 8} more</div>}
//             </div>
//           )}
//           <Button
//             onClick={handleBulkSend}
//             disabled={bulkSending || !selected || !csvRows.length}
//             className="w-full mt-4 bg-[#28ABDF] hover:bg-[#2399c8] text-white"
//           >
//             {bulkSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
//             Send Bulk from Template
//           </Button>
//         </Card>
//       </div>
//     </div>
//   );
// }
import React, {
  useEffect, useMemo, useState, useCallback,
} from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Badge }  from '@/components/ui/badge';
import { toast }  from 'sonner';
import {
  LayoutTemplate, Plus, Send, Loader2,
  Clock3, BarChart3, Upload, Users,
  CheckCircle2, X,
} from 'lucide-react';

const emptySigner = { name:'', email:'' };

export default function Templates() {
  const [templates,    setTemplates]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(null);
  const [signers,      setSigners]      = useState([{ ...emptySigner }]);
  const [ccEmails,     setCcEmails]     = useState('');
  const [sending,      setSending]      = useState(false);
  const [usage,        setUsage]        = useState([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageStatus,  setUsageStatus]  = useState('all');
  const [usageDays,    setUsageDays]    = useState(30);
  const [csvRows,      setCsvRows]      = useState([]);
  const [bulkSending,  setBulkSending]  = useState(false);

  // ── Load templates ──────────────────────────────────────────
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents/templates');
      setTemplates(res.data?.templates || []);
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  // ── Load usage ──────────────────────────────────────────────
  const loadUsage = useCallback(async (id) => {
    if (!id) return;
    try {
      setUsageLoading(true);
      const res = await api.get(`/documents/templates/${id}/usage`);
      setUsage(res.data?.usage || []);
    } catch {
      toast.error('Failed to load usage history');
    } finally {
      setUsageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected?._id) loadUsage(selected._id);
    else setUsage([]);
  }, [selected?._id, loadUsage]);

  // ── Signer helpers ──────────────────────────────────────────
  const addSigner    = () =>
    setSigners(p => [...p, { ...emptySigner }]);
  const removeSigner = (i) =>
    setSigners(p => p.filter((_, idx) => idx !== i));
  const updateSigner = (i, key, val) =>
    setSigners(p => p.map((s, idx) =>
      idx === i ? { ...s, [key]: val } : s
    ));

  // ── Use template ────────────────────────────────────────────
  const useTemplate = async () => {
    if (!selected?._id) return;
    if (signers.some(s => !s.name.trim() || !s.email.trim())) {
      toast.error('All signers need a name and email.');
      return;
    }
    setSending(true);
    try {
      const ccList = ccEmails
        .split(',')
        .map(e => ({ email: e.trim().toLowerCase(), name:'' }))
        .filter(r => r.email);

      // Optimistic
      toast.success('Sending... check dashboard shortly!');
      setSelected(null);
      setSigners([{ ...emptySigner }]);
      setCcEmails('');

      await api.post(`/documents/templates/${selected._id}/use`, {
        signers: signers.map(s => ({
          name:  s.name.trim(),
          email: s.email.trim().toLowerCase(),
        })),
        ccList,
      });

      loadTemplates();
      loadUsage(selected._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setSending(false);
    }
  };

  // ── CSV ─────────────────────────────────────────────────────
  const parseCsv = async (file) => {
    const text    = await file.text();
    const lines   = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const [hdr, ...rows] = lines;
    const headers = hdr.split(',').map(h => h.trim().toLowerCase());
    const ni = headers.indexOf('name');
    const ei = headers.indexOf('email');
    if (ni === -1 || ei === -1)
      throw new Error('CSV needs "name" and "email" headers.');
    return rows
      .map(r => {
        const c = r.split(',').map(x => x.trim());
        return { name: c[ni]||'', email: (c[ei]||'').toLowerCase() };
      })
      .filter(r => r.name && r.email);
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseCsv(file);
      if (!rows.length) {
        toast.error('No valid rows in CSV.');
        return;
      }
      setCsvRows(rows);
      toast.success(`${rows.length} employees loaded!`);
    } catch (err) {
      toast.error(err.message || 'Invalid CSV.');
    } finally {
      e.target.value = '';
    }
  };

  const handleBulkSend = async () => {
    if (!selected?._id) { toast.error('Select a template.'); return; }
    if (!csvRows.length) { toast.error('Upload CSV first.'); return; }
    setBulkSending(true);
    try {
      const ccList = ccEmails
        .split(',')
        .map(e => ({ email: e.trim().toLowerCase(), name:'' }))
        .filter(r => r.email);

      // Optimistic
      toast.success(`Sending to ${csvRows.length} employees...`);
      setCsvRows([]);

      await api.post(`/documents/templates/${selected._id}/use-bulk`, {
        employees: csvRows,
        ccList,
      });

      loadUsage(selected._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk send failed.');
    } finally {
      setBulkSending(false);
    }
  };

  // ── Analytics ───────────────────────────────────────────────
  const filteredUsage = useMemo(() => {
    const now  = Date.now();
    const span = usageDays * 86400000;
    return usage.filter(u => {
      const t  = new Date(u.createdAt || u.updatedAt || 0).getTime();
      const ok = usageStatus === 'all' || u.status === usageStatus;
      return now - t <= span && ok;
    });
  }, [usage, usageDays, usageStatus]);

  const buckets = useMemo(() => {
    const map = {};
    filteredUsage.forEach(u => {
      const k = new Date(u.createdAt||u.updatedAt||Date.now())
        .toLocaleDateString();
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .slice(-10);
  }, [filteredUsage]);

  const maxBucket = Math.max(1, ...buckets.map(b => b.count));

  if (loading) return (
    <div className="py-20 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-[#28ABDF]" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900
                         dark:text-white">
            Templates
          </h1>
          <p className="text-sm text-slate-500">
            Create once, reuse for bulk signing.
          </p>
        </div>
        <Link to="/new-template">
          <Button className="bg-[#28ABDF] hover:bg-[#2399c8]
                             text-white rounded-xl gap-2">
            <Plus className="w-4 h-4" /> New Template
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* Template list */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {templates.length === 0 ? (
            <Card className="p-8 text-center sm:col-span-2
                             border-dashed border-2">
              <LayoutTemplate className="w-12 h-12 mx-auto
                                         text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                No templates yet.
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Create a new template to get started.
              </p>
            </Card>
          ) : templates.map(tpl => (
            <Card
              key={tpl._id}
              onClick={() => setSelected(tpl)}
              className={`p-4 cursor-pointer transition-all
                          border-2 rounded-2xl hover:shadow-md
                          ${selected?._id === tpl._id
                            ? 'border-[#28ABDF] bg-sky-50/50 dark:bg-sky-900/10'
                            : 'border-slate-200 dark:border-slate-700'}`}
            >
              {/* Logo */}
              {tpl.companyLogo && (
                <img
                  src={tpl.companyLogo}
                  alt="Logo"
                  className="h-8 max-w-[100px] object-contain mb-2"
                />
              )}

              <p className="font-semibold text-slate-800
                            dark:text-slate-100 truncate">
                {tpl.title}
              </p>

              <div className="mt-2 flex items-center
                              justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="w-3 h-3" />
                  {new Date(
                    tpl.updatedAt || tpl.createdAt
                  ).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {tpl.usageCount || 0} uses
                </span>
              </div>

              {/* Party 1 status */}
              <div className="mt-2">
                {tpl.isParty1Signed ? (
                  <Badge className="text-[9px] bg-green-100
                                   text-green-700 border-0">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                    Party 1 Signed ✓
                  </Badge>
                ) : (
                  <Badge className="text-[9px] bg-amber-100
                                   text-amber-700 border-0">
                    Awaiting Party 1 Sign
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Use template panel */}
        <Card className="p-5 space-y-4 h-fit rounded-2xl
                         border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-800 dark:text-white">
            Use Template
          </h2>

          {!selected ? (
            <p className="text-sm text-slate-500">
              Select a template from the left.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3
                              bg-sky-50 dark:bg-sky-900/20
                              rounded-xl border border-sky-100
                              dark:border-sky-800">
                {selected.companyLogo && (
                  <img
                    src={selected.companyLogo}
                    alt="Logo"
                    className="h-8 max-w-[80px] object-contain"
                  />
                )}
                <p className="text-sm font-bold text-sky-700
                              dark:text-sky-300 truncate">
                  {selected.title}
                </p>
              </div>

              {/* Signers */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500
                              uppercase tracking-wider">
                  Signers
                </p>
                {signers.map((s, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={s.name}
                        onChange={e =>
                          updateSigner(i, 'name', e.target.value)
                        }
                        placeholder="Name"
                        className="h-9 text-xs rounded-xl"
                      />
                      <Input
                        value={s.email}
                        onChange={e =>
                          updateSigner(i, 'email', e.target.value)
                        }
                        placeholder="Email"
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                    {signers.length > 1 && (
                      <button
                        onClick={() => removeSigner(i)}
                        className="text-xs text-red-400
                                   hover:text-red-600 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline" size="sm"
                  onClick={addSigner}
                  className="w-full rounded-xl text-xs h-8"
                >
                  + Add Signer
                </Button>
              </div>

              {/* CC */}
              <div>
                <p className="text-xs font-bold text-slate-500
                              uppercase tracking-wider mb-1.5">
                  CC (comma separated)
                </p>
                <Input
                  value={ccEmails}
                  onChange={e => setCcEmails(e.target.value)}
                  placeholder="email1@co.com, email2@co.com"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <Button
                onClick={useTemplate}
                disabled={sending}
                className="w-full bg-[#28ABDF] hover:bg-[#2399c8]
                           text-white rounded-xl h-10 font-semibold"
              >
                {sending
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <Send className="w-4 h-4 mr-2" />
                }
                Send to Signers
              </Button>
            </>
          )}
        </Card>
      </div>

      {/* Analytics + Bulk */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Analytics */}
        <Card className="p-5 rounded-2xl border-slate-200
                         dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold inline-flex items-center gap-2
                           text-slate-800 dark:text-white">
              <BarChart3 className="w-4 h-4 text-[#28ABDF]" />
              Usage Analytics
            </h2>
            {usageLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-[#28ABDF]" />
            )}
          </div>

          {!selected ? (
            <p className="text-sm text-slate-500">
              Select a template to view analytics.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <select
                  value={usageStatus}
                  onChange={e => setUsageStatus(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200
                             px-2 text-sm bg-white dark:bg-slate-800
                             dark:border-slate-600"
                >
                  <option value="all">All statuses</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={usageDays}
                  onChange={e => setUsageDays(Number(e.target.value))}
                  className="h-9 rounded-xl border border-slate-200
                             px-2 text-sm bg-white dark:bg-slate-800
                             dark:border-slate-600"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>

              {buckets.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No data in selected range.
                </p>
              ) : (
                <div className="space-y-2">
                  {buckets.map(b => (
                    <div key={b.date}
                         className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-20">
                        {b.date}
                      </span>
                      <div className="flex-1 h-2 bg-slate-100
                                      rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-[#28ABDF] rounded-full
                                     transition-all duration-500"
                          style={{
                            width: `${(b.count / maxBucket) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold
                                       text-slate-700 w-5 text-right">
                        {b.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span>
                  Total matched:{' '}
                  <strong className="text-slate-700">
                    {filteredUsage.length}
                  </strong>
                </span>
                <span>
                  Completed:{' '}
                  <strong className="text-green-600">
                    {filteredUsage.filter(
                      u => u.status === 'completed'
                    ).length}
                  </strong>
                </span>
              </div>
            </>
          )}
        </Card>

        {/* Bulk CSV */}
        <Card className="p-5 rounded-2xl border-slate-200
                         dark:border-slate-700">
          <h2 className="font-bold inline-flex items-center gap-2
                         text-slate-800 dark:text-white mb-3">
            <Upload className="w-4 h-4 text-[#28ABDF]" />
            Bulk Send (CSV)
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            CSV format:{' '}
            <code className="bg-slate-100 dark:bg-slate-700
                             px-1 rounded">
              name,email
            </code>{' '}
            (first row = header)
          </p>

          <label className="flex items-center gap-2 cursor-pointer
                            border-2 border-dashed border-slate-200
                            dark:border-slate-600 rounded-xl p-3
                            hover:border-[#28ABDF] transition-colors">
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">
              {csvRows.length > 0
                ? `${csvRows.length} employees loaded`
                : 'Choose CSV file'
              }
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
          </label>

          {csvRows.length > 0 && (
            <div className="mt-3 max-h-28 overflow-auto
                            rounded-xl border border-slate-200
                            dark:border-slate-700 p-2">
              {csvRows.slice(0, 8).map((r, i) => (
                <div key={i}
                     className="text-xs text-slate-600
                                dark:text-slate-400 py-0.5">
                  {r.name} — {r.email}
                </div>
              ))}
              {csvRows.length > 8 && (
                <div className="text-xs text-slate-400">
                  ...and {csvRows.length - 8} more
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleBulkSend}
            disabled={bulkSending || !selected || !csvRows.length}
            className="w-full mt-4 bg-[#28ABDF] hover:bg-[#2399c8]
                       text-white rounded-xl h-10 font-semibold"
          >
            {bulkSending
              ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              : <Send className="w-4 h-4 mr-2" />
            }
            Send Bulk from Template
          </Button>
        </Card>
      </div>
    </div>
  );
}