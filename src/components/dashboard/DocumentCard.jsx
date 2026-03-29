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

  const StatusIcon = config.icon;

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
      navigate(`/editor/${doc._id}`);
    } else {
      navigate(`/audit/${doc._id}`);
    }
  }, [doc, navigate]);

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors duration-300 ${config.color.split(' ')[0]} bg-opacity-10 group-hover:bg-opacity-20`}>
              <FileText className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {doc.title || 'Untitled Document'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3" />
                {formattedDate}
              </p>
            </div>
          </div>
          <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
            <StatusIcon className="w-3 h-3 mr-1 inline-block" />
            {config.label}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Progress Bar */}
          {!doc.isTemplate && parties.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-500">Signing Progress</span>
                <span className="text-sky-600">{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Parties Avatars */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex -space-x-2">
              {parties.slice(0, 4).map((p, i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-100 dark:ring-slate-800"
                  style={{ backgroundColor: PARTY_COLORS[i % PARTY_COLORS.length] }}
                  title={p.name}
                >
                  {p.name?.charAt(0).toUpperCase() || 'P'}
                </div>
              ))}
              {parties.length > 4 && (
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                  +{parties.length - 4}
                </div>
              )}
              {parties.length === 0 && (
                <span className="text-xs text-slate-400 italic font-medium">No parties added</span>
              )}
            </div>

            <Button 
              size="sm" 
              onClick={handleAction}
              className="h-8 rounded-lg px-3 bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-600 dark:bg-slate-800 dark:hover:bg-sky-900/30 dark:text-slate-400 border-none transition-all duration-300"
            >
              <span className="text-xs font-bold mr-1.5">
                {doc.isTemplate ? 'Use Template' : (doc.status === 'draft' ? 'Edit' : 'Manage')}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Next Action Indicator */}
          {currentSigner && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100/50 dark:border-sky-800/30">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              <p className="text-[10px] font-medium text-sky-700 dark:text-sky-400 truncate">
                Waiting for: <span className="font-bold">{currentSigner.name}</span>
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
