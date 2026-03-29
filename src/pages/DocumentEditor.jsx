import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2, Mail, X, ImagePlus,
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

  const [rawFile,    setRawFile]    = useState(null);
  const [title,      setTitle]      = useState('');
  const [fileUrl,    setFileUrl]    = useState('');
  const [fileReady,  setFileReady]  = useState(false);
  const [parties,    setParties]    = useState([]);
  const [fields,     setFields]     = useState([]);
  const [ccList,     setCcList]     = useState([]);
  const [companyLogo,    setCompanyLogo]    = useState('');
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState('');
  const [companyName,    setCompanyName]    = useState('');

  const [ccEmail,       setCcEmail]       = useState('');
  const [ccName,        setCcName]        = useState('');
  const [ccDesignation, setCcDesignation] = useState('');

  const [currentPage,        setCurrentPage]        = useState(1);
  const [totalPages,         setTotalPages]          = useState(1);
  const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
  const [pendingFieldType,   setPendingFieldType]   = useState(null);
  const [processing,         setProcessing]         = useState(false);
  const [selectedFieldId,    setSelectedFieldId]    = useState(null);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  useEffect(() => {
    if (!docId) return;
    api.get(`/documents/${docId}`)
      .then(res => {
        const d = res.data.document || res.data;
        setTitle(d.title || '');
        setFileUrl(d.fileUrl || '');
        setFileReady(true);
        setParties(d.parties || []);
        setCcList(d.ccList || []);
        setCompanyLogo(d.companyLogo || '');
        setCompanyLogoPreview(d.companyLogo || '');
        setCompanyName(d.companyName || '');
        setFields((d.fields || []).map(f =>
          typeof f === 'string' ? JSON.parse(f) : f
        ));
      })
      .catch(() => toast.error('Failed to load document'));
  }, [docId]);

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
    if (!rawFile && !fileUrl) { toast.error('Please upload a PDF.'); return false; }
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

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* ── TOP NAV ── */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3 md:gap-4 flex-1 mr-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full h-9 w-9 shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div className="flex flex-col min-w-0">
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Document Title"
              className="bg-transparent border-none focus:ring-0 font-semibold text-slate-900 truncate text-base md:text-lg p-0"
            />
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {fileReady ? 'Editing Document' : 'Draft'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSend} disabled={processing || !fileReady}
            className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl px-4 md:px-6 h-10 font-semibold shadow-sm gap-2"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Send Document</span>
            <span className="sm:hidden">Send</span>
          </Button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white overflow-y-auto p-4 md:p-6 space-y-8 flex-shrink-0 order-2 md:order-1 max-h-[40vh] md:max-h-full">
          <section className="space-y-3">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> 1. Upload Document
            </Label>
            {!fileReady ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-[#28ABDF] hover:bg-sky-50/50 transition-all group">
                <Upload className="w-8 h-8 text-slate-300 group-hover:text-[#28ABDF] mb-2" />
                <span className="text-xs font-semibold text-slate-500 group-hover:text-sky-700">Choose PDF File</span>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileSelect} />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-sky-50/50 border border-sky-100 rounded-xl">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-sky-100 shrink-0">
                  <FileText className="w-5 h-5 text-[#28ABDF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{title || 'Document'}.pdf</p>
                  <button onClick={() => setFileReady(false)} className="text-[10px] font-bold text-[#28ABDF] hover:underline uppercase tracking-wider">Change File</button>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4 pt-4 border-t border-slate-100">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ImagePlus className="w-3.5 h-3.5" /> 2. Brand Identity
            </Label>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-400">Company Name</Label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp" className="h-9 text-sm rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-400">Company Logo</Label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer h-12 w-12 rounded-xl border border-dashed border-slate-300 flex items-center justify-center hover:border-[#28ABDF] transition-colors shrink-0 overflow-hidden bg-slate-50">
                    {companyLogoPreview ? <img src={companyLogoPreview} alt="Logo" className="h-full w-full object-contain p-1" /> : <ImagePlus className="w-5 h-5 text-slate-300" />}
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoSelect} />
                  </label>
                  <div className="flex-1 text-[10px] text-slate-400 leading-tight">Logo will appear in the signature request emails.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-slate-100">
            <PartyManager parties={parties} onChange={setParties} />
          </section>

          <section className="space-y-4 pt-4 border-t border-slate-100">
            <FieldToolbar
              parties={parties}
              selectedPartyIndex={selectedPartyIndex}
              onPartySelect={setSelectedPartyIndex}
              onAddField={type => setPendingFieldType(type)}
            />
          </section>

          <section className="space-y-4 pt-4 border-t border-slate-100">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">4. CC Recipients</Label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input value={ccName} onChange={e => setCcName(e.target.value)} placeholder="Name" className="h-9 text-xs rounded-xl" />
                <Input value={ccEmail} onChange={e => setCcEmail(e.target.value)} placeholder="Email" className="h-9 text-xs rounded-xl" />
              </div>
              <Button onClick={addCc} variant="outline" className="w-full h-8 text-xs rounded-xl border-slate-200 text-slate-600">+ Add CC</Button>
              <div className="space-y-2">
                {ccList.map(cc => (
                  <div key={cc.email} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-700 truncate">{cc.name || 'No Name'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{cc.email}</p>
                    </div>
                    <button onClick={() => setCcList(prev => prev.filter(r => r.email !== cc.email))} className="text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </aside>

        {/* CENTER VIEWER */}
        <section className="flex-1 flex flex-col min-w-0 bg-slate-100/50 order-1 md:order-2">
          {/* TOOLBAR */}
          <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              {selectedField?.type === 'text' && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <Select value={selectedField.fontFamily || 'Helvetica'} onValueChange={v => updateFieldTypography('fontFamily', v)}>
                    <SelectTrigger className="h-8 w-28 text-[11px] rounded-lg border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>{FONT_FAMILIES.map(f => (<SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>))}</SelectContent>
                  </Select>
                  <Select value={String(selectedField.fontSize || 12)} onValueChange={v => updateFieldTypography('fontSize', Number(v))}>
                    <SelectTrigger className="h-8 w-16 text-[11px] rounded-lg border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>{FONT_SIZES.map(s => (<SelectItem key={s} value={String(s)} className="text-xs">{s}px</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start min-h-0">
            <div className="max-w-full w-fit shadow-2xl shadow-slate-200/50 rounded-lg">
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
          </div>
        </section>
      </main>
    </div>
  );
}
