// // // import React from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import { Card } from "../ui/Card"; 
// // // import { Badge } from '@/components/ui/badge';
// // // import { Button } from '@/components/ui/button';
// // // import { toast } from 'sonner';
// // // import { FileText, Users, ArrowRight, Clock, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';

// // // const statusConfig = {
// // //   draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: Pencil },
// // //   pending: { label: 'Pending', color: 'bg-amber-100 hover:bg-blue text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
// // //   in_progress: { label: 'In Progress', color: 'bg-sky-100 hover:bg-blue text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Clock },
// // //   completed: { label: 'Completed', color: 'bg-green-100 hover:bg-blue text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
// // //   cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
// // // };

// // // const PARTY_COLORS = ['#0ea5e9','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899'];

// // // export default function DocumentCard({ doc }) {

// // //   const navigate = useNavigate();
// // //   const config = statusConfig[doc.status] || statusConfig.draft;
// // //   const StatusIcon = config.icon;
// // //   const parties = doc.parties || [];

// // //   const getProgress = () => {
// // //     if (!parties.length) return 0;
// // //     const signed = parties.filter(p => p.status === 'signed').length;
// // //     return Math.round((signed / parties.length) * 100);
// // //   };

// // //   const currentSigner =
// // //     parties.length > 0 && doc.status === 'in_progress'
// // //       ? parties[doc.currentPartyIndex || 0]
// // //       : null;

// // //   const formatDate = (dateString) => {
// // //     if (!dateString) return '';
// // //     const date = new Date(dateString);
// // //     return date.toLocaleDateString('en-US',{
// // //       month:'short',
// // //       day:'numeric',
// // //       year:'numeric'
// // //     });
// // //   };

// // //   const handleViewAction = () => {
// // //     if (doc.status === 'completed') {

// // //       if (doc.fileUrl) {
// // //         const timestamp = new Date(doc.updatedAt).getTime();
// // //         const finalUrl = `${doc.fileUrl}?v=${timestamp}`;
// // //         window.open(finalUrl,'_blank');
// // //       } 
// // //       else {
// // //         toast.error("File URL not found");
// // //       }

// // //     } 
// // //     else {
// // //       navigate(`/DocumentEditor?id=${doc._id}`);
// // //     }
// // //   };

// // //   return (

// // // <Card className="p-4 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700  dark:hover:border-sky-600 transition-all group w-full overflow-hidden">

// // // {/* Header */}

// // //       <div className="flex items-start justify-between gap-3 mb-4">

// // //         <div className="flex items-center gap-3 min-w-0 flex-1">

// // //            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center flex-shrink-0">
// // //                  <FileText className="w-4 h-4 text-sky-500"/>
// // //            </div>

// // //         <div className="min-w-0 flex-1">
// // //              <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm sm:text-base">{doc.title}</h3>

// // //                <p className="text-xs text-slate-400 mt-0.5">{formatDate(doc.updatedAt || doc.createdAt)}</p>
// // //         </div>

// // //       </div>

// // //       <Badge className={`${config.color} border-0 font-medium shrink-0`}>
// // //          <StatusIcon className="w-3 h-3 mr-1"/>{config.label}</Badge>
// // //       </div>


// // // {/* Parties Section */}

// // //           {parties.length > 0 && (

// // //               <div className="mb-4">

// // //                   <div className="flex items-center gap-2 mb-2">
// // //                    <Users className="w-3.5 h-3.5 text-slate-400"/>
// // //                     <span className="text-xs text-slate-500 dark:text-slate-400">{parties.length} parties</span>
// // //                </div>

// // //       <div className="flex gap-1">

// // //                {parties.map((p,i)=>(
// // //               <div  key={i} className="h-1.5 rounded-full flex-1" style={{ backgroundColor:p.status === 'signed'
// // //                        ? '#22c55e': p.status === 'sent'? PARTY_COLORS[i % PARTY_COLORS.length]: '#e2e8f0',
// // //                        opacity: p.status === 'signed'? 1: p.status === 'sent'? 0.6: 0.3}}/>
// // //                           ))}
// // //        </div>

// // //             {currentSigner && (
// // //               <p className="text-xs text-sky-500 mt-2 italic break-words"> Awaiting: {currentSigner.name}</p>)}

// // //         </div>
// // //       )}

// // // {/* Bottom Section */}

// // // <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">

