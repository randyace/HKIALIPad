/**
 * BookingDetailMocks.ts
 *
 * All mock / seed data for BookingDetail.tsx.
 * Extracted to keep BookingDetail.tsx below Babel's 500 KB parse limit.
 * CI4 Smart Container replaces all these with real API data — this file
 * is only used during design review / development.
 */

// ── Core booking interface ────────────────────────────────────────────────────

export interface Booking {
  id: number;
  bookingNo: string;
  guestName: string;
  accountNo: string;
  /**
   * Legacy field — the first assigned suite's name (e.g. "CIP 1"),
   * surfaced on review / approval list pages.
   */
  suite: string;
  /** Physical suites (CIP 1-6, Function Room) assigned to this booking. */
  assignedSuiteNames?: string[];
  /** Physical lounge seats (Lobby 1-8) assigned to this booking. */
  assignedLoungeNames?: string[];
  dateTime: string;
  flightType?: 'Arrival' | 'Departure';
  arrivalDate?: string;
  flightNo: string;
  flightTime: string;
  flightOrigin?: string;
  flightDestination?: string;
  numberOfLuggage?: number;
  flightClass?: 'Economy Class' | 'Business Class' | 'First Class';
  status: 'Pending for Review' | 'Pending for Approval' | 'Approved' | 'Confirmed' | 'Rejected' | 'Cancelled' | 'No-show';
  paymentStatus: 'Not Required' | 'Pending' | 'Payment Link Sent' | 'Paid' | 'Overdue' | 'Refunded';
  services: string[];
  amount: string | 'Pending Calculation' | 'Re-calculation' | 'Manual Adjustment';
  totalPrice?: number;
  priceBreakdown?: Array<{
    key: string;
    label: string;
    qty: number;
    unit_price: number;
    subtotal: number;
    note?: string;
  }>;
  numberOfGuests?: number;
  nonFlyingGuests?: number;
  numberOfPremiereSuites?: number;
  vipPassengersInPremiereSuite?: number;
  nonFlyingGuestsInPremiereSuite?: number;
  vipPassengersInLoungeDeluxe?: number;
  nonFlyingGuestsInLoungeDeluxe?: number;
  isAdHoc?: boolean;
  hasLimousine?: boolean;
  hasShopping?: boolean;
  cutoffHours?: number;
  accountType?: 'Individual' | 'Corporate' | 'Travel Agency';
  paymentMode?: 'Upfront' | 'On-Credit';
  rejectionReason?: string;
  bookingType: 'Online' | 'Email/Call to HKIAL';
  agencyName?: string;
  agencyCode?: string;
  agencyDiscountRate?: number;
  originalAmountValue?: number;
  finalAmountValue?: number;
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    memo?: string;
  };
  passengers?: Array<{
    title?: string;
    firstName?: string;
    lastName?: string;
    travelDocNo?: string;
    membershipNo?: string;
    ageGroup?: string;
    birthdayDay?: string;
    birthdayMonth?: string;
    birthdayYear?: string;
    foodAllergies?: string;
  }>;
}

// ── Passenger form types ──────────────────────────────────────────────────────

export type PassengerTitle = 'Mr' | 'Mrs' | 'Miss' | '';
export type AgeGroup = 'Adult (13+ years)' | 'Child (2-12 years)' | 'Infant (0-2 years)' | '';

export interface PassengerDetail {
  title: PassengerTitle;
  firstName: string;
  lastName: string;
  travelDocNo: string;
  membershipNo: string;
  ageGroup: AgeGroup;
  birthdayDay: string;
  birthdayMonth: string;
  birthdayYear: string;
  foodAllergies: string;
}

export const emptyPassenger = (): PassengerDetail => ({
  title: '', firstName: '', lastName: '',
  travelDocNo: '', membershipNo: '', ageGroup: '',
  birthdayDay: '', birthdayMonth: '', birthdayYear: '',
  foodAllergies: '',
});

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Non-Flying Guest types ────────────────────────────────────────────────────

