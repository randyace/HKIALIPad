/**
 * Dashboard.tsx — Integration-Ready Dumb UI Component
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  ZERO hardcoded data lives in this file.                                │
 * │  All dynamic values come through DashboardProps.                        │
 * │  For dev/design preview, default props are sourced from:                │
 * │    __fixtures__/Dashboard.mocks.ts → mockDashboardData                  │
 * │                                                                         │
 * │  CI4 Smart Container wires:                                             │
 * │    • Data props  → from CI4 API JSON response                           │
 * │    • Callbacks   → CI4 controller endpoint calls                        │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import {
  Users, Calendar, Clock, DollarSign, Package, TrendingUp,
  AlertCircle, CheckCircle, XCircle, Plane, UserCheck, Eye,
  ArrowRight,
} from 'lucide-react';
import { Card }   from './ui/card';
import { Badge }  from './ui/badge';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from './ui/dialog';
import { mockDashboardData } from './__fixtures__/Dashboard.mocks';

// ─── Union Types (all possible values — must match CI4 enum/string values) ────

export type KpiStatVariant =
  | 'customers'
  | 'bookings'
  | 'pending'
  | 'income'
  | 'packages'
  | 'trending';

export type BookingStatusVariant =
  | 'pending-review'
  | 'pending-approval'
  | 'awaiting-payment'
  | 'confirmed';

export type BookingStatus =
  | 'Confirmed'
  | 'Pending for Review'
  | 'Pending for Approval'
  | 'Approved'
  | 'Processing';

export type PaymentStatus =
  | 'Paid'
  | 'Pending'
  | 'Payment Link Sent';

export type ApprovalType     = 'New' | 'Edit' | 'Cancel';
export type ApprovalPriority = 'urgent' | 'normal';
export type AccountType      = 'Individual' | 'Corporate' | 'Agency';

// ─── Data Interfaces ──────────────────────────────────────────────────────────

/** One KPI summary tile in the top stats row */
export interface DashboardKpiStat {
  /** Display label, e.g. "Total Customers" */
  label: string;
  /** Formatted value string, e.g. "2,847" or "HK$356K" */
  value: string;
  /** Formatted delta string, e.g. "+12%" */
  change: string;
  /** Whether the change is positive or negative (drives green/red colour) */
  changeDirection: 'up' | 'down' | 'neutral';
  /** Maps to a Lucide icon + colour scheme (UI concern, not data) */
  variant: KpiStatVariant;
}

/** One tile in the Booking Status Overview row */
export interface DashboardBookingStatusStat {
  label: string;
  value: number;
  variant: BookingStatusVariant;
}

/** One row in the Recent Bookings table */
export interface RecentBooking {
  /** Booking reference number */
  id: string;
  guestName: string;
  suiteName: string;
  /** HH:mm format */
  checkInTime: string;
  flightNo: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  /** Ad-hoc bookings are highlighted with amber */
  isAdHoc: boolean;
}

/**
 * Original field values before an Edit booking was submitted.
 * Only populated when PendingApproval.type === 'Edit'.
 */
export interface OriginalBookingFields {
  suite?: string;
  date?: string;
  /** HH:mm format */
  time?: string;
  pax?: number;
  flightNo?: string;
  flightTime?: string;
}

/** One pending approval item */
export interface PendingApproval {
  id: string;
  guestName: string;
  type: ApprovalType;
  /** e.g. "Ad-hoc Booking", "Corporate Booking" */
  bookingType: string;
  suiteName: string;
  /** Relative time string, e.g. "30 mins ago" — formatted by CI4 */
  submittedAgo: string;
  priority: ApprovalPriority;
  /** ISO date string yyyy-MM-dd */
  bookingDate: string;
  /** HH:mm format */
  checkInTime: string;
  flightNo: string;
  /** HH:mm format */
  flightDepartureTime: string;
  pax: number;
  specialRequests?: string;
  contactPhone: string;
  accountType: AccountType;
  /**
   * Only present when type === 'Edit'.
   * Fields omitted here are unchanged from the submitted values.
   */
  original?: OriginalBookingFields;
}

/** One row in the Upcoming Arrivals slot list */
export interface UpcomingArrival {
  /** e.g. "14:00–15:00" */
  timeSlot: string;
  guestCount: number;
  flightCount: number;
}

/** Current lounge suite counts by status */
export interface LoungeOccupancyCount {
  available:  number;
  occupied:   number;
  foodServed: number;
  cleaning:   number;
}

// ─── Callback Interfaces ──────────────────────────────────────────────────────

