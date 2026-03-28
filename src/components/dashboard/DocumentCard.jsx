


// import React, { useMemo, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// // ✅ FIX: correct import path (was "../ui/Card" which broke in some setups)
// import { Card } from '@/components/ui/Card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { toast } from 'sonner';
// import { api, buildProxyUrl } from '@/api/apiClient';
// import {
//   FileText, Users, ArrowRight, Clock,
//   CheckCircle2, AlertCircle, Pencil, Layout, Eye, ShieldCheck,
// } from 'lucide-react';

// const statusConfig = {
//   draft: {
//     label: 'Draft',
//     color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
//     icon: Pencil,
//   },
//   pending: {
//     label: 'Pending',
//     color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
//     icon: Clock,
//   },
//   in_progress: {
//     label: 'In Progress',
//     color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
//     icon: Clock,
//   },
//   completed: {
//     label: 'Completed',
//     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
//     icon: CheckCircle2,
//   },
//   cancelled: {
//     label: 'Cancelled',
//     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
//     icon: AlertCircle,
//   },
//   template: {
//     label: 'Template',
//     color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
//     icon: Layout,
//   },
// };

// const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// const DocumentCard = React.memo(({ doc }) => {
//   const navigate = useNavigate();
//   const parties  = doc.parties || [];

//   const config = useMemo(() => {
//     if (doc.isTemplate) return statusConfig.template;
//     return statusConfig[doc.status] || statusConfig.draft;
//   }, [doc.status, doc.isTemplate]);

//   const StatusIcon = config.icon;

//   const progress = useMemo(() => {
//     if (!parties.length) return 0;
//     const signed = parties.filter(p => p.status === 'signed').length;
//     return Math.round((signed / parties.length) * 100);
//   }, [parties]);

//   // ✅ FIX: currentSigner now handles missing currentPartyIndex gracefully
//   const currentSigner = useMemo(() => {
//     if (doc.status !== 'in_progress' || doc.isTemplate) return null;
//     // Find the first party that hasn't signed yet
//     return parties.find(p => p.status !== 'signed') || null;
//   }, [parties, doc.status, doc.isTemplate]);

//   // const formattedDate = useMemo(() => {
//   //   const dateStr = doc.createdAt || doc.updatedAt;
//   //   if (!dateStr) return '';
//   //   try {
//   //     return new Date(dateStr).toLocaleDateString('en-GB', {
//   //       day: '2-digit', month: 'short', year: 'numeric',
//   //     });
//   //   } catch {
//   //     return '';
//   //   }
//   // }, [doc.createdAt, doc.updatedAt]);

//   // ✅ FIX: action handler with proper event handling
//  const formattedDate = useMemo(() => {
//   const dateStr = doc.createdAt || doc.updatedAt;
//   if (!dateStr) return '';
//   const date = new Date(dateStr);
//   return !isNaN(date) 
//     ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
//     : '';
// }, [doc.createdAt, doc.updatedAt]);
 
//   // const handleAction = useCallback((e) => {
//   //   e.stopPropagation();
//   //   e.preventDefault();

//   //   if (doc.status === 'completed' && !doc.isTemplate) {
//   //     if (doc.fileUrl) {
//   //       window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
//   //     } else {
//   //       toast.error('Final document is not ready yet.');
//   //     }
//   //     return;
//   //   }

//   //   navigate(`/DocumentEditor?id=${doc._id}${doc.isTemplate ? '&type=template' : ''}`);
//   // }, [doc, navigate]);
// const handleAction = useCallback((e) => {
//   e.stopPropagation();
//   e.preventDefault();

//   if (doc.status === 'completed' && !doc.isTemplate) {
//     if (doc.fileUrl) {
//       // ✅ ফিক্স: সরাসরি fileUrl ব্যবহার না করে buildProxyUrl ফাংশনটি কল করুন
//       const finalUrl = buildProxyUrl(doc.fileUrl);
//       window.open(finalUrl, '_blank', 'noopener,noreferrer');
//     } else {
//       toast.error('Final document is not ready yet.');
//     }
//     return;
//   }

//   navigate(`/DocumentEditor?id=${doc._id}${doc.isTemplate ? '&type=template' : ''}`);
// }, [doc, navigate]);

