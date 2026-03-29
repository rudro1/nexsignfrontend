// src/components/dashboard/DocumentCard.jsx
import React, { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ArrowRight, Clock, CheckCircle2,
  AlertCircle, Pencil, Layout, Download, Eye,
  XCircle, Users, Trash2,
} from 'lucide-react';

// ─── cn helper ───────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

// ─── Status config ────────────────────────────────────────────────
const STATUS = {
  draft: {
    label:      'Draft',
    icon:       Pencil,
    card:       'border-slate-200 dark:border-slate-800',
    badge:      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    icon_bg:    'bg-slate-100 dark:bg-slate-800',
    icon_color: 'text-slate-500',
    bar:        'from-slate-300 to-slate-400',
  },
  pending: {
    label:      'Pending',
    icon:       Clock,
    card:       'border-amber-200/60 dark:border-amber-900/40',
    badge:      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon_bg:    'bg-amber-50 dark:bg-amber-900/20',
    icon_color: 'text-amber-500',
    bar:        'from-amber-400 to-amber-500',
  },
  in_progress: {
    label:      'In Progress',
    icon:       Clock,
    card:       'border-sky-200/60 dark:border-sky-900/40',
    badge:      'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    icon_bg:    'bg-sky-50 dark:bg-sky-900/20',
    icon_color: 'text-sky-500',
    bar:        'from-sky-400 to-sky-500',
  },
  completed: {
    label:      'Completed',
    icon:       CheckCircle2,
    card:       'border-emerald-200/60 dark:border-emerald-900/40',
    badge:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon_bg:    'bg-emerald-50 dark:bg-emerald-900/20',
    icon_color: 'text-emerald-500',
    bar:        'from-emerald-400 to-emerald-500',
  },
  declined: {
    label:      'Declined',
    icon:       XCircle,
    card:       'border-red-200/60 dark:border-red-900/40',
    badge:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon_bg:    'bg-red-50 dark:bg-red-900/20',
    icon_color: 'text-red-500',
    bar:        'from-red-400 to-red-500',
  },
  cancelled: {
    label:      'Cancelled',
    icon:       AlertCircle,
    card:       'border-red-200/60 dark:border-red-900/40',
    badge:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon_bg:    'bg-red-50 dark:bg-red-900/20',
    icon_color: 'text-red-500',
    bar:        'from-red-400 to-red-500',
  },
  template: {
    label:      'Template',
    icon:       Layout,
    card:       'border-violet-200/60 dark:border-violet-900/40',
    badge:      'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    icon_bg:    'bg-violet-50 dark:bg-violet-900/20',
    icon_color: 'text-violet-500',
    bar:        'from-violet-400 to-violet-500',
  },
};

const PARTY_COLORS = [
  '#0ea5e9', '#8b5cf6', '#f59e0b',
  '#10b981', '#ef4444', '#ec4899',
];

// ─── Tooltip ──────────────────────────────────────────────────────
const Tooltip = ({ label, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && label && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2
                        px-2.5 py-1 bg-slate-900 dark:bg-slate-700
                        text-white text-[10px] font-bold rounded-lg
                        whitespace-nowrap pointer-events-none z-20
                        shadow-xl">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2
                          border-4 border-transparent
                          border-t-slate-900 dark:border-t-slate-700" />
        </div>
      )}
    </div>
  );
};

