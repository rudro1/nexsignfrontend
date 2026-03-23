// // import React, { useRef, useState, useEffect, useCallback } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ChevronLeft, ChevronRight, Trash2, PenTool, Type, Move } from 'lucide-react';

// // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// // export default function PdfViewer({
// //   fileUrl,
// //   fields,
// //   onFieldsChange,
// //   currentPage,
// //   onPageChange,
// //   totalPages,
// //   onTotalPagesChange,
// //   pendingFieldType,
// //   selectedPartyIndex,
// //   parties,
// //   onFieldPlaced,
// //   readOnly = false,
// //   highlightPartyIndex = null,
// // }) {
// //   const canvasRef = useRef(null);
// //   const containerRef = useRef(null);
// //   const [pdfDoc, setPdfDoc] = useState(null);
// //   const [scale, setScale] = useState(1);
// //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
// //   const [dragging, setDragging] = useState(null);
// //   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

// //   // Load PDF
// //   useEffect(() => {
// //     if (!fileUrl) return;
    
// //     const loadPdf = async () => {
// //       const pdfjsLib = window.pdfjsLib;
// //       if (!pdfjsLib) {
// //         const script = document.createElement('script');
// //         script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// //         script.onload = () => {
// //           window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// //           loadPdfDoc();
// //         };
// //         document.head.appendChild(script);
// //       } else {
// //         loadPdfDoc();
// //       }
// //     };

// //     const loadPdfDoc = async () => {
// //       const doc = await window.pdfjsLib.getDocument({
// //         url: fileUrl,
// //         cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
// //         cMapPacked: true,
// //       }).promise;
// //       setPdfDoc(doc);
// //       if (onTotalPagesChange) onTotalPagesChange(doc.numPages);
// //     };

// //     loadPdf();
// //   }, [fileUrl]);

// //   // Render page
// //   useEffect(() => {
// //     if (!pdfDoc || !canvasRef.current) return;
    
// //     const renderPage = async () => {
// //       const page = await pdfDoc.getPage(currentPage);
// //       const containerWidth = containerRef.current?.clientWidth || 700;
// //       const viewport = page.getViewport({ scale: 1 });
// //       const newScale = (containerWidth - 40) / viewport.width;
// //       setScale(newScale);

// //       const scaledViewport = page.getViewport({ scale: newScale });
// //       const canvas = canvasRef.current;
// //       canvas.width = scaledViewport.width;
// //       canvas.height = scaledViewport.height;
// //       setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });

// //       const ctx = canvas.getContext('2d');
// //       await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
// //     };

// //     renderPage();
// //   }, [pdfDoc, currentPage]);

// //   const handleCanvasClick = (e) => {
// //     if (readOnly || !pendingFieldType || dragging) return;
    
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const x = ((e.clientX - rect.left) / canvasSize.width) * 100;
// //     const y = ((e.clientY - rect.top) / canvasSize.height) * 100;

// //     const newField = {
// //       id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
// //       type: pendingFieldType,
// //       party_index: selectedPartyIndex,
// //       page: currentPage,
// //       x,
// //       y,
// //       width: pendingFieldType === 'signature' ? 20 : 15,
// //       height: pendingFieldType === 'signature' ? 6 : 4,
// //       value: '',
// //       filled: false,
// //     };

// //     onFieldsChange([...fields, newField]);
// //     if (onFieldPlaced) onFieldPlaced();
// //   };

// //   const handleFieldMouseDown = (e, field) => {
// //     if (readOnly) return;
// //     e.stopPropagation();
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const fieldX = (field.x / 100) * canvasSize.width;
// //     const fieldY = (field.y / 100) * canvasSize.height;
// //     setDragOffset({
// //       x: e.clientX - rect.left - fieldX,
// //       y: e.clientY - rect.top - fieldY,
// //     });
// //     setDragging(field.id);
// //   };

// //   const handleMouseMove = useCallback((e) => {
// //     if (!dragging || readOnly) return;
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const x = ((e.clientX - rect.left - dragOffset.x) / canvasSize.width) * 100;
// //     const y = ((e.clientY - rect.top - dragOffset.y) / canvasSize.height) * 100;

// //     const updated = fields.map(f => 
// //       f.id === dragging ? { ...f, x: Math.max(0, Math.min(x, 100 - f.width)), y: Math.max(0, Math.min(y, 100 - f.height)) } : f
// //     );
// //     onFieldsChange(updated);
// //   }, [dragging, fields, canvasSize, dragOffset, readOnly]);

// //   const handleMouseUp = useCallback(() => {
// //     setDragging(null);
// //   }, []);

// //   useEffect(() => {
// //     if (dragging) {
// //       window.addEventListener('mousemove', handleMouseMove);
// //       window.addEventListener('mouseup', handleMouseUp);
// //       return () => {
// //         window.removeEventListener('mousemove', handleMouseMove);
// //         window.removeEventListener('mouseup', handleMouseUp);
// //       };
// //     }
// //   }, [dragging, handleMouseMove, handleMouseUp]);

// //   const removeField = (fieldId) => {
// //     onFieldsChange(fields.filter(f => f.id !== fieldId));
// //   };

// //   const pageFields = fields.filter(f => f.page === currentPage);

// //   return (
// //     <div ref={containerRef} className="flex-1">
// //       {/* Page controls */}
// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-center gap-4 mb-4">
// //           <Button
// //             variant="outline"
// //             size="icon"
// //             disabled={currentPage <= 1}
// //             onClick={() => onPageChange(currentPage - 1)}
// //             className="rounded-lg"
// //           >
// //             <ChevronLeft className="w-4 h-4" />
// //           </Button>
// //           <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
// //             Page {currentPage} of {totalPages}
// //           </span>
// //           <Button
// //             variant="outline"
// //             size="icon"
// //             disabled={currentPage >= totalPages}
// //             onClick={() => onPageChange(currentPage + 1)}
// //             className="rounded-lg"
// //           >
// //             <ChevronRight className="w-4 h-4" />
// //           </Button>
// //         </div>
// //       )}

// //       {/* PDF Canvas + Field Overlays */}
// //       <div
// //         className="relative mx-auto shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white"
// //         style={{ width: canvasSize.width || '100%', cursor: pendingFieldType ? 'crosshair' : 'default' }}
// //         onClick={handleCanvasClick}
// //       >
// //         <canvas ref={canvasRef} className="block" />

// //         {/* Field overlays */}
// //         {pageFields.map(field => {
// //           const party = parties?.[field.party_index];
// //           const color = party?.color || PARTY_COLORS[field.party_index % PARTY_COLORS.length];
// //           const isHighlighted = highlightPartyIndex === null || highlightPartyIndex === field.party_index;
// //           const isSignerField = highlightPartyIndex !== null && highlightPartyIndex === field.party_index;

// //           return (
// //             <div
// //               key={field.id}
// //               className={`absolute field-overlay rounded-md border-2 flex items-center justify-center transition-opacity ${
// //                 isHighlighted ? 'opacity-100' : 'opacity-30'
// //               } ${dragging === field.id ? 'z-20' : 'z-10'} ${!readOnly ? 'cursor-move' : ''}`}
// //               style={{
// //                 left: `${field.x}%`,
// //                 top: `${field.y}%`,
// //                 width: `${field.width}%`,
// //                 height: `${field.height}%`,
// //                 borderColor: color,
// //                 backgroundColor: field.filled ? `${color}10` : `${color}15`,
// //               }}
// //               onMouseDown={(e) => handleFieldMouseDown(e, field)}
// //             >
// //               {field.filled && field.value ? (
// //                 field.type === 'signature' ? (
// //                   <img src={field.value} alt="Signature" className="w-full h-full object-contain p-1" />
// //                 ) : (
// //                   <span className="text-xs font-medium px-1 truncate" style={{ color }}>{field.value}</span>
// //                 )
// //               ) : (
// //                 <div className="flex items-center gap-1 px-1.5">
// //                   {field.type === 'signature' ? (
// //                     <PenTool className="w-3 h-3" style={{ color }} />
// //                   ) : (
// //                     <Type className="w-3 h-3" style={{ color }} />
// //                   )}
// //                   <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color }}>
// //                     {party?.name || `Signer ${field.party_index + 1}`}
// //                   </span>
// //                 </div>
// //               )}

// //               {!readOnly && (
// //                 <button
// //                   className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-30"
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     removeField(field.id);
// //                   }}
// //                 >
// //                   <Trash2 className="w-3 h-3" />
// //                 </button>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }
// // import React, { useRef, useState, useEffect, useCallback } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ChevronLeft, ChevronRight, Trash2, PenTool, Type } from 'lucide-react';

// // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// // export default function PdfViewer({
// //   fileUrl,
// //   fields,
// //   onFieldsChange,
// //   currentPage,
// //   onPageChange,
// //   totalPages,
// //   onTotalPagesChange,
// //   pendingFieldType,
// //   selectedPartyIndex,
// //   parties,
// //   onFieldPlaced,
// //   readOnly = false,
// //   highlightPartyIndex = null,
// // }) {
// //   const canvasRef = useRef(null);
// //   const containerRef = useRef(null);
// //   const [pdfDoc, setPdfDoc] = useState(null);
// //   const [scale, setScale] = useState(1);
// //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
// //   const [dragging, setDragging] = useState(null);
// //   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
// //   const [loading, setLoading] = useState(true);
// //   const [isRendering, setIsRendering] = useState(false);

// //   // Load PDF
// //   useEffect(() => {
// //     if (!fileUrl) return;
    
// //     setLoading(true);
// //     setIsRendering(false);
// //     setPdfDoc(null);
    
// //     const loadPdf = async () => {
// //       try {
// //         const pdfjsLib = window.pdfjsLib;
// //         if (!pdfjsLib) {
// //           const script = document.createElement('script');
// //           script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// //           script.onload = () => {
// //             window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// //             loadPdfDoc();
// //           };
// //           document.head.appendChild(script);
// //         } else {
// //           loadPdfDoc();
// //         }
// //       } catch (err) {
// //         console.error("PDF Load Error:", err);
// //         setLoading(false);
// //       }
// //     };

// //     const loadPdfDoc = async () => {
// //       try {
// //         const filename = fileUrl.split('/').pop();
// //         const proxyUrl = `http://localhost:5001/api/documents/proxy/${filename}`;
// //         console.log("Proxy URL:", proxyUrl);
        
// //         const doc = await window.pdfjsLib.getDocument({
// //           url: proxyUrl,
// //           cMapPacked: true,
// //         }).promise;
// //         setPdfDoc(doc);
// //         if (onTotalPagesChange) onTotalPagesChange(doc.numPages);
// //         setLoading(false);
// //       } catch (err) {
// //         console.error("PDF Document Error:", err);
// //         setLoading(false);
// //       }
// //     };

// //     loadPdf();
// //   }, [fileUrl]);

