// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { base44 } from '@/api/base44Client';
// // // import { createPageUrl } from '@/utils';
// // // import { Button } from '@/components/ui/button';
// // // import { Input } from '@/components/ui/input';
// // // import { Card } from '@/components/ui/card';
// // // import { Badge } from '@/components/ui/badge';
// // // import {
// // //   Dialog,
// // //   DialogContent,
// // //   DialogHeader,
// // //   DialogTitle,
// // // } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { 
// // //   FileSignature, CheckCircle2, Loader2, AlertCircle,
// // //   PenTool, Type, ChevronLeft, ChevronRight
// // // } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';

// // // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); // renamed from 'document' to avoid clash with window.document
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState('');
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);
// // //   const [currentPage, setCurrentPage] = useState(1);

// // //   const canvasRef = useRef(null);
// // //   const containerRef = useRef(null);
// // //   const [pdfDoc, setPdfDoc] = useState(null);
// // //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

// // //   useEffect(() => {
// // //     loadSession();
// // //   }, [token]);

// // //   const loadSession = async () => {
// // //     if (!token) {
// // //       setError('Invalid signing link. Please check your email for the correct link.');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     const allSessions = await base44.entities.SigningSession.list('-created_date', 500);
// // //     const sessions = allSessions.filter(s => s.token === token);
// // //     if (sessions.length === 0) {
// // //       setError('Signing session not found or expired. Please contact the document sender.');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     const s = sessions[0];
// // //     if (s.status === 'signed') {
// // //       setCompleted(true);
// // //       setSession(s);
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     setSession(s);

// // //     // Update session status to opened
// // //     await base44.entities.SigningSession.update(s.id, { status: 'opened' });

// // //     // Load document
// // //     const allDocs = await base44.entities.Document.list('-created_date', 200);
// // //     const docs = allDocs.filter(d => d.id === s.document_id);
// // //     if (docs.length === 0) {
// // //       setError('Document not found.');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     const doc = docs[0];
// // //     setDocData(doc);
// // //     setFields(doc.fields || []);

// // //     // Log audit
// // //     await base44.entities.AuditLog.create({
// // //       document_id: s.document_id,
// // //       action: 'opened',
// // //       party_name: s.signer_name,
// // //       party_email: s.signer_email,
// // //       details: `${s.signer_name} opened the signing link`,
// // //       timestamp: new Date().toISOString(),
// // //     });

// // //     setLoading(false);
// // //   };

// // //   // Load PDF using window.document (DOM) safely
// // //   useEffect(() => {
// // //     if (!docData?.file_url) return;

// // //     const loadPdf = () => {
// // //       if (!window.pdfjsLib) {
// // //         const script = window.document.createElement('script');
// // //         script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// // //         script.onload = () => {
// // //           window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// // //           doLoad();
// // //         };
// // //         window.document.head.appendChild(script);
// // //       } else {
// // //         doLoad();
// // //       }
// // //     };

// // //     const doLoad = async () => {
// // //       const pdf = await window.pdfjsLib.getDocument({
// // //         url: docData.file_url,
// // //         cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
// // //         cMapPacked: true,
// // //       }).promise;
// // //       setPdfDoc(pdf);
// // //     };

// // //     loadPdf();
// // //   }, [docData?.file_url]);

// // //   useEffect(() => {
// // //     if (!pdfDoc || !canvasRef.current) return;
// // //     const renderPage = async () => {
// // //       const page = await pdfDoc.getPage(currentPage);
// // //       const containerWidth = containerRef.current?.clientWidth || 600;
// // //       const viewport = page.getViewport({ scale: 1 });
// // //       const scale = Math.min((containerWidth - 32) / viewport.width, 1.5);
// // //       const scaledViewport = page.getViewport({ scale });
// // //       const canvas = canvasRef.current;
// // //       canvas.width = scaledViewport.width;
// // //       canvas.height = scaledViewport.height;
// // //       setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });
// // //       const ctx = canvas.getContext('2d');
// // //       await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
// // //     };
// // //     renderPage();
// // //   }, [pdfDoc, currentPage]);

// // //   const myFields = fields.filter(f => f.party_index === session?.party_index);
// // //   const pageFields = fields.filter(f => f.page === currentPage);
// // //   const myUnfilledFields = myFields.filter(f => !f.filled);
// // //   const allMyFieldsFilled = myFields.length > 0 && myUnfilledFields.length === 0;

// // //   const handleFieldClick = (field) => {
// // //     if (field.party_index !== session?.party_index) return;
// // //     if (field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     if (field.type === 'signature') {
// // //       setShowSigPad(true);
// // //     }
// // //     // for text type, the dialog will open via the activeFieldId state
// // //   };

// // //   const handleSignature = (sigData) => {
// // //     const updated = fields.map(f =>
// // //       f.id === activeFieldId ? { ...f, value: sigData.value, filled: true } : f
// // //     );
// // //     setFields(updated);
// // //     setShowSigPad(false);
// // //     setActiveFieldId(null);
// // //     toast.success('Signature applied');
// // //   };

// // //   const handleTextInput = (fieldId, value) => {
// // //     const updated = fields.map(f =>
// // //       f.id === fieldId ? { ...f, value, filled: value.trim().length > 0 } : f
// // //     );
// // //     setFields(updated);
// // //   };

// // //   const handleSubmit = async () => {
// // //     if (!allMyFieldsFilled) {
// // //       toast.error('Please fill in all your assigned fields before submitting');
// // //       return;
// // //     }

// // //     setSubmitting(true);

// // //     // Update document fields and party status
// // //     const updatedParties = [...docData.parties];
// // //     updatedParties[session.party_index] = {
// // //       ...updatedParties[session.party_index],
// // //       status: 'signed',
// // //       signed_at: new Date().toISOString(),
// // //     };

// // //     const isLastSigner = session.party_index === docData.parties.length - 1;
// // //     const nextPartyIndex = session.party_index + 1;

// // //     const docUpdate = {
// // //       fields,
// // //       parties: updatedParties,
// // //       status: isLastSigner ? 'completed' : 'in_progress',
// // //       current_party_index: isLastSigner ? session.party_index : nextPartyIndex,
// // //     };

// // //     await base44.entities.Document.update(docData.id, docUpdate);

// // //     // Update session
// // //     const fieldValues = myFields.map(f => ({ field_id: f.id, value: f.value }));
// // //     await base44.entities.SigningSession.update(session.id, {
// // //       status: 'signed',
// // //       signed_at: new Date().toISOString(),
// // //       field_values: fieldValues,
// // //     });

// // //     // Audit log
// // //     await base44.entities.AuditLog.create({
// // //       document_id: docData.id,
// // //       action: 'signed',
// // //       party_name: session.signer_name,
// // //       party_email: session.signer_email,
// // //       details: `${session.signer_name} signed the document`,
// // //       timestamp: new Date().toISOString(),
// // //     });

// // //     if (isLastSigner) {
// // //       // Document completed — notify all parties
// // //       await base44.entities.AuditLog.create({
// // //         document_id: docData.id,
// // //         action: 'completed',
// // //         details: 'All parties have signed. Document completed.',
// // //         timestamp: new Date().toISOString(),
// // //       });

// // //       for (const party of docData.parties) {
// // //         await base44.integrations.Core.SendEmail({
// // //           to: party.email,
// // //           subject: `[Nexsign] Completed: ${docData.title}`,
// // //           body: `
// // //             <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
// // //               <h1 style="color: #0ea5e9; font-size: 24px; text-align: center;">Nexsign</h1>
// // //               <h2 style="color: #1e293b; font-size: 20px;">Document Fully Signed</h2>
// // //               <p style="color: #64748b; line-height: 1.6;">
// // //                 Hi ${party.name},<br><br>
// // //                 All parties have signed <strong>"${docData.title}"</strong>. 
// // //                 The document signing process is now complete.
// // //               </p>
// // //               <p style="color: #22c55e; font-weight: 600; text-align: center; font-size: 18px; margin: 24px 0;">
// // //                 ✅ Document Complete
// // //               </p>
// // //             </div>
// // //           `
// // //         });
// // //       }
// // //     } else {
// // //       // Send to next signer
// // //       const nextParty = updatedParties[nextPartyIndex];
// // //       updatedParties[nextPartyIndex] = { ...nextParty, status: 'sent' };
// // //       await base44.entities.Document.update(docData.id, { parties: updatedParties });

// // //       const nextToken = `${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
// // //       await base44.entities.SigningSession.create({
// // //         document_id: docData.id,
// // //         party_index: nextPartyIndex,
// // //         token: nextToken,
// // //         signer_name: nextParty.name,
// // //         signer_email: nextParty.email,
// // //         status: 'pending',
// // //       });

// // //       const nextSigningUrl = `${window.location.origin}${createPageUrl('SignerView')}?token=${nextToken}`;
// // //       await base44.integrations.Core.SendEmail({
// // //         to: nextParty.email,
// // //         subject: `[Nexsign] Please sign: ${docData.title}`,
// // //         body: `
// // //           <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
// // //             <h1 style="color: #0ea5e9; font-size: 24px; text-align: center;">Nexsign</h1>
// // //             <h2 style="color: #1e293b; font-size: 20px;">Your turn to sign</h2>
// // //             <p style="color: #64748b; line-height: 1.6;">
// // //               Hi ${nextParty.name},<br><br>
// // //               It's your turn to sign <strong>"${docData.title}"</strong>.
// // //               Please click the button below to review and sign.
// // //             </p>
// // //             <div style="text-align: center; margin: 32px 0;">
// // //               <a href="${nextSigningUrl}" style="background-color: #0ea5e9; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
// // //                 Review & Sign
// // //               </a>
// // //             </div>
// // //           </div>
// // //         `
// // //       });

// // //       await base44.entities.AuditLog.create({
// // //         document_id: docData.id,
// // //         action: 'sent',
// // //         party_name: nextParty.name,
// // //         party_email: nextParty.email,
// // //         details: `Signing request sent to ${nextParty.name} (Party ${nextPartyIndex + 1})`,
// // //         timestamp: new Date().toISOString(),
// // //       });
// // //     }

// // //     setCompleted(true);
// // //     setSubmitting(false);
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
// // //         <div className="text-center">
// // //           <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
// // //           <p className="text-slate-500">Loading document...</p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   if (error) {
// // //     return (
// // //       <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
// // //         <Card className="max-w-md w-full p-8 text-center">
// // //           <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
// // //           <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Signing Error</h2>
// // //           <p className="text-slate-500">{error}</p>
// // //         </Card>
// // //       </div>
// // //     );
// // //   }

// // //   if (completed) {
// // //     return (
// // //       <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
// // //         <Card className="max-w-md w-full p-8 text-center">
// // //           <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
// // //             <CheckCircle2 className="w-8 h-8 text-green-500" />
// // //           </div>
// // //           <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h2>
// // //           <p className="text-slate-500">
// // //             Your signature has been recorded. All parties will be notified once the document is fully signed.
// // //           </p>
// // //         </Card>
// // //       </div>
// // //     );
// // //   }

// // //   const totalPages = docData?.total_pages || 1;
// // //   const activeTextField = activeFieldId && !showSigPad ? fields.find(f => f.id === activeFieldId && f.type === 'text') : null;

// // //   return (
// // //     <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
// // //       {/* Header */}
// // //       <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
// // //         <div className="max-w-4xl mx-auto flex items-center justify-between">
// // //           <div className="flex items-center gap-3">
// // //             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
// // //               <FileSignature className="w-5 h-5 text-white" />
// // //             </div>
// // //             <div>
// // //               <h1 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
// // //                 {docData?.title}
// // //               </h1>
// // //               <p className="text-xs text-slate-400">
// // //                 Signing as {session?.signer_name}
// // //               </p>
// // //             </div>
// // //           </div>
// // //           <div className="flex items-center gap-2">
// // //             <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-0">
// // //               {myUnfilledFields.length} fields remaining
// // //             </Badge>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* PDF area */}
// // //       <div ref={containerRef} className="max-w-4xl mx-auto px-4 py-6">
// // //         {totalPages > 1 && (
// // //           <div className="flex items-center justify-center gap-4 mb-4">
// // //             <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-lg">
// // //               <ChevronLeft className="w-4 h-4" />
// // //             </Button>
// // //             <span className="text-sm text-slate-600 dark:text-slate-300">Page {currentPage} of {totalPages}</span>
// // //             <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="rounded-lg">
// // //               <ChevronRight className="w-4 h-4" />
// // //             </Button>
// // //           </div>
// // //         )}

// // //         {/* Instruction banner */}
// // //         {myUnfilledFields.length > 0 && (
// // //           <div className="mb-4 p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center gap-2">
// // //             <AlertCircle className="w-4 h-4 text-sky-500 shrink-0" />
// // //             <p className="text-sm text-sky-700 dark:text-sky-300">
// // //               Click on the highlighted fields to fill them in. <strong>{myUnfilledFields.length}</strong> field{myUnfilledFields.length !== 1 ? 's' : ''} remaining.
// // //             </p>
// // //           </div>
// // //         )}

// // //         <div className="relative mx-auto shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white" style={{ width: canvasSize.width || '100%' }}>
// // //           <canvas ref={canvasRef} className="block" />

// // //           {pageFields.map(field => {
// // //             const isMine = field.party_index === session?.party_index;
// // //             const party = docData?.parties?.[field.party_index];
// // //             const color = party?.color || PARTY_COLORS[field.party_index % PARTY_COLORS.length];

// // //             return (
// // //               <div
// // //                 key={field.id}
// // //                 className={`absolute rounded-md border-2 flex items-center justify-center transition-all ${
// // //                   isMine && !field.filled ? 'cursor-pointer hover:scale-105' : ''
// // //                 } ${isMine && !field.filled ? 'animate-pulse' : ''} ${!isMine ? 'opacity-30 cursor-default' : ''}`}
// // //                 style={{
// // //                   left: `${field.x}%`,
// // //                   top: `${field.y}%`,
// // //                   width: `${field.width}%`,
// // //                   height: `${field.height}%`,
// // //                   borderColor: color,
// // //                   backgroundColor: field.filled ? `${color}20` : isMine ? `${color}25` : `${color}08`,
// // //                 }}
// // //                 onClick={() => handleFieldClick(field)}
// // //               >
// // //                 {field.filled && field.value ? (
// // //                   field.type === 'signature' ? (
// // //                     <img src={field.value} alt="Signature" className="w-full h-full object-contain p-0.5" />
// // //                   ) : (
// // //                     <span className="text-xs font-medium px-1 truncate" style={{ color }}>{field.value}</span>
// // //                   )
// // //                 ) : isMine ? (
// // //                   <div className="flex items-center gap-1 px-1">
// // //                     {field.type === 'signature' ? <PenTool className="w-3 h-3" style={{ color }} /> : <Type className="w-3 h-3" style={{ color }} />}
// // //                     <span className="text-[10px] font-semibold" style={{ color }}>
// // //                       {field.type === 'signature' ? 'Sign Here' : 'Type Here'}
// // //                     </span>
// // //                   </div>
// // //                 ) : (
// // //                   <span className="text-[9px] text-slate-400">{party?.name || `Signer ${field.party_index + 1}`}</span>
// // //                 )}
// // //               </div>
// // //             );
// // //           })}
// // //         </div>

// // //         {/* Submit */}
// // //         <div className="mt-6 flex justify-center">
// // //           <Button
// // //             onClick={handleSubmit}
// // //             disabled={!allMyFieldsFilled || submitting}
// // //             size="lg"
// // //             className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 px-8 shadow-lg shadow-sky-500/25 disabled:opacity-50"
// // //           >
// // //             {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
// // //             {allMyFieldsFilled ? 'Complete Signing' : `Fill ${myUnfilledFields.length} remaining field${myUnfilledFields.length !== 1 ? 's' : ''} to continue`}
// // //           </Button>
// // //         </div>
// // //       </div>

// // //       {/* Signature Dialog */}
// // //       <Dialog open={showSigPad} onOpenChange={(open) => { setShowSigPad(open); if (!open) setActiveFieldId(null); }}>
// // //         <DialogContent className="sm:max-w-md">
// // //           <DialogHeader>
// // //             <DialogTitle>Add Your Signature</DialogTitle>
// // //           </DialogHeader>
// // //           <SignaturePad onSignatureComplete={handleSignature} />
// // //         </DialogContent>
// // //       </Dialog>

// // //       {/* Text input dialog */}
// // //       <Dialog open={!!activeTextField} onOpenChange={(open) => { if (!open) setActiveFieldId(null); }}>
// // //         <DialogContent className="sm:max-w-md">
// // //           <DialogHeader>
// // //             <DialogTitle>Enter Text</DialogTitle>
// // //           </DialogHeader>
// // //           <Input
// // //             autoFocus
// // //             value={activeTextField?.value || ''}
// // //             onChange={e => handleTextInput(activeFieldId, e.target.value)}
// // //             placeholder="Type here..."
// // //             className="rounded-xl"
// // //             onKeyDown={e => e.key === 'Enter' && setActiveFieldId(null)}
// // //           />
// // //           <Button
// // //             onClick={() => setActiveFieldId(null)}
// // //             className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl"
// // //           >
// // //             Done
// // //           </Button>
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }
// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Input } from '@/components/ui/input';
// // // import { Card } from '@/components/ui/card';
// // // import { Badge } from '@/components/ui/badge';
// // // import { Dialog, DialogContent } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { 
// // //   FileSignature, Loader2, ChevronLeft, ChevronRight 
// // // } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';

// // // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState('');
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);
// // //   const [currentPage, setCurrentPage] = useState(1);

// // //   const canvasRef = useRef(null);
// // //   const containerRef = useRef(null);
// // //   const [pdfDoc, setPdfDoc] = useState(null);
// // //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

// // //   useEffect(() => { loadSession(); }, [token]);

// // //   const loadSession = async () => {
// // //     if (!token) {
// // //       setError('Invalid signing link.');
// // //       setLoading(false);
// // //       return;
// // //     }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
// // //       // ব্যাকএন্ড থেকে আসা ফিল্ডগুলো ঠিকঠাক সেট করা
// // //       setFields(res.data.document.fields || []);
// // //       if (res.data.document?.status === 'completed') setCompleted(true);
// // //     } catch (err) {
// // //       setError('Session not found or expired.');
// // //     } finally { setLoading(false); }
// // //   };

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const loadPdfScript = () => {
// // //       if (!window.pdfjsLib) {
// // //         const script = document.createElement('script');
// // //         script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// // //         script.onload = () => {
// // //           window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// // //           doLoad();
// // //         };
// // //         document.head.appendChild(script);
// // //       } else { doLoad(); }
// // //     };
// // //     const doLoad = async () => {
// // //       try {
// // //         const proxyUrl = `http://localhost:5001/api/documents/proxy/${docData.fileId}`;
// // //         const pdf = await window.pdfjsLib.getDocument(proxyUrl).promise;
// // //         setPdfDoc(pdf);
// // //       } catch (e) { console.error("PDF load error:", e); }
// // //     };
// // //     loadPdfScript();
// // //   }, [docData?.fileId]);

// // //   useEffect(() => {
// // //     if (!pdfDoc || !canvasRef.current) return;
// // //     const renderPage = async () => {
// // //       const page = await pdfDoc.getPage(currentPage);
// // //       const containerWidth = containerRef.current?.clientWidth || 600;
// // //       const viewport = page.getViewport({ scale: 1 });
// // //       const scale = Math.min((containerWidth - 32) / viewport.width, 1.5);
// // //       const scaledViewport = page.getViewport({ scale });
// // //       const canvas = canvasRef.current;
// // //       canvas.width = scaledViewport.width;
// // //       canvas.height = scaledViewport.height;
// // //       setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });
// // //       const ctx = canvas.getContext('2d');
// // //       await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
// // //     };
// // //     renderPage();
// // //   }, [pdfDoc, currentPage]);

// // //   // ✅ ব্যাকএন্ড মডেলে party_index ব্যবহার করা হয়েছে, তাই এখানেও সেটি ব্যবহার করতে হবে
// // //   const myPartyIndex = session?.party?.index ?? session?.party?.order;
// // //   const myFields = fields.filter(f => (f.party_index ?? f.partyIndex) === myPartyIndex);
// // //   const pageFields = fields.filter(f => Number(f.page) === currentPage);
// // //   const myUnfilledFields = myFields.filter(f => !f.filled);

// // //   const handleFieldClick = (field) => {
// // //     const fieldIndex = field.party_index ?? field.partyIndex;
// // //     if (fieldIndex !== myPartyIndex || field.filled) {
// // //         if (fieldIndex !== myPartyIndex) toast.info("This field is for another signer.");
// // //         return;
// // //     }
// // //     setActiveFieldId(field.id);
// // //     if (field.type === 'signature') setShowSigPad(true);
// // //   };

// // //   const handleSignature = (sigData) => {
// // //     // sigData সরাসরি স্ট্রিং হলে .value কাজ করবে না, তাই চেক করে নেওয়া ভাল
// // //     const sigValue = typeof sigData === 'string' ? sigData : (sigData.value || sigData);
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: sigValue, filled: true } : f));
// // //     setShowSigPad(false);
// // //     setActiveFieldId(null);
// // //   };

// // //   const handleTextInput = (fieldId, value) => {
// // //     setFields(prev => prev.map(f => f.id === fieldId ? { ...f, value, filled: value.trim().length > 0 } : f));
// // //   };

// // //   const handleSubmit = async () => {
// // //     if (myUnfilledFields.length > 0) {
// // //         return toast.error(`Please fill all your ${myUnfilledFields.length} fields before submitting.`);
// // //     }
// // //     setSubmitting(true);
// // //     try {
// // //       // ✅ ব্যাকএন্ডের CastError এড়াতে ফিল্ডগুলো স্যানিটাইজ করে পাঠানো
// // //       const sanitizedFields = fields.map(f => ({
// // //           ...f,
// // //           party_index: f.party_index ?? f.partyIndex // নিশ্চিত করা যে party_index আছে
// // //       }));

// // //       const res = await api.post(`/documents/sign/submit`, { 
// // //         token, 
// // //         fields: sanitizedFields 
// // //       });
      
// // //       if (res.data.success) {
// // //         setCompleted(true);
// // //         toast.success('Document signed successfully!');
// // //       }
// // //     } catch (err) { 
// // //       toast.error(err.response?.data?.error || 'Failed to submit signature'); 
// // //     } finally { 
// // //       setSubmitting(false); 
// // //     }
// // //   };

// // //   if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;
// // //   if (error) return <div className="min-h-screen flex items-center justify-center p-4"><Card className="p-8 text-center text-red-500">{error}</Card></div>;
// // //   if (completed) return (
// // //     <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
// // //         <Card className="p-10 text-center shadow-lg border-green-100 flex flex-col items-center">
// // //             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
// // //                 <FileSignature size={32} />
// // //             </div>
// // //             <h2 className="text-2xl font-bold text-slate-800">Signing Complete!</h2>
// // //             <p className="text-slate-500 mt-2">You have successfully signed "{docData?.title}".</p>
// // //             <p className="text-slate-400 text-sm mt-1">A copy will be sent to your email once everyone signs.</p>
// // //         </Card>
// // //     </div>
// // //   );

// // //   const activeTextField = fields.find(f => f.id === activeFieldId && f.type === 'text');

// // //   return (
// // //     <div className="min-h-screen bg-slate-100">
// // //       <div className="bg-white border-b px-6 py-4 sticky top-0 z-10 shadow-sm">
// // //         <div className="max-w-5xl mx-auto flex justify-between items-center">
// // //           <div className="flex items-center gap-3">
// // //             <div className="bg-sky-500 p-2 rounded-lg text-white">
// // //                 <FileSignature size={20} />
// // //             </div>
// // //             <div>
// // //                 <h1 className="font-bold text-slate-800 leading-tight">{docData?.title}</h1>
// // //                 <p className="text-[10px] text-slate-500 uppercase tracking-wider">Signing Session</p>
// // //             </div>
// // //           </div>
// // //           <div className="flex items-center gap-4">
// // //             <Badge variant={myUnfilledFields.length === 0 ? "success" : "secondary"} className="px-3 py-1">
// // //                 {myUnfilledFields.length === 0 ? 'All fields filled' : `${myUnfilledFields.length} fields remaining`}
// // //             </Badge>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div ref={containerRef} className="max-w-5xl mx-auto px-4 py-8 pb-32">
// // //         <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-xl shadow-sm border">
// // //           <div className="flex items-center gap-2">
// // //             <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1} className="rounded-lg"><ChevronLeft size={16} /></Button>
// // //             <span className="text-sm font-medium px-4">Page {currentPage} of {docData?.totalPages || 1}</span>
// // //             <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= (docData?.totalPages || 1)} className="rounded-lg"><ChevronRight size={16} /></Button>
// // //           </div>
// // //           <div className="text-xs text-slate-400 italic">Scroll to view document</div>
// // //         </div>

// // //         <div className="relative mx-auto shadow-2xl border bg-white rounded-sm overflow-hidden" style={{ width: canvasSize.width || '100%', minHeight: '500px' }}>
// // //           <canvas ref={canvasRef} className="mx-auto" />
          
// // //           {/* Fields Rendering Layer */}
// // //           {pageFields.map(field => {
// // //             const fieldIdx = field.party_index ?? field.partyIndex;
// // //             const isMine = fieldIdx === myPartyIndex;
// // //             const color = PARTY_COLORS[fieldIdx % PARTY_COLORS.length];
            
