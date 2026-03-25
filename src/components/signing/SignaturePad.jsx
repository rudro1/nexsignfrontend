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
//     ctx.strokeStyle = '#000000';
//     ctx.lineWidth = 2.5;
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';
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

//   // const handleConfirm = () => {
//   //   let finalValue = "";
//   //   if (mode === 'draw') {
//   //     if (!hasDrawn) return;
//   //     finalValue = canvasRef.current.toDataURL('image/png');
//   //   } else {
//   //     if (!typedSig.trim()) return;
      
//   //     // হাই-রেজোলিউশন ইমেজ তৈরির জন্য বড় ক্যানভাস
//   //     const canvas = document.createElement('canvas');
//   //     canvas.width = 1000; 
//   //     canvas.height = 250;
//   //     const ctx = canvas.getContext('2d');
      
//   //     // ব্যাকগ্রাউন্ড সাদা করা ক্লিয়ারিটির জন্য
//   //     ctx.fillStyle = 'white';
//   //     ctx.fillRect(0, 0, canvas.width, canvas.height);

//   //     ctx.fillStyle = '#000000';
//   //     // ফন্ট সেট করা (Times New Roman, Normal, No Italic)
//   //     ctx.font = '500 80px "Times New Roman", serif';
//   //     ctx.textAlign = 'center';
//   //     ctx.textBaseline = 'middle';
//   //     ctx.fillText(typedSig, 500, 125);
      
//   //     finalValue = canvas.toDataURL('image/png');
//   //   }
//   //   onSignatureComplete(finalValue);
//   // };

//   //solving snap error problem 

// // const handleConfirm = () => {
// //   let finalValue = "";
// //   if (mode === 'draw') {
// //     if (!hasDrawn) return;

// //     // ১. একটি অফ-স্ক্রিন ক্যানভাস তৈরি করুন
// //     const canvas = canvasRef.current;
// //     const offscreenCanvas = document.createElement('canvas');
// //     offscreenCanvas.width = canvas.width;
// //     offscreenCanvas.height = canvas.height;
// //     const ctx = offscreenCanvas.getContext('2d');

// //     // ২. ব্যাকগ্রাউন্ড সাদা করুন (এটিই ব্ল্যাক হওয়া বন্ধ করবে)
// //     ctx.fillStyle = 'white';
// //     ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

// //     // ৩. সিগনেচারটি সাদা ব্যাকগ্রাউন্ডের ওপর বসান
// //     ctx.drawImage(canvas, 0, 0);
    
// //     // ৪. এখন JPEG হিসেবে সেভ করুন
// //     // finalValue = offscreenCanvas.toDataURL('image/jpeg', 0.5);
// //     finalValue = canvasRef.current.toDataURL('image/png');
// //   } else {
// //     // টাইপ মোডে আপনি অলরেডি সাদা ব্যাকগ্রাউন্ড দিচ্ছেন, এটি ঠিক আছে
// //     if (!typedSig.trim()) return;
// //     const canvas = document.createElement('canvas');
// //     canvas.width = 1000; 
// //     canvas.height = 250;
// //     const ctx = canvas.getContext('2d');
// //     ctx.fillStyle = 'white';
// //     ctx.fillRect(0, 0, canvas.width, canvas.height);
// //     ctx.fillStyle = '#000000';
// //     ctx.font = '500 80px "Times New Roman", serif';
// //     ctx.textAlign = 'center';
// //     ctx.textBaseline = 'middle';
// //     ctx.fillText(typedSig, 500, 125);
// //     finalValue = canvas.toDataURL('image/png', 0.5);
// //   }
// //   onSignatureComplete(finalValue);
// // };




// const handleConfirm = () => {
//   let finalValue = "";

//   if (mode === 'draw') {
//     // ১. ড্র মোড চেক: যদি কিছু আঁকা না হয় তবে রিটার্ন করবে
//     if (!hasDrawn) return;

//     // ২. স্বচ্ছ PNG তৈরি: 
//     // সরাসরি canvasRef থেকে ডাটা নিলে এটি ডিফল্টভাবে স্বচ্ছ থাকে।
//     // এখানে কোনো সাদা ব্যাকগ্রাউন্ড বা অফ-স্ক্রিন ক্যানভাসের প্রয়োজন নেই।
//     finalValue = canvasRef.current.toDataURL('image/png');

//   } else {
//     // ৩. টাইপ মোড চেক: যদি ইনপুট খালি থাকে তবে রিটার্ন করবে
//     if (!typedSig.trim()) return;

