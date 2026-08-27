import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Edit2, Save, X, Plus, Trash2, User, Mail, Phone, Building2, CreditCard, Calendar, FileText, AlertCircle, Clock, History, Utensils, Key, DollarSign, Heart, UserX, Shield, ShieldAlert, ShieldCheck, Lock, LockOpen, LogOut, RefreshCw, Smartphone, Monitor, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';

// ── MOCK constant (isolated — container replaces via props) ───────────────────
const MOCK_ACCOUNT_NUMBER = 'ACC-2024-1001';

// ── Member shape ──────────────────────────────────────────────────────────────
export interface Member {
  accountNumber: string;
  accountType: 'Individual' | 'Corporate' | 'Agency';
  status: 'Active' | 'Pending' | 'Suspended';
  name: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  internalGrouping: string;
  paymentMethod: 'Upfront' | 'Net Upfront' | 'On-Credit' | 'Bulk Purchase';
  companyCode: string;
  bulkPurchaseCode?: string;
  membershipNumber?: string;
  membershipType?: string;
  membershipExpiry?: string;
  createdDate: string;
  totalBookings: number;
  totalSpent: string;
  appearance: { ethnicity: string; age: string; height: string; hairColor: string; glasses: string; };
  workInfo: { industry: string; company: string; position: string; previousWork: string; };
  observations: { handedness: string; writingHand: string; preferredLanguage: string; interests: string; };
}

const MOCK_MEMBER: Member = {
  accountNumber: 'ACC-2024-1001',
  accountType: 'Individual',
  status: 'Active',
  name: 'Mr. John Smith',
  title: 'Mr.',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  phone: '+852 9876 5432',
  nationality: 'United Kingdom',
  passportNumber: 'UK123456789',
  internalGrouping: 'HSBC',
  paymentMethod: 'On-Credit',
  companyCode: 'CORP-2024-001',
  bulkPurchaseCode: '',
  membershipNumber: 'MEM-2024-501',
  membershipType: 'Gold',
  membershipExpiry: '2025-12-31',
  createdDate: '2024-01-15',
  totalBookings: 24,
  totalSpent: 'HK$68,500',
  appearance: { ethnicity: 'Caucasian', age: '45-50', height: '180cm', hairColor: 'Brown', glasses: 'Yes' },
  workInfo: { industry: 'Finance', company: 'Global Investment Bank', position: 'Managing Director', previousWork: 'Senior VP at Tech Corp' },
  observations: { handedness: 'Right-handed', writingHand: 'Right', preferredLanguage: 'English', interests: 'Golf, Wine Tasting, Classical Music' },
};

export interface MemberDetailProps {
  /** Account number to fetch — falls back to MOCK_ACCOUNT_NUMBER in demo mode */
  accountNumber?: string;
  /** Pass full member object from CI4; when null component uses mock internally */
  member?: Member | null;
  onBack: () => void;
  onEdit?: () => void;
  /** Called with the full updated Member when the user saves in Edit mode */
  onSave?: (member: Member) => void;
  onUpgrade?: (packageId: string) => void;
  isLoading?: boolean;

  // ── Profile data arrays (prop-driven; fall back to internal mock) ────────
  preferences?: Preference[];
  foodAllergies?: FoodAllergy[];
  dietaryRequirements?: DietaryRequirement[];
  movements?: MovementLog[];
  remarks?: Remark[];
  spouse?: Spouse | null;
  spouseFoodAllergies?: FoodAllergy[];
  spouseDietaryRequirements?: DietaryRequirement[];

  // ── Security / login data ────────────────────────────────────────────────
  isAccountLocked?: boolean;
  lockReason?: string;
  lockedAt?: string;
  twoFAEnabled?: boolean;
  activeSessions?: number;
  loginHistory?: LoginAttempt[];

  // ── Delete callbacks ─────────────────────────────────────────────────────
  onDeletePreference?: (id: number) => void;
  onDeleteAllergy?: (id: number) => void;
  onDeleteDietary?: (id: number) => void;
  onDeleteSpouseAllergy?: (id: number) => void;
  onDeleteSpouseDietary?: (id: number) => void;
  onDeleteRemark?: (id: number) => void;

  // ── Add / dialog open callbacks ──────────────────────────────────────────
  onAddPreference?: () => void;
  onAddAllergy?: () => void;
  onAddDietary?: () => void;
  onAddMovement?: () => void;
  onAddRemark?: () => void;

  // ── Dialog open/close state ──────────────────────────────────────────────
  isAddPreferenceOpen?: boolean;
  isAddAllergyOpen?: boolean;
  onOpenAllergyDialog?: () => void;
  isAddDietaryOpen?: boolean;
  isAddMovementOpen?: boolean;
  isAddRemarkOpen?: boolean;
  onCloseAddPreference?: () => void;
  onOpenPreferenceDialog?: () => void;
  onCloseAddAllergy?: () => void;
  onCloseAddDietary?: () => void;
  onOpenDietaryDialog?: () => void;
  onCloseAddMovement?: () => void;
  onOpenMovementDialog?: () => void;
  onOpenRemarkDialog?: () => void;
  onCloseAddRemark?: () => void;

  // ── Add form state & handlers ────────────────────────────────────────────
  preferenceForm?: { category: string; preference: string; };
  onPreferenceFormChange?: (form: { category: string; preference: string; }) => void;
  allergyTarget?: 'customer' | 'spouse';
  dietaryTarget?: 'customer' | 'spouse';
  allergyForm?: { allergen: string; severity: string; notes: string; };
  dietaryForm?: { requirement: string; notes: string; };
  onAllergyTargetChange?: (target: 'customer' | 'spouse') => void;
  onDietaryTargetChange?: (target: 'customer' | 'spouse') => void;
  onAllergyFormChange?: (form: { allergen: string; severity: string; notes: string; }) => void;
  onDietaryFormChange?: (form: { requirement: string; notes: string; }) => void;

  // ── Movement dialog ──────────────────────────────────────────────────────
  movementForm?: Partial<MovementLog>;
  onMovementFormChange?: (form: Partial<MovementLog>) => void;
  isMovementDialogOpen?: boolean;
  isSavingMovement?: boolean;

  // ── Spouse dialog ────────────────────────────────────────────────────────
  isSpouseDialogOpen?: boolean;
  isRemoveSpouseOpen?: boolean;
  spouseForm?: Spouse;
  onSpouseDialogOpen?: () => void;
  onSpouseDialogClose?: () => void;
  onRemoveSpouseOpen?: () => void;
  onRemoveSpouseClose?: () => void;
  onSpouseFormChange?: (form: Spouse) => void;

  // ── Security action dialog state & callbacks ─────────────────────────────
  showUnlockConfirm?: boolean;
  showResetPwConfirm?: boolean;
  showForceLogoutConfirm?: boolean;
  showReset2FAConfirm?: boolean;
  onShowUnlockConfirm?: () => void;
  onHideUnlockConfirm?: () => void;
  onShowResetPwConfirm?: () => void;
  onHideResetPwConfirm?: () => void;
  onShowForceLogoutConfirm?: () => void;
  onHideForceLogoutConfirm?: () => void;
  onShowReset2FAConfirm?: () => void;
  onHideReset2FAConfirm?: () => void;
}

export interface Preference {
  id: number;
  category: string;
  preference: string;
  recordedDate: string;
  recordedBy: string;
}

export interface FoodAllergy {
  id: number;
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  notes: string;
  recordedDate: string;
}

export interface DietaryRequirement {
  id: number;
  requirement: string;
  notes: string;
  recordedDate: string;
}

export interface MovementLog {
  id: number;                        // 1. Gp No. (auto)
  movementInCharge?: string;         // 2. Movement In Charge
  cicSupport?: string;               // 3. CIC & Support
  driver?: string;                   // 4. Driver
  orderNo: string;                   // 5. Order No. (Booking No.)
  deptDate?: string;                 // 6. Dept Date (Departure bookings)
  arrDate?: string;                  // 7. Arr Date (Arrival bookings)
  flightNo: string;                  // 8. Flight No.
  flightTime: string;                // 9. Flight Time
  destinationOrigin: string;         // 10. Destination / Origin
  lobbySuite?: string;               // 11. Lobby / Suite
  noOfPax?: number;                  // 12. No. of pax
  title?: string;                    // 13. Title
  firstName?: string;                // 14. First Name
  lastName?: string;                 // 15. Last Name
  noOfCIBaggage?: number;            // 16. No. of C/I baggage
  remarks?: string;                  // 17. Remarks
  nationality?: string;              // 18. Nationality of guests
  arrTimeNonFlyingGuests?: string;   // 19. Arrival time of non-flying guests at HKIAL
  timeMetVIPAtGate?: string;         // 20. Time met VIP at Gate / VIP arrive at HKIAL
  timeBackToHKIAL?: string;          // 21. Time back to HKIAL
  baggageRetrievalStart?: string;    // 22. Baggage Retrieval (Start Time)
  baggageRetrievalEnd?: string;      // 23. Baggage Retrieval (End Time)
  baggageArrivalAtHKIAL?: string;    // 24. Baggage Arrival at HKIAL
  timeLeftHKIAL?: string;            // 25. Time left HKIAL / at boarding gate
  totalProcessingTime?: string;      // 26. Total Processing Time
  remarksAdminIssue?: string;        // 27. Remarks for Admin issue
}

