import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, Plane, Clock, User, ShoppingCart, Search, Plus, Minus, AlertTriangle, Heart, CalendarDays, Users, CheckCheck } from 'lucide-react';
import { getPreOrder, clearPreOrder, PreOrderEntry } from './preOrderStore';
import { toast } from 'sonner';

// ── Module-level: bookings that could match an available/reserved suite ────────
interface MatchingBooking {
  bookingNo: string;
  guestName: string;
  venue: string;
  startTime: string;
  endTime: string;
  flightNo: string;
  flightTime: string;
  numberOfGuests: number;
  status: string;
  hasPreOrder: boolean;
}

const TODAY_BOOKINGS: MatchingBooking[] = [
  { bookingNo: 'A-202603-000001', guestName: 'John Smith',     venue: 'VIP Suite A',       startTime: '06:00', endTime: '09:30', flightNo: 'CX888', flightTime: '10:30', numberOfGuests: 2, status: 'Confirmed', hasPreOrder: false },
  { bookingNo: 'A-202603-000002', guestName: 'Mary Johnson',   venue: 'VIP Suite B',       startTime: '07:30', endTime: '11:00', flightNo: 'BA031', flightTime: '12:00', numberOfGuests: 1, status: 'Confirmed', hasPreOrder: false },
  { bookingNo: 'A-202603-000003', guestName: 'David Lee',      venue: 'Executive Suite 1', startTime: '08:00', endTime: '10:30', flightNo: 'CX270', flightTime: '11:30', numberOfGuests: 2, status: 'Approved',  hasPreOrder: false },
  { bookingNo: 'A-202603-000004', guestName: 'Zhang Corp Ltd', venue: 'Executive Suite 2', startTime: '09:00', endTime: '12:00', flightNo: 'CX830', flightTime: '13:15', numberOfGuests: 4, status: 'Confirmed', hasPreOrder: false },
  { bookingNo: 'A-202603-000005', guestName: 'Sarah Chen',     venue: 'Business Suite 1',  startTime: '10:00', endTime: '13:00', flightNo: 'NH801', flightTime: '14:30', numberOfGuests: 1, status: 'Confirmed', hasPreOrder: false },
  { bookingNo: 'A-202603-000006', guestName: 'Robert Wang',    venue: 'Business Suite 2',  startTime: '11:30', endTime: '14:30', flightNo: 'SQ801', flightTime: '15:45', numberOfGuests: 3, status: 'Confirmed', hasPreOrder: false },
  { bookingNo: 'A-202603-000008', guestName: 'Chen Family',    venue: 'Family Suite',      startTime: '14:00', endTime: '17:00', flightNo: 'CX872', flightTime: '18:30', numberOfGuests: 5, status: 'Confirmed', hasPreOrder: false },
  { bookingNo: 'A-202603-000010', guestName: 'Lisa Taylor',    venue: 'VIP Suite A',       startTime: '11:00', endTime: '14:30', flightNo: 'CX251', flightTime: '15:45', numberOfGuests: 1, status: 'Confirmed', hasPreOrder: false },
  { bookingNo: 'A-202603-000011', guestName: 'Henry Chu',      venue: 'Executive Suite 2', startTime: '13:30', endTime: '16:30', flightNo: 'BA032', flightTime: '17:45', numberOfGuests: 2, status: 'Approved',  hasPreOrder: false },
];

// Reserved bookings — these are pre-assigned to specific suites via the schedule
const RESERVED_BOOKING_007: MatchingBooking = {
  bookingNo: 'A-202603-000007',
  guestName: 'Emma Wilson',
  venue: 'Business Suite 1',
  startTime: '13:00', endTime: '15:30',
  flightNo: 'QF29', flightTime: '17:00',
  numberOfGuests: 2, status: 'Approved', hasPreOrder: false,
};
const RESERVED_BOOKING_009: MatchingBooking = {
  bookingNo: 'A-202603-000009',
  guestName: 'Michael Brown',
  venue: 'Business Suite 5',
  startTime: '15:00', endTime: '18:30',
  flightNo: 'EK231', flightTime: '20:00',
  numberOfGuests: 2, status: 'Confirmed', hasPreOrder: false,
};