// //   // Render page - FIXED: Better page change handling
// //   useEffect(() => {
// //     if (!pdfDoc || !canvasRef.current || loading || isRendering) return;
    
// //     const renderPage = async () => {
// //       try {
// //         setIsRendering(true);
        
// //         const page = await pdfDoc.getPage(currentPage);
// //         const containerWidth = containerRef.current?.clientWidth || 700;
// //         const viewport = page.getViewport({ scale: 1 });
// //         const newScale = (containerWidth - 40) / viewport.width;
// //         setScale(newScale);

// //         const scaledViewport = page.getViewport({ scale: newScale });
// //         const canvas = canvasRef.current;
// //         canvas.width = scaledViewport.width;
// //         canvas.height = scaledViewport.height;
// //         setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });

// //         const ctx = canvas.getContext('2d');
// //         await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
// //         setIsRendering(false);
// //       } catch (err) {
// //         console.error("PDF Render Error:", err);
// //         setIsRendering(false);
// //       }
// //     };

// //     renderPage();
// //   }, [pdfDoc, currentPage, loading]);

// //   const handleCanvasClick = (e) => {
// //     if (readOnly || !pendingFieldType || dragging || loading || isRendering) return;
    
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const x = ((e.clientX - rect.left) / canvasSize.width) * 100;
// //     const y = ((e.clientY - rect.top) / canvasSize.height) * 100;

// //     const newField = {
// //       id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
// //       type: pendingFieldType,
// //       party_index: selectedPartyIndex,
// //       page: currentPage,
// //       x,
// //       y,
// //       width: pendingFieldType === 'signature' ? 20 : 15,
// //       height: pendingFieldType === 'signature' ? 6 : 4,
// //       value: '',
// //       filled: false,
// //     };

// //     onFieldsChange([...fields, newField]);
// //     if (onFieldPlaced) onFieldPlaced();
// //   };

// //   const handleFieldMouseDown = (e, field) => {
// //     if (readOnly) return;
// //     e.stopPropagation();
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const fieldX = (field.x / 100) * canvasSize.width;
// //     const fieldY = (field.y / 100) * canvasSize.height;
// //     setDragOffset({
// //       x: e.clientX - rect.left - fieldX,
// //       y: e.clientY - rect.top - fieldY,
// //     });
// //     setDragging(field.id);
// //   };

// //   const handleMouseMove = useCallback((e) => {
// //     if (!dragging || readOnly || loading || isRendering) return;
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const x = ((e.clientX - rect.left - dragOffset.x) / canvasSize.width) * 100;
// //     const y = ((e.clientY - rect.top - dragOffset.y) / canvasSize.height) * 100;

// //     const updated = fields.map(f => 
// //       f.id === dragging ? { ...f, x: Math.max(0, Math.min(x, 100 - f.width)), y: Math.max(0, Math.min(y, 100 - f.height)) } : f
// //     );
// //     onFieldsChange(updated);
// //   }, [dragging, fields, canvasSize, dragOffset, readOnly, loading, isRendering]);

// //   const handleMouseUp = useCallback(() => {
// //     setDragging(null);
// //   }, []);

// //   useEffect(() => {
// //     if (dragging) {
// //       window.addEventListener('mousemove', handleMouseMove);
// //       window.addEventListener('mouseup', handleMouseUp);
// //       return () => {
// //         window.removeEventListener('mousemove', handleMouseMove);
// //         window.removeEventListener('mouseup', handleMouseUp);
// //       };
// //     }
// //   }, [dragging, handleMouseMove, handleMouseUp]);

// //   const removeField = (fieldId) => {
// //     onFieldsChange(fields.filter(f => f.id !== fieldId));
// //   };

// //   const pageFields = fields.filter(f => f.page === currentPage);

// //   return (
// //     <div ref={containerRef} className="flex-1">
// //       {/* Page controls */}
// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-center gap-4 mb-4">
// //           <Button
// //             variant="outline"
// //             size="icon"
// //             disabled={currentPage <= 1 || isRendering}
// //             onClick={() => onPageChange(currentPage - 1)}
// //             className="rounded-lg"
// //           >
// //             <ChevronLeft className="w-4 h-4" />
// //           </Button>
// //           <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
// //             Page {currentPage} of {totalPages}
// //           </span>
// //           <Button
// //             variant="outline"
// //             size="icon"
// //             disabled={currentPage >= totalPages || isRendering}
// //             onClick={() => onPageChange(currentPage + 1)}
// //             className="rounded-lg"
// //           >
// //             <ChevronRight className="w-4 h-4" />
// //           </Button>
// //         </div>
// //       )}

// //       {/* PDF Canvas + Field Overlays */}
// //       <div
// //         className="relative mx-auto shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white"
// //         style={{ width: canvasSize.width || '100%', cursor: pendingFieldType ? 'crosshair' : 'default' }}
// //         onClick={handleCanvasClick}
// //       >
// //         {loading ? (
// //           <div className="flex items-center justify-center h-[70vh]">
// //             <div className="text-center">
// //               <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
// //               <p className="text-slate-500">Loading PDF...</p>
// //             </div>
// //           </div>
// //         ) : (
// //           <>
// //             <canvas ref={canvasRef} className="block" />

// //             {/* Field overlays */}
// //             {pageFields.map(field => {
// //               const party = parties?.[field.party_index];
// //               const color = party?.color || PARTY_COLORS[field.party_index % PARTY_COLORS.length];
// //               const isHighlighted = highlightPartyIndex === null || highlightPartyIndex === field.party_index;

// //               return (
// //                 <div
// //                   key={field.id}
// //                   className={`absolute field-overlay rounded-md border-2 flex items-center justify-center transition-opacity ${
// //                     isHighlighted ? 'opacity-100' : 'opacity-30'
// //                   } ${dragging === field.id ? 'z-20' : 'z-10'} ${!readOnly ? 'cursor-move' : ''}`}
// //                   style={{
// //                     left: `${field.x}%`,
// //                     top: `${field.y}%`,
// //                     width: `${field.width}%`,
// //                     height: `${field.height}%`,
// //                     borderColor: color,
// //                     backgroundColor: field.filled ? `${color}10` : `${color}15`,
// //                   }}
// //                   onMouseDown={(e) => handleFieldMouseDown(e, field)}
// //                 >
// //                   {field.filled && field.value ? (
// //                     field.type === 'signature' ? (
// //                       <img src={field.value} alt="Signature" className="w-full h-full object-contain p-1" />
// //                     ) : (
// //                       <span className="text-xs font-medium px-1 truncate" style={{ color }}>{field.value}</span>
// //                     )
// //                   ) : (
// //                     <div className="flex items-center gap-1 px-1.5">
// //                       {field.type === 'signature' ? (
// //                         <PenTool className="w-3 h-3" style={{ color }} />
// //                       ) : (
// //                         <Type className="w-3 h-3" style={{ color }} />
// //                       )}
// //                       <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color }}>
// //                         {party?.name || `Signer ${field.party_index + 1}`}
// //                       </span>
// //                     </div>
// //                   )}

// //                   {!readOnly && (
// //                     <button
// //                       className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-30"
// //                       onClick={(e) => {
// //                         e.stopPropagation();
// //                         removeField(field.id);
// //                       }}
// //                     >
// //                       <Trash2 className="w-3 h-3" />
// //                     </button>
// //                   )}
// //                 </div>
// //               );
// //             })}
// //           </>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// // import React, { useRef, useState, useEffect, useCallback } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ChevronLeft, ChevronRight, Trash2, PenTool, Type } from 'lucide-react';

// // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// // export default function PdfViewer({
// //   fileUrl,
// //   fileId, // ✅ সরাসরি fileId প্রপ হিসেবে রিসিভ করা হচ্ছে
// //   fields,
// //   onFieldsChange,
// //   currentPage,
// //   onPageChange,
// //   totalPages,
// //   onTotalPagesChange,
// //   pendingFieldType,
// //   selectedPartyIndex,
// //   parties,
// //   onFieldPlaced,
// //   readOnly = false,
// //   highlightPartyIndex = null,
// // }) {
// //   const canvasRef = useRef(null);
// //   const containerRef = useRef(null);
// //   const [pdfDoc, setPdfDoc] = useState(null);
// //   const [scale, setScale] = useState(1);
// //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
// //   const [dragging, setDragging] = useState(null);
// //   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
// //   const [loading, setLoading] = useState(true);
// //   const [isRendering, setIsRendering] = useState(false);

// //   // Load PDF - FIXED Logic
// //   useEffect(() => {
// //     if (!fileUrl) return;
    
// //     setLoading(true);
// //     setIsRendering(false);
// //     setPdfDoc(null);
    
// //     const loadPdf = async () => {
// //       try {
// //         const pdfjsLib = window.pdfjsLib;
// //         if (!pdfjsLib) {
// //           const script = document.createElement('script');
// //           script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// //           script.onload = () => {
// //             window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// //             loadPdfDoc();
// //           };
// //           document.head.appendChild(script);
// //         } else {
// //           loadPdfDoc();
// //         }
// //       } catch (err) {
// //         console.error("PDF Load Error:", err);
// //         setLoading(false);
// //       }
// //     };

// //     const loadPdfDoc = async () => {
// //       try {
// //         // ✅ FIXED: fileId থাকলে সেটি ব্যবহার করুন, না থাকলে URL থেকে filename নিন
// //         const targetId = fileId || fileUrl.split('/').pop();
// //         const proxyUrl = `http://localhost:5001/api/documents/proxy/${targetId}`;
        
// //         console.log("Loading PDF from proxy:", proxyUrl);
        
// //         const loadingTask = window.pdfjsLib.getDocument({
// //           url: proxyUrl,
// //           withCredentials: true,
// //           cMapPacked: true,
// //         });

// //         const doc = await loadingTask.promise;
// //         setPdfDoc(doc);
// //         if (onTotalPagesChange) onTotalPagesChange(doc.numPages);
// //         setLoading(false);
// //       } catch (err) {
// //         console.error("PDF Document Error:", err);
// //         setLoading(false);
// //       }
// //     };

// //     loadPdf();
// //   }, [fileUrl, fileId]); // ✅ fileId চেঞ্জ হলেও যেন রিলোড হয়

// //   // Render page - unchanged but kept for completeness
// //   useEffect(() => {
// //     if (!pdfDoc || !canvasRef.current || loading || isRendering) return;
    
// //     const renderPage = async () => {
// //       try {
// //         setIsRendering(true);
// //         const page = await pdfDoc.getPage(currentPage);
// //         const containerWidth = containerRef.current?.clientWidth || 700;
// //         const viewport = page.getViewport({ scale: 1 });
// //         const newScale = (containerWidth - 40) / viewport.width;
// //         setScale(newScale);

// //         const scaledViewport = page.getViewport({ scale: newScale });
// //         const canvas = canvasRef.current;
// //         const ctx = canvas.getContext('2d');
        
// //         canvas.width = scaledViewport.width;
// //         canvas.height = scaledViewport.height;
// //         setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });

// //         await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
// //         setIsRendering(false);
// //       } catch (err) {
// //         console.error("PDF Render Error:", err);
// //         setIsRendering(false);
// //       }
// //     };

// //     renderPage();
// //   }, [pdfDoc, currentPage, loading]);

// //   const handleCanvasClick = (e) => {
// //     if (readOnly || !pendingFieldType || dragging || loading || isRendering) return;
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const x = ((e.clientX - rect.left) / canvasSize.width) * 100;
// //     const y = ((e.clientY - rect.top) / canvasSize.height) * 100;

// //     const newField = {
// //       id: `field_${Date.now()}`,
// //       type: pendingFieldType,
// //       party_index: selectedPartyIndex,
// //       page: currentPage,
// //       x,
// //       y,
// //       width: pendingFieldType === 'signature' ? 20 : 15,
// //       height: pendingFieldType === 'signature' ? 6 : 4,
// //       value: '',
// //       filled: false,
// //     };

// //     onFieldsChange([...fields, newField]);
// //     if (onFieldPlaced) onFieldPlaced();
// //   };

// //   const handleFieldMouseDown = (e, field) => {
// //     if (readOnly) return;
// //     e.stopPropagation();
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const fieldX = (field.x / 100) * canvasSize.width;
// //     const fieldY = (field.y / 100) * canvasSize.height;
// //     setDragOffset({
// //       x: e.clientX - rect.left - fieldX,
// //       y: e.clientY - rect.top - fieldY,
// //     });
// //     setDragging(field.id);
// //   };

// //   const handleMouseMove = useCallback((e) => {
// //     if (!dragging || readOnly) return;
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const x = ((e.clientX - rect.left - dragOffset.x) / canvasSize.width) * 100;
// //     const y = ((e.clientY - rect.top - dragOffset.y) / canvasSize.height) * 100;

// //     onFieldsChange(fields.map(f => 
// //       f.id === dragging ? { ...f, x: Math.max(0, Math.min(x, 100 - f.width)), y: Math.max(0, Math.min(y, 100 - f.height)) } : f
// //     ));
// //   }, [dragging, fields, canvasSize, dragOffset, readOnly]);

// //   const handleMouseUp = useCallback(() => setDragging(null), []);

// //   useEffect(() => {
// //     if (dragging) {
// //       window.addEventListener('mousemove', handleMouseMove);
// //       window.addEventListener('mouseup', handleMouseUp);
// //       return () => {
// //         window.removeEventListener('mousemove', handleMouseMove);
// //         window.removeEventListener('mouseup', handleMouseUp);
// //       };
// //     }
// //   }, [dragging, handleMouseMove, handleMouseUp]);

// //   const pageFields = fields.filter(f => f.page === currentPage);

// //   return (
// //     <div ref={containerRef} className="flex-1">
// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-center gap-4 mb-4">
// //           <Button variant="outline" size="icon" disabled={currentPage <= 1 || isRendering} onClick={() => onPageChange(currentPage - 1)}>
// //             <ChevronLeft className="w-4 h-4" />
// //           </Button>
// //           <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
// //           <Button variant="outline" size="icon" disabled={currentPage >= totalPages || isRendering} onClick={() => onPageChange(currentPage + 1)}>
// //             <ChevronRight className="w-4 h-4" />
// //           </Button>
// //         </div>
// //       )}

// //       <div
// //         className="relative mx-auto shadow-xl rounded-xl overflow-hidden border border-slate-200 bg-white"
// //         style={{ width: canvasSize.width || '100%', minHeight: '500px' }}
// //         onClick={handleCanvasClick}
// //       >
// //         {loading ? (
// //           <div className="flex items-center justify-center h-[500px]">
// //             <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
// //           </div>
// //         ) : (
// //           <>
// //             <canvas ref={canvasRef} className="block" />
// //             {pageFields.map(field => {
// //               const party = parties?.[field.party_index];
// //               const color = party?.color || PARTY_COLORS[field.party_index % PARTY_COLORS.length];
// //               return (
// //                 <div
// //                   key={field.id}
// //                   className={`absolute rounded border-2 flex items-center justify-center ${dragging === field.id ? 'z-50' : 'z-10'}`}
// //                   style={{
// //                     left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%`,
// //                     borderColor: color, backgroundColor: `${color}20`, cursor: readOnly ? 'default' : 'move'
// //                   }}
// //                   onMouseDown={(e) => handleFieldMouseDown(e, field)}
// //                 >
// //                   <div className="flex items-center gap-1 px-1">
// //                     {field.type === 'signature' ? <PenTool className="w-3 h-3" style={{ color }} /> : <Type className="w-3 h-3" style={{ color }} />}
// //                     <span className="text-[10px] font-bold truncate" style={{ color }}>{party?.name || 'Signer'}</span>
// //                   </div>
// //                   {!readOnly && (
// //                     <button 
// //                       className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
// //                       onClick={(e) => { e.stopPropagation(); onFieldsChange(fields.filter(f => f.id !== field.id)); }}
// //                     >
// //                       <Trash2 className="w-3 h-3" />
// //                     </button>
// //                   )}
// //                 </div>
// //               );
// //             })}
// //           </>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // লোডিং আইকন ব্যবহারের জন্য Loader2 ইম্পোর্ট করতে ভুলবেন না
// // import { Loader2 } from 'lucide-react';
// // import React, { useRef, useState, useEffect, useCallback } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ChevronLeft, ChevronRight, Trash2, PenTool, Type, Loader2 } from 'lucide-react';

// // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // export default function PdfViewer({
// //   fileId, fields, onFieldsChange, currentPage, onPageChange,
// //   totalPages, onTotalPagesChange, pendingFieldType, selectedPartyIndex,
// //   parties, onFieldPlaced, readOnly = false
// // }) {
// //   const canvasRef = useRef(null);
// //   const containerRef = useRef(null);
// //   const renderTaskRef = useRef(null); // ✅ রেন্ডার টাস্ক ট্র্যাক করার জন্য
// //   const [pdfDoc, setPdfDoc] = useState(null);
// //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
// //   const [dragging, setDragging] = useState(null);
// //   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (!fileId) return;
    
// //     const initPdf = async () => {
// //       setLoading(true);
// //       try {
// //         if (!window.pdfjsLib) {
// //           const script = document.createElement('script');
// //           script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// //           script.onload = () => {
// //             window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// //             fetchPdf();
// //           };
// //           document.head.appendChild(script);
// //         } else {
// //           fetchPdf();
// //         }
// //       } catch (err) {
// //         console.error("Script Load Error:", err);
// //         setLoading(false);
// //       }
// //     };

// //     const fetchPdf = async () => {
// //       try {
// //         const proxyUrl = `http://localhost:5001/api/documents/proxy/${fileId}`;
// //         const loadingTask = window.pdfjsLib.getDocument({ 
// //           url: proxyUrl, 
// //           withCredentials: true 
// //         });
// //         const doc = await loadingTask.promise;
// //         setPdfDoc(doc);
// //         if (onTotalPagesChange) onTotalPagesChange(doc.numPages);
// //         setLoading(false);
// //       } catch (err) {
// //         console.error("PDF Loading Error:", err);
// //         setLoading(false);
// //       }
// //     };

// //     initPdf();
// //   }, [fileId]);

// //   useEffect(() => {
// //     if (!pdfDoc || !canvasRef.current) return;

// //     const renderPage = async () => {
// //       // ✅ যদি আগের কোনো রেন্ডার চলতে থাকে, তবে তা বাতিল করা
// //       if (renderTaskRef.current) {
// //         renderTaskRef.current.cancel();
// //       }

// //       try {
// //         const page = await pdfDoc.getPage(currentPage);
// //         const containerWidth = containerRef.current?.clientWidth || 700;
// //         const viewport = page.getViewport({ scale: 1.5 });
// //         const scale = (containerWidth - 40) / viewport.width;
// //         const scaledViewport = page.getViewport({ scale });
        
// //         const canvas = canvasRef.current;
// //         const context = canvas.getContext('2d');
        
// //         // ✅ ক্যানভাস পরিষ্কার করা
// //         context.clearRect(0, 0, canvas.width, canvas.height);
        
// //         canvas.width = scaledViewport.width;
// //         canvas.height = scaledViewport.height;
// //         setCanvasSize({ width: canvas.width, height: canvas.height });

// //         const renderContext = {
// //           canvasContext: context,
// //           viewport: scaledViewport
// //         };

// //         const renderTask = page.render(renderContext);
// //         renderTaskRef.current = renderTask;

// //         await renderTask.promise;
// //       } catch (err) {
// //         if (err.name !== 'RenderingCancelledException') {
// //           console.error("Render Error:", err);
// //         }
// //       }
// //     };

// //     renderPage();
// //   }, [pdfDoc, currentPage]);

// //   const handleCanvasClick = (e) => {
// //     if (readOnly || !pendingFieldType || dragging) return;
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const x = ((e.clientX - rect.left) / canvasSize.width) * 100;
// //     const y = ((e.clientY - rect.top) / canvasSize.height) * 100;
// //     onFieldsChange([...fields, {
// //       id: `f_${Date.now()}`, type: pendingFieldType, party_index: selectedPartyIndex,
// //       page: currentPage, x, y, width: 20, height: 6, filled: false
// //     }]);
// //     if (onFieldPlaced) onFieldPlaced();
// //   };

