// // import React from 'react';
// // import { Link } from 'react-router-dom';
// // import { createPageUrl } from '@/utils';
// // import { Card } from '@/components/ui/card';
// // import { Badge } from '@/components/ui/badge';
// // import { Button } from '@/components/ui/button';
// // import { FileText, Users, ArrowRight, Clock, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
// // import { format } from 'date-fns';

// // const statusConfig = {
// //   draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: Pencil },
// //   pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
// //   in_progress: { label: 'In Progress', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Clock },
// //   completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
// //   cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
// // };

// // const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// // export default function DocumentCard({ doc }) {
// //   const config = statusConfig[doc.status] || statusConfig.draft;
// //   const StatusIcon = config.icon;
// //   const parties = doc.parties || [];

// //   const getProgress = () => {
// //     if (!parties.length) return 0;
// //     const signed = parties.filter(p => p.status === 'signed').length;
// //     return Math.round((signed / parties.length) * 100);
// //   };

// //   const currentSigner = parties.length > 0 && doc.status === 'in_progress'
// //     ? parties[doc.current_party_index || 0]
// //     : null;

// //   return (
// //     <Card className="p-5 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-all group">
// //       <div className="flex items-start justify-between mb-4">
// //         <div className="flex items-center gap-3">
// //           <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
// //             <FileText className="w-5 h-5 text-sky-500" />
// //           </div>
// //           <div>
// //             <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{doc.title}</h3>
// //             <p className="text-xs text-slate-400 mt-0.5">
// //               {doc.created_date ? format(new Date(doc.created_date), 'MMM d, yyyy') : ''}
// //             </p>
// //           </div>
// //         </div>
// //         <Badge className={`${config.color} border-0 font-medium`}>
// //           <StatusIcon className="w-3 h-3 mr-1" />
// //           {config.label}
// //         </Badge>
// //       </div>

// //       {parties.length > 0 && (
// //         <div className="mb-4">
// //           <div className="flex items-center gap-2 mb-2">
// //             <Users className="w-3.5 h-3.5 text-slate-400" />
// //             <span className="text-xs text-slate-500 dark:text-slate-400">{parties.length} parties</span>
// //           </div>
// //           <div className="flex gap-1">
// //             {parties.map((p, i) => (
// //               <div
// //                 key={i}
// //                 className="h-1.5 rounded-full flex-1"
// //                 style={{
// //                   backgroundColor: p.status === 'signed' 
// //                     ? '#22c55e' 
// //                     : p.status === 'sent' 
// //                     ? PARTY_COLORS[i % PARTY_COLORS.length] 
// //                     : '#e2e8f0',
// //                   opacity: p.status === 'signed' ? 1 : p.status === 'sent' ? 0.6 : 0.3
// //                 }}
// //               />
// //             ))}
// //           </div>
// //           {currentSigner && (
// //             <p className="text-xs text-sky-500 mt-2">
// //               Awaiting: {currentSigner.name}
// //             </p>
// //           )}
// //         </div>
// //       )}

// //       <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
// //         <span className="text-xs text-slate-400">
// //           {doc.status === 'completed' ? '100%' : `${getProgress()}%`} complete
// //         </span>
// //         <Link to={createPageUrl('DocumentEditor') + `?id=${doc.id}`}>
// //           <Button variant="ghost" size="sm" className="text-sky-500 hover:text-sky-600 gap-1 -mr-2">
// //             {doc.status === 'draft' ? 'Edit' : 'View'}
// //             <ArrowRight className="w-3.5 h-3.5" />
// //           </Button>
// //         </Link>
// //       </div>
// //     </Card>
// //   );
// // }

// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { FileText, Users, ArrowRight, Clock, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';

// const statusConfig = {
//   draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: Pencil },
//   pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
//   in_progress: { label: 'In Progress', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Clock },
//   completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
//   cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
// };

// const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// export default function DocumentCard({ doc }) {
//   const config = statusConfig[doc.status] || statusConfig.draft;
//   const StatusIcon = config.icon;
//   const parties = doc.parties || [];

//   const getProgress = () => {
//     if (!parties.length) return 0;
//     const signed = parties.filter(p => p.status === 'signed').length;
//     return Math.round((signed / parties.length) * 100);
//   };

//   const currentSigner = parties.length > 0 && doc.status === 'in_progress'
//     ? parties[doc.current_party_index || 0]
//     : null;

//   // ✅ Date Format (date-fns না থাকলে)
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   };

