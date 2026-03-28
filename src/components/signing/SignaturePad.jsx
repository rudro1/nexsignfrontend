
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
import React, {
  useRef, useState, useEffect, useCallback,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs';
import { Check, Type as TypeIcon, PenTool, RotateCcw } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────
const FONT_OPTIONS = [
  { label: 'Classic', value: '"Times New Roman", Georgia, serif'   },
  { label: 'Script',  value: '"Brush Script MT", cursive'          },
  { label: 'Modern',  value: '"Helvetica Neue", Arial, sans-serif' },
  { label: 'Mono',    value: '"Courier New", Courier, monospace'   },
];
const PEN_COLORS = ['#1a1a1a', '#1d4ed8', '#7c3aed'];
const PEN_WIDTHS = [1.5, 2.5, 4];
const DPR        = () => Math.min(window.devicePixelRatio || 1, 2);

// ── Helpers ───────────────────────────────────────────────────────
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const src  = e.touches ? e.touches[0] : e;
  return {
    x: src.clientX - rect.left,
    y: src.clientY - rect.top,
  };
}

// ════════════════════════════════════════════════════════════════
export default function SignaturePad({ onSignatureComplete }) {
  const canvasRef   = useRef(null);
  const ctxRef      = useRef(null);   // cached 2d context
  const pointsRef   = useRef([]);
  const isDrawRef   = useRef(false);
  const colorRef    = useRef('#1a1a1a');
  const widthRef    = useRef(2.5);

  const [hasDrawn,  setHasDrawn]  = useState(false);
  const [typedSig,  setTypedSig]  = useState('');
  const [mode,      setMode]      = useState('draw');
  const [fontIndex, setFontIndex] = useState(0);
  const [penColor,  setPenColor]  = useState('#1a1a1a');
  const [penWidth,  setPenWidth]  = useState(2.5);

  // keep refs in sync so event handlers never close over stale values
  useEffect(() => { colorRef.current = penColor; }, [penColor]);
  useEffect(() => { widthRef.current = penWidth; }, [penWidth]);

  // ── Init / resize canvas ──────────────────────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr  = DPR();
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap               = 'round';
    ctx.lineJoin              = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (mode !== 'draw') return;
    // small delay so dialog animation finishes first
    const t = setTimeout(initCanvas, 60);
    return () => clearTimeout(t);
  }, [mode, initCanvas]);

  // ── Native touch handlers — passive:false ─────────────────
  // ✅ KEY FIX: React synthetic onTouch* cannot call preventDefault
  //    because React registers them as passive by default.
  //    We attach native listeners with { passive: false }.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode !== 'draw') return;

    const stroke = (pts, x, y) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth   = widthRef.current;
      pts.push({ x, y });
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (pts.length === 2) {
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        const prev = pts[pts.length - 2];
        const curr = pts[pts.length - 1];
        const m    = mid(prev, curr);
        ctx.quadraticCurveTo(prev.x, prev.y, m.x, m.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
      }
    };

    const onStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { x, y } = getPos(e, canvas);
      pointsRef.current = [];
      isDrawRef.current = true;
      stroke(pointsRef.current, x, y);
    };

    const onMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDrawRef.current) return;
      const { x, y } = getPos(e, canvas);
      stroke(pointsRef.current, x, y);
      setHasDrawn(true);
    };

    const onEnd = (e) => {
      e.preventDefault();
      if (!isDrawRef.current) return;
      const pts = pointsRef.current;
      if (pts.length > 0) {
        const ctx  = ctxRef.current;
        const last = pts[pts.length - 1];
        ctx?.lineTo(last.x, last.y);
        ctx?.stroke();
      }
      pointsRef.current = [];
      isDrawRef.current = false;
    };

    // ✅ passive: false — allows preventDefault to work
    const opts = { passive: false };
    canvas.addEventListener('touchstart',  onStart, opts);
    canvas.addEventListener('touchmove',   onMove,  opts);
    canvas.addEventListener('touchend',    onEnd,   opts);
    canvas.addEventListener('touchcancel', onEnd,   opts);

    return () => {
      canvas.removeEventListener('touchstart',  onStart);
      canvas.removeEventListener('touchmove',   onMove);
      canvas.removeEventListener('touchend',    onEnd);
      canvas.removeEventListener('touchcancel', onEnd);
    };
  }, [mode]); // re-attach only when mode changes

  // ── Mouse handlers (synthetic OK — no preventDefault needed) ──
  const onMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    if (!canvas || !ctx) return;
    const { x, y }    = getPos(e, canvas);
    pointsRef.current  = [{ x, y }];
    isDrawRef.current  = true;
    ctx.strokeStyle    = colorRef.current;
    ctx.lineWidth      = widthRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDrawRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    if (!canvas || !ctx) return;
    const { x, y } = getPos(e, canvas);
    const pts       = pointsRef.current;
    pts.push({ x, y });
    if (pts.length < 3) { ctx.lineTo(x, y); ctx.stroke(); }
    else {
      const prev = pts[pts.length - 2];
      const curr = pts[pts.length - 1];
      const m    = mid(prev, curr);
      ctx.quadraticCurveTo(prev.x, prev.y, m.x, m.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
    }
    setHasDrawn(true);
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isDrawRef.current) return;
    const pts = pointsRef.current;
    if (pts.length > 0) {
      const ctx  = ctxRef.current;
      const last = pts[pts.length - 1];
      ctx?.lineTo(last.x, last.y);
      ctx?.stroke();
    }
    pointsRef.current = [];
    isDrawRef.current = false;
  }, []);

  // ── Clear ─────────────────────────────────────────────────
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    if (!canvas || !ctx) return;
    const dpr = DPR();
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    pointsRef.current = [];
    isDrawRef.current = false;
    setHasDrawn(false);
  }, []);

  // ── Confirm ───────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (mode === 'draw') {
      if (!hasDrawn) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      onSignatureComplete(canvas.toDataURL('image/png'));
      return;
    }
    // typed
    const text = typedSig.trim();
    if (!text) return;
    const off = document.createElement('canvas');
    off.width  = 900;
    off.height = 200;
    const ctx  = off.getContext('2d');
    ctx.clearRect(0, 0, 900, 200);
    ctx.font         = `italic 80px ${FONT_OPTIONS[fontIndex].value}`;
    ctx.fillStyle    = penColor;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor   = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur    = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(text, 450, 100);
    onSignatureComplete(off.toDataURL('image/png'));
  }, [mode, hasDrawn, typedSig, fontIndex, penColor, onSignatureComplete]);

  const canConfirm = mode === 'draw'
    ? hasDrawn
    : typedSig.trim().length > 0;

  // ── Color / width setters (also update refs) ──────────────
  const handleColor = useCallback((c) => {
    colorRef.current = c;
    setPenColor(c);
  }, []);

  const handleWidth = useCallback((w) => {
    widthRef.current = w;
    setPenWidth(w);
  }, []);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v);
          setHasDrawn(false);
          setTypedSig('');
          isDrawRef.current  = false;
          pointsRef.current  = [];
        }}
      >
        <TabsList className="grid grid-cols-2 w-full
                             bg-slate-100 rounded-xl p-1 h-10">
          <TabsTrigger value="draw"
            className="rounded-lg gap-1.5 text-sm font-semibold
                       data-[state=active]:bg-white
                       data-[state=active]:shadow-sm">
            <PenTool className="w-4 h-4" /> Draw
          </TabsTrigger>
          <TabsTrigger value="type"
            className="rounded-lg gap-1.5 text-sm font-semibold
                       data-[state=active]:bg-white
                       data-[state=active]:shadow-sm">
            <TypeIcon className="w-4 h-4" /> Type
          </TabsTrigger>
        </TabsList>

        {/* ── DRAW ─────────────────────────────────────── */}
        <TabsContent value="draw" className="mt-4 outline-none">

          {/* Controls */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-1.5">
              {PEN_COLORS.map(c => (
                <button key={c} onClick={() => handleColor(c)}
                  className={`w-6 h-6 rounded-full border-2
                    transition-all
                    ${penColor === c
                      ? 'border-sky-400 scale-110'
                      : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-1.5 ml-auto">
              {PEN_WIDTHS.map(w => (
                <button key={w} onClick={() => handleWidth(w)}
                  className={`w-7 h-7 rounded-lg border
                    flex items-center justify-center transition-all
                    ${penWidth === w
                      ? 'border-sky-400 bg-sky-50'
                      : 'border-slate-200'}`}>
                  <div className="rounded-full bg-slate-700"
                    style={{
                      width:  `${Math.round(w * 2)}px`,
                      height: `${Math.round(w * 2)}px`,
                    }} />
                </button>
              ))}
            </div>
          </div>

          {/* Canvas container */}
          <div
            className="relative border-2 border-slate-200
                       rounded-2xl overflow-hidden shadow-inner
                       hover:border-sky-300 transition-colors
                       select-none"
            style={{
              background: 'repeating-linear-gradient(' +
                '45deg,#f8fafc 0,#f8fafc 10px,' +
                '#f0f4f8 10px,#f0f4f8 20px)',
              touchAction: 'none', // ✅ prevent page scroll
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair block"
              style={{
                height:      '160px',
                background:  'transparent',
                touchAction: 'none',  // ✅
                userSelect:  'none',
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              // ✅ NO onTouch* here — handled natively above
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center
                              justify-center pointer-events-none">
                <p className="text-slate-300 text-sm
                               font-medium select-none">
                  ✍️ Draw your signature here
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-2.5">
            <p className="text-[10px] text-slate-400 font-bold
                          uppercase tracking-widest">
              Sign inside the box
            </p>
            <Button variant="ghost" size="sm"
              onClick={clearCanvas} disabled={!hasDrawn}
              className="text-rose-500 hover:bg-rose-50
                         rounded-xl gap-1.5 h-8 px-3
                         disabled:opacity-40">
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </Button>
          </div>
        </TabsContent>

        {/* ── TYPE ─────────────────────────────────────── */}
        <TabsContent value="type" className="mt-4 outline-none space-y-3">
          <p className="text-[10px] font-bold text-slate-400
                        uppercase tracking-widest">
            Choose Font Style
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FONT_OPTIONS.map((f, i) => (
              <button key={i} onClick={() => setFontIndex(i)}
                className={`px-3 py-2.5 rounded-xl border-2
                  transition-all text-left
                  ${fontIndex === i
                    ? 'border-sky-400 bg-sky-50'
                    : 'border-slate-200 hover:border-slate-300'}`}
                style={{ fontFamily: f.value, fontStyle: 'italic' }}>
                <span className={`text-base ${
                  fontIndex === i
                    ? 'text-sky-700' : 'text-slate-700'}`}>
                  {typedSig || 'John Doe'}
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5
                              not-italic font-semibold
                              uppercase tracking-wider">
                  {f.label}
                </p>
              </button>
            ))}
          </div>

          <div className="relative border-2 border-slate-200
                         rounded-2xl overflow-hidden
                         hover:border-sky-300 transition-colors"
            style={{
              background: 'repeating-linear-gradient(' +
                '45deg,#f8fafc 0,#f8fafc 10px,' +
                '#f0f4f8 10px,#f0f4f8 20px)',
            }}>
            <Input
              value={typedSig}
              onChange={e => setTypedSig(e.target.value)}
              placeholder="Type your full name..."
              maxLength={50}
              className="h-20 text-3xl text-center border-none
                         bg-transparent focus-visible:ring-0"
              style={{
                fontFamily: FONT_OPTIONS[fontIndex].value,
                fontStyle:  'italic',
                color:      penColor,
              }}
              autoFocus
            />
          </div>

          {typedSig && (
            <p className="text-[10px] text-slate-400
                          text-center italic">
              Rendered in {FONT_OPTIONS[fontIndex].label} style
            </p>
          )}
        </TabsContent>
      </Tabs>

      <Button onClick={handleConfirm} disabled={!canConfirm}
        className="w-full h-12 bg-sky-500 hover:bg-sky-600
                   active:bg-sky-700 text-white rounded-2xl
                   shadow-lg shadow-sky-500/25 font-bold text-base
                   transition-all active:scale-[0.98]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   gap-2">
        <Check className="w-5 h-5" />
        Use This Signature
      </Button>
    </div>
  );
}