import { useState } from 'react';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Plane, Car, ShoppingBag,
  Clock, Building2, User, BadgePercent, MailCheck, Info, FileEdit
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

// Mock data - in real app, this would fetch from API
const MOCK_BOOKINGS = [
  {
    id: 1,
    bookingNo: 'A-202603-000001',
    requestType: 'New Booking Request' as const,
    guestName: 'James Hoffmann',
    accountNo: 'ACC-2026-1001',
    accountType: 'Individual' as const,
    membershipTier: 'Gold' as const,
    suite: 'Premier Suite A',
    dateTime: '2026-03-06 08:30',
    flightNo: 'CX113',
    flightTime: '11:45',
    flightOrigin: 'LHR',
    flightDestination: 'HKG',
    flightType: 'Arrival' as const,
    numberOfGuests: 2,
    nonFlyingGuests: 1,
    hasLimousine: false,
    hasShopping: false,
    isAdHoc: false,
    paymentMode: 'Upfront' as const,
    amount: 'HK$3,357',
    bookingType: 'Online' as const,
    submittedAt: '2026-02-24 09:12',
    specialRequests: 'Guest requires wheelchair assistance',
  },
  {
    id: 3,
    bookingNo: 'A-202603-000003',
    requestType: 'Edit Booking Request' as const,
    guestName: 'William Leung',
    accountNo: 'ACC-2026-1003',
    accountType: 'Agency' as const,
    agencyName: 'Wings Travel Agency',
    agencyDiscountRate: 15,
    suite: 'Lounge Deluxe',
    dateTime: '2026-03-08 10:30',
    flightNo: 'NH139',
    flightTime: '13:45',
    flightOrigin: 'SIN',
    flightDestination: 'HKG',
    flightType: 'Arrival' as const,
    numberOfGuests: 4,
    nonFlyingGuests: 0,
    hasLimousine: true,
    hasShopping: true,
    isAdHoc: false,
    paymentMode: 'Bulk Purchase/Monthly Invoice' as const,
    amount: 'HK$4,487',
    originalAmountValue: 5279,
    finalAmountValue: 4487,
    bookingType: 'Online' as const,
    submittedAt: '2026-02-24 14:05',
    specialRequests: 'Kosher meal required',
    originalData: {
      suite: 'Premier Suite B',
      dateTime: '2026-03-08 09:00',
      flightNo: 'NH189',
      flightTime: '11:30',
      flightOrigin: 'NRT',
      flightDestination: 'HKG',
      flightType: 'Arrival' as const,
      numberOfGuests: 4,
      nonFlyingGuests: 1,
      hasLimousine: false,
      hasShopping: false,
      specialRequests: 'Previous request: Guest requires early check-in',
    },
  },
];

const REJECTION_REASONS = [
  'Suite not available for requested time slot',
  'Insufficient credit balance',
  'Booking submitted within cut-off period',
  'Incomplete passenger information',
  'Suspicious or duplicate booking detected',
  'Other (specify below)',
];

const accountTypeBadgeClass = (type: string) => {
  if (type === 'Individual') return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
  if (type === 'Corporate') return 'bg-blue-100 text-blue-800 border border-blue-200';
  if (type === 'Agency') return 'bg-purple-100 text-purple-800 border border-purple-200';
  return 'bg-gray-100 text-gray-700';
};

const membershipBadgeClass = (tier?: string) => {
  if (tier === 'Sapphire') return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
  if (tier === 'Diamond') return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
  if (tier === 'Platinum') return 'bg-slate-100 text-slate-700 border border-slate-200';
  if (tier === 'Gold') return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  return '';
};

const paymentModeBadgeClass = (mode: string) => {
  if (mode === 'Upfront') return 'bg-green-100 text-green-700';
  if (mode === 'Net Upfront') return 'bg-teal-100 text-teal-700';
  if (mode === 'On-Credit') return 'bg-orange-100 text-orange-700';
  if (mode === 'Bulk Purchase/Monthly Invoice') return 'bg-violet-100 text-violet-700';
  return 'bg-gray-100 text-gray-700';
};

