/**
 * __fixtures__/Dashboard.mocks.ts
 *
 * Fixture data for Dashboard.tsx.
 * This file is the ONLY place mock data lives.
 * Import `mockDashboardData` and spread it as default props during development.
 *
 * CI4 Smart Container usage:
 *   import Dashboard from '../Dashboard';
 *   <Dashboard {...apiData} onApproveBooking={...} onRejectBooking={...} />
 *
 * Standalone / Storybook usage:
 *   import { mockDashboardData } from './__fixtures__/Dashboard.mocks';
 *   <Dashboard {...mockDashboardData} onApproveBooking={noop} onRejectBooking={noop} />
 */

import type {
  DashboardKpiStat,
  DashboardBookingStatusStat,
  RecentBooking,
  PendingApproval,
  UpcomingArrival,
  LoungeOccupancyCount,
} from '../Dashboard';

// ─── KPI Stats ────────────────────────────────────────────────────────────────

export const mockKpiStats: DashboardKpiStat[] = [
  { label: 'Total Customers',  value: '2,847',    change: '+12%', changeDirection: 'up',   variant: 'customers' },
  { label: "Today's Bookings", value: '48',        change: '+8%',  changeDirection: 'up',   variant: 'bookings'  },
  { label: 'Pending Reviews',  value: '15',        change: '-3%',  changeDirection: 'down', variant: 'pending'   },
  { label: 'Income (MTD)',     value: 'HK$356K',   change: '+15%', changeDirection: 'up',   variant: 'income'    },
];

// ─── Booking Status Overview ──────────────────────────────────────────────────

export const mockBookingStatusStats: DashboardBookingStatusStat[] = [
  { label: 'Pending for Review',   value: 8,  variant: 'pending-review'   },
  { label: 'Pending for Approval', value: 7,  variant: 'pending-approval' },
  { label: 'Awaiting Payment',     value: 12, variant: 'awaiting-payment' },
  { label: 'Confirmed Today',      value: 21, variant: 'confirmed'        },
];

// ─── Recent Bookings ──────────────────────────────────────────────────────────

export const mockRecentBookings: RecentBooking[] = [
  {
    id: 'A-202602-001045',
    guestName: 'John Smith',
    suiteName: 'VIP Suite A',
    checkInTime: '14:30',
    flightNo: 'CX889',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    isAdHoc: false,
  },
  {
    id: 'A-202602-001046',
    guestName: 'Mary Johnson',
    suiteName: 'Executive Suite',
    checkInTime: '15:00',
    flightNo: 'BA031',
    status: 'Pending for Review',
    paymentStatus: 'Pending',
    isAdHoc: true,
  },
  {
    id: 'A-202602-001047',
    guestName: 'David Lee',
    suiteName: 'VIP Suite B',
    checkInTime: '16:30',
    flightNo: 'SQ001',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    isAdHoc: false,
  },
  {
    id: 'A-202602-001048',
    guestName: 'Sarah Chen',
    suiteName: 'Business Suite',
    checkInTime: '17:00',
    flightNo: 'NH859',
    status: 'Pending for Approval',
    paymentStatus: 'Pending',
    isAdHoc: false,
  },
  {
    id: 'A-202602-001049',
    guestName: 'Robert Wang',
    suiteName: 'Premier Suite',
    checkInTime: '18:00',
    flightNo: 'QF029',
    status: 'Approved',
    paymentStatus: 'Payment Link Sent',
    isAdHoc: false,
  },
];

// ─── Pending Approvals ────────────────────────────────────────────────────────

