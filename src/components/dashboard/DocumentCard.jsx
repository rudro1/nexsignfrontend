


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
import React, {
  useMemo, useCallback, useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge }  from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast }  from 'sonner';
import { api, buildProxyUrl } from '@/api/apiClient';
import {
  FileText, Users, ArrowRight, Clock,
  CheckCircle2, AlertCircle, Pencil, Layout,
  Eye, ShieldCheck, Trash2, MoreVertical,
  ExternalLink, Copy, Loader2, Send,
} from 'lucide-react';

// ════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════
const STATUS_CONFIG = {
  draft: {
    label:     'Draft',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    icon:      Pencil,
  },
  pending: {
    label:     'Pending',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon:      Clock,
  },
  in_progress: {
    label:     'Active',
    className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    icon:      Clock,
  },
  completed: {
    label:     'Completed',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon:      CheckCircle2,
  },
  cancelled: {
    label:     'Cancelled',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon:      AlertCircle,
  },
  template: {
    label:     'Template',
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    icon:      Layout,
  },
};

const PARTY_COLORS = [
  '#0ea5e9', '#8b5cf6', '#f59e0b',
  '#10b981', '#ef4444', '#ec4899',
];

// ════════════════════════════════════════════════════════════════
// CARD DROPDOWN MENU
// ════════════════════════════════════════════════════════════════
function CardMenu({ open, onClose, items }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute top-8 right-0 z-20
                      bg-white dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      rounded-xl shadow-xl min-w-[170px]
                      overflow-hidden
                      animate-in fade-in zoom-in-95 duration-150">
        {items.map(({ label, icon: Icon, onClick, danger }) => (
          <button
            key={label}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onClick(e);
            }}
            className={`w-full flex items-center gap-2.5
                        px-4 py-2.5 text-sm font-medium
                        transition-colors
                        ${danger
                          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// DOCUMENT CARD
// ════════════════════════════════════════════════════════════════
const DocumentCard = React.memo(({
  doc,
  onDeleted,
  onRefresh,   // ✅ Dashboard থেকে আসে — resend এর পর refresh করতে
}) => {
  const navigate = useNavigate();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [resending,  setResending]  = useState(false);

  const parties = doc.parties || [];

  // ── Status config ──────────────────────────────────────────
  const config = useMemo(() => {
    if (doc.isTemplate) return STATUS_CONFIG.template;
    return STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;
  }, [doc.status, doc.isTemplate]);

  const StatusIcon = config.icon;

  // ── Progress ───────────────────────────────────────────────
  const progress = useMemo(() => {
    if (!parties.length) return 0;
    const signed = parties.filter(p => p.status === 'signed').length;
    return Math.round((signed / parties.length) * 100);
  }, [parties]);

  // ── Current awaiting signer ────────────────────────────────
  const currentSigner = useMemo(() => {
    if (doc.status !== 'in_progress' || doc.isTemplate) return null;
    return parties.find(p => p.status !== 'signed') || null;
  }, [parties, doc.status, doc.isTemplate]);

  // ── Monitor stats ──────────────────────────────────────────
  const monitorStats = useMemo(() => {
    const signed = parties.filter(p => p.status === 'signed').length;
    const sent   = parties.filter(p =>
      p.status === 'sent' || p.status === 'signed'
    ).length;
    const opened = parties.filter(p =>
      (p.linkOpenCount || 0) > 0 || p.linkOpenedAt
    ).length;
    return {
      sent, opened, signed,
      total: parties.length,
    };
  }, [parties]);

  // ── Formatted date ─────────────────────────────────────────
  const formattedDate = useMemo(() => {
    const d = new Date(doc.updatedAt || doc.createdAt);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }, [doc.updatedAt, doc.createdAt]);

  // ── Action label ───────────────────────────────────────────
  const actionLabel = useMemo(() => {
    if (doc.status === 'completed') return 'View PDF';
    if (doc.isTemplate)             return 'Use Template';
    return 'Manage';
  }, [doc.status, doc.isTemplate]);

  // ════════════════════════════════════════════════════════════
  // HANDLERS
  // ════════════════════════════════════════════════════════════

  // ── Main card click ────────────────────────────────────────
  const handleCardClick = useCallback(() => {
    if (doc.status === 'completed' && !doc.isTemplate) {
      // Completed → signed PDF খোলো
      const url = doc.signedFileUrl || doc.fileUrl;
      if (url) {
        window.open(
          buildProxyUrl(url), '_blank', 'noopener,noreferrer'
        );
      } else {
        toast.error('Document not ready yet.');
      }
      return;
    }

    if (doc.isTemplate) {
      navigate(`/templates`);
      return;
    }

    // ✅ Manage — DocumentEditor এ existing doc load করো
    // DocumentEditor এ ?id=DOC_ID দিয়ে load হবে
    navigate(`/DocumentEditor?id=${doc._id}`);
  }, [doc, navigate]);

  // ── Audit ──────────────────────────────────────────────────
  const handleAudit = useCallback((e) => {
    e?.stopPropagation();
    navigate(`/audit?id=${doc._id}`);
  }, [doc._id, navigate]);

  // ── Copy ID ────────────────────────────────────────────────
  const handleCopyId = useCallback((e) => {
    e?.stopPropagation();
    navigator.clipboard
      .writeText(doc._id)
      .then(() => toast.success('Document ID copied!'))
      .catch(() => toast.error('Failed to copy.'));
  }, [doc._id]);

  // ── Open PDF ───────────────────────────────────────────────
  const handleOpenPdf = useCallback((e) => {
    e?.stopPropagation();
    const url = doc.signedFileUrl || doc.fileUrl;
    if (url) {
      window.open(buildProxyUrl(url), '_blank', 'noopener,noreferrer');
    } else {
      toast.error('File not available.');
    }
  }, [doc.signedFileUrl, doc.fileUrl]);

  // ── Resend email ───────────────────────────────────────────
  // ✅ এটি নতুন — Manage থেকে resend করা যাবে
  const handleResend = useCallback(async (e) => {
    e?.stopPropagation();
    if (resending) return;

    setResending(true);
    try {
      await api.post(`/documents/resend/${doc._id}`);
      toast.success('Signing email resent successfully!');
      // Dashboard refresh
      onRefresh?.();
    } catch (err) {
      const msg = err?.message || 'Failed to resend email.';
      toast.error(msg);
    } finally {
      setResending(false);
    }
  }, [doc._id, resending, onRefresh]);

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = useCallback(async (e) => {
    e?.stopPropagation();
    if (deleting) return;

    const confirmed = window.confirm(
      `Delete "${doc.title || 'this document'}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/documents/${doc._id}`);
      toast.success('Document deleted.');
      onDeleted?.(doc._id);
    } catch {
      toast.error('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  }, [doc._id, doc.title, deleting, onDeleted]);

  // ── Dropdown menu items ────────────────────────────────────
  const menuItems = useMemo(() => {
    const items = [];

    // Open PDF
    if (doc.signedFileUrl || doc.fileUrl) {
      items.push({
        label:   doc.signedFileUrl ? 'View Signed PDF' : 'View PDF',
        icon:    ExternalLink,
        onClick: handleOpenPdf,
      });
    }

    // Resend — only for in_progress docs
    if (doc.status === 'in_progress' && !doc.isTemplate) {
      items.push({
        label:   'Resend Email',
        icon:    Send,
        onClick: handleResend,
      });
    }

    // Audit
    items.push({
      label:   'Audit Trail',
      icon:    ShieldCheck,
      onClick: handleAudit,
    });

    // Copy ID
    items.push({
      label:   'Copy ID',
      icon:    Copy,
      onClick: handleCopyId,
    });

    // Delete
    if (!doc.isTemplate) {
      items.push({
        label:   'Delete',
        icon:    Trash2,
        onClick: handleDelete,
        danger:  true,
      });
    }

    return items;
  }, [
    doc.status, doc.signedFileUrl, doc.fileUrl, doc.isTemplate,
    handleOpenPdf, handleResend, handleAudit,
    handleCopyId, handleDelete,
  ]);

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      className="group relative flex flex-col
                 bg-white dark:bg-slate-800/40
                 border border-slate-200 dark:border-slate-700/50
                 rounded-2xl p-5 cursor-pointer
                 hover:shadow-xl hover:-translate-y-1
                 hover:border-sky-300 dark:hover:border-sky-700/50
                 transition-all duration-300 outline-none
                 focus-visible:ring-2 focus-visible:ring-sky-400
                 min-h-[200px]"
    >
      {/* Deleting overlay */}
      {deleting && (
        <div className="absolute inset-0 bg-white/80
                        dark:bg-slate-900/80 rounded-2xl
                        flex items-center justify-center z-30">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      )}

      {/* Resending overlay */}
      {resending && (
        <div className="absolute inset-0 bg-white/80
                        dark:bg-slate-900/80 rounded-2xl
                        flex flex-col items-center
                        justify-center z-30 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
          <span className="text-xs text-slate-500 font-medium">
            Resending email...
          </span>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-4">

        {/* Icon + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl shrink-0
                          bg-sky-50 dark:bg-sky-900/20
                          flex items-center justify-center
                          group-hover:bg-sky-100
                          dark:group-hover:bg-sky-900/30
                          transition-colors">
            {doc.isTemplate
              ? <Layout   className="w-5 h-5 text-violet-500" />
              : <FileText className="w-5 h-5 text-sky-500" />
            }
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800
                           dark:text-slate-100 truncate
                           text-sm leading-snug">
              {doc.title || 'Untitled Document'}
            </h3>
            {formattedDate && (
              <p className="text-[10px] text-slate-400
                            font-medium uppercase
                            tracking-wide mt-0.5">
                {formattedDate}
              </p>
            )}
          </div>
        </div>

        {/* Badge + Menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge className={`${config.className} border-0
                             font-bold px-2 py-1 rounded-lg
                             text-[9px] uppercase flex
                             items-center gap-1`}>
            <StatusIcon className="w-2.5 h-2.5" />
            {config.label}
          </Badge>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(o => !o);
              }}
              className="w-7 h-7 rounded-lg flex items-center
                         justify-center text-slate-400
                         hover:text-slate-600 hover:bg-slate-100
                         dark:hover:bg-slate-700 transition-colors
                         opacity-0 group-hover:opacity-100
                         focus:opacity-100"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <CardMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              items={menuItems}
            />
          </div>
        </div>
      </div>

      {/* ── Signing Progress ─────────────────────────────── */}
      {!doc.isTemplate && parties.length > 0 && (
        <div className="mb-4 flex-1">

          {/* Header row */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">
                {parties.length}{' '}
                {parties.length === 1 ? 'Signer' : 'Signers'}
              </span>
            </div>
            <span className="text-[11px] font-black text-sky-500">
              {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex gap-0.5 h-1.5 rounded-full
                          overflow-hidden
                          bg-slate-100 dark:bg-slate-700/50">
            {parties.map((p, i) => (
              <div
                key={i}
                className="flex-1 rounded-full
                           transition-all duration-500"
                style={{
                  backgroundColor: p.status === 'signed'
                    ? '#10b981'
                    : p.status === 'sent'
                      ? PARTY_COLORS[i % PARTY_COLORS.length]
                      : '#e2e8f0',
                  opacity: p.status === 'signed'
                    ? 1
                    : p.status === 'sent' ? 0.7 : 0.3,
                }}
              />
            ))}
          </div>

          {/* Awaiting signer */}
          {currentSigner && (
            <div className="mt-2.5 flex items-center gap-1.5
                            bg-amber-50 dark:bg-amber-900/10
                            border border-amber-100
                            dark:border-amber-900/20
                            px-2.5 py-1.5 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full
                              bg-amber-400 animate-pulse shrink-0" />
              <p className="text-[10px] text-slate-500
                            dark:text-slate-400 truncate">
                Awaiting:{' '}
                <span className="font-bold text-slate-800
                                 dark:text-slate-200">
                  {currentSigner.name}
                </span>
              </p>
            </div>
          )}

          {/* Stats badges */}
          <div className="mt-3 flex flex-wrap gap-1.5
                          text-[10px] font-semibold">
            <span className="px-2.5 py-1 rounded-full
                             bg-slate-100 dark:bg-slate-700
                             text-slate-600 dark:text-slate-400">
              Sent {monitorStats.sent}/{monitorStats.total}
            </span>
            <span className="px-2.5 py-1 rounded-full
                             bg-indigo-50 dark:bg-indigo-900/20
                             text-indigo-600 dark:text-indigo-400
                             flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Opened {monitorStats.opened}
            </span>
            <span className="px-2.5 py-1 rounded-full
                             bg-emerald-50 dark:bg-emerald-900/20
                             text-emerald-600 dark:text-emerald-400">
              Signed {monitorStats.signed}
            </span>
          </div>
        </div>
      )}

      {/* ── Template info ─────────────────────────────────── */}
      {doc.isTemplate && (
        <div className="mb-4 flex-1 flex items-center">
          <div className="flex items-center gap-2
                          bg-violet-50 dark:bg-violet-900/10
                          border border-violet-100
                          dark:border-violet-900/20
                          rounded-xl px-3 py-2">
            <Layout className="w-4 h-4 text-violet-500 shrink-0" />
            <span className="text-xs text-violet-600
                             dark:text-violet-400 font-semibold">
              Reusable Template
              {(doc.usageCount || 0) > 0 && (
                <span className="ml-1.5 text-violet-400">
                  · Used {doc.usageCount}×
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* ── Completed — Signed PDF preview ───────────────── */}
      {doc.status === 'completed' && doc.signedFileUrl && (
        <div className="mb-4 flex items-center gap-2
                        bg-emerald-50 dark:bg-emerald-900/10
                        border border-emerald-100
                        dark:border-emerald-900/20
                        rounded-xl px-3 py-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs text-emerald-600
                           dark:text-emerald-400 font-semibold">
            Signed PDF ready
          </span>
          <ExternalLink className="w-3 h-3 text-emerald-400 ml-auto" />
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="flex items-center justify-between
                      pt-3 mt-auto border-t
                      border-slate-100 dark:border-slate-700/50">
        {/* Doc ID */}
        <span className="text-[10px] font-bold text-slate-300
                         dark:text-slate-600 uppercase
                         tracking-tight font-mono">
          #{String(doc._id).slice(-6)}
        </span>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {/* Resend button — only for active docs */}
          {doc.status === 'in_progress' && !doc.isTemplate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleResend(e);
              }}
              disabled={resending}
              className="text-amber-500 hover:bg-amber-50
                         hover:text-amber-600 rounded-xl
                         gap-1 font-bold text-[11px]
                         h-8 px-3 transition-all"
              title="Resend signing email"
            >
              {resending
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Send className="w-3 h-3" />
              }
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="text-sky-500 hover:bg-sky-500
                       hover:text-white rounded-xl gap-1.5
                       font-bold text-[11px] h-8 px-3
                       transition-all duration-200 active:scale-95"
          >
            {actionLabel}
            <ArrowRight className="w-3.5 h-3.5
                                   group-hover:translate-x-0.5
                                   transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
});

DocumentCard.displayName = 'DocumentCard';
export default DocumentCard;