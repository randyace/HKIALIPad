import { useState } from 'react';
import { Search, Filter, Download, Eye, Edit2, Trash2, X, Calendar, Clock, User, AlertCircle, Plane, Car, ShoppingBag, CreditCard, Mail, FileText, CheckCircle, XCircle, RotateCcw, UserCheck, DollarSign, BadgePercent, Building2, Info, Loader2 } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

interface Booking {
  id: number;
  bookingNo: string;
  guestName: string;
  accountNo: string;
  suite: string;
  dateTime: string;
  flightNo: string;
  flightTime: string;
  flightOrigin?: string;
  flightDestination?: string;
  flightType: 'Arrival' | 'Departure' | 'Transit';
  bookingCategory: 'Agent Booking' | 'Corporate Booking' | 'Individual Booking' | 'Membership Booking' | 'AA Booking';
  status: 'Pending for Review' | 'Pending for Approval' | 'Approved' | 'Confirmed' | 'Rejected' | 'Cancelled' | 'No-show';
  paymentStatus: 'Not Required' | 'Pending' | 'Payment Link Sent' | 'Paid' | 'Overdue' | 'Refunded';
  services: string[];
  amount: string | 'Pending Calculation' | 'Re-calculation' | 'Manual Adjustment';
  numberOfGuests?: number;
  nonFlyingGuests?: number;
  isAdHoc?: boolean;
  hasLimousine?: boolean;
  hasShopping?: boolean;
  cutoffHours?: number;
  accountType?: 'Individual' | 'Corporate' | 'Agency';
  paymentMode?: 'Upfront' | 'On-Credit';
  rejectionReason?: string;
  bookingType: 'Online' | 'Email/Call to HKIAL';
  // Travel Agency discount fields
  agencyName?: string;
  agencyDiscountRate?: number;
  originalAmountValue?: number;
  finalAmountValue?: number;
}

// Travel Agency master data with default discount rates
const TRAVEL_AGENCY_DATA = [
  { name: 'Wings Travel Agency',  code: 'TA-WG-001', discountRate: 15 },
  { name: 'EGL Tours',            code: 'TA-EG-001', discountRate: 20 },
  { name: 'Hong Thai Travel',     code: 'TA-HT-001', discountRate: 10 },
  { name: 'Wing On Travel',       code: 'TA-WO-001', discountRate: 12 },
  { name: 'Klook Travel',         code: 'TA-KL-001', discountRate: 8  },
  { name: 'CTrip Hong Kong',      code: 'TA-CT-001', discountRate: 18 },
  { name: 'Jetour Holidays',      code: 'TA-JT-001', discountRate: 5  },
];

