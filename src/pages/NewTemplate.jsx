// import React, {
//   useState, useCallback, useRef,
// } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button }   from '@/components/ui/button';
// import { Input }    from '@/components/ui/input';
// import { Card }     from '@/components/ui/Card';
// import { Label }    from '@/components/ui/label';
// import { toast }    from 'sonner';
// import {
//   ArrowLeft, Upload, ImagePlus,
//   X, Send, Loader2, FileText, Mail,
// } from 'lucide-react';
// import PdfViewer    from '@/components/editor/PdfViewer';
// import FieldToolbar from '@/components/editor/FieldToolbar';
// import {
//   Select, SelectContent, SelectItem,
//   SelectTrigger, SelectValue,
// } from '@/components/ui/select';

// const FONT_FAMILIES = [
//   { label: 'Helvetica',       value: 'Helvetica'       },
//   { label: 'Times New Roman', value: 'Times New Roman' },
//   { label: 'Courier',         value: 'Courier'         },
// ];
// const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24];

// // Party config for template:
// // partyIndex 0 = Party 1 (CEO/Owner — pre-signs)
// // partyIndex 1 = Employee (each recipient)
// const TEMPLATE_PARTIES = [
//   { name: 'Party 1 (Authoriser)', color: '#0ea5e9', index: 0 },
//   { name: 'Employee / Signer',    color: '#8b5cf6', index: 1 },
// ];

// export default function NewTemplate() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [rawFile,          setRawFile]          = useState(null);
//   const [fileUrl,          setFileUrl]          = useState('');
//   const [fileReady,        setFileReady]        = useState(false);
//   const [title,            setTitle]            = useState('');
//   const [companyLogoFile,  setCompanyLogoFile]  = useState(null);
//   const [companyLogoPreview, setCompanyLogoPreview] = useState('');
//   const [companyName,      setCompanyName]      = useState('');
//   const [party1Name,       setParty1Name]       = useState(user?.full_name || '');
//   const [party1Email,      setParty1Email]      = useState(user?.email    || '');
//   const [ccEmail,          setCcEmail]          = useState('');
//   const [ccList,           setCcList]           = useState([]);
//   const [fields,           setFields]           = useState([]);
//   const [currentPage,      setCurrentPage]      = useState(1);
//   const [totalPages,       setTotalPages]       = useState(1);
//   const [selectedPartyIdx, setSelectedPartyIdx] = useState(0);
//   const [pendingType,      setPendingType]      = useState(null);
//   const [selectedFieldId,  setSelectedFieldId]  = useState(null);
//   const [processing,       setProcessing]       = useState(false);

//   const selectedField = fields.find(f => f.id === selectedFieldId);

//   // ── Handlers ────────────────────────────────────────────────
//   const handleFileSelect = useCallback((e) => {
//     const file = e.target.files?.[0];
//     if (!file || file.type !== 'application/pdf') {
//       toast.error('Please upload a PDF file.');
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
//     toast.success('PDF loaded!');
//     e.target.value = '';
//   }, [fileUrl]);

//   const handleLogoSelect = useCallback((e) => {
//     const file = e.target.files?.[0];
//     if (!file || !file.type.startsWith('image/')) return;
//     setCompanyLogoFile(file);
//     setCompanyLogoPreview(URL.createObjectURL(file));
//     e.target.value = '';
//   }, []);

//   const addCc = () => {
//     const email = ccEmail.trim().toLowerCase();
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       toast.error('Invalid email.');
//       return;
//     }
//     if (ccList.some(r => r.email === email)) return;
//     setCcList(p => [...p, { email, name:'' }]);
//     setCcEmail('');
//   };

//   const updateFieldTypography = (key, val) => {
//     if (!selectedFieldId) return;
//     setFields(prev => prev.map(f =>
//       f.id === selectedFieldId ? { ...f, [key]: val } : f
//     ));
//   };

//   // ── Submit ───────────────────────────────────────────────────
//   const handleCreate = async () => {
//     if (!rawFile) {
//       toast.error('Please upload a PDF.');
//       return;
//     }
//     if (!title.trim()) {
//       toast.error('Please enter a template title.');
//       return;
//     }
//     if (!party1Email.trim()) {
//       toast.error('Please enter Party 1 email.');
//       return;
//     }
//     if (!fields.length) {
//       toast.error('Please place at least one field.');
//       return;
//     }

