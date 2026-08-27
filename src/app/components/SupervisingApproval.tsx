import { useState, useMemo } from 'react';
import {
  Search, Calendar, CheckCircle, XCircle, Eye, AlertCircle, Plane,
  Car, ShoppingBag, Clock, Building2, User, BadgePercent,
  ChevronDown, ChevronUp, MailCheck, ThumbsUp, ThumbsDown,
  Receipt, RefreshCcw, DollarSign, ShieldCheck, Info
} from 'lucide-react';
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { toast } from 'sonner@2.0.3';
import React from 'react';
import { SupervisingApprovalReview } from './SupervisingApprovalReview';
import type { SupervisingBooking, InvoiceLineItem } from './SupervisingApprovalReview';

// ── Types ─────────────────────────────────────────────────────────────────────

type SupervisingStatus = {
  status: 'approved' | 'revision_requested' | 'rejected';
  supervisorNote?: string;
  revisionReason?: string;
  rejectionReason?: string;
};

type ActiveTab = 'pending' | 'revision' | 'processed';

// ── Mock Data Generation ──────────────────────────────────────────────────────

const TRAVEL_AGENCIES = [
  { name: 'Wings Travel Agency', code: 'TA-WG-001', discountRate: 15 },
  { name: 'EGL Tours',           code: 'TA-EG-001', discountRate: 20 },
  { name: 'Hong Thai Travel',    code: 'TA-HT-001', discountRate: 10 },
  { name: 'Wing On Travel',      code: 'TA-WO-001', discountRate: 12 },
  { name: 'Klook Travel',        code: 'TA-KL-001', discountRate: 8  },
  { name: 'CTrip Hong Kong',     code: 'TA-CT-001', discountRate: 18 },
];

const CORPORATE_NAMES = [
  'Cathay Pacific Airways', 'HSBC Holdings', 'AIA Group', 'MTR Corporation',
  'Hang Seng Bank', 'Hong Kong Electric', 'Sun Hung Kai Properties',
];

const STAFF_NAMES = [
  'Alice Wong', 'Brian Chan', 'Cynthia Lam', 'David Ng', 'Eva Cheung',
  'Frank Ho', 'Grace Yip', 'Henry Tsang', 'Irene Mak', 'Jason Lee',
];

const SPECIAL_REQUESTS = [
  'Guest requires wheelchair assistance',
  'Birthday celebration — please prepare welcome card',
  'Kosher meal required',
  '',
  '',
  '',
  '',
];

const STAFF_NOTES_POOL = [
  'Price calculated per standard rate card. Agency discount applied as per contract.',
  'Ad-hoc surcharge applied as booking was submitted within 2-hour cut-off window.',
  'Membership discount applied as per Gold tier entitlement.',
  '',
  '',
  '',
];

const SUITE_RATE      = 1800;  // per flying guest
const NON_FLYING_RATE = 2500;  // per non-flying guest
const LIMO_RATE       = 1500;
const SHOPPING_RATE   = 400;
const ADHOC_RATE      = 0.15;
const SERVICE_CHARGE_RATE = 0.10;

// ── Mock Staff Decision Pool ──────────────────────────────────────────────────
const STAFF_DECISION_POOL: Array<{
  decision: 'Approved' | 'Rejected';
  reason?: string;
}> = [
  { decision: 'Approved' },
  { decision: 'Approved' },
  { decision: 'Approved' },
  { decision: 'Rejected', reason: 'Suite not available for requested time slot' },
  { decision: 'Approved' },
  { decision: 'Approved' },
  { decision: 'Rejected', reason: 'Incomplete passenger information provided' },
  { decision: 'Approved' },
  { decision: 'Approved' },
  { decision: 'Approved' },
  { decision: 'Rejected', reason: 'Booking submitted within cut-off period' },
  { decision: 'Approved' },
];

const membershipDiscountRate = (tier?: SupervisingBooking['membershipTier']) => {
  if (tier === 'Sapphire') return 0.15;
  if (tier === 'Diamond')  return 0.12;
  if (tier === 'Platinum') return 0.08;
  if (tier === 'Gold')     return 0.05;
  return 0;
};

