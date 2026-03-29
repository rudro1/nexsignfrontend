// src/pages/SignerView.jsx

import React, {
  useEffect, useState, useRef, useCallback,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2, CheckCircle2, XCircle, ChevronLeft,
  ChevronRight, ZoomIn, ZoomOut, PenLine, Send,
  Shield, ShieldCheck, RotateCcw, AlertCircle,
  FileText, Lock, CheckSquare, Type, Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { api }    from '@/api/apiClient';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    if (title) document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────────
// Status Screen
// ─────────────────────────────────────────────────────────────────
function StatusScreen({ icon: Icon, color, title, message, children }) {
  const palettes = {
    red:   { bg: 'bg-red-50',     ring: 'ring-red-100',   icon: 'text-red-500'    },
    green: { bg: 'bg-emerald-50', ring: 'ring-emerald-100', icon: 'text-emerald-500' },
    amber: { bg: 'bg-amber-50',   ring: 'ring-amber-100', icon: 'text-amber-500'  },
  };
  const p = palettes[color] || palettes.red;

  return (
    <div className="min-h-screen bg-gradient-to-br
                    from-slate-50 via-sky-50/30 to-slate-100
                    dark:from-slate-950 dark:to-slate-900
                    flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl
                      shadow-xl shadow-slate-200/60
                      dark:shadow-black/40
                      border border-slate-100 dark:border-slate-800
                      p-8 max-w-md w-full text-center">

        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl ${p.bg} ${p.ring}
                         ring-8 flex items-center justify-center
                         mx-auto mb-5`}>
          <Icon className={`w-8 h-8 ${p.icon}`} />
        </div>

        <h1 className="text-xl font-bold text-slate-900
                       dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400
                      leading-relaxed mb-6">
          {message}
        </p>
        {children}

        {/* NexSign branding */}
        <div className="mt-6 pt-5 border-t border-slate-100
                        dark:border-slate-800 flex items-center
                        justify-center gap-2">
          <div className="w-5 h-5 bg-[#28ABDF] rounded-md
                          flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-slate-400">
            Secured by <span className="font-semibold">NeXsign</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Signature Modal
// ─────────────────────────────────────────────────────────────────
function SignatureModal({ isOpen, onClose, onAccept, fieldType = 'signature' }) {
  const canvasRef   = useRef(null);
  const isDrawing   = useRef(false);
  const lastPos     = useRef({ x: 0, y: 0 });
  const hasMoved    = useRef(false);

  const [isEmpty,      setIsEmpty]      = useState(true);
  const [inputMode,    setInputMode]    = useState('draw');
  const [typedText,    setTypedText]    = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script, cursive');
  const [penColor,     setPenColor]     = useState('#1e293b');
  const [penWidth,     setPenWidth]     = useState(2.5);

  const FONTS = [
    { label: 'Script',  value: 'Dancing Script, cursive' },
    { label: 'Serif',   value: 'Georgia, serif'          },
    { label: 'Print',   value: 'Arial, sans-serif'       },
    { label: 'Cursive', value: 'Brush Script MT, cursive'},
  ];

  const PEN_COLORS = ['#1e293b', '#1d4ed8', '#7c3aed', '#be185d'];

  // Load Google Font
  useEffect(() => {
    if (!isOpen) return;
    setIsEmpty(true);
    setTypedText('');
    setInputMode('draw');
    const link   = document.createElement('link');
    link.rel     = 'stylesheet';
    link.href    = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, [isOpen]);

  // Init canvas
  useEffect(() => {
    if (!isOpen || inputMode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect   = canvas.getBoundingClientRect();
    canvas.width  = rect.width  || 500;
    canvas.height = rect.height || 200;
    const ctx    = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = penColor;
    ctx.lineWidth   = penWidth;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  }, [isOpen, inputMode]); // eslint-disable-line

  // Keyboard close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const getPos = useCallback((e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width  / rect.width),
      y: (src.clientY - rect.top)  * (canvas.height / rect.height),
    };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    hasMoved.current  = false;
    const canvas      = canvasRef.current;
    const ctx         = canvas.getContext('2d');
    ctx.strokeStyle   = penColor;
    ctx.lineWidth     = penWidth;
    lastPos.current   = getPos(e, canvas);
  }, [penColor, penWidth, getPos]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current  = pos;
    hasMoved.current = true;
    setIsEmpty(false);
  }, [getPos]);

  const stopDraw = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  }, []);

  const handleAccept = useCallback(() => {
    if (inputMode === 'draw') {
      if (isEmpty) {
        toast.error('Please draw your signature first.');
        return;
      }
      onAccept(canvasRef.current.toDataURL('image/png'));
    } else {
      if (!typedText.trim()) {
        toast.error('Please type your signature.');
        return;
      }
      // Render typed text to canvas
      const c   = document.createElement('canvas');
      c.width   = 500;
      c.height  = 160;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 500, 160);
      ctx.font         = `52px ${selectedFont}`;
      ctx.fillStyle    = '#1e293b';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedText.trim().slice(0, 30), 250, 80);
      onAccept(c.toDataURL('image/png'));
    }
  }, [inputMode, isEmpty, typedText, selectedFont, onAccept]);

  if (!isOpen) return null;

  const isInitials = fieldType === 'initials';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isInitials ? 'Add Initials' : 'Add Signature'}
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-900 w-full sm:rounded-2xl
                      sm:max-w-lg shadow-2xl overflow-hidden
                      rounded-t-3xl">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-[#28ABDF] to-[#1a8cbf]
                        px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-xl bg-white/20
                            flex items-center justify-center">
              <PenLine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                {isInitials ? 'Add Your Initials' : 'Add Your Signature'}
              </h2>
              <p className="text-white/70 text-xs">
                This will be legally binding
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-white/20
                       hover:bg-white/30 text-white
                       flex items-center justify-center
                       transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* ── Mode tabs ── */}
        <div className="flex border-b border-slate-100
                        dark:border-slate-800">
          {[
            { id: 'draw', label: 'Draw' },
            { id: 'type', label: 'Type' },
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setInputMode(m.id)}
              className={`flex-1 py-3 text-sm font-semibold
                          transition-colors border-b-2
                ${inputMode === m.id
                  ? 'border-[#28ABDF] text-[#28ABDF]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="p-5">
          {inputMode === 'draw' ? (
            <div className="space-y-3">
              {/* Canvas */}
              <div className="relative rounded-xl overflow-hidden
                              border-2 border-dashed border-slate-200
                              dark:border-slate-700 bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full touch-none cursor-crosshair block"
                  style={{ height: '180px' }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                {isEmpty && (
                  <div className="absolute inset-0 flex items-center
                                  justify-center pointer-events-none">
                    <div className="text-center">
                      <PenLine className="w-6 h-6 text-slate-200
                                          mx-auto mb-1" />
                      <p className="text-sm text-slate-300">
                        Draw here
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pen tools */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Color picker */}
                  <div className="flex gap-1.5">
                    {PEN_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPenColor(c)}
                        className={`w-5 h-5 rounded-full transition-all
                          ${penColor === c
                            ? 'ring-2 ring-offset-1 ring-slate-400 scale-110'
                            : 'hover:scale-110'
                          }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Pen color ${c}`}
                      />
                    ))}
                  </div>
                  {/* Width */}
                  <div className="flex gap-1 ml-1">
                    {[1.5, 2.5, 4].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setPenWidth(w)}
                        className={`h-6 px-2 rounded-lg border text-[10px]
                                    font-bold transition-all
                          ${penWidth === w
                            ? 'border-[#28ABDF] bg-sky-50 text-[#28ABDF]'
                            : 'border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                      >
                        {w === 1.5 ? 'S' : w === 2.5 ? 'M' : 'L'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs
                             text-red-400 hover:text-red-500
                             font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              </div>
            </div>

          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={typedText}
                onChange={e => setTypedText(e.target.value)}
                placeholder="Type your full name"
                maxLength={30}
                className="w-full h-12 border-2 border-slate-200
                           dark:border-slate-700 rounded-xl px-4 text-lg
                           focus:border-[#28ABDF] focus:outline-none
                           dark:bg-slate-800 dark:text-white
                           transition-colors"
                style={{ fontFamily: selectedFont }}
              />

              {/* Font choices */}
              <div className="flex flex-wrap gap-2">
                {FONTS.map(f => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setSelectedFont(f.value)}
                    className={`px-3 py-1.5 rounded-lg border text-sm
                                transition-all
                      ${selectedFont === f.value
                        ? 'border-[#28ABDF] bg-sky-50 text-[#28ABDF] font-semibold'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Preview */}
              {typedText.trim() && (
                <div
                  className="rounded-xl border-2 border-slate-100
                             dark:border-slate-700 p-4 text-center
                             bg-white dark:bg-slate-800 text-4xl
                             text-slate-800 dark:text-white"
                  style={{ fontFamily: selectedFont }}
                >
                  {typedText}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl h-11
                         border-slate-200 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAccept}
              className="flex-1 h-11 rounded-xl
                         bg-[#28ABDF] hover:bg-[#2399c8] text-white
                         font-semibold gap-1.5 shadow-md
                         shadow-sky-400/25 transition-all
                         hover:-translate-y-0.5 active:translate-y-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply {isInitials ? 'Initials' : 'Signature'}
            </Button>
          </div>

          {/* Legal note */}
          <p className="text-center text-[11px] text-slate-400
                        mt-3 leading-relaxed">
            By clicking Apply, you agree this is your legal electronic
            signature.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Field Overlay
// ─────────────────────────────────────────────────────────────────
const FIELD_STYLES = {
  signature: {
    base:   'border-2 border-dashed border-[#28ABDF] bg-sky-50/80 hover:bg-sky-100/90',
    filled: 'border-2 border-[#28ABDF]/40 bg-sky-50/40',
    icon:   <PenLine className="w-3.5 h-3.5 text-[#28ABDF]" />,
    label:  'Click to sign',
  },
  initials: {
    base:   'border-2 border-dashed border-purple-400 bg-purple-50/80 hover:bg-purple-100/90',
    filled: 'border-2 border-purple-300/40 bg-purple-50/40',
    icon:   <Type className="w-3.5 h-3.5 text-purple-500" />,
    label:  'Initials',
  },
  text: {
    base:   'border-2 border-slate-300 bg-white/90 hover:border-[#28ABDF]',
    filled: 'border-2 border-slate-200 bg-white',
    icon:   <Type className="w-3.5 h-3.5 text-slate-400" />,
    label:  'Text',
  },
  date: {
    base:   'border-2 border-dashed border-emerald-400 bg-emerald-50/80 hover:bg-emerald-100/90',
    filled: 'border-2 border-emerald-300/40 bg-emerald-50/40',
    icon:   <Calendar className="w-3.5 h-3.5 text-emerald-500" />,
    label:  'Date',
  },
  checkbox: {
    base:   'border-2 border-dashed border-amber-400 bg-amber-50/80 hover:bg-amber-100/90',
    filled: 'border-2 border-amber-300/40 bg-amber-50/40',
    icon:   <CheckSquare className="w-3.5 h-3.5 text-amber-500" />,
    label:  '',
  },
};

function FieldOverlay({ field, isMine, onClick, onChange }) {
  const style   = FIELD_STYLES[field.type] || FIELD_STYLES.text;
  const isFilled = !!field.value;
  const cls     = `absolute rounded-lg transition-all duration-150
                   flex items-center justify-center overflow-hidden
                   select-none
                   ${isFilled ? style.filled : style.base}
                   ${isMine   ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`;

  return (
    <div
      className={cls}
      style={{
        left:   `${field.x      ?? 0}%`,
        top:    `${field.y      ?? 0}%`,
        width:  `${field.width  ?? 20}%`,
        height: `${field.height ?? 6}%`,
      }}
      onClick={() => isMine && onClick(field)}
      title={isMine ? undefined : 'This field belongs to another signer'}
    >
      {isFilled ? (
        /* Filled state */
        field.type === 'signature' || field.type === 'initials' ? (
          <img
            src={field.value}
            alt={field.type}
            className="w-full h-full object-contain p-1"
            draggable={false}
          />
        ) : field.type === 'checkbox' ? (
          <CheckSquare className="w-5 h-5 text-amber-500" />
        ) : (
          <span className="text-xs text-slate-700 px-2 truncate w-full
                           text-center font-medium">
            {field.value}
          </span>
        )
      ) : (
        /* Empty state */
        <div className="flex items-center gap-1.5 px-2">
          {field.required && (
            <span className="text-red-400 text-[10px] font-bold
                             leading-none">*</span>
          )}
          {style.icon}
          <span className="text-[11px] font-semibold text-slate-500
                           truncate">
            {style.label}
          </span>
        </div>
      )}

      {/* Inline inputs for text/date/checkbox */}
      {isMine && !isFilled && field.type === 'text' && (
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0
                     focus:opacity-100 bg-white px-2 text-xs
                     border-none outline-none z-10"
          onClick={e => e.stopPropagation()}
          onChange={e => onChange(field.id, e.target.value)}
        />
      )}
      {isMine && !isFilled && field.type === 'date' && (
        <input
          type="date"
          className="absolute inset-0 w-full h-full opacity-0
                     focus:opacity-100 bg-white px-2 text-xs
                     border-none outline-none z-10"
          onClick={e => e.stopPropagation()}
          onChange={e => onChange(field.id, e.target.value)}
        />
      )}
      {isMine && field.type === 'checkbox' && (
        <input
          type="checkbox"
          className="absolute inset-0 w-full h-full opacity-0
                     cursor-pointer z-10"
          onClick={e => {
            e.stopPropagation();
            onChange(field.id, e.target.checked ? 'checked' : '');
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PDF Field Viewer
// ─────────────────────────────────────────────────────────────────
function PdfFieldViewer({
  pdfUrl, fields, signerIndex, onFieldClick,
  onFieldChange, currentPage, onPageChange, totalPages,
}) {
  const containerRef = useRef(null);
  const [pdfLoaded,  setPdfLoaded]  = useState(false);
  const [pdfError,   setPdfError]   = useState(false);
  const [scale,      setScale]      = useState(1.0);
  const [containerW, setContainerW] = useState(0);

  const pageFields = fields.filter(f => (f.page || 1) === currentPage);

  // Measure container for responsive overlay
  useEffect(() => {
    const el  = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      setContainerW(entries[0].contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const clampScale = useCallback((delta) => {
    setScale(s => Math.min(2, Math.max(0.5,
      Math.round((s + delta) * 10) / 10
    )));
  }, []);

  return (
    <div className="flex flex-col h-full">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between
                      px-4 py-2.5 bg-white dark:bg-slate-900
                      border-b border-slate-200 dark:border-slate-800
                      shrink-0 gap-3">

        {/* Page nav */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="h-8 w-8 rounded-lg
                       border-slate-200 dark:border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-slate-600
                           dark:text-slate-400 min-w-[80px] text-center">
            {currentPage} / {totalPages || '?'}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(
              Math.min(totalPages || 999, currentPage + 1)
            )}
            disabled={currentPage >= (totalPages || 1)}
            className="h-8 w-8 rounded-lg
                       border-slate-200 dark:border-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => clampScale(-0.1)}
            disabled={scale <= 0.5}
            className="h-8 w-8 rounded-lg
                       border-slate-200 dark:border-slate-700"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <button
            type="button"
            onClick={() => setScale(1)}
            className="text-xs text-slate-500 dark:text-slate-400
                       font-medium w-12 text-center
                       hover:text-slate-700 transition-colors"
            title="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => clampScale(0.1)}
            disabled={scale >= 2}
            className="h-8 w-8 rounded-lg
                       border-slate-200 dark:border-slate-700"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Fields indicator */}
        <div className="hidden sm:flex items-center gap-1.5
                        text-xs text-slate-400 font-medium">
          <FileText className="w-3.5 h-3.5" />
          {pageFields.filter(f =>
            f.partyIndex === signerIndex
          ).length} field{pageFields.filter(f =>
            f.partyIndex === signerIndex
          ).length !== 1 ? 's' : ''} on page
        </div>
      </div>

      {/* ── PDF Canvas ── */}
      <div className="flex-1 overflow-auto
                      bg-slate-200 dark:bg-slate-950 p-4 sm:p-6">
        {pdfError ? (
          <div className="flex flex-col items-center justify-center
                          h-full gap-3 text-slate-500">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="font-medium">Failed to load PDF</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPdfError(false)}
              className="rounded-xl"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div
            className="relative mx-auto bg-white shadow-2xl
                       shadow-black/20 rounded-sm"
            ref={containerRef}
            style={{
              width:    `${Math.min(100, scale * 100)}%`,
              maxWidth: `${scale * 860}px`,
            }}
          >
            {/* Skeleton */}
            {!pdfLoaded && (
              <div className="absolute inset-0 bg-white animate-pulse
                              flex items-center justify-center
                              min-h-[600px] rounded-sm">
                <Loader2 className="w-8 h-8 animate-spin
                                    text-slate-300" />
              </div>
            )}

            <iframe
              src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full border-0 block"
              style={{ height: `${scale * 1100}px`, minHeight: '500px' }}
              onLoad={() => setPdfLoaded(true)}
              onError={() => setPdfError(true)}
              title="Document for signing"
            />

            {/* Field overlays */}
            {pdfLoaded && pageFields.map(field => (
              <FieldOverlay
                key={field.id}
                field={field}
                isMine={field.partyIndex === signerIndex}
                onClick={onFieldClick}
                onChange={onFieldChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Progress Bar
// ─────────────────────────────────────────────────────────────────
function FieldProgress({ fields, signerIndex }) {
  const mine    = fields.filter(f => f.partyIndex === signerIndex);
  const filled  = mine.filter(f => f.value);
  const pct     = mine.length ? Math.round((filled.length / mine.length) * 100) : 100;
  const allDone = filled.length === mine.length;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5
                    bg-white dark:bg-slate-900
                    border-b border-slate-100 dark:border-slate-800">
      <div className="flex-1 h-1.5 rounded-full
                      bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500
            ${allDone ? 'bg-emerald-500' : 'bg-[#28ABDF]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-semibold whitespace-nowrap
        ${allDone ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'}`}>
        {allDone
          ? '✓ All fields complete'
          : `${filled.length} / ${mine.length} fields`
        }
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────
export default function SignerView() {
  const { token }  = useParams();
  const navigate   = useNavigate();

  const [phase,       setPhase]       = useState('loading');
  const [docInfo,     setDocInfo]     = useState(null);
  const [signerInfo,  setSignerInfo]  = useState(null);
  const [pdfUrl,      setPdfUrl]      = useState('');
  const [fields,      setFields]      = useState([]);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [activeField, setActiveField] = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useDocumentTitle(
    docInfo
      ? `Sign: ${docInfo.title} — NeXsign`
      : 'Sign Document — NeXsign'
  );

  // ── Validate token ──────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setErrorMsg('No signing token provided.');
      setPhase('error');
      return;
    }

    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await api.get(
          `/documents/sign/validate/${token}`,
          { signal: ctrl.signal }
        );
        if (!mountedRef.current) return;

        const { document: doc, party } = res.data;
        setDocInfo(doc);
        setSignerInfo(party);
        setFields(
          (doc.fields || []).map(f => ({
            ...f,
            value: f.value || '',
          }))
        );
        setTotalPages(doc.totalPages || 1);
        setPdfUrl(
          `${import.meta.env.VITE_API_URL}/documents/sign/${token}/pdf`
        );
        setPhase('ready');
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        if (!mountedRef.current) return;
        const msg    = err.response?.data?.message
                       || 'This link is invalid or has expired.';
        const status = err.response?.status;
        setErrorMsg(msg);
        setPhase(
          status === 410 ? 'already_signed'
          : status === 404 ? 'error'
          : 'error'
        );
      }
    })();

    return () => ctrl.abort();
  }, [token]);

  // ── Handlers ───────────────────────────────────────────────
  const handleFieldClick = useCallback((field) => {
    if (field.partyIndex !== signerInfo?.index) {
      const ownerName = docInfo?.parties?.[field.partyIndex]?.name || 'another signer';
      toast.info(`This field belongs to ${ownerName}.`);
      return;
    }
    if (field.type === 'signature' || field.type === 'initials') {
      setActiveField(field);
      setShowModal(true);
    }
  }, [signerInfo, docInfo]);

  const handleFieldChange = useCallback((id, val) => {
    setFields(prev =>
      prev.map(f => f.id === id ? { ...f, value: val } : f)
    );
  }, []);

  const onSignatureAccept = useCallback((dataUrl) => {
    if (activeField) {
      handleFieldChange(activeField.id, dataUrl);
      setShowModal(false);
      setActiveField(null);
      toast.success('Signature applied!');
    }
  }, [activeField, handleFieldChange]);

  const handleSubmit = useCallback(async () => {
    const mine    = fields.filter(f => f.partyIndex === signerInfo?.index);
    const missing = mine.filter(f => f.required && !f.value);

    if (missing.length) {
      toast.error(
        `Please complete ${missing.length} required field${missing.length > 1 ? 's' : ''}.`
      );
      // Jump to page of first missing field
      if (missing[0].page) setCurrentPage(missing[0].page);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/documents/sign/submit', {
        token, fields,
      });
      if (!mountedRef.current) return;
      setPhase(res.data.completed ? 'completed' : 'signed_next');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to submit. Please try again.'
      );
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [fields, signerInfo, token]);

  // ── Phase screens ───────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center
                      justify-center bg-slate-50 gap-4">
        <div className="w-14 h-14 bg-[#28ABDF]/10 rounded-2xl
                        flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#28ABDF]" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-700">
            Loading secure document
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Verifying your signing link…
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <StatusScreen
        icon={XCircle}
        color="red"
        title="Invalid Link"
        message={errorMsg}
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

  if (phase === 'already_signed') {
    return (
      <StatusScreen
        icon={CheckCircle2}
        color="green"
        title="Already Signed"
        message="You have already signed this document. No further action is needed."
      >
        <Button
          onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-slate-900
                     text-white font-semibold"
        >
          Visit NeXsign
        </Button>
      </StatusScreen>
    );
  }

  if (phase === 'signed_next') {
    return (
      <StatusScreen
        icon={CheckCircle2}
        color="green"
        title="Signature Submitted!"
        message="Thank you! Your signature has been recorded. The next signer has been notified."
      >
        <Button
          onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-[#28ABDF]
                     text-white font-semibold"
        >
          Done
        </Button>
      </StatusScreen>
    );
  }

  if (phase === 'completed') {
    return (
      <StatusScreen
        icon={ShieldCheck}
        color="green"
        title="Document Fully Signed!"
        message={`All parties have signed "${docInfo?.title}". A completed copy with audit trail has been sent to all parties.`}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl
                          bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700 text-left">
              A signed copy has been sent to{' '}
              <strong>{signerInfo?.email}</strong>
            </p>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-[#28ABDF]
                       text-white font-semibold"
          >
            Done
          </Button>
        </div>
      </StatusScreen>
    );
  }

  // ── Ready: main signing view ────────────────────────────────
  const myFields    = fields.filter(f => f.partyIndex === signerInfo?.index);
  const filledCount = myFields.filter(f => f.value).length;
  const allFilled   = filledCount === myFields.length && myFields.length > 0;

  return (
    <div className="flex flex-col h-screen bg-slate-100
                    dark:bg-slate-950 overflow-hidden">

      {/* ── Header ── */}
      <header className="h-14 sm:h-16 bg-white dark:bg-slate-900
                         border-b border-slate-200 dark:border-slate-800
                         flex items-center justify-between
                         px-4 sm:px-6 gap-4 z-40 shrink-0">

        {/* Left: doc info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#28ABDF] rounded-xl
                          flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900
                           dark:text-white truncate max-w-[160px]
                           sm:max-w-xs">
              {docInfo?.title}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium
                          hidden sm:block">
              Secure signing request ·{' '}
              {docInfo?.createdAt && formatDate(docInfo.createdAt)}
            </p>
          </div>
        </div>

        {/* Right: signer info + submit */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-700
                          dark:text-slate-300">
              {signerInfo?.name}
            </p>
            <p className="text-[10px] text-slate-400">
              {signerInfo?.email}
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={`h-9 sm:h-10 px-4 sm:px-5 rounded-xl
                        font-semibold text-sm gap-1.5
                        transition-all hover:-translate-y-0.5
                        active:translate-y-0 shadow-md
                        disabled:opacity-60 disabled:cursor-not-allowed
                        disabled:hover:translate-y-0
              ${allFilled
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-400/30 text-white'
                : 'bg-[#28ABDF] hover:bg-[#2399c8] shadow-sky-400/25 text-white'
              }`}
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

      {/* ── Field progress bar ── */}
      <FieldProgress fields={fields} signerIndex={signerInfo?.index} />

      {/* ── PDF viewer ── */}
      <main className="flex-1 min-h-0">
        <PdfFieldViewer
          pdfUrl={pdfUrl}
          fields={fields}
          signerIndex={signerInfo?.index}
          onFieldClick={handleFieldClick}
          onFieldChange={handleFieldChange}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </main>

      {/* ── Signature Modal ── */}
      <SignatureModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setActiveField(null); }}
        onAccept={onSignatureAccept}
        fieldType={activeField?.type}
      />
    </div>
  );
}