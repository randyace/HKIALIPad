import { useState, useEffect, ReactNode } from 'react';
import { ArrowLeft, AlertCircle, Car, ShoppingBag, CreditCard, Mail, FileText, CheckCircle, XCircle, RotateCcw, Edit2, Trash2, Download, DollarSign, Plane, Clock, ShieldCheck, Accessibility, Plus, Minus, MapPin, User, Tag, Phone, MessageSquare, BadgePercent, X, Building2, Search, History, Users, ExternalLink, Utensils, Eye, GitMerge, CheckCheck, AlertTriangle, UserCheck, Ticket, RefreshCw, CalendarClock, Gem, Trophy, Star, Heart, Briefcase } from 'lucide-react';
import { BookingInvoiceDialog } from './booking/BookingInvoiceDialog';
import { BookingEditDialog } from './booking/BookingEditDialog';
import { BookingMovementLog } from './booking/BookingMovementLog';
import { BookingGuestsSearcher } from './booking/BookingGuestsSearcher';
import { BookingCustomerProfile, type CustomerProfile } from './booking/BookingCustomerProfile';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import type {
  Booking, HistoricalGuest, PassengerTitle, AgeGroup,
  PassengerDetail, NonFlyingGuest,
} from './booking/BookingDetailMocks';
import {
  HISTORICAL_GUESTS, DETAIL_AGENCY_DATA, EXPLICIT_BOOKING_OVERRIDES,
  MERGE_FIXED_FIELDS, emptyPassenger, MONTHS,
  isPassengerFilled, buildInitialPassengers,
  emptyNonFlyingGuest, buildInitialNonFlyingGuests,
  generateMockBooking,
} from './booking/BookingDetailMocks';

interface BookingDetailProps {
  bookingId: number;
  onBack: () => void;
}

// ── Passenger detail types ────────────────────────��─────────────────────────
// ── MOCK constant (isolated) — container passes real booking via prop ─────────
const MOCK_BOOKING_ID = 1;

export interface BookingDetailFullProps extends BookingDetailProps {
  /** Pass fully-loaded Booking from CI4; when null component uses mock data internally */
  booking?: Booking | null;
  onEdit?: () => void;
  onApprove?: (id: number) => void;
  isLoading?: boolean;
  /**
   * Called by the edit dialog with the new assignments. The parent
   * should PATCH the booking and return once the API call resolves.
   * The dialog stays open while the promise is pending and shows an
   * error toast on rejection (without closing).
   */
  onSaveEdit?: (payload: import('./booking/BookingEditDialog').BookingEditPayload) => Promise<void>;
  isSavingEdit?: boolean;
}