const buildInvoice = (
  suite: string,
  numberOfGuests: number,
  nonFlyingGuests: number,
  hasLimousine: boolean,
  hasShopping: boolean,
  isAdHoc: boolean,
  agencyDiscountRate: number | undefined,
  membershipTier: SupervisingBooking['membershipTier'] | undefined,
) => {
  const lineItems: InvoiceLineItem[] = [];

  const flyingGuests = numberOfGuests - nonFlyingGuests;
  const suiteCharge  = flyingGuests * SUITE_RATE;
  lineItems.push({
    description: `Suite: ${suite} — Flying Guest (${flyingGuests} pax × HK$${SUITE_RATE.toLocaleString()})`,
    quantity: flyingGuests,
    unitPrice: SUITE_RATE,
    amount: suiteCharge,
  });

  if (nonFlyingGuests > 0) {
    const nfCharge = nonFlyingGuests * NON_FLYING_RATE;
    lineItems.push({
      description: `Non-flying Guest Admission (${nonFlyingGuests} pax × HK$${NON_FLYING_RATE.toLocaleString()})`,
      quantity: nonFlyingGuests,
      unitPrice: NON_FLYING_RATE,
      amount: nfCharge,
    });
  }

  if (hasLimousine) {
    lineItems.push({
      description: 'Limousine Transfer Service',
      quantity: 1,
      unitPrice: LIMO_RATE,
      amount: LIMO_RATE,
    });
  }

  if (hasShopping) {
    lineItems.push({
      description: 'In-lounge Personal Shopping Assistance',
      quantity: 1,
      unitPrice: SHOPPING_RATE,
      amount: SHOPPING_RATE,
    });
  }

  const baseSubtotal = lineItems.reduce((s, i) => s + i.amount, 0);

  let adHocSurcharge = 0;
  if (isAdHoc) {
    adHocSurcharge = Math.round(baseSubtotal * ADHOC_RATE);
    lineItems.push({
      description: 'Ad-hoc / Late Booking Surcharge (15%)',
      quantity: 1,
      unitPrice: adHocSurcharge,
      amount: adHocSurcharge,
    });
  }

  const subtotal = baseSubtotal + adHocSurcharge;
  const agencyDiscount     = agencyDiscountRate ? Math.round(subtotal * agencyDiscountRate / 100) : 0;
  const memberDiscount     = Math.round(subtotal * membershipDiscountRate(membershipTier));
  const totalDiscounts     = agencyDiscount + memberDiscount;
  const afterDiscounts     = subtotal - totalDiscounts;
  const serviceCharge      = Math.round(afterDiscounts * SERVICE_CHARGE_RATE);
  const totalAmount        = afterDiscounts + serviceCharge;

  return { lineItems, subtotal, agencyDiscount, membershipDiscount: memberDiscount, serviceCharge, totalAmount };
};