// // //             return (
// // //               <div
// // //                 key={field.id}
// // //                 className={`absolute border-2 rounded transition-all duration-200 flex items-center justify-center
// // //                     ${isMine && !field.filled ? 'cursor-pointer border-dashed bg-sky-50/30 hover:bg-sky-100/50 animate-pulse' : 'bg-transparent'}
// // //                     ${field.filled ? 'border-solid border-green-500 bg-white/50' : ''}`}
// // //                 style={{ 
// // //                     left: `${field.x}%`, 
// // //                     top: `${field.y}%`, 
// // //                     width: `${field.width}%`, 
// // //                     height: `${field.height}%`, 
// // //                     borderColor: field.filled ? '#22c55e' : color 
// // //                 }}
// // //                 onClick={() => handleFieldClick(field)}
// // //               >
// // //                 {field.filled ? (
// // //                   field.type === 'signature' ? (
// // //                     <img src={field.value} className="w-full h-full object-contain p-1" alt="signature" />
// // //                   ) : (
// // //                     <span className="text-xs font-medium text-slate-800 p-1 break-words w-full text-center">{field.value}</span>
// // //                   )
// // //                 ) : (
// // //                   <div className="flex flex-col items-center">
// // //                     <span className="text-[9px] font-bold uppercase" style={{ color }}>{isMine ? 'Click to Sign' : `Signer ${fieldIdx + 1}`}</span>
// // //                   </div>
// // //                 )}
// // //               </div>
// // //             );
// // //           })}
// // //         </div>

// // //         {/* Floating Action Bar */}
// // //         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-20">
// // //             <Card className="p-4 shadow-2xl border-t-4 border-t-sky-500 rounded-2xl">
// // //                 <div className="flex items-center justify-between gap-4">
// // //                     <div className="text-sm font-medium text-slate-600">
// // //                         {myUnfilledFields.length > 0 
// // //                             ? `Please fill ${myUnfilledFields.length} more fields`
// // //                             : "Ready to complete!"
// // //                         }
// // //                     </div>
// // //                     <Button 
// // //                         onClick={handleSubmit} 
// // //                         disabled={submitting || myUnfilledFields.length > 0} 
// // //                         className={`px-8 py-5 h-auto text-base font-bold rounded-xl transition-all shadow-lg
// // //                             ${myUnfilledFields.length === 0 ? 'bg-sky-500 hover:bg-sky-600 text-white scale-105' : 'bg-slate-200 text-slate-400'}`}
// // //                     >
// // //                         {submitting ? <><Loader2 className="animate-spin mr-2" /> Submitting</> : 'Finish Signing'}
// // //                     </Button>
// // //                 </div>
// // //             </Card>
// // //         </div>
// // //       </div>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-none">
// // //           <SignaturePad onSignatureComplete={handleSignature} onCancel={() => setShowSigPad(false)} />
// // //         </DialogContent>
// // //       </Dialog>

// // //       <Dialog open={!!activeTextField} onOpenChange={() => setActiveFieldId(null)}>
// // //         <DialogContent className="sm:max-w-[400px] p-6">
// // //           <h3 className="text-lg font-bold mb-4">Enter Text</h3>
// // //           <Input 
// // //             autoFocus
// // //             value={activeTextField?.value || ''} 
// // //             onChange={e => handleTextInput(activeFieldId, e.target.value)} 
// // //             placeholder="Type here..."
// // //             className="py-6 text-lg"
// // //           />
// // //           <div className="flex justify-end gap-2 mt-4">
// // //             <Button variant="ghost" onClick={() => setActiveFieldId(null)}>Cancel</Button>
// // //             <Button onClick={() => setActiveFieldId(null)} className="bg-sky-500 text-white px-6">Apply</Button>
// // //           </div>
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }
// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Input } from '@/components/ui/input';
// // // import { Card } from '@/components/ui/card';
// // // import { Badge } from '@/components/ui/badge';
// // // import { Dialog, DialogContent } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { FileSignature, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';

// // // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState('');
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);
// // //   const [currentPage, setCurrentPage] = useState(1);

// // //   const canvasRef = useRef(null);
// // //   const containerRef = useRef(null);
// // //   const [pdfDoc, setPdfDoc] = useState(null);
// // //   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

// // //   useEffect(() => { loadSession(); }, [token]);

// // //   const loadSession = async () => {
// // //     if (!token) { setError('Invalid signing link.'); setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
      
// // //       const rawFields = res.data.document.fields || [];
// // //       const parsedFields = rawFields.map(f => {
// // //         let obj = typeof f === 'string' ? JSON.parse(f) : f;
// // //         return { ...obj, page: Number(obj.page), partyIndex: Number(obj.partyIndex ?? obj.party_index) };
// // //       });
// // //       setFields(parsedFields);
// // //       if (res.data.document?.status === 'completed') setCompleted(true);
// // //     } catch (err) { setError('Session not found or expired.'); } 
// // //     finally { setLoading(false); }
// // //   };

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const doLoad = async () => {
// // //       try {
// // //         const proxyUrl = `http://localhost:5001/api/documents/proxy/${docData.fileId}`;
// // //         const pdf = await window.pdfjsLib.getDocument(proxyUrl).promise;
// // //         setPdfDoc(pdf);
// // //       } catch (e) { console.error("PDF load error:", e); }
// // //     };

// // //     if (!window.pdfjsLib) {
// // //       const script = document.createElement('script');
// // //       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// // //       script.onload = () => {
// // //         window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// // //         doLoad();
// // //       };
// // //       document.head.appendChild(script);
// // //     } else { doLoad(); }
// // //   }, [docData?.fileId]);

// // //   useEffect(() => {
// // //     if (!pdfDoc || !canvasRef.current) return;
// // //     const renderPage = async () => {
// // //       const page = await pdfDoc.getPage(currentPage);
// // //       const containerWidth = containerRef.current?.clientWidth || 600;
// // //       const viewport = page.getViewport({ scale: 1 });
// // //       const scale = containerWidth / viewport.width;
// // //       const scaledViewport = page.getViewport({ scale });
// // //       const canvas = canvasRef.current;
// // //       canvas.width = scaledViewport.width;
// // //       canvas.height = scaledViewport.height;
// // //       setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });
// // //       const ctx = canvas.getContext('2d');
// // //       await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
// // //     };
// // //     renderPage();
// // //   }, [pdfDoc, currentPage]);

// // //   const myPartyIndex = Number(session?.party?.index ?? session?.party?.order);
// // //   const myFields = fields.filter(f => Number(f.partyIndex) === myPartyIndex);
  
// // //   // ✅ ফিক্স: স্ট্রিক্টলি পেজ নাম্বার চেক
// // //   const pageFields = fields.filter(f => Number(f.page) === Number(currentPage));
// // //   const myUnfilledFields = myFields.filter(f => !f.filled);

// // //   const handleFieldClick = (field) => {
// // //     if (Number(field.partyIndex) !== myPartyIndex || field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     if (field.type === 'signature') setShowSigPad(true);
// // //   };

// // //   const handleSignature = (sigData) => {
// // //     const val = typeof sigData === 'string' ? sigData : (sigData.value || sigData);
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: val, filled: true } : f));
// // //     setShowSigPad(false);
// // //     setActiveFieldId(null);
// // //   };

// // //   const handleTextInput = (fieldId, value) => {
// // //     setFields(prev => prev.map(f => f.id === fieldId ? { ...f, value, filled: value.trim().length > 0 } : f));
// // //   };

// // //   const handleSubmit = async () => {
// // //     if (myUnfilledFields.length > 0) return toast.error('Please fill all fields');
// // //     setSubmitting(true);
// // //     try {
// // //       await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //       toast.success('Signed successfully!');
// // //     } catch (err) { toast.error('Failed to submit'); }
// // //     finally { setSubmitting(false); }
// // //   };

// // //   if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
// // //   if (error) return <div className="min-h-screen flex items-center justify-center p-4"><Card className="p-8">{error}</Card></div>;
// // //   if (completed) return <div className="min-h-screen flex items-center justify-center p-4"><Card className="p-8 text-center text-green-600"><h2>Success!</h2></Card></div>;

// // //   const activeTextField = fields.find(f => f.id === activeFieldId && f.type === 'text');

// // //   return (
// // //     <div className="min-h-screen bg-background flex flex-col">
// // //       <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b p-4">
// // //         <div className="max-w-5xl mx-auto flex justify-between items-center">
// // //           <div className="flex items-center gap-3"><FileSignature className="text-primary" /> <h1 className="font-bold">{docData?.title}</h1></div>
// // //           <Badge variant={myUnfilledFields.length === 0 ? "default" : "secondary"}>{myUnfilledFields.length} left</Badge>
// // //         </div>
// // //       </header>

// // //       <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 pb-32">
// // //         <div className="flex justify-between items-center mb-4 bg-card p-2 rounded-lg border">
// // //           <div className="flex items-center gap-2">
// // //             <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1}><ChevronLeft size={16} /></Button>
// // //             <span className="text-sm font-medium">{currentPage} / {docData?.totalPages || 1}</span>
// // //             <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= (docData?.totalPages || 1)}><ChevronRight size={16} /></Button>
// // //           </div>
// // //         </div>

// // //         {/* ✅ ফিক্স: ওভারফ্লো এবং পজিশনিং */}
// // //         <div ref={containerRef} className="relative mx-auto bg-white shadow-xl overflow-visible border" 
// // //              style={{ width: canvasSize.width || '100%', height: canvasSize.height || 'auto' }}>
          
// // //           <canvas ref={canvasRef} className="block z-0" />
          
// // //           {pageFields.map(field => {
// // //             const isMine = Number(field.partyIndex) === myPartyIndex;
// // //             const color = PARTY_COLORS[Number(field.partyIndex) % PARTY_COLORS.length];
// // //             return (
// // //               <div
// // //                 key={field.id}
// // //                 className={`absolute z-10 border-2 rounded flex items-center justify-center transition-all
// // //                   ${isMine && !field.filled ? 'cursor-pointer bg-primary/10 border-dashed animate-pulse' : 'pointer-events-none'}`}
// // //                 style={{ 
// // //                   left: `${field.x}%`, top: `${field.y}%`, 
// // //                   width: `${field.width}%`, height: `${field.height}%`, 
// // //                   borderColor: field.filled ? '#22c55e' : color 
// // //                 }}
// // //                 onClick={() => handleFieldClick(field)}
// // //               >
// // //                 {field.filled ? (
// // //                   field.type === 'signature' ? <img src={field.value} className="w-full h-full object-contain" /> : <span className="text-[10px] text-center">{field.value}</span>
// // //                 ) : (
// // //                   <span className="text-[9px] font-bold" style={{ color }}>{isMine ? 'CLICK TO SIGN' : 'OTHER SIGNER'}</span>
// // //                 )}
// // //               </div>
// // //             );
// // //           })}
// // //         </div>
// // //       </main>

// // //       <div className="fixed bottom-0 left-0 w-full z-20 bg-background/90 backdrop-blur border-t p-4 flex justify-center">
// // //           <Button onClick={handleSubmit} disabled={submitting || myUnfilledFields.length > 0} className="w-full max-w-lg py-6 text-lg font-bold">
// // //             {submitting ? 'Submitting...' : 'Finish Signing'}
// // //           </Button>
// // //       </div>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}><DialogContent className="max-w-[500px] p-0"><SignaturePad onSignatureComplete={handleSignature} /></DialogContent></Dialog>
// // //       <Dialog open={!!activeTextField} onOpenChange={() => setActiveFieldId(null)}><DialogContent className="p-6"><h3 className="mb-4 font-bold">Enter Text</h3><Input value={activeTextField?.value || ''} onChange={e => handleTextInput(activeFieldId, e.target.value)} autoFocus /><Button onClick={() => setActiveFieldId(null)} className="mt-4 w-full">Apply</Button></DialogContent></Dialog>
// // //     </div>
// // //   );
// // // }

// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Badge } from '@/components/ui/badge';
// // // import { Dialog, DialogContent } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { FileSignature, Loader2 } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';

// // // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState('');
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);

// // //   const containerRef = useRef(null);
// // //   const [pdfDoc, setPdfDoc] = useState(null);
// // //   const [pagesData, setPagesData] = useState([]); 

// // //   useEffect(() => { loadSession(); }, [token]);

// // //   const loadSession = async () => {
// // //     if (!token) { setError('Invalid link.'); setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
// // //       const rawFields = res.data.document.fields || [];
// // //       setFields(rawFields.map(f => ({
// // //         ...f, 
// // //         page: Number(f.page), 
// // //         partyIndex: Number(f.partyIndex ?? f.party_index)
// // //       })));
// // //       if (res.data.document?.status === 'completed') setCompleted(true);
// // //     } catch (err) { setError('Session expired.'); } 
// // //     finally { setLoading(false); }
// // //   };

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const loadPdf = async () => {
// // //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${docData.fileId}`;
// // //       const script = document.createElement('script');
// // //       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// // //       script.onload = async () => {
// // //         window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// // //         const pdf = await window.pdfjsLib.getDocument(proxyUrl).promise;
// // //         setPdfDoc(pdf);
// // //         renderAllPages(pdf);
// // //       };
// // //       document.head.appendChild(script);
// // //     };
// // //     loadPdf();
// // //   }, [docData]);

// // //   const renderAllPages = async (pdf) => {
// // //     const pages = [];
// // //     const containerWidth = containerRef.current?.clientWidth || 800;

// // //     for (let i = 1; i <= pdf.numPages; i++) {
// // //       const page = await pdf.getPage(i);
// // //       const viewport = page.getViewport({ scale: 1 });
// // //       const scale = containerWidth / viewport.width;
// // //       const scaledViewport = page.getViewport({ scale });
// // //       pages.push({ num: i, width: scaledViewport.width, height: scaledViewport.height, viewport: scaledViewport, pageObj: page });
// // //     }
// // //     setPagesData(pages);
// // //   };

// // //   const PageCanvas = ({ page }) => {
// // //     const canvasRef = useRef(null);
// // //     useEffect(() => {
// // //       const render = async () => {
// // //         const ctx = canvasRef.current.getContext('2d');
// // //         canvasRef.current.width = page.width * 2; // High DPI
// // //         canvasRef.current.height = page.height * 2;
// // //         ctx.scale(2, 2);
// // //         await page.pageObj.render({ canvasContext: ctx, viewport: page.viewport }).promise;
// // //       };
// // //       render();
// // //     }, [page]);
// // //     return <canvas ref={canvasRef} style={{ width: page.width, height: page.height }} className="shadow-md mb-6 bg-white" />;
// // //   };

// // //   const myPartyIndex = Number(session?.party?.index ?? session?.party?.order);

// // //   const handleFieldClick = (field) => {
// // //     if (Number(field.partyIndex) !== myPartyIndex || field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     if (field.type === 'signature') setShowSigPad(true);
// // //   };

// // //   const handleSignature = (sigData) => {
// // //     const val = typeof sigData === 'string' ? sigData : (sigData.value || sigData);
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: val, filled: true } : f));
// // //     setShowSigPad(false);
// // //   };

// // //   const handleSubmit = async () => {
// // //     const myUnfilled = fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled);
// // //     if (myUnfilled.length > 0) return toast.error('Please fill all your fields');
// // //     setSubmitting(true);
// // //     try {
// // //       await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //     } catch (err) { toast.error('Submit failed'); }
// // //     finally { setSubmitting(false); }
// // //   };

// // //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

// // //   return (
// // //     <div className="min-h-screen bg-slate-100">
// // //       <header className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center">
// // //         <div className="flex items-center gap-2"><FileSignature className="text-blue-600" /> <span className="font-bold uppercase tracking-tight">{docData?.title}</span></div>
// // //         <Button onClick={handleSubmit} disabled={submitting} className="font-bold px-8">Finish Signing</Button>
// // //       </header>

// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-8">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-6" style={{ width: page.width, height: page.height }}>
// // //             <PageCanvas page={page} />
            
// // //             {/* ✅ ফিক্স: শুধুমাত্র নিজের ইনডেক্সের ফিল্ডগুলো রেন্ডার করা (Privacy Logic) */}
// // //             {fields.filter(f => f.page === page.num && Number(f.partyIndex) === myPartyIndex).map(field => {
// // //               const color = PARTY_COLORS[field.partyIndex % PARTY_COLORS.length];
// // //               return (
// // //                 <div
// // //                   key={field.id}
// // //                   className={`absolute z-10 border-2 rounded-md transition-all ${!field.filled ? 'cursor-pointer animate-pulse bg-blue-50/30' : 'pointer-events-none'}`}
// // //                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%`, borderColor: field.filled ? '#22c55e' : color }}
// // //                   onClick={() => handleFieldClick(field)}
// // //                 >
// // //                   {field.filled ? (
// // //                     <img src={field.value} className="w-full h-full object-contain p-1" />
// // //                   ) : (
// // //                     <div className="flex flex-col items-center justify-center h-full opacity-60">
// // //                       <span className="text-[10px] font-black" style={{ color }}>SIGN HERE</span>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-md p-0 overflow-hidden"><SignaturePad onSignatureComplete={handleSignature} /></DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }

// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Badge } from '@/components/ui/badge';
// // // import { Dialog, DialogContent } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { FileSignature, Loader2, CheckCircle2 } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';

// // // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // // // ✅ আলাদা ক্যানভাস কম্পোনেন্ট যাতে রেন্ডার কনফ্লিক্ট না হয়
// // // const PageCanvas = ({ page }) => {
// // //   const canvasRef = useRef(null);
// // //   const renderTaskRef = useRef(null);

// // //   useEffect(() => {
// // //     const render = async () => {
// // //       // যদি আগে কোনো রেন্ডারিং চলতে থাকে, তবে সেটি বাতিল করুন
// // //       if (renderTaskRef.current) {
// // //         renderTaskRef.current.cancel();
// // //       }

// // //       const ctx = canvasRef.current.getContext('2d');
// // //       const dpr = window.devicePixelRatio || 1;
      
// // //       canvasRef.current.width = page.width * dpr;
// // //       canvasRef.current.height = page.height * dpr;
// // //       ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// // //       const renderContext = {
// // //         canvasContext: ctx,
// // //         viewport: page.viewport,
// // //       };

// // //       try {
// // //         const renderTask = page.pageObj.render(renderContext);
// // //         renderTaskRef.current = renderTask;
// // //         await renderTask.promise;
// // //       } catch (err) {
// // //         if (err.name !== 'RenderingCancelledException') {
// // //           console.error("Render error:", err);
// // //         }
// // //       }
// // //     };

// // //     render();

// // //     return () => {
// // //       if (renderTaskRef.current) {
// // //         renderTaskRef.current.cancel();
// // //       }
// // //     };
// // //   }, [page]);

// // //   return <canvas ref={canvasRef} style={{ width: page.width, height: page.height }} className="shadow-md mb-6 bg-white border" />;
// // // };

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState('');
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);

// // //   const containerRef = useRef(null);
// // //   const [pdfDoc, setPdfDoc] = useState(null);
// // //   const [pagesData, setPagesData] = useState([]); 

// // //   useEffect(() => { loadSession(); }, [token]);

// // //   const loadSession = async () => {
// // //     if (!token) { setError('Invalid link.'); setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
// // //       const rawFields = res.data.document.fields || [];
// // //       setFields(rawFields.map(f => ({
// // //         ...f, 
// // //         page: Number(f.page), 
// // //         partyIndex: Number(f.partyIndex ?? f.party_index)
// // //       })));
// // //       if (res.data.document?.status === 'completed') setCompleted(true);
// // //     } catch (err) { setError('Session expired or invalid.'); } 
// // //     finally { setLoading(false); }
// // //   };

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const loadPdf = async () => {
// // //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${docData.fileId}`;
// // //       const script = document.createElement('script');
// // //       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// // //       script.onload = async () => {
// // //         window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// // //         try {
// // //           const pdf = await window.pdfjsLib.getDocument(proxyUrl).promise;
// // //           setPdfDoc(pdf);
// // //           renderPages(pdf);
// // //         } catch (err) { console.error("PDF load error:", err); }
// // //       };
// // //       document.head.appendChild(script);
// // //     };
// // //     loadPdf();
// // //   }, [docData]);

// // //   const renderPages = async (pdf) => {
// // //     const pages = [];
// // //     const containerWidth = containerRef.current?.clientWidth || 800;
// // //     for (let i = 1; i <= pdf.numPages; i++) {
// // //       const page = await pdf.getPage(i);
// // //       const viewport = page.getViewport({ scale: 1 });
// // //       const scale = containerWidth / viewport.width;
// // //       const scaledViewport = page.getViewport({ scale });
// // //       pages.push({ num: i, width: scaledViewport.width, height: scaledViewport.height, viewport: scaledViewport, pageObj: page });
// // //     }
// // //     setPagesData(pages);
// // //   };

// // //   const myPartyIndex = Number(session?.party?.index ?? session?.party?.order);

// // //   const handleFieldClick = (field) => {
// // //     if (Number(field.partyIndex) !== myPartyIndex || field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     if (field.type === 'signature') setShowSigPad(true);
// // //   };

// // //   const handleSignature = (sigData) => {
// // //     const val = typeof sigData === 'string' ? sigData : (sigData.value || sigData);
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: val, filled: true } : f));
// // //     setShowSigPad(false);
// // //   };

// // //   const handleSubmit = async () => {
// // //     const myUnfilled = fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled);
// // //     if (myUnfilled.length > 0) return toast.error('Please fill all your fields before finishing.');
    
// // //     setSubmitting(true);
// // //     try {
// // //       // ✅ এপিআই পাথ এবং টোকেন নিশ্চিত করা হয়েছে
// // //       await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //       toast.success('Document signed successfully!');
// // //     } catch (err) { 
// // //       toast.error(err.response?.data?.error || 'Submit failed'); 
// // //     } finally { setSubmitting(false); }
// // //   };

// // //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
// // //   if (error) return <div className="h-screen flex items-center justify-center text-destructive font-bold">{error}</div>;
  
// // //   if (completed) return (
// // //     <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
// // //       <CheckCircle2 size={64} className="text-green-500" />
// // //       <h2 className="text-2xl font-bold">Signing Completed!</h2>
// // //       <p className="text-slate-500">You can now close this tab safely.</p>
// // //     </div>
// // //   );

// // //   return (
// // //     <div className="min-h-screen bg-slate-100 pb-20">
// // //       <header className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center shadow-sm">
// // //         <div className="flex items-center gap-2">
// // //           <FileSignature className="text-blue-600" /> 
// // //           <span className="font-bold uppercase tracking-tight truncate max-w-[200px] md:max-w-none">
// // //             {docData?.title}
// // //           </span>
// // //         </div>
// // //         <div className="flex items-center gap-3">
// // //           <Badge variant="secondary" className="hidden md:flex">
// // //             {fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled).length} left
// // //           </Badge>
// // //           <Button onClick={handleSubmit} disabled={submitting} className="font-bold px-6 shadow-md">
// // //             {submitting ? 'Processing...' : 'Finish Signing'}
// // //           </Button>
// // //         </div>
// // //       </header>

// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-8 px-4">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-8 flex justify-center" style={{ width: '100%', height: page.height }}>
// // //             <PageCanvas page={page} />
            
// // //             {fields.filter(f => f.page === page.num && Number(f.partyIndex) === myPartyIndex).map(field => {
// // //               const color = PARTY_COLORS[field.partyIndex % PARTY_COLORS.length];
// // //               return (
// // //                 <div
// // //                   key={field.id}
// // //                   className={`absolute z-20 border-2 rounded transition-all ${!field.filled ? 'cursor-pointer animate-pulse bg-blue-50/20' : 'pointer-events-none'}`}
// // //                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%`, borderColor: field.filled ? '#22c55e' : color }}
// // //                   onClick={() => handleFieldClick(field)}
// // //                 >
// // //                   {field.filled ? (
// // //                     <img src={field.value} className="w-full h-full object-contain bg-white/50" alt="signature" />
// // //                   ) : (
// // //                     <div className="flex items-center justify-center h-full">
// // //                       <span className="text-[10px] font-bold" style={{ color }}>SIGN HERE</span>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-md p-0 overflow-hidden">
// // //           <SignaturePad onSignatureComplete={handleSignature} />
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }

// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Badge } from '@/components/ui/badge';
// // // // ✅ Dialog এর প্রয়োজনীয় সাব-কম্পোনেন্টগুলো ইমপোর্ট করা হয়েছে
// // // import { 
// // //   Dialog, 
// // //   DialogContent, 
// // //   DialogHeader, 
// // //   DialogTitle, 
// // //   DialogDescription 
// // // } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { FileSignature, Loader2, CheckCircle2 } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';

// // // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // // const PageCanvas = ({ page }) => {
// // //   const canvasRef = useRef(null);
// // //   const renderTaskRef = useRef(null);

// // //   useEffect(() => {
// // //     const render = async () => {
// // //       if (renderTaskRef.current) {
// // //         renderTaskRef.current.cancel();
// // //       }

// // //       const ctx = canvasRef.current.getContext('2d');
// // //       const dpr = window.devicePixelRatio || 1;
      
// // //       canvasRef.current.width = page.width * dpr;
// // //       canvasRef.current.height = page.height * dpr;
// // //       ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// // //       const renderContext = {
// // //         canvasContext: ctx,
// // //         viewport: page.viewport,
// // //       };

