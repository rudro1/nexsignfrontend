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

const colorMap = {
  sky: 'bg-sky-50 dark:bg-sky-900/20 text-sky-500',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-500',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
  violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-500',
};

export default function StatsCard({ label, value, icon: Icon, color = 'sky' }) {
  const colorClass = colorMap[color] || colorMap.sky;

  return (
    <Card className="p-6 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}