//     // ৪. অফ-স্ক্রিন ক্যানভাস তৈরি (টাইপ করা সিগনেচারের জন্য)
//     const canvas = document.createElement('canvas');
//     canvas.width = 1000; 
//     canvas.height = 250;
//     const ctx = canvas.getContext('2d');

//     // ৫. গুরুত্বপূর্ণ পরিবর্তন: 
//     // আমরা কোনো 'white' fill করছি না। clearRect ব্যবহার করে ক্যানভাস স্বচ্ছ রাখা হচ্ছে।
//     ctx.clearRect(0, 0, canvas.width, canvas.height); 

//     // ৬. টেক্সট কনফিগারেশন
//     ctx.fillStyle = '#000000'; // সিগনেচারের রঙ কালো
//     ctx.font = '500 80px "Times New Roman", serif'; // প্রফেশনাল ফন্ট
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
    
//     // ৭. স্বচ্ছ ক্যানভাসের ওপর নাম লেখা
//     ctx.fillText(typedSig, 500, 125);

//     // ৮. PNG হিসেবে আউটপুট নেওয়া (যা স্বচ্ছতা বজায় রাখবে)
//     finalValue = canvas.toDataURL('image/png');
//   }

//   // ৯. ফাইনাল ডাটা পাঠানো
//   onSignatureComplete(finalValue);
// };
//   return (
//     <div className="space-y-5">
//       <Tabs value={mode} onValueChange={setMode} className="w-full">
//         <TabsList className="grid grid-cols-2 w-full bg-slate-100 rounded-xl p-1">
//           <TabsTrigger value="draw" className="rounded-lg gap-2">
//             <PenTool className="w-4 h-4" /> Draw
//           </TabsTrigger>
//           <TabsTrigger value="type" className="rounded-lg gap-2">
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
//           </div>
//           <div className="flex justify-end mt-3">
//             <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-rose-500">
//               <Eraser className="w-4 h-4 mr-2" /> Clear Space
//             </Button>
//           </div>
//         </TabsContent>

//         <TabsContent value="type" className="mt-4">
//           <Input
//             value={typedSig}
//             onChange={e => setTypedSig(e.target.value)}
//             placeholder="Type your name..."
//             className="h-24 text-4xl text-center rounded-2xl border-2 border-slate-200 focus:ring-sky-500"
//             style={{ fontFamily: '"Times New Roman", serif' }} 
//           />
//         </TabsContent>
//       </Tabs>

//       <Button
//         onClick={handleConfirm}
//         disabled={(mode === 'draw' && !hasDrawn) || (mode === 'type' && !typedSig.trim())}
//         className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-lg"
//       >
//         <Check className="w-5 h-5 mr-2" /> Use This Signature
//       </Button>
//     </div>
//   );
// }

// import React, { useRef, useState, useEffect, useCallback } from 'react';
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

//   // ১. ক্যানভাস সেটআপ এবং হাই-রেজোলিউশন সাপোর্ট
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas || mode !== 'draw') return;

//     const ctx = canvas.getContext('2d');
//     const dpr = window.devicePixelRatio || 1;
//     const rect = canvas.getBoundingClientRect();

//     // রেজোলিউশন শার্প করার জন্য Scaling
//     canvas.width = rect.width * dpr;
//     canvas.height = rect.height * dpr;
//     ctx.scale(dpr, dpr);

//     // ড্রয়িং স্টাইল
//     ctx.strokeStyle = '#000000';
//     ctx.lineWidth = 2.5;
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';
//   }, [mode]);

//   // ২. পজিশন ক্যালকুলেটর (Optimized for Mobile/Desktop)
//   const getPos = useCallback((e) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return { x: 0, y: 0 };
//     const rect = canvas.getBoundingClientRect();
//     const clientX = e.touches ? e.touches[0].clientX : e.clientX;
//     const clientY = e.touches ? e.touches[0].clientY : e.clientY;
//     return { 
//       x: clientX - rect.left, 
//       y: clientY - rect.top 
//     };
//   }, []);

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
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     // ক্যানভাস পুরোপুরি পরিষ্কার (স্বচ্ছ) করা
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     setHasDrawn(false);
//   };

//   // ৩. সিগনেচার কনফার্মেশন লজিক (Transparent PNG Fix)
//   const handleConfirm = () => {
//     let finalValue = "";

//     if (mode === 'draw') {
//       if (!hasDrawn) return;
//       // সরাসরি স্বচ্ছ PNG এক্সপোর্ট (সাদা ব্যাকগ্রাউন্ড ছাড়াই)
//       finalValue = canvasRef.current.toDataURL('image/png');
//     } else {
//       if (!typedSig.trim()) return;