// // //       try {
// // //         const renderTask = page.pageObj.render(renderContext);
// // //         renderTaskRef.current = renderTask;
// // //         await renderTask.promise;
// // //       } catch (err) {
// // //         if (err.name !== 'RenderingCancelledException') {
// // //           console.error("Render error:", err);
// // //         }
// // //       }
// // //     };

// // //     render();

// // //     return () => {
// // //       if (renderTaskRef.current) {
// // //         renderTaskRef.current.cancel();
// // //       }
// // //     };
// // //   }, [page]);

// // //   return <canvas ref={canvasRef} style={{ width: page.width, height: page.height }} className="shadow-md mb-6 bg-white border" />;
// // // };

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState('');
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);

// // //   const containerRef = useRef(null);
// // //   const [pdfDoc, setPdfDoc] = useState(null);
// // //   const [pagesData, setPagesData] = useState([]); 

// // //   useEffect(() => { loadSession(); }, [token]);

// // //   const loadSession = async () => {
// // //     if (!token) { setError('Invalid link.'); setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
// // //       const rawFields = res.data.document.fields || [];
// // //       setFields(rawFields.map(f => ({
// // //         ...f, 
// // //         page: Number(f.page), 
// // //         partyIndex: Number(f.partyIndex ?? f.party_index)
// // //       })));
// // //       if (res.data.document?.status === 'completed') setCompleted(true);
// // //     } catch (err) { setError('Session expired or invalid.'); } 
// // //     finally { setLoading(false); }
// // //   };

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const loadPdf = async () => {
// // //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${docData.fileId}`;
// // //       const script = document.createElement('script');
// // //       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// // //       script.onload = async () => {
// // //         window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// // //         try {
// // //           const pdf = await window.pdfjsLib.getDocument(proxyUrl).promise;
// // //           setPdfDoc(pdf);
// // //           renderPages(pdf);
// // //         } catch (err) { console.error("PDF load error:", err); }
// // //       };
// // //       document.head.appendChild(script);
// // //     };
// // //     loadPdf();
// // //   }, [docData]);

// // //   const renderPages = async (pdf) => {
// // //     const pages = [];
// // //     const containerWidth = containerRef.current?.clientWidth || 800;
// // //     for (let i = 1; i <= pdf.numPages; i++) {
// // //       const page = await pdf.getPage(i);
// // //       const viewport = page.getViewport({ scale: 1 });
// // //       const scale = containerWidth / viewport.width;
// // //       const scaledViewport = page.getViewport({ scale });
// // //       pages.push({ num: i, width: scaledViewport.width, height: scaledViewport.height, viewport: scaledViewport, pageObj: page });
// // //     }
// // //     setPagesData(pages);
// // //   };

// // //   const myPartyIndex = Number(session?.party?.index ?? session?.party?.order);

// // //   const handleFieldClick = (field) => {
// // //     if (Number(field.partyIndex) !== myPartyIndex || field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     if (field.type === 'signature') setShowSigPad(true);
// // //   };

// // //   const handleSignature = (sigData) => {
// // //     const val = typeof sigData === 'string' ? sigData : (sigData.value || sigData);
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: val, filled: true } : f));
// // //     setShowSigPad(false);
// // //   };

// // //   const handleSubmit = async () => {
// // //     const myUnfilled = fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled);
// // //     if (myUnfilled.length > 0) return toast.error('Please fill all your fields before finishing.');
    
// // //     setSubmitting(true);
// // //     try {
// // //       await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //       toast.success('Document signed successfully!');
// // //     } catch (err) { 
// // //       toast.error(err.response?.data?.error || 'Submit failed'); 
// // //     } finally { setSubmitting(false); }
// // //   };

// // //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
// // //   if (error) return <div className="h-screen flex items-center justify-center text-destructive font-bold">{error}</div>;
  
// // //   if (completed) return (
// // //     <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
// // //       <CheckCircle2 size={64} className="text-green-500" />
// // //       <h2 className="text-2xl font-bold">Signing Completed!</h2>
// // //       <p className="text-slate-500">You can now close this tab safely.</p>
// // //     </div>
// // //   );

// // //   return (
// // //     <div className="min-h-screen bg-slate-100 pb-20">
// // //       <header className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center shadow-sm">
// // //         <div className="flex items-center gap-2">
// // //           <FileSignature className="text-blue-600" /> 
// // //           <span className="font-bold uppercase tracking-tight truncate max-w-[200px] md:max-w-none">
// // //             {docData?.title}
// // //           </span>
// // //         </div>
// // //         <div className="flex items-center gap-3">
// // //           <Badge variant="secondary" className="hidden md:flex">
// // //             {fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled).length} left
// // //           </Badge>
// // //           <Button onClick={handleSubmit} disabled={submitting} className="font-bold px-6 shadow-md">
// // //             {submitting ? 'Processing...' : 'Finish Signing'}
// // //           </Button>
// // //         </div>
// // //       </header>

// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-8 px-4">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-8 flex justify-center" style={{ width: '100%', height: page.height }}>
// // //             <PageCanvas page={page} />
            
// // //             {fields.filter(f => f.page === page.num && Number(f.partyIndex) === myPartyIndex).map(field => {
// // //               const color = PARTY_COLORS[field.partyIndex % PARTY_COLORS.length];
// // //               return (
// // //                 <div
// // //                   key={field.id}
// // //                   className={`absolute z-20 border-2 rounded transition-all ${!field.filled ? 'cursor-pointer animate-pulse bg-blue-50/20' : 'pointer-events-none'}`}
// // //                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%`, borderColor: field.filled ? '#22c55e' : color }}
// // //                   onClick={() => handleFieldClick(field)}
// // //                 >
// // //                   {field.filled ? (
// // //                     <img src={field.value} className="w-full h-full object-contain bg-white/50" alt="signature" />
// // //                   ) : (
// // //                     <div className="flex items-center justify-center h-full">
// // //                       <span className="text-[10px] font-bold" style={{ color }}>SIGN HERE</span>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>

// // //       {/* ✅ UI তে কোনো পরিবর্তন ছাড়াই এরর ফিক্স করা হয়েছে */}
// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-md p-0 overflow-hidden">
// // //           <DialogHeader className="sr-only">
// // //             <DialogTitle>Draw Signature</DialogTitle>
// // //             <DialogDescription>Signature pad for document signing</DialogDescription>
// // //           </DialogHeader>
// // //           <SignaturePad onSignatureComplete={handleSignature} />
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }
// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Badge } from '@/components/ui/badge';
// // // import { 
// // //   Dialog, 
// // //   DialogContent, 
// // //   DialogHeader, 
// // //   DialogTitle, 
// // //   DialogDescription 
// // // } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { FileSignature, Loader2, CheckCircle2 } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';

// // // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // // const PageCanvas = ({ page }) => {
// // //   const canvasRef = useRef(null);
// // //   const renderTaskRef = useRef(null);

// // //   useEffect(() => {
// // //     const render = async () => {
// // //       if (renderTaskRef.current) renderTaskRef.current.cancel();
// // //       const ctx = canvasRef.current.getContext('2d');
// // //       const dpr = window.devicePixelRatio || 1;
// // //       canvasRef.current.width = page.width * dpr;
// // //       canvasRef.current.height = page.height * dpr;
// // //       ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// // //       try {
// // //         const renderTask = page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
// // //         renderTaskRef.current = renderTask;
// // //         await renderTask.promise;
// // //       } catch (err) {
// // //         if (err.name !== 'RenderingCancelledException') console.error(err);
// // //       }
// // //     };
// // //     render();
// // //     return () => renderTaskRef.current?.cancel();
// // //   }, [page]);

// // //   return <canvas ref={canvasRef} style={{ width: page.width, height: page.height }} className="shadow-md mb-6 bg-white border" />;
// // // };

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState('');
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);

// // //   const containerRef = useRef(null);
// // //   const [pagesData, setPagesData] = useState([]); 

// // //   useEffect(() => { loadSession(); }, [token]);

// // //   const loadSession = async () => {
// // //     if (!token) { setError('Invalid link.'); setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
// // //       // ✅ ব্যাকএন্ডের party_index এবং partyIndex সামঞ্জস্য করা হয়েছে
// // //       const rawFields = res.data.document.fields || [];
// // //       setFields(rawFields.map(f => ({
// // //         ...f, 
// // //         page: Number(f.page), 
// // //         partyIndex: Number(f.partyIndex ?? f.party_index)
// // //       })));
// // //       if (res.data.document?.status === 'completed') setCompleted(true);
// // //     } catch (err) { setError('Session expired or invalid.'); } 
// // //     finally { setLoading(false); }
// // //   };

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const loadPdf = async () => {
// // //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${docData.fileId}`;
// // //       const script = document.createElement('script');
// // //       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// // //       script.onload = async () => {
// // //         window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// // //         try {
// // //           const pdf = await window.pdfjsLib.getDocument(proxyUrl).promise;
// // //           renderPages(pdf);
// // //         } catch (err) { console.error(err); }
// // //       };
// // //       document.head.appendChild(script);
// // //     };
// // //     loadPdf();
// // //   }, [docData]);

// // //   const renderPages = async (pdf) => {
// // //     const pages = [];
// // //     const containerWidth = containerRef.current?.clientWidth || 800;
// // //     for (let i = 1; i <= pdf.numPages; i++) {
// // //       const page = await pdf.getPage(i);
// // //       const viewport = page.getViewport({ scale: 1 });
// // //       const scale = (containerWidth - 40) / viewport.width;
// // //       const scaledViewport = page.getViewport({ scale });
// // //       pages.push({ num: i, width: scaledViewport.width, height: scaledViewport.height, viewport: scaledViewport, pageObj: page });
// // //     }
// // //     setPagesData(pages);
// // //   };

// // //   const myPartyIndex = Number(session?.party?.index);

// // //   const handleFieldClick = (field) => {
// // //     // শুধুমাত্র নিজের ইনডেক্সের এবং খালি ফিল্ডে ক্লিক কাজ করবে
// // //     if (Number(field.partyIndex) !== myPartyIndex || field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     if (field.type === 'signature') setShowSigPad(true);
// // //   };

// // //   const handleSignature = (sigData) => {
// // //     const val = typeof sigData === 'string' ? sigData : sigData.value;
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: val, filled: true } : f));
// // //     setShowSigPad(false);
// // //   };

// // //   const handleSubmit = async () => {
// // //     const myUnfilled = fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled);
// // //     if (myUnfilled.length > 0) return toast.error('Please fill all your fields before finishing.');
    
// // //     setSubmitting(true);
// // //     try {
// // //       await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //       toast.success('Document signed successfully!');
// // //     } catch (err) { 
// // //       toast.error(err.response?.data?.error || 'Submit failed'); 
// // //     } finally { setSubmitting(false); }
// // //   };

// // //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
// // //   if (error) return <div className="h-screen flex items-center justify-center text-destructive font-bold">{error}</div>;
  
// // //   if (completed) return (
// // //     <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
// // //       <CheckCircle2 size={64} className="text-green-500" />
// // //       <h2 className="text-2xl font-bold">Signing Completed!</h2>
// // //       <p className="text-slate-500">You can now close this tab safely.</p>
// // //     </div>
// // //   );

// // //   return (
// // //     <div className="min-h-screen bg-slate-100 pb-20">
// // //       <header className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center shadow-sm">
// // //         <div className="flex items-center gap-2">
// // //           <FileSignature className="text-blue-600" /> 
// // //           <span className="font-bold uppercase tracking-tight truncate max-w-[200px] md:max-w-none">{docData?.title}</span>
// // //         </div>
// // //         <div className="flex items-center gap-3">
// // //           <Badge variant="secondary" className="hidden md:flex">
// // //             {fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled).length} fields left
// // //           </Badge>
// // //           <Button onClick={handleSubmit} disabled={submitting} className="font-bold px-6 shadow-md bg-blue-600 hover:bg-blue-700">
// // //             {submitting ? 'Processing...' : 'Finish Signing'}
// // //           </Button>
// // //         </div>
// // //       </header>

// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-8" style={{ width: page.width, height: page.height }}>
// // //             <PageCanvas page={page} />
            
// // //             {/* ✅ এখানে লজিক আপডেট করা হয়েছে: সব সাইনারের ফিল্ড রেন্ডার হবে, কিন্তু ক্লিক কাজ করবে শুধু নিজেরটায় */}
// // //             {fields.filter(f => f.page === page.num).map(field => {
// // //               const color = PARTY_COLORS[field.partyIndex % PARTY_COLORS.length];
// // //               const isMine = Number(field.partyIndex) === myPartyIndex;
              
// // //               return (
// // //                 <div
// // //                   key={field.id}
// // //                   className={`absolute z-20 border-2 rounded transition-all flex flex-col items-center justify-center overflow-hidden
// // //                     ${isMine && !field.filled ? 'cursor-pointer animate-pulse bg-blue-50/40 border-dashed' : 'pointer-events-none'}`}
// // //                   style={{ 
// // //                     left: `${field.x}%`, 
// // //                     top: `${field.y}%`, 
// // //                     width: `${field.width}%`, 
// // //                     height: `${field.height}%`, 
// // //                     borderColor: field.filled ? '#22c55e' : color,
// // //                     backgroundColor: field.filled ? 'white' : 'transparent'
// // //                   }}
// // //                   onClick={() => handleFieldClick(field)}
// // //                 >
// // //                   {field.filled ? (
// // //                     <img src={field.value} className="w-full h-full object-contain" alt="signature" />
// // //                   ) : (
// // //                     <span className="text-[9px] font-bold text-center" style={{ color }}>
// // //                       {isMine ? 'SIGN HERE' : 'Awaiting...'}
// // //                     </span>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-md p-0 overflow-hidden">
// // //           <DialogHeader className="sr-only">
// // //             <DialogTitle>Draw Signature</DialogTitle>
// // //             <DialogDescription>Signature pad for document signing</DialogDescription>
// // //           </DialogHeader>
// // //           <SignaturePad onSignatureComplete={handleSignature} />
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }

// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Badge } from '@/components/ui/badge';
// // // import { 
// // //   Dialog, 
// // //   DialogContent, 
// // //   DialogHeader, 
// // //   DialogTitle, 
// // //   DialogDescription 
// // // } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { FileSignature, Loader2, CheckCircle2 } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';

// // // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // // const PageCanvas = ({ page }) => {
// // //   const canvasRef = useRef(null);
// // //   const renderTaskRef = useRef(null);

// // //   useEffect(() => {
// // //     const render = async () => {
// // //       if (renderTaskRef.current) renderTaskRef.current.cancel();
// // //       const ctx = canvasRef.current.getContext('2d');
// // //       const dpr = window.devicePixelRatio || 1;
// // //       canvasRef.current.width = page.width * dpr;
// // //       canvasRef.current.height = page.height * dpr;
// // //       ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// // //       try {
// // //         const renderTask = page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
// // //         renderTaskRef.current = renderTask;
// // //         await renderTask.promise;
// // //       } catch (err) {
// // //         if (err.name !== 'RenderingCancelledException') console.error(err);
// // //       }
// // //     };
// // //     render();
// // //     return () => renderTaskRef.current?.cancel();
// // //   }, [page]);

// // //   return <canvas ref={canvasRef} style={{ width: page.width, height: page.height }} className="shadow-md mb-6 bg-white border" />;
// // // };

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState('');
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);

// // //   const containerRef = useRef(null);
// // //   const [pagesData, setPagesData] = useState([]); 

// // //   useEffect(() => { loadSession(); }, [token]);

// // //   const loadSession = async () => {
// // //     if (!token) { setError('Invalid link.'); setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       const document = res.data.document;
// // //       const party = res.data.party;

// // //       setSession(res.data);
// // //       setDocData(document);

// // //       // ✅ ডাটা নরমালাইজার: এটি স্ট্রিং বা অবজেক্ট যাই হোক না কেন ঠিক করে দেবে
// // //       const rawFields = document.fields || [];
// // //       const cleanedFields = rawFields.map(f => {
// // //         let fieldObj = f;
// // //         if (typeof f === 'string') {
// // //           try { fieldObj = JSON.parse(f); } catch (e) { fieldObj = f; }
// // //         }
// // //         return {
// // //           ...fieldObj,
// // //           id: fieldObj.id || `f_${Math.random()}`,
// // //           page: Number(fieldObj.page),
// // //           // ব্যাকএন্ডের party_index কে partyIndex এ রূপান্তর
// // //           partyIndex: Number(fieldObj.party_index !== undefined ? fieldObj.party_index : (fieldObj.partyIndex ?? 0)),
// // //           x: Number(fieldObj.x),
// // //           y: Number(fieldObj.y),
// // //           width: Number(fieldObj.width),
// // //           height: Number(fieldObj.height)
// // //         };
// // //       });

// // //       console.log("Normalised Fields:", cleanedFields);
// // //       setFields(cleanedFields);

// // //       if (document?.status === 'completed') setCompleted(true);
// // //     } catch (err) { 
// // //       console.error("Session load error:", err);
// // //       setError('Session expired or invalid.'); 
// // //     } finally { setLoading(false); }
// // //   };

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const loadPdf = async () => {
// // //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${docData.fileId}`;
// // //       const script = document.createElement('script');
// // //       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
// // //       script.onload = async () => {
// // //         window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
// // //         try {
// // //           const pdf = await window.pdfjsLib.getDocument(proxyUrl).promise;
// // //           renderPages(pdf);
// // //         } catch (err) { console.error(err); }
// // //       };
// // //       document.head.appendChild(script);
// // //     };
// // //     loadPdf();
// // //   }, [docData]);

// // //   const renderPages = async (pdf) => {
// // //     const pages = [];
// // //     const containerWidth = containerRef.current?.clientWidth || 800;
// // //     for (let i = 1; i <= pdf.numPages; i++) {
// // //       const page = await pdf.getPage(i);
// // //       const viewport = page.getViewport({ scale: 1 });
// // //       const scale = (containerWidth - 40) / viewport.width;
// // //       const scaledViewport = page.getViewport({ scale });
// // //       pages.push({ num: i, width: scaledViewport.width, height: scaledViewport.height, viewport: scaledViewport, pageObj: page });
// // //     }
// // //     setPagesData(pages);
// // //   };

// // //   // সেশন থেকে বর্তমান ইউজারের ইনডেক্স নেওয়া
// // //   const myPartyIndex = session?.party?.index !== undefined ? Number(session.party.index) : -1;

// // //   const handleFieldClick = (field) => {
// // //     if (Number(field.partyIndex) !== myPartyIndex || field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     if (field.type === 'signature') setShowSigPad(true);
// // //   };

// // //   const handleSignature = (sigData) => {
// // //     const val = typeof sigData === 'string' ? sigData : (sigData.value || sigData);
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: val, filled: true } : f));
// // //     setShowSigPad(false);
// // //   };

// // //   const handleSubmit = async () => {
// // //     const myUnfilled = fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled);
// // //     if (myUnfilled.length > 0) return toast.error('Please fill all your fields before finishing.');
    
// // //     setSubmitting(true);
// // //     try {
// // //       await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //       toast.success('Document signed successfully!');
// // //     } catch (err) { 
// // //       toast.error(err.response?.data?.error || 'Submit failed'); 
// // //     } finally { setSubmitting(false); }
// // //   };

// // //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
// // //   if (error) return <div className="h-screen flex items-center justify-center text-destructive font-bold">{error}</div>;
  
// // //   if (completed) return (
// // //     <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
// // //       <CheckCircle2 size={64} className="text-green-500" />
// // //       <h2 className="text-2xl font-bold">Signing Completed!</h2>
// // //       <p className="text-slate-500">You can now close this tab safely.</p>
// // //     </div>
// // //   );

// // //   return (
// // //     <div className="min-h-screen bg-slate-100 pb-20">
// // //       <header className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center shadow-sm">
// // //         <div className="flex items-center gap-2">
// // //           <FileSignature className="text-blue-600" /> 
// // //           <span className="font-bold uppercase tracking-tight truncate max-w-[200px] md:max-w-none">{docData?.title}</span>
// // //         </div>
// // //         <div className="flex items-center gap-3">
// // //           <Badge variant="secondary" className="hidden md:flex">
// // //             {fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled).length} fields left
// // //           </Badge>
// // //           <Button onClick={handleSubmit} disabled={submitting} className="font-bold px-6 shadow-md bg-blue-600 hover:bg-blue-700 text-white">
// // //             {submitting ? 'Processing...' : 'Finish Signing'}
// // //           </Button>
// // //         </div>
// // //       </header>

// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-8 bg-white shadow-lg" style={{ width: page.width, height: page.height }}>
// // //             <PageCanvas page={page} />
            
// // //             {/* সব ফিল্ড রেন্ডার করা হচ্ছে */}
// // //             {fields.filter(f => f.page === page.num).map(field => {
// // //               const color = PARTY_COLORS[field.partyIndex % PARTY_COLORS.length];
// // //               const isMine = Number(field.partyIndex) === myPartyIndex;
              
// // //               return (
// // //                 <div
// // //                   key={field.id}
// // //                   className={`absolute z-20 border-2 rounded transition-all flex flex-col items-center justify-center overflow-hidden
// // //                     ${isMine && !field.filled ? 'cursor-pointer animate-pulse bg-blue-50/40 border-dashed' : 'pointer-events-none'}`}
// // //                   style={{ 
// // //                     left: `${field.x}%`, 
// // //                     top: `${field.y}%`, 
// // //                     width: `${field.width}%`, 
// // //                     height: `${field.height}%`, 
// // //                     borderColor: field.filled ? '#22c55e' : color,
// // //                     backgroundColor: field.filled ? 'white' : 'rgba(255,255,255,0.2)'
// // //                   }}
// // //                   onClick={() => handleFieldClick(field)}
// // //                 >
// // //                   {field.filled ? (
// // //                     <img src={field.value} className="w-full h-full object-contain" alt="signature" />
// // //                   ) : (
// // //                     <span className="text-[10px] font-black text-center" style={{ color }}>
// // //                       {isMine ? 'SIGN HERE' : 'AWAITING'}
// // //                     </span>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-md p-0 overflow-hidden bg-white">
// // //           <DialogHeader className="p-4 border-b">
// // //             <DialogTitle>Draw your signature</DialogTitle>
// // //           </DialogHeader>
// // //           <div className="p-4">
// // //              <SignaturePad onSignatureComplete={handleSignature} />
// // //           </div>
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }
// // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Badge } from '@/components/ui/badge';
// // // import { 
// // //   Dialog, 
// // //   DialogContent, 
// // //   DialogHeader, 
// // //   DialogTitle 
// // // } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { FileSignature, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';

// // // // ১. সঠিক ইম্পোর্ট এবং ওয়ার্কার সেটআপ (এটি ইম্পোর্টের সাথেই রাখুন)
// // // import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
// // // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

// // // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // // const PageCanvas = ({ page }) => {
// // //   const canvasRef = useRef(null);
// // //   const renderTaskRef = useRef(null);

// // //   useEffect(() => {
// // //     const render = async () => {
// // //       if (!page || !canvasRef.current) return;
// // //       if (renderTaskRef.current) renderTaskRef.current.cancel();

// // //       const ctx = canvasRef.current.getContext('2d', { alpha: false });
// // //       const dpr = window.devicePixelRatio || 1;
      
// // //       canvasRef.current.width = page.width * dpr;
// // //       canvasRef.current.height = page.height * dpr;
// // //       ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// // //       try {
// // //         const renderTask = page.pageObj.render({ 
// // //           canvasContext: ctx, 
// // //           viewport: page.viewport 
// // //         });
// // //         renderTaskRef.current = renderTask;
// // //         await renderTask.promise;
// // //       } catch (err) {
// // //         if (err.name !== 'RenderingCancelledException') console.error(err);
// // //       }
// // //     };
// // //     render();
// // //     return () => renderTaskRef.current?.cancel();
// // //   }, [page]);

// // //   return <canvas ref={canvasRef} style={{ width: page.width, height: page.height }} className="shadow-lg mb-8 bg-white border border-slate-200 rounded-sm transition-all" />;
// // // };

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState('');
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);
// // //   const [pagesData, setPagesData] = useState([]);

// // //   const containerRef = useRef(null);

// // //   const loadSession = useCallback(async () => {
// // //     if (!token) { setError('Invalid or missing token.'); setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       const { document, party } = res.data;

// // //       setSession(res.data);
// // //       setDocData(document);

// // //   const cleanedFields = (document.fields || []).map(f => {
// // //   const obj = typeof f === 'string' ? JSON.parse(f) : f;
  
// // //   // ব্যাকএন্ডে 'signerIndex' সেভ হয়, তাই সেটিকেই এখানে প্রধান ইনডেক্স হিসেবে ধরুন
// // //   const actualIndex = obj.signerIndex !== undefined ? obj.signerIndex : (obj.partyIndex ?? 0);
  
// // //   return {
// // //     ...obj,
// // //     id: obj.id || `f_${Math.random()}`,
// // //     partyIndex: Number(actualIndex), // ইউনিফর্ম ইনডেক্স
// // //     filled: !!obj.value
// // //   };
// // // });

// // //       setFields(cleanedFields);
// // //       if (document.status === 'completed') setCompleted(true);
// // //     } catch (err) {
// // //       setError('আপনার এই লিঙ্কের মেয়াদ শেষ হয়ে গেছে অথবা লিঙ্কটি সঠিক নয়।');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [token]);