// // //                   <span className="text-xs text-slate-400 font-medium">
// // //                   {doc.status === 'completed'? '100% complete': `${getProgress()}% complete`}
// // //                     </span>

// // //     <Button variant="ghost" size="sm" onClick={handleViewAction} 
// // //     className="text-sky-500 hover:text-blue-500 hover:bg-blue-200 hover:dark-text-blue-500 dark:hover:bg-sky-600 gap-1 font-semibold">

// // //        {doc.status === 'completed'? 'View Final': doc.status === 'draft'? 'Edit': 'View'}

// // //          <ArrowRight className="w-3.5 h-3.5"/>

// // //       </Button>

// // //     </div>

// // //  </Card>

// // //   );
// // // }



// // import React from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { Card } from "../ui/Card"; 
// // import { Badge } from '@/components/ui/badge';
// // import { Button } from '@/components/ui/button';
// // import { toast } from 'sonner';
// // import { FileText, Users, ArrowRight, Clock, CheckCircle2, AlertCircle, Pencil, Send } from 'lucide-react';

// // const statusConfig = {
// //   draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600', icon: Pencil },
// //   sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
// //   in_progress: { label: 'Active', color: 'bg-sky-100 text-sky-700', icon: Clock },
// //   completed: { label: 'Signed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
// //   cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
// // };

// // const PARTY_COLORS = ['#0ea5e9','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899'];

// // export default function DocumentCard({ doc }) {
// //   const navigate = useNavigate();
// //   const config = statusConfig[doc.status] || statusConfig.draft;
// //   const StatusIcon = config.icon;
// //   const parties = doc.parties || [];

// //   const getProgress = () => {
// //     if (!parties.length) return 0;
// //     const signedCount = parties.filter(p => p.status === 'signed').length;
// //     return Math.round((signedCount / parties.length) * 100);
// //   };

// //   const currentSigner = parties.length > 0 && doc.status === 'in_progress'
// //     ? parties[doc.currentPartyIndex || 0]
// //     : null;

// //   const formatDate = (dateString) => {
// //     if (!dateString) return '---';
// //     return new Date(dateString).toLocaleDateString('en-US', {
// //       month: 'short', day: 'numeric', year: 'numeric'
// //     });
// //   };

// //   const handleAction = () => {
// //     if (doc.status === 'completed' && doc.fileUrl) {
// //       // ক্যাশ এড়াতে টাইমস্ট্যাম্প যোগ করা হয়েছে
// //       const finalUrl = `${doc.fileUrl}${doc.fileUrl.includes('?') ? '&' : '?'}v=${new Date(doc.updatedAt).getTime()}`;
// //       window.open(finalUrl, '_blank');
// //     } else {
// //       navigate(`/DocumentEditor?id=${doc._id}`);
// //     }
// //   };

// //   return (
// //     <Card className="p-5 bg-white border-slate-200 hover:border-[#28ABDF]/50 hover:shadow-lg transition-all group flex flex-col h-full">
      
// //       {/* Header */}
// //       <div className="flex items-start justify-between gap-3 mb-5">
// //         <div className="flex items-center gap-3 min-w-0 flex-1">
// //           <div className="w-10 h-10 rounded-xl bg-[#28ABDF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#28ABDF] transition-colors">
// //             <FileText className="w-5 h-5 text-[#28ABDF] group-hover:text-white" />
// //           </div>
// //           <div className="min-w-0">
// //             <h3 className="font-bold text-slate-900 truncate text-base">{doc.title || 'Untitled Document'}</h3>
// //             <p className="text-[11px] font-medium text-slate-400 mt-0.5">{formatDate(doc.updatedAt || doc.createdAt)}</p>
// //           </div>
// //         </div>
// //         <Badge className={`${config.color} border-0 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1`}>
// //           <StatusIcon className="w-3 h-3 mr-1" />
// //           {config.label}
// //         </Badge>
// //       </div>

// //       {/* Progress & Parties */}
// //       <div className="flex-1">
// //         {parties.length > 0 ? (
// //           <div className="mb-5">
// //             <div className="flex items-center justify-between mb-2">
// //               <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
// //                 <Users className="w-3.5 h-3.5" /> {parties.length} {parties.length === 1 ? 'Recipient' : 'Recipients'}
// //               </span>
// //               <span className="text-[11px] font-black text-[#28ABDF]">{getProgress()}%</span>
// //             </div>
            
