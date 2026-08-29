import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react';
import { ShoppingCart, Plus, Minus, X, ChevronLeft, CheckCircle, Clock, MapPin, Tablet, Lock, RotateCcw, Utensils, History, User, Plane, Users, CreditCard, AlertTriangle, Leaf, MessageSquare, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../../imports/logo.png';
import { buildCartLineSignatureFromOptions } from '@/lib/cartLineSignature';
import { hasMenuOptions, ItemOptionsModal } from './ItemOptionsModal';

// ── Brand tokens ───────────────────────────────────────────────────────────────
const C = {
  bg:        '#FFFFFF',
  bg2:       '#E7E6DD',
  accent:    '#DCB515',
  accentDim: '#DCB51522',
  text:      '#403F34',
  textMid:   '#403F3499',
  textLight: '#403F3455',
  border:    '#D6D4C8',
};

// ── Suite list ─────────────────────────────────────────────────────────────────
const SUITES = [
  { id: 'CIP-1', name: 'CIP Suite 1',   kind: 'Premiere Suite' },
  { id: 'CIP-2', name: 'CIP Suite 2',   kind: 'Premiere Suite' },
  { id: 'CIP-3', name: 'CIP Suite 3',   kind: 'Premiere Suite' },
  { id: 'CIP-4', name: 'CIP Suite 4',   kind: 'Premiere Suite' },
  { id: 'CIP-5', name: 'CIP Suite 5',   kind: 'Premiere Suite' },
  { id: 'CIP-6', name: 'CIP Suite 6',   kind: 'Premiere Suite' },
  { id: 'FUNC',  name: 'Function Room', kind: 'Premiere Suite' },
  { id: 'LBY-1', name: 'Lobby 1',       kind: 'Lounge Deluxe'  },
  { id: 'LBY-2', name: 'Lobby 2',       kind: 'Lounge Deluxe'  },
  { id: 'LBY-3', name: 'Lobby 3',       kind: 'Lounge Deluxe'  },
  { id: 'LBY-4', name: 'Lobby 4',       kind: 'Lounge Deluxe'  },
];

// ── Booking / member mock data ─────────────────────────────────────────────────
interface GuestProfile {
  name: string;
  relation: 'Main Member' | 'Spouse' | 'Child' | 'Companion' | 'Guest';
  allergies: { allergen: string; severity: 'Mild' | 'Moderate' | 'Severe'; note: string }[];
  dietary: string[];
}
interface MockKioskBooking {
  bookingNo: string;
  memberName: string;
  accountNo: string;
  membershipTier: 'Gold' | 'Platinum' | 'Diamond' | 'Sapphire';
  accountType: 'Individual' | 'Corporate' | 'Agency';
  companyName?: string;
  checkInTime: string;
  flightNo: string;
  flightTime: string;
  flightDestination: string;
  numberOfGuests: number;
  paymentMode: string;
  guestProfiles: GuestProfile[];
}
const MOCK_BOOKING: MockKioskBooking = {
  bookingNo: 'A-202603-000001',
  memberName: 'John Smith',
  accountNo: 'ACC-2024-1001',
  membershipTier: 'Platinum',
  accountType: 'Corporate',
  companyName: 'Tech Solutions Ltd.',
  checkInTime: '14:30',
  flightNo: 'CX888',
  flightTime: '17:30',
  flightDestination: 'London (LHR)',
  numberOfGuests: 2,
  paymentMode: 'On-Credit',
  guestProfiles: [
    {
      name: 'John Smith', relation: 'Main Member',
      allergies: [{ allergen: 'Shellfish', severity: 'Severe', note: 'Avoid all shellfish products.' }],
      dietary: ['Vegetarian'],
    },
    {
      name: 'Mary Smith', relation: 'Spouse',
      allergies: [
        { allergen: 'Nuts',  severity: 'Severe', note: 'Carries EpiPen.' },
        { allergen: 'Dairy', severity: 'Mild',   note: 'Mild lactose sensitivity.' },
      ],
      dietary: ['Gluten-Free'],
    },
  ],
};

// ── Menu catalogue ─────────────────────────────────────────────────────────────
const IMG = (id: string) => `https://images.unsplash.com/${id}?w=480&h=320&fit=crop&crop=center&q=75`;

const MENU: MenuItem[] = [
  // ── Coffee ──
  { id: 'coffee-1', name: 'Latte',               category: 'Coffee',      description: 'Classic espresso with steamed milk',       image: IMG('photo-1506372023823-741c83b836fe'), allergens: ['Dairy'] },
  { id: 'coffee-2', name: 'Cappuccino',          category: 'Coffee',      description: 'Espresso with foamed milk',                image: IMG('photo-1550731358-491ded4af838'), allergens: ['Dairy'] },
  { id: 'coffee-3', name: 'Americano',           category: 'Coffee',      description: 'Espresso with hot water',                  image: IMG('photo-1462917882517-e150004895fa') },
  { id: 'coffee-4', name: 'Espresso',            category: 'Coffee',      description: 'Rich Italian coffee',                     image: IMG('photo-1602320574582-741740d4fcd7') },
  { id: 'coffee-5', name: 'Mocha',               category: 'Coffee',      description: 'Espresso with chocolate and milk',         image: IMG('photo-1572442388796-11668a67e53d'), allergens: ['Dairy'] },
  { id: 'coffee-6', name: 'Flat White',          category: 'Coffee',      description: 'Double espresso with microfoam milk',      image: IMG('photo-1485808191679-5f86510681a2'), allergens: ['Dairy'] },
  { id: 'coffee-7', name: 'Macchiato',           category: 'Coffee',      description: 'Espresso with a dash of milk foam',        image: IMG('photo-1621135177072-57c9b6242e7a'), allergens: ['Dairy'] },
  // ── Tea ──
  { id: 'tea-1',    name: 'English Breakfast',   category: 'Tea',         description: 'Traditional black tea',                   image: IMG('photo-1491720731493-223f97d92c21') },
  { id: 'tea-2',    name: 'Green Tea',           category: 'Tea',         description: 'Fresh Japanese green tea',                image: IMG('photo-1627435601361-ec25f5b1d0e5') },
  { id: 'tea-3',    name: 'Jasmine Tea',         category: 'Tea',         description: 'Fragrant jasmine tea',                    image: IMG('photo-1514733670139-4d87a1941d55') },
  { id: 'tea-4',    name: 'Earl Grey',           category: 'Tea',         description: 'Bergamot-flavored black tea',              image: IMG('photo-1622480916113-9000ac49b79d') },
  { id: 'tea-5',    name: 'Chamomile',           category: 'Tea',         description: 'Calming herbal infusion',                 image: IMG('photo-1567922045116-2a00fae2ed03') },
  { id: 'tea-6',    name: 'Pu-erh Tea',          category: 'Tea',         description: 'Aged Chinese fermented tea',               image: IMG('photo-1546852199-2d8e8c4aaada') },
  // ── Beverages ──
  { id: 'bev-1',    name: 'Orange Juice',        category: 'Beverages',   description: 'Freshly squeezed',                        image: IMG('photo-1613478223719-2ab802602423') },
  { id: 'bev-2',    name: 'Apple Juice',         category: 'Beverages',   description: 'Pure cold-pressed apple juice',            image: IMG('photo-1607690506833-498e04ab3ffa') },
  { id: 'bev-3',    name: 'Still Water',         category: 'Beverages',   description: 'Premium still mineral water',              image: IMG('photo-1719032679635-fe02d53287e4') },
  { id: 'bev-4',    name: 'Sparkling Water',     category: 'Beverages',   description: 'Premium sparkling mineral water',          image: IMG('photo-1559839914-17aae19cec71') },
  { id: 'bev-5',    name: 'Soft Drinks',         category: 'Beverages',   description: 'Coca-Cola, Sprite, etc.',                  image: IMG('photo-1650292390827-51240d74eb0a') },
  { id: 'bev-6',    name: 'Watermelon Juice',    category: 'Beverages',   description: 'Freshly pressed watermelon',               image: IMG('photo-1577680716097-9a565ddc2007') },
  { id: 'bev-7',    name: 'Mango Smoothie',      category: 'Beverages',   description: 'Blended fresh mango',                     image: IMG('photo-1641659735894-45046caad624') },
  { id: 'bev-8',    name: 'Virgin Mojito',       category: 'Beverages',   description: 'Mint, lime, soda',                        image: IMG('photo-1705322149861-c52ff081bb5d') },
  // ── Alcoholic ──
  { id: 'alc-1',    name: 'Dom Pérignon',        category: 'Alcoholic',   description: 'Prestige cuvée champagne',                image: IMG('photo-1546567075-d7113bee3c4a'), allergens: ['Sulphites'] },
  { id: 'alc-2',    name: 'Moët & Chandon',      category: 'Alcoholic',   description: 'Classic champagne',                       image: IMG('photo-1669067166035-7e37abaecec8'), allergens: ['Sulphites'] },
  { id: 'alc-3',    name: 'Red Wine',            category: 'Alcoholic',   description: 'House selection red wine',                image: IMG('photo-1613477581402-306fa9dc6b95'), allergens: ['Sulphites'] },
  { id: 'alc-4',    name: 'White Wine',          category: 'Alcoholic',   description: 'House selection white wine',              image: IMG('photo-1580657274234-7339717f4541'), allergens: ['Sulphites'] },
  { id: 'alc-5',    name: 'Premium Beer',        category: 'Alcoholic',   description: 'Bottled premium beer',                    image: IMG('photo-1580657264608-44775e61c0a1') },
  { id: 'alc-6',    name: 'Whiskey On The Rocks', category: 'Alcoholic',  description: 'Single malt whiskey',                    image: IMG('photo-1615887625746-f3d2aa27e048') },
  { id: 'alc-7',    name: 'Gin & Tonic',         category: 'Alcoholic',   description: 'London dry gin with tonic',               image: IMG('photo-1571104508999-893933ded431') },
  // ── Breakfast ──
  { id: 'breakfast-1', name: 'Premium Breakfast', category: 'Breakfast',  description: 'Eggs, bacon, toast & juice',             image: IMG('photo-1608039829572-78524f79c4c7'), allergens: ['Eggs', 'Gluten', 'Dairy'] },
  { id: 'breakfast-2', name: 'Continental',      category: 'Breakfast',   description: 'Pastries, croissant, jam, coffee',        image: IMG('photo-1664192579086-fe10c4de4d46'), allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'breakfast-3', name: 'Congee Set',       category: 'Breakfast',   description: 'Rice porridge with sides',                image: IMG('photo-1766761562530-c8dd12c96d9a') },
  { id: 'breakfast-4', name: 'Eggs Benedict',    category: 'Breakfast',   description: 'Poached eggs on English muffin',          image: IMG('photo-1712746785649-11ffe27af62e'), allergens: ['Eggs', 'Gluten', 'Dairy'] },
  { id: 'breakfast-5', name: 'Acai Bowl',        category: 'Breakfast',   description: 'Acai, granola, fresh fruits',             image: IMG('photo-1654923064926-be7e64267a31'), allergens: ['Nuts'] },
  // ── Appetiser ──
  { id: 'app-1',    name: 'Caesar Salad',        category: 'Appetiser',   description: 'Romaine with caesar dressing',            image: IMG('photo-1782839577893-da9383e55c96'), allergens: ['Dairy', 'Eggs', 'Fish'] },
  { id: 'app-2',    name: 'Spring Rolls',        category: 'Appetiser',   description: 'Crispy vegetable rolls (4 pcs)',          image: IMG('photo-1679310290259-78d9eaa32700'), allergens: ['Gluten', 'Soy'] },
  { id: 'app-3',    name: 'Edamame',             category: 'Appetiser',   description: 'Steamed soybeans with salt',              image: IMG('photo-1660120447916-123439b05c40'), allergens: ['Soy'] },
  { id: 'app-4',    name: 'Lobster Salad',       category: 'Appetiser',   description: 'Cold poached lobster salad',              image: IMG('photo-1750943082231-0d84cfabc4dd'), allergens: ['Shellfish'] },
  { id: 'app-5',    name: 'Cheese Platter',      category: 'Appetiser',   description: 'Artisan cheese selection',                image: IMG('photo-1678572823447-45fc146df43c'), allergens: ['Dairy'] },
  { id: 'app-6',    name: 'Fruit Platter',       category: 'Appetiser',   description: 'Seasonal fresh fruits',                   image: IMG('photo-1773190060066-473e6096cf71') },
  { id: 'app-7',    name: 'Smoked Salmon Blini', category: 'Appetiser',   description: 'With crème fraîche & capers',             image: IMG('photo-1577906096429-f73c2c312435'), allergens: ['Fish', 'Dairy', 'Gluten'] },
  // ── Main Course ──
  { id: 'main-1',   name: 'Dim Sum Platter',     category: 'Main Course', description: 'Assorted dim sum selection',              image: IMG('photo-1669340781012-ae89fbac9fc3'), allergens: ['Shellfish', 'Gluten', 'Soy'] },
  { id: 'main-2',   name: 'Beef Noodles',        category: 'Main Course', description: 'Braised beef with noodles',               image: IMG('photo-1585032226651-759b368d7246'), allergens: ['Gluten', 'Soy'] },
  { id: 'main-3',   name: 'Seafood Fried Rice',  category: 'Main Course', description: 'Wok-fried rice with seafood',             image: IMG('photo-1551326844-4df70f78d0e9'), allergens: ['Shellfish', 'Fish', 'Eggs'] },
  { id: 'main-4',   name: 'Grilled Chicken',     category: 'Main Course', description: 'Herb-marinated chicken breast',           image: IMG('photo-1603133872878-684f208fb84b') },
  { id: 'main-5',   name: 'Wagyu Burger',        category: 'Main Course', description: 'Premium wagyu patty, brioche',            image: IMG('photo-1521305916504-4a1121188589'), allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'main-6',   name: 'Grilled Salmon',      category: 'Main Course', description: 'With lemon butter sauce',                 image: IMG('photo-1676300185165-3f543c1fcb72'), allergens: ['Fish', 'Dairy'] },
  { id: 'main-7',   name: 'Club Sandwich',       category: 'Main Course', description: 'Triple-decker with fries',               image: IMG('photo-1703575571928-41241f289cce'), allergens: ['Gluten', 'Eggs', 'Dairy'] },
  { id: 'main-8',   name: 'Wonton Noodle Soup',  category: 'Main Course', description: 'Hong Kong style',                        image: IMG('photo-1746183055178-e4d5889140f0'), allergens: ['Shellfish', 'Gluten'] },
  // ── Dessert ──
  { id: 'dessert-1', name: 'Dessert Trio',       category: 'Dessert',     description: 'Three mini desserts',                    image: IMG('photo-1714385905983-6f8e06fffae1'), allergens: ['Dairy', 'Eggs', 'Gluten', 'Nuts'] },
  { id: 'dessert-2', name: 'Mango Pudding',      category: 'Dessert',     description: 'Traditional HK dessert',                 image: IMG('photo-1632395461404-589dccd23456'), allergens: ['Dairy'] },
  { id: 'dessert-3', name: 'Ice Cream',          category: 'Dessert',     description: '2 scoops — vanilla, choc, strawberry',   image: IMG('photo-1568627175730-73d05bd69ca9'), allergens: ['Dairy', 'Eggs'] },
  { id: 'dessert-4', name: 'Tiramisu',           category: 'Dessert',     description: 'Classic Italian dessert',                image: IMG('photo-1781274326687-115ead1c5015'), allergens: ['Dairy', 'Eggs', 'Gluten'] },
  { id: 'dessert-5', name: 'Crème Brûlée',       category: 'Dessert',     description: 'French vanilla custard',                 image: IMG('photo-1717815963501-0a3391a77103'), allergens: ['Dairy', 'Eggs'] },
  { id: 'dessert-6', name: 'Egg Tart',           category: 'Dessert',     description: 'HK style baked egg tart (3 pcs)',        image: IMG('photo-1750572373040-f20b405d6eb2'), allergens: ['Eggs', 'Gluten', 'Dairy'] },
  // ── Snacks ──
  { id: 'snack-1',   name: 'Mixed Nuts',         category: 'Snacks',      description: 'Premium salted mixed nuts',               image: IMG('photo-1693812879904-b8161644ce5a'), allergens: ['Nuts'] },
  { id: 'snack-2',   name: 'Gourmet Chips',      category: 'Snacks',      description: 'Artisan flavoured chips',                 image: IMG('photo-1767877609689-beff32b9c0ac') },
  { id: 'snack-3',   name: 'Chocolate Pralines', category: 'Snacks',      description: 'Belgian chocolate selection',             image: IMG('photo-1693812879565-c0cf703dd7b6'), allergens: ['Dairy', 'Nuts'] },
  { id: 'snack-4',   name: 'Crackers & Dip',     category: 'Snacks',      description: 'Artisan crackers with hummus',            image: IMG('photo-1661259892845-f84f22e79077'), allergens: ['Gluten', 'Soy'] },
];

const CATEGORIES = ['All', ...Array.from(new Set(MENU.map(i => i.category)))];

// ── Types ──────────────────────────────────────────────────────────────────────
export interface SelectedMenuOption {
  optionId: number;
  name: string;
  groupName: string;
}

export interface MenuOptionGroup {
  id: number;
  name: string;
  nameEn?: string;
  nameZh?: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  options: { id: number; name: string; nameEn?: string; nameZh?: string }[];
}

export interface MenuItem {
  id: string;
  name: string;
  /** POS master catalog category (yellow subtitle). */
  category: string;
  posCategoryName?: string;
  /** Active menu section tab — tab filtering only. */
  sectionTab?: string;
  description: string;
  image: string;
  allergens?: string[];
  dietaryTags?: string[];
  optionGroups?: MenuOptionGroup[];
  sectionId?: number;
  selectedOptions?: SelectedMenuOption[];
}
interface CartItem extends MenuItem { qty: number; customNote?: string; kitchenStatus?: string }
export interface PlacedOrder { orderNo: string; placedAt: Date; items: CartItem[]; note: string }
export type KioskScreen = 'assign' | 'welcome' | 'menu' | 'cart' | 'confirm' | 'history';
type Screen = KioskScreen;
type Role = 'staff' | 'customer';

export interface KioskBooking {
  bookingNo: string;
  memberName: string;
  accountNo: string;
  membershipTier: string;
  accountType: string;
  companyName?: string;
  checkInTime: string;
  flightNo: string;
  flightTime: string;
  flightDestination: string;
  numberOfGuests: number;
  paymentMode: string;
  guestProfiles: GuestProfile[];
}

export interface GuestKioskLiveConfig {
  screen: Screen;
  navigate: (screen: Screen) => void;
  suites: { id: string; name: string; kind: string; status?: string; isOccupied?: boolean }[];
  selectedSuiteId: string;
  onSelectSuite: (id: string) => void;
  onPairSuite?: (suiteId: string, bookingId: number | null) => void | Promise<void>;
  isAssigning?: boolean;
  isLoadingSuites?: boolean;
  suitesLoadError?: string | null;
  assignError?: string | null;
  submitError?: string | null;
  unassignedBookings?: Array<{
    id: number;
    booking_number: string;
    guest_name: string;
    pax: number;
    flight_number?: string | null;
    flight_time?: string | null;
  }>;
  isLoadingUnassignedBookings?: boolean;
  isStaffAuthenticated?: boolean;
  onStaffLogin?: (email: string, password: string) => void | Promise<void>;
  isStaffLoggingIn?: boolean;
  staffAuthError?: string | null;
  onStaffLogout?: () => void;
  assignedSuite: { name: string; kind: string } | null;
  guestName: string;
  guestAllergies?: string[];
  t?: (key: string) => string;
  headerLanguageSwitcher?: ReactNode;
  welcomeLanguageSwitcher?: ReactNode;
  menuItems: MenuItem[];
  menuSections?: Array<{ id: number; name: string }>;
  categories: string[];
  cart: CartItem[];
  onAddItem: (item: MenuItem, selectedOptions?: SelectedMenuOption[]) => void;
  onRemoveItem: (id: string) => void;
  onRemoveLine?: (id: string) => void;
  onUpdateItemNote: (id: string, note: string) => void;
  specialNote: string;
  onSpecialNoteChange: (note: string) => void;
  onPlaceOrder: () => void | Promise<void>;
  isSubmitting?: boolean;
  orderNo: string;
  orders: PlacedOrder[];
  confirmCart?: CartItem[];
  booking?: KioskBooking | null;
  onStaffReset: () => void;
  hideDemoToggle?: boolean;
  onRequestCheckout?: () => void | Promise<void>;
  isRequestingCheckout?: boolean;
  checkoutToast?: string | null;
}

function suiteStatusLabel(status?: string, isOccupied?: boolean): string {
  const normalized = String(status ?? '').toLowerCase();
  if (isOccupied || normalized === 'occupied') {
    return 'Occupied';
  }
  if (normalized === 'food-served') {
    return 'Food Served';
  }
  if (normalized === 'cleaning') {
    return 'Cleaning';
  }
  if (normalized === 'reserved') {
    return 'Reserved';
  }
  if (normalized === 'walk-in' || normalized === 'walkin') {
    return 'Walk-in';
  }
  if (normalized === 'available') {
    return 'Available';
  }
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Available';
}

/** Tailwind badge classes aligned with POS Floor Plan legend. */
function suiteStatusBadgeClass(status?: string, isOccupied?: boolean): string {
  const normalized = String(status ?? '').toLowerCase();
  if (isOccupied || normalized === 'occupied') {
    return 'bg-red-100 text-red-800';
  }
  if (normalized === 'food-served') {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (normalized === 'cleaning') {
    return 'bg-orange-100 text-orange-800';
  }
  if (normalized === 'reserved') {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-green-100 text-green-800';
}

function ProductThumbnail({
  imageUrl,
  alt,
  variant = 'menu',
}: {
  imageUrl?: string | null;
  alt: string;
  variant?: 'menu' | 'cart';
}) {
  const src = imageUrl?.trim();
  const menuClasses = 'w-20 aspect-square object-cover';
  const cartClasses = 'w-16 h-16 rounded-md object-cover aspect-square mr-4';

  if (!src) {
    return (
      <div
        className={`shrink-0 bg-gray-200 ${variant === 'menu' ? menuClasses : cartClasses}`}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`shrink-0 ${variant === 'menu' ? menuClasses : cartClasses}`}
    />
  );
}

// ── Shared header component ────────────────────────────────────────────────────
function KioskHeader({
  subtitle,
  languageSwitcher,
}: {
  subtitle?: string;
  languageSwitcher?: ReactNode;
}) {
  return (
    <div className="relative flex flex-col items-center py-5 border-b shrink-0" style={{ borderColor: C.border, background: C.bg }}>
      {languageSwitcher && (
        <div className="absolute top-4 right-4 z-10">
          {languageSwitcher}
        </div>
      )}
      <img src={logoImg} alt="HKIA VIP Lounge" className="h-10 mb-2" />
      
      {subtitle && (
        <p className="text-xs mt-0.5 tracking-widest uppercase" style={{ color: C.accent }}>{subtitle}</p>
      )}
    </div>
  );
}

// ── Info panel (shared between welcome & menu screens) ─────────────────────────
function InfoPanel({ booking = MOCK_BOOKING }: { booking?: KioskBooking }) {
  return (
    <div className="w-72 flex flex-col overflow-y-auto shrink-0 border-l" style={{ borderColor: C.border, background: C.bg2 }}>

      {/* Member */}
      <div className="p-4 border-b" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-1.5 mb-3">
          <User className="w-3.5 h-3.5" style={{ color: C.textMid }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: C.textMid }}>Member</span>
        </div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-sm font-semibold" style={{ color: C.text }}>{booking.memberName}</p>
            <p className="text-xs mt-0.5" style={{ color: C.textMid }}>{booking.accountNo}</p>
            {booking.companyName && (
              <p className="text-xs mt-0.5" style={{ color: C.textMid }}>{booking.companyName}</p>
            )}
          </div>
          <span className="text-xs px-2 py-1 rounded-full border font-medium shrink-0"
            style={{ background: C.accentDim, color: C.accent, borderColor: C.accent + '55' }}>
            {booking.membershipTier}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: C.textLight }}>
          <CreditCard className="w-3 h-3" />
          {booking.paymentMode} · {booking.accountType}
        </div>
      </div>

      {/* Booking */}
      <div className="p-4 border-b" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5" style={{ color: C.textMid }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: C.textMid }}>Booking</span>
        </div>
        <p className="text-xs font-mono font-semibold mb-3" style={{ color: C.accent }}>{booking.bookingNo}</p>
        <div className="space-y-2">
          {[
            { icon: Clock,  label: 'Check-in',    val: booking.checkInTime },
            { icon: Users,  label: 'Guests',       val: `${booking.numberOfGuests} pax` },
            { icon: Plane,  label: 'Flight',        val: booking.flightNo },
            { icon: null,   label: 'Departure',    val: booking.flightTime },
            { icon: null,   label: 'Destination',  val: booking.flightDestination },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5" style={{ color: C.textMid }}>
                {Icon && <Icon className="w-3 h-3" />}{label}
              </span>
              <span style={{ color: C.text }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs uppercase tracking-wider text-red-500">Allergies & Dietary</span>
        </div>
        <div className="space-y-3">
          {booking.guestProfiles.map((guest, i) =>
            (guest.allergies.length > 0 || guest.dietary.length > 0) ? (
              <div key={i} className="rounded-xl p-3" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold" style={{ color: C.text }}>{guest.name}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: C.bg2, color: C.textMid }}>{guest.relation}</span>
                </div>
                {guest.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {guest.allergies.map((a, j) => (
                      <span key={j} className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        a.severity === 'Severe'   ? 'bg-red-50 text-red-600 border-red-200' :
                        a.severity === 'Moderate' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {a.severity === 'Severe' ? '⚠ ' : ''}{a.allergen}
                      </span>
                    ))}
                  </div>
                )}
                {guest.dietary.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {guest.dietary.map((d, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                        <Leaf className="w-2.5 h-2.5" />{d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export function GuestKiosk({ live }: { live?: GuestKioskLiveConfig }) {
  const [internalScreen, setInternalScreen] = useState<Screen>('assign');
  const [internalAssignedSuite, setInternalAssignedSuite] = useState<typeof SUITES[0] | null>(null);
  const [internalSelectedSuiteId, setInternalSelectedSuiteId] = useState('');
  const [internalCart, setInternalCart] = useState<CartItem[]>([]);
  const [internalSpecialNote, setInternalSpecialNote] = useState('');
  const [internalOrderNo, setInternalOrderNo] = useState('');
  const [internalOrders, setInternalOrders] = useState<PlacedOrder[]>([]);
  const [category, setCategory]       = useState('All');
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [clock, setClock]             = useState(new Date());
  const [role, setRole]               = useState<Role>('staff');
  const [notePopupId, setNotePopupId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft]     = useState('');
  const [optionsModalItem, setOptionsModalItem] = useState<MenuItem | null>(null);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const noteTextareaRef               = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (live?.hideDemoToggle) {
      setRole('customer');
    }
  }, [live?.hideDemoToggle]);

  useEffect(() => {
    if (live?.checkoutToast) {
      setShowCheckoutConfirm(false);
    }
  }, [live?.checkoutToast]);

  const screen = live?.screen ?? internalScreen;
  const goTo = (next: Screen) => {
    if (live) live.navigate(next);
    else setInternalScreen(next);
  };

  const suiteList = live?.suites ?? SUITES;
  const selectedSuiteId = live?.selectedSuiteId ?? internalSelectedSuiteId;
  const setSelectedSuiteId = live?.onSelectSuite ?? setInternalSelectedSuiteId;
  const assignedSuite = live?.assignedSuite ?? internalAssignedSuite;
  const cart = live?.cart ?? internalCart;
  const specialNote = live?.specialNote ?? internalSpecialNote;
  const setSpecialNote = live?.onSpecialNoteChange ?? setInternalSpecialNote;
  const orderNo = live?.orderNo ?? internalOrderNo;
  const orders = live?.orders ?? internalOrders;
  const confirmCart = live?.confirmCart ?? cart;
  const menuSource = live ? (live.menuItems ?? []) : MENU;
  const menuSections = live ? (live.menuSections ?? []) : [];
  const categoryList = live ? (live.categories ?? ['All']) : CATEGORIES;
  const bookingData = live?.booking ?? MOCK_BOOKING;
  const guestDisplayName = live?.guestName ?? MOCK_BOOKING.memberName;
  const translate = (key: string) => live?.t?.(key) ?? key;

  const menuItemSignature = live?.menuItems?.map((item) => item.id).join('|') ?? '';

  useEffect(() => {
    if (!live) return;
    setCategory('All');
  }, [live, menuItemSignature]);

  useEffect(() => {
    if (!live || category === 'All') return;
    if (!categoryList.includes(category)) {
      setCategory('All');
    }
  }, [live, categoryList, category]);

  const filteredMenu = useMemo(() => {
    if (category === 'All') {
      return menuSource;
    }
    return menuSource.filter((item) => (item.sectionTab ?? item.category) === category);
  }, [menuSource, category]);

  const handleSuiteClick = (suiteId: string) => {
    setSelectedSuiteId(suiteId);
    setPendingBookingId(null);
    if (live?.onPairSuite) {
      setShowBookingDialog(true);
      return;
    }
  };

  const confirmPair = async () => {
    if (!live?.onPairSuite || !selectedSuiteId) return;
    await live.onPairSuite(selectedSuiteId, pendingBookingId);
    setShowBookingDialog(false);
  };

  const addItem = (item: MenuItem, selectedOptions?: SelectedMenuOption[]) => {
    if (live) {
      live.onAddItem(item, selectedOptions);
      return;
    }
    const lineId = buildCartLineSignatureFromOptions(item.id, selectedOptions);
    const cartItem: CartItem = {
      ...item,
      id: lineId,
      selectedOptions,
      qty: 1,
    };
    setInternalCart(prev => {
      const ex = prev.find(c => c.id === lineId);
      return ex ? prev.map(c => c.id === lineId ? { ...c, qty: c.qty + 1 } : c)
                : [...prev, cartItem];
    });
  };

  const handleMenuCardClick = (item: MenuItem) => {
    if (hasMenuOptions(item)) {
      setOptionsModalItem(item);
      return;
    }
    addItem(item);
  };

  const removeItem = (id: string) => {
    if (live) {
      live.onRemoveItem(id);
      return;
    }
    setInternalCart(prev => {
      const ex = prev.find(c => c.id === id);
      if (!ex) return prev;
      return ex.qty === 1 ? prev.filter(c => c.id !== id)
                          : prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    });
  };

  const getQty = (id: string) =>
    cart
      .filter((line) => line.id === id || line.id.startsWith(`${id}-`))
      .reduce((sum, line) => sum + line.qty, 0);

  const removeMenuItem = (baseId: string) => {
    const matching = cart.filter((line) => line.id === baseId || line.id.startsWith(`${baseId}-`));
    if (!matching.length) {
      return;
    }
    removeItem(matching[matching.length - 1].id);
  };
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const guestAllergens = new Set(
    (live?.guestAllergies ?? bookingData.guestProfiles.flatMap(g => g.allergies.map(a => a.allergen)))
      .map((allergen) => allergen.toLowerCase()),
  );
  const hasAllergenWarning = (item: MenuItem) =>
    item.allergens?.some(a => guestAllergens.has(a.toLowerCase())) ?? false;

  const handleStaffViewToggle = () => {
    setRole(role === 'staff' ? 'customer' : 'staff');
  };

  const handlePlaceOrder = async () => {
    if (live) {
      await live.onPlaceOrder();
      return;
    }
    const no = `ORD-${Date.now().toString().slice(-6)}`;
    setInternalOrders(prev => [{ orderNo: no, placedAt: new Date(), items: cart, note: specialNote }, ...prev]);
    setInternalOrderNo(no);
    goTo('confirm');
  };

  const openNotePopup = (item: CartItem) => {
    setNoteDraft(item.customNote ?? '');
    setNotePopupId(item.id);
    setTimeout(() => noteTextareaRef.current?.focus(), 80);
  };

  const saveNote = () => {
    if (!notePopupId) return;
    if (live) {
      live.onUpdateItemNote(notePopupId, noteDraft);
    } else {
      setInternalCart(prev => prev.map(c => c.id === notePopupId ? { ...c, customNote: noteDraft.trim() || undefined } : c));
    }
    setNotePopupId(null);
  };

  const dateStr = clock.toLocaleDateString('en-HK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const kitchenStatusStyle = (status?: string) => {
    const normalized = (status ?? '').toLowerCase();
    if (normalized === 'served') return { color: '#16a34a' };
    if (normalized === 'preparing') return { color: '#2563eb' };
    if (normalized === 'pending') return { color: '#ca8a04' };
    return { color: C.textMid };
  };

  // ── Shared button styles ──
  const btnAccent = { background: C.accent, color: C.bg } as React.CSSProperties;
  const btnGhost  = { background: C.bg2, color: C.text, border: `1px solid ${C.border}` } as React.CSSProperties;

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Demo role toggle (figma preview only) ── */}
      {!live?.hideDemoToggle && (
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest opacity-50 font-medium" style={{ color: C.text }}>
          Demo only
        </span>
        <button
          onClick={handleStaffViewToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-sm"
          style={role === 'staff'
            ? { background: C.accent, color: C.bg, border: `1px solid ${C.accent}` }
            : { background: C.bg2, color: C.textMid, border: `1px solid ${C.border}` }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: role === 'staff' ? C.bg : C.textLight }} />
          {role === 'staff' ? 'Staff View' : 'Customer View'}
        </button>
      </div>
      )}

      {/* ── Item Custom Note Popup ──────────────────────────────────────────── */}
      <AnimatePresence>
        {notePopupId && (() => {
          const item = cart.find(c => c.id === notePopupId);
          if (!item) return null;
          return (
            <motion.div key="note-popup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={() => setNotePopupId(null)}>
              <motion.div initial={{ scale: 0.88, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 12 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="rounded-3xl p-7 w-[380px] shadow-2xl"
                style={{ background: C.bg, border: `1px solid ${C.border}` }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="font-semibold" style={{ color: C.text }}>{item.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.textMid }}>{item.category}</p>
                  </div>
                  <button onClick={() => setNotePopupId(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: C.textLight, background: C.bg2 }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: C.textMid }}>
                  Custom Instructions
                </label>
                <textarea
                  ref={noteTextareaRef}
                  value={noteDraft}
                  onChange={e => setNoteDraft(e.target.value)}
                  placeholder="e.g. Extra hot, no sugar, oat milk…"
                  rows={4}
                  className="w-full px-4 py-3 text-sm resize-none focus:outline-none rounded-2xl mb-5"
                  style={{ background: C.bg2, border: `1.5px solid ${C.border}`, color: C.text }}
                  onFocus={e => (e.target.style.borderColor = C.accent)}
                  onBlur={e => (e.target.style.borderColor = C.border)}
                />

                <div className="flex gap-2">
                  <button onClick={() => setNotePopupId(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
                    style={btnGhost}>
                    Cancel
                  </button>
                  <button onClick={saveNote}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]"
                    style={btnAccent}>
                    Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {optionsModalItem && (
          <ItemOptionsModal
            item={optionsModalItem}
            t={translate}
            onClose={() => setOptionsModalItem(null)}
            onConfirm={(selectedOptions) => {
              addItem(optionsModalItem, selectedOptions);
              setOptionsModalItem(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Select Booking dialog (staff assign flow) ───────────────────────── */}
      <AnimatePresence>
        {showBookingDialog && (
          <motion.div
            key="booking-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBookingDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="rounded-3xl p-6 w-full max-w-md shadow-2xl mx-4"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-lg font-semibold mb-1" style={{ color: C.text }}>Select Booking</p>
              <p className="text-sm mb-4" style={{ color: C.textMid }}>
                Link a reservation to this suite, or start as a walk-in.
              </p>

              <button
                type="button"
                onClick={() => setPendingBookingId(null)}
                className={`w-full text-left px-4 py-3 rounded-xl border mb-3 transition-all min-h-[44px] ${
                  pendingBookingId === null ? 'ring-2 ring-offset-1' : ''
                }`}
                style={{
                  background: pendingBookingId === null ? C.accentDim : C.bg,
                  borderColor: pendingBookingId === null ? C.accent : C.border,
                  color: C.text,
                }}
              >
                <span className="font-semibold">Walk-in (No Booking)</span>
                <span className="block text-xs mt-0.5" style={{ color: C.textMid }}>No linked reservation</span>
              </button>

              {live?.isLoadingUnassignedBookings ? (
                <p className="text-sm text-center py-4" style={{ color: C.textMid }}>Loading bookings…</p>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-2 mb-4">
                  {(live?.unassignedBookings ?? []).map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setPendingBookingId(booking.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all min-h-[44px] ${
                        pendingBookingId === booking.id ? 'ring-2 ring-offset-1' : ''
                      }`}
                      style={{
                        background: pendingBookingId === booking.id ? C.accentDim : C.bg,
                        borderColor: pendingBookingId === booking.id ? C.accent : C.border,
                        color: C.text,
                      }}
                    >
                      <div className="flex justify-between gap-2">
                        <span className="font-medium">{booking.guest_name}</span>
                        <span className="text-xs" style={{ color: C.textMid }}>{booking.booking_number}</span>
                      </div>
                      <span className="text-xs block mt-0.5" style={{ color: C.textMid }}>
                        {booking.flight_number ?? '—'}
                        {booking.flight_time ? ` · ${booking.flight_time}` : ''}
                        {` · ${booking.pax} pax`}
                      </span>
                    </button>
                  ))}
                  {(live?.unassignedBookings ?? []).length === 0 && (
                    <p className="text-xs text-center py-2" style={{ color: C.textMid }}>
                      No unassigned bookings for today.
                    </p>
                  )}
                </div>
              )}

              {live?.assignError && (
                <p className="text-sm mb-3 text-center text-red-600">{live.assignError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingDialog(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium min-h-[44px]"
                  style={btnGhost}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void confirmPair()}
                  disabled={live?.isAssigning}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold min-h-[44px] disabled:opacity-50"
                  style={btnAccent}
                >
                  {live?.isAssigning ? 'Assigning…' : 'Assign & Start Guest Mode'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Request checkout confirmation ─────────────────────────────────────── */}
      <AnimatePresence>
        {showCheckoutConfirm && (
          <motion.div
            key="checkout-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => !live?.isRequestingCheckout && setShowCheckoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="rounded-3xl p-6 w-full max-w-md shadow-2xl mx-4"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-lg font-semibold mb-1" style={{ color: C.text }}>
                {translate('checkout.confirmTitle')}
              </p>
              <p className="text-sm mb-5" style={{ color: C.textMid }}>
                {translate('checkout.confirmMessage')}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCheckoutConfirm(false)}
                  disabled={live?.isRequestingCheckout}
                  className="flex-1 py-3 rounded-xl text-sm font-medium min-h-[44px] disabled:opacity-50"
                  style={btnGhost}
                >
                  {translate('checkout.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => void live?.onRequestCheckout?.()}
                  disabled={live?.isRequestingCheckout}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold min-h-[44px] disabled:opacity-50 border border-red-500 text-red-600 hover:bg-red-50"
                >
                  {live?.isRequestingCheckout ? '…' : translate('checkout.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {live?.checkoutToast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-medium text-green-800 shadow-lg">
          {live.checkoutToast}
        </div>
      )}

      {/* ══ ASSIGN ══════════════════════════════════════════════════════════════ */}
      {screen === 'assign' && (
        <div className="h-full flex flex-col">
          {/* Header with logo */}
          <div className="flex flex-col items-center py-6 border-b" style={{ borderColor: C.border }}>
            <img src={logoImg} alt="HKIA VIP Lounge" className="h-12 mb-3" />
            <p className="text-sm tracking-[0.15em] uppercase font-medium" style={{ color: C.text }}>
              Hong Kong International Airport Lounge
            </p>
            <p className="text-xs tracking-[0.2em] uppercase mt-1" style={{ color: C.accent }}>
              iPad Suite Assignment
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
            <div className="w-full max-w-lg">
              {live && !live.isStaffAuthenticated ? (
                <div className="rounded-2xl p-6" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.accentDim }}>
                      <Lock className="w-5 h-5" style={{ color: C.accent }} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: C.text }}>Staff Login</p>
                      <p className="text-xs" style={{ color: C.textMid }}>Sign in to assign this iPad</p>
                    </div>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void live.onStaffLogin?.(staffEmail.trim(), staffPassword);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label htmlFor="staff-login-email" className="text-xs uppercase tracking-wider block mb-1.5" style={{ color: C.textMid }}>Email</label>
                      <input
                        id="staff-login-email"
                        type="email"
                        autoComplete="username"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none min-h-[44px]"
                        style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="staff-login-password" className="text-xs uppercase tracking-wider block mb-1.5" style={{ color: C.textMid }}>Password</label>
                      <input
                        id="staff-login-password"
                        type="password"
                        autoComplete="current-password"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none min-h-[44px]"
                        style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
                        required
                      />
                    </div>
                    {live.staffAuthError && (
                      <p className="text-sm text-red-600 text-center">{live.staffAuthError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={live.isStaffLoggingIn}
                      className="w-full py-4 rounded-xl font-semibold text-sm min-h-[44px] disabled:opacity-50"
                      style={btnAccent}
                    >
                      {live.isStaffLoggingIn ? 'Signing in…' : 'Sign In'}
                    </button>
                  </form>
                </div>
              ) : (
              <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.accentDim }}>
                  <Tablet className="w-5 h-5" style={{ color: C.accent }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: C.text }}>Assign Suite to this iPad</p>
                  <p className="text-xs" style={{ color: C.textMid }}>Tap a suite to link a booking or walk-in</p>
                </div>
                {live?.onStaffLogout && (
                  <button
                    type="button"
                    onClick={live.onStaffLogout}
                    className="text-xs px-3 py-1.5 rounded-lg min-h-[44px]"
                    style={btnGhost}
                  >
                    Log out
                  </button>
                )}
              </div>

              <div className="rounded-2xl p-6 mb-4" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
                <label className="text-xs uppercase tracking-wider block mb-3" style={{ color: C.textMid }}>
                  Select Suite / Lobby
                </label>
                {live?.isLoadingSuites ? (
                  <p className="text-sm mb-2 text-center" style={{ color: C.textMid }}>Loading suites…</p>
                ) : live?.suitesLoadError ? (
                  <p className="text-sm mb-2 text-center text-red-600">{live.suitesLoadError}</p>
                ) : suiteList.length === 0 ? (
                  <p className="text-sm mb-2 text-center" style={{ color: C.textMid }}>No active suites found.</p>
                ) : (
                <div className="grid grid-cols-2 gap-2">
                  {suiteList.map(s => {
                    const statusLabel = suiteStatusLabel(s.status, s.isOccupied);
                    const badgeClass = suiteStatusBadgeClass(s.status, s.isOccupied);
                    return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (live?.onPairSuite) {
                          handleSuiteClick(s.id);
                          return;
                        }
                        setSelectedSuiteId(s.id);
                        const found = suiteList.find((row) => row.id === s.id);
                        if (found) {
                          setInternalAssignedSuite(found);
                          goTo('welcome');
                        }
                      }}
                      className="flex flex-col items-start gap-1 px-4 py-3 rounded-xl border transition-all text-left active:scale-[0.98] min-h-[44px]"
                      style={selectedSuiteId === s.id
                        ? { background: C.accentDim, borderColor: C.accent, color: C.text }
                        : { background: C.bg, borderColor: C.border, color: C.textMid }}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <span className="text-sm font-medium">{s.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${badgeClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <span className="text-xs opacity-60">{s.kind}</span>
                    </button>
                    );
                  })}
                </div>
                )}
              </div>
              <p className="text-center text-xs" style={{ color: C.textLight }}>Staff only — guests will see the ordering screen</p>
              </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ WELCOME ═════════════════════════════════════════════════════════════ */}
      {screen === 'welcome' && (
        <div className="h-full flex flex-col">
          <KioskHeader languageSwitcher={live?.headerLanguageSwitcher} />
          <div className="flex-1 flex overflow-hidden">

            {/* Left — greeting */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
              <button
                type="button"
                onClick={() => {
                  if (live) {
                    live.onStaffReset();
                    return;
                  }
                  setInternalAssignedSuite(null);
                  setInternalSelectedSuiteId('');
                  setInternalCart([]);
                  goTo('assign');
                }}
                className="absolute top-4 right-4 p-2 rounded-xl transition-colors opacity-30 hover:opacity-100 min-h-[44px] min-w-[44px]"
                style={{ background: C.bg2 }}
                aria-label="Re-assign iPad"
              >
                <RotateCcw className="w-4 h-4" style={{ color: C.text }} />
              </button>

              <div className="text-center mb-6">
                
                <p className="text-sm" style={{ color: C.textMid }}>{dateStr}</p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
                style={{ background: C.accentDim, color: C.accent, border: `1px solid ${C.accent}55` }}>
                <MapPin className="w-3.5 h-3.5" />
                {assignedSuite?.name} · {assignedSuite?.kind}
              </div>

              <h1 className="text-5xl mb-4 text-center" style={{ fontWeight: 300, color: C.text }}>
                {translate('welcome.greeting')}
              </h1>

              {live?.welcomeLanguageSwitcher && (
                <div className="mb-8">
                  {live.welcomeLanguageSwitcher}
                </div>
              )}

              <button onClick={() => goTo('menu')}
                className="px-12 py-5 rounded-2xl font-semibold text-lg transition-all active:scale-[0.97] shadow-lg mb-4"
                style={{ ...btnAccent, boxShadow: `0 8px 24px ${C.accent}44` }}>
                <span className="flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  {translate('welcome.orderNow')}
                </span>
              </button>

              <button onClick={() => goTo('history')}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm transition-all active:scale-[0.97]"
                style={btnGhost}>
                <History className="w-4 h-4" />
                {translate('welcome.orderHistory')} {orders.length > 0 && `(${orders.length})`}
              </button>
            </div>

            {role === 'staff' && live?.booking && <InfoPanel booking={live.booking} />}
            {role === 'staff' && !live && <InfoPanel />}
          </div>
        </div>
      )}

      {/* ══ MENU ════════════════════════════════════════════════════════════════ */}
      {screen === 'menu' && (
        <div className="h-full flex flex-col">
          <KioskHeader subtitle={assignedSuite?.name} languageSwitcher={live?.headerLanguageSwitcher} />

          <div className="flex-1 flex overflow-hidden">
            {/* Left — menu */}
            <div className="flex-1 flex flex-col min-w-0">

              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-3 border-b shrink-0"
                style={{ borderColor: C.border, background: C.bg }}>
                <button onClick={() => goTo('welcome')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
                  style={btnGhost}>
                  <ChevronLeft className="w-4 h-4" /> {translate('menu.back')}
                </button>
                <div className="flex items-center gap-2">
                  {live?.onRequestCheckout && (
                    <button
                      type="button"
                      onClick={() => setShowCheckoutConfirm(true)}
                      disabled={live.isRequestingCheckout}
                      className="flex items-center gap-1.5 border border-red-500 text-red-600 px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Bell className="w-4 h-4" />
                      {translate('checkout.request')}
                    </button>
                  )}
                  <button onClick={() => goTo('history')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
                    style={btnGhost}>
                    <History className="w-4 h-4" />
                    {translate('menu.history')}
                    {orders.length > 0 && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                        style={{ background: C.accent, color: C.bg }}>{orders.length}</span>
                    )}
                  </button>
                  <button onClick={() => cartCount > 0 && goTo('cart')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all"
                    style={cartCount > 0 ? btnAccent : { ...btnGhost, opacity: 0.5, cursor: 'default' }}>
                    <ShoppingCart className="w-4 h-4" />
                    {translate('menu.cart')}
                    {cartCount > 0 && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: C.bg, color: C.accent }}>{cartCount}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 px-5 py-3 overflow-x-auto shrink-0 border-b" style={{ borderColor: C.border, background: C.bg }}>
                {categoryList.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className="px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all shrink-0 font-medium"
                    style={category === cat ? btnAccent : { background: C.bg2, color: C.textMid, border: `1px solid ${C.border}` }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-5 py-4" style={{ background: C.bg2 }}>
                {filteredMenu.length === 0 ? (
                  <p className="py-10 text-center text-sm" style={{ color: C.textMid }}>
                    {live && menuSource.length === 0
                      ? translate('menu.noActiveMenu')
                      : translate('menu.noItemsInSection')}
                  </p>
                ) : (
                <div key={category} className="grid grid-cols-3 gap-3">
                  {filteredMenu.map((item) => {
                    const qty = getQty(item.id);
                    const warn = hasAllergenWarning(item);
                    const rowKey = `${item.sectionId ?? 'all'}-${item.id}`;
                    const allergenText = item.allergens?.length
                      ? `⚠️ ${translate('menu.contains')}: ${item.allergens.join(', ')}`
                      : null;
                    return (
                      <div
                        key={rowKey}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleMenuCardClick(item)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleMenuCardClick(item);
                          }
                        }}
                        className={`rounded-2xl flex flex-row transition-shadow overflow-hidden relative cursor-pointer hover:shadow-md ${
                          warn ? 'border-2 border-red-500 bg-red-50' : ''
                        }`}
                        style={warn ? undefined : {
                          background: C.bg,
                          border: `1.5px solid ${qty > 0 ? C.accent : C.border}`,
                          boxShadow: qty > 0 ? `0 0 0 3px ${C.accent}22` : undefined,
                        }}
                      >
                        <div className="shrink-0 overflow-hidden relative pointer-events-none">
                          <ProductThumbnail imageUrl={item.image} alt={item.name} variant="menu" />
                          {warn && (
                            <div className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center shadow bg-red-100">
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between pointer-events-none">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="font-semibold text-sm leading-tight" style={{ color: C.text }}>{item.name}</p>
                              {hasMenuOptions(item) && (
                                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                                  {translate('menu.options')}
                                </span>
                              )}
                              {(item.dietaryTags ?? []).map((tag) => (
                                <span
                                  key={`${item.id}-${tag}`}
                                  className="px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 rounded-full uppercase tracking-wider"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <p className="text-[10px] font-medium uppercase tracking-wide mt-0.5" style={{ color: C.accent }}>{item.posCategoryName ?? item.category}</p>
                            {allergenText && (
                              <p className={`text-[10px] leading-tight mt-0.5 line-clamp-2 ${warn ? 'text-red-600' : ''}`}
                                style={warn ? undefined : { color: C.textMid }}>
                                {allergenText}
                              </p>
                            )}
                          </div>
                        </div>

                        <div
                          className="relative z-10 flex items-center pr-3 shrink-0 self-center"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {qty === 0 ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                handleMenuCardClick(item);
                              }}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center active:scale-95 min-h-[44px] min-w-[44px] ${
                                warn ? 'bg-red-600 text-white' : ''
                              }`}
                              style={warn ? undefined : btnAccent}
                              aria-label={warn ? `${translate('menu.addWithCaution')} ${item.name}` : `Add ${item.name}`}
                            >
                              {warn ? (
                                <span className="text-[9px] font-bold leading-none px-1">!</span>
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  event.preventDefault();
                                  removeMenuItem(item.id);
                                }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all min-h-[44px] min-w-[44px]"
                                style={btnGhost}
                                aria-label={`Remove ${item.name}`}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-sm font-bold w-5 text-center" style={{ color: C.text }}>{qty}</span>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  event.preventDefault();
                                  handleMenuCardClick(item);
                                }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all min-h-[44px] min-w-[44px]"
                                style={warn ? { background: '#dc2626', color: '#fff' } : btnAccent}
                                aria-label={`Add another ${item.name}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>

              {/* Sticky cart bar */}
              {cartCount > 0 && (
                <div className="px-5 pb-5 pt-3 shrink-0 border-t" style={{ borderColor: C.border, background: C.bg }}>
                  <button onClick={() => goTo('cart')}
                    className="w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
                    style={{ ...btnAccent, boxShadow: `0 4px 16px ${C.accent}44` }}>
                    <ShoppingCart className="w-5 h-5" />
                    View Cart ({cartCount} item{cartCount !== 1 ? 's' : ''})
                  </button>
                </div>
              )}
            </div>

            {role === 'staff' && live?.booking && <InfoPanel booking={live.booking} />}
            {role === 'staff' && !live && <InfoPanel />}
          </div>
        </div>
      )}

      {/* ══ CART ════════════════════════════════════════════════════════════════ */}
      {screen === 'cart' && (
        <div className="h-full flex flex-col">
          <KioskHeader subtitle={assignedSuite?.name} languageSwitcher={live?.headerLanguageSwitcher} />

          <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0" style={{ borderColor: C.border }}>
            <button onClick={() => goTo('menu')}
              className="p-2 rounded-xl transition-colors" style={btnGhost}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="font-semibold" style={{ color: C.text }}>Review Order</p>
              <p className="text-xs" style={{ color: C.textMid }}>{assignedSuite?.name}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4" style={{ background: C.bg2 }}>
            <div className="space-y-2 mb-6">
              {cart.map(item => (
                <div key={item.id} className="rounded-2xl overflow-hidden"
                  style={{ background: C.bg, border: `1px solid ${item.customNote ? C.accent : C.border}` }}>
                  {/* Main row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <ProductThumbnail imageUrl={item.image} alt={item.name} variant="cart" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: C.text }}>{item.name}</p>
                      <p className="text-xs" style={{ color: C.textMid }}>{item.category}</p>
                      {item.selectedOptions?.length ? (
                        <p className="text-xs mt-0.5" style={{ color: C.textMid }}>
                          {item.selectedOptions.map((option) => option.name).join(', ')}
                        </p>
                      ) : null}
                    </div>
                    {/* Custom button */}
                    <button onClick={() => openNotePopup(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 shrink-0"
                      style={item.customNote
                        ? { background: C.accentDim, color: C.accent, border: `1px solid ${C.accent}55` }
                        : { background: C.bg2, color: C.textMid, border: `1px solid ${C.border}` }}>
                      <MessageSquare className="w-3 h-3" />
                      Custom
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                        style={btnGhost}>
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold" style={{ color: C.text }}>{item.qty}</span>
                      <button onClick={() => addItem(item, item.selectedOptions)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                        style={btnAccent}>
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => {
                      if (live?.onRemoveLine) live.onRemoveLine(item.id);
                      else if (live) {
                        for (let i = 0; i < item.qty; i++) live.onRemoveItem(item.id);
                      } else {
                        setInternalCart(c => c.filter(x => x.id !== item.id));
                      }
                    }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 hover:text-red-500"
                      style={{ color: C.textLight }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Custom note pill */}
                  {item.customNote && (
                    <div className="flex items-start gap-1.5 px-4 pb-3">
                      <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.accent }} />
                      <p className="text-xs leading-snug" style={{ color: C.textMid }}>{item.customNote}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: C.textMid }}>
                Special Requests (optional)
              </label>
              <textarea value={specialNote} onChange={e => setSpecialNote(e.target.value)}
                placeholder="Allergies, preferences, special instructions…"
                rows={3}
                className="w-full px-4 py-3 text-sm resize-none focus:outline-none rounded-xl"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
            </div>

            
          </div>

          <div className="px-6 pb-5 pt-3 shrink-0 border-t" style={{ borderColor: C.border, background: C.bg }}>
            {live?.submitError && (
              <p className="text-sm text-red-600 text-center mb-3">{live.submitError}</p>
            )}
            <button onClick={handlePlaceOrder}
              disabled={live?.isSubmitting}
              className="w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-[0.98] shadow-lg disabled:opacity-60"
              style={{ ...btnAccent, boxShadow: `0 4px 16px ${C.accent}44` }}>
              {live?.isSubmitting ? 'Submitting…' : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      {/* ══ CONFIRM ═════════════════════════════════════════════════════════════ */}
      {screen === 'confirm' && (
        <div className="h-full flex flex-col">
          <KioskHeader languageSwitcher={live?.headerLanguageSwitcher} />
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ background: C.bg2 }}>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ background: C.accentDim, border: `2px solid ${C.accent}55` }}>
              <CheckCircle className="w-12 h-12" style={{ color: C.accent }} />
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h1 className="text-3xl mb-2" style={{ fontWeight: 300, color: C.text }}>Order Placed!</h1>
              <p className="mb-6" style={{ color: C.textMid }}>Your order has been sent to our team</p>

              <div className="inline-flex flex-col items-center rounded-2xl px-8 py-5 mb-6"
                style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: C.textMid }}>Order Number</p>
                <p className="text-2xl font-mono font-bold" style={{ color: C.accent }}>{orderNo}</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm mb-8" style={{ color: C.textMid }}>
                <Clock className="w-4 h-4" />
                Estimated delivery: 10–15 minutes
              </div>

              <div className="rounded-2xl p-4 mb-8 text-left max-w-sm mx-auto"
                style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                {confirmCart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1" style={{ color: C.textMid }}>
                    <span>{item.name}</span>
                    <span>× {item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={() => { if (!live) { setInternalCart([]); setCategory('All'); setInternalSpecialNote(''); } goTo('menu'); }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all active:scale-[0.97] shadow-lg"
                  style={{ ...btnAccent, boxShadow: `0 4px 16px ${C.accent}44` }}>
                  <Utensils className="w-4 h-4" />
                  Order More
                </button>
                <button onClick={() => goTo('history')}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-medium transition-all active:scale-[0.97]"
                  style={btnGhost}>
                  <History className="w-4 h-4" />
                  View History
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ══ HISTORY ═════════════════════════════════════════════════════════════ */}
      {screen === 'history' && (
        <div className="h-full flex flex-col">
          <KioskHeader languageSwitcher={live?.headerLanguageSwitcher} />

          <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0" style={{ borderColor: C.border, background: C.bg }}>
            <button onClick={() => goTo('menu')} className="p-2 rounded-xl transition-colors" style={btnGhost}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="font-semibold" style={{ color: C.text }}>Order History</p>
              <p className="text-xs" style={{ color: C.textMid }}>
                {assignedSuite?.name} · {orders.length} order{orders.length !== 1 ? 's' : ''} this session
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ background: C.bg2 }}>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: C.textMid }}>
                <History className="w-12 h-12 opacity-30" />
                <p className="text-sm">No orders placed yet</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
                  style={{ background: C.accentDim, border: `1px solid ${C.accent}44` }}>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: C.accent }}>This Session</p>
                    <p className="text-2xl font-semibold" style={{ color: C.text }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="text-xs" style={{ color: C.textMid }}>
                    {orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.qty, 0), 0)} items total
                  </p>
                </div>

                {orders.map((order, idx) => (
                  <div key={order.orderNo} className="rounded-2xl overflow-hidden"
                    style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                    <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: C.border }}>
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                          style={{ background: C.accentDim, color: C.accent }}>
                          {orders.length - idx}
                        </span>
                        <div>
                          <p className="font-mono text-sm font-semibold" style={{ color: C.accent }}>{order.orderNo}</p>
                          <p className="text-xs" style={{ color: C.textMid }}>
                            {order.placedAt.toLocaleTimeString('en-HK', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs" style={kitchenStatusStyle(order.items[0]?.kitchenStatus)}>
                        <CheckCircle className="w-3 h-3" />
                        {order.items.every(i => (i.kitchenStatus ?? '').toLowerCase() === 'served')
                          ? 'Served'
                          : order.items.some(i => (i.kitchenStatus ?? '').toLowerCase() === 'preparing')
                            ? 'Preparing'
                            : 'Pending'}
                      </div>
                    </div>
                    <div className="px-5 py-3 space-y-2">
                      {order.items.map(item => (
                        <div key={item.id}>
                          <div className="flex items-center justify-between text-sm gap-2">
                            <span style={{ color: C.textMid }}>{item.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              {item.kitchenStatus && (
                                <span className="text-[10px] font-medium" style={kitchenStatusStyle(item.kitchenStatus)}>
                                  {item.kitchenStatus}
                                </span>
                              )}
                              <span style={{ color: C.textLight }}>× {item.qty}</span>
                            </div>
                          </div>
                          {item.customNote && (
                            <div className="flex items-start gap-1 mt-0.5 ml-1">
                              <MessageSquare className="w-2.5 h-2.5 mt-0.5 shrink-0" style={{ color: C.accent }} />
                              <p className="text-[10px] leading-snug" style={{ color: C.textLight }}>{item.customNote}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      {order.note && (
                        <p className="text-xs pt-1 border-t mt-2" style={{ color: C.textLight, borderColor: C.border }}>
                          Note: {order.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="px-6 pb-5 pt-3 shrink-0 border-t" style={{ borderColor: C.border, background: C.bg }}>
            <button onClick={() => goTo('menu')}
              className="w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-[0.98] shadow-lg"
              style={{ ...btnAccent, boxShadow: `0 4px 16px ${C.accent}44` }}>
              <span className="flex items-center justify-center gap-2">
                <Utensils className="w-5 h-5" /> Back to Menu
              </span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