export interface Remark {
  id: number;
  remark: string;
  category: 'General' | 'Special Request' | 'Service Note' | 'VIP Note';
  createdDate: string;
  createdBy: string;
}

export interface Spouse {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportFirst4: string;
  linkedAccountNo?: string;
}

export interface LoginAttempt {
  id: number;
  datetime: string;
  ip: string;
  device: string;
  deviceType: 'desktop' | 'mobile';
  status: 'Success' | 'Failed' | 'Locked Out';
  location: string;
}

export function MemberDetail({
  accountNumber = MOCK_ACCOUNT_NUMBER,
  member: memberProp,
  onBack,
  onEdit,
  onSave,
  onUpgrade,
  isLoading = false,

  // ── Data arrays ───────────────────────────────────────────────────────────
  preferences: preferencesProp = [],
  foodAllergies: foodAllergiesProp = [],
  dietaryRequirements: dietaryRequirementsProp = [],
  movements: movementsProp = [],
  remarks: remarksProp = [],
  spouse: spouseProp,               // undefined = not passed → use mock; null = explicitly no spouse
  spouseFoodAllergies: spouseFoodAllergiesProp = [],
  spouseDietaryRequirements: spouseDietaryRequirementsProp = [],

  // ── Security ──────────────────────────────────────────────────────────────
  isAccountLocked: isAccountLockedProp,
  lockReason: lockReasonProp,
  lockedAt: lockedAtProp,
  twoFAEnabled: twoFAEnabledProp,
  activeSessions: activeSessionsProp,
  loginHistory: loginHistoryProp = [],

  // ── Delete callbacks ──────────────────────────────────────────────────────
  onDeletePreference,
  onDeleteAllergy,
  onDeleteDietary,
  onDeleteSpouseAllergy,
  onDeleteSpouseDietary,
  onDeleteRemark,

  // ── Add callbacks ─────────────────────────────────────────────────────────
  onAddPreference,
  onAddAllergy,
  onAddDietary,
  onAddMovement,
  onAddRemark,

  // ── Dialog open/close (prop-driven when container owns state) ─────────────
  isAddPreferenceOpen: isAddPreferenceOpenProp,
  isAddAllergyOpen: isAddAllergyOpenProp,
  onOpenAllergyDialog,
  isAddDietaryOpen: isAddDietaryOpenProp,
  onOpenDietaryDialog,
  isAddMovementOpen: isAddMovementOpenProp,
  isAddRemarkOpen: isAddRemarkOpenProp,
  onCloseAddPreference,
  onOpenPreferenceDialog,
  onCloseAddAllergy,
  onCloseAddDietary,
  onCloseAddMovement,
  onOpenMovementDialog,
  onOpenRemarkDialog,
  onCloseAddRemark,

  // ── Form state ────────────────────────────────────────────────────────────
  preferenceForm: preferenceFormProp,
  onPreferenceFormChange,
  allergyTarget: allergyTargetProp,
  dietaryTarget: dietaryTargetProp,
  allergyForm: allergyFormProp,
  dietaryForm: dietaryFormProp,
  onAllergyTargetChange,
  onDietaryTargetChange,
  onAllergyFormChange,
  onDietaryFormChange,

  // ── Remark form ─────────────────────────────────────────────────────────
  remarkForm: remarkFormProp,
  onRemarkFormChange,

  // ── Movement dialog ───────────────────────────────────────────────────────
  movementForm: movementFormProp,
  onMovementFormChange,
  isMovementDialogOpen: isMovementDialogOpenProp,
  isSavingMovement = false,

  // ── Spouse dialog ─────────────────────────────────────────────────────────
  isSpouseDialogOpen: isSpouseDialogOpenProp,
  isRemoveSpouseOpen: isRemoveSpouseOpenProp,
  spouseForm: spouseFormProp,
  onSpouseDialogOpen,
  onSpouseDialogClose,
  onAddSpouse,
  onRemoveSpouseOpen,
  onRemoveSpouseClose,
  onSpouseFormChange,

  // ── Security dialog state ─────────────────────────────────────────────────
  showUnlockConfirm: showUnlockConfirmProp,
  showResetPwConfirm: showResetPwConfirmProp,
  showForceLogoutConfirm: showForceLogoutConfirmProp,
  showReset2FAConfirm: showReset2FAConfirmProp,
  onShowUnlockConfirm,
  onHideUnlockConfirm,
  onShowResetPwConfirm,
  onHideResetPwConfirm,
  onShowForceLogoutConfirm,
  onHideForceLogoutConfirm,
  onShowReset2FAConfirm,
  onHideReset2FAConfirm,
}: MemberDetailProps) {
  // Use passed member or fall back to mock — single source of truth
  const memberData: Member = memberProp ?? MOCK_MEMBER;

  // ── Controlled form state (seeded from memberData) ──────────────────────────
  const [basicForm, setBasicForm] = useState({
    title: memberData.title,
    firstName: memberData.firstName,
    lastName: memberData.lastName,
    email: memberData.email,
    phone: memberData.phone,
    nationality: memberData.nationality,
    passportNumber: memberData.passportNumber,
  });
  const [accountForm, setAccountForm] = useState({
    internalGrouping: memberData.internalGrouping,
    paymentMethod: memberData.paymentMethod,
    companyCode: memberData.companyCode,
  });
  const [appearanceForm, setAppearanceForm] = useState({ ...memberData.appearance });
  const [workForm, setWorkForm] = useState({ ...memberData.workInfo });
  const [observationsForm, setObservationsForm] = useState({ ...memberData.observations });

  const [isEditing, setIsEditing] = useState(false);
  const [isAddPreferenceOpen, setIsAddPreferenceOpen] = useState(false);
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);
  const [isAddDietaryOpen, setIsAddDietaryOpen] = useState(false);
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);
  const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false);

  // ── Security mock state (demo fallback — kept as per spec) ────────────────
  const [mockIsAccountLocked, setMockIsAccountLocked] = useState(true);
  const [mockLockReason] = useState('5 consecutive failed login attempts');
  const [mockLockedAt] = useState('2026-03-05 14:23:11');
  const [mockTwoFAEnabled, setMockTwoFAEnabled] = useState(true);
  const [mockActiveSessions] = useState(2);

  // Security confirmation dialog mock state (demo fallback)
  const [mockShowUnlockConfirm, setMockShowUnlockConfirm]               = useState(false);
  const [mockShowResetPwConfirm, setMockShowResetPwConfirm]             = useState(false);
  const [mockShowForceLogoutConfirm, setMockShowForceLogoutConfirm]     = useState(false);
  const [mockShowReset2FAConfirm, setMockShowReset2FAConfirm]           = useState(false);

  // Mock login history (demo fallback — LoginAttempt type is now top-level)
  const [mockLoginHistory] = useState<LoginAttempt[]>([
    { id: 1, datetime: '2026-03-07 09:15:44', ip: '203.98.12.45',  device: 'Chrome / Windows 11',    deviceType: 'desktop', status: 'Success',    location: 'Hong Kong, HK' },
    { id: 2, datetime: '2026-03-05 14:26:02', ip: '203.98.12.45',  device: 'Chrome / Windows 11',    deviceType: 'desktop', status: 'Locked Out', location: 'Hong Kong, HK' },
    { id: 3, datetime: '2026-03-05 14:24:58', ip: '203.98.12.45',  device: 'Chrome / Windows 11',    deviceType: 'desktop', status: 'Failed',     location: 'Hong Kong, HK' },
    { id: 4, datetime: '2026-03-05 14:24:11', ip: '203.98.12.45',  device: 'Chrome / Windows 11',    deviceType: 'desktop', status: 'Failed',     location: 'Hong Kong, HK' },
    { id: 5, datetime: '2026-03-05 14:23:30', ip: '203.98.12.45',  device: 'Chrome / Windows 11',    deviceType: 'desktop', status: 'Failed',     location: 'Hong Kong, HK' },
    { id: 6, datetime: '2026-03-04 18:02:15', ip: '172.16.0.88',   device: 'Safari / iPhone 15 Pro', deviceType: 'mobile',  status: 'Success',    location: 'Hong Kong, HK' },
    { id: 7, datetime: '2026-03-03 11:45:00', ip: '172.16.0.88',   device: 'Safari / iPhone 15 Pro', deviceType: 'mobile',  status: 'Success',    location: 'Hong Kong, HK' },
    { id: 8, datetime: '2026-02-28 08:33:21', ip: '64.233.160.10', device: 'Chrome / macOS',         deviceType: 'desktop', status: 'Success',    location: 'London, UK' },
    { id: 9, datetime: '2026-02-25 20:11:07', ip: '64.233.160.10', device: 'Chrome / macOS',         deviceType: 'desktop', status: 'Failed',     location: 'London, UK' },
    { id: 10, datetime: '2026-02-20 14:55:39', ip: '172.16.0.88',  device: 'Safari / iPhone 15 Pro', deviceType: 'mobile',  status: 'Success',    location: 'Hong Kong, HK' },
  ]);

  // ── Allergy / Dietary dialog mock state (demo fallback) ────────────────
  const [mockAllergyTarget, setMockAllergyTarget] = useState<'customer' | 'spouse'>('customer');
  const [mockDietaryTarget, setMockDietaryTarget] = useState<'customer' | 'spouse'>('customer');
  const [mockAllergyForm, setMockAllergyForm] = useState({ allergen: '', severity: 'Mild', notes: '' });
  const [mockDietaryForm, setMockDietaryForm] = useState({ requirement: '', notes: '' });

  // ── Dialog open mock state (demo fallback) ──────────────────────────────
  const [mockIsAddPreferenceOpen, setMockIsAddPreferenceOpen] = useState(false);
  const [mockIsAddAllergyOpen, setMockIsAddAllergyOpen] = useState(false);
  const [mockIsAddDietaryOpen, setMockIsAddDietaryOpen] = useState(false);
  const [mockIsAddMovementOpen, setMockIsAddMovementOpen] = useState(false);
  const [mockIsAddRemarkOpen, setMockIsAddRemarkOpen] = useState(false);

  // ── Spouse mock state (demo fallback) ───────────────────────────────────
  const [mockSpouse, setMockSpouse] = useState<Spouse | null>({
    title: 'Mrs.',
    firstName: 'Amanda',
    lastName: 'Smith',
    email: 'amanda.smith@email.com',
    phone: '+852 9876 1111',
    nationality: 'United Kingdom',
    passportFirst4: 'UK78',
    linkedAccountNo: '',
  });
  const [mockIsSpouseDialogOpen, setMockIsSpouseDialogOpen] = useState(false);
  const [mockIsRemoveSpouseOpen, setMockIsRemoveSpouseOpen] = useState(false);
  const [mockSpouseForm, setMockSpouseForm] = useState<Spouse>({ title: 'Mr.', firstName: '', lastName: '', email: '', phone: '', nationality: '', passportFirst4: '', linkedAccountNo: '' });

  // memberData is defined above (prop-driven)

  // ── Mock data arrays (demo fallback — kept as per spec) ─────────────────
  // NOTE: All displayXxx = xxxProp || fallback chains removed.
  // UI should show empty state when container data is empty.

  const [mockRemarks, setMockRemarks] = useState<Remark[]>([
    { id: 1, remark: 'Customer is a high-value client. Provide exceptional service.', category: 'VIP Note', createdDate: '2024-01-15', createdBy: 'Manager' },
    { id: 2, remark: 'Frequently travels with family. Inquire about family suite availability.', category: 'Service Note', createdDate: '2024-02-10', createdBy: 'Staff A' },
    { id: 3, remark: 'Requested limousine service for all future bookings.', category: 'Special Request', createdDate: '2024-05-20', createdBy: 'Staff B' },
    { id: 4, remark: 'Celebrates birthday in November. Consider special amenities.', category: 'General', createdDate: '2024-09-15', createdBy: 'Staff C' },
  ]);

  // ── Prop-over-mock resolution — prop wins when provided ─────────────────
  // Data arrays: prefer prop when non-empty, else fall back to local mock
  // (Figma demo site has real data so this never triggers;
  //  local dev with empty API response shows empty instead of mock)
  const displayPreferences            = preferencesProp.length > 0            ? preferencesProp            : [];
  const displayFoodAllergies          = foodAllergiesProp.length > 0          ? foodAllergiesProp          : [];
  const displayDietaryRequirements    = dietaryRequirementsProp.length > 0    ? dietaryRequirementsProp    : [];
  const displayMovements              = movementsProp.length > 0              ? movementsProp              : [];
  const displayRemarks                = remarksProp.length > 0                ? remarksProp                : [];
  const displaySpouseFoodAllergies    = spouseFoodAllergiesProp.length > 0    ? spouseFoodAllergiesProp    : [];
  const displaySpouseDietaryReqs      = spouseDietaryRequirementsProp.length > 0 ? spouseDietaryRequirementsProp : [];
  const displayLoginHistory           = loginHistoryProp.length > 0           ? loginHistoryProp           : [];
  // Spouse: undefined = not passed (use mock); null = explicitly no spouse
  const displaySpouse                 = spouseProp !== undefined               ? spouseProp                : null;

  // Security: undefined = not passed → use mock state
  const activeIsAccountLocked         = isAccountLockedProp       ?? mockIsAccountLocked;
  const activeLockReason              = lockReasonProp             ?? mockLockReason;
  const activeLockedAt                = lockedAtProp               ?? mockLockedAt;
  const activeTwoFAEnabled            = twoFAEnabledProp           ?? mockTwoFAEnabled;
  const activeActiveSessions          = activeSessionsProp         ?? mockActiveSessions;

  // Dialog open state: prop wins when explicitly provided
  const activeIsAddPreferenceOpen     = isAddPreferenceOpenProp    ?? mockIsAddPreferenceOpen;
  const activeIsAddAllergyOpen        = isAddAllergyOpenProp       ?? mockIsAddAllergyOpen;
  const activeIsAddDietaryOpen        = isAddDietaryOpenProp       ?? mockIsAddDietaryOpen;
  const activeIsAddMovementOpen       = isAddMovementOpenProp      ?? mockIsAddMovementOpen;
  const activeIsAddRemarkOpen         = isAddRemarkOpenProp        ?? mockIsAddRemarkOpen;
  const activeIsSpouseDialogOpen      = isSpouseDialogOpenProp     ?? mockIsSpouseDialogOpen;
  const activeIsRemoveSpouseOpen      = isRemoveSpouseOpenProp     ?? mockIsRemoveSpouseOpen;
  const activeShowUnlockConfirm       = showUnlockConfirmProp      ?? mockShowUnlockConfirm;
  const activeShowResetPwConfirm      = showResetPwConfirmProp     ?? mockShowResetPwConfirm;
  const activeShowForceLogoutConfirm  = showForceLogoutConfirmProp ?? mockShowForceLogoutConfirm;
  const activeShowReset2FAConfirm     = showReset2FAConfirmProp    ?? mockShowReset2FAConfirm;

  // Form state
  const activeAllergyTarget           = allergyTargetProp          ?? mockAllergyTarget;
  const activeDietaryTarget           = dietaryTargetProp          ?? mockDietaryTarget;
  const activeAllergyForm             = allergyFormProp            ?? mockAllergyForm;
  const activeDietaryForm             = dietaryFormProp            ?? mockDietaryForm;
  const activeSpouseForm              = spouseFormProp             ?? mockSpouseForm;
  const activePreferenceForm          = preferenceFormProp         ?? { category: 'Seating', preference: '' };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Suspended': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'Mild': 'bg-yellow-100 text-yellow-700',
      'Moderate': 'bg-orange-100 text-orange-700',
      'Severe': 'bg-red-100 text-red-700 border border-red-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'General': 'bg-blue-100 text-blue-700',
      'Special Request': 'bg-purple-100 text-purple-700',
      'Service Note': 'bg-green-100 text-green-700',
      'VIP Note': 'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const handleSave = () => {
    const updated: Member = {
      ...memberData,
      ...basicForm,
      name: `${basicForm.title} ${basicForm.firstName} ${basicForm.lastName}`,
      paymentMethod: accountForm.paymentMethod as Member['paymentMethod'],
      internalGrouping: accountForm.internalGrouping,
      companyCode: accountForm.companyCode,
      appearance: appearanceForm,
      workInfo: workForm,
      observations: observationsForm,
    };
    onSave?.(updated);
    toast.success('Member details updated successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset all form state back to current memberData
    setBasicForm({ title: memberData.title, firstName: memberData.firstName, lastName: memberData.lastName, email: memberData.email, phone: memberData.phone, nationality: memberData.nationality, passportNumber: memberData.passportNumber });
    setAccountForm({ internalGrouping: memberData.internalGrouping, paymentMethod: memberData.paymentMethod, companyCode: memberData.companyCode });
    setAppearanceForm({ ...memberData.appearance });
    setWorkForm({ ...memberData.workInfo });
    setObservationsForm({ ...memberData.observations });
    setIsEditing(false);
  };

  const handleDeletePreference = (id: number) => {
    onDeletePreference?.(id);
    toast.success('Preference removed');
  };

  const handleDeleteAllergy = (id: number) => {
    onDeleteAllergy?.(id);
    toast.success('Allergy information removed');
  };

  const handleDeleteDietary = (id: number) => {
    onDeleteDietary?.(id);
    toast.success('Dietary requirement removed');
  };

  const handleDeleteSpouseAllergy = (id: number) => {
    onDeleteSpouseAllergy?.(id);
    toast.success('Spouse allergy information removed');
  };

  const handleDeleteSpouseDietary = (id: number) => {
    onDeleteSpouseDietary?.(id);
    toast.success('Spouse dietary requirement removed');
  };

  const handleDeleteRemark = (id: number) => {
    onDeleteRemark?.(id);
    toast.success('Remark removed');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1>Member Details</h1>
            <p className="text-gray-600">View and manage member profile information</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Member Summary Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div>
                <h2 className="text-gray-900">{memberData.name}</h2>
                <p className="text-gray-600">{memberData.accountNumber}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{memberData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{memberData.phone}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(memberData.status)}>
                  {memberData.status}
                </Badge>
                <Badge className="bg-purple-100 text-purple-700">
                  {memberData.accountType}
                </Badge>
                {memberData.accountType === 'Individual' && memberData.membershipType && (
                  <Badge className="bg-amber-100 text-amber-700">
                    {memberData.membershipType} Member
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl text-gray-900">{memberData.totalBookings}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-xl text-green-600">{memberData.totalSpent}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="allergies">Food Allergies</TabsTrigger>
          <TabsTrigger value="remarks">Remarks</TabsTrigger>
          <TabsTrigger value="movements">Movement Log</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5">
            {activeIsAccountLocked
              ? <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              : <ShieldCheck className="w-3.5 h-3.5 text-green-500" />}
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="mb-4">Basic Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label>Title</label>
                <input
                  type="text"
                  value={basicForm.title}
                  onChange={e => setBasicForm(f => ({ ...f, title: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div>
                <label>First Name</label>
                <input
                  type="text"
                  value={basicForm.firstName}
                  onChange={e => setBasicForm(f => ({ ...f, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  value={basicForm.lastName}
                  onChange={e => setBasicForm(f => ({ ...f, lastName: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={basicForm.email}
                  onChange={e => setBasicForm(f => ({ ...f, email: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div>
                <label>Phone</label>
                <input
                  type="tel"
                  value={basicForm.phone}
                  onChange={e => setBasicForm(f => ({ ...f, phone: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div>
                <label>Nationality</label>
                <input
                  type="text"
                  value={basicForm.nationality}
                  onChange={e => setBasicForm(f => ({ ...f, nationality: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              <div>
                <label>First 4 digits of Passport Number</label>
                <input
                  type="text"
                  value={basicForm.passportNumber.slice(0, 4)}
                  onChange={e => setBasicForm(f => ({ ...f, passportNumber: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
            </div>
          </Card>

          {/* Account Information */}
          <Card className="p-6">
            <h3 className="mb-4">Account Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label>Internal Grouping</label>
                <select
                  value={accountForm.internalGrouping}
                  onChange={e => setAccountForm(f => ({ ...f, internalGrouping: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                >
                  <option value="">Not set</option>
                  <optgroup label="Corporate Groups">
                    <option value="HSBC">HSBC</option>
                    <option value="Cathay Pacific">Cathay Pacific</option>
                    <option value="Standard Chartered">Standard Chartered</option>
                    <option value="Bank of China">Bank of China</option>
                    <option value="Swire Group">Swire Group</option>
                    <option value="Henderson Land">Henderson Land</option>
                    <option value="Sun Hung Kai Properties">Sun Hung Kai Properties</option>
                  </optgroup>
                  <optgroup label="Travel Agency Groups">
                    <option value="EGL Tours">EGL Tours</option>
                    <option value="Wing On Travel">Wing On Travel</option>
                    <option value="Hong Thai Travel">Hong Thai Travel</option>
                    <option value="TravelExpert">TravelExpert</option>
                    <option value="Goldjoy Travel">Goldjoy Travel</option>
                    <option value="Zuji Travel">Zuji Travel</option>
                  </optgroup>
                  <optgroup label="Individual VIP Groups">
                    <option value="Priority Club">Priority Club</option>
                    <option value="Executive Circle">Executive Circle</option>
                    <option value="Platinum Members">Platinum Members</option>
                    <option value="Diamond Elite">Diamond Elite</option>
                    <option value="President's Club">President's Club</option>
                    <option value="Chairman's Circle">Chairman's Circle</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label>Payment Method</label>
                <select
                  value={accountForm.paymentMethod}
                  onChange={e => setAccountForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                >
                  <option value="Upfront">Upfront</option>
                  <option value="Net Upfront">Net Upfront</option>
                  <option value="On-Credit">On-Credit</option>
                  <option value="Bulk Purchase">Bulk Purchase</option>
                </select>
              </div>
              <div>
                <label>Company Code</label>
                <input
                  type="text"
                  value={accountForm.companyCode}
                  onChange={e => setAccountForm(f => ({ ...f, companyCode: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                />
              </div>
              {/* Only show membership fields for Individual accounts */}
              {memberData.accountType === 'Individual' && (
                <>
                  <div>
                    <label>Membership Number</label>
                    <input
                      type="text"
                      defaultValue={memberData.membershipNumber}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label>Membership Type</label>
                    <input
                      type="text"
                      defaultValue={memberData.membershipType}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label>Membership Expiry</label>
                    <input
                      type="date"
                      defaultValue={memberData.membershipExpiry}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* ── Spouse ──────────────────────────────────────────────────── */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Spouse / Partner
              </h3>
              {displaySpouse ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onSpouseDialogOpen) { onSpouseDialogOpen(); }
                      else { setMockSpouseForm({ ...displaySpouse! }); setMockIsSpouseDialogOpen(true); }
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    Edit Spouse
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => { onRemoveSpouseOpen?.(); setMockIsRemoveSpouseOpen(true); }}
                  >
                    <UserX className="w-4 h-4 mr-1.5" />
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    if (onSpouseDialogOpen) { onSpouseDialogOpen(); }
                    else { setMockSpouseForm({ title: 'Mr.', firstName: '', lastName: '', email: '', phone: '', nationality: '', passportFirst4: '', linkedAccountNo: '' }); setMockIsSpouseDialogOpen(true); }
                  }}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Spouse
                </Button>
              )}
            </div>

            {displaySpouse ? (
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                {/* Avatar + full name row */}
                <div className="col-span-3 flex items-center gap-4 p-4 bg-pink-50 border border-pink-100 rounded-lg">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{displaySpouse.title} {displaySpouse.firstName} {displaySpouse.lastName}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {displaySpouse.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{displaySpouse.email}</span>}
                      {displaySpouse.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{displaySpouse.phone}</span>}
                    </div>
                  </div>
                  {displaySpouse.linkedAccountNo && (
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                      Linked: {displaySpouse.linkedAccountNo}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-500 block" style={{ marginBottom: '10px' }}>Title</label>
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">{displaySpouse.title}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block" style={{ marginBottom: '10px' }}>First Name</label>
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">{displaySpouse.firstName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block" style={{ marginBottom: '10px' }}>Last Name</label>
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">{displaySpouse.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block" style={{ marginBottom: '10px' }}>Email</label>
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">{displaySpouse.email || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block" style={{ marginBottom: '10px' }}>Phone</label>
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">{displaySpouse.phone || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block" style={{ marginBottom: '10px' }}>Nationality</label>
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">{displaySpouse.nationality || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block" style={{ marginBottom: '10px' }}>First 4 Digits of Passport</label>
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">{displaySpouse.passportFirst4 || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No spouse / partner on record.</p>
                <p className="text-gray-400 text-xs mt-1">Click "Add Spouse" to link one.</p>
              </div>
            )}
          </Card>

          {/* VIP Profile Information */}
          <Card className="p-6">
            <h3 className="mb-4">VIP Profile</h3>
            
            <div className="space-y-6">
              {/* Appearance */}
              <div>
                <h4 className="text-sm uppercase tracking-wide text-gray-500 mb-3">Appearance</h4>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label>Ethnicity</label>
                    <input
                      type="text"
                      value={appearanceForm.ethnicity}
                      onChange={e => setAppearanceForm(f => ({ ...f, ethnicity: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label>Age Range</label>
                    <input
                      type="text"
                      value={appearanceForm.age}
                      onChange={e => setAppearanceForm(f => ({ ...f, age: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label>Height</label>
                    <input
                      type="text"
                      value={appearanceForm.height}
                      onChange={e => setAppearanceForm(f => ({ ...f, height: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label>Hair Color</label>
                    <input
                      type="text"
                      value={appearanceForm.hairColor}
                      onChange={e => setAppearanceForm(f => ({ ...f, hairColor: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label>Glasses</label>
                    <select
                      value={appearanceForm.glasses}
                      onChange={e => setAppearanceForm(f => ({ ...f, glasses: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Sometimes">Sometimes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div>
                <h4 className="text-sm uppercase tracking-wide text-gray-500 mb-3">Work Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>Industry</label>
                    <input
                      type="text"
                      value={workForm.industry}
                      onChange={e => setWorkForm(f => ({ ...f, industry: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={workForm.company}
                      onChange={e => setWorkForm(f => ({ ...f, company: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label>Position</label>
                    <input
                      type="text"
                      value={workForm.position}
                      onChange={e => setWorkForm(f => ({ ...f, position: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label>Previous Work History</label>
                    <input
                      type="text"
                      value={workForm.previousWork}
                      onChange={e => setWorkForm(f => ({ ...f, previousWork: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Other Observations */}
              <div>
                <h4 className="text-sm uppercase tracking-wide text-gray-500 mb-3">Other Observations</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>Handedness</label>
                    <select
                      value={observationsForm.handedness}
                      onChange={e => setObservationsForm(f => ({ ...f, handedness: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    >
                      <option value="Right-handed">Right-handed</option>
                      <option value="Left-handed">Left-handed</option>
                      <option value="Ambidextrous">Ambidextrous</option>
                    </select>
                  </div>
                  <div>
                    <label>Writing Hand</label>
                    <select
                      value={observationsForm.writingHand}
                      onChange={e => setObservationsForm(f => ({ ...f, writingHand: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                    </select>
                  </div>
                  <div>
                    <label>Preferred Language</label>
                    <select
                      value={observationsForm.preferredLanguage}
                      onChange={e => setObservationsForm(f => ({ ...f, preferredLanguage: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    >
                      <option value="English">English</option>
                      <option value="Traditional Chinese">Traditional Chinese</option>
                      <option value="Simplified Chinese">Simplified Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                    </select>
                  </div>
                  <div>
                    <label>Interest Topics</label>
                    <input
                      type="text"
                      value={observationsForm.interests}
                      onChange={e => setObservationsForm(f => ({ ...f, interests: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="e.g., Golf, Wine, Art"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Customer Preferences</h3>
              <Button onClick={() => { onOpenPreferenceDialog?.(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Preference
              </Button>
            </div>
            <div className="space-y-3">
              {displayPreferences.map((pref, idx) => (
                <div key={`pref-${pref.id ?? idx}-${pref.recordedDate ?? ''}`} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-700">{pref.category}</Badge>
                        <span className="text-xs text-gray-500">
                          Recorded on {pref.recordedDate} by {pref.recordedBy}
                        </span>
                      </div>
                      <p className="text-gray-900">{pref.preference}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePreference(pref.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Food Allergies Tab */}
        <TabsContent value="allergies" className="space-y-4">

          {/* ── Food Allergies Card ─────────────────────────────────── */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3>Food Allergies</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">Critical information for food service</p>

            {/* Customer sub-section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">{memberData.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Customer</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onAllergyTargetChange?.('customer');
                    onAllergyFormChange?.({ allergen: '', severity: 'Mild', notes: '' });
                    onOpenAllergyDialog?.();
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Allergy
                </Button>
              </div>
              {displayFoodAllergies.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">No allergies recorded.</div>
              ) : (
                <div className="space-y-3">
                  {displayFoodAllergies.map((allergy, idx) => (
                    <div key={`allergy-${allergy.id ?? idx}-${allergy.recordedDate ?? ''}`} className={`p-4 border rounded-lg ${allergy.severity === 'Severe' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-gray-900">{allergy.allergen}</h4>
                            <Badge className={getSeverityColor(allergy.severity)}>{allergy.severity}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{allergy.notes}</p>
                          <p className="text-xs text-gray-500">Recorded on {allergy.recordedDate}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAllergy(allergy.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6" />

            {/* Spouse sub-section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-pink-500" />
                  </div>
                  {displaySpouse ? (
                    <span className="text-sm text-gray-700">{displaySpouse.title} {displaySpouse.firstName} {displaySpouse.lastName}</span>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No spouse on record</span>
                  )}
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">Spouse</span>
                </div>
                {displaySpouse && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                    onAllergyTargetChange?.('spouse');
                    onAllergyFormChange?.({ allergen: '', severity: 'Mild', notes: '' });
                    onOpenAllergyDialog?.();
                  }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Allergy
                  </Button>
                )}
              </div>
              {!displaySpouse ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                  Add a spouse in the Profile tab to record their allergy information.
                </div>
              ) : displaySpouseFoodAllergies.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-pink-100 rounded-lg text-gray-400 text-sm">No allergies recorded for spouse.</div>
              ) : (
                <div className="space-y-3">
                  {displaySpouseFoodAllergies.map((allergy, idx) => (
                    <div key={`sp-allergy-${allergy.id ?? idx}-${allergy.recordedDate ?? ''}`} className={`p-4 border rounded-lg ${allergy.severity === 'Severe' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-gray-900">{allergy.allergen}</h4>
                            <Badge className={getSeverityColor(allergy.severity)}>{allergy.severity}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{allergy.notes}</p>
                          <p className="text-xs text-gray-500">Recorded on {allergy.recordedDate}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSpouseAllergy(allergy.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* ── Dietary Requirements Card ───────────────────────────── */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Utensils className="w-5 h-5 text-green-600" />
              <h3>Dietary Requirements & Preferences</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">Record dietary preferences and requirements</p>

            {/* Customer sub-section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">{memberData.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Customer</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { onDietaryTargetChange?.('customer'); setMockDietaryTarget('customer'); onDietaryFormChange?.({ requirement: '', notes: '' }); setMockDietaryForm({ requirement: '', notes: '' }); onOpenDietaryDialog?.(); }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Requirement
                </Button>
              </div>
              {displayDietaryRequirements.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">No dietary requirements recorded.</div>
              ) : (
                <div className="space-y-3">
                  {displayDietaryRequirements.map((dietary, idx) => (
                    <div key={`dietary-${dietary.id ?? idx}-${dietary.recordedDate ?? ''}`} className="p-4 border border-gray-200 rounded-lg bg-green-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-1">{dietary.requirement}</h4>
                          <p className="text-sm text-gray-700 mb-1">{dietary.notes}</p>
                          <p className="text-xs text-gray-500">Recorded on {dietary.recordedDate}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDietary(dietary.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6" />

            {/* Spouse sub-section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-pink-500" />
                  </div>
                  {displaySpouse ? (
                    <span className="text-sm text-gray-700">{displaySpouse.title} {displaySpouse.firstName} {displaySpouse.lastName}</span>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No spouse on record</span>
                  )}
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">Spouse</span>
                </div>
                {displaySpouse && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { onDietaryTargetChange?.('spouse'); setMockDietaryTarget('spouse'); onDietaryFormChange?.({ requirement: '', notes: '' }); setMockDietaryForm({ requirement: '', notes: '' }); onOpenDietaryDialog?.(); }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Requirement
                  </Button>
                )}
              </div>
              {!displaySpouse ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                  Add a spouse in the Profile tab to record their dietary requirements.
                </div>
              ) : displaySpouseDietaryReqs.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-pink-100 rounded-lg text-gray-400 text-sm">No dietary requirements recorded for spouse.</div>
              ) : (
                <div className="space-y-3">
                  {displaySpouseDietaryReqs.map((dietary, idx) => (
                    <div key={`sp-dietary-${dietary.id ?? idx}-${dietary.recordedDate ?? ''}`} className="p-4 border border-gray-200 rounded-lg bg-green-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-1">{dietary.requirement}</h4>
                          <p className="text-sm text-gray-700 mb-1">{dietary.notes}</p>
                          <p className="text-xs text-gray-500">Recorded on {dietary.recordedDate}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSpouseDietary(dietary.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Remarks Tab */}
        <TabsContent value="remarks" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Staff Remarks</h3>
              <Button onClick={() => { onOpenRemarkDialog?.(); setMockIsAddRemarkOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Remark
              </Button>
            </div>
            <div className="space-y-3">
              {displayRemarks.map((remark, idx) => (
                <div key={`remark-${remark.id ?? idx}-${remark.createdDate ?? ''}`} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(remark.category)}>{remark.category}</Badge>
                        <span className="text-xs text-gray-500">
                          {remark.createdDate} by {remark.createdBy}
                        </span>
                      </div>
                      <p className="text-gray-900">{remark.remark}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRemark(remark.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Movement Log Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  Movement Log
                </h3>
                <p className="text-sm text-gray-600 mt-1">Full movement details linked to booking records</p>
              </div>
              <Button onClick={() => { onOpenMovementDialog?.(); setMockIsAddMovementOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Movement
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="text-xs border-collapse" style={{ minWidth: '3200px' }}>
                <thead>
                  <tr className="bg-[#0f2942] text-white">
                    {/* Fixed identity columns */}
                    <th className="px-3 py-2.5 text-left whitespace-nowrap sticky left-0 z-20 bg-[#0f2942] border-r border-white/20 min-w-[60px]">Gp No.</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[130px]">Movement IC</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[130px]">CIC &amp; Support</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px]">Driver</th>
                    {/* Booking reference */}
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[170px] bg-[#163a5e]">Order No.</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px] bg-[#163a5e]">Dept Date</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px] bg-[#163a5e]">Arr Date</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[90px] bg-[#163a5e]">Flt No.</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[90px] bg-[#163a5e]">Flt Time</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px] bg-[#163a5e]">Dest / Origin</th>
                    {/* Lounge details */}
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[120px]">Lobby / Suite</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[60px]">Pax</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[70px]">Title</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px]">First Name</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[100px]">Last Name</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[75px]">C/I Bag.</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[140px]">Remarks</th>
                    <th className="px-3 py-2.5 text-left whitespace-nowrap min-w-[110px]">Nationality</th>
                    {/* Time columns */}
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
                  {displayMovements.map((m, idx) => {
                    const cell = 'px-3 py-2.5 whitespace-nowrap align-middle';
                    const dash = <span className="text-gray-300">—</span>;
                    const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60';
                    return (
                      <tr key={`mov-${m.id ?? idx}-${m.orderNo ?? ''}`} className={`${rowBg} hover:bg-blue-50/40 transition-colors`}>
                        {/* Gp No. — sticky */}
                        <td className={`${cell} sticky left-0 z-10 ${rowBg} border-r border-gray-200 text-center`}>
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0f2942]/10 text-[#0f2942]">{m.id}</span>
                        </td>
                        <td className={cell}>{m.movementInCharge || dash}</td>
                        <td className={cell}>{m.cicSupport || dash}</td>
                        <td className={cell}>{m.driver || dash}</td>
                        {/* Booking ref — soft blue tint */}
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
                        {/* Time columns — soft teal tint */}
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
                        {/* Action — sticky right */}
                        <td className={`${cell} text-center sticky right-0 z-10 ${rowBg} border-l border-gray-200`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMockMovements(prev => prev.filter(x => x.id !== m.id)); // demo fallback
                              toast.success('Movement record removed');
                            }}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {displayMovements.length === 0 && (
                    <tr>
                      <td colSpan={28} className="px-6 py-10 text-center text-gray-400 text-sm">
                        No movement records found. Click "Add Movement" to create the first entry.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-100 border border-blue-200"></span> Booking reference columns &nbsp;
              <span className="inline-block w-3 h-3 rounded-sm bg-teal-100 border border-teal-200 ml-2"></span> Movement time columns
            </p>
          </Card>
        </TabsContent>

        {/* ── Security Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="security" className="space-y-6">

          {/* Account Lock Banner (only shown when locked) */}
          {activeIsAccountLocked && (
            <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800">Account is currently locked</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Reason: <span className="font-medium">{activeLockReason}</span>
                  <span className="mx-2 text-red-300">·</span>
                  Locked at: <span className="font-medium">{activeLockedAt}</span>
                </p>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 shrink-0"
                onClick={() => { onShowUnlockConfirm?.(); setMockShowUnlockConfirm(true); }}
              >
                <LockOpen className="w-3.5 h-3.5 mr-1.5" />
                Unlock Now
              </Button>
            </div>
          )}

          {/* Security Status Overview */}
          <Card className="p-6">
            <h3 className="flex items-center gap-2 mb-5">
              <Shield className="w-5 h-5 text-blue-600" />
              Security Status
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {/* Account Lock Status */}
              <div className={`rounded-lg p-4 border ${activeIsAccountLocked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {activeIsAccountLocked
                    ? <Lock className="w-4 h-4 text-red-600" />
                    : <LockOpen className="w-4 h-4 text-green-600" />}
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Account Lock</span>
                </div>
                <p className={`text-sm font-semibold ${activeIsAccountLocked ? 'text-red-700' : 'text-green-700'}`}>
                  {activeIsAccountLocked ? 'Locked' : 'Unlocked'}
                </p>
                {activeIsAccountLocked && (
                  <p className="text-xs text-red-500 mt-0.5 truncate" title={activeLockReason}>{activeLockReason}</p>
                )}
              </div>

              {/* 2FA */}
              <div className={`rounded-lg p-4 border ${activeTwoFAEnabled ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className={`w-4 h-4 ${activeTwoFAEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">2FA</span>
                </div>
                <p className={`text-sm font-semibold ${activeTwoFAEnabled ? 'text-green-700' : 'text-yellow-700'}`}>
                  {activeTwoFAEnabled ? 'Enabled' : 'Not Enabled'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Authenticator App</p>
              </div>

              {/* Active Sessions */}
              <div className="rounded-lg p-4 border bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Active Sessions</span>
                </div>
                <p className="text-sm font-semibold text-blue-700">{activeActiveSessions} active</p>
                <p className="text-xs text-gray-400 mt-0.5">Devices signed in</p>
              </div>

              {/* Last Login */}
              <div className="rounded-lg p-4 border bg-gray-50 border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Last Login</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">2026-03-07</p>
                <p className="text-xs text-gray-400 mt-0.5">09:15 · Hong Kong, HK</p>
              </div>
            </div>
          </Card>

          {/* Security Actions */}
          <Card className="p-6">
            <h3 className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Security Actions
            </h3>
            <p className="text-sm text-gray-500 mb-5">Manage account access and credentials. All actions are logged in the audit trail.</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Reset Password */}
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Reset Password</p>
                  <p className="text-xs text-gray-500 mt-0.5 mb-3">
                    Send a password reset link to the customer's registered email address. The link expires in 24 hours.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => { onShowResetPwConfirm?.(); setMockShowResetPwConfirm(true); }}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Send Reset Link
                  </Button>
                </div>
              </div>

              {/* Unlock Account */}
              <div className={`flex items-start gap-4 p-4 border rounded-lg ${activeIsAccountLocked ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeIsAccountLocked ? 'bg-red-100' : 'bg-gray-100'}`}>
                  {activeIsAccountLocked
                    ? <Lock className="w-5 h-5 text-red-600" />
                    : <LockOpen className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {activeIsAccountLocked ? 'Unlock Account' : 'Account Unlocked'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 mb-3">
                    {activeIsAccountLocked
                      ? `Account locked: ${activeLockReason}. Unlock to restore customer access.`
                      : 'This account is not currently locked. No action required.'}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!activeIsAccountLocked}
                    className={activeIsAccountLocked ? 'border-red-300 text-red-700 hover:bg-red-100' : ''}
                    onClick={() => { onShowUnlockConfirm?.(); setMockShowUnlockConfirm(true); }}
                  >
                    <LockOpen className="w-3.5 h-3.5 mr-1.5" />
                    Unlock Account
                  </Button>
                </div>
              </div>

              {/* Force Sign Out */}
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Force Sign Out All Sessions</p>
                  <p className="text-xs text-gray-500 mt-0.5 mb-3">
                    Immediately terminate all active login sessions across all devices. The customer will need to sign in again.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    onClick={() => { onShowForceLogoutConfirm?.(); setMockShowForceLogoutConfirm(true); }}
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    Sign Out All Sessions
                  </Button>
                </div>
              </div>

              {/* Reset 2FA */}
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Reset Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 mt-0.5 mb-3">
                    Remove the current 2FA device binding. The customer will be prompted to set up 2FA again on next login.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!activeTwoFAEnabled}
                    className={activeTwoFAEnabled ? 'border-purple-200 text-purple-700 hover:bg-purple-50' : ''}
                    onClick={() => { onShowReset2FAConfirm?.(); setMockShowReset2FAConfirm(true); }}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Reset 2FA
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Login History */}
          <Card className="p-6">
            <h3 className="flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-blue-600" />
              Recent Login Activity
            </h3>
            <p className="text-sm text-gray-500 mb-4">Last 10 login attempts across all devices</p>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Device</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayLoginHistory.map(entry => (
                    <tr key={entry.id} className={`hover:bg-gray-50 ${entry.status === 'Locked Out' ? 'bg-red-50/60' : ''}`}>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 font-mono text-xs">{entry.datetime}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {entry.deviceType === 'mobile'
                            ? <Smartphone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            : <Monitor className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                          <span className="text-xs text-gray-600">{entry.device}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-500">{entry.ip}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{entry.location}</td>
                      <td className="px-4 py-3 text-center">
                        {entry.status === 'Success' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3" /> Success
                          </span>
                        )}
                        {entry.status === 'Failed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                        {entry.status === 'Locked Out' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">
                            <Lock className="w-3 h-3" /> Locked Out
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Unlock Account Confirmation ─────────────────────────────────────── */}
      <Dialog open={activeShowUnlockConfirm} onOpenChange={open => { if (!open) { onHideUnlockConfirm?.(); setMockShowUnlockConfirm(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LockOpen className="w-5 h-5 text-green-600" />
              Unlock Account
            </DialogTitle>
            <DialogDescription>
              You are about to unlock <strong>{memberData.name}</strong>'s account.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 space-y-1">
            <p><span className="font-medium">Lock reason:</span> {activeLockReason}</p>
            <p><span className="font-medium">Locked at:</span> {activeLockedAt}</p>
            <p className="mt-2">After unlocking, the customer will be able to sign in immediately. Consider requiring a password reset if suspicious activity is suspected.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { onHideUnlockConfirm?.(); setMockShowUnlockConfirm(false); }}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setMockIsAccountLocked(false); // local demo fallback
                onHideUnlockConfirm?.();
                setMockShowUnlockConfirm(false);
                toast.success('Account unlocked successfully. Customer can now sign in.');
              }}
            >
              <LockOpen className="w-4 h-4 mr-2" />
              Confirm Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reset Password Confirmation ─────────────────────────────────────── */}
      <Dialog open={activeShowResetPwConfirm} onOpenChange={open => { if (!open) { onHideResetPwConfirm?.(); setMockShowResetPwConfirm(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Send Password Reset Link
            </DialogTitle>
            <DialogDescription>
              A password reset email will be sent to <strong>{memberData.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 space-y-1">
            <p>The reset link will be valid for <span className="font-medium">24 hours</span>.</p>
            <p>The customer's current password will remain active until they complete the reset.</p>
            <p>This action will be recorded in the audit log.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { onHideResetPwConfirm?.(); setMockShowResetPwConfirm(false); }}>Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                onHideResetPwConfirm?.();
                setMockShowResetPwConfirm(false);
                toast.success(`Password reset link sent to ${memberData.email}`);
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Force Logout Confirmation ──────────────────────────────────────── */}
      <Dialog open={activeShowForceLogoutConfirm} onOpenChange={open => { if (!open) { onHideForceLogoutConfirm?.(); setMockShowForceLogoutConfirm(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-orange-600" />
              Force Sign Out All Sessions
            </DialogTitle>
            <DialogDescription>
              All active sessions for <strong>{memberData.name}</strong> will be terminated immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800 space-y-1">
            <p><span className="font-medium">{activeActiveSessions} active session{activeActiveSessions !== 1 ? 's' : ''}</span> will be signed out.</p>
            <p>The customer will be logged out from all browsers and devices.</p>
            <p>They will need to sign in again to access their account.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { onHideForceLogoutConfirm?.(); setMockShowForceLogoutConfirm(false); }}>Cancel</Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => {
                onHideForceLogoutConfirm?.();
                setMockShowForceLogoutConfirm(false);
                toast.success('All sessions terminated. Customer has been signed out from all devices.');
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out All Sessions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reset 2FA Confirmation ─────────────────────────────────────────── */}
      <Dialog open={activeShowReset2FAConfirm} onOpenChange={open => { if (!open) { onHideReset2FAConfirm?.(); setMockShowReset2FAConfirm(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-600" />
              Reset Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              The 2FA device binding for <strong>{memberData.name}</strong> will be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-800 space-y-1">
            <p>The current authenticator app pairing will be <span className="font-medium">permanently unlinked</span>.</p>
            <p>The customer will be prompted to set up 2FA again on their next login.</p>
            <p>Use this if the customer has lost access to their authenticator app.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { onHideReset2FAConfirm?.(); setMockShowReset2FAConfirm(false); }}>Cancel</Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                setMockTwoFAEnabled(false); // local demo fallback
                onHideReset2FAConfirm?.();
                setMockShowReset2FAConfirm(false);
                toast.success('2FA has been reset. Customer will be prompted to set up 2FA on next login.');
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Confirm Reset 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Preference Dialog */}
      <Dialog open={activeIsAddPreferenceOpen} onOpenChange={open => { if (!open) { onCloseAddPreference?.(); setMockIsAddPreferenceOpen(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer Preference</DialogTitle>
            <DialogDescription>Record a new preference for this member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label>Category</label>
              <select
                value={activePreferenceForm.category}
                onChange={e => { onPreferenceFormChange?.({ category: e.target.value, preference: activePreferenceForm.preference }); setMockAllergyForm(f => ({ ...f, allergen: e.target.value })); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="Seating">Seating</option>
                <option value="Service">Service</option>
                <option value="Beverage">Beverage</option>
                <option value="Food">Food</option>
                <option value="Temperature">Temperature</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label>Preference Details</label>
              <Textarea
                value={activePreferenceForm.preference}
                onChange={e => { onPreferenceFormChange?.({ category: activePreferenceForm.category, preference: e.target.value }); setMockAllergyForm(f => ({ ...f, notes: e.target.value })); }}
                placeholder="Describe the customer's preference..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { onCloseAddPreference?.(); setMockIsAddPreferenceOpen(false); }}>Cancel</Button>
            <Button onClick={() => {
              if (!activePreferenceForm.category.trim()) { toast.error('Category is required'); return; }
              if (!activePreferenceForm.preference.trim()) { toast.error('Preference details are required'); return; }
              toast.success('Preference added');
              onAddPreference?.();
              onCloseAddPreference?.();
              setMockIsAddPreferenceOpen(false);
            }}>Add Preference</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Allergy Dialog */}
      <Dialog open={activeIsAddAllergyOpen} onOpenChange={open => { if (!open) { onCloseAddAllergy?.(); setMockIsAddAllergyOpen(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeAllergyTarget === 'spouse'
                ? <><Heart className="w-4 h-4 text-pink-500" />Add Spouse Food Allergy</>
                : <><User className="w-4 h-4 text-blue-600" />Add Customer Food Allergy</>}
            </DialogTitle>
            <DialogDescription>
              {activeAllergyTarget === 'spouse'
                ? `Recording allergy for ${displaySpouse ? `${displaySpouse.title} ${displaySpouse.firstName} ${displaySpouse.lastName}` : 'spouse'}`
                : `Recording allergy for ${memberData.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label style={{ marginBottom: '10px', display: 'block' }}>Allergen</label>
              <input
                type="text"
                value={activeAllergyForm.allergen}
                onChange={e => { onAllergyFormChange?.({ ...activeAllergyForm, allergen: e.target.value }); setMockAllergyForm(f => ({ ...f, allergen: e.target.value })); }}
                placeholder="e.g., Peanuts, Shellfish, Dairy"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label style={{ marginBottom: '10px', display: 'block' }}>Severity</label>
              <select
                value={activeAllergyForm.severity}
                onChange={e => { onAllergyFormChange?.({ ...activeAllergyForm, severity: e.target.value }); setMockAllergyForm(f => ({ ...f, severity: e.target.value })); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
            <div>
              <label style={{ marginBottom: '10px', display: 'block' }}>Notes</label>
              <Textarea
                value={activeAllergyForm.notes}
                onChange={e => { onAllergyFormChange?.({ ...activeAllergyForm, notes: e.target.value }); setMockAllergyForm(f => ({ ...f, notes: e.target.value })); }}
                placeholder="Additional information about the allergy..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { onCloseAddAllergy?.(); setMockIsAddAllergyOpen(false); }}>Cancel</Button>
            <Button onClick={() => {
              if (!activeAllergyForm.allergen.trim()) { toast.error('Allergen name is required'); return; }
              const today = new Date().toISOString().split('T')[0];
              const newItem: FoodAllergy = {
                id: Date.now(),
                allergen: activeAllergyForm.allergen.trim(),
                severity: activeAllergyForm.severity as FoodAllergy['severity'],
                notes: activeAllergyForm.notes,
                recordedDate: today,
              };
              // Always close the dialog immediately and clear mock state
              const target = activeAllergyTarget;
              onCloseAddAllergy?.();
              setMockIsAddAllergyOpen(false);
              // Then trigger container to save (container reads form state synchronously)
              onAddAllergy?.();
              if (target === 'spouse') {
                toast.success('Spouse food allergy added');
              } else {
                toast.success('Food allergy added');
              }
            }}>Add Allergy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dietary Requirement Dialog */}
      <Dialog open={activeIsAddDietaryOpen} onOpenChange={open => { if (!open) { onCloseAddDietary?.(); setMockIsAddDietaryOpen(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeDietaryTarget === 'spouse'
                ? <><Heart className="w-4 h-4 text-pink-500" />Add Spouse Dietary Requirement</>
                : <><User className="w-4 h-4 text-blue-600" />Add Customer Dietary Requirement</>}
            </DialogTitle>
            <DialogDescription>
              {activeDietaryTarget === 'spouse'
                ? `Recording dietary requirement for ${displaySpouse ? `${displaySpouse.title} ${displaySpouse.firstName} ${displaySpouse.lastName}` : 'spouse'}`
                : `Recording dietary requirement for ${memberData.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label style={{ marginBottom: '10px', display: 'block' }}>Requirement</label>
              <input
                type="text"
                value={activeDietaryForm.requirement}
                onChange={e => { onDietaryFormChange?.({ ...activeDietaryForm, requirement: e.target.value }); setMockDietaryForm(f => ({ ...f, requirement: e.target.value })); }}
                placeholder="e.g., Vegetarian, Low Sodium, Halal"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label style={{ marginBottom: '10px', display: 'block' }}>Notes</label>
              <Textarea
                value={activeDietaryForm.notes}
                onChange={e => { onDietaryFormChange?.({ ...activeDietaryForm, notes: e.target.value }); setMockDietaryForm(f => ({ ...f, notes: e.target.value })); }}
                placeholder="Additional details..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { onCloseAddDietary?.(); setMockIsAddDietaryOpen(false); }}>Cancel</Button>
            <Button onClick={() => {
              if (!activeDietaryForm.requirement.trim()) { toast.error('Requirement name is required'); return; }
              // Always close the dialog immediately and clear mock state
              const target = activeDietaryTarget;
              onCloseAddDietary?.();
              setMockIsAddDietaryOpen(false);
              // Trigger container to save (container reads form state synchronously)
              onAddDietary?.();
              if (target === 'spouse') {
                toast.success('Spouse dietary requirement added');
              } else {
                toast.success('Dietary requirement added');
              }
            }}>Add Requirement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Movement Dialog */}
      <Dialog open={activeIsAddMovementOpen} onOpenChange={open => { if (!open) { onCloseAddMovement?.(); setMockIsAddMovementOpen(false); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Add Movement Record
            </DialogTitle>
            <DialogDescription>Fill in the movement details. Fields marked * are required; all others are optional.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-1">

            {/* ── Section A: Assignment ───────────────────────────────── */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b">Assignment</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Movement In Charge</label>
                  <input
                  type="text"
                  placeholder="Staff name"
                  value={movementFormProp.movementInCharge || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, movementInCharge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>CIC &amp; Support</label>
                  <input
                  type="text"
                  placeholder="Staff name(s)"
                  value={movementFormProp.cicSupport || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, cicSupport: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Driver</label>
                  <input
                  type="text"
                  placeholder="Driver name"
                  value={movementFormProp.driver || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, driver: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
              </div>
            </div>

            {/* ── Section B: Booking Reference ───────────────────────── */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b">Booking Reference</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 md:col-span-1">
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Order No. (Booking No.) <span className="text-red-500">*</span></label>
                  <input
                  type="text"
                  placeholder="e.g. A-20260308-000012"
                  value={movementFormProp.orderNo || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, orderNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Dept Date</label>
                  <input
                  type="date"
                  value={movementFormProp.deptDate || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, deptDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Arr Date</label>
                  <input
                  type="date"
                  value={movementFormProp.arrDate || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, arrDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Flight No. <span className="text-red-500">*</span></label>
                  <input
                  type="text"
                  placeholder="e.g. CX880"
                  value={movementFormProp.flightNo || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, flightNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm uppercase"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Flight Time <span className="text-red-500">*</span></label>
                  <input
                  type="time"
                  value={movementFormProp.flightTime || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, flightTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Destination / Origin <span className="text-red-500">*</span></label>
                  <input
                  type="text"
                  placeholder="IATA code, e.g. LHR"
                  maxLength={3}
                  value={movementFormProp.destinationOrigin || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, destinationOrigin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm uppercase"
                />
                </div>
              </div>
            </div>

            {/* ── Section C: Lounge & Guest Details ──────────────────── */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b">Lounge &amp; Guest Details</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Lobby / Suite</label>
                  <input
                  type="text"
                  placeholder="e.g. VIP Suite A"
                  value={movementFormProp.lobbySuite || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, lobbySuite: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>No. of Pax</label>
                  <input
                  type="number"
                  min={1}
                  placeholder="0"
                  value={movementFormProp.noOfPax || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, noOfPax: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>No. of C/I Baggage</label>
                  <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={movementFormProp.noOfCIBaggage || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, noOfCIBaggage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Title</label>
                  <input
                  type="text"
                  placeholder="Mr. / Mrs. / Ms."
                  value={movementFormProp.title || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>First Name</label>
                  <input
                  type="text"
                  placeholder="First name"
                  value={movementFormProp.firstName || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Last Name</label>
                  <input
                  type="text"
                  placeholder="Last name"
                  value={movementFormProp.lastName || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Nationality of Guests</label>
                  <input
                  type="text"
                  placeholder="e.g. United Kingdom"
                  value={movementFormProp.nationality || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Remarks</label>
                  <Textarea
                  placeholder="General remarks for this movement..."
                  rows={2}
                  className="text-sm"
                  value={movementFormProp.remarks || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, remarks: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* ── Section D: Movement Times ───────────────────────────── */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 pb-1 border-b">Movement Times</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Arrival Time of Non-Flying Guests at HKIAL</label>
                  <input
                  type="time"
                  value={movementFormProp.arrTimeNonFlyingGuests || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, arrTimeNonFlyingGuests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Time Met VIP at Gate / VIP Arrive at HKIAL</label>
                  <input
                  type="time"
                  value={movementFormProp.timeMetVIPAtGate || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, timeMetVIPAtGate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Time Back to HKIAL</label>
                  <input
                  type="time"
                  value={movementFormProp.timeBackToHKIAL || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, timeBackToHKIAL: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Baggage Retrieval (Start Time)</label>
                  <input
                  type="time"
                  value={movementFormProp.baggageRetrievalStart || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, baggageRetrievalStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Baggage Retrieval (End Time)</label>
                  <input
                  type="time"
                  value={movementFormProp.baggageRetrievalEnd || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, baggageRetrievalEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Baggage Arrival at HKIAL</label>
                  <input
                  type="time"
                  value={movementFormProp.baggageArrivalAtHKIAL || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, baggageArrivalAtHKIAL: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Time Left HKIAL / At Boarding Gate</label>
                  <input
                  type="time"
                  value={movementFormProp.timeLeftHKIAL || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, timeLeftHKIAL: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Total Processing Time</label>
                  <input
                  type="text"
                  placeholder="e.g. 1h 30m"
                  value={movementFormProp.totalProcessingTime || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, totalProcessingTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                </div>
                <div>
                  <label className="text-sm font-medium block" style={{ marginBottom: '10px' }}>Remarks for Admin Issue</label>
                  <Textarea
                  placeholder="Admin issue details..."
                  rows={2}
                  className="text-sm"
                  value={movementFormProp.remarksAdminIssue || ''}
                  onChange={e => onMovementFormChange?.({ ...movementFormProp, remarksAdminIssue: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => { onCloseAddMovement?.(); setMockIsAddMovementOpen(false); }}>Cancel</Button>
            <Button onClick={() => {
              onAddMovement?.();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Movement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Remark Dialog */}
      <Dialog open={activeIsAddRemarkOpen} onOpenChange={open => { if (!open) { onCloseAddRemark?.(); setMockIsAddRemarkOpen(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Remark</DialogTitle>
            <DialogDescription>Add notes and observations about this member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label>Category</label>
              <select
                value={remarkFormProp?.category || 'General'}
                onChange={e => onRemarkFormChange?.({ ...remarkFormProp!, category: e.target.value, remark: remarkFormProp?.remark || '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="General">General</option>
                <option value="Special Request">Special Request</option>
                <option value="Service Note">Service Note</option>
                <option value="VIP Note">VIP Note</option>
              </select>
            </div>
            <div>
              <label>Remark</label>
              <Textarea
                value={remarkFormProp?.remark || ''}
                onChange={e => onRemarkFormChange?.({ ...remarkFormProp!, remark: e.target.value })}
                placeholder="Enter your remark..."
                rows={4}
              />

            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { onCloseAddRemark?.(); setMockIsAddRemarkOpen(false); }}>Cancel</Button>
            <Button onClick={() => {
              onAddRemark?.();
            }}>Add Remark</Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Spouse Dialog ───────────────────────────────────── */}
      <Dialog open={activeIsSpouseDialogOpen} onOpenChange={open => { if (!open) { onSpouseDialogClose?.(); setMockIsSpouseDialogOpen(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              {displaySpouse ? 'Edit Spouse / Partner' : 'Add Spouse / Partner'}
            </DialogTitle>
            <DialogDescription>
              {displaySpouse
                ? 'Update the spouse / partner information for this customer.'
                : 'Add spouse or partner details. One customer can only have one spouse on record.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            {/* Name row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-600 block" style={{ marginBottom: '10px' }}>Title</label>
                <select
                  value={activeSpouseForm.title}
                  onChange={e => { onSpouseFormChange?.({ ...activeSpouseForm, title: e.target.value }); setMockSpouseForm(f => ({ ...f, title: e.target.value })); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.', 'Prof.'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block" style={{ marginBottom: '10px' }}>First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={activeSpouseForm.firstName}
                  onChange={e => { onSpouseFormChange?.({ ...activeSpouseForm, firstName: e.target.value }); setMockSpouseForm(f => ({ ...f, firstName: e.target.value })); }}
                  placeholder="First name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block" style={{ marginBottom: '10px' }}>Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={activeSpouseForm.lastName}
                  onChange={e => { onSpouseFormChange?.({ ...activeSpouseForm, lastName: e.target.value }); setMockSpouseForm(f => ({ ...f, lastName: e.target.value })); }}
                  placeholder="Last name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 block" style={{ marginBottom: '10px' }}>Email</label>
                <input
                  type="email"
                  value={activeSpouseForm.email}
                  onChange={e => { onSpouseFormChange?.({ ...activeSpouseForm, email: e.target.value }); setMockSpouseForm(f => ({ ...f, email: e.target.value })); }}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block" style={{ marginBottom: '10px' }}>Phone</label>
                <input
                  type="tel"
                  value={activeSpouseForm.phone}
                  onChange={e => { onSpouseFormChange?.({ ...activeSpouseForm, phone: e.target.value }); setMockSpouseForm(f => ({ ...f, phone: e.target.value })); }}
                  placeholder="+852 XXXX XXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Nationality + Passport */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 block" style={{ marginBottom: '10px' }}>Nationality</label>
                <input
                  type="text"
                  value={activeSpouseForm.nationality}
                  onChange={e => { onSpouseFormChange?.({ ...activeSpouseForm, nationality: e.target.value }); setMockSpouseForm(f => ({ ...f, nationality: e.target.value })); }}
                  placeholder="e.g., United Kingdom"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block" style={{ marginBottom: '10px' }}>First 4 Digits of Passport</label>
                <input
                  type="text"
                  maxLength={4}
                  value={activeSpouseForm.passportFirst4}
                  onChange={e => { onSpouseFormChange?.({ ...activeSpouseForm, passportFirst4: e.target.value }); setMockSpouseForm(f => ({ ...f, passportFirst4: e.target.value })); }}
                  placeholder="e.g., UK78"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Linked Account (optional) */}
            <div>
              <label className="text-sm text-gray-600 block" style={{ marginBottom: '10px' }}>
                Linked Account Number <span className="text-gray-400 text-xs">(optional — if spouse is also a registered customer)</span>
              </label>
              <input
                type="text"
                value={activeSpouseForm.linkedAccountNo || ''}
                onChange={e => { onSpouseFormChange?.({ ...activeSpouseForm, linkedAccountNo: e.target.value }); setMockSpouseForm(f => ({ ...f, linkedAccountNo: e.target.value })); }}
                placeholder="e.g., ACC-2024-1099"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { onSpouseDialogClose?.(); setMockIsSpouseDialogOpen(false); }}>Cancel</Button>
            <Button
              onClick={() => {
                if (!activeSpouseForm.firstName.trim() || !activeSpouseForm.lastName.trim()) {
                  toast.error('First Name and Last Name are required.'); return;
                }
                setMockSpouse({ ...activeSpouseForm }); // demo fallback
                toast.success(displaySpouse ? 'Spouse information updated.' : 'Spouse added successfully.');
                onAddSpouse?.({ ...activeSpouseForm });
                onSpouseDialogClose?.();
                setMockIsSpouseDialogOpen(false);
              }}
            >
              {displaySpouse ? 'Save Changes' : 'Add Spouse'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─��� Remove Spouse Confirmation ─────────────────────────────────── */}
      <Dialog open={activeIsRemoveSpouseOpen} onOpenChange={open => { if (!open) { onRemoveSpouseClose?.(); setMockIsRemoveSpouseOpen(false); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <UserX className="w-5 h-5" />
              Remove Spouse
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{displaySpouse?.title} {displaySpouse?.firstName} {displaySpouse?.lastName}</strong> as the spouse / partner of this customer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => { onRemoveSpouseClose?.(); setMockIsRemoveSpouseOpen(false); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setMockSpouse(null); // demo fallback
                toast.success('Spouse removed from this customer\'s profile.');
                onRemoveSpouseClose?.();
                setMockIsRemoveSpouseOpen(false);
              }}
            >
              Remove Spouse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}