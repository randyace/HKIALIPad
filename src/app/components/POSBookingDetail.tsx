import { ArrowLeft, User, CreditCard, Utensils, Clock, MapPin, Phone, Mail, DollarSign, AlertCircle, Plus, Minus, Search } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';

interface OrderItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  orderTime: string;
  servedTime?: string;
}

interface FoodAllergy {
  id: number;
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  notes: string;
}

interface DietaryRequirement {
  id: number;
  requirement: string;
  notes: string;
}

interface GuestProfile {
  guestId: number;
  name: string;
  relation: 'Main Member' | 'Spouse' | 'Child' | 'Companion' | 'Guest';
  foodAllergies: FoodAllergy[];
  dietaryRequirements: DietaryRequirement[];
}

interface POSBooking {
  bookingNo: string;
  suiteId: string;
  suiteName: string;
  
  // Member Details
  memberName: string;
  accountNo: string;
  accountType: 'Individual' | 'Corporate' | 'Agency';
  membershipTier: 'Gold' | 'Platinum' | 'Diamond' | 'Sapphire';
  email: string;
  phone: string;
  companyName?: string;
  
  // Food Allergies & Dietary
  foodAllergies: FoodAllergy[];
  dietaryRequirements: DietaryRequirement[];
  guestProfiles: GuestProfile[];
  
  // Booking Info
  checkInTime: string;
  flightNo: string;
  flightTime: string;
  flightDestination: string;
  numberOfGuests: number;
  
  // Order Details
  orders: OrderItem[];
  
  // Payment Info
  paymentMode: 'Upfront' | 'On-Credit';
  paymentStatus: 'Pending' | 'Paid' | 'Billed to Account';
  totalAmount: number;
  creditBalance?: number;
}

interface POSBookingDetailProps {
  bookingNo: string;
  onBack: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  foodAllergens?: string[]; // Food allergen warnings
}

interface CartItem extends MenuItem {
  quantity: number;
}

const menuItems: MenuItem[] = [
  // Coffee
  { id: 'coffee-1', name: 'Latte', price: 50, category: 'Coffee', description: 'Classic espresso with steamed milk', foodAllergens: ['Dairy'] },
  { id: 'coffee-2', name: 'Cappuccino', price: 50, category: 'Coffee', description: 'Espresso with foamed milk', foodAllergens: ['Dairy'] },
  { id: 'coffee-3', name: 'Americano', price: 45, category: 'Coffee', description: 'Espresso with hot water' },
  { id: 'coffee-4', name: 'Espresso', price: 40, category: 'Coffee', description: 'Rich Italian coffee' },
  { id: 'coffee-5', name: 'Mocha', price: 55, category: 'Coffee', description: 'Espresso with chocolate and milk', foodAllergens: ['Dairy'] },
  
  // Tea
  { id: 'tea-1', name: 'English Breakfast', price: 45, category: 'Tea', description: 'Traditional black tea' },
  { id: 'tea-2', name: 'Green Tea', price: 45, category: 'Tea', description: 'Fresh green tea' },
  { id: 'tea-3', name: 'Jasmine Tea', price: 45, category: 'Tea', description: 'Fragrant jasmine tea' },
  { id: 'tea-4', name: 'Earl Grey', price: 45, category: 'Tea', description: 'Bergamot-flavored black tea' },
  
  // Beverages
  { id: 'bev-1', name: 'Fresh Orange Juice', price: 60, category: 'Beverages', description: 'Freshly squeezed' },
  { id: 'bev-2', name: 'Apple Juice', price: 60, category: 'Beverages', description: 'Pure apple juice' },
  { id: 'bev-3', name: 'Mineral Water', price: 30, category: 'Beverages', description: 'Still or sparkling' },
  { id: 'bev-4', name: 'Soft Drinks', price: 35, category: 'Beverages', description: 'Coca-Cola, Sprite, etc.' },
  
  // Breakfast
  { id: 'breakfast-1', name: 'Premium Breakfast Set', price: 280, category: 'Breakfast', description: 'Eggs, bacon, toast, juice', foodAllergens: ['Eggs', 'Gluten', 'Dairy'] },
  { id: 'breakfast-2', name: 'Continental Breakfast', price: 220, category: 'Breakfast', description: 'Pastries, croissant, jam, coffee', foodAllergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'breakfast-3', name: 'Congee Set', price: 180, category: 'Breakfast', description: 'Rice porridge with sides' },
  
  // Main Course
  { id: 'main-1', name: 'Dim Sum Platter', price: 380, category: 'Main Course', description: 'Assorted dim sum selection', foodAllergens: ['Shellfish', 'Gluten', 'Soy'] },
  { id: 'main-2', name: 'Beef Noodles', price: 180, category: 'Main Course', description: 'Braised beef with noodles', foodAllergens: ['Gluten', 'Soy'] },
  { id: 'main-3', name: 'Seafood Fried Rice', price: 200, category: 'Main Course', description: 'Wok-fried rice with seafood', foodAllergens: ['Shellfish', 'Fish', 'Eggs'] },
  { id: 'main-4', name: 'Grilled Chicken', price: 220, category: 'Main Course', description: 'Herb-marinated chicken' },
  
  // Appetizer
  { id: 'app-1', name: 'Caesar Salad', price: 120, category: 'Appetizer', description: 'Romaine with caesar dressing', foodAllergens: ['Dairy', 'Eggs', 'Fish'] },
  { id: 'app-2', name: 'Spring Rolls', price: 90, category: 'Appetizer', description: 'Crispy vegetable rolls', foodAllergens: ['Gluten', 'Soy'] },
  { id: 'app-3', name: 'Edamame', price: 70, category: 'Appetizer', description: 'Steamed soybeans with salt', foodAllergens: ['Soy'] },
  
  // Dessert
  { id: 'dessert-1', name: 'Dessert Trio', price: 95, category: 'Dessert', description: 'Three mini desserts', foodAllergens: ['Dairy', 'Eggs', 'Gluten', 'Nuts'] },
  { id: 'dessert-2', name: 'Mango Pudding', price: 75, category: 'Dessert', description: 'Traditional Hong Kong dessert', foodAllergens: ['Dairy'] },
  { id: 'dessert-3', name: 'Ice Cream', price: 65, category: 'Dessert', description: 'Vanilla, chocolate, or strawberry', foodAllergens: ['Dairy', 'Eggs'] },
];

