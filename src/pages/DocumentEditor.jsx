
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import {
//   Select, SelectContent, SelectItem,
//   SelectTrigger, SelectValue,
// } from '@/components/ui/select';
// import { toast } from 'sonner';
// import {
//   Upload, Send, ArrowLeft, FileText,
//   Loader2, Mail, X, ImagePlus, Type,
// } from 'lucide-react';
// import PartyManager from '@/components/editor/PartyManager';
// import FieldToolbar  from '@/components/editor/FieldToolbar';
// import PdfViewer     from '@/components/editor/PdfViewer';

// // ── Font options ─────────────────────────────────────────────────
// const FONT_FAMILIES = [
//   { label: 'Helvetica',        value: 'Helvetica'       },
//   { label: 'Times New Roman',  value: 'Times New Roman' },
//   { label: 'Courier',          value: 'Courier'         },
// ];
// const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24];

// export default function DocumentEditor() {
//   const navigate  = useNavigate();
//   const location  = useLocation();
//   const { user }  = useAuth();

//   const [docId] = useState(() => {
//     const id = new URLSearchParams(location.search).get('id');
//     return id === 'new' ? null : id;
//   });

//   // ── Core state ───────────────────────────────────────────────
//   const [rawFile,    setRawFile]    = useState(null);
//   const [title,      setTitle]      = useState('');
//   const [fileUrl,    setFileUrl]    = useState('');
//   const [fileReady,  setFileReady]  = useState(false);
//   const [parties,    setParties]    = useState([]);
//   const [fields,     setFields]     = useState([]);
//   const [ccList,     setCcList]     = useState([]);
//   const [companyLogo,    setCompanyLogo]    = useState('');
//   const [companyLogoFile, setCompanyLogoFile] = useState(null);
//   const [companyLogoPreview, setCompanyLogoPreview] = useState('');
//   const [companyName,    setCompanyName]    = useState('');

//   // ── CC input ─────────────────────────────────────────────────
//   const [ccEmail,       setCcEmail]       = useState('');
//   const [ccName,        setCcName]        = useState('');
//   const [ccDesignation, setCcDesignation] = useState('');

//   // ── Editor state ─────────────────────────────────────────────
//   const [currentPage,        setCurrentPage]        = useState(1);
//   const [totalPages,         setTotalPages]          = useState(1);
//   const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
//   const [pendingFieldType,   setPendingFieldType]   = useState(null);
//   const [processing,         setProcessing]         = useState(false);

//   // ── Selected field for typography ────────────────────────────
//   const [selectedFieldId, setSelectedFieldId] = useState(null);

//   const selectedField = fields.find(f => f.id === selectedFieldId);

//   // ── Load existing doc ────────────────────────────────────────
//   useEffect(() => {
//     if (!docId) return;
//     api.get(`/documents/${docId}`)
//       .then(res => {
//         const d = res.data.document || res.data;
//         setTitle(d.title || '');
//         setFileUrl(d.fileUrl || '');
//         setFileReady(true);
//         setParties(d.parties || []);
//         setCcList(d.ccList || []);
//         setCompanyLogo(d.companyLogo || '');
//         setCompanyLogoPreview(d.companyLogo || '');
//         setCompanyName(d.companyName || '');
//         setFields((d.fields || []).map(f =>
//           typeof f === 'string' ? JSON.parse(f) : f
//         ));
//       })
//       .catch(() => toast.error('Failed to load document'));
//   }, [docId]);

//   // ── File select ──────────────────────────────────────────────
//   const handleFileSelect = useCallback((e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.type !== 'application/pdf') {
//       toast.error('Please upload a valid PDF.');
//       return;
//     }
//     if (file.size > 15 * 1024 * 1024) {
//       toast.error('PDF must be under 15MB.');
//       return;
//     }
//     if (fileUrl?.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
//     setRawFile(file);
//     setTitle(prev => prev || file.name.replace(/\.pdf$/i, ''));
//     setFileUrl(URL.createObjectURL(file));
//     setFileReady(true);
//     setFields([]);
//     setCurrentPage(1);
//     toast.success('PDF loaded! Place fields on the document.');
//     e.target.value = '';
//   }, [fileUrl]);

//   // ── Logo select ──────────────────────────────────────────────
//   const handleLogoSelect = useCallback((e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (!file.type.startsWith('image/')) {
//       toast.error('Please upload an image file.');
//       return;
//     }
//     setCompanyLogoFile(file);
//     setCompanyLogoPreview(URL.createObjectURL(file));
//     e.target.value = '';
//   }, []);

//   // ── CC helpers ───────────────────────────────────────────────
//   const addCc = () => {
//     const email = ccEmail.trim().toLowerCase();
//     if (!email) return;
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       toast.error('Invalid email address.');
//       return;
//     }
//     if (ccList.some(r => r.email === email)) {
//       toast.error('Already added.');
//       return;
//     }
//     setCcList(prev => [...prev, {
//       email,
//       name:        ccName.trim(),
//       designation: ccDesignation.trim(),
//     }]);
//     setCcEmail('');
//     setCcName('');
//     setCcDesignation('');
//   };

//   const removeCc = (email) =>
//     setCcList(prev => prev.filter(r => r.email !== email));

//   // ── Typography update for selected field ─────────────────────
//   const updateFieldTypography = (key, value) => {
//     if (!selectedFieldId) return;
//     setFields(prev => prev.map(f =>
//       f.id === selectedFieldId ? { ...f, [key]: value } : f
//     ));
//   };

//   // ── Validation ───────────────────────────────────────────────
//   const validate = () => {
//     if (!rawFile && !fileUrl) {
//       toast.error('Please upload a PDF.');
//       return false;
//     }
//     if (!title.trim()) {
//       toast.error('Please enter a document title.');
//       return false;
//     }
//     if (!parties.length) {
//       toast.error('Please add at least one signer.');
//       return false;
//     }
//     if (parties.some(p => !p.name?.trim() || !p.email?.trim())) {
//       toast.error('All signers need a name and email.');
//       return false;
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (parties.some(p => !emailRegex.test(p.email))) {
//       toast.error('One or more signer emails are invalid.');
//       return false;
//     }
//     if (!fields.length) {
//       toast.error('Please place at least one field.');
//       return false;
//     }
//     const partyIndices = new Set(fields.map(f => Number(f.partyIndex)));
//     const missing = parties.find((_, i) => !partyIndices.has(i));
//     if (missing) {
//       toast.error(`Please add a field for "${missing.name}".`);
//       return false;
//     }
//     return true;
//   };

//   // ── Send ─────────────────────────────────────────────────────
//   const handleSend = async () => {
//     if (!validate()) return;
//     setProcessing(true);

//     try {
//       const formData = new FormData();
//       if (rawFile instanceof File) formData.append('file', rawFile);

//       formData.append('title',       title.trim());
//       formData.append('parties',     JSON.stringify(
//         parties.map(p => ({
//           name:  p.name.trim(),
//           email: p.email.trim().toLowerCase(),
//           color: p.color,
//         }))
//       ));
//       formData.append('ccRecipients', JSON.stringify(ccList));
//       formData.append('fields',       JSON.stringify(fields));
//       formData.append('totalPages',   String(totalPages));
//       formData.append('companyName',  companyName.trim());

//       // Upload logo first if new file chosen
//       if (companyLogoFile instanceof File) {
//         const logoForm = new FormData();
//         logoForm.append('logo', companyLogoFile);
//         const logoRes = await api.post('/documents/upload-logo', logoForm);
//         if (logoRes.data?.logoUrl) {
//           formData.append('companyLogo', logoRes.data.logoUrl);
//         }
//       } else if (companyLogo) {
//         formData.append('companyLogo', companyLogo);
//       }

//       // ── Optimistic: navigate immediately ────────────────────
//       if (fileUrl?.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
//       navigate('/dashboard');
//       toast.success('🎉 Document is being sent in the background!');

//       // ── Background API call ──────────────────────────────────
//       api.post('/documents/upload-and-send', formData)
//         .then(res => {
//           if (!res.data?.success) {
//             toast.error(res.data?.message || 'Send failed.');
//           }
//         })
//         .catch(err => {
//           toast.error(
//             err.response?.data?.message || 'Failed to send document.'
//           );
//         });

//     } catch (err) {
//       toast.error(err.message || 'Something went wrong.');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
//       {/* ── Top Bar ─────────────────────────────────────────── */}
//       <div className="sticky top-0 z-40 bg-white dark:bg-slate-900
//                       border-b border-slate-200 dark:border-slate-700
//                       px-4 py-3 flex items-center justify-between gap-3
//                       shadow-sm">
//         <div className="flex items-center gap-3 min-w-0">
//           <Button
//             variant="ghost" size="icon"
//             onClick={() => navigate('/dashboard')}
//             className="rounded-xl shrink-0"
//           >
//             <ArrowLeft className="w-4 h-4" />
//           </Button>
//           <Input
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Document Title..."
//             className="h-9 rounded-xl border-slate-200 dark:border-slate-600
//                        font-semibold text-slate-800 dark:text-white
//                        max-w-xs focus:border-[#28ABDF]"
//           />
//         </div>
//         <Button
//           onClick={handleSend}
//           disabled={processing}
//           className="bg-[#28ABDF] hover:bg-[#2399c8] text-white
//                      rounded-xl gap-2 px-6 h-9 font-semibold
//                      shadow-lg transition-all active:scale-95 shrink-0"
//         >
//           {processing
//             ? <Loader2 className="w-4 h-4 animate-spin" />
//             : <><Send className="w-4 h-4" /> Send</>
//           }
//         </Button>
//       </div>

//       <div className="flex h-[calc(100vh-57px)]">
//         {/* ── Left Sidebar ──────────────────────────────────── */}
//         <div className="w-80 shrink-0 border-r border-slate-200
//                         dark:border-slate-700 bg-white dark:bg-slate-900
//                         overflow-y-auto flex flex-col gap-4 p-4">

//           {/* Company Branding */}
//           <Card className="p-4 rounded-2xl border-slate-100 dark:border-slate-800">
//             <p className="text-xs font-bold text-slate-500 uppercase
//                           tracking-wider mb-3">
//               Company Branding
//             </p>

//             {/* Logo upload */}
//             <div className="mb-3">
//               <Label className="text-xs text-slate-500 mb-1.5 block">
//                 Company Logo
//               </Label>
//               {companyLogoPreview ? (
//                 <div className="relative inline-block">
//                   <img
//                     src={companyLogoPreview}
//                     alt="Logo"
//                     className="h-12 max-w-[160px] object-contain
//                                rounded-lg border border-slate-200"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setCompanyLogoPreview('');
//                       setCompanyLogoFile(null);
//                       setCompanyLogo('');
//                     }}
//                     className="absolute -top-1.5 -right-1.5 bg-red-500
//                                text-white rounded-full p-0.5 shadow"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </div>
//               ) : (
//                 <label className="flex items-center gap-2 cursor-pointer
//                                   border-2 border-dashed border-slate-200
//                                   dark:border-slate-600 rounded-xl p-3
//                                   hover:border-[#28ABDF] transition-colors">
//                   <ImagePlus className="w-4 h-4 text-slate-400" />
//                   <span className="text-xs text-slate-400">
//                     Upload logo (PNG/JPG)
//                   </span>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={handleLogoSelect}
//                   />
//                 </label>
//               )}
//             </div>

//             {/* Company name */}
//             <div>
//               <Label className="text-xs text-slate-500 mb-1.5 block">
//                 Company Name
//               </Label>
//               <Input
//                 value={companyName}
//                 onChange={e => setCompanyName(e.target.value)}
//                 placeholder="Your Company Name"
//                 className="h-9 rounded-xl text-sm border-slate-200
//                            dark:border-slate-600 focus:border-[#28ABDF]"
//               />
//             </div>
//           </Card>

//           {/* PDF Upload */}
//           <Card className="p-4 rounded-2xl border-slate-100 dark:border-slate-800">
//             <p className="text-xs font-bold text-slate-500 uppercase
//                           tracking-wider mb-3">
//               Document
//             </p>
//             <label className="flex flex-col items-center gap-2 cursor-pointer
//                               border-2 border-dashed border-slate-200
//                               dark:border-slate-600 rounded-xl p-4
//                               hover:border-[#28ABDF] transition-colors
//                               group">
//               {fileReady ? (
//                 <>
//                   <FileText className="w-8 h-8 text-[#28ABDF]" />
//                   <p className="text-xs font-semibold text-[#28ABDF]">
//                     PDF Loaded ✓
//                   </p>
//                   <p className="text-[10px] text-slate-400">
//                     Click to replace
//                   </p>
//                 </>
//               ) : (
//                 <>
//                   <Upload className="w-8 h-8 text-slate-300
//                                      group-hover:text-[#28ABDF]
//                                      transition-colors" />
//                   <p className="text-xs font-semibold text-slate-400">
//                     Upload PDF
//                   </p>
//                   <p className="text-[10px] text-slate-300">
//                     Max 15MB
//                   </p>
//                 </>
//               )}
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 className="hidden"
//                 onChange={handleFileSelect}
//               />
//             </label>
//           </Card>

//           {/* Parties */}
//           <Card className="p-4 rounded-2xl border-slate-100 dark:border-slate-800">
//             <PartyManager parties={parties} onChange={setParties} />
//           </Card>

//           {/* CC */}
//           <Card className="p-4 rounded-2xl border-slate-100 dark:border-slate-800">
//             <div className="flex items-center gap-2 mb-3">
//               <Mail className="w-4 h-4 text-[#28ABDF]" />
//               <p className="text-xs font-bold text-slate-600
//                             dark:text-slate-300 uppercase tracking-wider">
//                 CC Recipients
//               </p>
//             </div>
//             <div className="space-y-2">
//               <Input
//                 placeholder="Email *"
//                 value={ccEmail}
//                 onChange={e => setCcEmail(e.target.value)}
//                 className="h-9 text-xs rounded-xl border-slate-200
//                            dark:border-slate-600"
//               />
//               <Input
//                 placeholder="Name"
//                 value={ccName}
//                 onChange={e => setCcName(e.target.value)}
//                 className="h-9 text-xs rounded-xl border-slate-200
//                            dark:border-slate-600"
//               />
//               <div className="flex gap-2">
//                 <Input
//                   placeholder="Designation"
//                   value={ccDesignation}
//                   onChange={e => setCcDesignation(e.target.value)}
//                   onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCc())}
//                   className="h-9 text-xs rounded-xl flex-1 border-slate-200
//                              dark:border-slate-600"
//                 />
//                 <Button
//                   type="button" size="sm"
//                   onClick={addCc}
//                   className="h-9 px-3 text-xs bg-[#28ABDF] hover:bg-[#2399c8]
//                              text-white rounded-xl"
//                 >
//                   Add
//                 </Button>
//               </div>
//             </div>
//             {ccList.length > 0 && (
//               <div className="mt-3 space-y-1.5">
//                 {ccList.map(r => (
//                   <div key={r.email}
//                     className="flex items-center justify-between
//                                bg-sky-50 dark:bg-sky-900/20
//                                border border-sky-100 dark:border-sky-800
//                                rounded-xl px-3 py-2">
//                     <div className="min-w-0">
//                       <p className="text-[11px] font-bold text-sky-700
//                                    dark:text-sky-300 truncate">
//                         {r.email}
//                       </p>
//                       <p className="text-[9px] text-sky-500 truncate">
//                         {r.name}{r.designation ? ` · ${r.designation}` : ''}
//                       </p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => removeCc(r.email)}
//                       className="text-slate-400 hover:text-red-500 p-1 shrink-0"
//                     >
//                       <X className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </Card>

//           {/* Field Toolbar */}
//           {fileReady && parties.length > 0 && (
//             <Card className="p-4 rounded-2xl border-slate-100 dark:border-slate-800">
//               <FieldToolbar
//                 parties={parties}
//                 selectedPartyIndex={selectedPartyIndex}
//                 onPartySelect={setSelectedPartyIndex}
//                 onAddField={type => setPendingFieldType(type)}
//                 pendingFieldType={pendingFieldType}
//               />
//             </Card>
//           )}

//           {/* Typography panel — only for text fields */}
//           {selectedField?.type === 'text' && (
//             <Card className="p-4 rounded-2xl border-[#28ABDF]/30
//                              bg-sky-50/50 dark:bg-sky-900/10
//                              border-slate-100 dark:border-slate-800">
//               <div className="flex items-center gap-2 mb-3">
//                 <Type className="w-4 h-4 text-[#28ABDF]" />
//                 <p className="text-xs font-bold text-slate-600
//                               dark:text-slate-300 uppercase tracking-wider">
//                   Text Field Style
//                 </p>
//               </div>
//               <p className="text-[10px] text-slate-400 mb-3">
//                 These settings are fixed. Signer only types text.
//               </p>

//               <div className="space-y-3">
//                 <div>
//                   <Label className="text-xs text-slate-500 mb-1.5 block">
//                     Font Family
//                   </Label>
//                   <Select
//                     value={selectedField.fontFamily || 'Helvetica'}
//                     onValueChange={v => updateFieldTypography('fontFamily', v)}
//                   >
//                     <SelectTrigger className="h-9 rounded-xl text-xs
//                                              border-slate-200 dark:border-slate-600">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {FONT_FAMILIES.map(f => (
//                         <SelectItem key={f.value} value={f.value}>
//                           <span style={{ fontFamily: f.value }}>
//                             {f.label}
//                           </span>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label className="text-xs text-slate-500 mb-1.5 block">
//                     Font Size
//                   </Label>
//                   <Select
//                     value={String(selectedField.fontSize || 14)}
//                     onValueChange={v => updateFieldTypography('fontSize', Number(v))}
//                   >
//                     <SelectTrigger className="h-9 rounded-xl text-xs
//                                              border-slate-200 dark:border-slate-600">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {FONT_SIZES.map(s => (
//                         <SelectItem key={s} value={String(s)}>
//                           {s}px
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Live preview */}
//                 <div className="bg-white dark:bg-slate-800 border
//                                 border-slate-200 dark:border-slate-600
//                                 rounded-xl p-3 min-h-[40px] flex
//                                 items-center justify-center">
//                   <span
//                     style={{
//                       fontFamily: selectedField.fontFamily || 'Helvetica',
//                       fontSize:   `${selectedField.fontSize || 14}px`,
//                       color:      '#1a202c',
//                     }}
//                     className="dark:text-white"
//                   >
//                     Sample Text Preview
//                   </span>
//                 </div>
//               </div>
//             </Card>
//           )}

//           {/* Fields summary */}
//           {fields.length > 0 && (
//             <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl
//                             p-3 border border-slate-100 dark:border-slate-800">
//               <p className="text-[10px] font-bold text-slate-500
//                             uppercase tracking-wide mb-2">
//                 {fields.length} field{fields.length !== 1 ? 's' : ''} placed
//               </p>
//               {parties.map((p, i) => {
//                 const count = fields.filter(
//                   f => Number(f.partyIndex) === i
//                 ).length;
//                 return count > 0 ? (
//                   <div key={i}
//                     className="flex justify-between items-center
//                                text-[11px] py-0.5">
//                     <span className="font-medium text-slate-600
//                                      dark:text-slate-400 truncate mr-2">
//                       {p.name}
//                     </span>
//                     <span className="font-bold text-[#28ABDF] shrink-0">
//                       {count} field{count !== 1 ? 's' : ''}
//                     </span>
//                   </div>
//                 ) : null;
//               })}
//             </div>
//           )}
//         </div>

//         {/* ── PDF Viewer ─────────────────────────────────────── */}
//         <div className="flex-1 bg-slate-100 dark:bg-slate-950
//                         overflow-hidden min-h-0">
//           {fileReady ? (
//             <PdfViewer
//               fileUrl={fileUrl}
//               fields={fields}
//               onFieldsChange={setFields}
//               currentPage={currentPage}
//               onPageChange={setCurrentPage}
//               onTotalPagesChange={setTotalPages}
//               pendingFieldType={pendingFieldType}
//               selectedPartyIndex={selectedPartyIndex}
//               parties={parties}
//               onFieldPlaced={() => setPendingFieldType(null)}
//               selectedFieldId={selectedFieldId}
//               onFieldSelect={setSelectedFieldId}
//             />
//           ) : (
//             <div className="h-full flex flex-col items-center
//                             justify-center text-slate-300 py-32
//                             px-8 text-center">
//               <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800
//                               rounded-3xl flex items-center justify-center mb-6">
//                 <FileText className="w-12 h-12 opacity-30" />
//               </div>
//               <p className="font-semibold text-slate-400 text-lg mb-2">
//                 No document yet
//               </p>
//               <p className="text-slate-300 text-sm">
//                 Upload a PDF from the sidebar to get started.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/DocumentEditor.jsx

import React, {
  useState, useCallback, useEffect, useRef,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, buildProxyUrl } from '@/api/apiClient';
import { useAuth }   from '@/lib/AuthContext';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Card }      from '@/components/ui/card';
import { toast }     from 'sonner';
import {
  ArrowLeft, Send, Loader2, FileText,
  Upload, X, Plus, Mail, Eye,
  CheckCircle2, RefreshCw, Type,
  Bold, AlignLeft, ChevronDown,
} from 'lucide-react';
import PdfViewer    from '@/components/editor/PdfViewer';
import FieldToolbar from '@/components/editor/FieldToolbar';