// // //   useEffect(() => { loadSession(); }, [loadSession]);

// // //   // ২. PDF রেন্ডারিং লজিক (window.pdfjsLib এর বদলে শুধু pdfjsLib)
// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;

// // //     const loadPdf = async () => {
// // //       // nexsign_docs ফোল্ডার থাকলে আইডি ক্লিন করা
// // //       const cleanId = docData.fileId.includes('/') ? docData.fileId.split('/').pop() : docData.fileId;
// // //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${cleanId}`;
      
// // //       try {
// // //         // ফিক্স: window.pdfjsLib সরিয়ে শুধু pdfjsLib ব্যবহার করা হয়েছে
// // //         const pdf = await pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true }).promise;
// // //         const containerWidth = containerRef.current?.clientWidth || 800;
// // //         const pages = [];

// // //         for (let i = 1; i <= pdf.numPages; i++) {
// // //           const page = await pdf.getPage(i);
// // //           const viewport = page.getViewport({ scale: 1 });
// // //           const scale = (containerWidth - 60) / viewport.width;
// // //           const scaledViewport = page.getViewport({ scale });
// // //           pages.push({ num: i, width: scaledViewport.width, height: scaledViewport.height, viewport: scaledViewport, pageObj: page });
// // //         }
// // //         setPagesData(pages);
// // //       } catch (err) {
// // //         console.error("PDF Loading Error:", err);
// // //         // যদি unpkg ফেইল করে তবে লোকাল ওয়ার্কার ট্রাই করবে
// // //         setError('পিডিএফ লোড করতে সমস্যা হচ্ছে। পেজটি রিফ্রেশ দিন।');
// // //       }
// // //     };
// // //     loadPdf();
// // //   }, [docData]);

// // //   // বাকি কোড আগের মতোই থাকবে...
// // //   const myPartyIndex = session?.party?.index !== undefined ? Number(session.party.index) : -1;

// // //   const handleFieldClick = (field) => {
// // //     if (Number(field.partyIndex) !== myPartyIndex || field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     if (field.type === 'signature') setShowSigPad(true);
// // //   };

// // //   const handleSignature = (sigData) => {
// // //     const val = typeof sigData === 'string' ? sigData : sigData.value;
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: val, filled: true } : f));
// // //     setShowSigPad(false);
// // //     toast.success('সিগনেচার যুক্ত হয়েছে');
// // //   };

// // //   const handleSubmit = async () => {
// // //     const myUnfilled = fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled);
// // //     if (myUnfilled.length > 0) return toast.error('দয়া করে আপনার সব ফিল্ডে স্বাক্ষর করুন।');
    
// // //     setSubmitting(true);
// // //     try {
// // //       await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //       toast.success('Document signed successfully!');
// // //     } catch (err) {
// // //       toast.error('সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
// // //     } finally {
// // //       setSubmitting(false);
// // //     }
// // //   };

// // //   if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;
// // //   if (error) return <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-4"><AlertCircle size={48} className="text-rose-500" /><h2 className="text-xl font-bold">{error}</h2></div>;
  
// // //   if (completed) return (
// // //     <div className="h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 p-6">
// // //       <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
// // //         <CheckCircle2 size={40} className="text-green-600" />
// // //       </div>
// // //       <div className="text-center">
// // //         <h2 className="text-3xl font-bold text-slate-900 mb-2">স্বাক্ষর সফল হয়েছে!</h2>
// // //         <p className="text-slate-500 max-w-sm mx-auto">সবাই স্বাক্ষর শেষ করলে আপনাকে ইমেইল করা হবে। আপনি এখন এই ট্যাবটি বন্ধ করতে পারেন।</p>
// // //       </div>
// // //     </div>
// // //   );

// // //   return (
// // //     <div className="min-h-screen bg-slate-100 pb-20 font-sans">
// // //       <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center shadow-sm">
// // //         <div className="flex items-center gap-3">
// // //           <div className="bg-blue-600 p-2 rounded-lg"><FileSignature className="text-white w-5 h-5" /></div>
// // //           <h1 className="font-bold text-slate-800 tracking-tight">{docData?.title}</h1>
// // //         </div>
// // //         <div className="flex items-center gap-4">
// // //           <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 hidden sm:flex">
// // //             {fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled).length} টি ফিল্ড বাকি
// // //           </Badge>
// // //           <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
// // //             {submitting ? 'সংরক্ষণ হচ্ছে...' : 'Finish Signing'}
// // //           </Button>
// // //         </div>
// // //       </header>

// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-10 px-4 flex flex-col items-center">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-12" style={{ width: page.width, height: page.height }}>
// // //             <PageCanvas page={page} />
            
// // //             {fields.filter(f => f.page === page.num).map(field => {
// // //               const color = PARTY_COLORS[field.partyIndex % PARTY_COLORS.length];
// // //               const isMine = Number(field.partyIndex) === myPartyIndex;
              
// // //               return (
// // //                 <div
// // //                   key={field.id}
// // //                   className={`absolute z-30 border-2 rounded-lg transition-all flex flex-col items-center justify-center group overflow-hidden
// // //                     ${isMine && !field.filled ? 'cursor-pointer hover:scale-105 hover:shadow-xl animate-pulse' : 'pointer-events-none'}`}
// // //                   style={{ 
// // //                     left: `${field.x}%`, 
// // //                     top: `${field.y}%`, 
// // //                     width: `${field.width}%`, 
// // //                     height: `${field.height}%`, 
// // //                     borderColor: field.filled ? '#10b981' : color,
// // //                     backgroundColor: field.filled ? 'white' : `${color}15`
// // //                   }}
// // //                   onClick={() => handleFieldClick(field)}
// // //                 >
// // //                   {field.filled ? (
// // //                     <img src={field.value} className="w-[90%] h-[90%] object-contain mix-blend-multiply" alt="signature" />
// // //                   ) : (
// // //                     <div className="flex flex-col items-center gap-1">
// // //                        <span className="text-[10px] font-bold uppercase" style={{ color }}>{isMine ? 'Sign Here' : 'Wait'}</span>
// // //                        {isMine && <div className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: color }}></div>}
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-lg p-0 bg-white rounded-2xl overflow-hidden shadow-2xl">
// // //           <div className="p-6">
// // //              <SignaturePad onSignatureComplete={handleSignature} />
// // //           </div>
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }
// // // import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { Loader2, CheckCircle2, Lock, PenTool } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';
// // // import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// // // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);
// // //   const [pagesData, setPagesData] = useState([]);
// // //   const containerRef = useRef(null);

// // //   // ১. বর্তমান ইউজারের ইনডেক্স বের করার সবথেকে স্ট্রিক্ট লজিক
// // //   const myPartyIndex = useMemo(() => {
// // //     if (!session?.party) return null;
// // //     const idx = session.party.index !== undefined ? session.party.index : session.party.signerIndex;
// // //     return idx !== null ? Number(idx) : null;
// // //   }, [session]);

// // //   const loadSession = useCallback(async () => {
// // //     if (!token) { setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
      
// // //       const rawFields = res.data.document.fields || [];
// // //       const cleaned = rawFields.map(f => {
// // //         const obj = typeof f === 'string' ? JSON.parse(f) : f;
// // //         return { 
// // //           ...obj, 
// // //           id: obj.id || `f_${Math.random()}`,
// // //           // এখানে signerIndex বা partyIndex নিশ্চিতভাবে নাম্বার এ কনভার্ট করা হচ্ছে
// // //           partyIndex: Number(obj.signerIndex ?? obj.partyIndex ?? 0),
// // //           filled: !!obj.value 
// // //         };
// // //       });
// // //       setFields(cleaned);
// // //       if (res.data.document.status === 'completed') setCompleted(true);
// // //     } catch (err) {
// // //       toast.error('লিঙ্কটি কাজ করছে না।');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [token]);

// // //   useEffect(() => { loadSession(); }, [loadSession]);

// // //   const handleFieldClick = (e, field) => {
// // //     e.preventDefault();
// // //     e.stopPropagation();

// // //     // ৩. রানটাইম সিকিউরিটি চেক
// // //     const fieldOwner = Number(field.partyIndex);
// // //     if (fieldOwner !== myPartyIndex) {
// // //       toast.error("এটি আপনার স্বাক্ষরের জায়গা নয়।");
// // //       return;
// // //     }

// // //     if (field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     setShowSigPad(true);
// // //   };

// // //   const handleSignature = (sigValue) => {
// // //     if (!sigValue) return;
// // //     setFields(prev => prev.map(f => 
// // //       f.id === activeFieldId ? { ...f, value: sigValue, filled: true } : f
// // //     ));
// // //     setShowSigPad(false);
// // //     setActiveFieldId(null);
// // //   };

// // //   const handleSubmit = async () => {
// // //     const myUnfilled = fields.filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled);
// // //     if (myUnfilled.length > 0) return toast.error('দয়া করে আপনার সব ফিল্ড পূরণ করুন।');
    
// // //     setSubmitting(true);
// // //     try {
// // //       await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //     } catch (err) {
// // //       toast.error('সাবমিট করা সম্ভব হয়নি।');
// // //     } finally {
// // //       setSubmitting(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const loadPdf = async () => {
// // //       const cleanId = docData.fileId.split('/').pop();
// // //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${cleanId}`;
// // //       try {
// // //         const pdf = await pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true }).promise;
// // //         const containerWidth = containerRef.current?.clientWidth || 800;
// // //         const pages = [];
// // //         for (let i = 1; i <= pdf.numPages; i++) {
// // //           const page = await pdf.getPage(i);
// // //           const viewport = page.getViewport({ scale: (containerWidth - 40) / page.getViewport({ scale: 1 }).width });
// // //           pages.push({ num: i, viewport, pageObj: page });
// // //         }
// // //         setPagesData(pages);
// // //       } catch (err) { console.error("PDF Load Error:", err); }
// // //     };
// // //     loadPdf();
// // //   }, [docData]);

// // //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
// // //   if (completed) return <div className="h-screen flex flex-col items-center justify-center gap-4"><CheckCircle2 size={64} className="text-green-500" /><h2 className="text-2xl font-bold">Signed Successfully!</h2></div>;

// // //   return (
// // //     <div className="min-h-screen bg-slate-50 pb-20">
// // //       <header className="sticky top-0 z-[100] bg-white border-b p-4 flex justify-between items-center shadow-sm">
// // //         <h1 className="font-bold">{docData?.title}</h1>
// // //         <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600">Finish</Button>
// // //       </header>

// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-10 px-4">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-8 bg-white shadow-xl mx-auto" style={{ width: page.viewport.width, height: page.viewport.height }}>
// // //             <canvas ref={el => {
// // //               if (el) {
// // //                 const ctx = el.getContext('2d');
// // //                 el.width = page.viewport.width;
// // //                 el.height = page.viewport.height;
// // //                 page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
// // //               }
// // //             }} />
            
// // //             {fields.filter(f => f.page === page.num).map(field => {
// // //               const fieldOwner = Number(field.partyIndex);
// // //               const isMine = fieldOwner === myPartyIndex;
              
// // //               return (
// // //                 <div
// // //                   key={field.id}
// // //                   onClick={(e) => isMine && handleFieldClick(e, field)}
// // //                   className={`absolute border-2 rounded transition-all z-[50] flex flex-col items-center justify-center overflow-hidden
// // //                     ${isMine && !field.filled ? 'border-blue-600 bg-blue-50/40 cursor-pointer animate-pulse ring-2 ring-blue-200' : 'border-gray-300'}
// // //                     ${!isMine ? 'opacity-30 bg-gray-100 grayscale cursor-not-allowed pointer-events-none' : 'pointer-events-auto'}`}
// // //                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%` }}
// // //                 >
// // //                   {field.filled ? (
// // //                     <img src={field.value} className="w-full h-full object-contain p-1" alt="sig" />
// // //                   ) : (
// // //                     <div className="flex flex-col items-center">
// // //                       {!isMine ? <Lock size={14} className="text-gray-400" /> : <PenTool size={14} className="text-blue-600" />}
// // //                       <span className={`text-[8px] font-bold uppercase ${isMine ? 'text-blue-700' : 'text-gray-500'}`}>
// // //                         {isMine ? 'Your Sign' : `Signer ${fieldOwner + 1}`}
// // //                       </span>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-lg p-6 bg-white z-[9999]">
// // //            <DialogTitle className="text-lg font-bold">আপনার স্বাক্ষর প্রদান করুন</DialogTitle>
// // //            {activeFieldId && <SignaturePad onSignatureComplete={handleSignature} />}
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }

// // // import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { Loader2, CheckCircle2, Lock, PenTool } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';
// // // import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// // // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);
// // //   const [pagesData, setPagesData] = useState([]);
// // //   const containerRef = useRef(null);

// // //   // ১. বর্তমান ইউজারের ইনডেক্স বের করার স্ট্রিক্ট লজিক
// // //   const myPartyIndex = useMemo(() => {
// // //     if (!session?.party) return null;
// // //     const idx = session.party.index !== undefined ? session.party.index : session.party.signerIndex;
// // //     return idx !== null ? Number(idx) : null;
// // //   }, [session]);

// // //   const loadSession = useCallback(async () => {
// // //     if (!token) { setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
      
// // //       const rawFields = res.data.document.fields || [];
// // //       const cleaned = rawFields.map(f => {
// // //         const obj = typeof f === 'string' ? JSON.parse(f) : f;
// // //         return { 
// // //           ...obj, 
// // //           id: obj.id || `f_${Math.random()}`,
// // //           partyIndex: Number(obj.signerIndex ?? obj.partyIndex ?? 0),
// // //           filled: !!obj.value 
// // //         };
// // //       });
// // //       setFields(cleaned);
// // //       if (res.data.document.status === 'completed') setCompleted(true);
// // //     } catch (err) {
// // //       toast.error('লিঙ্কটি কাজ করছে না।');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [token]);

// // //   useEffect(() => { loadSession(); }, [loadSession]);

// // //   const handleFieldClick = (e, field) => {
// // //     e.preventDefault();
// // //     e.stopPropagation();

// // //     const fieldOwner = Number(field.partyIndex);
// // //     if (fieldOwner !== myPartyIndex) {
// // //       toast.error("এটি আপনার স্বাক্ষরের জায়গা নয়।");
// // //       return;
// // //     }

// // //     if (field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     setShowSigPad(true);
// // //   };

// // //   // ✅ ফিক্সড: সিগনেচার হ্যান্ডলিং (স্টেট আপডেট নিশ্চিত করা)
// // //   const handleSignature = (sigValue) => {
// // //     if (!sigValue) return;
// // //     setFields(prevFields => {
// // //       return prevFields.map(f => 
// // //         f.id === activeFieldId ? { ...f, value: sigValue, filled: true } : f
// // //       );
// // //     });
// // //     setShowSigPad(false);
// // //     setActiveFieldId(null);
// // //   };

// // //   // ✅ ফিক্সড: সাবমিট লজিক (সব সিগনেচার একসাথে পাঠানো)
// // //   const handleSubmit = async () => {
// // //     const myFields = fields.filter(f => Number(f.partyIndex) === myPartyIndex);
// // //     const myUnfilled = myFields.filter(f => !f.filled);
    
// // //     if (myUnfilled.length > 0) {
// // //       return toast.error(`আপনার আরও ${myUnfilled.length}টি সিগনেচার বাকি আছে।`);
// // //     }
    
// // //     setSubmitting(true);
// // //     try {
// // //       // লেটেস্ট স্টেট ডাটা ক্লিন করে পাঠানো
// // //       const finalFields = fields.map(f => ({
// // //         ...f,
// // //         partyIndex: Number(f.partyIndex),
// // //         filled: !!f.value
// // //       }));

// // //       const res = await api.post(`/documents/sign/submit`, { token, fields: finalFields });
      
// // //       if (res.data.success) {
// // //         setCompleted(true);
// // //         toast.success('সফলভাবে স্বাক্ষরিত হয়েছে!');
// // //       }
// // //     } catch (err) {
// // //       toast.error(err.response?.data?.error || 'সাবমিট করা সম্ভব হয়নি।');
// // //     } finally {
// // //       setSubmitting(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const loadPdf = async () => {
// // //       const cleanId = docData.fileId.split('/').pop();
// // //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${cleanId}`;
// // //       try {
// // //         const pdf = await pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true }).promise;
// // //         const containerWidth = containerRef.current?.clientWidth || 800;
// // //         const pages = [];
// // //         for (let i = 1; i <= pdf.numPages; i++) {
// // //           const page = await pdf.getPage(i);
// // //           const viewport = page.getViewport({ scale: (containerWidth - 40) / page.getViewport({ scale: 1 }).width });
// // //           pages.push({ num: i, viewport, pageObj: page });
// // //         }
// // //         setPagesData(pages);
// // //       } catch (err) { console.error("PDF Load Error:", err); }
// // //     };
// // //     loadPdf();
// // //   }, [docData]);

// // //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;
// // //   if (completed) return <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-4"><CheckCircle2 size={80} className="text-green-500" /><h2 className="text-3xl font-bold text-slate-900">Signed Successfully!</h2><p className="text-slate-500">সবাই সাইন করলে আপনি ইমেইলে কপি পেয়ে যাবেন।</p></div>;

// // //   return (
// // //     <div className="min-h-screen bg-slate-50 pb-20">
// // //       <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center shadow-sm">
// // //         <div className="flex items-center gap-2">
// // //           <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold">N</div>
// // //           <h1 className="font-semibold text-slate-700 truncate max-w-[200px]">{docData?.title}</h1>
// // //         </div>
// // //         <Button onClick={handleSubmit} disabled={submitting} className="bg-sky-600 hover:bg-sky-700 text-white px-6">
// // //           {submitting ? <Loader2 className="animate-spin mr-2" size={16}/> : null} Finish
// // //         </Button>
// // //       </header>

// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-10 px-4">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-8 bg-white shadow-2xl mx-auto border border-slate-200" style={{ width: page.viewport.width, height: page.viewport.height }}>
// // //             <canvas ref={el => {
// // //               if (el) {
// // //                 const ctx = el.getContext('2d');
// // //                 el.width = page.viewport.width;
// // //                 el.height = page.viewport.height;
// // //                 page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
// // //               }
// // //             }} />
            
// // //             {fields.filter(f => Number(f.page) === page.num).map(field => {
// // //               const fieldOwner = Number(field.partyIndex);
// // //               const isMine = fieldOwner === myPartyIndex;
              
// // //               return (
// // //                 <div
// // //                   key={field.id}
// // //                   onClick={(e) => isMine && handleFieldClick(e, field)}
// // //                   className={`absolute border-2 rounded transition-all z-[50] flex flex-col items-center justify-center overflow-hidden
// // //                     ${isMine && !field.filled ? 'border-sky-500 bg-sky-50/50 cursor-pointer animate-pulse ring-4 ring-sky-100' : 'border-slate-300'}
// // //                     ${!isMine && !field.filled ? 'opacity-40 bg-slate-100 grayscale cursor-not-allowed' : 'pointer-events-auto'}`}
// // //                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%` }}
// // //                 >
// // //                   {field.filled ? (
// // //                     <img src={field.value} className="w-full h-full object-contain p-1" alt="signature" />
// // //                   ) : (
// // //                     <div className="flex flex-col items-center gap-1">
// // //                       {!isMine ? <Lock size={12} className="text-slate-400" /> : <PenTool size={14} className="text-sky-600" />}
// // //                       <span className={`text-[9px] font-bold uppercase tracking-tighter ${isMine ? 'text-sky-700' : 'text-slate-500'}`}>
// // //                         {isMine ? 'Sign Here' : `Signer ${fieldOwner + 1}`}
// // //                       </span>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-lg p-0 bg-white overflow-hidden border-none">
// // //            <div className="p-4 border-b bg-slate-50">
// // //              <DialogTitle className="text-lg font-bold text-slate-800">আপনার স্বাক্ষর দিন</DialogTitle>
// // //            </div>
// // //            <div className="p-6">
// // //              {activeFieldId && <SignaturePad onSignatureComplete={handleSignature} />}
// // //            </div>
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }

// // //new 

// // // import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { Loader2, CheckCircle2, Lock, PenTool } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';
// // // import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// // // // Worker URL ফিক্স
// // // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);
// // //   const [pagesData, setPagesData] = useState([]);
// // //   const containerRef = useRef(null);

// // //   const myPartyIndex = useMemo(() => {
// // //     if (!session?.party) return null;
// // //     return session.party.index !== undefined ? Number(session.party.index) : null;
// // //   }, [session]);

// // //   const loadSession = useCallback(async () => {
// // //     if (!token) { setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
      
// // //       const rawFields = res.data.document.fields || [];
// // //       const cleaned = rawFields.map(f => {
// // //         const obj = typeof f === 'string' ? JSON.parse(f) : f;
// // //         return { 
// // //           ...obj, 
// // //           id: obj.id || `f_${Math.random()}`,
// // //           partyIndex: Number(obj.signerIndex ?? obj.partyIndex ?? 0),
// // //           filled: !!obj.value 
// // //         };
// // //       });
// // //       setFields(cleaned);
// // //       if (res.data.document.status === 'completed') setCompleted(true);
// // //     } catch (err) {
// // //       toast.error('লিঙ্কটি কাজ করছে না বা মেয়াদ শেষ।');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [token]);

// // //   useEffect(() => { loadSession(); }, [loadSession]);

// // //   // ✅ PDF Loading ফিক্স (সঠিক প্রক্সি ইউআরএল জেনারেশন)
// // //   // useEffect(() => {
// // //   //   if (!docData?.fileId) return;

// // //   //   const loadPdf = async () => {
// // //   //     try {
// // //   //       // ফিক্স: পুরো fileId ব্যবহার করা এবং শেষে .pdf নিশ্চিত করা
// // //   //       let fileId = docData.fileId;
// // //   //       if (!fileId.toLowerCase().endsWith('.pdf')) fileId += '.pdf';
        
// // //   //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${fileId}`;
// // //   //       console.log("Attempting to load PDF from:", proxyUrl);

// // //   //       const pdf = await pdfjsLib.getDocument({ 
// // //   //         url: proxyUrl, 
// // //   //         withCredentials: true 
// // //   //       }).promise;

// // //   //       const containerWidth = containerRef.current?.clientWidth || 800;
// // //   //       const pages = [];
        
// // //   //       for (let i = 1; i <= pdf.numPages; i++) {
// // //   //         const page = await pdf.getPage(i);
// // //   //         const originalViewport = page.getViewport({ scale: 1 });
// // //   //         const scale = (containerWidth - 40) / originalViewport.width;
// // //   //         const viewport = page.getViewport({ scale });
// // //   //         pages.push({ num: i, viewport, pageObj: page });
// // //   //       }
// // //   //       setPagesData(pages);
// // //   //     } catch (err) { 
// // //   //       console.error("PDF Loading Failed:", err);
// // //   //       toast.error("পিডিএফ লোড করা সম্ভব হয়নি।");
// // //   //     }
// // //   //   };
// // //   //   loadPdf();
// // //   // }, [docData]);

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;

// // //     const loadPdf = async () => {
// // //       // ১. Cloudinary-র Public ID থেকে .pdf এক্সটেনশন সরিয়ে একটি ক্লিন আইডি নিন
// // //       const baseFileId = docData.fileId.replace(/\.pdf$/i, '');
      
// // //       // ২. প্রক্সি ইউআরএল তৈরি (এক্সটেনশন ছাড়া পাঠান, ব্যাকএন্ড স্মার্টলি হ্যান্ডেল করবে)
// // //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${baseFileId}`;
      
// // //       console.log("Loading PDF from Proxy:", proxyUrl);

// // //       try {
// // //         const pdf = await pdfjsLib.getDocument({ 
// // //           url: proxyUrl, 
// // //           withCredentials: true 
// // //         }).promise;

// // //         const containerWidth = containerRef.current?.clientWidth || 800;
// // //         const pages = [];
        
// // //         for (let i = 1; i <= pdf.numPages; i++) {
// // //           const page = await pdf.getPage(i);
// // //           const originalViewport = page.getViewport({ scale: 1 });
// // //           const scale = (containerWidth - 40) / originalViewport.width;
// // //           const viewport = page.getViewport({ scale });
// // //           pages.push({ num: i, viewport, pageObj: page });
// // //         }
// // //         setPagesData(pages);
// // //       } catch (err) { 
// // //         console.error("PDF Loading Failed:", err);
// // //         toast.error("পিডিএফ লোড করা সম্ভব হয়নি।");
// // //       }
// // //     };
// // //     loadPdf();
// // //   }, [docData]);
// // //   const handleFieldClick = (e, field) => {
// // //     e.preventDefault();
// // //     if (Number(field.partyIndex) !== myPartyIndex) {
// // //       toast.error("এটি আপনার স্বাক্ষরের জায়গা নয়।");
// // //       return;
// // //     }
// // //     if (field.filled) return;
// // //     setActiveFieldId(field.id);
// // //     setShowSigPad(true);
// // //   };

// // //   const handleSignature = (sigValue) => {
// // //     if (!sigValue) return;
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: sigValue, filled: true } : f));
// // //     setShowSigPad(false);
// // //     setActiveFieldId(null);
// // //   };

// // //   const handleSubmit = async () => {
// // //     const myFields = fields.filter(f => Number(f.partyIndex) === myPartyIndex);
// // //     const unfilledCount = myFields.filter(f => !f.filled).length;
    