//       const canvas = document.createElement('canvas');
//       canvas.width = 1000; 
//       canvas.height = 250;
//       const ctx = canvas.getContext('2d');

//       // নিশ্চিত করা যে ক্যানভাসটি স্বচ্ছ
//       ctx.clearRect(0, 0, canvas.width, canvas.height); 

//       // প্রফেশনাল টেক্সট স্টাইল
//       ctx.fillStyle = '#000000'; 
//       ctx.font = '500 85px "Times New Roman", serif'; 
//       ctx.textAlign = 'center';
//       ctx.textBaseline = 'middle';
      
//       ctx.fillText(typedSig, 500, 125);
//       finalValue = canvas.toDataURL('image/png');
//     }

//     onSignatureComplete(finalValue);
//   };

//   return (
//     <div className="space-y-5 animate-in fade-in duration-300">
//       <Tabs value={mode} onValueChange={setMode} className="w-full">
//         <TabsList className="grid grid-cols-2 w-full bg-slate-100 rounded-xl p-1">
//           <TabsTrigger value="draw" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
//             <PenTool className="w-4 h-4" /> Draw
//           </TabsTrigger>
//           <TabsTrigger value="type" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
//             <TypeIcon className="w-4 h-4" /> Type
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="draw" className="mt-4 outline-none">
//           <div className="relative border-2 border-slate-200 rounded-2xl bg-slate-50 shadow-inner group transition-all hover:border-sky-200 overflow-hidden">
//             <canvas
//               ref={canvasRef}
//               className="w-full h-44 cursor-crosshair touch-none bg-white/50"
//               onMouseDown={startDraw}
//               onMouseMove={draw}
//               onMouseUp={endDraw}
//               onMouseLeave={endDraw}
//               onTouchStart={startDraw}
//               onTouchMove={draw}
//               onTouchEnd={endDraw}
//             />
//           </div>
//           <div className="flex justify-between items-center mt-3">
//             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">Sign within the box</p>
//             <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-rose-500 hover:bg-rose-50 rounded-lg">
//               <Eraser className="w-4 h-4 mr-2" /> Clear
//             </Button>
//           </div>
//         </TabsContent>

//         <TabsContent value="type" className="mt-4 outline-none">
//           <div className="relative">
//             <Input
//               value={typedSig}
//               onChange={e => setTypedSig(e.target.value)}
//               placeholder="Enter your full name..."
//               className="h-28 text-4xl text-center rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:ring-0 transition-all bg-slate-50/30"
//               style={{ fontFamily: '"Times New Roman", serif' }} 
//             />
//             {typedSig && (
//               <p className="absolute bottom-2 right-4 text-[9px] text-slate-400 italic">Signature Preview</p>
//             )}
//           </div>
//         </TabsContent>
//       </Tabs>

//       <Button
//         onClick={handleConfirm}
//         disabled={(mode === 'draw' && !hasDrawn) || (mode === 'type' && !typedSig.trim())}
//         className="w-full h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl shadow-xl shadow-sky-100 transition-all active:scale-[0.98] font-bold text-lg"
//       >
//         <Check className="w-6 h-6 mr-2" /> Use This Signature
//       </Button>
//     </div>
//   );
// }


import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Eraser, Check, Type as TypeIcon, PenTool } from 'lucide-react';

// ─── FONT OPTIONS for typed signatures ──────────────────────────────────────
const FONT_OPTIONS = [
  { label: 'Classic Serif',   value: '"Times New Roman", Georgia, serif' },
  { label: 'Cursive Script',  value: '"Brush Script MT", "Dancing Script", cursive' },
  { label: 'Modern Sans',     value: '"Helvetica Neue", Arial, sans-serif' },
  { label: 'Monospace',       value: '"Courier New", Courier, monospace' },
];

