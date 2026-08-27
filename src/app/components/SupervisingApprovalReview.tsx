import { useState } from 'react';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Plane,
  Car, ShoppingBag, Clock, Building2, User, BadgePercent,
  MailCheck, Info, Receipt, PenLine, RefreshCcw, ShieldCheck,
  DollarSign, CalendarDays, FileText, Printer, ChevronRight,
  ThumbsUp, ThumbsDown, ShieldAlert
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface SupervisingBooking {
  id: number;
  bookingNo: string;
  invoiceNo: string;
  invoiceDate: string;
  requestType: 'New Booking' | 'Edit Booking' | 'Cancellation';
  guestName: string;
  accountNo: string;
  accountType: 'Individual' | 'Corporate' | 'Agency';
  membershipTier?: 'Sapphire' | 'Diamond' | 'Platinum' | 'Gold';
  companyName?: string;
  agencyName?: string;
  agencyDiscountRate?: number;
  suite: string;
  dateTime: string;
  flightNo: string;
  flightTime: string;
  flightType?: 'Arrival' | 'Departure';
  flightOrigin?: string;
  flightDestination?: string;
  numberOfGuests: number;
  nonFlyingGuests: number;
  hasLimousine: boolean;
  hasShopping: boolean;
  isAdHoc: boolean;
  paymentMode: 'Upfront' | 'Net Upfront' | 'On-Credit' | 'Bulk Purchase/Monthly Invoice';
  bookingType: 'Online' | 'Email/Call to HKIAL';
  submittedAt: string;
  submittedBy: string;
  specialRequests?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  agencyDiscount: number;
  membershipDiscount: number;
  serviceCharge: number;
  totalAmount: number;
  staffNotes?: string;
  /** Staff decision from the "Approve Booking Request" module */
  staffDecision: {
    decision: 'Approved' | 'Rejected';
    by: string;
    at: string;
    reason?: string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const accountTypeBadgeClass = (type: SupervisingBooking['accountType']) => {
  if (type === 'Individual')    return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
  if (type === 'Corporate')     return 'bg-blue-100 text-blue-800 border border-blue-200';
  if (type === 'Agency') return 'bg-purple-100 text-purple-800 border border-purple-200';
  return 'bg-gray-100 text-gray-700';
};

const membershipBadgeClass = (tier?: SupervisingBooking['membershipTier']) => {
  if (tier === 'Sapphire') return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
  if (tier === 'Diamond')  return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
  if (tier === 'Platinum') return 'bg-slate-100 text-slate-700 border border-slate-200';
  if (tier === 'Gold')     return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  return '';
};

const paymentModeBadgeClass = (mode: SupervisingBooking['paymentMode']) => {
  if (mode === 'Upfront')                       return 'bg-green-100 text-green-700';
  if (mode === 'Net Upfront')                   return 'bg-teal-100 text-teal-700';
  if (mode === 'On-Credit')                     return 'bg-orange-100 text-orange-700';
  if (mode === 'Bulk Purchase/Monthly Invoice') return 'bg-violet-100 text-violet-700';
  return 'bg-gray-100 text-gray-700';
};

const REVISION_REASONS = [
  'Price calculation error — please recalculate',
  'Incorrect discount rate applied',
  'Missing line item(s) — please add',
  'Service charge not applied correctly',
  'Promo code or agency discount not reflected',
  'Incorrect payment terms listed',
  'Other (specify below)',
];

const REJECTION_REASONS = [
  'Pricing exceeds approved rate card',
  'Unauthorized discount applied without approval',
  'Duplicate invoice detected',
  'Service not authorised for this account type',
  'Booking does not qualify for submitted invoice',
  'Other (specify below)',
];

// ── Main Component ────────────────────────────────────────────────────────────

type ReviewMode = 'view' | 'approve' | 'revision' | 'reject';

export interface SupervisingApprovalReviewProps {
  booking?: SupervisingBooking;
  isLoading?: boolean;
  onBack?: () => void;
  onApprove?: (bookingId: number, note?: string) => void;
  onRequestRevision?: (bookingId: number, reason: string) => void;
  onReject?: (bookingId: number, reason: string) => void;
}

export function SupervisingApprovalReview({
  booking: bookingProp,
  onBack = () => {},
  onApprove = () => {},
  onRequestRevision = () => {},
  onReject = () => {},
}: SupervisingApprovalReviewProps = {}) {
  // Fallback mock booking so the component renders standalone
  const booking: SupervisingBooking = bookingProp ?? {
    id: 1,
    bookingNo: 'A-202603-000001',
    invoiceNo: 'INV-2026-000001',
    invoiceDate: '2026-03-01',
    requestType: 'New Booking',
    guestName: 'John Smith',
    accountNo: 'ACC-2024-0001',
    accountType: 'Individual',
    membershipTier: 'Platinum',
    suite: 'VIP Suite A',
    dateTime: '2026-03-07 09:00',
    flightNo: 'CX888',
    flightTime: '12:30',
    flightType: 'Departure',
    flightOrigin: 'HKG',
    flightDestination: 'NRT',
    numberOfGuests: 2,
    nonFlyingGuests: 0,
    hasLimousine: false,
    hasShopping: false,
    isAdHoc: false,
    paymentMode: 'Upfront',
    bookingType: 'Online',
    submittedAt: '2026-02-28 10:00',
    submittedBy: 'Staff User',
    lineItems: [
      { description: 'Lounge Access (2 pax)', quantity: 2, unitPrice: 2400, amount: 4800 },
    ],
    subtotal: 4800,
    agencyDiscount: 0,
    membershipDiscount: 0,
    serviceCharge: 480,
    totalAmount: 5280,
    staffDecision: { decision: 'Approved', by: 'Staff User', at: '2026-02-28 11:00' },
  };
  const [reviewMode, setReviewMode] = useState<ReviewMode>('view');
  const [supervisorNote, setSupervisorNote] = useState('');
  const [selectedRevisionReason, setSelectedRevisionReason] = useState('');
  const [customRevisionReason, setCustomRevisionReason] = useState('');
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const [customRejectionReason, setCustomRejectionReason] = useState('');

  const staffDecision = booking.staffDecision ?? { decision: 'Approved' as const, by: booking.submittedBy ?? 'Staff', at: booking.submittedAt ?? '' };
  const staffApproved = staffDecision.decision === 'Approved';

  const handleApprove = () => {
    onApprove(booking.id, supervisorNote.trim() || undefined);
    toast.success(
      staffApproved
        ? `Staff approval confirmed for ${booking.bookingNo}`
        : `Staff rejection confirmed for ${booking.bookingNo}`,
      {
        description: staffApproved
          ? `Booking ${booking.bookingNo} has been fully confirmed. Guest will be notified.`
          : `Staff's rejection of ${booking.bookingNo} has been endorsed by supervisor.`,
      }
    );
    onBack();
  };

  const handleRevision = () => {
    const reason = selectedRevisionReason === 'Other (specify below)'
      ? customRevisionReason.trim()
      : selectedRevisionReason;
    if (!reason) return;
    onRequestRevision(booking.id, reason);
    toast.warning(`Revision requested for ${booking.invoiceNo}`, {
      description: `Staff have been notified to revise the price and invoice.`,
    });
    onBack();
  };

  const handleReject = () => {
    const reason = selectedRejectionReason === 'Other (specify below)'
      ? customRejectionReason.trim()
      : selectedRejectionReason;
    if (!reason) return;
    onReject(booking.id, reason);
    toast.error(
      staffApproved
        ? `Supervisor overrode staff approval for ${booking.bookingNo}`
        : `Invoice ${booking.invoiceNo} rejected`,
      {
        description: `Rejection reason recorded. Staff has been notified.`,
      }
    );
    onBack();
  };

  const revisionValid =
    selectedRevisionReason !== '' &&
    (selectedRevisionReason !== 'Other (specify below)' || customRevisionReason.trim().length > 0);

  const rejectionValid =
    selectedRejectionReason !== '' &&
    (selectedRejectionReason !== 'Other (specify below)' || customRejectionReason.trim().length > 0);

  const membershipDiscountPct =
    booking.membershipTier === 'Diamond' ? 12
    : booking.membershipTier === 'Platinum' ? 8
    : booking.membershipTier === 'Gold' ? 5
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1>Review Staff Decision</h1>
            <Badge className={`text-sm ${
              booking.requestType === 'New Booking'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : booking.requestType === 'Cancellation'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-orange-100 text-orange-700 border border-orange-200'
            }`}>
              {booking.requestType}
            </Badge>
            {booking.isAdHoc && (
              <Badge className="text-sm bg-amber-100 text-amber-700 border border-amber-200">
                Ad-hoc / Urgent
              </Badge>
            )}
            <Badge className={`text-sm border ${staffApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
              {staffApproved ? '✓ Staff Approved' : '✗ Staff Rejected'}
            </Badge>
            <Badge className="text-sm bg-gray-100 text-gray-700 font-mono">{booking.invoiceNo}</Badge>
          </div>
          <p className="text-gray-600 mt-1">
            {reviewMode === 'view'
              ? 'Review the staff\'s booking decision and price breakdown before approving or overriding.'
              : reviewMode === 'approve'
              ? staffApproved ? 'Confirm your endorsement of the staff\'s approval decision.' : 'Confirm your endorsement of the staff\'s rejection decision.'
              : reviewMode === 'revision'
              ? 'Specify the revision required for the price or invoice.'
              : 'Provide a reason for overriding the staff\'s decision.'}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-gray-600 hidden md:flex">
          <Printer className="w-4 h-4" />
          Print Invoice
        </Button>
      </div>

      {/* Workflow Banner — shows staff decision */}
      <div className="flex items-center gap-3 rounded-lg p-4 border"
        style={{ background: staffApproved ? '#f0fdf4' : '#fef2f2', borderColor: staffApproved ? '#bbf7d0' : '#fecaca' }}
      >
        {/* Step 1 — Staff decision (completed) */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium flex-shrink-0 ${staffApproved ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
          {staffApproved ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
          <span>Step 1: Staff {staffDecision.decision}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        {/* Step 2 — Supervisor review (active) */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-[#0f2942] text-white shadow-sm flex-shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Step 2: Supervisor Approval</span>
        </div>
        <div className="ml-auto text-xs hidden md:flex flex-col items-end gap-0.5"
          style={{ color: staffApproved ? '#166534' : '#991b1b' }}
        >
          <span>Decision by <strong>{staffDecision.by}</strong> on {staffDecision.at}</span>
          {staffDecision.reason && (
            <span className="text-xs opacity-75">Reason: {staffDecision.reason}</span>
          )}
        </div>
      </div>

      {/* Staff Decision Summary card */}
      <div className={`flex items-start gap-3 p-4 rounded-lg border ${staffApproved ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        {staffApproved
          ? <ThumbsUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          : <ThumbsDown className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
        <div>
          <p className={`text-sm font-medium ${staffApproved ? 'text-emerald-900' : 'text-red-900'}`}>
            Staff Decision: <span className="font-semibold">{staffDecision.decision}</span>
            {' '}— {staffApproved
              ? 'Staff has approved this booking request. Supervisor confirmation is required to finalise.'
              : 'Staff has rejected this booking request. Supervisor must endorse or override this decision.'}
          </p>
          {staffDecision.reason && (
            <p className={`text-xs mt-1 ${staffApproved ? 'text-emerald-700' : 'text-red-700'}`}>
              Staff reason: {staffDecision.reason}
            </p>
          )}
          <p className={`text-xs mt-0.5 ${staffApproved ? 'text-emerald-600' : 'text-red-600'}`}>
            By {staffDecision.by} · {staffDecision.at}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Invoice + Booking Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* ─── Invoice Preview ─── */}
          <Card className="overflow-hidden border-2 border-gray-200">
            {/* Invoice Header */}
            <div className="bg-[#0f2942] text-white px-8 py-6 flex items-start justify-between">
              <div>
                <p className="text-xl font-semibold tracking-wide">HKIA VIP LOUNGE</p>
                <p className="text-blue-200 text-sm mt-0.5">Hong Kong International Airport</p>
                <p className="text-blue-200 text-sm">Terminal 1, Departures Level 7</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Receipt className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-200 text-sm">TAX INVOICE</span>
                </div>
                <p className="text-lg font-mono font-semibold">{booking.invoiceNo}</p>
                <p className="text-blue-300 text-xs mt-1">Invoice Date: {booking.invoiceDate}</p>
                <p className="text-blue-300 text-xs">Booking Ref: {booking.bookingNo}</p>
              </div>
            </div>

            {/* Bill To + Booking Details */}
            <div className="px-8 py-5 grid grid-cols-2 gap-6 bg-gray-50 border-b">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Bill To</p>
                <p className="font-semibold text-gray-900">{booking.guestName}</p>
                {booking.companyName && <p className="text-sm text-gray-600">{booking.companyName}</p>}
                {booking.agencyName && <p className="text-sm text-purple-600">{booking.agencyName}</p>}
                <p className="text-sm text-gray-500 font-mono mt-1">{booking.accountNo}</p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <Badge className={`text-xs ${accountTypeBadgeClass(booking.accountType)}`}>
                    {booking.accountType}
                  </Badge>
                  {booking.membershipTier && (
                    <Badge className={`text-xs ${membershipBadgeClass(booking.membershipTier)}`}>
                      {booking.membershipTier}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Service Details</p>
                <div className="space-y-1 text-sm">
                  <div className="flex gap-2 items-start">
                    <span className="text-gray-500 w-24 flex-shrink-0">Suite:</span>
                    <span className="font-medium flex-1">
                      {booking.suite}
                      {booking.assignedSuiteNames && booking.assignedSuiteNames.length > 0 && (
                        <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
                          {booking.assignedSuiteNames.map(n => (
                            <span key={n} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200">{n}</span>
                          ))}
                        </span>
                      )}
                      {booking.assignedLoungeNames && booking.assignedLoungeNames.length > 0 && (
                        <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
                          {booking.assignedLoungeNames.map(n => (
                            <span key={n} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">{n}</span>
                          ))}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-24 flex-shrink-0">Visit Date:</span>
                    <span>{booking.dateTime}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-24 flex-shrink-0">Flight:</span>
                    <span className="flex items-center gap-1">
                      <Plane className={`w-3 h-3 text-gray-400 ${booking.flightType === 'Arrival' ? 'rotate-[-45deg]' : 'rotate-45'}`} />
                      {booking.flightNo} · {booking.flightTime}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-24 flex-shrink-0">Payment:</span>
                    <Badge className={`text-xs ${paymentModeBadgeClass(booking.paymentMode)}`}>
                      {booking.paymentMode}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="px-8 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 text-xs text-gray-500 uppercase tracking-wider font-medium">Description</th>
                    <th className="text-center py-2 text-xs text-gray-500 uppercase tracking-wider font-medium w-12">Qty</th>
                    <th className="text-right py-2 text-xs text-gray-500 uppercase tracking-wider font-medium w-28">Unit Price</th>
                    <th className="text-right py-2 text-xs text-gray-500 uppercase tracking-wider font-medium w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.lineItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2.5 text-gray-800">{item.description}</td>
                      <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-2.5 text-right text-gray-600">HK${item.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-medium text-gray-800">HK${item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="px-8 pb-6">
              <div className="ml-auto w-72 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>HK${booking.subtotal.toLocaleString()}</span>
                </div>
                {booking.agencyDiscount > 0 && (
                  <div className="flex justify-between text-sm text-purple-600">
                    <span className="flex items-center gap-1">
                      <BadgePercent className="w-3.5 h-3.5" />
                      Agency Discount ({booking.agencyDiscountRate}%)
                    </span>
                    <span>−HK${booking.agencyDiscount.toLocaleString()}</span>
                  </div>
                )}
                {booking.membershipDiscount > 0 && (
                  <div className="flex justify-between text-sm text-indigo-600">
                    <span className="flex items-center gap-1">
                      <BadgePercent className="w-3.5 h-3.5" />
                      {booking.membershipTier} Member Discount ({membershipDiscountPct}%)
                    </span>
                    <span>−HK${booking.membershipDiscount.toLocaleString()}</span>
                  </div>
                )}
                {(booking.agencyDiscount > 0 || booking.membershipDiscount > 0) && (
                  <div className="flex justify-between text-sm text-gray-600 border-t pt-2">
                    <span>After Discount</span>
                    <span>HK${(booking.subtotal - booking.agencyDiscount - booking.membershipDiscount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Service Charge (10%)</span>
                  <span>+HK${booking.serviceCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-300 pt-2 mt-2">
                  <span className="font-semibold text-gray-900 text-base">TOTAL</span>
                  <span className="font-bold text-[#0f2942] text-xl">HK${booking.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Invoice Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t text-xs text-gray-400 flex items-center justify-between">
              <span>This invoice is computer-generated. No signature required.</span>
              <span>HKIA VIP Lounge · hkiavip@hkairport.com · (852) 2188 0000</span>
            </div>
          </Card>

          {/* Booking Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Booking Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1" style={{ marginBottom: '10px' }}>Guests</p>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{booking.numberOfGuests} pax
                    {booking.nonFlyingGuests > 0 && ` (${booking.nonFlyingGuests} non-flying)`}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1" style={{ marginBottom: '10px' }}>Limousine Transfer</p>
                {booking.hasLimousine
                  ? <span className="flex items-center gap-1 text-purple-600"><Car className="w-4 h-4" /> Included</span>
                  : <span className="text-gray-400">Not included</span>}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1" style={{ marginBottom: '10px' }}>In-lounge Shopping</p>
                {booking.hasShopping
                  ? <span className="flex items-center gap-1 text-green-600"><ShoppingBag className="w-4 h-4" /> Included</span>
                  : <span className="text-gray-400">Not included</span>}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1" style={{ marginBottom: '10px' }}>Booking Type</p>
                <span>{booking.bookingType}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1" style={{ marginBottom: '10px' }}>Ad-hoc Booking</p>
                {booking.isAdHoc
                  ? <span className="text-amber-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Yes</span>
                  : <span className="text-gray-500">No</span>}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1" style={{ marginBottom: '10px' }}>Route</p>
                <p>{booking.flightOrigin || '—'} → {booking.flightDestination || '—'}</p>
              </div>
            </div>
            {booking.staffNotes && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 flex gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                <div><strong className="block mb-0.5">Staff Notes:</strong>{booking.staffNotes}</div>
              </div>
            )}
            {booking.specialRequests && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                <div><strong className="block mb-0.5">Special Request:</strong>{booking.specialRequests}</div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column — Price Summary + Action Panel */}
        <div className="space-y-6">
          {/* Price Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              Price Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">HK${booking.subtotal.toLocaleString()}</span>
              </div>
              {booking.agencyDiscount > 0 && (
                <div className="flex justify-between text-sm text-purple-600">
                  <span>Agency Discount</span>
                  <span>−HK${booking.agencyDiscount.toLocaleString()}</span>
                </div>
              )}
              {booking.membershipDiscount > 0 && (
                <div className="flex justify-between text-sm text-indigo-600">
                  <span>{booking.membershipTier} Discount</span>
                  <span>−HK${booking.membershipDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Service Charge (10%)</span>
                <span>+HK${booking.serviceCharge.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total Payable</span>
                <span className="font-bold text-[#0f2942] text-xl">HK${booking.totalAmount.toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1" style={{ marginBottom: '10px' }}>Payment Mode</p>
                <Badge className={`text-sm ${paymentModeBadgeClass(booking.paymentMode)}`}>
                  {booking.paymentMode}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Action Panel */}
          <Card className="p-6 sticky top-6">
            <h2 className="text-lg font-medium mb-1">Supervisor Actions</h2>
            <p className="text-xs text-gray-500 mb-4">
              {staffApproved
                ? 'Endorse or override the staff\'s approval of this booking.'
                : 'Endorse the rejection, override to approve, or request revision.'}
            </p>

            {/* VIEW MODE */}
            {reviewMode === 'view' && (
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-11"
                  onClick={() => setReviewMode('approve')}
                >
                  <CheckCircle className="w-4 h-4" />
                  {staffApproved ? 'Approve Staff Decision' : 'Endorse Rejection'}
                </Button>
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2 h-11"
                  onClick={() => setReviewMode('revision')}
                >
                  <RefreshCcw className="w-4 h-4" /> Request Revision
                </Button>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 h-11"
                  onClick={() => setReviewMode('reject')}
                >
                  <XCircle className="w-4 h-4" />
                  {staffApproved ? 'Override & Reject' : 'Override & Approve'}
                </Button>
              </div>
            )}

            {/* APPROVE MODE */}
            {reviewMode === 'approve' && (
              <div className="space-y-4">
                <div className={`flex items-start gap-2 p-3 rounded text-sm border ${staffApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  <MailCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {staffApproved
                      ? 'Approving will finalise this booking. The guest will be notified.'
                      : 'Endorsing the rejection will close this booking request. The guest will be notified.'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>
                    Supervisor Note <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    rows={3}
                    placeholder="Add an optional note for the record…"
                    value={supervisorNote}
                    onChange={e => setSupervisorNote(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-11"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {staffApproved ? 'Confirm Approval' : 'Confirm Endorsement'}
                  </Button>
                  <Button variant="outline" className="w-full h-10" onClick={() => setReviewMode('view')}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* REVISION MODE */}
            {reviewMode === 'revision' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>
                    Revision Reason <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {REVISION_REASONS.map(reason => (
                      <label key={reason} className="flex items-start gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="revisionReason"
                          value={reason}
                          checked={selectedRevisionReason === reason}
                          onChange={() => setSelectedRevisionReason(reason)}
                          className="accent-amber-500 mt-0.5"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                  {selectedRevisionReason === 'Other (specify below)' && (
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 text-sm mt-2"
                      rows={3}
                      placeholder="Describe the required revision…"
                      value={customRevisionReason}
                      onChange={e => setCustomRevisionReason(e.target.value)}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                  <RefreshCcw className="w-4 h-4 flex-shrink-0" />
                  <span>Staff will be asked to revise and resubmit this invoice.</span>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2 h-11"
                    disabled={!revisionValid}
                    onClick={handleRevision}
                  >
                    <RefreshCcw className="w-4 h-4" /> Submit Revision Request
                  </Button>
                  <Button variant="outline" className="w-full h-10" onClick={() => setReviewMode('view')}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* REJECT / OVERRIDE MODE */}
            {reviewMode === 'reject' && (
              <div className="space-y-4">
                {staffApproved && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                    <span>You are <strong>overriding</strong> the staff's approval. This will reject the booking.</span>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>
                    {staffApproved ? 'Override Reason' : 'Rejection Reason'} <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {REJECTION_REASONS.map(reason => (
                      <label key={reason} className="flex items-start gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="rejectionReason"
                          value={reason}
                          checked={selectedRejectionReason === reason}
                          onChange={() => setSelectedRejectionReason(reason)}
                          className="accent-red-500 mt-0.5"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                  {selectedRejectionReason === 'Other (specify below)' && (
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 text-sm mt-2"
                      rows={3}
                      placeholder="Describe the rejection reason…"
                      value={customRejectionReason}
                      onChange={e => setCustomRejectionReason(e.target.value)}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 h-11"
                    disabled={!rejectionValid}
                    onClick={handleReject}
                  >
                    <XCircle className="w-4 h-4" />
                    {staffApproved ? 'Confirm Override & Reject' : 'Confirm Rejection'}
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
    </div>
  );
}