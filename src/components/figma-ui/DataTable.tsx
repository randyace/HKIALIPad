/**
 * DataTable.tsx
 * Purely presentational, fully generic data table component.
 * Supports: sortable columns, row selection (checkbox), click handlers,
 * loading skeleton, empty state, and custom cell renderers.
 *
 * Place in: src/components/figma-ui/DataTable.tsx
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<TRow = Record<string, unknown>> {
  /** Unique key — also used to read `row[key]` unless `render` is provided */
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  /** Custom renderer: receives (cellValue, fullRow, rowIndex) */
  render?: (value: unknown, row: TRow, index: number) => React.ReactNode;
}

export interface TableSort {
  key: string;
  direction: SortDirection;
}

export interface DataTableProps<TRow = Record<string, unknown>> {
  /** Column schema */
  columns: TableColumn<TRow>[];
  /** Array of row data objects */
  rows: TRow[];
  /** Unique key accessor — a keyof TRow or a function that returns a string/number */
  rowKey: keyof TRow | ((row: TRow) => string | number);
  /** Keys of currently-selected rows */
  selectedRowKeys?: (string | number)[];
  /** Current sort state */
  sort?: TableSort;
  /** When true renders animated skeleton rows */
  loading?: boolean;
  /** Message shown in empty state */
  emptyMessage?: string;
  /** Optional icon shown above empty message */
  emptyIcon?: React.ReactNode;
  /** Fires when a data row is clicked */
  onRowClick?: (row: TRow) => void;
  /** Fires when a sortable column header is clicked */
  onSort?: (key: string, direction: SortDirection) => void;
  /** Fires when a row checkbox changes — provide to enable checkbox column */
  onRowSelect?: (rowKey: string | number, selected: boolean) => void;
  /** Fires when the header "select all" checkbox changes */
  onSelectAll?: (selected: boolean) => void;
  /** Optional extra className on the outer wrapper */
  className?: string;
  /** Sticky header when table is inside a scrollable container */
  stickyHeader?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getKey<TRow>(
  row: TRow,
  rowKey: DataTableProps<TRow>['rowKey'],
): string | number {
  return typeof rowKey === 'function'
    ? rowKey(row)
    : (row[rowKey] as unknown as string | number);
}

const ALIGN_CLASS: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DataTable<TRow = Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  selectedRowKeys = [],
  sort,
  loading = false,
  emptyMessage = 'No records found.',
  emptyIcon,
  onRowClick,
  onSort,
  onRowSelect,
  onSelectAll,
  className = '',
  stickyHeader = false,
}: DataTableProps<TRow>) {
  const hasSelection = Boolean(onRowSelect);
  const allSelected =
    rows.length > 0 &&
    rows.every((r) => selectedRowKeys.includes(getKey(r, rowKey)));
  const someSelected = !allSelected && rows.some((r) =>
    selectedRowKeys.includes(getKey(r, rowKey)),
  );

  const handleHeaderSort = (col: TableColumn<TRow>) => {
    if (!col.sortable || !onSort) return;
    const next: SortDirection =
      sort?.key === col.key
        ? sort.direction === 'asc'
          ? 'desc'
          : sort.direction === 'desc'
          ? null
          : 'asc'
        : 'asc';
    onSort(col.key, next);
  };

  const colCount = columns.length + (hasSelection ? 1 : 0);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`w-full overflow-x-auto rounded-xl border border-gray-200 bg-white ${className}`}
    >
      <table className="w-full text-sm border-collapse">

        {/* ── Header ── */}
        <thead
          className={`bg-gray-50 border-b border-gray-200 ${
            stickyHeader ? 'sticky top-0 z-10' : ''
          }`}
        >
          <tr>
            {hasSelection && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0f2942] focus:ring-[#0f2942] cursor-pointer"
                  aria-label="Select all rows"
                />
              </th>
            )}

            {columns.map((col) => {
              const isSorted = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => handleHeaderSort(col)}
                  className={[
                    'px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap',
                    ALIGN_CLASS[col.align ?? 'left'],
                    col.sortable
                      ? 'cursor-pointer select-none hover:text-[#0f2942] transition-colors'
                      : '',
                  ].join(' ')}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <SortIcon direction={isSorted ? sort!.direction : null} />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <SkeletonRows colCount={colCount} />
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={colCount}
                className="px-4 py-14 text-center"
              >
                <EmptyStateCell icon={emptyIcon} message={emptyMessage} />
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const key = getKey(row, rowKey);
              const isSelected = selectedRowKeys.includes(key);

              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    'transition-colors duration-100',
                    onRowClick ? 'cursor-pointer' : '',
                    isSelected
                      ? 'bg-blue-50'
                      : onRowClick
                      ? 'hover:bg-gray-50'
                      : '',
                  ].join(' ')}
                >
                  {hasSelection && (
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onRowSelect!(key, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#0f2942] focus:ring-[#0f2942] cursor-pointer"
                        aria-label={`Select row ${key}`}
                      />
                    </td>
                  )}

                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        'px-4 py-3 text-gray-700 align-middle',
                        ALIGN_CLASS[col.align ?? 'left'],
                      ].join(' ')}
                    >
                      {col.render
                        ? col.render(
                            row[col.key as keyof TRow] as unknown,
                            row,
                            index,
                          )
                        : String(row[col.key as keyof TRow] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Internal sub-components ─────────────────────────────────────────────────

function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <span
      className={`transition-colors ${
        direction ? 'text-[#0f2942]' : 'text-gray-300'
      }`}
      aria-hidden
    >
      {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
    </span>
  );
}

function SkeletonRows({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: colCount }).map((__, j) => (
            <td key={j} className="px-4 py-3.5">
              <div
                className="h-4 bg-gray-200 rounded"
                style={{ width: `${55 + ((i * 7 + j * 13) % 35)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyStateCell({
  icon,
  message,
}: {
  icon?: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-gray-400">
      {icon && (
        <span className="w-10 h-10 flex items-center justify-center opacity-40">
          {icon}
        </span>
      )}
      <p className="text-sm">{message}</p>
    </div>
  );
}
