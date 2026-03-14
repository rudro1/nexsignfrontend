// import React, { useRef, useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { Eraser, Check } from 'lucide-react';

// export default function SignaturePad({ onSignatureComplete }) {
//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [hasDrawn, setHasDrawn] = useState(false);
//   const [typedSig, setTypedSig] = useState('');
//   const [mode, setMode] = useState('draw');

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     canvas.width = canvas.offsetWidth * 2;
//     canvas.height = canvas.offsetHeight * 2;
//     ctx.scale(2, 2);
//     ctx.strokeStyle = '#1e293b';
//     ctx.lineWidth = 2.5;
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';
//   }, []);

//   const getPos = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const touch = e.touches ? e.touches[0] : e;
//     return {
//       x: touch.clientX - rect.left,
//       y: touch.clientY - rect.top,
//     };
//   };

//   const startDraw = (e) => {
//     e.preventDefault();
//     const ctx = canvasRef.current.getContext('2d');
//     const pos = getPos(e);
//     ctx.beginPath();
//     ctx.moveTo(pos.x, pos.y);
//     setIsDrawing(true);
//   };

//   const draw = (e) => {
//     if (!isDrawing) return;
//     e.preventDefault();
//     const ctx = canvasRef.current.getContext('2d');
//     const pos = getPos(e);
//     ctx.lineTo(pos.x, pos.y);
//     ctx.stroke();
//     setHasDrawn(true);
//   };

//   const endDraw = () => {
//     setIsDrawing(false);
//   };

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     setHasDrawn(false);
//   };

//   const handleConfirm = () => {
//     if (mode === 'draw') {
//       if (!hasDrawn) return;
//       const dataUrl = canvasRef.current.toDataURL('image/png');
//       onSignatureComplete({ type: 'draw', value: dataUrl });
//     } else {
//       if (!typedSig.trim()) return;
//       // Create typed signature as image
//       const canvas = document.createElement('canvas');
//       canvas.width = 400;
//       canvas.height = 100;
//       const ctx = canvas.getContext('2d');
//       ctx.fillStyle = 'transparent';
//       ctx.fillRect(0, 0, 400, 100);
//       ctx.fillStyle = '#1e293b';
//       ctx.font = 'italic 36px Georgia, serif';
//       ctx.textAlign = 'center';
//       ctx.textBaseline = 'middle';
//       ctx.fillText(typedSig, 200, 50);
//       const dataUrl = canvas.toDataURL('image/png');
//       onSignatureComplete({ type: 'type', value: dataUrl });
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <Tabs value={mode} onValueChange={setMode}>
//         <TabsList className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl">
//           <TabsTrigger value="draw" className="flex-1 rounded-lg">Draw</TabsTrigger>
//           <TabsTrigger value="type" className="flex-1 rounded-lg">Type</TabsTrigger>
//         </TabsList>

//         <TabsContent value="draw" className="mt-4">
//           <div className="relative border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white overflow-hidden">
//             <canvas
//               ref={canvasRef}
//               className="w-full h-32 signature-canvas"
//               onMouseDown={startDraw}
//               onMouseMove={draw}
//               onMouseUp={endDraw}
//               onMouseLeave={endDraw}
//               onTouchStart={startDraw}
//               onTouchMove={draw}
//               onTouchEnd={endDraw}
//             />
//             <div className="absolute bottom-0 left-4 right-4 border-t border-slate-200" />
//           </div>
//           <div className="flex justify-between mt-2">
//             <Button variant="ghost" size="sm" onClick={clearCanvas} className="gap-1.5 text-slate-500">
//               <Eraser className="w-3.5 h-3.5" /> Clear
//             </Button>
//           </div>
//         </TabsContent>

