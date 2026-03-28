
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/Card';
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
  useState, useEffect, useCallback,
  useRef, useMemo,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, apiCache } from '@/api/apiClient';
import { useAuth }   from '@/lib/AuthContext';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Label }     from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Upload, Send, ArrowLeft, FileText,
  Loader2, Mail, X, ImagePlus, Type,
  CheckCircle2, AlertCircle, Users,
} from 'lucide-react';
import PartyManager from '@/components/editor/PartyManager';
import FieldToolbar from '@/components/editor/FieldToolbar';
import PdfViewer    from '@/components/editor/PdfViewer';

// ── Constants ─────────────────────────────────────────────────────
const FONT_FAMILIES = [
  { label: 'Helvetica',       value: 'Helvetica'       },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier',         value: 'Courier'         },
];
const FONT_SIZES    = [10, 11, 12, 13, 14, 16, 18, 20, 24];
const MAX_PDF_MB    = 15;
const EMAIL_RE      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Section Card ──────────────────────────────────────────────────
function SideCard({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-900
                     border border-slate-100 dark:border-slate-800
                     rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function SideLabel({ children }) {
  return (
    <p className="text-[10px] font-bold text-slate-400
                  uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export default function DocumentEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ── Parse docId from URL ──────────────────────────────────
  const docId = useMemo(() => {
    const id = new URLSearchParams(location.search).get('id');
    return id === 'new' ? null : id;
  }, [location.search]);

  // ── Core state ────────────────────────────────────────────
  const [rawFile,             setRawFile]             = useState(null);
  const [title,               setTitle]               = useState('');
  const [fileUrl,             setFileUrl]             = useState('');
  const [fileReady,           setFileReady]           = useState(false);
  const [parties,             setParties]             = useState([]);
  const [fields,              setFields]              = useState([]);
  const [ccList,              setCcList]              = useState([]);
  const [companyLogo,         setCompanyLogo]         = useState('');
  const [companyLogoFile,     setCompanyLogoFile]     = useState(null);
  const [companyLogoPreview,  setCompanyLogoPreview]  = useState('');
  const [companyName,         setCompanyName]         = useState('');

  // ── Editor state ──────────────────────────────────────────
  const [currentPage,        setCurrentPage]        = useState(1);
  const [totalPages,         setTotalPages]         = useState(1);
  const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
  const [pendingFieldType,   setPendingFieldType]   = useState(null);
  const [selectedFieldId,    setSelectedFieldId]    = useState(null);
  const [processing,         setProcessing]         = useState(false);
  const [docLoading,         setDocLoading]         = useState(false);

  // ── CC state ──────────────────────────────────────────────
  const [ccEmail,       setCcEmail]       = useState('');
  const [ccName,        setCcName]        = useState('');
  const [ccDesignation, setCcDesignation] = useState('');

  const blobUrlRef = useRef(null);

  // ── Cleanup blob URL on unmount ───────────────────────────
  useEffect(() => {
    return () => {
      if (blobUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  // ── Selected field ────────────────────────────────────────
  const selectedField = useMemo(
    () => fields.find(f => f.id === selectedFieldId),
    [fields, selectedFieldId]
  );

  // ── Load existing doc ─────────────────────────────────────
  useEffect(() => {
    if (!docId) return;
    setDocLoading(true);
    api.get(`/documents/${docId}`)
      .then(res => {
        const d = res.data?.document || res.data;
        setTitle(d.title             || '');
        setFileUrl(d.fileUrl         || '');
        setFileReady(true);
        setParties(d.parties         || []);
        setCcList(d.ccList           || []);
        setCompanyLogo(d.companyLogo || '');
        setCompanyLogoPreview(d.companyLogo || '');
        setCompanyName(d.companyName || '');
        setFields(
          (d.fields || []).map(f =>
            typeof f === 'string' ? JSON.parse(f) : f
          )
        );
      })
      .catch(() => toast.error('Failed to load document.'))
      .finally(() => setDocLoading(false));
  }, [docId]);

  // ── File select ───────────────────────────────────────────
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      toast.error(`PDF must be under ${MAX_PDF_MB}MB.`);
      return;
    }

    // Revoke old blob
    if (blobUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;

    setRawFile(file);
    setTitle(prev => prev || file.name.replace(/\.pdf$/i, ''));
    setFileUrl(url);
    setFileReady(true);
    setFields([]);
    setCurrentPage(1);
    setSelectedFieldId(null);
    toast.success('PDF loaded! Place signature fields.');
    e.target.value = '';
  }, []);

  // ── Logo select ───────────────────────────────────────────
  const handleLogoSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.');
      return;
    }
    setCompanyLogoFile(file);
    setCompanyLogoPreview(URL.createObjectURL(file));
    e.target.value = '';
  }, []);

  const removeLogo = useCallback(() => {
    setCompanyLogoPreview('');
    setCompanyLogoFile(null);
    setCompanyLogo('');
  }, []);

  // ── CC helpers ────────────────────────────────────────────
  const addCc = useCallback(() => {
    const email = ccEmail.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      toast.error('Invalid email address.');
      return;
    }
    if (ccList.some(r => r.email === email)) {
      toast.error('Already added.');
      return;
    }
    setCcList(prev => [...prev, {
      email,
      name:        ccName.trim(),
      designation: ccDesignation.trim(),
    }]);
    setCcEmail('');
    setCcName('');
    setCcDesignation('');
  }, [ccEmail, ccName, ccDesignation, ccList]);

  const removeCc = useCallback((email) => {
    setCcList(prev => prev.filter(r => r.email !== email));
  }, []);

  // ── Typography update ─────────────────────────────────────
  const updateFieldTypography = useCallback((key, value) => {
    if (!selectedFieldId) return;
    setFields(prev =>
      prev.map(f =>
        f.id === selectedFieldId ? { ...f, [key]: value } : f
      )
    );
  }, [selectedFieldId]);

  // ── Fields per party summary ──────────────────────────────
  const fieldSummary = useMemo(() =>
    parties.map((p, i) => ({
      ...p,
      count: fields.filter(f => Number(f.partyIndex) === i).length,
    }))
  , [parties, fields]);

  const allPartiesHaveFields = useMemo(() =>
    parties.length > 0 &&
    parties.every((_, i) =>
      fields.some(f => Number(f.partyIndex) === i)
    )
  , [parties, fields]);

  // ── Validation ────────────────────────────────────────────
  const validate = useCallback(() => {
    if (!rawFile && !fileUrl) {
      toast.error('Please upload a PDF.');
      return false;
    }
    if (!title.trim()) {
      toast.error('Please enter a document title.');
      return false;
    }
    if (!parties.length) {
      toast.error('Please add at least one signer.');
      return false;
    }
    if (parties.some(p => !p.name?.trim() || !p.email?.trim())) {
      toast.error('All signers need a name and email.');
      return false;
    }
    if (parties.some(p => !EMAIL_RE.test(p.email))) {
      toast.error('One or more signer emails are invalid.');
      return false;
    }
    if (!fields.length) {
      toast.error('Please place at least one field.');
      return false;
    }
    if (!allPartiesHaveFields) {
      const missing = parties.find((_, i) =>
        !fields.some(f => Number(f.partyIndex) === i)
      );
      toast.error(`Add a field for "${missing?.name}".`);
      return false;
    }
    return true;
  }, [rawFile, fileUrl, title, parties, fields, allPartiesHaveFields]);

  // ── Send ──────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!validate()) return;
    setProcessing(true);

    try {
      const formData = new FormData();

      if (rawFile instanceof File) {
        formData.append('file', rawFile);
      }
      formData.append('title',        title.trim());
      formData.append('parties',      JSON.stringify(
        parties.map(p => ({
          name:  p.name.trim(),
          email: p.email.trim().toLowerCase(),
          color: p.color,
        }))
      ));
      formData.append('ccRecipients', JSON.stringify(ccList));
      formData.append('fields',       JSON.stringify(fields));
      formData.append('totalPages',   String(totalPages));
      formData.append('companyName',  companyName.trim());

      // Upload logo first if new file
      if (companyLogoFile instanceof File) {
        try {
          const logoForm = new FormData();
          logoForm.append('logo', companyLogoFile);
          const logoRes = await api.post(
            '/documents/upload-logo', logoForm
          );
          if (logoRes.data?.logoUrl) {
            formData.append('companyLogo', logoRes.data.logoUrl);
          }
        } catch {
          toast.error('Logo upload failed — continuing without it.');
        }
      } else if (companyLogo) {
        formData.append('companyLogo', companyLogo);
      }

      // ✅ Optimistic navigation
      navigate('/dashboard');
      toast.success('🎉 Sending document in the background!');

      // Invalidate cache — dashboard will refetch
      apiCache.invalidate('/documents');

      // ✅ Background API call
      api.post('/documents/upload-and-send', formData)
        .then(res => {
          if (!res.data?.success) {
            toast.error(res.data?.message || 'Send failed.');
          }
        })
        .catch(err => {
          toast.error(
            err.response?.data?.message ||
            err.message ||
            'Failed to send document.'
          );
        });

    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
      setProcessing(false);
    }
  }, [
    validate, rawFile, title, parties, ccList,
    fields, totalPages, companyName, companyLogoFile,
    companyLogo, navigate,
  ]);

  // ── Keyboard shortcut — Ctrl+Enter to send ────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSend]);

  if (docLoading) {
    return (
      <div className="h-screen flex items-center justify-center
                      bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500
                              mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">
            Loading document...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950
                    flex flex-col">

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40
                         bg-white dark:bg-slate-900
                         border-b border-slate-200 dark:border-slate-700
                         shadow-sm shrink-0">
        <div className="flex items-center justify-between
                        gap-3 px-4 py-3">
          {/* Back + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button
              variant="ghost" size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-xl shrink-0 w-9 h-9"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Document Title..."
              maxLength={100}
              className="h-9 rounded-xl border-slate-200
                         dark:border-slate-600 font-semibold
                         text-slate-800 dark:text-white
                         max-w-xs focus:border-sky-400
                         focus:ring-sky-400"
            />
          </div>

          {/* Status + Send */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Field coverage indicator */}
            {parties.length > 0 && fields.length > 0 && (
              <div className={`hidden sm:flex items-center gap-1.5
                               text-xs font-semibold px-2.5 py-1
                               rounded-full
                               ${allPartiesHaveFields
                                 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                 : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                               }`}>
                {allPartiesHaveFields
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <AlertCircle  className="w-3.5 h-3.5" />
                }
                {allPartiesHaveFields ? 'Ready' : 'Missing fields'}
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={processing}
              className="bg-sky-500 hover:bg-sky-600
                         active:bg-sky-700 text-white
                         rounded-xl gap-2 px-5 h-9
                         font-semibold shadow-lg
                         shadow-sky-500/25
                         transition-all active:scale-95
                         disabled:opacity-70 shrink-0"
              title="Send (Ctrl+Enter)"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left Sidebar ──────────────────────────────────── */}
        <aside className="w-72 xl:w-80 shrink-0
                           border-r border-slate-200 dark:border-slate-700
                           bg-slate-50 dark:bg-slate-950
                           overflow-y-auto flex flex-col gap-3 p-3
                           scrollbar-thin scrollbar-thumb-slate-200
                           dark:scrollbar-thumb-slate-700">

          {/* ── Company Branding ───────────────────────────── */}
          <SideCard>
            <SideLabel>Company Branding</SideLabel>

            {/* Logo */}
            <div className="mb-3">
              <Label className="text-xs text-slate-500 mb-1.5 block">
                Logo
              </Label>
              {companyLogoPreview ? (
                <div className="relative inline-flex">
                  <img
                    src={companyLogoPreview}
                    alt="Logo"
                    className="h-10 max-w-[140px] object-contain
                               rounded-lg border border-slate-200
                               dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-1.5 -right-1.5
                               w-5 h-5 bg-red-500 text-white
                               rounded-full flex items-center
                               justify-center shadow-md
                               hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2
                                  cursor-pointer border-2 border-dashed
                                  border-slate-200 dark:border-slate-700
                                  rounded-xl p-3 hover:border-sky-400
                                  transition-colors group">
                  <ImagePlus className="w-4 h-4 text-slate-300
                                        group-hover:text-sky-400
                                        transition-colors" />
                  <span className="text-xs text-slate-400
                                   group-hover:text-slate-500">
                    Upload logo (PNG/JPG)
                  </span>
                  <input
                    type="file" accept="image/*"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />
                </label>
              )}
            </div>

            {/* Company Name */}
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">
                Company Name
              </Label>
              <Input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Your Company"
                className="h-9 rounded-xl text-sm
                           border-slate-200 dark:border-slate-600
                           focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
          </SideCard>

          {/* ── PDF Upload ────────────────────────────────── */}
          <SideCard>
            <SideLabel>Document</SideLabel>
            <label className="flex flex-col items-center gap-2
                              cursor-pointer border-2 border-dashed
                              border-slate-200 dark:border-slate-700
                              rounded-xl p-4 hover:border-sky-400
                              transition-colors group">
              {fileReady ? (
                <>
                  <div className="w-10 h-10 bg-sky-50 dark:bg-sky-900/20
                                  rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-sky-500" />
                  </div>
                  <p className="text-xs font-bold text-sky-500">
                    PDF Loaded ✓
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Click to replace
                  </p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800
                                  rounded-xl flex items-center justify-center
                                  group-hover:bg-sky-50 dark:group-hover:bg-sky-900/20
                                  transition-colors">
                    <Upload className="w-5 h-5 text-slate-300
                                       group-hover:text-sky-400
                                       transition-colors" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400
                                group-hover:text-slate-500">
                    Upload PDF
                  </p>
                  <p className="text-[10px] text-slate-300">
                    Max {MAX_PDF_MB}MB
                  </p>
                </>
              )}
              <input
                type="file" accept="application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </SideCard>

          {/* ── Parties ───────────────────────────────────── */}
          <SideCard>
            <PartyManager
              parties={parties}
              onChange={setParties}
            />
          </SideCard>

          {/* ── CC Recipients ─────────────────────────────── */}
          <SideCard>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-sky-500" />
              <SideLabel>CC Recipients</SideLabel>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Email *"
                value={ccEmail}
                onChange={e => setCcEmail(e.target.value)}
                onKeyDown={e =>
                  e.key === 'Enter' &&
                  (e.preventDefault(), addCc())
                }
                className="h-9 text-xs rounded-xl
                           border-slate-200 dark:border-slate-600
                           focus:border-sky-400"
              />
              <Input
                placeholder="Name"
                value={ccName}
                onChange={e => setCcName(e.target.value)}
                className="h-9 text-xs rounded-xl
                           border-slate-200 dark:border-slate-600"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Designation"
                  value={ccDesignation}
                  onChange={e => setCcDesignation(e.target.value)}
                  onKeyDown={e =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), addCc())
                  }
                  className="h-9 text-xs rounded-xl flex-1
                             border-slate-200 dark:border-slate-600"
                />
                <Button
                  type="button" size="sm"
                  onClick={addCc}
                  className="h-9 px-3 text-xs bg-sky-500
                             hover:bg-sky-600 text-white rounded-xl"
                >
                  Add
                </Button>
              </div>
            </div>

            {ccList.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {ccList.map(r => (
                  <div
                    key={r.email}
                    className="flex items-center justify-between
                               bg-sky-50 dark:bg-sky-900/20
                               border border-sky-100 dark:border-sky-900
                               rounded-xl px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold
                                    text-sky-700 dark:text-sky-300 truncate">
                        {r.email}
                      </p>
                      {(r.name || r.designation) && (
                        <p className="text-[9px] text-sky-500 truncate">
                          {[r.name, r.designation]
                            .filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCc(r.email)}
                      className="text-slate-400 hover:text-red-500
                                 p-1 shrink-0 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SideCard>

          {/* ── Field Toolbar ─────────────────────────────── */}
          {fileReady && parties.length > 0 && (
            <SideCard>
              <FieldToolbar
                parties={parties}
                selectedPartyIndex={selectedPartyIndex}
                onPartySelect={setSelectedPartyIndex}
                onAddField={type => setPendingFieldType(type)}
                pendingFieldType={pendingFieldType}
              />
            </SideCard>
          )}

          {/* ── Typography Panel ──────────────────────────── */}
          {selectedField?.type === 'text' && (
            <SideCard className="border-sky-200 dark:border-sky-800
                                 bg-sky-50/50 dark:bg-sky-900/10">
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-4 h-4 text-sky-500" />
                <SideLabel>Text Style</SideLabel>
              </div>
              <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                Signer types text using these font settings.
              </p>

              <div className="space-y-3">
                {/* Font Family */}
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">
                    Font Family
                  </Label>
                  <Select
                    value={selectedField.fontFamily || 'Helvetica'}
                    onValueChange={v =>
                      updateFieldTypography('fontFamily', v)
                    }
                  >
                    <SelectTrigger className="h-9 rounded-xl text-xs
                                             border-slate-200
                                             dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map(f => (
                        <SelectItem key={f.value} value={f.value}>
                          <span style={{ fontFamily: f.value }}>
                            {f.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">
                    Font Size
                  </Label>
                  <Select
                    value={String(selectedField.fontSize || 14)}
                    onValueChange={v =>
                      updateFieldTypography('fontSize', Number(v))
                    }
                  >
                    <SelectTrigger className="h-9 rounded-xl text-xs
                                             border-slate-200
                                             dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_SIZES.map(s => (
                        <SelectItem key={s} value={String(s)}>
                          {s}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Live Preview */}
                <div className="bg-white dark:bg-slate-800
                                border border-slate-200 dark:border-slate-600
                                rounded-xl p-3 min-h-[44px]
                                flex items-center justify-center">
                  <span
                    style={{
                      fontFamily: selectedField.fontFamily || 'Helvetica',
                      fontSize:   `${selectedField.fontSize || 14}px`,
                    }}
                    className="text-slate-800 dark:text-white"
                  >
                    Preview Text
                  </span>
                </div>
              </div>
            </SideCard>
          )}

          {/* ── Fields Summary ────────────────────────────── */}
          {fields.length > 0 && (
            <SideCard>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <SideLabel>
                  {fields.length} Field{fields.length !== 1 ? 's' : ''} Placed
                </SideLabel>
              </div>
              <div className="space-y-1.5">
                {fieldSummary.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.color || '#0ea5e9' }}
                      />
                      <span className="text-xs text-slate-600
                                       dark:text-slate-400 truncate font-medium">
                        {p.name || `Party ${i + 1}`}
                      </span>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ml-2
                      ${p.count > 0
                        ? 'text-sky-500'
                        : 'text-red-400'
                      }`}>
                      {p.count > 0
                        ? `${p.count} field${p.count !== 1 ? 's' : ''}`
                        : '⚠ None'
                      }
                    </span>
                  </div>
                ))}
              </div>
            </SideCard>
          )}
        </aside>

        {/* ── PDF Viewer ───────────────────────────────────── */}
        <main className="flex-1 bg-slate-100 dark:bg-slate-950
                         overflow-hidden min-h-0">
          {fileReady ? (
            <PdfViewer
              fileUrl={fileUrl}
              fields={fields}
              onFieldsChange={setFields}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onTotalPagesChange={setTotalPages}
              pendingFieldType={pendingFieldType}
              selectedPartyIndex={selectedPartyIndex}
              parties={parties}
              onFieldPlaced={() => setPendingFieldType(null)}
              selectedFieldId={selectedFieldId}
              onFieldSelect={setSelectedFieldId}
            />
          ) : (
            <div className="h-full flex flex-col items-center
                            justify-center text-center px-8">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800
                              rounded-3xl flex items-center justify-center
                              mb-6">
                <FileText className="w-12 h-12 text-slate-300
                                     dark:text-slate-600" />
              </div>
              <p className="font-bold text-slate-400 text-lg mb-2">
                No document yet
              </p>
              <p className="text-slate-300 dark:text-slate-600 text-sm">
                Upload a PDF from the sidebar to get started.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}