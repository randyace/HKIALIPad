import { useState, useMemo } from 'react';
import {
  Search, Calendar, CheckCircle, XCircle, Eye, AlertCircle, Plane,
  Car, ShoppingBag, Clock, Building2, User, CreditCard, BadgePercent,
  ChevronDown, ChevronUp, Filter, MailCheck, ThumbsUp, ThumbsDown,
  ClipboardCheck, Info, X, FileEdit, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
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
import { BookingReviewPage } from './BookingReviewPage';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PendingBooking {
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

type BookingStatusRecord = { status: 'pending_supervisor' | 'confirmed' | 'rejected'; rejectedReason?: string };
type ActiveTab = 'staff' | 'supervisor' | 'processed';

// ── Mock Data ────────────────────────────────────────────────────────────────

const TRAVEL_AGENCIES = [
  { name: 'Wings Travel Agency',  code: 'TA-WG-001', discountRate: 15 },
  { name: 'EGL Tours',            code: 'TA-EG-001', discountRate: 20 },
  { name: 'Hong Thai Travel',     code: 'TA-HT-001', discountRate: 10 },
  { name: 'Wing On Travel',       code: 'TA-WO-001', discountRate: 12 },
  { name: 'Klook Travel',         code: 'TA-KL-001', discountRate: 8  },
  { name: 'CTrip Hong Kong',      code: 'TA-CT-001', discountRate: 18 },
];

const CORPORATE_NAMES = [
  'Cathay Pacific Airways', 'HSBC Holdings', 'AIA Group', 'MTR Corporation',
  'Hang Seng Bank', 'Hong Kong Electric', 'Sun Hung Kai Properties',
];

const SPECIAL_REQUESTS = [
  'Guest requires wheelchair assistance',
  'Birthday celebration — please prepare welcome card',
  'Kosher meal required',
  'VIP guest — extra privacy preferred',
  '',
  '',
  '',
];

const generatePendingBookings = (): PendingBooking[] => {
  const names  = ['James Hoffmann', 'Priya Nair', 'William Leung', 'Fatima Al-Hassan', 'Lucas Müller', 'Chen Xiaoming', 'Yuki Tanaka', 'Amara Osei', 'Natasha Ivanova', 'Patrick O\'Brien', 'Mei-Lin Chou', 'Rajan Sharma', 'Isabelle Dupont', 'Omar Al-Farsi', 'Elena Kozlov'];
  const suites = ['Premier Suite A', 'Premier Suite B', 'Lounge Deluxe', 'Open Lounge Bay 3', 'VIP Suite', 'Business Suite'];
  const airlines = ['CX', 'BA', 'NH', 'SQ', 'QF', 'EK', 'LH', 'AA', 'UA', 'AF'];
  const origins  = ['LHR', 'NRT', 'SIN', 'SYD', 'LAX', 'DXB', 'FRA', 'ICN', 'PVG', 'CDG'];

  const accountTypesCycle: PendingBooking['accountType'][] = [
    'Individual', 'Corporate', 'Agency', 'Individual', 'Corporate',
    'Agency', 'Individual', 'Individual', 'Corporate', 'Agency',
    'Individual', 'Corporate', 'Individual', 'Agency', 'Corporate',
  ];
  const paymentModesCycle: PendingBooking['paymentMode'][] = [
    'Upfront', 'On-Credit', 'Bulk Purchase/Monthly Invoice', 'Net Upfront', 'On-Credit',
    'Upfront', 'On-Credit', 'Upfront', 'Bulk Purchase/Monthly Invoice', 'Upfront',
    'Net Upfront', 'On-Credit', 'Upfront', 'Bulk Purchase/Monthly Invoice', 'On-Credit',
  ];
  const membershipTiers: PendingBooking['membershipTier'][] = ['Gold', 'Platinum', 'Diamond', 'Sapphire'];
  const submittedDates = [
    '2026-02-24 09:12', '2026-02-24 11:34', '2026-02-24 14:05', '2026-02-25 08:22',
    '2026-02-25 10:17', '2026-02-25 13:48', '2026-02-25 16:33', '2026-02-26 07:09',
    '2026-02-26 09:55', '2026-02-26 11:28', '2026-02-26 13:02', '2026-02-26 14:44',
    '2026-02-26 15:31', '2026-02-26 16:08', '2026-02-26 17:22',
  ];

  return Array.from({ length: 15 }, (_, idx) => {
    const i = idx + 1;
    const accountType = accountTypesCycle[idx];
    const paymentMode = paymentModesCycle[idx];
    const date = new Date(2026, 2, i + 5);
    const hour = 8 + (i % 12);
    const airline = airlines[idx % airlines.length];
    const flightNum = 100 + i * 13;
    const baseAmount = 3200 + (i * 157) % 6000;

    let amount: string;
    let agencyName: string | undefined;
    let agencyDiscountRate: number | undefined;
    let originalAmountValue: number | undefined;
    let finalAmountValue: number | undefined;
    let companyName: string | undefined;
    let membershipTier: PendingBooking['membershipTier'];

    if (accountType === 'Agency') {
      const agency = TRAVEL_AGENCIES[idx % TRAVEL_AGENCIES.length];
      agencyName = agency.name;
      agencyDiscountRate = agency.discountRate;
      originalAmountValue = baseAmount;
      finalAmountValue = Math.round(baseAmount * (1 - agency.discountRate / 100));
      amount = `HK$${finalAmountValue.toLocaleString()}`;
    } else if (accountType === 'Corporate') {
      companyName = CORPORATE_NAMES[idx % CORPORATE_NAMES.length];
      amount = `HK$${baseAmount.toLocaleString()}`;
    } else {
      membershipTier = membershipTiers[idx % membershipTiers.length];
      amount = `HK$${baseAmount.toLocaleString()}`;
    }

    return {
      id: i,
      bookingNo: `A-202603-${String(i).padStart(6, '0')}`,
      requestType: i % 5 === 0 ? 'Cancel' : i % 3 === 0 ? 'Edit Booking Request' : 'New Booking Request',
      guestName: names[idx % names.length],
      accountNo: `ACC-2026-${String(1000 + i).slice(-4)}`,
      accountType,
      membershipTier,
      companyName,
      suite: suites[idx % suites.length],
      dateTime: `${date.toISOString().split('T')[0]} ${String(hour).padStart(2, '0')}:${i % 2 === 0 ? '30' : '00'}`,
      flightNo: `${airline}${String(flightNum).slice(-3)}`,
      flightTime: `${String(hour + 3).padStart(2, '0')}:${i % 2 === 0 ? '45' : '15'}`,
      flightOrigin: i % 2 === 0 ? origins[idx % origins.length] : undefined,
      flightDestination: i % 2 === 0 ? 'HKG' : ['TPE', 'ICN', 'NRT', 'SIN'][idx % 4],
      flightType: i % 2 === 0 ? 'Arrival' : 'Departure',
      numberOfGuests: 1 + (i % 4),
      nonFlyingGuests: i % 5 === 0 ? 1 : 0,
      hasLimousine: i % 3 === 0,
      hasShopping: i % 4 === 0,
      isAdHoc: i % 7 === 0,
      paymentMode,
      amount,
      originalAmountValue,
      finalAmountValue,
      agencyName,
      agencyDiscountRate,
      bookingType: i % 2 === 0 ? 'Online' : 'Email/Call to HKIAL',
      submittedAt: submittedDates[idx],
      specialRequests: SPECIAL_REQUESTS[idx % SPECIAL_REQUESTS.length] || undefined,
      originalData: i % 3 === 0 ? {
        suite: suites[(idx + 1) % suites.length],
        dateTime: `${date.toISOString().split('T')[0]} ${String(hour - 1).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
        flightNo: `${airline}${String(flightNum + 50).slice(-3)}`,
        flightTime: `${String(hour + 2).padStart(2, '0')}:${i % 2 === 0 ? '30' : '00'}`,
        flightOrigin: i % 2 === 0 ? origins[(idx + 1) % origins.length] : undefined,
        flightDestination: i % 2 === 0 ? 'HKG' : ['TPE', 'ICN', 'NRT', 'SIN'][(idx + 1) % 4],
        flightType: i % 2 === 0 ? 'Arrival' : 'Departure',
        numberOfGuests: (i % 4) + 1,
        nonFlyingGuests: i % 5 === 0 ? 0 : 1,
        hasLimousine: i % 3 !== 0,
        hasShopping: i % 4 !== 0,
        specialRequests: i % 2 === 0 ? 'Previous request: Guest requires early check-in' : undefined,
      } : undefined,
    };
  });
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const accountTypeBadgeClass = (type: PendingBooking['accountType']) => {
  if (type === 'Individual')     return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
  if (type === 'Corporate')      return 'bg-blue-100 text-blue-800 border border-blue-200';
  if (type === 'Agency')  return 'bg-purple-100 text-purple-800 border border-purple-200';
  return 'bg-gray-100 text-gray-700';
};

const membershipBadgeClass = (tier?: PendingBooking['membershipTier']) => {
  if (tier === 'Diamond')  return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
  if (tier === 'Platinum') return 'bg-slate-100 text-slate-700 border border-slate-200';
  if (tier === 'Gold')     return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  if (tier === 'Sapphire') return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
  return '';
};

const paymentModeBadgeClass = (mode: PendingBooking['paymentMode']) => {
  if (mode === 'Upfront')                      return 'bg-green-100 text-green-700';
  if (mode === 'Net Upfront')                  return 'bg-teal-100 text-teal-700';
  if (mode === 'On-Credit')                    return 'bg-orange-100 text-orange-700';
  if (mode === 'Bulk Purchase/Monthly Invoice') return 'bg-violet-100 text-violet-700';
  return 'bg-gray-100 text-gray-700';
};

const REJECTION_REASONS = [
  'Suite not available for requested time slot',
  'Insufficient credit balance',
  'Booking submitted within cut-off period',
  'Incomplete passenger information',
  'Suspicious or duplicate booking detected',
  'Other (specify below)',
];

// ── MOCK constant (isolated — container replaces via props) ───────────────────
const MOCK_BOOKINGS: PendingBooking[] = generatePendingBookings();

// ── Props interface ───────────────────────────────────────────────────────────
export interface BookingApprovalProps {
  /** Pass populated array from CI4; falls back to MOCK_BOOKINGS when empty */
  bookings?: PendingBooking[];
  onApprove?: (id: number) => void;
  onReject?: (id: number, reason?: string) => void;
  onViewDetail?: (bookingId: number) => void;
  isLoading?: boolean;
}

// ── Main Component ───────────────────────────────────────────────────────────

export function BookingApproval({
  bookings: bookingsProp = [],
  onApprove,
  onReject,
  onViewDetail,
  isLoading = false,
}: BookingApprovalProps) {
  const [bookings] = useState<PendingBooking[]>(
    bookingsProp.length > 0 ? bookingsProp : MOCK_BOOKINGS,
  );

  // ── Two-step approval status ─────────────────────────────────────────────
  const [bookingStatuses, setBookingStatuses] = useState<Record<number, BookingStatusRecord>>({});

  // ── Internal sub-navigation (list ↔ review) ──────────────────────────────
  const [subView, setSubView] = useState<'list' | 'review'>('list');
  const [reviewingBooking, setReviewingBooking] = useState<PendingBooking | null>(null);
  const [reviewStage, setReviewStage] = useState<'staff' | 'supervisor'>('staff');

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('staff');

  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
  const [adHocFilter, setAdHocFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchApproveOpen, setBatchApproveOpen] = useState(false);

  // ── Segmented booking lists ───────────────────────────────────────────────

  const staffPendingBookings = useMemo(() =>
    bookings.filter(b => !bookingStatuses[b.id]),
  [bookings, bookingStatuses]);

  const supervisorPendingBookings = useMemo(() =>
    bookings.filter(b => bookingStatuses[b.id]?.status === 'pending_supervisor'),
  [bookings, bookingStatuses]);

  const processedBookings = useMemo(() =>
    bookings.filter(b => bookingStatuses[b.id]?.status === 'confirmed' || bookingStatuses[b.id]?.status === 'rejected'),
  [bookings, bookingStatuses]);

  const activePoolBookings = useMemo(() => {
    if (activeTab === 'staff')      return staffPendingBookings;
    if (activeTab === 'supervisor') return supervisorPendingBookings;
    return processedBookings;
  }, [activeTab, staffPendingBookings, supervisorPendingBookings, processedBookings]);

  const filteredBookings = useMemo(() => {
    return activePoolBookings.filter(b => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        b.bookingNo.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.accountNo.toLowerCase().includes(q) ||
        b.flightNo.toLowerCase().includes(q) ||
        (b.companyName?.toLowerCase().includes(q) ?? false) ||
        (b.agencyName?.toLowerCase().includes(q) ?? false);
      const matchAccountType = accountTypeFilter === 'all' || b.accountType === accountTypeFilter;
      const matchPaymentMode = paymentModeFilter === 'all' || b.paymentMode === paymentModeFilter;
      const matchAdHoc =
        adHocFilter === 'all' ||
        (adHocFilter === 'adhoc' && b.isAdHoc) ||
        (adHocFilter === 'regular' && !b.isAdHoc);
      const matchDateFrom = !dateFrom || b.dateTime.split(' ')[0] >= dateFrom;
      const matchDateTo = !dateTo || b.dateTime.split(' ')[0] <= dateTo;
      return matchSearch && matchAccountType && matchPaymentMode && matchAdHoc && matchDateFrom && matchDateTo;
    });
  }, [activePoolBookings, searchTerm, accountTypeFilter, paymentModeFilter, adHocFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const startReview = (booking: PendingBooking, stage: 'staff' | 'supervisor') => {
    setReviewingBooking(booking);
    setReviewStage(stage);
    setSubView('review');
  };

  const handleStaffApprove = (bookingId: number) => {
    setBookingStatuses(prev => ({ ...prev, [bookingId]: { status: 'pending_supervisor' } }));
    setSubView('list');
    setActiveTab('supervisor');
  };

  const handleSupervisorApprove = (bookingId: number) => {
    setBookingStatuses(prev => ({ ...prev, [bookingId]: { status: 'confirmed' } }));
    setSubView('list');
  };

  const handleReject = (bookingId: number, reason: string) => {
    setBookingStatuses(prev => ({ ...prev, [bookingId]: { status: 'rejected', rejectedReason: reason } }));
    setSubView('list');
  };

  const handleBatchApprove = () => {
    const ids = Array.from(selectedIds);
    if (activeTab === 'staff') {
      setBookingStatuses(prev => {
        const next = { ...prev };
        ids.forEach(id => { next[id] = { status: 'pending_supervisor' }; });
        return next;
      });
      setActiveTab('supervisor');
      toast.success(`${ids.length} booking${ids.length > 1 ? 's' : ''} forwarded to supervisor`, {
        description: 'These bookings are now awaiting supervisor/manager final approval.',
      });
    } else if (activeTab === 'supervisor') {
      setBookingStatuses(prev => {
        const next = { ...prev };
        ids.forEach(id => { next[id] = { status: 'confirmed' }; });
        return next;
      });
      toast.success(`${ids.length} booking${ids.length > 1 ? 's' : ''} confirmed`, {
        description: 'Final approval granted. Guests will be notified by email.',
      });
    }
    setSelectedIds(new Set());
    setBatchApproveOpen(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedBookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedBookings.map(b => b.id)));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const adHocCount  = staffPendingBookings.filter(b => b.isAdHoc).length;
  const indCount    = staffPendingBookings.filter(b => b.accountType === 'Individual').length;
  const corpCount   = staffPendingBookings.filter(b => b.accountType === 'Corporate').length;
  const agencyCount = staffPendingBookings.filter(b => b.accountType === 'Agency').length;

  const supAdHocCount = supervisorPendingBookings.filter(b => b.isAdHoc).length;

  const confirmedCount = processedBookings.filter(b => bookingStatuses[b.id]?.status === 'confirmed').length;
  const rejectedCount  = processedBookings.filter(b => bookingStatuses[b.id]?.status === 'rejected').length;

  // ── Pagination renderer ───────────────────────────────────────────────────

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
            <PaginationPrevious
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {pages.map((page, idx) =>
            page < 0
              ? <PaginationItem key={`e-${idx}`}><PaginationEllipsis /></PaginationItem>
              : <PaginationItem key={page}>
                  <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
                </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // ── Review sub-view ───────────────────────────────────────────────────────

  if (subView === 'review' && reviewingBooking) {
    return (
      <BookingReviewPage
        booking={reviewingBooking}
        reviewStage={reviewStage}
        onBack={() => setSubView('list')}
        onApprove={reviewStage === 'staff' ? handleStaffApprove : handleSupervisorApprove}
        onReject={handleReject}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────

  const isSupervisorTab = activeTab === 'supervisor';
  const showCheckboxes  = activeTab !== 'processed';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Approve Booking Request</h1>
          <p className="text-gray-600">Two-step approval: staff review followed by supervisor/manager final confirmation</p>
        </div>
        {selectedIds.size > 0 && (
          <Button
            className={`gap-2 text-white ${isSupervisorTab ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
            onClick={() => setBatchApproveOpen(true)}
          >
            <ThumbsUp className="w-4 h-4" />
            {isSupervisorTab ? `Final Approve Selected (${selectedIds.size})` : `Forward to Supervisor (${selectedIds.size})`}
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-0 border-b border-gray-200 bg-white rounded-t-lg overflow-hidden shadow-sm">
        <button
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'staff'
              ? 'border-blue-600 text-blue-700 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => switchTab('staff')}
        >
          <ClipboardCheck className="w-4 h-4" />
          Pending Staff Review
          {staffPendingBookings.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === 'staff' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
            }`}>
              {staffPendingBookings.length}
            </span>
          )}
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'supervisor'
              ? 'border-amber-500 text-amber-700 bg-amber-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => switchTab('supervisor')}
        >
          <ShieldCheck className="w-4 h-4" />
          Pending Supervisor Approval
          {supervisorPendingBookings.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === 'supervisor' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
            }`}>
              {supervisorPendingBookings.length}
            </span>
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
            }`}>
              {processedBookings.length}
            </span>
          )}
        </button>
      </div>

      {/* Context Banner for Supervisor Tab */}
      {activeTab === 'supervisor' && supervisorPendingBookings.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Awaiting Supervisor / Manager Final Approval</p>
            <p className="text-sm text-amber-700 mt-0.5">
              The following bookings have been reviewed and approved by staff. A supervisor or manager must give final confirmation before bookings are confirmed and guests are notified.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pending Staff Review</p>
                <p className="text-2xl text-blue-600">{staffPendingBookings.length}</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-blue-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ad-hoc / Urgent</p>
                <p className="text-2xl text-amber-600">{adHocCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Individual</p>
                <p className="text-2xl text-indigo-600">{indCount}</p>
              </div>
              <User className="w-8 h-8 text-indigo-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Corporate</p>
                <p className="text-2xl text-blue-600">{corpCount}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Travel Agency</p>
                <p className="text-2xl text-purple-600">{agencyCount}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-200" />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'supervisor' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Awaiting Final Approval</p>
                <p className="text-2xl text-amber-600">{supervisorPendingBookings.length}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-amber-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Urgent / Ad-hoc</p>
                <p className="text-2xl text-red-500">{supAdHocCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-indigo-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Individual Accounts</p>
                <p className="text-2xl text-indigo-500">{supervisorPendingBookings.filter(b => b.accountType === 'Individual').length}</p>
              </div>
              <User className="w-8 h-8 text-indigo-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Corp / Agency</p>
                <p className="text-2xl text-blue-500">{supervisorPendingBookings.filter(b => b.accountType !== 'Individual').length}</p>
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
                <p className="text-xs text-gray-500 mb-1">Confirmed Bookings</p>
                <p className="text-2xl text-green-600">{confirmedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Rejected Bookings</p>
                <p className="text-2xl text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-200" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Processed</p>
                <p className="text-2xl text-gray-600">{processedBookings.length}</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-gray-200" />
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
              placeholder="Search by booking no., guest name, account no., flight no., company or agency name…"
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
            <Select value={adHocFilter} onValueChange={v => { setAdHocFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Booking Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="adhoc">Ad-hoc / Urgent</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
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

      {/* Empty state */}
      {filteredBookings.length === 0 && (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          {activeTab === 'staff' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-300 mb-4" />
              <p className="text-gray-700 mb-1">No pending bookings for staff review</p>
              <p className="text-sm text-gray-500">All bookings have been processed or forwarded to supervisor.</p>
            </>
          ) : activeTab === 'supervisor' ? (
            <>
              <ShieldCheck className="w-16 h-16 text-amber-300 mb-4" />
              <p className="text-gray-700 mb-1">No bookings awaiting supervisor approval</p>
              <p className="text-sm text-gray-500">All staff-approved bookings have been reviewed by a supervisor.</p>
            </>
          ) : (
            <>
              <ClipboardCheck className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-700 mb-1">No processed bookings found</p>
              <p className="text-sm text-gray-500">Confirmed and rejected bookings will appear here.</p>
            </>
          )}
        </Card>
      )}

      {/* Table */}
      {filteredBookings.length > 0 && (
        <Card>
          <div className="p-4 border-b flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
            </div>
            {renderPagination()}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${activeTab === 'supervisor' ? 'bg-amber-50' : activeTab === 'processed' ? 'bg-gray-50' : 'bg-gray-50'}`}>
                <tr>
                  {showCheckboxes && (
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={paginatedBookings.length > 0 && paginatedBookings.every(b => selectedIds.has(b.id))}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Booking No.</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Guest / Account</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Suite & Visit Date</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Flight</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Guests</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Services</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    {activeTab === 'processed' ? 'Status' : 'Submitted'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedBookings.map(booking => {
                  const statusRecord = bookingStatuses[booking.id];
                  return (
                    <React.Fragment key={booking.id}>
                      <tr
                        className={`hover:bg-gray-50 transition-colors ${booking.isAdHoc ? 'bg-amber-50' : ''} ${selectedIds.has(booking.id) ? 'bg-blue-50' : ''} ${activeTab === 'supervisor' ? 'hover:bg-amber-50' : ''}`}
                      >
                        {/* Checkbox */}
                        {showCheckboxes && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(booking.id)}
                              onChange={() => toggleSelect(booking.id)}
                              className="rounded"
                            />
                          </td>
                        )}

                        {/* Booking No */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {booking.isAdHoc && (
                              <span title="Ad-hoc booking — submitted within cut-off period">
                                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              </span>
                            )}
                            <span className="text-sm font-mono">{booking.bookingNo}</span>
                          </div>
                          
                          <div className="mt-1 flex flex-wrap gap-1">
                            {booking.requestType === 'New Booking Request' ? (
                              <Badge className="text-xs bg-green-100 text-green-700 border border-green-200">New</Badge>
                            ) : booking.requestType === 'Cancel' ? (
                              <Badge className="text-xs bg-red-100 text-red-700 border border-red-200">Cancel</Badge>
                            ) : (
                              <Badge className="text-xs bg-orange-100 text-orange-700 border border-orange-200">Edit</Badge>
                            )}
                            {activeTab === 'supervisor' && (
                              <Badge className="text-xs bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3" /> Awaiting Final
                              </Badge>
                            )}
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

                        {/* Suite & Date */}
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
                          {(booking.flightOrigin || booking.flightDestination) && (
                            <div className="text-xs text-gray-400">
                              {booking.flightOrigin || '—'} → {booking.flightDestination || '—'}
                            </div>
                          )}
                        </td>

                        {/* Guests */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div>{booking.numberOfGuests} pax</div>
                          {booking.nonFlyingGuests > 0 && (
                            <div className="text-xs text-gray-500">{booking.nonFlyingGuests} non-flying</div>
                          )}
                        </td>

                        {/* Services */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-1.5">
                            {booking.hasLimousine && <Car className="w-4 h-4 text-purple-500" title="Limousine Transfer" />}
                            {booking.hasShopping && <ShoppingBag className="w-4 h-4 text-green-500" title="In-lounge Shopping" />}
                            {!booking.hasLimousine && !booking.hasShopping && <span className="text-xs text-gray-400">—</span>}
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={`text-xs ${paymentModeBadgeClass(booking.paymentMode)}`}>
                            {booking.paymentMode}
                          </Badge>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {booking.agencyDiscountRate && booking.originalAmountValue ? (
                            <div className="space-y-0.5">
                              <p className="text-gray-400 line-through text-xs">HK${booking.originalAmountValue.toLocaleString()}</p>
                              <p className="text-green-700">{booking.amount}</p>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-xs">
                                <BadgePercent className="w-3 h-3" />{booking.agencyDiscountRate}% off
                              </span>
                            </div>
                          ) : (
                            <span>{booking.amount}</span>
                          )}
                        </td>

                        {/* Status / Submitted */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          {activeTab === 'processed' && statusRecord ? (
                            statusRecord.status === 'confirmed' ? (
                              <div className="flex items-center gap-1.5 text-green-700">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-medium">Confirmed</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-600">
                                <XCircle className="w-4 h-4" />
                                <span className="font-medium">Rejected</span>
                              </div>
                            )
                          ) : (
                            <div className="text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {booking.submittedAt.split(' ')[0]}
                              </div>
                              <div className="ml-4">{booking.submittedAt.split(' ')[1]}</div>
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
                              {expandedId === booking.id
                                ? <ChevronUp className="w-4 h-4" />
                                : <ChevronDown className="w-4 h-4" />}
                            </Button>
                            {onViewDetail && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                title="View Full Detail"
                                onClick={() => onViewDetail(booking.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {activeTab !== 'processed' && (
                              <Button
                                size="sm"
                                className={`h-8 px-3 gap-1 text-xs text-white ${
                                  activeTab === 'supervisor'
                                    ? 'bg-amber-600 hover:bg-amber-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                                onClick={() => startReview(booking, activeTab === 'supervisor' ? 'supervisor' : 'staff')}
                              >
                                {activeTab === 'supervisor'
                                  ? <><ShieldCheck className="w-3 h-3" /> Final Review</>
                                  : <><FileEdit className="w-3 h-3" /> Review</>}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expandedId === booking.id && (
                        <tr key={`expand-${booking.id}`} className={`border-b ${activeTab === 'supervisor' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                          <td colSpan={showCheckboxes ? 11 : 10} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {/* Booking Info */}
                              <div className="space-y-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Booking Info</p>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Booking No.:</span><span>{booking.bookingNo}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Booking Type:</span><span>{booking.bookingType}</span></div>
                                <div className="flex gap-2 items-start">
                                  <span className="text-gray-500 w-28 flex-shrink-0">Suite:</span>
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
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Visit Date/Time:</span><span>{booking.dateTime}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Ad-hoc:</span><span>{booking.isAdHoc ? <span className="text-amber-600">Yes — within cut-off period</span> : 'No'}</span></div>
                              </div>
                              {/* Guest & Account */}
                              <div className="space-y-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Guest & Account</p>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Guest Name:</span><span>{booking.guestName}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Account No.:</span><span>{booking.accountNo}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Account Type:</span><span>{booking.accountType}</span></div>
                                {booking.membershipTier && <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Membership:</span><span>{booking.membershipTier}</span></div>}
                                {booking.companyName && <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Company:</span><span>{booking.companyName}</span></div>}
                                {booking.agencyName && <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Agency:</span><span>{booking.agencyName} ({booking.agencyDiscountRate}% off)</span></div>}
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Total Guests:</span><span>{booking.numberOfGuests} pax{booking.nonFlyingGuests > 0 ? ` (${booking.nonFlyingGuests} non-flying)` : ''}</span></div>
                              </div>
                              {/* Payment & Special */}
                              <div className="space-y-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment & Notes</p>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Payment Mode:</span><span>{booking.paymentMode}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-28 flex-shrink-0">Amount:</span>
                                  <span>
                                    {booking.agencyDiscountRate && booking.originalAmountValue
                                      ? `${booking.amount} (orig. HK$${booking.originalAmountValue.toLocaleString()})`
                                      : booking.amount}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-500 w-28 flex-shrink-0">Services:</span>
                                  <span>
                                    {[booking.hasLimousine && 'Limousine', booking.hasShopping && 'Shopping'].filter(Boolean).join(', ') || '—'}
                                  </span>
                                </div>
                                {activeTab === 'supervisor' && (
                                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex gap-2">
                                    <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                                    <span><strong>Staff Review:</strong> Approved — awaiting your final confirmation.</span>
                                  </div>
                                )}
                                {activeTab === 'processed' && statusRecord && (
                                  <div className={`mt-2 p-2 rounded text-xs flex gap-2 ${statusRecord.status === 'confirmed' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                                    {statusRecord.status === 'confirmed'
                                      ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                      : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                                    <span>
                                      <strong>{statusRecord.status === 'confirmed' ? 'Confirmed' : 'Rejected'}</strong>
                                      {statusRecord.rejectedReason && ` — ${statusRecord.rejectedReason}`}
                                    </span>
                                  </div>
                                )}
                                {booking.specialRequests && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex gap-2">
                                    <Info className="w-4 h-4 flex-shrink-0 text-yellow-600 mt-0.5" />
                                    <span><strong>Special Request:</strong> {booking.specialRequests}</span>
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

      {/* ── Batch Approve Dialog ─────────────────────────────────────────────── */}
      <Dialog open={batchApproveOpen} onOpenChange={setBatchApproveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isSupervisorTab
                ? <><ShieldCheck className="w-5 h-5 text-amber-600" /> Final Approve {selectedIds.size} Booking{selectedIds.size !== 1 ? 's' : ''}</>
                : <><ThumbsUp className="w-5 h-5 text-green-600" /> Forward {selectedIds.size} Booking{selectedIds.size !== 1 ? 's' : ''} to Supervisor</>}
            </DialogTitle>
            <DialogDescription>
              {isSupervisorTab
                ? 'The following bookings will be confirmed and guests notified by email.'
                : 'The following bookings will be forwarded to a supervisor/manager for final approval. Guests will NOT be notified yet.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {Array.from(selectedIds).map(id => {
              const b = bookings.find(bk => bk.id === id);
              if (!b) return null;
              return (
                <div key={id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="font-mono text-xs">{b.bookingNo}</span>
                  <span className="text-gray-600">{b.guestName}</span>
                  <Badge className={`text-xs ${accountTypeBadgeClass(b.accountType)}`}>{b.accountType}</Badge>
                </div>
              );
            })}
          </div>
          {isSupervisorTab ? (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <MailCheck className="w-4 h-4 flex-shrink-0" />
              Final approval will confirm {selectedIds.size} booking{selectedIds.size !== 1 ? 's' : ''} and notify guests by email.
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              {selectedIds.size} booking{selectedIds.size !== 1 ? 's' : ''} will be queued for supervisor/manager final approval.
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBatchApproveOpen(false)}>Cancel</Button>
            <Button
              className={`gap-2 text-white ${isSupervisorTab ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
              onClick={handleBatchApprove}
            >
              {isSupervisorTab
                ? <><CheckCircle className="w-4 h-4" /> Confirm Final Approval</>
                : <><ShieldCheck className="w-4 h-4" /> Forward to Supervisor</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