const generateBookings = (): SupervisingBooking[] => {
  const names   = ['James Hoffmann', 'Priya Nair', 'William Leung', 'Fatima Al-Hassan', 'Lucas Müller', 'Chen Xiaoming', 'Yuki Tanaka', 'Amara Osei', 'Natasha Ivanova', 'Patrick O\'Brien', 'Mei-Lin Chou', 'Rajan Sharma'];
  const suites  = ['Premier Suite A', 'Premier Suite B', 'Lounge Deluxe', 'Open Lounge Bay 3', 'VIP Suite', 'Business Suite'];
  const airlines= ['CX', 'BA', 'NH', 'SQ', 'QF', 'EK', 'LH', 'AA'];
  const origins = ['LHR', 'NRT', 'SIN', 'SYD', 'LAX', 'DXB', 'FRA', 'ICN'];

  const accountTypesCycle: SupervisingBooking['accountType'][] = [
    'Individual', 'Corporate', 'Agency', 'Individual', 'Corporate',
    'Agency', 'Individual', 'Individual', 'Corporate', 'Agency',
    'Individual', 'Corporate',
  ];
  const paymentModesCycle: SupervisingBooking['paymentMode'][] = [
    'Upfront', 'On-Credit', 'Bulk Purchase/Monthly Invoice', 'Net Upfront', 'On-Credit',
    'Upfront', 'On-Credit', 'Upfront', 'Bulk Purchase/Monthly Invoice', 'Upfront',
    'Net Upfront', 'On-Credit',
  ];
  const membershipTiers: SupervisingBooking['membershipTier'][] = ['Gold', 'Platinum', 'Diamond', 'Sapphire'];
  const reqTypes: SupervisingBooking['requestType'][] = ['New Booking', 'New Booking', 'Edit Booking', 'New Booking', 'New Booking', 'Cancellation', 'New Booking', 'Edit Booking', 'New Booking', 'New Booking', 'New Booking', 'Edit Booking'];
  const submittedDates = [
    '2026-02-23 14:05', '2026-02-23 16:42', '2026-02-24 09:18', '2026-02-24 11:30',
    '2026-02-24 14:55', '2026-02-25 08:07', '2026-02-25 10:22', '2026-02-25 13:49',
    '2026-02-25 16:01', '2026-02-26 08:33', '2026-02-26 10:58', '2026-02-26 14:17',
  ];
  const invoiceDates = [
    '2026-02-23', '2026-02-23', '2026-02-24', '2026-02-24',
    '2026-02-24', '2026-02-25', '2026-02-25', '2026-02-25',
    '2026-02-25', '2026-02-26', '2026-02-26', '2026-02-26',
  ];

  return Array.from({ length: 12 }, (_, idx) => {
    const i            = idx + 1;
    const accountType  = accountTypesCycle[idx];
    const paymentMode  = paymentModesCycle[idx];
    const date         = new Date(2026, 2, i + 4);
    const hour         = 8 + (i % 12);
    const airline      = airlines[idx % airlines.length];
    const flightNum    = 100 + i * 17;

    let agencyName: string | undefined;
    let agencyDiscountRate: number | undefined;
    let companyName: string | undefined;
    let membershipTier: SupervisingBooking['membershipTier'];

    if (accountType === 'Agency') {
      const agency = TRAVEL_AGENCIES[idx % TRAVEL_AGENCIES.length];
      agencyName = agency.name;
      agencyDiscountRate = agency.discountRate;
    } else if (accountType === 'Corporate') {
      companyName = CORPORATE_NAMES[idx % CORPORATE_NAMES.length];
    } else {
      membershipTier = membershipTiers[idx % membershipTiers.length];
    }

    const isAdHoc       = i % 5 === 0;
    const hasLimousine  = i % 3 === 0;
    const hasShopping   = i % 4 === 0;
    const numberOfGuests = 1 + (i % 4);
    const nonFlyingGuests = i % 6 === 0 ? 1 : 0;
    const suite         = suites[idx % suites.length];

    const invoice = buildInvoice(suite, numberOfGuests, nonFlyingGuests, hasLimousine, hasShopping, isAdHoc, agencyDiscountRate, membershipTier);
    const staffDecisionBase = STAFF_DECISION_POOL[idx % STAFF_DECISION_POOL.length];

    return {
      id: i,
      bookingNo:  `A-202603-${String(i).padStart(6, '0')}`,
      invoiceNo:  `INV-202603-${String(i).padStart(6, '0')}`,
      invoiceDate: invoiceDates[idx],
      requestType: reqTypes[idx],
      guestName:  names[idx % names.length],
      accountNo:  `ACC-2026-${String(1000 + i).slice(-4)}`,
      accountType,
      membershipTier,
      companyName,
      agencyName,
      agencyDiscountRate,
      suite,
      dateTime:   `${date.toISOString().split('T')[0]} ${String(hour).padStart(2, '0')}:${i % 2 === 0 ? '30' : '00'}`,
      flightNo:   `${airline}${String(flightNum).slice(-3)}`,
      flightTime: `${String(hour + 3).padStart(2, '0')}:${i % 2 === 0 ? '45' : '15'}`,
      flightType: i % 2 === 0 ? 'Arrival' : 'Departure',
      flightOrigin:      i % 2 === 0 ? origins[idx % origins.length] : undefined,
      flightDestination: i % 2 === 0 ? 'HKG' : ['TPE', 'ICN', 'NRT', 'SIN'][idx % 4],
      numberOfGuests,
      nonFlyingGuests,
      hasLimousine,
      hasShopping,
      isAdHoc,
      paymentMode,
      bookingType: i % 2 === 0 ? 'Online' : 'Email/Call to HKIAL',
      submittedAt: submittedDates[idx],
      submittedBy: STAFF_NAMES[idx % STAFF_NAMES.length],
      specialRequests: SPECIAL_REQUESTS[idx % SPECIAL_REQUESTS.length] || undefined,
      staffNotes: STAFF_NOTES_POOL[idx % STAFF_NOTES_POOL.length] || undefined,
      staffDecision: {
        decision: staffDecisionBase.decision,
        by: STAFF_NAMES[idx % STAFF_NAMES.length],
        at: submittedDates[idx],
        reason: staffDecisionBase.reason,
      },
      ...invoice,
    };
  });
};

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