// const handleOpenAudit = useCallback((e) => {
//   e.stopPropagation();
//   e.preventDefault();
//   navigate(`/audit?id=${doc._id}`);
// }, [doc._id, navigate]);

// const handlePublishTemplate = useCallback(async (e) => {
//   e.stopPropagation();
//   e.preventDefault();
//   try {
//     const res = await api.post(`/documents/templates/${doc._id}/publish`);
//     if (res.data?.success) {
//       toast.success('Template published');
//     }
//   } catch (err) {
//     toast.error(err.response?.data?.error || 'Failed to publish template');
//   }
// }, [doc._id]);

// const monitorStats = useMemo(() => {
//   const sent = parties.filter(p => p.status === 'sent' || p.status === 'signed').length;
//   const opened = parties.filter(p => (p.linkOpenCount || 0) > 0 || p.linkOpenedAt).length;
//   const signed = parties.filter(p => p.status === 'signed').length;
//   return { sent, opened, signed, total: parties.length };
// }, [parties]);

//   return (
//  <Card
//   onClick={handleAction}
//   className="p-5 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:shadow-2xl hover:-translate-y-1 dark:hover:border-[#28ABDF]/40 hover:border-[#28ABDF]/30 transition-all duration-300 cursor-pointer group flex flex-col h-full rounded-2xl"
// >
//       {/* Header */}
//       <div className="flex items-start justify-between gap-3 mb-5">
//         <div className="flex items-center gap-3 min-w-0">
//           <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#28ABDF]/10 transition-colors">
//             <FileText className="w-5 h-5 text-[#28ABDF]" />
//           </div>
//           <div className="min-w-0">
//             <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm sm:text-base leading-snug">
//               {doc.title || 'Untitled Document'}
//             </h3>
//             {formattedDate && (
//               <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
//                 {formattedDate}
//               </p>
//             )}
//           </div>
//         </div>
//         <Badge className={`${config.color} border-0 font-bold px-2 py-1 rounded-lg text-[9px] uppercase flex items-center gap-1 flex-shrink-0`}>
//           <StatusIcon className="w-2.5 h-2.5" />
//           {config.label}
//         </Badge>
//       </div>

//       {/* Signing Progress */}
//       {!doc.isTemplate && parties.length > 0 && (
//         <div className="mb-5 flex-grow">
//           <div className="flex justify-between items-center mb-2">
//             <div className="flex items-center gap-1.5 text-slate-500">
//               <Users className="w-3.5 h-3.5" />
//               <span className="text-[11px] font-semibold">
//                 {parties.length} {parties.length === 1 ? 'Signer' : 'Signers'}
//               </span>
//             </div>
//             <span className="text-[11px] font-black text-[#28ABDF]">{progress}%</span>
//           </div>

//           {/* Progress bar — one segment per party */}
//           <div className="flex gap-0.5 h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
//             {parties.map((p, i) => (
//               <div
//                 key={i}
//                 className="flex-1 rounded-full transition-all duration-500"
//                 style={{
//                   backgroundColor: p.status === 'signed'
//                     ? '#10b981'
//                     : p.status === 'sent'
//                     ? PARTY_COLORS[i % PARTY_COLORS.length]
//                     : '#e2e8f0',
//                   opacity: p.status === 'signed' ? 1 : p.status === 'sent' ? 0.7 : 0.3,
//                 }}
//               />
//             ))}
//           </div>

//           {/* Current awaiting signer */}
//           {currentSigner && (
//             <div className="mt-2.5 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 px-2 py-1.5 rounded-lg">
//               <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
//               <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
//                 Awaiting:{' '}
//                 <span className="font-bold text-slate-800 dark:text-slate-100">
//                   {currentSigner.name}
//                 </span>
//               </p>
//             </div>
//           )}
//           <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
//             <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Sent {monitorStats.sent}/{monitorStats.total}</span>
//             <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 inline-flex items-center gap-1"><Eye className="w-3 h-3" /> Opened {monitorStats.opened}</span>
//             <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Signed {monitorStats.signed}</span>
//           </div>
//         </div>
//       )}

//       {/* Template badge */}
//       {doc.isTemplate && (
//         <div className="mb-5 flex-grow flex items-center">
//           <span className="text-xs text-violet-500 font-semibold bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-lg">
//             Reusable template
//           </span>
//         </div>
//       )}

