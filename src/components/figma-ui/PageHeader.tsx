/**
 * PageHeader.tsx
 * Top-of-page header: title, optional subtitle, breadcrumb trail,
 * optional status badge, and a slot for primary/secondary action buttons.
 *
 * Place in: src/components/figma-ui/PageHeader.tsx
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  /** When provided the crumb renders as a clickable link */
  onClick?: () => void;
}

export type ActionVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface HeaderAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: ActionVariant;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export type BadgeColor =
  | 'blue'
  | 'green'
  | 'amber'
  | 'red'
  | 'purple'
  | 'gray'
  | 'navy';

export interface HeaderBadge {
  label: string;
  color?: BadgeColor;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: HeaderBadge;
  actions?: HeaderAction[];
  /** Extra content rendered to the right of the action bar (e.g. a search input) */
  rightSlot?: React.ReactNode;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BADGE_COLORS: Record<BadgeColor, string> = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  amber:  'bg-amber-100 text-amber-700',
  red:    'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  gray:   'bg-gray-100 text-gray-600',
  navy:   'bg-[#e8edf3] text-[#0f2942]',
};

const ACTION_BASE =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const ACTION_VARIANTS: Record<ActionVariant, string> = {
  primary:
    'bg-[#0f2942] text-white hover:bg-[#1a3a5c] focus:ring-[#0f2942]',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:ring-gray-300',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  badge,
  actions = [],
  rightSlot,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`space-y-2 ${className}`}>
      {/* ── Breadcrumbs ── */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && (
                    <span aria-hidden className="text-gray-300 select-none">
                      /
                    </span>
                  )}
                  {crumb.onClick && !isLast ? (
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      className="hover:text-[#0f2942] transition-colors underline-offset-2 hover:underline"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span
                      className={
                        isLast ? 'font-medium text-gray-700' : undefined
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* ── Title row ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Left: title + badge + subtitle */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-gray-900 leading-tight truncate">{title}</h1>
            {badge && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  BADGE_COLORS[badge.color ?? 'gray']
                }`}
              >
                {badge.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 leading-snug">{subtitle}</p>
          )}
        </div>

        {/* Right: actions + rightSlot */}
        {(actions.length > 0 || rightSlot) && (
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {rightSlot}
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                disabled={action.disabled || action.loading}
                onClick={action.onClick}
                className={`${ACTION_BASE} ${
                  ACTION_VARIANTS[action.variant ?? 'secondary']
                }`}
              >
                {action.loading ? (
                  <LoadingSpinner />
                ) : (
                  action.icon && (
                    <span className="w-4 h-4 flex-shrink-0">{action.icon}</span>
                  )
                )}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom divider ── */}
      <div className="h-px bg-gray-200 mt-1" />
    </header>
  );
}

// ─── Internal sub-components ─────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin text-current opacity-70"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
