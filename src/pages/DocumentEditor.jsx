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
//   const initialDocId = urlParams.get('id');

//   const [docId, setDocId] = useState(initialDocId);
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
//       if (data.fileId || data._id) {
//         const newId = data._id || data.id;
//         setDocId(newId);
//         setFileUrl(data.fileUrl);
//         setFileId(data.fileId);
//         setTitle(file.name.replace('.pdf', ''));
//         setDoc(data);
//         const newUrl = `${window.location.pathname}?id=${newId}`;
//         window.history.replaceState(null, '', newUrl);
//         toast.success('Document uploaded');
//       }
//     } catch (error) { toast.error('Upload failed'); } finally { setUploading(false); }
//   };

//   const handleSave = async () => {
//     if (!docId) return toast.error('Upload a document first');
//     setSaving(true);
//     try {
//       await api.put(`/documents/${docId}`, { 
//         title, 
//         fileUrl, 
//         fileId, 
//         parties, 
//         fields, 
//         totalPages 
//       });
//       toast.success('Draft updated');
//     } catch (error) { 
//       toast.error('Failed to save'); 
//     } finally { 
//       setSaving(false); 
//     }
//   };

//   const handleSend = async () => {
//     if (!docId || !fileId || parties.length === 0 || fields.length === 0) {
//       return toast.error('Please add parties and fields first');
//     }
//     setSending(true);
//     try {
//       // সেভ এবং সেন্ড একসাথেই হবে
//       await api.put(`/documents/${docId}`, { title, parties, fields, totalPages });
      
//       const res = await api.post('/documents/send', { id: docId });
//       if (res.data.success) {
//         toast.success('Document sent!');
//         navigate('/dashboard');
//       }
//     } catch (error) { 
//       const errorMsg = error.response?.data?.error || 'Failed to send';
//       toast.error(errorMsg); 
//     } finally { 
//       setSending(false); 
//     }
//   };

//   const isEditable = !doc || doc.status === 'draft';

//   return (
//     <div className="max-w-[1400px] mx-auto px-4 py-8">
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
//         <div className="flex items-center gap-4 w-full sm:w-auto">
//           <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <Input 
//             value={title} 
//             onChange={e => setTitle(e.target.value)} 
//             placeholder="Document title" 
//             className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 bg-transparent" 
//             disabled={!isEditable} 
//           />
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
//           <Card className="p-5 shadow-sm"> 
//             <PartyManager parties={parties} onChange={setParties} /> 
//           </Card>
//           {fileId && (
//             <Card className="p-5 shadow-sm">
//               <FieldToolbar 
//                 parties={parties} 
//                 selectedPartyIndex={selectedPartyIndex} 
//                 onPartySelect={setSelectedPartyIndex} 
//                 onAddField={(type) => setPendingFieldType(type)} 
//               />
//               {pendingFieldType && <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">Click on PDF to place {pendingFieldType}</div>}
//             </Card>
//           )}
//         </div>

//         <div className="flex-1">
//           {fileId ? (
//             <PdfViewer 
//               fileId={fileId} 
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
//             <div className="h-[600px] bg-slate-50 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-400">
//               <FileText className="w-20 h-20 mb-4 opacity-10" /> <p>No document uploaded yet</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { Upload, Save, Send, ArrowLeft, Loader2 } from 'lucide-react';
import PartyManager from '@/components/editor/PartyManager';
import FieldToolbar from '@/components/editor/FieldToolbar';
import PdfViewer from '@/components/editor/PdfViewer';
import axios from 'axios';