const generateMockBooking = (bookingNo: string): POSBooking => {
  const orders: OrderItem[] = [
    {
      id: 'ORD-001',
      name: 'Premium Breakfast Set',
      category: 'Breakfast',
      quantity: 2,
      unitPrice: 280,
      total: 560,
      status: 'served',
      orderTime: '14:35',
      servedTime: '14:50'
    },
    {
      id: 'ORD-002',
      name: 'Dim Sum Platter',
      category: 'Main Course',
      quantity: 1,
      unitPrice: 380,
      total: 380,
      status: 'served',
      orderTime: '15:00',
      servedTime: '15:20'
    },
    {
      id: 'ORD-003',
      name: 'Fresh Fruit Juice',
      category: 'Beverages',
      quantity: 3,
      unitPrice: 60,
      total: 180,
      status: 'served',
      orderTime: '14:35',
      servedTime: '14:45'
    },
    {
      id: 'ORD-004',
      name: 'Coffee (Latte)',
      category: 'Beverages',
      quantity: 2,
      unitPrice: 50,
      total: 100,
      status: 'served',
      orderTime: '15:30',
      servedTime: '15:35'
    },
    {
      id: 'ORD-005',
      name: 'Caesar Salad',
      category: 'Appetizer',
      quantity: 1,
      unitPrice: 120,
      total: 120,
      status: 'preparing',
      orderTime: '16:00'
    },
    {
      id: 'ORD-006',
      name: 'Dessert Trio',
      category: 'Dessert',
      quantity: 2,
      unitPrice: 95,
      total: 190,
      status: 'pending',
      orderTime: '16:15'
    }
  ];

  return {
    bookingNo: bookingNo,
    suiteId: 'vip-a1',
    suiteName: 'VIP Suite A1',
    
    // Member Details
    memberName: 'John Smith',
    accountNo: 'ACC-2024-1001',
    accountType: 'Corporate',
    membershipTier: 'Platinum',
    email: 'john.smith@company.com',
    phone: '+852 9123 4567',
    companyName: 'Tech Solutions Ltd.',
    
    // Food Allergies & Dietary
    foodAllergies: [
      {
        id: 1,
        allergen: 'Shellfish',
        severity: 'Severe',
        notes: 'Avoid all shellfish products.'
      }
    ],
    dietaryRequirements: [
      {
        id: 1,
        requirement: 'Vegetarian',
        notes: 'No meat or fish.'
      }
    ],
    guestProfiles: [
      {
        guestId: 1,
        name: 'John Smith',
        relation: 'Main Member',
        foodAllergies: [
          {
            id: 1,
            allergen: 'Shellfish',
            severity: 'Severe',
            notes: 'Avoid all shellfish products.'
          }
        ],
        dietaryRequirements: [
          {
            id: 1,
            requirement: 'Vegetarian',
            notes: 'No meat or fish.'
          }
        ]
      },
      {
        guestId: 2,
        name: 'Mary Smith',
        relation: 'Spouse',
        foodAllergies: [
          {
            id: 2,
            allergen: 'Nuts',
            severity: 'Severe',
            notes: 'Severe tree nut allergy — carries EpiPen.'
          },
          {
            id: 3,
            allergen: 'Dairy',
            severity: 'Mild',
            notes: 'Mild lactose sensitivity.'
          }
        ],
        dietaryRequirements: [
          {
            id: 2,
            requirement: 'Gluten-Free',
            notes: 'Coeliac disease — strict gluten-free required.'
          }
        ]
      }
    ],
    
    // Booking Info
    checkInTime: '14:30',
    flightNo: 'CX888',
    flightTime: '17:30',
    flightDestination: 'London (LHR)',
    numberOfGuests: 2,
    
    // Order Details
    orders: orders,
    
    // Payment Info
    paymentMode: 'On-Credit',
    paymentStatus: 'Billed to Account',
    totalAmount: orders.reduce((sum, item) => sum + item.total, 0),
    creditBalance: 15000
  };
};

