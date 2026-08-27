import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plane,
  Users,
  Clock,
  X,
  Info,
  CreditCard,
  Building2,
  ExternalLink,
  QrCode,
  ShoppingCart,
} from 'lucide-react';
import { QREntryScanner } from './QREntryScanner';
import { getPreOrder } from './preOrderStore';

// ── Constants ────────────────────────────────────────────────────────────────
const VENUES = [
  'VIP Suite A',
  'VIP Suite B',
  'Executive Suite 1',
  'Executive Suite 2',
  'Business Suite 1',
  'Business Suite 2',
  'Business Suite 3',
  'Premier Suite',
  'Family Suite',
  'Lounge Table 1',
  'Lounge Table 2',
  'Lounge Table 3',
  'Lounge Table 4',
  'Lounge Table 5',
];

const START_HOUR    = 5;   // 05:00
const END_HOUR      = 23;  // 23:00
const TOTAL_HOURS   = END_HOUR - START_HOUR;
const HOUR_HEIGHT   = 72;  // px per hour slot
const VENUE_WIDTH   = 172; // px per venue column
const TIME_WIDTH    = 72;  // px for time label column
const TOTAL_HEIGHT  = TOTAL_HOURS * HOUR_HEIGHT;

const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeToMins(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function getTopPx(time: string) {
  return Math.max(0, ((timeToMins(time) - START_HOUR * 60) / 60) * HOUR_HEIGHT);
}
function getHeightPx(start: string, end: string) {
  return Math.max(HOUR_HEIGHT * 0.4, ((timeToMins(end) - timeToMins(start)) / 60) * HOUR_HEIGHT - 3);
}
function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}
function todayISO() {
  return '2026-03-07'; // system date for this demo
}

// ── Types ────────────────────────────────────────────────────────────────────
type BookingStatus =
  | 'Confirmed'
  | 'Approved'
  | 'Pending for Approval'
  | 'Pending for Review'
  | 'Cancelled'
  | 'Rejected'
  | 'No-show';

interface ScheduleBooking {
  id: number;
  bookingNo: string;
  guestName: string;
  accountNo: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  flightNo: string;
  flightTime: string;
  numberOfGuests: number;
  status: BookingStatus;
  accountType: 'Individual' | 'Corporate' | 'Agency';
  paymentMode: 'Upfront' | 'On-Credit';
  amount: string;
}

// ── Status styling ────────────────────────────────────────────────────────────
const STATUS_BLOCK: Record<BookingStatus, string> = {
  'Confirmed':           'bg-emerald-500 border-emerald-600 text-white',
  'Approved':            'bg-blue-500   border-blue-600   text-white',
  'Pending for Approval':'bg-amber-400  border-amber-500  text-white',
  'Pending for Review':  'bg-orange-400 border-orange-500 text-white',
  'Cancelled':           'bg-gray-400   border-gray-500   text-white',
  'Rejected':            'bg-red-500    border-red-600    text-white',
  'No-show':             'bg-red-300    border-red-400    text-white',
};
const STATUS_BADGE: Record<BookingStatus, string> = {
  'Confirmed':           'bg-emerald-100 text-emerald-800 border border-emerald-200',
  'Approved':            'bg-blue-100   text-blue-800   border border-blue-200',
  'Pending for Approval':'bg-amber-100  text-amber-800  border border-amber-200',
  'Pending for Review':  'bg-orange-100 text-orange-800 border border-orange-200',
  'Cancelled':           'bg-gray-100   text-gray-800   border border-gray-200',
  'Rejected':            'bg-red-100    text-red-800    border border-red-200',
  'No-show':             'bg-rose-100   text-rose-800   border border-rose-200',
};