//     setProcessing(true);
//     try {
//       const formData = new FormData();
//       formData.append('file', rawFile);
//       formData.append('title', title.trim());
//       formData.append('companyName', companyName.trim());
//       formData.append('fields', JSON.stringify(fields));
//       formData.append('party1', JSON.stringify({
//         name:  party1Name.trim() || user?.full_name || 'Party 1',
//         email: party1Email.trim().toLowerCase(),
//       }));
//       formData.append('ccList', JSON.stringify(ccList));

//       // Upload logo
//       if (companyLogoFile instanceof File) {
//         const lf = new FormData();
//         lf.append('logo', companyLogoFile);
//         const lr = await api.post('/documents/upload-logo', lf);
//         if (lr.data?.logoUrl) {
//           formData.append('companyLogo', lr.data.logoUrl);
//         }
//       }

//       // Optimistic navigate
//       navigate('/templates');
//       toast.success('Template created! Party 1 will receive a signing link.');

//       await api.post('/documents/templates', formData);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to create template.');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

//       {/* Top bar */}
//       <div className="sticky top-0 z-40 bg-white dark:bg-slate-900
//                       border-b border-slate-200 dark:border-slate-700
//                       px-4 py-3 flex items-center justify-between
//                       gap-3 shadow-sm">
//         <div className="flex items-center gap-3 min-w-0">
//           <Button
//             variant="ghost" size="icon"
//             onClick={() => navigate('/templates')}
//             className="rounded-xl shrink-0"
//           >
//             <ArrowLeft className="w-4 h-4" />
//           </Button>
//           <Input
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Template Title..."
//             className="h-9 rounded-xl border-slate-200 font-semibold
//                        max-w-xs focus:border-[#28ABDF]"
//           />
//         </div>
//         <Button
//           onClick={handleCreate}
//           disabled={processing}
//           className="bg-[#28ABDF] hover:bg-[#2399c8] text-white
//                      rounded-xl gap-2 px-6 h-9 font-semibold shrink-0"
//         >
//           {processing
//             ? <Loader2 className="w-4 h-4 animate-spin" />
//             : <><Send className="w-4 h-4" /> Create Template</>
//           }
//         </Button>
//       </div>

//       <div className="flex h-[calc(100vh-57px)]">

//         {/* Sidebar */}
//         <div className="w-80 shrink-0 border-r border-slate-200
//                         dark:border-slate-700 bg-white dark:bg-slate-900
//                         overflow-y-auto flex flex-col gap-4 p-4">

//           {/* Branding */}
//           <Card className="p-4 rounded-2xl border-slate-100
//                            dark:border-slate-800">
//             <p className="text-xs font-bold text-slate-500
//                           uppercase tracking-wider mb-3">
//               Branding
//             </p>

//             {/* Logo */}
//             {companyLogoPreview ? (
//               <div className="relative inline-block mb-3">
//                 <img
//                   src={companyLogoPreview}
//                   alt="Logo"
//                   className="h-12 max-w-[160px] object-contain
//                              rounded-lg border border-slate-200"
//                 />
//                 <button
//                   onClick={() => {
//                     setCompanyLogoPreview('');
//                     setCompanyLogoFile(null);
//                   }}
//                   className="absolute -top-1.5 -right-1.5 bg-red-500
//                              text-white rounded-full p-0.5 shadow"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </div>
//             ) : (
//               <label className="flex items-center gap-2 cursor-pointer
//                                 border-2 border-dashed border-slate-200
//                                 rounded-xl p-3 mb-3
//                                 hover:border-[#28ABDF] transition-colors">
//                 <ImagePlus className="w-4 h-4 text-slate-400" />
//                 <span className="text-xs text-slate-400">Upload Logo</span>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleLogoSelect}
//                 />
//               </label>
//             )}

//             <Input
//               value={companyName}
//               onChange={e => setCompanyName(e.target.value)}
//               placeholder="Company Name"
//               className="h-9 rounded-xl text-sm border-slate-200"
//             />
//           </Card>