//       {/* Footer */}
//       <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
//         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
//           {doc.isTemplate ? 'Template' : `···${String(doc._id).slice(-6)}`}
//         </span>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={handleAction}
//           className="text-[#28ABDF] hover:bg-[#28ABDF] hover:text-white rounded-lg gap-1 font-bold text-[11px] h-8 px-3 transition-all"
//         >
//           {doc.status === 'completed' ? 'Open PDF' : doc.isTemplate ? 'Use Template' : 'Manage'}
//           <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
//         </Button>
//       </div>
//       {!doc.isTemplate && (
//         <div className="mt-2 flex gap-2">
//           <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleOpenAudit}>
//             <ShieldCheck className="w-3 h-3 mr-1" /> Audit
//           </Button>
//           {doc.status === 'draft' && (
//             <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handlePublishTemplate}>
//               Publish Template
//             </Button>
//           )}
//         </div>
//       )}
//     </Card>
//   );
// });

// DocumentCard.displayName = 'DocumentCard';
// export default DocumentCard;
// src/components/dashboard/DocumentCard.jsx
// ════════════════════════════════════════════════════════════════
// FILE 2: src/components/dashboard/DocumentCard.jsx
// ════════════════════════════════════════════════════════════════
i/**
 * DocumentCard.jsx — NeXsign Enterprise
 *
 * FIXES:
 * 1. Completed PDF opened via buildProxyUrl (not raw Cloudinary URL)
 * 2. 'processing' status shown as "Generating PDF…" with spinner
 * 3. Monitor stats (sent/opened/signed) badges
 * 4. Audit trail button
 * 5. Publish Template button for draft docs
 */
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api, buildProxyUrl } from '@/api/apiClient';
import {
  FileText, Users, ArrowRight, Clock,
  CheckCircle2, AlertCircle, Pencil, Layout, Eye, ShieldCheck, Loader2,
} from 'lucide-react';

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    icon:  Pencil,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    icon:  Clock,
  },
  processing: {
    label: 'Generating…',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    icon:  Loader2,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon:  CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon:  AlertCircle,
  },
  template: {
    label: 'Template',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    icon:  Layout,
  },
};

const PARTY_COLORS = ['#0ea5e9','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899'];

