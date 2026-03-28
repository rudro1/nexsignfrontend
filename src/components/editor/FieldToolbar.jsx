// import React from 'react';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { PenTool, Type } from 'lucide-react';

// const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// export default function FieldToolbar({ parties, selectedPartyIndex, onPartySelect, onAddField }) {
//   if (!parties || parties.length === 0) return null;

//   return (
//     <div className="space-y-4">
//       <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
//         Place Fields
//       </h3>
      
//       <div>
//         <label className="text-xs text-slate-500 mb-1.5 block">Assign to Party</label>
//         <Select value={String(selectedPartyIndex)} onValueChange={v => onPartySelect(parseInt(v))}>
//           <SelectTrigger className="rounded-lg border-slate-200 dark:border-slate-600">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             {parties.map((p, i) => (
//               <SelectItem key={i} value={String(i)}>
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color || PARTY_COLORS[i % PARTY_COLORS.length] }} />
//                   {p.name || `Signer ${i + 1}`}
//                 </div>
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="grid grid-cols-2 gap-2">
//         <Button
//           variant="outline"
//           onClick={() => onAddField('signature')}
//           className="gap-2 rounded-lg border-slate-200 dark:border-slate-600 hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
//         >
//           <PenTool className="w-4 h-4 text-sky-500" />
//           <span className="text-sm">Signature</span>
//         </Button>
//         <Button
//           variant="outline"
//           onClick={() => onAddField('text')}
//           className="gap-2 rounded-lg border-slate-200 dark:border-slate-600 hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
//         >
//           <Type className="w-4 h-4 text-sky-500" />
//           <span className="text-sm">Text</span>
//         </Button>
//       </div>

//       <p className="text-xs text-slate-400">
//         Select a party, then click a field type. Click on the PDF to place it.
//       </p>
//     </div>
//   );
// }
// src/components/editor/FieldToolbar.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PenTool, Type, X } from 'lucide-react';

const PARTY_COLORS = [
  '#0ea5e9', '#8b5cf6', '#f59e0b',
  '#10b981', '#ef4444', '#ec4899',
  '#6366f1', '#14b8a6',
];

const FIELD_TYPES = [
  {
    type:  'signature',
    label: 'Signature',
    icon:  PenTool,
    desc:  'Draw or type a signature',
  },
  {
    type:  'text',
    label: 'Text Field',
    icon:  Type,
    desc:  'Name, date, or any text',
  },
];

export default function FieldToolbar({
  parties,
  selectedPartyIndex,
  onPartySelect,
  onAddField,
  pendingFieldType,
}) {
  if (!parties || parties.length === 0) return null;

  const selectedParty = parties[selectedPartyIndex];
  const partyColor    = selectedParty?.color ||
    PARTY_COLORS[selectedPartyIndex % PARTY_COLORS.length];

  return (
    <div className="space-y-4">

      {/* Header */}
      <p className="text-[10px] font-bold text-slate-400
                    uppercase tracking-widest">
        Place Fields
      </p>

      {/* Party selector */}
      <div>
        <label className="text-[10px] font-bold text-slate-400
                          uppercase tracking-wide mb-1.5 block">
          Assign to Party
        </label>
        <Select
          value={String(selectedPartyIndex)}
          onValueChange={v => onPartySelect(parseInt(v))}
        >
          <SelectTrigger
            className="rounded-xl border-slate-200
                       dark:border-slate-600 h-9 text-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {parties.map((p, i) => (
              <SelectItem key={i} value={String(i)}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: p.color ||
                        PARTY_COLORS[i % PARTY_COLORS.length],
                    }}
                  />
                  <span className="font-medium">
                    {p.name || `Signer ${i + 1}`}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Field type buttons */}
      <div className="space-y-2">
        {FIELD_TYPES.map(({ type, label, icon: Icon, desc }) => {
          const isActive = pendingFieldType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() =>
                onAddField(isActive ? null : type)
              }
              className={`w-full flex items-center gap-3 p-3
                          rounded-xl border-2 text-left
                          transition-all duration-150
                          active:scale-[0.98]
                          ${isActive
                            ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center
                             justify-center shrink-0 transition-colors
                             ${isActive
                               ? 'bg-sky-100 dark:bg-sky-900/40'
                               : 'bg-slate-100 dark:bg-slate-700'
                             }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive ? 'text-sky-500' : 'text-slate-400'
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold leading-tight
                               ${isActive
                                 ? 'text-sky-700 dark:text-sky-400'
                                 : 'text-slate-700 dark:text-slate-300'
                               }`}>
                  {label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {desc}
                </p>
              </div>
              {isActive && (
                <div className="shrink-0">
                  <div className="w-2 h-2 rounded-full
                                  bg-sky-500 animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active hint */}
      {pendingFieldType ? (
        <div className="flex items-center justify-between
                        bg-sky-50 dark:bg-sky-900/10
                        border border-sky-200 dark:border-sky-800
                        rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: partyColor }}
            />
            <p className="text-[10px] font-bold text-sky-700
                          dark:text-sky-400 leading-tight">
              Click on the PDF to place{' '}
              <span className="capitalize">{pendingFieldType}</span>{' '}
              for{' '}
              {selectedParty?.name || `Party ${selectedPartyIndex + 1}`}
            </p>
          </div>
          <button
            onClick={() => onAddField(null)}
            className="text-slate-400 hover:text-slate-600
                       shrink-0 ml-2 p-0.5 rounded"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Select a field type above, then click anywhere
          on the PDF to place it.
        </p>
      )}
    </div>
  );
}