export default function DocumentEditor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const initialDocId = urlParams.get('id');

  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileId, setFileId] = useState(''); 
  const [parties, setParties] = useState([]);
  const [fields, setFields] = useState([]);
  const [ccEmails, setCcEmails] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const [pendingFieldType, setPendingFieldType] = useState(null);
  const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // 🚀 ১. ডাটা লোড করার সময় JSON পার্সিং ফিক্স
  useEffect(() => {
    if (initialDocId && initialDocId !== 'new') {
      api.get(`/documents/${initialDocId}`).then(res => {
        const d = res.data;
        setTitle(d.title || '');
        setFileUrl(d.fileUrl || '');
        setFileId(d.fileId || ''); 
        setParties(d.parties || []);
        setCcEmails(d.ccEmails || []);
        if (d.fields) {
          // ডাটাবেস থেকে আসা স্ট্রিং ফিল্ডগুলোকে অবজেক্টে রূপান্তর
          const parsedFields = d.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);
          setFields(parsedFields);
        }
      }).catch(() => toast.error("Error loading document"));
    }
  }, [initialDocId]);

  // 🚀 ২. ফিল্ড ডিলিট লজিক (যা আপনার কাজ করছিল না)
  const handleDeleteField = useCallback((fieldId) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    toast.success("Field removed");
  }, []);

  // 🚀 ৩. ফিল্ড আপডেট লজিক (পজিশন বা সাইজ চেঞ্জ হলে)
  const handleUpdateField = useCallback((fieldId, updates) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  }, []);

  const handleLocalUpload = (e) => {
    const file = e.target.files[0];
    if (file?.type !== 'application/pdf') return toast.error("Select a PDF");
    setPendingFile(file);
    setFileUrl(URL.createObjectURL(file));
    setFileId('local_preview');
    setTitle(file.name.replace('.pdf', ''));
  };

  const uploadToCloudinary = async () => {
    const formData = new FormData();
    formData.append('file', pendingFile);
    formData.append('upload_preset', 'nextsign'); 
    const res = await axios.post(`https://api.cloudinary.com/v1_1/dk9v5b3zj/raw/upload`, formData);
    return { url: res.data.secure_url, id: res.data.public_id };
  };

  const preparePayload = (overrides = {}) => ({
    title: title || 'Untitled',
    fileUrl: overrides.fileUrl || fileUrl,
    fileId: overrides.fileId || fileId,
    parties,
    // ব্যাকএন্ডে পাঠানোর আগে স্ট্রিং করে পাঠানো নিরাপদ
    fields: fields.map(f => JSON.stringify(f)),
    ccEmails,
    senderMeta: { name: user?.full_name, email: user?.email },
    ...overrides
  });

  const handleSave = async () => {
    if (!fileUrl) return toast.error("Upload PDF first");
    setSaving(true);
    try {
      let finalFile = { url: fileUrl, id: fileId };
      if (fileId === 'local_preview') finalFile = await uploadToCloudinary();
      
      const payload = preparePayload({ fileUrl: finalFile.url, fileId: finalFile.id });
      
      // ডাইনামিক রুট (নতুন না এডিট)
      if (initialDocId && initialDocId !== 'new') {
        await api.put(`/documents/${initialDocId}`, payload);
      } else {
        await api.post('/documents/upload-metadata', payload);
      }
      
      toast.success("Draft saved!");
      navigate('/dashboard');
    } catch (err) { toast.error("Save failed"); } finally { setSaving(false); }
  };

  const handleSend = async () => {
    if (!fileUrl || parties.length === 0 || fields.length === 0) {
      return toast.error("Please add parties and place fields first");
    }
    setSending(true);
    try {
      let finalFile = { url: fileUrl, id: fileId };
      if (fileId === 'local_preview') finalFile = await uploadToCloudinary();
      
      await api.post('/documents/send', preparePayload({ 
        id: initialDocId !== 'new' ? initialDocId : undefined,
        fileUrl: finalFile.url, 
        fileId: finalFile.id 
      }));
      
      toast.success("Document sent for signing!");
      navigate('/dashboard');
    } catch (err) { toast.error("Send failed"); } finally { setSending(false); }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft /></Button>
          <Input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="text-xl font-bold border-none bg-transparent focus-visible:ring-0 w-64" 
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave} disabled={saving || sending}>
            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Save Draft
          </Button>
          <Button onClick={handleSend} disabled={sending || saving} className="bg-[#28ABDF] text-white hover:bg-[#1e8db8]">
            {sending ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />} Send Now
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {!fileUrl && (
            <Card className="p-8 border-dashed border-2 text-center bg-slate-50/50">
              <Upload className="mx-auto mb-4 text-slate-400" />
              <label className="cursor-pointer bg-[#28ABDF] text-white px-4 py-2 rounded-lg font-medium inline-block transition-transform active:scale-95"> 
                Select PDF
                <input type="file" className="hidden" accept="application/pdf" onChange={handleLocalUpload} />
              </label>
            </Card>
          )}

          <Card className="p-5">
            <PartyManager parties={parties} onChange={setParties} />
          </Card>

          {fileUrl && (
            <Card className="p-5">
              <FieldToolbar 
                parties={parties} 
                onAddField={(type, partyIdx) => {
                  setPendingFieldType(type);
                  setSelectedPartyIndex(partyIdx);
                  toast.info(`Click on PDF to place ${type}`);
                }} 
              />
            </Card>
          )}
        </div>

        {/* Center Canvas */}
        <div className="flex-1 min-h-[800px] bg-white border rounded-3xl overflow-hidden shadow-inner relative">
          {fileUrl ? (
            <PdfViewer 
              fileUrl={fileUrl} 
              fields={fields} 
              onFieldsChange={setFields} 
              onUpdateField={handleUpdateField} // 🌟 নতুন
              onDeleteField={handleDeleteField} // 🌟 নতুন
              parties={parties}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              pendingFieldType={pendingFieldType}
              selectedPartyIndex={selectedPartyIndex}
              onFieldPlaced={() => setPendingFieldType(null)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
              Upload a PDF to start adding fields
            </div>
          )}
        </div>
      </div>
    </div>
  );
}