// ── MOCK constant + updated Props ────────────────────────────────────────────
const MOCK_BOOKING_DETAIL: POSBooking = generateMockBooking('A-202603-000001');

export interface POSBookingDetailFullProps extends POSBookingDetailProps {
  /** Pass fully-loaded booking from CI4; when null falls back to MOCK_BOOKING_DETAIL */
  booking?: POSBooking | null;
  onCheckout?: (paymentData: { method: string }) => void;
  onAddItem?: (item: CartItem) => void;
  onRemoveItem?: (itemId: string) => void;
  isLoading?: boolean;
}

export function POSBookingDetail({
  bookingNo,
  onBack,
  booking: bookingProp,
  isLoading = false,
}: POSBookingDetailFullProps) {
  const booking = bookingProp ?? generateMockBooking(bookingNo ?? 'A-202603-000001');
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([
    { id: 'coffee-1', name: 'Latte', price: 50, category: 'Coffee', description: 'Classic espresso with steamed milk', quantity: 2 },
    { id: 'breakfast-1', name: 'Premium Breakfast Set', price: 280, category: 'Breakfast', description: 'Eggs, bacon, toast, juice', quantity: 1 },
    { id: 'bev-1', name: 'Fresh Orange Juice', price: 60, category: 'Beverages', description: 'Freshly squeezed', quantity: 2 },
  ]);

  const getOrderStatusColor = (status: OrderItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'served':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Platinum':
        return 'bg-slate-100 text-slate-800 border border-slate-300';
      case 'Diamond':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'Sapphire':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Mild':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Moderate':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'Severe':
        return 'bg-red-100 text-red-700 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Group orders by category
  const ordersByCategory = booking.orders.reduce((acc, order) => {
    if (!acc[order.category]) {
      acc[order.category] = [];
    }
    acc[order.category].push(order);
    return acc;
  }, {} as Record<string, OrderItem[]>);

  const pendingOrders = booking.orders.filter(o => o.status === 'pending').length;
  const preparingOrders = booking.orders.filter(o => o.status === 'preparing').length;
  const servedOrders = booking.orders.filter(o => o.status === 'served').length;

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart functions
  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(item =>
      item.id === itemId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = () => {
    // Here you would submit the order to the backend
    console.log('Placing order:', cart);
    setCart([]);
    setIsAddOrderOpen(false);
    // Show success message
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-3">
          <Button variant="outline" onClick={onBack} className="w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Floor Plan
          </Button>
          <div>
            <h1>POS Booking Details - {booking.bookingNo}</h1>
            <p className="text-gray-600">{booking.suiteName} • {booking.memberName}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Served</p>
              <p className="text-2xl text-green-900">{servedOrders}</p>
            </div>
            <Utensils className="w-8 h-8 text-green-600 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Preparing</p>
              <p className="text-2xl text-blue-900">{preparingOrders}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Pending</p>
              <p className="text-2xl text-yellow-900">{pendingOrders}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
          </div>
        </Card>
        
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Total Amount</p>
              <p className="text-2xl text-purple-900">HK${booking.totalAmount}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Food Allergies & Dietary Requirements - Full Width */}
      {(booking.foodAllergies.length > 0 || booking.dietaryRequirements.length > 0) && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm uppercase tracking-wide text-red-600">⚠️ Food Allergies & Dietary</h3>
          </div>

          <div className="space-y-4">
            {booking.guestProfiles
              .filter(guest => guest.foodAllergies.length > 0 || guest.dietaryRequirements.length > 0)
              .map((guest) => {
                const relationColors: Record<string, string> = {
                  'Main Member': 'bg-blue-100 text-blue-800 border border-blue-300',
                  'Spouse':      'bg-pink-100 text-pink-800 border border-pink-300',
                  'Child':       'bg-green-100 text-green-800 border border-green-300',
                  'Companion':   'bg-purple-100 text-purple-800 border border-purple-300',
                  'Guest':       'bg-gray-100 text-gray-800 border border-gray-300',
                };
                return (
                  <div key={guest.guestId} className="bg-white rounded-lg border border-red-100 p-4 flex flex-row items-start gap-4">
                    {/* Guest identity - left column */}
                    <div className="flex flex-col items-start gap-1.5 min-w-[120px] pt-0.5">
                      <span className="text-sm text-gray-900 font-medium whitespace-nowrap">{guest.name}</span>
                      <Badge className={`text-xs ${relationColors[guest.relation] ?? relationColors['Guest']}`}>
                        {guest.relation}
                      </Badge>
                    </div>

                    {/* Divider */}
                    <div className="w-px self-stretch bg-red-100" />

                    {/* Food Allergies */}
                    {guest.foodAllergies.length > 0 && (
                      <div className="flex-1">
                        <label className="text-xs text-red-700 font-semibold uppercase tracking-wide">Food Allergies</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {guest.foodAllergies.map((allergy) => (
                            <div
                              key={allergy.id}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                allergy.severity === 'Severe'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : allergy.severity === 'Moderate'
                                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                              }`}
                              title={allergy.notes}
                            >
                              {allergy.severity === 'Severe' && <span>⚠️</span>}
                              {allergy.allergen}
                              <Badge className={`ml-0.5 text-[10px] py-0 px-1 ${getSeverityColor(allergy.severity)}`}>
                                {allergy.severity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        {/* Notes */}
                        <div className="mt-2 space-y-1">
                          {guest.foodAllergies.map((allergy) => allergy.notes ? (
                            <p key={allergy.id} className="text-xs text-gray-500 italic">• {allergy.allergen}: {allergy.notes}</p>
                          ) : null)}
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    {guest.foodAllergies.length > 0 && guest.dietaryRequirements.length > 0 && (
                      <div className="w-px self-stretch bg-red-100" />
                    )}

                    {/* Dietary Requirements */}
                    {guest.dietaryRequirements.length > 0 && (
                      <div className="flex-1">
                        <label className="text-xs text-green-700 font-semibold uppercase tracking-wide">Dietary Requirements</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {guest.dietaryRequirements.map((dietary) => (
                            <div
                              key={dietary.id}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300"
                              title={dietary.notes}
                            >
                              {dietary.requirement}
                            </div>
                          ))}
                        </div>
                        {/* Notes */}
                        <div className="mt-2 space-y-1">
                          {guest.dietaryRequirements.map((dietary) => dietary.notes ? (
                            <p key={dietary.id} className="text-xs text-gray-500 italic">• {dietary.requirement}: {dietary.notes}</p>
                          ) : null)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Member Details */}
        <div className="space-y-6">
          {/* Member Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm uppercase tracking-wide text-gray-500">Member Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Member Name</label>
                <p className="text-lg">{booking.memberName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Account Number</label>
                <p className="text-lg">{booking.accountNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Account Type</label>
                <p className="text-lg">{booking.accountType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Membership Tier</label>
                <div className="mt-1">
                  <Badge className={getMembershipColor(booking.membershipTier)}>
                    {booking.membershipTier}
                  </Badge>
                </div>
              </div>
              {booking.companyName && (
                <div>
                  <label className="text-sm text-gray-600">Company</label>
                  <p className="text-lg">{booking.companyName}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{booking.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{booking.phone}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm uppercase tracking-wide text-gray-500">Booking Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Suite</label>
                <p>{booking.suiteName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Check-in Time</label>
                <p>{booking.checkInTime}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Number of Guests</label>
                <p>{booking.numberOfGuests} pax</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Flight Number</label>
                <p>{booking.flightNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Flight Time</label>
                <p>{booking.flightTime}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Destination</label>
                <p>{booking.flightDestination}</p>
              </div>
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm uppercase tracking-wide text-gray-500">Payment Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Payment Mode</label>
                <p>{booking.paymentMode}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Payment Status</label>
                <div className="mt-1">
                  <Badge className="bg-green-100 text-green-800 border border-green-200">
                    {booking.paymentStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Total Amount</label>
                <p className="text-xl text-green-600">HK${booking.totalAmount.toLocaleString()}</p>
              </div>
              {booking.creditBalance !== undefined && (
                <div>
                  <label className="text-sm text-gray-600">Credit Balance</label>
                  <p className="text-lg">HK${booking.creditBalance.toLocaleString()}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Order Details (2 columns wide) */}
        <div className="col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-gray-500" />
                <h3 className="text-sm uppercase tracking-wide text-gray-500">Order Details</h3>
              </div>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddOrderOpen(true)}>
                <Utensils className="w-4 h-4 mr-2" />
                Add New Order
              </Button>
            </div>

            {/* Orders Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {booking.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.name}</p>
                          <p className="text-xs text-gray-500">{order.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {order.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">{order.quantity}</td>
                      <td className="px-4 py-3">
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>{order.orderTime}</span>
                          </div>
                          {order.servedTime && (
                            <div className="text-xs text-green-600 mt-1">
                              Served: {order.servedTime}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr>
                    <td colSpan={5} className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Orders by Category Summary */}
          <Card className="p-6">
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Orders by Category</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(ordersByCategory).map(([category, items]) => {
                const categoryTotal = items.reduce((sum, item) => sum + item.total, 0);
                const categoryQty = items.reduce((sum, item) => sum + item.quantity, 0);
                
                return (
                  <Card key={category} className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm text-gray-600">{category}</h4>
                      <Badge variant="outline" className="text-xs">{categoryQty} items</Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          {/* Action Buttons */}
          <Card className="p-6">
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Utensils className="w-4 h-4 mr-2" />
                Update Order Status
              </Button>
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Process Payment
              </Button>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send Receipt
              </Button>
              <Button variant="outline">
                Print Bill
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Add New Order Dialog */}
      <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
        <DialogContent className="min-w-[1200px] max-w-[80vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Order - {booking.suiteName}</DialogTitle>
            <DialogDescription>
              Select items from the menu to add to {booking.memberName}'s order
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex gap-6">
            {/* Left Side - Current Order (Cart) - 30% width */}
            <div className="w-[30%] flex flex-col border-r pr-6">
              <h3 className="text-lg font-semibold mb-4">Current Order</h3>
              
              {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No items in cart</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                    {cart.map((item) => (
                      <Card key={item.id} className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handlePlaceOrder}
                      disabled={cart.length === 0}
                    >
                      <Utensils className="w-4 h-4 mr-2" />
                      Submit Order ({cart.length} items)
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Right Side - Menu Items */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-md text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Menu Items Grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {filteredItems.map((item) => {
                    // Check if item contains any allergens that match customer's allergies
                    const hasMatchingAllergen = item.foodAllergens?.some(allergen =>
                      booking.foodAllergies.some(allergy =>
                        allergy.allergen.toLowerCase() === allergen.toLowerCase()
                      )
                    );
                    
                    return (
                      <Card
                        key={item.id}
                        className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                          hasMatchingAllergen ? 'border-2 border-red-400 bg-red-50' : ''
                        }`}
                        onClick={() => addToCart(item)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        )}
                        
                        {/* Food Allergens Warning */}
                        {item.foodAllergens && item.foodAllergens.length > 0 && (
                          <div className={`mt-2 p-2 rounded ${hasMatchingAllergen ? 'bg-red-100 border border-red-300' : 'bg-orange-50 border border-orange-200'}`}>
                            <div className="flex items-center gap-1 mb-1">
                              <AlertCircle className={`w-3 h-3 ${hasMatchingAllergen ? 'text-red-600' : 'text-orange-600'}`} />
                              <p className={`text-xs font-semibold ${hasMatchingAllergen ? 'text-red-700' : 'text-orange-700'}`}>
                                {hasMatchingAllergen ? '⚠️ ALLERGEN WARNING' : 'Contains:'}
                              </p>
                            </div>
                            <p className={`text-xs ${hasMatchingAllergen ? 'text-red-600 font-medium' : 'text-orange-600'}`}>
                              {item.foodAllergens.join(', ')}
                            </p>
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          className={`w-full mt-3 ${hasMatchingAllergen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {hasMatchingAllergen ? 'Add with Caution' : 'Add to Cart'}
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}