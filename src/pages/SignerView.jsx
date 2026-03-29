import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  PenLine,
  Send,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { api } from '@/api/apiClient';

// ── Utility: update document title for SEO ────────────────────────────────────
function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    if (title) document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}

// ── Status Screen ─────────────────────────────────────────────────────────────
function StatusScreen({ icon: Icon, iconBg, iconColor, title, message, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-10 h-10" style={{ color: iconColor }} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">{title}</h1>
        <p className="text-slate-500 leading-relaxed mb-6">{message}</p>
        {children}
      </div>
    </div>
  );
}

// ── Signature Canvas Modal ─────────────────────────────────────────────────────
function SignatureModal({ isOpen, onClose, onAccept, fieldType = 'signature' }) {
  const canvasRef    = useRef(null);
  const isDrawing    = useRef(false);
  const lastPos      = useRef({ x: 0, y: 0 });
  const [isEmpty, setIsEmpty] = useState(true);
  const [inputMode, setInputMode] = useState('draw'); // draw | type
  const [typedText, setTypedText] = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script, cursive');

  const fonts = [
    { label: 'Script',  value: 'Dancing Script, cursive' },
    { label: 'Serif',   value: 'Georgia, serif' },
    { label: 'Print',   value: 'Arial, sans-serif' },
    { label: 'Cursive', value: 'Brush Script MT, cursive' },
  ];

  useEffect(() => {
    if (!isOpen) return;
    setIsEmpty(true);
    setTypedText('');
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
    document.head.appendChild(link);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || inputMode !== 'draw') return;
    const canvas  = canvasRef.current;
    if (!canvas) return;
    const ctx     = canvas.getContext('2d');
    const rect    = canvas.getBoundingClientRect();
    canvas.width  = rect.width  || 500;
    canvas.height = rect.height || 200;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  }, [isOpen, inputMode]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width  / rect.width),
      y: (src.clientY - rect.top)  * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
    lastPos.current  = getPos(e, canvas);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setIsEmpty(false);
  };

  const stopDraw = () => { isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const handleAccept = () => {
    if (inputMode === 'draw') {
      if (isEmpty) { toast.error('Please draw your signature first.'); return; }
      onAccept(canvasRef.current.toDataURL('image/png'));
    } else {
      if (!typedText.trim()) { toast.error('Please type your signature.'); return; }
      const canvas  = document.createElement('canvas');
      canvas.width  = 500;
      canvas.height = 150;
      const ctx     = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 500, 150);
      ctx.font      = `48px ${selectedFont}`;
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedText.trim(), 250, 75);
      onAccept(canvas.toDataURL('image/png'));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#28ABDF] to-[#1a8cbf] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <PenLine className="w-5 h-5" />
            <h2 className="font-bold text-lg">
              {fieldType === 'initials' ? 'Add Initials' : 'Add Signature'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="flex border-b">
          {['draw', 'type'].map(mode => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors capitalize ${
                inputMode === mode
                  ? 'border-b-2 border-[#28ABDF] text-[#28ABDF]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {mode === 'draw' ? '✏️ Draw' : '⌨️ Type'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {inputMode === 'draw' ? (
            <>
              <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white relative">
                <canvas
                  ref={canvasRef}
                  className="w-full touch-none cursor-crosshair"
                  style={{ height: '200px', display: 'block' }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                {isEmpty && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-slate-300 text-sm font-medium">Sign here</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-slate-400">Draw your signature above</p>
                <button
                  onClick={clearCanvas}
                  className="text-xs text-red-400 hover:text-red-600 font-medium"
                >
                  Clear
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Type your full name"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg focus:border-[#28ABDF] focus:outline-none mb-4"
                style={{ fontFamily: selectedFont }}
                maxLength={50}
              />
              <div className="flex flex-wrap gap-2 mb-4">
                {fonts.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setSelectedFont(f.value)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                      selectedFont === f.value 
                        ? 'border-[#28ABDF] bg-sky-50 text-[#28ABDF] font-bold'
                        : 'border-slate-200 text-slate-500'
                    }`}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {typedText && (
                <div
                  className="border rounded-xl p-4 text-center text-4xl text-slate-800 bg-white mt-3"
                  style={{ fontFamily: selectedFont }}
                >
                  {typedText}
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 mt-5">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 bg-[#28ABDF] hover:bg-[#1a8cbf] text-white rounded-xl"
            >
              Apply {fieldType === 'initials' ? 'Initials' : 'Signature'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PDF Viewer with Field Overlays ─────────────────────────────────────────────
function PdfFieldViewer({ pdfUrl, fields, onFieldClick, onFieldChange, currentPage, onPageChange, onTotalPages }) {
  const containerRef = useRef(null);
  const [pdfLoaded, setPdfLoaded]     = useState(false);
  const [pdfError, setPdfError]       = useState(false);
  const [scale, setScale]             = useState(1.0);
  const [numPages, setNumPages]       = useState(1);
  const iframeRef = useRef(null);

  const pageFields = fields.filter(f => (f.page || 1) === currentPage);

  const handleIframeLoad = () => {
    setPdfLoaded(true);
  };

  const fieldTypeStyles = {
    signature: 'border-2 border-dashed border-[#28ABDF] bg-blue-50/70 hover:bg-blue-100/80 cursor-pointer',
    initials:  'border-2 border-dashed border-purple-400 bg-purple-50/70 hover:bg-purple-100/80 cursor-pointer',
    text:      'border-2 border-slate-300 bg-white/90 hover:border-[#28ABDF] cursor-text',
    date:      'border-2 border-green-400 bg-green-50/70 hover:bg-green-100/80 cursor-pointer',
    checkbox:  'border-2 border-orange-400 bg-orange-50/70 hover:bg-orange-100/80 cursor-pointer',
  };

  const fieldLabels = {
    signature: '✍️ Click to Sign',
    initials:  '✏️ Initials',
    text:      '📝 Text',
    date:      '📅 Date',
    checkbox:  '☑️',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-slate-600 min-w-[80px] text-center">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="h-8 w-8 p-0 rounded-lg">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-slate-500 w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={() => setScale(s => Math.min(2, s + 0.1))} className="h-8 w-8 p-0 rounded-lg">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF + Fields */}
      <div className="flex-1 overflow-auto bg-slate-200 p-4">
        {pdfError && <div className="text-center p-10">Failed to load PDF.</div>}
        <div
          className="relative mx-auto bg-white shadow-2xl"
          ref={containerRef}
          style={{
            width:     `${Math.min(100, scale * 100)}%`,
            maxWidth:  `${scale * 850}px`,
            minHeight: '500px',
          }}
        >
          {/* PDF iframe */}
          <iframe
            ref={iframeRef}
            src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full border-0"
            style={{ height: `${scale * 1060}px`, minHeight: '500px' }}
            onLoad={handleIframeLoad}
            onError={() => setPdfError(true)}
            title="Document for signing"
          />

          {/* Field Overlays */}
          {pdfLoaded && pageFields.map(field => {
            const left   = `${(field.x      || 0)}%`;
            const top    = `${(field.y      || 0)}%`;
            const width  = `${(field.width  || 0.2)}%`;
            const height = `${(field.height || 0.06)}%`;

            return (
              <div
                key={field.id}
                className={`absolute rounded-lg transition-all duration-150 flex items-center justify-center overflow-hidden ${fieldTypeStyles[field.type] || fieldTypeStyles.text}`}
                style={{ left, top, width, height }}
                onClick={() => onFieldClick(field)}
              >
                {field.value ? (
                  field.type === 'signature' || field.type === 'initials' ? (
                    <img
                      src={field.value}
                      alt="signature"
                      className="w-full h-full object-contain"
                    />
                  ) : field.type === 'checkbox' ? (
                    <span className="text-green-600 font-bold text-lg">✓</span>
                  ) : (
                    <span className="text-slate-800 text-sm px-2 truncate w-full">{field.value}</span>
                  )
                ) : (
                  <span className="text-xs font-semibold text-slate-500 select-none">
                    {field.required ? '* ' : ''}{fieldLabels[field.type] || field.type}
                  </span>
                )}

                {/* Text input inline */}
                {(field.type === 'text' || field.type === 'date') && !field.value && (
                  <input
                    type={field.type === 'date' ? 'date' : 'text'}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onFieldChange(field.id, e.target.value)}
                    onFocus={(e) => e.currentTarget.style.opacity = '1'}
                    onBlur={(e) => e.currentTarget.style.opacity = '0'}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Signer View Component ─────────────────────────────────────────────────
export default function SignerView() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [phase, setPhase]         = useState('loading');
  const [docInfo, setDocInfo]     = useState(null);
  const [signerInfo, setSignerInfo] = useState(null);
  const [pdfUrl, setPdfUrl]       = useState('');
  const [fields, setFields]       = useState([]);
  const [errorMsg, setErrorMsg]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeField, setActiveField] = useState(null);
  const [showSigModal, setShowSigModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // SEO title
  useDocumentTitle(
    docInfo
      ? `Sign: ${docInfo.title} — NeXsign`
      : 'Sign Document — NeXsign'
  );

  // ── Validate token ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setErrorMsg('No signing token provided.');
      setPhase('error');
      return;
    }

    const abortCtrl = new AbortController();

    (async () => {
      try {
        const res = await api.get(`/documents/sign/validate/${token}`, {
          signal: abortCtrl.signal
        });
        
        const data = res.data;
        setDocInfo(data.document);
        setSignerInfo(data.party);
        setFields((data.document.fields || []).map(f => ({ ...f, value: f.value || '' })));
        setPdfUrl(`${api.defaults.baseURL}/documents/sign/${token}/pdf`);
        setPhase('ready');
      } catch (err) {
        if (err.name === 'CanceledError') return;
        const msg = err.response?.data?.message || 'This link is invalid or has expired.';
        setErrorMsg(msg);
        setPhase(err.response?.status === 410 ? 'already_signed' : 'error');
      }
    })();

    return () => abortCtrl.abort();
  }, [token]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFieldClick = (field) => {
    if (field.partyIndex !== signerInfo.index) {
      toast.info(`This field is for ${docInfo.parties[field.partyIndex].name}.`);
      return;
    }
    if (field.type === 'signature' || field.type === 'initials') {
      setActiveField(field);
      setShowSigModal(true);
    }
  };

  const handleFieldChange = (id, val) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, value: val } : f));
  };

  const onSignatureAccept = (dataUrl) => {
    if (activeField) {
      handleFieldChange(activeField.id, dataUrl);
      setShowSigModal(false);
      setActiveField(null);
    }
  };

  const handleSubmit = async () => {
    const signerFields = fields.filter(f => f.partyIndex === signerInfo.index);
    const missing = signerFields.find(f => f.required && !f.value);
    
    if (missing) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/documents/sign/submit', {
        token,
        fields
      });

      if (res.data.completed) {
        setPhase('completed');
      } else {
        setPhase('signed_next');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit signature.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render States ───────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#28ABDF] mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading secure document...</p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <StatusScreen
        icon={XCircle}
        iconBg="#fee2e2"
        iconColor="#ef4444"
        title="Invalid Link"
        message={errorMsg}
      >
        <Button onClick={() => navigate('/')} className="bg-slate-800 text-white rounded-xl w-full">
          Return Home
        </Button>
      </StatusScreen>
    );
  }

  if (phase === 'already_signed' || phase === 'signed_next') {
    return (
      <StatusScreen
        icon={CheckCircle}
        iconBg="#ecfdf5"
        iconColor="#10b981"
        title="Thank You!"
        message={phase === 'signed_next' ? "You've successfully signed. The next party has been notified." : "You have already signed this document."}
      >
        <Button onClick={() => navigate('/')} className="bg-slate-800 text-white rounded-xl w-full">
          Visit NeXsign
        </Button>
      </StatusScreen>
    );
  }

  if (phase === 'completed') {
    return (
      <StatusScreen
        icon={ShieldCheck}
        iconBg="#ecfdf5"
        iconColor="#10b981"
        title="Document Completed"
        message="All parties have signed! A final copy with audit trail has been sent to your email."
      >
        <Button onClick={() => navigate('/')} className="bg-slate-800 text-white rounded-xl w-full">
          Done
        </Button>
      </StatusScreen>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#28ABDF] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{docInfo.title}</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Secure Signature Request</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-slate-700">{signerInfo.name}</p>
            <p className="text-[10px] text-slate-400">{signerInfo.email}</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#28ABDF] hover:bg-[#1a8cbf] text-white rounded-xl h-10 px-6 font-bold gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Finish Signing
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        <PdfFieldViewer
          pdfUrl={pdfUrl}
          fields={fields}
          onFieldClick={handleFieldClick}
          onFieldChange={handleFieldChange}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </main>

      <SignatureModal
        isOpen={showSigModal}
        onClose={() => { setShowSigModal(false); setActiveField(null); }}
        onAccept={onSignatureAccept}
        fieldType={activeField?.type}
      />
    </div>
  );
}