const generateMockBookings = (): Booking[] => {
  const names = ['John Smith', 'Mary Johnson', 'David Lee', 'Sarah Chen', 'Robert Wang', 'Emma Wilson', 'Michael Brown', 'Lisa Taylor', 'James Anderson', 'Sophia Martinez'];
  const suites = ['VIP Suite A', 'VIP Suite B', 'Executive Suite', 'Business Suite', 'Premier Suite', 'Open Lounge'];
  const statuses: Booking['status'][] = ['Pending for Review', 'Pending for Approval', 'Approved', 'Confirmed', 'Rejected', 'Cancelled', 'No-show'];
  const paymentStatuses: Booking['paymentStatus'][] = ['Not Required', 'Pending', 'Payment Link Sent', 'Paid', 'Overdue', 'Refunded'];
  const airlines = ['CX', 'BA', 'NH', 'SQ', 'QF', 'EK', 'LH'];
  const origins = ['LHR', 'NRT', 'SIN', 'SYD', 'LAX', 'DXB', 'FRA'];
  const destinations = ['TPE', 'ICN', 'BKK', 'SIN', 'NRT', 'PVG', 'KIX'];
  const accountTypes: Booking['accountType'][] = ['Individual', 'Corporate', 'Agency'];
  const paymentModes: Booking['paymentMode'][] = ['Upfront', 'On-Credit'];
  const flightTypes: Booking['flightType'][] = ['Arrival', 'Departure', 'Transit'];

  const bookings: Booking[] = [];
  for (let i = 1; i <= 48; i++) {
    const date = new Date(2024, 9, 25 + Math.floor(i / 10));
    const hour = 8 + (i % 12);
    const status = statuses[i % statuses.length];
    const paymentMode = paymentModes[i % paymentModes.length];
    const accountType = accountTypes[i % accountTypes.length];
    const flightType = flightTypes[i % flightTypes.length];

    // Booking number prefix based on flight type
    const prefix = flightType === 'Arrival' ? 'A' : flightType === 'Departure' ? 'D' : 'T';
    // Middle part: yyyymmdd
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const bookingNo = `${prefix}-${dateStr}-${String(i + 1).padStart(6, '0')}`;

    // Booking category based on account type
    let bookingCategory: Booking['bookingCategory'];
    if (accountType === 'Agency') {
      bookingCategory = 'Agent Booking';
    } else if (accountType === 'Corporate') {
      bookingCategory = 'Corporate Booking';
    } else {
      // Individual: distribute across Individual, Membership, AA Booking
      const mod = i % 5;
      if (mod === 0 || mod === 1) bookingCategory = 'Individual Booking';
      else if (mod === 2 || mod === 3) bookingCategory = 'Membership Booking';
      else bookingCategory = 'AA Booking';
    }

    // Flight origin/destination based on flightType
    let flightOrigin: string | undefined;
    let flightDestination: string | undefined;
    if (flightType === 'Arrival') {
      flightOrigin = origins[i % origins.length];
      flightDestination = 'HKG';
    } else if (flightType === 'Departure') {
      flightOrigin = 'HKG';
      flightDestination = destinations[i % destinations.length];
    } else {
      // Transit: passing through HKG
      flightOrigin = origins[i % origins.length];
      flightDestination = destinations[(i + 2) % destinations.length];
    }

    // Determine payment status based on booking status and payment mode
    let paymentStatus: Booking['paymentStatus'] = 'Not Required';
    if (paymentMode === 'Upfront') {
      if (status === 'Confirmed') paymentStatus = 'Paid';
      else if (status === 'Approved') paymentStatus = i % 3 === 0 ? 'Payment Link Sent' : 'Pending';
      else if (status === 'Cancelled') {
        if (i % 4 === 0) paymentStatus = 'Refunded';
        else if (i % 3 === 0) paymentStatus = 'Paid';
        else if (i % 5 === 0) paymentStatus = 'Payment Link Sent';
        else paymentStatus = 'Pending';
      }
      else if (status === 'Pending for Approval') paymentStatus = 'Pending';
    }
    
    const services: string[] = [];
    if (i % 3 === 0) services.push('Limousine Transfer');
    if (i % 4 === 0) services.push('In-lounge Shopping');
    if (i % 7 === 0) services.push('Wheelchair Assistance');
    if (i % 9 === 0) services.push('Private Sales');
    
    // Base numeric amount
    const baseAmount = 2500 + (i * 123) % 5000;

    // Determine amount string and agency discount
    let amount: Booking['amount'];
    let agencyName: string | undefined;
    let agencyDiscountRate: number | undefined;
    let originalAmountValue: number | undefined;
    let finalAmountValue: number | undefined;

    if (i % 13 === 0) {
      amount = 'Pending Calculation';
    } else if (i % 17 === 0) {
      amount = 'Re-calculation';
    } else if (i % 19 === 0) {
      amount = 'Manual Adjustment';
    } else {
      if (accountType === 'Agency') {
        // Auto-apply the agency's default discount rate
        const agency = TRAVEL_AGENCY_DATA[i % TRAVEL_AGENCY_DATA.length];
        agencyName = agency.name;
        agencyDiscountRate = agency.discountRate;
        originalAmountValue = baseAmount;
        finalAmountValue = Math.round(baseAmount * (1 - agency.discountRate / 100));
        amount = `HK$${finalAmountValue.toLocaleString()}`;
      } else {
        amount = `HK$${baseAmount.toLocaleString()}`;
      }
    }
    
    bookings.push({
      id: i,
      bookingNo,
      bookingCategory,
      flightType,
      guestName: names[i % names.length],
      accountNo: `ACC-20${23 + (i % 2)}-${String(1000 + i).slice(-4)}`,
      suite: suites[i % suites.length],
      dateTime: `${date.toISOString().split('T')[0]} ${String(hour).padStart(2, '0')}:${i % 2 === 0 ? '30' : '00'}`,
      flightNo: `${airlines[i % airlines.length]}${String(100 + i * 17).slice(-3)}`,
      flightTime: `${String(hour + 3).padStart(2, '0')}:${i % 2 === 0 ? '45' : '15'}`,
      flightOrigin,
      flightDestination,
      status,
      paymentStatus,
      services,
      amount,
      numberOfGuests: 1 + (i % 4),
      nonFlyingGuests: i % 5 === 0 ? 1 + (i % 2) : 0,
      isAdHoc: i % 8 === 0,
      hasLimousine: i % 3 === 0,
      hasShopping: i % 4 === 0,
      cutoffHours: i % 8 === 0 ? (12 + i % 36) : undefined,
      accountType,
      paymentMode,
      rejectionReason: status === 'Rejected' ? 'Suite not available for requested time slot' : undefined,
      bookingType: i % 2 === 0 ? 'Online' : 'Email/Call to HKIAL',
      agencyName,
      agencyDiscountRate,
      originalAmountValue,
      finalAmountValue,
    });
  }

  // ── Add explicit "Confirmed + Paid" bookings so they appear on page 1 ────────
  // These are pushed at high IDs so they sort to the top (descending order).
  const paidBookings: Booking[] = [
    {
      id: 55, bookingNo: 'D-20261015-000055', guestName: 'Catherine Wong', accountNo: 'ACC-2024-0055',
      suite: 'VIP Suite A', dateTime: '2026-10-15 10:30', flightNo: 'CX101', flightTime: '13:45',
      flightOrigin: 'HKG', flightDestination: 'NRT', flightType: 'Departure',
      bookingCategory: 'Individual Booking', status: 'Confirmed', paymentStatus: 'Paid',
      services: ['Limousine Transfer'], amount: 'HK$5,400', numberOfGuests: 3, nonFlyingGuests: 0,
      isAdHoc: false, hasLimousine: true, hasShopping: false, accountType: 'Individual',
      paymentMode: 'Upfront', bookingType: 'Online', originalAmountValue: 5400, finalAmountValue: 5400,
    },
    {
      id: 54, bookingNo: 'A-20261014-000054', guestName: 'Thomas Hughes', accountNo: 'ACC-2023-0054',
      suite: 'Executive Suite', dateTime: '2026-10-14 09:00', flightNo: 'BA027', flightTime: '12:15',
      flightOrigin: 'LHR', flightDestination: 'HKG', flightType: 'Arrival',
      bookingCategory: 'Membership Booking', status: 'Confirmed', paymentStatus: 'Paid',
      services: ['In-lounge Shopping'], amount: 'HK$3,800', numberOfGuests: 2, nonFlyingGuests: 0,
      isAdHoc: false, hasLimousine: false, hasShopping: true, accountType: 'Individual',
      paymentMode: 'Upfront', bookingType: 'Online', originalAmountValue: 3800, finalAmountValue: 3800,
    },
    {
      id: 53, bookingNo: 'T-20261013-000053', guestName: 'HSBC Group', accountNo: 'ACC-2023-0004',
      suite: 'Business Suite', dateTime: '2026-10-13 14:30', flightNo: 'SQ001', flightTime: '17:45',
      flightOrigin: 'SIN', flightDestination: 'NRT', flightType: 'Transit',
      bookingCategory: 'Corporate Booking', status: 'Confirmed', paymentStatus: 'Paid',
      services: ['Limousine Transfer', 'In-lounge Shopping'], amount: 'HK$8,700', numberOfGuests: 4, nonFlyingGuests: 1,
      isAdHoc: false, hasLimousine: true, hasShopping: true, accountType: 'Corporate',
      paymentMode: 'Upfront', bookingType: 'Email/Call to HKIAL', originalAmountValue: 8700, finalAmountValue: 8700,
    },
    {
      id: 52, bookingNo: 'D-20261012-000052', guestName: 'Helen Yuen', accountNo: 'ACC-2024-0052',
      suite: 'Premier Suite', dateTime: '2026-10-12 11:00', flightNo: 'QF108', flightTime: '14:30',
      flightOrigin: 'HKG', flightDestination: 'SYD', flightType: 'Departure',
      bookingCategory: 'AA Booking', status: 'Confirmed', paymentStatus: 'Paid',
      services: [], amount: 'HK$2,400', numberOfGuests: 2, nonFlyingGuests: 0,
      isAdHoc: false, hasLimousine: false, hasShopping: false, accountType: 'Individual',
      paymentMode: 'Upfront', bookingType: 'Online', originalAmountValue: 2400, finalAmountValue: 2400,
    },
    {
      id: 51, bookingNo: 'A-20261011-000051', guestName: 'EGL Tours Ltd', accountNo: 'ACC-2023-0005',
      suite: 'Open Lounge', dateTime: '2026-10-11 08:30', flightNo: 'EK384', flightTime: '11:15',
      flightOrigin: 'DXB', flightDestination: 'HKG', flightType: 'Arrival',
      bookingCategory: 'Agent Booking', status: 'Confirmed', paymentStatus: 'Paid',
      services: ['Limousine Transfer'], amount: 'HK$4,590',
      numberOfGuests: 3, nonFlyingGuests: 0, isAdHoc: false, hasLimousine: true, hasShopping: false,
      accountType: 'Agency', paymentMode: 'Upfront', bookingType: 'Email/Call to HKIAL',
      agencyName: 'EGL Tours', agencyDiscountRate: 20, originalAmountValue: 5738, finalAmountValue: 4590,
    },
  ];
  bookings.push(...paidBookings);

  return bookings;
};

