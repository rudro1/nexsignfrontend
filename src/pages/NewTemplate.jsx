// src/pages/NewTemplate.jsx

import React, {
  useState, useCallback, useMemo, useRef, useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { api }        from '@/api/apiClient';
import { useAuth }    from '@/lib/AuthContext';
import { Button }     from '@/components/ui/button';
import { Input }      from '@/components/ui/input';
import { Label }      from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Upload, Send, ArrowLeft, FileText, Loader2,
  ImagePlus, ChevronRight, CheckCircle2, Users,
  Trash2, PenTool, Plus, RotateCcw, AlertCircle,
  Building2, Crown, UserCheck, Eye, EyeOff,
  FileSpreadsheet, X,
} from 'lucide-react';
import FieldToolbar from '@/components/editor/FieldToolbar';
import PdfViewer    from '@/components/editor/PdfViewer';

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────
const FONT_FAMILIES = [
  { label: 'Helvetica',       value: 'Helvetica'       },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier',         value: 'Courier'         },
];
const FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32];

const TEMPLATE_PARTIES = [
  { name: 'Authoriser (Boss)', color: '#0ea5e9', order: 0 },
  { name: 'Signer (Employee)', color: '#8b5cf6', order: 1 },
];

const STEPS = [
  { id: 1, label: 'Upload',    desc: 'PDF & Branding',     icon: Upload        },
  { id: 2, label: 'Fields',   desc: 'Place Fields',        icon: PenTool       },
  { id: 3, label: 'Boss',     desc: 'Authoriser Info',     icon: Crown         },
  { id: 4, label: 'Employees', desc: 'Employee List',      icon: Users         },
  { id: 5, label: 'Review',   desc: 'Finalize & Send',     icon: CheckCircle2  },
];

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());