// // //     if (unfilledCount > 0) {
// // //       return toast.error(`আপনার আরও ${unfilledCount}টি স্বাক্ষর বাকি আছে।`);
// // //     }
    
// // //     setSubmitting(true);
// // //     try {
// // //       await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //       toast.success('সফলভাবে স্বাক্ষরিত হয়েছে!');
// // //     } catch (err) {
// // //       toast.error('সাবমিট করা সম্ভব হয়নি।');
// // //     } finally {
// // //       setSubmitting(false);
// // //     }
// // //   };

// // //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;
// // //   if (completed) return <div className="h-screen flex flex-col items-center justify-center gap-4 text-center"><CheckCircle2 size={80} className="text-green-500" /><h2 className="text-3xl font-bold">Document Signed!</h2><p className="text-slate-500">সবাই সাইন করলে আপনি ইমেইলে কপি পেয়ে যাবেন।</p></div>;

// // //   return (
// // //     <div className="min-h-screen bg-slate-100">
// // //       <header className="sticky top-0 z-[100] bg-white border-b p-4 flex justify-between items-center shadow-sm">
// // //         <div className="flex items-center gap-2">
// // //           <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center text-white font-bold">N</div>
// // //           <span className="font-semibold text-slate-700">{docData?.title}</span>
// // //         </div>
// // //         <Button onClick={handleSubmit} disabled={submitting} className="bg-sky-600">
// // //           {submitting ? <Loader2 className="animate-spin mr-2" size={16}/> : 'Finish Signing'}
// // //         </Button>
// // //       </header>

// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-10 px-4 flex flex-col items-center">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-8 bg-white shadow-lg border border-slate-200" style={{ width: page.viewport.width, height: page.viewport.height }}>
// // //             <canvas ref={el => {
// // //               if (el && !el.dataset.rendered) {
// // //                 const ctx = el.getContext('2d');
// // //                 el.width = page.viewport.width;
// // //                 el.height = page.viewport.height;
// // //                 page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
// // //                 el.dataset.rendered = 'true';
// // //               }
// // //             }} />
            
// // //             {fields.filter(f => Number(f.page) === page.num).map(field => {
// // //               const isMine = Number(field.partyIndex) === myPartyIndex;
// // //               return (
// // //                 <div
// // //                   key={field.id}
// // //                   onClick={(e) => handleFieldClick(e, field)}
// // //                   className={`absolute border-2 transition-all flex flex-col items-center justify-center
// // //                     ${isMine && !field.filled ? 'border-sky-500 bg-sky-50/30 cursor-pointer animate-pulse' : 'border-slate-300'}`}
// // //                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%` }}
// // //                 >
// // //                   {field.filled ? (
// // //                     <img src={field.value} className="w-full h-full object-contain p-1" alt="sig" />
// // //                   ) : (
// // //                     <div className="flex flex-col items-center text-[10px] text-slate-500">
// // //                       {isMine ? <PenTool size={14} className="text-sky-500 mb-1" /> : <Lock size={12} />}
// // //                       <span>{isMine ? 'SIGN HERE' : `SIGNER ${Number(field.partyIndex) + 1}`}</span>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-lg p-6 bg-white">
// // //           <DialogTitle className="mb-4">আপনার স্বাক্ষর দিন</DialogTitle>
// // //           <SignaturePad onSignatureComplete={handleSignature} />
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }

// // //ai studio
// // // import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { Loader2, CheckCircle2, Lock, PenTool } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';
// // // import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// // // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);
// // //   const [pagesData, setPagesData] = useState([]);
// // //   const containerRef = useRef(null);

// // //   const myPartyIndex = useMemo(() => {
// // //     if (!session?.party) return null;
// // //     return session.party.index !== undefined ? Number(session.party.index) : null;
// // //   }, [session]);

// // //   const loadSession = useCallback(async () => {
// // //     if (!token) { setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
// // //       const rawFields = res.data.document.fields || [];
// // //       const cleaned = rawFields.map(f => {
// // //         const obj = typeof f === 'string' ? JSON.parse(f) : f;
// // //         return { ...obj, id: obj.id || `f_${Math.random()}`, partyIndex: Number(obj.signerIndex ?? obj.partyIndex ?? 0), filled: !!obj.value };
// // //       });
// // //       setFields(cleaned);
// // //       if (res.data.document.status === 'completed' || res.data.party.status === 'signed') setCompleted(true);
// // //     } catch (err) { toast.error('লিঙ্কটি কাজ করছে না।'); }
// // //     finally { setLoading(false); }
// // //   }, [token]);

// // //   useEffect(() => { loadSession(); }, [loadSession]);

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const loadPdf = async () => {
// // //       // FIX: এক্সটেনশন কাটার দরকার নেই, সরাসরি fileId পাঠান
// // //       const proxyUrl = `http://localhost:5001/api/documents/proxy/${docData.fileId}`;
// // //       try {
// // //         const pdf = await pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true }).promise;
// // //         const containerWidth = containerRef.current?.clientWidth || 800;
// // //         const pages = [];
// // //         for (let i = 1; i <= pdf.numPages; i++) {
// // //           const page = await pdf.getPage(i);
// // //           const originalViewport = page.getViewport({ scale: 1 });
// // //           const scale = (containerWidth - 40) / originalViewport.width;
// // //           const viewport = page.getViewport({ scale });
// // //           pages.push({ num: i, viewport, pageObj: page });
// // //         }
// // //         setPagesData(pages);
// // //       } catch (err) { toast.error("পিডিএফ লোড করা সম্ভব হয়নি।"); }
// // //     };
// // //     loadPdf();
// // //   }, [docData]);

// // //   const handleFieldClick = (e, field) => {
// // //     e.preventDefault();
// // //     if (Number(field.partyIndex) !== myPartyIndex) { toast.error("এটি আপনার জায়গা নয়।"); return; }
// // //     if (field.type === 'text') {
// // //       const val = prompt("Enter text:", field.value || "");
// // //       if (val !== null) {
// // //         setFields(prev => prev.map(f => f.id === field.id ? { ...f, value: val, filled: true } : f));
// // //       }
// // //     } else {
// // //       setActiveFieldId(field.id);
// // //       setShowSigPad(true);
// // //     }
// // //   };

// // //   const handleSignature = (sigValue) => {
// // //     if (!sigValue) return;
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: sigValue, filled: true } : f));
// // //     setShowSigPad(false);
// // //     setActiveFieldId(null);
// // //   };

// // //   const handleSubmit = async () => {
// // //     const myFields = fields.filter(f => Number(f.partyIndex) === myPartyIndex);
// // //     const unfilledCount = myFields.filter(f => !f.filled).length;
// // //     if (unfilledCount > 0) return toast.error(`আপনার আরও স্বাক্ষর বাকি আছে।`);
// // //     setSubmitting(true);
// // //     try {
// // //       await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //       toast.success('স্বাক্ষরিত হয়েছে!');
// // //     } catch (err) { toast.error('সাবমিট করা সম্ভব হয়নি।'); }
// // //     finally { setSubmitting(false); }
// // //   };

// // //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;
// // //   if (completed) return <div className="h-screen flex flex-col items-center justify-center gap-4 text-center"><CheckCircle2 size={80} className="text-green-500" /><h2 className="text-3xl font-bold">Document Signed!</h2><p className="text-slate-500">সবাই সাইন করলে মেইলে কপি পেয়ে যাবেন।</p></div>;

// // //   return (
// // //     <div className="min-h-screen bg-slate-100">
// // //       <header className="sticky top-0 z-[100] bg-white border-b p-4 flex justify-between items-center shadow-sm">
// // //         <div className="flex items-center gap-2 font-semibold text-slate-700">{docData?.title}</div>
// // //         <Button onClick={handleSubmit} disabled={submitting} className="bg-sky-600">Finish Signing</Button>
// // //       </header>
// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-10 px-4 flex flex-col items-center">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-8 bg-white shadow-lg border border-slate-200" style={{ width: page.viewport.width, height: page.viewport.height }}>
// // //             <canvas ref={el => {
// // //               if (el && !el.dataset.rendered) {
// // //                 const ctx = el.getContext('2d');
// // //                 el.width = page.viewport.width; el.height = page.viewport.height;
// // //                 page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
// // //                 el.dataset.rendered = 'true';
// // //               }
// // //             }} />
// // //             {fields.filter(f => Number(f.page) === page.num).map(field => {
// // //               const isMine = Number(field.partyIndex) === myPartyIndex;
// // //               return (
// // //                 <div key={field.id} onClick={(e) => handleFieldClick(e, field)}
// // //                   className={`absolute border-2 transition-all flex items-center justify-center ${isMine && !field.filled ? 'border-sky-500 bg-sky-50/30 cursor-pointer animate-pulse' : 'border-slate-300'}`}
// // //                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%` }}>
// // //                   {field.filled ? (
// // //                     field.value.startsWith('data:image') ? 
// // //                     <img src={field.value} className="w-full h-full object-contain p-1" /> :
// // //                     <span className="font-serif text-[12px] font-bold">{field.value}</span>
// // //                   ) : <span className="text-[10px]">{isMine ? 'SIGN HERE' : `SIGNER ${Number(field.partyIndex) + 1}`}</span>}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>
// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-lg p-6 bg-white"><DialogTitle className="mb-4">Sign Document</DialogTitle><SignaturePad onSignatureComplete={handleSignature} /></DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }

// // // import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// // // import { api } from '@/api/apiClient';
// // // import { Button } from '@/components/ui/button';
// // // import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
// // // import { toast } from 'sonner';
// // // import { Loader2, CheckCircle2, Lock, PenTool, AlertCircle, FileCheck } from 'lucide-react';
// // // import SignaturePad from '../components/signing/SignaturePad';
// // // import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
// // // const API_URL = import.meta.env.VITE_API_URL;
// // // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

// // // export default function SignerView() {
// // //   const urlParams = new URLSearchParams(window.location.search);
// // //   const token = urlParams.get('token');

// // //   const [session, setSession] = useState(null);
// // //   const [docData, setDocData] = useState(null); 
// // //   const [loading, setLoading] = useState(true);
// // //   const [fields, setFields] = useState([]);
// // //   const [activeFieldId, setActiveFieldId] = useState(null);
// // //   const [showSigPad, setShowSigPad] = useState(false);
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [completed, setCompleted] = useState(false);
// // //   const [pagesData, setPagesData] = useState([]);
// // //   const containerRef = useRef(null);

// // //   const myPartyIndex = useMemo(() => {
// // //     if (!session?.party) return null;
// // //     return session.party.index !== undefined ? Number(session.party.index) : null;
// // //   }, [session]);

// // //   // আপনার স্বাক্ষর গণনার লজিক
// // //   const mySigningStatus = useMemo(() => {
// // //     const myFields = fields.filter(f => Number(f.partyIndex) === myPartyIndex);
// // //     const completedFields = myFields.filter(f => f.filled).length;
// // //     const totalFields = myFields.length;
// // //     const remaining = totalFields - completedFields;
// // //     return { completedFields, totalFields, remaining };
// // //   }, [fields, myPartyIndex]);

// // //   const loadSession = useCallback(async () => {
// // //     if (!token) { setLoading(false); return; }
// // //     try {
// // //       const res = await api.get(`/documents/sign/${token}`);
// // //       setSession(res.data);
// // //       setDocData(res.data.document);
// // //       const rawFields = res.data.document.fields || [];
// // //       const cleaned = rawFields.map(f => {
// // //         const obj = typeof f === 'string' ? JSON.parse(f) : f;
// // //         return { ...obj, id: obj.id || `f_${Math.random()}`, partyIndex: Number(obj.signerIndex ?? obj.partyIndex ?? 0), filled: !!obj.value };
// // //       });
// // //       setFields(cleaned);
// // //       if (res.data.document.status === 'completed' || res.data.party.status === 'signed') setCompleted(true);
// // //     } catch (err) { toast.error('লিঙ্কটি কাজ করছে না।'); }
// // //     finally { setLoading(false); }
// // //   }, [token]);

// // //   useEffect(() => { loadSession(); }, [loadSession]);

// // //   useEffect(() => {
// // //     if (!docData?.fileId) return;
// // //     const loadPdf = async () => {
// // //      // const proxyUrl = `https://nexsignbackend.onrender.com/api/documents/proxy/${docData.fileId}`;
// // // const proxyUrl = `${import.meta.env.VITE_API_BASE_URL}/documents/proxy/${encodeURIComponent(docData.fileId)}`;
// // //      try {
// // //         const pdf = await pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true }).promise;
// // //         const containerWidth = containerRef.current?.clientWidth || 800;
// // //         const pages = [];
// // //         for (let i = 1; i <= pdf.numPages; i++) {
// // //           const page = await pdf.getPage(i);
// // //           const viewport = page.getViewport({ scale: (containerWidth - 40) / page.getViewport({ scale: 1 }).width });
// // //           pages.push({ num: i, viewport, pageObj: page });
// // //         }
// // //         setPagesData(pages);
// // //       } catch (err) { console.error(err); }
// // //     };
// // //     loadPdf();
// // //   }, [docData]);

// // //   const handleFieldClick = (e, field) => {
// // //     e.preventDefault();
// // //     if (Number(field.partyIndex) !== myPartyIndex) { toast.error("এটি আপনার জায়গা নয়।"); return; }
// // //     if (field.type === 'text') {
// // //       const val = prompt("Enter text:", field.value || "");
// // //       if (val !== null) {
// // //         setFields(prev => prev.map(f => f.id === field.id ? { ...f, value: val, filled: true } : f));
// // //       }
// // //     } else {
// // //       setActiveFieldId(field.id);
// // //       setShowSigPad(true);
// // //     }
// // //   };

// // //   const handleSignature = (sigValue) => {
// // //     if (!sigValue) return;
// // //     setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: sigValue, filled: true } : f));
// // //     setShowSigPad(false);
// // //     setActiveFieldId(null);
// // //   };

// // //   const handleSubmit = async () => {
// // //     if (mySigningStatus.remaining > 0) {
// // //       toast.error(`অসম্পূর্ণ! আপনার আরও ${mySigningStatus.remaining}টি জায়গায় স্বাক্ষর বাকি।`, {
// // //         icon: <AlertCircle className="text-red-500" />,
// // //       });
// // //       return;
// // //     }

// // //     setSubmitting(true);
// // //     try {
// // //       const res = await api.post(`/documents/sign/submit`, { token, fields });
// // //       setCompleted(true);
// // //       if (res.data.completed) {
// // //         toast.success('সবাই স্বাক্ষর করেছেন! ফাইনাল পিডিএফ মেইলে পাঠানো হয়েছে।');
// // //       } else {
// // //         toast.success('আপনার স্বাক্ষর জমা হয়েছে। পরবর্তী সাইনারের জন্য অপেক্ষা করা হচ্ছে।');
// // //       }
// // //     } catch (err) { 
// // //       toast.error('সাবমিট করা সম্ভব হয়নি। আবার চেষ্টা করুন।'); 
// // //     } finally { 
// // //       setSubmitting(false); 
// // //     }
// // //   };

// // //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;
// // //   if (completed) return <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-4"><CheckCircle2 size={80} className="text-green-500 animate-bounce" /><h2 className="text-3xl font-bold">স্বাক্ষর সম্পন্ন!</h2><p className="text-slate-500 max-w-md">পিডিএফ জেনারেট করা হয়েছে। সবাই স্বাক্ষর শেষ করলে আপনি ইমেইলে কপি পেয়ে যাবেন। ধন্যবাদ!</p></div>;

// // //   return (
// // //     <div className="min-h-screen bg-slate-50">
// // //       <header className="sticky top-0 z-[100] bg-white border-b p-4 flex justify-between items-center shadow-sm">
// // //         <div className="flex flex-col">
// // //           <span className="text-[10px] text-sky-500 font-black uppercase tracking-widest">Document Title</span>
// // //           <h1 className="font-bold text-slate-800 leading-tight truncate max-w-[150px] sm:max-w-xs">{docData?.title}</h1>
// // //         </div>
        
// // //         <div className="flex items-center gap-3 sm:gap-6">
// // //           {/* লোডিং স্পিনার - বাটনের বাম পাশে */}
// // //           {submitting && (
// // //             <div className="flex items-center gap-2 text-sky-600 animate-pulse">
// // //               <Loader2 className="h-5 w-5 animate-spin" />
// // //               <span className="hidden md:inline text-xs font-bold uppercase tracking-tighter">Processing PDF...</span>
// // //             </div>
// // //           )}

// // //           <div className="flex flex-col items-end">
// // //             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">My Progress</span>
// // //             <div className={`px-3 py-1 rounded-full text-[11px] font-black border-2 transition-colors flex items-center gap-1.5 ${mySigningStatus.remaining === 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-sky-50 border-sky-200 text-sky-700'}`}>
// // //               {mySigningStatus.remaining === 0 && <FileCheck size={12} />}
// // //               {mySigningStatus.completedFields} / {mySigningStatus.totalFields} SIGNED
// // //             </div>
// // //           </div>

// // //           <Button 
// // //             onClick={handleSubmit} 
// // //             disabled={submitting} 
// // //             className={`min-w-[130px] font-bold shadow-lg transition-all active:scale-95 ${mySigningStatus.remaining === 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'}`}
// // //           >
// // //             {submitting ? 'Please wait...' : 'Finish Signing'}
// // //           </Button>
// // //         </div>
// // //       </header>

// // //       <main ref={containerRef} className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">
// // //         {pagesData.map((page) => (
// // //           <div key={page.num} className="relative mb-6 bg-white shadow-xl border border-slate-200" style={{ width: page.viewport.width, height: page.viewport.height }}>
// // //             <canvas ref={el => {
// // //               if (el && !el.dataset.rendered) {
// // //                 const ctx = el.getContext('2d');
// // //                 el.width = page.viewport.width; el.height = page.viewport.height;
// // //                 page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
// // //                 el.dataset.rendered = 'true';
// // //               }
// // //             }} />
            
// // //             {fields.filter(f => Number(f.page) === page.num).map(field => {
// // //               const isMine = Number(field.partyIndex) === myPartyIndex;
// // //               return (
// // //                 <div key={field.id} onClick={(e) => handleFieldClick(e, field)}
// // //                   className={`absolute border-2 transition-all flex items-center justify-center ${isMine && !field.filled ? 'border-sky-500 bg-sky-500/20 cursor-pointer animate-pulse ring-2 ring-sky-500/20' : 'border-slate-300'}`}
// // //                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%` }}>
// // //                   {field.filled ? (
// // //                     field.value.startsWith('data:image') ? 
// // //                     <img src={field.value} className="w-full h-full object-contain p-1" /> :
// // //                     <span className="font-serif text-[12px] font-bold text-black">{field.value}</span>
// // //                   ) : (
// // //                     <div className="flex flex-col items-center text-[9px] font-bold text-slate-500 leading-none">
// // //                        {isMine ? <PenTool size={12} className="text-sky-600 mb-0.5" /> : <Lock size={10} />}
// // //                        <span>{isMine ? 'YOUR SIGN' : `SIGNER ${Number(field.partyIndex) + 1}`}</span>
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </main>

// // //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// // //         <DialogContent className="max-w-lg p-6 bg-white rounded-2xl shadow-2xl">
// // //           <DialogTitle className="mb-4 text-slate-800 font-bold text-xl border-b pb-2">আপনার স্বাক্ষর দিন</DialogTitle>
// // //           <SignaturePad onSignatureComplete={handleSignature} />
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }


// // //vercel deploy 

// // import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// // import { api } from '@/api/apiClient';
// // import { Button } from '@/components/ui/button';
// // import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
// // import { toast } from 'sonner';
// // import { Loader2, CheckCircle2, Lock, PenTool, AlertCircle, FileCheck } from 'lucide-react';
// // import SignaturePad from '../components/signing/SignaturePad';
// // import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// // // Worker configuration
// // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

// // export default function SignerView() {
// //   const urlParams = new URLSearchParams(window.location.search);
// //   const token = urlParams.get('token');

// //   const [session, setSession] = useState(null);
// //   const [docData, setDocData] = useState(null); 
// //   const [loading, setLoading] = useState(true);
// //   const [fields, setFields] = useState([]);
// //   const [activeFieldId, setActiveFieldId] = useState(null);
// //   const [showSigPad, setShowSigPad] = useState(false);
// //   const [submitting, setSubmitting] = useState(false);
// //   const [completed, setCompleted] = useState(false);
// //   const [pagesData, setPagesData] = useState([]);
// //   const containerRef = useRef(null);

// //   const myPartyIndex = useMemo(() => {
// //     if (!session?.party) return null;
// //     return session.party.index !== undefined ? Number(session.party.index) : null;
// //   }, [session]);

// //   const mySigningStatus = useMemo(() => {
// //     const myFields = fields.filter(f => Number(f.partyIndex) === myPartyIndex);
// //     const completedFields = myFields.filter(f => f.filled).length;
// //     const totalFields = myFields.length;
// //     const remaining = totalFields - completedFields;
// //     return { completedFields, totalFields, remaining };
// //   }, [fields, myPartyIndex]);

// //   const loadSession = useCallback(async () => {
// //     if (!token) { setLoading(false); return; }
// //     try {
// //       const res = await api.get(`/documents/sign/${token}`);
// //       setSession(res.data);
// //       setDocData(res.data.document);
// //       const rawFields = res.data.document.fields || [];
// //       const cleaned = rawFields.map(f => {
// //         const obj = typeof f === 'string' ? JSON.parse(f) : f;
// //         return { 
// //           ...obj, 
// //           id: obj.id || `f_${Math.random()}`, 
// //           partyIndex: Number(obj.signerIndex ?? obj.partyIndex ?? 0), 
// //           filled: !!obj.value 
// //         };
// //       });
// //       setFields(cleaned);
// //       if (res.data.document.status === 'completed' || res.data.party.status === 'signed') setCompleted(true);
// //     } catch (err) { 
// //       toast.error('লিঙ্কটি কাজ করছে না বা মেয়াদ শেষ হয়েছে।'); 
// //     } finally { 
// //       setLoading(false); 
// //     }
// //   }, [token]);

// //   useEffect(() => { loadSession(); }, [loadSession]);
// // // এই কোডটি নতুন যোগ করুন
// // useEffect(() => {
// //   if (pagesData.length > 0 && fields.length > 0 && !loading) {
// //     // ইউজারের প্রথম খালি (Unfilled) ফিল্ডটি খুঁজে বের করা
// //     const targetField = fields.find(f => 
// //       Number(f.partyIndex) === myPartyIndex && !f.filled
// //     );

// //     if (targetField) {
// //       const scrollTimeout = setTimeout(() => {
// //         const element = document.getElementById(`field-${targetField.id}`);
// //         if (element) {
// //           element.scrollIntoView({ 
// //             behavior: 'smooth', 
// //             block: 'center' 
// //           });
// //           // ফিল্ডটি হাইলাইট করা
// //           element.style.ring = "4px";
// //         }
// //       }, 1500); // ১.৫ সেকেন্ড ডিলে যাতে PDF রেন্ডার হতে পারে

// //       return () => clearTimeout(scrollTimeout);
// //     }
// //   }
// // }, [pagesData, fields, loading, myPartyIndex]);


// //   useEffect(() => {
// //     if (!docData?.fileId) return;
// //     const loadPdf = async () => {
// //       const proxyUrl = `${import.meta.env.VITE_API_BASE_URL}/documents/proxy/${encodeURIComponent(docData.fileId)}`;
// //       try {
// //         const pdf = await pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true }).promise;
// //         const containerWidth = containerRef.current?.clientWidth || 800;
// //         const pages = [];
// //         for (let i = 1; i <= pdf.numPages; i++) {
// //           const page = await pdf.getPage(i);
// //           const viewport = page.getViewport({ scale: (containerWidth - 40) / page.getViewport({ scale: 1 }).width });
// //           pages.push({ num: i, viewport, pageObj: page });
// //         }
// //         setPagesData(pages);
// //       } catch (err) { 
// //         console.error("PDF Load Error:", err); 
// //       }
// //     };
// //     loadPdf();
// //   }, [docData]);

// //   const handleFieldClick = (e, field) => {
// //     e.preventDefault();
// //     if (Number(field.partyIndex) !== myPartyIndex) { 
// //       toast.error("এটি আপনার স্বাক্ষরের জায়গা নয়।"); 
// //       return; 
// //     }
// //     if (field.type === 'text') {
// //       const val = prompt("Enter text:", field.value || "");
// //       if (val !== null) {
// //         setFields(prev => prev.map(f => f.id === field.id ? { ...f, value: val, filled: true } : f));
// //       }
// //     } else {
// //       setActiveFieldId(field.id);
// //       setShowSigPad(true);
// //     }
// //   };

// //   // const handleSignature = (sigValue) => {
// //   //   if (!sigValue) return;
// //   //   setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, value: sigValue, filled: true } : f));
// //   //   setShowSigPad(false);
// //   //   setActiveFieldId(null);
// //   // };

// //   const handleSignature = (sigValue) => {
// //   // 1. Safety Check: If sigValue is empty or just a blank canvas
// //   if (!sigValue || sigValue.length < 200) { 
// //     toast.error("Signature is too short or empty. Please sign properly.");
// //     return;
// //   }

