import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  ArrowLeft, Search, User, Building2, Plane, Star, Gem, Award, Trophy,
  CheckCircle, TrendingUp, Package, CreditCard, Info, Shuffle,
} from 'lucide-react';

// ─── Shared Types (exported for PurchaseManagement) ───────────────────────────

export type PurchaseCategory = 'Individual' | 'Corporate' | 'Agency';
export type Tier = 'Gold' | 'Platinum' | 'Diamond' | 'Sapphire';
export type TierOrNone = Tier | 'None';
export type PaymentMethod = 'Bank Transfer' | 'Branch Transfer' | 'Corporate Account';
export type PurchaseStatus = 'Pending Invoice' | 'Invoice Sent';

export interface GradingPackage {
  kind: 'grading';
  tier: Tier;
  price: number;
  credits: number;
  validityMonths: number;
}

export interface SessionBundle {
  kind: 'bundle';
  id: string;
  label: string;
  sessions: number;
  price: number;
  validityMonths: number;
}

export type PackageChoice = GradingPackage | SessionBundle;

export interface AccountOption {
  accountNumber: string;
  primaryName: string;
  email: string;
  purchaseCategory: PurchaseCategory;
  currentTier?: TierOrNone;
  currentCredits?: number;
  currentSessions?: number;
  contactPerson?: string;
}