// ── MOCK constant (isolated — container replaces via props) ───────────────────
const MOCK_SUPERVISING_BOOKINGS: SupervisingBooking[] = generateBookings();

// ── Props interface ───────────────────────────────────────────────────────────
export interface SupervisingApprovalProps {
  /** Pass populated array from CI4; falls back to MOCK_SUPERVISING_BOOKINGS when empty */
  bookings?: SupervisingBooking[];
  onApprove?: (id: number, note?: string) => void;
  onReject?: (id: number, reason: string) => void;
  onEscalate?: (id: number) => void;
  onViewDetail?: (bookingId: number) => void;
  isLoading?: boolean;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SupervisingApproval({
  bookings: bookingsProp = [],
  onApprove,
  onReject,
  onEscalate,
  onViewDetail,
  isLoading = false,
}: SupervisingApprovalProps) {
  const [bookings] = useState<SupervisingBooking[]>(
    bookingsProp.length > 0 ? bookingsProp : MOCK_SUPERVISING_BOOKINGS,
  );
  const [statuses, setStatuses] = useState<Record<number, SupervisingStatus>>({});

  // Sub-navigation
  const [subView, setSubView] = useState<'list' | 'review'>('list');
  const [reviewingBooking, setReviewingBooking] = useState<SupervisingBooking | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('pending');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [expandedId, setExpandedId] = useState<number | null>(null);

  // ── Segmented lists ────────────────────────────────────────────────────────

  const pendingBookings  = useMemo(() => bookings.filter(b => !statuses[b.id]), [bookings, statuses]);
  const revisionBookings = useMemo(() => bookings.filter(b => statuses[b.id]?.status === 'revision_requested'), [bookings, statuses]);
  const processedBookings = useMemo(() => bookings.filter(b => statuses[b.id]?.status === 'approved' || statuses[b.id]?.status === 'rejected'), [bookings, statuses]);

  const activePool = useMemo(() => {
    if (activeTab === 'pending')   return pendingBookings;
    if (activeTab === 'revision')  return revisionBookings;
    return processedBookings;
  }, [activeTab, pendingBookings, revisionBookings, processedBookings]);

  const filteredBookings = useMemo(() => {
    return activePool.filter(b => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        b.bookingNo.toLowerCase().includes(q) ||
        b.invoiceNo.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.accountNo.toLowerCase().includes(q) ||
        (b.companyName?.toLowerCase().includes(q) ?? false) ||
        (b.agencyName?.toLowerCase().includes(q) ?? false);
      const matchAccountType = accountTypeFilter === 'all' || b.accountType === accountTypeFilter;
      const matchPaymentMode = paymentModeFilter === 'all' || b.paymentMode === paymentModeFilter;
      const matchDateFrom = !dateFrom || b.dateTime.split(' ')[0] >= dateFrom;
      const matchDateTo   = !dateTo   || b.dateTime.split(' ')[0] <= dateTo;
      return matchSearch && matchAccountType && matchPaymentMode && matchDateFrom && matchDateTo;
    });
  }, [activePool, searchTerm, accountTypeFilter, paymentModeFilter, dateFrom, dateTo]);

