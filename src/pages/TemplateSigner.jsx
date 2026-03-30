// src/pages/TemplateSigner.jsx
import React, {
  useEffect, useState, useRef, useCallback, useMemo,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Shield, CheckCircle2, XCircle, Clock, AlertTriangle,
  Loader2, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Send, PenTool, X, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { templateApi } from '@/api/apiClient';
import {
  useTemplateSession,
  useTemplateMutations,
} from '@/hooks/useTemplate';
import SignaturePad from '@/components/signing/SignaturePad';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function useDocTitle(title) {
  useEffect(() => {
    const prev = document.title;
    if (title) document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}

// ═══════════════════════════════════════════════════════════════
// STATUS SCREEN
// ═══════════════════════════════════════════════════════════════
function StatusScreen({ icon: Icon, iconClass, bgClass, title, message, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100
                    dark:from-slate-950 dark:to-slate-900
                    flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl
                      border border-slate-100 dark:border-slate-800
                      p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 ${bgClass} rounded-2xl flex items-center
                         justify-center mx-auto mb-5`}>
          <Icon className={`w-8 h-8 ${iconClass}`} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400
                      leading-relaxed mb-6">
          {message}
        </p>
        {children}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800
                        flex items-center justify-center gap-2">
          <div className="w-5 h-5 bg-[#28ABDF] rounded-md
                          flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-slate-400">
            Secured by{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              NexSign
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FIELD OVERLAY
// ✅ FIXED: pdfWidth/pdfHeight দিয়ে positioning
// আগে containerSize সবসময় {0,0} ছিল
// ═══════════════════════════════════════════════════════════════
function FieldOverlay({
  field, pdfWidth, pdfHeight,
  onSignatureClick, onTextChange,
  onDateChange, onCheckboxChange,
}) {
  if (!pdfWidth || !pdfHeight) return null;

  const left   = (field.x      / pdfWidth)  * 100;
  const top    = (field.y      / pdfHeight) * 100;
  const width  = (field.width  / pdfWidth)  * 100;
  const height = (field.height / pdfHeight) * 100;
  const filled = !!field.value;
  const base   = `absolute rounded overflow-hidden transition-all duration-150`;

  // Signature / Initial
  if (field.type === 'signature' || field.type === 'initial') {
    return (
      <div
        className={`${base} cursor-pointer ${
          filled
            ? 'border-2 border-emerald-400/60 bg-emerald-50/40'
            : 'border-2 border-dashed border-[#28ABDF] bg-sky-50/70 hover:bg-sky-100/80'
        }`}
        style={{
          left: `${left}%`, top: `${top}%`,
          width: `${width}%`, height: `${height}%`,
        }}
        onClick={() => onSignatureClick(field)}
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
          <div className="flex items-center justify-center h-full gap-1">
            {field.required && (
              <span className="text-red-400 text-[9px] font-bold">*</span>
            )}
            <PenTool className="w-3 h-3 text-sky-400" />
            <span className="text-[10px] font-semibold text-sky-500">
              {field.type === 'initial' ? 'Initials' : 'Sign here'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Date
  if (field.type === 'date') {
    return (
      <div
        className={`${base} ${
          filled
            ? 'border border-emerald-300/60 bg-emerald-50/40'
            : 'border-2 border-dashed border-emerald-400 bg-white/90'
        }`}
        style={{
          left: `${left}%`, top: `${top}%`,
          width: `${width}%`, height: `${height}%`,
        }}
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
            onChange={e => onDateChange(field.id, e.target.value)}
          />
        )}
      </div>
    );
  }

  // Text / Number
  if (field.type === 'text' || field.type === 'number') {
    return (
      <div
        className={`${base} ${
          filled
            ? 'border border-slate-300/60 bg-white'
            : 'border-2 border-slate-300 bg-white hover:border-[#28ABDF]'
        }`}
        style={{
          left: `${left}%`, top: `${top}%`,
          width: `${width}%`, height: `${height}%`,
        }}
      >
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          value={field.value || ''}
          placeholder={field.placeholder || (field.type === 'number' ? '0' : 'Type here…')}
          className="w-full h-full px-2 text-[11px] bg-transparent
                     border-none outline-none text-slate-700"
          style={{
            fontFamily: field.fontFamily || 'inherit',
            fontSize:   `${Math.max(9, (field.fontSize || 12) * 0.7)}px`,
          }}
          onChange={e => onTextChange(field.id, e.target.value)}
        />
      </div>
    );
  }

  // Checkbox
  if (field.type === 'checkbox') {
    return (
      <div
        className={`${base} cursor-pointer flex items-center justify-center ${
          filled
            ? 'border-2 border-amber-400 bg-amber-50'
            : 'border-2 border-dashed border-amber-400 bg-amber-50/70'
        }`}
        style={{
          left: `${left}%`, top: `${top}%`,
          width: `${width}%`, height: `${height}%`,
        }}
        onClick={() => onCheckboxChange(field.id, field.value ? '' : 'checked')}
      >
        {filled
          ? <CheckCircle2 className="w-4 h-4 text-amber-500" />
          : <div className="w-3.5 h-3.5 rounded border-2 border-amber-400" />
        }
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// PDF + FIELDS
// ✅ FIXED: wrapperRef এখন PDF এর actual div এ
// ✅ FIXED: iframe proxy URL ব্যবহার করছে
// ✅ FIXED: object fallback যোগ করা হয়েছে
// ═══════════════════════════════════════════════════════════════
function PdfWithFields({
  proxyUrl, fields, currentPage, totalPages,
  onPageChange, onSignatureClick,
  onTextChange, onDateChange, onCheckboxChange,
}) {
  const pdfDivRef                         = useRef(null);
  const retryRef                          = useRef(0);
  const [pdfSize,    setPdfSize]          = useState({ w: 800, h: 1100 });
  const [pdfLoaded,  setPdfLoaded]        = useState(false);
  const [pdfErrored, setPdfErrored]       = useState(false);
  const [useObject,  setUseObject]        = useState(false);
  const [scale,      setScale]            = useState(1);

  // ✅ Track PDF div size for field positioning
  useEffect(() => {
    const el = pdfDivRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setPdfSize({ w: width, h: height });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [pdfLoaded]);

  // Reset on URL change
  useEffect(() => {
    setPdfLoaded(false);
    setPdfErrored(false);
    setUseObject(false);
    retryRef.current = 0;
  }, [proxyUrl]);

  const finalUrl = useMemo(() => {
    if (!proxyUrl) return '';
    const bust = retryRef.current > 0 ? `?t=${Date.now()}` : '';
    return `${proxyUrl}${bust}#toolbar=0&navpanes=0&page=${currentPage}`;
  }, [proxyUrl, currentPage]);

  const pageFields = useMemo(
    () => fields.filter(f => (f.page || 1) === currentPage),
    [fields, currentPage],
  );

  const clampZoom = delta =>
    setScale(s => Math.round(Math.min(2, Math.max(0.5, s + delta)) * 10) / 10);

  const handleLoad = useCallback(() => {
    setPdfLoaded(true);
    // Measure after load
    const el = pdfDivRef.current;
    if (el) setPdfSize({ w: el.offsetWidth, h: el.offsetHeight });
  }, []);

  const handleError = useCallback(() => {
    if (retryRef.current < 1) {
      retryRef.current += 1;
      setPdfLoaded(false);
      return;
    }
    // iframe failed twice → try <object>
    if (!useObject) {
      setUseObject(true);
      setPdfLoaded(false);
      return;
    }
    // object also failed
    setPdfErrored(true);
  }, [useObject]);

  return (
    <div className="flex flex-col h-full">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2.5
                      bg-white dark:bg-slate-900
                      border-b border-slate-200 dark:border-slate-800
                      shrink-0 gap-3">

        {/* Page nav */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="h-8 w-8 rounded-lg border border-slate-200
                       dark:border-slate-700 flex items-center justify-center
                       text-slate-500 disabled:opacity-40
                       hover:border-[#28ABDF] hover:text-[#28ABDF] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-slate-600
                           dark:text-slate-400 w-20 text-center">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages || 1, currentPage + 1))}
            disabled={currentPage >= (totalPages || 1)}
            className="h-8 w-8 rounded-lg border border-slate-200
                       dark:border-slate-700 flex items-center justify-center
                       text-slate-500 disabled:opacity-40
                       hover:border-[#28ABDF] hover:text-[#28ABDF] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => clampZoom(-0.1)}
            disabled={scale <= 0.5}
            className="h-8 w-8 rounded-lg border border-slate-200
                       dark:border-slate-700 flex items-center justify-center
                       text-slate-500 disabled:opacity-40
                       hover:border-[#28ABDF] hover:text-[#28ABDF] transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale(1)}
            className="text-xs text-slate-500 font-medium w-12
                       text-center hover:text-slate-700 transition-colors"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={() => clampZoom(0.1)}
            disabled={scale >= 2}
            className="h-8 w-8 rounded-lg border border-slate-200
                       dark:border-slate-700 flex items-center justify-center
                       text-slate-500 disabled:opacity-40
                       hover:border-[#28ABDF] hover:text-[#28ABDF] transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="hidden sm:block text-xs text-slate-400 font-medium">
          {pageFields.length} field{pageFields.length !== 1 ? 's' : ''} on page
        </span>
      </div>

      {/* ── PDF + overlays ── */}
      <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 p-4">
        <div
          className="relative mx-auto bg-white shadow-2xl shadow-black/20 select-none"
          style={{
            width:    `${scale * 100}%`,
            maxWidth: `${scale * 860}px`,
          }}
        >
          {/* Loading skeleton */}
          {!pdfLoaded && !pdfErrored && (
            <div className="absolute inset-0 flex flex-col items-center
                            justify-center gap-3 bg-white z-10 min-h-[600px]">
              <div className="w-12 h-12 bg-[#28ABDF]/10 rounded-2xl
                              flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#28ABDF] animate-spin" />
              </div>
              <p className="text-sm text-slate-400 font-medium">
                Loading document…
              </p>
            </div>
          )}

          {/* Error state */}
          {pdfErrored && (
            <div className="flex flex-col items-center justify-center
                            min-h-[400px] gap-4 bg-white">
              <div className="w-14 h-14 bg-red-50 rounded-2xl
                              flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700 mb-1">
                  Failed to load PDF
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Please check your connection and try again
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    retryRef.current = 0;
                    setPdfErrored(false);
                    setUseObject(false);
                    setPdfLoaded(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#28ABDF] text-white
                             text-sm font-semibold hover:bg-sky-600 transition-colors"
                >
                  Retry
                </button>
                <a
                  href={proxyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-slate-200
                             text-sm font-semibold text-slate-600
                             hover:bg-slate-50 transition-colors
                             flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Open PDF
                </a>
              </div>
            </div>
          )}

          {/* ✅ iframe — proxy URL ব্যবহার করছে */}
          {!pdfErrored && !useObject && (
            <iframe
              key={`frame-${retryRef.current}`}
              src={finalUrl}
              className="w-full border-0 block"
              style={{
                height:     `${scale * 1100}px`,
                minHeight:  '600px',
                opacity:    pdfLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
              title="Document"
              onLoad={handleLoad}
              onError={handleError}
            />
          )}

          {/* ✅ object fallback */}
          {!pdfErrored && useObject && (
            <object
              data={finalUrl}
              type="application/pdf"
              className="w-full border-0 block"
              style={{
                height:     `${scale * 1100}px`,
                minHeight:  '600px',
                opacity:    pdfLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
              onLoad={() => setPdfLoaded(true)}
              onError={() => setPdfErrored(true)}
            >
              <div className="flex flex-col items-center
                              justify-center h-64 gap-3">
                <FileText className="w-10 h-10 text-slate-300" />
                <p className="text-sm text-slate-500">
                  PDF preview not available in this browser.
                </p>
                <a
                  href={proxyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#28ABDF]
                             text-white text-sm font-semibold"
                >
                  Open PDF
                </a>
              </div>
            </object>
          )}

          {/* ✅ Field overlays */}
          {pdfLoaded && !pdfErrored && (
            <div
              ref={pdfDivRef}
              className="absolute inset-0"
              style={{ pointerEvents: 'none' }}
            >
              {pageFields.map(field => (
                <div
                  key={field.id}
                  style={{ pointerEvents: 'auto' }}
                >
                  <FieldOverlay
                    field={field}
                    pdfWidth={pdfSize.w}
                    pdfHeight={pdfSize.h}
                    onSignatureClick={onSignatureClick}
                    onTextChange={onTextChange}
                    onDateChange={onDateChange}
                    onCheckboxChange={onCheckboxChange}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FIELD PROGRESS
// ═══════════════════════════════════════════════════════════════
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
                    border-b border-slate-100 dark:border-slate-800">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100
                      dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            allDone ? 'bg-emerald-500' : 'bg-[#28ABDF]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-semibold whitespace-nowrap ${
        allDone
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-slate-500 dark:text-slate-400'
      }`}>
        {allDone ? '✓ All fields complete' : `${done} / ${total} fields`}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SIGNATURE MODAL
// ═══════════════════════════════════════════════════════════════
function SignatureModal({ field, onClose, onAccept }) {
  const [sigData, setSigData] = useState(null);
  if (!field) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg
                      sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-[#28ABDF] to-sky-600
                        flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-xl bg-white/20
                            flex items-center justify-center">
              <PenTool className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                {field.type === 'initial' ? 'Add Your Initials' : 'Add Your Signature'}
              </h2>
              <p className="text-white/70 text-xs">Legally binding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30
                       text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <SignaturePad onChange={setSigData} height={180} />
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl font-semibold
                       border-slate-200 dark:border-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={() => sigData && onAccept(sigData)}
            disabled={!sigData}
            className="flex-1 h-11 rounded-xl font-semibold gap-2
                       bg-[#28ABDF] hover:bg-sky-600 text-white
                       shadow-md shadow-sky-400/25 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Apply
          </Button>
        </div>
        <p className="text-center text-[11px] text-slate-400 pb-5 px-5">
          By clicking Apply, you agree this is your legal electronic signature.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DECLINE MODAL
// ═══════════════════════════════════════════════════════════════
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
        <h3 className="text-base font-bold text-slate-800 dark:text-white
                       text-center mb-1">
          Decline Document?
        </h3>
        <p className="text-sm text-slate-500 text-center mb-4">
          This cannot be undone. The document owner will be notified.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason for declining (optional)"
          rows={3}
          className="w-full rounded-xl border border-slate-200
                     dark:border-slate-700 px-3 py-2.5 text-sm
                     text-slate-700 dark:text-slate-300
                     dark:bg-slate-800 resize-none mb-4
                     focus:outline-none focus:border-red-400
                     placeholder:text-slate-300"
        />
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 h-10 rounded-xl bg-red-500
                       hover:bg-red-600 text-white gap-2"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <XCircle className="w-4 h-4" />
            }
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function TemplateSigner() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const mutations  = useTemplateMutations();

  const { session, template, loading, error, code } =
    useTemplateSession(token);

  const [fields,      setFields]      = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeField, setActiveField] = useState(null);
  const [showDecline, setShowDecline] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [declining,   setDeclining]   = useState(false);
  const [phase,       setPhase]       = useState('signing');

  // Init fields from template
  useEffect(() => {
    if (!template?.fields?.length) return;
    setFields(
      template.fields.map(f => ({ ...f, value: f.value || '' }))
    );
  }, [template]);

  useDocTitle(
    template ? `Sign: ${template.title} — NexSign` : 'Sign — NexSign'
  );

  // ✅ PDF proxy URL — X-Frame-Options bypass করবে
  const pdfProxyUrl = useMemo(
    () => token ? templateApi.getPdfProxyUrl(token) : '',
    [token],
  );

  const totalPages = template?.totalPages || 1;

  // ── Field handlers ──────────────────────────────────────
  const handleSignatureClick = useCallback(field => {
    setActiveField(field);
  }, []);

  const handleSignatureAccept = useCallback(dataUrl => {
    if (!activeField) return;
    setFields(prev =>
      prev.map(f => f.id === activeField.id ? { ...f, value: dataUrl } : f)
    );
    setActiveField(null);
    toast.success('Signature applied!');
  }, [activeField]);

  const handleTextChange = useCallback((id, val) => {
    setFields(prev =>
      prev.map(f => f.id === id ? { ...f, value: val } : f)
    );
  }, []);

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const missing = fields.filter(f => f.required !== false && !f.value);

    if (missing.length) {
      toast.error(
        `Please complete ${missing.length} required field${
          missing.length > 1 ? 's' : ''
        }.`
      );
      const firstPage = missing[0]?.page;
      if (firstPage) setCurrentPage(firstPage);
      return;
    }

    const sigField = fields.find(f => f.type === 'signature' && f.value);
    if (!sigField) {
      toast.error('Please add your signature first.');
      return;
    }

    setSubmitting(true);
    try {
      const fieldValues = fields
        .filter(f => f.value)
        .map(f => ({ fieldId: f.id, type: f.type, value: f.value }));

      const res = await mutations.employeeSign(token, {
        signatureDataUrl: sigField.value,
        fieldValues,
        clientTime: new Date().toISOString(),
      });

      if (res.success) {
        setPhase('signed');
      } else {
        toast.error(res.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      toast.error(err?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }, [fields, token, mutations]);

  // ── Decline ──────────────────────────────────────────────
  const handleDecline = useCallback(async (reason) => {
    setDeclining(true);
    try {
      const res = await mutations.employeeDecline(token, reason);
      if (res.success) {
        setShowDecline(false);
        setPhase('declined');
      } else {
        toast.error(res.error || 'Failed to decline.');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to decline.');
    } finally {
      setDeclining(false);
    }
  }, [token, mutations]);

  const requiredFields = useMemo(
    () => fields.filter(f => f.required !== false),
    [fields],
  );
  const allFilled = requiredFields.length > 0 &&
    requiredFields.every(f => !!f.value);

  // ─────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center
                      bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="w-14 h-14 bg-[#28ABDF]/10 rounded-2xl
                        flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[#28ABDF] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-500">
          Loading document…
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // ERROR / STATUS SCREENS
  // ─────────────────────────────────────────────────────────
  if (error || !session || !template) {
    if (code === 'ALREADY_SIGNED') {
      return (
        <StatusScreen
          icon={CheckCircle2} iconClass="text-emerald-500"
          bgClass="bg-emerald-100 dark:bg-emerald-900/30"
          title="Already Signed"
          message="You have already signed this document."
        >
          <Button
            onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-[#28ABDF]
                       hover:bg-sky-600 text-white font-semibold"
          >
            Done
          </Button>
        </StatusScreen>
      );
    }

    if (code === 'LINK_EXPIRED') {
      return (
        <StatusScreen
          icon={Clock} iconClass="text-amber-500"
          bgClass="bg-amber-100 dark:bg-amber-900/30"
          title="Link Expired"
          message="This signing link has expired. Please contact the sender for a new link."
        >
          <Button
            onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-slate-900
                       text-white font-semibold"
          >
            Return Home
          </Button>
        </StatusScreen>
      );
    }

    if (code === 'ALREADY_DECLINED') {
      return (
        <StatusScreen
          icon={XCircle} iconClass="text-red-500"
          bgClass="bg-red-100 dark:bg-red-900/30"
          title="Already Declined"
          message="You have already declined this document."
        >
          <Button
            onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-slate-900
                       text-white font-semibold"
          >
            Return Home
          </Button>
        </StatusScreen>
      );
    }

    return (
      <StatusScreen
        icon={AlertTriangle} iconClass="text-red-500"
        bgClass="bg-red-100 dark:bg-red-900/30"
        title="Invalid Link"
        message={error || 'This signing link is invalid or has expired.'}
      >
        <Button
          onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-slate-900
                     text-white font-semibold"
        >
          Return Home
        </Button>
      </StatusScreen>
    );
  }

  // ─────────────────────────────────────────────────────────
  // SIGNED SUCCESS
  // ─────────────────────────────────────────────────────────
  if (phase === 'signed') {
    return (
      <StatusScreen
        icon={CheckCircle2} iconClass="text-emerald-500"
        bgClass="bg-emerald-100 dark:bg-emerald-900/30"
        title="Signature Submitted!"
        message={`Thank you, ${session.recipientName}! Your signature on "${template.title}" has been recorded.`}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl
                          bg-emerald-50 dark:bg-emerald-900/20
                          border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400 text-left">
              A signed copy will be emailed to{' '}
              <strong>{session.recipientEmail}</strong>
            </p>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-[#28ABDF]
                       hover:bg-sky-600 text-white font-semibold"
          >
            Done
          </Button>
        </div>
      </StatusScreen>
    );
  }

  // ─────────────────────────────────────────────────────────
  // DECLINED
  // ─────────────────────────────────────────────────────────
  if (phase === 'declined') {
    return (
      <StatusScreen
        icon={XCircle} iconClass="text-red-500"
        bgClass="bg-red-100 dark:bg-red-900/30"
        title="Document Declined"
        message="You have declined to sign this document. The owner has been notified."
      >
        <Button
          onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-slate-900
                     text-white font-semibold"
        >
          Return Home
        </Button>
      </StatusScreen>
    );
  }

  // ─────────────────────────────────────────────────────────
  // MAIN SIGNING UI
  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-100
                    dark:bg-slate-950 overflow-hidden">

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

      {/* ── Header ── */}
      <header className="h-14 sm:h-16 bg-white dark:bg-slate-900
                         border-b border-slate-200 dark:border-slate-800
                         flex items-center justify-between
                         px-4 sm:px-6 gap-4 shrink-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#28ABDF] rounded-xl
                          flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white
                           truncate max-w-[180px] sm:max-w-sm">
              {template.title}
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate">
              {session.recipientName}
              {session.recipientDesignation && (
                <span className="ml-1">· {session.recipientDesignation}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {template.signingConfig?.allowDecline !== false && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDecline(true)}
              className="h-9 px-3 rounded-xl border-red-200
                         dark:border-red-800/50 text-red-500
                         hover:bg-red-50 dark:hover:bg-red-900/20
                         hover:border-red-300 transition-colors
                         text-xs font-semibold hidden sm:flex gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Decline
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={`h-9 sm:h-10 px-4 sm:px-5 rounded-xl
                        font-semibold text-sm gap-1.5 transition-all
                        hover:-translate-y-0.5 active:translate-y-0
                        shadow-md disabled:opacity-60
                        disabled:translate-y-0 ${
              allFilled
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-400/30'
                : 'bg-[#28ABDF] hover:bg-sky-600 text-white shadow-sky-400/25'
            }`}
          >
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send    className="w-3.5 h-3.5" />
            }
            <span className="hidden sm:inline">
              {submitting ? 'Submitting…' : 'Finish Signing'}
            </span>
          </Button>
        </div>
      </header>

      {/* Progress */}
      <FieldProgress fields={fields} />

      {/* Company banner */}
      {template.companyName && (
        <div className="bg-white dark:bg-slate-900
                        border-b border-slate-100 dark:border-slate-800
                        px-4 py-2 flex items-center gap-2">
          {template.companyLogo && (
            <img
              src={template.companyLogo}
              alt={template.companyName}
              className="h-5 max-w-[60px] object-contain"
            />
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {template.companyName}
            {template.message && (
              <span className="ml-2 text-slate-400">
                — {template.message}
              </span>
            )}
          </p>
        </div>
      )}

      {/* PDF Viewer */}
      <main className="flex-1 min-h-0">
        <PdfWithFields
          proxyUrl={pdfProxyUrl}
          fields={fields}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onSignatureClick={handleSignatureClick}
          onTextChange={handleTextChange}
          onDateChange={handleTextChange}
          onCheckboxChange={handleTextChange}
        />
      </main>
    </div>
  );
}