// ── Mock Data ─────────────────────────────────────────────────────────────────
const ALL_BOOKINGS: ScheduleBooking[] = [
  // ─── 2026-03-07 ───────────────────────────────────────────────────────────
  { id:1,  bookingNo:'A-202603-000001', guestName:'John Smith',        accountNo:'ACC-2024-0001', venue:'VIP Suite A',       date:'2026-03-07', startTime:'06:00', endTime:'09:30', flightNo:'CX888', flightTime:'10:30', numberOfGuests:2, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$4,800' },
  { id:2,  bookingNo:'A-202603-000002', guestName:'Mary Johnson',      accountNo:'ACC-2024-0002', venue:'VIP Suite B',       date:'2026-03-07', startTime:'07:30', endTime:'11:00', flightNo:'BA031', flightTime:'12:00', numberOfGuests:1, status:'Confirmed',           accountType:'Corporate',     paymentMode:'On-Credit', amount:'HK$5,200' },
  { id:3,  bookingNo:'A-202603-000003', guestName:'David Lee',         accountNo:'ACC-2023-0015', venue:'Executive Suite 1', date:'2026-03-07', startTime:'08:00', endTime:'10:30', flightNo:'CX270', flightTime:'11:30', numberOfGuests:2, status:'Approved',            accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$3,600' },
  { id:4,  bookingNo:'A-202603-000004', guestName:'Zhang Corp Ltd',    accountNo:'ACC-2024-0088', venue:'Executive Suite 2', date:'2026-03-07', startTime:'09:00', endTime:'12:00', flightNo:'CX830', flightTime:'13:15', numberOfGuests:4, status:'Confirmed',           accountType:'Corporate',     paymentMode:'On-Credit', amount:'HK$6,400' },
  { id:5,  bookingNo:'A-202603-000005', guestName:'Sarah Chen',        accountNo:'ACC-2023-0042', venue:'Business Suite 1',  date:'2026-03-07', startTime:'10:00', endTime:'13:00', flightNo:'NH801', flightTime:'14:30', numberOfGuests:1, status:'Pending for Approval', accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$2,800' },
  { id:6,  bookingNo:'A-202603-000006', guestName:'Robert Wang',       accountNo:'TA-WG-001',     venue:'Business Suite 2',  date:'2026-03-07', startTime:'11:30', endTime:'14:30', flightNo:'SQ801', flightTime:'15:45', numberOfGuests:3, status:'Confirmed',           accountType:'Agency', paymentMode:'On-Credit', amount:'HK$4,420' },
  { id:7,  bookingNo:'A-202603-000007', guestName:'Emma Wilson',       accountNo:'ACC-2024-0103', venue:'Business Suite 3',  date:'2026-03-07', startTime:'13:00', endTime:'15:30', flightNo:'QF29',  flightTime:'17:00', numberOfGuests:2, status:'Approved',            accountType:'Corporate',     paymentMode:'Upfront',   amount:'HK$3,200' },
  { id:8,  bookingNo:'A-202603-000008', guestName:'Chen Family',       accountNo:'ACC-2023-0077', venue:'Family Suite',      date:'2026-03-07', startTime:'14:00', endTime:'17:00', flightNo:'CX872', flightTime:'18:30', numberOfGuests:5, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$7,500' },
  { id:9,  bookingNo:'A-202603-000009', guestName:'Michael Brown',     accountNo:'ACC-2024-0055', venue:'Premier Suite',     date:'2026-03-07', startTime:'15:00', endTime:'18:30', flightNo:'EK231', flightTime:'20:00', numberOfGuests:2, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$5,600' },
  { id:10, bookingNo:'A-202603-000010', guestName:'EGL Tours — Grp A', accountNo:'TA-EG-001',     venue:'Lounge Table 1',    date:'2026-03-07', startTime:'06:30', endTime:'10:00', flightNo:'LH797', flightTime:'11:20', numberOfGuests:8, status:'Confirmed',           accountType:'Agency', paymentMode:'On-Credit', amount:'HK$12,480'},
  { id:11, bookingNo:'A-202603-000011', guestName:'Lisa Taylor',       accountNo:'ACC-2024-0021', venue:'VIP Suite A',       date:'2026-03-07', startTime:'11:00', endTime:'14:30', flightNo:'CX251', flightTime:'15:45', numberOfGuests:1, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$4,800' },
  { id:12, bookingNo:'A-202603-000012', guestName:'James Anderson',    accountNo:'ACC-2023-0091', venue:'VIP Suite B',       date:'2026-03-07', startTime:'12:00', endTime:'15:30', flightNo:'NH815', flightTime:'16:45', numberOfGuests:2, status:'Approved',            accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$5,100' },
  { id:13, bookingNo:'A-202603-000013', guestName:'Sophia Martinez',   accountNo:'ACC-2024-0067', venue:'Executive Suite 1', date:'2026-03-07', startTime:'13:00', endTime:'16:00', flightNo:'BA025', flightTime:'17:30', numberOfGuests:1, status:'Confirmed',           accountType:'Corporate',     paymentMode:'On-Credit', amount:'HK$4,200' },
  { id:14, bookingNo:'A-202603-000014', guestName:'Wing On Travel Grp',accountNo:'TA-WO-001',     venue:'Lounge Table 2',    date:'2026-03-07', startTime:'11:00', endTime:'14:00', flightNo:'QF107', flightTime:'15:20', numberOfGuests:6, status:'Confirmed',           accountType:'Agency', paymentMode:'On-Credit', amount:'HK$9,240' },
  { id:15, bookingNo:'A-202603-000015', guestName:'Hong Thai Travel',  accountNo:'TA-HT-001',     venue:'Business Suite 1',  date:'2026-03-07', startTime:'14:30', endTime:'17:30', flightNo:'SQ835', flightTime:'18:55', numberOfGuests:4, status:'Pending for Review',  accountType:'Agency', paymentMode:'On-Credit', amount:'HK$6,300' },
  { id:16, bookingNo:'A-202603-000016', guestName:'Peter Chan',        accountNo:'ACC-2024-0112', venue:'Premier Suite',     date:'2026-03-07', startTime:'19:30', endTime:'21:30', flightNo:'CX841', flightTime:'22:45', numberOfGuests:2, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$5,200' },
  { id:17, bookingNo:'A-202603-000017', guestName:'CTrip HK Group',    accountNo:'TA-CT-001',     venue:'Executive Suite 2', date:'2026-03-07', startTime:'14:00', endTime:'17:00', flightNo:'EK385', flightTime:'18:30', numberOfGuests:3, status:'Confirmed',           accountType:'Agency', paymentMode:'On-Credit', amount:'HK$5,576' },
  { id:18, bookingNo:'A-202603-000018', guestName:'Alice Wong',        accountNo:'ACC-2024-0089', venue:'Business Suite 2',  date:'2026-03-07', startTime:'16:00', endTime:'19:00', flightNo:'CX543', flightTime:'20:15', numberOfGuests:2, status:'Approved',            accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$3,400' },
  { id:19, bookingNo:'A-202603-000019', guestName:'Tom Miller',        accountNo:'ACC-2023-0156', venue:'Family Suite',      date:'2026-03-07', startTime:'18:30', endTime:'21:00', flightNo:'LH798', flightTime:'22:20', numberOfGuests:4, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$6,800' },
  { id:20, bookingNo:'A-202603-000020', guestName:'Jennifer Liu',      accountNo:'ACC-2024-0044', venue:'Business Suite 3',  date:'2026-03-07', startTime:'17:00', endTime:'19:30', flightNo:'NH802', flightTime:'21:00', numberOfGuests:1, status:'Cancelled',           accountType:'Corporate',     paymentMode:'On-Credit', amount:'HK$2,900' },
  { id:21, bookingNo:'A-202603-000021', guestName:'Kevin Park',        accountNo:'ACC-2024-0031', venue:'VIP Suite A',       date:'2026-03-07', startTime:'16:00', endTime:'19:00', flightNo:'SQ811', flightTime:'20:30', numberOfGuests:2, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$5,000' },
  { id:22, bookingNo:'A-202603-000022', guestName:'Grace Tan',         accountNo:'ACC-2023-0203', venue:'VIP Suite B',       date:'2026-03-07', startTime:'17:00', endTime:'20:00', flightNo:'CX839', flightTime:'21:15', numberOfGuests:1, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$4,400' },
  { id:23, bookingNo:'A-202603-000023', guestName:'Daniel Yip',        accountNo:'ACC-2024-0078', venue:'Executive Suite 1', date:'2026-03-07', startTime:'17:30', endTime:'20:30', flightNo:'QF831', flightTime:'21:45', numberOfGuests:2, status:'Approved',            accountType:'Corporate',     paymentMode:'On-Credit', amount:'HK$4,800' },
  { id:24, bookingNo:'A-202603-000024', guestName:'CX Gold Members',   accountNo:'ACC-2024-0099', venue:'Lounge Table 3',    date:'2026-03-07', startTime:'15:00', endTime:'18:30', flightNo:'CX543', flightTime:'19:15', numberOfGuests:10,status:'Confirmed',           accountType:'Individual',    paymentMode:'On-Credit', amount:'HK$14,000'},
  { id:25, bookingNo:'A-202603-000025', guestName:'Patrick Ho',        accountNo:'ACC-2024-0145', venue:'Business Suite 2',  date:'2026-03-07', startTime:'20:00', endTime:'22:30', flightNo:'CX841', flightTime:'23:45', numberOfGuests:2, status:'Pending for Approval', accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$3,600' },
  // ─── 2026-03-08 ───────────────────────────────────────────────────────────
  { id:26, bookingNo:'A-202603-000026', guestName:'Henry Chu',         accountNo:'ACC-2024-0155', venue:'VIP Suite A',       date:'2026-03-08', startTime:'08:00', endTime:'11:00', flightNo:'CX123', flightTime:'12:15', numberOfGuests:2, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$4,800' },
  { id:27, bookingNo:'A-202603-000027', guestName:'Irene Ma',          accountNo:'ACC-2023-0177', venue:'Executive Suite 1', date:'2026-03-08', startTime:'10:00', endTime:'13:30', flightNo:'BA032', flightTime:'14:45', numberOfGuests:1, status:'Approved',            accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$3,800' },
  { id:28, bookingNo:'A-202603-000028', guestName:'Global Corp HK',    accountNo:'ACC-2024-0201', venue:'Business Suite 3',  date:'2026-03-08', startTime:'14:00', endTime:'17:00', flightNo:'EK384', flightTime:'18:20', numberOfGuests:3, status:'Confirmed',           accountType:'Corporate',     paymentMode:'On-Credit', amount:'HK$5,400' },
  { id:29, bookingNo:'A-202603-000029', guestName:'Klook Travel Grp',  accountNo:'TA-KL-001',     venue:'Lounge Table 4',    date:'2026-03-08', startTime:'09:00', endTime:'12:00', flightNo:'SQ801', flightTime:'13:15', numberOfGuests:7, status:'Confirmed',           accountType:'Agency', paymentMode:'On-Credit', amount:'HK$10,584'},
  { id:30, bookingNo:'A-202603-000030', guestName:'Carol Leung',       accountNo:'ACC-2023-0199', venue:'Family Suite',      date:'2026-03-08', startTime:'11:00', endTime:'14:30', flightNo:'NH815', flightTime:'16:00', numberOfGuests:5, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$7,200' },
  { id:31, bookingNo:'A-202603-000031', guestName:'Raymond To',        accountNo:'ACC-2024-0033', venue:'VIP Suite B',       date:'2026-03-08', startTime:'07:00', endTime:'10:30', flightNo:'CX251', flightTime:'11:30', numberOfGuests:2, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$5,200' },
  { id:32, bookingNo:'A-202603-000032', guestName:'Pacific Airlines',  accountNo:'ACC-2024-0088', venue:'Executive Suite 2', date:'2026-03-08', startTime:'13:00', endTime:'16:00', flightNo:'QF29',  flightTime:'17:15', numberOfGuests:2, status:'Approved',            accountType:'Corporate',     paymentMode:'On-Credit', amount:'HK$4,600' },
  // ─── 2026-03-06 (yesterday) ─────────────────────────────────────────────
  { id:33, bookingNo:'A-202603-000033', guestName:'Felix Kwong',       accountNo:'ACC-2024-0033', venue:'VIP Suite B',       date:'2026-03-06', startTime:'09:00', endTime:'12:00', flightNo:'CX251', flightTime:'13:30', numberOfGuests:2, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$4,800' },
  { id:34, bookingNo:'A-202603-000034', guestName:'May Lam',           accountNo:'ACC-2024-0088', venue:'Premier Suite',     date:'2026-03-06', startTime:'13:00', endTime:'16:00', flightNo:'QF29',  flightTime:'17:15', numberOfGuests:2, status:'No-show',             accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$5,400' },
  { id:35, bookingNo:'A-202603-000035', guestName:'Jetour Holidays',   accountNo:'TA-JT-001',     venue:'Lounge Table 5',    date:'2026-03-06', startTime:'10:00', endTime:'14:00', flightNo:'NH801', flightTime:'15:20', numberOfGuests:9, status:'Confirmed',           accountType:'Agency', paymentMode:'On-Credit', amount:'HK$11,970'},
  { id:36, bookingNo:'A-202603-000036', guestName:'William Ho',        accountNo:'ACC-2023-0211', venue:'Executive Suite 1', date:'2026-03-06', startTime:'08:30', endTime:'11:30', flightNo:'CX543', flightTime:'12:45', numberOfGuests:1, status:'Confirmed',           accountType:'Individual',    paymentMode:'Upfront',   amount:'HK$3,200' },
];

const ALL_STATUSES: BookingStatus[] = [
  'Confirmed', 'Approved', 'Pending for Approval',
  'Pending for Review', 'Cancelled', 'Rejected', 'No-show',
];

// ── Component ────────────────────────────────────────────────────────────────
export interface BookingSchedulesProps {
  bookings?: ScheduleBooking[];
  venueTypeFilter?: 'all' | 'suites' | 'tables';
  pageTitle?: string;
  pageSubtitle?: string;
  onViewDetail?: (bookingId: number) => void;
  onPreOrder?: (booking: ScheduleBooking) => void;
}

export function BookingSchedules({
  bookings: bookingsProp,
  onViewDetail,
  onPreOrder,
  venueTypeFilter = 'all',
  pageTitle = 'Booking Schedules',
  pageSubtitle = 'Daily schedule view across all suites and lounge areas',
}: BookingSchedulesProps = {}) {
  const bookings: ScheduleBooking[] = bookingsProp?.length ? bookingsProp : ALL_BOOKINGS;
  const today = todayISO();
  const [selectedDate, setSelectedDate]   = useState(today);
  const [venueFilter, setVenueFilter]     = useState('all');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [typeFilter, setTypeFilter]       = useState<'all' | 'suites' | 'tables'>('all');
  const [activeBooking, setActiveBooking] = useState<ScheduleBooking | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // For the "All" page, venueTypeFilter prop is 'all', so we use the interactive typeFilter state.
  // For Suite/Table pages, the prop controls the pool and typeFilter is ignored.
  const effectiveTypeFilter = venueTypeFilter !== 'all' ? venueTypeFilter : typeFilter;

  // Derive visible venues based on the effective type filter
  const filteredVenuePool = VENUES.filter(v => {
    if (effectiveTypeFilter === 'suites') return !v.startsWith('Lounge');
    if (effectiveTypeFilter === 'tables') return v.startsWith('Lounge');
    return true;
  });

  // close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveBooking(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // filtered venues
  const displayVenues = venueFilter === 'all'
    ? filteredVenuePool
    : filteredVenuePool.filter(v => v === venueFilter);

  // filtered bookings for this date
  const dayBookings = bookings.filter(b => {
    if (b.date !== selectedDate) return false;
    if (!filteredVenuePool.includes(b.venue)) return false;
    if (venueFilter !== 'all' && b.venue !== venueFilter) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  // group by venue for quick lookup
  const byVenue = displayVenues.reduce<Record<string, ScheduleBooking[]>>((acc, v) => {
    acc[v] = dayBookings.filter(b => b.venue === v);
    return acc;
  }, {});

  // ── Summary stats (shared) ────────────────────────────────────────────────
  const total     = dayBookings.length;
  const confirmed = dayBookings.filter(b => b.status === 'Confirmed').length;
  const pending   = dayBookings.filter(b => b.status.startsWith('Pending')).length;
  const other     = total - confirmed - pending;

  // ── Suite-specific stats ──────────────────────────────────────────────────
  const VIP_SUITES       = ['VIP Suite A', 'VIP Suite B'];
  const EXEC_SUITES      = ['Executive Suite 1', 'Executive Suite 2'];
  const vipCount         = dayBookings.filter(b => VIP_SUITES.includes(b.venue)).length;
  const execCount        = dayBookings.filter(b => EXEC_SUITES.includes(b.venue)).length;
  const busOtherCount    = dayBookings.filter(b => !VIP_SUITES.includes(b.venue) && !EXEC_SUITES.includes(b.venue)).length;
  const suitePoolSize    = VENUES.filter(v => !v.startsWith('Lounge')).length; // 9 suites
  const suitesOccupied   = new Set(dayBookings.map(b => b.venue)).size;

  // ── Table-specific stats ──────────────────────────────────────────────────
  const totalPax         = dayBookings.reduce((sum, b) => sum + b.numberOfGuests, 0);
  const travelAgencyCount= dayBookings.filter(b => b.accountType === 'Agency').length;
  const avgGroupSize     = total > 0 ? (totalPax / total).toFixed(1) : '—';

  // current-time indicator (only on today)
  const isToday = selectedDate === today;
  const nowMins = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;
  const nowTopPx = isToday
    ? ((nowMins - START_HOUR * 60) / 60) * HOUR_HEIGHT
    : -1;
  const showNowLine = isToday && nowTopPx >= 0 && nowTopPx <= TOTAL_HEIGHT;

  return (
    <div className="p-6 space-y-5">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1>{pageTitle}</h1>
          <p className="text-gray-600">{pageSubtitle}</p>
        </div>
        <Button
          className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white gap-2"
          onClick={() => setQrScannerOpen(true)}
        >
          <QrCode className="w-4 h-4" />
          Scan QR for Entry
        </Button>
      </div>

      {/* ── Filters row ──────────────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Date navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSelectedDate(d => addDays(d, -1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSelectedDate(d => addDays(d, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            {selectedDate !== today && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-blue-600 border-blue-300 hover:bg-blue-50"
                onClick={() => setSelectedDate(today)}
              >
                Today
              </Button>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {/* Venue type filter — only on All Booking Schedules */}
          {venueTypeFilter === 'all' && (
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v as 'all' | 'suites' | 'tables');
                setVenueFilter('all'); // reset specific venue when type changes
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="suites">Suites</SelectItem>
                <SelectItem value="tables">Tables</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Venue filter */}
          <Select value={venueFilter} onValueChange={setVenueFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All Venues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Venues</SelectItem>
              {filteredVenuePool.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Booking Statuses</SelectItem>
              {ALL_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto text-sm text-gray-500">
            {formatDate(selectedDate)}
          </div>
        </div>
      </Card>

      {/* ── Summary bar ──────────────────────────────────────────────── */}
      {venueTypeFilter === 'all' && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-2xl text-blue-700">{total}</p>
            <p className="text-sm text-blue-600">Total Bookings</p>
          </Card>
          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <p className="text-2xl text-emerald-700">{confirmed}</p>
            <p className="text-sm text-emerald-600">Confirmed</p>
          </Card>
          <Card className="p-4 bg-amber-50 border-amber-200">
            <p className="text-2xl text-amber-700">{pending}</p>
            <p className="text-sm text-amber-600">Pending</p>
          </Card>
          <Card className="p-4 bg-gray-50 border-gray-200">
            <p className="text-2xl text-gray-700">{other}</p>
            <p className="text-sm text-gray-600">Other</p>
          </Card>
        </div>
      )}

      {venueTypeFilter === 'suites' && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-2xl text-blue-700">{total}</p>
            <p className="text-sm text-blue-600">Total Suite Bookings</p>
          </Card>
          <Card className="p-4 bg-violet-50 border-violet-200">
            <p className="text-2xl text-violet-700">{vipCount}</p>
            <p className="text-sm text-violet-600">VIP Suite Bookings</p>
          </Card>
          <Card className="p-4 bg-indigo-50 border-indigo-200">
            <p className="text-2xl text-indigo-700">{execCount}</p>
            <p className="text-sm text-indigo-600">Executive Suite Bookings</p>
          </Card>
          <Card className="p-4 bg-sky-50 border-sky-200">
            <p className="text-2xl text-sky-700">{busOtherCount}</p>
            <p className="text-sm text-sky-600">Business / Other Suites</p>
          </Card>
        </div>
      )}

      {venueTypeFilter === 'tables' && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-2xl text-blue-700">{total}</p>
            <p className="text-sm text-blue-600">Total Table Bookings</p>
          </Card>
          <Card className="p-4 bg-teal-50 border-teal-200">
            <p className="text-2xl text-teal-700">{totalPax}</p>
            <p className="text-sm text-teal-600">Total Pax</p>
          </Card>
          <Card className="p-4 bg-orange-50 border-orange-200">
            <p className="text-2xl text-orange-700">{travelAgencyCount}</p>
            <p className="text-sm text-orange-600">Travel Agency Groups</p>
          </Card>
          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <p className="text-2xl text-emerald-700">{avgGroupSize}</p>
            <p className="text-sm text-emerald-600">Avg. Group Size</p>
          </Card>
        </div>
      )}

      {/* ── Status legend ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 mr-1">Legend:</span>
        {ALL_STATUSES.map(s => (
          <span
            key={s}
            className={`inline-block px-2 py-0.5 rounded text-xs border ${STATUS_BADGE[s]}`}
          >
            {s}
          </span>
        ))}
      </div>

      {/* ── Schedule grid ─────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {total === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            No bookings found for {formatDate(selectedDate)}
            {(venueFilter !== 'all' || statusFilter !== 'all') && ' with selected filters'}.
          </div>
        ) : (
          /* scroll container — both axes */
          <div
            className="overflow-auto"
            style={{ maxHeight: 'calc(100vh - 340px)' }}
          >
            <div style={{ minWidth: TIME_WIDTH + displayVenues.length * VENUE_WIDTH }}>

              {/* ── Sticky header row ───────────────────────────────── */}
              <div className="flex sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
                {/* Corner cell */}
                <div
                  className="flex-shrink-0 sticky left-0 z-30 bg-gray-50 border-r border-gray-200 flex items-center justify-center"
                  style={{ width: TIME_WIDTH, minHeight: 52 }}
                >
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Time</span>
                </div>

                {/* Venue headers */}
                {displayVenues.map(venue => {
                  const count = byVenue[venue]?.length ?? 0;
                  return (
                    <div
                      key={venue}
                      className="flex-shrink-0 border-r border-gray-200 flex flex-col items-center justify-center px-2 py-3 text-center bg-white"
                      style={{ width: VENUE_WIDTH }}
                    >
                      <span className="text-xs text-gray-700 leading-tight">{venue}</span>
                      {count > 0 && (
                        <span className="mt-1 text-xs text-blue-600">{count} booking{count !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Grid body (relative container) ──────────────────── */}
              <div className="flex relative" style={{ height: TOTAL_HEIGHT }}>

                {/* Time label column (sticky left) */}
                <div
                  className="flex-shrink-0 sticky left-0 z-10 bg-white border-r border-gray-200"
                  style={{ width: TIME_WIDTH }}
                >
                  {HOURS.map((hour, idx) => (
                    <div
                      key={hour}
                      className="absolute flex items-start justify-end pr-3 pt-1 w-full"
                      style={{ top: idx * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    >
                      <span className="text-xs text-gray-400 tabular-nums">
                        {String(hour).padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Venue columns */}
                {displayVenues.map(venue => (
                  <div
                    key={venue}
                    className="flex-shrink-0 relative border-r border-gray-100"
                    style={{ width: VENUE_WIDTH, height: TOTAL_HEIGHT }}
                  >
                    {/* Horizontal hour gridlines */}
                    {HOURS.map((hour, idx) => (
                      <div
                        key={`gl-${hour}`}
                        className="absolute w-full pointer-events-none"
                        style={{ top: idx * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                      >
                        <div className="border-t border-gray-100 w-full" />
                        {/* half-hour dashed line */}
                        <div
                          className="border-t border-dashed border-gray-50 w-full"
                          style={{ marginTop: HOUR_HEIGHT / 2 - 1 }}
                        />
                      </div>
                    ))}

                    {/* Current time highlight band (today only) */}
                    {showNowLine && (
                      <div
                        className="absolute left-0 right-0 bg-red-50 opacity-40 pointer-events-none z-[1]"
                        style={{
                          top: Math.max(0, nowTopPx - 4),
                          height: 8,
                        }}
                      />
                    )}

                    {/* Booking blocks */}
                    {(byVenue[venue] ?? []).map(booking => {
                      const topPx    = getTopPx(booking.startTime);
                      const heightPx = getHeightPx(booking.startTime, booking.endTime);
                      const isActive = activeBooking?.id === booking.id;
                      return (
                        <button
                          key={booking.id}
                          onClick={() => setActiveBooking(isActive ? null : booking)}
                          className={`absolute left-1 right-1 rounded-md border px-2 py-1 text-left transition-all z-[2]
                            ${STATUS_BLOCK[booking.status]}
                            ${isActive ? 'ring-2 ring-offset-1 ring-white shadow-lg' : 'shadow-sm hover:shadow-md hover:brightness-110'}
                          `}
                          style={{ top: topPx, height: heightPx, overflow: 'hidden' }}
                        >
                          <p className="text-xs leading-tight truncate">{booking.guestName}</p>
                          <p className="text-xs opacity-80 truncate leading-tight">{booking.bookingNo}</p>
                          {heightPx > HOUR_HEIGHT * 0.9 && (
                            <p className="text-xs opacity-70 leading-tight mt-0.5">
                              {booking.startTime}–{booking.endTime}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {/* Current-time red line (across all venue columns) */}
                {showNowLine && (
                  <div
                    className="absolute pointer-events-none z-[5]"
                    style={{
                      top: nowTopPx,
                      left: TIME_WIDTH,
                      width: displayVenues.length * VENUE_WIDTH,
                      height: 2,
                    }}
                  >
                    <div className="w-full h-full bg-red-500 opacity-70" />
                    <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-500 opacity-80" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── Booking detail popover ────────────────────────────────────── */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div
            ref={popoverRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Booking Details</p>
                <p className="font-mono text-sm text-blue-700">{activeBooking.bookingNo}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={STATUS_BADGE[activeBooking.status]}>
                  {activeBooking.status}
                </Badge>
                <button
                  onClick={() => setActiveBooking(null)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Guest */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-blue-700">
                    {activeBooking.guestName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm">{activeBooking.guestName}</p>
                  <p className="text-xs text-gray-500">{activeBooking.accountNo}</p>
                  <p className="text-xs text-gray-400">{activeBooking.accountType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Venue */}
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block">Venue</label>
                  <p className="text-gray-800">{activeBooking.venue}</p>
                </div>
                {/* Date */}
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block">Date</label>
                  <p className="text-gray-800">{formatDate(activeBooking.date)}</p>
                </div>
                {/* Time */}
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duration
                  </label>
                  <p className="text-gray-800">{activeBooking.startTime} – {activeBooking.endTime}</p>
                </div>
                {/* Guests */}
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block flex items-center gap-1">
                    <Users className="w-3 h-3" /> Guests
                  </label>
                  <p className="text-gray-800">{activeBooking.numberOfGuests} pax</p>
                </div>
                {/* Flight */}
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block flex items-center gap-1">
                    <Plane className="w-3 h-3" /> Flight
                  </label>
                  <p className="text-gray-800">{activeBooking.flightNo} · {activeBooking.flightTime}</p>
                </div>
                {/* Payment */}
                <div>
                  <label className="text-xs text-gray-500 mb-[10px] block flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Payment
                  </label>
                  <p className="text-gray-800">{activeBooking.paymentMode}</p>
                </div>
                {/* Amount */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-[10px] block">Amount</label>
                  <p className="text-gray-800">{activeBooking.amount}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveBooking(null)}>
                Close
              </Button>
              {/* Pre Order button */}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                onClick={() => {
                  const booking = activeBooking;
                  setActiveBooking(null);
                  onPreOrder?.(booking!);
                }}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Pre Order
                {getPreOrder(activeBooking.bookingNo) && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px]">
                    Saved
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                onClick={() => {
                  setActiveBooking(null);
                  onViewDetail?.(activeBooking.id);
                }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Booking Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR Entry Scanner modal ────────────────────────────────────── */}
      <QREntryScanner
        bookings={ALL_BOOKINGS}
        open={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onViewDetail={onViewDetail}
      />
    </div>
  );
}