//           {/* PDF */}
//           <Card className="p-4 rounded-2xl border-slate-100
//                            dark:border-slate-800">
//             <p className="text-xs font-bold text-slate-500
//                           uppercase tracking-wider mb-3">
//               Template PDF
//             </p>
//             <label className="flex flex-col items-center gap-2
//                               cursor-pointer border-2 border-dashed
//                               border-slate-200 rounded-xl p-4
//                               hover:border-[#28ABDF] transition-colors">
//               {fileReady
//                 ? <><FileText className="w-8 h-8 text-[#28ABDF]" />
//                     <p className="text-xs font-semibold text-[#28ABDF]">
//                       PDF Loaded ✓
//                     </p></>
//                 : <><Upload className="w-8 h-8 text-slate-300" />
//                     <p className="text-xs text-slate-400">Upload PDF</p></>
//               }
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 className="hidden"
//                 onChange={handleFileSelect}
//               />
//             </label>
//           </Card>

//           {/* Party 1 */}
//           <Card className="p-4 rounded-2xl border-slate-100
//                            dark:border-slate-800">
//             <div className="flex items-center gap-2 mb-3">
//               <div className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
//               <p className="text-xs font-bold text-slate-600
//                             uppercase tracking-wider">
//                 Party 1 (Authoriser)
//               </p>
//             </div>
//             <p className="text-[10px] text-slate-400 mb-2">
//               Party 1 signs the template once. Their signature
//               appears pre-filled for all future recipients.
//             </p>
//             <div className="space-y-2">
//               <Input
//                 value={party1Name}
//                 onChange={e => setParty1Name(e.target.value)}
//                 placeholder="Name"
//                 className="h-9 rounded-xl text-sm border-slate-200"
//               />
//               <Input
//                 value={party1Email}
//                 onChange={e => setParty1Email(e.target.value)}
//                 placeholder="Email"
//                 type="email"
//                 className="h-9 rounded-xl text-sm border-slate-200"
//               />
//             </div>
//           </Card>

//           {/* CC */}
//           <Card className="p-4 rounded-2xl border-slate-100
//                            dark:border-slate-800">
//             <div className="flex items-center gap-2 mb-3">
//               <Mail className="w-4 h-4 text-[#28ABDF]" />
//               <p className="text-xs font-bold text-slate-600
//                             uppercase tracking-wider">
//                 CC Recipients
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <Input
//                 value={ccEmail}
//                 onChange={e => setCcEmail(e.target.value)}
//                 onKeyDown={e =>
//                   e.key === 'Enter' && (e.preventDefault(), addCc())
//                 }
//                 placeholder="email@example.com"
//                 className="h-9 text-xs rounded-xl flex-1"
//               />
//               <Button
//                 size="sm" onClick={addCc}
//                 className="h-9 px-3 bg-[#28ABDF] text-white rounded-xl"
//               >
//                 Add
//               </Button>
//             </div>
//             {ccList.length > 0 && (
//               <div className="mt-2 space-y-1">
//                 {ccList.map(r => (
//                   <div key={r.email}
//                        className="flex items-center justify-between
//                                   bg-sky-50 border border-sky-100
//                                   rounded-xl px-3 py-1.5">
//                     <span className="text-[11px] text-sky-700 truncate">
//                       {r.email}
//                     </span>
//                     <button
//                       onClick={() =>
//                         setCcList(p =>
//                           p.filter(x => x.email !== r.email)
//                         )
//                       }
//                       className="text-slate-400 hover:text-red-500"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </Card>

//           {/* Field toolbar */}
//           {fileReady && (
//             <Card className="p-4 rounded-2xl border-slate-100
//                              dark:border-slate-800">
//               <FieldToolbar
//                 parties={TEMPLATE_PARTIES}
//                 selectedPartyIndex={selectedPartyIdx}
//                 onPartySelect={setSelectedPartyIdx}
//                 onAddField={type => setPendingType(type)}
//                 pendingFieldType={pendingType}
//               />
//             </Card>
//           )}

//           {/* Typography */}
//           {selectedField?.type === 'text' && (
//             <Card className="p-4 rounded-2xl bg-sky-50/50
//                              border-[#28ABDF]/20
//                              dark:border-slate-800">
//               <p className="text-xs font-bold text-slate-600
//                             uppercase tracking-wider mb-3">
//                 Text Style (Fixed for Signer)
//               </p>
//               <div className="space-y-2">
//                 <Select
//                   value={selectedField.fontFamily || 'Helvetica'}
//                   onValueChange={v =>
//                     updateFieldTypography('fontFamily', v)
//                   }
//                 >
//                   <SelectTrigger className="h-9 rounded-xl text-xs">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {FONT_FAMILIES.map(f => (
//                       <SelectItem key={f.value} value={f.value}>
//                         <span style={{ fontFamily: f.value }}>
//                           {f.label}
//                         </span>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>

