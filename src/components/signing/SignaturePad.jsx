
// import React, { useRef, useState, useEffect, useCallback } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { Eraser, Check, Type as TypeIcon, PenTool } from 'lucide-react';

// // ─── FONT OPTIONS for typed signatures ──────────────────────────────────────
// const FONT_OPTIONS = [
//   { label: 'Classic Serif',   value: '"Times New Roman", Georgia, serif' },
//   { label: 'Cursive Script',  value: '"Brush Script MT", "Dancing Script", cursive' },
//   { label: 'Modern Sans',     value: '"Helvetica Neue", Arial, sans-serif' },
//   { label: 'Monospace',       value: '"Courier New", Courier, monospace' },
// ];

// export default function SignaturePad({ onSignatureComplete }) {
//   const canvasRef   = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [hasDrawn,  setHasDrawn]  = useState(false);
//   const [typedSig,  setTypedSig]  = useState('');
//   const [mode,      setMode]      = useState('draw');
//   const [fontIndex, setFontIndex] = useState(0); // for typed mode

//   // ── Canvas setup — TRANSPARENT background ───────────────────────────────
//   const initCanvas = useCallback(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const dpr  = window.devicePixelRatio || 1;
//     const rect = canvas.getBoundingClientRect();

//     // Physical pixel size
//     canvas.width  = rect.width  * dpr;
//     canvas.height = rect.height * dpr;

//     const ctx = canvas.getContext('2d');
//     ctx.scale(dpr, dpr);

//     // ✅ DO NOT fill background — leave transparent
//     ctx.strokeStyle = '#1a1a1a';
//     ctx.lineWidth   = 2.2;
//     ctx.lineCap     = 'round';
//     ctx.lineJoin    = 'round';
//   }, []);

//   useEffect(() => {
//     if (mode === 'draw') {
//       // Small delay to let the DOM render
//       setTimeout(initCanvas, 50);
//     }
//   }, [mode, initCanvas]);

//   // ── Pointer position helper ──────────────────────────────────────────────
//   const getPos = useCallback((e) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return { x: 0, y: 0 };
//     const rect   = canvas.getBoundingClientRect();
//     const src    = e.touches ? e.touches[0] : e;
//     return {
//       x: src.clientX - rect.left,
//       y: src.clientY - rect.top,
//     };
//   }, []);

//   const startDraw = useCallback((e) => {
//     e.preventDefault();
//     const pos = getPos(e);
//     const ctx = canvasRef.current?.getContext('2d');
//     if (!ctx) return;
//     ctx.beginPath();
//     ctx.moveTo(pos.x, pos.y);
//     setIsDrawing(true);
//   }, [getPos]);

//   const draw = useCallback((e) => {
//     e.preventDefault();
//     if (!isDrawing) return;
//     const pos = getPos(e);
//     const ctx = canvasRef.current?.getContext('2d');
//     if (!ctx) return;
//     ctx.lineTo(pos.x, pos.y);
//     ctx.stroke();
//     setHasDrawn(true);
//   }, [isDrawing, getPos]);

//   const endDraw = useCallback((e) => {
//     e?.preventDefault();
//     setIsDrawing(false);
//   }, []);

//   const clearCanvas = useCallback(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     // ✅ clearRect preserves transparency (no fillRect white)
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     setHasDrawn(false);
//   }, []);

//   // ── Confirm — always export as transparent PNG ───────────────────────────
//   const handleConfirm = useCallback(() => {
//     let finalValue = '';

//     if (mode === 'draw') {
//       if (!hasDrawn) return;
//       const canvas = canvasRef.current;
//       if (!canvas) return;

//       // ✅ KEY FIX: toDataURL on a canvas that was NEVER filled = transparent PNG
//       // No white background, no fillRect, clean alpha channel.
//       finalValue = canvas.toDataURL('image/png');

//     } else {
//       // Typed signature — render on a transparent canvas
//       if (!typedSig.trim()) return;

//       const canvas = document.createElement('canvas');
//       canvas.width  = 900;
//       canvas.height = 220;
//       const ctx = canvas.getContext('2d');

//       // ✅ DO NOT call fillRect — canvas starts transparent
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       const font = FONT_OPTIONS[fontIndex]?.value || FONT_OPTIONS[0].value;
//       ctx.fillStyle    = '#1a1a1a';
//       ctx.font         = `italic 90px ${font}`;
//       ctx.textAlign    = 'center';
//       ctx.textBaseline = 'middle';
//       ctx.fillText(typedSig.trim(), 450, 110);