// ─── AvatarStack ─────────────────────────────────────────────────
const AvatarStack = ({ parties }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex -space-x-2.5">
      {parties.slice(0, 4).map((p, i) => (
        <Tooltip key={i} label={`${p.name || `Party ${i + 1}`}${p.status === 'signed' ? ' ✓' : ''}`}>
          <div
            className={cn(
              'w-8 h-8 rounded-full border-2',
              'border-white dark:border-slate-900',
              'flex items-center justify-center',
              'text-[10px] font-black text-white',
              'shadow-sm ring-1 ring-black/5',
              'transition-transform duration-150',
              'hover:scale-110 hover:z-10 cursor-default',
              p.status === 'signed' &&
                'ring-2 ring-emerald-400 ring-offset-1',
            )}
            style={{
              backgroundColor: PARTY_COLORS[i % PARTY_COLORS.length],
            }}
          >
            {p.name?.charAt(0).toUpperCase() || 'P'}
          </div>
        </Tooltip>
      ))}
      {parties.length > 4 && (
        <div className="w-8 h-8 rounded-full border-2
                        border-white dark:border-slate-900
                        bg-slate-100 dark:bg-slate-700
                        flex items-center justify-center
                        text-[10px] font-black text-slate-500
                        dark:text-slate-400 shadow-sm">
          +{parties.length - 4}
        </div>
      )}
    </div>
    <span className="text-[10px] font-bold text-slate-400 ml-1">
      {parties.length}{' '}
      {parties.length === 1 ? 'party' : 'parties'}
    </span>
  </div>
);

