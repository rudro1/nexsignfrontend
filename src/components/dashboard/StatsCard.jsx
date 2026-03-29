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
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 leading-none">
              {value}
            </h4>
            {trend && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {trend}
              </span>
            )}
          </div>
        </div>

        {/* Right: icon container */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${c.bg} ${c.icon}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
