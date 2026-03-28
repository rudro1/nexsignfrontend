
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
import {
  Eraser, Check, Type as TypeIcon,
  PenTool, RotateCcw,
} from 'lucide-react';

// ── Font options for typed signatures ─────────────────────────────
const FONT_OPTIONS = [
  {
    label: 'Classic',
    value: '"Times New Roman", Georgia, serif',
    preview: 'Times',
  },
  {
    label: 'Script',
    value: '"Brush Script MT", cursive',
    preview: 'Script',
  },
  {
    label: 'Modern',
    value: '"Helvetica Neue", Arial, sans-serif',
    preview: 'Modern',
  },
  {
    label: 'Mono',
    value: '"Courier New", Courier, monospace',
    preview: 'Mono',
  },
];

// ── Stroke smoothing helper ───────────────────────────────────────
function midPoint(p1, p2) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

export default function SignaturePad({ onSignatureComplete }) {
  const canvasRef   = useRef(null);
  const pointsRef   = useRef([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn,  setHasDrawn]  = useState(false);
  const [typedSig,  setTypedSig]  = useState('');
  const [mode,      setMode]      = useState('draw');
  const [fontIndex, setFontIndex] = useState(0);
  const [penColor,  setPenColor]  = useState('#1a1a1a');
  const [penWidth,  setPenWidth]  = useState(2.5);

  // ── Init canvas (transparent background) ──────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();

    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Style
    ctx.strokeStyle = penColor;
    ctx.lineWidth   = penWidth;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }, [penColor, penWidth]);

  useEffect(() => {
    if (mode === 'draw') {
      const t = setTimeout(initCanvas, 50);
      return () => clearTimeout(t);
    }
  }, [mode, initCanvas]);

  // ── Get pointer position ──────────────────────────────────
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  }, []);

  // ── Draw with quadratic curves (smooth) ───────────────────
  const startDraw = useCallback((e) => {
    e.preventDefault();
    const pos = getPos(e);
    pointsRef.current = [pos];
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  }, [getPos]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const pos = getPos(e);
    const pts = pointsRef.current;
    pts.push(pos);

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || pts.length < 2) return;

    ctx.strokeStyle = penColor;
    ctx.lineWidth   = penWidth;

    if (pts.length === 2) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      // Smooth curve through points
      const prev = pts[pts.length - 2];
      const curr = pts[pts.length - 1];
      const mid  = midPoint(prev, curr);

      ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mid.x, mid.y);
    }

    setHasDrawn(true);
  }, [isDrawing, getPos, penColor, penWidth]);

  const endDraw = useCallback((e) => {
    e?.preventDefault();
    if (isDrawing) {
      // Finish the last segment
      const pts = pointsRef.current;
      if (pts.length >= 2) {
        const ctx = canvasRef.current?.getContext('2d');
        const last = pts[pts.length - 1];
        ctx?.lineTo(last.x, last.y);
        ctx?.stroke();
      }
      pointsRef.current = [];
    }
    setIsDrawing(false);
  }, [isDrawing]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.clearRect(
      0, 0,
      canvas.width  / dpr,
      canvas.height / dpr
    );
    pointsRef.current = [];
    setHasDrawn(false);
  }, []);

  // ── Confirm & export as transparent PNG ───────────────────
  const handleConfirm = useCallback(() => {
    let finalValue = '';

    if (mode === 'draw') {
      if (!hasDrawn) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      // ✅ Transparent PNG — no white background
      finalValue = canvas.toDataURL('image/png');

    } else {
      // Typed signature on transparent canvas
      if (!typedSig.trim()) return;

      const offscreen = document.createElement('canvas');
      offscreen.width  = 900;
      offscreen.height = 200;
      const ctx = offscreen.getContext('2d');

      // ✅ DO NOT fillRect — stays transparent
      ctx.clearRect(0, 0, 900, 200);

      const fontFamily = FONT_OPTIONS[fontIndex]?.value ||
                         FONT_OPTIONS[0].value;
      ctx.font         = `italic 80px ${fontFamily}`;
      ctx.fillStyle    = penColor;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      // Draw text with slight shadow for depth
      ctx.shadowColor   = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur    = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(typedSig.trim(), 450, 100);

      finalValue = offscreen.toDataURL('image/png');
    }

    onSignatureComplete(finalValue);
  }, [
    mode, hasDrawn, typedSig,
    fontIndex, penColor, onSignatureComplete,
  ]);

  const canConfirm = mode === 'draw'
    ? hasDrawn
    : typedSig.trim().length > 0;

  return (
    <div className="space-y-4">

      {/* Mode tabs */}
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v);
          setHasDrawn(false);
          setTypedSig('');
        }}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full
                             bg-slate-100 dark:bg-slate-800
                             rounded-xl p-1 h-10">
          <TabsTrigger
            value="draw"
            className="rounded-lg gap-2 text-sm font-semibold
                       data-[state=active]:bg-white
                       dark:data-[state=active]:bg-slate-700
                       data-[state=active]:shadow-sm"
          >
            <PenTool className="w-4 h-4" />
            Draw
          </TabsTrigger>
          <TabsTrigger
            value="type"
            className="rounded-lg gap-2 text-sm font-semibold
                       data-[state=active]:bg-white
                       dark:data-[state=active]:bg-slate-700
                       data-[state=active]:shadow-sm"
          >
            <TypeIcon className="w-4 h-4" />
            Type
          </TabsTrigger>
        </TabsList>

        {/* ── DRAW TAB ──────────────────────────────────── */}
        <TabsContent value="draw" className="mt-4 outline-none">

          {/* Pen options */}
          <div className="flex items-center gap-3 mb-3">
            {/* Color presets */}
            <div className="flex gap-1.5">
              {['#1a1a1a', '#1d4ed8', '#7c3aed'].map(c => (
                <button
                  key={c}
                  onClick={() => setPenColor(c)}
                  className={`w-6 h-6 rounded-full border-2
                               transition-all
                               ${penColor === c
                                 ? 'border-sky-400 scale-110'
                                 : 'border-transparent'
                               }`}
                  style={{ backgroundColor: c }}
                  title={`Use ${c}`}
                />
              ))}
            </div>

            {/* Pen width */}
            <div className="flex gap-1.5 ml-auto">
              {[1.5, 2.5, 4].map(w => (
                <button
                  key={w}
                  onClick={() => setPenWidth(w)}
                  className={`w-7 h-7 rounded-lg border
                               flex items-center justify-center
                               transition-all
                               ${penWidth === w
                                 ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20'
                                 : 'border-slate-200 dark:border-slate-700'
                               }`}
                  title={`Pen width ${w}`}
                >
                  <div
                    className="rounded-full bg-slate-700
                               dark:bg-slate-300"
                    style={{
                      width:  `${Math.round(w * 2)}px`,
                      height: `${Math.round(w * 2)}px`,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div
            className="relative border-2 border-slate-200
                       dark:border-slate-600 rounded-2xl
                       overflow-hidden shadow-inner
                       hover:border-sky-300 transition-colors"
            style={{
              background: 'repeating-linear-gradient(' +
                '45deg,#f8fafc 0,#f8fafc 10px,' +
                '#f0f4f8 10px,#f0f4f8 20px)',
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair touch-none block"
              style={{
                height:     '160px',
                background: 'transparent',
              }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />

            {/* Placeholder */}
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center
                              justify-center pointer-events-none">
                <p className="text-slate-300 text-sm font-medium
                               select-none">
                  ✍️ Draw your signature here
                </p>
              </div>
            )}
          </div>

          {/* Clear */}
          <div className="flex justify-between items-center mt-2.5">
            <p className="text-[10px] text-slate-400 font-bold
                          uppercase tracking-widest">
              Sign inside the box
            </p>
            <Button
              variant="ghost" size="sm"
              onClick={clearCanvas}
              disabled={!hasDrawn}
              className="text-rose-500 hover:bg-rose-50
                         dark:hover:bg-rose-900/20
                         rounded-xl gap-1.5 h-8 px-3
                         disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </Button>
          </div>
        </TabsContent>

        {/* ── TYPE TAB ──────────────────────────────────── */}
        <TabsContent
          value="type"
          className="mt-4 outline-none space-y-3"
        >
          {/* Font selector */}
          <div>
            <p className="text-[10px] font-bold text-slate-400
                          uppercase tracking-widest mb-2">
              Choose Font Style
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setFontIndex(i)}
                  className={`px-3 py-2.5 rounded-xl text-sm
                               border-2 transition-all text-left
                               ${fontIndex === i
                                 ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20'
                                 : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                               }`}
                  style={{ fontFamily: f.value, fontStyle: 'italic' }}
                >
                  <span className={`text-base ${
                    fontIndex === i
                      ? 'text-sky-700 dark:text-sky-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {typedSig || 'John Doe'}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-0.5
                                not-italic font-semibold uppercase
                                tracking-wider">
                    {f.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div
            className="relative border-2 border-slate-200
                       dark:border-slate-600 rounded-2xl
                       overflow-hidden hover:border-sky-300
                       transition-colors"
            style={{
              background: 'repeating-linear-gradient(' +
                '45deg,#f8fafc 0,#f8fafc 10px,' +
                '#f0f4f8 10px,#f0f4f8 20px)',
            }}
          >
            <Input
              value={typedSig}
              onChange={e => setTypedSig(e.target.value)}
              placeholder="Type your full name..."
              maxLength={50}
              className="h-20 text-3xl text-center border-none
                         bg-transparent focus-visible:ring-0
                         dark:bg-transparent"
              style={{
                fontFamily:  FONT_OPTIONS[fontIndex]?.value,
                fontStyle:   'italic',
                color:       penColor,
              }}
              autoFocus
            />
          </div>

          {typedSig && (
            <p className="text-[10px] text-slate-400 text-center italic">
              Will be rendered in {FONT_OPTIONS[fontIndex]?.label} style
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm button */}
      <Button
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="w-full h-12 bg-sky-500 hover:bg-sky-600
                   active:bg-sky-700 text-white rounded-2xl
                   shadow-lg shadow-sky-500/25 font-bold text-base
                   transition-all active:scale-[0.98]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   gap-2"
      >
        <Check className="w-5 h-5" />
        Use This Signature
      </Button>
    </div>
  );
}