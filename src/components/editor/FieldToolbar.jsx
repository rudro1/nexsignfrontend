import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenTool, Type } from 'lucide-react';

const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export default function FieldToolbar({ parties, selectedPartyIndex, onPartySelect, onAddField }) {
  if (!parties || parties.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
        Place Fields
      </h3>
      
      <div>
        <label className="text-xs text-slate-500 mb-1.5 block">Assign to Party</label>
        <Select value={String(selectedPartyIndex)} onValueChange={v => onPartySelect(parseInt(v))}>
          <SelectTrigger className="rounded-lg border-slate-200 dark:border-slate-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {parties.map((p, i) => (
              <SelectItem key={i} value={String(i)}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color || PARTY_COLORS[i % PARTY_COLORS.length] }} />
                  {p.name || `Signer ${i + 1}`}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => onAddField('signature')}
          className="gap-2 rounded-lg border-slate-200 dark:border-slate-600 hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
        >
          <PenTool className="w-4 h-4 text-sky-500" />
          <span className="text-sm">Signature</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => onAddField('text')}
          className="gap-2 rounded-lg border-slate-200 dark:border-slate-600 hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
        >
          <Type className="w-4 h-4 text-sky-500" />
          <span className="text-sm">Text</span>
        </Button>
      </div>

      <p className="text-xs text-slate-400">
        Select a party, then click a field type. Click on the PDF to place it.
      </p>
    </div>
  );
}