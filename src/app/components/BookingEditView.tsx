/**
 * BookingEditView.tsx
 *
 * New view per refactor spec (item 21).
 * Pure presentational form — zero internal business state for form data.
 * CI4 container passes initialData; empty falls back to MOCK_BOOKING_FORM.
 */

import { useState } from 'react';
import {
  ArrowLeft, Save, X, Calendar, Plane, User, Building2,
  Car, ShoppingBag, Accessibility, Clock, AlertCircle,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './ui/select';

// ── Types ─────────────────────────────────────────────────────────────────────

export type EditFlightType   = 'Arrival' | 'Departure';
export type EditFlightClass  = 'Economy Class' | 'Business Class' | 'First Class';
export type EditPaymentMode  = 'Upfront' | 'Net Upfront' | 'On-Credit' | 'Bulk Purchase/Monthly Invoice';
export type EditAccountType  = 'Individual' | 'Corporate' | 'Agency';

export interface BookingFormData {
  bookingNo: string;
  accountType: EditAccountType;
  accountNo: string;
  guestName: string;
  companyName?: string;
  agencyName?: string;
  flightType: EditFlightType;
  flightNo: string;
  flightTime: string;
  flightOrigin?: string;
  flightDestination?: string;
  flightClass?: EditFlightClass;
  visitDate: string;
  visitTime: string;
  suite: string;
  numberOfGuests: number;
  nonFlyingGuests: number;
  hasLimousine: boolean;
  hasShopping: boolean;
  hasWheelchair: boolean;
  paymentMode: EditPaymentMode;
  specialRequests?: string;
}

// ── MOCK default form data ────────────────────────────────────────────────────

const MOCK_BOOKING_FORM: BookingFormData = {
  bookingNo:        'A-202604-000001',
  accountType:      'Individual',
  accountNo:        'ACC-2026-0101',
  guestName:        'James Hoffmann',
  flightType:       'Departure',
  flightNo:         'CX234',
  flightTime:       '12:30',
  flightOrigin:     'HKG',
  flightDestination: 'NRT',
  flightClass:      'Business Class',
  visitDate:        '2026-04-15',
  visitTime:        '09:00',
  suite:            'Premier Suite A',
  numberOfGuests:   2,
  nonFlyingGuests:  0,
  hasLimousine:     true,
  hasShopping:      false,
  hasWheelchair:    false,
  paymentMode:      'Upfront',
  specialRequests:  '',
};

const SUITE_OPTIONS = [
  'VIP Suite A', 'VIP Suite B', 'Executive Suite',
  'Business Suite', 'Premier Suite A', 'Premier Suite B',
  'Lounge Deluxe', 'Open Lounge',
];

// ── Props interface ───────────────────────────────────────────────────────────

export interface BookingEditProps {
  bookingId?: string;
  /** Pass fully-loaded booking from CI4; when null falls back to MOCK_BOOKING_FORM for demo */
  initialData?: BookingFormData | null;
  onSave?: (data: BookingFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BookingEdit({
  bookingId,
  initialData,
  onSave      = () => {},
  onCancel    = () => {},
  isSubmitting = false,
}: BookingEditProps) {
  const seed = initialData ?? MOCK_BOOKING_FORM;

  // Local form state — all form values live here in demo mode;
  // in real mode the CI4 container should manage these via props + handlers.
  const [flightType,    setFlightType]    = useState<EditFlightType>(seed.flightType);
  const [flightNo,      setFlightNo]      = useState(seed.flightNo);
  const [flightTime,    setFlightTime]    = useState(seed.flightTime);
  const [flightOrigin,  setFlightOrigin]  = useState(seed.flightOrigin ?? '');
  const [flightDest,    setFlightDest]    = useState(seed.flightDestination ?? '');
  const [flightClass,   setFlightClass]   = useState<EditFlightClass | ''>(seed.flightClass ?? '');
  const [visitDate,     setVisitDate]     = useState(seed.visitDate);
  const [visitTime,     setVisitTime]     = useState(seed.visitTime);
  const [suite,         setSuite]         = useState(seed.suite);
  const [numGuests,     setNumGuests]     = useState(seed.numberOfGuests);
  const [nonFlying,     setNonFlying]     = useState(seed.nonFlyingGuests);
  const [hasLimo,       setHasLimo]       = useState(seed.hasLimousine);
  const [hasShopping,   setHasShopping]   = useState(seed.hasShopping);
  const [hasWheelchair, setHasWheelchair] = useState(seed.hasWheelchair);
  const [paymentMode,   setPaymentMode]   = useState<EditPaymentMode>(seed.paymentMode);
  const [specialReqs,   setSpecialReqs]   = useState(seed.specialRequests ?? '');

  const handleSave = () => {
    onSave({
      ...seed,
      flightType, flightNo, flightTime,
      flightOrigin, flightDestination: flightDest,
      flightClass: flightClass || undefined,
      visitDate, visitTime, suite,
      numberOfGuests: numGuests, nonFlyingGuests: nonFlying,
      hasLimousine: hasLimo, hasShopping, hasWheelchair,
      paymentMode, specialRequests: specialReqs,
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="flex items-center gap-2">
              Edit Booking
              {bookingId && (
                <Badge className="bg-blue-100 text-blue-700 text-sm ml-1">{seed.bookingNo}</Badge>
              )}
            </h1>
            <p className="text-gray-500 mt-0.5">Modify booking details below. Changes will be saved after confirming.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-1.5" /> Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Account info (read-only — can't be edited in this view) */}
      <Card className="p-5">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Account Information
          <span className="normal-case text-xs text-gray-400 ml-1">(read-only)</span>
        </h3>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block text-gray-500 mb-[10px]">Account No.</label>
            <p className="font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded border">{seed.accountNo}</p>
          </div>
          <div>
            <label className="block text-gray-500 mb-[10px]">Guest Name</label>
            <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded border">{seed.guestName}</p>
          </div>
          <div>
            <label className="block text-gray-500 mb-[10px]">Account Type</label>
            <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded border">{seed.accountType}</p>
          </div>
          {seed.companyName && (
            <div>
              <label className="block text-gray-500 mb-[10px]">Company</label>
              <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded border flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />{seed.companyName}
              </p>
            </div>
          )}
          {seed.agencyName && (
            <div>
              <label className="block text-gray-500 mb-[10px]">Travel Agency</label>
              <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded border">{seed.agencyName}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Flight information */}
      <Card className="p-5">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
          <Plane className="w-4 h-4" /> Flight Information
        </h3>
        <div className="grid grid-cols-3 gap-6">

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">Flight Type</label>
            <Select value={flightType} onValueChange={v => setFlightType(v as EditFlightType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Departure">Departure</SelectItem>
                <SelectItem value="Arrival">Arrival</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">Flight Number</label>
            <input
              id="edit-flight-no"
              type="text"
              value={flightNo}
              onChange={e => setFlightNo(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm uppercase"
              placeholder="e.g. CX234"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">Flight Time</label>
            <input
              type="time"
              value={flightTime}
              onChange={e => setFlightTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">
              {flightType === 'Departure' ? 'Origin' : 'Destination (HKG)'}
            </label>
            <input
              type="text"
              value={flightType === 'Departure' ? flightOrigin : 'HKG'}
              onChange={e => flightType === 'Departure' ? setFlightOrigin(e.target.value.toUpperCase()) : undefined}
              readOnly={flightType === 'Arrival'}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm uppercase"
              placeholder="e.g. LHR"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">
              {flightType === 'Departure' ? 'Destination' : 'Origin'}
            </label>
            <input
              type="text"
              value={flightType === 'Departure' ? flightDest : flightOrigin}
              onChange={e => flightType === 'Departure' ? setFlightDest(e.target.value.toUpperCase()) : setFlightOrigin(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm uppercase"
              placeholder="e.g. NRT"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">Flight Class</label>
            <Select value={flightClass} onValueChange={v => setFlightClass(v as EditFlightClass)}>
              <SelectTrigger><SelectValue placeholder="Select class…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Economy Class">Economy Class</SelectItem>
                <SelectItem value="Business Class">Business Class</SelectItem>
                <SelectItem value="First Class">First Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </Card>

      {/* Booking details */}
      <Card className="p-5">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Booking Details
        </h3>
        <div className="grid grid-cols-3 gap-6">

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">Visit Date</label>
            <input
              id="edit-visit-date"
              type="date"
              value={visitDate}
              onChange={e => setVisitDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">Visit Time</label>
            <input
              type="time"
              value={visitTime}
              onChange={e => setVisitTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">Suite / Venue</label>
            <Select value={suite} onValueChange={setSuite}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUITE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">VIP Passengers</label>
            <input
              id="edit-guests"
              type="number"
              min={1}
              value={numGuests}
              onChange={e => setNumGuests(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">Non-Flying Guests</label>
            <input
              type="number"
              min={0}
              value={nonFlying}
              onChange={e => setNonFlying(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-[10px]">Payment Mode</label>
            <Select value={paymentMode} onValueChange={v => setPaymentMode(v as EditPaymentMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Upfront">Upfront</SelectItem>
                <SelectItem value="Net Upfront">Net Upfront</SelectItem>
                <SelectItem value="On-Credit">On-Credit</SelectItem>
                <SelectItem value="Bulk Purchase/Monthly Invoice">Bulk Purchase / Monthly Invoice</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </Card>

      {/* Add-on services */}
      <Card className="p-5">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Add-on Services
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'limo',       label: 'Limousine Transfer',     icon: <Car className="w-4 h-4" />,          active: hasLimo,       toggle: () => setHasLimo(p => !p) },
            { key: 'shopping',   label: 'In-lounge Shopping',     icon: <ShoppingBag className="w-4 h-4" />,  active: hasShopping,   toggle: () => setHasShopping(p => !p) },
            { key: 'wheelchair', label: 'Wheelchair Assistance',  icon: <Accessibility className="w-4 h-4" />, active: hasWheelchair, toggle: () => setHasWheelchair(p => !p) },
          ].map(svc => (
            <button
              key={svc.key}
              onClick={svc.toggle}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                svc.active
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${svc.active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {svc.icon}
              </div>
              <span className="text-sm">{svc.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Special requests */}
      <Card className="p-5">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Special Requests
        </h3>
        <div>
          <label className="block text-sm text-gray-600 mb-[10px]">Notes for lounge staff</label>
          <textarea
            rows={4}
            value={specialReqs}
            onChange={e => setSpecialReqs(e.target.value)}
            placeholder="e.g. Birthday celebration, kosher meal required, guest requires extra privacy…"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
          />
        </div>
      </Card>

      {/* Bottom action bar */}
      <div className="flex justify-end gap-3 pb-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="w-4 h-4 mr-1.5" /> Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

    </div>
  );
}
