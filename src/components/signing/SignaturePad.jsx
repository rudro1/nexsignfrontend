
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
  useRef, useState, useCallback, useEffect,
} from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Check, PenTool } from 'lucide-react';

// ════════════════════════════════════════════════════════════════
// SignaturePad
// ✅ Fix: InvalidNodeTypeError — removed any Range/selectNode usage
// ✅ Fix: Canvas transparent background for clean PNG
// ════════════════════════════════════════════════════════════════
export default function SignaturePad({ onSignatureComplete }) {
  const canvasRef    = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef   = useRef({ x: 0, y: 0 });
  const hasStrokeRef = useRef(false);

  const [isEmpty,  setIsEmpty]  = useState(true);
  const [tabIndex, setTabIndex] = useState(0); // 0=draw, 1=type
  const [typedSig, setTypedSig] = useState('');

  // ── Init canvas ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ✅ Transparent background — no white fill
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    hasStrokeRef.current = false;
    setIsEmpty(true);
  }, [tabIndex]);

  // ── Get position (mouse or touch) ────────────────────────
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches?.[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  }, []);

  // ── Draw handlers ─────────────────────────────────────────
  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current   = getPos(e);

    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
  }, [getPos]);

  const draw = useCallback((e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current   = pos;
    hasStrokeRef.current = true;

    if (isEmpty) setIsEmpty(false);
  }, [getPos, isEmpty]);

  const endDraw = useCallback((e) => {
    e?.preventDefault();
    isDrawingRef.current = false;
  }, []);

  // ── Clear ─────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokeRef.current = false;
    setIsEmpty(true);
  }, []);

  // ── Confirm signature ─────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (tabIndex === 1) {
      // Typed signature → render to canvas
      if (!typedSig.trim()) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      // ✅ Transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font         = `italic bold 38px 'Brush Script MT', cursive`;
      ctx.fillStyle    = '#1a202c';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        typedSig,
        canvas.width / 2,
        canvas.height / 2,
      );

      // ✅ Export as PNG with transparency
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureComplete?.(dataUrl);
      return;
    }

    // Draw signature
    if (isEmpty || !hasStrokeRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // ✅ Export as PNG (preserves transparency)
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureComplete?.(dataUrl);
  }, [tabIndex, typedSig, isEmpty, onSignatureComplete]);

  return (
    <div className="space-y-4">

      {/* Tab selector */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {['Draw', 'Type'].map((label, i) => (
          <button
            key={label}
            onClick={() => setTabIndex(i)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold
                        transition-all
                        ${tabIndex === i
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                        }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tabIndex === 0 ? (
        /* ── Draw tab ──────────────────────────────────────── */
        <div className="space-y-3">
          <div
            className="relative border-2 border-dashed
                       border-slate-200 rounded-2xl
                       overflow-hidden bg-white"
            style={{ touchAction: 'none' }}
          >
            {/* Guide line */}
            <div className="absolute bottom-10 left-6 right-6
                            h-px bg-slate-200 pointer-events-none" />

            {/* ✅ Canvas — transparent bg, no white fill */}
            <canvas
              ref={canvasRef}
              width={520}
              height={180}
              className="w-full cursor-crosshair block"
              style={{ touchAction: 'none' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />

            {isEmpty && (
              <div className="absolute inset-0 flex flex-col
                              items-center justify-center
                              pointer-events-none gap-2">
                <PenTool className="w-6 h-6 text-slate-200" />
                <p className="text-slate-300 text-sm font-medium">
                  Sign here
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isEmpty}
              className="flex-1 rounded-xl h-10 gap-2
                         text-slate-500 border-slate-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isEmpty}
              className="flex-1 rounded-xl h-10 gap-2
                         bg-sky-500 hover:bg-sky-600 text-white
                         disabled:opacity-40
                         disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Apply Signature
            </Button>
          </div>
        </div>
      ) : (
        /* ── Type tab ───────────────────────────────────────── */
        <div className="space-y-3">
          <input
            type="text"
            value={typedSig}
            onChange={e => setTypedSig(e.target.value)}
            placeholder="Type your name..."
            className="w-full h-14 px-4 rounded-xl border-2
                       border-slate-200 focus:border-sky-400
                       outline-none text-2xl text-slate-800
                       bg-white"
            style={{
              fontFamily: "'Brush Script MT', 'Dancing Script', cursive",
              fontStyle:  'italic',
            }}
            autoFocus
          />

          {typedSig && (
            <div className="border-2 border-dashed border-slate-200
                            rounded-xl p-4 text-center bg-slate-50
                            min-h-[80px] flex items-center
                            justify-center">
              <span
                className="text-slate-800 select-none"
                style={{
                  fontFamily: "'Brush Script MT', cursive",
                  fontStyle:  'italic',
                  fontSize:   '36px',
                  lineHeight: 1,
                }}
              >
                {typedSig}
              </span>
            </div>
          )}

          {/* Hidden canvas for rendering typed sig */}
          <canvas
            ref={canvasRef}
            width={520}
            height={180}
            className="hidden"
          />

          <Button
            onClick={handleConfirm}
            disabled={!typedSig.trim()}
            className="w-full rounded-xl h-10 gap-2
                       bg-sky-500 hover:bg-sky-600 text-white
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Apply Signature
          </Button>
        </div>
      )}
    </div>
  );
}