
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
  useState, useCallback, useEffect, useRef,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, buildProxyUrl } from '@/api/apiClient';
import { useAuth }   from '@/lib/AuthContext';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { Card }      from '@/components/ui/Card';
import { toast }     from 'sonner';
import {
  ArrowLeft, Send, Loader2, FileText,
  Upload, X, Plus, Mail, Eye,
  CheckCircle2, RefreshCw,
} from 'lucide-react';
import PdfViewer    from '@/components/editor/PdfViewer';
import FieldToolbar from '@/components/editor/FieldToolbar';

// ── Constants ─────────────────────────────────────────────────────
const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'];

const EMPTY_PARTY = (i = 0) => ({
  name:  '',
  email: '',
  color: COLORS[i % COLORS.length],
});

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    in_progress: {
      label: 'Active',
      cls:   'bg-sky-100 text-sky-700',
    },
    completed: {
      label: 'Completed',
      cls:   'bg-emerald-100 text-emerald-700',
    },
    draft: {
      label: 'Draft',
      cls:   'bg-slate-100 text-slate-600',
    },
  };
  const cfg = map[status] || map.draft;
  return (
    <span className={`text-[10px] font-bold uppercase
                      px-2 py-1 rounded-lg ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════
// DOCUMENT EDITOR
// ════════════════════════════════════════════════════════════════
export default function DocumentEditor() {
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();
  const { user }              = useAuth();

  // ── URL param — existing doc id ─────────────────────────────
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
  const [ccEmail,         setCcEmail]         = useState('');
  const [fields,          setFields]          = useState([]);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [totalPages,      setTotalPages]      = useState(1);
  const [selectedParty,   setSelectedParty]   = useState(0);
  const [pendingType,     setPendingType]      = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [sending,         setSending]         = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState(0);
  const [resending,       setResending]       = useState(false);

  const isMounted = useRef(true);
  useEffect(() => () => { isMounted.current = false; }, []);

  // ════════════════════════════════════════════════════════════
  // LOAD EXISTING DOCUMENT — ?id=DOC_ID
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isNew) return;

    const load = async () => {
      setLoadingDoc(true);
      try {
        const res = await api.get(
          `/documents/${docId}`,
          { noCache: true }
        );
        const doc = res.data?.document;
        if (!doc || !isMounted.current) return;

        // ✅ State populate করো
        setExistingDoc(doc);
        setTitle(doc.title || '');
        setCompanyName(doc.companyName || '');
        setCompanyLogo(doc.companyLogo || '');
        setCcList(doc.ccList || []);
        setTotalPages(doc.totalPages || 1);

        // Parties
        if (doc.parties?.length) {
          setParties(
            doc.parties.map((p, i) => ({
              name:   p.name  || '',
              email:  p.email || '',
              color:  p.color || COLORS[i % COLORS.length],
              status: p.status,
            }))
          );
        }

        // Fields
        if (doc.fields?.length) {
          const parsed = doc.fields.map(f =>
            typeof f === 'string' ? JSON.parse(f) : f
          );
          setFields(parsed);
        }

        // ✅ PDF — Cloudinary URL থেকে proxy দিয়ে load করো
        if (doc.fileUrl) {
          const proxyUrl = buildProxyUrl(doc.fileUrl);
          setFileUrl(proxyUrl);
          setFileReady(true);
        }

      } catch (err) {
        console.error('Load doc error:', err);
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
  // FILE SELECT
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

  // ════════════════════════════════════════════════════════════
  // LOGO SELECT
  // ════════════════════════════════════════════════════════════
  const handleLogoSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files allowed.');
      return;
    }

    try {
      const lf = new FormData();
      lf.append('logo', file);
      const res = await api.post('/documents/upload-logo', lf);
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
    const email = ccEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email address.');
      return;
    }
    if (ccList.some(r => r.email === email)) {
      toast.error('Email already added.');
      return;
    }
    setCcList(p => [...p, { email, name: '' }]);
    setCcEmail('');
  };

  // ════════════════════════════════════════════════════════════
  // RESEND — Existing doc এ email আবার পাঠাও
  // ════════════════════════════════════════════════════════════
  const handleResend = async () => {
    if (!docId || isNew || resending) return;
    setResending(true);
    try {
      await api.post(`/documents/resend/${docId}`);
      toast.success('Signing email resent successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to resend email.');
    } finally {
      setResending(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // SEND / UPLOAD — New Document
  // ════════════════════════════════════════════════════════════
  const handleSend = async () => {
    // ── Validation ──────────────────────────────────────────
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
    if (fields.length === 0) {
      toast.error('Please place at least one field.');
      return;
    }

    setSending(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // ── Text fields আগে ─────────────────────────────────
      formData.append('title',       title.trim());
      formData.append('companyName', companyName.trim());
      formData.append('companyLogo', companyLogo || '');
      formData.append('totalPages',  String(totalPages));

      formData.append(
        'parties',
        JSON.stringify(
          parties.map((p, i) => ({
            name:  p.name.trim(),
            email: p.email.trim().toLowerCase(),
            color: p.color || COLORS[i % COLORS.length],
          }))
        )
      );

      formData.append('fields',       JSON.stringify(fields));
      formData.append('ccRecipients', JSON.stringify(ccList));

      // ── File সবার শেষে ───────────────────────────────────
      if (rawFile) {
        formData.append('file', rawFile);
      } else if (existingDoc?.fileUrl) {
        // Existing doc — fileUrl পাঠাও
        formData.append('fileUrl', existingDoc.fileUrl);
      }

      const endpoint = '/documents/upload-and-send';

      const response = await api.post(endpoint, formData, {
        onUploadProgress: (e) => {
          const pct = Math.round(
            (e.loaded * 100) / (e.total || 1)
          );
          setUploadProgress(pct);
        },
        timeout: 60000,
      });

      if (response.data?.success) {
        toast.success('Document sent successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(
        err?.message ||
        err?.response?.data?.message ||
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
          <p className="text-slate-500 font-medium">
            Loading document...
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // VIEW MODE — Completed doc
  // ════════════════════════════════════════════════════════════
  const isCompleted = existingDoc?.status === 'completed';
  const isViewOnly  = isCompleted;

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50
                    dark:bg-slate-950 flex flex-col">

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50
                         bg-white dark:bg-slate-900
                         border-b border-slate-200
                         dark:border-slate-700
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
                           font-semibold max-w-xs
                           focus:border-[#28ABDF]"
              />
            )}

            {existingDoc && (
              <StatusBadge status={existingDoc.status} />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Upload Progress */}
          {sending && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="flex items-center gap-2">
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

          {/* Resend button — existing in_progress doc */}
          {!isNew && existingDoc?.status === 'in_progress' && (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resending}
              className="rounded-xl gap-2 h-9 font-semibold
                         border-amber-300 text-amber-600
                         hover:bg-amber-50 text-sm"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Resend Email
            </Button>
          )}

          {/* View PDF — completed */}
          {isCompleted && existingDoc?.signedFileUrl && (
            <Button
              onClick={() =>
                window.open(
                  buildProxyUrl(existingDoc.signedFileUrl),
                  '_blank',
                  'noopener,noreferrer'
                )
              }
              className="bg-emerald-500 hover:bg-emerald-600
                         text-white rounded-xl gap-2 h-9
                         font-semibold"
            >
              <Eye className="w-4 h-4" />
              View Signed PDF
            </Button>
          )}

          {/* Send button — new or re-upload */}
          {!isCompleted && (
            <Button
              onClick={handleSend}
              disabled={sending}
              className="bg-[#28ABDF] hover:bg-[#2399c8]
                         text-white rounded-xl gap-2
                         px-6 h-9 font-semibold"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isNew ? 'Send Document' : 'Resend'}
                </>
              )}
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className="w-80 shrink-0 border-r
                          border-slate-200 dark:border-slate-700
                          bg-white dark:bg-slate-900
                          overflow-y-auto p-4 flex flex-col gap-4">

          {/* PDF Upload — only for new docs */}
          {isNew ? (
            <Card className="p-4 rounded-2xl border-slate-100
                             dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500
                            uppercase tracking-wider mb-3">
                Document PDF
              </p>
              <label className="flex flex-col items-center gap-2
                                cursor-pointer border-2 border-dashed
                                border-slate-200 rounded-xl p-4
                                hover:border-[#28ABDF]
                                transition-colors">
                {fileReady ? (
                  <>
                    <FileText className="w-8 h-8 text-[#28ABDF]" />
                    <p className="text-xs font-semibold
                                  text-[#28ABDF]">
                      PDF Loaded ✓
                    </p>
                    <p className="text-[10px] text-slate-400
                                  truncate max-w-[200px]">
                      {rawFile?.name}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300" />
                    <p className="text-xs text-slate-400">
                      Click to upload PDF
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Max 20MB
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </Card>
          ) : (
            /* Existing doc info */
            <Card className="p-4 rounded-2xl border-slate-100
                             dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500
                            uppercase tracking-wider mb-2">
                Document
              </p>
              <div className="flex items-center gap-3
                              bg-sky-50 dark:bg-sky-900/20
                              rounded-xl p-3">
                <FileText className="w-5 h-5 text-sky-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold
                                text-slate-800 dark:text-slate-200
                                truncate">
                    {title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {existingDoc?.totalPages || 1} page(s)
                  </p>
                </div>
              </div>

              {/* Re-upload option */}
              {!isCompleted && (
                <label className="flex items-center gap-2
                                  cursor-pointer mt-2
                                  border border-dashed
                                  border-slate-200 rounded-xl p-2
                                  hover:border-[#28ABDF]
                                  transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400">
                    {rawFile ? '✓ New PDF selected' : 'Replace PDF'}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </Card>
          )}

          {/* Company Info */}
          <Card className="p-4 rounded-2xl border-slate-100
                           dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500
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
              <label className={`flex items-center gap-2
                                 border border-dashed border-slate-200
                                 rounded-xl p-2 transition-colors
                                 ${isViewOnly
                                   ? 'opacity-50 cursor-not-allowed'
                                   : 'cursor-pointer hover:border-[#28ABDF]'
                                 }`}>
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {companyLogo ? 'Logo uploaded ✓' : 'Upload Logo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoSelect}
                  disabled={isViewOnly}
                />
              </label>
            </div>
          </Card>

          {/* Parties / Signers */}
          <Card className="p-4 rounded-2xl border-slate-100
                           dark:border-slate-800">
            <div className="flex items-center
                            justify-between mb-3">
              <p className="text-xs font-bold text-slate-500
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
                  className="p-3 rounded-xl border-2 space-y-2"
                  style={{ borderColor: party.color + '40' }}
                >
                  <div className="flex items-center
                                  justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: party.color }}
                      />
                      <span className="text-xs font-bold
                                       text-slate-600
                                       dark:text-slate-400">
                        Party {i + 1}
                      </span>
                      {/* Signed badge */}
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
                        onClick={() => removeParty(i)}
                        className="text-slate-300
                                   hover:text-red-500
                                   transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <Input
                    value={party.name}
                    onChange={e =>
                      updateParty(i, 'name', e.target.value)
                    }
                    placeholder="Full Name"
                    className="h-8 text-xs rounded-lg"
                    disabled={isViewOnly ||
                      party.status === 'signed'}
                  />
                  <Input
                    value={party.email}
                    onChange={e =>
                      updateParty(i, 'email', e.target.value)
                    }
                    placeholder="Email Address"
                    type="email"
                    className="h-8 text-xs rounded-lg"
                    disabled={isViewOnly ||
                      party.status === 'signed'}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* CC Recipients */}
          <Card className="p-4 rounded-2xl border-slate-100
                           dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-[#28ABDF]" />
              <p className="text-xs font-bold text-slate-500
                            uppercase tracking-wider">
                CC Recipients
              </p>
            </div>

            {!isViewOnly && (
              <div className="flex gap-2 mb-2">
                <Input
                  value={ccEmail}
                  onChange={e => setCcEmail(e.target.value)}
                  onKeyDown={e =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), addCc())
                  }
                  placeholder="email@example.com"
                  className="h-9 text-xs rounded-xl flex-1"
                />
                <Button
                  size="sm" onClick={addCc}
                  className="h-9 px-3 bg-[#28ABDF]
                             text-white rounded-xl"
                >
                  Add
                </Button>
              </div>
            )}

            {ccList.length > 0 ? (
              <div className="space-y-1">
                {ccList.map(r => (
                  <div
                    key={r.email}
                    className="flex items-center justify-between
                               bg-sky-50 border border-sky-100
                               rounded-xl px-3 py-1.5"
                  >
                    <span className="text-[11px] text-sky-700
                                     truncate">
                      {r.email}
                    </span>
                    {!isViewOnly && (
                      <button
                        onClick={() =>
                          setCcList(p =>
                            p.filter(x => x.email !== r.email)
                          )
                        }
                        className="text-slate-400
                                   hover:text-red-500 ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                No CC recipients added.
              </p>
            )}
          </Card>

          {/* Field Toolbar — only when file ready & not completed */}
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

          {/* Field Summary */}
          {fields.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/50
                            rounded-xl p-3 border border-slate-100
                            dark:border-slate-800 text-xs">
              <p className="font-bold text-slate-500 uppercase
                            tracking-wide mb-1">
                {fields.length} field
                {fields.length !== 1 ? 's' : ''} placed
              </p>
              {parties.map((p, i) => {
                const count = fields.filter(
                  f => Number(f.partyIndex) === i
                ).length;
                return count > 0 ? (
                  <div key={i}
                       className="flex justify-between py-0.5">
                    <span className="text-slate-500">
                      {p.name || `Party ${i + 1}`}
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: p.color }}
                    >
                      {count}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </aside>

        {/* ── PDF Viewer ─────────────────────────────────── */}
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
              onFieldPlaced={
                isViewOnly ? undefined : () => setPendingType(null)
              }
              selectedFieldId={selectedFieldId}
              onFieldSelect={
                isViewOnly ? undefined : setSelectedFieldId
              }
              readOnly={isViewOnly}
            />
          ) : (
            <div className="h-full flex flex-col items-center
                            justify-center text-slate-300
                            px-8 text-center gap-4">
              <FileText className="w-16 h-16 opacity-20" />
              <div>
                <p className="font-semibold text-slate-400 text-lg">
                  {isNew
                    ? 'Upload a PDF to start'
                    : 'Loading document...'
                  }
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {isNew
                    ? 'Then place signature fields for each party'
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