function revokeBlob(url) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────
// Step Progress
// ─────────────────────────────────────────────────────────────────
function StepProgress({ current, maxReached, onStepClick }) {
  return (
    <div className="hidden lg:flex items-center gap-0">
      {STEPS.map((s, idx) => {
        const done   = current > s.id;
        const active = current === s.id;
        const canGo  = s.id <= maxReached;
        const Icon   = s.icon;

        return (
          <React.Fragment key={s.id}>
            <button
              type="button"
              disabled={!canGo}
              onClick={() => canGo && onStepClick(s.id)}
              className={`flex flex-col items-center gap-1.5
                          transition-all duration-200
                          ${canGo ? 'cursor-pointer' : 'cursor-default opacity-40'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center
                              justify-center transition-all duration-200
                ${done
                  ? 'bg-emerald-500 text-white'
                  : active
                    ? 'bg-[#28ABDF] text-white shadow-md shadow-sky-400/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                {done
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <Icon className="w-3.5 h-3.5" />
                }
              </div>
              <span className={`text-[9px] font-semibold tracking-wide
                whitespace-nowrap transition-colors
                ${active  ? 'text-[#28ABDF]'
                : done    ? 'text-emerald-500'
                           : 'text-slate-400'
                }`}>
                {s.label}
              </span>
            </button>

            {idx < STEPS.length - 1 && (
              <div className={`w-10 h-px mx-1 mb-5 rounded-full
                               transition-all duration-500
                ${current > s.id
                  ? 'bg-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, iconBg, iconColor, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center
                      justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800
                       dark:text-white leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Review Row
// ─────────────────────────────────────────────────────────────────
function ReviewRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex items-center justify-between py-3
                    border-b border-slate-50 dark:border-slate-700/60
                    last:border-0">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className={`text-xs font-semibold text-slate-800
                        dark:text-white text-right max-w-[60%]
                        truncate ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function NewTemplate() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Wizard ────────────────────────────────────────────────────
  const [step,       setStep]       = useState(1);
  const [maxReached, setMaxReached] = useState(1);

  // ── Core ──────────────────────────────────────────────────────
  const [rawFile,             setRawFile]             = useState(null);
  const [title,               setTitle]               = useState('');
  const [fileUrl,             setFileUrl]             = useState('');
  const [fileReady,           setFileReady]           = useState(false);
  const [fields,              setFields]              = useState([]);
  const [companyLogoFile,     setCompanyLogoFile]     = useState(null);
  const [companyLogoPreview,  setCompanyLogoPreview]  = useState('');
  const [companyName,         setCompanyName]         = useState('');

  // ── Boss ──────────────────────────────────────────────────────
  const [bossName,  setBossName]  = useState(user?.full_name || '');
  const [bossEmail, setBossEmail] = useState(user?.email     || '');
  const [bossError, setBossError] = useState({});

  // ── Employees ─────────────────────────────────────────────────
  const [employees, setEmployees] = useState([]);
  const [empForm,   setEmpForm]   = useState({ name: '', email: '' });
  const [empError,  setEmpError]  = useState({});
  const [csvError,  setCsvError]  = useState('');

  // ── Editor ────────────────────────────────────────────────────
  const [currentPage,        setCurrentPage]        = useState(1);
  const [totalPages,         setTotalPages]          = useState(1);
  const [selectedPartyIndex, setSelectedPartyIndex] = useState(0);
  const [pendingFieldType,   setPendingFieldType]   = useState(null);
  const [processing,         setProcessing]         = useState(false);
  const [selectedFieldId,    setSelectedFieldId]    = useState(null);
  const [mobilePanelView,    setMobilePanelView]    = useState('sidebar');

  const fileUrlRef      = useRef(fileUrl);
  const logoPreviewRef  = useRef(companyLogoPreview);
  const mountedRef      = useRef(true);

  useEffect(() => { fileUrlRef.current     = fileUrl;             }, [fileUrl]);
  useEffect(() => { logoPreviewRef.current = companyLogoPreview;  }, [companyLogoPreview]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      revokeBlob(fileUrlRef.current);
      revokeBlob(logoPreviewRef.current);
    };
  }, []);

  const selectedField = useMemo(
    () => fields.find(f => f.id === selectedFieldId),
    [fields, selectedFieldId]
  );

  // ── File select ───────────────────────────────────────────────
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('PDF must be under 20 MB.');
      return;
    }
    revokeBlob(fileUrlRef.current);
    const url = URL.createObjectURL(file);
    setRawFile(file);
    setTitle(prev => prev || file.name.replace(/\.pdf$/i, ''));
    setFileUrl(url);
    setFileReady(true);
    setFields([]);
    setCurrentPage(1);
    e.target.value = '';
  }, []);

  const handleLogoSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    revokeBlob(logoPreviewRef.current);
    setCompanyLogoFile(file);
    setCompanyLogoPreview(URL.createObjectURL(file));
    e.target.value = '';
  }, []);

  // ── Employee helpers ──────────────────────────────────────────
  const addEmployee = useCallback(() => {
    const errs = {};
    if (!empForm.name.trim())        errs.name  = 'Name is required.';
    if (!isValidEmail(empForm.email)) errs.email = 'Valid email required.';
    if (employees.some(e => e.email === empForm.email.trim().toLowerCase()))
      errs.email = 'This email is already added.';

    if (Object.keys(errs).length) {
      setEmpError(errs);
      return;
    }
    setEmployees(prev => [
      ...prev,
      { name: empForm.name.trim(), email: empForm.email.trim().toLowerCase() },
    ]);
    setEmpForm({ name: '', email: '' });
    setEmpError({});
  }, [empForm, employees]);

  const removeEmployee = useCallback((i) => {
    setEmployees(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  // ── CSV parse ─────────────────────────────────────────────────
  const handleCsvUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError('');
    try {
      const text    = await file.text();
      const lines   = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) throw new Error('CSV is empty.');
      const [hdr, ...rows] = lines;
      const headers = hdr.split(',').map(h => h.trim().toLowerCase());
      const ni = headers.indexOf('name');
      const ei = headers.indexOf('email');
      if (ni === -1 || ei === -1)
        throw new Error('CSV must have "name" and "email" columns.');

      const newEmps = rows
        .map(r => {
          const c = r.split(',').map(x => x.trim());
          return { name: c[ni] || '', email: (c[ei] || '').toLowerCase() };
        })
        .filter(emp => emp.name && isValidEmail(emp.email));

      if (!newEmps.length) throw new Error('No valid rows found in CSV.');

      // Deduplicate
      const existing = new Set(employees.map(e => e.email));
      const fresh = newEmps.filter(e => !existing.has(e.email));
      setEmployees(prev => [...prev, ...fresh]);
      toast.success(`${fresh.length} employees added from CSV`);
      if (fresh.length < newEmps.length) {
        toast.info(`${newEmps.length - fresh.length} duplicates skipped`);
      }
    } catch (err) {
      setCsvError(err.message || 'Invalid CSV file.');
    } finally {
      e.target.value = '';
    }
  }, [employees]);

  // ── Typography ─────────────────────────────────────────────────
  const updateFieldTypography = useCallback((key, value) => {
    if (!selectedFieldId) return;
    setFields(prev =>
      prev.map(f => f.id === selectedFieldId ? { ...f, [key]: value } : f)
    );
  }, [selectedFieldId]);

  const removeField = useCallback((id) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  }, [selectedFieldId]);

  // ── Step navigation ────────────────────────────────────────────
  const goToStep = useCallback((target) => {
    setStep(target);
    setMaxReached(prev => Math.max(prev, target));
  }, []);

  const nextStep = useCallback(() => {
    if (step === 1) {
      if (!fileUrl)      return toast.error('Please upload a PDF first.');
      if (!title.trim()) return toast.error('Please enter a template name.');
    }
    if (step === 2) {
      if (!fields.length) return toast.error('Place at least one field on the PDF.');
    }
    if (step === 3) {
      const errs = {};
      if (!bossName.trim())      errs.name  = 'Boss name is required.';
      if (!isValidEmail(bossEmail)) errs.email = 'Valid boss email required.';
      if (Object.keys(errs).length) {
        setBossError(errs);
        return;
      }
      setBossError({});
    }
    if (step === 4) {
      if (!employees.length) return toast.error('Add at least one employee.');
    }
    if (step < 5) goToStep(step + 1);
  }, [step, fileUrl, title, fields, bossName, bossEmail, employees, goToStep]);

  const prevStep = useCallback(() => {
    if (step > 1) setStep(s => s - 1);
  }, [step]);

  // ── Submit ────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!fileUrl)          { toast.error('No PDF uploaded.');              return; }
    if (!title.trim())     { toast.error('Template name is required.');    return; }
    if (!fields.length)    { toast.error('Place at least one field.');     return; }
    if (!isValidEmail(bossEmail)) { toast.error('Valid boss email required.'); return; }
    if (!employees.length) { toast.error('Add at least one employee.');    return; }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file',        rawFile);
      formData.append('title',       title.trim());
      formData.append('companyName', companyName.trim());
      formData.append('fields',      JSON.stringify(fields));
      formData.append('boss',        JSON.stringify({
        name:  bossName.trim(),
        email: bossEmail.trim().toLowerCase(),
      }));
      formData.append('employees',   JSON.stringify(employees));
      formData.append('totalPages',  String(totalPages));

      if (companyLogoFile) {
        const lf = new FormData();
        lf.append('logo', companyLogoFile);
        const lr = await api.post('/documents/upload-logo', lf);
        if (lr.data?.logoUrl) formData.append('companyLogo', lr.data.logoUrl);
      }

      await api.post('/templates/create-and-send', formData);
      toast.success('Template created! Boss has been notified. ✉️');
      navigate('/templates');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create template.');
    } finally {
      if (mountedRef.current) setProcessing(false);
    }
  }, [
    fileUrl, title, fields, bossName, bossEmail,
    employees, rawFile, companyName, companyLogoFile,
    totalPages, navigate,
  ]);

  const currentMeta = STEPS[step - 1];

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-50
                    dark:bg-slate-950 overflow-hidden">

      {/* ══════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════ */}
      <header className="h-16 bg-white dark:bg-slate-900
                         border-b border-slate-200 dark:border-slate-800
                         px-4 sm:px-6 flex items-center justify-between
                         gap-4 z-50 shrink-0 shadow-sm">

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/templates')}
            className="h-9 w-9 rounded-xl shrink-0
                       bg-slate-50 dark:bg-slate-800
                       hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </Button>

          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Untitled Template"
              className="w-full bg-transparent border-none outline-none
                         text-sm font-semibold text-slate-900
                         dark:text-white truncate
                         placeholder:text-slate-300
                         dark:placeholder:text-slate-600"
            />
            <p className="text-[10px] text-slate-400 lg:hidden">
              Step {step} of 5 · {currentMeta.desc}
            </p>
          </div>
        </div>

        <StepProgress
          current={step}
          maxReached={maxReached}
          onStepClick={goToStep}
        />

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile PDF toggle on step 2 */}
          {step === 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobilePanelView(
                v => v === 'sidebar' ? 'viewer' : 'sidebar'
              )}
              className="lg:hidden h-9 px-3 rounded-xl
                         border-slate-200 dark:border-slate-700
                         text-slate-600 dark:text-slate-300
                         gap-1.5 text-xs font-medium"
            >
              {mobilePanelView === 'sidebar'
                ? <><Eye className="w-3.5 h-3.5" /> Preview</>
                : <><PenTool className="w-3.5 h-3.5" /> Edit</>
              }
            </Button>
          )}

          {step > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              className="h-9 px-4 rounded-xl
                         border-slate-200 dark:border-slate-700
                         text-slate-600 dark:text-slate-300
                         font-medium text-sm"
            >
              Back
            </Button>
          )}

          {step < 5 ? (
            <Button
              size="sm"
              onClick={nextStep}
              className="h-9 px-4 rounded-xl
                         bg-slate-900 dark:bg-white
                         dark:text-slate-900 text-white
                         font-semibold text-sm gap-1.5
                         shadow-md hover:shadow-lg
                         transition-all hover:-translate-y-0.5
                         active:translate-y-0"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSend}
              disabled={processing || !fileReady}
              className="h-9 px-5 rounded-xl
                         bg-[#28ABDF] hover:bg-[#2399c8] text-white
                         font-semibold text-sm gap-1.5
                         shadow-md shadow-sky-400/30
                         transition-all hover:-translate-y-0.5
                         active:translate-y-0
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
              {processing ? 'Sending…' : 'Send to Boss'}
            </Button>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          BODY
      ══════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex overflow-hidden">

        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        <aside className={`
          w-full lg:w-[360px] xl:w-[400px]
          border-r border-slate-200 dark:border-slate-800
          bg-white dark:bg-slate-900
          overflow-y-auto shrink-0
          ${step === 2 && mobilePanelView === 'viewer'
            ? 'hidden lg:block'
            : 'block'
          }
        `}>

          {/* Mobile step pill */}
          <div className="lg:hidden px-4 pt-4 pb-0">
            <div className="inline-flex items-center gap-1.5
                            px-3 py-1.5 rounded-full
                            bg-[#28ABDF]/10 text-[#28ABDF]
                            text-xs font-semibold">
              <currentMeta.icon className="w-3 h-3" />
              {currentMeta.desc}
            </div>
          </div>

          {/* ╔════════════════════════════════════════════════════╗
              STEP 1 — Upload & Branding
          ╚════════════════════════════════════════════════════╝ */}
          {step === 1 && (
            <div className="p-5 sm:p-6 space-y-7">

              {/* PDF upload */}
              <div className="space-y-4">
                <SectionHeader
                  icon={FileText}
                  iconBg="bg-sky-50 dark:bg-sky-900/30"
                  iconColor="text-[#28ABDF]"
                  title="Template Document"
                  subtitle="Upload the PDF that will be reused"
                />

                {!fileReady ? (
                  <label className="flex flex-col items-center justify-center
                                    w-full h-44 rounded-2xl border-2 border-dashed
                                    border-slate-200 dark:border-slate-700
                                    cursor-pointer group
                                    hover:border-[#28ABDF] hover:bg-sky-50/40
                                    dark:hover:bg-sky-900/10 transition-all">
                    <div className="w-12 h-12 rounded-2xl
                                    bg-slate-100 dark:bg-slate-800
                                    flex items-center justify-center mb-3
                                    group-hover:bg-sky-100
                                    dark:group-hover:bg-sky-900/30
                                    transition-colors">
                      <Upload className="w-5 h-5 text-slate-400
                                         group-hover:text-[#28ABDF]
                                         transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600
                                  dark:text-slate-400
                                  group-hover:text-slate-800">
                      Click to upload PDF
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Max 20 MB
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                    />
                  </label>
                ) : (
                  <div className="relative p-4 rounded-2xl
                                  bg-sky-50 dark:bg-sky-900/20
                                  border border-sky-200 dark:border-sky-800/60
                                  flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white
                                    dark:bg-slate-800 flex items-center
                                    justify-center shadow-sm shrink-0">
                      <FileText className="w-5 h-5 text-[#28ABDF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800
                                    dark:text-white truncate">
                        {title || 'template'}.pdf
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          revokeBlob(fileUrl);
                          setFileReady(false);
                          setFileUrl('');
                          setRawFile(null);
                          setFields([]);
                        }}
                        className="text-xs text-[#28ABDF] hover:underline
                                   font-medium mt-0.5"
                      >
                        Replace
                      </button>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6
                                    bg-emerald-500 rounded-full
                                    flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500
                                    dark:text-slate-400">
                    Template Name
                  </Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Employment Contract 2024"
                    className="h-10 rounded-xl border-slate-200
                               dark:border-slate-700 text-sm
                               focus-visible:ring-[#28ABDF]/30
                               focus-visible:border-[#28ABDF]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Brand */}
              <div className="space-y-4">
                <SectionHeader
                  icon={Building2}
                  iconBg="bg-amber-50 dark:bg-amber-900/30"
                  iconColor="text-amber-500"
                  title="Company Info"
                  subtitle="Optional — appears in emails"
                />

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500
                                      dark:text-slate-400">
                      Company Name
                    </Label>
                    <Input
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="h-10 rounded-xl border-slate-200
                                 dark:border-slate-700 text-sm
                                 focus-visible:ring-[#28ABDF]/30
                                 focus-visible:border-[#28ABDF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500
                                      dark:text-slate-400">
                      Company Logo
                    </Label>
                    <div className="flex items-center gap-4">
                      <label className="relative h-16 w-16 rounded-xl
                                        cursor-pointer border-2 border-dashed
                                        border-slate-200 dark:border-slate-700
                                        flex items-center justify-center shrink-0
                                        overflow-hidden bg-slate-50 dark:bg-slate-800
                                        hover:border-[#28ABDF] transition-colors group">
                        {companyLogoPreview ? (
                          <img
                            src={companyLogoPreview}
                            alt="Logo"
                            className="w-full h-full object-contain p-1.5"
                          />
                        ) : (
                          <ImagePlus className="w-5 h-5 text-slate-300
                                                group-hover:text-[#28ABDF]
                                                transition-colors" />
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLogoSelect}
                        />
                      </label>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-600
                                      dark:text-slate-300">
                          Upload logo
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          PNG with transparency recommended
                        </p>
                        {companyLogoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              revokeBlob(companyLogoPreview);
                              setCompanyLogoPreview('');
                              setCompanyLogoFile(null);
                            }}
                            className="text-xs text-red-400
                                       hover:text-red-500 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ╔════════════════════════════════════════════════════╗
              STEP 2 — Define Fields
          ╚════════════════════════════════════════════════════╝ */}
          {step === 2 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader
                icon={PenTool}
                iconBg="bg-indigo-50 dark:bg-indigo-900/30"
                iconColor="text-indigo-500"
                title="Field Placement"
                subtitle="Boss fields (blue) · Employee fields (purple)"
              />

              {/* Party legend */}
              <div className="flex gap-2">
                {TEMPLATE_PARTIES.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1.5
                               rounded-lg text-xs font-medium
                               bg-slate-50 dark:bg-slate-800
                               border border-slate-100 dark:border-slate-700"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-400">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>

              <FieldToolbar
                parties={TEMPLATE_PARTIES}
                selectedPartyIndex={selectedPartyIndex}
                onPartySelect={setSelectedPartyIndex}
                onAddField={type => {
                  setPendingFieldType(type);
                  setMobilePanelView('viewer');
                }}
              />

              {/* Pending indicator */}
              {pendingFieldType && (
                <div className="flex items-center justify-between p-3
                                rounded-xl bg-[#28ABDF]/10
                                border border-[#28ABDF]/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#28ABDF]
                                    animate-ping" />
                    <p className="text-xs font-semibold text-[#28ABDF]">
                      Click PDF to place{' '}
                      <span className="font-bold capitalize">
                        {pendingFieldType}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingFieldType(null)}
                    className="text-[#28ABDF] hover:text-sky-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Selected field config */}
              {selectedField && (
                <div className="space-y-3 pt-4 border-t border-slate-100
                                dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600
                                  dark:text-slate-300 capitalize">
                      {selectedField.type} settings
                    </p>
                    <button
                      type="button"
                      onClick={() => removeField(selectedField.id)}
                      className="text-xs text-red-400 hover:text-red-500
                                 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>

                  {selectedField.type === 'text' && (
                    <div className="space-y-2.5">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-400 font-medium">
                          Font Family
                        </Label>
                        <Select
                          value={selectedField.fontFamily || 'Helvetica'}
                          onValueChange={v =>
                            updateFieldTypography('fontFamily', v)
                          }
                        >
                          <SelectTrigger className="h-9 rounded-xl text-sm
                                                     border-slate-200
                                                     dark:border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_FAMILIES.map(f => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-400 font-medium">
                          Font Size
                        </Label>
                        <Select
                          value={String(selectedField.fontSize || 12)}
                          onValueChange={v =>
                            updateFieldTypography('fontSize', Number(v))
                          }
                        >
                          <SelectTrigger className="h-9 rounded-xl text-sm
                                                     border-slate-200
                                                     dark:border-slate-700">
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
                    </div>
                  )}
                </div>
              )}

              {/* Fields list */}
              {fields.length > 0 && (
                <div className="pt-3 border-t border-slate-100
                                dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-400 mb-2">
                    {fields.length} field{fields.length !== 1 ? 's' : ''} placed
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {fields.map(f => {
                      const party = TEMPLATE_PARTIES[f.partyIndex]
                                 || TEMPLATE_PARTIES[0];
                      return (
                        <div
                          key={f.id}
                          onClick={() => setSelectedFieldId(f.id)}
                          className={`flex items-center gap-2 px-2 py-1.5
                                      rounded-lg cursor-pointer text-xs
                                      transition-colors
                            ${selectedFieldId === f.id
                              ? 'bg-[#28ABDF]/10 text-[#28ABDF]'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                            }`}
                        >
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: party.color }}
                          />
                          <span className="capitalize font-medium flex-1">
                            {f.type}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            p.{f.page}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ╔════════════════════════════════════════════════════╗
              STEP 3 — Boss Info
          ╚════════════════════════════════════════════════════╝ */}
          {step === 3 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader
                icon={Crown}
                iconBg="bg-purple-50 dark:bg-purple-900/30"
                iconColor="text-purple-500"
                title="Authoriser (Boss)"
                subtitle="Signs the template first before employees"
              />

              {/* Flow diagram */}
              <div className="p-4 rounded-2xl bg-gradient-to-r
                              from-purple-50 to-sky-50
                              dark:from-purple-900/20 dark:to-sky-900/20
                              border border-purple-100 dark:border-purple-800/40">
                <div className="flex items-center gap-2 justify-center
                                text-xs font-semibold text-slate-600
                                dark:text-slate-400">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5
                                  bg-purple-500 text-white rounded-lg text-xs">
                    <Crown className="w-3 h-3" />
                    Boss signs
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5
                                  bg-[#28ABDF] text-white rounded-lg text-xs">
                    <Users className="w-3 h-3" />
                    Employees sign
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500
                                    dark:text-slate-400">
                    Boss Full Name
                  </Label>
                  <Input
                    value={bossName}
                    onChange={e => {
                      setBossName(e.target.value);
                      setBossError(p => ({ ...p, name: '' }));
                    }}
                    placeholder="e.g. John Smith"
                    className={`h-10 rounded-xl text-sm
                      ${bossError.name
                        ? 'border-red-400 focus-visible:ring-red-400'
                        : 'border-slate-200 dark:border-slate-700 focus-visible:ring-[#28ABDF]/30 focus-visible:border-[#28ABDF]'
                      }`}
                  />
                  {bossError.name && (
                    <p className="flex items-center gap-1 text-xs
                                  text-red-500">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {bossError.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500
                                    dark:text-slate-400">
                    Boss Email
                  </Label>
                  <Input
                    value={bossEmail}
                    type="email"
                    onChange={e => {
                      setBossEmail(e.target.value);
                      setBossError(p => ({ ...p, email: '' }));
                    }}
                    placeholder="boss@company.com"
                    className={`h-10 rounded-xl text-sm
                      ${bossError.email
                        ? 'border-red-400 focus-visible:ring-red-400'
                        : 'border-slate-200 dark:border-slate-700 focus-visible:ring-[#28ABDF]/30 focus-visible:border-[#28ABDF]'
                      }`}
                  />
                  {bossError.email && (
                    <p className="flex items-center gap-1 text-xs
                                  text-red-500">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {bossError.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ╔════════════════════════════════════════════════════╗
              STEP 4 — Employee List
          ╚════════════════════════════════════════════════════╝ */}
          {step === 4 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader
                icon={UserCheck}
                iconBg="bg-sky-50 dark:bg-sky-900/30"
                iconColor="text-[#28ABDF]"
                title="Employee List"
                subtitle="Add individually or upload CSV"
              />

              {/* Add form */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl
                              p-4 space-y-3 border border-slate-100
                              dark:border-slate-700">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-500
                                      dark:text-slate-400">
                      Name
                    </Label>
                    <Input
                      value={empForm.name}
                      onChange={e => {
                        setEmpForm(p => ({ ...p, name: e.target.value }));
                        setEmpError(p => ({ ...p, name: '' }));
                      }}
                      onKeyDown={e => e.key === 'Enter' && addEmployee()}
                      placeholder="Full name"
                      className={`h-9 rounded-xl text-xs
                        ${empError.name
                          ? 'border-red-400'
                          : 'border-slate-200 dark:border-slate-700'
                        }`}
                    />
                    {empError.name && (
                      <p className="text-[10px] text-red-500">
                        {empError.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-500
                                      dark:text-slate-400">
                      Email
                    </Label>
                    <Input
                      value={empForm.email}
                      type="email"
                      onChange={e => {
                        setEmpForm(p => ({ ...p, email: e.target.value }));
                        setEmpError(p => ({ ...p, email: '' }));
                      }}
                      onKeyDown={e => e.key === 'Enter' && addEmployee()}
                      placeholder="email@co.com"
                      className={`h-9 rounded-xl text-xs
                        ${empError.email
                          ? 'border-red-400'
                          : 'border-slate-200 dark:border-slate-700'
                        }`}
                    />
                    {empError.email && (
                      <p className="text-[10px] text-red-500">
                        {empError.email}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmployee}
                  className="w-full h-9 rounded-xl text-xs
                             border-slate-200 dark:border-slate-700
                             hover:border-[#28ABDF] hover:text-[#28ABDF]
                             transition-colors gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Employee
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                <span className="text-xs text-slate-400 font-medium">
                  or
                </span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>

              {/* CSV upload */}
              <label className={`flex items-center gap-3 p-4 rounded-xl
                                 border-2 border-dashed cursor-pointer
                                 transition-all group
                ${csvError
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#28ABDF] hover:bg-sky-50/30 dark:hover:bg-sky-900/10'
                }`}>
                <div className="w-8 h-8 rounded-xl bg-slate-100
                                dark:bg-slate-800 flex items-center
                                justify-center shrink-0
                                group-hover:bg-sky-100
                                dark:group-hover:bg-sky-900/30
                                transition-colors">
                  <FileSpreadsheet className="w-4 h-4 text-slate-400
                                               group-hover:text-[#28ABDF]
                                               transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  {csvError ? (
                    <p className="text-xs font-medium text-red-600">
                      {csvError}
                    </p>
                  ) : (
                    <>
                      <p className="text-xs font-medium text-slate-600
                                    dark:text-slate-400">
                        Upload CSV
                      </p>
                      <p className="text-[11px] text-slate-400">
                        name, email columns required
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </label>

              {/* Employee list */}
              {employees.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <p className="text-xs font-medium text-slate-500
                                  dark:text-slate-400">
                      {employees.length} employee{employees.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      type="button"
                      onClick={() => setEmployees([])}
                      className="text-xs text-red-400 hover:text-red-500
                                 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto">
                    {employees.map((emp, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl
                                   bg-white dark:bg-slate-800
                                   border border-slate-100 dark:border-slate-700"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#28ABDF]/10
                                        text-[#28ABDF] text-[10px] font-bold
                                        flex items-center justify-center
                                        shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800
                                        dark:text-white truncate">
                            {emp.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {emp.email}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEmployee(i)}
                          className="p-1 rounded-lg text-slate-300
                                     hover:text-red-500
                                     hover:bg-red-50 dark:hover:bg-red-900/20
                                     transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No employees yet</p>
                  <p className="text-xs opacity-70">Add manually or upload CSV</p>
                </div>
              )}
            </div>
          )}

          {/* ╔════════════════════════════════════════════════════╗
              STEP 5 — Review
          ╚════════════════════════════════════════════════════╝ */}
          {step === 5 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader
                icon={CheckCircle2}
                iconBg="bg-emerald-50 dark:bg-emerald-900/30"
                iconColor="text-emerald-500"
                title="Final Review"
                subtitle="Confirm before creating template"
              />

              {/* Summary */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl
                              border border-slate-100 dark:border-slate-700
                              overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50
                                border-b border-slate-50 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500
                                uppercase tracking-wide">
                    Template Summary
                  </p>
                </div>
                <div className="px-4 py-1">
                  <ReviewRow label="Template"  value={title || '—'} />
                  <ReviewRow label="Company"   value={companyName || '—'} />
                  <ReviewRow label="Fields"    value={`${fields.length} placed`} valueClass="text-[#28ABDF]" />
                  <ReviewRow label="Boss"      value={bossName || '—'} />
                  <ReviewRow label="Employees" value={`${employees.length} added`} valueClass="text-purple-600" />
                </div>
              </div>

              {/* Workflow */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500
                              uppercase tracking-wide">
                  Signing Workflow
                </p>
                <div className="space-y-2">
                  {[
                    {
                      icon: Crown,
                      color: 'bg-purple-500',
                      label: 'Step 1',
                      name: bossName || 'Boss',
                      sub: bossEmail,
                    },
                    {
                      icon: Users,
                      color: 'bg-[#28ABDF]',
                      label: `Step 2 (${employees.length})`,
                      name: 'All Employees',
                      sub: 'Simultaneously',
                    },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3
                                            rounded-xl bg-white dark:bg-slate-800
                                            border border-slate-100 dark:border-slate-700">
                      <div className={`w-7 h-7 rounded-lg flex items-center
                                       justify-center text-white shrink-0
                                       ${s.color}`}>
                        <s.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800
                                      dark:text-white truncate">
                          {s.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {s.sub}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400
                                       bg-slate-50 dark:bg-slate-700
                                       px-2 py-0.5 rounded-full shrink-0">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-900/20
                              border border-sky-100 dark:border-sky-800">
                <div className="flex gap-2.5">
                  <AlertCircle className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-sky-700 dark:text-sky-400
                                leading-relaxed">
                    Boss receives the template first. After signing,
                    all {employees.length} employees receive their copy
                    simultaneously.
                  </p>
                </div>
              </div>

              {/* Send */}
              <Button
                onClick={handleSend}
                disabled={processing || !fileReady}
                className="w-full h-11 rounded-xl
                           bg-[#28ABDF] hover:bg-[#2399c8] text-white
                           font-semibold gap-2 shadow-md shadow-sky-400/25
                           transition-all hover:-translate-y-0.5
                           active:translate-y-0
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {processing
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
                {processing ? 'Creating…' : 'Create & Send to Boss'}
              </Button>
            </div>
          )}
        </aside>

        {/* ── PDF VIEWER ───────────────────────────────────────── */}
        <section className={`
          flex-1 flex flex-col min-w-0 overflow-hidden
          bg-slate-100 dark:bg-slate-950
          ${step === 2 && mobilePanelView === 'sidebar'
            ? 'hidden lg:flex'
            : 'flex'
          }
        `}>
          {fileReady ? (
            <div className="flex-1 overflow-auto flex justify-center
                            items-start p-4 lg:p-8">
              <div className="shadow-2xl shadow-slate-300/40
                              dark:shadow-black/60 rounded-sm overflow-hidden
                              ring-1 ring-slate-200/80 dark:ring-slate-700/50">
                <PdfViewer
                  fileUrl={fileUrl}
                  fields={fields}
                  onFieldsChange={setFields}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onTotalPagesChange={setTotalPages}
                  selectedPartyIndex={selectedPartyIndex}
                  pendingFieldType={pendingFieldType}
                  parties={TEMPLATE_PARTIES}
                  onFieldPlaced={() => {
                    setPendingFieldType(null);
                    setMobilePanelView('sidebar');
                  }}
                  selectedFieldId={selectedFieldId}
                  onFieldSelect={setSelectedFieldId}
                  readOnly={step !== 2}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center
                            justify-center gap-4 p-8 text-center">
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900
                              border-2 border-dashed border-slate-200
                              dark:border-slate-700 flex items-center
                              justify-center">
                <FileText className="w-10 h-10 text-slate-200
                                      dark:text-slate-700" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-400
                              dark:text-slate-600 mb-1">
                  No PDF loaded
                </p>
                <p className="text-sm text-slate-300 dark:text-slate-700">
                  Upload a PDF in Step 1 to see it here
                </p>
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}