function posTimeToMins(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Returns time-matching bookings, minus any already reserved for a specific suite. */
function getMatchingBookings(excludeNos: Set<string>): MatchingBooking[] {
  const demoNow = 14 * 60; // fixed demo time: 14:00
  return TODAY_BOOKINGS.filter(b => {
    if (excludeNos.has(b.bookingNo)) return false;
    const start = posTimeToMins(b.startTime);
    const end   = posTimeToMins(b.endTime);
    return start <= demoNow + 60 && end >= demoNow - 30;
  }).map(b => ({ ...b, hasPreOrder: !!getPreOrder(b.bookingNo) }));
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface BookingGuest {
  name: string;
  relation: 'Main Member' | 'Spouse' | 'Companion' | 'Child' | 'Non-Flying Guest';
  foodAllergies: string[];
  dietaryRequirements: string[];
}

interface Suite {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'food-served' | 'cleaning' | 'reserved';
  position: { x: number; y: number };
  size: { width: number; height: number };
  /** Active/checked-in booking (occupied / food-served) */
  booking?: {
    bookingNo: string;
    guestName: string;
    checkIn: string;
    flightNo: string;
    flightTime: string;
    guests?: BookingGuest[];
  };
  /** Upcoming booking that has reserved this specific suite */
  reservedBooking?: MatchingBooking;
}

interface POSFloorPlanProps {
  onViewBookingDetail?: (bookingNo: string) => void;
  onCheckout?: (bookingNo: string) => void;
}

interface CatalogueItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface AddedItem {
  id: string;
  name: string;
  category: string;
  qty: number;
}

const SERVICE_CATALOGUE: CatalogueItem[] = [
  { id: 'coffee-1', name: 'Latte', category: 'Coffee', description: 'Classic espresso with steamed milk' },
  { id: 'coffee-2', name: 'Cappuccino', category: 'Coffee', description: 'Espresso with foamed milk' },
  { id: 'coffee-3', name: 'Americano', category: 'Coffee', description: 'Espresso with hot water' },
  { id: 'coffee-4', name: 'Espresso', category: 'Coffee', description: 'Rich Italian coffee' },
  { id: 'coffee-5', name: 'Mocha', category: 'Coffee', description: 'Espresso with chocolate and milk' },
  { id: 'coffee-6', name: 'Flat White', category: 'Coffee', description: 'Double espresso with microfoam milk' },
  { id: 'coffee-7', name: 'Macchiato', category: 'Coffee', description: 'Espresso with a dash of milk foam' },
  { id: 'tea-1', name: 'English Breakfast Tea', category: 'Tea', description: 'Traditional black tea' },
  { id: 'tea-2', name: 'Green Tea', category: 'Tea', description: 'Fresh green tea' },
  { id: 'tea-3', name: 'Jasmine Tea', category: 'Tea', description: 'Fragrant jasmine tea' },
  { id: 'tea-4', name: 'Earl Grey', category: 'Tea', description: 'Bergamot-flavored black tea' },
  { id: 'tea-5', name: 'Chamomile Tea', category: 'Tea', description: 'Calming herbal infusion' },
  { id: 'tea-6', name: 'Pu-erh Tea', category: 'Tea', description: 'Aged Chinese fermented tea' },
  { id: 'bev-1', name: 'Fresh Orange Juice', category: 'Beverages', description: 'Freshly squeezed' },
  { id: 'bev-2', name: 'Apple Juice', category: 'Beverages', description: 'Pure apple juice' },
  { id: 'bev-3', name: 'Mineral Water (Still)', category: 'Beverages', description: 'Still mineral water' },
  { id: 'bev-4', name: 'Mineral Water (Sparkling)', category: 'Beverages', description: 'Sparkling mineral water' },
  { id: 'bev-5', name: 'Soft Drinks', category: 'Beverages', description: 'Coca-Cola, Sprite, etc.' },
  { id: 'bev-6', name: 'Fresh Watermelon Juice', category: 'Beverages', description: 'Freshly pressed' },
  { id: 'bev-7', name: 'Mango Smoothie', category: 'Beverages', description: 'Blended fresh mango' },
  { id: 'bev-8', name: 'Virgin Mojito', category: 'Beverages', description: 'Mint, lime, soda' },
  { id: 'alc-1', name: 'Champagne (Dom Pérignon)', category: 'Alcoholic Beverages', description: 'Prestige cuvée champagne' },
  { id: 'alc-2', name: 'Champagne (Moët & Chandon)', category: 'Alcoholic Beverages', description: 'Classic champagne' },
  { id: 'alc-3', name: 'Red Wine (Glass)', category: 'Alcoholic Beverages', description: 'House red wine' },
  { id: 'alc-4', name: 'White Wine (Glass)', category: 'Alcoholic Beverages', description: 'House white wine' },
  { id: 'alc-5', name: 'Beer (Bottled)', category: 'Alcoholic Beverages', description: 'Premium bottled beer' },
  { id: 'alc-6', name: 'Whiskey On The Rocks', category: 'Alcoholic Beverages', description: 'Single malt whiskey' },
  { id: 'alc-7', name: 'Gin & Tonic', category: 'Alcoholic Beverages', description: 'London dry gin with tonic' },
  { id: 'alc-8', name: 'Bloody Mary', category: 'Alcoholic Beverages', description: 'Classic vodka cocktail' },
  { id: 'breakfast-1', name: 'Premium Breakfast Set', category: 'Breakfast', description: 'Eggs, bacon, toast, juice' },
  { id: 'breakfast-2', name: 'Continental Breakfast', category: 'Breakfast', description: 'Pastries, croissant, jam, coffee' },
  { id: 'breakfast-3', name: 'Congee Set', category: 'Breakfast', description: 'Rice porridge with sides' },
  { id: 'breakfast-4', name: 'Eggs Benedict', category: 'Breakfast', description: 'Poached eggs on English muffin' },
  { id: 'breakfast-5', name: 'Acai Bowl', category: 'Breakfast', description: 'Acai, granola, fresh fruits' },
  { id: 'app-1', name: 'Caesar Salad', category: 'Appetiser', description: 'Romaine with caesar dressing' },
  { id: 'app-2', name: 'Spring Rolls', category: 'Appetiser', description: 'Crispy vegetable rolls' },
  { id: 'app-3', name: 'Edamame', category: 'Appetiser', description: 'Steamed soybeans with salt' },
  { id: 'app-4', name: 'Lobster Salad', category: 'Appetiser', description: 'Cold poached lobster salad' },
  { id: 'app-5', name: 'Cheese Platter', category: 'Appetiser', description: 'Selection of artisan cheeses' },
  { id: 'app-6', name: 'Fresh Fruit Platter', category: 'Appetiser', description: 'Seasonal fresh fruits' },
  { id: 'app-7', name: 'Smoked Salmon Blini', category: 'Appetiser', description: 'With crème fraîche and capers' },
  { id: 'main-1', name: 'Dim Sum Platter', category: 'Main Course', description: 'Assorted dim sum selection' },
  { id: 'main-2', name: 'Beef Noodles', category: 'Main Course', description: 'Braised beef with noodles' },
  { id: 'main-3', name: 'Seafood Fried Rice', category: 'Main Course', description: 'Wok-fried rice with seafood' },
  { id: 'main-4', name: 'Grilled Chicken', category: 'Main Course', description: 'Herb-marinated chicken' },
  { id: 'main-5', name: 'Wagyu Beef Burger', category: 'Main Course', description: 'Premium wagyu patty, brioche bun' },
  { id: 'main-6', name: 'Grilled Salmon', category: 'Main Course', description: 'With lemon butter sauce' },
  { id: 'main-7', name: 'Club Sandwich', category: 'Main Course', description: 'Triple-decker with fries' },
  { id: 'main-8', name: 'Wonton Noodle Soup', category: 'Main Course', description: 'Hong Kong style' },
  { id: 'dessert-1', name: 'Dessert Trio', category: 'Dessert', description: 'Three mini desserts' },
  { id: 'dessert-2', name: 'Mango Pudding', category: 'Dessert', description: 'Traditional Hong Kong dessert' },
  { id: 'dessert-3', name: 'Ice Cream (2 scoops)', category: 'Dessert', description: 'Vanilla, chocolate, or strawberry' },
  { id: 'dessert-4', name: 'Tiramisu', category: 'Dessert', description: 'Classic Italian dessert' },
  { id: 'dessert-5', name: 'Crème Brûlée', category: 'Dessert', description: 'French vanilla custard' },
  { id: 'dessert-6', name: 'Egg Tart', category: 'Dessert', description: 'Hong Kong style baked egg tart' },
  { id: 'snack-1', name: 'Mixed Nuts', category: 'Snacks', description: 'Premium salted mixed nuts' },
  { id: 'snack-2', name: 'Potato Chips', category: 'Snacks', description: 'Gourmet flavoured chips' },
  { id: 'snack-3', name: 'Chocolate Pralines', category: 'Snacks', description: 'Belgian chocolate selection' },
  { id: 'snack-4', name: 'Crackers & Dip', category: 'Snacks', description: 'Artisan crackers with hummus' },
  { id: 'svc-1', name: 'Lounge Access (Adult)', category: 'Lounge Services', description: 'Per adult entry' },
  { id: 'svc-2', name: 'Lounge Access (Child)', category: 'Lounge Services', description: 'Per child entry (2–11 yrs)' },
  { id: 'svc-3', name: 'Day Room (4 hrs)', category: 'Lounge Services', description: 'Private suite day use' },
  { id: 'svc-4', name: 'Extended Stay (per hr)', category: 'Lounge Services', description: 'Beyond standard booking' },
  { id: 'svc-5', name: 'Shower Service', category: 'Lounge Services', description: 'Private shower with amenities' },
  { id: 'con-1', name: 'Airport Transfer (Sedan)', category: 'Concierge', description: 'Private car to/from airport' },
  { id: 'con-2', name: 'Airport Transfer (Van)', category: 'Concierge', description: 'Private van for groups' },
  { id: 'con-3', name: 'Baggage Handling', category: 'Concierge', description: 'Per luggage item' },
  { id: 'con-4', name: 'Fast Track Immigration', category: 'Concierge', description: 'Priority immigration clearance' },
  { id: 'con-5', name: 'Meet & Greet Service', category: 'Concierge', description: 'Dedicated greeter at gate' },
  { id: 'con-6', name: 'Flight Rebooking Assistance', category: 'Concierge', description: 'Staff-assisted rebooking' },
  { id: 'con-7', name: 'Printing Service (per page)', category: 'Concierge', description: 'Colour/B&W document printing' },
  { id: 'spa-1', name: 'Head & Shoulder Massage (30 min)', category: 'Spa & Wellness', description: 'Relaxation massage' },
  { id: 'spa-2', name: 'Full Body Massage (60 min)', category: 'Spa & Wellness', description: 'Swedish or deep tissue' },
  { id: 'spa-3', name: 'Manicure', category: 'Spa & Wellness', description: 'Basic nail care' },
  { id: 'spa-4', name: 'Pedicure', category: 'Spa & Wellness', description: 'Basic foot care' },
  { id: 'spa-5', name: 'Facial Treatment (45 min)', category: 'Spa & Wellness', description: 'Hydrating skin treatment' },
];

// ── Main Component ─────────────────────────────────────────────────────────────
// ── MOCK constant (isolated — TODAY_BOOKINGS already module-scoped above) ────
const MOCK_TODAY_BOOKINGS = TODAY_BOOKINGS;

export interface POSFloorPlanExtendedProps extends POSFloorPlanProps {
  /** Pass today's booking list from CI4; falls back to MOCK_TODAY_BOOKINGS when empty */
  todayBookings?: MatchingBooking[];
  onTableStatusChange?: (tableId: string, status: string) => void;
  isLoading?: boolean;
}

export function POSFloorPlan({
  onViewBookingDetail,
  onCheckout,
  todayBookings: _todayBookingsProp,
  isLoading = false,
}: POSFloorPlanExtendedProps) {
  // ── Suites are stateful so we can promote reserved/available → occupied ──
  const [suites, setSuites] = useState<Suite[]>([
    {
      id: 'vip-a1', name: 'VIP Suite A1', status: 'occupied',
      position: { x: 50, y: 50 }, size: { width: 150, height: 120 },
      booking: {
        bookingNo: 'A-202602-000001', guestName: 'John Smith', checkIn: '14:30',
        flightNo: 'CX888', flightTime: '17:30',
        guests: [
          { name: 'Mr John Smith',  relation: 'Main Member', foodAllergies: ['Shellfish', 'Peanuts'], dietaryRequirements: [] },
          { name: 'Mrs Mary Smith', relation: 'Spouse',      foodAllergies: ['Dairy'],               dietaryRequirements: ['Gluten-Free'] },
        ],
      },
    },
    {
      id: 'vip-a2', name: 'VIP Suite A2', status: 'food-served',
      position: { x: 220, y: 50 }, size: { width: 150, height: 120 },
      booking: {
        bookingNo: 'A-202602-000003', guestName: 'David Lee', checkIn: '15:00',
        flightNo: 'CX270', flightTime: '19:15',
        guests: [
          { name: 'Mr David Lee',  relation: 'Main Member', foodAllergies: ['Tree Nuts'], dietaryRequirements: [] },
          { name: 'Mrs Linda Lee', relation: 'Spouse',      foodAllergies: ['Sesame'],    dietaryRequirements: ['Halal'] },
        ],
      },
    },
    { id: 'vip-b1', name: 'VIP Suite B1',   status: 'available', position: { x: 50,  y: 190 }, size: { width: 150, height: 120 } },
    { id: 'vip-b2', name: 'VIP Suite B2',   status: 'cleaning',  position: { x: 220, y: 190 }, size: { width: 150, height: 120 } },
    {
      id: 'exec-1', name: 'Executive Suite 1', status: 'occupied',
      position: { x: 390, y: 50 }, size: { width: 120, height: 100 },
      booking: {
        bookingNo: 'D-202602-000002', guestName: 'Mary Johnson', checkIn: '16:00',
        flightNo: 'BA031', flightTime: '18:45',
        guests: [
          { name: 'Mrs Mary Johnson',  relation: 'Main Member', foodAllergies: [],          dietaryRequirements: ['Vegetarian'] },
          { name: 'Mr Robert Johnson', relation: 'Spouse',      foodAllergies: ['Lactose'], dietaryRequirements: [] },
        ],
      },
    },
    { id: 'exec-2',    name: 'Executive Suite 2', status: 'available', position: { x: 390, y: 170 }, size: { width: 120, height: 100 } },
    {
      // Reserved: Emma Wilson (A-202603-000007) has selected this suite
      id: 'business-1', name: 'Business Suite 1', status: 'reserved',
      position: { x: 530, y: 50 }, size: { width: 120, height: 100 },
      reservedBooking: RESERVED_BOOKING_007,
    },
    { id: 'business-2', name: 'Business Suite 2', status: 'available', position: { x: 530, y: 170 }, size: { width: 120, height: 100 } },
    {
      id: 'family-1', name: 'Family Suite', status: 'food-served',
      position: { x: 50, y: 330 }, size: { width: 200, height: 150 },
      booking: {
        bookingNo: 'A-202602-000007', guestName: 'Zhang Family', checkIn: '13:00',
        flightNo: 'CX872', flightTime: '16:30',
        guests: [
          { name: 'Mr Wei Zhang', relation: 'Main Member', foodAllergies: [],                 dietaryRequirements: [] },
          { name: 'Mrs Li Zhang', relation: 'Spouse',      foodAllergies: [],                 dietaryRequirements: ['Vegetarian'] },
          { name: 'Mei Zhang',    relation: 'Child',       foodAllergies: ['Egg', 'Peanuts'],  dietaryRequirements: [] },
        ],
      },
    },
    { id: 'business-3', name: 'Business Suite 3', status: 'available', position: { x: 270, y: 330 }, size: { width: 120, height: 100 } },
    {
      id: 'business-4', name: 'Business Suite 4', status: 'occupied',
      position: { x: 410, y: 330 }, size: { width: 120, height: 100 },
      booking: {
        bookingNo: 'T-202602-000009', guestName: 'Sarah Chen', checkIn: '14:45',
        flightNo: 'CX251', flightTime: '20:30',
        guests: [
          { name: 'Ms Sarah Chen',   relation: 'Main Member', foodAllergies: ['Dairy', 'Eggs'], dietaryRequirements: ['Vegan'] },
          { name: 'Mr Michael Chen', relation: 'Companion',   foodAllergies: [],                dietaryRequirements: [] },
        ],
      },
    },
    {
      // Reserved: Michael Brown (A-202603-000009) has selected this suite
      id: 'business-5', name: 'Business Suite 5', status: 'reserved',
      position: { x: 550, y: 330 }, size: { width: 120, height: 100 },
      reservedBooking: RESERVED_BOOKING_009,
    },
  ]);

  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [addedItems, setAddedItems]             = useState<Record<string, AddedItem[]>>({});
  const [serviceSearch, setServiceSearch]       = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Available-suite booking panel state
  const [selectedMatchingBooking, setSelectedMatchingBooking] = useState<MatchingBooking | null>(null);
  const [submittedToKitchen, setSubmittedToKitchen]           = useState(false);

  // Keep selected suite always up-to-date from the stateful array
  const selectedSuite = suites.find(s => s.id === selectedSuiteId) ?? null;

  // Reset panel state when suite changes
  useEffect(() => {
    setSelectedMatchingBooking(null);
    setSubmittedToKitchen(false);
    setServiceSearch('');
    setShowServiceDropdown(false);
  }, [selectedSuiteId]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowServiceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reserved booking nos — excluded from the "available" matching list
  const reservedNos = new Set(
    suites.filter(s => s.status === 'reserved' && s.reservedBooking).map(s => s.reservedBooking!.bookingNo)
  );
  const availableMatchingBookings = selectedSuite?.status === 'available'
    ? getMatchingBookings(reservedNos)
    : [];

  // ── Promote a suite to occupied after booking assignment ──────────────────
  const assignBookingToSuite = (suiteId: string, booking: MatchingBooking) => {
    setSuites(prev => prev.map(s => {
      if (s.id !== suiteId) return s;
      return {
        ...s,
        status: 'occupied' as const,
        reservedBooking: undefined,
        booking: {
          bookingNo:  booking.bookingNo,
          guestName:  booking.guestName,
          checkIn:    booking.startTime,
          flightNo:   booking.flightNo,
          flightTime: booking.flightTime,
        },
      };
    }));
  };

  // ── Status helpers ────────────────────────────────────────────────────────
  const getBgColor = (status: Suite['status']) => {
    switch (status) {
      case 'available':   return 'bg-green-100 border-green-400';
      case 'occupied':    return 'bg-red-100 border-red-400';
      case 'food-served': return 'bg-yellow-100 border-yellow-400';
      case 'cleaning':    return 'bg-orange-100 border-orange-400';
      case 'reserved':    return 'bg-indigo-100 border-indigo-400';
      default:            return 'bg-gray-100 border-gray-400';
    }
  };
  const getBadgeColor = (status: Suite['status']) => {
    switch (status) {
      case 'available':   return 'bg-green-500 border-green-600';
      case 'occupied':    return 'bg-red-500 border-red-600';
      case 'food-served': return 'bg-yellow-500 border-yellow-600';
      case 'cleaning':    return 'bg-orange-500 border-orange-600';
      case 'reserved':    return 'bg-indigo-500 border-indigo-600';
      default:            return 'bg-gray-500 border-gray-600';
    }
  };
  const getLabel = (status: Suite['status']) => {
    switch (status) {
      case 'available':   return 'Available';
      case 'occupied':    return 'Occupied';
      case 'food-served': return 'Food Served';
      case 'cleaning':    return 'Cleaning';
      case 'reserved':    return 'Reserved';
      default:            return 'Unknown';
    }
  };
  const getFlightType = (bookingNo: string) => {
    const p = bookingNo.split('-')[0];
    if (p === 'A') return 'Arrival';
    if (p === 'D') return 'Departure';
    if (p === 'T') return 'Transition';
    return 'Arrival';
  };

  const statusCounts = {
    available:  suites.filter(s => s.status === 'available').length,
    reserved:   suites.filter(s => s.status === 'reserved').length,
    occupied:   suites.filter(s => s.status === 'occupied').length,
    foodServed: suites.filter(s => s.status === 'food-served').length,
    cleaning:   suites.filter(s => s.status === 'cleaning').length,
  };

  const getOrderedItems = (bookingNo: string) => {
    const items = [
      { name: 'Premium Breakfast Set', qty: 2 },
      { name: 'Champagne (Dom Pérignon)', qty: 1 },
      { name: 'Fresh Fruit Platter', qty: 1 },
      { name: 'Wagyu Beef Burger', qty: 1 },
      { name: 'Lobster Salad', qty: 1 },
    ];
    const hash = bookingNo.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return items.slice(0, (hash % 3) + 2);
  };

  const getBookingAddedItems = (bookingNo: string): AddedItem[] => addedItems[bookingNo] ?? [];

  const addServiceItem = (bookingNo: string, item: CatalogueItem) => {
    setAddedItems(prev => {
      const cur = prev[bookingNo] ?? [];
      const ex  = cur.find(i => i.id === item.id);
      if (ex) return { ...prev, [bookingNo]: cur.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
      return { ...prev, [bookingNo]: [...cur, { id: item.id, name: item.name, category: item.category, qty: 1 }] };
    });
  };
  const updateAddedItemQty = (bookingNo: string, itemId: string, delta: number) => {
    setAddedItems(prev => ({
      ...prev,
      [bookingNo]: (prev[bookingNo] ?? []).map(i => i.id === itemId ? { ...i, qty: Math.max(1, i.qty + delta) } : i),
    }));
  };
  const removeAddedItem = (bookingNo: string, itemId: string) => {
    setAddedItems(prev => ({ ...prev, [bookingNo]: (prev[bookingNo] ?? []).filter(i => i.id !== itemId) }));
  };

  const filteredServices = serviceSearch.trim().length > 0
    ? SERVICE_CATALOGUE.filter(i =>
        i.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        i.category.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        i.description.toLowerCase().includes(serviceSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>POS Floor Plan</h1>
        <p className="text-gray-600">Real-time suite status and guest management</p>
      </div>

      {/* ── Status Summary ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-2xl text-green-700">{statusCounts.available}</div>
          <div className="text-sm text-green-600">Available</div>
        </Card>
        <Card className="p-4 bg-indigo-50 border-indigo-200">
          <div className="text-2xl text-indigo-700">{statusCounts.reserved}</div>
          <div className="text-sm text-indigo-600">Reserved</div>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-2xl text-red-700">{statusCounts.occupied}</div>
          <div className="text-sm text-red-600">Occupied</div>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-2xl text-yellow-700">{statusCounts.foodServed}</div>
          <div className="text-sm text-yellow-600">Food Served</div>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="text-2xl text-orange-700">{statusCounts.cleaning}</div>
          <div className="text-sm text-orange-600">Cleaning</div>
        </Card>
      </div>

      {/* ── Interactive Floor Plan ─────────────────────────────────────────── */}
      <Card className="p-6">
        <div className="relative bg-gray-50 rounded-lg" style={{ height: '600px' }}>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-lg text-gray-700">
            HKIA VIP Lounge — Floor Plan
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-100 text-blue-700 rounded border-2 border-blue-300">
            Entrance ↓
          </div>

          {suites.map(suite => (
            <button
              key={suite.id}
              onClick={() => setSelectedSuiteId(suite.id)}
              className={`absolute border-2 text-gray-700 rounded-lg transition-all hover:shadow-lg hover:border-blue-400 flex flex-col items-center justify-center p-2 cursor-pointer ${getBgColor(suite.status)}`}
              style={{ left: suite.position.x, top: suite.position.y, width: suite.size.width, height: suite.size.height }}
            >
              <div className="text-sm font-medium text-center">{suite.name}</div>

              {/* Reserved: show upcoming guest + time */}
              {suite.status === 'reserved' && suite.reservedBooking && (
                <>
                  <div className="text-xs mt-1 text-indigo-700 truncate w-full text-center px-1">
                    {suite.reservedBooking.guestName}
                  </div>
                  <div className="mt-0.5 px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-800 text-[10px]">
                    {suite.reservedBooking.startTime}–{suite.reservedBooking.endTime}
                  </div>
                </>
              )}

              {/* Occupied/Food-served: show active booking */}
              {suite.booking && (
                <>
                  <div className="text-xs mt-1 text-gray-500 truncate w-full text-center px-1">
                    {suite.booking.guestName}
                  </div>
                  <div className="text-xs mt-0.5 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">
                      {getFlightType(suite.booking.bookingNo)}
                    </span>
                    <span className="text-blue-600 text-[10px]">{suite.booking.flightTime}</span>
                  </div>
                </>
              )}
            </button>
          ))}

          <div className="absolute right-8 top-12 px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded text-sm text-blue-700">Reception</div>
          <div className="absolute right-8 top-44 px-3 py-2 bg-purple-50 border-2 border-purple-200 rounded text-sm text-purple-700">Dining Area</div>
          <div className="absolute left-8 bottom-24 px-3 py-2 bg-indigo-50 border-2 border-indigo-200 rounded text-sm text-indigo-700">Restrooms</div>
        </div>
      </Card>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {([
          { key: 'available',   bg: 'bg-green-100  border-green-400',  dot: 'bg-green-500',  label: 'Available' },
          { key: 'reserved',    bg: 'bg-indigo-100 border-indigo-400', dot: 'bg-indigo-500', label: 'Reserved (booking assigned)' },
          { key: 'occupied',    bg: 'bg-red-100    border-red-400',    dot: 'bg-red-500',    label: 'Occupied' },
          { key: 'food-served', bg: 'bg-yellow-100 border-yellow-400', dot: 'bg-yellow-500', label: 'Food Served' },
          { key: 'cleaning',    bg: 'bg-orange-100 border-orange-400', dot: 'bg-orange-500', label: 'Cleaning' },
        ] as const).map(item => (
          <span key={item.key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${item.bg} text-gray-700`}>
            <span className={`w-2 h-2 rounded-full ${item.dot}`} />
            {item.label}
          </span>
        ))}
      </div>

      {/* ── Slide-in Panel ─────────────────────────────────────────────────── */}
      {selectedSuite && (
        <div className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{selectedSuite.name}</h2>
              <Badge className={`mt-2 text-white ${getBadgeColor(selectedSuite.status)}`}>
                {getLabel(selectedSuite.status)}
              </Badge>
            </div>
            <button
              onClick={() => setSelectedSuiteId(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel body */}
          <div className="p-6 space-y-6">

            {/* ══ RESERVED panel ══════════════════════════════════════════════ */}
            {selectedSuite.status === 'reserved' && selectedSuite.reservedBooking && (() => {
              const rb       = selectedSuite.reservedBooking!;
              const preOrder = getPreOrder(rb.bookingNo);
              return (
                <div className="space-y-5">
                  {/* Booking info card */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="w-4 h-4 text-indigo-600" />
                      <p className="text-sm text-indigo-900 font-medium">Reserved Booking</p>
                    </div>
                    <p className="font-mono text-indigo-700 mb-1">{rb.bookingNo}</p>
                    <p className="text-sm text-indigo-800 mb-3">{rb.guestName}</p>
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs text-indigo-700">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rb.startTime}–{rb.endTime}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {rb.numberOfGuests} pax</span>
                      <span className="flex items-center gap-1"><Plane className="w-3 h-3" /> {rb.flightNo}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Flt {rb.flightTime}</span>
                    </div>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        rb.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : rb.status === 'Approved' ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {rb.status}
                      </span>
                    </div>
                  </div>

                  {/* Pre-order section */}
                  {preOrder ? (
                    !submittedToKitchen ? (
                      <div className="space-y-3">
                        <h3 className="text-xs text-gray-500 uppercase tracking-wide">Pre-Order Items</h3>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-sm text-amber-800 font-medium mb-2 flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            {preOrder.items.reduce((s, i) => s + i.qty, 0)} items pre-ordered
                          </p>
                          <ul className="space-y-1.5">
                            {preOrder.items.map(item => (
                              <li key={item.id} className="flex items-center justify-between text-xs text-amber-800">
                                <span>{item.name}</span>
                                <span className="font-medium bg-amber-100 px-1.5 py-0.5 rounded">×{item.qty}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-sm text-gray-700 text-center font-medium">
                          Do you want to submit those items to kitchen now?
                        </p>
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                          onClick={() => {
                            const qty = preOrder.items.reduce((s, i) => s + i.qty, 0);
                            assignBookingToSuite(selectedSuite.id, rb);
                            clearPreOrder(rb.bookingNo);
                            setSubmittedToKitchen(true);
                            toast.success(`${qty} item${qty !== 1 ? 's' : ''} sent to kitchen · ${rb.guestName} checked in to ${selectedSuite.name}`);
                            setTimeout(() => setSelectedSuiteId(null), 1400);
                          }}
                        >
                          <CheckCheck className="w-4 h-4" />
                          Yes, Send to Kitchen
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setSelectedSuiteId(null)}>
                          Not Now — Close
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-4 text-center">
                        <CheckCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <p className="text-sm text-emerald-800 font-medium">Items sent to kitchen!</p>
                        <p className="text-xs text-emerald-600 mt-1">Suite updated to Occupied.</p>
                      </div>
                    )
                  ) : (
                    /* No pre-order — just check in */
                    <div className="space-y-3">
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <ShoppingCart className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No pre-order for this booking.</p>
                        <p className="text-xs text-gray-400 mt-1">Guest may order on arrival.</p>
                      </div>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                        onClick={() => {
                          assignBookingToSuite(selectedSuite.id, rb);
                          toast.success(`${rb.guestName} checked in · ${selectedSuite.name} is now Occupied`);
                          setTimeout(() => setSelectedSuiteId(null), 1000);
                        }}
                      >
                        <CheckCheck className="w-4 h-4" />
                        Check In Guest &amp; Assign Suite
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ══ OCCUPIED / FOOD-SERVED panel ════════════════════════════════ */}
            {(selectedSuite.status === 'occupied' || selectedSuite.status === 'food-served') && selectedSuite.booking && (
              <>
                {/* Guest info */}
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-wide text-gray-500">Guest Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 mb-[10px] block">Booking Number</label>
                      <p className="text-lg">{selectedSuite.booking.bookingNo}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-[10px] block">Guest Name</label>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <p className="text-lg">{selectedSuite.booking.guestName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600 mb-[10px] block">Check-in Time</label>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p>{selectedSuite.booking.checkIn}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 mb-[10px] block">Flight Number</label>
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-gray-400" />
                          <p>{selectedSuite.booking.flightNo}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-[10px] block">Flight Departure Time</label>
                      <p className="text-lg text-blue-600">{selectedSuite.booking.flightTime}</p>
                    </div>
                  </div>
                </div>

                {/* Allergies */}
                {selectedSuite.booking.guests && selectedSuite.booking.guests.length > 0 && (() => {
                  const withInfo = selectedSuite.booking.guests!.filter(g => g.foodAllergies.length > 0 || g.dietaryRequirements.length > 0);
                  return (
                    <div className="border-t pt-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm uppercase tracking-wide text-gray-500">Food Allergies &amp; Dietary</h3>
                        {withInfo.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            {withInfo.length} guest{withInfo.length !== 1 ? 's' : ''} with requirements
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        {selectedSuite.booking.guests!.map((guest, idx) => {
                          const hasReqs = guest.foodAllergies.length > 0 || guest.dietaryRequirements.length > 0;
                          const rc: Record<string, string> = {
                            'Main Member': 'bg-blue-100 text-blue-700 border-blue-200',
                            'Spouse': 'bg-pink-100 text-pink-700 border-pink-200',
                            'Companion': 'bg-purple-100 text-purple-700 border-purple-200',
                            'Child': 'bg-amber-100 text-amber-700 border-amber-200',
                            'Non-Flying Guest': 'bg-gray-100 text-gray-600 border-gray-200',
                          };
                          return (
                            <div key={idx} className={`rounded-lg border p-3 ${hasReqs ? 'border-red-200 bg-red-50/40' : 'border-gray-200 bg-gray-50/40'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="text-sm font-medium flex-1">{guest.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${rc[guest.relation] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>{guest.relation}</span>
                              </div>
                              {guest.foodAllergies.length > 0 && (
                                <div className="mb-1.5">
                                  <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> Allergies</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {guest.foodAllergies.map(a => <span key={a} className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs">{a}</span>)}
                                  </div>
                                </div>
                              )}
                              {guest.dietaryRequirements.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Heart className="w-3 h-3 text-green-500" /> Dietary</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {guest.dietaryRequirements.map(d => <span key={d} className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200 text-xs">{d}</span>)}
                                  </div>
                                </div>
                              )}
                              {!hasReqs && <p className="text-xs text-gray-400 italic">No known allergies or dietary requirements</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Ordered Items */}
                <div className="space-y-3 border-t pt-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm uppercase tracking-wide text-gray-500">Ordered Items</h3>
                    <ShoppingCart className="w-5 h-5 text-gray-400" />
                  </div>
                  {getOrderedItems(selectedSuite.booking.bookingNo).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      </div>
                    </div>
                  ))}

                  {getBookingAddedItems(selectedSuite.booking.bookingNo).length > 0 && (
                    <div className="space-y-2 mt-1">
                      <p className="text-xs text-blue-600 font-medium px-1">+ Newly Added</p>
                      {getBookingAddedItems(selectedSuite.booking.bookingNo).map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-blue-500">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateAddedItemQty(selectedSuite.booking!.bookingNo, item.id, -1)} className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                            <span className="w-7 text-center text-sm font-medium">{item.qty}</span>
                            <button onClick={() => updateAddedItemQty(selectedSuite.booking!.bookingNo, item.id, 1)} className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                            <button onClick={() => removeAddedItem(selectedSuite.booking!.bookingNo, item.id)} className="ml-1 w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50"><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4" ref={searchRef}>
                    <label className="text-xs text-gray-500 mb-[10px] block">Search &amp; Add Service / Item</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text" placeholder="e.g. Latte, Massage, Fast Track…"
                        value={serviceSearch}
                        onChange={e => { setServiceSearch(e.target.value); setShowServiceDropdown(true); }}
                        onFocus={() => setShowServiceDropdown(true)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {serviceSearch && (
                        <button onClick={() => { setServiceSearch(''); setShowServiceDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {showServiceDropdown && filteredServices.length > 0 && (
                      <div className="mt-1 border border-gray-200 rounded-md shadow-lg bg-white max-h-56 overflow-y-auto z-10 relative">
                        {filteredServices.map(item => (
                          <button key={item.id} onMouseDown={e => e.preventDefault()}
                            onClick={() => { addServiceItem(selectedSuite.booking!.bookingNo, item); setServiceSearch(''); setShowServiceDropdown(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                          >
                            <Plus className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.category} · {item.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showServiceDropdown && serviceSearch.trim().length > 0 && filteredServices.length === 0 && (
                      <div className="mt-1 border border-gray-200 rounded-md bg-white px-4 py-3 text-sm text-gray-500">
                        No services found for "<span className="font-medium">{serviceSearch}</span>"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => { setSelectedSuiteId(null); onViewBookingDetail?.(selectedSuite.booking!.bookingNo); }}>
                    View Full Details
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { setSelectedSuiteId(null); onCheckout?.(selectedSuite.booking!.bookingNo); }}>
                    Checkout
                  </Button>
                </div>
              </>
            )}

            {/* ══ AVAILABLE suite panel ════════════════════════════════════════ */}
            {selectedSuite.status === 'available' && (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-1">Is there any assigned booking?</p>
                  <p className="text-xs text-blue-600">
                    Select a booking below to assign it to this suite, or click <strong>Create Booking</strong> to proceed without one.
                  </p>
                </div>

                {availableMatchingBookings.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-xs text-gray-500 uppercase tracking-wide">
                      Unassigned bookings — current time window ({availableMatchingBookings.length})
                    </h3>
                    {availableMatchingBookings.map(b => {
                      const isSelected = selectedMatchingBooking?.bookingNo === b.bookingNo;
                      const preOrder   = getPreOrder(b.bookingNo);
                      return (
                        <button
                          key={b.bookingNo}
                          onClick={() => {
                            setSelectedMatchingBooking(isSelected ? null : b);
                            setSubmittedToKitchen(false);
                          }}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{b.guestName}</p>
                                {preOrder && (
                                  <span className="shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs border border-emerald-200">
                                    <ShoppingCart className="w-3 h-3" /> Pre-order
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-mono text-blue-700">{b.bookingNo}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.startTime}–{b.endTime}</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.numberOfGuests} pax</span>
                                <span className="flex items-center gap-1"><Plane className="w-3 h-3" />{b.flightNo} {b.flightTime}</span>
                              </div>
                            </div>
                            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No unassigned bookings for the current time window.</p>
                  </div>
                )}

                {/* Selected booking pre-order actions */}
                {selectedMatchingBooking && (() => {
                  const preOrder = getPreOrder(selectedMatchingBooking.bookingNo);
                  return (
                    <div className="border-t pt-4 space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <p className="text-sm text-emerald-800 font-medium mb-1">Selected: {selectedMatchingBooking.bookingNo}</p>
                        <p className="text-xs text-emerald-600">{selectedMatchingBooking.guestName} · {selectedMatchingBooking.startTime}–{selectedMatchingBooking.endTime}</p>
                      </div>

                      {preOrder ? (
                        !submittedToKitchen ? (
                          <div className="space-y-3">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-sm text-amber-800 font-medium mb-2 flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                Pre-order found ({preOrder.items.reduce((s, i) => s + i.qty, 0)} items)
                              </p>
                              <ul className="space-y-1">
                                {preOrder.items.map(item => (
                                  <li key={item.id} className="flex items-center justify-between text-xs text-amber-700">
                                    <span>{item.name}</span>
                                    <span className="font-medium">×{item.qty}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <p className="text-sm text-gray-700 text-center font-medium">Do you want to submit those items to kitchen now?</p>
                            <div className="flex gap-2">
                              <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                onClick={() => {
                                  const qty = preOrder.items.reduce((s, i) => s + i.qty, 0);
                                  assignBookingToSuite(selectedSuite.id, selectedMatchingBooking);
                                  clearPreOrder(selectedMatchingBooking.bookingNo);
                                  setSubmittedToKitchen(true);
                                  toast.success(`${qty} item${qty !== 1 ? 's' : ''} sent to kitchen · ${selectedMatchingBooking.guestName} assigned to ${selectedSuite.name}`);
                                  setTimeout(() => setSelectedSuiteId(null), 1400);
                                }}
                              >
                                <CheckCheck className="w-4 h-4" />
                                Yes, Send to Kitchen
                              </Button>
                              <Button
                                variant="outline" className="flex-1"
                                onClick={() => {
                                  const bookingNo = selectedMatchingBooking.bookingNo;
                                  setAddedItems(prev => ({
                                    ...prev,
                                    [bookingNo]: preOrder.items.map(i => ({ id: i.id, name: i.name, category: i.category, qty: i.qty })),
                                  }));
                                  clearPreOrder(bookingNo);
                                  assignBookingToSuite(selectedSuite.id, selectedMatchingBooking);
                                  toast.info('Pre-order loaded — suite assigned. Review items above.');
                                  setSelectedSuiteId(null);
                                }}
                              >
                                No, Review First
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-4 text-center">
                            <CheckCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                            <p className="text-sm text-emerald-800 font-medium">Items sent to kitchen!</p>
                          </div>
                        )
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-500">No pre-order for this booking.</p>
                          </div>
                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            onClick={() => {
                              assignBookingToSuite(selectedSuite.id, selectedMatchingBooking);
                              toast.success(`${selectedMatchingBooking.guestName} assigned to ${selectedSuite.name}`);
                              setTimeout(() => setSelectedSuiteId(null), 1000);
                            }}
                          >
                            <CheckCheck className="w-4 h-4" />
                            Assign Booking to Suite
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="border-t pt-4">
                  <p className="text-xs text-center text-gray-400 mb-3">— or —</p>
                  <Button
                    className="w-full bg-[#0f2942] hover:bg-[#1a3d5c] text-white"
                    onClick={() => { toast.info('Proceeding to create a new booking for this suite.'); setSelectedSuiteId(null); }}
                  >
                    Create Booking
                  </Button>
                </div>
              </div>
            )}

            {/* ══ CLEANING panel ══════════════════════════════════════════════ */}
            {selectedSuite.status === 'cleaning' && (
              <div className="text-center py-10 text-gray-500">
                <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🧹</span>
                </div>
                <p className="font-medium">Suite is being cleaned</p>
                <p className="text-xs text-gray-400 mt-1">It will be marked available once cleaning is complete.</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