//       finalValue = canvas.toDataURL('image/png');
//     }

//     onSignatureComplete(finalValue);
//   }, [mode, hasDrawn, typedSig, fontIndex, onSignatureComplete]);

//   const canConfirm = mode === 'draw' ? hasDrawn : typedSig.trim().length > 0;

//   return (
//     <div className="space-y-5">
//       <Tabs value={mode} onValueChange={(v) => { setMode(v); setHasDrawn(false); setTypedSig(''); }} className="w-full">
//         <TabsList className="grid grid-cols-2 w-full bg-slate-100 rounded-xl p-1">
//           <TabsTrigger value="draw" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold">
//             <PenTool className="w-4 h-4" /> Draw
//           </TabsTrigger>
//           <TabsTrigger value="type" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold">
//             <TypeIcon className="w-4 h-4" /> Type
//           </TabsTrigger>
//         </TabsList>

//         {/* ── DRAW TAB ── */}
//         <TabsContent value="draw" className="mt-4 outline-none">
//           {/* ✅ Canvas wrapper: NO bg-white class — must be transparent */}
//           <div className="relative border-2 border-slate-200 rounded-2xl overflow-hidden shadow-inner hover:border-sky-300 transition-colors"
//                style={{ background: 'repeating-linear-gradient(45deg,#f8fafc 0,#f8fafc 10px,#f0f4f8 10px,#f0f4f8 20px)' }}>
//             <canvas
//               ref={canvasRef}
//               // ✅ NO bg-white here — CSS background is decorative only (not captured)
//               className="w-full h-44 cursor-crosshair touch-none block"
//               style={{ background: 'transparent' }}
//               onMouseDown={startDraw}
//               onMouseMove={draw}
//               onMouseUp={endDraw}
//               onMouseLeave={endDraw}
//               onTouchStart={startDraw}
//               onTouchMove={draw}
//               onTouchEnd={endDraw}
//             />
//             {!hasDrawn && (
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                 <p className="text-slate-300 text-sm font-medium select-none">Draw your signature here</p>
//               </div>
//             )}
//           </div>
//           <div className="flex justify-between items-center mt-3">
//             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
//               Sign inside the box above
//             </p>
//             <Button variant="ghost" size="sm" onClick={clearCanvas}
//               className="text-rose-500 hover:bg-rose-50 rounded-lg gap-1.5">
//               <Eraser className="w-3.5 h-3.5" /> Clear
//             </Button>
//           </div>
//         </TabsContent>

//         {/* ── TYPE TAB ── */}
//         <TabsContent value="type" className="mt-4 outline-none space-y-3">
//           {/* Font selector */}
//           <div className="flex gap-2 flex-wrap">
//             {FONT_OPTIONS.map((f, i) => (
//               <button
//                 key={i}
//                 onClick={() => setFontIndex(i)}
//                 className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
//                   fontIndex === i
//                     ? 'border-sky-500 bg-sky-50 text-sky-700'
//                     : 'border-slate-200 text-slate-500 hover:border-slate-300'
//                 }`}
//                 style={{ fontFamily: f.value }}
//               >
//                 {f.label}
//               </button>
//             ))}
//           </div>

//           {/* Typed preview */}
//           <div className="relative border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-sky-300 transition-colors"
//                style={{ background: 'repeating-linear-gradient(45deg,#f8fafc 0,#f8fafc 10px,#f0f4f8 10px,#f0f4f8 20px)' }}>
//             <Input
//               value={typedSig}
//               onChange={e => setTypedSig(e.target.value)}
//               placeholder="Type your full name..."
//               className="h-24 text-3xl sm:text-4xl text-center border-none bg-transparent focus-visible:ring-0 font-medium"
//               style={{ fontFamily: FONT_OPTIONS[fontIndex]?.value, fontStyle: 'italic' }}
//             />
//           </div>
//           {typedSig && (
//             <p className="text-[10px] text-slate-400 text-right italic">
//               Preview — will be rendered in {FONT_OPTIONS[fontIndex]?.label}
//             </p>
//           )}
//         </TabsContent>
//       </Tabs>