export default function SignaturePad({ onSignatureComplete }) {
  const canvasRef   = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn,  setHasDrawn]  = useState(false);
  const [typedSig,  setTypedSig]  = useState('');
  const [mode,      setMode]      = useState('draw');
  const [fontIndex, setFontIndex] = useState(0); // for typed mode

  // ── Canvas setup — TRANSPARENT background ───────────────────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Physical pixel size
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // ✅ DO NOT fill background — leave transparent
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth   = 2.2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  }, []);

  useEffect(() => {
    if (mode === 'draw') {
      // Small delay to let the DOM render
      setTimeout(initCanvas, 50);
    }
  }, [mode, initCanvas]);

  // ── Pointer position helper ──────────────────────────────────────────────
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect   = canvas.getBoundingClientRect();
    const src    = e.touches ? e.touches[0] : e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const pos = getPos(e);
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
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  }, [isDrawing, getPos]);

  const endDraw = useCallback((e) => {
    e?.preventDefault();
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // ✅ clearRect preserves transparency (no fillRect white)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, []);

  // ── Confirm — always export as transparent PNG ───────────────────────────
  const handleConfirm = useCallback(() => {
    let finalValue = '';

    if (mode === 'draw') {
      if (!hasDrawn) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // ✅ KEY FIX: toDataURL on a canvas that was NEVER filled = transparent PNG
      // No white background, no fillRect, clean alpha channel.
      finalValue = canvas.toDataURL('image/png');

    } else {
      // Typed signature — render on a transparent canvas
      if (!typedSig.trim()) return;

      const canvas = document.createElement('canvas');
      canvas.width  = 900;
      canvas.height = 220;
      const ctx = canvas.getContext('2d');

      // ✅ DO NOT call fillRect — canvas starts transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const font = FONT_OPTIONS[fontIndex]?.value || FONT_OPTIONS[0].value;
      ctx.fillStyle    = '#1a1a1a';
      ctx.font         = `italic 90px ${font}`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSig.trim(), 450, 110);

      finalValue = canvas.toDataURL('image/png');
    }

    onSignatureComplete(finalValue);
  }, [mode, hasDrawn, typedSig, fontIndex, onSignatureComplete]);

  const canConfirm = mode === 'draw' ? hasDrawn : typedSig.trim().length > 0;

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={(v) => { setMode(v); setHasDrawn(false); setTypedSig(''); }} className="w-full">
        <TabsList className="grid grid-cols-2 w-full bg-slate-100 rounded-xl p-1">
          <TabsTrigger value="draw" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold">
            <PenTool className="w-4 h-4" /> Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold">
            <TypeIcon className="w-4 h-4" /> Type
          </TabsTrigger>
        </TabsList>

        {/* ── DRAW TAB ── */}
        <TabsContent value="draw" className="mt-4 outline-none">
          {/* ✅ Canvas wrapper: NO bg-white class — must be transparent */}
          <div className="relative border-2 border-slate-200 rounded-2xl overflow-hidden shadow-inner hover:border-sky-300 transition-colors"
               style={{ background: 'repeating-linear-gradient(45deg,#f8fafc 0,#f8fafc 10px,#f0f4f8 10px,#f0f4f8 20px)' }}>
            <canvas
              ref={canvasRef}
              // ✅ NO bg-white here — CSS background is decorative only (not captured)
              className="w-full h-44 cursor-crosshair touch-none block"
              style={{ background: 'transparent' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-slate-300 text-sm font-medium select-none">Draw your signature here</p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Sign inside the box above
            </p>
            <Button variant="ghost" size="sm" onClick={clearCanvas}
              className="text-rose-500 hover:bg-rose-50 rounded-lg gap-1.5">
              <Eraser className="w-3.5 h-3.5" /> Clear
            </Button>
          </div>
        </TabsContent>

        {/* ── TYPE TAB ── */}
        <TabsContent value="type" className="mt-4 outline-none space-y-3">
          {/* Font selector */}
          <div className="flex gap-2 flex-wrap">
            {FONT_OPTIONS.map((f, i) => (
              <button
                key={i}
                onClick={() => setFontIndex(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  fontIndex === i
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
                style={{ fontFamily: f.value }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Typed preview */}
          <div className="relative border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-sky-300 transition-colors"
               style={{ background: 'repeating-linear-gradient(45deg,#f8fafc 0,#f8fafc 10px,#f0f4f8 10px,#f0f4f8 20px)' }}>
            <Input
              value={typedSig}
              onChange={e => setTypedSig(e.target.value)}
              placeholder="Type your full name..."
              className="h-24 text-3xl sm:text-4xl text-center border-none bg-transparent focus-visible:ring-0 font-medium"
              style={{ fontFamily: FONT_OPTIONS[fontIndex]?.value, fontStyle: 'italic' }}
            />
          </div>
          {typedSig && (
            <p className="text-[10px] text-slate-400 text-right italic">
              Preview — will be rendered in {FONT_OPTIONS[fontIndex]?.label}
            </p>
          )}
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="w-full h-13 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl shadow-lg font-bold text-base transition-all active:scale-[0.98] disabled:opacity-40 py-3"
      >
        <Check className="w-5 h-5 mr-2" /> Use This Signature
      </Button>
    </div>
  );
}