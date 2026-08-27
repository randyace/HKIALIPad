/**
 * BookingApprovalQueueView.tsx
 *
 * New view per refactor spec (item 20).
 * Pure presentational component — zero internal business state.
 * CI4 container passes real bookings; empty array renders an empty view.
 */

import { useState } from 'react';
import {
  Search, Calendar, CheckCircle, XCircle, Eye, Clock, RotateCcw,
  Building2, Plane, User, BadgePercent, ChevronDown, ChevronUp,
  Filter, AlertCircle,
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './ui/select';
import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from './ui/pagination';

// ── Types ─────────────────────────────────────────────────────────────────────

export type QueueRequestType = 'New Booking Request' | 'Edit Booking Request' | 'Cancel';
export type QueueAccountType = 'Individual' | 'Corporate' | 'Agency';
export type QueuePaymentMode = 'Upfront' | 'Net Upfront' | 'On-Credit' | 'Bulk Purchase/Monthly Invoice';

export interface QueueBooking {
  id: number;
  bookingNo: string;
  requestType: QueueRequestType;
  guestName: string;
  accountNo: string;
  accountType: QueueAccountType;
  membershipTier?: 'Gold' | 'Platinum' | 'Diamond' | 'Sapphire';
  companyName?: string;
  agencyName?: string;
  suite: string;
  dateTime: string;
  flightNo: string;
  flightTime: string;
  numberOfGuests: number;
  nonFlyingGuests: number;
  paymentMode: QueuePaymentMode;
  amount: string;
  submittedAt: string;
  isAdHoc?: boolean;
}

// ── MOCK data (isolated — container replaces via props) ───────────────────────

const MOCK_QUEUE_BOOKINGS: QueueBooking[] = [
  {
    id: 1, bookingNo: 'A-202604-000001', requestType: 'New Booking Request',
    guestName: 'James Hoffmann', accountNo: 'ACC-2026-0101', accountType: 'Individual',
    membershipTier: 'Gold', suite: 'Premier Suite A',
    dateTime: '2026-04-15 09:00', flightNo: 'CX234', flightTime: '12:30',
    numberOfGuests: 2, nonFlyingGuests: 0, paymentMode: 'Upfront',
    amount: 'HK$7,600', submittedAt: '2026-04-10 14:22', isAdHoc: false,
  },
  {
    id: 2, bookingNo: 'A-202604-000002', requestType: 'Edit Booking Request',
    guestName: 'Cathay Pacific Airways', accountNo: 'CORP-2024-0001', accountType: 'Corporate',
    companyName: 'Cathay Pacific Airways', suite: 'VIP Suite A',
    dateTime: '2026-04-16 08:30', flightNo: 'BA027', flightTime: '11:15',
    numberOfGuests: 4, nonFlyingGuests: 1, paymentMode: 'Bulk Purchase/Monthly Invoice',
    amount: 'HK$22,000', submittedAt: '2026-04-10 15:05', isAdHoc: false,
  },
  {
    id: 3, bookingNo: 'A-202604-000003', requestType: 'New Booking Request',
    guestName: 'Wings Travel — Sarah Lee', accountNo: 'TA-WG-001-ACC', accountType: 'Agency',
    agencyName: 'Wings Travel Agency', suite: 'Lounge Deluxe',
    dateTime: '2026-04-17 11:00', flightNo: 'SQ001', flightTime: '14:20',
    numberOfGuests: 3, nonFlyingGuests: 0, paymentMode: 'On-Credit',
    amount: 'HK$9,180', submittedAt: '2026-04-10 16:44', isAdHoc: false,
  },
  {
    id: 4, bookingNo: 'A-202604-000004', requestType: 'Cancel',
    guestName: 'Michael Brown', accountNo: 'ACC-2025-0204', accountType: 'Individual',
    membershipTier: 'Platinum', suite: 'Business Suite',
    dateTime: '2026-04-18 10:00', flightNo: 'NH872', flightTime: '13:45',
    numberOfGuests: 1, nonFlyingGuests: 0, paymentMode: 'Upfront',
    amount: 'HK$3,200', submittedAt: '2026-04-10 17:02', isAdHoc: false,
  },
  {
    id: 5, bookingNo: 'A-202604-000005', requestType: 'New Booking Request',
    guestName: 'Emma Wilson', accountNo: 'ACC-2025-0087', accountType: 'Individual',
    membershipTier: 'Diamond', suite: 'Open Lounge',
    dateTime: '2026-04-19 07:30', flightNo: 'QF30', flightTime: '10:55',
    numberOfGuests: 2, nonFlyingGuests: 1, paymentMode: 'Upfront',
    amount: 'HK$5,400', submittedAt: '2026-04-10 09:15', isAdHoc: true,
  },
];

// ── Props interface ───────────────────────────────────────────────────────────

export interface BookingApprovalQueueProps {
  /** Pass populated array from CI4; empty array renders an empty view */
  bookings?: QueueBooking[];
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onSendBack?: (id: number) => void;
  onViewDetail?: (id: number) => void;
  mode?: 'staff' | 'supervisor';
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

// ── Helper colours ────────────────────────────────────────────────────────────

function requestTypeBadge(type: QueueRequestType) {
  if (type === 'New Booking Request') return 'bg-green-100 text-green-800 border border-green-200';
  if (type === 'Edit Booking Request') return 'bg-blue-100 text-blue-800 border border-blue-200';
  return 'bg-red-100 text-red-700 border border-red-200';
}

function accountTypeBadge(type: QueueAccountType) {
  if (type === 'Individual')    return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
  if (type === 'Corporate')     return 'bg-sky-100 text-sky-800 border border-sky-200';
  return 'bg-purple-100 text-purple-800 border border-purple-200';
}

function tierBadge(tier?: string) {
  if (tier === 'Diamond')  return 'bg-cyan-100 text-cyan-800';
  if (tier === 'Platinum') return 'bg-slate-100 text-slate-700';
  if (tier === 'Gold')     return 'bg-yellow-100 text-yellow-800';
  if (tier === 'Sapphire') return 'bg-indigo-100 text-indigo-700';
  return 'bg-gray-100 text-gray-600';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BookingApprovalQueue({
  bookings: bookingsProp = [],
  onApprove = () => {},
  onReject  = () => {},
  onSendBack = () => {},
  onViewDetail = () => {},
  mode = 'staff',
  isLoading  = false,
  page       = 1,
  totalPages = 1,
  onPageChange = () => {},
}: BookingApprovalQueueProps) {
  const displayBookings = bookingsProp.length > 0 ? bookingsProp : [];

  // Local UI-only state
  const [searchTerm,    setSearchTerm]    = useState('');
  const [filterType,    setFilterType]    = useState<'all' | QueueAccountType>('all');
  const [filterRequest, setFilterRequest] = useState<'all' | QueueRequestType>('all');
  const [sortField,     setSortField]     = useState<'submittedAt' | 'dateTime'>('submittedAt');
  const [sortDir,       setSortDir]       = useState<'asc' | 'desc'>('desc');
  const [expandedId,    setExpandedId]    = useState<number | null>(null);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const filtered = displayBookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchQ = !q || b.bookingNo.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) || b.accountNo.toLowerCase().includes(q) ||
      b.suite.toLowerCase().includes(q) || b.flightNo.toLowerCase().includes(q);
    const matchType = filterType === 'all' || b.accountType === filterType;
    const matchReq  = filterRequest === 'all' || b.requestType === filterRequest;
    return matchQ && matchType && matchReq;
  }).sort((a, b) => {
    const va = sortField === 'submittedAt' ? a.submittedAt : a.dateTime;
    const vb = sortField === 'submittedAt' ? b.submittedAt : b.dateTime;
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />
      : null;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center text-gray-400 space-y-2">
          <Clock className="w-8 h-8 mx-auto animate-spin" />
          <p>Loading booking queue…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Booking Approval Queue
          </h1>
          <p className="text-gray-500 mt-0.5">
            {filtered.length} pending request{filtered.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search booking no., guest, account, suite or flight…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <Select value={filterType} onValueChange={v => setFilterType(v as typeof filterType)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Account Types</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Agency">Agency</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRequest} onValueChange={v => setFilterRequest(v as typeof filterRequest)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Request type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Request Types</SelectItem>
              <SelectItem value="New Booking Request">New Booking</SelectItem>
              <SelectItem value="Edit Booking Request">Edit Booking</SelectItem>
              <SelectItem value="Cancel">Cancel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Booking No.</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Request</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Guest / Account</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Suite &amp; Flight</th>
                <th
                  className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide cursor-pointer select-none"
                  onClick={() => toggleSort('dateTime')}
                >
                  Visit Date <SortIcon field="dateTime" />
                </th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Amount</th>
                <th
                  className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide cursor-pointer select-none"
                  onClick={() => toggleSort('submittedAt')}
                >
                  Submitted <SortIcon field="submittedAt" />
                </th>
                <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wide text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No bookings match your current filters.</p>
                  </td>
                </tr>
              ) : filtered.map(booking => (
                <>
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                  >
                    {/* Booking No */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-700">{booking.bookingNo}</span>
                        {booking.isAdHoc && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Ad-hoc</span>
                        )}
                      </div>
                    </td>

                    {/* Request type */}
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${requestTypeBadge(booking.requestType)}`}>
                        {booking.requestType === 'New Booking Request' ? 'New'
                          : booking.requestType === 'Edit Booking Request' ? 'Edit'
                          : 'Cancel'}
                      </Badge>
                    </td>

                    {/* Guest / Account */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-gray-900">{booking.guestName}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-gray-400">{booking.accountNo}</span>
                          <Badge className={`text-xs px-1.5 py-0 ${accountTypeBadge(booking.accountType)}`}>
                            {booking.accountType === 'Agency' ? 'TA' : booking.accountType.slice(0, 4)}
                          </Badge>
                          {booking.membershipTier && (
                            <Badge className={`text-xs px-1.5 py-0 ${tierBadge(booking.membershipTier)}`}>
                              {booking.membershipTier}
                            </Badge>
                          )}
                        </div>
                        {booking.companyName && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />{booking.companyName}
                          </p>
                        )}
                        {booking.agencyName && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <BadgePercent className="w-3 h-3" />{booking.agencyName}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Suite & Flight */}
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{booking.suite || '—'}</p>
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
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1.5">
                        <Plane className="w-3 h-3" />{booking.flightNo} · {booking.flightTime}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {booking.numberOfGuests} VIP{booking.nonFlyingGuests > 0 ? ` + ${booking.nonFlyingGuests} NF` : ''}
                      </p>
                    </td>

                    {/* Visit date */}
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-xs">
                        <Calendar className="w-3 h-3 inline mr-1 text-gray-400" />
                        {booking.dateTime}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right">
                      <p className="text-gray-800">{booking.amount}</p>
                      <p className="text-xs text-gray-400">{booking.paymentMode}</p>
                    </td>

                    {/* Submitted */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500">{booking.submittedAt}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-blue-600"
                          onClick={() => onViewDetail(booking.id)}
                          title="View detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onApprove(booking.id)}
                          title={mode === 'staff' ? 'Approve & Forward' : 'Final Approve'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        {mode === 'supervisor' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-blue-600 hover:bg-blue-50"
                            onClick={() => onSendBack?.(booking.id)}
                            title="Send Back"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-red-600 hover:bg-red-50"
                          onClick={() => onReject(booking.id)}
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded quick-detail row */}
                  {expandedId === booking.id && (
                    <tr key={`exp-${booking.id}`} className="bg-blue-50/40">
                      <td colSpan={8} className="px-6 py-3">
                        <div className="grid grid-cols-4 gap-4 text-xs text-gray-600">
                          <div>
                            <label className="block text-gray-400 mb-[10px]">Account Type</label>
                            <p>{booking.accountType}</p>
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-[10px]">Payment Mode</label>
                            <p>{booking.paymentMode}</p>
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-[10px]">Guests</label>
                            <p>{booking.numberOfGuests} VIP · {booking.nonFlyingGuests} Non-Flying</p>
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-[10px]">Flight</label>
                            <p>{booking.flightNo} @ {booking.flightTime}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && onPageChange(page - 1)}
                className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <PaginationItem key={p}>
                <PaginationLink onClick={() => onPageChange(p)} isActive={page === p} className="cursor-pointer">
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            {totalPages > 5 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && onPageChange(page + 1)}
                className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