// //   // 2. State Update: Mapping through fields to find the active one
// //   setFields(prev => 
// //     prev.map(f => 
// //       f.id === activeFieldId 
// //         ? { ...f, value: sigValue, filled: true } 
// //         : f
// //     )
// //   );

// //   // 3. UI Cleanup
// //   setShowSigPad(false);
// //   setActiveFieldId(null);
  
// //   // Optional: Feedback to user
// //   toast.success("Signature captured!");
// // };

// //   // const handleSubmit = async () => {
// //   //   if (mySigningStatus.remaining > 0) {
// //   //     toast.error(`অসম্পূর্ণ! আপনার আরও ${mySigningStatus.remaining}টি জায়গায় স্বাক্ষর বাকি।`);
// //   //     return;
// //   //   }

// //   //   setSubmitting(true);
// //   //   try {
// //   //     // 🌟 API Path Fixed to match server.js mounting
// //   //     const res = await api.post(`/documents/sign/submit`, { token, fields });
// //   //     setCompleted(true);
// //   //     if (res.data.completed) {
// //   //       toast.success('সবাই স্বাক্ষর করেছেন! ফাইনাল পিডিএফ মেইলে পাঠানো হয়েছে।');
// //   //     } else {
// //   //       toast.success('আপনার স্বাক্ষর জমা হয়েছে।');
// //   //     }
// //   //   } catch (err) { 
// //   //     const msg = err.response?.data?.error || 'সাবমিট করা সম্ভব হয়নি।';
// //   //     toast.error(msg); 
// //   //   } finally { 
// //   //     setSubmitting(false); 
// //   //   }
// //   // };

// //   const handleSubmit = async () => {
// //   // 1. Validation Check
// //   if (mySigningStatus.remaining > 0) {
// //     toast.error(`Incomplete! You have ${mySigningStatus.remaining} signature(s) remaining.`);
// //     return;
// //   }

// //   setSubmitting(true);
// //   try {
// //     // 2. API Call with fixed path
// //     const res = await api.post(`/documents/sign/submit`, { token, fields });
    
// //     setCompleted(true);
    
// //     // 3. Success Handling
// //     if (res.data.completed) {
// //       toast.success('Success! Everyone has signed. The final PDF has been sent to your email.', {
// //         duration: 6000,
// //         icon: '🎉',
// //       });
// //     } else {
// //       toast.success('Your signature has been submitted successfully!');
// //     }
// //   } catch (err) { 
// //     // 4. Error Handling
// //     const msg = err.response?.data?.error || 'Failed to submit signature. Please try again.';
// //     toast.error(msg);
// //     console.error("Submission error:", err);
// //   } finally { 
// //     setSubmitting(false); 
// //   }
// // };

// //   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;
  
// //   if (completed) return (
// //     <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
// //       <CheckCircle2 size={80} className="text-green-500 animate-bounce" />
// //       <h2 className="text-3xl font-bold">স্বাক্ষর সম্পন্ন!</h2>
// //       <p className="text-slate-500 max-w-md">সবাই স্বাক্ষর শেষ করলে আপনি ইমেইলে কপি পেয়ে যাবেন। ধন্যবাদ!</p>
// //     </div>
// //   );

// //   return (
// //     <div className="min-h-screen bg-slate-50">
// //       <header className="sticky top-0 z-[100] bg-white border-b p-4 flex justify-between items-center shadow-sm">
// //         <div className="flex flex-col">
// //           <span className="text-[10px] text-sky-500 font-black uppercase tracking-widest">Document</span>
// //           <h1 className="font-bold text-slate-800 leading-tight truncate max-w-[150px]">{docData?.title}</h1>
// //         </div>
        
// //         <div className="flex items-center gap-3">
// //           <div className="flex flex-col items-end">
// //             <div className={`px-3 py-1 rounded-full text-[11px] font-black border-2 flex items-center gap-1.5 ${mySigningStatus.remaining === 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-sky-50 border-sky-200 text-sky-700'}`}>
// //               {mySigningStatus.remaining === 0 && <FileCheck size={12} />}
// //               {mySigningStatus.completedFields} / {mySigningStatus.totalFields} SIGNED
// //             </div>
// //           </div>

// //           <Button 
// //             onClick={handleSubmit} 
// //             disabled={submitting} 
// //             className={`min-w-[130px] font-bold ${mySigningStatus.remaining === 0 ? 'bg-green-600' : 'bg-sky-600'}`}
// //           >
// //             {submitting ? <Loader2 className="animate-spin" /> : 'Finish Signing'}
// //           </Button>
// //         </div>
// //       </header>

// //       <main ref={containerRef} className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">
// //         {pagesData.map((page) => (
// //           <div key={page.num} className="relative mb-6 bg-white shadow-xl border" style={{ width: page.viewport.width, height: page.viewport.height }}>
// //             <canvas ref={el => {
// //               if (el && !el.dataset.rendered) {
// //                 const ctx = el.getContext('2d');
// //                 el.width = page.viewport.width; el.height = page.viewport.height;
// //                 page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
// //                 el.dataset.rendered = 'true';
// //               }
// //             }} />
            
// //             {/* {fields.filter(f => Number(f.page) === page.num).map(field => {
// //               const isMine = Number(field.partyIndex) === myPartyIndex;
// //               return (
// //                 <div key={field.id} onClick={(e) => handleFieldClick(e, field)}
// //                   className={`absolute border-2 transition-all flex items-center justify-center ${isMine && !field.filled ? 'border-sky-500 bg-sky-500/20 cursor-pointer animate-pulse' : 'border-slate-300'}`}
// //                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%` }}>
// //                   {field.filled ? (
// //                     field.value.startsWith('data:image') ? 
// //                     <img src={field.value} className="w-full h-full object-contain p-1" /> :
// //                     <span className="font-serif text-[12px] font-bold text-black">{field.value}</span>
// //                   ) : (
// //                     <div className="flex flex-col items-center text-[9px] font-bold text-slate-500">
// //                        {isMine ? <PenTool size={12} /> : <Lock size={10} />}
// //                        <span>{isMine ? 'YOUR SIGN' : `SIGNER ${Number(field.partyIndex) + 1}`}</span>
// //                     </div>
// //                   )}
// //                 </div>
// //               );
// //             })} */}

// //             {fields.filter(f => Number(f.page) === page.num).map(field => {
// //   const isMine = Number(field.partyIndex) === myPartyIndex;
// //   return (
// //     <div 
// //       key={field.id} 
// //       id={`field-${field.id}`} // 👈 এটি যোগ হলো (অটো-স্ক্রলিং এর জন্য)
// //       onClick={(e) => handleFieldClick(e, field)}
// //       className={`absolute border-2 transition-all flex items-center justify-center 
// //         ${isMine && !field.filled 
// //           ? 'border-sky-500 bg-sky-500/10 cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.3)]' 
// //           : 'border-slate-300'}`}
// //       style={{ 
// //         left: `${field.x}%`, 
// //         top: `${field.y}%`, 
// //         width: `${field.width}%`, 
// //         height: `${field.height}%`,
// //         zIndex: 50 
// //       }}>
      
// //       {field.filled ? (
// //         field.value.startsWith('data:image') ? 
// //         <img src={field.value} className="w-full h-full object-contain p-1" alt="sig" /> :
// //         <span className="font-serif text-[12px] font-bold text-black">{field.value}</span>
// //       ) : (
// //         <div className="flex flex-col items-center text-[9px] font-bold text-slate-500">
// //            {isMine ? (
// //              <>
// //                <PenTool size={14} className="animate-bounce text-sky-600 mb-0.5" />
// //                <span className="text-sky-600 font-black">SIGN HERE</span>
// //              </>
// //            ) : (
// //              <>
// //                <Lock size={10} />
// //                <span>SIGNER {Number(field.partyIndex) + 1}</span>
// //              </>
// //            )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // })}
// //           </div>
// //         ))}
// //       </main>

// //       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
// //         <DialogContent className="max-w-lg p-6 bg-white rounded-2xl">
// //           <DialogTitle className="mb-4 text-slate-800 font-bold text-xl border-b pb-2">আপনার স্বাক্ষর দিন</DialogTitle>
// //           <SignaturePad onSignatureComplete={handleSignature} />
// //         </DialogContent>
// //       </Dialog>
// //     </div>
// //   );
// // } all ok 



// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { api } from '@/api/apiClient';
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
// import { toast } from 'sonner';
// import { Loader2, CheckCircle2, Lock, PenTool, FileCheck } from 'lucide-react';
// import SignaturePad from '../components/signing/SignaturePad';
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

// export default function SignerView() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const token = urlParams.get('token');

//   const [session, setSession] = useState(null);
//   const [docData, setDocData] = useState(null); 
//   const [loading, setLoading] = useState(true);
//   const [fields, setFields] = useState([]);
//   const [activeFieldId, setActiveFieldId] = useState(null);
//   const [showSigPad, setShowSigPad] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [completed, setCompleted] = useState(false);
//   const [pagesData, setPagesData] = useState([]);
//   const containerRef = useRef(null);

//   const myPartyIndex = useMemo(() => {
//     if (!session?.party) return null;
//     return session.party.index !== undefined ? Number(session.party.index) : null;
//   }, [session]);

//   const mySigningStatus = useMemo(() => {
//     const myFields = fields.filter(f => Number(f.partyIndex) === myPartyIndex);
//     const completedFields = myFields.filter(f => f.filled).length;
//     const totalFields = myFields.length;
//     const remaining = totalFields - completedFields;
//     return { completedFields, totalFields, remaining };
//   }, [fields, myPartyIndex]);

//   // Enhanced Scroll Logic: Waits for layout stability
//   const scrollToNextField = useCallback((currentFields) => {
//     const nextField = currentFields.find(f => Number(f.partyIndex) === myPartyIndex && !f.filled);
//     if (nextField) {
//       // Small delay to allow React to finish DOM updates
//       setTimeout(() => {
//         const element = document.getElementById(`field-${nextField.id}`);
//         if (element) {
//           element.scrollIntoView({ 
//             behavior: 'smooth', 
//             block: 'center',
//             inline: 'nearest' 
//           });
//         }
//       }, 300); 
//     }
//   }, [myPartyIndex]);

//   const loadSession = useCallback(async () => {
//     if (!token) { setLoading(false); return; }
//     try {
//       const res = await api.get(`/documents/sign/${token}`);
//       setSession(res.data);
//       setDocData(res.data.document);
//       const rawFields = res.data.document.fields || [];
//       const cleaned = rawFields.map(f => {
//         const obj = typeof f === 'string' ? JSON.parse(f) : f;
//         return { 
//           ...obj, 
//           id: obj.id || `f_${Math.random()}`, 
//           partyIndex: Number(obj.signerIndex ?? obj.partyIndex ?? 0), 
//           filled: !!obj.value 
//         };
//       });
//       setFields(cleaned);
//       if (res.data.document.status === 'completed' || res.data.party.status === 'signed') setCompleted(true);
//     } catch (err) { 
//       toast.error('This link is invalid or has expired.'); 
//     } finally { 
//       setLoading(false); 
//     }
//   }, [token]);

//   useEffect(() => { loadSession(); }, [loadSession]);

//   // Initial scroll when PDF pages are rendered
//   useEffect(() => {
//     if (pagesData.length > 0 && !loading && fields.length > 0) {
//       scrollToNextField(fields);
//     }
//   }, [pagesData.length, loading, scrollToNextField]);

//   useEffect(() => {
//     if (!docData?.fileId) return;
//     const loadPdf = async () => {
//       const proxyUrl = `${import.meta.env.VITE_API_BASE_URL}/documents/proxy/${encodeURIComponent(docData.fileId)}`;
//       try {
//         const pdf = await pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true }).promise;
//         const containerWidth = containerRef.current?.clientWidth || 800;
//         const pages = [];
//         for (let i = 1; i <= pdf.numPages; i++) {
//           const page = await pdf.getPage(i);
//           const viewport = page.getViewport({ scale: (containerWidth - 40) / page.getViewport({ scale: 1 }).width });
//           pages.push({ num: i, viewport, pageObj: page });
//         }
//         setPagesData(pages);
//       } catch (err) { console.error("PDF Load Error:", err); }
//     };
//     loadPdf();
//   }, [docData]);

//   const handleFieldClick = (e, field) => {
//     e.preventDefault();
//     if (Number(field.partyIndex) !== myPartyIndex) { 
//       toast.error("This is not your signing area."); 
//       return; 
//     }
//     if (field.type === 'text') {
//       const val = prompt("Enter required text:", field.value || "");
//       if (val !== null) {
//         const newFields = fields.map(f => f.id === field.id ? { ...f, value: val, filled: true } : f);
//         setFields(newFields);
//         scrollToNextField(newFields); 
//       }
//     } else {
//       setActiveFieldId(field.id);
//       setShowSigPad(true);
//     }
//   };

//   const handleSignature = (sigValue) => {
//     if (!sigValue || sigValue.length < 200) { 
//       toast.error("Signature is too short. Please try again.");
//       return;
//     }
//     const newFields = fields.map(f => f.id === activeFieldId ? { ...f, value: sigValue, filled: true } : f);
//     setFields(newFields);
//     setShowSigPad(false);
//     setActiveFieldId(null);
//     toast.success("Signature captured!");
    
//     // Auto-scroll to next field after signing
//     scrollToNextField(newFields); 
//   };

//   const handleSubmit = async () => {
//     if (mySigningStatus.remaining > 0) {
//       toast.error(`Required: You have ${mySigningStatus.remaining} more field(s) to fill.`);
//       scrollToNextField(fields); 
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const res = await api.post(`/documents/sign/submit`, { token, fields });
//       setCompleted(true);
//       toast.success('Document successfully completed!');
//     } catch (err) { 
//         toast.error('Submission failed. Please try again.'); 
//     } finally { setSubmitting(false); }
//   };

//   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;
  
//   if (completed) return (
//     <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
//       <CheckCircle2 size={80} className="text-green-500 animate-bounce" />
//       <h2 className="text-3xl font-bold">Signing completed!</h2>
//       <p className="text-slate-500 max-w-md">The document has been successfully processed. You will receive a copy via email shortly.</p>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <header className="sticky top-0 z-[100] bg-white border-b p-4 flex justify-between items-center shadow-sm">
//         <div className="flex flex-col overflow-hidden max-w-[50%]">
//           <span className="text-[10px] text-sky-500 font-black uppercase tracking-widest">Document</span>
//           <h1 className="font-bold text-slate-800 truncate leading-tight">{docData?.title}</h1>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="hidden sm:flex px-3 py-1 rounded-full text-[11px] font-black border-2 bg-sky-50 border-sky-200 text-sky-700">
//             {mySigningStatus.completedFields} / {mySigningStatus.totalFields} SIGNED
//           </div>
//           <Button onClick={handleSubmit} disabled={submitting} className={`font-bold transition-all ${mySigningStatus.remaining === 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'}`}>
//             {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Finish'}
//           </Button>
//         </div>
//       </header>

//       <main ref={containerRef} className="w-full max-w-4xl mx-auto py-8 px-2 flex flex-col items-center">
//         {pagesData.map((page) => (
//           <div key={page.num} className="relative mb-6 bg-white shadow-xl border" style={{ width: page.viewport.width, height: page.viewport.height }}>
//             <canvas className="w-full h-auto" ref={el => {
//               if (el && !el.dataset.rendered) {
//                 const ctx = el.getContext('2d');
//                 el.width = page.viewport.width; el.height = page.viewport.height;
//                 page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
//                 el.dataset.rendered = 'true';
//               }
//             }} />
            
//             {fields.filter(f => Number(f.page) === page.num).map(field => {
//               const isMine = Number(field.partyIndex) === myPartyIndex;
//               return (
//                 <div key={field.id} id={`field-${field.id}`} onClick={(e) => handleFieldClick(e, field)}
//                   className={`absolute border-2 transition-all flex items-center justify-center 
//                     ${isMine && !field.filled ? 'border-sky-500 bg-sky-500/10 cursor-pointer animate-pulse ring-offset-2 ring-sky-300' : 'border-slate-300'}`}
//                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%` }}>
                  
//                   {field.filled ? (
//                     field.value.startsWith('data:image') ? 
//                     <img src={field.value} className="w-full h-full object-contain p-1 mix-blend-multiply" alt="Signature" /> :
//                     <span className="font-serif text-[12px] font-bold text-black break-all px-1">{field.value}</span>
//                   ) : (
//                     <div className="flex flex-col items-center text-[9px] font-bold text-slate-500">
//                        {isMine ? <PenTool size={14} className="text-sky-600" /> : <Lock size={10} />}
//                        <span className={isMine ? 'text-sky-600' : ''}>{isMine ? 'SIGN HERE' : `SIGNER ${Number(field.partyIndex) + 1}`}</span>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         ))}
//       </main>

//       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
//         <DialogContent className="max-w-[95vw] sm:max-w-lg p-6 bg-white rounded-2xl">
//           <DialogTitle className="mb-4 text-slate-800 font-bold text-xl border-b pb-2">Please sign here.</DialogTitle>
//           <SignaturePad onSignatureComplete={handleSignature} />
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { api } from '@/api/apiClient'; 
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
// import { toast } from 'sonner';
// import { Loader2, CheckCircle2, Lock, PenTool, Mail, Clock } from 'lucide-react';
// import SignaturePad from '../components/signing/SignaturePad';
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

// export default function SignerView() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const token = urlParams.get('token');

//   const [session, setSession] = useState(null);
//   const [docData, setDocData] = useState(null); 
//   const [loading, setLoading] = useState(true);
//   const [fields, setFields] = useState([]);
//   const [activeFieldId, setActiveFieldId] = useState(null);
//   const [showSigPad, setShowSigPad] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [completed, setCompleted] = useState(false);
//   const [pagesData, setPagesData] = useState([]);
//   const containerRef = useRef(null);

//   const myPartyIndex = useMemo(() => {
//     return session?.party?.index !== undefined ? Number(session.party.index) : null;
//   }, [session]);

//   const stats = useMemo(() => {
//     const myFields = fields.filter(f => Number(f.partyIndex) === myPartyIndex);
//     const done = myFields.filter(f => f.filled).length;
//     const total = myFields.length;
//     return { done, total, remaining: total - done };
//   }, [fields, myPartyIndex]);

//   const scrollToNextField = useCallback((currentFields) => {
//     const nextField = [...currentFields]
//       .filter(f => Number(f.partyIndex) === myPartyIndex && !f.filled)
//       .sort((a, b) => Number(a.page) - Number(b.page) || Number(a.y) - Number(b.y))[0]; 

//     if (nextField) {
//       const element = document.getElementById(`field-${nextField.id}`);
//       element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
//   }, [myPartyIndex]);

//   const loadSession = useCallback(async () => {
//     if (!token) { setLoading(false); return; }
//     try {
//       const res = await api.get(`/documents/sign/${token}`);
//       setSession(res.data);
//       setDocData(res.data.document);
      
//       const rawFields = res.data.document.fields || [];
//       const cleaned = rawFields.map(f => {
//         const obj = typeof f === 'string' ? JSON.parse(f) : f;
//         return { 
//           ...obj, 
//           id: obj.id || `f_${Math.random()}`, 
//           partyIndex: Number(obj.signerIndex ?? obj.partyIndex ?? 0), 
//           filled: !!obj.value 
//         };
//       });
//       setFields(cleaned);

//       if (['completed', 'signed'].includes(res.data.document.status) || res.data.party.status === 'signed') {
//         setCompleted(true);
//       }
//     } catch (err) { 
//       toast.error('Invalid link.'); 
//     } finally { setLoading(false); }
//   }, [token]);

//   useEffect(() => { loadSession(); }, [loadSession]);

//   useEffect(() => {
//     if (!docData?.fileId) return;
//     const loadPdf = async () => {
//       const proxyUrl = `${import.meta.env.VITE_API_BASE_URL}/documents/proxy/${encodeURIComponent(docData.fileId)}`;
//       try {
//         const pdf = await pdfjsLib.getDocument({ url: proxyUrl, withCredentials: true }).promise;
//         const width = containerRef.current?.clientWidth || 800;
//         const pages = [];
//         for (let i = 1; i <= pdf.numPages; i++) {
//           const page = await pdf.getPage(i);
//           const viewport = page.getViewport({ scale: (width - 40) / page.getViewport({ scale: 1 }).width });
//           pages.push({ num: i, viewport, pageObj: page });
//         }
//         setPagesData(pages);
//       } catch (err) { console.error("PDF Error:", err); }
//     };
//     loadPdf();
//   }, [docData]);

//   const handleFieldClick = (e, field) => {
//     e.preventDefault();
//     if (Number(field.partyIndex) !== myPartyIndex) return toast.error("Not your turn.");
//     setActiveFieldId(field.id);
//     setShowSigPad(true);
//   };

//   const handleSignature = (sigValue) => {
//     const newFields = fields.map(f => f.id === activeFieldId ? { ...f, value: sigValue, filled: true } : f);
//     setFields(newFields);
//     setShowSigPad(false);
//     toast.success("Signed!");
//     setTimeout(() => scrollToNextField(newFields), 100);
//   };

//   const handleSubmit = async () => {
//     if (stats.remaining > 0) {
//       toast.error(`Please fill all ${stats.remaining} fields.`);
//       scrollToNextField(fields); 
//       return;
//     }
//     setSubmitting(true);
//     try {
//       // Fast UI Response
//       api.post(`/documents/sign/submit`, { token, fields }); 
//       setCompleted(true);
//       toast.success('Submitted Successfully!');
//     } catch (err) { 
//       setSubmitting(false);
//       toast.error('Submission failed.'); 
//     }
//   };

//   if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-sky-500" size={40} /></div>;

//   // সাকসেস স্টেট মেসেজ আপডেট করা হয়েছে
//   if (completed) return (
//     <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6">
//       <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full flex flex-col items-center">
//         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
//           <CheckCircle2 size={50} className="text-green-600" />
//         </div>
//         <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Successfully Signed!</h2>
//         <div className="space-y-4 text-slate-600">
//           <p className="text-lg">Your signature has been securely recorded.</p>
//           <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl text-left border border-blue-100">
//             <Mail className="text-blue-500 mt-1 shrink-0" size={20} />
//             <p className="text-sm">
//               Once <strong>all parties</strong> have finished signing, a final copy of the executed document will be automatically sent to your email.
//             </p>
//           </div>
//           <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mt-4">
//             <Clock size={16} />
//             <span>Thank you for using NexSign</span>
//           </div>
//         </div>
//         <Button 
//           variant="outline" 
//           className="mt-8 w-full rounded-xl py-6 font-bold text-slate-500 hover:text-slate-800"
//           onClick={() => window.close()}
//         >
//           Close Tab
//         </Button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-slate-100">
//       <header className="sticky top-0 z-[100] bg-white border-b p-3 flex justify-between items-center shadow-sm">
//         <div className="flex flex-col">
//           <h1 className="font-bold text-slate-800 truncate max-w-[150px]">{docData?.title}</h1>
//           <div className="flex items-center gap-2 mt-1">
//              <div className="h-1.5 w-20 bg-slate-200 rounded-full overflow-hidden">
//                 <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${(stats.done/stats.total)*100}%` }} />
//              </div>
//              <span className="text-[10px] font-bold text-sky-600 uppercase">{stats.done}/{stats.total} Fields</span>
//           </div>
//         </div>
//         <Button onClick={handleSubmit} disabled={submitting} className="rounded-full bg-sky-600 px-6 font-bold h-9 hover:bg-sky-700 shadow-md">
//           {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Finish'}
//         </Button>
//       </header>

//       <main ref={containerRef} className="w-full max-w-4xl mx-auto py-6 px-2">
//         {pagesData.map((page) => (
//           <div key={page.num} className="relative mb-6 bg-white shadow-xl border rounded mx-auto overflow-hidden" style={{ width: page.viewport.width, height: page.viewport.height }}>
//             <canvas ref={el => {
//               if (el && !el.dataset.rendered) {
//                 const ctx = el.getContext('2d');
//                 el.width = page.viewport.width; el.height = page.viewport.height;
//                 page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
//                 el.dataset.rendered = 'true';
//               }
//             }} />
            
//             {fields.filter(f => Number(f.page) === page.num).map(field => {
//               const isMine = Number(field.partyIndex) === myPartyIndex;
//               return (
//                 <div key={field.id} id={`field-${field.id}`} onClick={(e) => handleFieldClick(e, field)}
//                   className={`absolute border-2 flex items-center justify-center rounded transition-all
//                     ${isMine && !field.filled ? 'border-sky-500 bg-sky-500/10 cursor-pointer shadow-sm ring-4 ring-sky-500/5' : 'border-slate-300 bg-slate-100/20'}`}
//                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%` }}>
                  
//                   {field.filled ? (
//                     <img src={field.value} className="w-[90%] h-[90%] object-contain mix-blend-multiply" alt="Signed" />
//                   ) : (
//                     <div className="flex flex-col items-center">
//                        {isMine ? <PenTool size={16} className="text-sky-600" /> : <Lock size={12} className="text-slate-400" />}
//                        <span className={`text-[9px] font-bold ${isMine ? 'text-sky-600' : 'text-slate-400'}`}>
//                          {isMine ? 'SIGN' : `P${Number(field.partyIndex) + 1}`}
//                        </span>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         ))}
//       </main>

