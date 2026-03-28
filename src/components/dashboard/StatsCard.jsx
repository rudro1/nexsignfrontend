
// import React from 'react';
// import { Card, CardContent } from '@/components/ui/Card';

// // ১. ম্যাপটি কম্পোনেন্টের বাইরে রাখা ভালো যাতে প্রতি রেন্ডারে নতুন করে মেমরি না নেয়।
// const colorMap = {
//   sky: 'bg-sky-50 dark:bg-sky-900/20 text-sky-500',
//   green: 'bg-green-50 dark:bg-green-900/20 text-green-500',
//   amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
//   violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-500',
// };

// // ২. React.memo ব্যবহার করা হয়েছে যাতে ড্যাশবোর্ডে অন্য কিছু পরিবর্তন হলে এই কার্ডগুলো অকারণে রি-রেন্ডার না হয়।
// const StatsCard = React.memo(({ label, value, icon: Icon, color = 'sky' }) => {
//   const colorClass = colorMap[color] || colorMap.sky;

//   return (
//     <Card className="p-6 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 group overflow-hidden relative">
//       <CardContent className="p-0">
//         <div className="flex items-center justify-between relative z-10">
//           <div>
//             <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{label}</p>
//             {/* ৩. ভ্যালু যদি বড় হয় তবে যাতে ভেঙে না যায় সেজন্য ট্রানকেশন এবং ফন্ট অপ্টিমাইজেশন */}
//             <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 leading-none">
//               {value}
//             </p>
//           </div>
//           {/* ৪. আইকন সেকশনে হালকা অ্যানিমেশন যোগ করা হয়েছে যা প্রোডাক্টকে প্রিমিয়াম ফিল দেয় */}
//           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${colorClass}`}>
//             {Icon && <Icon className="w-6 h-6" />}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// });

// export default StatsCard;
// src/components/dashboard/StatsCard.jsx
import React from 'react';

const COLOR_MAP = {
  sky: {
    bg:   'bg-sky-50    dark:bg-sky-900/20',
    icon: 'text-sky-500',
    glow: 'shadow-sky-100 dark:shadow-sky-900/20',
  },
  green: {
    bg:   'bg-emerald-50    dark:bg-emerald-900/20',
    icon: 'text-emerald-500',
    glow: 'shadow-emerald-100 dark:shadow-emerald-900/20',
  },
  amber: {
    bg:   'bg-amber-50    dark:bg-amber-900/20',
    icon: 'text-amber-500',
    glow: 'shadow-amber-100 dark:shadow-amber-900/20',
  },
  violet: {
    bg:   'bg-violet-50    dark:bg-violet-900/20',
    icon: 'text-violet-500',
    glow: 'shadow-violet-100 dark:shadow-violet-900/20',
  },
  rose: {
    bg:   'bg-rose-50    dark:bg-rose-900/20',
    icon: 'text-rose-500',
    glow: 'shadow-rose-100 dark:shadow-rose-900/20',
  },
};

const StatsCard = React.memo(({
  label,
  value,
  icon: Icon,
  color   = 'sky',
  loading = false,
  trend,      // optional: "+12%" text
  trendUp,    // optional: true/false
}) => {
  const c = COLOR_MAP[color] || COLOR_MAP.sky;

  return (
    <div className="group relative bg-white dark:bg-slate-800/50
                    border border-slate-200 dark:border-slate-700/50
                    rounded-2xl p-5 overflow-hidden
                    hover:shadow-lg transition-all duration-300
                    hover:-translate-y-0.5">

      {/* Background decoration */}
      <div className={`absolute -right-4 -top-4 w-24 h-24
                       ${c.bg} rounded-full opacity-40
                       group-hover:opacity-60 transition-opacity`} />

      <div className="relative flex items-start justify-between gap-3">
        {/* Left: label + value */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider
                        text-slate-400 dark:text-slate-500 mb-2">
            {label}
          </p>

          {loading ? (
            <div className="h-8 w-16 bg-slate-100 dark:bg-slate-700
                            rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-slate-900
                            dark:text-white leading-none tabular-nums">
                {value ?? 0}
              </p>
              {trend && (
                <span className={`text-xs font-bold mb-0.5
                  ${trendUp
                    ? 'text-emerald-500'
                    : 'text-red-400'
                  }`}>
                  {trend}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center
                         justify-center shrink-0 ${c.bg}
                         shadow-md ${c.glow}
                         group-hover:scale-110
                         transition-transform duration-300`}>
          {Icon && (
            <Icon className={`w-6 h-6 ${c.icon}`} />
          )}
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';
export default StatsCard;