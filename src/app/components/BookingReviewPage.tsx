import { useState } from 'react';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Plane,
  Car, ShoppingBag, Clock, Building2, CreditCard, BadgePercent,
  MailCheck, Info, FileEdit, User, ChevronRight, ShieldCheck,
  ClipboardCheck, Luggage, Tag, Phone, Mail, MessageSquare,
  Accessibility, MapPin, Star
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PendingBooking {
  id: number;
  bookingNo: string;
  requestType: 'New Booking Request' | 'Edit Booking Request' | 'Cancel';
  guestName: string;
  accountNo: string;
  accountType: 'Individual' | 'Corporate' | 'Agency';
  membershipTier?: 'Gold' | 'Platinum' | 'Diamond' | 'Sapphire';
  companyName?: string;
  suite: string;
  dateTime: string;
  flightNo: string;
  flightTime: string;
  flightOrigin?: string;
  flightDestination?: string;
  flightType?: 'Arrival' | 'Departure';
  numberOfGuests: number;
  nonFlyingGuests: number;
  hasLimousine: boolean;
  hasShopping: boolean;
  isAdHoc: boolean;
  paymentMode: 'Upfront' | 'Net Upfront' | 'On-Credit' | 'Bulk Purchase/Monthly Invoice';
  amount: string;
  originalAmountValue?: number;
  finalAmountValue?: number;
  agencyName?: string;
  agencyDiscountRate?: number;
  bookingType: 'Online' | 'Email/Call to HKIAL';
  submittedAt: string;
  specialRequests?: string;
  originalData?: {
    suite?: string;
    dateTime?: string;
    flightNo?: string;
    flightTime?: string;
    flightOrigin?: string;
    flightDestination?: string;
    flightType?: 'Arrival' | 'Departure';
    numberOfGuests?: number;
    nonFlyingGuests?: number;
    hasLimousine?: boolean;
    hasShopping?: boolean;
    specialRequests?: string;
  };
}

// ── Supplementary Mock Data ───────────────────────────────────────────────────

const PASSENGER_SEEDS = [
  { title: 'Mr',   firstName: 'John',   lastName: 'Smith',   ageGroup: 'Adult (13+ years)', day: '14', month: 'March',     year: '1980', doc: 'K12345678', mem: 'MEM-0021' },
  { title: 'Mrs',  firstName: 'Mary',   lastName: 'Johnson', ageGroup: 'Adult (13+ years)', day: '22', month: 'July',      year: '1975', doc: 'H98765432', mem: '' },
  { title: 'Mr',   firstName: 'David',  lastName: 'Lee',     ageGroup: 'Adult (13+ years)', day: '05', month: 'November',  year: '1990', doc: 'A11223344', mem: 'MEM-0087' },
  { title: 'Miss', firstName: 'Sarah',  lastName: 'Chen',    ageGroup: 'Child (2-12 years)',day: '30', month: 'January',   year: '2014', doc: 'B55667788', mem: '' },
  { title: 'Mr',   firstName: 'Robert', lastName: 'Wang',    ageGroup: 'Adult (13+ years)', day: '18', month: 'September', year: '1968', doc: 'C99001122', mem: 'MEM-0145' },
  { title: 'Mrs',  firstName: 'Emma',   lastName: 'Wilson',  ageGroup: 'Adult (13+ years)', day: '07', month: 'April',     year: '1983', doc: 'D33445566', mem: '' },
];

const NON_FLYING_SEEDS = [
  { title: 'Mrs',  firstName: 'Linda',  lastName: 'Brown',  ageGroup: 'Adult (13+ years)'  },
  { title: 'Mr',   firstName: 'James',  lastName: 'Taylor', ageGroup: 'Adult (13+ years)'  },
  { title: 'Miss', firstName: 'Sophie', lastName: 'Martin', ageGroup: 'Child (2-12 years)' },
  { title: 'Mr',   firstName: 'Kevin',  lastName: 'Zhang',  ageGroup: 'Adult (13+ years)'  },
];

