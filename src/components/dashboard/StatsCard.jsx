// import React from 'react';
// import { Card } from '@/components/ui/card';

// export default function StatsCard({ label, value, icon: Icon, color = 'sky' }) {
//   const colors = {
//     sky: 'bg-sky-50 dark:bg-sky-900/20 text-sky-500',
//     green: 'bg-green-50 dark:bg-green-900/20 text-green-500',
//     amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
//     violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-500',
//   };

//   return (
//     <Card className="p-6 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
//           <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
//         </div>
//         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
//           <Icon className="w-6 h-6" />
//         </div>
//       </div>
//     </Card>
//   );
// }
import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

// ১. ম্যাপটি কম্পোনেন্টের বাইরে রাখা ভালো যাতে প্রতি রেন্ডারে নতুন করে মেমরি না নেয়।
const colorMap = {
  sky: 'bg-sky-50 dark:bg-sky-900/20 text-sky-500',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-500',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
  violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-500',
};

// ২. React.memo ব্যবহার করা হয়েছে যাতে ড্যাশবোর্ডে অন্য কিছু পরিবর্তন হলে এই কার্ডগুলো অকারণে রি-রেন্ডার না হয়।
const StatsCard = React.memo(({ label, value, icon: Icon, color = 'sky' }) => {
  const colorClass = colorMap[color] || colorMap.sky;

  return (
    <Card className="p-6 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 group overflow-hidden relative">
      <CardContent className="p-0">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{label}</p>
            {/* ৩. ভ্যালু যদি বড় হয় তবে যাতে ভেঙে না যায় সেজন্য ট্রানকেশন এবং ফন্ট অপ্টিমাইজেশন */}
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 leading-none">
              {value}
            </p>
          </div>
          {/* ৪. আইকন সেকশনে হালকা অ্যানিমেশন যোগ করা হয়েছে যা প্রোডাক্টকে প্রিমিয়াম ফিল দেয় */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${colorClass}`}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default StatsCard;