const DocumentCard = React.memo(({ doc }) => {
  const navigate = useNavigate();
  const parties  = doc.parties || [];

  const config = useMemo(() => {
    if (doc.isTemplate) return statusConfig.template;
    return statusConfig[doc.status] || statusConfig.draft;
  }, [doc.status, doc.isTemplate]);

  const StatusIcon = config.icon;

  const progress = useMemo(() => {
    if (!parties.length) return 0;
    return Math.round((parties.filter(p => p.status === 'signed').length / parties.length) * 100);
  }, [parties]);

  const currentSigner = useMemo(() => {
    if (doc.status !== 'in_progress' || doc.isTemplate) return null;
    return parties.find(p => p.status === 'sent' || (p.status !== 'signed' && p.status !== 'pending')) ||
           parties.find(p => p.status !== 'signed') || null;
  }, [parties, doc.status, doc.isTemplate]);

  const formattedDate = useMemo(() => {
    const d = new Date(doc.createdAt || doc.updatedAt);
    return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }, [doc.createdAt, doc.updatedAt]);

  const monitorStats = useMemo(() => ({
    sent:   parties.filter(p => p.status === 'sent' || p.status === 'signed').length,
    opened: parties.filter(p => (p.linkOpenCount || 0) > 0).length,
    signed: parties.filter(p => p.status === 'signed').length,
    total:  parties.length,
  }), [parties]);

  // ── Main action ────────────────────────────────────────────────────────
  const handleAction = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();

    if (doc.status === 'processing') {
      toast.info('PDF is being generated… Refresh in a moment.');
      return;
    }

    if (doc.status === 'completed' && !doc.isTemplate) {
      if (doc.fileUrl) {
        // ✅ Use buildProxyUrl so completed PDF goes through our proxy
        window.open(buildProxyUrl(doc.fileUrl), '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Final document is not ready yet.');
      }
      return;
    }
    navigate(`/DocumentEditor?id=${doc._id}${doc.isTemplate ? '&type=template' : ''}`);
  }, [doc, navigate]);

  const handleOpenAudit = useCallback((e) => {
    e.stopPropagation(); e.preventDefault();
    navigate(`/audit?id=${doc._id}`);
  }, [doc._id, navigate]);

  const handlePublishTemplate = useCallback(async (e) => {
    e.stopPropagation(); e.preventDefault();
    try {
      const res = await api.post(`/documents/templates/${doc._id}/publish`);
      if (res.data?.success) toast.success('Published as template!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    }
  }, [doc._id]);

  const isProcessing = doc.status === 'processing';

  return (
    <Card
      onClick={handleAction}
      className="p-5 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50
                 hover:shadow-2xl hover:-translate-y-1 dark:hover:border-[#28ABDF]/40
                 hover:border-[#28ABDF]/30 transition-all duration-300 cursor-pointer
                 group flex flex-col h-full rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#28ABDF]/10 transition-colors">
            <FileText className="w-5 h-5 text-[#28ABDF]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm sm:text-base leading-snug">
              {doc.title || 'Untitled Document'}
            </h3>
            {formattedDate && (
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {formattedDate}
              </p>
            )}
          </div>
        </div>
        <Badge className={`${config.color} border-0 font-bold px-2 py-1 rounded-lg text-[9px] uppercase flex items-center gap-1 flex-shrink-0 whitespace-nowrap`}>
          <StatusIcon className={`w-2.5 h-2.5 ${isProcessing ? 'animate-spin' : ''}`} />
          {config.label}
        </Badge>
      </div>

      {/* Progress + signers */}
      {!doc.isTemplate && parties.length > 0 && (
        <div className="mb-4 flex-grow">
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">
                {parties.length} Signer{parties.length !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-[11px] font-black text-[#28ABDF]">{progress}%</span>
          </div>

          {/* Multi-segment progress bar */}
          <div className="flex gap-0.5 h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
            {parties.map((p, i) => (
              <div key={i} className="flex-1 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: p.status === 'signed' ? '#10b981'
                                 : p.status === 'sent'   ? PARTY_COLORS[i % PARTY_COLORS.length]
                                 : '#e2e8f0',
                  opacity: p.status === 'signed' ? 1 : p.status === 'sent' ? 0.7 : 0.3,
                }} />
            ))}
          </div>

          {/* Awaiting badge */}
          {currentSigner && (
            <div className="mt-2 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 px-2 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              <p className="text-[10px] text-slate-500 truncate">
                Awaiting: <span className="font-bold text-slate-800 dark:text-slate-100">{currentSigner.name}</span>
              </p>
            </div>
          )}

          {/* Monitor stats */}
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              Sent {monitorStats.sent}/{monitorStats.total}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-1">
              <Eye className="w-3 h-3" /> Opened {monitorStats.opened}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Signed {monitorStats.signed}
            </span>
          </div>

          {/* Processing notice */}
          {isProcessing && (
            <div className="mt-2 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg px-2.5 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500 flex-shrink-0" />
              <p className="text-[10px] text-indigo-600 font-medium">Generating signed PDF with audit certificate…</p>
            </div>
          )}
        </div>
      )}

      {/* Template badge */}
      {doc.isTemplate && (
        <div className="mb-4 flex-grow flex items-center">
          <span className="text-xs text-violet-600 font-semibold bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-lg">
            Reusable template
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
          {doc.isTemplate ? 'Template' : `ID: …${String(doc._id).slice(-6)}`}
        </span>
        <Button variant="ghost" size="sm" onClick={handleAction}
          className="text-[#28ABDF] hover:bg-[#28ABDF] hover:text-white rounded-lg gap-1 font-bold text-[11px] h-8 px-3 transition-all">
          {doc.status === 'completed' ? 'Open PDF'
           : doc.status === 'processing' ? 'Generating…'
           : doc.isTemplate ? 'Use Template'
           : 'Manage'}
          {!isProcessing && <ArrowRight className="w-3 h-3" />}
        </Button>
      </div>

      {/* Audit + Publish actions */}
      {!doc.isTemplate && (
        <div className="mt-2 flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg flex-1 gap-1"
            onClick={handleOpenAudit}>
            <ShieldCheck className="w-3 h-3" /> Audit
          </Button>
          {doc.status === 'draft' && (
            <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg flex-1"
              onClick={handlePublishTemplate}>
              Publish Template
            </Button>
          )}
        </div>
      )}
    </Card>
  );
});

DocumentCard.displayName = 'DocumentCard';
export default DocumentCard;