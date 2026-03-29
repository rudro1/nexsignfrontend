import React, {
  useRef, useState, useEffect,
  useCallback, useMemo,
} from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Rnd } from 'react-rnd';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { buildProxyUrl } from '@/api/apiClient';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PARTY_COLORS = [
  '#0ea5e9','#8b5cf6','#f59e0b',
  '#10b981','#ef4444','#ec4899',
];

export default function PdfViewer({
  fileUrl, fields, onFieldsChange,
  currentPage, onPageChange, onTotalPagesChange,
  pendingFieldType, selectedPartyIndex,
  parties, onFieldPlaced,
  readOnly = false,
  selectedFieldId, onFieldSelect,
}) {
  const canvasRef     = useRef(null);
  const containerRef  = useRef(null);
  const renderTaskRef = useRef(null);
  const pdfDocRef     = useRef(null);
  const canvasSizeRef = useRef({ width:0, height:0 });

  const [canvasSize, setCanvasSize] = useState({ width:0, height:0 });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  const fieldsRef = useRef(fields);
  useEffect(() => { fieldsRef.current = fields; }, [fields]);

  const currentPageFields = useMemo(
    () => fields.filter(f => Number(f.page) === Number(currentPage)),
    [fields, currentPage]
  );

  // ── Load PDF ─────────────────────────────────────────────────
  useEffect(() => {
    if (!fileUrl) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const url = buildProxyUrl(fileUrl);
        const doc = await pdfjsLib.getDocument({
          url, withCredentials: false,
        }).promise;
        if (cancelled) return;
        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        onTotalPagesChange?.(doc.numPages);
      } catch (err) {
        if (!cancelled) setError('Failed to load PDF.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [fileUrl, onTotalPagesChange]);

  // ── Render page ──────────────────────────────────────────────
  const renderPage = useCallback(async () => {
    const doc       = pdfDocRef.current;
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!doc || !canvas || !container) return;

    try { renderTaskRef.current?.cancel(); } catch (_) {}

    try {
      const page    = await doc.getPage(currentPage);
      const cw      = Math.max(container.clientWidth - 40, 300);
      const base    = page.getViewport({ scale:1 });
      const scale   = cw / base.width;
      const vp      = page.getViewport({ scale });
      const ratio   = window.devicePixelRatio || 1;

      canvas.width  = vp.width  * ratio;
      canvas.height = vp.height * ratio;
      canvas.style.width  = `${vp.width}px`;
      canvas.style.height = `${vp.height}px`;

      const ctx = canvas.getContext('2d', { alpha:false });
      ctx.scale(ratio, ratio);

      const size = { width: vp.width, height: vp.height };
      canvasSizeRef.current = size;
      setCanvasSize(size);

      renderTaskRef.current = page.render({ canvasContext:ctx, viewport:vp });
      await renderTaskRef.current.promise;
    } catch (err) {
      if (err.name !== 'RenderingCancelledException') console.error(err);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!loading && !error) renderPage();
  }, [loading, error, renderPage]);

  useEffect(() => {
    const fn = () => renderPage();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [renderPage]);

  // ── Place field on click ─────────────────────────────────────
  const handleContainerClick = useCallback((e) => {
    if (readOnly || !pendingFieldType || loading) return;
    if (!e.target.classList.contains('pdf-canvas')) return;

    const size = canvasSizeRef.current;
    if (!size.width) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const fW   = pendingFieldType === 'signature' ? 20 : 18;
    const fH   = pendingFieldType === 'signature' ? 8  : 6;
    const xPct = ((e.clientX - rect.left)  / size.width)  * 100 - fW/2;
    const yPct = ((e.clientY - rect.top)   / size.height) * 100 - fH/2;

    const newField = {
      id:         `f_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      type:       pendingFieldType,
      page:       currentPage,
      x:          +Math.max(0, Math.min(100-fW, xPct)).toFixed(4),
      y:          +Math.max(0, Math.min(100-fH, yPct)).toFixed(4),
      width:      fW,
      height:     fH,
      partyIndex: Number(selectedPartyIndex),
      value:      '',
      fontFamily: 'Helvetica',
      fontSize:   14,
    };

    onFieldsChange([...fieldsRef.current, newField]);
    onFieldSelect?.(newField.id);
    onFieldPlaced?.();
  }, [
    readOnly, pendingFieldType, loading,
    currentPage, selectedPartyIndex,
    onFieldsChange, onFieldPlaced, onFieldSelect,
  ]);

  const updateField = useCallback((id, patch) => {
    onFieldsChange(fieldsRef.current.map(f =>
      f.id === id ? { ...f, ...patch } : f
    ));
  }, [onFieldsChange]);

  const removeField = useCallback((id) => {
    onFieldsChange(fieldsRef.current.filter(f => f.id !== id));
    if (selectedFieldId === id) onFieldSelect?.(null);
  }, [onFieldsChange, selectedFieldId, onFieldSelect]);

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full flex flex-col items-center
                 bg-slate-100 dark:bg-slate-950 p-4
                 min-h-[600px] overflow-y-auto"
    >
      {/* Page nav */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 mb-4 sticky top-0 z-30
                        bg-white/90 dark:bg-slate-900/90 backdrop-blur
                        px-4 py-2 rounded-full shadow-md border
                        border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost" size="icon" className="rounded-full"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost" size="icon" className="rounded-full"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Canvas container */}
      <div
        className="relative bg-white shadow-2xl border border-slate-200
                   overflow-visible mb-10 rounded-sm"
        style={{
          width:  canvasSize.width  || '100%',
          height: canvasSize.height || 800,
        }}
        onClick={handleContainerClick}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center
                          justify-center bg-white/90 z-50 rounded">
            <div className="w-8 h-8 border-3 border-[#28ABDF]
                            border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Loading PDF...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center
                          justify-center bg-white z-50 p-8 text-center">
            <p className="text-red-500 font-semibold mb-2">⚠️ {error}</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="pdf-canvas block"
          style={{
            cursor: pendingFieldType && !readOnly
              ? 'crosshair' : 'default',
          }}
        />

        {/* Fields */}
        {!loading && canvasSize.width > 0 &&
          currentPageFields.map(field => {
            const party = parties?.[field.partyIndex] ?? {
              name:'Signer', color:'#28ABDF',
            };
            const color  = party.color ||
              PARTY_COLORS[field.partyIndex % PARTY_COLORS.length];
            const isSelected = selectedFieldId === field.id;

            const px = (field.x      / 100) * canvasSize.width;
            const py = (field.y      / 100) * canvasSize.height;
            const pw = (field.width  / 100) * canvasSize.width;
            const ph = (field.height / 100) * canvasSize.height;

            return (
              <Rnd
                key={field.id}
                size={{ width:pw, height:ph }}
                position={{ x:px, y:py }}
                bounds="parent"
                disableDragging={readOnly}
                enableResizing={readOnly ? false : {
                  top:true, right:true, bottom:true, left:true,
                  topRight:true, bottomRight:true,
                  bottomLeft:true, topLeft:true,
                }}
                minWidth={40} minHeight={20}
                className="z-20"
                style={{ position:'absolute' }}
                onDragStop={(_, d) => {
                  const s = canvasSizeRef.current;
                  updateField(field.id, {
                    x: +((d.x / s.width)  * 100).toFixed(4),
                    y: +((d.y / s.height) * 100).toFixed(4),
                  });
                }}
                onResizeStop={(_, __, ref, ___, pos) => {
                  const s = canvasSizeRef.current;
                  updateField(field.id, {
                    width:  +((parseFloat(ref.style.width)  / s.width)  * 100).toFixed(4),
                    height: +((parseFloat(ref.style.height) / s.height) * 100).toFixed(4),
                    x:      +((pos.x / s.width)  * 100).toFixed(4),
                    y:      +((pos.y / s.height) * 100).toFixed(4),
                  });
                }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!readOnly) onFieldSelect?.(field.id);
                  }}
                  className="w-full h-full border-2 border-dashed
                             flex items-center justify-center
                             relative group select-none transition-all"
                  style={{
                    borderColor:     isSelected ? '#f59e0b' : color,
                    backgroundColor: isSelected
                      ? 'rgba(245,158,11,0.15)'
                      : `${color}22`,
                    boxShadow: isSelected
                      ? `0 0 0 2px #f59e0b`
                      : 'none',
                  }}
                >
                  <div
                    className="text-[8px] font-black uppercase
                               text-center pointer-events-none px-1
                               leading-tight"
                    style={{ color }}
                  >
                    {field.type === 'text'
                      ? `${field.type} · ${field.fontFamily || 'Helv'} ${field.fontSize || 14}px`
                      : field.type
                    }
                    <br />
                    {party.name}
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      className="absolute -top-3 -right-3 bg-red-500
                                 hover:bg-red-600 text-white rounded-full
                                 p-1 opacity-0 group-hover:opacity-100
                                 shadow-lg transition-all z-[999]"
                      onPointerDown={e => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeField(field.id);
                      }}
                    >
                      <Trash2 size={9} />
                    </button>
                  )}
                </div>
              </Rnd>
            );
          })
        }
      </div>
    </div>
  );
}