//   return (
//     <Card className="p-5 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-all group">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
//             <FileText className="w-5 h-5 text-sky-500" />
//           </div>
//           <div>
//             <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{doc.title}</h3>
//             <p className="text-xs text-slate-400 mt-0.5">
//               {formatDate(doc.created_date || doc.createdAt)}
//             </p>
//           </div>
//         </div>
//         <Badge className={`${config.color} border-0 font-medium`}>
//           <StatusIcon className="w-3 h-3 mr-1" />
//           {config.label}
//         </Badge>
//       </div>

//       {parties.length > 0 && (
//         <div className="mb-4">
//           <div className="flex items-center gap-2 mb-2">
//             <Users className="w-3.5 h-3.5 text-slate-400" />
//             <span className="text-xs text-slate-500 dark:text-slate-400">{parties.length} parties</span>
//           </div>
//           <div className="flex gap-1">
//             {parties.map((p, i) => (
//               <div
//                 key={i}
//                 className="h-1.5 rounded-full flex-1"
//                 style={{
//                   backgroundColor: p.status === 'signed' 
//                     ? '#22c55e' 
//                     : p.status === 'sent' 
//                     ? PARTY_COLORS[i % PARTY_COLORS.length] 
//                     : '#e2e8f0',
//                   opacity: p.status === 'signed' ? 1 : p.status === 'sent' ? 0.6 : 0.3
//                 }}
//               />
//             ))}
//           </div>
//           {currentSigner && (
//             <p className="text-xs text-sky-500 mt-2">
//               Awaiting: {currentSigner.name}
//             </p>
//           )}
//         </div>
//       )}

//       <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
//         <span className="text-xs text-slate-400">
//           {doc.status === 'completed' ? '100%' : `${getProgress()}%`} complete
//         </span>
//         <Link to={`/DocumentEditor?id=${doc._id || doc.id}`}>
//           <Button variant="ghost" size="sm" className="text-sky-500 hover:text-sky-600 gap-1 -mr-2">
//             {doc.status === 'draft' ? 'Edit' : 'View'}
//             <ArrowRight className="w-3.5 h-3.5" />
//           </Button>
//         </Link>
//       </div>
//     </Card>
//   );
// }
// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom'; // ✅ useNavigate যোগ করা হয়েছে
// import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { FileText, Users, ArrowRight, Clock, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';

// const statusConfig = {
//   draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: Pencil },
//   pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
//   in_progress: { label: 'In Progress', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Clock },
//   completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
//   cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
// };

// const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

// export default function DocumentCard({ doc }) {
//   const navigate = useNavigate(); // ✅ নেভিগেশন কন্ট্রোল করার জন্য
//   const config = statusConfig[doc.status] || statusConfig.draft;
//   const StatusIcon = config.icon;
//   const parties = doc.parties || [];

//   const getProgress = () => {
//     if (!parties.length) return 0;
//     const signed = parties.filter(p => p.status === 'signed').length;
//     return Math.round((signed / parties.length) * 100);
//   };

//   const currentSigner = parties.length > 0 && doc.status === 'in_progress'
//     ? parties[doc.current_party_index || 0]
//     : null;

//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   };

//   // ✅ ভিউ হ্যান্ডলার লজিক
//   // const handleViewAction = () => {
//   //   if (doc.status === 'completed') {
//   //     // কমপ্লিটেড হলে নতুন ট্যাবে পিডিএফ ভিউয়ার ওপেন হবে
//   //     window.open(`http://localhost:5001/api/documents/view-signed/${doc._id || doc.id}`, '_blank');
//   //   } else {
//   //     // অন্যথায় এডিটর পেজে যাবে
//   //     navigate(`/DocumentEditor?id=${doc._id || doc.id}`);
//   //   }
//   // }; 

//   const handleViewAction = () => {
//   if (doc.status === 'completed') {
//     // সরাসরি ব্রাউজারের নতুন ট্যাবে ওপেন হবে
//     window.open(`http://localhost:5001/api/documents/view-signed/${doc._id}`, '_blank');
//   } else {
//     // এডিটর মোডে যাবে
//     navigate(`/DocumentEditor?id=${doc._id}`);
//   }
// };

//   return (
//     <Card className="p-5 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-all group">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
//             <FileText className="w-5 h-5 text-sky-500" />
//           </div>
//           <div>
//             <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{doc.title}</h3>
//             <p className="text-xs text-slate-400 mt-0.5">
//               {formatDate(doc.created_date || doc.createdAt)}
//             </p>
//           </div>
//         </div>
//         <Badge className={`${config.color} border-0 font-medium`}>
//           <StatusIcon className="w-3 h-3 mr-1" />
//           {config.label}
//         </Badge>
//       </div>

