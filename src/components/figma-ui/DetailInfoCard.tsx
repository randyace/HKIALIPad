/**
 * DetailInfoCard.tsx
 * A labeled key-value grid card for detail / profile / summary views.
 * Supports multi-column layouts, spanning fields, section dividers,
 * copyable values, and a loading skeleton state.
 *
 * Place in: src/components/figma-ui/DetailInfoCard.tsx
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FieldSpan = 1 | 2 | 3 | 4;

export interface DetailField {
  /** Unique identifier — used as React key */
  key: string;
  /** Left-side label text (10 px bottom spacing via `mb-[10px]` per design system rule) */
  label: string;
  /** Value to display (string, number, or arbitrary ReactNode for badges/chips) */
  value: React.ReactNode;
  /** How many grid columns this field occupies (defaults to 1) */
  span?: FieldSpan;
  /** When true, renders a copy-to-clipboard button (parent must supply onCopy) */
  copyable?: boolean;
  /** Hidden fields are still in the DOM but rendered as `display:none` */
  hidden?: boolean;
}

export interface DetailSection {
  /** Optional section heading */
  title?: string;
  fields: DetailField[];
}

export interface DetailInfoCardProps {
  /** Card heading */
  title?: string;
  /** Secondary text beneath the heading */
  subtitle?: string;
  /** Extra JSX (e.g. edit button) placed in the card header right side */
  headerAction?: React.ReactNode;
  /** When a single flat array is passed it is wrapped in one implicit section */
  fields?: DetailField[];
  /** Multiple labelled sections with optional dividers between them */
  sections?: DetailSection[];
  /** Number of grid columns (default 2) */
  columns?: 2 | 3 | 4;
  /** Shows animated skeleton rows instead of content */
  loading?: boolean;
  /** Number of skeleton rows shown during loading */
  skeletonRows?: number;
  /** Fires when a copyable field's copy button is clicked */
  onCopy?: (key: string, value: string) => void;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COL_CLASS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const SPAN_CLASS: Record<FieldSpan, string> = {
  1: 'col-span-1',
  2: 'col-span-1 sm:col-span-2',
  3: 'col-span-1 sm:col-span-2 lg:col-span-3',
  4: 'col-span-1 sm:col-span-2 lg:col-span-4',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DetailInfoCard({
  title,
  subtitle,
  headerAction,
  fields,
  sections,
  columns = 2,
  loading = false,
  skeletonRows = 4,
  onCopy,
  className = '',
}: DetailInfoCardProps) {
  // Normalise input: either a flat `fields` list or an array of `sections`
  const resolvedSections: DetailSection[] = sections
    ? sections
    : fields
    ? [{ fields }]
    : [];

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}
    >
      {/* ── Card header ── */}
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="min-w-0">
            {title && (
              <h3 className="text-gray-900 truncate">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">{headerAction}</div>
          )}
        </div>
      )}

      {/* ── Body ── */}
      <div className="px-6 py-5">
        {loading ? (
          <SkeletonGrid columns={columns} rows={skeletonRows} />
        ) : (
          resolvedSections.map((section, si) => (
            <div key={si}>
              {/* Section divider (between multiple sections) */}
              {si > 0 && (
                <div className="my-5 border-t border-gray-100" />
              )}

              {/* Section title */}
              {section.title && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  {section.title}
                </p>
              )}

              {/* Fields grid */}
              <div className={`grid gap-x-6 gap-y-4 ${COL_CLASS[columns]}`}>
                {section.fields.map((field) =>
                  field.hidden ? null : (
                    <FieldCell
                      key={field.key}
                      field={field}
                      onCopy={onCopy}
                    />
                  ),
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Internal sub-components ─────────────────────────────────────────────────

function FieldCell({
  field,
  onCopy,
}: {
  field: DetailField;
  onCopy?: (key: string, value: string) => void;
}) {
  const valueIsString = typeof field.value === 'string' || typeof field.value === 'number';

  return (
    <div className={SPAN_CLASS[field.span ?? 1]}>
      {/* Label — 10px bottom spacing per design system rule */}
      <dt className="mb-[10px] text-xs font-medium text-gray-500 leading-snug">
        {field.label}
      </dt>

      {/* Value */}
      <dd className="flex items-start gap-2">
        <span className="text-sm text-gray-800 leading-snug break-words min-w-0">
          {field.value == null || field.value === '' ? (
            <span className="text-gray-400 italic">—</span>
          ) : (
            field.value
          )}
        </span>

        {/* Copy button */}
        {field.copyable && valueIsString && onCopy && (
          <button
            type="button"
            onClick={() =>
              onCopy(field.key, String(field.value))
            }
            className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-[#0f2942] transition-colors"
            aria-label={`Copy ${field.label}`}
            title={`Copy ${field.label}`}
          >
            <CopyIcon />
          </button>
        )}
      </dd>
    </div>
  );
}

function SkeletonGrid({
  columns,
  rows,
}: {
  columns: 2 | 3 | 4;
  rows: number;
}) {
  return (
    <div className={`grid gap-x-6 gap-y-5 ${COL_CLASS[columns]} animate-pulse`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${50 + (i * 17 + 30) % 45}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