//       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
//         <DialogContent className="max-w-lg p-6 bg-white rounded-2xl border-none shadow-2xl">
//           <DialogTitle className="mb-4 font-bold text-xl text-slate-800">Add Your Signature</DialogTitle>
//           <SignaturePad onSignatureComplete={handleSignature} />
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { useParams } from 'react-router-dom'; // URL Params থেকে টোকেন নিতে
// import { api } from '@/api/apiClient'; 
// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent } from '@/components/ui/dialog';
// import { toast } from 'sonner';
// import { Loader2, CheckCircle2, PenTool } from 'lucide-react';
// import SignaturePad from '../components/signing/SignaturePad';
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// // Worker path set
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// export default function SignerView() {
//   const { token } = useParams(); // URL থেকে সরাসরি টোকেন পাওয়া যাবে

//   const [session, setSession] = useState(null);
//   const [docData, setDocData] = useState(null); 
//   const [loading, setLoading] = useState(true);
//   const [fields, setFields] = useState([]);
//   const [activeFieldId, setActiveFieldId] = useState(null);
//   const [showSigPad, setShowSigPad] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [completed, setCompleted] = useState(false);
//   const [pagesData, setPagesData] = useState([]);
//   const containerRef = useRef(null);

//   // সেশন লোড করা
//   const loadSession = useCallback(async () => {
//     if (!token) return setLoading(false);
//     try {
//       const res = await api.get(`/documents/sign/${token}`);
//       const document = res.data;
      
//       setSession(document);
//       setDocData(document);
      
//       // ডাটা পার্সিং এবং পার্টি ইনডেক্স খুঁজে বের করা
//       const myParty = document.parties.find(p => p.token === token);
//       const myIdx = document.parties.indexOf(myParty);
      
//       setSession(prev => ({ ...prev, myPartyIndex: myIdx }));

//       const rawFields = document.fields || [];
//       setFields(rawFields.map(f => {
//         const obj = typeof f === 'string' ? JSON.parse(f) : f;
//         return { 
//           ...obj, 
//           partyIndex: Number(obj.partyIndex ?? 0), 
//           filled: !!obj.value 
//         };
//       }));

//       if (document.status === 'completed' || myParty.status === 'signed') {
//         setCompleted(true);
//       }
//     } catch (err) { 
//       console.error(err);
//       toast.error('Invalid or expired signing link.'); 
//     } finally { 
//       setLoading(false); 
//     }
//   }, [token]);

//   useEffect(() => { loadSession(); }, [loadSession]);

//   // PDF রেন্ডারিং লজিক
//   useEffect(() => {
//     if (!docData?.fileUrl) return;
    
//     // Proxy এর মাধ্যমে PDF লোড করা (CORS সমস্যা এড়াতে)
//     const fileId = docData.fileUrl.split('/').pop().split('.')[0];
//     const proxyUrl = `${import.meta.env.VITE_API_BASE_URL}/documents/proxy/${fileId}`;

//     const loadingTask = pdfjsLib.getDocument({ 
//       url: proxyUrl, 
//       withCredentials: true 
//     });

//     loadingTask.promise.then(async (pdf) => {
//       const containerWidth = containerRef.current?.clientWidth || 800;
//       const pages = [];
//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const viewport = page.getViewport({ scale: (containerWidth - 40) / page.getViewport({ scale: 1 }).width });
//         pages.push({ num: i, viewport, pageObj: page });
//       }
//       setPagesData(pages);
//     }).catch(err => console.error("PDF Load Error:", err));
//   }, [docData]);

//   const handleSignature = (sigValue) => {
//     setFields(prev => prev.map(f => 
//       f.id === activeFieldId ? { ...f, value: sigValue, filled: true } : f
//     ));
//     setShowSigPad(false);
//   };

//   const handleSubmit = async () => {
//     const myFields = fields.filter(f => Number(f.partyIndex) === session.myPartyIndex);
//     const remaining = myFields.filter(f => !f.filled).length;

//     if (remaining > 0) return toast.error(`Please fill all your ${remaining} fields.`);
    
//     setSubmitting(true);
//     try {
//       await api.post(`/documents/sign/submit`, { 
//         token, 
//         fields: fields, // সম্পূর্ণ ফিল্ড ডাটা পাঠানো হচ্ছে
//         meta: { device: navigator.userAgent }
//       }); 
//       setCompleted(true);
//       toast.success('Document signed successfully!');
//     } catch (err) { 
//       setSubmitting(false);
//       toast.error('Failed to submit. Check your internet.'); 
//     }
//   };

//   if (loading) return (
//     <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
//       <Loader2 className="animate-spin text-[#28ABDF]" size={40} />
//       <p className="text-slate-500 font-medium">Preparing Document...</p>
//     </div>
//   );

//   if (completed) return (
//     <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
//       <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
//         <CheckCircle2 size={70} className="text-green-500 mx-auto mb-4" />
//         <h2 className="text-3xl font-bold text-slate-800">Done!</h2>
//         <p className="text-slate-600 mb-8 mt-2">Your signature has been securely applied and the sender has been notified.</p>
//         <Button className="w-full bg-[#28ABDF] hover:bg-[#2399c8] h-12 rounded-xl text-lg font-bold" onClick={() => window.close()}>Close Tab</Button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#F8FAFC]">
//       <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center shadow-sm px-6">
//         <div className="flex flex-col">
//           <h1 className="font-bold text-slate-800 text-lg truncate max-w-[250px]">{docData?.title}</h1>
//           <span className="text-[10px] text-[#28ABDF] font-bold uppercase tracking-widest">Signer Review</span>
//         </div>
//         <Button onClick={handleSubmit} disabled={submitting} className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-full px-10 shadow-lg shadow-sky-100 font-bold">
//           {submitting ? <Loader2 className="animate-spin" /> : "Finish & Submit"}
//         </Button>
//       </header>

//       <main ref={containerRef} className="max-w-4xl mx-auto py-12 px-4">
//         {pagesData.map((page) => (
//           <div key={page.num} className="relative mb-10 bg-white shadow-2xl shadow-slate-200 mx-auto rounded-sm overflow-hidden" 
//                style={{ width: page.viewport.width, height: page.viewport.height }}>
//             <PageCanvas page={page} />
//             {fields.filter(f => Number(f.page) === page.num).map(field => {
//               const isMine = Number(field.partyIndex) === session.myPartyIndex;
//               return (
//                 <div 
//                   key={field.id} 
//                   onClick={() => isMine && (setActiveFieldId(field.id) || setShowSigPad(true))}
//                   className={`absolute border-2 flex items-center justify-center rounded-lg transition-all
//                     ${isMine && !field.filled ? 'border-sky-400 bg-sky-50/50 cursor-pointer hover:bg-sky-100 animate-pulse' : 
//                       isMine && field.filled ? 'border-green-400 bg-white cursor-pointer hover:border-green-500' : 'border-slate-100 bg-slate-50/30 pointer-events-none'}`}
//                   style={{ left: `${field.x}%`, top: `${field.y}%`, width: `${field.width}%`, height: `${field.height}%` }}>
                  
//                   {field.filled ? (
//                     <img src={field.value} className="w-full h-full object-contain p-1" />
//                   ) : (
//                     <div className="flex flex-col items-center gap-1">
//                        <PenTool size={isMine ? 20 : 14} className={isMine ? "text-sky-500" : "text-slate-300"} />
//                        {isMine && <span className="text-[8px] font-bold uppercase text-sky-500">Sign Here</span>}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         ))}
//       </main>

//       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
//         <DialogContent className="max-w-xl p-0 bg-white border-none rounded-3xl overflow-hidden shadow-2xl">
//           <div className="bg-[#28ABDF] p-6 text-white text-center">
//             <h3 className="text-xl font-bold">Draw Your Signature</h3>
//             <p className="text-sky-100 text-xs mt-1">Sign clearly inside the box below</p>
//           </div>
//           <div className="p-8"><SignaturePad onSignatureComplete={handleSignature} /></div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// function PageCanvas({ page }) {
//   const canvasRef = useRef(null);
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     const ratio = window.devicePixelRatio || 1;
//     canvas.width = page.viewport.width * ratio;
//     canvas.height = page.viewport.height * ratio;
//     ctx.scale(ratio, ratio);
//     page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
//   }, [page]);
//   return <canvas ref={canvasRef} className="w-full h-full" />;
// }

























// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { useParams } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Dialog, DialogContent } from '@/components/ui/dialog';
// import { toast } from 'sonner';
// import { Loader2, CheckCircle2, PenTool, Type, ChevronDown } from 'lucide-react';
// import SignaturePad from '@/components/signing/SignaturePad';
// import * as pdfjsLib from 'pdfjs-dist';
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

// // ✅ Same worker as PdfViewer — no CDN
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// //import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

// // ✅ Same worker as PdfViewer — no CDN
// //pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// pdfjsLib.GlobalWorkerOptions.workerSrc =
//   `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;



// export default function SignerView() {
//   const { token } = useParams();

//   const [docData, setDocData]         = useState(null);
//   const [myPartyIndex, setMyPartyIndex] = useState(null);
//   const [loading, setLoading]         = useState(true);
//   const [fields, setFields]           = useState([]);
//   const [activeField, setActiveField] = useState(null);
//   const [showSigPad, setShowSigPad]   = useState(false);
//   const [showTextInput, setShowTextInput] = useState(false);
//   const [textValue, setTextValue]     = useState('');
//   const [submitting, setSubmitting]   = useState(false);
//   const [completed, setCompleted]     = useState(false);
//   const [pagesData, setPagesData]     = useState([]);
//   const containerRef = useRef(null);

//   // Load session
//   useEffect(() => {
//     if (!token) { setLoading(false); return; }
//     const load = async () => {
//       try {
//         const res  = await api.get(`/documents/sign/${token}`);
//         const data = res.data;
//         setDocData(data);
//         setMyPartyIndex(data.partyIndex);

//         const rawFields = (data.fields || []).map(f => {
//           const obj = typeof f === 'string' ? JSON.parse(f) : f;
//           return { ...obj, partyIndex: Number(obj.partyIndex ?? 0), filled: !!obj.value };
//         });
//         setFields(rawFields);

//         if (data.completed) setCompleted(true);
//       } catch (err) {
//         console.error(err);
//         toast.error('Invalid or expired signing link.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [token]);

//   // Render PDF pages
//   useEffect(() => {
//     if (!docData?.fileUrl) return;
//     const parts     = docData.fileUrl.split('/upload/');
//     const cloudPath = parts.length > 1 ? parts[1] : encodeURIComponent(docData.fileUrl);
//     const proxyUrl  = `${import.meta.env.VITE_API_BASE_URL}/documents/proxy/${cloudPath.replace(/\//g, '_')}`;

//     pdfjsLib.getDocument({ url: proxyUrl, withCredentials: false }).promise
//       .then(async (pdf) => {
//         const containerWidth = containerRef.current?.clientWidth || 800;
//         const pages = [];
//         for (let i = 1; i <= pdf.numPages; i++) {
//           const page     = await pdf.getPage(i);
//           const scale    = (containerWidth - 40) / page.getViewport({ scale: 1 }).width;
//           const viewport = page.getViewport({ scale });
//           pages.push({ num: i, viewport, pageObj: page });
//         }
//         setPagesData(pages);
//       })
//       .catch(err => console.error('PDF load error:', err));
//   }, [docData]);

//   // Auto-scroll to first unsigned field
//   useEffect(() => {
//     if (!pagesData.length || myPartyIndex === null) return;
//     const firstUnsigned = fields.find(
//       f => Number(f.partyIndex) === myPartyIndex && !f.filled
//     );
//     if (!firstUnsigned) return;
//     setTimeout(() => {
//       const el = document.getElementById(`field-${firstUnsigned.id}`);
//       el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }, 600);
//   }, [pagesData, fields, myPartyIndex]);

//   const myFields = useMemo(
//     () => fields.filter(f => Number(f.partyIndex) === myPartyIndex),
//     [fields, myPartyIndex]
//   );

//   const filledCount   = myFields.filter(f => f.filled).length;
//   const totalMyFields = myFields.length;

//   const handleFieldClick = (field) => {
//     if (Number(field.partyIndex) !== myPartyIndex) return;
//     setActiveField(field);
//     if (field.type === 'signature') {
//       setShowSigPad(true);
//     } else {
//       setTextValue(field.value || '');
//       setShowTextInput(true);
//     }
//   };

//   const handleSignature = (sigValue) => {
//     setFields(prev => prev.map(f =>
//       f.id === activeField.id ? { ...f, value: sigValue, filled: true } : f
//     ));
//     setShowSigPad(false);
//     // Auto-scroll to next unsigned field
//     const nextUnsigned = fields.find(
//       f => Number(f.partyIndex) === myPartyIndex && !f.filled && f.id !== activeField.id
//     );
//     if (nextUnsigned) {
//       setTimeout(() => {
//         document.getElementById(`field-${nextUnsigned.id}`)
//           ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }, 300);
//     }
//   };

//   const handleTextConfirm = () => {
//     if (!textValue.trim()) return;
//     setFields(prev => prev.map(f =>
//       f.id === activeField.id ? { ...f, value: textValue, filled: true } : f
//     ));
//     setShowTextInput(false);
//     setTextValue('');
//   };

//   const handleSubmit = async () => {
//     const remaining = myFields.filter(f => !f.filled).length;
//     if (remaining > 0) {
//       toast.error(`Please fill all ${remaining} remaining field(s).`);
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await api.post('/documents/sign/submit', {
//         token,
//         fields,
//         locationData: 'Unknown',
//       });
//       setCompleted(true);
//       toast.success('Document signed successfully!');
//     } catch (err) {
//       setSubmitting(false);
//       toast.error('Failed to submit. Please try again.');
//     }
//   };

//   if (loading) return (
//     <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
//       <Loader2 className="animate-spin text-[#28ABDF]" size={40} />
//       <p className="text-slate-500 font-medium">Preparing Document...</p>
//     </div>
//   );

//   if (completed) return (
//     <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
//       <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
//         <CheckCircle2 size={70} className="text-green-500 mx-auto mb-4" />
//         <h2 className="text-3xl font-bold text-slate-800">All Done!</h2>
//         <p className="text-slate-600 mb-8 mt-2">
//           Your signature has been applied. The sender has been notified.
//         </p>
//         <Button
//           className="w-full bg-[#28ABDF] hover:bg-[#2399c8] h-12 rounded-xl text-lg font-bold"
//           onClick={() => window.close()}
//         >
//           Close Tab
//         </Button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#F8FAFC]">
//       {/* Header */}
//       <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur border-b p-4 flex justify-between items-center shadow-sm px-6">
//         <div>
//           <h1 className="font-bold text-slate-800 text-lg truncate max-w-[200px] sm:max-w-xs">
//             {docData?.title}
//           </h1>
//           <span className="text-[10px] text-[#28ABDF] font-bold uppercase tracking-widest">
//             {filledCount}/{totalMyFields} fields completed
//           </span>
//         </div>
//         <Button
//           onClick={handleSubmit}
//           disabled={submitting || filledCount < totalMyFields}
//           className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-full px-6 sm:px-10 shadow-lg font-bold disabled:opacity-50"
//         >
//           {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Finish & Submit'}
//         </Button>
//       </header>

//       {/* Progress bar */}
//       <div className="h-1 bg-slate-200">
//         <div
//           className="h-1 bg-[#28ABDF] transition-all duration-500"
//           style={{ width: totalMyFields ? `${(filledCount / totalMyFields) * 100}%` : '0%' }}
//         />
//       </div>

//       {/* PDF Pages */}
//       <main ref={containerRef} className="max-w-4xl mx-auto py-8 px-4">
//         {pagesData.map(page => (
//           <div
//             key={page.num}
//             className="relative mb-10 bg-white shadow-2xl mx-auto rounded overflow-hidden"
//             style={{ width: page.viewport.width, height: page.viewport.height }}
//           >
//             <PageCanvas page={page} />
//             {fields
//               .filter(f => Number(f.page) === page.num)
//               .map(field => {
//                 const isMine = Number(field.partyIndex) === myPartyIndex;
//                 return (
//                   <div
//                     id={`field-${field.id}`}
//                     key={field.id}
//                     onClick={() => isMine && handleFieldClick(field)}
//                     className={`absolute border-2 flex items-center justify-center rounded-lg transition-all overflow-hidden
//                       ${isMine && !field.filled
//                         ? 'border-sky-400 bg-sky-50/70 cursor-pointer hover:bg-sky-100 animate-pulse'
//                         : isMine && field.filled
//                         ? 'border-green-400 bg-white cursor-pointer hover:border-green-500'
//                         : 'border-slate-200 bg-slate-50/30 pointer-events-none opacity-40'
//                       }`}
//                     style={{
//                       left:   `${field.x}%`,
//                       top:    `${field.y}%`,
//                       width:  `${field.width}%`,
//                       height: `${field.height}%`,
//                     }}
//                   >
//                     {field.filled ? (
//                       field.type === 'signature' ? (
//                         <img src={field.value} className="w-full h-full object-contain p-1" alt="signature" />
//                       ) : (
//                         <span className="text-xs font-medium text-slate-700 px-1 truncate">{field.value}</span>
//                       )
//                     ) : (
//                       <div className="flex flex-col items-center gap-1">
//                         {field.type === 'signature'
//                           ? <PenTool size={isMine ? 18 : 12} className={isMine ? 'text-sky-500' : 'text-slate-300'} />
//                           : <Type size={isMine ? 18 : 12} className={isMine ? 'text-sky-500' : 'text-slate-300'} />
//                         }
//                         {isMine && (
//                           <span className="text-[8px] font-bold uppercase text-sky-500">
//                             {field.type === 'signature' ? 'Sign Here' : 'Type Here'}
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//           </div>
//         ))}

//         {/* Submit CTA at bottom */}
//         {filledCount === totalMyFields && totalMyFields > 0 && (
//           <div className="flex justify-center pb-10">
//             <Button
//               onClick={handleSubmit}
//               disabled={submitting}
//               className="bg-green-500 hover:bg-green-600 text-white rounded-full px-12 h-14 shadow-xl font-bold text-lg"
//             >
//               {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
//               Submit All Signatures
//             </Button>
//           </div>
//         )}
//       </main>

//       {/* Signature Dialog */}
//       <Dialog open={showSigPad} onOpenChange={setShowSigPad}>
//         <DialogContent className="max-w-xl p-0 bg-white border-none rounded-3xl overflow-hidden shadow-2xl">
//           <div className="bg-[#28ABDF] p-6 text-white text-center">
//             <h3 className="text-xl font-bold">Draw Your Signature</h3>
//             <p className="text-sky-100 text-xs mt-1">Sign clearly inside the box</p>
//           </div>
//           <div className="p-8">
//             <SignaturePad onSignatureComplete={handleSignature} />
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Text Input Dialog */}
//       <Dialog open={showTextInput} onOpenChange={setShowTextInput}>
//         <DialogContent className="max-w-md p-0 bg-white border-none rounded-3xl overflow-hidden shadow-2xl">
//           <div className="bg-[#28ABDF] p-6 text-white text-center">
//             <h3 className="text-xl font-bold">Enter Text</h3>
//           </div>
//           <div className="p-8 space-y-4">
//             <Input
//               value={textValue}
//               onChange={e => setTextValue(e.target.value)}
//               placeholder="Type here..."
//               className="h-12 rounded-xl text-base"
//               onKeyDown={e => e.key === 'Enter' && handleTextConfirm()}
//               autoFocus
//             />
//             <Button
//               onClick={handleTextConfirm}
//               disabled={!textValue.trim()}
//               className="w-full h-12 bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl font-bold"
//             >
//               Confirm
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// // PDF Page Canvas renderer
// function PageCanvas({ page }) {
//   const canvasRef = useRef(null);
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx   = canvas.getContext('2d');
//     const ratio = window.devicePixelRatio || 1;
//     canvas.width  = page.viewport.width  * ratio;
//     canvas.height = page.viewport.height * ratio;
//     ctx.scale(ratio, ratio);
//     page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
//   }, [page]);
//   return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
// }









// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { useParams } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { buildProxyUrl } from '@/api/apiClient';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Dialog, DialogContent } from '@/components/ui/dialog';
// import { toast } from 'sonner';
// import { Loader2, CheckCircle2, PenTool, Type, AlertTriangle } from 'lucide-react';
// import SignaturePad from '@/components/signing/SignaturePad';
// import * as pdfjsLib from 'pdfjs-dist';
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// export default function SignerView() {
//   const { token } = useParams();

//   const [docData, setDocData]           = useState(null);
//   const [myPartyIndex, setMyPartyIndex] = useState(null);
//   const [loading, setLoading]           = useState(true);
//   const [error, setError]               = useState(null);
//   const [fields, setFields]             = useState([]);
//   const [activeField, setActiveField]   = useState(null);
//   const [showSigPad, setShowSigPad]     = useState(false);
//   const [showTextInput, setShowTextInput] = useState(false);
//   const [textValue, setTextValue]       = useState('');
//   const [submitting, setSubmitting]     = useState(false);
//   const [completed, setCompleted]       = useState(false);
//   const [pagesData, setPagesData]       = useState([]);
//   const [pdfError, setPdfError]         = useState(null);
//   const containerRef = useRef(null);

//   // ✅ FIX: keep fields in a ref so callbacks never get stale values
//   const fieldsRef = useRef(fields);
//   useEffect(() => { fieldsRef.current = fields; }, [fields]);

//   // ── Load signing session ─────────────────────────────────────────────────
//   useEffect(() => {
//     if (!token) { setLoading(false); setError('No signing token found.'); return; }

//     const load = async () => {
//       try {
//         const res  = await api.get(`/documents/sign/${token}`);
//         const data = res.data;

//         if (!data.success && !data.title) {
//           setError(data.error || 'Invalid or expired signing link.');
//           return;
//         }

//         setDocData(data);
//         setMyPartyIndex(Number(data.partyIndex ?? 0));

//         const rawFields = (data.fields || []).map(f => {
//           const obj = typeof f === 'string' ? JSON.parse(f) : f;
//           return {
//             ...obj,
//             partyIndex: Number(obj.partyIndex ?? 0),
//             // ✅ FIX: a field is "filled" only if it has a value AND belongs to a previous signer
//             // Current signer always starts fresh for their own fields
//             filled: Number(obj.partyIndex) !== Number(data.partyIndex) ? !!obj.value : false,
//           };
//         });
//         setFields(rawFields);

//         if (data.completed) setCompleted(true);
//       } catch (err) {
//         console.error('Sign load error:', err);
//         const msg = err.response?.data?.error || 'Invalid or expired signing link.';
//         setError(msg);
//         toast.error(msg);
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [token]);

//   // ── Render all PDF pages ─────────────────────────────────────────────────
//   useEffect(() => {
//     if (!docData?.fileUrl) return;
//     setPdfError(null);

//     // ✅ FIX: use buildProxyUrl instead of manual string manipulation
//     const proxyUrl = buildProxyUrl(docData.fileUrl);

//     pdfjsLib.getDocument({ url: proxyUrl, withCredentials: false }).promise
//       .then(async (pdf) => {
//         // Wait for container to be measured
//         await new Promise(r => setTimeout(r, 50));
//         const containerWidth = containerRef.current?.clientWidth || 800;
//         const pages = [];
//         for (let i = 1; i <= pdf.numPages; i++) {
//           const page     = await pdf.getPage(i);
//           const scale    = Math.max((containerWidth - 32) / page.getViewport({ scale: 1 }).width, 0.5);
//           const viewport = page.getViewport({ scale });
//           pages.push({ num: i, viewport, pageObj: page });
//         }
//         setPagesData(pages);
//       })
//       .catch(err => {
//         console.error('PDF load error:', err);
//         setPdfError('Could not load document PDF. Please contact the sender.');
//       });
//   }, [docData]);

//   // ── Auto-scroll to first unsigned field ──────────────────────────────────
//   useEffect(() => {
//     if (!pagesData.length || myPartyIndex === null) return;
//     const firstUnsigned = fieldsRef.current.find(
//       f => Number(f.partyIndex) === myPartyIndex && !f.filled
//     );
//     if (!firstUnsigned) return;
//     setTimeout(() => {
//       document.getElementById(`field-${firstUnsigned.id}`)
//         ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }, 700);
//   }, [pagesData, myPartyIndex]);

//   const myFields = useMemo(
//     () => fields.filter(f => Number(f.partyIndex) === myPartyIndex),
//     [fields, myPartyIndex]
//   );

//   const filledCount   = myFields.filter(f => f.filled).length;
//   const totalMyFields = myFields.length;

//   // ── Field interaction ────────────────────────────────────────────────────
//   const handleFieldClick = (field) => {
//     if (Number(field.partyIndex) !== myPartyIndex) return;
//     setActiveField(field);
//     if (field.type === 'signature') {
//       setShowSigPad(true);
//     } else {
//       setTextValue(field.value || '');
//       setShowTextInput(true);
//     }
//   };

//   const handleSignature = useCallback((sigValue) => {
//     if (!activeField) return;
//     const fieldId = activeField.id;

//     // ✅ FIX: use functional update — never reads stale `fields`
//     setFields(prev => prev.map(f =>
//       f.id === fieldId ? { ...f, value: sigValue, filled: true } : f
//     ));
//     setShowSigPad(false);
//     setActiveField(null);