const CONTACT_SEEDS = [
  { name: 'Alice Wong',   email: 'alice.wong@example.com',   phone: '+852 9123 4567', memo: 'Please ensure early check-in for VIP guest.' },
  { name: 'Brian Chan',   email: 'brian.chan@example.com',    phone: '+852 6234 5678', memo: '' },
  { name: 'Cynthia Lam',  email: 'cynthia.lam@example.com',  phone: '+852 5345 6789', memo: 'Guest is travelling with elderly parent.' },
  { name: 'David Ng',     email: 'david.ng@example.com',     phone: '+852 6456 7890', memo: '' },
  { name: 'Eva Cheung',   email: 'eva.cheung@example.com',   phone: '+852 9567 8901', memo: 'Corporate account — priority seating required.' },
];

const PROMO_CODES = ['SUMMER2024', 'VIP20', 'WELCOME', '', 'TRAVEL10', '', 'DIAMOND15', '', '', ''];
const FLIGHT_CLASSES = ['Economy Class', 'Business Class', 'First Class'] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

const accountTypeBadgeClass = (type: PendingBooking['accountType']) => {
  if (type === 'Individual')    return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
  if (type === 'Corporate')     return 'bg-blue-100 text-blue-800 border border-blue-200';
  if (type === 'Agency') return 'bg-purple-100 text-purple-800 border border-purple-200';
  return 'bg-gray-100 text-gray-700';
};

const membershipBadgeClass = (tier?: PendingBooking['membershipTier']) => {
  if (tier === 'Sapphire') return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
  if (tier === 'Diamond')  return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
  if (tier === 'Platinum') return 'bg-slate-100 text-slate-700 border border-slate-200';
  if (tier === 'Gold')     return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  return '';
};

const paymentModeBadgeClass = (mode: PendingBooking['paymentMode']) => {
  if (mode === 'Upfront')                       return 'bg-green-100 text-green-700';
  if (mode === 'Net Upfront')                   return 'bg-teal-100 text-teal-700';
  if (mode === 'On-Credit')                     return 'bg-orange-100 text-orange-700';
  if (mode === 'Bulk Purchase/Monthly Invoice') return 'bg-violet-100 text-violet-700';
  return 'bg-gray-100 text-gray-700';
};

const REJECTION_REASONS = [
  'Our lounge availability',
  'In-lounge check-in support is not provided for this flight',
];