export function BookingDetail({ bookingId = MOCK_BOOKING_ID, booking: bookingProp, onBack, onApprove, isLoading = false, onSaveEdit, isSavingEdit = false }: BookingDetailFullProps) {
  const [showInvoice, setShowInvoice] = useState(false);

  // ── Movement Log ─────────────────────────────────────────────────────────
  const [isMovementLogOpen, setIsMovementLogOpen] = useState(false);
  // ── Stubs for dead-code blocks that reference now-extracted state ────────
  // (These are inert; they silence TypeScript errors in {false && ...} blocks
  //  that were not yet pruned from the file after sub-component extraction.)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bookingMovements, setBookingMovements] = useState<never[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);
  // Edit-dialog stubs (block moved to BookingEditDialog.tsx)
  interface _EditLimoStop { id: number; type: 'Pick-up' | 'Destination'; location: string; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editFlightType,        setEditFlightType]        = useState<'Arrival'|'Departure'|'Transition'>('Departure');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editFlightNo,          setEditFlightNo]          = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editFlightTime,        setEditFlightTime]        = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editFlightClass,       setEditFlightClass]       = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editFlightDest,        setEditFlightDest]        = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editFlightOrigin,      setEditFlightOrigin]      = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editNumLuggage,        setEditNumLuggage]        = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editSuite,             setEditSuite]             = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editVisitDate,         setEditVisitDate]         = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editVisitTime,         setEditVisitTime]         = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editNumGuests,         setEditNumGuests]         = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editNonFlying,         setEditNonFlying]         = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editSelectedServices,  setEditSelectedServices]  = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editAddonSearch,       setEditAddonSearch]       = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showEditAddonDropdown, setShowEditAddonDropdown] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editLimoStops,         setEditLimoStops]         = useState<_EditLimoStop[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addEditLimoStop    = () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeEditLimoStop = (_id: number) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateEditLimoStop = (_id: number, _field: keyof _EditLimoStop, _val: string) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editSpecialReqs,       setEditSpecialReqs]       = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditToggleService = (_key: string) => {};
  // ─────────────────────────────────────────────────────────────────────────

  // ── Customer Searcher ────────────────────────────────────────────────────
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [customerSearchQuery,  setCustomerSearchQuery]  = useState('');
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const mockCustomerDirectory: CustomerProfile[] = [
    { id: 1,  accountNo: 'ACC-2024-1001', name: 'John Smith',      type: 'Individual',    email: 'john.smith@email.com',       phone: '+852 9111 0001', membershipType: 'Gold',     membershipExpiry: '2026-12-31', status: 'Active',    totalBookings: 24, createdDate: '2024-01-15' },
    { id: 2,  accountNo: 'ACC-2024-1002', name: 'Mary Johnson',    type: 'Individual',    email: 'mary.johnson@email.com',     phone: '+852 9111 0002', membershipType: 'Platinum', membershipExpiry: '2027-03-31', status: 'Active',    totalBookings: 18, createdDate: '2024-02-10' },
    { id: 3,  accountNo: 'ACC-2024-1003', name: 'David Lee',       type: 'Individual',    email: 'david.lee@email.com',        phone: '+852 9111 0003', membershipType: 'Sapphire', membershipExpiry: '2025-09-30', status: 'Active',    totalBookings: 7,  createdDate: '2024-03-05' },
    { id: 4,  accountNo: 'ACC-2024-1004', name: 'HSBC Group',      type: 'Corporate',     email: 'admin@hsbc-vip.com',         phone: '+852 9111 0004', status: 'Active',    totalBookings: 112, createdDate: '2023-07-01', company: 'HSBC' },
    { id: 5,  accountNo: 'ACC-2024-1005', name: 'EGL Tours Ltd',   type: 'Agency', email: 'ops@egltours.com',           phone: '+852 9111 0005', status: 'Active',    totalBookings: 67,  createdDate: '2023-09-15', company: 'EGL Tours' },
    { id: 6,  accountNo: 'ACC-2024-1006', name: 'Sarah Chen',      type: 'Individual',    email: 'sarah.chen@email.com',       phone: '+852 9111 0006', membershipType: 'Diamond',  membershipExpiry: '2027-06-30', status: 'Active',    totalBookings: 41, createdDate: '2023-11-20' },
    { id: 7,  accountNo: 'ACC-2024-1007', name: 'Robert Wang',     type: 'Individual',    email: 'robert.wang@email.com',      phone: '+852 9111 0007', membershipType: 'Gold',     membershipExpiry: '2026-08-31', status: 'Inactive',  totalBookings: 9,  createdDate: '2024-01-28' },
    { id: 8,  accountNo: 'ACC-2024-1008', name: 'Wing On Travel',  type: 'Agency', email: 'booking@wingontravel.com',   phone: '+852 9111 0008', status: 'Active',    totalBookings: 53,  createdDate: '2023-06-10', company: 'Wing On Travel' },
    { id: 9,  accountNo: 'ACC-2024-1009', name: 'Cathay Pacific',  type: 'Corporate',     email: 'vip@cathaypacific.com',      phone: '+852 9111 0009', status: 'Active',    totalBookings: 204, createdDate: '2022-12-01', company: 'Cathay Pacific' },
    { id: 10, accountNo: 'ACC-2024-1010', name: 'Emma Wilson',     type: 'Individual',    email: 'emma.wilson@email.com',      phone: '+852 9111 0010', membershipType: 'Sapphire', membershipExpiry: '2026-06-30', status: 'Active',    totalBookings: 5,  createdDate: '2024-04-18' },
  ];

  const booking = bookingProp || generateMockBooking(bookingId);

  // Editable guest fields — Premiere Suite
  const [numPremiereSuites, setNumPremiereSuites] = useState(booking.numberOfPremiereSuites ?? 0);
  const [vipPS, setVipPS] = useState(booking.vipPassengersInPremiereSuite ?? 0);
  const [nonFlyingPS, setNonFlyingPS] = useState(booking.nonFlyingGuestsInPremiereSuite ?? 0);

  // Editable guest fields — Lounge Deluxe
  const [vipLD, setVipLD] = useState(booking.vipPassengersInLoungeDeluxe ?? 0);

  // VIP Passenger detail forms — one entry per VIP passenger (PS + LD)
  const [passengers, setPassengers] = useState<PassengerDetail[]>(() =>
    booking.passengers && booking.passengers.length > 0
      ? booking.passengers.map(p => ({
          title: (p.title || '') as PassengerTitle,
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          travelDocNo: p.travelDocNo || '',
          membershipNo: p.membershipNo || '',
          ageGroup: (p.ageGroup || '') as AgeGroup,
          birthdayDay: p.birthdayDay || '',
          birthdayMonth: p.birthdayMonth || '',
          birthdayYear: p.birthdayYear || '',
          foodAllergies: p.foodAllergies || '',
        }))
      : buildInitialPassengers(
          (booking.vipPassengersInPremiereSuite ?? 0) + (booking.vipPassengersInLoungeDeluxe ?? 0),
          bookingId
        )
  );

  // Sync passenger list length whenever the total VIP count changes
  useEffect(() => {
    const total = vipPS + vipLD;
    setPassengers(prev => {
      if (prev.length === total) return prev;
      if (prev.length < total)
        return [...prev, ...Array.from({ length: total - prev.length }, emptyPassenger)];
      return prev.slice(0, total);
    });
  }, [vipPS, vipLD]);

  const updatePassenger = (idx: number, field: keyof PassengerDetail, value: string) => {
    setPassengers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  // ── Add New Item (add-on services) ─────────────────────────────────────────
  type AddonService = string;
  const addonServices: { key: AddonService; icon: ReactNode; desc: string; defaultPrice: string }[] = [
    { key: 'Lounge Extension',              icon: <Clock className="w-5 h-5" />,         desc: 'Extend lounge access time',              defaultPrice: '500.00'  },
    { key: 'Limousine Service',             icon: <Car className="w-5 h-5" />,           desc: 'Private car transfer service',           defaultPrice: '800.00'  },
    { key: 'Wheelchair Assistance',         icon: <Accessibility className="w-5 h-5" />, desc: 'Mobility & accessibility support',       defaultPrice: '0.00'    },
    { key: 'Security Escort Service',       icon: <ShieldCheck className="w-5 h-5" />,   desc: 'Dedicated security escort',              defaultPrice: '1200.00' },
    { key: 'Meet & Greet Service',          icon: <User className="w-5 h-5" />,          desc: 'Dedicated greeter at arrival gate',      defaultPrice: '600.00'  },
    { key: 'Fast Track Immigration',        icon: <Plane className="w-5 h-5" />,         desc: 'Priority immigration clearance',         defaultPrice: '400.00'  },
    { key: 'Buggy Transfer Service',        icon: <Car className="w-5 h-5" />,           desc: 'Electric buggy within terminal',         defaultPrice: '0.00'    },
    { key: 'Baggage Handling',              icon: <ShoppingBag className="w-5 h-5" />,   desc: 'Assisted luggage service',               defaultPrice: '150.00'  },
    { key: 'Porter Service',                icon: <ShoppingBag className="w-5 h-5" />,   desc: 'On-demand porter assistance',            defaultPrice: '100.00'  },
    { key: 'Shower Service',                icon: <Building2 className="w-5 h-5" />,     desc: 'Private shower with amenities',          defaultPrice: '200.00'  },
    { key: 'Day Room (4 hrs)',              icon: <Building2 className="w-5 h-5" />,     desc: 'Private suite day-use booking',          defaultPrice: '1800.00' },
    { key: 'Day Room Extension (per hr)',   icon: <Clock className="w-5 h-5" />,         desc: 'Hourly extension of day room',           defaultPrice: '450.00'  },
    { key: 'VIP Escort (Airside)',          icon: <ShieldCheck className="w-5 h-5" />,   desc: 'Escorted airside access with staff',     defaultPrice: '1500.00' },
    { key: 'Printing Service',              icon: <FileText className="w-5 h-5" />,      desc: 'Document printing (per page)',           defaultPrice: '20.00'   },
    { key: 'Flight Rebooking Assistance',   icon: <Plane className="w-5 h-5" />,         desc: 'Staff-assisted flight rebooking',        defaultPrice: '0.00'    },
    { key: 'Lounge Access – Extra Adult',   icon: <User className="w-5 h-5" />,          desc: 'Additional adult lounge entry',          defaultPrice: '350.00'  },
    { key: 'Lounge Access – Extra Child',   icon: <User className="w-5 h-5" />,          desc: 'Additional child entry (2–11 yrs)',      defaultPrice: '180.00'  },
    { key: 'SIM Card Arrangement',          icon: <Phone className="w-5 h-5" />,         desc: 'Local SIM card for guest',               defaultPrice: '80.00'   },
    { key: 'Currency Exchange Assistance',  icon: <DollarSign className="w-5 h-5" />,    desc: 'Guided to best exchange counter',        defaultPrice: '0.00'    },
    { key: 'Special Meal Request',          icon: <Tag className="w-5 h-5" />,           desc: 'Dietary or custom meal arrangement',     defaultPrice: '0.00'    },
    { key: 'Flower / Gift Arrangement',     icon: <Tag className="w-5 h-5" />,           desc: 'In-lounge gift or floral setup',         defaultPrice: '500.00'  },
    { key: 'Birthday / Celebration Setup',  icon: <Tag className="w-5 h-5" />,           desc: 'Cake, décor & personalised message',     defaultPrice: '800.00'  },
    { key: 'Video Conference Room',         icon: <MessageSquare className="w-5 h-5" />, desc: 'Private VC-equipped meeting room',       defaultPrice: '1200.00' },
    { key: 'Private Dining Room',           icon: <Building2 className="w-5 h-5" />,     desc: 'Exclusive dining space (up to 8 pax)',   defaultPrice: '2500.00' },
    { key: 'Smoking Room Access',           icon: <Building2 className="w-5 h-5" />,     desc: 'Designated smoking area access',         defaultPrice: '0.00'    },
  ];
  const [selectedAddon, setSelectedAddon] = useState<AddonService | null>(null);
  const [addonQty, setAddonQty]           = useState(1);
  const [addonUnitPrice, setAddonUnitPrice] = useState('');
  const [addonDiscount, setAddonDiscount]   = useState('0');
  const [addonRemarks, setAddonRemarks]     = useState('');
  const [addonSearch, setAddonSearch]       = useState('');
  const [showAddonDropdown, setShowAddonDropdown] = useState(false);

  // Limousine — multiple stops
  interface LimoStop { id: number; type: 'Pick-up' | 'Destination'; location: string; }
  const [limoStops, setLimoStops] = useState<LimoStop[]>([{ id: 1, type: 'Pick-up', location: '' }]);
  const addLimoStop    = () => setLimoStops(prev => [...prev, { id: Date.now(), type: 'Destination', location: '' }]);
  const removeLimoStop = (id: number) => setLimoStops(prev => prev.length > 1 ? prev.filter(s => s.id !== id) : prev);
  const updateLimoStop = (id: number, field: keyof LimoStop, value: string) =>
    setLimoStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  // Wheelchair — passenger name
  const [wheelchairPassenger, setWheelchairPassenger] = useState('');

  const handleSelectAddon = (key: AddonService, defaultPrice: string) => {
    setSelectedAddon(key);
    setAddonUnitPrice(defaultPrice);
    setAddonQty(1);
    setAddonDiscount('0');
    setLimoStops([{ id: 1, type: 'Pick-up', location: '' }]);
    setWheelchairPassenger('');
    setAddonSearch('');
    setShowAddonDropdown(false);
  };

  const handleAddItem = () => {
    if (!selectedAddon) { toast.error('Please select an add-on service first.'); return; }
    if (selectedAddon === 'Limousine Service' && limoStops.every(s => !s.location.trim())) {
      toast.error('Please enter at least one destination or pick-up point.');
      return;
    }
    if (selectedAddon === 'Wheelchair Assistance' && !wheelchairPassenger.trim()) {
      toast.error('Please enter the passenger name.');
      return;
    }
    toast.success(`"${selectedAddon}" added to booking!`);
    setSelectedAddon(null);
    setAddonQty(1);
    setAddonUnitPrice('');
    setAddonDiscount('0');
    setAddonRemarks('');
    setAddonSearch('');
    setShowAddonDropdown(false);
    setLimoStops([{ id: 1, type: 'Pick-up', location: '' }]);
    setWheelchairPassenger('');
  };

  // ── Edit Booking Dialog ──────────────────────────────────────────────────
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);

  // ── Contact Person (from booking data) ──────────────────────────────────
  const [contactName,  setContactName]  = useState(booking.contactPerson?.name ?? '');
  const [contactEmail, setContactEmail] = useState(booking.contactPerson?.email ?? '');
  const [contactNo,    setContactNo]    = useState(booking.contactPerson?.phone ?? '');
  const [bookingMemo,  setBookingMemo]  = useState(booking.contactPerson?.memo ?? '');

  // ── Promotion / Redemption Code ──────────────────────────────────────────
  const MOCK_PROMOS: Record<string, { label: string; benefit: string; type: 'percent' | 'fixed' }> = {
    'SUMMER2024': { label: 'Summer 2024 Promotion',     benefit: '10%',      type: 'percent' },
    'VIP20':      { label: 'VIP Member Discount',        benefit: '20%',      type: 'percent' },
    'WELCOME':    { label: 'Welcome Offer',              benefit: 'HK$100',   type: 'fixed'   },
    'TRAVEL10':   { label: 'Travel Agency Partner Rate', benefit: '10%',      type: 'percent' },
    'REDEEM50':   { label: 'Redemption Voucher',         benefit: 'HK$50',    type: 'fixed'   },
    'DIAMOND15':  { label: 'Diamond Member Exclusive',   benefit: '15%',      type: 'percent' },
  };
  const [promoInput,   setPromoInput]   = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; label: string; benefit: string; type: 'percent' | 'fixed' } | null>(null);
  const [promoError,   setPromoError]   = useState('');

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) { setPromoError('Please enter a promo or redemption code.'); return; }
    const found = MOCK_PROMOS[code];
    if (found) {
      setPromoApplied({ code, ...found });
      setPromoError('');
      setPromoInput('');
      toast.success(`Code "${code}" applied — ${found.benefit} off!`);
    } else {
      setPromoError('Invalid or expired code. Please check and try again.');
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setPromoError('');
    toast.info('Promotion code removed.');
  };

  // ── Suite & Time Assignment (Confirmed + Paid) ────────────────────────────
  const SUITE_OPTIONS = [
    'VIP Suite A', 'VIP Suite B', 'Executive Suite 1', 'Executive Suite 2',
    'Business Suite 1', 'Business Suite 2', 'Business Suite 3', 'Business Suite 4',
    'Premier Lounge Table 1', 'Premier Lounge Table 2', 'Premier Lounge Table 3',
    'Open Lounge Area',
  ];
  const [assignedSuite,     setAssignedSuite]     = useState(booking.suite);
  const [assignedDate,      setAssignedDate]      = useState(booking.dateTime.split(' ')[0]);
  const [assignedStartTime, setAssignedStartTime] = useState('11:00');
  const [assignedEndTime,   setAssignedEndTime]   = useState('14:00');
  const isConfirmedAndPaid = booking.status === 'Confirmed' && booking.paymentStatus === 'Paid';

  // ── In-Charge Staff ───────────────────────────────────────────────────────
  const ALL_STAFF = [
    { id: 1, name: 'Emily Chen',   role: 'Senior Lounge Manager'    },
    { id: 2, name: 'Tom Ng',       role: 'VIP Concierge'            },
    { id: 3, name: 'David Wong',   role: 'Lounge Supervisor'        },
    { id: 4, name: 'Peter Chan',   role: 'Lounge Attendant'         },
    { id: 5, name: 'Henry Yip',    role: 'F&B Coordinator'          },
    { id: 6, name: 'Grace Liu',    role: 'Guest Relations Officer'  },
    { id: 7, name: 'Michael Tam',  role: 'Operations Lead'          },
    { id: 8, name: 'Rachel Wong',  role: 'VIP Escort'               },
  ];
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const toggleStaff = (id: number) =>
    setSelectedStaffIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  // ── Refund Dialog ─────────────────────────────────────────────────────────
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount,     setRefundAmount]     = useState('');
  const [refundReason,     setRefundReason]     = useState('');
  const handleProcessRefund = () => {
    const amt = parseFloat(refundAmount.replace(/[^0-9.]/g, ''));
    if (!amt || amt <= 0) { toast.error('Please enter a valid refund amount.'); return; }
    if (amt > amountDueAfterVouchers) {
      toast.error(`Refund amount cannot exceed the maximum refundable amount of HK$${amountDueAfterVouchers.toLocaleString()}.`);
      return;
    }
    toast.success('Refund case submitted!', {
      description: `HK$${amt.toLocaleString()} refund for ${booking.bookingNo} has been passed to Refund Reports.`,
    });
    setShowRefundDialog(false);
    setRefundAmount('');
    setRefundReason('');
  };

  // ── Voucher System ────────────────────────────────────────────────────────
  // Customer's total entry vouchers available in their account (mock)
  const customerTotalVouchers = bookingId % 5 === 0 ? 4 : bookingId % 3 === 0 ? 3 : bookingId % 2 === 0 ? 2 : 1;
  const headCountRate = 1200; // HK$ per person — the main entry charge
  // Food & Beverage is always complimentary (free). Only non-food add-ons cost extra.
  const serviceSubtotal = (booking.hasLimousine ? 800 : 0) + (booking.hasShopping ? 500 : 0);
  // voucherUnitValue: 1 voucher = 1 free entry (covers the headCountRate for that person)
  const voucherUnitValue = headCountRate;

  // ── Delete-passenger dialog ───────────────────────────────────────────────
  interface DeletePassengerDialog {
    section: 'PS' | 'LD';
    newValue: number;
    removeCount: number;
    candidates: { globalIdx: number; label: string; subtitle: string }[];
    selected: Set<number>;
  }
  const [deleteDialog, setDeleteDialog] = useState<DeletePassengerDialog | null>(null);

  const openDeleteDialog = (section: 'PS' | 'LD', newValue: number) => {
    const currentCount = section === 'PS' ? vipPS : vipLD;
    const removeCount = currentCount - newValue;
    const slice = section === 'PS'
      ? passengers.slice(0, vipPS)
      : passengers.slice(vipPS, vipPS + vipLD);
    const offset = section === 'PS' ? 0 : vipPS;
    const candidates = slice.map((p, i) => ({
      globalIdx: offset + i,
      label: [p.title, p.firstName, p.lastName].filter(Boolean).join(' ') || `Passenger ${offset + i + 1}`,
      subtitle: [
        p.ageGroup || '',
        p.travelDocNo ? `Doc: ${p.travelDocNo}` : '',
        p.membershipNo ? `Mem: ${p.membershipNo}` : '',
      ].filter(Boolean).join('  ·  ') || 'No details filled',
    }));
    setDeleteDialog({ section, newValue, removeCount, candidates, selected: new Set() });
  };

  const handleVipPSChange = (raw: string) => {
    const newVal = Math.max(0, parseInt(raw) || 0);
    if (newVal < vipPS && passengers.slice(0, vipPS).some(isPassengerFilled)) {
      openDeleteDialog('PS', newVal);
    } else {
      setVipPS(newVal);
    }
  };

  const handleVipLDChange = (raw: string) => {
    const newVal = Math.max(0, parseInt(raw) || 0);
    if (newVal < vipLD && passengers.slice(vipPS, vipPS + vipLD).some(isPassengerFilled)) {
      openDeleteDialog('LD', newVal);
    } else {
      setVipLD(newVal);
    }
  };

  const toggleDeleteSelection = (globalIdx: number) => {
    setDeleteDialog(prev => {
      if (!prev) return prev;
      const next = new Set(prev.selected);
      if (next.has(globalIdx)) next.delete(globalIdx);
      else next.add(globalIdx);
      return { ...prev, selected: next };
    });
  };

  const confirmDeletePassengers = () => {
    if (!deleteDialog) return;
    const { section, newValue, selected } = deleteDialog;
    setPassengers(prev => prev.filter((_, i) => !selected.has(i)));
    if (section === 'PS') setVipPS(newValue);
    else setVipLD(newValue);
    setDeleteDialog(null);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const [nonFlyingLD, setNonFlyingLD] = useState(booking.nonFlyingGuestsInLoungeDeluxe ?? 0);

  // ── Per-guest voucher toggles (true = this guest's entry is covered by a voucher) ──
  // Only Account Owner and Spouse are eligible; toggling consumes one voucher from account.
  const [passengerVoucherUsed, setPassengerVoucherUsed] = useState<boolean[]>([]);
  const [nonFlyingVoucherUsed, setNonFlyingVoucherUsed] = useState<boolean[]>([]);

  // Non-Flying Guest detail forms
  const [nonFlyingGuests, setNonFlyingGuests] = useState<NonFlyingGuest[]>(() =>
    buildInitialNonFlyingGuests(
      (booking.nonFlyingGuestsInPremiereSuite ?? 0) + (booking.nonFlyingGuestsInLoungeDeluxe ?? 0),
      bookingId
    )
  );

  useEffect(() => {
    const total = nonFlyingPS + nonFlyingLD;
    setNonFlyingGuests(prev => {
      if (prev.length === total) return prev;
      if (prev.length < total)
        return [...prev, ...Array.from({ length: total - prev.length }, emptyNonFlyingGuest)];
      return prev.slice(0, total);
    });
  }, [nonFlyingPS, nonFlyingLD]);

  const updateNonFlyingGuest = (idx: number, field: keyof NonFlyingGuest, value: string) => {
    setNonFlyingGuests(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  // Sync voucher toggle arrays when guest counts change
  useEffect(() => {
    const total = vipPS + vipLD;
    setPassengerVoucherUsed(prev => {
      if (prev.length === total) return prev;
      if (prev.length < total) return [...prev, ...Array.from({ length: total - prev.length }, () => false)];
      return prev.slice(0, total);
    });
  }, [vipPS, vipLD]);

  useEffect(() => {
    const total = nonFlyingPS + nonFlyingLD;
    setNonFlyingVoucherUsed(prev => {
      if (prev.length === total) return prev;
      if (prev.length < total) return [...prev, ...Array.from({ length: total - prev.length }, () => false)];
      return prev.slice(0, total);
    });
  }, [nonFlyingPS, nonFlyingLD]);

  // ── Role helpers — determine if a guest is Account Owner / Spouse ──────────
  // VIP Passenger 0 = Account Owner, Passenger 1 = Spouse, rest = Guest
  const getPassengerRole = (idx: number): 'Account Owner' | 'Spouse' | 'Guest' => {
    if (idx === 0) return 'Account Owner';
    if (idx === 1) return 'Spouse';
    return 'Guest';
  };
  // Non-Flying Guest 0 = Spouse (when total VIP passengers is only 1 i.e. no VIP spouse slot used)
  const getNFGRole = (idx: number): 'Spouse' | 'Guest' => {
    if (idx === 0 && (vipPS + vipLD) <= 1) return 'Spouse';
    return 'Guest';
  };
  const isVoucherEligibleRole = (role: string): boolean =>
    role === 'Account Owner' || role === 'Spouse';

  // Computed voucher totals
  const totalPassengerVouchersUsed = passengerVoucherUsed.filter(Boolean).length;
  const totalNFGVouchersUsed = nonFlyingVoucherUsed.filter(Boolean).length;
  const totalVouchersApplied = totalPassengerVouchersUsed + totalNFGVouchersUsed;
  const remainingVouchers = Math.max(0, customerTotalVouchers - totalVouchersApplied);

  // Pricing with new voucher model
  const headCountTotal = Math.max(vipPS + vipLD + nonFlyingPS + nonFlyingLD, booking.numberOfGuests || 1) * headCountRate;
  const voucherCount = totalVouchersApplied; // alias for invoice dialog compat
  const voucherTotal = totalVouchersApplied * headCountRate;
  const amountDueAfterVouchers = Math.max(0, headCountTotal + serviceSubtotal - voucherTotal);

  // Toggle a single passenger's voucher
  const togglePassengerVoucher = (idx: number) => {
    const role = getPassengerRole(idx);
    if (!isVoucherEligibleRole(role)) return;
    setPassengerVoucherUsed(prev => {
      const next = [...prev];
      const turning_on = !next[idx];
      if (turning_on && remainingVouchers === 0) return prev; // no vouchers left
      next[idx] = !next[idx];
      return next;
    });
  };

  // Toggle a non-flying guest's voucher
  const toggleNFGVoucher = (idx: number) => {
    const role = getNFGRole(idx);
    if (!isVoucherEligibleRole(role)) return;
    setNonFlyingVoucherUsed(prev => {
      const next = [...prev];
      const turning_on = !next[idx];
      if (turning_on && remainingVouchers === 0) return prev;
      next[idx] = !next[idx];
      return next;
    });
  };

  // ── Validation ──────────────────────────────────────────────────
  // Rule 1: max 6 guests (VIP + non-flying) per Premiere Suite
  const psMaxGuests = numPremiereSuites * 6;
  const psTotalGuests = vipPS + nonFlyingPS;
  const psOverCapacity = numPremiereSuites > 0 && psTotalGuests > psMaxGuests;

  // Rule 2: max 3 non-flying guests per booking in Lounge Deluxe
  const ldNonFlyingExceeded = nonFlyingLD > 3;

  // Rule 3: each booking must include at least 1 VIP passenger
  const psNoVip = numPremiereSuites > 0 && vipPS === 0;
  const ldNoVip = vipLD === 0;

  // Rule 4: if any PS guests exist, at least 1 Premiere Suite must be booked
  const psGuestsWithoutSuite = (vipPS > 0 || nonFlyingPS > 0) && numPremiereSuites === 0;

  const psErrors: string[] = [];
  if (psGuestsWithoutSuite) psErrors.push('Quantity of Premiere Suite must be at least 1 when guests are assigned to it.');
  if (psNoVip) psErrors.push('At least 1 VIP Passenger is required per Premiere Suite booking.');
  if (psOverCapacity) psErrors.push(`Total guests (${psTotalGuests}) exceeds the maximum of ${psMaxGuests} (6 per suite × ${numPremiereSuites} suite${numPremiereSuites > 1 ? 's' : ''}).`);

  const ldErrors: string[] = [];
  if (ldNoVip) ldErrors.push('At least 1 VIP Passenger is required for a Lounge Deluxe booking.');
  if (ldNonFlyingExceeded) ldErrors.push(`Non-Flying Guests (${nonFlyingLD}) exceeds the maximum of 3 per Lounge Deluxe booking.`);

  const hasGuestErrors = psErrors.length > 0 || ldErrors.length > 0;

  // ── Similar Profile Detection ─────────────────────────────────────────────
  const [showSimilarBanner, setShowSimilarBanner] = useState(true);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeComplete, setMergeComplete] = useState(false);
  // mergeChecked: set of differing field labels the user wants to pull from the similar profile
  // Checked = overwrite this field with the similar profile's value; Unchecked = no action
  const [mergeChecked, setMergeChecked] = useState<Set<string>>(new Set());

  const openMergeDialog = () => {
    setMergeChecked(new Set()); // nothing checked by default — no action
    setShowMergeDialog(true);
  };

  const toggleMergeField = (label: string) => {
    setMergeChecked(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  const toggleAllMergeFields = (mergeableLabels: string[], checkAll: boolean) => {
    setMergeChecked(checkAll ? new Set(mergeableLabels) : new Set());
  };
  // ────────────��───────────────────────────────────────────────────

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

  return (
    <div className="p-6 space-y-6">
      {/* 1. Back Button */}
      <div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookings
        </Button>
      </div>

      {/* 2. Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1>Booking Details - {booking.bookingNo}</h1>
            {booking.isAdHoc && (
              <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Ad-hoc Booking
              </Badge>
            )}
          </div>
          <p className="text-gray-600">View and manage booking information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInvoice(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
          <Button variant="outline" onClick={() => setIsEditBookingOpen(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Booking
          </Button>
        </div>
      </div>

      {/* 3. Actions */}
      <Card className="p-6">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Actions</h3>
        <div className="flex flex-wrap gap-2">
          {/* Review Actions */}
          {booking.status === 'Pending for Review' && (
            <>
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Review & Set Price
              </Button>
              <Button variant="destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Reject Booking
              </Button>
            </>
          )}

          {/* Approval Actions — removed, use /bookings/review/:id for approval */}

          {/* Payment Actions */}
          {booking.paymentStatus === 'Pending' && booking.paymentMode === 'Upfront' && (
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Generate Payment Link
            </Button>
          )}

          {booking.paymentStatus === 'Payment Link Sent' && (
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Send Payment Reminder
            </Button>
          )}

          {booking.paymentStatus === 'Overdue' && (
            <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Re-activate Booking
            </Button>
          )}

          {/* Common Actions */}
          {booking.status === 'Confirmed' && (
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          )}

          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Share with Partners
          </Button>

          <Button variant="outline" onClick={() => setIsMovementLogOpen(true)}>
            <History className="w-4 h-4 mr-2" />
            Movement Log
          </Button>

          <Button variant="outline" onClick={() => { setCustomerSearchQuery(''); setIsCustomerSearchOpen(true); }}>
            <Users className="w-4 h-4 mr-2" />
            Guests Searcher
          </Button>

          {booking.status !== 'Cancelled' && booking.status !== 'Rejected' && (
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Cancel Booking
            </Button>
          )}

          {/* Refund Action for Cancelled bookings with Paid status */}
          {booking.status === 'Cancelled' && 
           (booking.paymentStatus === 'Paid' || booking.paymentStatus === 'Payment Link Sent') && 
           booking.paymentStatus !== 'Refunded' && (
            <Button variant="outline" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
              <DollarSign className="w-4 h-4 mr-2" />
              Process Refund
            </Button>
          )}

          {/* Refund Action for Confirmed + Paid bookings */}
          {isConfirmedAndPaid && (
            <Button
              variant="outline"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
              onClick={() => { setRefundAmount(''); setRefundReason(''); setShowRefundDialog(true); }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refund
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Rejection Reason (if applicable) */}
      {booking.rejectionReason && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="text-sm uppercase tracking-wide text-red-700 mb-2">Rejection Reason</h3>
          <p className="text-sm text-red-900">{booking.rejectionReason}</p>
        </Card>
      )}

      {/* 5. Alert for Ad-hoc bookings */}
      {booking.isAdHoc && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-900">
                <strong>Ad-hoc Booking Alert:</strong> This booking was made less than 48 hours before the flight time. 
                {booking.cutoffHours && (
                  <> Time remaining: {booking.cutoffHours} hours</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5.5 Similar Profile Detected */}
      {(() => {
        const p = passengers[0];
        if (!p || !isPassengerFilled(p) || !showSimilarBanner || mergeComplete) return null;
        const fullName = [p.title, p.firstName, p.lastName].filter(Boolean).join(' ');
        const dob = [p.birthdayDay, p.birthdayMonth, p.birthdayYear].filter(Boolean).join(' ');
        const currentProfile = {
          accountNo: booking.accountNo,
          title: p.title,
          firstName: p.firstName,
          lastName: p.lastName,
          gender: (p.title === 'Mrs' || p.title === 'Miss') ? 'Female' : 'Male',
          dateOfBirth: dob,
          passportNo: p.travelDocNo || '—',
          email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}@email.com`,
          phone: '+852 9111 0001',
          nationality: 'British',
          membershipType: booking.accountType === 'Individual' ? 'Gold' : 'N/A',
          totalVisits: String(bookingId % 15 + 12),
          lastVisit: '2026-02-14',
          foodAllergies: p.foodAllergies || '—',
          dietaryRequirements: 'Low Sodium',
          createdDate: '2024-01-15',
          bookingNo: booking.bookingNo,
          preferences: 'Window seat, extra pillow, champagne on arrival',
          remarks: 'Requires quiet suite; do not disturb before 09:00.',
        };
        const similarProfile = {
          accountNo: 'ACC-2023-0047',
          title: p.title,
          firstName: p.firstName,
          lastName: p.lastName,
          gender: (p.title === 'Mrs' || p.title === 'Miss') ? 'Female' : 'Male',
          dateOfBirth: dob,
          passportNo: p.travelDocNo || '—',
          email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}.hkg@gmail.com`,
          phone: '+852 9872 3341',
          nationality: 'British',
          membershipType: 'None',
          totalVisits: '8',
          lastVisit: '2023-11-20',
          foodAllergies: p.foodAllergies?.split(',')[0]?.trim() || '—',
          dietaryRequirements: 'None',
          createdDate: '2023-04-10',
          bookingNo: 'A-20231120-000047',
          preferences: 'Aisle seat preferred, warm towel service',
          remarks: 'First-time Premiere Suite guest. Noted language preference: Cantonese.',
        };
        const compareRows: { label: string; curr: string; sim: string; isMatch: boolean }[] = [
          // ── Fixed fields first — Account No. always row 1 ──────────────────
          { label: 'Account No.',          curr: currentProfile.accountNo,         sim: similarProfile.accountNo,         isMatch: false },
          { label: 'Full Name',            curr: `${currentProfile.title} ${currentProfile.firstName} ${currentProfile.lastName}`, sim: `${similarProfile.title} ${similarProfile.firstName} ${similarProfile.lastName}`, isMatch: true },
          { label: 'Gender',               curr: currentProfile.gender,            sim: similarProfile.gender,            isMatch: currentProfile.gender === similarProfile.gender },
          { label: 'Date of Birth',        curr: currentProfile.dateOfBirth,       sim: similarProfile.dateOfBirth,       isMatch: currentProfile.dateOfBirth === similarProfile.dateOfBirth },
          { label: 'Passport No.',         curr: currentProfile.passportNo,        sim: similarProfile.passportNo,        isMatch: currentProfile.passportNo === similarProfile.passportNo },
          { label: 'Membership',           curr: currentProfile.membershipType,    sim: similarProfile.membershipType,    isMatch: currentProfile.membershipType === similarProfile.membershipType },
          { label: 'Total Visits',         curr: currentProfile.totalVisits,       sim: similarProfile.totalVisits,       isMatch: false },
          { label: 'Last Visit',           curr: currentProfile.lastVisit,         sim: similarProfile.lastVisit,         isMatch: false },
          { label: 'Created Date',         curr: currentProfile.createdDate,       sim: similarProfile.createdDate,       isMatch: false },
          // ── Mergeable fields below ──────────────────────────────────────────
          { label: 'Email',                curr: currentProfile.email,             sim: similarProfile.email,             isMatch: false },
          { label: 'Phone',                curr: currentProfile.phone,             sim: similarProfile.phone,             isMatch: false },
          { label: 'Food Allergies',       curr: currentProfile.foodAllergies,     sim: similarProfile.foodAllergies,     isMatch: currentProfile.foodAllergies === similarProfile.foodAllergies },
          { label: 'Dietary Requirements', curr: currentProfile.dietaryRequirements, sim: similarProfile.dietaryRequirements, isMatch: currentProfile.dietaryRequirements === similarProfile.dietaryRequirements },
          { label: 'Preferences',          curr: currentProfile.preferences,         sim: similarProfile.preferences,         isMatch: currentProfile.preferences === similarProfile.preferences },
          { label: 'Remarks',              curr: currentProfile.remarks,             sim: similarProfile.remarks,             isMatch: currentProfile.remarks === similarProfile.remarks },
        ];
        const matchCount = compareRows.filter(r => r.isMatch).length;

        return (
          <>
            <Card className="p-5 border-amber-300 bg-amber-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-amber-900">Similar Profile Detected</h3>
                    <Badge className="bg-amber-200 text-amber-800 border border-amber-300 text-xs px-2 py-0.5">
                      {matchCount} Matching Fields
                    </Badge>
                  </div>
                  <p className="text-sm text-amber-800">
                    A profile matching <strong>{fullName}</strong> — same name, date of birth, gender and passport number — was found in a previous booking (<span className="font-mono text-xs bg-amber-100 px-1 rounded">{similarProfile.bookingNo}</span>). Do you want to review those profiles?
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5" onClick={() => openMergeDialog()}>
                      <Eye className="w-3.5 h-3.5" />
                      View Profiles
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 gap-1.5" onClick={() => setShowSimilarBanner(false)}>
                      <X className="w-3.5 h-3.5" />
                      Ignore
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Profile Merge Comparison Dialog */}
            <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
              <DialogContent className="min-w-[1200px] max-w-[1200px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <GitMerge className="w-5 h-5 text-amber-600" />
                    Compare & Merge Profiles
                  </DialogTitle>
                  <DialogDescription>
                    Fields marked with a <span className="inline-flex items-center gap-1 font-medium text-gray-600"><svg className="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> lock</span> are identity fields and cannot be merged. Tick the checkbox next to <strong>Email</strong>, <strong>Phone</strong>, <strong>Food Allergies</strong>, <strong>Dietary Requirements</strong>, <strong>Preferences</strong>, or <strong>Remarks</strong> to overwrite them with the similar profile's value.
                  </DialogDescription>
                </DialogHeader>

                {/* Match Summary Bar */}
                {(() => {
                  // Only non-fixed differing rows are mergeable (can have checkboxes)
                  const mergeableLabels = compareRows
                    .filter(r => !r.isMatch && !MERGE_FIXED_FIELDS.has(r.label))
                    .map(r => r.label);
                  const mergeableDifferingCount = mergeableLabels.length;
                  const checkedCount = mergeableLabels.filter(l => mergeChecked.has(l)).length;
                  const allChecked   = mergeableLabels.length > 0 && checkedCount === mergeableLabels.length;
                  return (
                    <div className="flex items-center gap-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex-wrap">
                      <div className="flex items-center gap-1.5 text-green-700">
                        <CheckCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">{matchCount} fields identical</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1.5 text-orange-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">{mergeableDifferingCount} fields differ</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1.5 text-blue-700">
                        <span className="text-sm font-medium">{checkedCount} field{checkedCount !== 1 ? 's' : ''} selected to overwrite</span>
                      </div>

                    </div>
                  );
                })()}

                {/* ── Identity Profile Cards (fixed fields, side-by-side) ── */}
                {(() => {
                  const fixedRows = compareRows.filter(r => MERGE_FIXED_FIELDS.has(r.label));
                  return (
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                      {/* Card header row */}
                      <div className="grid grid-cols-2">
                        <div className="px-5 py-3 bg-blue-600 flex items-center gap-2 border-r border-blue-500">
                          <User className="w-4 h-4 text-white shrink-0" />
                          <div>
                            <p className="text-white text-xs font-semibold">Current Booking Guest</p>
                            <p className="text-blue-200 text-xs">{currentProfile.accountNo}</p>
                          </div>
                        </div>
                        <div className="px-5 py-3 bg-amber-500 flex items-center gap-2">
                          <History className="w-4 h-4 text-white shrink-0" />
                          <div>
                            <p className="text-white text-xs font-semibold">Similar Profile (Old Booking)</p>
                            <p className="text-amber-100 text-xs">{similarProfile.bookingNo} · {similarProfile.accountNo}</p>
                          </div>
                        </div>
                      </div>

                      {/* Fixed fields grid — two columns side by side */}
                      <div className="grid grid-cols-2 divide-x divide-gray-200">
                        {/* Current profile column */}
                        <div className="bg-blue-50/30 p-5 grid grid-cols-[150px_1fr] gap-x-3 gap-y-3 content-start">
                          {fixedRows.map(row => (
                            <div key={`curr-${row.label}`} className="contents">
                              <span className="text-xs text-gray-500 font-medium flex items-center gap-1 self-start pt-0.5">
                                
                                {row.label}
                              </span>
                              <span className={`text-sm font-medium break-all ${row.isMatch ? 'text-gray-800' : 'text-blue-800'}`}>
                                {row.curr || '—'}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Similar profile column */}
                        <div className="bg-amber-50/30 p-5 grid grid-cols-[150px_1fr] gap-x-3 gap-y-3 content-start">
                          {fixedRows.map(row => (
                            <div key={`sim-${row.label}`} className="contents">
                              <span className="text-xs text-gray-500 font-medium flex items-center gap-1 self-start pt-0.5">
                                
                                {row.label}
                              </span>
                              <span className={`text-sm font-medium break-all ${row.isMatch ? 'text-gray-800' : 'text-amber-800'}`}>
                                {row.sim || '—'}
                                {!row.isMatch && (
                                  null
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer note */}
                      
                    </div>
                  );
                })()}

                {/* ── Mergeable fields table ── */}
                <div className="rounded-lg border border-gray-200 overflow-hidden text-sm">
                  {/* Header row */}
                  {(() => {
                    const mergeableLabels = compareRows
                      .filter(r => !r.isMatch && !MERGE_FIXED_FIELDS.has(r.label))
                      .map(r => r.label);
                    const checkedCount = mergeableLabels.filter(l => mergeChecked.has(l)).length;
                    const allChecked   = mergeableLabels.length > 0 && checkedCount === mergeableLabels.length;
                    const someChecked  = checkedCount > 0 && !allChecked;
                    return (
                  <div className="grid grid-cols-[44px_180px_1fr_1fr] bg-gray-100 border-b border-gray-200">
                    <div
                      className="px-3 py-3 border-r border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => toggleAllMergeFields(mergeableLabels, !allChecked)}
                      title={allChecked ? 'Deselect all mergeable fields' : 'Select all mergeable fields'}
                    >
                      <span
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          allChecked
                            ? 'bg-amber-500 border-amber-500'
                            : someChecked
                            ? 'bg-amber-200 border-amber-400'
                            : 'bg-white border-gray-300 hover:border-amber-400'
                        }`}
                      >
                        {allChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                        {someChecked && (
                          <span className="w-2 h-0.5 bg-amber-600 rounded-full block" />
                        )}
                      </span>
                    </div>
                    <div className="px-4 py-3 border-r border-gray-200 flex items-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mergeable Field</span>
                    </div>
                    <div className="px-4 py-3 border-r border-blue-300 bg-blue-600 flex items-center gap-2">
                      <User className="w-4 h-4 text-white shrink-0" />
                      <p className="text-white text-xs font-semibold">Current Guest</p>
                    </div>
                    <div className="px-4 py-3 bg-amber-500 flex items-center gap-2">
                      <History className="w-4 h-4 text-white shrink-0" />
                      <p className="text-white text-xs font-semibold">Similar Profile</p>
                    </div>
                  </div>
                    );
                  })()}

                  {/* Only mergeable (non-fixed) rows */}
                  {compareRows.filter(r => !MERGE_FIXED_FIELDS.has(r.label)).map((row, idx, arr) => {
                    const isLast    = idx === arr.length - 1;
                    const borderB   = isLast ? '' : 'border-b border-gray-100';
                    const isChecked = mergeChecked.has(row.label);

                    // ── Matching mergeable field ──────────────────────────────────────
                    if (row.isMatch) {
                      return (
                        <div key={row.label} className={`grid grid-cols-[44px_180px_1fr_1fr] ${borderB} bg-green-50`}>
                          <div className="border-r border-gray-200 flex items-center justify-center">
                            <CheckCheck className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="px-4 py-3 border-r border-gray-200 flex items-center">
                            <span className="text-xs text-gray-600 font-medium">{row.label}</span>
                          </div>
                          <div className="px-4 py-3 border-r border-gray-100 flex items-center gap-2">
                            <span className="text-sm text-green-800 font-medium break-all">{row.curr || '—'}</span>
                          </div>
                          <div className="px-4 py-3 flex items-center gap-2">
                            <span className="text-sm text-green-800 font-medium break-all">{row.sim || '—'}</span>
                            <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full whitespace-nowrap">Same</span>
                          </div>
                        </div>
                      );
                    }

                    // ── Differing mergeable field: checkbox to opt-in ────────────────
                    return (
                      <div
                        key={row.label}
                        className={`grid grid-cols-[44px_180px_1fr_1fr] ${borderB} ${isChecked ? 'bg-amber-50/60' : 'bg-white'} transition-colors`}
                      >
                        {/* Checkbox */}
                        <div
                          className="border-r border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleMergeField(row.label)}
                        >
                          <span
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-amber-500 border-amber-500'
                                : 'bg-white border-gray-300 hover:border-amber-400'
                            }`}
                          >
                            {isChecked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                              </svg>
                            )}
                          </span>
                        </div>

                        {/* Field label */}
                        <div
                          className="px-4 py-3 border-r border-gray-200 flex flex-col justify-center cursor-pointer"
                          onClick={() => toggleMergeField(row.label)}
                        >
                          <span className="text-xs text-gray-700 font-medium">{row.label}</span>
                          <span className={`text-xs mt-0.5 ${isChecked ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                            {isChecked ? 'Will be overwritten' : 'No action'}
                          </span>
                        </div>

                        {/* Current value — dimmed when checked */}
                        <div className={`px-4 py-3 border-r border-gray-100 flex items-start gap-2 ${isChecked ? 'opacity-50' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-700 break-all">{row.curr || '—'}</span>
                            {isChecked && (
                              <span className="block text-xs text-gray-400 mt-0.5 line-through">{row.curr || '—'}</span>
                            )}
                          </div>
                        </div>

                        {/* Similar value — highlighted when checked */}
                        <div
                          className={`px-4 py-3 flex items-start gap-2 cursor-pointer transition-colors ${
                            isChecked ? 'bg-amber-100/70' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => toggleMergeField(row.label)}
                        >
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm break-all font-medium ${isChecked ? 'text-amber-800' : 'text-gray-600'}`}>
                              {row.sim || '—'}
                            </span>
                            {isChecked && (
                              <span className="block text-xs text-amber-600 mt-0.5">← Will replace current value</span>
                            )}
                          </div>
                          {isChecked && <CheckCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 text-xs text-gray-500 px-1 flex-wrap">
                  
                  <span className="flex items-center gap-1.5">
                    <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                    Same in both profiles (no action needed)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded border-2 border-gray-300 bg-white inline-block" />
                    Unticked — keep current value, no action
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded border-2 border-amber-500 bg-amber-500 inline-flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                      </svg>
                    </span>
                    Ticked — overwrite with similar profile's value
                  </span>
                </div>

                {/* Selection summary */}
                {(() => {
                  const checkedCount    = mergeChecked.size;
                  const mergeableCount  = compareRows.filter(r => !r.isMatch && !MERGE_FIXED_FIELDS.has(r.label)).length;
                  const fixedCount      = compareRows.filter(r => MERGE_FIXED_FIELDS.has(r.label)).length;
                  const noActionCount   = mergeableCount - checkedCount;
                  return (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm flex-wrap">
                      <span className="text-gray-500">Merge summary:</span>
                      <span className="text-green-700 font-medium">{matchCount} identical (auto-kept)</span>
                      <span className="text-gray-400">·</span>
                      
                      
                      <span className="text-amber-700 font-medium">{checkedCount} field{checkedCount !== 1 ? 's' : ''} to overwrite</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">{noActionCount} mergeable field{noActionCount !== 1 ? 's' : ''} unchanged</span>
                    </div>
                  );
                })()}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t gap-4">
                  <p className="text-xs text-gray-500">
                    The merged profile will be saved under <span className="font-mono">{booking.accountNo}</span>. Only ticked fields will be overwritten.
                  </p>
                  <div className="flex gap-3 shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowMergeDialog(false);
                        setShowSimilarBanner(false);
                      }}
                    >
                      <X className="w-4 h-4 mr-1.5" />
                      Ignore
                    </Button>
                    <Button
                      className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white gap-2"
                      onClick={() => {
                        setShowMergeDialog(false);
                        setMergeComplete(true);
                        setShowSimilarBanner(false);
                        const count = mergeChecked.size;
                        toast.success('Profiles merged successfully!', {
                          description: count > 0
                            ? `${fullName}'s profile updated under ${booking.accountNo}. ${count} field${count !== 1 ? 's' : ''} overwritten from the similar profile.`
                            : `Profiles linked under ${booking.accountNo}. No fields were overwritten.`,
                        });
                      }}
                    >
                      <GitMerge className="w-4 h-4" />
                      Confirm Merge
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        );
      })()}

      {/* 6. Guest Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-wide text-gray-500">Guest Information</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const found = mockCustomerDirectory.find(c => c.name === booking.guestName) || {
                id: 0,
                accountNo: booking.accountNo,
                name: booking.guestName,
                type: booking.accountType || 'Individual',
                email: `${booking.guestName.toLowerCase().replace(' ', '.')}@email.com`,
                phone: '+852 9000 0000',
                membershipType: booking.accountType === 'Individual' ? 'Gold' : undefined,
                membershipExpiry: booking.accountType === 'Individual' ? '2026-12-31' : undefined,
                status: 'Active',
                totalBookings: bookingId % 15 + 3,
                createdDate: '2024-01-01',
              };
              setSelectedCustomer(found);
              setIsCustomerProfileOpen(true);
            }}
            className="flex items-center gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Customer Profile
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-600">Guest Name</label>
            <p className="text-lg">{booking.guestName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">User ID</label>
            <p className="text-lg">{booking.accountNo}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Account Type</label>
            <p className="text-lg">{booking.accountType}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Number of Guests</label>
            <p className="text-lg">{booking.numberOfGuests} total</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Non-Flying Guests</label>
            <p className="text-lg">{booking.nonFlyingGuests || 0}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Payment Method</label>
            <p className="text-lg">{booking.paymentMode || '—'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Account Discount</label>
            <p className="text-lg text-green-600">
              {booking.agencyDiscountRate
                ? `${booking.agencyDiscountRate}% (Agency Default)`
                : '—'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Promotion Code</label>
            <p className="text-lg">{booking.agencyCode || '—'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Account Remark</label>
            <p className="text-lg">—</p>
          </div>
        </div>
      </Card>

      {/* 7. Flight Information */}
      <Card className="p-6">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Flight Information</h3>
        <div className="grid grid-cols-4 gap-6">
          {/* Row 1 — Flight Type & Arrival Date (above Flight Number) */}
          <div>
            <label className="text-sm text-gray-600 block mb-[10px]">Flight Type</label>
            {booking.flightType === 'Arrival' ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2a1 1 0 0 0-.9.3L2.5 6.9a1 1 0 0 0 .1 1.4L8 12l-2 3H4l-1 1 3 2 2 3 1-1v-2l3-2 3.5 5.4a1 1 0 0 0 1.4.1l1.4-1.4a1 1 0 0 0 .3-.9z"/>
                  </svg>
                  Arrival
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200">
                  <svg className="w-3.5 h-3.5 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2a1 1 0 0 0-.9.3L2.5 6.9a1 1 0 0 0 .1 1.4L8 12l-2 3H4l-1 1 3 2 2 3 1-1v-2l3-2 3.5 5.4a1 1 0 0 0 1.4.1l1.4-1.4a1 1 0 0 0 .3-.9z"/>
                  </svg>
                  Departure
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-[10px]">
              {booking.flightType === 'Arrival' ? 'Arrival Date' : 'Departure Date'}
            </label>
            <p className="text-lg">{booking.arrivalDate || '—'}</p>
          </div>
          {/* Row 1 continued — Flight Number & Flight Time */}
          <div>
            <label className="text-sm text-gray-600 block mb-[10px]">Flight Number</label>
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-gray-400" />
              <p className="text-lg">{booking.flightNo}</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-[10px]">Flight Time (STD/STA)</label>
            <p className="text-lg">{booking.flightTime}</p>
          </div>
          {/* Row 2 — Route, Luggage, Flight Class */}
          <div>
            <label className="text-sm text-gray-600 block mb-[10px]">Route</label>
            <p className="text-lg">{booking.flightOrigin || '—'} → {booking.flightDestination || '—'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-[10px]">Number of Luggage</label>
            <p className="text-lg">{booking.numberOfLuggage || 0} pcs</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-[10px]">Flight Class (Main VIP Passenger)</label>
            {booking.flightClass ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${
                booking.flightClass === 'First Class'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : booking.flightClass === 'Business Class'
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                {booking.flightClass === 'First Class' && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                )}
                {booking.flightClass === 'Business Class' && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                )}
                {booking.flightClass}
              </span>
            ) : (
              <p className="text-lg text-gray-400">—</p>
            )}
          </div>
        </div>
      </Card>

      {/* 8. Booking Details */}
      <Card className="p-6">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Booking Details</h3>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-sm text-gray-600">Suite/Lounge</label>
            <p className="text-lg">{booking.suite || 'Not assigned'}</p>
            {(booking.assignedSuiteNames?.length || booking.assignedLoungeNames?.length) ? (
              <div className="mt-2 space-y-1.5">
                {booking.assignedSuiteNames && booking.assignedSuiteNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Suites</span>
                    {booking.assignedSuiteNames.map(name => (
                      <span key={name} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
                {booking.assignedLoungeNames && booking.assignedLoungeNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Lounges</span>
                    {booking.assignedLoungeNames.map(name => (
                      <span key={name} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <div>
            <label className="text-sm text-gray-600">Date & Time</label>
            <p className="text-lg">{booking.dateTime}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Payment Mode</label>
            <p className="text-lg">{booking.paymentMode}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Booking Type</label>
            <p className="text-lg">{booking.bookingType}</p>
          </div>
        </div>

        {/* Part 1: Premiere Suite */}
        <div className={`border rounded-lg p-4 mb-4 ${psErrors.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Part 1 — Premiere Suite</h4>
              <p className="text-xs text-gray-500 mt-0.5">Max 6 guests (VIP + Non-Flying) per suite · At least 1 VIP Passenger required</p>
            </div>
            {numPremiereSuites > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${psOverCapacity ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {psTotalGuests} / {psMaxGuests} guests used
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-600 block mb-[10px]">Quantity of Premiere Suite</label>
              <input
                type="number"
                min={0}
                value={numPremiereSuites}
                onChange={e => setNumPremiereSuites(Math.max(0, parseInt(e.target.value) || 0))}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${psGuestsWithoutSuite ? 'border-red-400 bg-red-50' : ''}`}
              />
              {psGuestsWithoutSuite && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Must be at least 1
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-[10px]">Quantity of VIP Passengers</label>
              <input
                type="number"
                min={0}
                value={vipPS}
                onChange={e => handleVipPSChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${psNoVip ? 'border-red-400 bg-red-50' : ''}`}
              />
              {psNoVip && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Required
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-[10px]">Quantity of Non-Flying Guests</label>
              <input
                type="number"
                min={0}
                value={nonFlyingPS}
                onChange={e => setNonFlyingPS(Math.max(0, parseInt(e.target.value) || 0))}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${psOverCapacity ? 'border-red-400 bg-red-50' : ''}`}
              />
            </div>
          </div>

          {psErrors.length > 0 && (
            <div className="mt-3 space-y-1">
              {psErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-100 border border-red-200 rounded px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Part 2: Lounge Deluxe */}
        <div className={`border rounded-lg p-4 ${ldErrors.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Part 2 — Lounge Deluxe</h4>
              <p className="text-xs text-gray-500 mt-0.5">Max 3 Non-Flying Guests per booking · At least 1 VIP Passenger required</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${ldNonFlyingExceeded ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {nonFlyingLD} / 3 non-flying used
            </span>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-600 block mb-[10px]">Quantity of VIP Passengers</label>
              <input
                type="number"
                min={0}
                value={vipLD}
                onChange={e => handleVipLDChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${ldNoVip ? 'border-red-400 bg-red-50' : ''}`}
              />
              {ldNoVip && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Required
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-[10px]">Quantity of Non-Flying Guests</label>
              <input
                type="number"
                min={0}
                value={nonFlyingLD}
                onChange={e => setNonFlyingLD(Math.max(0, parseInt(e.target.value) || 0))}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 ${ldNonFlyingExceeded ? 'border-red-400 bg-red-50' : ''}`}
              />
              {ldNonFlyingExceeded && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Max 3 allowed
                </p>
              )}
            </div>
          </div>

          {ldErrors.length > 0 && (
            <div className="mt-3 space-y-1">
              {ldErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-100 border border-red-200 rounded px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Guest Details */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <Button
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            disabled={hasGuestErrors}
            onClick={() => { if (!hasGuestErrors) toast.success('Guest details saved successfully!'); }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Guest Details
          </Button>
          {hasGuestErrors && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Please fix the errors above before saving.
            </p>
          )}
        </div>
      </Card>

      {/* 8b. Suite & Time Assignment — only for Confirmed + Paid bookings */}
      {isConfirmedAndPaid && (
        <Card className="p-6 border-blue-200 bg-blue-50/30">
          <div className="flex items-center gap-2 mb-5">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm uppercase tracking-wide text-blue-800">Suite / Lounge Table Assignment</h3>
            <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200">
              <CheckCircle className="w-3 h-3" /> Confirmed & Paid
            </span>
          </div>

          <div className="grid grid-cols-4 gap-5">
            {/* Suite / Lounge Table */}
            <div className="col-span-2">
              <label className="text-sm text-gray-600 block mb-[10px]">Suite / Lounge Table</label>
              <select
                value={assignedSuite}
                onChange={e => setAssignedSuite(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {SUITE_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm text-gray-600 block mb-[10px]">Booking Date</label>
              <input
                type="date"
                value={assignedDate}
                onChange={e => setAssignedDate(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Time Range */}
            <div>
              <label className="text-sm text-gray-600 block mb-[10px]">Time Slot</label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={assignedStartTime}
                  onChange={e => setAssignedStartTime(e.target.value)}
                  className="flex-1 px-2 py-2 border border-blue-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-gray-400 text-sm shrink-0">to</span>
                <input
                  type="time"
                  value={assignedEndTime}
                  onChange={e => setAssignedEndTime(e.target.value)}
                  className="flex-1 px-2 py-2 border border-blue-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Current assignment preview */}
          <div className="mt-4 flex items-center gap-3 px-4 py-2.5 bg-white border border-blue-100 rounded-lg text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Assigned: <strong className="text-gray-900">{assignedSuite}</strong>
              {' '}&nbsp;·&nbsp;{' '}
              <strong className="text-gray-900">{assignedDate}</strong>
              {' '}&nbsp;·&nbsp;{' '}
              <strong className="text-gray-900">{assignedStartTime} – {assignedEndTime}</strong>
            </span>
          </div>

          <div className="flex gap-3 mt-5">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => toast.success('Suite & time assignment saved!', {
                description: `${assignedSuite} · ${assignedDate} · ${assignedStartTime}–${assignedEndTime}`,
              })}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Assignment
            </Button>
          </div>
        </Card>
      )}

      {/* 8c. In-Charge Staff — only for Confirmed + Paid bookings */}
      {isConfirmedAndPaid && (
        <Card className="p-6 border-indigo-200 bg-indigo-50/20">
          <div className="flex items-center gap-2 mb-5">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm uppercase tracking-wide text-indigo-800">In-Charge Staff</h3>
            {selectedStaffIds.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                {selectedStaffIds.length}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-4">Select one or more staff members who will be responsible for this booking. Multiple selections are allowed.</p>

          <div className="grid grid-cols-2 gap-3">
            {ALL_STAFF.map(staff => {
              const isSelected = selectedStaffIds.includes(staff.id);
              return (
                <label
                  key={staff.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-300'
                      : 'bg-white border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStaff(staff.id)}
                    className="accent-indigo-600 w-4 h-4 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>
                      {staff.name}
                    </p>
                    <p className="text-xs text-gray-500">{staff.role}</p>
                  </div>
                  {isSelected && (
                    <span className="shrink-0 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                      In-Charge
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {selectedStaffIds.length > 0 && (
            <div className="mt-4 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
              <p className="text-xs text-indigo-700">
                <strong>Assigned:</strong>{' '}
                {ALL_STAFF.filter(s => selectedStaffIds.includes(s.id)).map(s => s.name).join(', ')}
              </p>
            </div>
          )}

          <div className="mt-4">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                if (selectedStaffIds.length === 0) { toast.error('Please select at least one staff member.'); return; }
                toast.success('In-charge staff saved!', {
                  description: ALL_STAFF.filter(s => selectedStaffIds.includes(s.id)).map(s => s.name).join(', '),
                });
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Staff Assignment
            </Button>
          </div>
        </Card>
      )}

      {/* 9. Contact Person */}
      <Card className="p-6">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Contact Person</h3>
        <div className="grid grid-cols-3 gap-6">
          {/* Name */}
          <div>
            <label className="text-sm text-gray-600 block mb-[10px]">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Name</span>
            </label>
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Full name of contact person"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          {/* Contact Email */}
          <div>
            <label className="text-sm text-gray-600 block mb-[10px]">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Contact Email</span>
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              placeholder="e.g. contact@example.com"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          {/* Contact No */}
          <div>
            <label className="text-sm text-gray-600 block mb-[10px]">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Contact No.</span>
            </label>
            <input
              type="tel"
              value={contactNo}
              onChange={e => setContactNo(e.target.value)}
              placeholder="e.g. +852 9123 4567"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          {/* Booking Memo — full width */}
          <div className="col-span-3">
            <label className="text-sm text-gray-600 block mb-[10px]">
              <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />Booking Memo</span>
            </label>
            <textarea
              value={bookingMemo}
              onChange={e => setBookingMemo(e.target.value)}
              placeholder="Internal notes or special instructions for this booking..."
              className="w-full px-3 py-2 border rounded text-sm resize-none"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* 10. VIP Passenger Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-500">VIP Passenger Details</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {passengers.length} passenger{passengers.length !== 1 ? 's' : ''} —
              {vipPS > 0 && ` ${vipPS} from Premiere Suite`}
              {vipPS > 0 && vipLD > 0 && ','}
              {vipLD > 0 && ` ${vipLD} from Lounge Deluxe`}
            </p>
          </div>
          {passengers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
              <Ticket className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-800">
                {remainingVouchers} / {customerTotalVouchers} voucher{customerTotalVouchers !== 1 ? 's' : ''} remaining
              </span>
            </div>
          )}
          {passengers.length === 0 && (
            <span className="text-xs text-gray-400 italic">No VIP passengers assigned yet.</span>
          )}
        </div>

        {passengers.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
            <p className="text-sm">Assign VIP Passengers in the Booking Details section above to fill in passenger details.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {passengers.map((p, idx) => {
              const isPS = idx < vipPS;
              const role = getPassengerRole(idx);
              const voucherOn = passengerVoucherUsed[idx] ?? false;
              const eligible = isVoucherEligibleRole(role);
              const isOwner = role === 'Account Owner';
              const isSpouse = role === 'Spouse';

              // Border/bg highlight for owner and spouse
              const cardBorder = isOwner
                ? 'border-amber-300 ring-1 ring-amber-200'
                : isSpouse
                ? 'border-rose-300 ring-1 ring-rose-100'
                : 'border-gray-200';

              return (
                <div key={idx} className={`border rounded-lg overflow-hidden ${cardBorder}`}>
                  {/* Passenger header */}
                  <div className={`flex items-center gap-3 px-4 py-2 ${
                    isOwner ? 'bg-amber-50 border-b border-amber-200' :
                    isSpouse ? 'bg-rose-50 border-b border-rose-200' :
                    isPS ? 'bg-purple-50 border-b border-purple-100' : 'bg-blue-50 border-b border-blue-100'
                  }`}>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPS ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {isPS ? 'Premiere Suite' : 'Lounge Deluxe'}
                    </span>
                    {/* Role badge */}
                    {isOwner && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
                        <Star className="w-3 h-3" /> Account Owner
                      </span>
                    )}
                    {isSpouse && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-xs font-bold">
                        <Heart className="w-3 h-3" /> Spouse
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      VIP Passenger {idx + 1}
                      {p.firstName && p.lastName ? ` — ${p.firstName} ${p.lastName}` : ''}
                    </span>
                    {/* Voucher toggle — only for owner/spouse */}
                    {eligible && (
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-gray-500">Use Voucher</span>
                        <button
                          type="button"
                          onClick={() => togglePassengerVoucher(idx)}
                          disabled={!voucherOn && remainingVouchers === 0}
                          title={!voucherOn && remainingVouchers === 0 ? 'No vouchers remaining' : voucherOn ? 'Remove voucher' : 'Apply voucher (covers HK$1,200 entry)'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            voucherOn
                              ? 'bg-amber-500'
                              : remainingVouchers === 0
                              ? 'bg-gray-200 cursor-not-allowed'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${voucherOn ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        {voucherOn && (
                          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                            <Ticket className="w-3 h-3 inline mr-0.5" />Entry Free
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Row 1: Title | First Name | Last Name | Travel Document No */}
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm text-gray-600 block mb-[10px]">Title</label>
                        <select
                          value={p.title}
                          onChange={e => updatePassenger(idx, 'title', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        >
                          <option value="">—</option>
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Miss">Miss</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-gray-600 block mb-[10px]">First Name</label>
                        <input
                          type="text"
                          value={p.firstName}
                          onChange={e => updatePassenger(idx, 'firstName', e.target.value)}
                          placeholder="First name"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-gray-600 block mb-[10px]">Last Name</label>
                        <input
                          type="text"
                          value={p.lastName}
                          onChange={e => updatePassenger(idx, 'lastName', e.target.value)}
                          placeholder="Last name"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-sm text-gray-600 block mb-[10px]">Travel Document No.</label>
                        <input
                          type="text"
                          value={p.travelDocNo}
                          onChange={e => updatePassenger(idx, 'travelDocNo', e.target.value)}
                          placeholder="e.g. K12345678"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                    </div>

                    {/* Row 2: Membership No | Age Group | Birthday (Day / Month / Year) */}
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-1">
                        <label className="text-sm text-gray-600 block mb-[10px]">Membership No.</label>
                        <input
                          type="text"
                          value={p.membershipNo}
                          onChange={e => updatePassenger(idx, 'membershipNo', e.target.value)}
                          placeholder="MEM-XXXX"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-gray-600 block mb-[10px]">Age Group</label>
                        <select
                          value={p.ageGroup}
                          onChange={e => updatePassenger(idx, 'ageGroup', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        >
                          <option value="">Select age group</option>
                          <option value="Adult (13+ years)">Adult (13+ years)</option>
                          <option value="Child (2-12 years)">Child (2-12 years)</option>
                          <option value="Infant (0-2 years)">Infant (0-2 years)</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="text-sm text-gray-600 block mb-[10px]">Birthday</label>
                        <div className="grid grid-cols-3 gap-2">
                          <select
                            value={p.birthdayDay}
                            onChange={e => updatePassenger(idx, 'birthdayDay', e.target.value)}
                            className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                          >
                            <option value="">Day</option>
                            {Array.from({ length: 31 }, (_, d) => String(d + 1).padStart(2, '0')).map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          <select
                            value={p.birthdayMonth}
                            onChange={e => updatePassenger(idx, 'birthdayMonth', e.target.value)}
                            className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                          >
                            <option value="">Month</option>
                            {MONTHS.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={p.birthdayYear}
                            onChange={e => updatePassenger(idx, 'birthdayYear', e.target.value)}
                            placeholder="Year"
                            min={1900}
                            max={new Date().getFullYear()}
                            className="w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Food Allergies — full width */}
                    <div>
                      <label className="text-sm text-gray-600 mb-[10px] flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-red-400" />
                        Food Allergies
                      </label>
                      <input
                        type="text"
                        value={p.foodAllergies}
                        onChange={e => updatePassenger(idx, 'foodAllergies', e.target.value)}
                        placeholder="e.g. Shellfish, Peanuts, Dairy — leave blank if none"
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-200 ${p.foodAllergies ? 'border-red-300 bg-red-50' : ''}`}
                      />
                      {p.foodAllergies && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Allergy noted — please inform kitchen & F&B staff
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Save button */}
            <div className="pt-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => toast.success('Passenger details saved successfully!')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Passenger Details
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 11. Non-Flying Guest Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-500">Non-Flying Guest Details</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {nonFlyingGuests.length} guest{nonFlyingGuests.length !== 1 ? 's' : ''} —
              {nonFlyingPS > 0 && ` ${nonFlyingPS} from Premiere Suite`}
              {nonFlyingPS > 0 && nonFlyingLD > 0 && ','}
              {nonFlyingLD > 0 && ` ${nonFlyingLD} from Lounge Deluxe`}
            </p>
          </div>
          {nonFlyingGuests.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
              <Ticket className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-800">
                {remainingVouchers} / {customerTotalVouchers} voucher{customerTotalVouchers !== 1 ? 's' : ''} remaining
              </span>
            </div>
          )}
        </div>

        {nonFlyingGuests.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
            <p className="text-sm">Assign Non-Flying Guests in the Booking Details section above to fill in guest details.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {nonFlyingGuests.map((g, idx) => {
              const isPS = idx < nonFlyingPS;
              const role = getNFGRole(idx);
              const voucherOn = nonFlyingVoucherUsed[idx] ?? false;
              const eligible = isVoucherEligibleRole(role);
              const isSpouseNFG = role === 'Spouse';

              const cardBorder = isSpouseNFG
                ? 'border-rose-300 ring-1 ring-rose-100'
                : 'border-gray-200';

              return (
                <div key={idx} className={`border rounded-lg overflow-hidden ${cardBorder}`}>
                  {/* Guest header */}
                  <div className={`flex items-center gap-3 px-4 py-2 ${
                    isSpouseNFG ? 'bg-rose-50 border-b border-rose-200' :
                    isPS ? 'bg-purple-50 border-b border-purple-100' : 'bg-blue-50 border-b border-blue-100'
                  }`}>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPS ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {isPS ? 'Premiere Suite' : 'Lounge Deluxe'}
                    </span>
                    {isSpouseNFG && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-xs font-bold">
                        <Heart className="w-3 h-3" /> Spouse
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      Non-Flying Guest {idx + 1}
                      {g.firstName && g.lastName ? ` — ${g.firstName} ${g.lastName}` : ''}
                    </span>
                    {/* Voucher toggle for spouse */}
                    {eligible && (
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-gray-500">Use Voucher</span>
                        <button
                          type="button"
                          onClick={() => toggleNFGVoucher(idx)}
                          disabled={!voucherOn && remainingVouchers === 0}
                          title={!voucherOn && remainingVouchers === 0 ? 'No vouchers remaining' : voucherOn ? 'Remove voucher' : 'Apply voucher (covers HK$1,200 entry)'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            voucherOn
                              ? 'bg-amber-500'
                              : remainingVouchers === 0
                              ? 'bg-gray-200 cursor-not-allowed'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${voucherOn ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        {voucherOn && (
                          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                            <Ticket className="w-3 h-3 inline mr-0.5" />Entry Free
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      {/* Title */}
                      <div>
                        <label className="text-sm text-gray-600 block mb-[10px]">Title</label>
                        <select
                          value={g.title}
                          onChange={e => updateNonFlyingGuest(idx, 'title', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        >
                          <option value="">—</option>
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Miss">Miss</option>
                        </select>
                      </div>
                      {/* First Name */}
                      <div>
                        <label className="text-sm text-gray-600 block mb-[10px]">First Name</label>
                        <input
                          type="text"
                          value={g.firstName}
                          onChange={e => updateNonFlyingGuest(idx, 'firstName', e.target.value)}
                          placeholder="First name"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                      {/* Last Name */}
                      <div>
                        <label className="text-sm text-gray-600 block mb-[10px]">Last Name</label>
                        <input
                          type="text"
                          value={g.lastName}
                          onChange={e => updateNonFlyingGuest(idx, 'lastName', e.target.value)}
                          placeholder="Last name"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                      {/* Age Group */}
                      <div>
                        <label className="text-sm text-gray-600 block mb-[10px]">Age Group</label>
                        <select
                          value={g.ageGroup}
                          onChange={e => updateNonFlyingGuest(idx, 'ageGroup', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        >
                          <option value="">Select age group</option>
                          <option value="Adult (13+ years)">Adult (13+ years)</option>
                          <option value="Child (2-12 years)">Child (2-12 years)</option>
                          <option value="Infant (0-2 years)">Infant (0-2 years)</option>
                        </select>
                      </div>
                    </div>
                    {/* Food Allergies */}
                    <div>
                      <label className="text-sm text-gray-600 mb-[10px] flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-red-400" />
                        Food Allergies
                      </label>
                      <input
                        type="text"
                        value={g.foodAllergies}
                        onChange={e => updateNonFlyingGuest(idx, 'foodAllergies', e.target.value)}
                        placeholder="e.g. Peanuts, Shellfish — leave blank if none"
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-200 ${g.foodAllergies ? 'border-red-300 bg-red-50' : ''}`}
                      />
                      {g.foodAllergies && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Allergy noted — please inform kitchen & F&B staff
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Save button */}
            <div className="pt-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => toast.success('Non-flying guest details saved successfully!')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Guest Details
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Pricing Information — Agency Discount Breakdown */}
      {booking.agencyDiscountRate && booking.originalAmountValue && booking.finalAmountValue ? (
        <Card className="p-6 border-green-200 bg-green-50/40">
          <div className="flex items-center gap-2 mb-4">
            <BadgePercent className="w-5 h-5 text-green-700" />
            <h3 className="text-sm uppercase tracking-wide text-green-800">Agency Discount Applied</h3>
          </div>

          {/* Agency Info Banner */}
          <div className="flex items-center gap-3 bg-white border border-green-200 rounded-lg px-4 py-3 mb-5">
            <Building2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{booking.agencyName}</p>
              <p className="text-xs text-gray-500">{booking.agencyCode} · Default Discount Rate: <span className="text-green-700 font-medium">{booking.agencyDiscountRate}%</span></p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
              <BadgePercent className="w-3.5 h-3.5" />
              {booking.agencyDiscountRate}% OFF
            </span>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white border border-green-100 rounded-lg divide-y divide-gray-100">
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-gray-600">Base Service Amount</span>
              <span className="text-sm font-medium text-gray-800">HK${booking.originalAmountValue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3 bg-green-50/60">
              <div className="flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">Agency Discount ({booking.agencyDiscountRate}%)</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Auto-applied</span>
              </div>
              <span className="text-sm font-medium text-green-700">
                − HK${(booking.originalAmountValue - booking.finalAmountValue).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-4 bg-green-50">
              <span className="font-semibold text-gray-900">Total Payable</span>
              <div className="text-right">
                <p className="text-xs text-gray-400 line-through">HK${booking.originalAmountValue.toLocaleString()}</p>
                <p className="text-xl font-semibold text-green-700">HK${booking.finalAmountValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700">
              Discount automatically applied based on <strong>{booking.agencyName}</strong>'s contracted rate. 
              Total savings: <strong>HK${(booking.originalAmountValue - booking.finalAmountValue).toLocaleString()}</strong>
            </p>
          </div>
        </Card>
      ) : null}

      {/* 12. Service Items */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-wide text-gray-500">Service Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* SECTION 1: Suite & Lounge */}
              <tr className="bg-blue-50">
                <td colSpan={5} className="px-4 py-2">
                  <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Suite & Lounge</p>
                </td>
              </tr>
              
              {/* Lounge Access — Head Count Entry Fee */}
              <tr>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{booking.suite} — Entry Fee (Head Count)</p>
                    <p className="text-xs text-gray-500">
                      HK${headCountRate.toLocaleString()} per person ·{' '}
                      {totalVouchersApplied > 0
                        ? `${totalVouchersApplied} voucher${totalVouchersApplied > 1 ? 's' : ''} applied (${vipPS + vipLD + nonFlyingPS + nonFlyingLD} pax total)`
                        : `${vipPS + vipLD + nonFlyingPS + nonFlyingLD} pax`}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="text-sm text-gray-700">{vipPS + vipLD + nonFlyingPS + nonFlyingLD || booking.numberOfGuests || 1}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-700">HK${headCountRate.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {totalVouchersApplied > 0 ? (
                    <span className="text-amber-600 text-xs font-medium">{totalVouchersApplied} voucher{totalVouchersApplied > 1 ? 's' : ''}</span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  HK${(headCountTotal - voucherTotal).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td colSpan={5} className="px-4 py-2 bg-gray-50">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600">Remarks by Staff:</label>
                    <textarea 
                      className="w-full px-3 py-2 border rounded text-sm resize-none"
                      rows={2}
                      defaultValue={''}
                    />
                  </div>
                </td>
              </tr>

              {/* SECTION 2: Additional Services */}
              <>
                  <tr className="bg-purple-50">
                    <td colSpan={5} className="px-4 py-2">
                      <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Additional Services</p>
                    </td>
                  </tr>

                  {/* Food & Beverage — always complimentary */}
                  {true && (
                <>
                  <tr>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <Utensils className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Food & Beverage Package</p>
                          <p className="text-xs text-gray-500">Premium Selection — all food & drinks complimentary</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{booking.numberOfGuests}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-green-600 font-medium">HK$0</span>
                    </td>
                    <td className="px-4 py-3 text-right">—</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">Complimentary</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-2 bg-gray-50">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Remarks by Staff:</label>
                        <textarea 
                          className="w-full px-3 py-2 border rounded text-sm resize-none"
                          rows={2}
                          defaultValue="Food & beverage complimentary — dietary restrictions noted"
                        />
                      </div>
                    </td>
                  </tr>
                </>
              )}

              {/* Limousine Service */}
              {booking.hasLimousine && (
                <>
                  <tr>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="font-medium">Limousine Transfer Service</p>
                          <p className="text-xs text-gray-500">Airport Transfer</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="number" 
                        defaultValue={1} 
                        className="w-20 px-2 py-1 border rounded text-center"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input 
                        type="text" 
                        defaultValue="800.00"
                        className="w-32 px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">—</td>
                    <td className="px-4 py-3 text-right font-medium">HK$800</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-2 bg-gray-50">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Remarks by Staff:</label>
                        <textarea 
                          className="w-full px-3 py-2 border rounded text-sm resize-none"
                          rows={2}
                          defaultValue="Pickup at Terminal 1"
                        />
                      </div>
                    </td>
                  </tr>
                </>
              )}

              {/* Shopping Service */}
              {booking.hasShopping && (
                <>
                  <tr>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium">In-lounge Shopping Service</p>
                          <p className="text-xs text-gray-500">Personal Shopping Assistant</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="number" 
                        defaultValue={1} 
                        className="w-20 px-2 py-1 border rounded text-center"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input 
                        type="text" 
                        defaultValue="500.00"
                        className="w-32 px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">—</td>
                    <td className="px-4 py-3 text-right font-medium">HK$500</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-2 bg-gray-50">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Remarks by Staff:</label>
                        <textarea 
                          className="w-full px-3 py-2 border rounded text-sm resize-none"
                          rows={2}
                          defaultValue="Complimentary gift wrapping"
                        />
                      </div>
                    </td>
                  </tr>
                </>
              )}

              {/* Spa Service */}
              {false && (
                <>
                  <tr>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">Express Spa Treatment</p>
                        <p className="text-xs text-gray-500">30-minute massage</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="number" 
                        defaultValue={1} 
                        className="w-20 px-2 py-1 border rounded text-center"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input 
                        type="text" 
                        defaultValue="600.00"
                        className="w-32 px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">15%</td>
                    <td className="px-4 py-3 text-right font-medium">HK$510</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-2 bg-gray-50">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Remarks by Staff:</label>
                        <textarea 
                          className="w-full px-3 py-2 border rounded text-sm resize-none"
                          rows={2}
                          defaultValue="Member promotional rate"
                        />
                      </div>
                    </td>
                  </tr>
                </>
              )}

              {false && (
                <>
                  <tr>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">Private Meeting Room</p>
                        <p className="text-xs text-gray-500">2-hour booking</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="number" 
                        defaultValue={1} 
                        className="w-20 px-2 py-1 border rounded text-center"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input 
                        type="text" 
                        defaultValue="1200.00"
                        className="w-32 px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">—</td>
                    <td className="px-4 py-3 text-right font-medium">HK$1,200</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-2 bg-gray-50">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">Remarks by Staff:</label>
                        <textarea 
                          className="w-full px-3 py-2 border rounded text-sm resize-none"
                          rows={2}
                          defaultValue="AV equipment included"
                        />
                      </div>
                    </td>
                  </tr>
                </>
              )}
              </>

              {/* ADD NEW ITEM SECTION */}
              <tr className="bg-green-50">
                <td colSpan={5} className="px-4 py-2">
                  <p className="text-xs font-semibold text-green-900 uppercase tracking-wide">Add New Item</p>
                </td>
              </tr>

              {/* Step 1 — Service search */}
              <tr className="bg-green-50/30">
                <td colSpan={5} className="px-4 pt-3 pb-2">
                  <p className="text-xs text-gray-500 mb-2">Search and select an add-on service:</p>
                  <div className="relative">
                    {/* Search input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Type to search services, e.g. Limousine, Fast Track, Shower…"
                        value={addonSearch}
                        onChange={e => { setAddonSearch(e.target.value); setShowAddonDropdown(true); }}
                        onFocus={() => setShowAddonDropdown(true)}
                        onBlur={() => setTimeout(() => setShowAddonDropdown(false), 150)}
                        className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {addonSearch && (
                        <button
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { setAddonSearch(''); setShowAddonDropdown(false); setSelectedAddon(null); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Selected badge */}
                    {selectedAddon && !showAddonDropdown && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-300 rounded-md text-sm text-green-800">
                        {addonServices.find(s => s.key === selectedAddon)?.icon}
                        <span>{selectedAddon}</span>
                        <button
                          type="button"
                          onClick={() => { setSelectedAddon(null); setAddonSearch(''); }}
                          className="ml-1 text-green-500 hover:text-green-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Dropdown results */}
                    {showAddonDropdown && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                        {(() => {
                          const q = addonSearch.trim().toLowerCase();
                          const results = q
                            ? addonServices.filter(s =>
                                s.key.toLowerCase().includes(q) ||
                                s.desc.toLowerCase().includes(q)
                              )
                            : addonServices;
                          if (results.length === 0) {
                            return (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No services found for "<span className="font-medium">{addonSearch}</span>"
                              </div>
                            );
                          }
                          return results.map(({ key, icon, desc, defaultPrice }) => (
                            <button
                              key={key}
                              type="button"
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => handleSelectAddon(key, defaultPrice)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-green-50 border-b border-gray-100 last:border-0 transition-colors ${
                                selectedAddon === key ? 'bg-green-50' : ''
                              }`}
                            >
                              <span className={`p-1.5 rounded-md shrink-0 ${selectedAddon === key ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{key}</p>
                                <p className="text-xs text-gray-500">{desc}</p>
                              </div>
                              <span className="text-xs text-gray-500 shrink-0">
                                {parseFloat(defaultPrice) === 0 ? 'Complimentary' : `HK$${parseFloat(defaultPrice).toLocaleString()}`}
                              </span>
                              {selectedAddon === key && <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />}
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </td>
              </tr>

              {/* Step 2 — Qty / Price / Discount / Add button (only when a service is selected) */}
              {selectedAddon && (
                <tr className="bg-green-50/20 border-t border-green-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-100 text-green-800 text-sm">
                        {addonServices.find(s => s.key === selectedAddon)?.icon}
                        {selectedAddon}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={addonQty}
                      onChange={e => setAddonQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-2 py-1 border rounded text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-auto [&::-webkit-inner-spin-button]:appearance-auto"
                      min="1"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs text-gray-400">HK$</span>
                      <input
                        type="text"
                        value={addonUnitPrice}
                        onChange={e => setAddonUnitPrice(e.target.value)}
                        className="w-28 px-2 py-1 border rounded text-right"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="text"
                        value={addonDiscount}
                        onChange={e => setAddonDiscount(e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-right"
                      />
                      <span className="text-xs text-gray-400">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleAddItem}
                    >
                      Add Item
                    </Button>
                  </td>
                </tr>
              )}

              {/* Step 2.5 — Service-specific extra fields */}
              {selectedAddon === 'Limousine Service' && (
                <tr className="bg-blue-50/40 border-t border-blue-100">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-blue-800">Destinations / Pick-up Points</p>
                    </div>
                    <div className="space-y-2">
                      {limoStops.map((stop, idx) => (
                        <div key={stop.id} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <select
                            value={stop.type}
                            onChange={e => updateLimoStop(stop.id, 'type', e.target.value)}
                            className="px-2 py-1.5 border rounded text-sm bg-white w-36 shrink-0"
                          >
                            <option value="Pick-up">Pick-up</option>
                            <option value="Destination">Destination</option>
                          </select>
                          <input
                            type="text"
                            value={stop.location}
                            onChange={e => updateLimoStop(stop.id, 'location', e.target.value)}
                            placeholder={stop.type === 'Pick-up' ? 'e.g. Terminal 1, Arrival Hall' : 'e.g. Four Seasons Hotel, HK'}
                            className="flex-1 px-3 py-1.5 border rounded text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeLimoStop(stop.id)}
                            disabled={limoStops.length === 1}
                            className="p-1.5 rounded border text-gray-400 hover:text-red-500 hover:border-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addLimoStop}
                      className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add another stop
                    </button>
                  </td>
                </tr>
              )}

              {selectedAddon === 'Wheelchair Assistance' && (
                <tr className="bg-orange-50/40 border-t border-orange-100">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-orange-600" />
                      <p className="text-xs text-orange-800">Passenger Requiring Assistance</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={wheelchairPassenger}
                        onChange={e => setWheelchairPassenger(e.target.value)}
                        placeholder="Enter full name of passenger..."
                        className="w-80 px-3 py-1.5 border rounded text-sm"
                      />
                      <p className="text-xs text-gray-400">As shown on travel document</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Step 3 — Remarks */}
              <tr className="bg-green-50/20">
                <td colSpan={5} className="px-4 pb-3 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600 mb-[10px]">Remarks by Staff:</label>
                    <textarea
                      value={addonRemarks}
                      onChange={e => setAddonRemarks(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm resize-none"
                      rows={2}
                      placeholder="Enter remarks for this new item..."
                    />
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot className="border-t-2">
              {/* Head Count Entry Fee row */}
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-600">
                  Entry Fee ({vipPS + vipLD + nonFlyingPS + nonFlyingLD || booking.numberOfGuests || 1} pax × HK${headCountRate.toLocaleString()}):
                </td>
                <td className="px-4 py-2 text-right text-sm font-medium text-gray-800" colSpan={2}>
                  HK${headCountTotal.toLocaleString()}
                </td>
              </tr>
              {/* Food note — always free */}
              <tr className="bg-green-50">
                <td colSpan={3} className="px-4 py-2 text-right text-sm text-green-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5" />
                    Food & Beverage (incl. pre-order):
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-sm font-medium text-green-600" colSpan={2}>
                  Complimentary
                </td>
              </tr>
              {/* Service subtotal row */}
              {serviceSubtotal > 0 && (
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-600">Additional Services Subtotal:</td>
                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-800" colSpan={2}>
                    HK${Math.round(serviceSubtotal).toLocaleString()}
                  </td>
                </tr>
              )}
              {/* Voucher rows — per-guest toggles */}
              {totalVouchersApplied > 0 && (
                <>
                  <tr className="bg-amber-50">
                    <td colSpan={3} className="px-4 py-2 text-right">
                      <span className="inline-flex items-center gap-1.5 text-sm text-amber-700">
                        <Ticket className="w-3.5 h-3.5" />
                        Entry Vouchers Applied ({totalVouchersApplied} × HK${voucherUnitValue.toLocaleString()} — Account Owner &amp; Spouse):
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-amber-700" colSpan={2}>
                      − HK${voucherTotal.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-amber-50">
                    <td colSpan={5} className="px-4 pb-2">
                      <div className="flex gap-2 justify-end flex-wrap">
                        {/* Passenger vouchers */}
                        {passengerVoucherUsed.map((used, i) =>
                          used ? (
                            <span key={`pv-${i}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs">
                              <Ticket className="w-3 h-3" />
                              {getPassengerRole(i) === 'Account Owner' ? 'Owner' : 'Spouse'} — VIP Pax {i + 1}
                            </span>
                          ) : null
                        )}
                        {/* Non-flying guest vouchers */}
                        {nonFlyingVoucherUsed.map((used, i) =>
                          used ? (
                            <span key={`nv-${i}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs">
                              <Ticket className="w-3 h-3" />
                              Spouse — Non-Flying Guest {i + 1}
                            </span>
                          ) : null
                        )}
                      </div>
                    </td>
                  </tr>
                </>
              )}
              {/* Remaining vouchers note */}
              <tr className="bg-amber-50/40">
                <td colSpan={5} className="px-4 py-1.5 text-right">
                  <span className="text-xs text-amber-600">
                    Customer has {customerTotalVouchers} voucher{customerTotalVouchers !== 1 ? 's' : ''} in account · {totalVouchersApplied} used this booking · {remainingVouchers} remaining
                  </span>
                </td>
              </tr>
              {/* Total */}
              <tr className="bg-gray-100">
                <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                  {totalVouchersApplied > 0 ? 'Amount Payable (after entry vouchers):' : 'Total Amount:'}
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-600 text-base">
                  HK${amountDueAfterVouchers.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* 13. Promotion / Redemption Code */}
      <Card className="p-6">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Promotion / Redemption Code</h3>

        {/* Applied badge */}
        {promoApplied && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200">
            <BadgePercent className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-800">
                <span className="font-mono font-semibold tracking-wider">{promoApplied.code}</span>
                <span className="mx-2 text-green-400">·</span>
                <span>{promoApplied.label}</span>
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Discount applied: <span className="font-semibold">{promoApplied.benefit} off</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="p-1.5 rounded-full hover:bg-green-100 text-green-500 hover:text-green-700 transition-colors"
              title="Remove code"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input row */}
        {!promoApplied && (
          <div className="space-y-2">
            <label className="text-sm text-gray-600 block mb-[10px]">
              <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Enter Promo / Redemption Code</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={e => { setPromoInput(e.target.value); setPromoError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                placeholder="e.g. SUMMER2024"
                className={`w-72 px-3 py-2 border rounded text-sm font-mono tracking-wider uppercase ${promoError ? 'border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2 rounded bg-[#0f2942] hover:bg-[#1a3a5c] text-white text-sm transition-colors"
              >
                Apply
              </button>
            </div>
            {promoError && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {promoError}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Valid codes: SUMMER2024 · VIP20 · WELCOME · TRAVEL10 · REDEEM50 · DIAMOND15
            </p>
          </div>
        )}
      </Card>

      {/* 15. Pricing Information */}
      <Card className="p-6">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Pricing Information</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-600">Total</label>
            {/*
             * If staff has set a final amount, show that.
             * Otherwise compute an estimated total from head-count + services
             * so the user sees a number, not a placeholder. The amount is only
             * committed to the API after Review & Set Price.
             */}
            <p className="text-lg font-semibold text-gray-900">
              {booking.amount
                ? booking.amount
                : `HK$${Math.round(headCountTotal + serviceSubtotal).toLocaleString()}`}
            </p>
            {!booking.amount && (
              <p className="text-xs text-amber-600 mt-1">Estimated (not yet priced)</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600">Payment</label>
            <p className="text-lg font-semibold text-blue-600">
              {booking.paymentStatus === 'Paid'
                ? booking.amount || `HK$${Math.round(headCountTotal + serviceSubtotal).toLocaleString()}`
                : booking.paymentStatus === 'Refunded'
                ? booking.amount || `HK$${Math.round(headCountTotal + serviceSubtotal).toLocaleString()}`
                : 'HK$0'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Balance</label>
            <p className="text-lg font-semibold text-red-600">
              {booking.paymentStatus === 'Paid' || booking.paymentStatus === 'Refunded'
                ? 'HK$0'
                : booking.amount || `HK$${Math.round(headCountTotal + serviceSubtotal).toLocaleString()}`}
            </p>
          </div>
        </div>
      </Card>

      {/* 16. Status Management */}
      <Card className="p-6">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Status Management</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Booking Status</label>
            <select className="w-full px-3 py-2 border rounded" defaultValue={booking.status}>
              <option value="Pending for Review">Pending for Review</option>
              <option value="Pending for Approval">Pending for Approval</option>
              <option value="Approved">Approved</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-show">No-show</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Payment Status</label>
            <select className="w-full px-3 py-2 border rounded" defaultValue={booking.paymentStatus}>
              <option value="Not Required">Not Required</option>
              <option value="Pending">Pending</option>
              <option value="Payment Link Sent">Payment Link Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600 mb-2 block">Status Update Reason / Notes</label>
            <textarea 
              className="w-full px-3 py-2 border rounded resize-none" 
              rows={3}
              placeholder="Enter reason for status change or additional notes..."
              defaultValue={booking.rejectionReason || ''}
            />
          </div>
          <div className="col-span-2">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => toast.success('Booking status updated successfully!')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoice Dialog */}
      <BookingInvoiceDialog
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        booking={booking}
        bookingId={bookingId}
        voucherCount={voucherCount}
        voucherTotal={voucherTotal}
        voucherUnitValue={voucherUnitValue}
        headCountRate={headCountRate}
        headCountTotal={headCountTotal}
        serviceSubtotal={serviceSubtotal}
        amountDueAfterVouchers={amountDueAfterVouchers}
        getStatusColor={getStatusColor}
        getPaymentStatusColor={getPaymentStatusColor}
      />

      {/* [Legacy invoice content removed — now handled by BookingInvoiceDialog above] */}

      {/* ── Delete VIP Passenger Dialog ─────────────────────────────────── */}
      {deleteDialog && (() => {
        const { section, newValue, removeCount, candidates, selected } = deleteDialog;
        const sectionLabel = section === 'PS' ? 'Premiere Suite' : 'Lounge Deluxe';
        const currentCount = section === 'PS' ? vipPS : vipLD;
        const selectionReady = selected.size === removeCount;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setDeleteDialog(null)}
            />
            {/* Panel */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
              {/* Header */}
              <div className="bg-red-600 px-6 py-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-white text-base">Remove VIP Passengers</h2>
                  <p className="text-red-100 text-xs mt-0.5">
                    Reducing <span className="font-semibold">{sectionLabel}</span> VIP Passengers
                    from <span className="font-semibold">{currentCount}</span> to{' '}
                    <span className="font-semibold">{newValue}</span>
                  </p>
                </div>
              </div>

              {/* Instruction bar */}
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between">
                <p className="text-xs text-amber-800">
                  Select exactly <span className="font-semibold">{removeCount}</span> passenger{removeCount > 1 ? 's' : ''} to remove.
                  The remaining passenger information will be preserved.
                </p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-3 flex-shrink-0 transition-colors ${
                  selectionReady ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {selected.size} / {removeCount} selected
                </span>
              </div>

              {/* Candidate list */}
              <div className="px-6 py-4 space-y-2 max-h-72 overflow-y-auto">
                {candidates.map(({ globalIdx, label, subtitle }) => {
                  const checked = selected.has(globalIdx);
                  const disabled = !checked && selected.size >= removeCount;
                  return (
                    <label
                      key={globalIdx}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-red-50 border-red-300'
                          : disabled
                          ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => !disabled && toggleDeleteSelection(globalIdx)}
                        className="mt-0.5 accent-red-600"
                      />
                      <div className="min-w-0">
                        <p className={`text-sm ${checked ? 'text-red-800 line-through' : 'text-gray-800'}`}>
                          {label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
                      </div>
                      {checked && (
                        <span className="ml-auto flex-shrink-0 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Will be removed
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteDialog(null)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePassengers}
                  disabled={!selectionReady}
                  className={`px-5 py-2 text-sm rounded-lg text-white transition-colors ${
                    selectionReady
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Remove {removeCount} Passenger{removeCount > 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ────────────────────────────────────────────────────────────────── */}

      {/* ── Refund Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="max-w-xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              Process Refund — {booking.bookingNo}
            </DialogTitle>
            <DialogDescription>
              Enter the refund amount and reason below. The refund will not exceed the amount the customer paid (HK${amountDueAfterVouchers.toLocaleString()}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Booking summary reference */}
            <div className="grid grid-cols-2 gap-3">
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-0.5">Guest</p>
                <p className="text-sm font-medium text-gray-800">{booking.guestName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{booking.accountNo}</p>
              </div>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-0.5">Booking Reference</p>
                <p className="text-sm font-medium text-gray-800 font-mono">{booking.bookingNo}</p>
                <p className="text-xs text-gray-400 mt-0.5">Payment: {booking.paymentMode}</p>
              </div>
            </div>

            {/* Maximum refund amount — prominent display */}
            <div className="px-4 py-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-1">Maximum Refundable Amount</p>
                  <p className="text-2xl font-bold text-purple-700">HK${amountDueAfterVouchers.toLocaleString()}</p>
                  <p className="text-xs text-purple-500 mt-1">
                    We will not refund more than the customer paid
                    {voucherCount > 0 ? ` (after ${voucherCount} voucher${voucherCount > 1 ? 's' : ''} deducted)` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => setRefundAmount(String(amountDueAfterVouchers))}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs hover:bg-purple-700 transition-colors font-medium"
                  >
                    Fill Max
                  </button>
                  <p className="text-xs text-purple-400 mt-1">Full refund</p>
                </div>
              </div>
              {/* Breakdown */}
              <div className="mt-3 pt-3 border-t border-purple-200 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                <div>
                  <span className="text-purple-400">Head Count Total: </span>
                  <span className="text-purple-700 font-medium">HK${headCountTotal.toLocaleString()}</span>
                </div>
                {serviceSubtotal > 0 && (
                  <div>
                    <span className="text-purple-400">Services: </span>
                    <span className="text-purple-700 font-medium">+ HK${serviceSubtotal.toLocaleString()}</span>
                  </div>
                )}
                {voucherCount > 0 && (
                  <div>
                    <span className="text-purple-400">Voucher Deduction: </span>
                    <span className="text-purple-700 font-medium">− HK${voucherTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Vouchers non-refundable note */}
            {voucherCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Ticket className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">
                  This booking used <strong>{voucherCount} voucher{voucherCount > 1 ? 's' : ''}</strong> (HK${voucherTotal.toLocaleString()} value). Vouchers are non-refundable and are excluded from the maximum refundable amount above.
                </p>
              </div>
            )}

            {/* Refund Amount */}
            <div>
              <label className="text-sm text-gray-700 font-medium block mb-[10px]">
                Refund Amount (HKD) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-l-md text-sm text-gray-600">HK$</span>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max={amountDueAfterVouchers}
                  step="0.01"
                  className={`flex-1 px-3 py-2 border rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    refundAmount && parseFloat(refundAmount) > amountDueAfterVouchers
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
              </div>
              {refundAmount && parseFloat(refundAmount) > 0 && (
                parseFloat(refundAmount) > amountDueAfterVouchers ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Exceeds the maximum refundable amount of HK${amountDueAfterVouchers.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Refund: <strong className="text-purple-700">HK${parseFloat(refundAmount).toLocaleString('en', { minimumFractionDigits: 2 })}</strong>
                    {amountDueAfterVouchers > 0 && (
                      <span className="text-gray-400 ml-1">
                        ({Math.round((parseFloat(refundAmount) / amountDueAfterVouchers) * 100)}% of maximum)
                      </span>
                    )}
                  </p>
                )
              )}
            </div>

            {/* Refund Reason */}
            <div>
              <label className="text-sm text-gray-700 font-medium block mb-[10px]">Reason for Refund</label>
              <textarea
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                placeholder="Enter the reason for this refund (e.g. service issue, guest complaint, cancellation)..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 px-3 py-2.5 bg-purple-50 border border-purple-100 rounded-lg">
              <AlertCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <p className="text-xs text-purple-700">
                After confirmation, this refund case will be logged in <strong>Refund Reports</strong> and a notification will be sent to the Finance team for processing.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={handleProcessRefund}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Confirm Refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* ─────────────────────────────────────────────────────────────────── */}

      {/* ── Edit Booking Dialog ──────────────────────────────────────────── */}
      <BookingEditDialog
        open={isEditBookingOpen}
        onClose={() => setIsEditBookingOpen(false)}
        booking={booking}
        onSave={onSaveEdit}
        isSaving={isSavingEdit}
      />
      {false && false && <div>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-600" />
              Edit Booking — {booking.bookingNo}
            </DialogTitle>
            <DialogDescription>
              Update the booking details below. Changes will be saved after clicking "Save Changes".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-1">

            {/* Section 1: Flight Details */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" /> Flight Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Flight Type</label>
                  <select value={editFlightType} onChange={e => setEditFlightType(e.target.value as 'Arrival' | 'Departure' | 'Transition')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                    <option value="Arrival">Arrival</option>
                    <option value="Departure">Departure</option>
                    <option value="Transition">Transition</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Flight Number <span className="text-red-500">*</span></label>
                  <input type="text" value={editFlightNo} onChange={e => setEditFlightNo(e.target.value.toUpperCase())} placeholder="e.g. CX880" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm uppercase" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Flight Time</label>
                  <input type="time" value={editFlightTime} onChange={e => setEditFlightTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Flight Class</label>
                  <select value={editFlightClass} onChange={e => setEditFlightClass(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                    <option value="">— Select —</option>
                    <option value="Economy Class">Economy Class</option>
                    <option value="Business Class">Business Class</option>
                    <option value="First Class">First Class</option>
                  </select>
                </div>
                {editFlightType === 'Departure' ? (
                  <div>
                    <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Destination (IATA)</label>
                    <input type="text" value={editFlightDest} onChange={e => setEditFlightDest(e.target.value.toUpperCase())} placeholder="e.g. LHR" maxLength={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm uppercase" />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Origin (IATA)</label>
                    <input type="text" value={editFlightOrigin} onChange={e => setEditFlightOrigin(e.target.value.toUpperCase())} placeholder="e.g. NRT" maxLength={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm uppercase" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>No. of Luggage</label>
                  <input type="number" value={editNumLuggage} min={0} onChange={e => setEditNumLuggage(Math.max(0, parseInt(e.target.value) || 0))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            </div>

            {/* Section 2: Lounge Details */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Lounge Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Suite / Area <span className="text-red-500">*</span></label>
                  <select value={editSuite} onChange={e => setEditSuite(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                    {['VIP Suite A', 'VIP Suite B', 'Executive Suite', 'Business Suite', 'Premier Suite', 'Open Lounge'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Visit Date <span className="text-red-500">*</span></label>
                  <input type="date" value={editVisitDate} onChange={e => setEditVisitDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Visit Time</label>
                  <input type="time" value={editVisitTime} onChange={e => setEditVisitTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>No. of VIP Guests</label>
                  <input type="number" value={editNumGuests} min={1} onChange={e => setEditNumGuests(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>No. of Non-Flying Guests</label>
                  <input type="number" value={editNonFlying} min={0} onChange={e => setEditNonFlying(Math.max(0, parseInt(e.target.value) || 0))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            </div>

            {/* Section 3: Add-on Services */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Add-on Services
              </h4>

              {/* Selected chips */}
              {editSelectedServices.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {editSelectedServices.map(svc => {
                    const meta = addonServices.find(s => s.key === svc);
                    return (
                      <div key={svc} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-800">
                        <span className="text-blue-500 [&>svg]:w-3.5 [&>svg]:h-3.5 shrink-0">{meta?.icon}</span>
                        <span>{svc}</span>
                        <button type="button" onClick={() => setEditSelectedServices(prev => prev.filter(s => s !== svc))} className="ml-0.5 text-blue-400 hover:text-blue-700">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search services to add, e.g. Limousine, Fast Track, Shower…"
                    value={editAddonSearch}
                    onChange={e => { setEditAddonSearch(e.target.value); setShowEditAddonDropdown(true); }}
                    onFocus={() => setShowEditAddonDropdown(true)}
                    onBlur={() => setTimeout(() => setShowEditAddonDropdown(false), 150)}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {editAddonSearch && (
                    <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => { setEditAddonSearch(''); setShowEditAddonDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showEditAddonDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-30 max-h-64 overflow-y-auto">
                    {(() => {
                      const q = editAddonSearch.trim().toLowerCase();
                      const results = q
                        ? addonServices.filter(s => s.key.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
                        : addonServices;
                      if (results.length === 0) return (
                        <div className="px-4 py-3 text-sm text-gray-500">No services found for "<span className="font-medium">{editAddonSearch}</span>"</div>
                      );
                      return results.map(({ key, icon, desc, defaultPrice }) => {
                        const selected = editSelectedServices.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => handleEditToggleService(key)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors ${selected ? 'bg-blue-50/60' : ''}`}
                          >
                            <span className={`p-1.5 rounded-md shrink-0 ${selected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{key}</p>
                              <p className="text-xs text-gray-500">{desc}</p>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">
                              {parseFloat(defaultPrice) === 0 ? 'Complimentary' : `HK$${parseFloat(defaultPrice).toLocaleString()}`}
                            </span>
                            {selected
                              ? <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                              : <Plus className="w-4 h-4 text-gray-300 shrink-0" />
                            }
                          </button>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {editSelectedServices.length === 0
                  ? 'No add-on services selected. Search above to add services.'
                  : `${editSelectedServices.length} service${editSelectedServices.length !== 1 ? 's' : ''} selected. Click a chip above to remove.`
                }
              </p>

              {/* Limousine stops */}
              {editSelectedServices.includes('Limousine Service') && (
                <div className="mt-3 p-3 rounded-lg border border-purple-200 bg-purple-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-purple-800 font-medium">Limousine Service — Pick-up &amp; Drop-off Stops</p>
                  </div>
                  <div className="space-y-2">
                    {editLimoStops.map((stop, idx) => (
                      <div key={stop.id} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center shrink-0">{idx + 1}</span>
                        <select value={stop.type} onChange={e => updateEditLimoStop(stop.id, 'type', e.target.value)} className="px-2 py-1.5 border rounded text-sm bg-white w-36 shrink-0">
                          <option value="Pick-up">Pick-up</option>
                          <option value="Destination">Destination</option>
                        </select>
                        <input type="text" value={stop.location} onChange={e => updateEditLimoStop(stop.id, 'location', e.target.value)} placeholder={stop.type === 'Pick-up' ? 'e.g. Terminal 1, Arrival Hall' : 'e.g. Four Seasons Hotel, HK'} className="flex-1 px-3 py-1.5 border rounded text-sm" />
                        <button type="button" onClick={() => removeEditLimoStop(stop.id)} disabled={editLimoStops.length === 1} className="p-1.5 rounded border text-gray-400 hover:text-red-500 hover:border-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addEditLimoStop} className="mt-2 gap-1 text-purple-700 border-purple-300 hover:bg-purple-50">
                    <Plus className="w-3.5 h-3.5" /> Add Stop
                  </Button>
                </div>
              )}

              {/* Wheelchair passenger */}
              {editSelectedServices.includes('Wheelchair Assistance') && (
                <div className="mt-3 p-3 rounded-lg border border-blue-200 bg-blue-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Accessibility className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-800 font-medium">Wheelchair Assistance — Passenger Details</p>
                  </div>
                  <input type="text" placeholder="Name of passenger requiring wheelchair assistance" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              )}
            </div>

            {/* Section 4: Special Requests */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Special Requests &amp; Notes
              </h4>
              <textarea
                value={editSpecialReqs}
                onChange={e => setEditSpecialReqs(e.target.value)}
                placeholder="e.g. Birthday celebration, Kosher meal required, Allergy to nuts…"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

      </div>}

      {/* ── Movement Log Dialog ─────────────────────────────────────────── */}
      <BookingMovementLog
        open={isMovementLogOpen}
        onClose={() => setIsMovementLogOpen(false)}
        booking={booking}
      />
      {false && <Dialog open={false} onOpenChange={setIsMovementLogOpen}>
        <DialogContent className="max-w-[96vw] w-[96vw] min-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Movement Log — {booking.bookingNo}
            </DialogTitle>
            <DialogDescription>
              Full movement details for this booking. Booking reference fields are pre-filled from the booking record.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between mt-2 mb-3">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <p>{bookingMovements.length} record{bookingMovements.length !== 1 ? 's' : ''}</p>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-blue-100 border border-blue-200"></span> Booking ref columns</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-teal-100 border border-teal-200"></span> Time columns</span>
            </div>
            <Button size="sm" onClick={() => setIsAddMovementOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Movement
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="text-xs border-collapse" style={{ minWidth: '3200px' }}>
              <thead>
                <tr className="bg-[#0f2942] text-white">
                  <th className="px-3 py-2.5 text-left whitespace-nowrap sticky left-0 z-20 bg-[#0f2942] border-r border-white/20 min-w-[60px]">Gp No.</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[130px]">Movement IC</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[130px]">CIC &amp; Support</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px]">Driver</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[170px] bg-[#163a5e]">Order No.</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px] bg-[#163a5e]">Dept Date</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px] bg-[#163a5e]">Arr Date</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[90px] bg-[#163a5e]">Flt No.</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[90px] bg-[#163a5e]">Flt Time</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Dest / Origin</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[120px]">Lobby / Suite</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[60px]">Pax</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[70px]">Title</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px]">First Name</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px]">Last Name</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[75px]">C/I Bag.</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[140px]">Remarks</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px]">Nationality</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Non-fly Arr.</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Met VIP at Gate</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Back to HKIAL</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Bag. Retr. Start</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Bag. Retr. End</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Bag. Arr. HKIAL</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Left HKIAL</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Process Time</th>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[140px]">Admin Remarks</th>
                  <th className="px-3 py-2.5 text-center whitespace-nowrap sticky right-0 z-20 bg-[#0f2942] border-l border-white/20 min-w-[60px]">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {bookingMovements.length === 0 ? (
                  <tr>
                    <td colSpan={28} className="px-6 py-10 text-center text-gray-400 text-sm">
                      No movement records yet. Click "Add Movement" to create the first entry.
                    </td>
                  </tr>
                ) : bookingMovements.map((m, idx) => {
                  const cell = 'px-3 py-2.5 whitespace-nowrap align-middle';
                  const dash = <span className="text-gray-300">—</span>;
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60';
                  return (
                    <tr key={m.id} className={`${rowBg} hover:bg-blue-50/40 transition-colors`}>
                      <td className={`${cell} sticky left-0 z-10 ${rowBg} border-r border-gray-200 text-center`}>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0f2942]/10 text-[#0f2942]">{m.id}</span>
                      </td>
                      <td className={cell}>{m.movementInCharge || dash}</td>
                      <td className={cell}>{m.cicSupport || dash}</td>
                      <td className={cell}>{m.driver || dash}</td>
                      <td className={`${cell} bg-blue-50/30`}>
                        <span className="font-mono text-[11px] text-blue-800">{m.orderNo}</span>
                      </td>
                      <td className={`${cell} bg-blue-50/30`}>{m.deptDate || dash}</td>
                      <td className={`${cell} bg-blue-50/30`}>{m.arrDate || dash}</td>
                      <td className={`${cell} bg-blue-50/30 font-medium`}>{m.flightNo}</td>
                      <td className={`${cell} bg-blue-50/30`}>{m.flightTime}</td>
                      <td className={`${cell} bg-blue-50/30`}>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">{m.destinationOrigin}</span>
                      </td>
                      <td className={cell}>{m.lobbySuite || dash}</td>
                      <td className={`${cell} text-center`}>{m.noOfPax ?? dash}</td>
                      <td className={cell}>{m.title || dash}</td>
                      <td className={cell}>{m.firstName || dash}</td>
                      <td className={cell}>{m.lastName || dash}</td>
                      <td className={`${cell} text-center`}>{m.noOfCIBaggage ?? dash}</td>
                      <td className={`${cell} max-w-[140px]`}>
                        <span className="block truncate" title={m.remarks}>{m.remarks || dash}</span>
                      </td>
                      <td className={cell}>{m.nationality || dash}</td>
                      <td className={`${cell} bg-teal-50/30`}>{m.arrTimeNonFlyingGuests || dash}</td>
                      <td className={`${cell} bg-teal-50/30`}>{m.timeMetVIPAtGate || dash}</td>
                      <td className={`${cell} bg-teal-50/30`}>{m.timeBackToHKIAL || dash}</td>
                      <td className={`${cell} bg-teal-50/30`}>{m.baggageRetrievalStart || dash}</td>
                      <td className={`${cell} bg-teal-50/30`}>{m.baggageRetrievalEnd || dash}</td>
                      <td className={`${cell} bg-teal-50/30`}>{m.baggageArrivalAtHKIAL || dash}</td>
                      <td className={`${cell} bg-teal-50/30`}>{m.timeLeftHKIAL || dash}</td>
                      <td className={`${cell} bg-teal-50/30`}>
                        {m.totalProcessingTime
                          ? <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px]">{m.totalProcessingTime}</span>
                          : dash}
                      </td>
                      <td className={`${cell} max-w-[140px]`}>
                        <span className="block truncate text-orange-700" title={m.remarksAdminIssue}>{m.remarksAdminIssue || dash}</span>
                      </td>
                      <td className={`${cell} text-center sticky right-0 z-10 ${rowBg} border-l border-gray-200`}>
                        <Button variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setBookingMovements(prev => prev.filter(x => x.id !== m.id)); toast.success('Movement record deleted.'); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>}

      {/* ── Add Movement Sub-Dialog (now inside BookingMovementLog) ──────────── */}
      {false && <Dialog open={false} onOpenChange={setIsMovementLogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Add Movement Record
            </DialogTitle>
            <DialogDescription>
              Fields marked * are required. Booking reference fields are pre-filled from the booking — edit if needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-1">

            {/* Section A: Assignment */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b">Assignment</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Movement In Charge</label>
                  <input type="text" placeholder="Staff name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>CIC &amp; Support</label>
                  <input type="text" placeholder="Staff name(s)" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Driver</label>
                  <input type="text" placeholder="Driver name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
            </div>

            {/* Section B: Booking Reference — pre-filled from booking */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b">
                Booking Reference
                <span className="ml-2 normal-case text-blue-500">(pre-filled from booking)</span>
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 md:col-span-1">
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Order No. (Booking No.) <span className="text-red-500">*</span></label>
                  <input type="text" defaultValue={booking.bookingNo} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono bg-blue-50" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Dept Date</label>
                  <input type="date" defaultValue={booking.flightType === 'Departure' ? booking.arrivalDate : ''} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-blue-50" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Arr Date</label>
                  <input type="date" defaultValue={booking.flightType === 'Arrival' ? booking.arrivalDate : ''} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-blue-50" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Flight No. <span className="text-red-500">*</span></label>
                  <input type="text" defaultValue={booking.flightNo} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm uppercase bg-blue-50" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Flight Time <span className="text-red-500">*</span></label>
                  <input type="time" defaultValue={booking.flightTime} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-blue-50" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Destination / Origin <span className="text-red-500">*</span></label>
                  <input type="text" defaultValue={booking.flightOrigin || booking.flightDestination || ''} placeholder="IATA code, e.g. LHR" maxLength={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm uppercase bg-blue-50" />
                </div>
              </div>
            </div>

            {/* Section C: Lounge & Guest Details */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b">Lounge &amp; Guest Details</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Lobby / Suite</label>
                  <input type="text" defaultValue={booking.suite} placeholder="e.g. VIP Suite A" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>No. of Pax</label>
                  <input type="number" min={1} defaultValue={booking.numberOfGuests} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>No. of C/I Baggage</label>
                  <input type="number" min={0} defaultValue={booking.numberOfLuggage} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Title</label>
                  <input type="text" placeholder="Mr. / Mrs. / Ms." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>First Name</label>
                  <input type="text" placeholder="First name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Last Name</label>
                  <input type="text" placeholder="Last name" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Nationality of Guests</label>
                  <input type="text" placeholder="e.g. United Kingdom" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Remarks</label>
                  <textarea rows={2} placeholder="General remarks for this movement..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
                </div>
              </div>
            </div>

            {/* Section D: Movement Times */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b">Movement Times</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Arrival Time of Non-Flying Guests at HKIAL</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Time Met VIP at Gate / VIP Arrive at HKIAL</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Time Back to HKIAL</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Baggage Retrieval (Start Time)</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Baggage Retrieval (End Time)</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Baggage Arrival at HKIAL</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Time Left HKIAL / At Boarding Gate</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Total Processing Time</label>
                  <input type="text" placeholder="e.g. 1h 30m" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Remarks for Admin Issue</label>
                  <textarea rows={2} placeholder="Admin issue details..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsAddMovementOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Movement record added successfully.');
              setIsAddMovementOpen(false);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Movement
            </Button>
          </div>
        </DialogContent>
      </Dialog>}

      {/* ── Guests Searcher Dialog ─────────────────────────────────────── */}
      <BookingGuestsSearcher
        open={isCustomerSearchOpen}
        onClose={() => setIsCustomerSearchOpen(false)}
        searchQuery={customerSearchQuery}
        setSearchQuery={setCustomerSearchQuery}
      />
      {false && <Dialog open={false} onOpenChange={setIsCustomerSearchOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Guests Searcher
            </DialogTitle>
            <DialogDescription>
              Search all past guests who have visited the HKIA VIP Lounge — VIP passengers and non-flying guests.
            </DialogDescription>
          </DialogHeader>

          {/* Search bar */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, booking no., or food allergy…"
              value={customerSearchQuery}
              onChange={e => setCustomerSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {customerSearchQuery && (
              <button onClick={() => setCustomerSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Summary chips */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-200 rounded-full text-gray-500">
              <Users className="w-3 h-3" />
              {HISTORICAL_GUESTS.length} total guests
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700">
              <Plane className="w-3 h-3" />
              {HISTORICAL_GUESTS.filter(g => g.type === 'VIP Passenger').length} VIP Passengers
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700">
              <User className="w-3 h-3" />
              {HISTORICAL_GUESTS.filter(g => g.type === 'Non-Flying Guest').length} Non-Flying Guests
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-full text-red-600">
              <Utensils className="w-3 h-3" />
              {HISTORICAL_GUESTS.filter(g => g.foodAllergies).length} with allergies
            </span>
          </div>

          {/* Guest list */}
          <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
            {(() => {
              const q = customerSearchQuery.trim().toLowerCase();
              const results = q
                ? HISTORICAL_GUESTS.filter(g =>
                    g.name.toLowerCase().includes(q) ||
                    g.bookingNo.toLowerCase().includes(q) ||
                    g.foodAllergies.toLowerCase().includes(q) ||
                    g.ageGroup.toLowerCase().includes(q)
                  )
                : HISTORICAL_GUESTS;

              if (results.length === 0) return (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No guests found matching "<span className="font-medium">{customerSearchQuery}</span>"
                </div>
              );

              return results.map(g => {
                const isVip = g.type === 'VIP Passenger';
                return (
                  <div
                    key={g.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg ${
                      isVip ? 'border-purple-100 bg-purple-50/40' : 'border-blue-100 bg-blue-50/40'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isVip ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {isVip
                        ? <Plane className="w-4 h-4 text-purple-600" />
                        : <User className="w-4 h-4 text-blue-600" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Name + type badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{g.name}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          isVip ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {g.type}
                        </span>
                        {g.totalVisits >= 10 && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                            Frequent Guest
                          </span>
                        )}
                      </div>

                      {/* Meta row */}
                      <p className="text-xs text-gray-400">
                        Last visit: <span className="text-gray-600">{g.lastVisit}</span>
                        <span className="mx-1.5 text-gray-300">·</span>
                        Booking: <span className="font-mono text-gray-600">{g.bookingNo}</span>
                        <span className="mx-1.5 text-gray-300">·</span>
                        {g.totalVisits} visit{g.totalVisits !== 1 ? 's' : ''}
                      </p>

                      {/* Food allergies — always shown */}
                      <div className={`inline-flex items-center gap-1.5 text-xs rounded px-2 py-1 ${
                        g.foodAllergies
                          ? 'bg-red-50 border border-red-200 text-red-700'
                          : 'bg-gray-50 border border-gray-200 text-gray-400'
                      }`}>
                        <Utensils className="w-3 h-3 shrink-0" />
                        {g.foodAllergies
                          ? <span><span className="font-medium">Allergies:</span> {g.foodAllergies}</span>
                          : <span>No food allergies recorded</span>}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </DialogContent>
      </Dialog>}

      {/* ── Customer Profile Dialog ──────────────────────────────────────── */}
      <BookingCustomerProfile
        open={isCustomerProfileOpen}
        onClose={() => setIsCustomerProfileOpen(false)}
        customer={selectedCustomer}
      />
      {false && <Dialog open={false} onOpenChange={setIsCustomerProfileOpen}>
        <DialogContent className="min-w-[800px] max-w-[960px] h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogTitle className="sr-only">Customer Profile</DialogTitle>
          <DialogDescription className="sr-only">Full customer profile including spouse, VIP profile, preferences, food allergies, movement log and remarks.</DialogDescription>

          {selectedCustomer && (() => {
            const today = new Date().toISOString().split('T')[0];
            const isMember = selectedCustomer.type === 'Individual' && !!selectedCustomer.membershipExpiry && selectedCustomer.membershipExpiry >= today;
            const typeBadgeColor: Record<string, string> = { 'Individual': 'bg-blue-100 text-blue-800', 'Corporate': 'bg-purple-100 text-purple-800', 'Agency': 'bg-orange-100 text-orange-800' };

            // ── Mock detailed data ──────────────────────────────────────────
            const isIndividual = selectedCustomer.type === 'Individual';
            const spouse = isIndividual ? {
              title: 'Mrs.', firstName: 'Amanda', lastName: selectedCustomer.name.split(' ').pop() ?? 'Smith',
              email: `amanda.${selectedCustomer.name.split(' ')[0]?.toLowerCase()}@email.com`,
              phone: '+852 9876 2222', nationality: 'United Kingdom', passportFirst4: 'UK78', linkedAccountNo: '',
            } : null;
            const vipProfile = {
              appearance: { ethnicity: 'Caucasian', age: '45-50', height: '178cm', hairColor: 'Brown', glasses: 'No' },
              workInfo: { industry: 'Finance', company: selectedCustomer.company ?? 'Global Investment Bank', position: 'Managing Director', previousWork: 'Senior VP, Tech Corp' },
              observations: { handedness: 'Right-handed', preferredLanguage: 'English', interests: 'Golf, Wine Tasting, Classical Music' },
            };
            const preferences = [
              { id: 1, category: 'Seating',      preference: 'Prefers window-side suite with natural lighting', recordedDate: '2024-10-15', recordedBy: 'Staff A' },
              { id: 2, category: 'Service',       preference: 'Likes to be greeted by first name',               recordedDate: '2024-09-20', recordedBy: 'Staff B' },
              { id: 3, category: 'Beverage',      preference: 'Prefers Dom Pérignon Champagne when available',   recordedDate: '2024-08-10', recordedBy: 'Staff C' },
              { id: 4, category: 'Temperature',   preference: 'Suite temperature at 22°C',                       recordedDate: '2024-07-05', recordedBy: 'Staff A' },
            ];
            const allergies = [
              { id: 1, allergen: 'Shellfish',  severity: 'Severe',   notes: 'Anaphylactic reaction. EpiPen required.', recordedDate: '2024-01-15' },
              { id: 2, allergen: 'Peanuts',    severity: 'Moderate', notes: 'Avoid all peanut products.',             recordedDate: '2024-01-15' },
            ];
            const spouseAllergies = isIndividual ? [
              { id: 101, allergen: 'Tree Nuts', severity: 'Mild', notes: 'Mild sensitivity — avoid walnuts and cashews.', recordedDate: '2024-06-10' },
            ] : [];
            const dietary = [
              { id: 1, requirement: 'Low Sodium',             notes: 'Doctor-recommended due to hypertension', recordedDate: '2024-02-20' },
              { id: 2, requirement: 'Prefers Organic Options', notes: 'When available',                         recordedDate: '2024-03-10' },
            ];
            const spouseDietary = isIndividual ? [
              { id: 101, requirement: 'Vegan', notes: 'Strictly no animal products including dairy & eggs.', recordedDate: '2024-06-10' },
            ] : [];
            const movements = [
              {
                id: 1,
                movementInCharge: 'Emily Chen', cicSupport: 'Tom Ng', driver: 'Peter Chan',
                orderNo: 'A-20241025-000012', arrDate: '2024-10-25',
                flightNo: 'CX880', flightTime: '14:30', destinationOrigin: 'LHR',
                lobbySuite: 'VIP Suite A', noOfPax: 2, title: 'Mr.', firstName: 'John', lastName: 'Smith',
                noOfCIBaggage: 3, remarks: 'VIP escort provided', nationality: 'United Kingdom',
                timeMetVIPAtGate: '14:15', baggageRetrievalStart: '15:10', baggageRetrievalEnd: '15:25',
                baggageArrivalAtHKIAL: '15:30', timeLeftHKIAL: '16:00', totalProcessingTime: '1h 45m',
              },
              {
                id: 2,
                movementInCharge: 'David Wong', cicSupport: 'Amy Lau', driver: 'Henry Yip',
                orderNo: 'D-20241018-000008', deptDate: '2024-10-18',
                flightNo: 'BA028', flightTime: '09:15', destinationOrigin: 'LHR',
                lobbySuite: 'Executive Suite', noOfPax: 1, title: 'Mr.', firstName: 'John', lastName: 'Smith',
                noOfCIBaggage: 2, nationality: 'United Kingdom',
                timeMetVIPAtGate: '08:30', timeLeftHKIAL: '09:00', totalProcessingTime: '30m',
              },
              {
                id: 3,
                movementInCharge: 'Sarah Lee',
                orderNo: 'A-20241005-000005', arrDate: '2024-10-05',
                flightNo: 'CX100', flightTime: '16:00', destinationOrigin: 'JFK',
                lobbySuite: 'VIP Suite B', noOfPax: 3, title: 'Mr.', firstName: 'John', lastName: 'Smith',
                nationality: 'United Kingdom', timeMetVIPAtGate: '15:45',
                baggageRetrievalStart: '16:30', baggageRetrievalEnd: '16:50',
                timeLeftHKIAL: '17:10', totalProcessingTime: '1h 25m',
                remarksAdminIssue: 'Late departure due to flight delay',
              },
            ];
            const remarks = [
              { id: 1, remark: 'High-value client. Provide exceptional service at all times.',         category: 'VIP Note',       createdDate: '2024-01-15', createdBy: 'Manager' },
              { id: 2, remark: 'Frequently travels with family. Inquire about family suite.',          category: 'Service Note',   createdDate: '2024-02-10', createdBy: 'Staff A' },
              { id: 3, remark: 'Requested limousine service for all future bookings.',                 category: 'Special Request',createdDate: '2024-05-20', createdBy: 'Staff B' },
            ];

            const severityColor = (s: string) => ({ Mild: 'bg-yellow-100 text-yellow-700', Moderate: 'bg-orange-100 text-orange-700', Severe: 'bg-red-100 text-red-700 border border-red-300' }[s] ?? 'bg-gray-100 text-gray-700');
            const remarkCategoryColor = (c: string) => ({ 'VIP Note': 'bg-orange-100 text-orange-700', 'Service Note': 'bg-green-100 text-green-700', 'Special Request': 'bg-purple-100 text-purple-700', 'General': 'bg-blue-100 text-blue-700' }[c] ?? 'bg-gray-100 text-gray-700');
            const prefCategoryColor = (c: string) => ({ 'Seating': 'bg-blue-100 text-blue-700', 'Service': 'bg-purple-100 text-purple-700', 'Beverage': 'bg-amber-100 text-amber-700', 'Temperature': 'bg-cyan-100 text-cyan-700', 'Food': 'bg-green-100 text-green-700' }[c] ?? 'bg-gray-100 text-gray-700');

            const tierIcon = (t?: string) => {
              if (t === 'Sapphire') return <Gem     className="w-4 h-4 text-indigo-500" />;
              if (t === 'Diamond')  return <Gem     className="w-4 h-4 text-sky-500" />;
              if (t === 'Platinum') return <Trophy  className="w-4 h-4 text-purple-500" />;
              if (t === 'Gold')     return <Star    className="w-4 h-4 text-amber-500" />;
              return <User className="w-4 h-4 text-gray-400" />;
            };

            return (
              <>
                {/* ── Sticky header ── */}
                <div className="flex items-center gap-4 px-6 py-4 bg-[#0f2942] shrink-0">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white leading-tight truncate">{selectedCustomer.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${typeBadgeColor[selectedCustomer.type] ?? 'bg-gray-100 text-gray-800'}`}>{selectedCustomer.type}</span>
                      {isMember && selectedCustomer.membershipType && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800">
                          {tierIcon(selectedCustomer.membershipType)}{selectedCustomer.membershipType}
                        </span>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${selectedCustomer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{selectedCustomer.status}</span>
                      <span className="text-white/60 text-xs">{selectedCustomer.accountNo}</span>
                    </div>
                  </div>
                  <button onClick={() => setIsCustomerProfileOpen(false)} className="text-white/70 hover:text-white transition-colors shrink-0 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* ── Tabs ── */}
                <Tabs value={profileTab} onValueChange={setProfileTab} className="flex flex-col flex-1 overflow-hidden">
                  <div className="border-b bg-white shrink-0 px-2 overflow-x-auto">
                    <TabsList className="h-auto bg-transparent p-0 gap-0 flex flex-nowrap min-w-max">
                      {[
                        { value: 'overview',   label: 'Overview',      icon: <User className="w-3.5 h-3.5" /> },
                        ...(isIndividual ? [{ value: 'spouse', label: 'Spouse', icon: <Heart className="w-3.5 h-3.5" /> }] : []),
                        { value: 'vip',        label: 'VIP Profile',   icon: <Eye className="w-3.5 h-3.5" /> },
                        { value: 'prefs',      label: 'Preferences',   icon: <Star className="w-3.5 h-3.5" /> },
                        { value: 'allergies',  label: 'Food Allergies',icon: <AlertCircle className="w-3.5 h-3.5" /> },
                        { value: 'movements',  label: 'Movements',     icon: <History className="w-3.5 h-3.5" /> },
                        { value: 'remarks',    label: 'Remarks',       icon: <MessageSquare className="w-3.5 h-3.5" /> },
                      ].map(t => (
                        <TabsTrigger key={t.value} value={t.value}
                          className="flex items-center gap-1.5 px-3 py-3 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-[#0f2942] data-[state=active]:text-[#0f2942] data-[state=active]:bg-transparent text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
                        >
                          {t.icon}{t.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto">

                    {/* ── Overview ─────────────────────────────────────── */}
                    <TabsContent value="overview" className="m-0 p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Account Number',  value: selectedCustomer.accountNo },
                          { label: 'Account Type',    value: selectedCustomer.type },
                          { label: 'Email',           value: selectedCustomer.email },
                          { label: 'Phone',           value: selectedCustomer.phone },
                          { label: 'Member Since',    value: selectedCustomer.createdDate },
                          { label: 'Total Bookings',  value: `${selectedCustomer.totalBookings}` },
                          ...(selectedCustomer.company ? [{ label: 'Company', value: selectedCustomer.company }] : []),
                          { label: 'Status',          value: selectedCustomer.status },
                        ].map(row => (
                          <div key={row.label} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">{row.label}</p>
                            <p className="text-sm mt-0.5 break-words">{row.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Membership card – Individual only */}
                      {isIndividual && selectedCustomer.membershipType && (
                        <div className={`p-4 rounded-lg border ${isMember ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Membership Package</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {tierIcon(selectedCustomer.membershipType)}
                              <div>
                                <p className="text-sm">{selectedCustomer.membershipType} Tier</p>
                                <p className="text-xs text-gray-500 mt-0.5">Expiry: {selectedCustomer.membershipExpiry}</p>
                              </div>
                            </div>
                            {isMember
                              ? <span className="px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-200">Active</span>
                              : <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">Expired</span>}
                          </div>
                        </div>
                      )}

                      {/* Quick allergy alert if any severe */}
                      {allergies.some(a => a.severity === 'Severe') && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-red-800">Severe allergy on record</p>
                            <p className="text-xs text-red-600 mt-0.5">{allergies.filter(a => a.severity === 'Severe').map(a => a.allergen).join(', ')} — see Food Allergies tab for details.</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* ── Spouse ───────────────────────────────────────── */}
                    {isIndividual && (
                      <TabsContent value="spouse" className="m-0 p-5">
                        {spouse ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-pink-50 border border-pink-200 rounded-xl">
                              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                <Heart className="w-6 h-6 text-pink-500" />
                              </div>
                              <div>
                                <p className="text-sm">{spouse.title} {spouse.firstName} {spouse.lastName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{spouse.email}</p>
                                <p className="text-xs text-gray-500">{spouse.phone}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: 'Full Name',         value: `${spouse.title} ${spouse.firstName} ${spouse.lastName}` },
                                { label: 'Email',             value: spouse.email },
                                { label: 'Phone',             value: spouse.phone },
                                { label: 'Nationality',       value: spouse.nationality },
                                { label: 'Passport (first 4)',value: spouse.passportFirst4 },
                                { label: 'Linked Account',    value: spouse.linkedAccountNo || '—' },
                              ].map(row => (
                                <div key={row.label} className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500">{row.label}</p>
                                  <p className="text-sm mt-0.5 break-words">{row.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-14 text-center">
                            <Heart className="w-10 h-10 text-gray-200 mb-3" />
                            <p className="text-sm text-gray-400">No spouse / partner on record.</p>
                          </div>
                        )}
                      </TabsContent>
                    )}

                    {/* ── VIP Profile ──────────────────────────────────── */}
                    <TabsContent value="vip" className="m-0 p-5 space-y-5">
                      {/* Appearance */}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />Appearance</p>
                        <div className="grid grid-cols-3 gap-3">
                          {Object.entries(vipProfile.appearance).map(([k, v]) => (
                            <div key={k} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                              <p className="text-sm mt-0.5">{v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Work Info */}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />Work Information</p>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(vipProfile.workInfo).map(([k, v]) => (
                            <div key={k} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                              <p className="text-sm mt-0.5">{v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Observations */}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Observations</p>
                        <div className="grid grid-cols-3 gap-3">
                          {Object.entries(vipProfile.observations).map(([k, v]) => (
                            <div key={k} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                              <p className="text-sm mt-0.5">{v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* ── Preferences ──────────────────────────────────── */}
                    <TabsContent value="prefs" className="m-0 p-5 space-y-3">
                      {preferences.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-10">No preferences recorded.</p>
                      ) : preferences.map(pref => (
                        <div key={pref.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${prefCategoryColor(pref.category)}`}>{pref.category}</span>
                            <span className="text-xs text-gray-400">Recorded {pref.recordedDate} by {pref.recordedBy}</span>
                          </div>
                          <p className="text-sm text-gray-800">{pref.preference}</p>
                        </div>
                      ))}
                    </TabsContent>

                    {/* ── Food Allergies ────────────────────────────────── */}
                    <TabsContent value="allergies" className="m-0 p-5 space-y-5">

                      {/* Customer allergies */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <p className="text-sm text-gray-700">{selectedCustomer.name}</p>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Customer</span>
                        </div>
                        {allergies.length === 0 ? (
                          <p className="text-sm text-gray-400 py-3 text-center border-2 border-dashed rounded-lg">No allergies recorded.</p>
                        ) : (
                          <div className="space-y-2">
                            {allergies.map(a => (
                              <div key={a.id} className={`p-3 border rounded-lg ${a.severity === 'Severe' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-200'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm">{a.allergen}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${severityColor(a.severity)}`}>{a.severity}</span>
                                </div>
                                <p className="text-xs text-gray-600">{a.notes}</p>
                                <p className="text-xs text-gray-400 mt-1">Recorded {a.recordedDate}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Dietary */}
                        {dietary.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2"><Utensils className="w-3 h-3" />Dietary Requirements</p>
                            {dietary.map(d => (
                              <div key={d.id} className="p-3 border border-gray-200 rounded-lg bg-green-50">
                                <p className="text-sm">{d.requirement}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{d.notes}</p>
                                <p className="text-xs text-gray-400 mt-1">Recorded {d.recordedDate}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Spouse allergies – Individual only */}
                      {isIndividual && spouse && (
                        <>
                          <div className="border-t border-gray-200" />
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center">
                                <Heart className="w-3.5 h-3.5 text-pink-500" />
                              </div>
                              <p className="text-sm text-gray-700">{spouse.title} {spouse.firstName} {spouse.lastName}</p>
                              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">Spouse</span>
                            </div>
                            {spouseAllergies.length === 0 ? (
                              <p className="text-sm text-gray-400 py-3 text-center border-2 border-dashed rounded-lg">No allergies recorded for spouse.</p>
                            ) : (
                              <div className="space-y-2">
                                {spouseAllergies.map(a => (
                                  <div key={a.id} className={`p-3 border rounded-lg ${a.severity === 'Severe' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-200'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm">{a.allergen}</p>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${severityColor(a.severity)}`}>{a.severity}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{a.notes}</p>
                                    <p className="text-xs text-gray-400 mt-1">Recorded {a.recordedDate}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {spouseDietary.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2"><Utensils className="w-3 h-3" />Dietary Requirements</p>
                                {spouseDietary.map(d => (
                                  <div key={d.id} className="p-3 border border-gray-200 rounded-lg bg-green-50">
                                    <p className="text-sm">{d.requirement}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{d.notes}</p>
                                    <p className="text-xs text-gray-400 mt-1">Recorded {d.recordedDate}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </TabsContent>

                    {/* ── Movement Log ─────────────────────────────────── */}
                    <TabsContent value="movements" className="m-0 p-3">
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="text-xs border-collapse" style={{ minWidth: '3200px' }}>
                          <thead>
                            <tr className="bg-[#0f2942] text-white">
                              <th className="px-3 py-2.5 text-left whitespace-nowrap sticky left-0 z-20 bg-[#0f2942] border-r border-white/20 min-w-[60px]">Gp No.</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[130px]">Movement IC</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[130px]">CIC &amp; Support</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px]">Driver</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[170px] bg-[#163a5e]">Order No.</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px] bg-[#163a5e]">Dept Date</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px] bg-[#163a5e]">Arr Date</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[90px] bg-[#163a5e]">Flt No.</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[90px] bg-[#163a5e]">Flt Time</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Dest / Origin</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[120px]">Lobby / Suite</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[60px]">Pax</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[70px]">Title</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px]">First Name</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px]">Last Name</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[75px]">C/I Bag.</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[140px]">Remarks</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px]">Nationality</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Non-fly Arr.</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Met VIP at Gate</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Back to HKIAL</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Bag. Retr. Start</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Bag. Retr. End</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Bag. Arr. HKIAL</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Left HKIAL</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Process Time</th>
                              <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[140px]">Admin Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {movements.map((m, idx) => {
                              const cell = 'px-3 py-2.5 whitespace-nowrap align-middle';
                              const dash = <span className="text-gray-300">—</span>;
                              const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60';
                              return (
                                <tr key={m.id} className={`${rowBg} hover:bg-blue-50/40 transition-colors`}>
                                  <td className={`${cell} sticky left-0 z-10 ${rowBg} border-r border-gray-200 text-center`}>
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0f2942]/10 text-[#0f2942]">{m.id}</span>
                                  </td>
                                  <td className={cell}>{m.movementInCharge || dash}</td>
                                  <td className={cell}>{m.cicSupport || dash}</td>
                                  <td className={cell}>{m.driver || dash}</td>
                                  <td className={`${cell} bg-blue-50/30`}>
                                    <span className="font-mono text-[11px] text-blue-800">{m.orderNo}</span>
                                  </td>
                                  <td className={`${cell} bg-blue-50/30`}>{m.deptDate || dash}</td>
                                  <td className={`${cell} bg-blue-50/30`}>{m.arrDate || dash}</td>
                                  <td className={`${cell} bg-blue-50/30 font-medium`}>{m.flightNo}</td>
                                  <td className={`${cell} bg-blue-50/30`}>{m.flightTime}</td>
                                  <td className={`${cell} bg-blue-50/30`}>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">{m.destinationOrigin}</span>
                                  </td>
                                  <td className={cell}>{m.lobbySuite || dash}</td>
                                  <td className={`${cell} text-center`}>{m.noOfPax ?? dash}</td>
                                  <td className={cell}>{m.title || dash}</td>
                                  <td className={cell}>{m.firstName || dash}</td>
                                  <td className={cell}>{m.lastName || dash}</td>
                                  <td className={`${cell} text-center`}>{m.noOfCIBaggage ?? dash}</td>
                                  <td className={`${cell} max-w-[140px]`}>
                                    <span className="block truncate" title={m.remarks}>{m.remarks || dash}</span>
                                  </td>
                                  <td className={cell}>{m.nationality || dash}</td>
                                  <td className={`${cell} bg-teal-50/30`}>{m.arrTimeNonFlyingGuests || dash}</td>
                                  <td className={`${cell} bg-teal-50/30`}>{m.timeMetVIPAtGate || dash}</td>
                                  <td className={`${cell} bg-teal-50/30`}>{m.timeBackToHKIAL || dash}</td>
                                  <td className={`${cell} bg-teal-50/30`}>{m.baggageRetrievalStart || dash}</td>
                                  <td className={`${cell} bg-teal-50/30`}>{m.baggageRetrievalEnd || dash}</td>
                                  <td className={`${cell} bg-teal-50/30`}>{m.baggageArrivalAtHKIAL || dash}</td>
                                  <td className={`${cell} bg-teal-50/30`}>{m.timeLeftHKIAL || dash}</td>
                                  <td className={`${cell} bg-teal-50/30`}>
                                    {m.totalProcessingTime
                                      ? <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px]">{m.totalProcessingTime}</span>
                                      : dash}
                                  </td>
                                  <td className={`${cell} max-w-[140px]`}>
                                    <span className="block truncate text-orange-700" title={m.remarksAdminIssue}>{m.remarksAdminIssue || dash}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-blue-100 border border-blue-200"></span> Booking reference columns</span>
                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-teal-100 border border-teal-200"></span> Movement time columns</span>
                      </p>
                    </TabsContent>

                    {/* ── Remarks ──────────────────────────────────────── */}
                    <TabsContent value="remarks" className="m-0 p-5 space-y-3">
                      {remarks.map(r => (
                        <div key={r.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${remarkCategoryColor(r.category)}`}>{r.category}</span>
                            <span className="text-xs text-gray-400">{r.createdDate} by {r.createdBy}</span>
                          </div>
                          <p className="text-sm text-gray-800">{r.remark}</p>
                        </div>
                      ))}
                    </TabsContent>

                  </div>
                </Tabs>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>}

    </div>
  );
}