const MOCK_BOOKINGS: Booking[] = generateMockBookings();

export interface BookingManagementProps {
  bookings?: Booking[];
  isLoading?: boolean;
  onViewDetail?: (bookingId: number) => void;
  onEditBooking?: (bookingId: number) => void;
  onDeleteBooking?: (bookingId: number, bookingNo: string) => void;
  onExportReport?: () => void;
}

export function BookingManagement({ bookings: bookingsProp, onViewDetail, onEditBooking, onDeleteBooking, onExportReport }: BookingManagementProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDemoInfo, setShowDemoInfo] = useState(true);
  const itemsPerPage = 10;

  const bookings: Booking[] = bookingsProp?.length ? bookingsProp : MOCK_BOOKINGS;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending for Review': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'Pending for Approval': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Approved': 'bg-green-100 text-green-800 border border-green-200',
      'Confirmed': 'bg-green-100 text-green-800 border border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border border-red-200',
      'Cancelled': 'bg-gray-100 text-gray-800 border border-gray-200',
      'No-show': 'bg-orange-100 text-orange-800 border border-orange-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Not Required': 'bg-gray-100 text-gray-600',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Payment Link Sent': 'bg-blue-100 text-blue-700',
      'Paid': 'bg-green-100 text-green-700',
      'Overdue': 'bg-red-100 text-red-700',
      'Refunded': 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getBookingCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Agent Booking':      'bg-purple-100 text-purple-700',
      'Corporate Booking':  'bg-blue-100 text-blue-700',
      'Individual Booking': 'bg-teal-100 text-teal-700',
      'Membership Booking': 'bg-indigo-100 text-indigo-700',
      'AA Booking':         'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getFlightTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Arrival':   'bg-emerald-100 text-emerald-700',
      'Departure': 'bg-rose-100 text-rose-700',
      'Transit':   'bg-sky-100 text-sky-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.bookingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.accountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.flightNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || booking.paymentStatus === paymentStatusFilter;
    
    // Booking Category filter logic
    let matchesBookingCategory = true;
    if (bookingCategoryFilter !== 'all') {
      if (bookingCategoryFilter === 'Agent Booking') {
        matchesBookingCategory = booking.accountType === 'Agency';
      } else if (bookingCategoryFilter === 'Corporate Booking') {
        matchesBookingCategory = booking.accountType === 'Corporate';
      } else if (bookingCategoryFilter === 'Individual Booking') {
        matchesBookingCategory = booking.accountType === 'Individual';
      }
      // Membership Booking and AA Booking logic will be added when explained
    }
    
    const matchesDateRange = !dateFrom || !dateTo || (new Date(booking.dateTime.split(' ')[0]) >= new Date(dateFrom) && new Date(booking.dateTime.split(' ')[0]) <= new Date(dateTo));
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesBookingCategory && matchesDateRange;
  }).sort((a, b) => b.id - a.id);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, -1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -2, totalPages);
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {pages.map((page, index) => {
            if (page === -1 || page === -2) {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Booking Management</h1>
          <p className="text-gray-600">Manage and review all lounge bookings</p>
        </div>
        <Button
          onClick={onExportReport}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* ── Client Demo Info Banner ─────────────────────────────────────────── */}
      {showDemoInfo && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <BadgePercent className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
                Travel Agency Auto-Discount — Sample Demonstration
                <span className="text-xs font-normal bg-green-200 text-green-800 px-2 py-0.5 rounded-full">For Client Review</span>
              </p>
              <p className="text-sm text-green-700 mb-3">
                Bookings made under a Travel Agency account automatically apply the agency's pre-configured default discount rate.
                The <strong>Amount column</strong> below shows the original price (struck through) and the discounted final amount with a badge.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { agency: 'Wings Travel Agency',  code: 'TA-WG-001', rate: 15 },
                  { agency: 'EGL Tours',            code: 'TA-EG-001', rate: 20 },
                  { agency: 'CTrip Hong Kong',      code: 'TA-CT-001', rate: 18 },
                  { agency: 'Wing On Travel',       code: 'TA-WO-001', rate: 12 },
                ].map(a => (
                  <div key={a.code} className="bg-white border border-green-200 rounded-md px-3 py-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Building2 className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-green-900 truncate">{a.agency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{a.code}</span>
                      <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-semibold">{a.rate}% off</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Filter by <strong>"Agent Booking"</strong> in the Booking Category dropdown to see only Travel Agency bookings with auto-discounts.
              </p>
            </div>
            <button
              onClick={() => setShowDemoInfo(false)}
              className="text-green-600 hover:text-green-800 flex-shrink-0 ml-2"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by booking number, guest name, account number, or flight number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Booking Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Booking Status</SelectItem>
                <SelectItem value="Pending for Review">Pending for Review</SelectItem>
                <SelectItem value="Pending for Approval">Pending for Approval</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="No-show">No-show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="Not Required">Not Required</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Payment Link Sent">Payment Link Sent</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bookingCategoryFilter} onValueChange={setBookingCategoryFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Booking Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Booking Category</SelectItem>
                <SelectItem value="Agent Booking">Agent Booking</SelectItem>
                <SelectItem value="Corporate Booking">Corporate Booking</SelectItem>
                <SelectItem value="Individual Booking">Individual Booking</SelectItem>
                <SelectItem value="Membership Booking">Membership Booking</SelectItem>
                <SelectItem value="AA Booking">AA Booking</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                placeholder="From date..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                placeholder="To date..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
          </div>
          <div>
            {renderPagination()}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Booking No.</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Guest Name</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Suite</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Flight Info</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Guests</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Services</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBookings.map((booking) => (
                <tr key={booking.id} className={`hover:bg-gray-50 ${booking.isAdHoc ? 'bg-amber-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-start gap-2">
                      {booking.isAdHoc && (
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" title="Ad-hoc booking (<48hrs)" />
                      )}
                      <div>
                        <div className="font-mono text-xs font-medium text-gray-900">{booking.bookingNo}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${getFlightTypeColor(booking.flightType)}`}>
                            {booking.flightType}
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${getBookingCategoryColor(booking.bookingCategory)}`}>
                            {booking.bookingCategory}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={() => onViewDetail?.(booking.id)}
                    >
                      {booking.guestName}
                    </button>
                    <div className="text-xs text-gray-500">{booking.accountNo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.suite}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="text-xs text-gray-500 mb-1">{booking.dateTime.split(' ')[0]}</div>
                    <div className="flex items-center gap-1">
                      <Plane className="w-3 h-3 text-gray-400" />
                      {booking.flightNo}
                    </div>
                    <div className="text-gray-600">{booking.flightTime}</div>
                    {(booking.flightOrigin || booking.flightDestination) && (
                      <div className="text-xs text-gray-500">
                        {booking.flightOrigin || '—'} → {booking.flightDestination || '—'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>{booking.numberOfGuests} pax</div>
                    {booking.nonFlyingGuests! > 0 && (
                      <div className="text-xs text-gray-600">{booking.nonFlyingGuests} non-flying</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {booking.hasLimousine && (
                        <Car className="w-4 h-4 text-purple-600" title="Limousine Transfer" />
                      )}
                      {booking.hasShopping && (
                        <ShoppingBag className="w-4 h-4 text-green-600" title="In-lounge Shopping" />
                      )}
                      {!booking.hasLimousine && !booking.hasShopping && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">{booking.paymentMode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {booking.agencyDiscountRate && booking.originalAmountValue ? (
                      <div className="space-y-0.5">
                        <p className="text-gray-400 line-through text-xs leading-tight">
                          HK${booking.originalAmountValue.toLocaleString()}
                        </p>
                        <p className="text-green-700 font-medium">{booking.amount}</p>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-xs">
                          <BadgePercent className="w-3 h-3" />
                          {booking.agencyDiscountRate}% off
                        </span>
                        {booking.agencyName && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />{booking.agencyName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span>{booking.amount}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail?.(booking.id)}
                        className="h-8 w-8 p-0"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditBooking?.(booking.id)}
                        className="h-8 w-8 p-0"
                        title="Edit Booking"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {onDeleteBooking && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteBooking?.(booking.id, booking.bookingNo)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Delete Booking"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length > 0 && (
          <div className="p-4 border-t flex justify-end">
            {renderPagination()}
          </div>
        )}
      </Card>
    </div>
  );
}