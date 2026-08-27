/**
 * PaginationBar.tsx
 * Fully controlled pagination control bar.
 * Shows current page range, total items, a page-size selector, and
 * numbered page buttons with first / previous / next / last navigation.
 * All state is owned by the parent — every interaction fires a callback.
 *
 * Place in: src/components/figma-ui/PaginationBar.tsx
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationBarProps {
  /** 1-based current page index */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Items shown per page */
  pageSize: number;
  /** Page-size options rendered in the selector (omit to hide the selector) */
  pageSizeOptions?: number[];
  /** Fires with the new 1-based page number */
  onPageChange: (page: number) => void;
  /** Fires with the newly selected page size */
  onPageSizeChange?: (size: number) => void;
  /** Compact layout: hides labels and page-size selector */
  compact?: boolean;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generates the page number sequence with ellipsis markers.
 * e.g. [1, '…', 4, 5, 6, '…', 20]
 */
function buildPageSequence(
  current: number,
  total: number,
): Array<number | '…'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: Array<number | '…'> = [1];

  if (current > 3) pages.push('…');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('…');

  pages.push(total);

  return pages;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  compact = false,
  className = '',
}: PaginationBarProps) {
  const from = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const to = Math.min(currentPage * pageSize, totalItems);

  const sequence = buildPageSequence(currentPage, totalPages);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      {/* ── Left: range label & page-size selector ── */}
      {!compact && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Showing{' '}
            <span className="font-medium text-gray-700">{from}–{to}</span> of{' '}
            <span className="font-medium text-gray-700">
              {totalItems.toLocaleString()}
            </span>{' '}
            items
          </span>

          {pageSizeOptions && onPageSizeChange && (
            <label className="flex items-center gap-1.5 text-sm text-gray-500 whitespace-nowrap">
              Rows:
              <select
                value={pageSize}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value));
                  onPageChange(1); // reset to first page on size change
                }}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white
                  focus:outline-none focus:ring-2 focus:ring-[#0f2942]/30 focus:border-[#0f2942]
                  text-gray-700 cursor-pointer"
              >
                {pageSizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      {/* ── Right: page buttons ── */}
      <nav
        aria-label="Pagination"
        className="flex items-center gap-1"
      >
        {/* First */}
        <NavButton
          onClick={() => onPageChange(1)}
          disabled={!canPrev}
          aria-label="First page"
          title="First page"
        >
          <DoubleChevronLeft />
        </NavButton>

        {/* Previous */}
        <NavButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft />
        </NavButton>

        {/* Page numbers */}
        {sequence.map((p, i) =>
          p === '…' ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-sm text-gray-400 select-none"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
              className={[
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f2942]/30',
                p === currentPage
                  ? 'bg-[#0f2942] text-white'
                  : 'text-gray-600 hover:bg-gray-100',
              ].join(' ')}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <NavButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight />
        </NavButton>

        {/* Last */}
        <NavButton
          onClick={() => onPageChange(totalPages)}
          disabled={!canNext}
          aria-label="Last page"
          title="Last page"
        >
          <DoubleChevronRight />
        </NavButton>
      </nav>
    </div>
  );
}

// ─── Internal sub-components ─────────────────────────────────────────────────

function NavButton({
  onClick,
  disabled,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
        hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed
        transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f2942]/30"
      {...rest}
    >
      {children}
    </button>
  );
}

// Micro inline SVG icons

function ChevronLeft() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function DoubleChevronLeft() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  );
}

function DoubleChevronRight() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  );
}