//         <TabsContent value="type" className="mt-4">
//           <Input
//             value={typedSig}
//             onChange={e => setTypedSig(e.target.value)}
//             placeholder="Type your full name"
//             className="h-16 text-2xl text-center rounded-xl border-slate-200 dark:border-slate-600"
//             style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
//           />
//           {typedSig && (
//             <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
//               <p className="text-xs text-slate-400 mb-1">Preview</p>
//               <p className="text-3xl" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#1e293b' }}>
//                 {typedSig}
//               </p>
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>

//       <Button
//         onClick={handleConfirm}
//         disabled={(mode === 'draw' && !hasDrawn) || (mode === 'type' && !typedSig.trim())}
//         className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2"
//       >
//         <Check className="w-4 h-4" /> Apply Signature
//       </Button>
//     </div>
//   );
// }

// import React, { useRef, useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { Eraser, Check, Type as TypeIcon, PenTool } from 'lucide-react';

// export default function SignaturePad({ onSignatureComplete }) {
//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [hasDrawn, setHasDrawn] = useState(false);
//   const [typedSig, setTypedSig] = useState('');
//   const [mode, setMode] = useState('draw');

//   // ১. ক্যানভাস ইনিশিয়ালাইজেশন এবং টাচ ইভেন্ট প্রিভেনশন
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');

//     // High DPI Support
//     const dpr = window.devicePixelRatio || 1;
//     const rect = canvas.getBoundingClientRect();
//     canvas.width = rect.width * dpr;
//     canvas.height = rect.height * dpr;
//     ctx.scale(dpr, dpr);

//     ctx.strokeStyle = '#0f172a';
//     ctx.lineWidth = 2.5;
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';

//     // মোবাইল স্ক্রল প্রিভেন্ট করা
//     const preventDefault = (e) => {
//       if (e.target === canvas) e.preventDefault();
//     };
//     document.body.addEventListener('touchstart', preventDefault, { passive: false });
//     document.body.addEventListener('touchend', preventDefault, { passive: false });
//     document.body.addEventListener('touchmove', preventDefault, { passive: false });

//     return () => {
//       document.body.removeEventListener('touchstart', preventDefault);
//       document.body.removeEventListener('touchend', preventDefault);
//       document.body.removeEventListener('touchmove', preventDefault);
//     };
//   }, [mode]);

//   const getPos = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const clientX = e.touches ? e.touches[0].clientX : e.clientX;
//     const clientY = e.touches ? e.touches[0].clientY : e.clientY;
//     return {
//       x: clientX - rect.left,
//       y: clientY - rect.top,
//     };
//   };

//   const startDraw = (e) => {
//     const pos = getPos(e);
//     const ctx = canvasRef.current.getContext('2d');
//     ctx.beginPath();
//     ctx.moveTo(pos.x, pos.y);
//     setIsDrawing(true);
//   };

//   const draw = (e) => {
//     if (!isDrawing) return;
//     const pos = getPos(e);
//     const ctx = canvasRef.current.getContext('2d');
//     ctx.lineTo(pos.x, pos.y);
//     ctx.stroke();
//     setHasDrawn(true);
//   };

//   const endDraw = () => setIsDrawing(false);

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     setHasDrawn(false);
//   };

//   const handleConfirm = () => {
//     if (mode === 'draw') {
//       if (!hasDrawn) return;
//       // ব্যাকগ্রাউন্ড ট্রান্সপারেন্ট রেখে ইমেজ নেওয়া
//       const dataUrl = canvasRef.current.toDataURL('image/png');
//       onSignatureComplete({ type: 'draw', value: dataUrl });
//     } else {
//       if (!typedSig.trim()) return;
      
//       const canvas = document.createElement('canvas');
//       canvas.width = 500;
//       canvas.height = 150;
//       const ctx = canvas.getContext('2d');
      
//       ctx.fillStyle = 'rgba(0,0,0,0)'; // Transparent background
//       ctx.fillRect(0, 0, 500, 150);
      