export interface DashboardCallbacks {
  /** Approve a pending booking from the quick-action buttons */
  onApproveBooking: (bookingId: string) => void;
  /** Reject a pending booking from the quick-action buttons or modal footer */
  onRejectBooking: (bookingId: string) => void;
  /** "View All" link in Recent Bookings panel */
  onViewAllBookings: () => void;
  /** "View All" link in Pending Approvals panel */
  onViewAllApprovals: () => void;
  /** Navigate to the full booking detail page */
  onViewBookingDetail: (bookingId: string) => void;
}

// ─── Composed Props Interface ─────────────────────────────────────────────────

export interface DashboardProps extends DashboardCallbacks {
  kpiStats:           DashboardKpiStat[];
  bookingStatusStats: DashboardBookingStatusStat[];
  recentBookings:     RecentBooking[];
  pendingApprovals:   PendingApproval[];
  upcomingArrivals:   UpcomingArrival[];
  loungeOccupancy:    LoungeOccupancyCount;
}

// ─── Static UI Configuration Maps (icon + colour — never from backend) ────────

const KPI_CONFIG: Record<KpiStatVariant, {
  icon: React.ElementType; color: string; bgColor: string;
}> = {
  customers: { icon: Users,       color: 'text-blue-600',   bgColor: 'bg-blue-50'   },
  bookings:  { icon: Calendar,    color: 'text-green-600',  bgColor: 'bg-green-50'  },
  pending:   { icon: Clock,       color: 'text-orange-600', bgColor: 'bg-orange-50' },
  income:    { icon: DollarSign,  color: 'text-purple-600', bgColor: 'bg-purple-50' },
  packages:  { icon: Package,     color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  trending:  { icon: TrendingUp,  color: 'text-teal-600',   bgColor: 'bg-teal-50'   },
};

const BOOKING_STATUS_CONFIG: Record<BookingStatusVariant, {
  icon: React.ElementType;
  color: string; bgColor: string; borderColor: string;
}> = {
  'pending-review':   { icon: Clock,       color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  'pending-approval': { icon: UserCheck,   color: 'text-blue-700',   bgColor: 'bg-blue-50',   borderColor: 'border-blue-200'   },
  'awaiting-payment': { icon: AlertCircle, color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  'confirmed':        { icon: CheckCircle, color: 'text-green-700',  bgColor: 'bg-green-50',  borderColor: 'border-green-200'  },
};

const BOOKING_STATUS_BADGE: Record<BookingStatus, string> = {
  'Confirmed':             'bg-green-100 text-green-700',
  'Pending for Review':    'bg-yellow-100 text-yellow-700',
  'Pending for Approval':  'bg-blue-100 text-blue-700',
  'Approved':              'bg-green-100 text-green-700',
  'Processing':            'bg-purple-100 text-purple-700',
};

const PAYMENT_STATUS_BADGE: Record<PaymentStatus, string> = {
  'Paid':               'bg-green-100 text-green-600',
  'Pending':            'bg-yellow-100 text-yellow-600',
  'Payment Link Sent':  'bg-blue-100 text-blue-600',
};

const APPROVAL_TYPE_BADGE: Record<ApprovalType, string> = {
  New:    'bg-blue-100 text-blue-700',
  Edit:   'bg-amber-100 text-amber-700',
  Cancel: 'bg-red-100 text-red-700',
};

const LOUNGE_OCCUPANCY_CONFIG = [
  { key: 'available'  as const, label: 'Available',   icon: CheckCircle, bg: 'bg-green-500',  ring: 'bg-green-50 border-green-200',  text: 'text-green-700'  },
  { key: 'occupied'   as const, label: 'Occupied',    icon: Users,       bg: 'bg-red-500',    ring: 'bg-red-50 border-red-200',      text: 'text-red-700'    },
  { key: 'foodServed' as const, label: 'Food Served', icon: Package,     bg: 'bg-yellow-500', ring: 'bg-yellow-50 border-yellow-200',text: 'text-yellow-700' },
  { key: 'cleaning'   as const, label: 'Cleaning',    icon: Clock,       bg: 'bg-orange-500', ring: 'bg-orange-50 border-orange-200',text: 'text-orange-700' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function Dashboard({
  // Data props — all defaulted from fixture file
  kpiStats           = mockDashboardData.kpiStats,
  bookingStatusStats = mockDashboardData.bookingStatusStats,
  recentBookings     = mockDashboardData.recentBookings,
  pendingApprovals   = mockDashboardData.pendingApprovals,
  upcomingArrivals   = mockDashboardData.upcomingArrivals,
  loungeOccupancy    = mockDashboardData.loungeOccupancy,
  // Callback props — no-ops by default so the component renders without a
  // Smart Container during design review
  onApproveBooking  = (_id) => {},
  onRejectBooking   = (_id) => {},
  onViewAllBookings = ()    => {},
  onViewAllApprovals= ()    => {},
  onViewBookingDetail= (_id)=> {},
}: Partial<DashboardProps> = {}) {

  // ── Pure UI state (no business data lives here) ───────────────────────────
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);

  // ── Handlers (UI-only — delegate to callback props for persistence) ────────
  const handleOpenReview = (item: PendingApproval) => {
    setSelectedApproval(item);
    onViewBookingDetail(item.id);
  };

  const handleApprove = (id: string) => {
    onApproveBooking(id);
    setSelectedApproval(null);
  };

  const handleReject = (id: string) => {
    onRejectBooking(id);
    setSelectedApproval(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">

      {/* ── Page heading ── */}
      <div>
        <h1>Dashboard</h1>
        <p className="text-gray-600">Welcome to HKIA VIP Lounge Backend System</p>
      </div>

      {/* ── KPI Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiStats.map((stat, i) => {
          const cfg = KPI_CONFIG[stat.variant];
          const Icon = cfg.icon;
          return (
            <Card key={`kpi-${i}`} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <h2 className="mt-2">{stat.value}</h2>
                  <p className={`text-sm mt-1 ${
                    stat.changeDirection === 'up'
                      ? 'text-green-600'
                      : stat.changeDirection === 'down'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${cfg.bgColor} ${cfg.color} p-3 rounded-lg`}>
                  <Icon className="w-8 h-8" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Booking Status Overview ── */}
      <Card className="p-6">
        <h3 className="mb-4">Booking Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {bookingStatusStats.map((stat, i) => {
            const cfg  = BOOKING_STATUS_CONFIG[stat.variant];
            const Icon = cfg.icon;
            return (
              <div
                key={`bss-${i}`}
                className={`p-4 rounded-lg border ${cfg.bgColor} ${cfg.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className={`text-3xl mt-1 ${cfg.color}`}>{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${cfg.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Two-Column: Recent Bookings + Pending Approvals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Recent Bookings</h3>
            <button
              onClick={onViewAllBookings}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-3 rounded-lg border ${
                  booking.isAdHoc
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{booking.id}</p>
                      {booking.isAdHoc && (
                        <AlertCircle
                          className="w-3 h-3 text-amber-600"
                          title="Ad-hoc booking"
                        />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{booking.guestName}</p>
                  </div>
                  <Badge className={BOOKING_STATUS_BADGE[booking.status]}>
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-3">
                    <span>{booking.suiteName}</span>
                    <span className="flex items-center gap-1">
                      <Plane className="w-3 h-3" />
                      {booking.flightNo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{booking.checkInTime}</span>
                    <Badge className={PAYMENT_STATUS_BADGE[booking.paymentStatus]}>
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Pending Approvals</h3>
            <button
              onClick={onViewAllApprovals}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${
                  item.priority === 'urgent'
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{item.id}</p>
                      {item.priority === 'urgent' && (
                        <AlertCircle className="w-3 h-3 text-red-600" title="Urgent" />
                      )}
                      <Badge className={APPROVAL_TYPE_BADGE[item.type]}>
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{item.guestName}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {item.bookingType} · {item.suiteName} · {item.submittedAgo}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleOpenReview(item)}
                    className="text-xs px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    Review
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="flex-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="flex-1 text-xs px-3 py-1.5 bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-3 h-3 inline mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Lounge Status + Upcoming Arrivals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Lounge Occupancy */}
        <Card className="p-6">
          <h3 className="mb-4">Current Lounge Status</h3>
          <div className="grid grid-cols-2 gap-4">
            {LOUNGE_OCCUPANCY_CONFIG.map(({ key, label, icon: Icon, bg, ring, text }) => (
              <div key={key} className={`text-center p-4 rounded-lg border ${ring}`}>
                <div className={`w-12 h-12 ${bg} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className={`text-2xl mt-1 ${text}`}>{loungeOccupancy[key]}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Arrivals */}
        <Card className="p-6">
          <h3 className="mb-4">Upcoming Arrivals (Next 4 Hours)</h3>
          <div className="space-y-3">
            {upcomingArrivals.map((arrival, i) => (
              <div
                key={`arrival-${i}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm">{arrival.timeSlot}</p>
                    <p className="text-xs text-gray-500">{arrival.flightCount} flights</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl text-blue-600">{arrival.guestCount}</p>
                  <p className="text-xs text-gray-500">guests</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Approval Review Dialog (Monolithic — fully encapsulated) ── */}
      <Dialog
        open={!!selectedApproval}
        onOpenChange={(open) => { if (!open) setSelectedApproval(null); }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Booking Details — {selectedApproval?.type} Approval
            </DialogTitle>
            <DialogDescription>
              Review the booking details before making a decision
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <ApprovalDialogBody approval={selectedApproval} />
          )}

          <DialogFooter>
            <button
              onClick={() => setSelectedApproval(null)}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {selectedApproval && (
              <>
                <button
                  onClick={() => handleReject(selectedApproval.id)}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4 inline mr-1" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedApproval.id)}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Approve
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ApprovalDialogBody — extracted for readability, not exported ─────────────
// (Internal presentational sub-component — same file since it is an
//  implementation detail of the Dialog and has no independent use.)

function ApprovalDialogBody({ approval }: { approval: PendingApproval }) {
  const isEdit   = approval.type === 'Edit';
  const orig     = approval.original;

  // Helper: did a field change in an Edit booking?
  const changed = (field: keyof OriginalBookingFields) =>
    orig != null && orig[field] != null && orig[field] !== (
      field === 'suite'      ? approval.suiteName        :
      field === 'date'       ? approval.bookingDate       :
      field === 'time'       ? approval.checkInTime       :
      field === 'pax'        ? approval.pax               :
      field === 'flightNo'   ? approval.flightNo          :
      field === 'flightTime' ? approval.flightDepartureTime :
      undefined
    );

  return (
    <div className="space-y-4">

      {/* Booking ID + Type badge */}
      <div className="flex items-center gap-3 pb-3 border-b">
        <div>
          <p className="text-sm text-gray-600">Booking ID</p>
          <p className="font-medium">{approval.id}</p>
        </div>
        <Badge className={APPROVAL_TYPE_BADGE[approval.type]}>
          {approval.type} Booking
        </Badge>
        {approval.priority === 'urgent' && (
          <Badge className="bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Urgent
          </Badge>
        )}
      </div>

      {/* Guest information */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Guest Name"       value={approval.guestName}       />
        <Field label="Account Type"     value={approval.accountType}     />
        <Field label="Contact Phone"    value={approval.contactPhone}    />
        <Field label="Number of Guests" value={`${approval.pax} pax`}   />
      </div>

      {/* Edit diff view */}
      {isEdit && orig ? (
        <div className="pt-3 border-t space-y-3">
          <Badge className="bg-amber-100 text-amber-700">Changes Requested</Badge>

          {changed('suite') && (
            <DiffRow label="Suite / Room"
              from={orig.suite!}
              to={approval.suiteName}
            />
          )}
          {changed('time') && (
            <DiffRow label="Check-in Time"
              from={orig.time!}
              to={approval.checkInTime}
            />
          )}
          {changed('pax') && (
            <DiffRow label="Number of Guests"
              from={`${orig.pax} pax`}
              to={`${approval.pax} pax`}
            />
          )}
          {(changed('flightNo') || changed('flightTime')) && (
            <DiffRow label="Flight Information"
              from={`${orig.flightNo} @ ${orig.flightTime}`}
              to={`${approval.flightNo} @ ${approval.flightDepartureTime}`}
            />
          )}

          {/* Unchanged fields */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            {!changed('date') && (
              <Field label="Booking Date"  value={approval.bookingDate}  />
            )}
            {!changed('time') && (
              <Field label="Check-in Time" value={approval.checkInTime}  />
            )}
            {!changed('suite') && (
              <Field label="Suite / Room"  value={approval.suiteName}    />
            )}
            <Field label="Booking Type"  value={approval.bookingType}  />
          </div>
        </div>
      ) : (
        /* New / Cancel — straight detail view */
        <>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <Field label="Booking Date"  value={approval.bookingDate}   />
            <Field label="Check-in Time" value={approval.checkInTime}   />
            <Field label="Suite / Room"  value={approval.suiteName}     />
            <Field label="Booking Type"  value={approval.bookingType}   />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <div>
              <p className="text-sm text-gray-600">Flight Number</p>
              <p className="font-medium flex items-center gap-2">
                <Plane className="w-4 h-4 text-gray-500" />
                {approval.flightNo}
              </p>
            </div>
            <Field label="Departure Time" value={approval.flightDepartureTime} />
          </div>
        </>
      )}

      {/* Special requests */}
      {approval.specialRequests && (
        <div className="pt-3 border-t">
          <p className="text-sm text-gray-600">Special Requests / Notes</p>
          <p className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 text-sm">
            {approval.specialRequests}
          </p>
        </div>
      )}

      {/* Submission info */}
      <div className="pt-3 border-t">
        <p className="text-sm text-gray-600">Submitted</p>
        <p className="text-sm">{approval.submittedAgo}</p>
      </div>
    </div>
  );
}

// ─── Micro presentational helpers ────────────────────────────────────────────

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function DiffRow({ label, from, to }: { label: string; from: string; to: string }) {
  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500">Original</p>
          <p className="font-medium line-through text-gray-500">{from}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-gray-500">New</p>
          <p className="font-medium text-amber-700">{to}</p>
        </div>
      </div>
    </div>
  );
}
