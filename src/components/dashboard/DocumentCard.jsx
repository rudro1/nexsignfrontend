import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "../ui/Card"; 
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Users, ArrowRight, Clock, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: Pencil },
  pending: { label: 'Pending', color: 'bg-amber-100 hover:bg-blue text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-sky-100 hover:bg-blue text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 hover:bg-blue text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
};

const PARTY_COLORS = ['#0ea5e9','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899'];

export default function DocumentCard({ doc }) {

  const navigate = useNavigate();
  const config = statusConfig[doc.status] || statusConfig.draft;
  const StatusIcon = config.icon;
  const parties = doc.parties || [];

  const getProgress = () => {
    if (!parties.length) return 0;
    const signed = parties.filter(p => p.status === 'signed').length;
    return Math.round((signed / parties.length) * 100);
  };

  const currentSigner =
    parties.length > 0 && doc.status === 'in_progress'
      ? parties[doc.currentPartyIndex || 0]
      : null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US',{
      month:'short',
      day:'numeric',
      year:'numeric'
    });
  };

  const handleViewAction = () => {
    if (doc.status === 'completed') {

      if (doc.fileUrl) {
        const timestamp = new Date(doc.updatedAt).getTime();
        const finalUrl = `${doc.fileUrl}?v=${timestamp}`;
        window.open(finalUrl,'_blank');
      } 
      else {
        toast.error("File URL not found");
      }

    } 
    else {
      navigate(`/DocumentEditor?id=${doc._id}`);
    }
  };

  return (

<Card className="p-4 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700  dark:hover:border-sky-600 transition-all group w-full overflow-hidden">

{/* Header */}

      <div className="flex items-start justify-between gap-3 mb-4">

        <div className="flex items-center gap-3 min-w-0 flex-1">

           <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center flex-shrink-0">
                 <FileText className="w-4 h-4 text-sky-500"/>
           </div>

        <div className="min-w-0 flex-1">
             <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm sm:text-base">{doc.title}</h3>

               <p className="text-xs text-slate-400 mt-0.5">{formatDate(doc.updatedAt || doc.createdAt)}</p>
        </div>

      </div>

      <Badge className={`${config.color} border-0 font-medium shrink-0`}>
         <StatusIcon className="w-3 h-3 mr-1"/>{config.label}</Badge>
      </div>


{/* Parties Section */}

          {parties.length > 0 && (

              <div className="mb-4">

                  <div className="flex items-center gap-2 mb-2">
                   <Users className="w-3.5 h-3.5 text-slate-400"/>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{parties.length} parties</span>
               </div>

      <div className="flex gap-1">

               {parties.map((p,i)=>(
              <div  key={i} className="h-1.5 rounded-full flex-1" style={{ backgroundColor:p.status === 'signed'
                       ? '#22c55e': p.status === 'sent'? PARTY_COLORS[i % PARTY_COLORS.length]: '#e2e8f0',
                       opacity: p.status === 'signed'? 1: p.status === 'sent'? 0.6: 0.3}}/>
                          ))}
       </div>

            {currentSigner && (
              <p className="text-xs text-sky-500 mt-2 italic break-words"> Awaiting: {currentSigner.name}</p>)}

        </div>
      )}

{/* Bottom Section */}

<div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">

                  <span className="text-xs text-slate-400 font-medium">
                  {doc.status === 'completed'? '100% complete': `${getProgress()}% complete`}
                    </span>

    <Button variant="ghost" size="sm" onClick={handleViewAction} 
    className="text-sky-500 hover:text-blue-500 hover:bg-blue-200 hover:dark-text-blue-500 dark:hover:bg-sky-600 gap-1 font-semibold">

       {doc.status === 'completed'? 'View Final': doc.status === 'draft'? 'Edit': 'View'}

         <ArrowRight className="w-3.5 h-3.5"/>

      </Button>

    </div>

 </Card>

  );
}