// Labelled read-only field
const Field = ({ label, children }: { label: string | React.ReactNode; children: React.ReactNode }) => (
  <div>
    <p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>{label}</p>
    <div className="text-sm text-gray-900">{children}</div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export interface BookingReviewPageProps {
  booking?: PendingBooking;
  reviewStage?: 'staff' | 'supervisor';
  onBack?: () => void;
  onApprove?: (bookingId: number) => void;
  onReject?: (bookingId: number, reason: string) => void;
}

// ── Default mock booking for standalone preview ───────────────────────────────
const MOCK_PENDING_BOOKING: PendingBooking = {
  id: 1,
  bookingNo: 'A-202603-000001',
  requestType: 'New Booking Request',
  guestName: 'James Hoffmann',
  accountNo: 'ACC-2026-1001',
  accountType: 'Individual',
  membershipTier: 'Gold',
  suite: 'Premier Suite A',
  dateTime: '2026-03-06 08:30',
  flightNo: 'CX113',
  flightTime: '11:45',
  flightOrigin: 'LHR',
  flightDestination: 'HKG',
  flightType: 'Arrival',
  numberOfGuests: 2,
  nonFlyingGuests: 1,
  hasLimousine: false,
  hasShopping: false,
  isAdHoc: false,
  paymentMode: 'Upfront',
  amount: 'HK$3,357',
  bookingType: 'Online',
  submittedAt: '2026-02-24 09:12',
  specialRequests: 'Guest requires wheelchair assistance',
};

export function BookingReviewPage({
  booking: bookingProp,
  reviewStage = 'staff',
  onBack = () => {},
  onApprove,
  onReject,
}: BookingReviewPageProps = {}) {
  const booking: PendingBooking = bookingProp ?? MOCK_PENDING_BOOKING;
  const [reviewMode, setReviewMode] = useState<'view' | 'approve' | 'reject'>('view');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // ── Supplementary derived data (deterministic from booking.id) ────────────
  const id = booking.id;
  const flyingGuests   = Math.max(0, booking.numberOfGuests - booking.nonFlyingGuests);
  const flightClass    = FLIGHT_CLASSES[id % 3];
  const numberOfLuggage = 1 + (id % 3);
  const arrivalDate    = booking.flightType === 'Arrival'
    ? booking.dateTime.split(' ')[0]
    : (() => { const d = new Date(booking.dateTime.split(' ')[0]); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })();

  // Premiere Suite breakdown
  const numPremiereSuites = flyingGuests > 0 ? (id % 2 === 0 ? 1 : 0) : 0;
  const vipPS = numPremiereSuites > 0 ? Math.min(flyingGuests, 1 + (id % 2)) : 0;
  const nonFlyingPS = numPremiereSuites > 0 && booking.nonFlyingGuests > 0 ? Math.min(booking.nonFlyingGuests, 1) : 0;
  // Lounge Deluxe breakdown
  const vipLD = Math.max(0, flyingGuests - vipPS);
  const nonFlyingLD = Math.max(0, booking.nonFlyingGuests - nonFlyingPS);

  // Passenger details
  const passengers = Array.from({ length: flyingGuests }, (_, idx) =>
    PASSENGER_SEEDS[(id + idx) % PASSENGER_SEEDS.length]
  );
  const nonFlyingGuestList = Array.from({ length: booking.nonFlyingGuests }, (_, idx) =>
    NON_FLYING_SEEDS[(id + idx + 2) % NON_FLYING_SEEDS.length]
  );

  // Contact person
  const contact = CONTACT_SEEDS[id % CONTACT_SEEDS.length];
  const promoCode = PROMO_CODES[id % PROMO_CODES.length];
  const accountDiscount = booking.agencyDiscountRate
    ? `${booking.agencyDiscountRate}% (Agency Default)`
    : id % 4 === 0 ? '10%' : '—';
  const accountRemark = id % 2 === 0 ? 'VIP Member - Priority Service' : '—';

  // Extra services (wheelchair, private sales)
  const hasWheelchair = id % 7 === 0;
  const hasPrivateSales = id % 9 === 0;

  // ── Action Handlers ────────────────────────────────────────────────────────
  const handleApprove = () => {
    onApprove?.(booking.id);
    if (reviewStage === 'staff') {
      toast.success(`Booking ${booking.bookingNo} forwarded for supervisor approval`, {
        description: 'A supervisor or manager must give final approval before the booking is confirmed.',
      });
    } else {
      toast.success(`Booking ${booking.bookingNo} confirmed`, {
        description: `Final approval granted. A confirmation email has been sent to ${booking.guestName}.`,
      });
    }
    onBack();
  };

  const handleReject = () => {
    if (!selectedReason) return;
    onReject?.(booking.id, customReason ? `${selectedReason} - ${customReason}` : selectedReason);
    setShowRejectDialog(false);
    toast.info(`Booking ${booking.bookingNo} rejection submitted`, {
      description: 'The rejection has been sent to AM / Manager to review',
    });
    onBack();
  };

  const rejectReasonValid = selectedReason !== '';

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1>Review Booking Request</h1>
            <Badge className={`text-sm ${
              booking.requestType === 'New Booking Request'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : booking.requestType === 'Cancel'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-orange-100 text-orange-700 border border-orange-200'
            }`}>
              {booking.requestType === 'New Booking Request' ? 'New Booking'
                : booking.requestType === 'Cancel' ? 'Cancellation Request' : 'Edit Request'}
            </Badge>
            {booking.isAdHoc && (
              <Badge className="text-sm bg-amber-100 text-amber-700 border border-amber-200">
                Ad-hoc / Urgent
              </Badge>
            )}
            <span className="text-sm font-mono text-gray-500">{booking.bookingNo}</span>
          </div>
          <p className="text-gray-600 mt-1">
            {reviewMode === 'view'
              ? 'Review the full booking details and choose to approve or reject.'
              : reviewMode === 'approve'
              ? 'Confirm the booking approval.'
              : 'Provide a rejection reason.'}
          </p>
        </div>
      </div>

      {/* ── Approval Stage Banner ── */}
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4 flex-wrap">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium flex-shrink-0 ${
          reviewStage === 'staff' ? 'bg-blue-600 text-white shadow-sm' : 'bg-green-100 text-green-700'
        }`}>
          {reviewStage === 'supervisor' ? <CheckCircle className="w-4 h-4" /> : <ClipboardCheck className="w-4 h-4" />}
          <span>Step 1: Staff Review</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium flex-shrink-0 ${
          reviewStage === 'supervisor' ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-200 text-gray-400'
        }`}>
          <ShieldCheck className="w-4 h-4" />
          <span>Step 2: Supervisor / Manager Approval</span>
        </div>
        <div className="ml-auto text-xs text-gray-500 hidden md:block">
          {reviewStage === 'staff'
            ? 'After staff approval, a supervisor/manager will give final confirmation.'
            : 'Staff review complete. Please give final approval or rejection.'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ════════════════════════════════════════════════════
            LEFT COLUMN — Full Booking Details (read-only)
            ═══════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Ad-hoc Alert ── */}
          {booking.isAdHoc && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Ad-hoc Booking Alert</p>
                <p className="text-sm text-amber-800 mt-0.5">
                  This booking was submitted within the cut-off period and requires immediate attention.
                </p>
              </div>
            </div>
          )}

          {/* ── Edit Request — Changes Panel ── */}
          {booking.requestType === 'Edit Booking Request' && booking.originalData && reviewMode === 'view' && (
            <Card className="p-6 border-2 border-blue-300 bg-blue-50">
              <div className="flex items-center gap-2 mb-4">
                <FileEdit className="w-5 h-5 text-blue-700" />
                <h2 className="text-lg font-medium text-blue-900">Changes Requested</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b-2 border-red-200 font-medium">Original</p>
                  <div className="space-y-3">
                    {booking.originalData.suite && booking.originalData.suite !== booking.suite && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Suite</p><p className="line-through text-red-600 font-medium">{booking.originalData.suite}</p></div>
                    )}
                    {booking.originalData.dateTime && booking.originalData.dateTime !== booking.dateTime && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Visit Date/Time</p><p className="line-through text-red-600 font-medium">{booking.originalData.dateTime}</p></div>
                    )}
                    {booking.originalData.flightNo && booking.originalData.flightNo !== booking.flightNo && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Flight No.</p><p className="line-through text-red-600 font-medium">{booking.originalData.flightNo}</p></div>
                    )}
                    {booking.originalData.flightTime && booking.originalData.flightTime !== booking.flightTime && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Flight Time</p><p className="line-through text-red-600 font-medium">{booking.originalData.flightTime}</p></div>
                    )}
                    {booking.originalData.numberOfGuests !== undefined && booking.originalData.numberOfGuests !== booking.numberOfGuests && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Number of Guests</p><p className="line-through text-red-600 font-medium">{booking.originalData.numberOfGuests} pax</p></div>
                    )}
                    {booking.originalData.nonFlyingGuests !== undefined && booking.originalData.nonFlyingGuests !== booking.nonFlyingGuests && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Non-flying Guests</p><p className="line-through text-red-600 font-medium">{booking.originalData.nonFlyingGuests}</p></div>
                    )}
                    {booking.originalData.hasLimousine !== undefined && booking.originalData.hasLimousine !== booking.hasLimousine && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Limousine Service</p><p className="line-through text-red-600 font-medium">{booking.originalData.hasLimousine ? 'Yes' : 'No'}</p></div>
                    )}
                    {booking.originalData.hasShopping !== undefined && booking.originalData.hasShopping !== booking.hasShopping && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Shopping Service</p><p className="line-through text-red-600 font-medium">{booking.originalData.hasShopping ? 'Yes' : 'No'}</p></div>
                    )}
                    {booking.originalData.specialRequests !== booking.specialRequests && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Special Request</p><p className="line-through text-red-600 text-sm">{booking.originalData.specialRequests || '(none)'}</p></div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b-2 border-green-200 font-medium">Changed To</p>
                  <div className="space-y-3">
                    {booking.originalData.suite && booking.originalData.suite !== booking.suite && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Suite</p><p className="text-green-700 font-medium">{booking.suite}</p></div>
                    )}
                    {booking.originalData.dateTime && booking.originalData.dateTime !== booking.dateTime && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Visit Date/Time</p><p className="text-green-700 font-medium">{booking.dateTime}</p></div>
                    )}
                    {booking.originalData.flightNo && booking.originalData.flightNo !== booking.flightNo && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Flight No.</p><p className="text-green-700 font-medium">{booking.flightNo}</p></div>
                    )}
                    {booking.originalData.flightTime && booking.originalData.flightTime !== booking.flightTime && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Flight Time</p><p className="text-green-700 font-medium">{booking.flightTime}</p></div>
                    )}
                    {booking.originalData.numberOfGuests !== undefined && booking.originalData.numberOfGuests !== booking.numberOfGuests && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Number of Guests</p><p className="text-green-700 font-medium">{booking.numberOfGuests} pax</p></div>
                    )}
                    {booking.originalData.nonFlyingGuests !== undefined && booking.originalData.nonFlyingGuests !== booking.nonFlyingGuests && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Non-flying Guests</p><p className="text-green-700 font-medium">{booking.nonFlyingGuests}</p></div>
                    )}
                    {booking.originalData.hasLimousine !== undefined && booking.originalData.hasLimousine !== booking.hasLimousine && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Limousine Service</p><p className="text-green-700 font-medium">{booking.hasLimousine ? 'Yes' : 'No'}</p></div>
                    )}
                    {booking.originalData.hasShopping !== undefined && booking.originalData.hasShopping !== booking.hasShopping && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Shopping Service</p><p className="text-green-700 font-medium">{booking.hasShopping ? 'Yes' : 'No'}</p></div>
                    )}
                    {booking.originalData.specialRequests !== booking.specialRequests && (
                      <div><p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Special Request</p><p className="text-green-700 font-medium text-sm">{booking.specialRequests || '(none)'}</p></div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ── 1. Guest Information ── */}
          <Card className="p-6">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-5">Guest Information</h2>
            <div className="grid grid-cols-3 gap-6">
              <Field label="Guest Name">
                <span className="font-medium">{booking.guestName}</span>
              </Field>
              <Field label="Account No.">
                <span className="font-mono">{booking.accountNo}</span>
              </Field>
              <Field label="Account Type">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs ${accountTypeBadgeClass(booking.accountType)}`}>
                    {booking.accountType}
                  </Badge>
                  {booking.membershipTier && (
                    <Badge className={`text-xs ${membershipBadgeClass(booking.membershipTier)}`}>
                      {booking.membershipTier}
                    </Badge>
                  )}
                </div>
              </Field>
              {booking.companyName && (
                <Field label="Company">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>{booking.companyName}</span>
                  </div>
                </Field>
              )}
              {booking.agencyName && (
                <Field label="Agency">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    <span>{booking.agencyName}</span>
                  </div>
                </Field>
              )}
              <Field label="Number of Guests">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{booking.numberOfGuests} total</span>
                </div>
              </Field>
              <Field label="Non-Flying Guests">
                <span>{booking.nonFlyingGuests || 0}</span>
              </Field>
              <Field label="Payment Method">
                <span>Credit Card (Visa ***1234)</span>
              </Field>
              <Field label="Account Discount">
                <span className={booking.agencyDiscountRate || id % 4 === 0 ? 'text-green-600' : ''}>
                  {accountDiscount}
                </span>
              </Field>
              <Field label="Promotion Code">
                {promoCode
                  ? <div className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-indigo-500" /><span className="font-mono text-indigo-600">{promoCode}</span></div>
                  : <span className="text-gray-400">—</span>}
              </Field>
              <Field label="Account Remark">
                <span className={accountRemark !== '—' ? 'text-blue-600' : 'text-gray-400'}>{accountRemark}</span>
              </Field>
              <Field label="Booking Channel">
                <span>{booking.bookingType}</span>
              </Field>
              <Field label="Submitted At">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{booking.submittedAt}</span>
                </div>
              </Field>
            </div>
          </Card>

          {/* ── 2. Flight Information ── */}
          <Card className="p-6">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-5">Flight Information</h2>
            <div className="grid grid-cols-4 gap-6">
              <Field label="Flight Type">
                {booking.flightType === 'Arrival' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                    <Plane className="w-3.5 h-3.5 -rotate-45" /> Arrival
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200">
                    <Plane className="w-3.5 h-3.5 rotate-45" /> Departure
                  </span>
                )}
              </Field>
              <Field label="Arrival Date">
                <span>{arrivalDate || '—'}</span>
              </Field>
              <Field label="Flight Number">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{booking.flightNo}</span>
                </div>
              </Field>
              <Field label="Flight Time (STD/STA)">
                <span className="font-medium">{booking.flightTime}</span>
              </Field>
              <Field label="Route">
                <span>{booking.flightOrigin || '—'} → {booking.flightDestination || '—'}</span>
              </Field>
              <Field label="Number of Luggage">
                <div className="flex items-center gap-1.5">
                  <Luggage className="w-4 h-4 text-gray-400" />
                  <span>{numberOfLuggage} pcs</span>
                </div>
              </Field>
              <Field label="Flight Class (Main VIP)">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${
                  flightClass === 'First Class'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : flightClass === 'Business Class'
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  {flightClass === 'First Class' && <Star className="w-3.5 h-3.5 fill-current" />}
                  {flightClass}
                </span>
              </Field>
            </div>
          </Card>

          {/* ── 3. Booking Details ── */}
          <Card className="p-6">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-5">Booking Details</h2>

            {/* Basic booking info */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Field label="Suite / Lounge">
                <span className="font-medium">{booking.suite}</span>
                {(booking.assignedSuiteNames?.length || booking.assignedLoungeNames?.length) ? (
                  <div className="mt-1.5 space-y-1">
                    {booking.assignedSuiteNames && booking.assignedSuiteNames.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Suites</span>
                        {booking.assignedSuiteNames.map(name => (
                          <span key={name} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">{name}</span>
                        ))}
                      </div>
                    )}
                    {booking.assignedLoungeNames && booking.assignedLoungeNames.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Lounges</span>
                        {booking.assignedLoungeNames.map(name => (
                          <span key={name} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">{name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </Field>
              <Field label="Visit Date &amp; Time"><span>{booking.dateTime}</span></Field>
              <Field label="Payment Mode">
                <Badge className={`text-xs ${paymentModeBadgeClass(booking.paymentMode)}`}>{booking.paymentMode}</Badge>
              </Field>
              <Field label="Booking Type"><span>{booking.bookingType}</span></Field>
              {booking.isAdHoc && (
                <Field label="Ad-hoc Booking">
                  <span className="text-amber-600 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Yes — within cut-off period</span>
                </Field>
              )}
            </div>

            {/* Part 1: Premiere Suite */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-purple-50/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Part 1 — Premiere Suite</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Max 6 guests (VIP + Non-Flying) per suite</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                  {vipPS + nonFlyingPS} / {numPremiereSuites * 6 || '—'} guests used
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <Field label="Quantity of Premiere Suite">
                  <span className="text-base font-medium">{numPremiereSuites}</span>
                </Field>
                <Field label="VIP Passengers">
                  <span className="text-base font-medium">{vipPS}</span>
                </Field>
                <Field label="Non-Flying Guests">
                  <span className="text-base font-medium">{nonFlyingPS}</span>
                </Field>
              </div>
            </div>

            {/* Part 2: Lounge Deluxe */}
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Part 2 — Lounge Deluxe</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Max 3 Non-Flying Guests per booking</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                  {nonFlyingLD} / 3 non-flying used
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <Field label="VIP Passengers">
                  <span className="text-base font-medium">{vipLD}</span>
                </Field>
                <Field label="Non-Flying Guests">
                  <span className="text-base font-medium">{nonFlyingLD}</span>
                </Field>
              </div>
            </div>
          </Card>

          {/* ── 4. VIP Passenger Details ── */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm uppercase tracking-wide text-gray-500">VIP Passenger Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {passengers.length} passenger{passengers.length !== 1 ? 's' : ''} —
                  {vipPS > 0 && ` ${vipPS} from Premiere Suite`}
                  {vipPS > 0 && vipLD > 0 && ','}
                  {vipLD > 0 && ` ${vipLD} from Lounge Deluxe`}
                </p>
              </div>
            </div>

            {passengers.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                <p className="text-sm">No VIP passengers assigned.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">#</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Section</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Name</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Travel Doc No.</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Membership No.</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Age Group</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Birthday</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {passengers.map((p, idx) => {
                      const isPS = idx < vipPS;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 text-gray-500">{idx + 1}</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isPS ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                              {isPS ? 'Premiere Suite' : 'Lounge Deluxe'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-medium">{p.title} {p.firstName} {p.lastName}</td>
                          <td className="px-3 py-2.5 font-mono text-gray-600">{p.doc}</td>
                          <td className="px-3 py-2.5 font-mono text-gray-600">{p.mem || '—'}</td>
                          <td className="px-3 py-2.5 text-gray-600">{p.ageGroup}</td>
                          <td className="px-3 py-2.5 text-gray-600">{p.day} {p.month} {p.year}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* ── 5. Non-Flying Guest Details ── */}
          {booking.nonFlyingGuests > 0 && (
            <Card className="p-6">
              <div className="mb-5">
                <h2 className="text-sm uppercase tracking-wide text-gray-500">Non-Flying Guest Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {nonFlyingGuestList.length} guest{nonFlyingGuestList.length !== 1 ? 's' : ''} —
                  {nonFlyingPS > 0 && ` ${nonFlyingPS} from Premiere Suite`}
                  {nonFlyingPS > 0 && nonFlyingLD > 0 && ','}
                  {nonFlyingLD > 0 && ` ${nonFlyingLD} from Lounge Deluxe`}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">#</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Section</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Name</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Age Group</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {nonFlyingGuestList.map((g, idx) => {
                      const isPS = idx < nonFlyingPS;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 text-gray-500">{idx + 1}</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isPS ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                              {isPS ? 'Premiere Suite' : 'Lounge Deluxe'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-medium">{g.title} {g.firstName} {g.lastName}</td>
                          <td className="px-3 py-2.5 text-gray-600">{g.ageGroup}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── 6. Services Included ── */}
          <Card className="p-6">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-5">Services Included</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${booking.hasLimousine ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                <Car className={`w-5 h-5 ${booking.hasLimousine ? 'text-purple-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`text-sm font-medium ${booking.hasLimousine ? 'text-purple-800' : 'text-gray-400'}`}>Limousine Transfer</p>
                  <p className="text-xs text-gray-500">{booking.hasLimousine ? 'Included' : 'Not included'}</p>
                </div>
                {booking.hasLimousine && <CheckCircle className="w-4 h-4 text-purple-500 ml-auto" />}
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${booking.hasShopping ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                <ShoppingBag className={`w-5 h-5 ${booking.hasShopping ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`text-sm font-medium ${booking.hasShopping ? 'text-green-800' : 'text-gray-400'}`}>In-lounge Shopping</p>
                  <p className="text-xs text-gray-500">{booking.hasShopping ? 'Included' : 'Not included'}</p>
                </div>
                {booking.hasShopping && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${hasWheelchair ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                <Accessibility className={`w-5 h-5 ${hasWheelchair ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`text-sm font-medium ${hasWheelchair ? 'text-blue-800' : 'text-gray-400'}`}>Wheelchair Assistance</p>
                  <p className="text-xs text-gray-500">{hasWheelchair ? 'Requested' : 'Not required'}</p>
                </div>
                {hasWheelchair && <CheckCircle className="w-4 h-4 text-blue-500 ml-auto" />}
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${hasPrivateSales ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                <Star className={`w-5 h-5 ${hasPrivateSales ? 'text-amber-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`text-sm font-medium ${hasPrivateSales ? 'text-amber-800' : 'text-gray-400'}`}>Private Sales</p>
                  <p className="text-xs text-gray-500">{hasPrivateSales ? 'Requested' : 'Not requested'}</p>
                </div>
                {hasPrivateSales && <CheckCircle className="w-4 h-4 text-amber-500 ml-auto" />}
              </div>
            </div>
          </Card>

          {/* ── 7. Contact Person ── */}
          <Card className="p-6">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-5">Contact Person</h2>
            <div className="grid grid-cols-3 gap-6">
              <Field label={<span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Name</span>}>
                <span>{contact.name}</span>
              </Field>
              <Field label={<span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Contact Email</span>}>
                <span className="text-blue-600">{contact.email}</span>
              </Field>
              <Field label={<span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Contact No.</span>}>
                <span>{contact.phone}</span>
              </Field>
              {contact.memo && (
                <div className="col-span-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                    <MessageSquare className="w-3.5 h-3.5" />Booking Memo
                  </p>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
                    {contact.memo}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ── 8. Special Requests ── */}
          {booking.specialRequests && (
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-900 mb-1">Special Request</h3>
                  <p className="text-sm text-yellow-800">{booking.specialRequests}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ════════════════════════════════════════════════════
            RIGHT COLUMN — Payment Info + Review Actions
            ════════════════════════════════════════════════════ */}
        <div className="space-y-6">

          {/* Payment Information */}
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Payment Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Payment Mode</p>
                <Badge className={`text-sm ${paymentModeBadgeClass(booking.paymentMode)}`}>
                  {booking.paymentMode}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500" style={{ marginBottom: '10px' }}>Amount</p>
                {booking.agencyDiscountRate && booking.originalAmountValue ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400 line-through">HK${booking.originalAmountValue.toLocaleString()}</p>
                    <p className="text-2xl text-green-700 font-bold">{booking.amount}</p>
                    <div className="flex items-center gap-1 text-sm text-green-700">
                      <BadgePercent className="w-4 h-4" />
                      <span>{booking.agencyDiscountRate}% agency discount applied</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{booking.amount}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Review Actions */}
          <Card className="p-6 sticky top-6">
            <h2 className="text-lg font-medium mb-4">Review Actions</h2>

            {reviewMode === 'view' && (
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-12"
                  onClick={() => setReviewMode('approve')}
                >
                  <CheckCircle className="w-5 h-5" />
                  {booking.requestType === 'Cancel'
                    ? (reviewStage === 'staff' ? 'Approve Cancellation' : 'Confirm Cancellation (Final)')
                    : (reviewStage === 'staff' ? 'Approve & Forward to Supervisor' : 'Approve Booking (Final)')}
                </Button>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 h-12"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="w-5 h-5" />
                  {booking.requestType === 'Cancel' ? 'Reject Cancellation' : 'Reject Booking'}
                </Button>
              </div>
            )}

            {reviewMode === 'approve' && (
              <div className="space-y-4">
                {reviewStage === 'staff' ? (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>This booking will be forwarded to a <strong>supervisor/manager</strong> for final approval. The guest will <strong>not</strong> be notified yet.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                    <MailCheck className="w-4 h-4 flex-shrink-0" />
                    <span>As supervisor/manager, your approval will <strong>confirm</strong> this booking and trigger a guest notification email.</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-12"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {reviewStage === 'staff'
                      ? (booking.requestType === 'Cancel' ? 'Forward Cancellation to Supervisor' : 'Forward to Supervisor Approval')
                      : (booking.requestType === 'Cancel' ? 'Confirm Cancellation (Final)' : 'Confirm Final Approval')}
                  </Button>
                  <Button variant="outline" className="w-full h-10" onClick={() => setReviewMode('view')}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {reviewMode === 'reject' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ marginBottom: '10px' }}>
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {REJECTION_REASONS.map(reason => (
                      <label key={reason} className="flex items-start gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="rejectionReason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={() => setSelectedReason(reason)}
                          className="accent-red-500 mt-0.5"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                  {selectedReason === 'Other (specify below)' && (
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 text-sm mt-2"
                      rows={3}
                      placeholder="Please describe the rejection reason…"
                      value={customReason}
                      onChange={e => setCustomReason(e.target.value)}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                  <MailCheck className="w-4 h-4 flex-shrink-0" />
                  <span>The guest will be notified of this rejection and the reason via email.</span>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 h-12"
                    disabled={!rejectReasonValid}
                    onClick={handleReject}
                  >
                    <XCircle className="w-5 h-5" />
                    Confirm Rejection
                  </Button>
                  <Button variant="outline" className="w-full h-10" onClick={() => setReviewMode('view')}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Booking Request</DialogTitle>
            <DialogDescription>
              Please select a rejection reason below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ marginBottom: '10px' }}>
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {REJECTION_REASONS.map(reason => (
                  <label key={reason} className="flex items-start gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-red-500 mt-0.5"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ marginBottom: '10px' }}>
                Additional Details (Optional)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                rows={3}
                placeholder="Add any additional notes about the rejection..."
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
              disabled={!rejectReasonValid}
              onClick={handleReject}
            >
              <XCircle className="w-4 h-4" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}