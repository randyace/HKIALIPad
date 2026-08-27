import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import {
  ArrowLeft, Search, Plus, Minus, X, ShoppingCart,
  Clock, Users, Plane, Building2, CheckCheck, CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { savePreOrder, PreOrderItem } from './preOrderStore';

// ── Service catalogue (same as POS) ──────────────────────────────────────────
interface CatalogueItem {
  id: string;
  name: string;
  category: string;
  description: string;
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
];

const CATEGORIES = [...new Set(SERVICE_CATALOGUE.map(i => i.category))];
const CATEGORY_COLORS: Record<string, string> = {
  'Coffee': 'bg-amber-100 text-amber-800',
  'Tea': 'bg-green-100 text-green-800',
  'Beverages': 'bg-blue-100 text-blue-800',
  'Alcoholic Beverages': 'bg-purple-100 text-purple-800',
  'Breakfast': 'bg-orange-100 text-orange-800',
  'Appetiser': 'bg-teal-100 text-teal-800',
  'Main Course': 'bg-red-100 text-red-800',
  'Dessert': 'bg-pink-100 text-pink-800',
  'Snacks': 'bg-yellow-100 text-yellow-800',
};

export interface PreOrderBooking {
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
  status: string;
  accountType: string;
  paymentMode: string;
  amount: string;
}

// ── MOCK constants (isolated — SERVICE_CATALOGUE already module-scoped above) ─
const MOCK_MENU_ITEMS = SERVICE_CATALOGUE;
const MOCK_BOOKING: PreOrderBooking = {
  id: 1,
  bookingNo: 'A-202603-000001',
  guestName: 'John Smith',
  accountNo: 'ACC-2024-0001',
  venue: 'VIP Suite A',
  date: '2026-03-16',
  startTime: '14:00',
  endTime: '17:00',
  flightNo: 'CX888',
  flightTime: '18:30',
  numberOfGuests: 2,
  status: 'Confirmed',
  accountType: 'Individual',
  paymentMode: 'Upfront',
  amount: 'HK$7,600',
};

export interface PreOrderPageProps {
  /** Pass fully-loaded booking from CI4; falls back to MOCK_BOOKING when null */
  booking?: PreOrderBooking | null;
  /** Pass menu items from CI4; falls back to MOCK_MENU_ITEMS when empty */
  items?: CatalogueItem[];
  onAddToCart?: (item: PreOrderItem) => void;
  onCheckout?: () => void;
  cartItems?: PreOrderItem[];
  onBack: () => void;
  onSaved: () => void;
  isLoading?: boolean;
}

export function PreOrderPage({
  booking: bookingProp,
  items: _itemsProp,
  onBack,
  onSaved,
  isLoading = false,
}: PreOrderPageProps) {
  const booking = bookingProp ?? MOCK_BOOKING;
  const [items, setItems]               = useState<PreOrderItem[]>([]);
  const [search, setSearch]             = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saved, setSaved]               = useState(false);
  const searchRef                       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter catalogue
  const filteredBySearch = search.trim().length > 0
    ? SERVICE_CATALOGUE.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 10)
    : [];

  const filteredByCategory = activeCategory
    ? SERVICE_CATALOGUE.filter(c => c.category === activeCategory)
    : [];

  const addItem = (cat: CatalogueItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === cat.id);
      if (existing) {
        return prev.map(i => i.id === cat.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: cat.id, name: cat.name, category: cat.category, qty: 1 }];
    });
    setSaved(false);
  };

  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
    setSaved(false);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSaved(false);
  };

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

  const handleSave = () => {
    if (items.length === 0) {
      toast.error('Please add at least one item to the pre-order.');
      return;
    }
    savePreOrder({
      bookingNo: booking.bookingNo,
      guestName: booking.guestName,
      venue: booking.venue,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      numberOfGuests: booking.numberOfGuests,
      items,
      savedAt: new Date().toISOString(),
    });
    setSaved(true);
    toast.success(`Pre-order saved for ${booking.bookingNo} — ${totalItems} item(s) ready for kitchen.`);
    setTimeout(() => onSaved(), 900);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <div className="bg-[#0f2942] px-6 py-4 flex items-center gap-4 shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/10 text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-white text-base">
            Pre-Order — {booking.bookingNo}
          </h2>
          <p className="text-blue-200 text-xs mt-0.5">
            {booking.guestName} · {booking.venue} · {booking.startTime}–{booking.endTime}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalItems > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-white" />
              <span className="text-white text-sm">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
            </div>
          )}
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
            onClick={handleSave}
            disabled={items.length === 0 || saved}
          >
            {saved ? <CheckCheck className="w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
            {saved ? 'Pre-Order Saved!' : 'Save Pre-Order'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Booking Info + Order List ────────────────────────────── */}
        <div className="w-80 flex flex-col border-r bg-white shrink-0 overflow-y-auto">
          {/* Booking Summary */}
          <div className="p-4 border-b bg-blue-50">
            <h3 className="text-xs text-blue-600 mb-3 uppercase tracking-wide">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{booking.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{booking.startTime} – {booking.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{booking.numberOfGuests} guest{booking.numberOfGuests !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Plane className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{booking.flightNo} at {booking.flightTime}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{booking.date}</span>
              </div>
            </div>
          </div>

          {/* Order List */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs text-gray-500 uppercase tracking-wide">Pre-Order Items</h3>
              {items.length > 0 && (
                <Badge className="bg-blue-600 text-white text-xs">{totalItems}</Badge>
              )}
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <ShoppingCart className="w-10 h-10 mb-2" />
                <p className="text-sm text-gray-400 text-center">
                  Search or browse categories<br />to add items
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-1 w-6 h-6 rounded text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t bg-white">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={handleSave}
                disabled={saved}
              >
                {saved ? <CheckCheck className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                {saved ? 'Saved!' : `Save Pre-Order (${totalItems} item${totalItems !== 1 ? 's' : ''})`}
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Items will be loaded automatically when a suite is assigned in POS
              </p>
            </div>
          )}
        </div>

        {/* ── Right: Catalogue ───────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search + Category Tabs */}
          <div className="bg-white border-b px-5 pt-4 pb-0 shrink-0">
            {/* Search */}
            <div className="mb-3" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search items (e.g. Latte, Salmon, Massage…)"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowDropdown(true); setActiveCategory(null); }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); setShowDropdown(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Dropdown */}
              {showDropdown && filteredBySearch.length > 0 && (
                <div className="mt-1 border border-gray-200 rounded-lg shadow-lg bg-white max-h-64 overflow-y-auto z-10 relative">
                  {filteredBySearch.map(item => (
                    <button
                      key={item.id}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => { addItem(item); setSearch(''); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                    >
                      <Plus className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category} · {item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && search.trim().length > 0 && filteredBySearch.length === 0 && (
                <div className="mt-1 border border-gray-200 rounded-lg bg-white px-4 py-3 text-sm text-gray-500">
                  No items found for "<span className="font-medium">{search}</span>"
                </div>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  activeCategory === null
                    ? 'bg-[#0f2942] text-white border-[#0f2942]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setSearch(''); setShowDropdown(false); }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#0f2942] text-white border-[#0f2942]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {(activeCategory ? filteredByCategory : SERVICE_CATALOGUE).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No items in this category.</p>
            ) : (
              <>
                {/* Group by category when showing all */}
                {activeCategory ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredByCategory.map(cat => {
                      const inOrder = items.find(i => i.id === cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => addItem(cat)}
                          className={`text-left p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                            inOrder
                              ? 'border-blue-400 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat.category] ?? 'bg-gray-100 text-gray-700'}`}>
                              {cat.category}
                            </span>
                            {inOrder && (
                              <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                                ×{inOrder.qty}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 leading-tight">{cat.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{cat.description}</p>
                          <div className="mt-2 flex items-center gap-1 text-blue-600">
                            <Plus className="w-3 h-3" />
                            <span className="text-xs">Add</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {CATEGORIES.map(cat => {
                      const catItems = SERVICE_CATALOGUE.filter(c => c.category === cat);
                      return (
                        <div key={cat}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full ${CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-700'}`}>
                              {cat}
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {catItems.map(item => {
                              const inOrder = items.find(i => i.id === item.id);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => addItem(item)}
                                  className={`text-left p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                                    inOrder
                                      ? 'border-blue-400 bg-blue-50'
                                      : 'border-gray-200 bg-white hover:border-blue-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-900 leading-tight">{item.name}</span>
                                    {inOrder && (
                                      <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                                        ×{inOrder.qty}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                                  <div className="mt-2 flex items-center gap-1 text-blue-600">
                                    <Plus className="w-3 h-3" />
                                    <span className="text-xs">Add</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
