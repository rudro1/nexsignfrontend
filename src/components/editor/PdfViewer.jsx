// src/components/editor/PdfViewer.jsx
import React, {
  useRef, useState, useEffect,
  useCallback, useMemo,
} from 'react';
import {
  ChevronLeft, ChevronRight, Trash2,
  ZoomIn, ZoomOut, Maximize2, Loader2,
  AlertTriangle, RefreshCw, PenTool,
  Type, Calendar, CheckSquare,
  Fingerprint, Hash, RotateCcw,
} from 'lucide-react';
import { Rnd }         from 'react-rnd';
import * as pdfjsLib   from 'pdfjs-dist';
import pdfjsWorker     from 'pdfjs-dist/build/pdf.worker.entry';
import { buildProxyUrl } from '@/api/apiClient';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ─── helpers ──────────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

const PARTY_COLORS = [
  '#0ea5e9', '#8b5cf6', '#f59e0b',
  '#10b981', '#ef4444', '#ec4899',
  '#6366f1', '#14b8a6',
];

const ZOOM_STEPS  = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5];
const ZOOM_FIT    = 1; // "fit" resets to auto-fit

// ─── Field type config ────────────────────────────────────────────
const FIELD_META = {
  signature: { icon: PenTool,      label: 'Signature', defaultW: 20, defaultH: 8  },
  initial:   { icon: Fingerprint,  label: 'Initial',   defaultW: 12, defaultH: 7  },
  date:      { icon: Calendar,     label: 'Date',      defaultW: 16, defaultH: 6  },
  text:      { icon: Type,         label: 'Text',      defaultW: 18, defaultH: 6  },
  checkbox:  { icon: CheckSquare,  label: 'Checkbox',  defaultW: 6,  defaultH: 6  },
  number:    { icon: Hash,         label: 'Number',    defaultW: 14, defaultH: 6  },
};

// ─── Tiny icon button ─────────────────────────────────────────────
const IconBtn = ({ onClick, disabled, title, children, active, className }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
      'text-slate-600 dark:text-slate-400',
      active
        ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400'
        : 'hover:bg-slate-200 dark:hover:bg-slate-700',
      'disabled:opacity-30 disabled:cursor-not-allowed',
      className,
    )}
  >
    {children}
  </button>
);

