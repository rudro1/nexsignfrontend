// import React from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card } from '@/components/ui/card';
// import { Plus, Trash2, GripVertical, User } from 'lucide-react';

// const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

// export default function PartyManager({ parties, onChange }) {
//   const addParty = () => {
//     const newParty = {
//       name: '',
//       email: '',
//       order: parties.length,
//       status: 'pending',
//       color: PARTY_COLORS[parties.length % PARTY_COLORS.length],
//     };
//     onChange([...parties, newParty]);
//   };

//   const removeParty = (index) => {
//     const updated = parties.filter((_, i) => i !== index).map((p, i) => ({
//       ...p,
//       order: i,
//       color: PARTY_COLORS[i % PARTY_COLORS.length],
//     }));
//     onChange(updated);
//   };

//   const updateParty = (index, field, value) => {
//     const updated = [...parties];
//     updated[index] = { ...updated[index], [field]: value };
//     onChange(updated);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
//           Signing Parties
//         </h3>
//         <Button onClick={addParty} size="sm" variant="outline" className="gap-1.5 rounded-lg text-sky-600 border-sky-200 hover:bg-sky-50 dark:border-sky-800 dark:hover:bg-sky-900/30">
//           <Plus className="w-3.5 h-3.5" /> Add Party
//         </Button>
//       </div>

//       {parties.length === 0 ? (
//         <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
//           <User className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
//           <p className="text-sm text-slate-400">Add signing parties to get started</p>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {parties.map((party, index) => (
//             <Card key={index} className="p-4 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 relative overflow-hidden">
//               <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: party.color }} />
//               <div className="flex items-start gap-3 pl-2">
//                 <div className="flex items-center gap-2 pt-2">
//                   <GripVertical className="w-4 h-4 text-slate-300" />
//                   <div 
//                     className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
//                     style={{ backgroundColor: party.color }}
//                   >
//                     {index + 1}
//                   </div>
//                 </div>
//                 <div className="flex-1 space-y-2">
//                   <div>
//                     <Label className="text-xs text-slate-500">Name</Label>
//                     <Input
//                       value={party.name}
//                       onChange={e => updateParty(index, 'name', e.target.value)}
//                       placeholder={`Signer ${index + 1}`}
//                       className="h-9 rounded-lg border-slate-200 dark:border-slate-600"
//                     />
//                   </div>
//                   <div>
//                     <Label className="text-xs text-slate-500">Email</Label>
//                     <Input
//                       type="email"
//                       value={party.email}
//                       onChange={e => updateParty(index, 'email', e.target.value)}
//                       placeholder="email@example.com"
//                       className="h-9 rounded-lg border-slate-200 dark:border-slate-600"
//                     />
//                   </div>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => removeParty(index)}
//                   className="text-slate-400 hover:text-red-500 shrink-0 mt-1"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </Button>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}

//       <p className="text-xs text-slate-400">
//         Parties will be notified in order. Party 1 signs first, then Party 2, and so on.
//       </p>
//     </div>
//   );
// }
// src/components/editor/PartyManager.jsx
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import {
  Plus, Trash2, User, GripVertical,
  AlertCircle,
} from 'lucide-react';