// //             {/* Segmented Progress Bar */}
// //             <div className="flex gap-1 h-1.5 mb-3">
// //               {parties.map((p, i) => (
// //                 <div 
// //                   key={i} 
// //                   className="rounded-full flex-1 transition-all duration-500"
// //                   style={{ 
// //                     backgroundColor: p.status === 'signed' ? '#10b981' : p.status === 'sent' ? '#28ABDF' : '#e2e8f0',
// //                     opacity: p.status === 'signed' ? 1 : p.status === 'sent' ? 0.6 : 0.3
// //                   }}
// //                 />
// //               ))}
// //             </div>

// //             {currentSigner && (
// //               <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
// //                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Awaiting signature from:</p>
// //                 <p className="text-xs text-[#28ABDF] font-bold truncate">{currentSigner.name}</p>
// //               </div>
// //             )}
// //           </div>
// //         ) : (
// //           <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl mb-5">
// //             <p className="text-[10px] font-bold text-slate-300 uppercase">No recipients added</p>
// //           </div>
// //         )}
// //       </div>

// //       {/* Footer Action */}
// //       <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
// //         <div className="flex -space-x-2">
// //           {parties.slice(0, 3).map((p, i) => (
// //             <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black" style={{ color: PARTY_COLORS[i % PARTY_COLORS.length] }}>
// //               {p.name?.charAt(0)}
// //             </div>
// //           ))}
// //           {parties.length > 3 && (
// //             <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
// //               +{parties.length - 3}
// //             </div>
// //           )}
// //         </div>
        
// //         <Button 
// //           variant="ghost" 
// //           size="sm" 
// //           onClick={handleAction} 
// //           className="text-[#28ABDF] hover:bg-[#28ABDF]/10 gap-2 font-bold text-xs"
// //         >
// //           {doc.status === 'completed' ? 'Download' : doc.status === 'draft' ? 'Continue' : 'Track'}
// //           <ArrowRight className="w-4 h-4" />
// //         </Button>
// //       </div>

// //     </Card>
// //   );
// // }
// import React, { useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Card } from "../ui/Card"; 
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { FileText, Users, ArrowRight, Clock, CheckCircle2, AlertCircle, Pencil, Send, Download } from 'lucide-react';

// const statusConfig = {
//   draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600', icon: Pencil },
//   sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
//   in_progress: { label: 'Active', color: 'bg-sky-100 text-sky-700', icon: Clock },
//   completed: { label: 'Signed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
//   cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
// };

// const PARTY_COLORS = ['#0ea5e9','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899'];

// const DocumentCard = React.memo(({ doc }) => {
//   const navigate = useNavigate();
  
//   const config = useMemo(() => statusConfig[doc.status] || statusConfig.draft, [doc.status]);
//   const StatusIcon = config.icon;
//   const parties = doc.parties || [];

//   // 🌟 প্রোগ্রেস ক্যালকুলেশন মেমোয়াইজড
//   const progress = useMemo(() => {
//     if (!parties.length) return 0;
//     const signedCount = parties.filter(p => p.status === 'signed').length;
//     return Math.round((signedCount / parties.length) * 100);
//   }, [parties]);

//   // 🌟 বর্তমান সাইনার লজিক মেমোয়াইজড
//   const currentSigner = useMemo(() => {
//     if (doc.status !== 'in_progress') return null;
//     return parties.find(p => p.status === 'sent' || p.status === 'waiting') || parties[0];
//   }, [doc.status, parties]);

//   // 🌟 ডেট ফরম্যাটিং মেমোয়াইজড (পারফরম্যান্স বুস্ট)
//   const formattedDate = useMemo(() => {
//     const dateString = doc.updatedAt || doc.createdAt;
//     if (!dateString) return '---';
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         month: 'short', day: 'numeric', year: 'numeric'
//       });
//     } catch (e) { return '---'; }
//   }, [doc.updatedAt, doc.createdAt]);

//   const handleAction = (e) => {
//     e.stopPropagation();
//     if (doc.status === 'completed' && doc.fileUrl) {
//       // ক্যাশ এড়াতে টাইমস্ট্যাম্প যোগ করা হয়েছে
//       const separator = doc.fileUrl.includes('?') ? '&' : '?';
//       const finalUrl = `${doc.fileUrl}${separator}cache_v=${new Date(doc.updatedAt).getTime()}`;
//       window.open(finalUrl, '_blank', 'noopener,noreferrer');
//     } else {
//       navigate(`/DocumentEditor?id=${doc._id}`);
//     }
//   };