// ─── ActionBtn ───────────────────────────────────────────────────
const ActionBtn = ({
  onClick, variant = 'default', children, className,
}) => {
  const base =
    'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl ' +
    'text-xs font-black uppercase tracking-wider ' +
    'transition-all duration-150 active:scale-[0.97]';

  const variants = {
    default:
      'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 ' +
      'dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 ' +
      'border border-slate-200 dark:border-slate-700',
    primary:
      'bg-sky-500 hover:bg-sky-600 text-white ' +
      'shadow-md shadow-sky-500/20',
    ghost:
      'bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 ' +
      'dark:hover:bg-sky-900/40 text-sky-600 dark:text-sky-400 ' +
      'border border-sky-100 dark:border-sky-800',
    success:
      'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 ' +
      'text-emerald-700 dark:text-emerald-400 ' +
      'border border-emerald-100 dark:border-emerald-800',
    danger:
      'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 ' +
      'text-red-600 dark:text-red-400 ' +
      'border border-red-100 dark:border-red-800',
  };

  return (
    <button
      onClick={onClick}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </button>
  );
};

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
const DocumentCard = React.memo(({ doc, viewMode = 'grid', onDelete }) => {
  const navigate = useNavigate();
  const parties  = doc?.parties || [];

  // ── Derived ─────────────────────────────────────────────────
  const cfg = useMemo(() => {
    if (doc.isTemplate) return STATUS.template;
    return STATUS[doc.status] || STATUS.draft;
  }, [doc.status, doc.isTemplate]);

  const StatusIcon = cfg.icon;

  const progress = useMemo(() => {
    if (!parties.length) return 0;
    const signed = parties.filter(p => p.status === 'signed').length;
    return Math.round((signed / parties.length) * 100);
  }, [parties]);

  const signedCount = useMemo(
    () => parties.filter(p => p.status === 'signed').length,
    [parties],
  );

  const currentSigner = useMemo(() => {
    if (doc.status !== 'in_progress' || doc.isTemplate) return null;
    return parties.find(p => p.status !== 'signed') || null;
  }, [parties, doc.status, doc.isTemplate]);

  const formattedDate = useMemo(() => {
    const d = new Date(doc.createdAt || doc.updatedAt);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }, [doc.createdAt, doc.updatedAt]);

  // Can delete — only draft or completed
  const canDelete = useMemo(
    () =>
      onDelete &&
      (doc.status === 'draft' || doc.status === 'completed'),
    [onDelete, doc.status],
  );

  // ── Handlers ────────────────────────────────────────────────
  const handleCardClick = useCallback(() => {
    if (doc.isTemplate) return navigate(`/templates/${doc._id}`);
    if (doc.status === 'draft')
      return navigate(`/document-editor?id=${doc._id}`);
    navigate(`/documents/${doc._id}`);
  }, [doc, navigate]);

  // Stop propagation wrapper
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn(e);
  };

  const handleView = stop(() => {
    if (doc.signedFileUrl) window.open(doc.signedFileUrl, '_blank');
  });

  const handleDownload = stop(() => {
    if (!doc.signedFileUrl) return;
    const a  = document.createElement('a');
    a.href     = doc.signedFileUrl;
    a.download = `${doc.title || 'document'}.pdf`;
    a.target   = '_blank';
    a.click();
  });

  const handleDelete = stop(async () => {
    if (!canDelete) return;
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    try {
      await import('@/api/apiClient').then(m =>
        m.api.delete(`/documents/${doc._id}`)
      );
      onDelete?.(doc._id);
    } catch (err) {
      console.error('[delete]', err);
      alert(err?.message || 'Failed to delete document.');
    }
  });

  const handleAction = stop(handleCardClick);

  // ── List view ────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className={cn(
          'group flex items-center gap-4',
          'bg-white dark:bg-slate-900 rounded-2xl',
          'border-2 cursor-pointer px-5 py-4',
          'transition-all duration-200',
          'hover:shadow-lg hover:shadow-slate-200/60',
          'dark:hover:shadow-slate-900/60',
          'hover:-translate-y-0.5',
          cfg.card,
        )}
      >
        {/* Icon */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center',
          'justify-center shrink-0',
          cfg.icon_bg,
        )}>
          <StatusIcon size={18} className={cfg.icon_color} />
        </div>

        {/* Title + date */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900
                        dark:text-white truncate
                        group-hover:text-sky-500
                        transition-colors">
            {doc.title || 'Untitled Document'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock size={10} className="text-slate-400 shrink-0" />
            <span className="text-[10px] text-slate-400 font-medium">
              {formattedDate}
            </span>
            {currentSigner && (
              <>
                <span className="text-slate-300">·</span>
                <span className="w-1.5 h-1.5 rounded-full
                                 bg-sky-400 animate-pulse" />
                <span className="text-[10px] text-sky-500 font-semibold truncate">
                  Awaiting {currentSigner.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Progress (only if has parties) */}
        {!doc.isTemplate && parties.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800
                            rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  cfg.bar,
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400
                             tabular-nums">
              {signedCount}/{parties.length}
            </span>
          </div>
        )}

        {/* Badge */}
        <span className={cn(
          'hidden md:block shrink-0 px-2.5 py-1 rounded-xl',
          'text-[10px] font-black uppercase tracking-wider',
          cfg.badge,
        )}>
          {cfg.label}
        </span>

        {/* Actions */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={e => e.stopPropagation()}
        >
          {doc.status === 'completed' && doc.signedFileUrl ? (
            <>
              <ActionBtn onClick={handleView} variant="ghost">
                <Eye size={13} /> View
              </ActionBtn>
              <ActionBtn onClick={handleDownload} variant="primary">
                <Download size={13} /> PDF
              </ActionBtn>
            </>
          ) : (
            <ActionBtn onClick={handleAction} variant="default">
              {doc.isTemplate
                ? 'Use'
                : doc.status === 'draft'
                  ? 'Edit'
                  : 'Manage'}
              <ArrowRight size={13} />
            </ActionBtn>
          )}
          {canDelete && (
            <ActionBtn onClick={handleDelete} variant="danger">
              <Trash2 size={13} />
            </ActionBtn>
          )}
        </div>
      </div>
    );
  }

  // ── Grid view (default) ──────────────────────────────────────
  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative flex flex-col',
        'bg-white dark:bg-slate-900',
        'rounded-3xl border-2 cursor-pointer',
        'transition-all duration-200',
        'hover:shadow-xl hover:shadow-slate-200/60',
        'dark:hover:shadow-slate-900/60',
        'hover:-translate-y-0.5',
        cfg.card,
      )}
    >
      {/* Completed accent line */}
      {doc.status === 'completed' && (
        <div className="absolute top-0 left-6 right-6 h-0.5
                        bg-gradient-to-r from-emerald-400
                        to-emerald-500 rounded-full" />
      )}

      <div className="p-5 sm:p-6 flex flex-col gap-5 h-full">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div className={cn(
              'w-10 h-10 rounded-2xl flex items-center',
              'justify-center flex-shrink-0 mt-0.5',
              cfg.icon_bg,
            )}>
              <StatusIcon size={18} className={cfg.icon_color} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900
                             dark:text-white truncate
                             group-hover:text-sky-500
                             transition-colors duration-200
                             leading-snug">
                {doc.title || 'Untitled Document'}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock size={11} className="text-slate-400 flex-shrink-0" />
                <span className="text-[10px] font-bold text-slate-400
                                 uppercase tracking-wider">
                  {formattedDate || 'No date'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status badge */}
            <span className={cn(
              'px-2.5 py-1 rounded-xl',
              'text-[10px] font-black uppercase tracking-wider',
              cfg.badge,
            )}>
              {cfg.label}
            </span>

            {/* Delete button (draft/completed only) */}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-slate-300
                           hover:text-red-500 hover:bg-red-50
                           dark:hover:bg-red-900/20
                           transition-colors opacity-0
                           group-hover:opacity-100"
                title="Delete document"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!doc.isTemplate && parties.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400
                               uppercase tracking-wider">
                Signing Progress
              </span>
              <span className="text-[10px] font-black text-slate-600
                               dark:text-slate-300">
                {signedCount}/{parties.length} signed · {progress}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800
                            rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  'transition-all duration-700 ease-out',
                  cfg.bar,
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Template info */}
        {doc.isTemplate && doc.recipientCount != null && (
          <div className="flex items-center gap-2 py-2.5 px-3.5
                          rounded-2xl bg-violet-50 dark:bg-violet-900/20
                          border border-violet-100
                          dark:border-violet-800/30">
            <Users size={13} className="text-violet-500 flex-shrink-0" />
            <span className="text-[11px] font-black text-violet-700
                             dark:text-violet-400 uppercase tracking-wide">
              {doc.recipientCount} recipients configured
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100
                        dark:border-slate-800 flex items-center
                        justify-between gap-3">

          {parties.length > 0
            ? <AvatarStack parties={parties} />
            : (
              <div className="flex items-center gap-1.5
                              text-[10px] font-bold text-slate-400">
                <FileText size={13} />
                {doc.isTemplate ? 'Master template' : 'No parties yet'}
              </div>
            )
          }

          {/* Action buttons */}
          <div
            className="flex items-center gap-2 flex-shrink-0"
            onClick={e => e.stopPropagation()}
          >
            {doc.status === 'completed' && doc.signedFileUrl ? (
              <>
                <ActionBtn onClick={handleView} variant="ghost">
                  <Eye size={13} /> View
                </ActionBtn>
                <ActionBtn onClick={handleDownload} variant="primary">
                  <Download size={13} /> PDF
                </ActionBtn>
              </>
            ) : (
              <ActionBtn onClick={handleAction} variant="default">
                {doc.isTemplate
                  ? 'Use'
                  : doc.status === 'draft'
                    ? 'Edit'
                    : 'Manage'}
                <ArrowRight size={13} />
              </ActionBtn>
            )}
          </div>
        </div>

        {/* Awaiting signer chip */}
        {currentSigner && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5
                          rounded-2xl bg-sky-50 dark:bg-sky-900/15
                          border border-sky-100
                          dark:border-sky-800/40">
            <span className="w-2 h-2 rounded-full bg-sky-400
                             animate-pulse flex-shrink-0
                             shadow-[0_0_6px_rgba(56,189,248,0.6)]" />
            <p className="text-[10px] font-black uppercase
                          tracking-wider text-sky-600
                          dark:text-sky-400 truncate">
              Awaiting{' '}
              <span className="text-slate-900 dark:text-white font-black">
                {currentSigner.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

DocumentCard.displayName = 'DocumentCard';
export default DocumentCard;