export interface NonFlyingGuest {
  title: PassengerTitle;
  firstName: string;
  lastName: string;
  ageGroup: AgeGroup;
  foodAllergies: string;
}

export const emptyNonFlyingGuest = (): NonFlyingGuest => ({
  title: '', firstName: '', lastName: '', ageGroup: '', foodAllergies: '',
});

// ── Historical guest registry ─────────────────────────────────────────────────

export interface HistoricalGuest {
  id: number;
  name: string;
  type: 'VIP Passenger' | 'Non-Flying Guest';
  ageGroup: string;
  lastVisit: string;
  bookingNo: string;
  totalVisits: number;
  foodAllergies: string;
}

export const HISTORICAL_GUESTS: HistoricalGuest[] = [
  { id: 1,  name: 'Mr John Smith',       type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-14', bookingNo: 'A-202602-000023', totalVisits: 18, foodAllergies: 'Shellfish, Peanuts' },
  { id: 2,  name: 'Mrs Mary Johnson',    type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-30', bookingNo: 'A-202601-000078', totalVisits: 12, foodAllergies: '' },
  { id: 3,  name: 'Miss Sarah Chen',     type: 'Non-Flying Guest', ageGroup: 'Child (2-12 years)', lastVisit: '2026-02-05', bookingNo: 'A-202602-000011', totalVisits: 4,  foodAllergies: 'Dairy, Eggs' },
  { id: 4,  name: 'Mr David Lee',        type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-12-20', bookingNo: 'A-202512-000199', totalVisits: 7,  foodAllergies: 'Tree Nuts' },
  { id: 5,  name: 'Mrs Linda Brown',     type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-20', bookingNo: 'A-202602-000041', totalVisits: 9,  foodAllergies: 'Sesame' },
  { id: 6,  name: 'Mr Robert Wang',      type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-10', bookingNo: 'A-202601-000033', totalVisits: 31, foodAllergies: '' },
  { id: 7,  name: 'Mrs Emma Wilson',     type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-11-28', bookingNo: 'A-202511-000154', totalVisits: 5,  foodAllergies: 'Gluten' },
  { id: 8,  name: 'Miss Sophie Martin',  type: 'Non-Flying Guest', ageGroup: 'Child (2-12 years)', lastVisit: '2026-02-03', bookingNo: 'A-202602-000007', totalVisits: 3,  foodAllergies: 'Peanuts, Tree Nuts' },
  { id: 9,  name: 'Mr James Taylor',     type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-22', bookingNo: 'A-202601-000091', totalVisits: 6,  foodAllergies: '' },
  { id: 10, name: 'Mr Kevin Zhang',      type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-18', bookingNo: 'A-202602-000055', totalVisits: 14, foodAllergies: '' },
  { id: 11, name: 'Mrs Olivia Harris',   type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2025-12-05', bookingNo: 'A-202512-000088', totalVisits: 2,  foodAllergies: 'Shellfish' },
  { id: 12, name: 'Miss Chloe Nguyen',   type: 'Non-Flying Guest', ageGroup: 'Infant (0-2 years)', lastVisit: '2026-01-15', bookingNo: 'A-202601-000044', totalVisits: 1,  foodAllergies: 'Dairy' },
  { id: 13, name: 'Mr Michael Brown',    type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-25', bookingNo: 'A-202602-000070', totalVisits: 22, foodAllergies: 'Soy, Wheat' },
  { id: 14, name: 'Mrs Lisa Taylor',     type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-10-30', bookingNo: 'A-202510-000210', totalVisits: 8,  foodAllergies: '' },
  { id: 15, name: 'Mr James Anderson',   type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-10', bookingNo: 'A-202602-000029', totalVisits: 16, foodAllergies: 'Peanuts' },
  { id: 16, name: 'Mrs Sophia Martinez', type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-08', bookingNo: 'A-202601-000012', totalVisits: 3,  foodAllergies: 'Mustard, Celery' },
  { id: 17, name: 'Mr Thomas Hughes',    type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-22', bookingNo: 'A-202602-000061', totalVisits: 40, foodAllergies: '' },
  { id: 18, name: 'Miss Grace Liu',      type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-12-12', bookingNo: 'A-202512-000133', totalVisits: 11, foodAllergies: 'Fish, Shellfish' },
  { id: 19, name: 'Mr William Park',     type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-27', bookingNo: 'A-202601-000067', totalVisits: 5,  foodAllergies: '' },
  { id: 20, name: 'Mrs Helen Yuen',      type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-01', bookingNo: 'A-202602-000003', totalVisits: 28, foodAllergies: 'Lactose' },
  { id: 21, name: 'Mr Aaron Chow',       type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-11-14', bookingNo: 'A-202511-000099', totalVisits: 9,  foodAllergies: '' },
  { id: 22, name: 'Miss Rachel Lam',     type: 'Non-Flying Guest', ageGroup: 'Child (2-12 years)', lastVisit: '2026-02-17', bookingNo: 'A-202602-000048', totalVisits: 2,  foodAllergies: 'Egg, Peanuts' },
  { id: 23, name: 'Mr Daniel Ho',        type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2026-02-28', bookingNo: 'A-202602-000082', totalVisits: 7,  foodAllergies: 'Penicillin-related foods' },
  { id: 24, name: 'Mrs Catherine Wong',  type: 'VIP Passenger',    ageGroup: 'Adult (13+ years)',  lastVisit: '2025-12-31', bookingNo: 'A-202512-000251', totalVisits: 19, foodAllergies: '' },
  { id: 25, name: 'Mr Lucas Ferreira',   type: 'Non-Flying Guest', ageGroup: 'Adult (13+ years)',  lastVisit: '2026-01-19', bookingNo: 'A-202601-000055', totalVisits: 1,  foodAllergies: 'Tree Nuts, Sesame' },
];

// ── Travel agency reference data ──────────────────────────────────────────────

export const DETAIL_AGENCY_DATA = [
  { name: 'Wings Travel Agency', code: 'TA-WG-001', discountRate: 15 },
  { name: 'EGL Tours',           code: 'TA-EG-001', discountRate: 20 },
  { name: 'Hong Thai Travel',    code: 'TA-HT-001', discountRate: 10 },
  { name: 'Wing On Travel',      code: 'TA-WO-001', discountRate: 12 },
  { name: 'Klook Travel',        code: 'TA-KL-001', discountRate: 8  },
  { name: 'CTrip Hong Kong',     code: 'TA-CT-001', discountRate: 18 },
  { name: 'Jetour Holidays',     code: 'TA-JT-001', discountRate: 5  },
];

// ── Explicit booking overrides (makes detail page match the list page) ─────────

export const EXPLICIT_BOOKING_OVERRIDES: Record<number, Partial<Booking>> = {
  55: {
    bookingNo: 'D-20261015-000055', guestName: 'Catherine Wong', accountNo: 'ACC-2024-0055',
    suite: 'VIP Suite A', dateTime: '2026-10-15 10:30', flightType: 'Departure',
    arrivalDate: '2026-10-15', flightNo: 'CX101', flightTime: '13:45',
    flightOrigin: 'HKG', flightDestination: 'NRT', flightClass: 'Business Class',
    status: 'Confirmed', paymentStatus: 'Paid', paymentMode: 'Upfront',
    services: ['Limousine Transfer'], amount: 'HK$5,400',
    numberOfGuests: 3, nonFlyingGuests: 0, hasLimousine: true, hasShopping: false,
    numberOfPremiereSuites: 0, vipPassengersInPremiereSuite: 0, nonFlyingGuestsInPremiereSuite: 0,
    vipPassengersInLoungeDeluxe: 3, nonFlyingGuestsInLoungeDeluxe: 0,
    isAdHoc: false, accountType: 'Individual', bookingType: 'Online',
    rejectionReason: undefined, originalAmountValue: 5400, finalAmountValue: 5400,
    agencyName: undefined, agencyCode: undefined, agencyDiscountRate: undefined,
  },
  54: {
    bookingNo: 'A-20261014-000054', guestName: 'Thomas Hughes', accountNo: 'ACC-2023-0054',
    suite: 'Executive Suite', dateTime: '2026-10-14 09:00', flightType: 'Arrival',
    arrivalDate: '2026-10-14', flightNo: 'BA027', flightTime: '12:15',
    flightOrigin: undefined, flightDestination: 'HKG', flightClass: 'First Class',
    status: 'Confirmed', paymentStatus: 'Paid', paymentMode: 'Upfront',
    services: ['In-lounge Shopping'], amount: 'HK$3,800',
    numberOfGuests: 2, nonFlyingGuests: 0, hasLimousine: false, hasShopping: true,
    numberOfPremiereSuites: 0, vipPassengersInPremiereSuite: 0, nonFlyingGuestsInPremiereSuite: 0,
    vipPassengersInLoungeDeluxe: 2, nonFlyingGuestsInLoungeDeluxe: 0,
    isAdHoc: false, accountType: 'Individual', bookingType: 'Online',
    rejectionReason: undefined, originalAmountValue: 3800, finalAmountValue: 3800,
    agencyName: undefined, agencyCode: undefined, agencyDiscountRate: undefined,
  },
  53: {
    bookingNo: 'T-20261013-000053', guestName: 'HSBC Group', accountNo: 'ACC-2023-0004',
    suite: 'Business Suite', dateTime: '2026-10-13 14:30', flightType: 'Departure',
    arrivalDate: '2026-10-13', flightNo: 'SQ001', flightTime: '17:45',
    flightOrigin: 'SIN', flightDestination: 'NRT', flightClass: 'Business Class',
    status: 'Confirmed', paymentStatus: 'Paid', paymentMode: 'Upfront',
    services: ['Limousine Transfer', 'In-lounge Shopping'], amount: 'HK$8,700',
    numberOfGuests: 4, nonFlyingGuests: 1, hasLimousine: true, hasShopping: true,
    numberOfPremiereSuites: 0, vipPassengersInPremiereSuite: 0, nonFlyingGuestsInPremiereSuite: 0,
    vipPassengersInLoungeDeluxe: 4, nonFlyingGuestsInLoungeDeluxe: 1,
    isAdHoc: false, accountType: 'Corporate', bookingType: 'Email/Call to HKIAL',
    rejectionReason: undefined, originalAmountValue: 8700, finalAmountValue: 8700,
    agencyName: undefined, agencyCode: undefined, agencyDiscountRate: undefined,
  },
  52: {
    bookingNo: 'D-20261012-000052', guestName: 'Helen Yuen', accountNo: 'ACC-2024-0052',
    suite: 'Premier Suite', dateTime: '2026-10-12 11:00', flightType: 'Departure',
    arrivalDate: '2026-10-12', flightNo: 'QF108', flightTime: '14:30',
    flightOrigin: 'HKG', flightDestination: 'SYD', flightClass: 'Economy Class',
    status: 'Confirmed', paymentStatus: 'Paid', paymentMode: 'Upfront',
    services: [], amount: 'HK$2,400',
    numberOfGuests: 2, nonFlyingGuests: 0, hasLimousine: false, hasShopping: false,
    numberOfPremiereSuites: 0, vipPassengersInPremiereSuite: 0, nonFlyingGuestsInPremiereSuite: 0,
    vipPassengersInLoungeDeluxe: 2, nonFlyingGuestsInLoungeDeluxe: 0,
    isAdHoc: false, accountType: 'Individual', bookingType: 'Online',
    rejectionReason: undefined, originalAmountValue: 2400, finalAmountValue: 2400,
    agencyName: undefined, agencyCode: undefined, agencyDiscountRate: undefined,
  },
  51: {
    bookingNo: 'A-20261011-000051', guestName: 'EGL Tours Ltd', accountNo: 'ACC-2023-0005',
    suite: 'Open Lounge', dateTime: '2026-10-11 08:30', flightType: 'Arrival',
    arrivalDate: '2026-10-11', flightNo: 'EK384', flightTime: '11:15',
    flightOrigin: 'DXB', flightDestination: 'HKG', flightClass: 'Economy Class',
    status: 'Confirmed', paymentStatus: 'Paid', paymentMode: 'Upfront',
    services: ['Limousine Transfer'], amount: 'HK$4,590',
    numberOfGuests: 3, nonFlyingGuests: 0, hasLimousine: true, hasShopping: false,
    numberOfPremiereSuites: 0, vipPassengersInPremiereSuite: 0, nonFlyingGuestsInPremiereSuite: 0,
    vipPassengersInLoungeDeluxe: 3, nonFlyingGuestsInLoungeDeluxe: 0,
    isAdHoc: false, accountType: 'Travel Agency', bookingType: 'Email/Call to HKIAL',
    rejectionReason: undefined, agencyName: 'EGL Tours', agencyCode: 'TA-EG-001',
    agencyDiscountRate: 20, originalAmountValue: 5738, finalAmountValue: 4590,
  },
};

// ── Merge dialog: permanently fixed fields ────────────────────────────────────

export const MERGE_FIXED_FIELDS = new Set([
  'Full Name', 'Gender', 'Date of Birth', 'Passport No.',
  'Account No.', 'Membership', 'Total Visits', 'Last Visit', 'Created Date',
]);

// ── Passenger seed data ───────────────────────────────────────────────────────

const mockPassengerSeeds = [
  { title: 'Mr'   as PassengerTitle, firstName: 'John',   lastName: 'Smith',   ageGroup: 'Adult (13+ years)'  as AgeGroup, day: '14', month: 'March',     year: '1980', doc: 'K12345678', mem: 'MEM-0021', allergies: 'Shellfish, Peanuts' },
  { title: 'Mrs'  as PassengerTitle, firstName: 'Mary',   lastName: 'Johnson', ageGroup: 'Adult (13+ years)'  as AgeGroup, day: '22', month: 'July',      year: '1975', doc: 'H98765432', mem: '',         allergies: '' },
  { title: 'Mr'   as PassengerTitle, firstName: 'David',  lastName: 'Lee',     ageGroup: 'Adult (13+ years)'  as AgeGroup, day: '05', month: 'November',  year: '1990', doc: 'A11223344', mem: 'MEM-0087', allergies: 'Tree Nuts' },
  { title: 'Miss' as PassengerTitle, firstName: 'Sarah',  lastName: 'Chen',    ageGroup: 'Child (2-12 years)' as AgeGroup, day: '30', month: 'January',   year: '2014', doc: 'B55667788', mem: '',         allergies: 'Dairy, Eggs' },
  { title: 'Mr'   as PassengerTitle, firstName: 'Robert', lastName: 'Wang',    ageGroup: 'Adult (13+ years)'  as AgeGroup, day: '18', month: 'September', year: '1968', doc: 'C99001122', mem: 'MEM-0145', allergies: '' },
  { title: 'Mrs'  as PassengerTitle, firstName: 'Emma',   lastName: 'Wilson',  ageGroup: 'Adult (13+ years)'  as AgeGroup, day: '07', month: 'April',     year: '1983', doc: 'D33445566', mem: '',         allergies: 'Gluten' },
];

export const isPassengerFilled = (p: PassengerDetail): boolean =>
  !!(p.title || p.firstName || p.lastName || p.travelDocNo || p.membershipNo || p.ageGroup || p.birthdayDay);

export const buildInitialPassengers = (total: number, bookingId: number): PassengerDetail[] =>
  Array.from({ length: total }, (_, idx) => {
    const seed = mockPassengerSeeds[(bookingId + idx) % mockPassengerSeeds.length];
    return {
      title: seed.title, firstName: seed.firstName, lastName: seed.lastName,
      travelDocNo: seed.doc, membershipNo: seed.mem, ageGroup: seed.ageGroup,
      birthdayDay: seed.day, birthdayMonth: seed.month, birthdayYear: seed.year,
      foodAllergies: seed.allergies,
    };
  });

// ── Non-flying guest seed data ────────────────────────────────────────────────

const mockNonFlyingSeeds = [
  { title: 'Mrs'  as PassengerTitle, firstName: 'Linda',  lastName: 'Brown',  ageGroup: 'Adult (13+ years)'  as AgeGroup, allergies: 'Sesame' },
  { title: 'Mr'   as PassengerTitle, firstName: 'James',  lastName: 'Taylor', ageGroup: 'Adult (13+ years)'  as AgeGroup, allergies: '' },
  { title: 'Miss' as PassengerTitle, firstName: 'Sophie', lastName: 'Martin', ageGroup: 'Child (2-12 years)' as AgeGroup, allergies: 'Peanuts, Tree Nuts' },
  { title: 'Mr'   as PassengerTitle, firstName: 'Kevin',  lastName: 'Zhang',  ageGroup: 'Adult (13+ years)'  as AgeGroup, allergies: '' },
  { title: 'Mrs'  as PassengerTitle, firstName: 'Olivia', lastName: 'Harris', ageGroup: 'Adult (13+ years)'  as AgeGroup, allergies: 'Shellfish' },
  { title: 'Miss' as PassengerTitle, firstName: 'Chloe',  lastName: 'Nguyen', ageGroup: 'Infant (0-2 years)' as AgeGroup, allergies: 'Dairy' },
];

export const buildInitialNonFlyingGuests = (total: number, bookingId: number): NonFlyingGuest[] =>
  Array.from({ length: total }, (_, idx) => {
    const seed = mockNonFlyingSeeds[(bookingId + idx + 2) % mockNonFlyingSeeds.length];
    return { title: seed.title, firstName: seed.firstName, lastName: seed.lastName, ageGroup: seed.ageGroup, foodAllergies: seed.allergies };
  });

// ── Mock booking generator ────────────────────────────────────────────────────

export const generateMockBooking = (id: number): Booking => {
  const names = ['John Smith', 'Mary Johnson', 'David Lee', 'Sarah Chen', 'Robert Wang', 'Emma Wilson', 'Michael Brown', 'Lisa Taylor', 'James Anderson', 'Sophia Martinez'];
  const suites = ['VIP Suite A', 'VIP Suite B', 'Executive Suite', 'Business Suite', 'Premier Suite', 'Open Lounge'];
  const statuses: Booking['status'][] = ['Pending for Review', 'Pending for Approval', 'Approved', 'Confirmed', 'Rejected', 'Cancelled', 'No-show'];
  const airlines = ['CX', 'BA', 'NH', 'SQ', 'QF', 'EK', 'LH'];
  const origins = ['LHR', 'NRT', 'SIN', 'SYD', 'LAX', 'DXB', 'FRA'];
  const destinations = ['HKG', 'TPE', 'ICN', 'BKK', 'SIN', 'NRT', 'PVG'];
  const accountTypes: Booking['accountType'][] = ['Individual', 'Corporate', 'Travel Agency'];
  const paymentModes: Booking['paymentMode'][] = ['Upfront', 'On-Credit'];

  const i = id;
  const date = new Date(2024, 9, 25 + Math.floor(i / 10));
  const hour = 8 + (i % 12);
  const status = statuses[i % statuses.length];
  const paymentMode = paymentModes[i % paymentModes.length];
  const accountType = accountTypes[i % accountTypes.length];

  let paymentStatus: Booking['paymentStatus'] = 'Not Required';
  if (paymentMode === 'Upfront') {
    if (status === 'Confirmed') paymentStatus = 'Paid';
    else if (status === 'Approved') paymentStatus = i % 3 === 0 ? 'Payment Link Sent' : 'Pending';
    else if (status === 'Cancelled') {
      if (i % 4 === 0) paymentStatus = 'Refunded';
      else if (i % 3 === 0) paymentStatus = 'Paid';
      else if (i % 5 === 0) paymentStatus = 'Payment Link Sent';
      else paymentStatus = 'Pending';
    } else if (status === 'Pending for Approval') paymentStatus = 'Pending';
  }

  const services: string[] = [];
  if (i % 3 === 0) services.push('Limousine Transfer');
  if (i % 4 === 0) services.push('In-lounge Shopping');
  if (i % 7 === 0) services.push('Wheelchair Assistance');
  if (i % 9 === 0) services.push('Private Sales');

  const baseAmount = 2500 + (i * 123) % 5000;
  let amount: Booking['amount'];
  let agencyName: string | undefined;
  let agencyCode: string | undefined;
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
    if (accountType === 'Travel Agency') {
      const agency = DETAIL_AGENCY_DATA[i % DETAIL_AGENCY_DATA.length];
      agencyName = agency.name;
      agencyCode = agency.code;
      agencyDiscountRate = agency.discountRate;
      originalAmountValue = baseAmount;
      finalAmountValue = Math.round(baseAmount * (1 - agency.discountRate / 100));
      amount = `HK$${finalAmountValue.toLocaleString()}`;
    } else {
      amount = `HK$${baseAmount.toLocaleString()}`;
    }
  }

  const base: Booking = {
    id: i,
    bookingNo: `A-${ ['202510','202511','202512','202601','202602'][i % 5] }-${String(i + 1).padStart(6, '0')}`,
    guestName: names[i % names.length],
    accountNo: `ACC-20${23 + (i % 2)}-${String(1000 + i).slice(-4)}`,
    suite: suites[i % suites.length],
    dateTime: `${date.toISOString().split('T')[0]} ${String(hour).padStart(2, '0')}:${i % 2 === 0 ? '30' : '00'}`,
    flightType: i % 2 === 0 ? 'Departure' : 'Arrival',
    arrivalDate: (() => { const d = new Date(date); d.setDate(d.getDate() + (i % 2 === 0 ? 0 : 1)); return d.toISOString().split('T')[0]; })(),
    flightNo: `${airlines[i % airlines.length]}${String(100 + i * 17).slice(-3)}`,
    flightTime: `${String(hour + 3).padStart(2, '0')}:${i % 2 === 0 ? '45' : '15'}`,
    flightOrigin: i % 2 === 0 ? origins[i % origins.length] : undefined,
    flightDestination: i % 2 === 0 ? 'HKG' : destinations[i % destinations.length],
    numberOfLuggage: 1 + (i % 3),
    flightClass: (['Economy Class', 'Business Class', 'First Class'] as const)[i % 3],
    status,
    paymentStatus,
    services,
    amount,
    numberOfGuests: 1 + (i % 4),
    nonFlyingGuests: i % 5 === 0 ? 1 + (i % 2) : 0,
    numberOfPremiereSuites: i % 6 === 0 ? 1 + (i % 2) : 0,
    vipPassengersInPremiereSuite: i % 6 === 0 ? 1 + (i % 3) : 0,
    nonFlyingGuestsInPremiereSuite: (i % 6 === 0 && i % 5 === 0) ? 1 + (i % 2) : 0,
    vipPassengersInLoungeDeluxe: i % 2 === 0 ? 2 : 1 + (i % 2),
    nonFlyingGuestsInLoungeDeluxe: i % 3 === 0 ? 1 + (i % 2) : 0,
    isAdHoc: i % 8 === 0,
    hasLimousine: i % 3 === 0,
    hasShopping: i % 4 === 0,
    cutoffHours: i % 8 === 0 ? (12 + i % 36) : undefined,
    accountType,
    paymentMode,
    rejectionReason: status === 'Rejected' ? 'Suite not available for requested time slot' : undefined,
    bookingType: i % 2 === 0 ? 'Online' : 'Email/Call to HKIAL',
    agencyName,
    agencyCode,
    agencyDiscountRate,
    originalAmountValue,
    finalAmountValue,
  };

  return { ...base, ...EXPLICIT_BOOKING_OVERRIDES[id] };
};