//   return (
//     <Card 
//       onClick={() => navigate(`/DocumentEditor?id=${doc._id}`)}
//       className="p-5 bg-white border-slate-200 hover:border-[#28ABDF]/50 hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer relative overflow-hidden"
//     >
//       <div className="absolute -right-4 -top-4 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0" />

//       <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
//         <div className="flex items-center gap-3 min-w-0 flex-1">
//           <div className="w-10 h-10 rounded-xl bg-[#28ABDF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#28ABDF] transition-all duration-300">
//             <FileText className="w-5 h-5 text-[#28ABDF] group-hover:text-white" />
//           </div>
//           <div className="min-w-0">
//             <h3 className="font-bold text-slate-800 truncate text-base group-hover:text-[#28ABDF] transition-colors">
//               {doc.title || 'Untitled Document'}
//             </h3>
//             <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{formattedDate}</p>
//           </div>
//         </div>
//         <Badge className={`${config.color} border-0 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 shadow-sm`}>
//           <StatusIcon className="w-3 h-3 mr-1.5" />
//           {config.label}
//         </Badge>
//       </div>

//       <div className="flex-1 relative z-10">
//         {parties.length > 0 ? (
//           <div className="mb-5">
//             <div className="flex items-center justify-between mb-2.5">
//               <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
//                 <Users className="w-3.5 h-3.5 text-slate-400" /> 
//                 {parties.length} {parties.length === 1 ? 'Recipient' : 'Recipients'}
//               </span>
//               <span className="text-[12px] font-black text-[#28ABDF]">{progress}%</span>
//             </div>
            
//             <div className="flex gap-1 h-2 mb-4 bg-slate-50 rounded-full p-0.5">
//               {parties.map((p, i) => (
//                 <div 
//                   key={i} 
//                   className="rounded-full flex-1 transition-all duration-700 ease-out"
//                   style={{ 
//                     backgroundColor: p.status === 'signed' ? '#10b981' : p.status === 'sent' ? '#28ABDF' : '#cbd5e1',
//                     transform: p.status === 'signed' ? 'scaleY(1)' : 'scaleY(0.8)'
//                   }}
//                 />
//               ))}
//             </div>

//             {currentSigner && (
//               <div className="bg-[#28ABDF]/5 p-2.5 rounded-xl border border-[#28ABDF]/10 animate-in fade-in slide-in-from-bottom-2">
//                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Awaiting Signature</p>
//                 <div className="text-[11px] text-[#28ABDF] font-bold truncate flex items-center gap-1">
//                    <div className="w-1.5 h-1.5 rounded-full bg-[#28ABDF] animate-pulse" />
//                    {currentSigner.name}
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl mb-5 bg-slate-50/50 transition-colors group-hover:bg-white">
//             <Users className="w-5 h-5 text-slate-200 mb-1" />
//             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">No recipients added</p>
//           </div>
//         )}
//       </div>

//       <div className="pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
//         <div className="flex -space-x-2.5">
//           {parties.slice(0, 4).map((p, i) => (
//             <div 
//               key={i} 
//               className="w-7 h-7 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center text-[9px] font-black uppercase overflow-hidden" 
//               style={{ 
//                 color: PARTY_COLORS[i % PARTY_COLORS.length], 
//                 border: `1px solid ${PARTY_COLORS[i % PARTY_COLORS.length]}20` 
//               }}
//               title={p.name}
//             >
//               {p.name?.charAt(0) || '?'}
//             </div>
//           ))}
//           {parties.length > 4 && (
//             <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm">
//               +{parties.length - 4}
//             </div>
//           )}
//         </div>
        
//         <Button 
//           variant="ghost" 
//           size="sm" 
//           onClick={handleAction} 
//           className={`gap-2 font-bold text-xs rounded-full px-4 h-9 transition-all
//             ${doc.status === 'completed' 
//               ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' 
//               : 'bg-[#28ABDF]/5 text-[#28ABDF] hover:bg-[#28ABDF] hover:text-white'}`}
//         >
//           {doc.status === 'completed' ? (
//             <><Download className="w-3.5 h-3.5" /> Download</>
//           ) : (
//             <>{doc.status === 'draft' ? 'Edit' : 'Track'} <ArrowRight className="w-3.5 h-3.5" /></>
//           )}
//         </Button>
//       </div>
//     </Card>
//   );
// });

// export default DocumentCard;
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "../ui/Card"; 
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Users, ArrowRight, Clock, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';