//       ctx.fillStyle = '#0f172a';
//       // স্টাইলিশ ফন্ট (সিস্টেম ফন্ট ব্যবহার করা হয়েছে)
//       ctx.font = 'italic 500 48px "Dancing Script", "Georgia", serif';
//       ctx.textAlign = 'center';
//       ctx.textBaseline = 'middle';
//       ctx.fillText(typedSig, 250, 75);
      
//       onSignatureComplete({ type: 'type', value: canvas.toDataURL('image/png') });
//     }
//   };

//   return (
//     <div className="space-y-5 p-1">
//       <Tabs value={mode} onValueChange={setMode} className="w-full">
//         <TabsList className="grid grid-cols-2 w-full bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
//           <TabsTrigger value="draw" className="rounded-lg gap-2">
//             <PenTool className="w-4 h-4" /> Draw
//           </TabsTrigger>
//           <TabsTrigger value="type" className="rounded-lg gap-2">
//             <TypeIcon className="w-4 h-4" /> Type
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="draw" className="mt-4 animate-in fade-in slide-in-from-bottom-2">
//           <div className="relative border-2 border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden shadow-inner">
//             <canvas
//               ref={canvasRef}
//               className="w-full h-40 cursor-crosshair touch-none"
//               onMouseDown={startDraw}
//               onMouseMove={draw}
//               onMouseUp={endDraw}
//               onMouseLeave={endDraw}
//               onTouchStart={startDraw}
//               onTouchMove={draw}
//               onTouchEnd={endDraw}
//             />
//             <div className="absolute bottom-6 left-10 right-10 border-b border-slate-200 dark:border-slate-800 pointer-events-none opacity-50" />
//             <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-slate-400 uppercase tracking-widest pointer-events-none">
//               Sign Above This Line
//             </p>
//           </div>
//           <div className="flex justify-end mt-3">
//             <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
//               <Eraser className="w-4 h-4 mr-2" /> Clear Space
//             </Button>
//           </div>
//         </TabsContent>

//         <TabsContent value="type" className="mt-4 animate-in fade-in slide-in-from-bottom-2">
//           <Input
//             value={typedSig}
//             onChange={e => setTypedSig(e.target.value)}
//             placeholder="Enter your name..."
//             className="h-20 text-3xl text-center rounded-2xl border-2 border-slate-200 dark:border-slate-800 focus:ring-sky-500"
//             style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
//           />
//           <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
//             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Live Preview</span>
//             <p className="text-4xl min-h-[50px] flex items-center justify-center break-all" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#0f172a' }}>
//               {typedSig || 'Your Signature'}
//             </p>
//           </div>
//         </TabsContent>
//       </Tabs>

//       <Button
//         onClick={handleConfirm}
//         disabled={(mode === 'draw' && !hasDrawn) || (mode === 'type' && !typedSig.trim())}
//         className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-95"
//       >
//         <Check className="w-5 h-5 mr-2" /> Use This Signature
//       </Button>
//     </div>
//   );
// }
// import React, { useRef, useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { Eraser, Check, Type as TypeIcon, PenTool } from 'lucide-react';

// export default function SignaturePad({ onSignatureComplete }) {
//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [hasDrawn, setHasDrawn] = useState(false);
//   const [typedSig, setTypedSig] = useState('');
//   const [mode, setMode] = useState('draw');

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas || mode !== 'draw') return;
//     const ctx = canvas.getContext('2d');
//     const dpr = window.devicePixelRatio || 1;
//     const rect = canvas.getBoundingClientRect();
//     canvas.width = rect.width * dpr;
//     canvas.height = rect.height * dpr;
//     ctx.scale(dpr, dpr);
//     ctx.strokeStyle = '#0f172a';
//     ctx.lineWidth = 2.5;
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';

//     const preventDefault = (e) => { if (e.target === canvas) e.preventDefault(); };
//     document.body.addEventListener('touchstart', preventDefault, { passive: false });
//     document.body.addEventListener('touchmove', preventDefault, { passive: false });
//     return () => {
//       document.body.removeEventListener('touchstart', preventDefault);
//       document.body.removeEventListener('touchmove', preventDefault);
//     };
//   }, [mode]);

