// src/components/dashboard/StatsCard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ─── cn helper ───────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

// ─── Color tokens ─────────────────────────────────────────────────
const COLOR_MAP = {
  sky: {
    bg:     'bg-sky-50 dark:bg-sky-900/20',
    icon:   'text-sky-500',
    border: 'hover:border-sky-200 dark:hover:border-sky-800',
    glow:   'hover:shadow-sky-100/80 dark:hover:shadow-sky-900/30',
    dot:    'bg-sky-400',
  },
  green: {
    bg:     'bg-emerald-50 dark:bg-emerald-900/20',
    icon:   'text-emerald-500',
    border: 'hover:border-emerald-200 dark:hover:border-emerald-800',
    glow:   'hover:shadow-emerald-100/80 dark:hover:shadow-emerald-900/30',
    dot:    'bg-emerald-400',
  },
  amber: {
    bg:     'bg-amber-50 dark:bg-amber-900/20',
    icon:   'text-amber-500',
    border: 'hover:border-amber-200 dark:hover:border-amber-800',
    glow:   'hover:shadow-amber-100/80 dark:hover:shadow-amber-900/30',
    dot:    'bg-amber-400',
  },
  violet: {
    bg:     'bg-violet-50 dark:bg-violet-900/20',
    icon:   'text-violet-500',
    border: 'hover:border-violet-200 dark:hover:border-violet-800',
    glow:   'hover:shadow-violet-100/80 dark:hover:shadow-violet-900/30',
    dot:    'bg-violet-400',
  },
  rose: {
    bg:     'bg-rose-50 dark:bg-rose-900/20',
    icon:   'text-rose-500',
    border: 'hover:border-rose-200 dark:hover:border-rose-800',
    glow:   'hover:shadow-rose-100/80 dark:hover:shadow-rose-900/30',
    dot:    'bg-rose-400',
  },
};

// ─── Animated number hook ─────────────────────────────────────────
function useCountUp(target, duration = 900, enabled = true) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    // Only animate if value is a plain number
    const num = typeof target === 'number' ? target : null;
    if (!enabled || num === null) {
      setDisplay(target);
      return;
    }

    const start     = performance.now();
    const startVal  = 0;

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (num - startVal) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);

  return display;
}

// ─── Skeleton ─────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 overflow-hidden">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-3">
        {/* label */}
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        {/* value */}
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        {/* subtitle */}
        <div className="h-3 w-32 bg-slate-100 dark:bg-slate-700/60 rounded-full animate-pulse" />
      </div>
      {/* icon */}
      <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
const StatsCard = React.memo(({
  label,
  value,
  icon: Icon,
  color      = 'sky',
  loading    = false,
  trend,          // e.g. "+12%" or "3 this week"
  trendUp,        // true = green, false = red, undefined = neutral
  subtitle,       // small line below value
  onClick,        // optional click handler
}) => {
  // ── animated counter ──────────────────────────────────────────
  const animated = useCountUp(
    typeof value === 'number' ? value : 0,
    800,
    typeof value === 'number' && !loading,
  );
  const displayValue = typeof value === 'number' ? animated : value;

  if (loading) return <Skeleton />;

  const c = COLOR_MAP[color] || COLOR_MAP.sky;
  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-white dark:bg-slate-800/50 overflow-hidden',
        'border border-slate-200 dark:border-slate-700/50',
        'rounded-2xl p-5',
        'transition-all duration-250',
        'hover:shadow-lg hover:-translate-y-0.5',
        c.border,
        c.glow,
        isClickable && 'cursor-pointer',
      )}
    >
      {/* Decorative circle bg */}
      <div className={cn(
        'absolute -right-5 -top-5 w-24 h-24 rounded-full opacity-50',
        'group-hover:opacity-70 group-hover:scale-110',
        'transition-all duration-300',
        c.bg,
      )} />

      {/* Dot accent (top-left corner) */}
      <div className={cn(
        'absolute top-0 left-0 w-1 h-8 rounded-br-full opacity-60',
        'group-hover:h-12 transition-all duration-300',
        c.dot,
      )} />

      <div className="relative flex items-start justify-between gap-3">

        {/* ── Left: label + value + subtitle ─────────────────── */}
        <div className="min-w-0 flex-1">

          {/* Label */}
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-2 leading-none">
            {label}
          </p>

          {/* Value + trend */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
              {displayValue ?? '—'}
            </span>

            {trend && (
              <span className={cn(
                'inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full leading-none',
                trendUp === true
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  : trendUp === false
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
              )}>
                {trendUp === true && <TrendingUp size={9} strokeWidth={2.5} />}
                {trendUp === false && <TrendingDown size={9} strokeWidth={2.5} />}
                {trend}
              </span>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 leading-snug font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* ── Right: icon ─────────────────────────────────────── */}
        <div className={cn(
          'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0',
          'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
          'shadow-sm',
          c.bg, c.icon,
        )}>
          {Icon && <Icon size={20} strokeWidth={2} />}
        </div>
      </div>

      {/* Click hint arrow */}
      {isClickable && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg width="14" height="14" viewBox="0 0 14 14" className={cn('rotate-45', c.icon)}>
            <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      )}
    </div>
  );
});

StatsCard.displayName = 'StatsCard';
export default StatsCard;