  const totalPages      = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const startReview = (booking: SupervisingBooking) => {
    setReviewingBooking(booking);
    setSubView('review');
  };

  const handleApprove = (bookingId: number, note?: string) => {
    setStatuses(prev => ({ ...prev, [bookingId]: { status: 'approved', supervisorNote: note } }));
    setSubView('list');
    setActiveTab('processed');
  };

  const handleRevision = (bookingId: number, reason: string) => {
    setStatuses(prev => ({ ...prev, [bookingId]: { status: 'revision_requested', revisionReason: reason } }));
    setSubView('list');
    setActiveTab('revision');
  };

  const handleReject = (bookingId: number, reason: string) => {
    setStatuses(prev => ({ ...prev, [bookingId]: { status: 'rejected', rejectionReason: reason } }));
    setSubView('list');
    setActiveTab('processed');
  };

  // ── Stats ─────────────────────────────────────────────────────────────────────

  const totalPending   = pendingBookings.length;
  const totalRevision  = revisionBookings.length;
  const totalApproved  = processedBookings.filter(b => statuses[b.id]?.status === 'approved').length;
  const totalRejected  = processedBookings.filter(b => statuses[b.id]?.status === 'rejected').length;
  const adHocPending   = pendingBookings.filter(b => b.isAdHoc).length;

  const pendingValue  = pendingBookings.reduce((s, b) => s + b.totalAmount, 0);