// ─── Field overlay ────────────────────────────────────────────────
const FieldOverlay = React.memo(({
  field, canvasSize, canvasSizeRef,
  party, isSelected, readOnly,
  onSelect, onUpdate, onRemove,
}) => {
  const color     = party?.color || PARTY_COLORS[field.partyIndex % PARTY_COLORS.length];
  const meta      = FIELD_META[field.type] || FIELD_META.text;
  const FieldIcon = meta.icon;

  const px = (field.x      / 100) * canvasSize.width;
  const py = (field.y      / 100) * canvasSize.height;
  const pw = (field.width  / 100) * canvasSize.width;
  const ph = (field.height / 100) * canvasSize.height;

  return (
    <Rnd
      key={field.id}
      size={{ width: pw, height: ph }}
      position={{ x: px, y: py }}
      bounds="parent"
      disableDragging={readOnly}
      enableResizing={readOnly ? false : {
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true,
        bottomLeft: true, topLeft: true,
      }}
      minWidth={40}
      minHeight={20}
      className="z-20"
      style={{ position: 'absolute' }}
      onDragStop={(_, d) => {
        const s = canvasSizeRef.current;
        onUpdate(field.id, {
          x: +((d.x / s.width)  * 100).toFixed(4),
          y: +((d.y / s.height) * 100).toFixed(4),
        });
      }}
      onResizeStop={(_, __, ref, ___, pos) => {
        const s = canvasSizeRef.current;
        onUpdate(field.id, {
          width:  +((parseFloat(ref.style.width)  / s.width)  * 100).toFixed(4),
          height: +((parseFloat(ref.style.height) / s.height) * 100).toFixed(4),
          x:      +((pos.x / s.width)  * 100).toFixed(4),
          y:      +((pos.y / s.height) * 100).toFixed(4),
        });
      }}
    >
      <div
        onClick={e => { e.stopPropagation(); if (!readOnly) onSelect?.(field.id); }}
        className={cn(
          'w-full h-full border-2 flex flex-col items-center justify-center',
          'relative group select-none transition-all duration-150',
          'rounded-sm',
          isSelected ? 'border-amber-400' : 'border-dashed',
        )}
        style={{
          borderColor:     isSelected ? '#f59e0b' : color,
          backgroundColor: isSelected ? 'rgba(245,158,11,0.12)' : `${color}1a`,
          boxShadow:       isSelected ? `0 0 0 2px rgba(245,158,11,0.4)` : 'none',
        }}
      >
        {/* Icon + label */}
        <div className="flex items-center gap-1 pointer-events-none px-1">
          <FieldIcon
            size={Math.min(pw * 0.18, 12)}
            style={{ color, flexShrink: 0 }}
          />
          <span
            className="font-black uppercase leading-none truncate"
            style={{
              color,
              fontSize: Math.min(pw * 0.1, 9),
              maxWidth: pw - 20,
            }}
          >
            {meta.label}
          </span>
        </div>

        {/* Party name */}
        <span
          className="font-bold leading-none truncate pointer-events-none mt-0.5"
          style={{
            color:    `${color}bb`,
            fontSize: Math.min(pw * 0.08, 7),
            maxWidth: pw - 8,
          }}
        >
          {party?.name || `Party ${field.partyIndex + 1}`}
        </span>

        {/* Font info for text fields */}
        {field.type === 'text' && field.fontFamily && (
          <span
            className="pointer-events-none mt-0.5"
            style={{
              color:    `${color}88`,
              fontSize: Math.min(pw * 0.07, 6),
            }}
          >
            {field.fontFamily} {field.fontSize}px
          </span>
        )}

        {/* Delete button */}
        {!readOnly && (
          <button
            type="button"
            onPointerDown={e => { e.stopPropagation(); e.preventDefault(); }}
            onClick={e => { e.stopPropagation(); e.preventDefault(); onRemove(field.id); }}
            className={cn(
              'absolute -top-3 -right-3',
              'w-5 h-5 bg-red-500 hover:bg-red-600',
              'text-white rounded-full flex items-center justify-center',
              'opacity-0 group-hover:opacity-100 shadow-md',
              'transition-opacity z-[999]',
              isSelected && 'opacity-100',
            )}
          >
            <Trash2 size={9} />
          </button>
        )}

        {/* Selected corner indicators */}
        {isSelected && (
          <>
            {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map(pos => (
              <div key={pos} className={`absolute ${pos} w-2 h-2 bg-amber-400 rounded-sm`} />
            ))}
          </>
        )}
      </div>
    </Rnd>
  );
});
FieldOverlay.displayName = 'FieldOverlay';

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
export default function PdfViewer({
  fileUrl,
  fields              = [],
  onFieldsChange,
  currentPage         = 1,
  onPageChange,
  onTotalPagesChange,
  pendingFieldType,
  selectedPartyIndex  = 0,
  parties             = [],
  onFieldPlaced,
  readOnly            = false,
  selectedFieldId,
  onFieldSelect,
  fontFamily          = 'Helvetica',
  fontSize            = 14,
}) {
  const canvasRef      = useRef(null);
  const containerRef   = useRef(null);
  const wrapRef        = useRef(null);
  const renderTaskRef  = useRef(null);
  const pdfDocRef      = useRef(null);
  const canvasSizeRef  = useRef({ width: 0, height: 0 });

  const [canvasSize, setCanvasSize]   = useState({ width: 0, height: 0 });
  const [loading,    setLoading]      = useState(true);
  const [error,      setError]        = useState(null);
  const [totalPages, setTotalPages]   = useState(0);
  const [zoom,       setZoom]         = useState(ZOOM_FIT);
  const [loadKey,    setLoadKey]      = useState(0); // for retry

  const fieldsRef = useRef(fields);
  useEffect(() => { fieldsRef.current = fields; }, [fields]);

  const currentPageFields = useMemo(
    () => fields.filter(f => Number(f.page) === Number(currentPage)),
    [fields, currentPage],
  );

  // ── Load PDF ──────────────────────────────────────────────────
  useEffect(() => {
    if (!fileUrl) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const url = buildProxyUrl(fileUrl);
        const doc = await pdfjsLib.getDocument({
          url, withCredentials: false,
        }).promise;
        if (cancelled) return;
        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        onTotalPagesChange?.(doc.numPages);
      } catch {
        if (!cancelled) setError('Failed to load PDF. Check the file URL or your connection.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [fileUrl, onTotalPagesChange, loadKey]);

  // ── Render page ────────────────────────────────────────────────
  const renderPage = useCallback(async () => {
    const doc       = pdfDocRef.current;
    const canvas    = canvasRef.current;
    const container = wrapRef.current;
    if (!doc || !canvas || !container) return;

    try { renderTaskRef.current?.cancel(); } catch (_) {}

    try {
      const page  = await doc.getPage(currentPage);
      const avail = Math.max(container.clientWidth - 32, 300);
      const base  = page.getViewport({ scale: 1 });
      const fit   = avail / base.width;
      const scale = fit * zoom;
      const vp    = page.getViewport({ scale });
      const dpr   = window.devicePixelRatio || 1;

      canvas.width        = vp.width  * dpr;
      canvas.height       = vp.height * dpr;
      canvas.style.width  = `${vp.width}px`;
      canvas.style.height = `${vp.height}px`;

      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.scale(dpr, dpr);

      const size = { width: vp.width, height: vp.height };
      canvasSizeRef.current = size;
      setCanvasSize(size);

      renderTaskRef.current = page.render({ canvasContext: ctx, viewport: vp });
      await renderTaskRef.current.promise;
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') console.error(err);
    }
  }, [currentPage, zoom]);

  useEffect(() => {
    if (!loading && !error) renderPage();
  }, [loading, error, renderPage]);

  // ResizeObserver (better than window resize)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      if (!loading && !error) renderPage();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, error, renderPage]);

  // ── Keyboard: Delete selected field ───────────────────────────
  useEffect(() => {
    if (readOnly) return;
    const handler = (e) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedFieldId &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        onFieldsChange(fieldsRef.current.filter(f => f.id !== selectedFieldId));
        onFieldSelect?.(null);
      }
      // Escape deselect
      if (e.key === 'Escape') onFieldSelect?.(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [readOnly, selectedFieldId, onFieldsChange, onFieldSelect]);

  // ── Place field on click ───────────────────────────────────────
  const handleCanvasClick = useCallback((e) => {
    if (readOnly || !pendingFieldType || loading) return;
    if (!e.target.classList.contains('pdf-canvas')) return;

    const s    = canvasSizeRef.current;
    if (!s.width) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const meta = FIELD_META[pendingFieldType] || FIELD_META.text;
    const fW   = meta.defaultW;
    const fH   = meta.defaultH;
    const xPct = ((e.clientX - rect.left)  / s.width)  * 100 - fW / 2;
    const yPct = ((e.clientY - rect.top)   / s.height) * 100 - fH / 2;

    const newField = {
      id:          `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type:        pendingFieldType,
      page:        currentPage,
      x:           +Math.max(0, Math.min(100 - fW, xPct)).toFixed(4),
      y:           +Math.max(0, Math.min(100 - fH, yPct)).toFixed(4),
      width:       fW,
      height:      fH,
      partyIndex:  Number(selectedPartyIndex),
      value:       '',
      fontFamily,
      fontSize,
    };

    onFieldsChange([...fieldsRef.current, newField]);
    onFieldSelect?.(newField.id);
    onFieldPlaced?.();
  }, [
    readOnly, pendingFieldType, loading,
    currentPage, selectedPartyIndex,
    fontFamily, fontSize,
    onFieldsChange, onFieldPlaced, onFieldSelect,
  ]);

  const updateField = useCallback((id, patch) => {
    onFieldsChange(fieldsRef.current.map(f =>
      f.id === id ? { ...f, ...patch } : f,
    ));
  }, [onFieldsChange]);

  const removeField = useCallback((id) => {
    onFieldsChange(fieldsRef.current.filter(f => f.id !== id));
    if (selectedFieldId === id) onFieldSelect?.(null);
  }, [onFieldsChange, selectedFieldId, onFieldSelect]);

  // ── Zoom helpers ──────────────────────────────────────────────
  const zoomIdx  = ZOOM_STEPS.indexOf(zoom);
  const canZoomIn  = zoomIdx < ZOOM_STEPS.length - 1;
  const canZoomOut = zoomIdx > 0;

  const zoomIn  = () => { if (canZoomIn)  setZoom(ZOOM_STEPS[zoomIdx + 1]); };
  const zoomOut = () => { if (canZoomOut) setZoom(ZOOM_STEPS[zoomIdx - 1]); };
  const zoomFit = () => setZoom(ZOOM_FIT);

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div
      ref={wrapRef}
      className="flex-1 w-full flex flex-col bg-slate-100 dark:bg-slate-950 min-h-[600px]"
    >

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex-wrap">

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <IconBtn
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </IconBtn>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums min-w-[3ch] text-center">
              {currentPage}
            </span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-400 tabular-nums">
              {totalPages || '—'}
            </span>
          </div>

          <IconBtn
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next page"
          >
            <ChevronRight size={16} />
          </IconBtn>
        </div>

        {/* Center: pending field indicator */}
        {pendingFieldType && !readOnly && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[11px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wide">
              Click PDF to place {pendingFieldType}
            </span>
            <button
              type="button"
              onClick={() => onFieldPlaced?.()}
              className="ml-1 text-sky-400 hover:text-sky-600"
              title="Cancel placement"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <IconBtn onClick={zoomOut} disabled={!canZoomOut} title="Zoom out">
            <ZoomOut size={15} />
          </IconBtn>

          <button
            type="button"
            onClick={zoomFit}
            className="px-2.5 h-8 rounded-lg text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors tabular-nums min-w-[3.5rem]"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <IconBtn onClick={zoomIn} disabled={!canZoomIn} title="Zoom in">
            <ZoomIn size={15} />
          </IconBtn>

          <IconBtn onClick={zoomFit} title="Fit to width">
            <Maximize2 size={14} />
          </IconBtn>
        </div>
      </div>

      {/* ── Canvas area ──────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center"
        onClick={handleCanvasClick}
      >
        {/* Loading skeleton */}
        {loading && (
          <div className="w-full max-w-2xl animate-pulse space-y-4">
            <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl" style={{ height: 800 }}>
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 size={28} className="text-slate-400 animate-spin" />
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Loading PDF…
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="w-full max-w-2xl flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Failed to load PDF</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setLoadKey(k => k + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold transition-colors"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* PDF canvas + fields */}
        {!loading && !error && (
          <div
            className="relative bg-white shadow-2xl shadow-slate-400/20 dark:shadow-slate-900/60 rounded-sm mb-8"
            style={{
              width:  canvasSize.width  || 'auto',
              height: canvasSize.height || 'auto',
            }}
          >
            {/* Crosshair cursor when placing */}
            <canvas
              ref={canvasRef}
              className="pdf-canvas block rounded-sm"
              style={{
                cursor: pendingFieldType && !readOnly ? 'crosshair' : 'default',
                display: 'block',
              }}
            />

            {/* Field overlays */}
            {canvasSize.width > 0 && currentPageFields.map(field => (
              <FieldOverlay
                key={field.id}
                field={field}
                canvasSize={canvasSize}
                canvasSizeRef={canvasSizeRef}
                party={parties[field.partyIndex]}
                isSelected={selectedFieldId === field.id}
                readOnly={readOnly}
                onSelect={onFieldSelect}
                onUpdate={updateField}
                onRemove={removeField}
              />
            ))}

            {/* Field count badge */}
            {currentPageFields.length > 0 && (
              <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-[10px] font-black text-white pointer-events-none">
                {currentPageFields.length} field{currentPageFields.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* Page dots (mini pagination) */}
        {totalPages > 1 && totalPages <= 20 && !loading && (
          <div className="flex items-center gap-1.5 mb-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPageChange?.(i + 1)}
                className={cn(
                  'transition-all duration-150 rounded-full',
                  currentPage === i + 1
                    ? 'w-5 h-2 bg-sky-500'
                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Keyboard hint ─────────────────────────────────────── */}
      {!readOnly && selectedFieldId && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800/40 flex items-center gap-2">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
            Field selected —
          </span>
          <kbd className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded text-[9px] font-mono text-amber-700 dark:text-amber-400">
            Delete
          </kbd>
          <span className="text-[10px] text-amber-600 dark:text-amber-500">to remove</span>
          <span className="mx-1 text-amber-300">·</span>
          <kbd className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded text-[9px] font-mono text-amber-700 dark:text-amber-400">
            Esc
          </kbd>
          <span className="text-[10px] text-amber-600 dark:text-amber-500">to deselect</span>
        </div>
      )}
    </div>
  );
}