//       <Button
//         onClick={handleConfirm}
//         disabled={!canConfirm}
//         className="w-full h-13 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl shadow-lg font-bold text-base transition-all active:scale-[0.98] disabled:opacity-40 py-3"
//       >
//         <Check className="w-5 h-5 mr-2" /> Use This Signature
//       </Button>
//     </div>
//   );
// }
// src/components/signing/SignaturePad.jsx
// src/components/signing/SignaturePad.jsx
import React, {
  useRef, useState, useCallback,
  useEffect, useMemo,
} from 'react';
import {
  Trash2, Check, PenTool, Type,
  Upload, ChevronDown, X,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

// ─── Signature fonts ──────────────────────────────────────────────
const SIG_FONTS = [
  { label: 'Cursive',    value: "'Brush Script MT', 'Dancing Script', cursive" },
  { label: 'Elegant',    value: "'Great Vibes', 'Pacifico', cursive"            },
  { label: 'Classic',    value: "'Times New Roman', Georgia, serif"             },
  { label: 'Modern',     value: "'Arial', 'Helvetica', sans-serif"             },
  { label: 'Monospace',  value: "'Courier New', monospace"                      },
];

// ─── Ink colors ───────────────────────────────────────────────────
const INK_COLORS = [
  { label: 'Black',      value: '#1a202c' },
  { label: 'Dark Blue',  value: '#1e3a5f' },
  { label: 'Blue',       value: '#2563eb' },
  { label: 'Dark Green', value: '#14532d' },
];

// ─── Btn primitive ────────────────────────────────────────────────
const Btn = ({ children, onClick, disabled, variant = 'primary', className, type = 'button' }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-[0.97] select-none';
  const variants = {
    primary:  'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white disabled:opacity-40 disabled:cursor-not-allowed',
    outline:  'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed',
    ghost:    'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
    success:  'bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </button>
  );
};

// ─── Tab button ───────────────────────────────────────────────────
const Tab = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl',
      'text-xs font-black uppercase tracking-wider transition-all duration-150',
      active
        ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
        : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-400',
    )}
  >
    <Icon size={13} />
    {label}
  </button>
);