// ════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════
const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'];

const FONT_FAMILIES = [
  { value: 'Helvetica',   label: 'Helvetica'   },
  { value: 'TimesRoman',  label: 'Times Roman' },
  { value: 'Courier',     label: 'Courier'     },
];

const FONT_SIZES = [8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32];

const EMPTY_PARTY = (i = 0) => ({
  name:        '',
  email:       '',
  designation: '',          // ✅ added
  color:       COLORS[i % COLORS.length],
});

const EMPTY_CC = () => ({
  email:       '',
  name:        '',
  designation: '',          // ✅ added
});

// ════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════

function StatusBadge({ status }) {
  const map = {
    in_progress: { label: 'Active',    cls: 'bg-sky-100 text-sky-700'         },
    completed:   { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700' },
    draft:       { label: 'Draft',     cls: 'bg-slate-100 text-slate-600'     },
    cancelled:   { label: 'Cancelled', cls: 'bg-red-100 text-red-600'         },
  };
  const cfg = map[status] || map.draft;
  return (
    <span className={`text-[10px] font-bold uppercase
                      px-2 py-1 rounded-lg ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

/**
 * Field Properties Panel
 * Shows when a text field is selected — font family, size, bold
 * ✅ Only shown for 'text' type fields
 */
function FieldPropertiesPanel({ field, onUpdate, onDelete }) {
  if (!field) return null;

  return (
    <div className="border border-[#28ABDF]/30 rounded-xl
                    bg-sky-50 dark:bg-sky-900/10 p-3 space-y-2">

      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#28ABDF]
                      uppercase tracking-wider flex items-center gap-1">
          <Type className="w-3 h-3" />
          Field Properties
        </p>
        <button
          onClick={onDelete}
          className="text-[10px] text-red-400
                     hover:text-red-600 font-medium"
        >
          Remove
        </button>
      </div>

      {/* Font properties — text fields only */}
      {field.type === 'text' && (
        <>
          {/* Font Family */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500
                               font-semibold uppercase tracking-wide">
              Font
            </label>
            <div className="relative">
              <select
                value={field.fontFamily || 'Helvetica'}
                onChange={e =>
                  onUpdate(field.id, { fontFamily: e.target.value })
                }
                className="w-full h-8 pl-2 pr-7 text-xs rounded-lg
                           border border-slate-200 bg-white
                           dark:bg-slate-800 dark:border-slate-700
                           appearance-none cursor-pointer
                           focus:outline-none focus:border-[#28ABDF]"
              >
                {FONT_FAMILIES.map(f => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2
                                      w-3.5 h-3.5 text-slate-400
                                      pointer-events-none" />
            </div>
          </div>

          {/* Font Size + Bold row */}
          <div className="flex gap-2">
            {/* Font Size */}
            <div className="space-y-1 flex-1">
              <label className="text-[10px] text-slate-500
                                 font-semibold uppercase tracking-wide">
                Size
              </label>
              <div className="relative">
                <select
                  value={field.fontSize || 14}
                  onChange={e =>
                    onUpdate(field.id, {
                      fontSize: Number(e.target.value),
                    })
                  }
                  className="w-full h-8 pl-2 pr-7 text-xs rounded-lg
                             border border-slate-200 bg-white
                             dark:bg-slate-800 dark:border-slate-700
                             appearance-none cursor-pointer
                             focus:outline-none focus:border-[#28ABDF]"
                >
                  {FONT_SIZES.map(s => (
                    <option key={s} value={s}>{s}pt</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2
                                        w-3.5 h-3.5 text-slate-400
                                        pointer-events-none" />
              </div>
            </div>

            {/* Bold Toggle */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500
                                 font-semibold uppercase tracking-wide">
                Style
              </label>
              <button
                onClick={() =>
                  onUpdate(field.id, {
                    fontWeight:
                      field.fontWeight === 'bold'
                        ? 'normal'
                        : 'bold',
                  })
                }
                className={`h-8 w-10 rounded-lg border text-xs
                            font-bold transition-colors
                            flex items-center justify-center
                            ${field.fontWeight === 'bold'
                              ? 'bg-[#28ABDF] border-[#28ABDF] text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-[#28ABDF]'
                            }`}
                title="Toggle Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Placeholder text */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500
                               font-semibold uppercase tracking-wide">
              Placeholder
            </label>
            <Input
              value={field.placeholder || ''}
              onChange={e =>
                onUpdate(field.id, { placeholder: e.target.value })
              }
              placeholder="Enter placeholder..."
              className="h-8 text-xs rounded-lg"
            />
          </div>
        </>
      )}

      {/* Preview */}
      <div className="text-[10px] text-slate-400 pt-1
                      flex items-center gap-2 flex-wrap">
        <span className="bg-slate-100 dark:bg-slate-700
                         px-2 py-0.5 rounded-md">
          {field.type === 'signature' ? '✍️ Signature' : '📝 Text'}
        </span>
        <span className="bg-slate-100 dark:bg-slate-700
                         px-2 py-0.5 rounded-md">
          Page {field.page}
        </span>
        {field.type === 'text' && (
          <>
            <span className="bg-slate-100 dark:bg-slate-700
                             px-2 py-0.5 rounded-md">
              {field.fontFamily || 'Helvetica'}
            </span>
            <span className="bg-slate-100 dark:bg-slate-700
                             px-2 py-0.5 rounded-md">
              {field.fontSize || 14}pt
            </span>
            {field.fontWeight === 'bold' && (
              <span className="bg-[#28ABDF]/10 text-[#28ABDF]
                               px-2 py-0.5 rounded-md font-bold">
                Bold
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DOCUMENT EDITOR
// ════════════════════════════════════════════════════════════════
export default function DocumentEditor() {
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();
  const { user }              = useAuth();

  const docId = searchParams.get('id');
  const isNew = !docId || docId === 'new';

  // ── Core state ──────────────────────────────────────────────
  const [existingDoc,     setExistingDoc]     = useState(null);
  const [loadingDoc,      setLoadingDoc]      = useState(!isNew);
  const [rawFile,         setRawFile]         = useState(null);
  const [fileUrl,         setFileUrl]         = useState('');
  const [fileReady,       setFileReady]       = useState(false);
  const [title,           setTitle]           = useState('');
  const [companyName,     setCompanyName]     = useState('');
  const [companyLogo,     setCompanyLogo]     = useState('');
  const [parties,         setParties]         = useState([EMPTY_PARTY(0)]);
  const [ccList,          setCcList]          = useState([]);

  // ── CC form state ────────────────────────────────────────────
  const [ccForm,          setCcForm]          = useState(EMPTY_CC());

  const [fields,          setFields]          = useState([]);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [totalPages,      setTotalPages]      = useState(1);
  const [selectedParty,   setSelectedParty]   = useState(0);
  const [pendingType,     setPendingType]      = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [sending,         setSending]         = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState(0);
  const [resending,       setResending]       = useState(false);

  // CC panel expand state
  const [ccExpanded,      setCcExpanded]      = useState(false);

  const isMounted = useRef(true);
  useEffect(() => () => { isMounted.current = false; }, []);

  // ── Derived: selected field object ──────────────────────────
  const selectedField = fields.find(f => f.id === selectedFieldId) ?? null;

  // ════════════════════════════════════════════════════════════
  // LOAD EXISTING DOCUMENT
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isNew) return;

    const load = async () => {
      setLoadingDoc(true);
      try {
        const res = await api.get(`/documents/${docId}`, { noCache: true });
        const doc = res.data?.document;
        if (!doc || !isMounted.current) return;

        setExistingDoc(doc);
        setTitle(doc.title          || '');
        setCompanyName(doc.companyName || '');
        setCompanyLogo(doc.companyLogo || '');
        setCcList(doc.ccList         || []);
        setTotalPages(doc.totalPages  || 1);

        if (doc.parties?.length) {
          setParties(
            doc.parties.map((p, i) => ({
              name:        p.name        || '',
              email:       p.email       || '',
              designation: p.designation || '',  // ✅
              color:       p.color || COLORS[i % COLORS.length],
              status:      p.status,
            }))
          );
        }

        if (doc.fields?.length) {
          const parsed = doc.fields.map(f =>
            typeof f === 'string' ? JSON.parse(f) : f
          );
          setFields(parsed);
        }

        if (doc.fileUrl) {
          setFileUrl(buildProxyUrl(doc.fileUrl));
          setFileReady(true);
        }
      } catch (err) {
        toast.error('Failed to load document.');
        navigate('/dashboard');
      } finally {
        if (isMounted.current) setLoadingDoc(false);
      }
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  // ════════════════════════════════════════════════════════════
  // FILE HANDLERS
  // ════════════════════════════════════════════════════════════
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20MB.');
      return;
    }

    if (fileUrl?.startsWith('blob:')) URL.revokeObjectURL(fileUrl);

    setRawFile(file);
    setFileUrl(URL.createObjectURL(file));
    setFileReady(true);
    setFields([]);
    setCurrentPage(1);
    setTitle(prev => prev || file.name.replace(/\.pdf$/i, ''));
    toast.success('PDF loaded!');
    e.target.value = '';
  }, [fileUrl]);

  const handleLogoSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files allowed.');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await api.post('/documents/upload-logo', fd);
      if (res.data?.logoUrl) {
        setCompanyLogo(res.data.logoUrl);
        toast.success('Logo uploaded!');
      }
    } catch {
      toast.error('Logo upload failed.');
    }
    e.target.value = '';
  }, []);

  // ════════════════════════════════════════════════════════════
  // PARTY HELPERS
  // ════════════════════════════════════════════════════════════
  const addParty = () => {
    if (parties.length >= 4) {
      toast.error('Maximum 4 parties allowed.');
      return;
    }
    setParties(p => [...p, EMPTY_PARTY(p.length)]);
  };

  const removeParty = (i) => {
    if (parties.length <= 1) return;
    setParties(p => p.filter((_, idx) => idx !== i));
    setFields(f =>
      f
        .filter(field => Number(field.partyIndex) !== i)
        .map(field => ({
          ...field,
          partyIndex: field.partyIndex > i
            ? field.partyIndex - 1
            : field.partyIndex,
        }))
    );
    if (selectedParty >= i && selectedParty > 0) {
      setSelectedParty(s => s - 1);
    }
  };

  const updateParty = (i, key, val) =>
    setParties(p =>
      p.map((party, idx) =>
        idx === i ? { ...party, [key]: val } : party
      )
    );

  // ════════════════════════════════════════════════════════════
  // CC HELPERS
  // ════════════════════════════════════════════════════════════
  const addCc = () => {
    const email = ccForm.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email address.');
      return;
    }
    if (ccList.some(r => r.email === email)) {
      toast.error('Email already added.');
      return;
    }
    setCcList(p => [
      ...p,
      {
        email,
        name:        ccForm.name.trim(),
        designation: ccForm.designation.trim(), // ✅
      },
    ]);
    setCcForm(EMPTY_CC());
  };

  const removeCc = (email) =>
    setCcList(p => p.filter(x => x.email !== email));

  // ════════════════════════════════════════════════════════════
  // FIELD UPDATE — font/size/bold/placeholder
  // ════════════════════════════════════════════════════════════
  const updateField = useCallback((fieldId, updates) => {
    setFields(prev =>
      prev.map(f =>
        f.id === fieldId ? { ...f, ...updates } : f
      )
    );
  }, []);

  const deleteField = useCallback((fieldId) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    setSelectedFieldId(null);
  }, []);

  // ════════════════════════════════════════════════════════════
  // RESEND
  // ════════════════════════════════════════════════════════════
  const handleResend = async () => {
    if (!docId || isNew || resending) return;
    setResending(true);
    try {
      await api.post(`/documents/resend/${docId}`);
      toast.success('Signing email resent!');
    } catch (err) {
      toast.error(err?.message || 'Failed to resend email.');
    } finally {
      setResending(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // SEND / UPLOAD
  // ════════════════════════════════════════════════════════════
  const handleSend = async () => {
    // Validation
    if (!rawFile && isNew) {
      toast.error('Please upload a PDF file.');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a document title.');
      return;
    }
    if (parties.some(p => !p.name.trim() || !p.email.trim())) {
      toast.error('All parties need a name and email.');
      return;
    }
    // Email format validation
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const p of parties) {
      if (!emailRx.test(p.email)) {
        toast.error(`Invalid email: ${p.email}`);
        return;
      }
    }
    if (fields.length === 0) {
      toast.error('Please place at least one field.');
      return;
    }

    setSending(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      formData.append('title',       title.trim());
      formData.append('companyName', companyName.trim());
      formData.append('companyLogo', companyLogo || '');
      formData.append('totalPages',  String(totalPages));

      // ✅ designation included
      formData.append(
        'parties',
        JSON.stringify(
          parties.map((p, i) => ({
            name:        p.name.trim(),
            email:       p.email.trim().toLowerCase(),
            designation: p.designation?.trim() || '',
            color:       p.color || COLORS[i % COLORS.length],
          }))
        )
      );

      // ✅ fields with font properties
      formData.append('fields', JSON.stringify(
        fields.map(f => ({
          id:          f.id,
          type:        f.type,
          page:        f.page,
          x:           f.x,
          y:           f.y,
          width:       f.width,
          height:      f.height,
          partyIndex:  f.partyIndex,
          value:       f.value || '',
          fontFamily:  f.fontFamily  || 'Helvetica',
          fontSize:    f.fontSize    || 14,
          fontWeight:  f.fontWeight  || 'normal',
          placeholder: f.placeholder || '',
        }))
      ));

      // ✅ CC with designation
      formData.append(
        'ccRecipients',
        JSON.stringify(
          ccList.map(c => ({
            email:       c.email,
            name:        c.name        || '',
            designation: c.designation || '',
          }))
        )
      );

      if (rawFile) {
        formData.append('file', rawFile);
      } else if (existingDoc?.fileUrl) {
        formData.append('fileUrl', existingDoc.fileUrl);
      }

      const res = await api.post('/documents/upload-and-send', formData, {
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1)));
        },
        timeout: 60_000,
      });

      if (res.data?.success) {
        toast.success('Document sent successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        'Upload failed. Please try again.'
      );
    } finally {
      if (isMounted.current) {
        setSending(false);
        setUploadProgress(0);
      }
    }
  };

  // ════════════════════════════════════════════════════════════
  // LOADING STATE
  // ════════════════════════════════════════════════════════════
  if (loadingDoc) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#28ABDF]" />
          <p className="text-slate-500 font-medium">Loading document...</p>
        </div>
      </div>
    );
  }

  const isCompleted = existingDoc?.status === 'completed';
  const isViewOnly  = isCompleted;

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950
                    flex flex-col">

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900
                         border-b border-slate-200 dark:border-slate-700
                         px-4 py-3 flex items-center
                         justify-between gap-3 shadow-sm">

        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost" size="icon"
            onClick={() => navigate('/dashboard')}
            className="rounded-xl shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            {isViewOnly ? (
              <h1 className="font-bold text-slate-800
                             dark:text-white truncate max-w-xs">
                {title}
              </h1>
            ) : (
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Document Title..."
                className="h-9 rounded-xl border-slate-200
                           font-semibold max-w-[200px] sm:max-w-xs
                           focus:border-[#28ABDF]"
              />
            )}
            {existingDoc && <StatusBadge status={existingDoc.status} />}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Upload progress bar */}
          {sending && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 bg-slate-200
                              rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#28ABDF] rounded-full
                             transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">
                {uploadProgress}%
              </span>
            </div>
          )}

          {/* Resend */}
          {!isNew && existingDoc?.status === 'in_progress' && (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resending}
              className="rounded-xl gap-2 h-9 font-semibold
                         border-amber-300 text-amber-600
                         hover:bg-amber-50 text-sm"
            >
              {resending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />
              }
              <span className="hidden sm:inline">Resend Email</span>
            </Button>
          )}

          {/* View signed PDF */}
          {isCompleted && existingDoc?.signedFileUrl && (
            <Button
              onClick={() =>
                window.open(
                  buildProxyUrl(existingDoc.signedFileUrl),
                  '_blank', 'noopener,noreferrer'
                )
              }
              className="bg-emerald-500 hover:bg-emerald-600
                         text-white rounded-xl gap-2 h-9 font-semibold"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View Signed PDF</span>
            </Button>
          )}

          {/* Send */}
          {!isCompleted && (
            <Button
              onClick={handleSend}
              disabled={sending}
              className="bg-[#28ABDF] hover:bg-[#2399c8]
                         text-white rounded-xl gap-2 px-5 h-9
                         font-semibold"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isNew ? 'Send Document' : 'Resend'}
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ────────────────────────────────────────── */}
        <aside className="w-72 xl:w-80 shrink-0 border-r
                          border-slate-200 dark:border-slate-700
                          bg-white dark:bg-slate-900
                          overflow-y-auto p-4 flex flex-col gap-4">

          {/* ── PDF Upload ───────────────────────────────────── */}
          {isNew ? (
            <Card className="p-4 rounded-2xl border-slate-100
                             dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-500
                            uppercase tracking-wider mb-3">
                Document PDF
              </p>
              <label className="flex flex-col items-center gap-2
                                cursor-pointer border-2 border-dashed
                                border-slate-200 rounded-xl p-4
                                hover:border-[#28ABDF] transition-colors">
                {fileReady ? (
                  <>
                    <FileText className="w-8 h-8 text-[#28ABDF]" />
                    <p className="text-xs font-semibold text-[#28ABDF]">
                      PDF Loaded ✓
                    </p>
                    <p className="text-[10px] text-slate-400
                                  truncate max-w-[180px]">
                      {rawFile?.name}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300" />
                    <p className="text-xs text-slate-400">
                      Click to upload PDF
                    </p>
                    <p className="text-[10px] text-slate-400">Max 20MB</p>
                  </>
                )}
                <input
                  type="file" accept="application/pdf"
                  className="hidden" onChange={handleFileSelect}
                />
              </label>
            </Card>
          ) : (
            <Card className="p-4 rounded-2xl border-slate-100
                             dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-500
                            uppercase tracking-wider mb-2">
                Document
              </p>
              <div className="flex items-center gap-3 bg-sky-50
                              dark:bg-sky-900/20 rounded-xl p-3">
                <FileText className="w-5 h-5 text-sky-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800
                                dark:text-slate-200 truncate">
                    {title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {existingDoc?.totalPages || 1} page(s)
                  </p>
                </div>
              </div>
              {!isCompleted && (
                <label className="flex items-center gap-2 cursor-pointer
                                  mt-2 border border-dashed border-slate-200
                                  rounded-xl p-2 hover:border-[#28ABDF]
                                  transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400">
                    {rawFile ? '✓ New PDF selected' : 'Replace PDF'}
                  </span>
                  <input
                    type="file" accept="application/pdf"
                    className="hidden" onChange={handleFileSelect}
                  />
                </label>
              )}
            </Card>
          )}

          {/* ── Company Info ─────────────────────────────────── */}
          <Card className="p-4 rounded-2xl border-slate-100
                           dark:border-slate-800">
            <p className="text-[11px] font-bold text-slate-500
                          uppercase tracking-wider mb-3">
              Company Info
            </p>
            <div className="space-y-2">
              <Input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Company Name"
                className="h-9 rounded-xl text-sm"
                disabled={isViewOnly}
              />
              <label className={`flex items-center gap-2 border
                                 border-dashed border-slate-200
                                 rounded-xl p-2 transition-colors
                                 ${isViewOnly
                                   ? 'opacity-50 cursor-not-allowed'
                                   : 'cursor-pointer hover:border-[#28ABDF]'
                                 }`}>
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {companyLogo ? '✓ Logo uploaded' : 'Upload Logo'}
                </span>
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={handleLogoSelect} disabled={isViewOnly}
                />
              </label>
            </div>
          </Card>

          {/* ── Signers ──────────────────────────────────────── */}
          <Card className="p-4 rounded-2xl border-slate-100
                           dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-500
                            uppercase tracking-wider">
                Signers
              </p>
              {!isViewOnly && (
                <Button
                  size="sm" variant="outline"
                  onClick={addParty}
                  className="h-7 px-2 rounded-lg text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {parties.map((party, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border-2 space-y-2
                              cursor-pointer transition-all
                              ${selectedParty === i
                                ? 'ring-2 ring-offset-1'
                                : ''
                              }`}
                  style={{
                    borderColor:   party.color + '40',
                    // eslint-disable-next-line no-extra-parens
                    '--tw-ring-color': party.color,
                  }}
                  onClick={() => !isViewOnly && setSelectedParty(i)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: party.color }}
                      />
                      <span className="text-xs font-bold
                                       text-slate-600 dark:text-slate-400">
                        Party {i + 1}
                      </span>
                      {party.status === 'signed' && (
                        <span className="inline-flex items-center
                                         gap-1 text-[10px]
                                         text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Signed
                        </span>
                      )}
                    </div>
                    {!isViewOnly && parties.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeParty(i);
                        }}
                        className="text-slate-300 hover:text-red-500
                                   transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <Input
                    value={party.name}
                    onChange={e => updateParty(i, 'name', e.target.value)}
                    placeholder="Full Name"
                    className="h-8 text-xs rounded-lg"
                    disabled={isViewOnly || party.status === 'signed'}
                    onClick={e => e.stopPropagation()}
                  />
                  <Input
                    value={party.email}
                    onChange={e => updateParty(i, 'email', e.target.value)}
                    placeholder="Email Address"
                    type="email"
                    className="h-8 text-xs rounded-lg"
                    disabled={isViewOnly || party.status === 'signed'}
                    onClick={e => e.stopPropagation()}
                  />
                  {/* ✅ Designation field */}
                  <Input
                    value={party.designation || ''}
                    onChange={e =>
                      updateParty(i, 'designation', e.target.value)
                    }
                    placeholder="Designation (optional)"
                    className="h-8 text-xs rounded-lg"
                    disabled={isViewOnly || party.status === 'signed'}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* ── CC Recipients ─────────────────────────────────── */}
          <Card className="p-4 rounded-2xl border-slate-100
                           dark:border-slate-800">
            <button
              onClick={() => setCcExpanded(e => !e)}
              className="w-full flex items-center
                         justify-between mb-2"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#28ABDF]" />
                <p className="text-[11px] font-bold text-slate-500
                              uppercase tracking-wider">
                  CC Recipients
                  {ccList.length > 0 && (
                    <span className="ml-1.5 bg-[#28ABDF] text-white
                                     text-[9px] font-bold
                                     px-1.5 py-0.5 rounded-full">
                      {ccList.length}
                    </span>
                  )}
                </p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400
                             transition-transform
                             ${ccExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {ccExpanded && (
              <div className="space-y-3 mt-2">
                {/* ✅ CC form: email + name + designation */}
                {!isViewOnly && (
                  <div className="space-y-2 p-3 bg-slate-50
                                  dark:bg-slate-800/50 rounded-xl
                                  border border-slate-100
                                  dark:border-slate-700">
                    <Input
                      value={ccForm.email}
                      onChange={e =>
                        setCcForm(p => ({ ...p, email: e.target.value }))
                      }
                      onKeyDown={e =>
                        e.key === 'Enter' &&
                        (e.preventDefault(), addCc())
                      }
                      placeholder="Email Address *"
                      type="email"
                      className="h-8 text-xs rounded-lg"
                    />
                    <Input
                      value={ccForm.name}
                      onChange={e =>
                        setCcForm(p => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Name (optional)"
                      className="h-8 text-xs rounded-lg"
                    />
                    {/* ✅ Designation */}
                    <Input
                      value={ccForm.designation}
                      onChange={e =>
                        setCcForm(p => ({
                          ...p, designation: e.target.value,
                        }))
                      }
                      placeholder="Designation (optional)"
                      className="h-8 text-xs rounded-lg"
                    />
                    <Button
                      size="sm"
                      onClick={addCc}
                      className="w-full h-8 bg-[#28ABDF]
                                 text-white rounded-lg text-xs
                                 font-semibold"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add CC
                    </Button>
                  </div>
                )}

                {/* CC list */}
                {ccList.length > 0 ? (
                  <div className="space-y-1.5">
                    {ccList.map(r => (
                      <div
                        key={r.email}
                        className="flex items-start justify-between
                                   bg-sky-50 border border-sky-100
                                   rounded-xl px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] text-sky-700
                                        font-medium truncate">
                            {r.email}
                          </p>
                          {r.name && (
                            <p className="text-[10px] text-slate-500
                                          truncate">
                              {r.name}
                            </p>
                          )}
                          {/* ✅ Designation shown */}
                          {r.designation && (
                            <p className="text-[10px] text-slate-400
                                          truncate">
                              🏷️ {r.designation}
                            </p>
                          )}
                        </div>
                        {!isViewOnly && (
                          <button
                            onClick={() => removeCc(r.email)}
                            className="text-slate-300
                                       hover:text-red-500 ml-2 mt-0.5
                                       shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic
                                text-center py-1">
                    No CC recipients added.
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* ── Field Toolbar ──────────────────────────────────── */}
          {fileReady && !isCompleted && (
            <Card className="p-4 rounded-2xl border-slate-100
                             dark:border-slate-800">
              <FieldToolbar
                parties={parties.map((p, i) => ({
                  name:  p.name  || `Party ${i + 1}`,
                  color: p.color,
                  index: i,
                }))}
                selectedPartyIndex={selectedParty}
                onPartySelect={setSelectedParty}
                onAddField={type => setPendingType(type)}
                pendingFieldType={pendingType}
              />
            </Card>
          )}

          {/* ✅ Field Properties Panel — shows when field selected */}
          {selectedField && !isViewOnly && (
            <FieldPropertiesPanel
              field={selectedField}
              onUpdate={updateField}
              onDelete={() => deleteField(selectedField.id)}
            />
          )}

          {/* ── Field Summary ─────────────────────────────────── */}
          {fields.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/50
                            rounded-xl p-3 border border-slate-100
                            dark:border-slate-800 text-xs">
              <p className="font-bold text-slate-500 uppercase
                            tracking-wide mb-2">
                {fields.length} field{fields.length !== 1 ? 's' : ''} placed
              </p>
              {parties.map((p, i) => {
                const count = fields.filter(
                  f => Number(f.partyIndex) === i
                ).length;
                return count > 0 ? (
                  <div key={i}
                       className="flex items-center justify-between
                                  py-0.5">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-slate-500 truncate max-w-[120px]">
                        {p.name || `Party ${i + 1}`}
                      </span>
                    </div>
                    <span className="font-bold"
                          style={{ color: p.color }}>
                      {count}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </aside>

        {/* ── PDF Viewer ────────────────────────────────────────── */}
        <main className="flex-1 bg-slate-100 dark:bg-slate-950
                         overflow-hidden min-h-0">
          {fileReady ? (
            <PdfViewer
              fileUrl={fileUrl}
              fields={fields}
              onFieldsChange={isViewOnly ? undefined : setFields}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onTotalPagesChange={setTotalPages}
              pendingFieldType={isViewOnly ? null : pendingType}
              selectedPartyIndex={selectedParty}
              parties={parties.map((p, i) => ({
                name:  p.name  || `Party ${i + 1}`,
                color: p.color,
                index: i,
              }))}
              onFieldPlaced={isViewOnly ? undefined : () => setPendingType(null)}
              selectedFieldId={selectedFieldId}
              onFieldSelect={isViewOnly ? undefined : setSelectedFieldId}
              readOnly={isViewOnly}
            />
          ) : (
            <div className="h-full flex flex-col items-center
                            justify-center text-slate-300
                            px-8 text-center gap-4">
              <FileText className="w-16 h-16 opacity-20" />
              <div>
                <p className="font-semibold text-slate-400 text-lg">
                  {isNew ? 'Upload a PDF to start' : 'Loading document...'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {isNew
                    ? 'Then place signature & text fields for each party'
                    : 'Please wait...'
                  }
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}