export interface BookingReviewProps {
  bookingId?: number;
  bookings?: typeof MOCK_BOOKINGS;
  onBack?: () => void;
  onApprove?: (bookingId: number) => void;
  onReject?: (bookingId: number, reason: string) => void;
}

export function BookingReview({ bookingId, bookings: bookingsProp, onBack = () => {}, onApprove, onReject }: BookingReviewProps = {}) {
  const allBookings = bookingsProp?.length ? bookingsProp : MOCK_BOOKINGS;
  const booking = allBookings.find(b => b.id === (bookingId ?? 1)) ?? allBookings[0];
  const [reviewMode, setReviewMode] = useState<'view' | 'reject'>('view');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!booking) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="p-12 text-center">
          <p className="text-gray-600">Booking not found</p>
        </Card>
      </div>
    );
  }

  const rejectReasonValid =
    selectedReason !== '' &&
    (selectedReason !== 'Other (specify below)' || customReason.trim().length > 0);

  const handleApprove = () => {
    toast.success(`Booking ${booking.bookingNo} approved`, {
      description: `An approval notification has been sent to ${booking.guestName}.`,
    });
    setTimeout(() => {
      onBack();
      onApprove?.(booking.id);
    }, 1500);
  };

  const handleReject = () => {
    if (!rejectReasonValid) return;
    const reason = selectedReason === 'Other (specify below)' ? customReason.trim() : selectedReason;
    toast.error(`Booking ${booking.bookingNo} rejected`, {
      description: `Rejection reason recorded. Notification sent to ${booking.guestName}.`,
    });
    setTimeout(() => {
      onBack();
      onReject?.(booking.id, reason);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Approvals
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl">Review Booking Request</h1>
              <Badge className={`text-sm ${
                booking.requestType === 'New Booking Request'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-orange-100 text-orange-700 border border-orange-200'
              }`}>
                {booking.requestType === 'New Booking Request' ? 'New Booking' : 'Edit Request'}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">Booking No: {booking.bookingNo}</p>
          </div>
        </div>
      </div>

      {/* Edit Booking Request - Show Original vs Changed */}
      {booking.requestType === 'Edit Booking Request' && booking.originalData && reviewMode === 'view' && (
        <Card className="p-6 bg-blue-50 border-2 border-blue-300">
          <div className="flex items-center gap-2 mb-4">
            <FileEdit className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-medium text-blue-900">Changes Requested</h2>
          </div>
          <div className="grid grid-cols-2 gap-8">
            {/* Left: Original */}
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-200 font-medium">
                Original
              </p>
              <div className="space-y-3">
                {booking.originalData.suite && booking.originalData.suite !== booking.suite && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Suite</span>
                    <span className="line-through text-red-600 font-medium">{booking.originalData.suite}</span>
                  </div>
                )}
                {booking.originalData.dateTime && booking.originalData.dateTime !== booking.dateTime && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Visit Date/Time</span>
                    <span className="line-through text-red-600 font-medium">{booking.originalData.dateTime}</span>
                  </div>
                )}
                {booking.originalData.flightNo && booking.originalData.flightNo !== booking.flightNo && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Flight No.</span>
                    <span className="line-through text-red-600 font-medium">{booking.originalData.flightNo}</span>
                  </div>
                )}
                {booking.originalData.flightTime && booking.originalData.flightTime !== booking.flightTime && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Flight Time</span>
                    <span className="line-through text-red-600 font-medium">{booking.originalData.flightTime}</span>
                  </div>
                )}
                {booking.originalData.numberOfGuests !== undefined && booking.originalData.numberOfGuests !== booking.numberOfGuests && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Number of Guests</span>
                    <span className="line-through text-red-600 font-medium">{booking.originalData.numberOfGuests} pax</span>
                  </div>
                )}
                {booking.originalData.nonFlyingGuests !== undefined && booking.originalData.nonFlyingGuests !== booking.nonFlyingGuests && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Non-flying Guests</span>
                    <span className="line-through text-red-600 font-medium">{booking.originalData.nonFlyingGuests}</span>
                  </div>
                )}
                {booking.originalData.hasLimousine !== undefined && booking.originalData.hasLimousine !== booking.hasLimousine && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Limousine Service</span>
                    <span className="line-through text-red-600 font-medium">{booking.originalData.hasLimousine ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {booking.originalData.hasShopping !== undefined && booking.originalData.hasShopping !== booking.hasShopping && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Shopping Service</span>
                    <span className="line-through text-red-600 font-medium">{booking.originalData.hasShopping ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {booking.originalData.specialRequests !== booking.specialRequests && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Special Request</span>
                    <span className="line-through text-red-600 text-sm">{booking.originalData.specialRequests || '(none)'}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Right: Changed */}
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-200 font-medium">
                Changed To
              </p>
              <div className="space-y-3">
                {booking.originalData.suite && booking.originalData.suite !== booking.suite && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Suite</span>
                    <span className="text-green-700 font-bold text-lg">{booking.suite}</span>
                  </div>
                )}
                {booking.originalData.dateTime && booking.originalData.dateTime !== booking.dateTime && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Visit Date/Time</span>
                    <span className="text-green-700 font-bold text-lg">{booking.dateTime}</span>
                  </div>
                )}
                {booking.originalData.flightNo && booking.originalData.flightNo !== booking.flightNo && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Flight No.</span>
                    <span className="text-green-700 font-bold text-lg">{booking.flightNo}</span>
                  </div>
                )}
                {booking.originalData.flightTime && booking.originalData.flightTime !== booking.flightTime && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Flight Time</span>
                    <span className="text-green-700 font-bold text-lg">{booking.flightTime}</span>
                  </div>
                )}
                {booking.originalData.numberOfGuests !== undefined && booking.originalData.numberOfGuests !== booking.numberOfGuests && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Number of Guests</span>
                    <span className="text-green-700 font-bold text-lg">{booking.numberOfGuests} pax</span>
                  </div>
                )}
                {booking.originalData.nonFlyingGuests !== undefined && booking.originalData.nonFlyingGuests !== booking.nonFlyingGuests && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Non-flying Guests</span>
                    <span className="text-green-700 font-bold text-lg">{booking.nonFlyingGuests}</span>
                  </div>
                )}
                {booking.originalData.hasLimousine !== undefined && booking.originalData.hasLimousine !== booking.hasLimousine && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Limousine Service</span>
                    <span className="text-green-700 font-bold text-lg">{booking.hasLimousine ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {booking.originalData.hasShopping !== undefined && booking.originalData.hasShopping !== booking.hasShopping && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Shopping Service</span>
                    <span className="text-green-700 font-bold text-lg">{booking.hasShopping ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {booking.originalData.specialRequests !== booking.specialRequests && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Special Request</span>
                    <span className="text-green-700 font-bold">{booking.specialRequests || '(none)'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Booking Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest & Account Information */}
        <Card className="p-6">
          <h3 className="text-sm uppercase text-gray-500 tracking-wide mb-4 font-medium">Guest & Account</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Guest Name</p>
              <p className="font-medium">{booking.guestName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Account No.</p>
              <p className="font-mono text-sm">{booking.accountNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Account Type</p>
              <Badge className={accountTypeBadgeClass(booking.accountType)}>
                {booking.accountType}
              </Badge>
            </div>
            {booking.membershipTier && (
              <div>
                <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Membership Tier</p>
                <Badge className={membershipBadgeClass(booking.membershipTier)}>
                  {booking.membershipTier}
                </Badge>
              </div>
            )}
            {booking.agencyName && (
              <div>
                <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Travel Agency</p>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>{booking.agencyName}</span>
                </div>
                {booking.agencyDiscountRate && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs mt-1">
                    <BadgePercent className="w-3 h-3" />{booking.agencyDiscountRate}% discount
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Booking Information */}
        <Card className="p-6">
          <h3 className="text-sm uppercase text-gray-500 tracking-wide mb-4 font-medium">Booking Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Suite</p>
              <p className="font-medium">{booking.suite}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Visit Date & Time</p>
              <p className="font-medium">{booking.dateTime}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Flight Details</p>
              <div className="flex items-center gap-2">
                <Plane className={`w-4 h-4 text-gray-400 ${booking.flightType === 'Arrival' ? 'rotate-[-45deg]' : 'rotate-45'}`} />
                <span className="font-medium">{booking.flightNo}</span>
                <span className="text-gray-500">at {booking.flightTime}</span>
              </div>
              {(booking.flightOrigin || booking.flightDestination) && (
                <p className="text-sm text-gray-500 mt-1">
                  {booking.flightOrigin || '—'} → {booking.flightDestination || '—'}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Total Guests</p>
              <p className="font-medium">
                {booking.numberOfGuests} pax
                {booking.nonFlyingGuests > 0 && (
                  <span className="text-gray-500 ml-2">({booking.nonFlyingGuests} non-flying)</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Additional Services</p>
              <div className="flex gap-2">
                {booking.hasLimousine && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs">
                    <Car className="w-3 h-3" />
                    Limousine
                  </span>
                )}
                {booking.hasShopping && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                    <ShoppingBag className="w-3 h-3" />
                    Shopping
                  </span>
                )}
                {!booking.hasLimousine && !booking.hasShopping && (
                  <span className="text-gray-400 text-sm">None</span>
                )}
              </div>
            </div>
            {booking.isAdHoc && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mt-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">This is an <strong>ad-hoc booking</strong> submitted within the cut-off period.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Payment & Notes */}
        <Card className="p-6">
          <h3 className="text-sm uppercase text-gray-500 tracking-wide mb-4 font-medium">Payment & Notes</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Payment Mode</p>
              <Badge className={paymentModeBadgeClass(booking.paymentMode)}>
                {booking.paymentMode}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Amount</p>
              {booking.agencyDiscountRate && booking.originalAmountValue ? (
                <div className="space-y-1">
                  <p className="text-gray-400 line-through text-sm">HK${booking.originalAmountValue.toLocaleString()}</p>
                  <p className="text-2xl font-bold text-green-700">{booking.amount}</p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-green-700">{booking.amount}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Booking Type</p>
              <p>{booking.bookingType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500" style={{ marginBottom: 10 }}>Submitted At</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{booking.submittedAt}</span>
              </div>
            </div>
            {booking.specialRequests && reviewMode === 'view' && (
              <div className="flex items-start gap-2 text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Special Request</p>
                  <p className="text-sm">{booking.specialRequests}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Rejection Reason Section */}
      {reviewMode === 'reject' && (
        <Card className="p-6 bg-red-50 border-2 border-red-200">
          <h3 className="text-lg font-medium text-red-900 mb-4">Rejection Reason</h3>
          <div className="space-y-3">
            <label className="text-sm text-gray-700" style={{ marginBottom: 10, display: 'block' }}>
              Please select a reason for rejecting this booking <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REJECTION_REASONS.map(reason => (
                <label key={reason} className="flex items-center gap-2 cursor-pointer text-sm p-2 hover:bg-white rounded">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-red-500"
                  />
                  {reason}
                </label>
              ))}
            </div>
            {selectedReason === 'Other (specify below)' && (
              <textarea
                className="w-full border border-gray-300 rounded-md p-3 text-sm mt-2"
                rows={4}
                placeholder="Please describe the rejection reason…"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
              />
            )}
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800 mt-4">
              <MailCheck className="w-5 h-5 flex-shrink-0" />
              The guest will be notified of this rejection and the reason via email.
            </div>
          </div>
        </Card>
      )}

      {/* Email Notification Info */}
      {reviewMode === 'view' && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <MailCheck className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              An email notification will be sent to <strong>{booking.guestName}</strong> automatically after approval or rejection.
            </p>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="p-6">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBack} size="lg">
            Cancel
          </Button>
          {reviewMode === 'view' && (
            <>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white gap-2"
                size="lg"
                onClick={() => setReviewMode('reject')}
              >
                <XCircle className="w-5 h-5" />
                Reject Booking
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                size="lg"
                onClick={handleApprove}
              >
                <CheckCircle className="w-5 h-5" />
                Approve Booking
              </Button>
            </>
          )}
          {reviewMode === 'reject' && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setReviewMode('view');
                  setSelectedReason('');
                  setCustomReason('');
                }}
              >
                Back to Review
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white gap-2"
                size="lg"
                disabled={!rejectReasonValid}
                onClick={handleReject}
              >
                <XCircle className="w-5 h-5" />
                Confirm Rejection
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}