export const mockPendingApprovals: PendingApproval[] = [
  {
    id: 'A-202602-001046',
    guestName: 'Mary Johnson',
    type: 'New',
    bookingType: 'Ad-hoc Booking',
    suiteName: 'Executive Suite',
    submittedAgo: '30 mins ago',
    priority: 'urgent',
    bookingDate: '2026-03-08',
    checkInTime: '15:00',
    flightNo: 'BA031',
    flightDepartureTime: '18:30',
    pax: 2,
    specialRequests: 'Vegetarian meal required',
    contactPhone: '+852 9123 4567',
    accountType: 'Individual',
  },
  {
    id: 'A-202602-001052',
    guestName: 'David Chen',
    type: 'Edit',
    bookingType: 'VIP Suite A',
    suiteName: 'Premier Suite',
    submittedAgo: '1 hour ago',
    priority: 'normal',
    bookingDate: '2026-03-10',
    checkInTime: '10:00',
    flightNo: 'CX889',
    flightDepartureTime: '13:45',
    pax: 1,
    specialRequests: 'Changed from VIP Suite A to Premier Suite',
    contactPhone: '+852 9234 5678',
    accountType: 'Corporate',
    original: {
      suite: 'VIP Suite A',
      date: '2026-03-10',
      time: '10:00',
      pax: 1,
      flightNo: 'CX889',
      flightTime: '13:45',
    },
  },
  {
    id: 'A-202602-001038',
    guestName: 'Sarah Williams',
    type: 'Cancel',
    bookingType: 'Business Suite',
    suiteName: 'Business Suite',
    submittedAgo: '2 hours ago',
    priority: 'normal',
    bookingDate: '2026-03-12',
    checkInTime: '14:30',
    flightNo: 'SQ001',
    flightDepartureTime: '17:20',
    pax: 3,
    specialRequests: 'Cancellation reason: Travel plans changed',
    contactPhone: '+852 9345 6789',
    accountType: 'Individual',
  },
  {
    id: 'A-202602-001055',
    guestName: 'Michael Lee',
    type: 'New',
    bookingType: 'Corporate Booking',
    suiteName: 'VIP Suite B',
    submittedAgo: '3 hours ago',
    priority: 'normal',
    bookingDate: '2026-03-15',
    checkInTime: '09:30',
    flightNo: 'NH859',
    flightDepartureTime: '12:15',
    pax: 4,
    specialRequests: 'Meeting room setup required',
    contactPhone: '+852 9456 7890',
    accountType: 'Corporate',
  },
  {
    id: 'A-202602-001043',
    guestName: 'Emma Zhang',
    type: 'Edit',
    bookingType: 'Premier Suite',
    suiteName: 'VIP Suite A',
    submittedAgo: '5 hours ago',
    priority: 'urgent',
    bookingDate: '2026-03-09',
    checkInTime: '16:00',
    flightNo: 'QF029',
    flightDepartureTime: '19:45',
    pax: 2,
    specialRequests: 'Changed time from 14:00 to 16:00',
    contactPhone: '+852 9567 8901',
    accountType: 'Travel Agency',
    original: {
      suite: 'Premier Suite',
      date: '2026-03-09',
      time: '14:00',
      pax: 2,
      flightNo: 'QF029',
      flightTime: '19:45',
    },
  },
];

// ─── Upcoming Arrivals ────────────────────────────────────────────────────────

export const mockUpcomingArrivals: UpcomingArrival[] = [
  { timeSlot: '14:00–15:00', guestCount: 8,  flightCount: 6  },
  { timeSlot: '15:00–16:00', guestCount: 12, flightCount: 9  },
  { timeSlot: '16:00–17:00', guestCount: 15, flightCount: 11 },
  { timeSlot: '17:00–18:00', guestCount: 9,  flightCount: 7  },
];

// ─── Lounge Occupancy ─────────────────────────────────────────────────────────

export const mockLoungeOccupancy: LoungeOccupancyCount = {
  available: 8,
  occupied:  12,
  foodServed: 5,
  cleaning:  3,
};

// ─── Composed default props object ───────────────────────────────────────────
// Spread this as default props on the Dashboard component.

export const mockDashboardData = {
  kpiStats:            mockKpiStats,
  bookingStatusStats:  mockBookingStatusStats,
  recentBookings:      mockRecentBookings,
  pendingApprovals:    mockPendingApprovals,
  upcomingArrivals:    mockUpcomingArrivals,
  loungeOccupancy:     mockLoungeOccupancy,
} as const;