//       {parties.length > 0 && (
//         <div className="mb-4">
//           <div className="flex items-center gap-2 mb-2">
//             <Users className="w-3.5 h-3.5 text-slate-400" />
//             <span className="text-xs text-slate-500 dark:text-slate-400">{parties.length} parties</span>
//           </div>
//           <div className="flex gap-1">
//             {parties.map((p, i) => (
//               <div
//                 key={i}
//                 className="h-1.5 rounded-full flex-1"
//                 style={{
//                   backgroundColor: p.status === 'signed' 
//                     ? '#22c55e' 
//                     : p.status === 'sent' 
//                     ? PARTY_COLORS[i % PARTY_COLORS.length] 
//                     : '#e2e8f0',
//                   opacity: p.status === 'signed' ? 1 : p.status === 'sent' ? 0.6 : 0.3
//                 }}
//               />
//             ))}
//           </div>
//           {currentSigner && (
//             <p className="text-xs text-sky-500 mt-2 italic">
//               Awaiting: {currentSigner.name}
//             </p>
//           )}
//         </div>
//       )}

//       <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
//         <span className="text-xs text-slate-400 font-medium">
//           {doc.status === 'completed' ? '100% complete' : `${getProgress()}% complete`}
//         </span>
        
//         {/* ✅ বাটনটি এখন কন্ডিশনাল লজিক ফলো করবে */}
//         <Button 
//           variant="ghost" 
//           size="sm" 
//           onClick={handleViewAction}
//           className="text-sky-500 hover:text-sky-600 gap-1 -mr-2 font-semibold"
//         >
//           {doc.status === 'completed' ? 'View Final' : (doc.status === 'draft' ? 'Edit' : 'View')}
//           <ArrowRight className="w-3.5 h-3.5" />
//         </Button>
//       </div>
//     </Card>
//   );
// }
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { Card } from '@/components/ui/Card';
 import { Card } from "../ui/Card"; 
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Users, ArrowRight, Clock, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: Pencil },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
};

const PARTY_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

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

  const currentSigner = parties.length > 0 && doc.status === 'in_progress'
    ? parties[doc.currentPartyIndex || 0]
    : null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // const handleViewAction = () => {
  //   if (doc.status === 'completed') {
  //     if (doc.fileUrl) {
  //       window.open(doc.fileUrl, '_blank');
  //     }
  //   } else {
  //     navigate(`/DocumentEditor?id=${doc._id}`);
  //   }
  // };
// DocumentCard.jsx এর handleViewAction ফাংশনটি রিপ্লেস করুন
const handleViewAction = () => {
  if (doc.status === 'completed') {
    if (doc.fileUrl) {
      // 🌟 লিঙ্কের শেষে টাইমস্ট্যাম্প যোগ করছি যাতে ব্রাউজার ক্যাশ ক্লিয়ার হয়
      const timestamp = new Date(doc.updatedAt).getTime();
      const finalUrl = `${doc.fileUrl}?v=${timestamp}`;
      window.open(finalUrl, '_blank');
    } else {
      toast.error("File URL not found");
    }
  } else {
    navigate(`/DocumentEditor?id=${doc._id}`);
  }
};
  return (
    <Card className="p-5 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{doc.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {/* 🌟 লজিক ফিক্স: createdAt এর বদলে updatedAt ব্যবহার করা হয়েছে যাতে লেটেস্ট একটিভিটি বোঝা যায় */}
              {formatDate(doc.updatedAt || doc.createdAt)}
            </p>
          </div>
        </div>
        <Badge className={`${config.color} border-0 font-medium`}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      {parties.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">{parties.length} parties</span>
          </div>
          <div className="flex gap-1">
            {parties.map((p, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full flex-1"
                style={{
                  backgroundColor: p.status === 'signed' 
                    ? '#22c55e' 
                    : p.status === 'sent' 
                    ? PARTY_COLORS[i % PARTY_COLORS.length] 
                    : '#e2e8f0',
                  opacity: p.status === 'signed' ? 1 : p.status === 'sent' ? 0.6 : 0.3
                }}
              />
            ))}
          </div>
          {currentSigner && (
            <p className="text-xs text-sky-500 mt-2 italic">
              Awaiting: {currentSigner.name}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <span className="text-xs text-slate-400 font-medium">
          {doc.status === 'completed' ? '100% complete' : `${getProgress()}% complete`}
        </span>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleViewAction}
          className="text-sky-500 hover:text-sky-600 gap-1 -mr-2 font-semibold"
        >
          {doc.status === 'completed' ? 'View Final' : (doc.status === 'draft' ? 'Edit' : 'View')}
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}