//   const getPos = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const clientX = e.touches ? e.touches[0].clientX : e.clientX;
//     const clientY = e.touches ? e.touches[0].clientY : e.clientY;
//     return { x: clientX - rect.left, y: clientY - rect.top };
//   };

//   const startDraw = (e) => {
//     const pos = getPos(e);
//     const ctx = canvasRef.current.getContext('2d');
//     ctx.beginPath();
//     ctx.moveTo(pos.x, pos.y);
//     setIsDrawing(true);
//   };

//   const draw = (e) => {
//     if (!isDrawing) return;
//     const pos = getPos(e);
//     const ctx = canvasRef.current.getContext('2d');
//     ctx.lineTo(pos.x, pos.y);
//     ctx.stroke();
//     setHasDrawn(true);
//   };

//   const endDraw = () => setIsDrawing(false);

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     setHasDrawn(false);
//   };

//   const handleConfirm = () => {
//     let finalValue = "";
//     if (mode === 'draw') {
//       if (!hasDrawn) return;
//       finalValue = canvasRef.current.toDataURL('image/png');
//     } else {
//       if (!typedSig.trim()) return;
//       const canvas = document.createElement('canvas');
//       canvas.width = 500;
//       canvas.height = 150;
//       const ctx = canvas.getContext('2d');
//       ctx.fillStyle = '#0f172a';
//       ctx.font = 'italic 500 48px "Georgia", serif';
//       ctx.textAlign = 'center';
//       ctx.textBaseline = 'middle';
//       ctx.fillText(typedSig, 250, 75);
//       finalValue = canvas.toDataURL('image/png');
//     }
//     // সরাসরি ভ্যালু পাঠানো হচ্ছে যাতে SignerView এর লজিকের সাথে মিলে যায়
//     onSignatureComplete(finalValue);
//   };

//   return (
//     <div className="space-y-5">
//       <Tabs value={mode} onValueChange={setMode} className="w-full">
//         <TabsList className="grid grid-cols-2 w-full bg-slate-100 rounded-xl p-1">
//           <TabsTrigger value="draw" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
//             <PenTool className="w-4 h-4" /> Draw
//           </TabsTrigger>
//           <TabsTrigger value="type" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
//             <TypeIcon className="w-4 h-4" /> Type
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="draw" className="mt-4">
//           <div className="relative border-2 border-slate-200 rounded-2xl bg-white overflow-hidden shadow-inner">
//             <canvas
//               ref={canvasRef}
//               className="w-full h-40 cursor-crosshair touch-none"
//               onMouseDown={startDraw}
//               onMouseMove={draw}
//               onMouseUp={endDraw}
//               onMouseLeave={endDraw}
//               onTouchStart={startDraw}
//               onTouchMove={draw}
//               onTouchEnd={endDraw}
//             />
//             <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-slate-400 uppercase tracking-widest pointer-events-none">
//               Sign Above This Line
//             </p>
//           </div>
//           <div className="flex justify-end mt-3">
//             <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
//               <Eraser className="w-4 h-4 mr-2" /> Clear Space
//             </Button>
//           </div>
//         </TabsContent>

//         <TabsContent value="type" className="mt-4">
//           <Input
//             value={typedSig}
//             onChange={e => setTypedSig(e.target.value)}
//             placeholder="Enter your name..."
//             className="h-20 text-3xl text-center rounded-2xl border-2 border-slate-200 focus:ring-sky-500 italic"
//             style={{ fontFamily: 'Georgia, serif' }}
//           />
//         </TabsContent>
//       </Tabs>

//       <Button
//         onClick={handleConfirm}
//         disabled={(mode === 'draw' && !hasDrawn) || (mode === 'type' && !typedSig.trim())}
//         className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-500/20 transition-all"
//       >
//         <Check className="w-5 h-5 mr-2" /> Use This Signature
//       </Button>
//     </div>
//   );
// }