// ════════════════════════════════════════════════════════════════
// DRAW TAB
// ════════════════════════════════════════════════════════════════
function DrawTab({ onConfirm, inkColor }) {
  const canvasRef    = useRef(null);
  const wrapRef      = useRef(null);
  const isDrawing    = useRef(false);
  const lastPos      = useRef({ x: 0, y: 0 });
  const lastTime     = useRef(0);
  const strokeCount  = useRef(0);
  const points       = useRef([]);

  const [isEmpty, setIsEmpty] = useState(true);

  // ── Setup canvas ───────────────────────────────────────────
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = window.devicePixelRatio || 1;
    const w   = wrap.clientWidth;
    const h   = 160;

    canvas.width        = w * dpr;
    canvas.height       = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    strokeCount.current = 0;
    setIsEmpty(true);
  }, []);

  useEffect(() => { setupCanvas(); }, [setupCanvas]);

  useEffect(() => {
    const obs = new ResizeObserver(setupCanvas);
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [setupCanvas]);

  // ── Get pos ────────────────────────────────────────────────
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect   = canvas.getBoundingClientRect();
    const src    = e.touches?.[0] || e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  }, []);

  // ── Draw ───────────────────────────────────────────────────
  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastTime.current  = Date.now();
    const pos = getPos(e);
    lastPos.current   = pos;
    points.current    = [pos];

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e) => {
    if (!isDrawing.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!ctx) return;

    const now = Date.now();
    const pos = getPos(e);
    points.current.push(pos);

    // Pressure simulation via speed
    const dx    = pos.x - lastPos.current.x;
    const dy    = pos.y - lastPos.current.y;
    const dist  = Math.sqrt(dx * dx + dy * dy);
    const dt    = Math.max(now - lastTime.current, 1);
    const speed = dist / dt;
    const width = Math.max(0.8, Math.min(3.5, 3.5 - speed * 0.6));

    ctx.strokeStyle = inkColor;
    ctx.lineWidth   = width;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    // Smooth bezier via midpoints
    const pts = points.current;
    if (pts.length >= 3) {
      const prev = pts[pts.length - 3];
      const mid1 = pts[pts.length - 2];
      const cur  = pts[pts.length - 1];
      const cp1  = { x: (prev.x + mid1.x) / 2, y: (prev.y + mid1.y) / 2 };
      const cp2  = { x: (mid1.x + cur.x)  / 2, y: (mid1.y + cur.y)  / 2 };
      ctx.beginPath();
      ctx.moveTo(cp1.x, cp1.y);
      ctx.quadraticCurveTo(mid1.x, mid1.y, cp2.x, cp2.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    lastPos.current  = pos;
    lastTime.current = now;
    strokeCount.current++;
    if (isEmpty) setIsEmpty(false);
  }, [getPos, inkColor, isEmpty]);

  const endDraw = useCallback((e) => {
    e?.preventDefault();
    isDrawing.current = false;
    points.current    = [];
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    strokeCount.current = 0;
    points.current      = [];
    setIsEmpty(true);
  };

  const handleConfirm = () => {
    if (isEmpty) return;
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    if (dataUrl) onConfirm(dataUrl);
  };

  return (
    <div className="space-y-3">
      {/* Canvas wrap */}
      <div
        ref={wrapRef}
        className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"
        style={{ touchAction: 'none', minHeight: 160 }}
      >
        {/* Baseline */}
        <div className="absolute bottom-10 left-5 right-5 h-px bg-slate-100 dark:bg-slate-800 pointer-events-none" />

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="block cursor-crosshair w-full"
          style={{ touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />

        {/* Placeholder */}
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <PenTool size={24} className="text-slate-200 dark:text-slate-700" />
            <p className="text-sm text-slate-300 dark:text-slate-600 font-medium">
              Draw your signature here
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Btn
          variant="outline"
          onClick={handleClear}
          disabled={isEmpty}
          className="flex-1 h-10 text-sm"
        >
          <Trash2 size={14} /> Clear
        </Btn>
        <Btn
          variant="success"
          onClick={handleConfirm}
          disabled={isEmpty}
          className="flex-1 h-10 text-sm"
        >
          <Check size={14} /> Apply
        </Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TYPE TAB
// ════════════════════════════════════════════════════════════════
function TypeTab({ onConfirm, inkColor }) {
  const canvasRef   = useRef(null);
  const [text,      setText]      = useState('');
  const [fontIdx,   setFontIdx]   = useState(0);
  const [showFonts, setShowFonts] = useState(false);

  const selectedFont = SIG_FONTS[fontIdx];

  const handleConfirm = useCallback(() => {
    if (!text.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Auto-size font
    const maxW    = canvas.width - 40;
    let   fSize   = 52;
    ctx.font      = `italic ${fSize}px ${selectedFont.value}`;
    while (ctx.measureText(text).width > maxW && fSize > 20) {
      fSize -= 2;
      ctx.font = `italic ${fSize}px ${selectedFont.value}`;
    }

    ctx.fillStyle    = inkColor;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    onConfirm(canvas.toDataURL('image/png'));
  }, [text, selectedFont, inkColor, onConfirm]);

  return (
    <div className="space-y-3">
      {/* Text input */}
      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleConfirm()}
          placeholder="Type your full name…"
          autoFocus
          className={cn(
            'w-full h-14 px-4 rounded-2xl border-2 outline-none',
            'bg-white dark:bg-slate-900',
            'border-slate-200 dark:border-slate-700',
            'focus:border-sky-400 dark:focus:border-sky-500',
            'focus:ring-4 focus:ring-sky-400/10',
            'transition-all text-2xl text-slate-800 dark:text-white',
            'placeholder:text-slate-300 dark:placeholder:text-slate-600',
          )}
          style={{ fontFamily: selectedFont.value, fontStyle: 'italic' }}
        />
        {text && (
          <button
            type="button"
            onClick={() => setText('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Font picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowFonts(o => !o)}
          className="w-full flex items-center justify-between px-4 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm transition-colors hover:border-slate-300 dark:hover:border-slate-600"
        >
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Font:</span>
          <span
            className="text-slate-800 dark:text-slate-200"
            style={{ fontFamily: selectedFont.value, fontStyle: 'italic' }}
          >
            {selectedFont.label}
          </span>
          <ChevronDown
            size={14}
            className={cn('text-slate-400 transition-transform', showFonts && 'rotate-180')}
          />
        </button>

        {showFonts && (
          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
            {SIG_FONTS.map((f, i) => (
              <button
                key={f.value}
                type="button"
                onClick={() => { setFontIdx(i); setShowFonts(false); }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 text-sm transition-colors',
                  i === fontIdx
                    ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                )}
              >
                <span className="text-xs font-bold text-slate-400">{f.label}</span>
                <span style={{ fontFamily: f.value, fontStyle: 'italic', fontSize: 20 }}>
                  {text || 'Preview'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      {text && (
        <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900/50 min-h-[90px] flex items-center justify-center overflow-hidden">
          <div className="absolute bottom-4 left-6 right-6 h-px bg-slate-100 dark:bg-slate-800" />
          <span
            className="select-none z-10"
            style={{
              fontFamily: selectedFont.value,
              fontStyle:  'italic',
              fontSize:   clamp(text.length),
              color:      inkColor,
            }}
          >
            {text}
          </span>
        </div>
      )}

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} width={520} height={180} className="hidden" />

      <Btn
        variant="success"
        onClick={handleConfirm}
        disabled={!text.trim()}
        className="w-full h-10 text-sm"
      >
        <Check size={14} /> Apply Signature
      </Btn>
    </div>
  );
}

// font size clamp for preview
const clamp = (len) => {
  if (len <= 6)  return 44;
  if (len <= 12) return 36;
  if (len <= 20) return 28;
  return 22;
};

// ════════════════════════════════════════════════════════════════
// UPLOAD TAB
// ════════════════════════════════════════════════════════════════
function UploadTab({ onConfirm }) {
  const inputRef  = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={cn(
          'flex flex-col items-center justify-center gap-3',
          'rounded-2xl border-2 border-dashed cursor-pointer',
          'transition-all duration-200 py-8',
          dragging
            ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/30 dark:hover:bg-sky-900/10 bg-white dark:bg-slate-900/50',
        )}
      >
        <div className={cn(
          'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors',
          dragging ? 'bg-sky-100 dark:bg-sky-900/40' : 'bg-slate-100 dark:bg-slate-800',
        )}>
          <Upload size={20} className={dragging ? 'text-sky-500' : 'text-slate-400'} />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {dragging ? 'Drop image here' : 'Click or drag to upload'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, SVG (transparent bg recommended)</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => processFile(e.target.files[0])}
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          {/* Checkerboard bg for transparency */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%)',
              backgroundSize:  '16px 16px',
            }}
          />
          <img
            src={preview}
            alt="Signature preview"
            className="relative z-10 w-full h-28 object-contain p-3"
          />
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 z-20 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      )}

      <Btn
        variant="success"
        onClick={() => preview && onConfirm(preview)}
        disabled={!preview}
        className="w-full h-10 text-sm"
      >
        <Check size={14} /> Use This Signature
      </Btn>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'draw',   label: 'Draw',   icon: PenTool },
  { id: 'type',   label: 'Type',   icon: Type    },
  { id: 'upload', label: 'Upload', icon: Upload  },
];

export default function SignaturePad({ onSignatureComplete, partyName, partyColor }) {
  const [activeTab, setActiveTab] = useState('draw');
  const [inkColor,  setInkColor]  = useState('#1a202c');

  const handleConfirm = useCallback((dataUrl) => {
    onSignatureComplete?.(dataUrl);
  }, [onSignatureComplete]);

  return (
    <div className="space-y-4">

      {/* ── Header ───────────────────────────────────────── */}
      {partyName && (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: partyColor || '#0ea5e9' }}
          />
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Signing as{' '}
            <span className="text-slate-900 dark:text-white">{partyName}</span>
          </span>
        </div>
      )}

      {/* ── Tab selector ─────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
        {TABS.map(t => (
          <Tab
            key={t.id}
            active={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            icon={t.icon}
            label={t.label}
          />
        ))}
      </div>

      {/* ── Ink color ─────────────────────────────────────── */}
      {activeTab !== 'upload' && (
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Ink:
          </span>
          <div className="flex gap-2">
            {INK_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => setInkColor(c.value)}
                className={cn(
                  'w-6 h-6 rounded-full border-2 transition-transform',
                  inkColor === c.value
                    ? 'border-sky-400 scale-125'
                    : 'border-transparent hover:scale-110',
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Tab content ──────────────────────────────────── */}
      {activeTab === 'draw'   && <DrawTab  onConfirm={handleConfirm} inkColor={inkColor} />}
      {activeTab === 'type'   && <TypeTab  onConfirm={handleConfirm} inkColor={inkColor} />}
      {activeTab === 'upload' && <UploadTab onConfirm={handleConfirm} />}
    </div>
  );
}