// ১. কনফিগ অবজেক্টটি কম্পোনেন্টের বাইরে নিয়ে আসা হয়েছে যাতে প্রতি রেন্ডারে নতুন মেমরি না নেয়।
const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: Pencil },
  pending: { label: 'Pending', color: 'bg-amber-100 hover:bg-blue text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-sky-100 hover:bg-blue text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 hover:bg-blue text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
};

const PARTY_COLORS = ['#0ea5e9','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899'];

// ২. React.memo ব্যবহার করা হয়েছে যাতে লিস্ট স্ক্রোল করার সময় অকারণে রি-রেন্ডার না হয়।
const DocumentCard = React.memo(({ doc }) => {
  const navigate = useNavigate();
  const config = statusConfig[doc.status] || statusConfig.draft;
  const StatusIcon = config.icon;
  const parties = doc.parties || [];

  // ৩. প্রোগ্রেস ক্যালকুলেশন মেমোয়াইজড (পারফরম্যান্স বুস্ট)
  const progress = useMemo(() => {
    if (!parties.length) return 0;
    const signed = parties.reduce((acc, p) => p.status === 'signed' ? acc + 1 : acc, 0);
    return Math.round((signed / parties.length) * 100);
  }, [parties]);

  // ৪. কারেন্ট সাইনার লজিক অপ্টিমাইজড
  const currentSigner = useMemo(() => {
    return parties.length > 0 && doc.status === 'in_progress'
      ? parties[doc.currentPartyIndex || 0]
      : null;
  }, [parties, doc.status, doc.currentPartyIndex]);

  // ৫. ডেট ফরম্যাটিং মেমোয়াইজড
  const formattedDate = useMemo(() => {
    const dateString = doc.updatedAt || doc.createdAt;
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch (e) { return ''; }
  }, [doc.updatedAt, doc.createdAt]);

  // ৬. হ্যান্ডলার মেমোয়াইজড
  const handleViewAction = useCallback((e) => {
    e.stopPropagation(); // ইভেন্ট বাবিলিং রোধ
    if (doc.status === 'completed') {
      if (doc.fileUrl) {
        const timestamp = new Date(doc.updatedAt).getTime();
        const finalUrl = `${doc.fileUrl}?v=${timestamp}`;
        window.open(finalUrl, '_blank');
      } else {
        toast.error("File URL not found");
      }
    } else {
      navigate(`/DocumentEditor?id=${doc._id}`);
    }
  }, [doc.status, doc.fileUrl, doc.updatedAt, doc._id, navigate]);

  return (
    <Card className="p-4 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:hover:border-sky-600 transition-all group w-full overflow-hidden will-change-transform">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-sky-500"/>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm sm:text-base">{doc.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{formattedDate}</p>
          </div>
        </div>
        <Badge className={`${config.color} border-0 font-medium shrink-0`}>
          <StatusIcon className="w-3 h-3 mr-1"/>{config.label}
        </Badge>
      </div>

      {/* Parties Section */}
      {parties.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-slate-400"/>
            <span className="text-xs text-slate-500 dark:text-slate-400">{parties.length} parties</span>
          </div>
          <div className="flex gap-1 h-1.5">
            {parties.map((p, i) => (
              <div 
                key={i} 
                className="rounded-full flex-1 transition-opacity duration-500" 
                style={{ 
                  backgroundColor: p.status === 'signed' ? '#22c55e' : p.status === 'sent' ? PARTY_COLORS[i % PARTY_COLORS.length] : '#e2e8f0',
                  opacity: p.status === 'signed' ? 1 : p.status === 'sent' ? 0.6 : 0.3
                }}
              />
            ))}
          </div>
          {currentSigner && (
            <p className="text-xs text-sky-500 mt-2 italic break-words">Awaiting: {currentSigner.name}</p>
          )}
        </div>
      )}

      {/* Bottom Section */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
        <span className="text-xs text-slate-400 font-medium">
          {doc.status === 'completed' ? '100% complete' : `${progress}% complete`}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleViewAction} 
          className="text-sky-500 hover:text-blue-500 hover:bg-blue-200 dark:hover:bg-sky-600 gap-1 font-semibold transition-colors"
        >
          {doc.status === 'completed' ? 'View Final' : doc.status === 'draft' ? 'Edit' : 'View'}
          <ArrowRight className="w-3.5 h-3.5"/>
        </Button>
      </div>
    </Card>
  );
});

export default DocumentCard;