//                 <Select
//                   value={String(selectedField.fontSize || 14)}
//                   onValueChange={v =>
//                     updateFieldTypography('fontSize', Number(v))
//                   }
//                 >
//                   <SelectTrigger className="h-9 rounded-xl text-xs">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {FONT_SIZES.map(s => (
//                       <SelectItem key={s} value={String(s)}>
//                         {s}px
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>

//                 <div className="bg-white border border-slate-200
//                                 rounded-xl p-2 text-center">
//                   <span
//                     style={{
//                       fontFamily: selectedField.fontFamily,
//                       fontSize:   `${selectedField.fontSize||14}px`,
//                     }}
//                   >
//                     Preview Text
//                   </span>
//                 </div>
//               </div>
//             </Card>
//           )}

//           {/* Summary */}
//           {fields.length > 0 && (
//             <div className="bg-slate-50 dark:bg-slate-900/50
//                             rounded-xl p-3 border border-slate-100
//                             dark:border-slate-800 text-xs">
//               <p className="font-bold text-slate-500 uppercase
//                             tracking-wide mb-1">
//                 {fields.length} field
//                 {fields.length !== 1 ? 's' : ''} placed
//               </p>
//               {TEMPLATE_PARTIES.map((p, i) => {
//                 const c = fields.filter(
//                   f => Number(f.partyIndex) === i
//                 ).length;
//                 return c > 0 ? (
//                   <div key={i}
//                        className="flex justify-between py-0.5">
//                     <span className="text-slate-500">{p.name}</span>
//                     <span className="font-bold text-[#28ABDF]">
//                       {c}
//                     </span>
//                   </div>
//                 ) : null;
//               })}
//             </div>
//           )}
//         </div>

//         {/* PDF Viewer */}
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
//               pendingFieldType={pendingType}
//               selectedPartyIndex={selectedPartyIdx}
//               parties={TEMPLATE_PARTIES}
//               onFieldPlaced={() => setPendingType(null)}
//               selectedFieldId={selectedFieldId}
//               onFieldSelect={setSelectedFieldId}
//             />
//           ) : (
//             <div className="h-full flex flex-col items-center
//                             justify-center text-slate-300 px-8
//                             text-center">
//               <FileText className="w-16 h-16 opacity-20 mb-4" />
//               <p className="font-semibold text-slate-400 text-lg">
//                 Upload a PDF to start
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Send, Loader2, FileText } from 'lucide-react';
import PdfViewer from '@/components/editor/PdfViewer';

export default function NewTemplate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rawFile, setRawFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawFile(file);
    setTitle(file.name.replace(/\.pdf$/i, ''));
    setFileUrl(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!rawFile || !title.trim()) return toast.error('Please upload a PDF and set a title.');
    
    setProcessing(true);
    try {
      const formData = new FormData();
      // Append Metadata
      formData.append('title', title.trim());
      formData.append('fields', JSON.stringify(fields));
      formData.append('party1', JSON.stringify({ name: user?.full_name || 'Admin', email: user?.email }));
      
      // Append file LAST (Critical for Multer)
      formData.append('file', rawFile);

      // Do NOT set Content-Type header. Axios sets it automatically with the boundary.
      await api.post('/documents/templates', formData);

      toast.success('Template created!');
      navigate('/templates');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Upload failed. Please check file size.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/templates')}><ArrowLeft className="w-5" /></Button>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Template Title..." className="border-0 font-bold text-lg focus:ring-0" />
        </div>
        <Button onClick={handleCreate} disabled={processing} className="bg-[#28ABDF] hover:bg-[#2399c8] rounded-xl px-6">
          {processing ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Create
        </Button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r bg-white p-6 space-y-6">
           <label className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center cursor-pointer hover:border-[#28ABDF] transition-colors">
             <Upload className="w-8 h-8 text-slate-400 mb-2" />
             <span className="text-sm font-medium">Click to change PDF</span>
             <input type="file" onChange={handleFileSelect} className="hidden" />
           </label>
           <div className="text-xs text-slate-400">Supported: PDF up to 20MB</div>
        </aside>
        
        <section className="flex-1 bg-slate-100 p-6 overflow-auto">
          {fileUrl ? <PdfViewer fileUrl={fileUrl} fields={fields} onFieldsChange={setFields} /> : <div className="h-full flex items-center justify-center text-slate-400 italic">No document selected</div>}
        </section>
      </main>
    </div>
  );
}