  // ── Pagination ────────────────────────────────────────────────────────────────

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, -1, totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -2, totalPages);
    }
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
          {pages.map((page, idx) =>
            page < 0
              ? <PaginationItem key={`e-${idx}`}><PaginationEllipsis /></PaginationItem>
              : <PaginationItem key={page}><PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink></PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // ── Review sub-view ───────────────────────────────────────────────────────────

  if (subView === 'review' && reviewingBooking) {
    return (
      <SupervisingApprovalReview
        booking={reviewingBooking}
        onBack={() => setSubView('list')}
        onApprove={handleApprove}
        onRequestRevision={handleRevision}
        onReject={handleReject}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Supervising Approval</h1>
          <p className="text-gray-600">Supervisor &amp; manager review of booking prices and invoices before finalisation</p>
        </div>
        {totalPending > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
            <DollarSign className="w-4 h-4" />
            <span>Pending invoice value: <strong>HK${pendingValue.toLocaleString()}</strong></span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-0 border-b border-gray-200 bg-white rounded-t-lg overflow-hidden shadow-sm">
        <button
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-700 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => switchTab('pending')}
        >
          <Receipt className="w-4 h-4" />
          Pending Review
          {totalPending > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
            }`}>{totalPending}</span>
          )}
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'revision'
              ? 'border-amber-500 text-amber-700 bg-amber-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => switchTab('revision')}
        >
          <RefreshCcw className="w-4 h-4" />
          Revision Requested
          {totalRevision > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === 'revision' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
            }`}>{totalRevision}</span>
          )}
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'processed'
              ? 'border-gray-500 text-gray-700 bg-gray-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => switchTab('processed')}
        >
          Processed
          {processedBookings.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === 'processed' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>{processedBookings.length}</span>
          )}
        </button>
      </div>

      {/* Context Banner — Revision tab */}
      {activeTab === 'revision' && revisionBookings.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <RefreshCcw className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Revision Requested — Awaiting Staff Resubmission</p>
            <p className="text-sm text-amber-700 mt-0.5">
              These invoices have been sent back to staff for price or content revision. Once revised, they will return to the Pending Review queue.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pending Review</p>
                <p className="text-2xl text-blue-600">{totalPending}</p>
              </div>
              <Receipt className="w-8 h-8 text-blue-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ad-hoc / Urgent</p>
                <p className="text-2xl text-amber-600">{adHocPending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Individual</p>
                <p className="text-2xl text-indigo-600">{pendingBookings.filter(b => b.accountType === 'Individual').length}</p>
              </div>
              <User className="w-8 h-8 text-indigo-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Corp / Agency</p>
                <p className="text-2xl text-purple-600">{pendingBookings.filter(b => b.accountType !== 'Individual').length}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-200" />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'revision' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Awaiting Revision</p>
                <p className="text-2xl text-amber-600">{totalRevision}</p>
              </div>
              <RefreshCcw className="w-8 h-8 text-amber-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Invoice Value</p>
                <p className="text-xl text-indigo-600">
                  HK${revisionBookings.reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-indigo-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Booking Types</p>
                <p className="text-sm text-blue-600 mt-1">
                  {revisionBookings.filter(b => b.accountType === 'Individual').length} Ind ·{' '}
                  {revisionBookings.filter(b => b.accountType === 'Corporate').length} Corp ·{' '}
                  {revisionBookings.filter(b => b.accountType === 'Agency').length} TA
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-200" />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'processed' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Approved Invoices</p>
                <p className="text-2xl text-green-600">{totalApproved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Rejected Invoices</p>
                <p className="text-2xl text-red-600">{totalRejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Approved Value</p>
                <p className="text-xl text-blue-600">
                  HK${processedBookings.filter(b => statuses[b.id]?.status === 'approved').reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice no., booking no., guest name, account, company or agency…"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={accountTypeFilter} onValueChange={v => { setAccountTypeFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Account Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Account Types</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Agency">Agency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentModeFilter} onValueChange={v => { setPaymentModeFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Modes</SelectItem>
                <SelectItem value="Upfront">Upfront</SelectItem>
                <SelectItem value="Net Upfront">Net Upfront</SelectItem>
                <SelectItem value="On-Credit">On-Credit</SelectItem>
                <SelectItem value="Bulk Purchase/Monthly Invoice">Bulk Purchase / Monthly Invoice</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-3 flex-1">
              <div className="flex-1 relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="flex-1 relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          {activeTab === 'pending' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-300 mb-4" />
              <p className="text-gray-700 mb-1">No invoices pending supervisor review</p>
              <p className="text-sm text-gray-500">All submitted price &amp; invoice reviews have been processed.</p>
            </>
          ) : activeTab === 'revision' ? (
            <>
              <RefreshCcw className="w-16 h-16 text-amber-300 mb-4" />
              <p className="text-gray-700 mb-1">No invoices awaiting revision</p>
              <p className="text-sm text-gray-500">No revision requests are currently outstanding.</p>
            </>
          ) : (
            <>
              <Receipt className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-700 mb-1">No processed invoices found</p>
              <p className="text-sm text-gray-500">Approved and rejected invoice records will appear here.</p>
            </>
          )}
        </Card>
      )}

      {/* Table */}
      {filteredBookings.length > 0 && (
        <Card>
          <div className="p-4 border-b flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} invoice{filteredBookings.length !== 1 ? 's' : ''}
            </div>
            {renderPagination()}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${activeTab === 'revision' ? 'bg-amber-50' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Invoice / Booking</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Guest / Account</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Suite &amp; Visit</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Flight</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Services</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Invoice Total</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Approval Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    {activeTab === 'processed' ? 'Supervisor Result' : 'Submitted By'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedBookings.map(booking => {
                  const st = statuses[booking.id];
                  return (
                    <React.Fragment key={booking.id}>
                      <tr className={`hover:bg-gray-50 transition-colors ${booking.isAdHoc ? 'bg-amber-50' : ''} ${activeTab === 'revision' ? 'hover:bg-amber-50' : ''}`}>

                        {/* Invoice / Booking */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {booking.isAdHoc && (
                              <span title="Ad-hoc booking"><AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" /></span>
                            )}
                            <div>
                              <div className="text-xs font-mono text-gray-500">{booking.invoiceNo}</div>
                              <div className="text-sm font-mono">{booking.bookingNo}</div>
                            </div>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge className={`text-xs ${
                              booking.requestType === 'New Booking'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : booking.requestType === 'Cancellation'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-orange-100 text-orange-700 border border-orange-200'
                            }`}>
                              {booking.requestType}
                            </Badge>
                          </div>
                        </td>

                        {/* Guest / Account */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              className="text-sm text-blue-600 hover:underline"
                              onClick={() => onViewDetail?.(booking.id)}
                            >
                              {booking.guestName}
                            </button>
                            <Badge className={`text-xs ${accountTypeBadgeClass(booking.accountType)}`}>
                              {booking.accountType}
                            </Badge>
                            {booking.membershipTier && (
                              <Badge className={`text-xs ${membershipBadgeClass(booking.membershipTier)}`}>
                                {booking.membershipTier}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{booking.accountNo}</div>
                          {booking.companyName && (
                            <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3" />{booking.companyName}
                            </div>
                          )}
                          {booking.agencyName && (
                            <div className="text-xs text-purple-600 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3" />{booking.agencyName}
                            </div>
                          )}
                        </td>

                        {/* Suite & Visit */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div>{booking.suite || '—'}</div>
                          {booking.assignedSuiteNames && booking.assignedSuiteNames.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {booking.assignedSuiteNames.map(n => (
                                <span key={n} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200">{n}</span>
                              ))}
                            </div>
                          )}
                          {booking.assignedLoungeNames && booking.assignedLoungeNames.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {booking.assignedLoungeNames.map(n => (
                                <span key={n} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">{n}</span>
                              ))}
                            </div>
                          )}
                          <div className="text-gray-500 text-xs mt-0.5">
                            <div>{booking.dateTime.split(' ')[0]}</div>
                            <div>{booking.dateTime.split(' ')[1]}</div>
                          </div>
                        </td>

                        {/* Flight */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1">
                            <Plane className={`w-3 h-3 text-gray-400 ${booking.flightType === 'Arrival' ? 'rotate-[-45deg]' : 'rotate-45'}`} />
                            <span>{booking.flightNo}</span>
                          </div>
                          <div className="text-xs text-gray-500">{booking.flightTime}</div>
                        </td>

                        {/* Services */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-1.5">
                            {booking.hasLimousine && <Car className="w-4 h-4 text-purple-500" title="Limousine Transfer" />}
                            {booking.hasShopping && <ShoppingBag className="w-4 h-4 text-green-500" title="In-lounge Shopping" />}
                            {!booking.hasLimousine && !booking.hasShopping && <span className="text-xs text-gray-400">—</span>}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {booking.numberOfGuests} pax
                            {booking.nonFlyingGuests > 0 && ` · ${booking.nonFlyingGuests} non-fly`}
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={`text-xs ${paymentModeBadgeClass(booking.paymentMode)}`}>
                            {booking.paymentMode}
                          </Badge>
                        </td>

                        {/* Invoice Total */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="text-base font-semibold text-[#0f2942]">
                            HK${booking.totalAmount.toLocaleString()}
                          </div>
                          {(booking.agencyDiscount > 0 || booking.membershipDiscount > 0) && (
                            <div className="text-xs text-green-600 flex items-center gap-0.5 justify-end mt-0.5">
                              <BadgePercent className="w-3 h-3" />
                              HK${(booking.agencyDiscount + booking.membershipDiscount).toLocaleString()} disc.
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-0.5">
                            incl. 10% svc chg
                          </div>
                        </td>

                        {/* ── Approval Status (staff decision from Approve Booking Request) ── */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {booking.staffDecision.decision === 'Approved' ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span className="text-xs font-medium text-emerald-700">Staff Approved</span>
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[7rem]" title={booking.staffDecision.by}>
                                {booking.staffDecision.by}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <ThumbsDown className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                <span className="text-xs font-medium text-red-600">Staff Rejected</span>
                              </div>
                              {booking.staffDecision.reason && (
                                <div className="text-xs text-gray-400 mt-0.5 max-w-[7rem] truncate" title={booking.staffDecision.reason}>
                                  {booking.staffDecision.reason}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Supervisor Result / Submitted By */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          {activeTab === 'processed' && st ? (
                            st.status === 'approved' ? (
                              <div>
                                <div className="flex items-center gap-1.5 text-green-700">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="font-medium">Supervisor Approved</span>
                                </div>
                                {st.supervisorNote && (
                                  <div className="text-gray-500 mt-0.5 max-w-32 truncate" title={st.supervisorNote}>
                                    Note: {st.supervisorNote}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-1.5 text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  <span className="font-medium">Supervisor Rejected</span>
                                </div>
                              </div>
                            )
                          ) : activeTab === 'revision' && st ? (
                            <div>
                              <div className="flex items-center gap-1.5 text-amber-600">
                                <RefreshCcw className="w-4 h-4" />
                                <span className="font-medium">Revision Sent</span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium text-gray-700">{booking.submittedBy}</div>
                              <div className="flex items-center gap-1 text-gray-400 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {booking.submittedAt.split(' ')[0]}
                              </div>
                              <div className="text-gray-400 ml-4">{booking.submittedAt.split(' ')[1]}</div>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800"
                              title="Toggle Details"
                              onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                            >
                              {expandedId === booking.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                            {onViewDetail && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                title="View Booking Detail"
                                onClick={() => onViewDetail(booking.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {activeTab !== 'processed' && (
                              <Button
                                size="sm"
                                className={`h-8 px-3 gap-1 text-xs text-white ${
                                  activeTab === 'revision'
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                                onClick={() => startReview(booking)}
                              >
                                <Receipt className="w-3 h-3" />
                                {activeTab === 'revision' ? 'Re-review' : 'Review'}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedId === booking.id && (
                        <tr key={`exp-${booking.id}`} className={`border-b ${activeTab === 'revision' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                          <td colSpan={10} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {/* Invoice Summary */}
                              <div className="space-y-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Invoice Details</p>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Invoice No.:</span><span className="font-mono">{booking.invoiceNo}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Invoice Date:</span><span>{booking.invoiceDate}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Booking No.:</span><span className="font-mono">{booking.bookingNo}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Request Type:</span><span>{booking.requestType}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Booking Type:</span><span>{booking.bookingType}</span></div>
                              </div>
                              {/* Price Breakdown */}
                              <div className="space-y-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Price Breakdown</p>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Subtotal:</span><span>HK${booking.subtotal.toLocaleString()}</span></div>
                                {booking.agencyDiscount > 0 && <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Agency Disc.:</span><span className="text-purple-600">−HK${booking.agencyDiscount.toLocaleString()}</span></div>}
                                {booking.membershipDiscount > 0 && <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Mbr. Disc.:</span><span className="text-indigo-600">−HK${booking.membershipDiscount.toLocaleString()}</span></div>}
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Svc Charge:</span><span>+HK${booking.serviceCharge.toLocaleString()}</span></div>
                                <div className="flex gap-2 pt-1 border-t border-gray-200"><span className="text-gray-700 w-28 flex-shrink-0 font-medium">Total:</span><span className="font-semibold text-[#0f2942]">HK${booking.totalAmount.toLocaleString()}</span></div>
                              </div>
                              {/* Notes */}
                              <div className="space-y-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                                {booking.staffNotes && (
                                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex gap-2">
                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                                    <span><strong>Staff:</strong> {booking.staffNotes}</span>
                                  </div>
                                )}
                                {activeTab === 'revision' && st?.revisionReason && (
                                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex gap-2">
                                    <RefreshCcw className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                                    <span><strong>Revision:</strong> {st.revisionReason}</span>
                                  </div>
                                )}
                                {activeTab === 'processed' && st?.status === 'rejected' && st.rejectionReason && (
                                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex gap-2">
                                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span><strong>Rejection:</strong> {st.rejectionReason}</span>
                                  </div>
                                )}
                                {activeTab === 'processed' && st?.status === 'approved' && st.supervisorNote && (
                                  <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800 flex gap-2">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span><strong>Supervisor Note:</strong> {st.supervisorNote}</span>
                                  </div>
                                )}
                                {booking.specialRequests && (
                                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex gap-2">
                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                                    <span><strong>Special Req.:</strong> {booking.specialRequests}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t flex justify-end">
            {renderPagination()}
          </div>
        </Card>
      )}
    </div>
  );
}