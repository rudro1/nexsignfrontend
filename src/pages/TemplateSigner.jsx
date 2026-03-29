// src/pages/TemplateSigner.jsx
import React, {
  useEffect, useState, useRef, useCallback, useMemo,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';

// ─────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}

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

// ─────────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────────
const Ic = {
  Spinner: ({ cls = 'w-5 h-5' }) => (
    <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  ),
  Check: ({ cls = 'w-5 h-5' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Shield: ({ cls = 'w-5 h-5' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955
           11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824
           10.29 9 11.622 5.176-1.332 9-6.03 9-11.622
           0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  ShieldCheck: ({ cls = 'w-8 h-8' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112
           2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0
           003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332
           9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  XCircle: ({ cls = 'w-8 h-8' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
  CheckCircle: ({ cls = 'w-8 h-8' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Pen: ({ cls = 'w-4 h-4' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0
           113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Send: ({ cls = 'w-4 h-4' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Rotate: ({ cls = 'w-3.5 h-3.5' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582
           9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0
           01-15.357-2m15.357 2H15" />
    </svg>
  ),
  ChevLeft: ({ cls = 'w-4 h-4' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevRight: ({ cls = 'w-4 h-4' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 5l7 7-7 7" />
    </svg>
  ),
  ZoomIn: ({ cls = 'w-3.5 h-3.5' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="m21 21-4.35-4.35M11 8v6M8 11h6" />
    </svg>
  ),
  ZoomOut: ({ cls = 'w-3.5 h-3.5' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="m21 21-4.35-4.35M8 11h6" />
    </svg>
  ),
  Lock: ({ cls = 'w-4 h-4' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  Type: ({ cls = 'w-3.5 h-3.5' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  Calendar: ({ cls = 'w-3.5 h-3.5' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  CheckSq: ({ cls = 'w-3.5 h-3.5' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="9 11 12 14 22 4" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  Warning: ({ cls = 'w-5 h-5' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0
           2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333
           -3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Crown: ({ cls = 'w-4 h-4' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 17l3-8 5 5 4-9 3 8H3z" />
    </svg>
  ),
  User: ({ cls = 'w-4 h-4' }) => (
    <svg className={cls} fill="none" stroke="currentColor"
      viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────
// Status Screen
// ─────────────────────────────────────────────────────────────────
function StatusScreen({ icon: Icon, iconCls, bgCls, title, message, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50
                    via-sky-50/30 to-slate-100 dark:from-slate-950
                    dark:to-slate-900 flex items-center
                    justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl
                      shadow-xl border border-slate-100
                      dark:border-slate-800 p-8 max-w-md w-full
                      text-center">
        <div className={`w-16 h-16 ${bgCls} rounded-2xl
                         flex items-center justify-center
                         mx-auto mb-5`}>
          <Icon cls={`w-8 h-8 ${iconCls}`} />
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
        {/* Branding */}
        <div className="mt-6 pt-5 border-t border-slate-100
                        dark:border-slate-800 flex items-center
                        justify-center gap-2">
          <div className="w-5 h-5 bg-[#28ABDF] rounded-md
                          flex items-center justify-center">
            <Ic.Shield cls="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-slate-400">
            Secured by{' '}
            <span className="font-semibold text-slate-600
                             dark:text-slate-300">
              NeXsign
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Signature Modal
// ─────────────────────────────────────────────────────────────────
function SignatureModal({ isOpen, fieldType, onClose, onAccept }) {
  const canvasRef  = useRef(null);
  const isDrawing  = useRef(false);
  const lastPos    = useRef({ x: 0, y: 0 });
  const mountedRef = useRef(true);

  const [mode,         setMode]         = useState('draw');
  const [isEmpty,      setIsEmpty]      = useState(true);
  const [typedText,    setTypedText]    = useState('');
  const [penColor,     setPenColor]     = useState('#1e293b');
  const [penWidth,     setPenWidth]     = useState(2.5);
  const [font,         setFont]         = useState('Dancing Script, cursive');

  const FONTS = [
    { label: 'Script',  value: 'Dancing Script, cursive' },
    { label: 'Serif',   value: 'Georgia, serif'          },
    { label: 'Print',   value: 'Arial, sans-serif'       },
    { label: 'Cursive', value: 'Brush Script MT, cursive'},
  ];
  const PEN_COLORS = ['#1e293b','#1d4ed8','#7c3aed','#be185d'];

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setIsEmpty(true); setTypedText(''); setMode('draw');
    const link  = document.createElement('link');
    link.rel    = 'stylesheet';
    link.href   = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  || 480;
    canvas.height = rect.height || 180;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = penColor; ctx.lineWidth = penWidth;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }, [isOpen, mode]); // eslint-disable-line

  // Keyboard close
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
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
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.strokeStyle = penColor; ctx.lineWidth = penWidth;
    lastPos.current = getPos(e, canvas);
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
    lastPos.current = pos;
    setIsEmpty(false);
  }, [getPos]);

  const stopDraw = useCallback(() => { isDrawing.current = false; }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  }, []);

  const handleAccept = useCallback(() => {
    if (mode === 'draw') {
      if (isEmpty) return;
      onAccept(canvasRef.current.toDataURL('image/png'));
    } else {
      if (!typedText.trim()) return;
      const c = document.createElement('canvas');
      c.width = 480; c.height = 150;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 480, 150);
      ctx.font         = `48px ${font}`;
      ctx.fillStyle    = '#1e293b';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedText.trim().slice(0, 30), 240, 75);
      onAccept(c.toDataURL('image/png'));
    }
  }, [mode, isEmpty, typedText, font, onAccept]);

  if (!isOpen) return null;

  const isInitials = fieldType === 'initials';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-900 w-full
                      sm:max-w-lg sm:rounded-2xl rounded-t-3xl
                      shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#28ABDF] to-sky-600
                        px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-xl bg-white/20
                            flex items-center justify-center">
              <Ic.Pen cls="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                {isInitials ? 'Add Your Initials' : 'Add Your Signature'}
              </h2>
              <p className="text-white/70 text-xs">Legally binding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30
                       text-white flex items-center justify-center
                       text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          {['draw','type'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3 text-sm font-semibold
                          capitalize transition-colors border-b-2
                ${mode === m
                  ? 'border-[#28ABDF] text-[#28ABDF]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {mode === 'draw' ? (
            <>
              {/* Canvas */}
              <div className="relative rounded-xl overflow-hidden
                              border-2 border-dashed border-slate-200
                              dark:border-slate-700 bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full touch-none cursor-crosshair block"
                  style={{ height: '170px' }}
                  onMouseDown={startDraw} onMouseMove={draw}
                  onMouseUp={stopDraw}   onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                {isEmpty && (
                  <div className="absolute inset-0 flex items-center
                                  justify-center pointer-events-none">
                    <div className="text-center">
                      <Ic.Pen cls="w-6 h-6 text-slate-200 mx-auto mb-1" />
                      <p className="text-sm text-slate-300">Draw here</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tools */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {PEN_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setPenColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full transition-all
                          ${penColor === c
                            ? 'ring-2 ring-offset-1 ring-slate-400 scale-110'
                            : 'hover:scale-110'}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {[1.5, 2.5, 4].map(w => (
                      <button
                        key={w}
                        onClick={() => setPenWidth(w)}
                        className={`h-6 px-2 rounded-lg border text-[10px]
                                    font-bold transition-all
                          ${penWidth === w
                            ? 'border-[#28ABDF] bg-sky-50 text-[#28ABDF]'
                            : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                      >
                        {w === 1.5 ? 'S' : w === 2.5 ? 'M' : 'L'}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs text-red-400
                             hover:text-red-500 font-medium transition-colors"
                >
                  <Ic.Rotate cls="w-3 h-3" /> Clear
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={typedText}
                onChange={e => setTypedText(e.target.value)}
                placeholder="Type your full name"
                maxLength={30}
                style={{ fontFamily: font }}
                className="w-full h-12 border-2 border-slate-200
                           dark:border-slate-700 rounded-xl px-4
                           text-lg focus:border-[#28ABDF]
                           focus:outline-none dark:bg-slate-800
                           dark:text-white transition-colors"
              />
              <div className="flex flex-wrap gap-2">
                {FONTS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFont(f.value)}
                    style={{ fontFamily: f.value }}
                    className={`px-3 py-1.5 rounded-lg border text-sm
                                transition-all
                      ${font === f.value
                        ? 'border-[#28ABDF] bg-sky-50 text-[#28ABDF] font-semibold'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {typedText.trim() && (
                <div
                  style={{ fontFamily: font }}
                  className="rounded-xl border-2 border-slate-100
                             dark:border-slate-700 p-4 text-center
                             bg-white dark:bg-slate-800 text-4xl
                             text-slate-800 dark:text-white"
                >
                  {typedText}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200
                         dark:border-slate-700 text-sm font-semibold
                         text-slate-600 dark:text-slate-300
                         hover:bg-slate-50 dark:hover:bg-slate-800
                         transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={mode === 'draw' ? isEmpty : !typedText.trim()}
              className="flex-1 h-11 rounded-xl bg-[#28ABDF]
                         hover:bg-sky-600 text-white text-sm
                         font-semibold flex items-center justify-center
                         gap-2 shadow-md shadow-sky-400/25 transition-all
                         hover:-translate-y-0.5 active:translate-y-0
                         disabled:opacity-40 disabled:cursor-not-allowed
                         disabled:hover:translate-y-0"
            >
              <Ic.Check cls="w-4 h-4" />
              Apply {isInitials ? 'Initials' : 'Signature'}
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-400 leading-relaxed">
            By clicking Apply, you agree this is your legal electronic signature.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Field Overlay
// ─────────────────────────────────────────────────────────────────
const FIELD_STYLE = {
  signature: {
    empty:  'border-2 border-dashed border-[#28ABDF] bg-sky-50/80 hover:bg-sky-100/90',
    filled: 'border-2 border-[#28ABDF]/30 bg-sky-50/40',
    label:  'Click to sign',
    icon:   (cls) => <Ic.Pen cls={cls} />,
  },
  initials: {
    empty:  'border-2 border-dashed border-purple-400 bg-purple-50/80 hover:bg-purple-100/90',
    filled: 'border-2 border-purple-300/30 bg-purple-50/40',
    label:  'Initials',
    icon:   (cls) => <Ic.Type cls={cls} />,
  },
  text: {
    empty:  'border-2 border-slate-300 bg-white/90 hover:border-[#28ABDF]',
    filled: 'border-2 border-slate-200 bg-white',
    label:  'Text',
    icon:   (cls) => <Ic.Type cls={cls} />,
  },
  date: {
    empty:  'border-2 border-dashed border-emerald-400 bg-emerald-50/80 hover:bg-emerald-100/90',
    filled: 'border-2 border-emerald-300/30 bg-emerald-50/40',
    label:  'Date',
    icon:   (cls) => <Ic.Calendar cls={cls} />,
  },
  checkbox: {
    empty:  'border-2 border-dashed border-amber-400 bg-amber-50/80 hover:bg-amber-100/90',
    filled: 'border-2 border-amber-300/30 bg-amber-50/40',
    label:  '',
    icon:   (cls) => <Ic.CheckSq cls={cls} />,
  },
};

function FieldOverlay({ field, isMine, onClick, onChange }) {
  const cfg    = FIELD_STYLE[field.type] || FIELD_STYLE.text;
  const filled = !!field.value;

  return (
    <div
      className={`absolute rounded-lg flex items-center justify-center
                  overflow-hidden select-none transition-all duration-150
                  ${filled ? cfg.filled : cfg.empty}
                  ${isMine
                    ? 'cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'}`}
      style={{
        left:   `${field.x      ?? 0}%`,
        top:    `${field.y      ?? 0}%`,
        width:  `${field.width  ?? 20}%`,
        height: `${field.height ?? 6}%`,
      }}
      onClick={() => isMine && onClick(field)}
    >
      {filled ? (
        field.type === 'signature' || field.type === 'initials' ? (
          <img src={field.value} alt={field.type}
            className="w-full h-full object-contain p-1"
            draggable={false} />
        ) : field.type === 'checkbox' ? (
          <Ic.CheckSq cls="w-5 h-5 text-amber-500" />
        ) : (
          <span className="text-xs text-slate-700 px-2 truncate
                           w-full text-center font-medium">
            {field.value}
          </span>
        )
      ) : (
        <div className="flex items-center gap-1.5 px-2">
          {field.required && (
            <span className="text-red-400 text-[10px] font-bold">*</span>
          )}
          {cfg.icon('w-3.5 h-3.5 text-slate-400')}
          <span className="text-[11px] font-semibold text-slate-500 truncate">
            {cfg.label}
          </span>
        </div>
      )}

      {/* Inline inputs */}
      {isMine && !filled && field.type === 'text' && (
        <input type="text"
          className="absolute inset-0 w-full h-full opacity-0
                     focus:opacity-100 bg-white px-2 text-xs
                     border-none outline-none z-10"
          onClick={e => e.stopPropagation()}
          onChange={e => onChange(field.id, e.target.value)} />
      )}
      {isMine && !filled && field.type === 'date' && (
        <input type="date"
          className="absolute inset-0 w-full h-full opacity-0
                     focus:opacity-100 bg-white px-2 text-xs
                     border-none outline-none z-10"
          onClick={e => e.stopPropagation()}
          onChange={e => onChange(field.id, e.target.value)} />
      )}
      {isMine && field.type === 'checkbox' && (
        <input type="checkbox"
          className="absolute inset-0 w-full h-full opacity-0
                     cursor-pointer z-10"
          onClick={e => e.stopPropagation()}
          onChange={e => onChange(field.id, e.target.checked ? 'checked' : '')} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────────────────────────
function FieldProgress({ fields, signerIndex }) {
  const mine   = fields.filter(f => f.partyIndex === signerIndex);
  const filled = mine.filter(f => f.value);
  const pct    = mine.length
    ? Math.round((filled.length / mine.length) * 100)
    : 100;
  const done   = filled.length === mine.length;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5
                    bg-white dark:bg-slate-900
                    border-b border-slate-100 dark:border-slate-800">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100
                      dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500
            ${done ? 'bg-emerald-500' : 'bg-[#28ABDF]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-semibold whitespace-nowrap
        ${done
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-slate-500 dark:text-slate-400'}`}>
        {done ? '✓ All fields complete' : `${filled.length} / ${mine.length}`}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PDF Viewer
// ─────────────────────────────────────────────────────────────────
function PdfViewer({
  pdfUrl, fields, signerIndex,
  onFieldClick, onFieldChange,
  currentPage, onPageChange, totalPages,
}) {
  const containerRef = useRef(null);
  const [loaded,  setLoaded]  = useState(false);
  const [errored, setErrored] = useState(false);
  const [scale,   setScale]   = useState(1);

  const pageFields = fields.filter(f => (f.page || 1) === currentPage);

  const clamp = (delta) =>
    setScale(s => Math.min(2, Math.max(0.5,
      Math.round((s + delta) * 10) / 10,
    )));

  return (
    <div className="flex flex-col h-full">

      {/* Toolbar */}
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
                       dark:border-slate-700 flex items-center
                       justify-center text-slate-500 disabled:opacity-40
                       hover:border-[#28ABDF] hover:text-[#28ABDF]
                       transition-colors"
          >
            <Ic.ChevLeft />
          </button>
          <span className="text-sm font-medium text-slate-600
                           dark:text-slate-400 min-w-[72px] text-center">
            {currentPage} / {totalPages || '?'}
          </span>
          <button
            onClick={() => onPageChange(
              Math.min(totalPages || 999, currentPage + 1)
            )}
            disabled={currentPage >= (totalPages || 1)}
            className="h-8 w-8 rounded-lg border border-slate-200
                       dark:border-slate-700 flex items-center
                       justify-center text-slate-500 disabled:opacity-40
                       hover:border-[#28ABDF] hover:text-[#28ABDF]
                       transition-colors"
          >
            <Ic.ChevRight />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => clamp(-0.1)} disabled={scale <= 0.5}
            className="h-8 w-8 rounded-lg border border-slate-200
                       dark:border-slate-700 flex items-center
                       justify-center text-slate-500 disabled:opacity-40
                       hover:border-[#28ABDF] hover:text-[#28ABDF]
                       transition-colors"
          >
            <Ic.ZoomOut />
          </button>
          <button
            onClick={() => setScale(1)}
            className="text-xs text-slate-500 font-medium w-12
                       text-center hover:text-slate-700 transition-colors"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={() => clamp(0.1)} disabled={scale >= 2}
            className="h-8 w-8 rounded-lg border border-slate-200
                       dark:border-slate-700 flex items-center
                       justify-center text-slate-500 disabled:opacity-40
                       hover:border-[#28ABDF] hover:text-[#28ABDF]
                       transition-colors"
          >
            <Ic.ZoomIn />
          </button>
        </div>

        {/* Field count */}
        <span className="hidden sm:block text-xs text-slate-400 font-medium">
          {pageFields.filter(f => f.partyIndex === signerIndex).length} field
          {pageFields.filter(f => f.partyIndex === signerIndex).length !== 1
            ? 's' : ''} on page
        </span>
      </div>

      {/* PDF + overlays */}
      <div className="flex-1 overflow-auto bg-slate-200
                      dark:bg-slate-950 p-4 sm:p-6">
        {errored ? (
          <div className="flex flex-col items-center justify-center
                          h-full gap-3 text-slate-500">
            <Ic.Warning cls="w-10 h-10 text-red-400" />
            <p className="font-medium">Failed to load PDF</p>
            <button
              onClick={() => setErrored(false)}
              className="px-4 py-2 rounded-xl border border-slate-200
                         text-sm font-medium hover:bg-slate-50
                         transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative mx-auto bg-white shadow-2xl
                       shadow-black/20 rounded-sm"
            style={{
              width:    `${Math.min(100, scale * 100)}%`,
              maxWidth: `${scale * 860}px`,
            }}
          >
            {/* Skeleton */}
            {!loaded && (
              <div className="absolute inset-0 bg-white animate-pulse
                              flex items-center justify-center
                              min-h-[600px] rounded-sm">
                <Ic.Spinner cls="w-8 h-8 text-slate-300" />
              </div>
            )}

            <iframe
              src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0`}
              className="w-full border-0 block"
              style={{ height: `${scale * 1100}px`, minHeight: '500px' }}
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
              title="Template document"
            />

            {/* Overlays */}
            {loaded && pageFields.map(field => (
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
// MAIN
// ─────────────────────────────────────────────────────────────────
export default function TemplateSigner() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const { toast, show: showToast } = useToast();

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
  const [isBoss,      setIsBoss]      = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useDocumentTitle(
    docInfo
      ? `Sign: ${docInfo.title} — NeXsign`
      : 'Sign Template — NeXsign'
  );

  // ── Validate token ─────────────────────────────────────────
  useEffect(() => {
    if (!token) { setErrorMsg('No token provided.'); setPhase('error'); return; }
    const ctrl = new AbortController();

    (async () => {
      try {
        const res = await api.get(
          `/templates/sign/${token}`,
          { signal: ctrl.signal, noCache: true }
        );
        if (!mountedRef.current) return;

        const { template, signer, signerType } = res.data;
        setDocInfo(template);
        setSignerInfo(signer);
        setIsBoss(signerType === 'boss');
        setFields(
          (template.fields || []).map(f => ({ ...f, value: f.value || '' }))
        );
        setTotalPages(template.totalPages || 1);
        setPdfUrl(
          `${import.meta.env.VITE_API_URL || ''}/templates/sign/${token}/pdf`
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
          : status === 403 ? 'not_your_turn'
          : 'error'
        );
      }
    })();

    return () => ctrl.abort();
  }, [token]);

  // ── Field handlers ──────────────────────────────────────────
  const signerIndex = useMemo(() => {
    if (!signerInfo || !docInfo) return 0;
    return isBoss ? 0 : 1;
  }, [signerInfo, docInfo, isBoss]);

  const handleFieldClick = useCallback((field) => {
    if (field.partyIndex !== signerIndex) {
      showToast('This field belongs to another signer.', 'error');
      return;
    }
    if (field.type === 'signature' || field.type === 'initials') {
      setActiveField(field);
      setShowModal(true);
    }
  }, [signerIndex, showToast]);

  const handleFieldChange = useCallback((id, val) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, value: val } : f));
  }, []);

  const onSignatureAccept = useCallback((dataUrl) => {
    if (activeField) {
      handleFieldChange(activeField.id, dataUrl);
      setShowModal(false);
      setActiveField(null);
      showToast('Signature applied!', 'success');
    }
  }, [activeField, handleFieldChange, showToast]);

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const mine    = fields.filter(f => f.partyIndex === signerIndex);
    const missing = mine.filter(f => f.required && !f.value);

    if (missing.length) {
      showToast(
        `Complete ${missing.length} required field${missing.length > 1 ? 's' : ''}.`,
        'error'
      );
      if (missing[0].page) setCurrentPage(missing[0].page);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/templates/sign/submit', { token, fields });
      if (!mountedRef.current) return;

      const { allCompleted, nextStep } = res.data;
      setPhase(
        allCompleted ? 'completed'
        : isBoss      ? 'boss_done'
                      : 'signed'
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to submit. Please try again.',
        'error'
      );
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [fields, signerIndex, token, isBoss, showToast]);

  // ── My fields summary ───────────────────────────────────────
  const myFields    = fields.filter(f => f.partyIndex === signerIndex);
  const filledCount = myFields.filter(f => f.value).length;
  const allFilled   = filledCount === myFields.length && myFields.length > 0;

  // ─────────────────────────────────────────────────────────
  // Phase screens
  // ─────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center
                      justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="w-14 h-14 bg-[#28ABDF]/10 rounded-2xl
                        flex items-center justify-center">
          <Ic.Spinner cls="w-7 h-7 text-[#28ABDF]" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
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
        icon={Ic.XCircle} iconCls="text-red-500"
        bgCls="bg-red-100 dark:bg-red-900/30"
        title="Invalid Link" message={errorMsg}
      >
        <button
          onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white
                     dark:text-slate-900 text-white font-semibold
                     transition-colors hover:opacity-90"
        >
          Return Home
        </button>
      </StatusScreen>
    );
  }

  if (phase === 'not_your_turn') {
    return (
      <StatusScreen
        icon={Ic.Warning} iconCls="text-amber-500"
        bgCls="bg-amber-100 dark:bg-amber-900/30"
        title="Not Your Turn Yet"
        message="The previous signer hasn't completed their signature yet. You'll receive an email when it's your turn."
      >
        <button
          onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white
                     dark:text-slate-900 text-white font-semibold
                     transition-colors hover:opacity-90"
        >
          Got It
        </button>
      </StatusScreen>
    );
  }

  if (phase === 'already_signed') {
    return (
      <StatusScreen
        icon={Ic.CheckCircle} iconCls="text-emerald-500"
        bgCls="bg-emerald-100 dark:bg-emerald-900/30"
        title="Already Signed"
        message="You have already signed this document. No further action is needed."
      >
        <button
          onClick={() => navigate('/')}
          className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white
                     dark:text-slate-900 text-white font-semibold
                     transition-colors hover:opacity-90"
        >
          Visit NeXsign
        </button>
      </StatusScreen>
    );
  }

  if (phase === 'boss_done') {
    return (
      <StatusScreen
        icon={Ic.ShieldCheck} iconCls="text-emerald-500"
        bgCls="bg-emerald-100 dark:bg-emerald-900/30"
        title="Authorisation Complete!"
        message={`Thank you! Your signature has been applied to "${docInfo?.title}". All ${docInfo?.employees?.length || ''} employees have been notified and will receive their individual copy to sign.`}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl
                          bg-sky-50 dark:bg-sky-900/20
                          border border-sky-100 dark:border-sky-800/50">
            <Ic.Crown cls="w-4 h-4 text-sky-500 shrink-0" />
            <p className="text-xs text-sky-700 dark:text-sky-400 text-left">
              Employees will sign their individual copies simultaneously.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-[#28ABDF]
                       hover:bg-sky-600 text-white font-semibold
                       transition-colors"
          >
            Done
          </button>
        </div>
      </StatusScreen>
    );
  }

  if (phase === 'signed') {
    return (
      <StatusScreen
        icon={Ic.CheckCircle} iconCls="text-emerald-500"
        bgCls="bg-emerald-100 dark:bg-emerald-900/30"
        title="Signature Submitted!"
        message={`Thank you! Your signature on "${docInfo?.title}" has been recorded successfully.`}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl
                          bg-emerald-50 dark:bg-emerald-900/20
                          border border-emerald-100
                          dark:border-emerald-800/50">
            <Ic.Check cls="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700
                           dark:text-emerald-400 text-left">
              A signed copy will be emailed to{' '}
              <strong>{signerInfo?.email}</strong> once all parties complete.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-[#28ABDF]
                       hover:bg-sky-600 text-white font-semibold
                       transition-colors"
          >
            Done
          </button>
        </div>
      </StatusScreen>
    );
  }

  if (phase === 'completed') {
    return (
      <StatusScreen
        icon={Ic.ShieldCheck} iconCls="text-emerald-500"
        bgCls="bg-emerald-100 dark:bg-emerald-900/30"
        title="Document Fully Signed!"
        message={`All parties have signed "${docInfo?.title}". Completed copies with audit trail have been sent to everyone.`}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl
                          bg-emerald-50 dark:bg-emerald-900/20
                          border border-emerald-100
                          dark:border-emerald-800/50">
            <Ic.Check cls="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700
                           dark:text-emerald-400 text-left">
              A signed copy has been sent to{' '}
              <strong>{signerInfo?.email}</strong>
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full h-11 rounded-xl bg-[#28ABDF]
                       hover:bg-sky-600 text-white font-semibold
                       transition-colors"
          >
            Done
          </button>
        </div>
      </StatusScreen>
    );
  }

  // ─────────────────────────────────────────────────────────
  // READY — main signing UI
  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-100
                    dark:bg-slate-950 overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3
                         rounded-xl shadow-xl text-sm font-semibold
                         text-white transition-all
                         ${toast.type === 'error'
                           ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header className="h-14 sm:h-16 bg-white dark:bg-slate-900
                         border-b border-slate-200 dark:border-slate-800
                         flex items-center justify-between
                         px-4 sm:px-6 gap-4 z-40 shrink-0">

        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-[#28ABDF] rounded-xl
                          flex items-center justify-center shrink-0">
            <Ic.Lock cls="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900
                             dark:text-white truncate max-w-[160px]
                             sm:max-w-xs">
                {docInfo?.title}
              </h1>
              {isBoss && (
                <span className="hidden sm:flex items-center gap-1
                                 text-[10px] font-bold px-2 py-0.5
                                 rounded-full bg-purple-100
                                 dark:bg-purple-900/40
                                 text-purple-700 dark:text-purple-400">
                  <Ic.Crown cls="w-2.5 h-2.5" />
                  Authoriser
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {signerInfo?.name} · {signerInfo?.email}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-700
                           dark:text-slate-300">
              {signerInfo?.name}
            </p>
            <p className="text-[10px] text-slate-400">
              {isBoss ? 'Authoriser' : 'Signer'}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`h-9 sm:h-10 px-4 sm:px-5 rounded-xl
                        font-semibold text-sm gap-1.5 flex items-center
                        transition-all hover:-translate-y-0.5
                        active:translate-y-0 shadow-md
                        disabled:opacity-60 disabled:cursor-not-allowed
                        disabled:hover:translate-y-0
              ${allFilled
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-400/30'
                : 'bg-[#28ABDF] hover:bg-sky-600 text-white shadow-sky-400/25'}`}
          >
            {submitting
              ? <Ic.Spinner cls="w-4 h-4" />
              : <Ic.Send cls="w-3.5 h-3.5" />
            }
            <span className="hidden sm:inline">
              {submitting
                ? 'Submitting…'
                : isBoss
                  ? 'Authorise & Send'
                  : 'Finish Signing'
              }
            </span>
          </button>
        </div>
      </header>

      {/* Progress */}
      <FieldProgress fields={fields} signerIndex={signerIndex} />

      {/* Boss notice */}
      {isBoss && (
        <div className="bg-purple-50 dark:bg-purple-900/20
                        border-b border-purple-100 dark:border-purple-800/50
                        px-4 py-2 flex items-center gap-2">
          <Ic.Crown cls="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <p className="text-xs text-purple-700 dark:text-purple-400
                         font-medium">
            After you sign, all{' '}
            <span className="font-bold">
              {docInfo?.employees?.length || 0}
            </span>{' '}
            employees will receive their copy simultaneously.
          </p>
        </div>
      )}

      {/* PDF Viewer */}
      <main className="flex-1 min-h-0">
        <PdfViewer
          pdfUrl={pdfUrl}
          fields={fields}
          signerIndex={signerIndex}
          onFieldClick={handleFieldClick}
          onFieldChange={handleFieldChange}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </main>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showModal}
        fieldType={activeField?.type}
        onClose={() => { setShowModal(false); setActiveField(null); }}
        onAccept={onSignatureAccept}
      />
    </div>
  );
}