// //   const handleFieldMouseDown = (e, field) => {
// //     if (readOnly) return;
// //     e.stopPropagation();
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     setDragOffset({
// //       x: e.clientX - rect.left - (field.x / 100) * canvasSize.width,
// //       y: e.clientY - rect.top - (field.y / 100) * canvasSize.height
// //     });
// //     setDragging(field.id);
// //   };

// //   const handleMouseMove = useCallback((e) => {
// //     if (!dragging || readOnly) return;
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     const x = ((e.clientX - rect.left - dragOffset.x) / canvasSize.width) * 100;
// //     const y = ((e.clientY - rect.top - dragOffset.y) / canvasSize.height) * 100;
// //     onFieldsChange(fields.map(f => f.id === dragging ? { ...f, x, y } : f));
// //   }, [dragging, fields, canvasSize, dragOffset, readOnly]);

// //   useEffect(() => {
// //     if (dragging) {
// //       window.addEventListener('mousemove', handleMouseMove);
// //       window.addEventListener('mouseup', () => setDragging(null));
// //       return () => {
// //         window.removeEventListener('mousemove', handleMouseMove);
// //       };
// //     }
// //   }, [dragging, handleMouseMove]);

// //   return (
// //     <div ref={containerRef} className="w-full">
// //       <div className="flex justify-center gap-4 mb-4">
// //         <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Prev</Button>
// //         <span className="py-1 text-sm font-bold">Page {currentPage} of {totalPages}</span>
// //         <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</Button>
// //       </div>
// //       <div className="relative border-2 rounded-lg shadow-xl bg-white overflow-hidden mx-auto" style={{ width: canvasSize.width || '100%', minHeight: '500px' }} onClick={handleCanvasClick}>
// //         {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50"><Loader2 className="animate-spin text-sky-500" /></div>}
// //         <canvas ref={canvasRef} className="block" />
// //         {fields.filter(f => f.page === currentPage).map(field => {
// //           const color = PARTY_COLORS[field.party_index % PARTY_COLORS.length];
// //           return (
// //             <div key={field.id} className="absolute border-2 rounded p-1 flex items-center gap-1 group"
// //               style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%`, borderColor: color, backgroundColor: `${color}15`, cursor: 'move' }}
// //               onMouseDown={(e) => handleFieldMouseDown(e, field)}>
// //               <PenTool size={12} color={color} /> 
// //               <span className="text-[10px] font-bold truncate" style={{ color }}>{parties[field.party_index]?.name || 'Signer'}</span>
// //               {!readOnly && (
// //                 <button className="ml-auto text-red-500 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onFieldsChange(fields.filter(f => f.id !== field.id)); }}>×</button>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }
// // import React, { useRef, useState, useEffect, useCallback } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ChevronLeft, ChevronRight, Trash2, PenTool, Type, Loader2 } from 'lucide-react';

// // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// // export default function PdfViewer({
// //   fileUrl,
// //   fileId,
// //   fields,
// //   onFieldsChange,
// //   currentPage,
// //   onPageChange,
// //   totalPages,
// //   onTotalPagesChange,
// //   pendingFieldType,
// //   selectedPartyIndex,
// //   parties,
// //   onFieldPlaced,
// //   readOnly = false,
// //   highlightPartyIndex = null,
// // }) {
// //   const canvasRef = useRef(null);
// //   const containerRef = useRef(null);
// //   const renderTaskRef = useRef(null); // ✅ রেন্ডার টাস্ক ট্র্যাক করার জন্য
// //   const [pdfDoc, setPdfDoc] = useState(null);
// //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
// //   const [dragging, setDragging] = useState(null);
// //   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
// //   const [loading, setLoading] = useState(true);

// //   // ১. PDF লোড করার লজিক (Proxy ব্যবহার করে)
// //   useEffect(() => {
// //     if (!fileUrl && !fileId) return;
    
// //     const loadPdfDoc = async () => {
// //       setLoading(true);
// //       try {
// //         const targetId = fileId || fileUrl.split('/').pop();
// //         const proxyUrl = `http://localhost:5001/api/documents/proxy/${targetId}`;
        
// //         const loadingTask = window.pdfjsLib.getDocument({
// //           url: proxyUrl,
// //           withCredentials: true
// //         });

// //         const doc = await loadingTask.promise;
// //         setPdfDoc(doc);
// //         if (onTotalPagesChange) onTotalPagesChange(doc.numPages);
// //       } catch (err) {
// //         console.error("PDF Loading Error:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadPdfDoc();
// //   }, [fileUrl, fileId]);

// //   // ২. পেজ রেন্ডার করার লজিক (Cancelable Task সহ)
// //   useEffect(() => {
// //     if (!pdfDoc || !canvasRef.current) return;
    
// //     const renderPage = async () => {
// //       if (renderTaskRef.current) {
// //         renderTaskRef.current.cancel();
// //       }

// //       try {
// //         const page = await pdfDoc.getPage(currentPage);
// //         const containerWidth = containerRef.current?.clientWidth || 700;
// //         const viewport = page.getViewport({ scale: 1.5 });
// //         const scale = (containerWidth - 40) / viewport.width;
// //         const scaledViewport = page.getViewport({ scale });
        
// //         const canvas = canvasRef.current;
// //         const ctx = canvas.getContext('2d');
        
// //         canvas.width = scaledViewport.width;
// //         canvas.height = scaledViewport.height;
// //         setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });

// //         const renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport });
// //         renderTaskRef.current = renderTask;
// //         await renderTask.promise;
// //       } catch (err) {
// //         if (err.name !== 'RenderingCancelledException') {
// //           console.error("PDF Render Error:", err);
// //         }
// //       }
// //     };

// //     renderPage();
// //   }, [pdfDoc, currentPage]);

// //   // ৩. ক্লিক এবং স্মুথ ড্র্যাগিং লজিক
// //   // const handleCanvasClick = (e) => {
// //   //   if (readOnly || !pendingFieldType || dragging) return;
// //   //   const rect = canvasRef.current.getBoundingClientRect();
// //   //   const x = ((e.clientX - rect.left) / canvasSize.width) * 100;
// //   //   const y = ((e.clientY - rect.top) / canvasSize.height) * 100;

// //   //   onFieldsChange([...fields, {
// //   //     id: `field_${Date.now()}`,
// //   //     type: pendingFieldType,
// //   //     party_index: selectedPartyIndex,
// //   //     page: currentPage,
// //   //     x, y,
// //   //     width: pendingFieldType === 'signature' ? 20 : 15,
// //   //     height: pendingFieldType === 'signature' ? 6 : 4,
// //   //     filled: false,
// //   //   }]);
// //   //   if (onFieldPlaced) onFieldPlaced();
// //   // };
// // const handleCanvasClick = (e) => {
// //     if (readOnly || !pendingFieldType || dragging || loading) return;
    
// //     const rect = canvasRef.current.getBoundingClientRect();
    
// //     // ক্লিক করা পয়েন্টের পজিশন বের করা
// //     const clickX = e.clientX - rect.left;
// //     const clickY = e.clientY - rect.top;

// //     // বক্সের সাইজ নির্ধারণ (আপনার আগের কোডের মতোই)
// //     const fieldWidth = pendingFieldType === 'signature' ? 20 : 15;
// //     const fieldHeight = pendingFieldType === 'signature' ? 6 : 4;

// //     // ✅ FIXED: বক্সের মাঝখান যাতে ক্লিক পয়েন্টে থাকে, তাই অর্ভেক মান বিয়োগ করা হয়েছে
// //     const x = ((clickX / canvasSize.width) * 100) - (fieldWidth / 2);
// //     const y = ((clickY / canvasSize.height) * 100) - (fieldHeight / 2);

// //     const newField = {
// //       id: `field_${Date.now()}`,
// //       type: pendingFieldType,
// //       party_index: selectedPartyIndex,
// //       page: currentPage,
// //       x: Math.max(0, Math.min(x, 100 - fieldWidth)), // বাউন্ডারি চেক
// //       y: Math.max(0, Math.min(y, 100 - fieldHeight)),
// //       width: fieldWidth,
// //       height: fieldHeight,
// //       value: '',
// //       filled: false,
// //     };

// //     onFieldsChange([...fields, newField]);
// //     if (onFieldPlaced) onFieldPlaced();
// //   };
// //   const handleFieldMouseDown = (e, field) => {
// //     if (readOnly) return;
// //     e.stopPropagation();
// //     const rect = canvasRef.current.getBoundingClientRect();
// //     setDragOffset({
// //       x: e.clientX - rect.left - (field.x / 100) * canvasSize.width,
// //       y: e.clientY - rect.top - (field.y / 100) * canvasSize.height,
// //     });
// //     setDragging(field.id);
// //   };

// //   const handleMouseMove = useCallback((e) => {
// //     if (!dragging || readOnly) return;
    
// //     window.requestAnimationFrame(() => {
// //       if (!dragging) return;
// //       const rect = canvasRef.current.getBoundingClientRect();
// //       const x = ((e.clientX - rect.left - dragOffset.x) / canvasSize.width) * 100;
// //       const y = ((e.clientY - rect.top - dragOffset.y) / canvasSize.height) * 100;

// //       onFieldsChange(fields.map(f => 
// //         f.id === dragging ? { 
// //           ...f, 
// //           x: Math.max(0, Math.min(x, 100 - f.width)), 
// //           y: Math.max(0, Math.min(y, 100 - f.height)) 
// //         } : f
// //       ));
// //     });
// //   }, [dragging, fields, canvasSize, dragOffset, readOnly, onFieldsChange]);

// //   useEffect(() => {
// //     if (dragging) {
// //       window.addEventListener('mousemove', handleMouseMove);
// //       const stopDragging = () => setDragging(null);
// //       window.addEventListener('mouseup', stopDragging);
// //       return () => {
// //         window.removeEventListener('mousemove', handleMouseMove);
// //         window.removeEventListener('mouseup', stopDragging);
// //       };
// //     }
// //   }, [dragging, handleMouseMove]);

// //   const pageFields = fields.filter(f => f.page === currentPage);

// //   return (
// //     <div ref={containerRef} className="flex-1">
// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-center gap-4 mb-4">
// //           <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
// //             <ChevronLeft className="w-4 h-4" />
// //           </Button>
// //           <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
// //           <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
// //             <ChevronRight className="w-4 h-4" />
// //           </Button>
// //         </div>
// //       )}

// //       <div
// //         className="relative mx-auto shadow-xl rounded-xl overflow-hidden border border-slate-200 bg-white"
// //         style={{ width: canvasSize.width || '100%', minHeight: '500px' }}
// //         onClick={handleCanvasClick}
// //       >
// //         {loading && (
// //           <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[100]">
// //             <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
// //           </div>
// //         )}
        
// //         <canvas ref={canvasRef} className="block pointer-events-none" style={{ zIndex: 1 }} />
        
// //         {pageFields.map(field => {
// //           const party = parties?.[field.party_index];
// //           const color = party?.color || PARTY_COLORS[field.party_index % PARTY_COLORS.length];
// //           return (
// //             <div
// //               key={field.id}
// //               className={`absolute rounded border-2 flex items-center justify-center ${dragging === field.id ? 'z-50' : 'z-10'}`}
// //               style={{
// //                 left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%`,
// //                 borderColor: color, backgroundColor: 'transparent', cursor: readOnly ? 'default' : 'move'
// //               }}
// //               onMouseDown={(e) => handleFieldMouseDown(e, field)}
// //             >
// //               <div className="flex items-center gap-1 px-1 pointer-events-none">
// //                 {field.type === 'signature' ? <PenTool className="w-3 h-3" style={{ color }} /> : <Type className="w-3 h-3" style={{ color }} />}
// //                 <span className="text-[10px] font-bold truncate" style={{ color }}>{party?.name || 'Signer'}</span>
// //               </div>
// //               {!readOnly && (
// //                 <button 
// //                   className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 z-[60]"
// //                   onClick={(e) => { e.stopPropagation(); onFieldsChange(fields.filter(f => f.id !== field.id)); }}
// //                 >
// //                   <Trash2 className="w-3 h-3" />
// //                 </button>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }

// // import React, { useRef, useState, useEffect, useCallback } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ChevronLeft, ChevronRight, Trash2, PenTool, Type, Loader2 } from 'lucide-react';
// // import { Rnd } from 'react-rnd';

// // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// // export default function PdfViewer({
// //   fileUrl,
// //   fileId,
// //   fields,
// //   onFieldsChange,
// //   currentPage,
// //   onPageChange,
// //   totalPages,
// //   onTotalPagesChange,
// //   pendingFieldType,
// //   selectedPartyIndex,
// //   parties,
// //   onFieldPlaced,
// //   readOnly = false,
// //   highlightPartyIndex = null,
// // }) {
// //   const canvasRef = useRef(null);
// //   const containerRef = useRef(null);
// //   const renderTaskRef = useRef(null);
// //   const [pdfDoc, setPdfDoc] = useState(null);
// //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
// //   const [loading, setLoading] = useState(true);

// //   // ১. PDF লোড করার লজিক (আপনার ব্যাকএন্ড অনুযায়ী)
// //   useEffect(() => {
// //     if (!fileUrl && !fileId) return;
// //     const loadPdfDoc = async () => {
// //       setLoading(true);
// //       try {
// //         const targetId = fileId || fileUrl.split('/').pop();
// //         const proxyUrl = `http://localhost:5001/api/documents/proxy/${targetId}`;
// //         const loadingTask = window.pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true });
// //         const doc = await loadingTask.promise;
// //         setPdfDoc(doc);
// //         if (onTotalPagesChange) onTotalPagesChange(doc.numPages);
// //       } catch (err) { console.error(err); } finally { setLoading(false); }
// //     };
// //     loadPdfDoc();
// //   }, [fileUrl, fileId]);

// //   // ২. হাই-কোয়ালিটি রেন্ডারিং (টেক্সট যাতে ক্লিয়ার থাকে)
// //   useEffect(() => {
// //     if (!pdfDoc || !canvasRef.current) return;
// //     const renderPage = async () => {
// //       if (renderTaskRef.current) renderTaskRef.current.cancel();
// //       try {
// //         const page = await pdfDoc.getPage(currentPage);
// //         const containerWidth = containerRef.current?.clientWidth || 700;
// //         const viewport = page.getViewport({ scale: 2.0 }); 
// //         const scale = (containerWidth - 40) / viewport.width;
// //         const scaledViewport = page.getViewport({ scale: 2.0 * scale });
// //         const canvas = canvasRef.current;
// //         canvas.width = scaledViewport.width;
// //         canvas.height = scaledViewport.height;
// //         setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });
// //         const renderTask = page.render({ canvasContext: canvas.getContext('2d'), viewport: scaledViewport });
// //         renderTaskRef.current = renderTask;
// //         await renderTask.promise;
// //       } catch (err) { if (err.name !== 'RenderingCancelledException') console.error(err); }
// //     };
// //     renderPage();
// //   }, [pdfDoc, currentPage]);

// //   // ৩. ক্লিক করে ফিল্ড বসানো (আপনার ওরিজিনাল সাইজ অনুযায়ী)
// //   const handleContainerClick = (e) => {
// //     if (readOnly || !pendingFieldType || loading) return;
// //     if (e.target !== e.currentTarget && !e.target.classList.contains('pdf-canvas')) return;
// //     const rect = e.currentTarget.getBoundingClientRect();
// //     const fW = pendingFieldType === 'signature' ? 20 : 15;
// //     const fH = pendingFieldType === 'signature' ? 6 : 4;
// //     const newField = {
// //       id: `field_${Date.now()}`,
// //       type: pendingFieldType,
// //       party_index: selectedPartyIndex,
// //       page: currentPage,
// //       x: (((e.clientX - rect.left) / canvasSize.width) * 100) - (fW / 2),
// //       y: (((e.clientY - rect.top) / canvasSize.height) * 100) - (fH / 2),
// //       width: fW,
// //       height: fH,
// //       value: '',
// //       filled: false,
// //     };
// //     onFieldsChange([...fields, newField]);
// //     if (onFieldPlaced) onFieldPlaced();
// //   };

// //   return (
// //     <div ref={containerRef} className="flex-1">
// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-center gap-4 mb-4">
// //           <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft className="w-4 h-4" /></Button>
// //           <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
// //           <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}><ChevronRight className="w-4 h-4" /></Button>
// //         </div>
// //       )}

// //       <div
// //         className="relative mx-auto shadow-xl rounded-xl overflow-hidden border border-slate-200 bg-white"
// //         style={{ width: canvasSize.width || '100%', minHeight: '500px', cursor: pendingFieldType ? 'crosshair' : 'default' }}
// //         onClick={handleContainerClick}
// //       >
// //         {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[100]"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>}
// //         <canvas ref={canvasRef} className="pdf-canvas block pointer-events-none" />

// //         {fields.filter(f => f.page === currentPage).map(field => {
// //           const color = parties?.[field.party_index]?.color || PARTY_COLORS[field.party_index % PARTY_COLORS.length];
// //           const isHighlighted = highlightPartyIndex === null || highlightPartyIndex === field.party_index;

// //           return (
// //             <Rnd
// //               key={field.id}
// //               // ✅ সাইজ এবং পজিশন পিক্সেল এ কনভার্ট করে দেওয়া হয়েছে যাতে 'জাম্প' না করে
// //               size={{ 
// //                 width: (field.width / 100) * canvasSize.width, 
// //                 height: (field.height / 100) * canvasSize.height 
// //               }}
// //               position={{ 
// //                 x: (field.x / 100) * canvasSize.width, 
// //                 y: (field.y / 100) * canvasSize.height 
// //               }}
// //               onDragStop={(e, d) => {
// //                 const updated = fields.map(f => f.id === field.id ? { 
// //                   ...f, x: (d.x / canvasSize.width) * 100, y: (d.y / canvasSize.height) * 100 
// //                 } : f);
// //                 onFieldsChange(updated);
// //               }}
// //               onResizeStop={(e, dir, ref, delta, pos) => {
// //                 // ✅ রিসাইজ শেষ হওয়ার পর নির্ভুলভাবে পার্সেন্টেজে কনভার্ট
// //                 const updated = fields.map(f => f.id === field.id ? {
// //                   ...f,
// //                   width: (ref.offsetWidth / canvasSize.width) * 100,
// //                   height: (ref.offsetHeight / canvasSize.height) * 100,
// //                   x: (pos.x / canvasSize.width) * 100,
// //                   y: (pos.y / canvasSize.height) * 100
// //                 } : f);
// //                 onFieldsChange(updated);
// //               }}
// //               bounds="parent"
// //               enableResizing={!readOnly}
// //               disableDragging={readOnly}
// //               className={`z-10 ${isHighlighted ? 'opacity-100' : 'opacity-30'}`}
// //               onClick={(e) => e.stopPropagation()}
// //             >
// //               <div className="w-full h-full rounded-md border-2 flex items-center justify-center relative group" style={{ borderColor: color, backgroundColor: `${color}15` }}>
// //                 <div className="flex items-center gap-1 px-1.5 pointer-events-none">
// //                   {field.type === 'signature' ? <PenTool className="w-3 h-3" style={{ color }} /> : <Type className="w-3 h-3" style={{ color }} />}
// //                   <span className="text-[10px] font-semibold truncate" style={{ color }}>{parties?.[field.party_index]?.name || 'Signer'}</span>
// //                 </div>
// //                 {!readOnly && (
// //                   <button className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-sm" onClick={(e) => { e.stopPropagation(); onFieldsChange(fields.filter(f => f.id !== field.id)); }}>
// //                     <Trash2 className="w-3 h-3" />
// //                   </button>
// //                 )}
// //               </div>
// //             </Rnd>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }
// // import React, { useRef, useState, useEffect, useCallback } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ChevronLeft, ChevronRight, Trash2, PenTool, Type, Loader2 } from 'lucide-react';
// // import { Rnd } from 'react-rnd';

// // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// // export default function PdfViewer({
// //   fileUrl,
// //   fileId,
// //   fields,
// //   onFieldsChange,
// //   currentPage,
// //   onPageChange,
// //   totalPages,
// //   onTotalPagesChange,
// //   pendingFieldType,
// //   selectedPartyIndex,
// //   parties,
// //   onFieldPlaced,
// //   readOnly = false,
// //   highlightPartyIndex = null,
// // }) {
// //   const canvasRef = useRef(null);
// //   const containerRef = useRef(null);
// //   const renderTaskRef = useRef(null);
// //   const [pdfDoc, setPdfDoc] = useState(null);
// //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
// //   const [loading, setLoading] = useState(true);

// //   // ১. PDF লোড করার লজিক
// //   useEffect(() => {
// //     if (!fileUrl && !fileId) return;
// //     const loadPdfDoc = async () => {
// //       setLoading(true);
// //       try {
// //         const targetId = fileId || fileUrl.split('/').pop();
// //         const proxyUrl = `http://localhost:5001/api/documents/proxy/${targetId}`;
// //         const loadingTask = window.pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true });
// //         const doc = await loadingTask.promise;
// //         setPdfDoc(doc);
// //         if (onTotalPagesChange) onTotalPagesChange(doc.numPages);
// //       } catch (err) { 
// //         console.error("PDF Loading Error:", err); 
// //       } finally { 
// //         setLoading(false); 
// //       }
// //     };
// //     loadPdfDoc();
// //   }, [fileUrl, fileId]);

// //   // ২. হাই-কোয়ালিটি রেন্ডারিং (Fix for multiple render operations)
// //   useEffect(() => {
// //     if (!pdfDoc || !canvasRef.current) return;
    
// //     let activeRenderTask = null;

// //     const renderPage = async () => {
// //       // আগের কোনো রেন্ডার চালু থাকলে তা ক্যান্সেল করা
// //       if (renderTaskRef.current) {
// //         try {
// //           renderTaskRef.current.cancel();
// //         } catch (err) { /* ignore cancel error */ }
// //       }

// //       try {
// //         const page = await pdfDoc.getPage(currentPage);
// //         const containerWidth = containerRef.current?.clientWidth || 700;
// //         const viewport = page.getViewport({ scale: 2.0 }); 
// //         const scale = (containerWidth - 40) / viewport.width;
// //         const scaledViewport = page.getViewport({ scale: 2.0 * scale });
        
// //         const canvas = canvasRef.current;
// //         const context = canvas.getContext('2d');
        
// //         canvas.width = scaledViewport.width;
// //         canvas.height = scaledViewport.height;
// //         setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });

// //         // নতুন রেন্ডার টাস্ক তৈরি
// //         activeRenderTask = page.render({ 
// //           canvasContext: context, 
// //           viewport: scaledViewport 
// //         });
        
// //         renderTaskRef.current = activeRenderTask;
// //         await activeRenderTask.promise;
// //       } catch (err) { 
// //         if (err.name !== 'RenderingCancelledException') {
// //           console.error("PDF Render Error:", err);
// //         }
// //       }
// //     };

// //     renderPage();

// //     // Cleanup: পেজ চেঞ্জ বা কম্পোনেন্ট আনমাউন্ট হলে রেন্ডার থামানো
// //     return () => {
// //       if (activeRenderTask) {
// //         activeRenderTask.cancel();
// //       }
// //     };
// //   }, [pdfDoc, currentPage]);

// //   // ৩. ক্লিক করে ফিল্ড বসানো
// //   const handleContainerClick = (e) => {
// //     if (readOnly || !pendingFieldType || loading) return;
// //     if (e.target !== e.currentTarget && !e.target.classList.contains('pdf-canvas')) return;
    
// //     const rect = e.currentTarget.getBoundingClientRect();
// //     const fW = pendingFieldType === 'signature' ? 20 : 15;
// //     const fH = pendingFieldType === 'signature' ? 6 : 4;
    
// //     const newField = {
// //       id: `field_${Date.now()}`,
// //       type: pendingFieldType,
// //       party_index: selectedPartyIndex,
// //       page: currentPage,
// //       x: (((e.clientX - rect.left) / canvasSize.width) * 100) - (fW / 2),
// //       y: (((e.clientY - rect.top) / canvasSize.height) * 100) - (fH / 2),
// //       width: fW,
// //       height: fH,
// //       value: '',
// //       filled: false,
// //     };
    
// //     onFieldsChange([...fields, newField]);
// //     if (onFieldPlaced) onFieldPlaced();
// //   };

// //   return (
// //     <div ref={containerRef} className="flex-1">
// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-center gap-4 mb-4">
// //           <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft className="w-4 h-4" /></Button>
// //           <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
// //           <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}><ChevronRight className="w-4 h-4" /></Button>
// //         </div>
// //       )}

// //       <div
// //         className="relative mx-auto shadow-xl rounded-xl overflow-hidden border border-slate-200 bg-white"
// //         style={{ width: canvasSize.width || '100%', minHeight: '500px', cursor: pendingFieldType ? 'crosshair' : 'default' }}
// //         onClick={handleContainerClick}
// //       >
// //         {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[100]"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>}
// //         <canvas ref={canvasRef} className="pdf-canvas block pointer-events-none" />

// //         {fields.filter(f => f.page === currentPage).map(field => {
// //           const color = parties?.[field.party_index]?.color || PARTY_COLORS[field.party_index % PARTY_COLORS.length];
// //           const isHighlighted = highlightPartyIndex === null || highlightPartyIndex === field.party_index;

// //           return (
// //             <Rnd
// //               key={field.id}
// //               size={{ 
// //                 width: (field.width / 100) * canvasSize.width, 
// //                 height: (field.height / 100) * canvasSize.height 
// //               }}
// //               position={{ 
// //                 x: (field.x / 100) * canvasSize.width, 
// //                 y: (field.y / 100) * canvasSize.height 
// //               }}
// //               onDragStop={(e, d) => {
// //                 const updated = fields.map(f => f.id === field.id ? { 
// //                   ...f, x: (d.x / canvasSize.width) * 100, y: (d.y / canvasSize.height) * 100 
// //                 } : f);
// //                 onFieldsChange(updated);
// //               }}
// //               onResizeStop={(e, dir, ref, delta, pos) => {
// //                 const updated = fields.map(f => f.id === field.id ? {
// //                   ...f,
// //                   width: (ref.offsetWidth / canvasSize.width) * 100,
// //                   height: (ref.offsetHeight / canvasSize.height) * 100,
// //                   x: (pos.x / canvasSize.width) * 100,
// //                   y: (pos.y / canvasSize.height) * 100
// //                 } : f);
// //                 onFieldsChange(updated);
// //               }}
// //               bounds="parent"
// //               enableResizing={!readOnly}
// //               disableDragging={readOnly}
// //               className={`z-10 ${isHighlighted ? 'opacity-100' : 'opacity-30'}`}
// //               onClick={(e) => e.stopPropagation()}
// //             >
// //               <div className="w-full h-full rounded-md border-2 flex items-center justify-center relative group" style={{ borderColor: color, backgroundColor: `${color}15` }}>
// //                 <div className="flex items-center gap-1 px-1.5 pointer-events-none">
// //                   {field.type === 'signature' ? <PenTool className="w-3 h-3" style={{ color }} /> : <Type className="w-3 h-3" style={{ color }} />}
// //                   <span className="text-[10px] font-semibold truncate" style={{ color }}>{parties?.[field.party_index]?.name || 'Signer'}</span>
// //                 </div>
// //                 {!readOnly && (
// //                   <button 
// //                     className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-sm" 
// //                     onClick={(e) => { e.stopPropagation(); onFieldsChange(fields.filter(f => f.id !== field.id)); }}
// //                   >
// //                     <Trash2 className="w-3 h-3" />
// //                   </button>
// //                 )}
// //               </div>
// //             </Rnd>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }

// // import React, { useRef, useState, useEffect } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ChevronLeft, ChevronRight, Trash2, PenTool, Type, Loader2 } from 'lucide-react';
// // import { Rnd } from 'react-rnd';

// // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// // export default function PdfViewer({
// //   fileUrl,
// //   fileId,
// //   fields,
// //   onFieldsChange,
// //   currentPage,
// //   onPageChange,
// //   totalPages,
// //   onTotalPagesChange,
// //   pendingFieldType,
// //   selectedPartyIndex,
// //   parties,
// //   onFieldPlaced,
// //   readOnly = false,
// //   highlightPartyIndex = null,
// // }) {
// //   const canvasRef = useRef(null);
// //   const containerRef = useRef(null);
// //   const renderTaskRef = useRef(null);
// //   const [pdfDoc, setPdfDoc] = useState(null);
// //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
// //   const [loading, setLoading] = useState(true);

// //   // ১. PDF লোড করার লজিক
// //   useEffect(() => {
// //     if (!fileUrl && !fileId) return;
// //     const loadPdfDoc = async () => {
// //       setLoading(true);
// //       try {
// //         const targetId = fileId || fileUrl.split('/').pop();
// //         const proxyUrl = `http://localhost:5001/api/documents/proxy/${targetId}`;
// //         const loadingTask = window.pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true });
// //         const doc = await loadingTask.promise;
// //         setPdfDoc(doc);
// //         if (onTotalPagesChange) onTotalPagesChange(doc.numPages);
// //       } catch (err) { 
// //         console.error("PDF Loading Error:", err); 
// //       } finally { 
// //         setLoading(false); 
// //       }
// //     };
// //     loadPdfDoc();
// //   }, [fileUrl, fileId]);

// //   // ২. হাই-কোয়ালিটি রেন্ডারিং (Fixed Cleanup Logic)
// //   useEffect(() => {
// //     if (!pdfDoc || !canvasRef.current) return;
    
// //     const renderPage = async () => {
// //       // ✅ আগের রেন্ডার টাস্ক থাকলে তা ক্যানসেল করা এবং শেষ হওয়ার অপেক্ষা করা
// //       if (renderTaskRef.current) {
// //         renderTaskRef.current.cancel();
// //       }

// //       try {
// //         const page = await pdfDoc.getPage(currentPage);
// //         const containerWidth = containerRef.current?.clientWidth || 700;
        
// //         // ডিপিআই (DPI) ঠিক রাখার জন্য স্কেল অ্যাডজাস্টমেন্ট
// //         const viewport = page.getViewport({ scale: 1.5 }); 
// //         const scale = (containerWidth - 40) / viewport.width;
// //         const scaledViewport = page.getViewport({ scale: 1.5 * scale });
        
// //         const canvas = canvasRef.current;
// //         const context = canvas.getContext('2d');
        
// //         canvas.width = scaledViewport.width;
// //         canvas.height = scaledViewport.height;
// //         setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });

// //         const renderContext = {
// //           canvasContext: context,
// //           viewport: scaledViewport,
// //         };

// //         const renderTask = page.render(renderContext);
// //         renderTaskRef.current = renderTask; // টাস্ক রেফারেন্সে রাখা

// //         await renderTask.promise;
// //       } catch (err) { 
// //         if (err.name !== 'RenderingCancelledException') {
// //           console.error("PDF Render Error:", err);
// //         }
// //       }
// //     };

// //     renderPage();

// //     // Cleanup: পেজ চেঞ্জ বা কম্পোনেন্ট আনমাউন্ট হলে রেন্ডার থামানো
// //     return () => {
// //       if (renderTaskRef.current) {
// //         renderTaskRef.current.cancel();
// //       }
// //     };
// //   }, [pdfDoc, currentPage]);

// //   // ৩. ক্লিক করে ফিল্ড বসানো
// //   const handleContainerClick = (e) => {
// //     if (readOnly || !pendingFieldType || loading) return;
    
// //     // শুধু ক্যানভাস বা কন্টেইনারে ক্লিক করলে কাজ করবে
// //     const isCanvas = e.target.classList.contains('pdf-canvas');
// //     const isContainer = e.target.classList.contains('canvas-container');
// //     if (!isCanvas && !isContainer) return;
    
// //     const rect = containerRef.current.querySelector('.canvas-container').getBoundingClientRect();
    
// //     const fW = pendingFieldType === 'signature' ? 22 : 18;
// //     const fH = pendingFieldType === 'signature' ? 8 : 5;
    
// //     const newField = {
// //       id: `field_${Date.now()}`,
// //       type: pendingFieldType,
// //       party_index: selectedPartyIndex,
// //       page: currentPage,
// //       x: (((e.clientX - rect.left) / canvasSize.width) * 100) - (fW / 2),
// //       y: (((e.clientY - rect.top) / canvasSize.height) * 100) - (fH / 2),
// //       width: fW,
// //       height: fH,
// //       value: '',
// //       filled: false,
// //     };
    
// //     onFieldsChange([...fields, newField]);
// //     if (onFieldPlaced) onFieldPlaced();
// //   };

// //   return (
// //     <div ref={containerRef} className="flex-1 w-full overflow-hidden">
// //       {totalPages > 1 && (
// //         <div className="flex items-center justify-center gap-4 mb-4 select-none">
// //           <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
// //             <ChevronLeft className="w-4 h-4" />
// //           </Button>
// //           <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
// //             Page {currentPage} / {totalPages}
// //           </span>
// //           <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
// //             <ChevronRight className="w-4 h-4" />
// //           </Button>
// //         </div>
// //       )}

// //       <div
// //         className="canvas-container relative mx-auto shadow-2xl rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50 transition-all"
// //         style={{ 
// //           width: canvasSize.width || '100%', 
// //           height: canvasSize.height || '600px',
// //           cursor: pendingFieldType ? 'crosshair' : 'default' 
// //         }}
// //         onClick={handleContainerClick}
// //       >
// //         {loading && (
// //           <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-[100] gap-2">
// //             <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
// //             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rendering PDF...</p>
// //           </div>
// //         )}
        
// //         <canvas ref={canvasRef} className="pdf-canvas block pointer-events-none" />

// //         {fields.filter(f => f.page === currentPage).map(field => {
// //           const color = parties?.[field.party_index]?.color || PARTY_COLORS[field.party_index % PARTY_COLORS.length];
// //           const isHighlighted = highlightPartyIndex === null || highlightPartyIndex === field.party_index;

// //           return (
// //             <Rnd
// //               key={field.id}
// //               size={{ 
// //                 width: (field.width / 100) * canvasSize.width, 
// //                 height: (field.height / 100) * canvasSize.height 
// //               }}
// //               position={{ 
// //                 x: (field.x / 100) * canvasSize.width, 
// //                 y: (field.y / 100) * canvasSize.height 
// //               }}
// //               onDragStop={(e, d) => {
// //                 const updated = fields.map(f => f.id === field.id ? { 
// //                   ...f, x: (d.x / canvasSize.width) * 100, y: (d.y / canvasSize.height) * 100 
// //                 } : f);
// //                 onFieldsChange(updated);
// //               }}
// //               onResizeStop={(e, dir, ref, delta, pos) => {
// //                 const updated = fields.map(f => f.id === field.id ? {
// //                   ...f,
// //                   width: (ref.offsetWidth / canvasSize.width) * 100,
// //                   height: (ref.offsetHeight / canvasSize.height) * 100,
// //                   x: (pos.x / canvasSize.width) * 100,
// //                   y: (pos.y / canvasSize.height) * 100
// //                 } : f);
// //                 onFieldsChange(updated);
// //               }}
// //               bounds="parent"
// //               enableResizing={!readOnly}
// //               disableDragging={readOnly}
// //               className={`z-20 ${isHighlighted ? 'opacity-100' : 'opacity-20 pointer-events-none transition-opacity'}`}
// //               onClick={(e) => e.stopPropagation()}
// //             >
// //               <div 
// //                 className="w-full h-full rounded border-2 flex items-center justify-center relative group shadow-sm backdrop-blur-[1px]" 
// //                 style={{ borderColor: color, backgroundColor: `${color}15` }}
// //               >
// //                 <div className="flex items-center gap-1.5 px-2 pointer-events-none select-none">
// //                   {field.type === 'signature' ? <PenTool size={14} style={{ color }} /> : <Type size={14} style={{ color }} />}
// //                   <span className="text-[11px] font-bold uppercase tracking-tight truncate" style={{ color }}>
// //                     {parties?.[field.party_index]?.name || `Party ${field.party_index + 1}`}
// //                   </span>
// //                 </div>
                
// //                 {!readOnly && (
// //                   <button 
// //                     className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 shadow-md hover:scale-110 active:scale-95" 
// //                     onClick={(e) => { 
// //                       e.stopPropagation(); 
// //                       onFieldsChange(fields.filter(f => f.id !== field.id)); 
// //                     }}
// //                   >
// //                     <Trash2 size={12} strokeWidth={3} />
// //                   </button>
// //                 )}
// //               </div>
// //             </Rnd>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }

// // import React, { useRef, useState, useEffect } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { ChevronLeft, ChevronRight, Trash2, PenTool, Type, Loader2 } from 'lucide-react';
// // import { Rnd } from 'react-rnd';

// // // ১. pdfjs ইম্পোর্ট এবং ওয়ার্কার সেটআপ
// // import * as pdfjsLib from 'pdfjs-dist';

// // // ওয়ার্কার পাথ সেট করা (এটি আপনার প্রজেক্টের node_modules থেকে ফাইলটি নিবে)
// // pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
// //   'pdfjs-dist/build/pdf.worker.min.mjs',
// //   import.meta.url
// // ).toString();
// import React, { useRef, useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { ChevronLeft, ChevronRight, Trash2, PenTool, Type, Loader2 } from 'lucide-react';
// import { Rnd } from 'react-rnd';

// // ১. লেগাসি বিল্ড ইম্পোর্ট (স্ট্যাবিলিটির জন্য)
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// // ২. সঠিক ওয়ার্কার পাথ (unpkg ব্যবহার করা হয়েছে যা আপনার এররটি দূর করবে)
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.5.207/legacy/build/pdf.worker.min.mjs';

// const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// export default function PdfViewer({
//   fileUrl, fileId, fields, onFieldsChange, currentPage, onPageChange,
//   totalPages, onTotalPagesChange, pendingFieldType, selectedPartyIndex,
//   parties, onFieldPlaced, readOnly = false, highlightPartyIndex = null,
// }) {
//   const canvasRef = useRef(null);
//   const containerRef = useRef(null);
//   const renderTaskRef = useRef(null);
//   const [pdfDoc, setPdfDoc] = useState(null);
//   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
//   const [loading, setLoading] = useState(true);

//   // ৩. ফিক্সড PDF লোড লজিক (প্রক্সি ইউআরএল হ্যান্ডলিং)
//   useEffect(() => {
//     if (!fileUrl && !fileId) return;
    
//     const loadPdfDoc = async () => {
//       setLoading(true);
//       try {
//         // আইডি ক্লিন করা: nexsign_docs/id থাকলে সেটাকে সঠিকভাবে হ্যান্ডল করা
//         let cleanId = fileId;
//         if (!cleanId && typeof fileUrl === 'string') {
//           cleanId = fileUrl.split('/').pop();
//         }

//         // আপনার ব্যাকএন্ড এন্ডপয়েন্ট (৫০০১ পোর্ট)
// const proxyUrl = `https://nextsignbackendfinal.vercel.app/api/documents/proxy/${cleanId}`;
//         console.log("Loading PDF from:", proxyUrl);

//         const loadingTask = pdfjsLib.getDocument({ 
//           url: proxyUrl, 
//           withCredentials: true 
//         });
        
//         const doc = await loadingTask.promise;
//         setPdfDoc(doc);
//         if (onTotalPagesChange) onTotalPagesChange(doc.numPages);
//       } catch (err) { 
//         console.error("PDF Loading Error:", err); 
//       } finally { 
//         setLoading(false); 
//       }
//     };
//     loadPdfDoc();
//   }, [fileUrl, fileId, onTotalPagesChange]);

//   // ৪. হাই-কোয়ালিটি রেন্ডারিং লজিক
//   useEffect(() => {
//     if (!pdfDoc || !canvasRef.current) return;
    
//     const renderPage = async () => {
//       if (renderTaskRef.current) renderTaskRef.current.cancel();

//       try {
//         const page = await pdfDoc.getPage(currentPage);
//         const containerWidth = containerRef.current?.clientWidth || 700;
        
//         const viewport = page.getViewport({ scale: 1.5 }); 
//         const scale = (containerWidth - 40) / viewport.width;
//         const scaledViewport = page.getViewport({ scale: 1.5 * scale });
        
//         const canvas = canvasRef.current;
//         const context = canvas.getContext('2d', { alpha: false });
        
//         canvas.width = scaledViewport.width;
//         canvas.height = scaledViewport.height;
//         setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });

//         const renderContext = { canvasContext: context, viewport: scaledViewport };
//         const renderTask = page.render(renderContext);
//         renderTaskRef.current = renderTask;

//         await renderTask.promise;
//       } catch (err) { 
//         if (err.name !== 'RenderingCancelledException') console.error("Render Error:", err);
//       }
//     };

//     renderPage();
//     return () => renderTaskRef.current?.cancel();
//   }, [pdfDoc, currentPage]);

// //  const handleContainerClick = (e) => {
// //   if (readOnly || !pendingFieldType || loading) return;
// //   if (!e.target.classList.contains('pdf-canvas')) return;
  
// //   const rect = canvasRef.current.getBoundingClientRect();
// //   const fW = pendingFieldType === 'signature' ? 22 : 18;
// //   const fH = pendingFieldType === 'signature' ? 8 : 5;
  
// //   const newField = {
// //     id: `field_${Date.now()}`,
// //     type: pendingFieldType,
// //     page: currentPage,
// //     x: (((e.clientX - rect.left) / canvasSize.width) * 100) - (fW / 2),
// //     y: (((e.clientY - rect.top) / canvasSize.height) * 100) - (fH / 2),
// //     width: fW, 
// //     height: fH, 
// //     value: '', 
// //     filled: false,

// //     // *** এই ৩টি লাইন নিশ্চিত করুন ***
// //     // 'party_index' এর বদলে 'partyIndex' এবং 'signerIndex' দুটোই পাঠান যাতে ব্যাকএন্ডে কোনো এরর না হয়
// //     partyIndex: Number(selectedPartyIndex),
// //     signerIndex: Number(selectedPartyIndex),
// //     party_index: Number(selectedPartyIndex) // সেফটির জন্য আগেরটাও রাখা হলো
// //   };
  
// //   onFieldsChange([...fields, newField]);
// //   if (onFieldPlaced) onFieldPlaced();
// // };
// const handleContainerClick = (e) => {
//     if (readOnly || !pendingFieldType || loading) return;
//     if (!e.target.classList.contains('pdf-canvas')) return;
    
//     const rect = canvasRef.current.getBoundingClientRect();
//     const fW = pendingFieldType === 'signature' ? 22 : 18;
//     const fH = pendingFieldType === 'signature' ? 8 : 5;
    
//     const newField = {
//       // 🌟 FIX: ইউনিক আইডি জেনারেটর (যাতে কখনোই কোনো আইডি ম্যাচ না করে)
//       id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
//       type: pendingFieldType,
//       page: currentPage,
//       x: (((e.clientX - rect.left) / canvasSize.width) * 100) - (fW / 2),
//       y: (((e.clientY - rect.top) / canvasSize.height) * 100) - (fH / 2),
//       width: fW, 
//       height: fH, 
//       value: '', 
//       filled: false,
//       partyIndex: Number(selectedPartyIndex),
//       signerIndex: Number(selectedPartyIndex),
//       party_index: Number(selectedPartyIndex)
//     };
    
//     onFieldsChange([...fields, newField]);
//     if (onFieldPlaced) onFieldPlaced();
//   };
//   return (
//     <div ref={containerRef} className="flex-1 w-full overflow-hidden">
//       {/* {totalPages > 1 && (
//         <div className="flex items-center justify-center gap-4 mb-4 select-none">
//           <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
//             <ChevronLeft className="w-4 h-4" />
//           </Button>
//           <span className="text-sm font-bold bg-slate-100 px-3 py-1 rounded-full">Page {currentPage} / {totalPages}</span>
//           <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
//             <ChevronRight className="w-4 h-4" />
//           </Button>
//         </div>
//       )} */}

//       {/* সরাসরি pdfDoc থেকে পেজ সংখ্যা চেক করা হচ্ছে */}
// {pdfDoc && pdfDoc.numPages > 1 && (
//   <div className="flex items-center justify-center gap-4 mb-4 select-none">
//     <Button 
//       variant="outline" 
//       size="icon" 
//       disabled={currentPage <= 1} 
//       onClick={() => onPageChange(currentPage - 1)}
//       className="rounded-xl border-[#28ABDF]/30 text-[#28ABDF] hover:bg-[#28ABDF]/5"
//     >
//       <ChevronLeft className="w-4 h-4" />
//     </Button>

//     <span className="text-sm font-bold bg-[#28ABDF]/10 text-[#28ABDF] px-4 py-1.5 rounded-full border border-[#28ABDF]/20">
//       Page {currentPage} of {pdfDoc.numPages}
//     </span>

//     <Button 
//       variant="outline" 
//       size="icon" 
//       disabled={currentPage >= pdfDoc.numPages} 
//       onClick={() => onPageChange(currentPage + 1)}
//       className="rounded-xl border-[#28ABDF]/30 text-[#28ABDF] hover:bg-[#28ABDF]/5"
//     >
//       <ChevronRight className="w-4 h-4" />
//     </Button>
//   </div>
// )}

//       <div className="canvas-container relative mx-auto shadow-2xl border bg-white rounded-lg overflow-hidden"
//         style={{ width: canvasSize.width || '100%', height: canvasSize.height || '600px', cursor: pendingFieldType ? 'crosshair' : 'default' }}
//         onClick={handleContainerClick}
//       >
//         {loading && (
//           <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-50 gap-2">
//             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rendering PDF...</p>
//           </div>
//         )}
        
//         <canvas ref={canvasRef} className="pdf-canvas block mx-auto" />

//         {fields.filter(f => f.page === currentPage).map(field => {
//           const color = parties?.[field.party_index]?.color || PARTY_COLORS[field.party_index % PARTY_COLORS.length];
//           const isHighlighted = highlightPartyIndex === null || highlightPartyIndex === field.party_index;
//           return (
//             // <Rnd
//             //   key={field.id}
//             //   size={{ width: (field.width / 100) * canvasSize.width, height: (field.height / 100) * canvasSize.height }}
//             //   position={{ x: (field.x / 100) * canvasSize.width, y: (field.y / 100) * canvasSize.height }}
//             //   onDragStop={(e, d) => onFieldsChange(fields.map(f => f.id === field.id ? { ...f, x: (d.x / canvasSize.width) * 100, y: (d.y / canvasSize.height) * 100 } : f))}
//             //   bounds="parent" disableDragging={readOnly}
//             //   className={`z-20 ${isHighlighted ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}
//             // >
//             //   <div className="w-full h-full border-2 flex items-center justify-center relative group" style={{ borderColor: color, backgroundColor: `${color}15` }}>
//             //     <span className="text-[10px] font-bold uppercase truncate px-1" style={{ color }}>{field.type}</span>
//             //     {!readOnly && (
//             //       <button className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-lg transition-opacity" onClick={(e) => { e.stopPropagation(); onFieldsChange(fields.filter(f => f.id !== field.id)); }}>
//             //         <Trash2 size={10} />
//             //       </button>
//             //     )}
//             //   </div>
//             // </Rnd>
//         <Rnd
//   key={field.id}
//   size={{ 
//     width: (field.width / 100) * canvasSize.width, 
//     height: (field.height / 100) * canvasSize.height 
//   }}
//   position={{ 
//     x: (field.x / 100) * canvasSize.width, 
//     y: (field.y / 100) * canvasSize.height 
//   }}
//   // ড্র্যাগ (নাড়াচাড়া) করার পর পজিশন সেভ করা
//   // onDragStop={(e, d) => {
//   //   const updated = fields.map(f => f.id === field.id ? { 
//   //     ...f, 
//   //     x: (d.x / canvasSize.width) * 100, 
//   //     y: (d.y / canvasSize.height) * 100 
//   //   } : f);
//   //   onFieldsChange(updated);
//   // }}
// onDragStop={(e, d) => {
//   const updated = fields.map(f => f.id === field.id ? { 
//     ...f, 
//     x: Number(((d.x / canvasSize.width) * 100).toFixed(4)), 
//     y: Number(((d.y / canvasSize.height) * 100).toFixed(4)) 
//   } : f);
//   onFieldsChange(updated);
// }}

//   // রিসাইজ (বড়/ছোট) করার পর নতুন সাইজ সেভ করা (এটিই আপনার সমস্যা সমাধান করবে)
//   onResizeStop={(e, direction, ref, delta, position) => {
//     const updated = fields.map(f => f.id === field.id ? {
//       ...f,
//       width: (parseFloat(ref.style.width) / canvasSize.width) * 100,
//       height: (parseFloat(ref.style.height) / canvasSize.height) * 100,
//       x: (position.x / canvasSize.width) * 100,
//       y: (position.y / canvasSize.height) * 100
//     } : f);
//     onFieldsChange(updated);
//   }}
//   bounds="parent"
//   enableResizing={!readOnly}
//   disableDragging={readOnly}
//   className="z-20"
//   onClick={(e) => e.stopPropagation()}
// >
//   {/* এখানে আপনার আগের <div> ট্যাগটি থাকবে যা দিয়ে বর্ডার এবং নাম দেখা যায় */}
//   <div className="w-full h-full border-2 flex items-center justify-center relative group" 
//        style={{ borderColor: parties?.[field.party_index]?.color || '#000', backgroundColor: 'rgba(255,255,255,0.6)' }}>
//     <span className="text-[9px] font-bold uppercase" style={{ color: parties?.[field.party_index]?.color }}>
//       {field.type}
//     </span>
//   </div>
// </Rnd>  );
//         })}
//       </div>
//     </div>
//   );
// }


import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { Rnd } from 'react-rnd';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.5.207/legacy/build/pdf.worker.min.mjs';

const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function PdfViewer({
  fileUrl, fileId, fields, onFieldsChange, currentPage, onPageChange,
  pendingFieldType, selectedPartyIndex, parties, readOnly = false
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);

  // PDF লোডিং লজিক
  useEffect(() => {
    if (!fileUrl && !fileId) return;
    const loadPdfDoc = async () => {
      setLoading(true);
      try {
        const cleanId = fileId || (typeof fileUrl === 'string' ? fileUrl.split('/').pop() : '');
        const proxyUrl = `https://nextsignbackendfinal.vercel.app/api/documents/proxy/${cleanId}`;
        const loadingTask = pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
      } catch (err) {
        console.error("PDF Loading Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPdfDoc();
  }, [fileUrl, fileId]);

  // হাই-কোয়ালিটি রেন্ডারিং
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    const renderPage = async () => {
      if (renderTaskRef.current) renderTaskRef.current.cancel();
      try {
        const page = await pdfDoc.getPage(currentPage);
        const containerWidth = containerRef.current?.clientWidth || 700;
        const viewport = page.getViewport({ scale: 1.5 });
        const scale = (containerWidth - 40) / viewport.width;
        const scaledViewport = page.getViewport({ scale: 1.5 * scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });

        await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') console.error("Render Error:", err);
      }
    };
    renderPage();
  }, [pdfDoc, currentPage]);

  const handleContainerClick = (e) => {
    if (readOnly || !pendingFieldType || loading || !e.target.classList.contains('pdf-canvas')) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    // ডিফল্ট সাইজ (পারসেন্টেজে)
    const fW = pendingFieldType === 'signature' ? 22 : 18;
    const fH = pendingFieldType === 'signature' ? 8 : 5;

    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: pendingFieldType,
      page: currentPage,
      x: Number((((e.clientX - rect.left) / canvasSize.width) * 100 - fW / 2).toFixed(4)),
      y: Number((((e.clientY - rect.top) / canvasSize.height) * 100 - fH / 2).toFixed(4)),
      width: fW,
      height: fH,
      partyIndex: Number(selectedPartyIndex),
      party_index: Number(selectedPartyIndex)
    };
    onFieldsChange([...fields, newField]);
  };

  return (
    <div ref={containerRef} className="flex-1 w-full overflow-hidden p-4">
      {pdfDoc && pdfDoc.numPages > 1 && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} className="rounded-xl border-[#28ABDF]/30 text-[#28ABDF]">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-black bg-[#28ABDF]/10 text-[#28ABDF] px-5 py-2 rounded-full border border-[#28ABDF]/20 uppercase tracking-widest">
            Page {currentPage} of {pdfDoc.numPages}
          </span>
          <Button variant="outline" size="icon" disabled={currentPage >= pdfDoc.numPages} onClick={() => onPageChange(currentPage + 1)} className="rounded-xl border-[#28ABDF]/30 text-[#28ABDF]">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="canvas-container relative mx-auto shadow-2xl border bg-white rounded-xl overflow-hidden"
        style={{ width: canvasSize.width || '100%', height: canvasSize.height || '600px', cursor: pendingFieldType ? 'crosshair' : 'default' }}
        onClick={handleContainerClick}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-50">
            <Loader2 className="w-10 h-10 animate-spin text-[#28ABDF]" />
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Processing PDF Layout...</p>
          </div>
        )}
        
        <canvas ref={canvasRef} className="pdf-canvas block mx-auto" />

        {fields.filter(f => f.page === currentPage).map(field => {
          const partyColor = parties?.[field.partyIndex]?.color || PARTY_COLORS[field.partyIndex % PARTY_COLORS.length];
          const partyName = parties?.[field.partyIndex]?.name || `Party ${field.partyIndex + 1}`;

          return (
            <Rnd
              key={field.id}
              size={{ width: `${field.width}%`, height: `${field.height}%` }}
              position={{ x: (field.x / 100) * canvasSize.width, y: (field.y / 100) * canvasSize.height }}
              onDragStop={(e, d) => {
                onFieldsChange(fields.map(f => f.id === field.id ? { 
                  ...f, 
                  x: Number(((d.x / canvasSize.width) * 100).toFixed(4)), 
                  y: Number(((d.y / canvasSize.height) * 100).toFixed(4)) 
                } : f));
              }}
              onResizeStop={(e, dir, ref, delta, pos) => {
                onFieldsChange(fields.map(f => f.id === field.id ? {
                  ...f,
                  width: Number(((parseFloat(ref.style.width) / canvasSize.width) * 100).toFixed(4)),
                  height: Number(((parseFloat(ref.style.height) / canvasSize.height) * 100).toFixed(4)),
                  x: Number(((pos.x / canvasSize.width) * 100).toFixed(4)),
                  y: Number(((pos.y / canvasSize.height) * 100).toFixed(4))
                } : f));
              }}
              bounds="parent"
              enableResizing={!readOnly}
              disableDragging={readOnly}
              className="z-20 group"
            >
              <div 
                className="w-full h-full border-2 flex items-center justify-center relative bg-white/60 backdrop-blur-[1px] transition-all"
                style={{ borderColor: partyColor }}
              >
                {/* পার্টি লেবেল */}
                <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase truncate max-w-full" style={{ backgroundColor: partyColor }}>
                  {partyName}
                </div>

                <span className="text-[9px] font-black uppercase tracking-tighter" style={{ color: partyColor }}>
                  {field.type}
                </span>

                {!readOnly && (
                  <button 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-110" 
                    onClick={(e) => { e.stopPropagation(); onFieldsChange(fields.filter(f => f.id !== field.id)); }}
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
}