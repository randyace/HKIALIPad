/**
 * KpiStatCard.tsx
 * KPI / metric summary card.
 * Displays a headline value with optional unit, percentage change indicator,
 * sub-label, icon, and a color-coded accent. Supports a loading skeleton state.
 *
 * Place in: src/components/figma-ui/KpiStatCard.tsx
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type KpiColor =
  | 'blue'
  | 'green'
  | 'amber'
  | 'red'
  | 'purple'
  | 'indigo'
  | 'teal'
  | 'navy';

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiStatCardProps {
  /** Card title / metric name */
  title: string;
  /** Primary display value (e.g. "2,341" or "HK$892K") */
  value: string | number;
  /** Small unit label appended after the value */
  unit?: string;
  /** Numeric percentage change (e.g. 12.4 for +12.4%) */
  change?: number;
  /** Override the auto-derived trend direction */
  trend?: KpiTrend;
  /** Text shown under the change pill (e.g. "vs. last month") */
  changeLabel?: string;
  /** Secondary descriptor below the value */
  subtitle?: string;
  /** Icon element rendered in the colored badge on the right */
  icon?: React.ReactNode;
  /** Color theme for the icon badge and accent */
  color?: KpiColor;
  /** Shows an animated skeleton placeholder */
  loading?: boolean;
  /** Makes the whole card a clickable button */
  onClick?: () => void;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOR_ICON_BG: Record<KpiColor, string> = {
  blue:   'bg-blue-50 text-blue-600',
  green:  'bg-green-50 text-green-600',
  amber:  'bg-amber-50 text-amber-600',
  red:    'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  teal:   'bg-teal-50 text-teal-600',
  navy:   'bg-[#e8edf3] text-[#0f2942]',
};

const COLOR_ACCENT: Record<KpiColor, string> = {
  blue:   'border-t-blue-500',
  green:  'border-t-green-500',
  amber:  'border-t-amber-500',
  red:    'border-t-red-500',
  purple: 'border-t-purple-500',
  indigo: 'border-t-indigo-500',
  teal:   'border-t-teal-500',
  navy:   'border-t-[#0f2942]',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function KpiStatCard({
  title,
  value,
  unit,
  change,
  trend,
  changeLabel,
  subtitle,
  icon,
  color = 'blue',
  loading = false,
  onClick,
  className = '',
}: KpiStatCardProps) {
  // Derive trend direction from change if not explicitly provided
  const resolvedTrend: KpiTrend =
    trend ?? (change == null ? 'neutral' : change > 0 ? 'up' : change < 0 ? 'down' : 'neutral');

  const isClickable = Boolean(onClick);

  const Wrapper = isClickable ? 'button' : 'div';

  return (
    <Wrapper
      {...(isClickable ? { type: 'button', onClick } : {})}
      className={[
        'w-full text-left bg-white rounded-xl border border-gray-200 border-t-4 p-5 flex flex-col gap-3',
        COLOR_ACCENT[color],
        isClickable
          ? 'cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:ring-offset-2'
          : '',
        className,
      ].join(' ')}
    >
      {loading ? (
        <SkeletonContent />
      ) : (
        <>
          {/* ── Row 1: title + icon badge ── */}
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-medium text-gray-500 leading-snug">
              {title}
            </span>
            {icon && (
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  COLOR_ICON_BG[color]
                }`}
                aria-hidden
              >
                <span className="w-4 h-4">{icon}</span>
              </span>
            )}
          </div>

          {/* ── Row 2: value + unit ── */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900 leading-none tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-gray-500">{unit}</span>
            )}
          </div>

          {/* ── Row 3: subtitle ── */}
          {subtitle && (
            <p className="text-xs text-gray-500 leading-snug">{subtitle}</p>
          )}

          {/* ── Row 4: change pill ── */}
          {change != null && (
            <div className="flex items-center gap-2 flex-wrap">
              <TrendPill value={change} trend={resolvedTrend} />
              {changeLabel && (
                <span className="text-xs text-gray-500">{changeLabel}</span>
              )}
            </div>
          )}
        </>
      )}
    </Wrapper>
  );
}

// ─── Internal sub-components ─────────────────────────────────────────────────

function TrendPill({
  value,
  trend,
}: {
  value: number;
  trend: KpiTrend;
}) {
  const abs = Math.abs(value);
  const formatted = `${trend === 'up' ? '+' : trend === 'down' ? '-' : ''}${abs.toFixed(1)}%`;

  const colorClass =
    trend === 'up'
      ? 'bg-green-50 text-green-700'
      : trend === 'down'
      ? 'bg-red-50 text-red-600'
      : 'bg-gray-100 text-gray-500';

  const Arrow =
    trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}
    >
      <span aria-hidden>{Arrow}</span>
      {formatted}
    </span>
  );
}

function SkeletonContent() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-2/5" />
        <div className="w-9 h-9 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-7 bg-gray-200 rounded w-3/5" />
      <div className="h-3 bg-gray-200 rounded w-4/5" />
      <div className="h-5 bg-gray-200 rounded w-1/4" />
    </div>
  );
}
