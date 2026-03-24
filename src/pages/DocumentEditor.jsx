// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
// import { base44 } from '@/api/base44Client';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { toast } from 'sonner';
// import {
//   Upload, Save, Send, ArrowLeft, FileText, Loader2, AlertCircle
// } from 'lucide-react';
// import PartyManager from '../components/editor/PartyManager';
// import FieldToolbar from '../components/editor/FieldToolbar';
// import PdfViewer from '../components/editor/PdfViewer';

// export default function DocumentEditor() {
//   const navigate = useNavigate();
//   const urlParams = new URLSearchParams(window.location.search);
//   const docId = urlParams.get('id');

//   const [doc, setDoc] = useState(null);
//   const [title, setTitle] = useState('');
//   const [fileUrl, setFileUrl] = useState('');
//   const [parties, setParties] = useState([]);
//   const [fields, setFields] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
//   const [pendingFieldType, setPendingFieldType] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [sending, setSending] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       const authed = await base44.auth.isAuthenticated();
//       if (!authed) {
//         base44.auth.redirectToLogin(createPageUrl('DocumentEditor') + (docId ? `?id=${docId}` : ''));
//         return;
//       }
//       if (docId) {
//         const allDocs = await base44.entities.Document.list('-created_date', 200);
//         const d = allDocs.find(x => x.id === docId);
//         if (d) {
//           setDoc(d);
//           setTitle(d.title || '');
//           setFileUrl(d.file_url || '');
//           setParties(d.parties || []);
//           setFields(d.fields || []);
//           setTotalPages(d.total_pages || 1);
//         }
//       }
//     };
//     init();
//   }, [docId]);

//   const handleUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file || file.type !== 'application/pdf') {
//       toast.error('Please upload a PDF file');
//       return;
//     }
//     setUploading(true);
//     const { file_url } = await base44.integrations.Core.UploadFile({ file });
//     setFileUrl(file_url);
//     if (!title) setTitle(file.name.replace('.pdf', ''));
//     setUploading(false);
//     toast.success('PDF uploaded successfully');
//   };

//   const handleSave = async () => {
//     if (!title) {
//       toast.error('Please enter a document title');
//       return;
//     }
//     setSaving(true);
//     const data = {
//       title,
//       file_url: fileUrl,
//       parties,
//       fields,
//       total_pages: totalPages,
//       status: doc?.status || 'draft',
//     };

//     if (doc?.id) {
//       await base44.entities.Document.update(doc.id, data);
//       toast.success('Document saved');
//     } else {
//       const created = await base44.entities.Document.create(data);
//       setDoc(created);
//       window.history.replaceState(null, '', createPageUrl('DocumentEditor') + `?id=${created.id}`);
//       toast.success('Document created');
//     }
//     setSaving(false);
//   };

//   const handleSend = async () => {
//     if (sending) return; // prevent double submit
//     if (!fileUrl) { toast.error('Upload a PDF first'); return; }
//     if (parties.length === 0) { toast.error('Add at least one signing party'); return; }
//     if (fields.length === 0) { toast.error('Place at least one field on the document'); return; }
    
//     const invalidParty = parties.find(p => !p.email);
//     if (invalidParty) { toast.error('All parties must have an email address'); return; }

//     setSending(true);

//     // Auto-fill name from email if missing
//     const updatedParties = parties.map((p, i) => ({
//       ...p,
//       name: p.name || p.email.split('@')[0],
//       status: i === 0 ? 'sent' : 'pending',
//     }));

//     const data = {
//       title,
//       file_url: fileUrl,
//       parties: updatedParties,
//       fields,
//       total_pages: totalPages,
//       status: 'in_progress',
//       current_party_index: 0,
//     };

//     let docId2;
//     if (doc?.id) {
//       await base44.entities.Document.update(doc.id, data);
//       docId2 = doc.id;
//     } else {
//       const created = await base44.entities.Document.create(data);
//       docId2 = created.id;
//     }

//     // Create signing session for first party
//     const token = `${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
//     await base44.entities.SigningSession.create({
//       document_id: docId2,
//       party_index: 0,
//       token,
//       signer_name: updatedParties[0].name,
//       signer_email: updatedParties[0].email,
//       status: 'pending',
//     });

//     // Log audit
//     await base44.entities.AuditLog.create({
//       document_id: docId2,
//       action: 'sent',
//       party_name: updatedParties[0].name,
//       party_email: updatedParties[0].email,
//       details: `Signing request sent to ${updatedParties[0].name} (Party 1)`,
//       timestamp: new Date().toISOString(),
//     });

//     // Send email to first signer
//     const signingUrl = `${window.location.origin}${createPageUrl('SignerView')}?token=${token}`;
//     await base44.integrations.Core.SendEmail({
//       to: updatedParties[0].email,
//       subject: `[Nexsign] Please sign: ${title}`,
//       body: `
//         <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
//           <div style="text-align: center; margin-bottom: 32px;">
//             <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">Nexsign</h1>
//           </div>
//           <h2 style="color: #1e293b; font-size: 20px;">You have a document to sign</h2>
//           <p style="color: #64748b; line-height: 1.6;">
//             Hi ${updatedParties[0].name},<br><br>
//             You have been asked to sign <strong>"${title}"</strong>. 
//             Please click the button below to review and sign the document.
//           </p>
//           <div style="text-align: center; margin: 32px 0;">
//             <a href="${signingUrl}" style="background-color: #0ea5e9; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
//               Review & Sign Document
//             </a>
//           </div>
//           <p style="color: #94a3b8; font-size: 13px; text-align: center;">
//             This is a secure signing link. Do not share it with others.
//           </p>
//         </div>
//       `
//     });

//     setSending(false);
//     toast.success('Document sent for signing!');
//     navigate(createPageUrl('Dashboard'));
//   };

//   const handleAddField = (type) => {
//     setPendingFieldType(type);
//   };

//   const isEditable = !doc || doc.status === 'draft';

//   return (
//     <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//         <div className="flex items-center gap-3">
//           <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Dashboard'))} className="rounded-xl">
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <div>
//             <Input
//               value={title}
//               onChange={e => setTitle(e.target.value)}
//               placeholder="Document title"
//               disabled={!isEditable}
//               className="text-xl font-bold border-0 p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-300"
//             />
//           </div>
//         </div>
//         <div className="flex gap-2">
//           {isEditable && (
//             <>
//               <Button variant="outline" onClick={handleSave} disabled={saving} className="gap-2 rounded-xl">
//                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                 Save Draft
//               </Button>
//               <Button onClick={handleSend} disabled={sending} className="gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25">
//                 {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
//                 Send for Signing
//               </Button>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Left Sidebar */}
//         {isEditable && (
//           <div className="w-full lg:w-80 shrink-0 space-y-6">
//             {/* Upload */}
//             {!fileUrl && (
//               <Card className="p-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//                 <label className="flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-8 hover:border-sky-400 transition-colors">
//                   {uploading ? (
//                     <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
//                   ) : (
//                     <Upload className="w-8 h-8 text-slate-400" />
//                   )}
//                   <div className="text-center">
//                     <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
//                       {uploading ? 'Uploading...' : 'Upload PDF'}
//                     </p>
//                     <p className="text-xs text-slate-400 mt-1">Click to browse</p>
//                   </div>
//                   <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
//                 </label>
//               </Card>
//             )}

//             <Card className="p-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//               <PartyManager parties={parties} onChange={setParties} />
//             </Card>

