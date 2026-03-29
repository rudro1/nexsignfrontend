import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Upload, Send, ArrowLeft, FileText,
  Loader2, Mail, X, ImagePlus, ChevronRight,
  ChevronLeft, CheckCircle2, Settings2, Users,
  Plus, Trash2, PenTool, Type,
} from 'lucide-react';
import PartyManager from '@/components/editor/PartyManager';
import FieldToolbar  from '@/components/editor/FieldToolbar';
import PdfViewer     from '@/components/editor/PdfViewer';

const FONT_FAMILIES = [
  { label: 'Helvetica',        value: 'Helvetica'       },
  { label: 'Times New Roman',  value: 'Times New Roman' },
  { label: 'Courier',          value: 'Courier'         },
];
const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24];

export default function DocumentEditor() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { id: pathId } = useParams();
  const { user }  = useAuth();

  const [docId] = useState(() => {
    if (pathId && pathId !== 'new') return pathId;
    const qId = new URLSearchParams(location.search).get('id');
    return qId === 'new' ? null : qId;
  });

  // ── Wizard State ───────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Core state ───────────────────────────────────────────────
  const [rawFile,    setRawFile]    = useState(null);
  const [title,      setTitle]      = useState('');
  const [fileUrl,    setFileUrl]    = useState('');
  const [fileReady,  setFileReady]  = useState(false);
  const [parties,    setParties]    = useState([{ name: user?.full_name || '', email: user?.email || '', order: 0, status: 'pending', color: '#0ea5e9' }]);
  const [fields,     setFields]     = useState([]);
  const [ccList,     setCcList]     = useState([]);
  const [companyLogo,    setCompanyLogo]    = useState('');
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState('');
  const [companyName,    setCompanyName]    = useState('');

  // ── CC input ─────────────────────────────────────────────────
  const [ccEmail,       setCcEmail]       = useState('');
  const [ccName,        setCcName]        = useState('');
  const [ccDesignation, setCcDesignation] = useState('');

  // ── Editor state ─────────────────────────────────────────────
  const [currentPage,        setCurrentPage]        = useState(1);
  const [totalPages,         setTotalPages]          = useState(1);
  const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
  const [pendingFieldType,   setPendingFieldType]   = useState(null);
  const [processing,         setProcessing]         = useState(false);
  const [selectedFieldId,    setSelectedFieldId]    = useState(null);

  const selectedField = useMemo(() => fields.find(f => f.id === selectedFieldId), [fields, selectedFieldId]);

  // ── Load existing doc ────────────────────────────────────────
  useEffect(() => {
    if (!docId) return;
    api.get(`/documents/${docId}`)
      .then(res => {
        const d = res.data.document || res.data;
        setTitle(d.title || '');
        setFileUrl(d.fileUrl || '');
        setFileReady(true);
        setParties(d.parties?.length ? d.parties : [{ name: user?.full_name || '', email: user?.email || '', order: 0, status: 'pending', color: '#0ea5e9' }]);
        setCcList(d.ccList || []);
        setCompanyLogo(d.companyLogo || '');
        setCompanyLogoPreview(d.companyLogo || '');
        setCompanyName(d.companyName || '');
        setFields((d.fields || []).map(f =>
          typeof f === 'string' ? JSON.parse(f) : f
        ));
        // If it has a file, jump to step 4 or stay at 1?
        // Let's stay at 1 but show it's ready.
      })
      .catch(() => toast.error('Failed to load document'));
  }, [docId, user]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF.');
      return;
    }
    if (fileUrl?.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
    setRawFile(file);
    setTitle(prev => prev || file.name.replace(/\.pdf$/i, ''));
    setFileUrl(URL.createObjectURL(file));
    setFileReady(true);
    setFields([]);
    setCurrentPage(1);
    e.target.value = '';
  }, [fileUrl]);

  const handleLogoSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompanyLogoFile(file);
    setCompanyLogoPreview(URL.createObjectURL(file));
    e.target.value = '';
  }, []);

  const addCc = () => {
    const email = ccEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email address.');
      return;
    }
    setCcList(prev => [...prev, { email, name: ccName.trim(), designation: ccDesignation.trim() }]);
    setCcEmail(''); setCcName(''); setCcDesignation('');
  };

  const updateFieldTypography = (key, value) => {
    if (!selectedFieldId) return;
    setFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, [key]: value } : f));
  };

  const validate = () => {
    if (!fileUrl) { toast.error('Please upload a PDF.'); return false; }
    if (!title.trim()) { toast.error('Please enter a title.'); return false; }
    if (!parties.length) { toast.error('Add at least one signer.'); return false; }
    if (parties.some(p => !p.name?.trim() || !p.email?.trim())) { toast.error('All signers need name and email.'); return false; }
    if (!fields.length) { toast.error('Place at least one field.'); return false; }
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setProcessing(true);
    try {
      const formData = new FormData();
      if (rawFile) formData.append('file', rawFile);
      formData.append('title', title.trim());
      formData.append('parties', JSON.stringify(parties));
      formData.append('ccRecipients', JSON.stringify(ccList));
      formData.append('fields', JSON.stringify(fields));
      formData.append('totalPages', String(totalPages));
      formData.append('companyName', companyName.trim());
      formData.append('docId', docId || '');

      if (companyLogoFile) {
        const logoForm = new FormData();
        logoForm.append('logo', companyLogoFile);
        const logoRes = await api.post('/documents/upload-logo', logoForm);
        if (logoRes.data?.logoUrl) formData.append('companyLogo', logoRes.data.logoUrl);
      } else if (companyLogo) {
        formData.append('companyLogo', companyLogo);
      }

      await api.post('/documents/upload-and-send', formData);
      navigate('/dashboard');
      toast.success('Document sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send.');
    } finally {
      setProcessing(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!fileUrl || !title.trim())) return toast.error('Upload PDF and enter title');
    if (step === 2 && parties.some(p => !p.name.trim() || !p.email.trim())) return toast.error('Fill all signer details');
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden font-sans">
      {/* ── TOP NAV ── */}
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-50 shadow-sm">
        <div className="flex items-center gap-6 flex-1 mr-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-2xl h-12 w-12 shrink-0 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100">
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </Button>
          <div className="flex flex-col min-w-0">
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Enter Document Title..."
              className="bg-transparent border-none focus:ring-0 font-black text-slate-900 dark:text-white truncate text-xl p-0 uppercase tracking-tight"
            />
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step {step} of 5:</span>
              <span className="text-[10px] font-black text-[#28ABDF] uppercase tracking-[0.2em]">
                {step === 1 && 'Upload & Branding'}
                {step === 2 && 'Signing Parties'}
                {step === 3 && 'CC Recipients'}
                {step === 4 && 'PDF Editor'}
                {step === 5 && 'Review & Finalize'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest border-2">
              Back
            </Button>
          )}
          {step < 5 ? (
            <Button onClick={nextStep} className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest gap-2 shadow-xl">
              Next <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={handleSend} disabled={processing || !fileReady}
              className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-2xl h-12 px-10 font-black uppercase tracking-widest gap-2 shadow-xl shadow-sky-500/20"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Send Now
            </Button>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* SIDEBAR WIZARD */}
        <aside className="w-full md:w-[400px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto flex-shrink-0 z-40 shadow-lg">
          
          {/* STEP 1: UPLOAD & BRANDING */}
          {step === 1 && (
            <div className="p-8 space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#28ABDF]" />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">1. Document Source</h3>
                </div>
                
                {!fileReady ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] cursor-pointer hover:border-[#28ABDF] hover:bg-sky-50/30 transition-all group">
                    <Upload className="w-12 h-12 text-slate-200 group-hover:text-[#28ABDF] mb-4 transition-transform group-hover:-translate-y-1" />
                    <span className="text-xs font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest">Drop PDF here or click</span>
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileSelect} />
                  </label>
                ) : (
                  <div className="p-6 bg-sky-50/50 dark:bg-sky-900/10 border-2 border-sky-100 dark:border-sky-800 rounded-[2rem] flex items-center gap-4 relative group">
                    <div className="h-14 w-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                      <FileText className="w-7 h-7 text-[#28ABDF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">{title}.pdf</p>
                      <button onClick={() => setFileReady(false)} className="text-[10px] font-black text-[#28ABDF] hover:underline uppercase tracking-widest mt-1">Replace Document</button>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                    <ImagePlus className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">2. Brand Identity</h3>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</Label>
                    <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Acme Corporation" className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold px-5 focus:ring-[#28ABDF] focus:border-[#28ABDF]" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Logo</Label>
                    <div className="flex items-center gap-5">
                      <label className="cursor-pointer h-20 w-20 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center hover:border-[#28ABDF] transition-all shrink-0 overflow-hidden bg-white dark:bg-slate-800 shadow-sm group">
                        {companyLogoPreview ? (
                          <img src={companyLogoPreview} alt="Logo" className="h-full w-full object-contain p-2" />
                        ) : (
                          <ImagePlus className="w-8 h-8 text-slate-200 group-hover:text-[#28ABDF]" />
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoSelect} />
                      </label>
                      <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                        Recommended: Transparent PNG.<br/>Will appear in request emails.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* STEP 2: PARTIES */}
          {step === 2 && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Signing Workflow</h3>
              </div>
              <PartyManager parties={parties} onChange={setParties} />
            </div>
          )}

          {/* STEP 3: CC */}
          {step === 3 && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#28ABDF]" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Carbon Copy (CC)</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
                    <Input value={ccName} onChange={e => setCcName(e.target.value)} placeholder="Recipient Name" className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold px-5" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
                    <Input value={ccEmail} onChange={e => setCcEmail(e.target.value)} placeholder="email@company.com" className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold px-5" />
                  </div>
                </div>
                <Button onClick={addCc} variant="outline" className="w-full h-12 rounded-2xl border-2 font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">+ Add Recipient</Button>
                
                <div className="space-y-3 pt-4">
                  {ccList.map((cc, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm group">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{cc.name || 'No Name'}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{cc.email}</p>
                      </div>
                      <button onClick={() => setCcList(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-200 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PDF EDITOR */}
          {step === 4 && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Field Placement</h3>
              </div>
              
              <FieldToolbar
                parties={parties}
                selectedPartyIndex={selectedPartyIndex}
                onPartySelect={setSelectedPartyIndex}
                onAddField={type => setPendingFieldType(type)}
              />

              {selectedField?.type === 'text' && (
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Text Configuration</p>
                  <div className="grid grid-cols-1 gap-3">
                    <Select value={selectedField.fontFamily || 'Helvetica'} onValueChange={v => updateFieldTypography('fontFamily', v)}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>{FONT_FAMILIES.map(f => (<SelectItem key={f.value} value={f.value} className="font-bold">{f.label}</SelectItem>))}</SelectContent>
                    </Select>
                    <Select value={String(selectedField.fontSize || 12)} onValueChange={v => updateFieldTypography('fontSize', Number(v))}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>{FONT_SIZES.map(s => (<SelectItem key={s} value={String(s)} className="font-bold">{s}px</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="p-8 space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Final Review</h3>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-700">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-700">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signers</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{parties.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-700">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fields</span>
                    <span className="text-xs font-black text-[#28ABDF] uppercase tracking-tight">{fields.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CC Recipients</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{ccList.length}</span>
                  </div>
                </div>

                <div className="p-6 bg-sky-50/50 dark:bg-sky-900/10 rounded-[2rem] border border-sky-100 dark:border-sky-800 text-center">
                  <p className="text-[10px] font-black text-sky-700 dark:text-sky-400 uppercase tracking-[0.15em] leading-relaxed">
                    Once sent, signers will receive an email in the defined order to securely sign this document.
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* CENTER VIEWER (Always visible if PDF exists) */}
        <section className="flex-1 flex flex-col min-w-0 bg-slate-100 dark:bg-slate-950 order-1 md:order-2">
          <div className="flex-1 overflow-auto p-4 md:p-12 flex justify-center items-start min-h-0">
            {fileReady ? (
              <div className="max-w-full w-fit shadow-2xl shadow-slate-300/50 dark:shadow-black/50 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                <PdfViewer
                  fileUrl={fileUrl}
                  fields={fields}
                  onFieldsChange={setFields}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onTotalPagesChange={setTotalPages}
                  selectedPartyIndex={selectedPartyIndex}
                  pendingFieldType={pendingFieldType}
                  parties={parties}
                  onFieldPlaced={() => setPendingFieldType(null)}
                  selectedFieldId={selectedFieldId}
                  onFieldSelect={setSelectedFieldId}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 px-8 text-center animate-pulse">
                <FileText className="w-24 h-24 opacity-10 mb-6" />
                <p className="font-black text-slate-400 dark:text-slate-600 text-2xl uppercase tracking-tighter">
                  Upload a PDF to begin workspace
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