//     // Auto-scroll to next unsigned field using the ref
//     setTimeout(() => {
//       const nextUnsigned = fieldsRef.current.find(
//         f => Number(f.partyIndex) === myPartyIndex && !f.filled && f.id !== fieldId
//       );
//       if (nextUnsigned) {
//         document.getElementById(`field-${nextUnsigned.id}`)
//           ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//     }, 350);
//   }, [activeField, myPartyIndex]);

//   const handleTextConfirm = useCallback(() => {
//     if (!textValue.trim() || !activeField) return;
//     const fieldId = activeField.id;
//     setFields(prev => prev.map(f =>
//       f.id === fieldId ? { ...f, value: textValue.trim(), filled: true } : f
//     ));
//     setShowTextInput(false);
//     setTextValue('');
//     setActiveField(null);

//     // Auto-scroll to next
//     setTimeout(() => {
//       const nextUnsigned = fieldsRef.current.find(
//         f => Number(f.partyIndex) === myPartyIndex && !f.filled && f.id !== fieldId
//       );
//       if (nextUnsigned) {
//         document.getElementById(`field-${nextUnsigned.id}`)
//           ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//     }, 350);
//   }, [textValue, activeField, myPartyIndex]);

//   const handleSubmit = async () => {
//     const remaining = myFields.filter(f => !f.filled).length;
//     if (remaining > 0) {
//       toast.error(`Please fill all ${remaining} remaining field(s) before submitting.`);
//       // Scroll to first unfilled
//       const firstUnfilled = myFields.find(f => !f.filled);
//       if (firstUnfilled) {
//         document.getElementById(`field-${firstUnfilled.id}`)
//           ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//       return;
//     }
//     setSubmitting(true);
//     try {
//       // ✅ FIX: send fieldsRef.current to ensure latest state is submitted
//       await api.post('/documents/sign/submit', {
//         token,
//         fields: fieldsRef.current,
//         locationData: 'Unknown',
//       });
//       setCompleted(true);
//       toast.success('Document signed successfully!');
//     } catch (err) {
//       setSubmitting(false);
//       toast.error(err.response?.data?.error || 'Failed to submit. Please try again.');
//     }
//   };

//   // ── Loading & error states ───────────────────────────────────────────────
//   if (loading) return (
//     <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
//       <Loader2 className="animate-spin text-[#28ABDF]" size={40} />
//       <p className="text-slate-500 font-medium">Preparing document...</p>
//     </div>
//   );

//   if (error) return (
//     <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
//       <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
//         <AlertTriangle size={60} className="text-red-400 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-slate-800 mb-2">Link Error</h2>
//         <p className="text-slate-500">{error}</p>
//       </div>
//     </div>
//   );

//   if (completed) return (
//     <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
//       <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
//         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//           <CheckCircle2 size={48} className="text-green-500" />
//         </div>
//         <h2 className="text-3xl font-bold text-slate-800">All Done!</h2>
//         <p className="text-slate-500 mb-8 mt-3">
//           Your signature has been applied. The next party will be notified automatically.
//         </p>
//         <Button
//           className="w-full bg-[#28ABDF] hover:bg-[#2399c8] h-12 rounded-xl text-lg font-bold"
//           onClick={() => window.close()}
//         >
//           Close Tab
//         </Button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#F8FAFC]">
//       {/* Sticky Header */}
//       <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm">
//         <div className="min-w-0 flex-1 mr-4">
//           <h1 className="font-bold text-slate-800 text-base sm:text-lg truncate">
//             {docData?.title || 'Document'}
//           </h1>
//           <div className="flex items-center gap-2 mt-0.5">
//             <span className="text-[10px] text-[#28ABDF] font-bold uppercase tracking-widest">
//               {filledCount}/{totalMyFields} fields completed
//             </span>
//             {filledCount === totalMyFields && totalMyFields > 0 && (
//               <span className="text-[10px] text-green-500 font-bold uppercase">✓ Ready</span>
//             )}
//           </div>
//         </div>
//         <Button
//           onClick={handleSubmit}
//           disabled={submitting || filledCount < totalMyFields}
//           className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-full px-5 sm:px-8 h-10 shadow font-bold text-sm disabled:opacity-40 flex-shrink-0"
//         >
//           {submitting
//             ? <Loader2 className="animate-spin w-4 h-4" />
//             : 'Finish & Submit'}
//         </Button>
//       </header>

//       {/* Progress Bar */}
//       <div className="h-1 bg-slate-200">
//         <div
//           className="h-1 bg-[#28ABDF] transition-all duration-700"
//           style={{ width: totalMyFields ? `${(filledCount / totalMyFields) * 100}%` : '0%' }}
//         />
//       </div>

//       {/* Instruction banner */}
//       {totalMyFields > 0 && filledCount < totalMyFields && (
//         <div className="bg-sky-50 border-b border-sky-100 px-4 py-2 text-center">
//           <p className="text-xs text-sky-700 font-medium">
//             👆 Tap any highlighted field to sign or type. Complete all {totalMyFields} field{totalMyFields > 1 ? 's' : ''} to submit.
//           </p>
//         </div>
//       )}

//       {/* PDF Viewer */}
//       <main ref={containerRef} className="max-w-4xl mx-auto py-6 px-3 sm:px-4">
//         {pdfError && (
//           <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
//             <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
//             <p className="text-red-600 font-medium text-sm">{pdfError}</p>
//           </div>
//         )}

//         {pagesData.map(page => (
//           <div
//             key={page.num}
//             className="relative mb-8 bg-white shadow-xl mx-auto rounded-lg overflow-hidden"
//             style={{ width: page.viewport.width, height: page.viewport.height, maxWidth: '100%' }}
//           >
//             <PageCanvas page={page} />

//             {fields
//               .filter(f => Number(f.page) === page.num)
//               .map(field => {
//                 const isMine = Number(field.partyIndex) === myPartyIndex;
//                 return (
//                   <div
//                     id={`field-${field.id}`}
//                     key={field.id}
//                     onClick={() => isMine && handleFieldClick(field)}
//                     className={[
//                       'absolute border-2 flex items-center justify-center rounded-md transition-all duration-200 overflow-hidden',
//                       isMine && !field.filled
//                         ? 'border-sky-400 bg-sky-50/80 cursor-pointer hover:bg-sky-100 hover:border-sky-500 animate-pulse'
//                         : isMine && field.filled
//                         ? 'border-green-400 bg-green-50/60 cursor-pointer hover:border-green-500'
//                         : 'border-slate-200/60 bg-slate-50/20 pointer-events-none opacity-30',
//                     ].join(' ')}
//                     style={{
//                       left:   `${field.x}%`,
//                       top:    `${field.y}%`,
//                       width:  `${field.width}%`,
//                       height: `${field.height}%`,
//                     }}
//                   >
//                     {field.filled ? (
//                       field.type === 'signature' ? (
//                         <img
//                           src={field.value}
//                           className="w-full h-full object-contain p-0.5"
//                           alt="signature"
//                           draggable={false}
//                         />
//                       ) : (
//                         <span className="text-xs font-semibold text-slate-700 px-1.5 truncate w-full text-center">
//                           {field.value}
//                         </span>
//                       )
//                     ) : (
//                       <div className="flex flex-col items-center justify-center gap-0.5">
//                         {field.type === 'signature'
//                           ? <PenTool size={isMine ? 16 : 10} className={isMine ? 'text-sky-500' : 'text-slate-300'} />
//                           : <Type size={isMine ? 16 : 10} className={isMine ? 'text-sky-500' : 'text-slate-300'} />
//                         }
//                         {isMine && (
//                           <span className="text-[7px] font-black uppercase text-sky-500 leading-none">
//                             {field.type === 'signature' ? 'Sign' : 'Type'}
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//           </div>
//         ))}

//         {/* Bottom Submit CTA */}
//         {filledCount === totalMyFields && totalMyFields > 0 && (
//           <div className="flex justify-center pb-12 pt-4">
//             <Button
//               onClick={handleSubmit}
//               disabled={submitting}
//               className="bg-green-500 hover:bg-green-600 text-white rounded-full px-10 sm:px-14 h-14 shadow-2xl font-bold text-base sm:text-lg transition-all active:scale-95"
//             >
//               {submitting
//                 ? <><Loader2 className="animate-spin mr-2 w-5 h-5" /> Submitting...</>
//                 : <><CheckCircle2 className="mr-2 w-5 h-5" /> Submit All Signatures</>
//               }
//             </Button>
//           </div>
//         )}
//       </main>

//       {/* Signature Dialog */}
//       <Dialog open={showSigPad} onOpenChange={open => { setShowSigPad(open); if (!open) setActiveField(null); }}>
//         <DialogContent className="max-w-xl p-0 bg-white border-none rounded-3xl overflow-hidden shadow-2xl">
//           <div className="bg-[#28ABDF] p-5 text-white text-center">
//             <h3 className="text-xl font-bold">Draw Your Signature</h3>
//             <p className="text-sky-100 text-xs mt-1">Sign clearly inside the box below</p>
//           </div>
//           <div className="p-6 sm:p-8">
//             <SignaturePad onSignatureComplete={handleSignature} />
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Text Input Dialog */}
//       <Dialog open={showTextInput} onOpenChange={open => { setShowTextInput(open); if (!open) { setActiveField(null); setTextValue(''); } }}>
//         <DialogContent className="max-w-md p-0 bg-white border-none rounded-3xl overflow-hidden shadow-2xl">
//           <div className="bg-[#28ABDF] p-5 text-white text-center">
//             <h3 className="text-xl font-bold">Enter Text</h3>
//             <p className="text-sky-100 text-xs mt-1">This will appear on the document</p>
//           </div>
//           <div className="p-6 sm:p-8 space-y-4">
//             <Input
//               value={textValue}
//               onChange={e => setTextValue(e.target.value)}
//               placeholder="Type here..."
//               className="h-12 rounded-xl text-base border-slate-200 focus:border-[#28ABDF] focus:ring-[#28ABDF]"
//               onKeyDown={e => e.key === 'Enter' && handleTextConfirm()}
//               autoFocus
//             />
//             <Button
//               onClick={handleTextConfirm}
//               disabled={!textValue.trim()}
//               className="w-full h-12 bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl font-bold disabled:opacity-40"
//             >
//               Confirm
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// // ── Page Canvas — crisp HiDPI rendering ─────────────────────────────────────
// function PageCanvas({ page }) {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     let cancelled = false;
//     const ratio = window.devicePixelRatio || 1;
//     canvas.width  = page.viewport.width  * ratio;
//     canvas.height = page.viewport.height * ratio;

//     const ctx = canvas.getContext('2d');
//     ctx.scale(ratio, ratio);

//     const task = page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
//     task.promise.catch(err => {
//       if (!cancelled && err.name !== 'RenderingCancelledException') console.error(err);
//     });

//     return () => {
//       cancelled = true;
//       try { task.cancel(); } catch (_) {}
//     };
//   }, [page]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="absolute top-0 left-0"
//       style={{ width: page.viewport.width, height: page.viewport.height }}
//     />
//   );
// }

/**
 * SignerView.jsx — FIXED
 *
 * Fixes:
 * 1. ✅ Collects geo-location (with user permission), device info, browser UA before submit
 * 2. ✅ Shows transparent signature images (no white-box CSS)
 * 3. ✅ Handles 410 Gone for already-signed links
 * 4. ✅ Sends deviceInfo + locationData + clientTime to backend for audit trail
 */







import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api, buildProxyUrl } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, PenTool, Type, AlertTriangle, Lock } from 'lucide-react';
import SignaturePad from '@/components/signing/SignaturePad';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ── Device/Browser info helper ───────────────────────────────────────────────
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let device = 'Desktop';
  if (/Mobi|Android/i.test(ua))  device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  let browser = 'Unknown Browser';
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua))  browser = 'Firefox';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari';
  else if (/Edg\//.test(ua))      browser = 'Edge';

  return `${device} — ${browser} — ${navigator.platform || 'Unknown OS'}`;
};

// ── Geolocation helper (graceful degradation) ────────────────────────────────
const getGeoLocation = () => new Promise((resolve) => {
  if (!navigator.geolocation) {
    resolve({ text: 'Geolocation not supported' });
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await r.json();
        resolve({
          city:    data.address?.city || data.address?.town || data.address?.village || 'Unknown',
          country: data.address?.country || 'Unknown',
          postal:  data.address?.postcode || '',
          text:    `${data.address?.city || ''}, ${data.address?.country || ''}`,
        });
      } catch {
        resolve({ text: `${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}` });
      }
    },
    () => resolve({ text: 'Location declined' }),
    { timeout: 5000 }
  );
});

// ════════════════════════════════════════════════════════════════════════════
export default function SignerView() {
  const { token } = useParams();

  const [docData,        setDocData]        = useState(null);
  const [myPartyIndex,   setMyPartyIndex]   = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [errorType,      setErrorType]      = useState(null); // 'expired' | 'error'
  const [fields,         setFields]         = useState([]);
  const [activeField,    setActiveField]    = useState(null);
  const [showSigPad,     setShowSigPad]     = useState(false);
  const [showTextInput,  setShowTextInput]  = useState(false);
  const [textValue,      setTextValue]      = useState('');
  const [submitting,     setSubmitting]     = useState(false);
  const [completed,      setCompleted]      = useState(false);
  const [pagesData,      setPagesData]      = useState([]);
  const [pdfError,       setPdfError]       = useState(null);
  const containerRef = useRef(null);
  const fieldsRef    = useRef(fields);
  useEffect(() => { fieldsRef.current = fields; }, [fields]);

  // ── Load signing session ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setLoading(false); setError('No signing token.'); return; }
    (async () => {
      try {
        const res  = await api.get(`/documents/sign/${token}`);
        const data = res.data;
        if (!data.success) { setError(data.error || 'Invalid link.'); return; }

        setDocData(data);
        setMyPartyIndex(Number(data.partyIndex ?? 0));

        const rawFields = (data.fields || []).map(f => {
          const obj = typeof f === 'string' ? JSON.parse(f) : f;
          return {
            ...obj,
            partyIndex: Number(obj.partyIndex ?? 0),
            filled: Number(obj.partyIndex) !== Number(data.partyIndex) ? !!obj.value : false,
          };
        });
        setFields(rawFields);
      } catch (err) {
        const status = err.response?.status;
        const msg    = err.response?.data?.error || 'Invalid or expired signing link.';
        setErrorType(status === 410 ? 'expired' : 'error');
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // ── Render PDF ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!docData?.fileUrl) return;
    setPdfError(null);
    const proxyUrl = buildProxyUrl(docData.fileUrl);

    pdfjsLib.getDocument({ url: proxyUrl, withCredentials: false }).promise
      .then(async (pdf) => {
        await new Promise(r => setTimeout(r, 60));
        const cw    = containerRef.current?.clientWidth || 800;
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page     = await pdf.getPage(i);
          const scale    = Math.max((cw - 32) / page.getViewport({ scale: 1 }).width, 0.5);
          const viewport = page.getViewport({ scale });
          pages.push({ num: i, viewport, pageObj: page });
        }
        setPagesData(pages);
      })
      .catch(err => {
        console.error('PDF load error:', err);
        setPdfError('Could not load document PDF.');
      });
  }, [docData]);

  // ── Auto-scroll to first unsigned field ──────────────────────────────────
  useEffect(() => {
    if (!pagesData.length || myPartyIndex === null) return;
    const first = fieldsRef.current.find(f => Number(f.partyIndex) === myPartyIndex && !f.filled);
    if (!first) return;
    setTimeout(() => {
      document.getElementById(`field-${first.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 700);
  }, [pagesData, myPartyIndex]);

  const myFields     = useMemo(() => fields.filter(f => Number(f.partyIndex) === myPartyIndex), [fields, myPartyIndex]);
  const filledCount  = myFields.filter(f => f.filled).length;
  const totalFields  = myFields.length;

  // ── Field interaction ─────────────────────────────────────────────────────
  const handleFieldClick = (field) => {
    if (Number(field.partyIndex) !== myPartyIndex) return;
    setActiveField(field);
    if (field.type === 'signature') { setShowSigPad(true); }
    else { setTextValue(field.value || ''); setShowTextInput(true); }
  };

  const handleSignature = useCallback((sigValue) => {
    if (!activeField) return;
    const id = activeField.id;
    setFields(prev => prev.map(f => f.id === id ? { ...f, value: sigValue, filled: true } : f));
    setShowSigPad(false);
    setActiveField(null);
    setTimeout(() => {
      const next = fieldsRef.current.find(f => Number(f.partyIndex) === myPartyIndex && !f.filled && f.id !== id);
      next && document.getElementById(`field-${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
  }, [activeField, myPartyIndex]);

  const handleTextConfirm = useCallback(() => {
    if (!textValue.trim() || !activeField) return;
    const id = activeField.id;
    setFields(prev => prev.map(f => f.id === id ? { ...f, value: textValue.trim(), filled: true } : f));
    setShowTextInput(false); setTextValue(''); setActiveField(null);
    setTimeout(() => {
      const next = fieldsRef.current.find(f => Number(f.partyIndex) === myPartyIndex && !f.filled && f.id !== id);
      next && document.getElementById(`field-${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
  }, [textValue, activeField, myPartyIndex]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const remaining = myFields.filter(f => !f.filled).length;
    if (remaining > 0) {
      toast.error(`Please fill all ${remaining} remaining field(s).`);
      const first = myFields.find(f => !f.filled);
      first && document.getElementById(`field-${first.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);

    // Collect geo + device info in parallel (non-blocking to UX)
    const [locationData, deviceInfo] = await Promise.all([
      getGeoLocation().catch(() => ({ text: 'Unknown' })),
      Promise.resolve(getDeviceInfo()),
    ]);

    try {
      await api.post('/documents/sign/submit', {
        token,
        fields:       fieldsRef.current,
        locationData,
        deviceInfo,
        clientTime:   new Date().toISOString(),
      });
      setCompleted(true);
      toast.success('Document signed successfully!');
    } catch (err) {
      setSubmitting(false);
      toast.error(err.response?.data?.error || 'Submission failed. Please try again.');
    }
  };

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <Loader2 className="animate-spin text-[#28ABDF]" size={42} />
      <p className="text-slate-500 font-medium">Preparing document...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
        {errorType === 'expired'
          ? <Lock size={56} className="text-slate-400 mx-auto mb-4" />
          : <AlertTriangle size={56} className="text-red-400 mx-auto mb-4" />
        }
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {errorType === 'expired' ? 'Link Expired' : 'Link Error'}
        </h2>
        <p className="text-slate-500">{error}</p>
        {errorType === 'expired' && (
          <p className="text-xs text-slate-400 mt-3">
            Each signing link can only be used once. If you need to re-sign, please contact the document sender.
          </p>
        )}
      </div>
    </div>
  );

  if (completed) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">All Done!</h2>
        <p className="text-slate-500 mb-2 mt-3">Your signature has been applied.</p>
        <p className="text-xs text-slate-400 mb-8">
          The signed document with an audit certificate will be emailed to all parties shortly.
        </p>
        <Button className="w-full bg-[#28ABDF] hover:bg-[#2399c8] h-12 rounded-xl font-bold"
          onClick={() => window.close()}>
          Close Tab
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="min-w-0 flex-1 mr-4">
          <h1 className="font-bold text-slate-800 text-base sm:text-lg truncate">
            {docData?.title || 'Document'}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[#28ABDF] font-bold uppercase tracking-widest">
              {filledCount}/{totalFields} fields completed
            </span>
            {filledCount === totalFields && totalFields > 0 && (
              <span className="text-[10px] text-green-500 font-bold uppercase">✓ Ready to Submit</span>
            )}
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={submitting || filledCount < totalFields}
          className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-full px-5 sm:px-8 h-10 shadow font-bold text-sm disabled:opacity-40 flex-shrink-0"
        >
          {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Finish & Submit'}
        </Button>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-200">
        <div className="h-1 bg-[#28ABDF] transition-all duration-700"
          style={{ width: totalFields ? `${(filledCount / totalFields) * 100}%` : '0%' }} />
      </div>

      {totalFields > 0 && filledCount < totalFields && (
        <div className="bg-sky-50 border-b border-sky-100 px-4 py-2 text-center">
          <p className="text-xs text-sky-700 font-medium">
            👆 Tap any highlighted field to sign or type. Complete all {totalFields} field{totalFields !== 1 ? 's' : ''} to submit.
          </p>
        </div>
      )}

      {/* PDF Pages */}
      <main ref={containerRef} className="max-w-4xl mx-auto py-6 px-3 sm:px-4">
        {pdfError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 font-medium text-sm">{pdfError}</p>
          </div>
        )}

        {pagesData.map(page => (
          <div key={page.num}
            className="relative mb-8 bg-white shadow-xl mx-auto rounded-lg overflow-hidden"
            style={{ width: page.viewport.width, height: page.viewport.height, maxWidth: '100%' }}
          >
            <PageCanvas page={page} />

            {fields.filter(f => Number(f.page) === page.num).map(field => {
              const isMine = Number(field.partyIndex) === myPartyIndex;
              return (
                <div
                  id={`field-${field.id}`}
                  key={field.id}
                  onClick={() => isMine && handleFieldClick(field)}
                  className={[
                    'absolute border-2 flex items-center justify-center rounded-md transition-all duration-200 overflow-hidden',
                    isMine && !field.filled
                      ? 'border-sky-400 bg-sky-50/70 cursor-pointer hover:bg-sky-100 animate-pulse'
                      : isMine && field.filled
                      ? 'border-green-400 bg-green-50/40 cursor-pointer'
                      : 'border-slate-200/40 bg-transparent pointer-events-none opacity-20',
                  ].join(' ')}
                  style={{
                    left:   `${field.x}%`,
                    top:    `${field.y}%`,
                    width:  `${field.width}%`,
                    height: `${field.height}%`,
                  }}
                >
                  {field.filled ? (
                    field.type === 'signature' ? (
                      // ✅ Transparent PNG — use mix-blend-mode to eliminate any white bg artifact
                      <img
                        src={field.value}
                        className="w-full h-full object-contain p-0.5"
                        style={{ mixBlendMode: 'multiply', background: 'transparent' }}
                        alt="signature"
                        draggable={false}
                      />
                    ) : (
                      <span
                        className="px-1.5 truncate w-full text-center"
                        style={{
                          fontSize:   `${field.fontSize || 11}px`,
                          fontWeight: field.fontWeight === 'bold' ? '700' : '400',
                          color: '#111',
                        }}
                      >
                        {field.value}
                      </span>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      {field.type === 'signature'
                        ? <PenTool size={isMine ? 15 : 9} className={isMine ? 'text-sky-500' : 'text-slate-300'} />
                        : <Type    size={isMine ? 15 : 9} className={isMine ? 'text-sky-500' : 'text-slate-300'} />
                      }
                      {isMine && (
                        <span className="text-[7px] font-black uppercase text-sky-500 leading-none">
                          {field.type === 'signature' ? 'Sign' : 'Type'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {filledCount === totalFields && totalFields > 0 && (
          <div className="flex justify-center pb-12 pt-4">
            <Button onClick={handleSubmit} disabled={submitting}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full px-10 sm:px-14 h-14 shadow-2xl font-bold text-base transition-all active:scale-95">
              {submitting
                ? <><Loader2 className="animate-spin mr-2 w-5 h-5" /> Submitting...</>
                : <><CheckCircle2 className="mr-2 w-5 h-5" /> Submit All Signatures</>
              }
            </Button>
          </div>
        )}
      </main>

      {/* Signature Dialog */}
      <Dialog open={showSigPad} onOpenChange={open => { setShowSigPad(open); if (!open) setActiveField(null); }}>
        <DialogContent className="max-w-xl p-0 bg-white border-none rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-[#28ABDF] p-5 text-white text-center">
            <h3 className="text-xl font-bold">Draw Your Signature</h3>
            <p className="text-sky-100 text-xs mt-1">Sign clearly inside the box</p>
          </div>
          <div className="p-6 sm:p-8">
            <SignaturePad onSignatureComplete={handleSignature} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Text Input Dialog */}
      <Dialog open={showTextInput} onOpenChange={open => { setShowTextInput(open); if (!open) { setActiveField(null); setTextValue(''); } }}>
        <DialogContent className="max-w-md p-0 bg-white border-none rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-[#28ABDF] p-5 text-white text-center">
            <h3 className="text-xl font-bold">Enter Text</h3>
            <p className="text-sky-100 text-xs mt-1">This will appear on the document</p>
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <Input
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              placeholder="Type here..."
              className="h-12 rounded-xl text-base border-slate-200 focus:border-[#28ABDF]"
              onKeyDown={e => e.key === 'Enter' && handleTextConfirm()}
              autoFocus
            />
            <Button onClick={handleTextConfirm} disabled={!textValue.trim()}
              className="w-full h-12 bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl font-bold disabled:opacity-40">
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── HiDPI canvas renderer ────────────────────────────────────────────────────
function PageCanvas({ page }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const ratio   = window.devicePixelRatio || 1;
    canvas.width  = page.viewport.width  * ratio;
    canvas.height = page.viewport.height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    const task = page.pageObj.render({ canvasContext: ctx, viewport: page.viewport });
    task.promise.catch(err => { if (!cancelled && err.name !== 'RenderingCancelledException') console.error(err); });
    return () => { cancelled = true; try { task.cancel(); } catch (_) {} };
  }, [page]);

  return (
    <canvas ref={canvasRef} className="absolute top-0 left-0"
      style={{ width: page.viewport.width, height: page.viewport.height }} />
  );
}