//ai 
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Eraser, Check, Type as TypeIcon, PenTool } from 'lucide-react';

export default function SignaturePad({ onSignatureComplete }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedSig, setTypedSig] = useState('');
  const [mode, setMode] = useState('draw');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode !== 'draw') return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [mode]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // const handleConfirm = () => {
  //   let finalValue = "";
  //   if (mode === 'draw') {
  //     if (!hasDrawn) return;
  //     finalValue = canvasRef.current.toDataURL('image/png');
  //   } else {
  //     if (!typedSig.trim()) return;
      
  //     // হাই-রেজোলিউশন ইমেজ তৈরির জন্য বড় ক্যানভাস
  //     const canvas = document.createElement('canvas');
  //     canvas.width = 1000; 
  //     canvas.height = 250;
  //     const ctx = canvas.getContext('2d');
      
  //     // ব্যাকগ্রাউন্ড সাদা করা ক্লিয়ারিটির জন্য
  //     ctx.fillStyle = 'white';
  //     ctx.fillRect(0, 0, canvas.width, canvas.height);

  //     ctx.fillStyle = '#000000';
  //     // ফন্ট সেট করা (Times New Roman, Normal, No Italic)
  //     ctx.font = '500 80px "Times New Roman", serif';
  //     ctx.textAlign = 'center';
  //     ctx.textBaseline = 'middle';
  //     ctx.fillText(typedSig, 500, 125);
      
  //     finalValue = canvas.toDataURL('image/png');
  //   }
  //   onSignatureComplete(finalValue);
  // };

  //solving snap error problem 

  const handleConfirm = () => {
    let finalValue = "";
    if (mode === 'draw') {
      if (!hasDrawn) return;
      // ✅ পজিশন ঠিক রেখে শুধু মেমোরি কমানোর জন্য JPEG (0.5)
      finalValue = canvasRef.current.toDataURL('image/jpeg', 0.5);
    } else {
      if (!typedSig.trim()) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = 1000; 
      canvas.height = 250;
      const ctx = canvas.getContext('2d');
      
      // ✅ JPEG এর জন্য ব্যাকগ্রাউন্ড সাদা করা হয়েছে যাতে পজিশন ক্লিয়ার থাকে
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000000';
      ctx.font = '500 80px "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSig, 500, 125);
      
      // ✅ ডাটা সাইজ ছোট করার জন্য JPEG (0.5)
      finalValue = canvas.toDataURL('image/jpeg', 0.5);
    }
    onSignatureComplete(finalValue);
  };
  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={setMode} className="w-full">
        <TabsList className="grid grid-cols-2 w-full bg-slate-100 rounded-xl p-1">
          <TabsTrigger value="draw" className="rounded-lg gap-2">
            <PenTool className="w-4 h-4" /> Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="rounded-lg gap-2">
            <TypeIcon className="w-4 h-4" /> Type
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-4">
          <div className="relative border-2 border-slate-200 rounded-2xl bg-white overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              className="w-full h-40 cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          <div className="flex justify-end mt-3">
            <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-rose-500">
              <Eraser className="w-4 h-4 mr-2" /> Clear Space
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="type" className="mt-4">
          <Input
            value={typedSig}
            onChange={e => setTypedSig(e.target.value)}
            placeholder="Type your name..."
            className="h-24 text-4xl text-center rounded-2xl border-2 border-slate-200 focus:ring-sky-500"
            style={{ fontFamily: '"Times New Roman", serif' }} 
          />
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleConfirm}
        disabled={(mode === 'draw' && !hasDrawn) || (mode === 'type' && !typedSig.trim())}
        className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-lg"
      >
        <Check className="w-5 h-5 mr-2" /> Use This Signature
      </Button>
    </div>
  );
}