export interface PurchaseRecord {
  id: number;
  purchaseRef: string;
  purchaseDate: string;
  purchaseCategory: PurchaseCategory;
  accountNumber: string;
  primaryName: string;
  primaryEmail: string;
  previousTier?: TierOrNone;
  newTier?: Tier;
  creditsAdded?: number;
  totalCreditsAfter?: number;
  bundleLabel?: string;
  sessionsAdded?: number;
  totalSessionsAfter?: number;
  packagePrice: number;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  processedBy: string;
  notes: string;
  expiryDate: string;
  status: PurchaseStatus;
  invoiceSentDate?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const GRADING_PACKAGES: GradingPackage[] = [
  { kind: 'grading', tier: 'Gold',     price: 32000,  credits: 8,  validityMonths: 12 },
  { kind: 'grading', tier: 'Platinum', price: 45000,  credits: 12, validityMonths: 12 },
  { kind: 'grading', tier: 'Diamond',  price: 84000,  credits: 24, validityMonths: 12 },
  { kind: 'grading', tier: 'Sapphire', price: 325000, credits: -1, validityMonths: 12 },
];

export const SESSION_BUNDLES: SessionBundle[] = [
  { kind: 'bundle', id: 'basic',      label: 'Basic Bundle',      sessions: 10,  price: 3800,  validityMonths: 6  },
  { kind: 'bundle', id: 'standard',   label: 'Standard Bundle',   sessions: 20,  price: 7000,  validityMonths: 12 },
  { kind: 'bundle', id: 'business',   label: 'Business Bundle',   sessions: 50,  price: 16000, validityMonths: 12 },
  { kind: 'bundle', id: 'enterprise', label: 'Enterprise Bundle', sessions: 100, price: 28000, validityMonths: 24 },
];

export const MOCK_ACCOUNTS: AccountOption[] = [
  { accountNumber: 'ACC-2024-1001', primaryName: 'John Smith',            email: 'john.smith@email.com',         purchaseCategory: 'Individual',    currentTier: 'Gold',     currentCredits: 3   },
  { accountNumber: 'ACC-2024-1002', primaryName: 'Mary Johnson',          email: 'mary.johnson@email.com',       purchaseCategory: 'Individual',    currentTier: 'None',     currentCredits: 0   },
  { accountNumber: 'ACC-2024-1003', primaryName: 'David Lee',             email: 'david.lee@email.com',          purchaseCategory: 'Individual',    currentTier: 'Gold',     currentCredits: 8   },
  { accountNumber: 'ACC-2024-1005', primaryName: 'Sarah Chen',            email: 'sarah.chen@email.com',         purchaseCategory: 'Individual',    currentTier: 'None',     currentCredits: 0   },
  { accountNumber: 'ACC-2024-1006', primaryName: 'Robert Wang',           email: 'robert.wang@email.com',        purchaseCategory: 'Individual',    currentTier: 'Platinum', currentCredits: 15  },
  { accountNumber: 'ACC-2024-1007', primaryName: 'Emma Wilson',           email: 'emma.wilson@email.com',        purchaseCategory: 'Individual',    currentTier: 'Diamond',  currentCredits: 42  },
  { accountNumber: 'ACC-2024-1009', primaryName: 'James Brown',           email: 'james.brown@email.com',        purchaseCategory: 'Individual',    currentTier: 'Gold',     currentCredits: 1   },
  { accountNumber: 'ACC-2024-1011', primaryName: 'Sophia Taylor',         email: 'sophia.taylor@email.com',      purchaseCategory: 'Individual',    currentTier: 'None',     currentCredits: 0   },
  { accountNumber: 'CORP-2024-0001', primaryName: 'Cathay Pacific Airways', email: 'alice.lam@cathaypacific.com', purchaseCategory: 'Corporate',     contactPerson: 'Alice Lam',    currentSessions: 5  },
  { accountNumber: 'CORP-2024-0002', primaryName: 'HSBC Hong Kong',         email: 'brian.wong@hsbc.com',         purchaseCategory: 'Corporate',     contactPerson: 'Brian Wong',   currentSessions: 0  },
  { accountNumber: 'CORP-2024-0003', primaryName: 'Jardine Matheson',        email: 'carol.chan@jardine.com',      purchaseCategory: 'Corporate',     contactPerson: 'Carol Chan',   currentSessions: 18 },
  { accountNumber: 'CORP-2024-0004', primaryName: 'AIA Group',               email: 'david.ho@aia.com',            purchaseCategory: 'Corporate',     contactPerson: 'David Ho',     currentSessions: 3  },
  { accountNumber: 'TA-2024-0001',   primaryName: 'Wings Travel Agency',     email: 'eric.ng@wingstravel.hk',      purchaseCategory: 'Agency', contactPerson: 'Eric Ng',      currentSessions: 12 },
  { accountNumber: 'TA-2024-0002',   primaryName: 'Pacific World Travel',    email: 'fiona@pacificworld.hk',       purchaseCategory: 'Agency', contactPerson: 'Fiona Cheung', currentSessions: 0  },
  { accountNumber: 'TA-2024-0003',   primaryName: 'Fortune Travel Group',    email: 'gary.tsang@fortunetravel.com',purchaseCategory: 'Agency', contactPerson: 'Gary Tsang',   currentSessions: 7  },
];

export const INITIAL_RECORDS: PurchaseRecord[] = [
  { id: 1,   purchaseRef: 'PKG-2024-00001',  purchaseDate: '2024-11-15', purchaseCategory: 'Individual',    accountNumber: 'ACC-2024-1001',  primaryName: 'John Smith',            primaryEmail: 'john.smith@email.com',        previousTier: 'None',    newTier: 'Gold',     creditsAdded: 8,   totalCreditsAfter: 8,   packagePrice: 32000, paymentMethod: 'Credit Card',      transactionRef: 'TXN-CC-98741',  processedBy: 'HKIAL Staff', notes: 'Initial package purchase.',         expiryDate: '2025-11-15', status: 'Invoice Sent', invoiceSentDate: '2024-11-15' },
  { id: 2,   purchaseRef: 'PKG-2024-00002',  purchaseDate: '2024-10-20', purchaseCategory: 'Individual',    accountNumber: 'ACC-2024-1003',  primaryName: 'David Lee',             primaryEmail: 'david.lee@email.com',         previousTier: 'Gold',    newTier: 'Platinum', creditsAdded: 12,  totalCreditsAfter: 14,  packagePrice: 45000, paymentMethod: 'Bank Transfer',    transactionRef: 'TXN-BT-55312',  processedBy: 'HKIAL Staff', notes: 'Upgrade from Gold.',              expiryDate: '2025-10-20', status: 'Invoice Sent', invoiceSentDate: '2024-10-20' },
  { id: 3,   purchaseRef: 'PKG-2024-00003',  purchaseDate: '2024-09-05', purchaseCategory: 'Individual',    accountNumber: 'ACC-2024-1006',  primaryName: 'Robert Wang',           primaryEmail: 'robert.wang@email.com',       previousTier: 'Gold',    newTier: 'Platinum', creditsAdded: 25,  totalCreditsAfter: 31,  packagePrice: 3500,  paymentMethod: 'Corporate Account',transactionRef: 'TXN-CA-10023',  processedBy: 'HKIAL Staff', notes: 'Corporate-sponsored upgrade.',      expiryDate: '2025-09-05', status: 'Invoice Sent', invoiceSentDate: '2024-09-05' },
  { id: 4,   purchaseRef: 'PKG-2024-00004',  purchaseDate: '2024-08-18', purchaseCategory: 'Individual',    accountNumber: 'ACC-2024-1007',  primaryName: 'Emma Wilson',           primaryEmail: 'emma.wilson@email.com',       previousTier: 'Platinum',newTier: 'Diamond',  creditsAdded: 55,  totalCreditsAfter: 60,  packagePrice: 6800,  paymentMethod: 'Credit Card',      transactionRef: 'TXN-CC-77820',  processedBy: 'HKIAL Staff', notes: 'VIP upgrade requested.',            expiryDate: '2025-08-18', status: 'Invoice Sent', invoiceSentDate: '2024-08-18' },
  { id: 5,   purchaseRef: 'PKG-2024-00005',  purchaseDate: '2024-12-01', purchaseCategory: 'Individual',    accountNumber: 'ACC-2024-1009',  primaryName: 'James Brown',           primaryEmail: 'james.brown@email.com',       previousTier: 'None',    newTier: 'Gold',     creditsAdded: 8,   totalCreditsAfter: 8,   packagePrice: 32000, paymentMethod: 'Cash',             transactionRef: 'TXN-CASH-0312', processedBy: 'HKIAL Staff', notes: '',                                  expiryDate: '2025-12-01', status: 'Pending Invoice' },
  { id: 101, purchaseRef: 'BULK-2024-00001', purchaseDate: '2024-11-10', purchaseCategory: 'Corporate',     accountNumber: 'CORP-2024-0001', primaryName: 'Cathay Pacific Airways', primaryEmail: 'alice.lam@cathaypacific.com', bundleLabel: 'Standard Bundle',  sessionsAdded: 20,  totalSessionsAfter: 20,  packagePrice: 7000,  paymentMethod: 'Corporate Account',transactionRef: 'TXN-CA-10011',  processedBy: 'HKIAL Staff', notes: 'Annual corporate package.',         expiryDate: '2025-11-10', status: 'Invoice Sent', invoiceSentDate: '2024-11-10' },
  { id: 102, purchaseRef: 'BULK-2024-00002', purchaseDate: '2024-10-05', purchaseCategory: 'Agency', accountNumber: 'TA-2024-0001',   primaryName: 'Wings Travel Agency',   primaryEmail: 'eric.ng@wingstravel.hk',      bundleLabel: 'Business Bundle',  sessionsAdded: 50,  totalSessionsAfter: 50,  packagePrice: 16000, paymentMethod: 'Bank Transfer',    transactionRef: 'TXN-BT-20045',  processedBy: 'HKIAL Staff', notes: '',                                  expiryDate: '2025-10-05', status: 'Invoice Sent', invoiceSentDate: '2024-10-05' },
  { id: 103, purchaseRef: 'BULK-2024-00003', purchaseDate: '2024-09-20', purchaseCategory: 'Corporate',     accountNumber: 'CORP-2024-0003', primaryName: 'Jardine Matheson',       primaryEmail: 'carol.chan@jardine.com',       bundleLabel: 'Enterprise Bundle', sessionsAdded: 100, totalSessionsAfter: 100, packagePrice: 28000, paymentMethod: 'Bank Transfer',    transactionRef: 'TXN-BT-19900',  processedBy: 'HKIAL Staff', notes: 'Enterprise deal — 2-year validity.',expiryDate: '2026-09-20', status: 'Invoice Sent', invoiceSentDate: '2024-09-21' },
  { id: 104, purchaseRef: 'BULK-2025-00004', purchaseDate: '2025-02-20', purchaseCategory: 'Corporate',     accountNumber: 'CORP-2024-0002', primaryName: 'HSBC Hong Kong',         primaryEmail: 'brian.wong@hsbc.com',          bundleLabel: 'Basic Bundle',     sessionsAdded: 10,  totalSessionsAfter: 10,  packagePrice: 3800,  paymentMethod: 'Corporate Account',transactionRef: 'TXN-CA-30012',  processedBy: 'HKIAL Staff', notes: '',                                  expiryDate: '2025-08-20', status: 'Pending Invoice' },
  { id: 105, purchaseRef: 'BULK-2025-00005', purchaseDate: '2025-02-22', purchaseCategory: 'Agency', accountNumber: 'TA-2024-0002',   primaryName: 'Pacific World Travel',  primaryEmail: 'fiona@pacificworld.hk',        bundleLabel: 'Standard Bundle',  sessionsAdded: 20,  totalSessionsAfter: 20,  packagePrice: 7000,  paymentMethod: 'Bank Transfer',    transactionRef: 'TXN-BT-50023',  processedBy: 'HKIAL Staff', notes: 'New agency onboarding bundle.',     expiryDate: '2026-02-22', status: 'Pending Invoice' },
];

// ─── Shared UI Helpers (exported) ─────────────────────────────────────────────

export interface TierMeta {
  color: string; bg: string; badgeBg: string; borderColor: string;
  iconName: 'user' | 'award' | 'star' | 'trophy' | 'gem';
}

export const TIER_META: Record<TierOrNone, TierMeta> = {
  None:     { color: 'text-gray-500',   bg: 'bg-gray-50',   badgeBg: 'bg-gray-100 text-gray-600',     borderColor: 'border-gray-200',   iconName: 'user'   },
  Gold:     { color: 'text-amber-600',  bg: 'bg-amber-50',  badgeBg: 'bg-amber-100 text-amber-700',   borderColor: 'border-amber-300',  iconName: 'star'   },
  Platinum: { color: 'text-purple-600', bg: 'bg-purple-50', badgeBg: 'bg-purple-100 text-purple-700', borderColor: 'border-purple-300', iconName: 'trophy' },
  Diamond:  { color: 'text-sky-600',    bg: 'bg-sky-50',    badgeBg: 'bg-sky-100 text-sky-700',       borderColor: 'border-sky-300',    iconName: 'gem'    },
  Sapphire: { color: 'text-indigo-600', bg: 'bg-indigo-50', badgeBg: 'bg-indigo-100 text-indigo-700', borderColor: 'border-indigo-300', iconName: 'gem'    },
};

export const BUNDLE_COLORS: Record<string, string> = {
  'Basic Bundle':      'bg-slate-100 text-slate-700',
  'Standard Bundle':   'bg-blue-100 text-blue-700',
  'Business Bundle':   'bg-purple-100 text-purple-700',
  'Enterprise Bundle': 'bg-amber-100 text-amber-700',
};

export function TierIcon({ name, className }: { name: TierMeta['iconName']; className?: string }) {
  const cls = className ?? 'w-4 h-4';
  if (name === 'award')  return <Award  className={cls} />;
  if (name === 'star')   return <Star   className={cls} />;
  if (name === 'trophy') return <Trophy className={cls} />;
  if (name === 'gem')    return <Gem    className={cls} />;
  return <User className={cls} />;
}

export function TierBadge({ tier }: { tier: TierOrNone }) {
  const meta = TIER_META[tier];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${meta.badgeBg}`}>
      <TierIcon name={meta.iconName} className="w-3 h-3" />{tier}
    </span>
  );
}

export function CategoryBadge({ cat }: { cat: PurchaseCategory }) {
  if (cat === 'Individual')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700"><User className="w-3 h-3" />Individual</span>;
  if (cat === 'Corporate')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700"><Building2 className="w-3 h-3" />Corporate</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700"><Plane className="w-3 h-3" />Travel Agency</span>;
}

export function StatusBadge({ status }: { status: PurchaseStatus }) {
  return status === 'Pending Invoice'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">Pending Invoice</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />Invoice Sent</span>;
}

// ─── Section header helper ───────────────────────────────────────────────────

function SectionHeader({ num, title, done }: { num: number; title: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-medium ${
        done ? 'bg-green-500 text-white' : 'bg-[#0f2942] text-white'
      }`}>
        {done ? <CheckCircle className="w-4 h-4" /> : num}
      </div>
      <h2 className="text-gray-900">{title}</h2>
    </div>
  );
}

