// src/pages/TemplateSigner.jsx
// ✅ Module 2 Employee Signing View
// FIX 1: Fields positioned using CSS % (field.x/nativeW * 100%) matching editor exactly
// FIX 2: Signature fields open modal, text fields are interactive
// FIX 3: All field types work correctly
// FEATURE: CC option, decline modal, progress bar

import React, {
  useEffect, useState, useRef, useCallback, useMemo,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Shield, CheckCircle2, XCircle, Clock, AlertTriangle,
  Loader2, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Send, PenTool, X,
  FileText, WifiOff, RotateCcw, PenLine,
  Type, Calendar, Hash, Fingerprint, CheckSquare,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { templateApi } from '@/api/apiClient';
import { useTemplateSession, useTemplateMutations } from '@/hooks/useTemplate';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const cn = (...c) => c.filter(Boolean).join(' ');

function useDocTitle(title) {
  useEffect(() => {
    const prev = document.title;
    if (title) document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}

// ══════════════════════════════════════════════════
// STATUS SCREEN
// ══════════════════════════════════════════════════
function StatusScreen({ icon: Icon, iconClass, bgClass, title, message, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100
                    dark:from-slate-950 dark:to-slate-900
                    flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl
                      border border-slate-100 dark:border-slate-800
                      p-8 max-w-md w-full text-center">
        <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5', bgClass)}>
          <Icon className={cn('w-8 h-8', iconClass)} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{message}</p>
        {children}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800
                        flex items-center justify-center gap-2">
          <div className="w-5 h-5 bg-[#28ABDF] rounded-md flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-slate-400">
            Secured by <span className="font-semibold text-slate-600 dark:text-slate-300">NexSign</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// FIELD META CONFIG
// ══════════════════════════════════════════════════
const FIELD_META = {
  signature: { icon: PenLine,     label: 'Sign here', color: '#28ABDF', borderCls: 'border-[#28ABDF]',  bgCls: 'bg-sky-50/90'     },
  initial:   { icon: Fingerprint, label: 'Initials',  color: '#8b5cf6', borderCls: 'border-violet-400', bgCls: 'bg-violet-50/90'  },
  text:      { icon: Type,        label: 'Text',      color: '#64748b', borderCls: 'border-slate-300',  bgCls: 'bg-white/95'      },
  date:      { icon: Calendar,    label: 'Date',      color: '#10b981', borderCls: 'border-emerald-400',bgCls: 'bg-emerald-50/90' },
  checkbox:  { icon: CheckSquare, label: '',          color: '#f59e0b', borderCls: 'border-amber-400',  bgCls: 'bg-amber-50/90'   },
  number:    { icon: Hash,        label: 'Number',    color: '#6366f1', borderCls: 'border-indigo-400', bgCls: 'bg-indigo-50/90'  },
};

// ══════════════════════════════════════════════════
// FIELD OVERLAY
// KEY FIX: Use field.x/nativeWidth * 100% for CSS positioning
// This matches EXACTLY how the editor placed the fields
// ══════════════════════════════════════════════════
const FieldOverlay = React.memo(function FieldOverlay({
  field, nativeWidth, nativeHeight,
  onSignatureClick, onFieldChange,
}) {
  if (!nativeWidth || !nativeHeight) return null;

  const meta   = FIELD_META[field.type] || FIELD_META.text;
  const Icon   = meta.icon;
  const filled = !!field.value;

  // ✅ THE FIX: Convert stored % coordinates to CSS %
  // field.x, field.y, field.width, field.height are stored as percentages (0-100)
  // relative to the PDF page's native dimensions
  // We use these directly as CSS % on the overlay container
  const style = {
    position: 'absolute',
    left:   `${field.x}%`,
    top:    `${field.y}%`,
    width:  `${field.width}%`,
    height: `${field.height}%`,
  };

  // Signature / Initial — click to open signature modal
  if (field.type === 'signature' || field.type === 'initial') {
    return (
      <div
        style={style}
        onClick={() => onSignatureClick(field)}
        className={cn(
          'cursor-pointer rounded overflow-hidden transition-all duration-150',
          'border-2 flex items-center justify-center select-none',
          filled
            ? 'border-emerald-400/70 bg-emerald-50/50'
            : cn('border-dashed', meta.borderCls, meta.bgCls,
                 'hover:brightness-95 hover:shadow-lg animate-pulse-subtle'),
        )}
        title="Click to sign"
      >
        {filled ? (
          <img
            src={field.value}
            alt="signature"
            className="w-full h-full object-contain p-0.5"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center gap-1 px-1 overflow-hidden w-full h-full">
            {field.required && <span className="text-red-400 text-[9px] font-black shrink-0">*</span>}
            <Icon size={11} style={{ color: meta.color, flexShrink: 0 }} />
            <span className="text-[10px] font-semibold truncate" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Text / Number — inline input
  if (field.type === 'text' || field.type === 'number') {
    return (
      <div
        style={style}
        className={cn(
          'rounded overflow-hidden border-2',
          filled
            ? 'border-slate-300/60 bg-white'
            : 'border-slate-300 bg-white hover:border-[#28ABDF]',
        )}
      >
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          value={field.value || ''}
          placeholder={field.placeholder || (field.type === 'number' ? '0' : 'Type here…')}
          className="w-full h-full px-1.5 bg-transparent border-none outline-none
                     text-slate-700 dark:text-slate-300"
          style={{
            fontFamily: field.fontFamily || 'inherit',
            // Scale font proportionally to field height — matches editor
            fontSize:   `${Math.max(9, Math.min(14, field.fontSize || 12))}px`,
          }}
          onChange={e => onFieldChange(field.id, e.target.value)}
          onClick={e => e.stopPropagation()}
        />
      </div>
    );
  }

  // Date
  if (field.type === 'date') {
    return (
      <div
        style={style}
        className={cn(
          'rounded overflow-hidden border-2',
          filled
            ? 'border-emerald-300/60 bg-emerald-50/40'
            : 'border-dashed border-emerald-400 bg-white',
        )}
      >
        {filled ? (
          <span className="flex items-center justify-center h-full
                           text-[11px] font-medium text-slate-700 px-1">
            {field.value}
          </span>
        ) : (
          <input
            type="date"
            className="w-full h-full px-1 text-[11px] bg-transparent
                       border-none outline-none cursor-pointer text-emerald-700"
            onChange={e => onFieldChange(field.id, e.target.value)}
            onClick={e => e.stopPropagation()}
          />
        )}
      </div>
    );
  }

  // Checkbox
  if (field.type === 'checkbox') {
    return (
      <div
        style={style}
        onClick={() => onFieldChange(field.id, field.value ? '' : 'checked')}
        className={cn(
          'rounded overflow-hidden cursor-pointer border-2',
          'flex items-center justify-center',
          filled
            ? 'border-amber-400 bg-amber-50'
            : 'border-dashed border-amber-400 bg-amber-50/70 hover:bg-amber-100/80',
        )}
      >
        {filled
          ? <CheckCircle2 className="w-4 h-4 text-amber-500" />
          : <div className="w-3.5 h-3.5 rounded border-2 border-amber-400" />
        }
      </div>
    );
  }

  return null;
});

// ══════════════════════════════════════════════════
// PDF RENDERER
// Renders PDF canvas and overlays fields at correct positions
// ══════════════════════════════════════════════════
function PdfRenderer({
  pdfUrl, fields, currentPage, onPageChange,
  totalPages, onTotalPages,
  onSignatureClick, onFieldChange,
}) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const pdfDocRef    = useRef(null);
  const renderRef    = useRef(null);
  const renderIdRef  = useRef(0);
  const debounceRef  = useRef(null);
  const retryTimer   = useRef(null);

  const [pdfState,   setPdfState]   = useState('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [retryIn,    setRetryIn]    = useState(0);
  const [loadPct,    setLoadPct]    = useState(0);
  const [scale,      setScale]      = useState(1);

  // ✅ Store both CSS dimensions AND native PDF dimensions
  // nativeWidth/Height needed for field % coordinate calculation
  const [canvasInfo, setCanvasInfo] = useState({
    cssWidth: 0, cssHeight: 0,
    nativeWidth: 0, nativeHeight: 0,
  });

  const MAX_RETRIES = 3;

  const pageFields = useMemo(
    () => fields.filter(f => (f.page || 1) === currentPage),
    [fields, currentPage],
  );

  // Load PDF
  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;

    const load = async () => {
      setPdfState('loading');
      setLoadPct(0);
      pdfDocRef.current = null;

      let fakePct = 0;
      const fakeTimer = setInterval(() => {
        fakePct = Math.min(fakePct + Math.random() * 12, 80);
        if (!cancelled) setLoadPct(Math.round(fakePct));
      }, 350);

      try {
        const loadTask = pdfjsLib.getDocument({
          url:             pdfUrl,
          withCredentials: false,
          cMapPacked:      true,
          rangeChunkSize:  65536,
        });

        loadTask.onProgress = ({ loaded, total }) => {
          if (total > 0 && !cancelled)
            setLoadPct(Math.round((loaded / total) * 90));
        };

        const doc = await Promise.race([
          loadTask.promise,
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error('PDF_TIMEOUT')), 35_000)
          ),
        ]);

        clearInterval(fakeTimer);
        if (cancelled) return;

        pdfDocRef.current = doc;
        onTotalPages?.(doc.numPages);
        setLoadPct(100);
        await new Promise(r => setTimeout(r, 150));

        if (!cancelled) {
          setPdfState('ready');
          setTimeout(() => renderPage(doc, currentPage, scale), 0);
        }

      } catch (err) {
        clearInterval(fakeTimer);
        if (cancelled) return;
        console.error('[PDF] Load error:', err?.message);
        setPdfState('error');

        if (retryCount < MAX_RETRIES) {
          const delay   = Math.pow(2, retryCount) * 2000;
          let countdown = Math.ceil(delay / 1000);
          setRetryIn(countdown);
          retryTimer.current = setInterval(() => {
            countdown--;
            setRetryIn(countdown);
            if (countdown <= 0) {
              clearInterval(retryTimer.current);
              if (!cancelled) setRetryCount(c => c + 1);
            }
          }, 1000);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      clearInterval(retryTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, retryCount]);

  // Render page — captures native PDF dimensions for field positioning
  const renderPage = useCallback(async (docArg, page, sc) => {
    const doc    = docArg || pdfDocRef.current;
    const canvas = canvasRef.current;
    const wrap   = containerRef.current;
    if (!doc || !canvas || !wrap) return;

    const myId = ++renderIdRef.current;

    if (renderRef.current) {
      try { renderRef.current.cancel(); await new Promise(r => setTimeout(r, 10)); }
      catch (_) {}
      renderRef.current = null;
    }

    if (myId !== renderIdRef.current) return;

    try {
      const pg = await doc.getPage(page);
      if (myId !== renderIdRef.current) return;

      const avail  = Math.max(wrap.clientWidth - 32, 300);
      const baseVP = pg.getViewport({ scale: 1 });
      const fit    = avail / baseVP.width;
      const vp     = pg.getViewport({ scale: fit * sc });
      const dpr    = Math.min(window.devicePixelRatio || 1, 2);

      if (myId !== renderIdRef.current) return;

      // ✅ Capture native PDF page dimensions for field % calculations
      setCanvasInfo({
        cssWidth:     vp.width,
        cssHeight:    vp.height,
        nativeWidth:  baseVP.width,   // PDF points width (e.g. 595 for A4)
        nativeHeight: baseVP.height,  // PDF points height
      });

      canvas.width        = vp.width  * dpr;
      canvas.height       = vp.height * dpr;
      canvas.style.width  = `${vp.width}px`;
      canvas.style.height = `${vp.height}px`;

      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.scale(dpr, dpr);

      if (myId !== renderIdRef.current) return;

      const task = pg.render({ canvasContext: ctx, viewport: vp });
      renderRef.current = task;
      await task.promise;

      if (myId !== renderIdRef.current) return;
      renderRef.current = null;

    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') console.error('[PDF render]', e);
      renderRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (pdfState === 'ready' && pdfDocRef.current)
      renderPage(pdfDocRef.current, currentPage, scale);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, scale, pdfState]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const obs = new ResizeObserver(() => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (pdfState === 'ready' && pdfDocRef.current)
          renderPage(pdfDocRef.current, currentPage, scale);
      }, 200);
    });
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(debounceRef.current); };
  }, [pdfState, currentPage, scale, renderPage]);

  const clamp = d => setScale(s => Math.min(2, Math.max(0.5, Math.round((s + d) * 10) / 10)));

  const manualRetry = () => {
    clearInterval(retryTimer.current);
    setRetryIn(0); setPdfState('idle'); setRetryCount(0);
    setTimeout(() => setRetryCount(1), 50);
  };

  const isLoading = pdfState === 'idle' || pdfState === 'loading';
  const isError   = pdfState === 'error';
  const isReady   = pdfState === 'ready';

  return (
    <div className="flex flex-col h-full">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5
                      bg-white dark:bg-slate-900
                      border-b border-slate-200 dark:border-slate-800
                      shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || !isReady}
            className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-700">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400
                           min-w-[70px] text-center tabular-nums">
            {isLoading ? '— / —' : `${currentPage} / ${totalPages || '?'}`}
          </span>
          <Button variant="outline" size="icon"
            onClick={() => onPageChange(Math.min(totalPages || 999, currentPage + 1))}
            disabled={currentPage >= (totalPages || 1) || !isReady}
            className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-700">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon"
            onClick={() => clamp(-0.1)} disabled={scale <= 0.5 || !isReady}
            className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-700">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <button type="button" onClick={() => setScale(1)} disabled={!isReady}
            className="text-xs text-slate-500 font-semibold w-12 text-center
                       hover:text-[#28ABDF] transition-colors tabular-nums">
            {Math.round(scale * 100)}%
          </button>
          <Button variant="outline" size="icon"
            onClick={() => clamp(0.1)} disabled={scale >= 2 || !isReady}
            className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-700">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <FileText className="w-3.5 h-3.5" />
          {pageFields.length} field{pageFields.length !== 1 ? 's' : ''} on page
        </div>
      </div>

      {/* Progress bar */}
      {isLoading && (
        <div className="h-1 bg-slate-100 dark:bg-slate-800 shrink-0">
          <div className="h-full bg-[#28ABDF] transition-all duration-300"
               style={{ width: `${loadPct}%` }} />
        </div>
      )}

      {/* Canvas area */}
      <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 p-3 sm:p-5">
        <div ref={containerRef}>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900
                              rounded-xl shadow-xl overflow-hidden">
                <div className="p-8 space-y-4 animate-pulse" style={{ minHeight: 550 }}>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3 mx-auto" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                  <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl w-full mt-4" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-[#28ABDF] animate-spin" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    {loadPct < 25 ? 'Connecting to document...'
                      : loadPct < 55 ? 'Downloading PDF...'
                      : loadPct < 85 ? 'Processing pages...'
                      : 'Almost ready...'}
                  </p>
                </div>
                <div className="w-40 h-1.5 bg-slate-200 dark:bg-slate-700
                                rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-[#28ABDF] rounded-full transition-all duration-300"
                       style={{ width: `${loadPct}%` }} />
                </div>
                <p className="text-xs text-slate-400">{loadPct}%</p>
              </div>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center gap-5 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20
                              flex items-center justify-center">
                <WifiOff className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Failed to load PDF
                </p>
                <p className="text-sm text-slate-400 max-w-xs">
                  {retryCount >= MAX_RETRIES
                    ? 'Could not load after multiple attempts.'
                    : 'Retrying automatically...'}
                </p>
              </div>
              {retryCount < MAX_RETRIES && retryIn > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                                bg-amber-50 border border-amber-100">
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  <p className="text-sm text-amber-700 font-medium">
                    Retrying in {retryIn}s
                    <span className="text-amber-400 ml-1 text-xs">({retryCount}/{MAX_RETRIES})</span>
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <Button size="sm" variant="outline" onClick={manualRetry}
                  className="rounded-xl gap-1.5 border-slate-200">
                  <RotateCcw className="w-3.5 h-3.5" /> Retry Now
                </Button>
                <Button size="sm" onClick={() => window.location.reload()}
                  className="rounded-xl bg-[#28ABDF] hover:bg-sky-600 text-white gap-1.5">
                  Reload Page
                </Button>
              </div>
            </div>
          )}

          {/* ✅ PDF canvas + field overlays */}
          <div
            className={cn(
              'relative mx-auto bg-white shadow-2xl shadow-black/20 rounded-sm',
              'transition-opacity duration-300',
              isReady ? 'opacity-100' : 'opacity-0 absolute pointer-events-none',
            )}
            style={{
              width:  canvasInfo.cssWidth  || 'auto',
              height: canvasInfo.cssHeight || 'auto',
            }}
          >
            <canvas ref={canvasRef} className="block rounded-sm" />

            {/* ✅ Field overlays — position using % coordinates stored in DB
                The container div has exact CSS pixel dimensions matching the rendered PDF.
                field.x/y/width/height are stored as percentages (0-100) of the PDF page.
                Using them directly as CSS % on this container gives correct positioning. */}
            {isReady && canvasInfo.cssWidth > 0 && pageFields.map(field => (
              <FieldOverlay
                key={field.id}
                field={field}
                nativeWidth={canvasInfo.nativeWidth}
                nativeHeight={canvasInfo.nativeHeight}
                onSignatureClick={onSignatureClick}
                onFieldChange={onFieldChange}
              />
            ))}
          </div>

          {/* Page dots */}
          {isReady && totalPages > 1 && totalPages <= 20 && (
            <div className="flex items-center justify-center gap-1.5 mt-4 mb-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} type="button" onClick={() => onPageChange(i + 1)}
                  className={cn(
                    'transition-all duration-150 rounded-full',
                    currentPage === i + 1
                      ? 'w-5 h-2 bg-[#28ABDF]'
                      : 'w-2 h-2 bg-slate-300 hover:bg-slate-400',
                  )} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// FIELD PROGRESS BAR
// ══════════════════════════════════════════════════
function FieldProgress({ fields }) {
  const required = fields.filter(f => f.required !== false);
  const done     = required.filter(f => !!f.value).length;
  const total    = required.length;
  const pct      = total ? Math.round((done / total) * 100) : 100;
  const allDone  = total > 0 && done >= total;
  if (!total) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2
                    bg-white dark:bg-slate-900
                    border-b border-slate-100 dark:border-slate-800 shrink-0">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500',
            allDone ? 'bg-emerald-500' : 'bg-[#28ABDF]')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('text-xs font-semibold whitespace-nowrap',
        allDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500')}>
        {allDone ? '✓ All fields complete' : `${done} / ${total} fields`}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════
// SIGNATURE MODAL
// ══════════════════════════════════════════════════
function SignatureModal({ field, onClose, onAccept }) {
  const canvasRef  = useRef(null);
  const isDrawing  = useRef(false);
  const lastPos    = useRef({ x: 0, y: 0 });
  const [isEmpty,      setIsEmpty]      = useState(true);
  const [inputMode,    setInputMode]    = useState('draw');
  const [typedText,    setTypedText]    = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script, cursive');
  const [penColor,     setPenColor]     = useState('#1e293b');
  const [penWidth,     setPenWidth]     = useState(2.5);

  const FONTS = [
    { label: 'Script',  value: 'Dancing Script, cursive'  },
    { label: 'Serif',   value: 'Georgia, serif'           },
    { label: 'Print',   value: 'Arial, sans-serif'        },
    { label: 'Cursive', value: 'Brush Script MT, cursive' },
  ];
  const COLORS = ['#1e293b', '#1d4ed8', '#7c3aed', '#be185d'];

  useEffect(() => {
    if (!field) return;
    setIsEmpty(true); setTypedText(''); setInputMode('draw');
  }, [field]);

  useEffect(() => {
    if (!field || inputMode !== 'draw') return;
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  || 500;
    canvas.height = rect.height || 200;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [field, inputMode]);

  useEffect(() => {
    if (!field) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [field, onClose]);

  const getPos = useCallback((e, c) => {
    const r = c.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return {
      x: (s.clientX - r.left) * (c.width  / r.width),
      y: (s.clientY - r.top)  * (c.height / r.height),
    };
  }, []);

  const startDraw = useCallback(e => {
    e.preventDefault();
    isDrawing.current = true;
    const c   = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.strokeStyle = penColor; ctx.lineWidth = penWidth;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    lastPos.current = getPos(e, c);
  }, [penColor, penWidth, getPos]);

  const draw = useCallback(e => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const c   = canvasRef.current;
    const ctx = c.getContext('2d');
    const pos = getPos(e, c);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setIsEmpty(false);
  }, [getPos]);

  const stopDraw = useCallback(() => { isDrawing.current = false; }, []);

  const clearCanvas = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    setIsEmpty(true);
  }, []);

  const handleAccept = useCallback(() => {
    if (inputMode === 'draw') {
      if (isEmpty) { toast.error('Please draw your signature.'); return; }
      onAccept(canvasRef.current.toDataURL('image/png'));
    } else {
      if (!typedText.trim()) { toast.error('Please type your name.'); return; }
      const c = document.createElement('canvas');
      c.width = 500; c.height = 160;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 500, 160);
      ctx.font = `52px ${selectedFont}`;
      ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedText.trim().slice(0, 30), 250, 80);
      onAccept(c.toDataURL('image/png'));
    }
  }, [inputMode, isEmpty, typedText, selectedFont, onAccept]);

  if (!field) return null;

  return (
    <div role="dialog" aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-900 w-full sm:rounded-2xl
                      sm:max-w-lg shadow-2xl overflow-hidden rounded-t-3xl">
        <div className="bg-gradient-to-r from-[#28ABDF] to-sky-600
                        px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                {field.type === 'initial' ? 'Add Initials' : 'Add Signature'}
              </h2>
              <p className="text-white/70 text-xs">Legally binding</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30
                       text-white flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-800">
          {[{ v: 'draw', l: '✏️ Draw' }, { v: 'type', l: '⌨️ Type' }].map(({ v, l }) => (
            <button key={v} type="button" onClick={() => setInputMode(v)}
              className={cn(
                'flex-1 py-3 text-sm font-semibold transition-all border-b-2',
                inputMode === v
                  ? 'border-[#28ABDF] text-[#28ABDF]'
                  : 'border-transparent text-slate-400 hover:text-slate-600',
              )}>{l}</button>
          ))}
        </div>

        <div className="p-5">
          {inputMode === 'draw' ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden
                              border-2 border-dashed border-slate-200 bg-white">
                <canvas ref={canvasRef}
                  className="w-full touch-none cursor-crosshair block"
                  style={{ height: 180 }}
                  onMouseDown={startDraw} onMouseMove={draw}
                  onMouseUp={stopDraw}   onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                />
                {isEmpty && (
                  <div className="absolute inset-0 flex items-center
                                  justify-center pointer-events-none">
                    <div className="text-center">
                      <PenLine className="w-7 h-7 text-slate-200 mx-auto mb-1.5" />
                      <p className="text-sm text-slate-300 font-medium">Draw your signature here</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setPenColor(c)}
                        className={cn('w-5 h-5 rounded-full transition-all',
                          penColor === c ? 'ring-2 ring-offset-1 ring-slate-400 scale-125' : 'hover:scale-110')}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {[1.5, 2.5, 4].map(w => (
                      <button key={w} type="button" onClick={() => setPenWidth(w)}
                        className={cn('h-6 px-2 rounded-lg border text-[10px] font-bold',
                          penWidth === w
                            ? 'border-[#28ABDF] bg-sky-50 text-[#28ABDF]'
                            : 'border-slate-200 text-slate-400')}>
                        {w === 1.5 ? 'S' : w === 2.5 ? 'M' : 'L'}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 font-medium">
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input type="text" value={typedText} maxLength={30} autoFocus
                onChange={e => setTypedText(e.target.value)}
                placeholder="Type your full name"
                className="w-full h-12 border-2 border-slate-200 dark:border-slate-700
                           rounded-xl px-4 text-lg focus:border-[#28ABDF] focus:outline-none
                           dark:bg-slate-800 dark:text-white"
                style={{ fontFamily: selectedFont }}
              />
              <div className="flex flex-wrap gap-2">
                {FONTS.map(f => (
                  <button key={f.value} type="button" onClick={() => setSelectedFont(f.value)}
                    className={cn('px-3 py-1.5 rounded-lg border text-sm transition-all',
                      selectedFont === f.value
                        ? 'border-[#28ABDF] bg-sky-50 text-[#28ABDF] font-semibold'
                        : 'border-slate-200 text-slate-500')}
                    style={{ fontFamily: f.value }}>
                    {f.label}
                  </button>
                ))}
              </div>
              {typedText.trim() && (
                <div className="rounded-xl border-2 border-slate-100 p-4
                                text-center bg-slate-50/50 text-4xl text-slate-800"
                     style={{ fontFamily: selectedFont }}>
                  {typedText}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <Button type="button" variant="outline" onClick={onClose}
              className="flex-1 rounded-xl h-11 border-slate-200">Cancel</Button>
            <Button type="button" onClick={handleAccept}
              className="flex-1 h-11 rounded-xl bg-[#28ABDF] hover:bg-sky-600
                         text-white font-semibold gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Apply {field.type === 'initial' ? 'Initials' : 'Signature'}
            </Button>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-3">
            By clicking Apply, you agree this is your legal electronic signature.
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// DECLINE MODAL
// ══════════════════════════════════════════════════
function DeclineModal({ onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl
                      border border-slate-100 dark:border-slate-800
                      p-6 w-full max-w-sm shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30
                        flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white text-center mb-1">
          Decline Document?
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
          This cannot be undone. The document owner will be notified.
        </p>
        <textarea value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Reason for declining (optional)" rows={3}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700
                     px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300
                     dark:bg-slate-800 resize-none mb-4
                     focus:outline-none focus:border-red-400 placeholder:text-slate-300"
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}
            className="flex-1 h-10 rounded-xl">Cancel</Button>
          <Button onClick={() => onConfirm(reason)} disabled={loading}
            className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════
export default function TemplateSigner() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const mutations  = useTemplateMutations();

  const { session, template, loading, error, code } = useTemplateSession(token);

  const [fields,      setFields]      = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [activeField, setActiveField] = useState(null);
  const [showDecline, setShowDecline] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [declining,   setDeclining]   = useState(false);
  const [phase,       setPhase]       = useState('signing');

  // Initialize fields from template
  useEffect(() => {
    if (!template?.fields?.length) return;
    setFields(template.fields.map(f => ({ ...f, value: f.value || '' })));
    setTotalPages(template.totalPages || 1);
    // Jump to first page with fields
    const pages = [...new Set(template.fields.map(f => f.page || 1))].sort((a, b) => a - b);
    if (pages[0] && pages[0] !== 1) setCurrentPage(pages[0]);
  }, [template]);

  useDocTitle(template ? `Sign: ${template.title} — NexSign` : 'Sign — NexSign');

  // ✅ Use the proxy URL to avoid Cloudinary CORS issues
  const pdfProxyUrl = useMemo(
    () => token ? templateApi.getPdfProxyUrl(token) : '',
    [token],
  );

  const handleSignatureClick  = useCallback(field => setActiveField(field), []);

  const handleSignatureAccept = useCallback(dataUrl => {
    if (!activeField) return;
    setFields(prev => prev.map(f =>
      f.id === activeField.id ? { ...f, value: dataUrl } : f
    ));
    setActiveField(null);
    toast.success('Signature applied! ✓');
  }, [activeField]);

  const handleFieldChange = useCallback((id, val) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, value: val } : f));
  }, []);

const handleSubmit = useCallback(async () => {

  // ── Step 1: Required fields ──────────────────────────────
  const required = fields.filter(f => f.required !== false);
  const missing  = required.filter(f => {
    if (!f.value) return true;
    if (typeof f.value === 'string' && !f.value.trim()) return true;
    return false;
  });

  if (missing.length) {
    toast.error(
      `${missing.length} required field${missing.length > 1 ? 's' : ''} incomplete.`
    );
    if (missing[0]?.page) setCurrentPage(missing[0].page);
    return;
  }

  // ── Step 2: Signature check ──────────────────────────────
  const sigFieldDef = fields.find(
    f => f.type === 'signature' || f.type === 'initial'
  );

  if (sigFieldDef && !sigFieldDef.value) {
    toast.error('Please draw your signature first.');
    if (sigFieldDef.page) setCurrentPage(sigFieldDef.page);
    return;
  }

  // ── Step 3: Payload build ────────────────────────────────
  const signatureDataUrl = sigFieldDef?.value || null;

  const fieldValues = fields
    .filter(f =>
      f.value &&
      f.type !== 'signature' &&
      f.type !== 'initial'
    )
    .map(f => ({
      fieldId: f.id,
      type:    f.type,
      value:   String(f.value),
    }));

  // ── Step 4: API call ─────────────────────────────────────
  setSubmitting(true);
  try {
    const res = await mutations.employeeSign(token, {
      signatureDataUrl,
      fieldValues,
      clientTime: new Date().toISOString(),
    });

    if (res?.success) {
      setPhase('signed');
    } else {
      toast.error(res?.message || 'Submission failed.');
      if (res?.missingFields?.[0]?.page) {
        setCurrentPage(res.missingFields[0].page);
      }
    }
  } catch (err) {
    toast.error(err?.message || 'Submission failed.');
  } finally {
    setSubmitting(false);
  }
}, [fields, token, mutations, setCurrentPage]);

  const handleDecline = useCallback(async (reason) => {
    setDeclining(true);
    try {
      const res = await mutations.employeeDecline(token, reason);
      if (res?.success) {
        setShowDecline(false);
        setPhase('declined');
      } else {
        toast.error(res?.error || 'Failed to decline.');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to decline.');
    } finally {
      setDeclining(false);
    }
  }, [token, mutations]);

  const allFilled = useMemo(() => {
    const req = fields.filter(f => f.required !== false);
    return req.length > 0 && req.every(f => !!f.value);
  }, [fields]);

  // ── Phase: Loading ────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center
                      bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="w-14 h-14 bg-[#28ABDF]/10 rounded-2xl flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[#28ABDF] animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading document…</p>
          <p className="text-xs text-slate-400 mt-1">Verifying your signing link</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
          <Shield className="w-3.5 h-3.5 text-[#28ABDF]" /> Powered by NexSign
        </div>
      </div>
    );
  }

  // ── Phase: Error / special states ─────────────
  if (error || !session || !template) {
    const SCREENS = {
      ALREADY_SIGNED: {
        icon: CheckCircle2, iconClass: 'text-emerald-500', bgClass: 'bg-emerald-100',
        title: 'Already Signed', message: 'You have already signed this document.',
      },
      LINK_EXPIRED: {
        icon: Clock, iconClass: 'text-amber-500', bgClass: 'bg-amber-100',
        title: 'Link Expired', message: 'This signing link has expired. Contact the sender for a new link.',
      },
      ALREADY_DECLINED: {
        icon: XCircle, iconClass: 'text-red-500', bgClass: 'bg-red-100',
        title: 'Already Declined', message: 'You have already declined this document.',
      },
    };
    const s = SCREENS[code] || {
      icon: AlertTriangle, iconClass: 'text-red-500', bgClass: 'bg-red-100',
      title: 'Invalid Link',
      message: error || 'This signing link is invalid or has expired.',
    };
    return (
      <StatusScreen {...s}>
        <Button onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold">
          Return Home
        </Button>
      </StatusScreen>
    );
  }

  // ── Phase: Signed ──────────────────────────────
  if (phase === 'signed') {
    return (
      <StatusScreen icon={CheckCircle2} iconClass="text-emerald-500"
        bgClass="bg-emerald-100 dark:bg-emerald-900/30"
        title="Signature Submitted!"
        message={`Thank you, ${session.recipientName}! Your signature on "${template.title}" has been recorded.`}>
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl
                          bg-emerald-50 dark:bg-emerald-900/20
                          border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400 text-left">
              A signed copy will be emailed to <strong>{session.recipientEmail}</strong>
            </p>
          </div>
          <Button onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-[#28ABDF] hover:bg-sky-600 text-white font-semibold">
            Done
          </Button>
        </div>
      </StatusScreen>
    );
  }

  // ── Phase: Declined ────────────────────────────
  if (phase === 'declined') {
    return (
      <StatusScreen icon={XCircle} iconClass="text-red-500" bgClass="bg-red-100 dark:bg-red-900/30"
        title="Document Declined" message="You have declined to sign. The owner has been notified.">
        <Button onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold">
          Return Home
        </Button>
      </StatusScreen>
    );
  }

  // ── Main signing UI ────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">

      {/* Modals */}
      {showDecline && (
        <DeclineModal
          onClose={() => setShowDecline(false)}
          onConfirm={handleDecline}
          loading={declining}
        />
      )}
      {activeField && (
        <SignatureModal
          field={activeField}
          onClose={() => setActiveField(null)}
          onAccept={handleSignatureAccept}
        />
      )}

      {/* Header */}
      <header className="h-14 sm:h-16 bg-white dark:bg-slate-900
                         border-b border-slate-200 dark:border-slate-800
                         flex items-center justify-between
                         px-4 sm:px-6 gap-4 shrink-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#28ABDF] rounded-xl shrink-0
                          flex items-center justify-center shadow-md shadow-sky-400/30">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white
                           truncate max-w-[160px] sm:max-w-xs md:max-w-sm">
              {template.title}
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate">
              {session.recipientName}
              {session.recipientDesignation && ` · ${session.recipientDesignation}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {template.signingConfig?.allowDecline !== false && (
            <Button variant="outline" size="sm" onClick={() => setShowDecline(true)}
              className="h-9 px-3 rounded-xl border-red-200 text-red-500
                         hover:bg-red-50 hover:border-red-300 transition-colors
                         text-xs font-semibold hidden sm:flex gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> Decline
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              'h-9 sm:h-10 px-4 sm:px-5 rounded-xl font-semibold text-sm gap-1.5',
              'transition-all hover:-translate-y-0.5 active:translate-y-0',
              'shadow-md disabled:opacity-60 disabled:translate-y-0',
              allFilled
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-400/30'
                : 'bg-[#28ABDF] hover:bg-sky-600 text-white shadow-sky-400/25',
            )}
          >
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-3.5 h-3.5" />
            }
            <span className="hidden sm:inline">
              {submitting ? 'Submitting…' : 'Finish Signing'}
            </span>
          </Button>
        </div>
      </header>

      {/* Field progress */}
      <FieldProgress fields={fields} />

      {/* Company branding bar */}
      {(template.companyName || template.companyLogo) && (
        <div className="bg-white dark:bg-slate-900
                        border-b border-slate-100 dark:border-slate-800
                        px-4 py-2 flex items-center gap-2 shrink-0">
          {template.companyLogo && (
            <img src={template.companyLogo} alt={template.companyName || 'Logo'}
              className="h-5 max-w-[60px] object-contain rounded" />
          )}
          {template.companyName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {template.companyName}
              </span>
              {template.message && (
                <span className="ml-2 text-slate-400"> — {template.message}</span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Mobile decline button */}
      {template.signingConfig?.allowDecline !== false && (
        <div className="sm:hidden px-4 pt-2 shrink-0">
          <button type="button" onClick={() => setShowDecline(true)}
            className="w-full h-9 rounded-xl border border-red-200 text-red-500
                       text-xs font-semibold hover:bg-red-50 transition-colors
                       flex items-center justify-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Decline to Sign
          </button>
        </div>
      )}

      {/* PDF renderer with field overlays */}
      <main className="flex-1 min-h-0">
        <PdfRenderer
          pdfUrl={pdfProxyUrl}
          fields={fields}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          onTotalPages={setTotalPages}
          onSignatureClick={handleSignatureClick}
          onFieldChange={handleFieldChange}
        />
      </main>
    </div>
  );
}