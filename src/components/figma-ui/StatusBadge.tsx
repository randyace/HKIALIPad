/**
 * StatusBadge.tsx
 * Color-coded status / tag badge.
 * Ships with a pre-mapped palette covering all statuses used in the
 * HKIA VIP Lounge backend system (booking states, account types,
 * membership tiers, payment status, etc.). Fully overridable via props.
 *
 * Place in: src/components/figma-ui/StatusBadge.tsx
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Recognised status keys. Any unrecognised string falls back to the
 * `default` appearance so the component never crashes on unknown data.
 */
export type StatusKey =
  // Generic lifecycle
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'confirmed'
  | 'draft'
  | 'expired'
  | 'suspended'
  | 'on-hold'
  // Booking-specific
  | 'checked-in'
  | 'checked-out'
  | 'no-show'
  | 'waitlisted'
  // Payment / billing
  | 'paid'
  | 'unpaid'
  | 'overdue'
  | 'refunded'
  | 'partial'
  // Membership tiers
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'sapphire'
  // Account types
  | 'individual'
  | 'corporate'
  | 'travel-agency'
  // Promo / coupon
  | 'redeemed'
  | 'unused'
  // Application review
  | 'under-review'
  | 'requires-action'
  // Catch-all
  | (string & {});

export type BadgeSize = 'xs' | 'sm' | 'md';
export type BadgeShape = 'rounded' | 'pill';

export interface StatusBadgeProps {
  status: StatusKey;
  /** Override the display text (defaults to the status key, title-cased) */
  label?: string;
  size?: BadgeSize;
  shape?: BadgeShape;
  /** Show a coloured dot prefix */
  dot?: boolean;
  className?: string;
}

// ─── Palette map ─────────────────────────────────────────────────────────────

interface BadgeStyle {
  bg: string;
  text: string;
  dot: string;
}

const PALETTE: Partial<Record<StatusKey, BadgeStyle>> = {
  // ── Generic lifecycle ──────────────────────────────────────────────────────
  active:           { bg: 'bg-green-100',   text: 'text-green-800',   dot: 'bg-green-500'   },
  inactive:         { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400'    },
  pending:          { bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-500'   },
  approved:         { bg: 'bg-green-100',   text: 'text-green-800',   dot: 'bg-green-500'   },
  rejected:         { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'     },
  cancelled:        { bg: 'bg-red-50',      text: 'text-red-600',     dot: 'bg-red-400'     },
  completed:        { bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500'    },
  confirmed:        { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  draft:            { bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400'    },
  expired:          { bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-500'  },
  suspended:        { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'     },
  'on-hold':        { bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-500'   },

  // ── Booking-specific ───────────────────────────────────────────────────────
  'checked-in':     { bg: 'bg-teal-100',    text: 'text-teal-800',    dot: 'bg-teal-500'    },
  'checked-out':    { bg: 'bg-slate-100',   text: 'text-slate-700',   dot: 'bg-slate-400'   },
  'no-show':        { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'     },
  waitlisted:       { bg: 'bg-indigo-100',  text: 'text-indigo-700',  dot: 'bg-indigo-400'  },

  // ── Payment / billing ──────────────────────────────────────────────────────
  paid:             { bg: 'bg-green-100',   text: 'text-green-800',   dot: 'bg-green-500'   },
  unpaid:           { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400'    },
  overdue:          { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'     },
  refunded:         { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-400'  },
  partial:          { bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-400'   },

  // ── Membership tiers ───────────────────────────────────────────────────────
  gold:             { bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-500'   },
  platinum:         { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500'  },
  diamond:          { bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500'    },
  sapphire:         { bg: 'bg-[#e8edf3]',   text: 'text-[#0f2942]',   dot: 'bg-[#0f2942]'  },

  // ── Account types ──────────────────────────────────────────────────────────
  individual:       { bg: 'bg-sky-100',     text: 'text-sky-800',     dot: 'bg-sky-500'     },
  corporate:        { bg: 'bg-indigo-100',  text: 'text-indigo-800',  dot: 'bg-indigo-500'  },
  'travel-agency':  { bg: 'bg-teal-100',    text: 'text-teal-800',    dot: 'bg-teal-500'    },

  // ── Promo / coupon ─────────────────────────────────────────────────────────
  redeemed:         { bg: 'bg-green-50',    text: 'text-green-700',   dot: 'bg-green-400'   },
  unused:           { bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400'    },

  // ── Application review ─────────────────────────────────────────────────────
  'under-review':   { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-400'    },
  'requires-action':{ bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-500'  },
};

const FALLBACK: BadgeStyle = {
  bg:   'bg-gray-100',
  text: 'text-gray-600',
  dot:  'bg-gray-400',
};

// ─── Size maps ────────────────────────────────────────────────────────────────

const SIZE_PADDING: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

const DOT_SIZE: Record<BadgeSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2 h-2',
};

const SHAPE_CLASS: Record<BadgeShape, string> = {
  pill:    'rounded-full',
  rounded: 'rounded-md',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toTitleCase(s: string): string {
  return s
    .split(/[-_\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StatusBadge({
  status,
  label,
  size = 'sm',
  shape = 'pill',
  dot = false,
  className = '',
}: StatusBadgeProps) {
  const style = PALETTE[status] ?? FALLBACK;
  const displayText = label ?? toTitleCase(status);

  return (
    <span
      className={[
        'inline-flex items-center gap-1 font-semibold leading-none whitespace-nowrap',
        SIZE_PADDING[size],
        SHAPE_CLASS[shape],
        style.bg,
        style.text,
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={`flex-shrink-0 rounded-full ${DOT_SIZE[size]} ${style.dot}`}
          aria-hidden
        />
      )}
      {displayText}
    </span>
  );
}

/**
 * StatusBadgeGroup — renders a horizontal list of StatusBadges.
 * Useful for displaying multiple tags/statuses on one row.
 */
export interface StatusBadgeGroupProps {
  statuses: Array<{ status: StatusKey; label?: string }>;
  size?: BadgeSize;
  shape?: BadgeShape;
  dot?: boolean;
  gap?: 'tight' | 'normal';
}

export function StatusBadgeGroup({
  statuses,
  size,
  shape,
  dot,
  gap = 'normal',
}: StatusBadgeGroupProps) {
  return (
    <div className={`flex flex-wrap ${gap === 'tight' ? 'gap-1' : 'gap-1.5'}`}>
      {statuses.map((s, i) => (
        <StatusBadge
          key={i}
          status={s.status}
          label={s.label}
          size={size}
          shape={shape}
          dot={dot}
        />
      ))}
    </div>
  );
}