//             {fileUrl && parties.length > 0 && (
//               <Card className="p-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//                 <FieldToolbar
//                   parties={parties}
//                   selectedPartyIndex={selectedPartyIndex}
//                   onPartySelect={setSelectedPartyIndex}
//                   onAddField={handleAddField}
//                 />
//                 {pendingFieldType && (
//                   <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800 flex items-center gap-2">
//                     <AlertCircle className="w-4 h-4 text-sky-500 shrink-0" />
//                     <p className="text-xs text-sky-600 dark:text-sky-400">
//                       Click on the PDF to place a <strong>{pendingFieldType}</strong> field for {parties[selectedPartyIndex]?.name || `Signer ${selectedPartyIndex + 1}`}
//                     </p>
//                     <Button size="sm" variant="ghost" onClick={() => setPendingFieldType(null)} className="ml-auto text-xs h-6 px-2">
//                       Cancel
//                     </Button>
//                   </div>
//                 )}
//               </Card>
//             )}
//           </div>
//         )}

//         {/* PDF Viewer */}
//         <div className="flex-1 min-w-0">
//           {fileUrl ? (
//             <PdfViewer
//               fileUrl={fileUrl}
//               fields={fields}
//               onFieldsChange={setFields}
//               currentPage={currentPage}
//               onPageChange={setCurrentPage}
//               totalPages={totalPages}
//               onTotalPagesChange={setTotalPages}
//               pendingFieldType={pendingFieldType}
//               selectedPartyIndex={selectedPartyIndex}
//               parties={parties}
//               onFieldPlaced={() => setPendingFieldType(null)}
//               readOnly={!isEditable}
//             />
//           ) : (
//             <div className="flex items-center justify-center min-h-[60vh] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
//               <div className="text-center">
//                 <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
//                 <p className="text-slate-400 text-lg">Upload a PDF to get started</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
// import { api } from '@/api/apiClient'; 
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { toast } from 'sonner';
// import {
//   Upload, Save, Send, ArrowLeft, FileText, Loader2, AlertCircle
// } from 'lucide-react';
// import PartyManager from '../components/editor/PartyManager';
// import FieldToolbar from '../components/editor/FieldToolbar';
// import PdfViewer from '../components/editor/PdfViewer';

// export default function DocumentEditor() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const urlParams = new URLSearchParams(window.location.search);
//   const docId = urlParams.get('id');

//   const [doc, setDoc] = useState(null);
//   const [title, setTitle] = useState('');
//   const [fileUrl, setFileUrl] = useState('');
//   const [parties, setParties] = useState([]);
//   const [fields, setFields] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
//   const [pendingFieldType, setPendingFieldType] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [sending, setSending] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       // ইউজার লগইন চেক (অপশনাল)
//       if (!user && !localStorage.getItem('token')) {
//         // navigate('/login');
//       }
      
//       if (docId) {
//         try {
//           const res = await api.get(`/documents/${docId}`);
//           const d = res.data;
//           if (d) {
//             setDoc(d);
//             setTitle(d.title || '');
//             setFileUrl(d.file_url || '');
//             setParties(d.parties || []);
//             setFields(d.fields || []);
//             setTotalPages(d.total_pages || 1);
//           }
//         } catch (error) {
//           console.error("Error loading document:", error);
//           toast.error("Failed to load document");
//         }
//       }
//     };
//     init();
//   }, [docId, user]);

//   // Cloudinary তে ফাইল আপলোড করার ফিক্সড ফাংশন
//   const handleUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file || file.type !== 'application/pdf') {
//       toast.error('Please upload a valid PDF file');
//       return;
//     }
    
//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', file);
    
//     try {
//       // ব্যাকএন্ডের আপলোড এন্ডপয়েন্টে পাঠানো হচ্ছে (যা ক্লাউডিনারি হ্যান্ডেল করবে)
//       const res = await api.post('/documents/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
      
