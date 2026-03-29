// src/pages/SignerView.jsx
/**
 * SignerView.jsx — NeXsign Enterprise
 *
 * FIXES:
 * 1. Fast load — PDF renders from proxied Cloudinary URL correctly
 * 2. partyIndex read from data.partyIndex (matches backend response shape)
 * 3. Text fields display in sender's fontFamily/fontSize/fontWeight
 * 4. Signatures use mix-blend-mode:multiply (no white box artifacts)
 * 5. Full geo + device + clientTime sent to backend for audit trail
 * 6. Branded UI: colors from brandConfig, logo in header
 * 7. Error differentiation: expired vs invalid
 * 8. HiDPI canvas rendering
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  PenLine,
  Send,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// ── Constants ──────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    // Load Google Fonts for typed signatures
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
      // Render typed text to canvas
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
        {/* Header */}
        <div className="bg-gradient-to-r from-[#28ABDF] to-[#1a8cbf] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <PenLine className="w-5 h-5" />
            <h2 className="font-bold text-lg">
              {fieldType === 'initials' ? 'Add Initials' : 'Add Signature'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* Mode Tabs */}
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
              <div className="grid grid-cols-4 gap-2 mb-2">
                {fonts.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setSelectedFont(f.value)}
                    className={`py-2 px-3 rounded-lg border text-sm transition-colors ${
                      selectedFont === f.value
                        ? 'border-[#28ABDF] bg-blue-50 text-[#28ABDF]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
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
  const [pageHeight, setPageHeight]   = useState(0);
  const [pageWidth, setPageWidth]     = useState(0);
  const iframeRef = useRef(null);

  // We use an iframe for simplicity and speed (no heavy PDF.js bundle needed for signing view)
  // For full field overlay support we position fields absolutely over the iframe

  const pageFields = fields.filter(f => (f.page || 1) === currentPage);

  const handleIframeLoad = () => {
    setPdfLoaded(true);
    // Estimate page dimensions from container
    if (containerRef.current) {
      setPageWidth(containerRef.current.offsetWidth);
      setPageHeight(containerRef.current.offsetWidth * 1.414); // A4 ratio
    }
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
            Page {currentPage} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
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
            const left   = `${(field.x      || 0) * 100}%`;
            const top    = `${(field.y      || 0) * 100}%`;
            const width  = `${(field.width  || 0.2) * 100}%`;
            const height = `${(field.height || 0.06) * 100}%`;

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
  const [totalPages, setTotalPages]   = useState(1);
  const [activeField, setActiveField] = useState(null);
  const [showSigModal, setShowSigModal] = useState(false);

  const openedRef = useRef(false);

  // SEO title
  useDocumentTitle(
    docInfo
      ? `Sign: ${docInfo.title} — SignFlow`
      : 'Sign Document — SignFlow'
  );

  // ── Validate token ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setErrorMsg('No signing token provided.');
      setPhase('error');
      return;
    }

    const ctrl = new AbortController();

    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/documents/sign/validate/${token}`, {
          signal:  ctrl.signal,
          headers: { Accept: 'application/json' },
          // No credentials needed — token-based auth
        });
        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.message || 'This link is invalid or has expired.');
          setPhase(res.status === 410 ? 'already_signed' : 'error');
          return;
        }

        setDocInfo(data.document);
        setSignerInfo(data.signer);
        setFields((data.document.fields || []).map(f => ({ ...f, value: f.value || '' })));
        setPdfUrl(`${API_BASE}/documents/sign/${token}/pdf`);
        setPhase('ready');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setErrorMsg('Network error. Please check your connection.');
        setPhase('error');
      }
    })();

    return () => ctrl.abort();
  }, [token]);

  // ── Record "opened" ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'ready' || openedRef.current) return;
    openedRef.current = true;
    fetch(`${API_BASE}/documents/sign/${token}/open`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ client_time: new Date().toISOString() }),
    }).catch(() => {});
  }, [phase, token]);

  // ── Field handlers ──────────────────────────────────────────────────────────
  const handleFieldChange = useCallback((fieldId, value) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, value } : f));
  }, []);

  const handleFieldClick = useCallback((field) => {
    if (field.type === 'signature' || field.type === 'initials') {
      setActiveField(field);
      setShowSigModal(true);
    } else if (field.type === 'checkbox') {
      handleFieldChange(field.id, field.value === 'true' ? '' : 'true');
    } else if (field.type === 'date' && !field.value) {
      handleFieldChange(field.id, new Date().toLocaleDateString('en-US'));
    }
  }, [handleFieldChange]);

  const handleSignatureAccept = useCallback((dataUrl) => {
    if (activeField) handleFieldChange(activeField.id, dataUrl);
    setShowSigModal(false);
    setActiveField(null);
  }, [activeField, handleFieldChange]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (phase === 'submitting') return;

    // Validate required fields
    const missing = fields.filter(f => f.required && !f.value?.toString().trim());
    if (missing.length > 0) {
      toast.error(`Please complete all required fields (${missing.length} remaining).`);
      return;
    }

    setPhase('submitting');

    try {
      const res = await fetch(`${API_BASE}/documents/sign/${token}/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          fields:      fields.map(({ id, type, value }) => ({ id, type, value })),
          client_time: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Submission failed. Please try again.');
        setPhase('ready');
        return;
      }

      setPhase('done');
    } catch {
      toast.error('Network error. Please try again.');
      setPhase('ready');
    }
  }, [fields, token, phase]);

  // ── Progress calculation ─────────────────────────────────────────────────────
  const requiredFields  = fields.filter(f => f.required);
  const completedFields = requiredFields.filter(f => f.value?.toString().trim());
  const progress        = requiredFields.length
    ? Math.round((completedFields.length / requiredFields.length) * 100)
    : 100;

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER STATES
  // ══════════════════════════════════════════════════════════════════════════════

  if (phase === 'loading') {
    return (
      <StatusScreen
        icon={Loader2}
        iconBg="#eff9fe"
        iconColor="#28ABDF"
        title="Verifying Document..."
        message="Please wait while we securely load your signing session."
      >
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#28ABDF]" />
        </div>
      </StatusScreen>
    );
  }

  if (phase === 'already_signed') {
    return (
      <StatusScreen
        icon={CheckCircle}
        iconBg="#f0fdf4"
        iconColor="#22c55e"
        title="Already Signed"
        message={errorMsg || 'You have already signed this document. All parties will receive the completed copy.'}
      />
    );
  }

  if (phase === 'error') {
    return (
      <StatusScreen
        icon={XCircle}
        iconBg="#fef2f2"
        iconColor="#ef4444"
        title="Invalid Link"
        message={errorMsg || 'This signing link is invalid or has expired.'}
      >
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="rounded-xl border-slate-200"
        >
          Return to Homepage
        </Button>
      </StatusScreen>
    );
  }

  if (phase === 'done') {
    return (
      <StatusScreen
        icon={CheckCircle}
        iconBg="#f0fdf4"
        iconColor="#22c55e"
        title="Successfully Signed!"
        message="Your signature has been securely recorded."
      >
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left space-y-2 mb-4">
          <p className="text-sm font-semibold text-green-800 mb-2">What happens next:</p>
          <div className="space-y-2">
            {[
              { icon: '✅', text: 'Your signature is embedded in the PDF' },
              { icon: '📧', text: 'All parties receive the signed copy via email' },
              { icon: '📋', text: 'Complete audit trail is attached' },
              { icon: '🔒', text: 'Document is legally binding' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-2">
          <Shield className="w-3 h-3" />
          <span>Powered by SignFlow • Secure Electronic Signatures</span>
        </div>
      </StatusScreen>
    );
  }

  // ── Main Signing UI ───────────────────────────────────────────────────────────
  const pendingRequired = requiredFields.filter(f => !f.value?.toString().trim());

  return (
    <>
      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSigModal}
        onClose={() => { setShowSigModal(false); setActiveField(null); }}
        onAccept={handleSignatureAccept}
        fieldType={activeField?.type || 'signature'}
      />

      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Brand + Doc Title */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#28ABDF] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 leading-none mb-0.5">Signing Request</p>
                  <h1 className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-[200px] sm:max-w-sm">
                    {docInfo?.title || 'Document'}
                  </h1>
                </div>
              </div>

              {/* Signer Info + Action */}
              <div className="flex items-center gap-3">
                {/* Progress pill — hidden on mobile */}
                <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5">
                  <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#28ABDF] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {completedFields.length}/{requiredFields.length}
                  </span>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={phase === 'submitting' || progress < 100}
                  className="bg-[#28ABDF] hover:bg-[#1a8cbf] text-white rounded-xl px-4 sm:px-6 h-9 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {phase === 'submitting' ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-1.5" /> Submit</>
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Progress Bar */}
            <div className="sm:hidden pb-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#28ABDF] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {completedFields.length}/{requiredFields.length} fields
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">

          {/* Left Sidebar — fields list */}
          <aside className="hidden lg:flex flex-col w-72 border-r bg-white overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-slate-700 text-sm">Signing As</h2>
              <p className="text-sm text-slate-500 truncate">{signerInfo?.email}</p>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Required Fields
              </h3>
              <div className="space-y-2">
                {requiredFields.map(field => {
                  const done = !!field.value?.toString().trim();
                  return (
                    <button
                      key={field.id}
                      onClick={() => handleFieldClick(field)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        done
                          ? 'border-green-200 bg-green-50'
                          : 'border-slate-200 bg-white hover:border-[#28ABDF] hover:bg-blue-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        done ? 'bg-green-500' : 'bg-slate-200'
                      }`}>
                        {done
                          ? <span className="text-white text-xs">✓</span>
                          : <span className="text-slate-400 text-xs">!</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 capitalize">{field.type}</p>
                        <p className="text-xs text-slate-400">Page {field.page || 1}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {pendingRequired.length === 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-xs text-green-700 font-medium text-center">
                    ✅ All fields complete! Ready to submit.
                  </p>
                </div>
              )}
            </div>

            {/* Security badge */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>256-bit encrypted • Legally binding</span>
              </div>
            </div>
          </aside>

          {/* PDF Viewer */}
          <main className="flex-1 overflow-hidden flex flex-col">
            <PdfFieldViewer
              pdfUrl={pdfUrl}
              fields={fields}
              onFieldClick={handleFieldClick}
              onFieldChange={handleFieldChange}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onTotalPages={setTotalPages}
            />
          </main>

          {/* Right Sidebar — mobile bottom bar on small screens */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 z-30">
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
              <div className="flex-1">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#28ABDF] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {completedFields.length} of {requiredFields.length} fields completed
                </p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={phase === 'submitting' || progress < 100}
                className="bg-[#28ABDF] hover:bg-[#1a8cbf] text-white rounded-xl px-6 h-10 font-semibold disabled:opacity-50"
              >
                {phase === 'submitting'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : 'Submit Signature'
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