// ─── PurchaseCreate Component ──────────────────────────────────────────────────

export interface PurchaseCreateProps {
  packages?: GradingPackage[];
  sessionBundles?: SessionBundle[];
  accounts?: AccountOption[];
  onSubmit?: (record: Omit<PurchaseRecord, 'id' | 'purchaseRef' | 'purchaseDate' | 'transactionRef' | 'processedBy' | 'status'>) => void;
  onBack?: () => void;
}

export function PurchaseCreate({
  packages: packagesProp,
  sessionBundles: sessionBundlesProp,
  accounts: accountsProp,
  onSubmit,
  onBack,
}: PurchaseCreateProps = {}) {
  const availablePackages  = packagesProp?.length  ? packagesProp  : GRADING_PACKAGES;
  const availableBundles   = sessionBundlesProp?.length ? sessionBundlesProp : SESSION_BUNDLES;
  const availableAccounts  = accountsProp?.length  ? accountsProp  : MOCK_ACCOUNTS;

  const [catFilter, setCatFilter]           = useState<'all' | PurchaseCategory>('all');
  const [acctSearch, setAcctSearch]         = useState('');
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageChoice | null>(null);
  const [paymentMethod, setPaymentMethod]   = useState<PaymentMethod>('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [purchaseNotes, setPurchaseNotes]   = useState('');
  
  // For Corporate / Travel Agency custom contract
  const [promoCodeName, setPromoCodeName]       = useState('');
  const [promoCodeQuantity, setPromoCodeQuantity] = useState('');
  const [vipAccountQuantity, setVipAccountQuantity] = useState(''); // New field for Corporate VIP account creation
  const [creditBalance, setCreditBalance]       = useState('');
  const [totalPrice, setTotalPrice]             = useState('');

  // ── Quick Fill for Demo ───────────────────────────────────────────────────
  const handleQuickFill = () => {
    // Select a Corporate account
    const corpAccount = availableAccounts.find(a => a.purchaseCategory === 'Corporate');
    if (corpAccount) {
      setSelectedAccount(corpAccount);
      setCatFilter('Corporate');
      setPromoCodeName('SPRING2026');
      setPromoCodeQuantity('200');
      setVipAccountQuantity('15');
      setTotalPrice('45000');
      setPaymentMethod('Bank Transfer');
      setTransactionRef('TXN-BT-DEMO-001');
      setPurchaseNotes('Spring 2026 corporate lounge package with VIP accounts for senior management.');
      setSelectedPackage(null);
      setCreditBalance('');
    }
  };

  const isIndividual = selectedAccount?.purchaseCategory === 'Individual';
  const isTravelAgency = selectedAccount?.purchaseCategory === 'Agency';
  const isCorporate = selectedAccount?.purchaseCategory === 'Corporate';
  
  const canConfirm = selectedAccount 
    ? (isIndividual 
        ? !!selectedPackage 
        : isTravelAgency
        ? (!!creditBalance && !!totalPrice)
        : isCorporate
        ? (!!promoCodeQuantity && !!totalPrice)
        : false)
    : false;

  // ── Filtered account list ───────────────────────────────────────────────────

  const filteredAccounts = availableAccounts.filter(a => {
    const matchCat    = catFilter === 'all' || a.purchaseCategory === catFilter;
    const matchSearch = !acctSearch ||
      a.primaryName.toLowerCase().includes(acctSearch.toLowerCase()) ||
      a.accountNumber.toLowerCase().includes(acctSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(acctSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSelectAccount = (a: AccountOption) => {
    setSelectedAccount(a);
    setSelectedPackage(null); // reset package when account changes
  };

  // ── Confirm handler ──────────────────────────────────────────────────────────

  const handleConfirm = () => {
    if (!selectedAccount) return;
    
    // For Individual: need selectedPackage
    if (isIndividual && !selectedPackage) return;
    
    // For Corporate: need quantity and price
    if (isCorporate && (!promoCodeQuantity || !totalPrice)) return;
    
    // For Travel Agency: need credit balance and price
    if (isTravelAgency && (!creditBalance || !totalPrice)) return;
    
    const newId      = Math.max(...INITIAL_RECORDS.map(r => r.id), 0) + 1;
    const today      = new Date().toISOString().split('T')[0];
    const expiry     = new Date();
    
    let record: PurchaseRecord;

    if (isIndividual && selectedPackage) {
      // Individual package purchase
      expiry.setMonth(expiry.getMonth() + selectedPackage.validityMonths);
      const expiryDate = expiry.toISOString().split('T')[0];
      
      if (selectedPackage.kind === 'grading') {
        record = {
          id: newId,
          purchaseRef: `PKG-2025-${String(newId).padStart(5, '0')}`,
          purchaseDate: today,
          purchaseCategory: 'Individual',
          accountNumber: selectedAccount.accountNumber,
          primaryName: selectedAccount.primaryName,
          primaryEmail: selectedAccount.email,
          previousTier: selectedAccount.currentTier ?? 'None',
          newTier: selectedPackage.tier,
          creditsAdded: selectedPackage.credits,
          totalCreditsAfter: selectedPackage.credits === -1 ? -1 : (selectedAccount.currentCredits ?? 0) + selectedPackage.credits,
          packagePrice: selectedPackage.price,
          paymentMethod,
          transactionRef: transactionRef || `TXN-AUTO-${newId}`,
          processedBy: 'HKIAL Staff',
          notes: purchaseNotes,
          expiryDate,
          status: 'Pending Invoice',
        };
      } else {
        record = {
          id: newId,
          purchaseRef: `BULK-2025-${String(newId).padStart(5, '0')}`,
          purchaseDate: today,
          purchaseCategory: selectedAccount.purchaseCategory,
          accountNumber: selectedAccount.accountNumber,
          primaryName: selectedAccount.primaryName,
          primaryEmail: selectedAccount.email,
          bundleLabel: selectedPackage.label,
          sessionsAdded: selectedPackage.sessions,
          totalSessionsAfter: (selectedAccount.currentSessions ?? 0) + selectedPackage.sessions,
          packagePrice: selectedPackage.price,
          paymentMethod,
          transactionRef: transactionRef || `TXN-AUTO-${newId}`,
          processedBy: 'HKIAL Staff',
          notes: purchaseNotes,
          expiryDate,
          status: 'Pending Invoice',
        };
      }
    } else if (isTravelAgency) {
      // Travel Agency custom contract
      expiry.setFullYear(expiry.getFullYear() + 1); // 12 months default
      const expiryDate = expiry.toISOString().split('T')[0];
      const balance = parseFloat(creditBalance);
      const price = parseFloat(totalPrice);
      
      record = {
        id: newId,
        purchaseRef: `BULK-2025-${String(newId).padStart(5, '0')}`,
        purchaseDate: today,
        purchaseCategory: 'Agency',
        accountNumber: selectedAccount.accountNumber,
        primaryName: selectedAccount.primaryName,
        primaryEmail: selectedAccount.email,
        bundleLabel: 'Credit Balance Contract',
        sessionsAdded: balance, // Using sessionsAdded to store credit balance
        totalSessionsAfter: (selectedAccount.currentSessions ?? 0) + balance,
        packagePrice: price,
        paymentMethod,
        transactionRef: transactionRef || `TXN-AUTO-${newId}`,
        processedBy: 'HKIAL Staff',
        notes: purchaseNotes,
        expiryDate,
        status: 'Pending Invoice',
      };
    } else {
      // Corporate custom contract
      expiry.setFullYear(expiry.getFullYear() + 1); // 12 months default
      const expiryDate = expiry.toISOString().split('T')[0];
      const qty = parseInt(promoCodeQuantity);
      const price = parseFloat(totalPrice);
      
      record = {
        id: newId,
        purchaseRef: `BULK-2025-${String(newId).padStart(5, '0')}`,
        purchaseDate: today,
        purchaseCategory: 'Corporate',
        accountNumber: selectedAccount.accountNumber,
        primaryName: selectedAccount.primaryName,
        primaryEmail: selectedAccount.email,
        bundleLabel: promoCodeName || 'Custom Contract',
        sessionsAdded: qty,
        totalSessionsAfter: (selectedAccount.currentSessions ?? 0) + qty,
        packagePrice: price,
        paymentMethod,
        transactionRef: transactionRef || `TXN-AUTO-${newId}`,
        processedBy: 'HKIAL Staff',
        notes: purchaseNotes,
        expiryDate,
        status: 'Pending Invoice',
      };
    }

    onSubmit?.({
      purchaseRef: record.purchaseRef,
      purchaseDate: record.purchaseDate,
      purchaseCategory: record.purchaseCategory,
      accountNumber: record.accountNumber,
      primaryName: record.primaryName,
      primaryEmail: record.primaryEmail,
      previousTier: record.previousTier,
      newTier: record.newTier,
      creditsAdded: record.creditsAdded,
      totalCreditsAfter: record.totalCreditsAfter,
      bundleLabel: record.bundleLabel,
      sessionsAdded: record.sessionsAdded,
      totalSessionsAfter: record.totalSessionsAfter,
      packagePrice: record.packagePrice,
      paymentMethod: record.paymentMethod,
      transactionRef: record.transactionRef,
      processedBy: record.processedBy,
      notes: record.notes,
      expiryDate: record.expiryDate,
      status: record.status,
      invoiceSentDate: record.invoiceSentDate,
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6">

      {/* Page header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0f2942] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Contract Management
        </button>
        <h1 className="text-gray-900 mb-1">New Contract</h1>
        <p className="text-sm text-gray-500">
          Select an account, choose a package, fill in payment details, then confirm.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleQuickFill}
          className="gap-1 mt-2 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border-yellow-400/50 text-yellow-700 hover:from-yellow-400/30 hover:to-amber-400/30 hover:border-yellow-500/70 hover:text-yellow-800 transition-all text-[10px] px-2 py-0.5 h-[25px]"
        >
          <Shuffle className="w-3 h-3" />
          Quick Fill Demo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column: three sections ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── Section 1: Select Account ── */}
          <Card className="p-6">
            <SectionHeader num={1} title="Select Account" done={!!selectedAccount} />

            {/* Type filter pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(['all', 'Individual', 'Corporate', 'Agency'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    catFilter === cat
                      ? 'bg-[#0f2942] text-white border-[#0f2942]'
                      : 'text-gray-600 border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  {cat === 'all' ? 'All Types' : cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, account number or email..."
                value={acctSearch}
                onChange={e => setAcctSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Account list */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredAccounts.map(a => {
                const isSel = selectedAccount?.accountNumber === a.accountNumber;
                return (
                  <div
                    key={a.accountNumber}
                    onClick={() => handleSelectAccount(a)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSel
                        ? 'border-[#0f2942] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isSel ? 'bg-[#0f2942]' : 'bg-gray-100'}`}>
                        {a.purchaseCategory === 'Individual'
                          ? <User      className={`w-4 h-4 ${isSel ? 'text-white' : 'text-gray-500'}`} />
                          : a.purchaseCategory === 'Corporate'
                          ? <Building2 className={`w-4 h-4 ${isSel ? 'text-white' : 'text-blue-500'}`} />
                          : <Plane     className={`w-4 h-4 ${isSel ? 'text-white' : 'text-purple-500'}`} />}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{a.primaryName}</p>
                        <p className="text-xs text-gray-500">
                          {a.accountNumber}
                          {a.purchaseCategory !== 'Individual' && a.contactPerson
                            ? ` · ${a.contactPerson}`
                            : ` · ${a.email}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <CategoryBadge cat={a.purchaseCategory} />
                      {a.purchaseCategory === 'Individual' ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <TierBadge tier={a.currentTier ?? 'None'} />
                          <p className="text-xs text-gray-400">{(a.currentCredits ?? 0) === -1 ? 'Unlimited' : `${a.currentCredits ?? 0} credits`}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">{a.currentSessions ?? 0} sessions</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredAccounts.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">No accounts found.</p>
              )}
            </div>
          </Card>

          {/* ── Section 2: Select Package ── */}
          <Card className="p-6">
            <SectionHeader num={2} title="Select Package" done={!!selectedPackage} />

            {/* No account yet — placeholder */}
            {!selectedAccount && (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center">
                <Package className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">Select an account above to see available packages.</p>
              </div>
            )}

            {/* Individual → Grading packages (2-column grid) */}
            {selectedAccount && isIndividual && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Grading packages include booking credits valid for 12 months.
                  Credits and tier upgrade activate after the invoice is sent.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availablePackages.map(pkg => {
                    const meta = TIER_META[pkg.tier];
                    const isSel = selectedPackage?.kind === 'grading' && (selectedPackage as GradingPackage).tier === pkg.tier;
                    return (
                      <div
                        key={pkg.tier}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSel ? `border-[#0f2942] ${meta.bg}` : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {isSel && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-4 h-4 text-[#0f2942]" />
                          </div>
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 border ${meta.borderColor} ${meta.bg}`}>
                          <span className={meta.color}><TierIcon name={meta.iconName} className="w-4 h-4" /></span>
                        </div>
                        <p className="text-sm text-gray-900 mb-0.5">{pkg.tier}</p>
                        <p className="text-xs text-gray-400 mb-2">{pkg.credits === -1 ? 'Unlimited' : `${pkg.credits} credits`} · {pkg.validityMonths}mo</p>
                        <p className={`text-sm ${meta.color}`}>HKD {pkg.price.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Corporate → Promo Code fields */}
            {selectedAccount && isCorporate && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Enter contract details for Corporate account.
                </p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="promoCodeName" className="mb-[10px] block">
                      Promo Code Name <span className="text-gray-400 text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="promoCodeName"
                      placeholder="e.g. SUMMER2025"
                      value={promoCodeName}
                      onChange={e => setPromoCodeName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="promoCodeQty" className="mb-[10px] block">
                      Promo Code Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="promoCodeQty"
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      value={promoCodeQuantity}
                      onChange={e => setPromoCodeQuantity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vipAccountQty" className="mb-[10px] block">
                      VIP Accounts to Create <span className="text-gray-400 text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="vipAccountQty"
                      type="number"
                      min="0"
                      placeholder="e.g. 10"
                      value={vipAccountQuantity}
                      onChange={e => setVipAccountQuantity(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Number of new VIP accounts to be created for this corporate customer.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="totalPrice" className="mb-[10px] block">
                      Total Price (HKD) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="totalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 50000"
                      value={totalPrice}
                      onChange={e => setTotalPrice(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Travel Agency → Credit balance fields */}
            {selectedAccount && isTravelAgency && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Enter contract details for Travel Agency account.
                </p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="creditBalance" className="mb-[10px] block">
                      Credit Balance Charging (HKD) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="creditBalance"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 50000"
                      value={creditBalance}
                      onChange={e => setCreditBalance(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalPriceTA" className="mb-[10px] block">
                      Total Price (HKD) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="totalPriceTA"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 50000"
                      value={totalPrice}
                      onChange={e => setTotalPrice(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* ── Section 3: Payment Details ── */}
          <Card className="p-6">
            <SectionHeader num={3} title="Payment Details" done={false} />

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="pm" className="mb-[10px] block">
                    Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                    <SelectTrigger id="pm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Branch Transfer">Branch Transfer</SelectItem>
                      <SelectItem value="Corporate Account">Corporate Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="txn" className="mb-[10px] block">Transaction Reference</Label>
                  <Input
                    id="txn"
                    placeholder="e.g. TXN-CC-12345 (auto-generated if blank)"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="mb-[10px] block">Notes / Remarks</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Add any notes about this purchase..."
                  value={purchaseNotes}
                  onChange={e => setPurchaseNotes(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <span className="font-medium">Pending Invoice:</span>{' '}
                  {selectedPackage?.kind === 'grading'
                    ? 'Booking credits and tier upgrade are applied only after the invoice is generated and sent.'
                    : selectedPackage?.kind === 'bundle'
                    ? 'Sessions are credited to the account only after the invoice is generated and sent.'
                    : 'Credits or sessions will be applied only after the invoice is generated and sent.'}
                </p>
              </div>
            </div>
          </Card>

          {/* ── Action buttons ── */}
          <div className="flex items-center justify-between pb-6">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Purchase
            </Button>
          </div>
        </div>

        {/* ── Right column: sticky order summary ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="p-5">
              <h3 className="text-gray-900 mb-4">Order Summary</h3>

              {!selectedAccount ? (
                <div className="flex flex-col items-center justify-center text-center py-8 px-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Info className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">Select an account and package to preview the order.</p>
                </div>
              ) : (
                <div className="space-y-4">

                  {/* Account */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Account</p>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shrink-0">
                        {selectedAccount.purchaseCategory === 'Individual'
                          ? <User      className="w-3.5 h-3.5 text-gray-500" />
                          : selectedAccount.purchaseCategory === 'Corporate'
                          ? <Building2 className="w-3.5 h-3.5 text-blue-500" />
                          : <Plane     className="w-3.5 h-3.5 text-purple-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900 truncate">{selectedAccount.primaryName}</p>
                        <p className="text-xs text-gray-500">{selectedAccount.accountNumber}</p>
                      </div>
                    </div>
                    {selectedAccount.purchaseCategory === 'Individual' ? (
                      <div className="flex items-center justify-between mt-2 px-1">
                        <span className="text-xs text-gray-400">Current tier</span>
                        <TierBadge tier={selectedAccount.currentTier ?? 'None'} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2 px-1">
                        <span className="text-xs text-gray-400">Current sessions</span>
                        <span className="text-xs text-gray-600">{selectedAccount.currentSessions ?? 0}</span>
                      </div>
                    )}
                  </div>

                  {/* Package or Custom Contract */}
                  {isIndividual && selectedPackage ? (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                        {selectedPackage.kind === 'grading' ? 'Grading Package' : 'Session Bundle'}
                      </p>
                      {selectedPackage.kind === 'grading' ? (
                        <div className={`p-3 rounded-lg border-2 ${TIER_META[selectedPackage.tier].borderColor} ${TIER_META[selectedPackage.tier].bg}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={TIER_META[selectedPackage.tier].color}>
                              <TierIcon name={TIER_META[selectedPackage.tier].iconName} className="w-4 h-4" />
                            </span>
                            <span className="text-sm text-gray-900">{selectedPackage.tier} Package</span>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap mb-1">
                            <TierBadge tier={selectedAccount.currentTier ?? 'None'} />
                            <TrendingUp className="w-3 h-3 text-gray-400" />
                            <TierBadge tier={selectedPackage.tier} />
                          </div>
                          <p className="text-xs text-gray-500">{selectedPackage.credits === -1 ? 'Unlimited credits' : `+${selectedPackage.credits} credits`} · {selectedPackage.validityMonths} months</p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-900">{selectedPackage.label}</span>
                          </div>
                          <p className="text-xs text-gray-500">{selectedPackage.sessions} sessions · {selectedPackage.validityMonths} months</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {selectedAccount.currentSessions ?? 0} → {(selectedAccount.currentSessions ?? 0) + selectedPackage.sessions} after invoice
                          </p>
                        </div>
                      )}
                    </div>
                  ) : isCorporate && (promoCodeQuantity || totalPrice) ? (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Custom Contract</p>
                      <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                        {promoCodeName && (
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-900">{promoCodeName}</span>
                          </div>
                        )}
                        {promoCodeQuantity && (
                          <p className="text-xs text-gray-500">Quantity: {promoCodeQuantity}</p>
                        )}
                        {totalPrice && (
                          <p className="text-xs text-gray-500 mt-1">Contract Value: HKD {parseFloat(totalPrice).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ) : isTravelAgency && (creditBalance || totalPrice) ? (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Credit Balance Contract</p>
                      <div className="p-3 rounded-lg border-2 border-purple-200 bg-purple-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-900">Credit Balance</span>
                        </div>
                        {creditBalance && (
                          <p className="text-xs text-gray-500">Amount: HKD {parseFloat(creditBalance).toLocaleString()}</p>
                        )}
                        {totalPrice && (
                          <p className="text-xs text-gray-500 mt-1">Contract Value: HKD {parseFloat(totalPrice).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 rounded-xl border-2 border-dashed border-gray-200 text-center">
                      <p className="text-xs text-gray-400">
                        {isIndividual ? 'No package selected yet' : 'Enter contract details'}
                      </p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{isIndividual ? 'Package price' : 'Contract price'}</span>
                      <span className="text-gray-900">
                        {isIndividual && selectedPackage 
                          ? `HKD ${selectedPackage.price.toLocaleString()}`
                          : !isIndividual && totalPrice
                          ? `HKD ${parseFloat(totalPrice).toLocaleString()}`
                          : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-sm text-gray-900">Total</span>
                      <span className="text-gray-900">
                        {isIndividual && selectedPackage 
                          ? `HKD ${selectedPackage.price.toLocaleString()}`
                          : !isIndividual && totalPrice
                          ? `HKD ${parseFloat(totalPrice).toLocaleString()}`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Payment</p>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-700">{paymentMethod}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

      </div>

    </div>
  );
}