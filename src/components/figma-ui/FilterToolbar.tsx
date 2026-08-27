/**
 * FilterToolbar.tsx
 * Horizontal toolbar combining a search input, one or more select/date/text
 * filter fields, an optional active-filter chip strip, and a reset button.
 * All state lives outside — every change fires a callback.
 *
 * Place in: src/components/figma-ui/FilterToolbar.tsx
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export type FilterFieldType = 'select' | 'date' | 'date-range' | 'text';

export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;
  /** Required when type === 'select' */
  options?: SelectOption[];
  /** Current controlled value */
  value: string;
  placeholder?: string;
  /** Minimum width for the control, e.g. "140px" */
  minWidth?: string;
}

export interface ActiveFilterChip {
  key: string;
  label: string;
  /** Fires when the × on the chip is clicked */
  onRemove: () => void;
}

export interface FilterToolbarProps {
  /** Controlled search input value */
  searchValue: string;
  searchPlaceholder?: string;
  /** Fires on every keystroke in the search box */
  onSearchChange: (value: string) => void;
  /** Structured filter fields rendered after the search box */
  filters?: FilterField[];
  /** Fires when any filter field changes */
  onFilterChange?: (key: string, value: string) => void;
  /** Active filter chips shown in a second row below the controls */
  activeChips?: ActiveFilterChip[];
  /** Fires when the "Reset" / "Clear all" button is clicked */
  onReset?: () => void;
  /** Whether the reset button should be visible */
  showReset?: boolean;
  /** Optional count shown as "X results" after filters */
  resultCount?: number;
  /** Extra JSX appended to the right of the toolbar (e.g. an "Export" button) */
  rightSlot?: React.ReactNode;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FilterToolbar({
  searchValue,
  searchPlaceholder = 'Search…',
  onSearchChange,
  filters = [],
  onFilterChange,
  activeChips = [],
  onReset,
  showReset = true,
  resultCount,
  rightSlot,
  className = '',
}: FilterToolbarProps) {
  const hasActiveFilters =
    searchValue.trim().length > 0 ||
    filters.some((f) => f.value.trim().length > 0);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* ── Main control row ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-[#0f2942]/30 focus:border-[#0f2942]
              placeholder:text-gray-400 transition-colors"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400
                hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        {/* Filter fields */}
        {filters.map((field) => (
          <FilterControl
            key={field.key}
            field={field}
            onChange={(val) => onFilterChange?.(field.key, val)}
          />
        ))}

        {/* Reset */}
        {showReset && hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600
              bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800
              transition-colors whitespace-nowrap"
          >
            <ResetIcon />
            Reset
          </button>
        )}

        {/* Right slot */}
        {rightSlot && <div className="ml-auto">{rightSlot}</div>}
      </div>

      {/* ── Active chips + result count ── */}
      {(activeChips.length > 0 || resultCount != null) && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
          ))}
          {resultCount != null && (
            <span className="ml-auto text-xs text-gray-500 whitespace-nowrap">
              {resultCount.toLocaleString()}{' '}
              {resultCount === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Internal sub-components ─────────────────────────────────────────────────

function FilterControl({
  field,
  onChange,
}: {
  field: FilterField;
  onChange: (value: string) => void;
}) {
  const base =
    'py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0f2942]/30 focus:border-[#0f2942] transition-colors text-gray-700';

  if (field.type === 'select') {
    return (
      <div style={{ minWidth: field.minWidth ?? '140px' }}>
        <label className="sr-only">{field.label}</label>
        <select
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-3 pr-8 ${base} cursor-pointer`}
        >
          <option value="">{field.placeholder ?? `All ${field.label}`}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'date' || field.type === 'date-range') {
    return (
      <div style={{ minWidth: field.minWidth ?? '160px' }}>
        <label className="sr-only">{field.label}</label>
        <input
          type="date"
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`w-full px-3 ${base}`}
        />
      </div>
    );
  }

  // Fallback: plain text input
  return (
    <div style={{ minWidth: field.minWidth ?? '160px' }}>
      <label className="sr-only">{field.label}</label>
      <input
        type="text"
        value={field.value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? field.label}
        className={`w-full px-3 ${base}`}
      />
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0f2942]/8 text-[#0f2942] text-xs font-medium rounded-full border border-[#0f2942]/20">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-[#0f2942]/20 transition-colors ml-0.5"
        aria-label={`Remove filter: ${label}`}
      >
        ×
      </button>
    </span>
  );
}

// ─── Micro SVG icons (inline — no external dependency) ───────────────────────

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
    </svg>
  );
}