//       if (res.data.url) {
//         setFileUrl(res.data.url); // ক্লাউডিনারি থেকে আসা পার্মানেন্ট লিঙ্ক
//         if (!title) setTitle(file.name.replace('.pdf', ''));
//         toast.success('PDF uploaded to cloud successfully');
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error('Cloud upload failed. Check backend/cloudinary config.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ড্রাফট সেভ করার ফাংশন
//   const handleSave = async () => {
//     if (!title) {
//       toast.error('Please enter a document title');
//       return;
//     }
//     if (!fileUrl) {
//       toast.error('Please upload a document first');
//       return;
//     }

//     setSaving(true);
//     const data = {
//       title,
//       file_url: fileUrl,
//       parties,
//       fields,
//       total_pages: totalPages,
//       status: doc?.status || 'draft',
//     };

//     try {
//       if (doc?._id || doc?.id) {
//         const id = doc._id || doc.id;
//         await api.put(`/documents/${id}`, data);
//         toast.success('Document updated');
//       } else {
//         const res = await api.post('/documents', data);
//         setDoc(res.data);
//         // ইউআরএল আপডেট করা যাতে রিফ্রেশ করলে ডাটা না হারায়
//         const newUrl = window.location.pathname + `?id=${res.data._id || res.data.id}`;
//         window.history.replaceState(null, '', newUrl);
//         toast.success('Draft saved successfully');
//       }
//     } catch (error) {
//       toast.error('Failed to save document');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // সিকুয়েন্সিয়াল সাইনিং শুরু করার ফাংশন
//   const handleSend = async () => {
//     if (sending) return;
//     if (!fileUrl) { toast.error('Upload a PDF first'); return; }
//     if (parties.length === 0) { toast.error('Add at least one signing party'); return; }
//     if (fields.length === 0) { toast.error('Please place signature fields on the PDF'); return; }
    
//     // ইমেইল চেক
//     const hasEmptyEmail = parties.some(p => !p.email);
//     if (hasEmptyEmail) {
//       toast.error('All parties must have an email address');
//       return;
//     }

//     setSending(true);
//     try {
//       const data = {
//         title,
//         file_url: fileUrl,
//         parties,
//         fields,
//         total_pages: totalPages
//       };

//       // ব্যাকএন্ডের /send এন্ডপয়েন্টে পাঠানো (যা মেইল ট্রিগার করবে)
//       await api.post('/documents/send', data);
      
//       toast.success('Document sent! Signer 1 will receive an email shortly.');
//       navigate('/dashboard'); // ড্যাশবোর্ডে পাঠিয়ে দেওয়া
//     } catch (error) {
//       console.error("Send error:", error);
//       toast.error('Failed to send document for signing');
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleAddField = (type) => {
//     setPendingFieldType(type);
//   };

//   const isEditable = !doc || doc.status === 'draft';

//   return (
//     <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//         <div className="flex items-center gap-3">
//           <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl">
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <Input
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Document title"
//             disabled={!isEditable}
//             className="text-xl font-bold border-0 p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent text-slate-900 dark:text-white"
//           />
//         </div>
//         <div className="flex gap-2">
//           {isEditable && (
//             <>
//               <Button variant="outline" onClick={handleSave} disabled={saving || uploading} className="gap-2 rounded-xl">
//                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                 Save Draft
//               </Button>
//               <Button onClick={handleSend} disabled={sending || uploading} className="gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25">
//                 {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
//                 Send for Signing
//               </Button>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Left Sidebar */}
//         <div className="w-full lg:w-80 shrink-0 space-y-6">
//           {!fileUrl && (
//             <Card className="p-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//               <label className="flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-8 hover:border-sky-400 transition-colors">
//                 {uploading ? (
//                   <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
//                 ) : (
//                   <Upload className="w-8 h-8 text-slate-400" />
//                 )}
//                 <div className="text-center">
//                   <p className="text-sm font-medium">
//                     {uploading ? 'Uploading to Cloud...' : 'Upload PDF'}
//                   </p>
//                   <p className="text-xs text-slate-400 mt-1">Permanent storage</p>
//                 </div>
//                 <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
//               </label>
//             </Card>
//           )}

//           <Card className="p-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//             <PartyManager parties={parties} onChange={setParties} />
//           </Card>

//           {fileUrl && parties.length > 0 && (
//             <Card className="p-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//               <FieldToolbar
//                 parties={parties}
//                 selectedPartyIndex={selectedPartyIndex}
//                 onPartySelect={setSelectedPartyIndex}
//                 onAddField={handleAddField}
//               />
//               {pendingFieldType && (
//                 <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4 text-sky-500" />
//                   <p className="text-xs text-sky-600">Click on the PDF to place field for {parties[selectedPartyIndex]?.name}</p>
//                 </div>
//               )}
//             </Card>
//           )}
//         </div>

//         {/* PDF Viewer Area */}
//         <div className="flex-1 min-w-0">
//           {fileUrl ? (
//             <PdfViewer
//               fileUrl={fileUrl}
//               fields={fields}
//               onFieldsChange={setFields}
//               currentPage={currentPage}
//               onPageChange={setCurrentPage}
//               totalPages={totalPages}
//               onTotalPagesChange={setTotalPages}
//               pendingFieldType={pendingFieldType}
//               selectedPartyIndex={selectedPartyIndex}
//               parties={parties}
//               onFieldPlaced={() => setPendingFieldType(null)}
//               readOnly={!isEditable}
//             />
//           ) : (
//             <div className="flex items-center justify-center min-h-[60vh] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50">
//               <div className="text-center text-slate-400">
//                 <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
//                 <p className="text-lg">Upload a PDF to start placing fields</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { toast } from 'sonner';
// import {
//   Upload, Save, Send, ArrowLeft, FileText, Loader2, AlertCircle
// } from 'lucide-react';
// import PartyManager from '@/components/editor/PartyManager';
// import FieldToolbar from '@/components/editor/FieldToolbar';
// import PdfViewer from '@/components/editor/PdfViewer';

// export default function DocumentEditor() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const urlParams = new URLSearchParams(window.location.search);
//   const docId = urlParams.get('id');

//   const [doc, setDoc] = useState(null);
//   const [title, setTitle] = useState('');
//   const [fileUrl, setFileUrl] = useState('');
//   const [parties, setParties] = useState([]);
//   const [fields, setFields] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
//   const [pendingFieldType, setPendingFieldType] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [sending, setSending] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       if (!user && !localStorage.getItem('token')) {
//         return;
//       }
      
//       if (docId) {
//         try {
//           const res = await api.get(`/documents/${docId}`);
//           const d = res.data;
//           if (d) {
//             setDoc(d);
//             setTitle(d.title || '');
//             setFileUrl(d.file_url || '');
//             setParties(d.parties || []);
//             setFields(d.fields || []);
//             setTotalPages(d.total_pages || 1);
//           }
//         } catch (error) {
//           console.error("Error loading document:", error);
//           toast.error("Failed to load document");
//         }
//       }
//     };
//     init();
//   }, [docId, user]);

//   // ✅ File Upload - Backend Connected
//   const handleUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file || file.type !== 'application/pdf') {
//       toast.error('Please upload a valid PDF file');
//       return;
//     }
    
//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', file);
    
//     try {
//       const res = await api.post('/documents/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
      
//       if (res.data.url) {
//         setFileUrl(res.data.url);
//         if (!title) setTitle(file.name.replace('.pdf', ''));
//         toast.success('PDF uploaded successfully');
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error('Upload failed. Check backend.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ✅ Save to Draft - Backend Connected
//   const handleSave = async () => {
//     if (!title) {
//       toast.error('Please enter a document title');
//       return;
//     }
//     if (!fileUrl) {
//       toast.error('Please upload a document first');
//       return;
//     }

//     setSaving(true);
//     const data = {
//       title,
//       file_url: fileUrl,
//       parties,
//       fields,
//       total_pages: totalPages,
//       status: doc?.status || 'draft',
//     };

//     try {
//       if (doc?._id || doc?.id) {
//         const id = doc._id || doc.id;
//         await api.put(`/documents/${id}`, data);
//         toast.success('Document updated');
//       } else {
//         const res = await api.post('/documents', data);
//         setDoc(res.data);
//         const newUrl = window.location.pathname + `?id=${res.data._id || res.data.id}`;
//         window.history.replaceState(null, '', newUrl);
//         toast.success('Draft saved successfully');
//       }
//     } catch (error) {
//       toast.error('Failed to save document');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ✅ Send for Signing - Backend Connected
//   const handleSend = async () => {
//     if (sending) return;
//     if (!fileUrl) { toast.error('Upload a PDF first'); return; }
//     if (parties.length === 0) { toast.error('Add at least one signing party'); return; }
//     if (fields.length === 0) { toast.error('Please place signature fields on the PDF'); return; }
    
//     const hasEmptyEmail = parties.some(p => !p.email);
//     if (hasEmptyEmail) {
//       toast.error('All parties must have an email address');
//       return;
//     }

//     setSending(true);
//     try {
//       const data = {
//         title,
//         file_url: fileUrl,
//         parties,
//         fields,
//         total_pages: totalPages
//       };

//       await api.post('/documents/send', data);
      
//       toast.success('Document sent! Signer 1 will receive an email shortly.');
//       navigate('/dashboard');
//     } catch (error) {
//       console.error("Send error:", error);
//       toast.error('Failed to send document for signing');
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleAddField = (type) => {
//     setPendingFieldType(type);
//   };

//   const isEditable = !doc || doc.status === 'draft';

//   return (
//     <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//         <div className="flex items-center gap-3">
//           <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl">
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <Input
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Document title"
//             disabled={!isEditable}
//             className="text-xl font-bold border-0 p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent text-slate-900 dark:text-white"
//           />
//         </div>
//         <div className="flex gap-2">
//           {isEditable && (
//             <>
//               <Button variant="outline" onClick={handleSave} disabled={saving || uploading} className="gap-2 rounded-xl">
//                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                 Save Draft
//               </Button>
//               <Button onClick={handleSend} disabled={sending || uploading} className="gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25">
//                 {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
//                 Send for Signing
//               </Button>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Left Sidebar */}
//         <div className="w-full lg:w-80 shrink-0 space-y-6">
//           {!fileUrl && (
//             <Card className="p-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//               <label className="flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-8 hover:border-sky-400 transition-colors">
//                 {uploading ? (
//                   <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
//                 ) : (
//                   <Upload className="w-8 h-8 text-slate-400" />
//                 )}
//                 <div className="text-center">
//                   <p className="text-sm font-medium">
//                     {uploading ? 'Uploading to Cloud...' : 'Upload PDF'}
//                   </p>
//                   <p className="text-xs text-slate-400 mt-1">Permanent storage</p>
//                 </div>
//                 <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
//               </label>
//             </Card>
//           )}

//           <Card className="p-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//             <PartyManager parties={parties} onChange={setParties} />
//           </Card>

//           {fileUrl && parties.length > 0 && (
//             <Card className="p-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//               <FieldToolbar
//                 parties={parties}
//                 selectedPartyIndex={selectedPartyIndex}
//                 onPartySelect={setSelectedPartyIndex}
//                 onAddField={handleAddField}
//               />
//               {pendingFieldType && (
//                 <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4 text-sky-500" />
//                   <p className="text-xs text-sky-600">Click on the PDF to place field for {parties[selectedPartyIndex]?.name}</p>
//                 </div>
//               )}
//             </Card>
//           )}
//         </div>

//         {/* PDF Viewer Area */}
//         <div className="flex-1 min-w-0">
//           {fileUrl ? (
//             <PdfViewer
//               fileUrl={fileUrl}
//               fields={fields}
//               onFieldsChange={setFields}
//               currentPage={currentPage}
//               onPageChange={setCurrentPage}
//               totalPages={totalPages}
//               onTotalPagesChange={setTotalPages}
//               pendingFieldType={pendingFieldType}
//               selectedPartyIndex={selectedPartyIndex}
//               parties={parties}
//               onFieldPlaced={() => setPendingFieldType(null)}
//               readOnly={!isEditable}
//             />
//           ) : (
//             <div className="flex items-center justify-center min-h-[60vh] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50">
//               <div className="text-center text-slate-400">
//                 <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
//                 <p className="text-lg">Upload a PDF to start placing fields</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { toast } from 'sonner';
// import {
//   Upload, Save, Send, ArrowLeft, FileText, Loader2, AlertCircle
// } from 'lucide-react';
// import PartyManager from '@/components/editor/PartyManager';
// import FieldToolbar from '@/components/editor/FieldToolbar';
// import PdfViewer from '@/components/editor/PdfViewer';

// export default function DocumentEditor() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const urlParams = new URLSearchParams(window.location.search);
//   const docId = urlParams.get('id');

//   const [doc, setDoc] = useState(null);
//   const [title, setTitle] = useState('');
//   const [fileUrl, setFileUrl] = useState('');
//   const [parties, setParties] = useState([]);
//   const [fields, setFields] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
//   const [pendingFieldType, setPendingFieldType] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [sending, setSending] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       if (!user && !localStorage.getItem('token')) {
//         return;
//       }
      
//       if (docId) {
//         try {
//           const res = await api.get(`/documents/${docId}`);
//           const d = res.data;
//           if (d) {
//             setDoc(d);
//             setTitle(d.title || '');
//             // ✅ Backend uses fileUrl (camelCase)
//             setFileUrl(d.fileUrl || '');
//             setParties(d.parties || []);
//             setFields(d.fields || []);
//             // ✅ Backend uses totalPages (camelCase)
//             setTotalPages(d.totalPages || 1);
//           }
//         } catch (error) {
//           console.error("Error loading document:", error);
//           toast.error("Failed to load document");
//         }
//       }
//     };
//     init();
//   }, [docId, user]);

//   // ✅ File Upload - Backend Connected
//   const handleUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file || file.type !== 'application/pdf') {
//       toast.error('Please upload a valid PDF file');
//       return;
//     }
    
//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', file);
    
//     try {
//       const res = await api.post('/documents/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
      
//       if (res.data.url) {
//         setFileUrl(res.data.url);
//         if (!title) setTitle(file.name.replace('.pdf', ''));
//         toast.success('PDF uploaded successfully');
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error('Upload failed. Check backend.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ✅ Save to Draft - Backend Connected
//   const handleSave = async () => {
//     if (!title) {
//       toast.error('Please enter a document title');
//       return;
//     }
//     if (!fileUrl) {
//       toast.error('Please upload a document first');
//       return;
//     }

//     setSaving(true);
//     const data = {
//       title,
//       fileUrl, // ✅ Backend uses camelCase
//       parties,
//       fields,
//       totalPages, // ✅ Backend uses camelCase
//       status: doc?.status || 'draft',
//     };

//     try {
//       if (doc?._id || doc?.id) {
//         const id = doc._id || doc.id;
//         await api.put(`/documents/${id}`, data);
//         toast.success('Document updated');
//       } else {
//         const res = await api.post('/documents', data);
//         setDoc(res.data);
//         const newUrl = window.location.pathname + `?id=${res.data._id || res.data.id}`;
//         window.history.replaceState(null, '', newUrl);
//         toast.success('Draft saved successfully');
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       toast.error('Failed to save document');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ✅ Send for Signing - Backend Connected
//   const handleSend = async () => {
//     if (sending) return;
//     if (!fileUrl) { toast.error('Upload a PDF first'); return; }
//     if (parties.length === 0) { toast.error('Add at least one signing party'); return; }
//     if (fields.length === 0) { toast.error('Please place signature fields on the PDF'); return; }
    
//     const hasEmptyEmail = parties.some(p => !p.email);
//     if (hasEmptyEmail) {
//       toast.error('All parties must have an email address');
//       return;
//     }

//     setSending(true);
//     try {
//       const data = {
//         title,
//         fileUrl, // ✅ Backend uses camelCase
//         parties,
//         fields,
//         totalPages // ✅ Backend uses camelCase
//       };

//       await api.post('/documents/send', data);
      
//       toast.success('Document sent! Signer 1 will receive an email shortly.');
//       navigate('/dashboard');
//     } catch (error) {
//       console.error("Send error:", error);
//       toast.error('Failed to send document for signing');
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleAddField = (type) => {
//     setPendingFieldType(type);
//   };

//   const isEditable = !doc || doc.status === 'draft';

//   return (
//     <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//         <div className="flex items-center gap-3">
//           <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl">
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <Input
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Document title"
//             disabled={!isEditable}
//             className="text-xl font-bold border-0 p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent text-slate-900 dark:text-white"
//           />
//         </div>
//         <div className="flex gap-2">
//           {isEditable && (
//             <>
//               <Button variant="outline" onClick={handleSave} disabled={saving || uploading} className="gap-2 rounded-xl">
//                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                 Save Draft
//               </Button>
//               <Button onClick={handleSend} disabled={sending || uploading} className="gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25">
//                 {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
//                 Send for Signing
//               </Button>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Left Sidebar */}
//         <div className="w-full lg:w-80 shrink-0 space-y-6">
//           {!fileUrl && (
//             <Card className="p-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//               <label className="flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-8 hover:border-sky-400 transition-colors">
//                 {uploading ? (
//                   <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
//                 ) : (
//                   <Upload className="w-8 h-8 text-slate-400" />
//                 )}
//                 <div className="text-center">
//                   <p className="text-sm font-medium">
//                     {uploading ? 'Uploading to Cloud...' : 'Upload PDF'}
//                   </p>
//                   <p className="text-xs text-slate-400 mt-1">Permanent storage</p>
//                 </div>
//                 <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
//               </label>
//             </Card>
//           )}

//           <Card className="p-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//             <PartyManager parties={parties} onChange={setParties} />
//           </Card>

//           {fileUrl && parties.length > 0 && (
//             <Card className="p-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//               <FieldToolbar
//                 parties={parties}
//                 selectedPartyIndex={selectedPartyIndex}
//                 onPartySelect={setSelectedPartyIndex}
//                 onAddField={handleAddField}
//               />
//               {pendingFieldType && (
//                 <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4 text-sky-500" />
//                   <p className="text-xs text-sky-600">Click on the PDF to place field for {parties[selectedPartyIndex]?.name}</p>
//                 </div>
//               )}
//             </Card>
//           )}
//         </div>

//         {/* PDF Viewer Area */}
//         <div className="flex-1 min-w-0">
//           {fileUrl ? (
//             <PdfViewer
//               fileUrl={fileUrl}
//               fields={fields}
//               onFieldsChange={setFields}
//               currentPage={currentPage}
//               onPageChange={setCurrentPage}
//               totalPages={totalPages}
//               onTotalPagesChange={setTotalPages}
//               pendingFieldType={pendingFieldType}
//               selectedPartyIndex={selectedPartyIndex}
//               parties={parties}
//               onFieldPlaced={() => setPendingFieldType(null)}
//               readOnly={!isEditable}
//             />
//           ) : (
//             <div className="flex items-center justify-center min-h-[60vh] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50">
//               <div className="text-center text-slate-400">
//                 <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
//                 <p className="text-lg">Upload a PDF to start placing fields</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { toast } from 'sonner';
// import {
//   Upload, Save, Send, ArrowLeft, FileText, Loader2, AlertCircle
// } from 'lucide-react';
// import PartyManager from '@/components/editor/PartyManager';
// import FieldToolbar from '@/components/editor/FieldToolbar';
// import PdfViewer from '@/components/editor/PdfViewer';

// export default function DocumentEditor() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const urlParams = new URLSearchParams(window.location.search);
//   const docId = urlParams.get('id');

//   const [doc, setDoc] = useState(null);
//   const [title, setTitle] = useState('');
//   const [fileUrl, setFileUrl] = useState('');
//   const [fileId, setFileId] = useState(''); // ✅ Store fileId
//   const [parties, setParties] = useState([]);
//   const [fields, setFields] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
//   const [pendingFieldType, setPendingFieldType] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [sending, setSending] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       if (!user && !localStorage.getItem('token')) {
//         return;
//       }
      
//       if (docId) {
//         try {
//           const res = await api.get(`/documents/${docId}`);
//           const d = res.data;
//           if (d) {
//             setDoc(d);
//             setTitle(d.title || '');
//             setFileUrl(d.fileUrl || '');
//             setFileId(d.fileId || ''); // ✅ Load fileId
//             setParties(d.parties || []);
//             setFields(d.fields || []);
//             setTotalPages(d.totalPages || 1);
//           }
//         } catch (error) {
//           console.error("Error loading document:", error);
//           toast.error("Failed to load document");
//         }
//       }
//     };
//     init();
//   }, [docId, user]);

//   // ✅ File Upload - FIXED (Save fileId)
//   // ✅ handleUpload - UPDATED (To sync with DB immediately)
// const handleUpload = async (e) => {
//   const file = e.target.files[0];
//   if (!file || file.type !== 'application/pdf') {
//     toast.error('Please upload a valid PDF file');
//     return;
//   }
  
//   setUploading(true);
//   const formData = new FormData();
//   formData.append('file', file);
  
//   try {
//     const res = await api.post('/documents/upload', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     });
    
//     // ব্যাকএন্ড এখন { url, fileId, doc } পাঠাচ্ছে
//     if (res.data.url) {
//       setFileUrl(res.data.url);
//       setFileId(res.data.fileId);
//       setDoc(res.data.doc); // ✅ গুরুত্বপূর্ণ: ব্যাকএন্ডের তৈরি করা ডকুমেন্টটি সেভ করুন
      
//       // ব্রাউজারের URL আপডেট করুন যাতে রিফ্রেশ করলে ড্রাফট হারিয়ে না যায়
//       const newUrl = `${window.location.pathname}?id=${res.data.doc._id}`;
//       window.history.replaceState(null, '', newUrl);
      
//       if (!title) setTitle(file.name.replace('.pdf', ''));
//       toast.success('PDF uploaded and draft created');
//     }
//   } catch (error) {
//     console.error("Upload error:", error);
//     toast.error('Upload failed. Check backend.');
//   } finally {
//     setUploading(false);
//   }
// };

//   // ✅ Save to Draft - FIXED (Send fileId)
//   const handleSave = async () => {
//     if (!title) {
//       toast.error('Please enter a document title');
//       return;
//     }
//     if (!fileUrl) {
//       toast.error('Please upload a document first');
//       return;
//     }

//     setSaving(true);
//     const data = {
//       title,
//       fileUrl,
//       fileId, // ✅ Send fileId to backend
//       parties,
//       fields,
//       totalPages,
//       status: doc?.status || 'draft',
//     };

//     try {
//       if (doc?._id || doc?.id) {
//         const id = doc._id || doc.id;
//         await api.put(`/documents/${id}`, data);
//         toast.success('Document updated');
//       } else {
//         const res = await api.post('/documents', data);
//         setDoc(res.data);
//         const newUrl = window.location.pathname + `?id=${res.data._id || res.data.id}`;
//         window.history.replaceState(null, '', newUrl);
//         toast.success('Draft saved successfully');
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       toast.error('Failed to save document');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ✅ Send for Signing - FIXED (Send fileId)
//   const handleSend = async () => {
//     if (sending) return;
//     if (!fileUrl) { toast.error('Upload a PDF first'); return; }
//     if (parties.length === 0) { toast.error('Add at least one signing party'); return; }
//     if (fields.length === 0) { toast.error('Please place signature fields on the PDF'); return; }
    
//     const hasEmptyEmail = parties.some(p => !p.email);
//     if (hasEmptyEmail) {
//       toast.error('All parties must have an email address');
//       return;
//     }

//     setSending(true);
//     try {
//       const data = {
//         title,
//         fileUrl,
//         fileId, // ✅ Send fileId to backend
//         parties,
//         fields,
//         totalPages
//       };

//       await api.post('/documents/send', data);
      
//       toast.success('Document sent! Signer 1 will receive an email shortly.');
//       navigate('/dashboard');
//     } catch (error) {
//       console.error("Send error:", error);
//       toast.error('Failed to send document for signing');
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleAddField = (type) => {
//     setPendingFieldType(type);
//   };

//   const isEditable = !doc || doc.status === 'draft';

//   return (
//     <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//         <div className="flex items-center gap-3">
//           <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl">
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <Input
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Document title"
//             disabled={!isEditable}
//             className="text-xl font-bold border-0 p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent text-slate-900 dark:text-white"
//           />
//         </div>
//         <div className="flex gap-2">
//           {isEditable && (
//             <>
//               <Button variant="outline" onClick={handleSave} disabled={saving || uploading} className="gap-2 rounded-xl">
//                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                 Save Draft
//               </Button>
//               <Button onClick={handleSend} disabled={sending || uploading} className="gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25">
//                 {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
//                 Send for Signing
//               </Button>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Left Sidebar */}
//         <div className="w-full lg:w-80 shrink-0 space-y-6">
//           {!fileUrl && (
//             <Card className="p-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//               <label className="flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-8 hover:border-sky-400 transition-colors">
//                 {uploading ? (
//                   <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
//                 ) : (
//                   <Upload className="w-8 h-8 text-slate-400" />
//                 )}
//                 <div className="text-center">
//                   <p className="text-sm font-medium">
//                     {uploading ? 'Uploading to Cloud...' : 'Upload PDF'}
//                   </p>
//                   <p className="text-xs text-slate-400 mt-1">Permanent storage</p>
//                 </div>
//                 <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
//               </label>
//             </Card>
//           )}

//           <Card className="p-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//             <PartyManager parties={parties} onChange={setParties} />
//           </Card>

//           {fileUrl && parties.length > 0 && (
//             <Card className="p-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
//               <FieldToolbar
//                 parties={parties}
//                 selectedPartyIndex={selectedPartyIndex}
//                 onPartySelect={setSelectedPartyIndex}
//                 onAddField={handleAddField}
//               />
//               {pendingFieldType && (
//                 <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4 text-sky-500" />
//                   <p className="text-xs text-sky-600">Click on the PDF to place field for {parties[selectedPartyIndex]?.name}</p>
//                 </div>
//               )}
//             </Card>
//           )}
//         </div>

//         {/* PDF Viewer Area */}
//         <div className="flex-1 min-w-0">
//           {fileUrl ? (
//             <PdfViewer
//               fileUrl={fileUrl}
//               fields={fields}
//               onFieldsChange={setFields}
//               currentPage={currentPage}
//               onPageChange={setCurrentPage}
//               totalPages={totalPages}
//               onTotalPagesChange={setTotalPages}
//               pendingFieldType={pendingFieldType}
//               selectedPartyIndex={selectedPartyIndex}
//               parties={parties}
//               onFieldPlaced={() => setPendingFieldType(null)}
//               readOnly={!isEditable}
//             />
//           ) : (
//             <div className="flex items-center justify-center min-h-[60vh] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50">
//               <div className="text-center text-slate-400">
//                 <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
//                 <p className="text-lg">Upload a PDF to start placing fields</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { toast } from 'sonner';
// import { Upload, Save, Send, ArrowLeft, FileText, Loader2, AlertCircle } from 'lucide-react';
// import PartyManager from '@/components/editor/PartyManager';
// import FieldToolbar from '@/components/editor/FieldToolbar';
// import PdfViewer from '@/components/editor/PdfViewer';

// export default function DocumentEditor() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const urlParams = new URLSearchParams(window.location.search);
//   const docId = urlParams.get('id');

//   const [doc, setDoc] = useState(null);
//   const [title, setTitle] = useState('');
//   const [fileUrl, setFileUrl] = useState('');
//   const [fileId, setFileId] = useState(''); 
//   const [parties, setParties] = useState([]);
//   const [fields, setFields] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
//   const [pendingFieldType, setPendingFieldType] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [sending, setSending] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       if (docId) {
//         try {
//           const res = await api.get(`/documents/${docId}`);
//           const d = res.data;
//           if (d) {
//             setDoc(d);
//             setTitle(d.title || '');
//             setFileUrl(d.fileUrl || '');
//             setFileId(d.fileId || ''); 
//             setParties(d.parties || []);
//             setFields(d.fields || []);
//             setTotalPages(d.totalPages || 1);
//           }
//         } catch (error) { toast.error("Failed to load document"); }
//       }
//     };
//     init();
//   }, [docId]);

//   const handleUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file || file.type !== 'application/pdf') {
//       toast.error('Please upload a valid PDF file');
//       return;
//     }
//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', file);
//     try {
//       const res = await api.post('/documents/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//       const data = res.data;
//       if (data.fileId) {
//         setFileUrl(data.fileUrl);
//         setFileId(data.fileId);
//         setTitle(file.name.replace('.pdf', ''));
//         setDoc(data);
//         const newUrl = `${window.location.pathname}?id=${data._id || data.id}`;
//         window.history.replaceState(null, '', newUrl);
//         toast.success('Document uploaded');
//       }
//     } catch (error) { toast.error('Upload failed'); } finally { setUploading(false); }
//   };

//   // const handleSave = async () => {
//   //   if (!fileUrl) return toast.error('Upload a document first');
//   //   setSaving(true);
//   //   try {
//   //     const id = doc?._id || doc?.id || docId;
//   //     await api.put(`/documents/${id}`, { title, fileUrl, fileId, parties, fields, totalPages, status: 'draft' });
//   //     toast.success('Draft updated');
//   //   } catch (error) { toast.error('Failed to save'); } finally { setSaving(false); }
//   // };
// // const handleSave = async () => {
// //     const currentId = doc?._id || doc?.id || docId;
// //     if (!currentId) return toast.error('Upload a document first');
    
// //     setSaving(true);
// //     try {
// //       // api.put ব্যবহার করে সঠিক আইডিতে ডেটা পাঠানো
// //       await api.put(`/documents/${currentId}`, { 
// //         title, fileUrl, fileId, parties, fields, totalPages 
// //       });
// //       toast.success('Draft updated');
// //     } catch (error) { 
// //       toast.error('Failed to save'); 
// //     } finally { 
// //       setSaving(false); 
// //     }
// //   };
//   // const handleSend = async () => {
//   //   const currentId = doc?._id || doc?.id || docId;
//   //   if (!fileId || parties.length === 0 || fields.length === 0) {
//   //     return toast.error('Please add parties and fields first');
//   //   }
//   //   setSending(true);
//   //   try {
//   //     const res = await api.post('/documents/send', { id: currentId, title, fileUrl, fileId, parties, fields, totalPages });
//   //     if (res.data.success) {
//   //       toast.success('Document sent!');
//   //       navigate('/dashboard');
//   //     }
//   //   } catch (error) { toast.error('Failed to send'); } finally { setSending(false); }
//   // };
// // const handleSend = async () => {
// //     const currentId = doc?._id || doc?.id || docId;
// //     if (!fileId || parties.length === 0 || fields.length === 0) {
// //       return toast.error('Please add parties and fields first');
// //     }
    
// //     setSending(true);
// //     try {
// //       // ব্যাকএন্ডের প্রত্যাশা অনুযায়ী 'id' কি-তে ডেটা পাঠানো
// //       const res = await api.post('/documents/send', { 
// //         id: currentId, title, fileUrl, fileId, parties, fields, totalPages 
// //       });
// //       if (res.data.success) {
// //         toast.success('Document sent!');
// //         navigate('/dashboard');
// //       }
// //     } catch (error) { 
// //       toast.error('Failed to send'); 
// //     } finally { 
// //       setSending(false); 
// //     }
// //   };
// const handleSave = async () => {
//   try {
//     console.log("Saving data...", { title, fields, parties }); // ডাটা চেক করার জন্য

//     const response = await axios.put(`http://localhost:5001/api/documents/${docId}`, {
//       title,
//       fields,
//       parties
//     });

//     if (response.data) {
//       console.log("Save successful:", response.data);
//       alert("Document saved successfully!");
//     }
//   } catch (error) {
//     console.error("❌ Save Error:", error.response?.data || error.message);
//     alert("Save failed: " + (error.response?.data?.error || "Unknown error"));
//   }
// };
// const handleSend = async () => {
//   try {
//     // ১. প্রথমে বর্তমান সব ডাটা (Parties & Fields) সেভ করুন
//     await axios.put(`http://localhost:5001/api/documents/${docId}`, {
//       title,
//       fields,
//       parties
//     });

//     // ২. সেভ সফল হলে ইমেইল পাঠানোর রিকোয়েস্ট দিন
//     const response = await axios.post('http://localhost:5001/api/documents/send', {
//       id: docId
//     });

//     if (response.data.success) {
//       alert("Document sent successfully to the first recipient!");
//     }
//   } catch (error) {
//     console.error("Error sending document:", error);
//     alert(error.response?.data?.error || "Failed to send document");
//   }
// };
//   const isEditable = !doc || doc.status === 'draft';

//   return (
//     <div className="max-w-[1400px] mx-auto px-4 py-8">
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
//         <div className="flex items-center gap-4 w-full sm:w-auto">
//           <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title" className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 bg-transparent" disabled={!isEditable} />
//         </div>
//         <div className="flex gap-3 w-full sm:w-auto">
//           <Button variant="outline" onClick={handleSave} disabled={saving || uploading} className="rounded-xl flex-1 sm:flex-none">
//             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
//           </Button>
//           <Button onClick={handleSend} disabled={sending || uploading} className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl flex-1 sm:flex-none">
//             {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Send
//           </Button>
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="w-full lg:w-80 space-y-6">
//           {!fileId && (
//             <Card className="p-8 border-dashed border-2 flex flex-col items-center text-center">
//               <Upload className={`w-12 h-12 mb-4 ${uploading ? 'animate-bounce text-sky-500' : 'text-slate-300'}`} />
//               <Button asChild variant="secondary" disabled={uploading}>
//                 <label className="cursor-pointer"> {uploading ? 'Uploading...' : 'Select File'}
//                   <input type="file" className="hidden" accept="application/pdf" onChange={handleUpload} />
//                 </label>
//               </Button>
//             </Card>
//           )}
//           <Card className="p-5 shadow-sm"> <PartyManager parties={parties} onChange={setParties} /> </Card>
//           {fileId && (
//             <Card className="p-5 shadow-sm">
//               <FieldToolbar parties={parties} selectedPartyIndex={selectedPartyIndex} onPartySelect={setSelectedPartyIndex} onAddField={(type) => setPendingFieldType(type)} />
//               {pendingFieldType && <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">Click on PDF to place {pendingFieldType}</div>}
//             </Card>
//           )}
//         </div>

//         <div className="flex-1">
//           {fileId ? (
//             <PdfViewer fileId={fileId} fields={fields} onFieldsChange={setFields} currentPage={currentPage} onPageChange={setCurrentPage} totalPages={totalPages} onTotalPagesChange={setTotalPages} pendingFieldType={pendingFieldType} selectedPartyIndex={selectedPartyIndex} parties={parties} onFieldPlaced={() => setPendingFieldType(null)} readOnly={!isEditable} />
//           ) : (
//             <div className="h-[600px] bg-slate-50 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-400">
//               <FileText className="w-20 h-20 mb-4 opacity-10" /> <p>No document uploaded yet</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/Card';
// import { toast } from 'sonner';
// import { Upload, Send, ArrowLeft, FileText, Loader2, Mail } from 'lucide-react';
// import PartyManager from '@/components/editor/PartyManager';
// import FieldToolbar from '@/components/editor/FieldToolbar';
// import PdfViewer from '@/components/editor/PdfViewer';

// export default function DocumentEditor() {
//   const navigate  = useNavigate();
//   const location  = useLocation();
//   const { user }  = useAuth();

//   const [docId]   = useState(() => new URLSearchParams(location.search).get('id'));
//   const [rawFile, setRawFile]   = useState(null);
//   const [title, setTitle]       = useState('');
//   const [fileUrl, setFileUrl]   = useState('');
//   const [fileId, setFileId]     = useState('');
//   const [parties, setParties]   = useState([]);
//   const [fields, setFields]     = useState([]);
//   const [ccEmails, setCcEmails] = useState([]);
//   const [currentPage, setCurrentPage]     = useState(1);
//   const [totalPages, setTotalPages]       = useState(1);
//   const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
//   const [pendingFieldType, setPendingFieldType]     = useState(null);
//   const [processing, setProcessing] = useState(false);

//   useEffect(() => {
//     if (!docId || docId === 'new') return;
//     api.get(`/documents/${docId}`)
//       .then(res => {
//         const d = res.data.document || res.data;
//         setTitle(d.title || '');
//         setFileUrl(d.fileUrl || '');
//         setFileId(d.fileId || 'existing');
//         setParties(d.parties || []);
//         setCcEmails(d.ccEmails || []);
//         setFields(d.fields?.map(f => typeof f === 'string' ? JSON.parse(f) : f) || []);
//       })
//       .catch(() => toast.error('Failed to load document'));
//   }, [docId]);

//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file || file.type !== 'application/pdf')
//       return toast.error('Please upload a valid PDF file');
//     setRawFile(file);
//     setTitle(file.name.replace('.pdf', ''));
//     setFileUrl(URL.createObjectURL(file));
//     setFileId('preview');
//     toast.success('PDF loaded! Now add parties and fields.');
//   };

//   const handleSend = async () => {
//     if (!rawFile && !fileUrl) return toast.error('Please upload a PDF file');
//     if (!parties.length)       return toast.error('Please add at least one signer');
//     if (!parties.every(p => p.name && p.email))
//       return toast.error('All parties need a name and email');
//     if (!fields.length)        return toast.error('Please place at least one signature field');

//     setProcessing(true);
//     try {
//       const formData = new FormData();
//       if (rawFile instanceof File) formData.append('file', rawFile);
//       formData.append('title',      title || 'Untitled');
//       formData.append('parties',    JSON.stringify(parties));
//       formData.append('ccEmails',   JSON.stringify(ccEmails));
//       formData.append('fields',     JSON.stringify(fields));
//       formData.append('totalPages', String(totalPages));

//       const res = await api.post('/documents/upload-and-send', formData);
//       if (res.data.success) {
//         toast.success('Document sent to all parties!');
//         navigate('/dashboard');
//       }
//     } catch (error) {
//       console.error('Upload Error:', error.response?.data);
//       toast.error(error.response?.data?.error || 'Failed to send document');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <div className="max-w-[1400px] mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
//         <div className="flex items-center gap-4 w-full sm:w-auto">
//           <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
//             <ArrowLeft className="w-5 h-5 text-slate-600" />
//           </Button>
//           <div className="flex flex-col">
//             <Input
//               value={title}
//               onChange={e => setTitle(e.target.value)}
//               placeholder="Document Title"
//               className="text-xl font-bold border-none shadow-none focus-visible:ring-0 bg-transparent p-0 h-auto"
//             />
//             <span className="text-[10px] text-[#28ABDF] font-bold uppercase tracking-widest">NeXsign Editor</span>
//           </div>
//         </div>
//         <Button
//           onClick={handleSend}
//           disabled={processing || !fileUrl}
//           className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl px-8 shadow-lg transition-all active:scale-95 w-full sm:w-auto"
//         >
//           {processing
//             ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
//             : <Send className="w-4 h-4 mr-2" />}
//           {docId && docId !== 'new' ? 'Update & Send' : 'Confirm & Send'}
//         </Button>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* Sidebar */}
//         <div className="w-full lg:w-80 space-y-6 lg:sticky lg:top-4 lg:self-start">
//           {!fileId && (
//             <Card className="p-10 border-dashed border-2 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
//               <Upload className="w-12 h-12 mb-4 text-slate-300" />
//               <Button asChild variant="secondary" className="rounded-lg">
//                 <label className="cursor-pointer">
//                   Select PDF
//                   <input type="file" className="hidden" accept="application/pdf" onChange={handleFileSelect} />
//                 </label>
//               </Button>
//             </Card>
//           )}

//           <Card className="p-5 shadow-sm border-slate-100 dark:border-slate-800 rounded-2xl">
//             <PartyManager parties={parties} onChange={setParties} />
//           </Card>

//           <Card className="p-5 shadow-sm border-slate-100 dark:border-slate-800 rounded-2xl">
//             <div className="flex items-center gap-2 mb-3 font-semibold text-slate-700 dark:text-slate-300 text-sm">
//               <Mail size={16} className="text-[#28ABDF]" /> CC Recipients
//             </div>
//             <Input
//               placeholder="Emails (comma separated)"
//               value={ccEmails.join(', ')}
//               onChange={e => setCcEmails(
//                 e.target.value.split(',').map(email => email.trim()).filter(Boolean)
//               )}
//               className="text-xs rounded-lg"
//             />
//           </Card>

//           {fileId && (
//             <Card className="p-5 shadow-sm border-slate-100 dark:border-slate-800 rounded-2xl">
//               <FieldToolbar
//                 parties={parties}
//                 selectedPartyIndex={selectedPartyIndex}
//                 onPartySelect={setSelectedPartyIndex}
//                 onAddField={type => setPendingFieldType(type)}
//               />
//             </Card>
//           )}
//         </div>

//         {/* PDF Viewer */}
//         <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[800px]">
//           {fileId ? (
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
//             />
//           ) : (
//             <div className="h-full flex flex-col items-center justify-center text-slate-300 py-40">
//               <FileText className="w-20 h-20 mb-4 opacity-10" />
//               <p className="font-medium text-slate-400">Upload a PDF to begin</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { Upload, Send, ArrowLeft, FileText, Loader2, Mail, X } from 'lucide-react';
import PartyManager from '@/components/editor/PartyManager';
import FieldToolbar from '@/components/editor/FieldToolbar';
import PdfViewer from '@/components/editor/PdfViewer';

export default function DocumentEditor() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  const [docId] = useState(() => {
    const id = new URLSearchParams(location.search).get('id');
    return id === 'new' ? null : id;
  });

  const [rawFile, setRawFile]     = useState(null);
  const [title, setTitle]         = useState('');
  const [fileUrl, setFileUrl]     = useState('');
  const [fileReady, setFileReady] = useState(false); // true once a file is selected/loaded
  const [parties, setParties]     = useState([]);
  const [fields, setFields]       = useState([]);
  const [ccEmails, setCcEmails]   = useState([]);
  const [ccInput, setCcInput]     = useState('');

  const [currentPage, setCurrentPage]               = useState(1);
  const [totalPages, setTotalPages]                 = useState(1);
  const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
  const [pendingFieldType, setPendingFieldType]     = useState(null);
  const [processing, setProcessing]                 = useState(false);

  // ── Load existing document ───────────────────────────────────────────────
  useEffect(() => {
    if (!docId) return;
    api.get(`/documents/${docId}`)
      .then(res => {
        const d = res.data.document || res.data;
        setTitle(d.title || '');
        setFileUrl(d.fileUrl || '');
        setFileReady(true);
        setParties(d.parties || []);
        setCcEmails(d.ccEmails || []);
        setFields((d.fields || []).map(f => typeof f === 'string' ? JSON.parse(f) : f));
      })
      .catch(() => toast.error('Failed to load document'));
  }, [docId]);

  // ── File selection ───────────────────────────────────────────────────────
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('PDF must be under 15MB.');
      return;
    }

    // Revoke previous blob URL to free memory
    if (fileUrl?.startsWith('blob:')) URL.revokeObjectURL(fileUrl);

    setRawFile(file);
    setTitle(prev => prev || file.name.replace(/\.pdf$/i, ''));
    setFileUrl(URL.createObjectURL(file));
    setFileReady(true);
    setFields([]); // reset fields when new file is chosen
    setCurrentPage(1);
    toast.success('PDF loaded! Add parties and place signature fields.');

    // Reset the input so the same file can be re-selected if needed
    e.target.value = '';
  }, [fileUrl]);

  // ── CC email helpers ─────────────────────────────────────────────────────
  const addCcEmail = () => {
    const email = ccInput.trim().toLowerCase();
    if (!email) return;
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (ccEmails.includes(email)) {
      toast.error('This email is already added.');
      return;
    }
    setCcEmails(prev => [...prev, email]);
    setCcInput('');
  };

  const removeCcEmail = (email) => {
    setCcEmails(prev => prev.filter(e => e !== email));
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    if (!rawFile && !fileUrl) {
      toast.error('Please upload a PDF file first.');
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
      toast.error('All signers need a name and email address.');
      return false;
    }
    // Basic email validation for parties
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (parties.some(p => !emailRegex.test(p.email))) {
      toast.error('One or more signer emails are invalid.');
      return false;
    }
    if (!fields.length) {
      toast.error('Please place at least one signature or text field on the document.');
      return false;
    }
    // Check each party has at least one field
    const partiesWithFields = new Set(fields.map(f => Number(f.partyIndex)));
    const missingParty = parties.find((_, i) => !partiesWithFields.has(i));
    if (missingParty) {
      toast.error(`Please add a field for "${missingParty.name}".`);
      return false;
    }
    return true;
  };

  // ── Send document ────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!validate()) return;
    setProcessing(true);

    try {
      const formData = new FormData();

      // ✅ FIX: only append file if it's a fresh File object (not an existing Cloudinary URL)
      if (rawFile instanceof File) {
        formData.append('file', rawFile);
      }

      formData.append('title',      title.trim());
      formData.append('parties',    JSON.stringify(
        parties.map(p => ({ name: p.name.trim(), email: p.email.trim().toLowerCase() }))
      ));
      formData.append('ccEmails',   JSON.stringify(ccEmails));
      formData.append('fields',     JSON.stringify(fields));
      formData.append('totalPages', String(totalPages));

      const res = await api.post('/documents/upload-and-send', formData);

      if (res.data?.success) {
        toast.success('🎉 Document sent to all signers!');
        // Revoke blob URL before navigating away
        if (fileUrl?.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
        navigate('/dashboard');
      } else {
        toast.error(res.data?.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to send document.';
      console.error('Send error:', err.response?.data || err);
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const canSend = fileReady && parties.length > 0 && fields.length > 0 && !processing;

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-6 sm:py-8">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="rounded-full flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div className="flex flex-col min-w-0 flex-1">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Document Title..."
              className="text-lg sm:text-xl font-bold border-none shadow-none focus-visible:ring-0 bg-transparent p-0 h-auto truncate"
            />
            <span className="text-[10px] text-[#28ABDF] font-bold uppercase tracking-widest">
              NeXsign Editor
            </span>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={!canSend}
          className="bg-[#28ABDF] hover:bg-[#2399c8] disabled:opacity-40 text-white rounded-xl px-6 sm:px-8 h-11 shadow-lg transition-all active:scale-95 w-full sm:w-auto font-semibold"
        >
          {processing
            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</>
            : <><Send className="w-4 h-4 mr-2" /> {docId ? 'Update & Send' : 'Confirm & Send'}</>
          }
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className="w-full lg:w-[300px] xl:w-[320px] space-y-4 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pb-4">

          {/* PDF Upload */}
          {!fileReady ? (
            <Card className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl gap-3">
              <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center">
                <Upload className="w-7 h-7 text-[#28ABDF]" />
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Upload PDF</p>
                <p className="text-xs text-slate-400 mt-1">Max 15MB</p>
              </div>
              <Button asChild variant="secondary" className="rounded-xl w-full font-semibold">
                <label className="cursor-pointer">
                  Select PDF File
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                  />
                </label>
              </Button>
            </Card>
          ) : (
            // Replace PDF button (shown when a file is already loaded)
            <Card className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
              <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-[#28ABDF]" />
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate flex-1 min-w-0">
                {rawFile?.name || title || 'Document loaded'}
              </p>
              <Button asChild variant="ghost" size="sm" className="rounded-lg text-xs text-slate-400 hover:text-[#28ABDF] flex-shrink-0">
                <label className="cursor-pointer">
                  Change
                  <input type="file" className="hidden" accept="application/pdf" onChange={handleFileSelect} />
                </label>
              </Button>
            </Card>
          )}

          {/* Parties */}
          <Card className="p-4 shadow-sm border-slate-100 dark:border-slate-800 rounded-2xl">
            <PartyManager parties={parties} onChange={setParties} />
          </Card>

          {/* CC Recipients */}
          <Card className="p-4 shadow-sm border-slate-100 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-3 font-semibold text-slate-700 dark:text-slate-300 text-sm">
              <Mail size={15} className="text-[#28ABDF]" />
              CC Recipients
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="email@example.com"
                value={ccInput}
                onChange={e => setCcInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCcEmail())}
                className="text-xs rounded-lg h-9 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCcEmail}
                className="rounded-lg h-9 px-3 text-xs font-semibold border-[#28ABDF] text-[#28ABDF] hover:bg-[#28ABDF] hover:text-white"
              >
                Add
              </Button>
            </div>
            {ccEmails.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ccEmails.map(email => (
                  <span
                    key={email}
                    className="flex items-center gap-1 text-[10px] bg-sky-50 text-sky-700 border border-sky-100 rounded-full px-2.5 py-1 font-medium"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeCcEmail(email)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Field Toolbar — only shown when a file is ready and parties exist */}
          {fileReady && parties.length > 0 && (
            <Card className="p-4 shadow-sm border-slate-100 dark:border-slate-800 rounded-2xl">
              <FieldToolbar
                parties={parties}
                selectedPartyIndex={selectedPartyIndex}
                onPartySelect={setSelectedPartyIndex}
                onAddField={type => setPendingFieldType(type)}
                pendingFieldType={pendingFieldType}
              />
            </Card>
          )}

          {/* Fields summary */}
          {fields.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">
                {fields.length} field{fields.length > 1 ? 's' : ''} placed
              </p>
              {parties.map((p, i) => {
                const count = fields.filter(f => Number(f.partyIndex) === i).length;
                return count > 0 ? (
                  <div key={i} className="flex justify-between items-center text-[11px] py-1">
                    <span className="font-medium text-slate-600 dark:text-slate-400 truncate mr-2">{p.name}</span>
                    <span className="font-bold text-[#28ABDF]">{count} field{count > 1 ? 's' : ''}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* ── PDF Viewer ──────────────────────────────────────────────── */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[600px] sm:min-h-[800px]">
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
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-32 px-8 text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 opacity-30" />
              </div>
              <p className="font-semibold text-slate-400 text-lg mb-2">No document yet</p>
              <p className="text-slate-300 text-sm">Upload a PDF from the sidebar to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}