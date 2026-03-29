// src/components/dashboard/DocumentCard.jsx
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText, ArrowRight, Clock,
  CheckCircle2, AlertCircle, Pencil, Layout,
} from 'lucide-react';

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    icon: Pencil,
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertCircle,
  },
  template: {
    label: 'Template',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    icon: Layout,
  },
};

const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

const DocumentCard = React.memo(({ doc }) => {
  const navigate = useNavigate();
  const parties  = doc.parties || [];

  const config = useMemo(() => {
    if (doc.isTemplate) return statusConfig.template;
    return statusConfig[doc.status] || statusConfig.draft;
  }, [doc.status, doc.isTemplate]);

  const progress = useMemo(() => {
    if (!parties.length) return 0;
    const signed = parties.filter(p => p.status === 'signed').length;
    return Math.round((signed / parties.length) * 100);
  }, [parties]);

  const currentSigner = useMemo(() => {
    if (doc.status !== 'in_progress' || doc.isTemplate) return null;
    return parties.find(p => p.status !== 'signed') || null;
  }, [parties, doc.status, doc.isTemplate]);

  const formattedDate = useMemo(() => {
    const dateStr = doc.createdAt || doc.updatedAt;
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return !isNaN(date) 
      ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';
  }, [doc.createdAt, doc.updatedAt]);

  const handleAction = useCallback((e) => {
    e.stopPropagation();
    if (doc.isTemplate) {
      navigate(`/templates/${doc._id}`);
    } else if (doc.status === 'draft') {
      navigate(`/DocumentEditor?id=${doc._id}`);
    } else {
      navigate(`/audit/${doc._id}`);
    }
  }, [doc, navigate]);

  const handleView = useCallback((e) => {
    e.stopPropagation();
    if (doc.signedFileUrl) {
      window.open(doc.signedFileUrl, '_blank');
    }
  }, [doc.signedFileUrl]);

  const handleDownload = useCallback((e) => {
    e.stopPropagation();
    if (doc.signedFileUrl) {
      const link = document.createElement('a');
      link.href = doc.signedFileUrl;
      link.download = `${doc.title || 'signed_document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [doc.signedFileUrl, doc.title]);

  return (
    <Card 
      onClick={handleAction}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm cursor-pointer rounded-[2.5rem] p-6 md:p-8"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-colors duration-300 ${config.color.split(' ')[0]} bg-opacity-20 group-hover:bg-opacity-30`}>
              <FileText className={`w-6 h-6 ${config.color.split(' ')[1]}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-black text-slate-900 dark:text-white truncate group-hover:text-[#28ABDF] transition-colors uppercase tracking-tight">
                {doc.title || 'Untitled'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>
          <Badge className={`rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${config.color} border-none`}>
            {config.label}
          </Badge>
        </div>

        <div className="flex-1 space-y-6">
          {/* Progress Bar */}
          {!doc.isTemplate && parties.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Signing Progress</span>
                <span className="text-[#28ABDF]">{progress}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-[#28ABDF] rounded-full transition-all duration-700 ease-in-out shadow-[0_0_15px_rgba(40,171,223,0.3)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Parties Avatars */}
          <div className="flex items-center justify-between pt-4 border-t dark:border-slate-800">
            <div className="flex -space-x-3">
              {parties.slice(0, 4).map((p, i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-[11px] font-black text-white shadow-md ring-1 ring-slate-100 dark:ring-slate-800 transition-transform hover:scale-110 hover:z-10"
                  style={{ backgroundColor: PARTY_COLORS[i % PARTY_COLORS.length] }}
                  title={p.name}
                >
                  {p.name?.charAt(0).toUpperCase() || 'P'}
                </div>
              ))}
              {parties.length > 4 && (
                <div className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-black text-slate-500 shadow-md ring-1 ring-slate-100 dark:ring-slate-800">
                  +{parties.length - 4}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {doc.status === 'completed' && doc.signedFileUrl ? (
                <>
                  <Button 
                    size="sm" 
                    onClick={handleView}
                    className="bg-sky-50 hover:bg-sky-100 text-[#28ABDF] rounded-xl px-4 h-10 font-black transition-all border-none"
                  >
                    VIEW
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleDownload}
                    className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl px-4 h-10 font-black transition-all shadow-sm"
                  >
                    DOWNLOAD
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  onClick={handleAction}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-700 hover:border-[#28ABDF] hover:text-[#28ABDF] rounded-2xl px-6 h-11 font-black transition-all shadow-sm"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest mr-2">
                    {doc.isTemplate ? 'USE TEMPLATE' : (doc.status === 'draft' ? 'EDIT' : 'MANAGE')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Next Action Indicator */}
          {currentSigner && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/30">
              <div className="w-2 h-2 rounded-full bg-[#28ABDF] animate-pulse shadow-[0_0_8px_rgba(40,171,223,0.5)]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-700 dark:text-sky-400 truncate">
                Waiting for: <span className="text-slate-900 dark:text-white">{currentSigner.name}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

DocumentCard.displayName = 'DocumentCard';

export default DocumentCard;