const PARTY_COLORS = [
  '#0ea5e9', '#8b5cf6', '#f59e0b',
  '#10b981', '#ef4444', '#ec4899',
  '#6366f1', '#14b8a6',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PartyManager({ parties, onChange }) {

  const addParty = useCallback(() => {
    onChange([
      ...parties,
      {
        name:   '',
        email:  '',
        order:  parties.length,
        status: 'pending',
        color:  PARTY_COLORS[parties.length % PARTY_COLORS.length],
      },
    ]);
  }, [parties, onChange]);

  const removeParty = useCallback((index) => {
    const updated = parties
      .filter((_, i) => i !== index)
      .map((p, i) => ({
        ...p,
        order: i,
        color: PARTY_COLORS[i % PARTY_COLORS.length],
      }));
    onChange(updated);
  }, [parties, onChange]);

  const updateParty = useCallback((index, field, value) => {
    const updated = [...parties];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }, [parties, onChange]);

  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400
                        uppercase tracking-widest">
            Signing Parties
          </p>
          {parties.length > 0 && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              Signs in order: 1 → 2 → 3...
            </p>
          )}
        </div>
        <Button
          onClick={addParty}
          size="sm"
          variant="outline"
          disabled={parties.length >= 8}
          className="gap-1.5 rounded-xl text-sky-600
                     border-sky-200 dark:border-sky-800
                     hover:bg-sky-50 dark:hover:bg-sky-900/20
                     h-8 px-3 text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {/* Empty state */}
      {parties.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed
                        border-slate-200 dark:border-slate-700
                        rounded-2xl">
          <User className="w-8 h-8 text-slate-300 dark:text-slate-600
                           mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">
            Add signing parties to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {parties.map((party, index) => {
            const emailError = party.email &&
              !EMAIL_RE.test(party.email);

            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-800/50
                           border border-slate-200 dark:border-slate-700
                           rounded-2xl overflow-hidden
                           transition-shadow hover:shadow-sm"
              >
                {/* Color bar */}
                <div
                  className="h-1"
                  style={{ backgroundColor: party.color }}
                />

                <div className="p-3">
                  <div className="flex items-start gap-2">

                    {/* Order number */}
                    <div className="flex flex-col items-center
                                    gap-1 shrink-0 pt-1">
                      <GripVertical className="w-3.5 h-3.5
                                               text-slate-300" />
                      <div
                        className="w-6 h-6 rounded-lg flex items-center
                                   justify-center text-white
                                   text-[10px] font-black"
                        style={{ backgroundColor: party.color }}
                      >
                        {index + 1}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 space-y-2 min-w-0">
                      {/* Name */}
                      <div>
                        <Label className="text-[10px] text-slate-400
                                          font-bold uppercase tracking-wide
                                          mb-1 block">
                          Name *
                        </Label>
                        <Input
                          value={party.name}
                          onChange={e =>
                            updateParty(index, 'name', e.target.value)
                          }
                          placeholder={`Signer ${index + 1}`}
                          className="h-8 rounded-xl text-xs
                                     border-slate-200 dark:border-slate-600
                                     focus:border-sky-400 focus:ring-sky-400"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <Label className="text-[10px] text-slate-400
                                          font-bold uppercase tracking-wide
                                          mb-1 block">
                          Email *
                        </Label>
                        <div className="relative">
                          <Input
                            type="email"
                            value={party.email}
                            onChange={e =>
                              updateParty(index, 'email', e.target.value)
                            }
                            placeholder="email@example.com"
                            className={`h-8 rounded-xl text-xs pr-7
                                        ${emailError
                                          ? 'border-red-400 focus:ring-red-400'
                                          : 'border-slate-200 dark:border-slate-600 focus:border-sky-400 focus:ring-sky-400'
                                        }`}
                          />
                          {emailError && (
                            <AlertCircle className="absolute right-2
                                                    top-1/2 -translate-y-1/2
                                                    w-3.5 h-3.5 text-red-400" />
                          )}
                        </div>
                        {emailError && (
                          <p className="text-[9px] text-red-400 mt-1 font-medium">
                            Invalid email address
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParty(index)}
                      className="w-7 h-7 rounded-xl shrink-0 mt-1
                                 text-slate-300 hover:text-red-500
                                 hover:bg-red-50 dark:hover:bg-red-900/20
                                 transition-colors"
                      title="Remove party"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Max parties note */}
      {parties.length >= 8 && (
        <p className="text-[10px] text-amber-500 font-medium text-center">
          Maximum 8 signing parties reached
        </p>
      )}
    </div>
  );
}