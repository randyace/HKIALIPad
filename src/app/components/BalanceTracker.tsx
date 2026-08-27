import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, Building2, Plane, AlertTriangle, CheckCircle, XCircle, TrendingDown, ChevronDown, ChevronRight, FileText, Calendar, Edit2 } from 'lucide-react';

type AccountType = 'Corporate' | 'Agency' | 'Individual';

interface Contract {
  id: string;
  contractNumber: string;
  offerName: string;
  purchaseDate: string;
  startDate: string;
  expiryDate: string;
  sessionsTotal?: number;
  sessionsUsed?: number;
  creditLimit?: number;
  creditUsed?: number;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  notes?: string;
}

interface Account {
  id: number;
  accountNumber: string;
  name: string;
  accountType: AccountType;
  contactEmail: string;
  contracts: Contract[];
}

const MOCK_ACCOUNTS: Account[] = [
  {
    id: 1,
    accountNumber: 'CORP-2024-0001',
    name: 'Cathay Pacific Airways',
    accountType: 'Corporate',
    contactEmail: 'alice.lam@cathaypacific.com',
    contracts: [
      { id: 'C1-1', contractNumber: 'CT-2024-0001', offerName: 'Standard Bundle', purchaseDate: '2024-05-10', startDate: '2024-05-15', expiryDate: '2025-11-10', sessionsTotal: 20, sessionsUsed: 15, status: 'Active', notes: 'Annual corporate package' },
      { id: 'C1-2', contractNumber: 'CT-2024-0056', offerName: 'VIP Executive Add-on', purchaseDate: '2024-11-01', startDate: '2024-11-05', expiryDate: '2025-05-05', sessionsTotal: 10, sessionsUsed: 3, status: 'Active', notes: 'Executive lounge access' }
    ]
  },
  {
    id: 2,
    accountNumber: 'CORP-2024-0002',
    name: 'HSBC Hong Kong',
    accountType: 'Corporate',
    contactEmail: 'brian.wong@hsbc.com',
    contracts: [
      { id: 'C2-1', contractNumber: 'CT-2024-0012', offerName: 'Basic Bundle', purchaseDate: '2024-02-20', startDate: '2024-02-20', expiryDate: '2025-08-20', sessionsTotal: 10, sessionsUsed: 0, status: 'Active', notes: '' }
    ]
  },
  {
    id: 3,
    accountNumber: 'CORP-2024-0003',
    name: 'Jardine Matheson',
    accountType: 'Corporate',
    contactEmail: 'carol.chan@jardine.com',
    contracts: [
      { id: 'C3-1', contractNumber: 'CT-2023-0089', offerName: 'Enterprise Bundle', purchaseDate: '2023-09-20', startDate: '2023-09-20', expiryDate: '2026-09-20', sessionsTotal: 100, sessionsUsed: 82, status: 'Active', notes: 'Multi-year enterprise contract' },
      { id: 'C3-2', contractNumber: 'CT-2024-0102', offerName: 'Premium Lounge Access', purchaseDate: '2024-12-10', startDate: '2024-12-15', expiryDate: '2025-06-15', sessionsTotal: 25, sessionsUsed: 8, status: 'Active', notes: 'Additional premium tier' }
    ]
  },
  {
    id: 4,
    accountNumber: 'CORP-2024-0004',
    name: 'AIA Group',
    accountType: 'Corporate',
    contactEmail: 'david.ho@aia.com',
    contracts: [
      { id: 'C4-1', contractNumber: 'CT-2024-0028', offerName: 'Basic Bundle', purchaseDate: '2024-06-15', startDate: '2024-06-15', expiryDate: '2025-06-15', sessionsTotal: 10, sessionsUsed: 7, status: 'Expiring Soon', notes: '' }
    ]
  },
  {
    id: 5,
    accountNumber: 'TA-2024-0001',
    name: 'Wings Travel Agency',
    accountType: 'Agency',
    contactEmail: 'eric.ng@wingstravel.hk',
    contracts: [
      { id: 'C5-1', contractNumber: 'CT-2024-0045', offerName: 'Business Credit Account', purchaseDate: '2024-04-05', startDate: '2024-04-10', expiryDate: '2025-10-05', creditLimit: 160000, creditUsed: 121600, status: 'Active', notes: 'High-volume travel agency' },
      { id: 'C5-2', contractNumber: 'CT-2025-0003', offerName: 'Spring Promotion Credit', purchaseDate: '2025-01-15', startDate: '2025-02-01', expiryDate: '2025-05-31', creditLimit: 50000, creditUsed: 12000, status: 'Active', notes: 'Seasonal promotional offer' }
    ]
  },
  {
    id: 6,
    accountNumber: 'TA-2024-0002',
    name: 'Pacific World Travel',
    accountType: 'Agency',
    contactEmail: 'fiona@pacificworld.hk',
    contracts: [
      { id: 'C6-1', contractNumber: 'CT-2025-0022', offerName: 'Standard Credit Account', purchaseDate: '2025-02-22', startDate: '2025-02-22', expiryDate: '2026-02-22', creditLimit: 70000, creditUsed: 0, status: 'Active', notes: 'New agency onboarding' }
    ]
  },
  {
    id: 7,
    accountNumber: 'TA-2024-0003',
    name: 'Fortune Travel Group',
    accountType: 'Agency',
    contactEmail: 'gary.tsang@fortunetravel.com',
    contracts: [
      { id: 'C7-1', contractNumber: 'CT-2024-0033', offerName: 'Business Credit Account', purchaseDate: '2024-01-01', startDate: '2024-01-01', expiryDate: '2025-07-01', creditLimit: 160000, creditUsed: 137600, status: 'Expiring Soon', notes: 'Renewal pending' },
      { id: 'C7-2', contractNumber: 'CT-2024-0089', offerName: 'Exclusive VIP Credit', purchaseDate: '2024-09-15', startDate: '2024-10-01', expiryDate: '2025-09-30', creditLimit: 80000, creditUsed: 45000, status: 'Active', notes: 'VIP client tier' }
    ]
  },
  {
    id: 8,
    accountNumber: 'ACC-2024-1001',
    name: 'John Smith',
    accountType: 'Individual',
    contactEmail: 'john.smith@email.com',
    contracts: [
      { id: 'C8-1', contractNumber: 'CT-2024-1001', offerName: 'Gold Package', purchaseDate: '2024-05-15', startDate: '2024-05-15', expiryDate: '2025-11-15', sessionsTotal: 8, sessionsUsed: 3, status: 'Active', notes: '' }
    ]
  },
  {
    id: 9,
    accountNumber: 'ACC-2024-1003',
    name: 'David Lee',
    accountType: 'Individual',
    contactEmail: 'david.lee@email.com',
    contracts: [
      { id: 'C9-1', contractNumber: 'CT-2024-1003', offerName: 'Gold Package', purchaseDate: '2024-04-20', startDate: '2024-04-20', expiryDate: '2025-10-20', sessionsTotal: 12, sessionsUsed: 4, status: 'Active', notes: 'Frequent traveler' }
    ]
  },
  {
    id: 10,
    accountNumber: 'ACC-2024-1006',
    name: 'Robert Wang',
    accountType: 'Individual',
    contactEmail: 'robert.wang@email.com',
    contracts: [
      { id: 'C10-1', contractNumber: 'CT-2024-1006', offerName: 'Platinum Package', purchaseDate: '2024-03-05', startDate: '2024-03-05', expiryDate: '2025-09-05', sessionsTotal: 25, sessionsUsed: 10, status: 'Active', notes: '' },
      { id: 'C10-2', contractNumber: 'CT-2024-1089', offerName: 'Family Add-on', purchaseDate: '2024-08-10', startDate: '2024-08-15', expiryDate: '2025-08-15', sessionsTotal: 10, sessionsUsed: 2, status: 'Active', notes: 'Family members access' }
    ]
  },
  {
    id: 11,
    accountNumber: 'ACC-2024-1012',
    name: 'Sarah Chen',
    accountType: 'Individual',
    contactEmail: 'sarah.chen@email.com',
    contracts: [
      { id: 'C11-1', contractNumber: 'CT-2024-1012', offerName: 'Gold Package', purchaseDate: '2024-06-10', startDate: '2024-06-10', expiryDate: '2025-12-10', sessionsTotal: 8, sessionsUsed: 2, status: 'Active', notes: '' }
    ]
  },
  {
    id: 12,
    accountNumber: 'ACC-2024-1015',
    name: 'Emma Wilson',
    accountType: 'Individual',
    contactEmail: 'emma.wilson@email.com',
    contracts: [
      { id: 'C12-1', contractNumber: 'CT-2024-1015', offerName: 'Gold Package', purchaseDate: '2024-07-20', startDate: '2024-07-20', expiryDate: '2026-01-20', sessionsTotal: 8, sessionsUsed: 1, status: 'Active', notes: '' }
    ]
  },
  {
    id: 13,
    accountNumber: 'ACC-2024-1018',
    name: 'Michael Brown',
    accountType: 'Individual',
    contactEmail: 'michael.brown@email.com',
    contracts: [
      { id: 'C13-1', contractNumber: 'CT-2024-1018', offerName: 'Gold Package', purchaseDate: '2024-03-15', startDate: '2024-03-15', expiryDate: '2025-09-15', sessionsTotal: 12, sessionsUsed: 8, status: 'Active', notes: '' }
    ]
  },
  {
    id: 14,
    accountNumber: 'ACC-2024-1021',
    name: 'Lisa Taylor',
    accountType: 'Individual',
    contactEmail: 'lisa.taylor@email.com',
    contracts: [
      { id: 'C14-1', contractNumber: 'CT-2024-1021', offerName: 'Gold Package', purchaseDate: '2024-08-05', startDate: '2024-08-05', expiryDate: '2026-02-05', sessionsTotal: 12, sessionsUsed: 3, status: 'Active', notes: 'Premium traveler' }
    ]
  },
  {
    id: 15,
    accountNumber: 'ACC-2024-1024',
    name: 'James Anderson',
    accountType: 'Individual',
    contactEmail: 'james.anderson@email.com',
    contracts: [
      { id: 'C15-1', contractNumber: 'CT-2024-1024', offerName: 'Platinum Package', purchaseDate: '2024-02-10', startDate: '2024-02-10', expiryDate: '2025-08-10', sessionsTotal: 25, sessionsUsed: 18, status: 'Active', notes: 'Business executive' }
    ]
  },
  {
    id: 16,
    accountNumber: 'ACC-2024-1027',
    name: 'Sophia Martinez',
    accountType: 'Individual',
    contactEmail: 'sophia.martinez@email.com',
    contracts: [
      { id: 'C16-1', contractNumber: 'CT-2024-1027', offerName: 'Platinum Package', purchaseDate: '2024-09-12', startDate: '2024-09-12', expiryDate: '2026-03-12', sessionsTotal: 25, sessionsUsed: 5, status: 'Active', notes: '' }
    ]
  },
  {
    id: 17,
    accountNumber: 'ACC-2024-1030',
    name: 'Christopher Lee',
    accountType: 'Individual',
    contactEmail: 'chris.lee@email.com',
    contracts: [
      { id: 'C17-1', contractNumber: 'CT-2024-1030', offerName: 'Diamond Package', purchaseDate: '2024-01-20', startDate: '2024-01-20', expiryDate: '2025-07-20', sessionsTotal: 50, sessionsUsed: 35, status: 'Active', notes: 'VIP member' }
    ]
  },
  {
    id: 18,
    accountNumber: 'ACC-2024-1033',
    name: 'Olivia Zhang',
    accountType: 'Individual',
    contactEmail: 'olivia.zhang@email.com',
    contracts: [
      { id: 'C18-1', contractNumber: 'CT-2024-1033', offerName: 'Diamond Package', purchaseDate: '2024-04-15', startDate: '2024-04-15', expiryDate: '2025-10-15', sessionsTotal: 50, sessionsUsed: 12, status: 'Active', notes: 'Elite frequent flyer' }
    ]
  },
  {
    id: 19,
    accountNumber: 'ACC-2024-1036',
    name: 'Daniel Kim',
    accountType: 'Individual',
    contactEmail: 'daniel.kim@email.com',
    contracts: [
      { id: 'C19-1', contractNumber: 'CT-2024-1036', offerName: 'Diamond Package', purchaseDate: '2024-10-05', startDate: '2024-10-05', expiryDate: '2026-04-05', sessionsTotal: 50, sessionsUsed: 8, status: 'Active', notes: '' }
    ]
  },
  {
    id: 20,
    accountNumber: 'ACC-2023-0892',
    name: 'Victoria Chan',
    accountType: 'Individual',
    contactEmail: 'victoria.chan@email.com',
    contracts: [
      { id: 'C20-1', contractNumber: 'CT-2023-0892', offerName: 'Gold Package', purchaseDate: '2023-12-05', startDate: '2023-12-05', expiryDate: '2025-06-05', sessionsTotal: 8, sessionsUsed: 8, status: 'Expiring Soon', notes: '' }
    ]
  },
  {
    id: 21,
    accountNumber: 'ACC-2024-1040',
    name: 'Thomas Wu',
    accountType: 'Individual',
    contactEmail: 'thomas.wu@email.com',
    contracts: [
      { id: 'C21-1', contractNumber: 'CT-2024-1040', offerName: 'Gold Package', purchaseDate: '2024-11-18', startDate: '2024-11-18', expiryDate: '2026-05-18', sessionsTotal: 12, sessionsUsed: 0, status: 'Active', notes: 'Recent upgrade from Gold' }
    ]
  },
];

type BalanceStatus = 'critical' | 'low' | 'ok' | 'full' | 'depleted';

function getBalanceStatus(used: number, total: number): BalanceStatus {
  const remaining = total - used;
  const pct = total > 0 ? ((total - used) / total) * 100 : 0;
  if (remaining === 0) return 'depleted';
  if (pct <= 10) return 'critical';
  if (pct <= 30) return 'low';
  if (used === 0) return 'full';
  return 'ok';
}

const STATUS_CONFIG: Record<BalanceStatus, { label: string; barColor: string; textColor: string; bg: string; icon: React.ReactNode }> = {
  full:     { label: 'Full',     barColor: 'bg-blue-500',   textColor: 'text-blue-700',  bg: 'bg-blue-50',   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  ok:       { label: 'OK',       barColor: 'bg-green-500',  textColor: 'text-green-700', bg: 'bg-green-50',  icon: <CheckCircle className="w-3.5 h-3.5" /> },
  low:      { label: 'Low',      barColor: 'bg-amber-500',  textColor: 'text-amber-700', bg: 'bg-amber-50',  icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  critical: { label: 'Critical', barColor: 'bg-red-500',    textColor: 'text-red-700',   bg: 'bg-red-50',    icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  depleted: { label: 'Depleted', barColor: 'bg-gray-300',   textColor: 'text-gray-500',  bg: 'bg-gray-50',   icon: <XCircle className="w-3.5 h-3.5" /> },
};

function BalanceBadge({ used, total }: { used: number; total: number }) {
  const status = getBalanceStatus(used, total);
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cfg.bg} ${cfg.textColor}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function SessionBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const status = getBalanceStatus(used, total);
  const remaining = total - used;
  return (
    <div className="min-w-[140px]">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs ${STATUS_CONFIG[status].textColor}`}>
          {remaining}/{total} remaining
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${STATUS_CONFIG[status].barColor}`}
          style={{ width: `${100 - pct}%` }} />
      </div>
    </div>
  );
}

function CreditBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const status = getBalanceStatus(used, total);
  const remaining = total - used;
  return (
    <div className="min-w-[140px]">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs ${STATUS_CONFIG[status].textColor}`}>
          HKD {remaining.toLocaleString()} remaining
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${STATUS_CONFIG[status].barColor}`}
          style={{ width: `${100 - pct}%` }} />
      </div>
    </div>
  );
}

function ContractStatusBadge({ status }: { status: Contract['status'] }) {
  const colors = {
    'Active': 'bg-green-100 text-green-800',
    'Expiring Soon': 'bg-amber-100 text-amber-800',
    'Expired': 'bg-red-100 text-red-800'
  };
  return <Badge className={colors[status]}>{status}</Badge>;
}

// ── Props interface ───────────────────────────────────────────────────────────
export interface BalanceTrackerProps {
  /** Pass populated array from CI4; falls back to MOCK_ACCOUNTS when empty */
  contracts?: Account[];
  onViewContract?: (id: string) => void;
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function BalanceTracker({
  contracts: contractsProp = [],
  onViewContract,
  isLoading = false,
}: BalanceTrackerProps = {}) {
  const displayAccounts = contractsProp.length > 0 ? contractsProp : MOCK_ACCOUNTS;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | AccountType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | BalanceStatus>('all');
  const [filterMembership, setFilterMembership] = useState<'all' | 'Gold' | 'Platinum' | 'Diamond' | 'Sapphire'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Applied filters (used for actual filtering)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedFilterType, setAppliedFilterType] = useState<'all' | AccountType>('all');
  const [appliedFilterStatus, setAppliedFilterStatus] = useState<'all' | BalanceStatus>('all');
  const [appliedFilterMembership, setAppliedFilterMembership] = useState<'all' | 'Gold' | 'Platinum' | 'Diamond' | 'Sapphire'>('all');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set(MOCK_ACCOUNTS.map(acc => acc.id))); // Expand all by default
  const [editingContract, setEditingContract] = useState<{ contract: Contract; accountType: AccountType } | null>(null);
  const [editForm, setEditForm] = useState({ expiryDate: '', sessionsTotal: 0, sessionsUsed: 0, creditLimit: 0, creditUsed: 0 });

  const toggleRow = (accountId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedFilterType(filterType);
    setAppliedFilterStatus(filterStatus);
    setAppliedFilterMembership(filterMembership);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterMembership('all');
    setDateFrom('');
    setDateTo('');
    setAppliedSearchTerm('');
    setAppliedFilterType('all');
    setAppliedFilterStatus('all');
    setAppliedFilterMembership('all');
    setAppliedDateFrom('');
    setAppliedDateTo('');
  };

  const handleEditContract = (contract: Contract, accountType: AccountType) => {
    setEditingContract({ contract, accountType });
    setEditForm({
      expiryDate: contract.expiryDate,
      sessionsTotal: contract.sessionsTotal || 0,
      sessionsUsed: contract.sessionsUsed || 0,
      creditLimit: contract.creditLimit || 0,
      creditUsed: contract.creditUsed || 0
    });
  };

  const handleSaveContract = () => {
    // In a real app, this would update the backend
    console.log('Saving contract:', editingContract?.contract.contractNumber, editForm);
    setEditingContract(null);
  };

  const calculateAccountTotals = (account: Account) => {
    if (account.accountType === 'Agency') {
      const totalCredit = account.contracts.reduce((sum, c) => sum + (c.creditLimit || 0), 0);
      const usedCredit = account.contracts.reduce((sum, c) => sum + (c.creditUsed || 0), 0);
      return { total: totalCredit, used: usedCredit };
    } else {
      const totalSessions = account.contracts.reduce((sum, c) => sum + (c.sessionsTotal || 0), 0);
      const usedSessions = account.contracts.reduce((sum, c) => sum + (c.sessionsUsed || 0), 0);
      return { total: totalSessions, used: usedSessions };
    }
  };

  const filtered = MOCK_ACCOUNTS.filter(acc => {
    const matchSearch = !appliedSearchTerm
      || acc.name.toLowerCase().includes(appliedSearchTerm.toLowerCase())
      || acc.accountNumber.toLowerCase().includes(appliedSearchTerm.toLowerCase());
    const matchType = appliedFilterType === 'all' || acc.accountType === appliedFilterType;
    
    // Membership filter - only applies to Individual accounts
    let matchMembership = true;
    if (appliedFilterMembership !== 'all') {
      if (acc.accountType === 'Individual') {
        // Check if any contract matches the membership type
        matchMembership = acc.contracts.some(contract => 
          contract.offerName.includes(`${appliedFilterMembership} Package`)
        );
      } else {
        // For non-Individual accounts, membership filter doesn't apply
        matchMembership = false;
      }
    }
    
    const totals = calculateAccountTotals(acc);
    const matchStatus = appliedFilterStatus === 'all' || getBalanceStatus(totals.used, totals.total) === appliedFilterStatus;
    
    // Date range filter - check if any contract's expiry date falls within the range
    let matchDate = true;
    if (appliedDateFrom || appliedDateTo) {
      matchDate = acc.contracts.some(contract => {
        const expiryDate = new Date(contract.expiryDate);
        const from = appliedDateFrom ? new Date(appliedDateFrom) : null;
        const to = appliedDateTo ? new Date(appliedDateTo) : null;
        
        if (from && to) {
          return expiryDate >= from && expiryDate <= to;
        } else if (from) {
          return expiryDate >= from;
        } else if (to) {
          return expiryDate <= to;
        }
        return true;
      });
    }
    
    return matchSearch && matchType && matchMembership && matchStatus && matchDate;
  });

  // Calculate stats
  const totalContracts = MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.contracts.length, 0);
  const allContracts = MOCK_ACCOUNTS.flatMap(acc => 
    acc.contracts.map(c => ({ ...c, accountType: acc.accountType }))
  );
  
  const criticalCount = MOCK_ACCOUNTS.filter(acc => {
    const totals = calculateAccountTotals(acc);
    return ['critical', 'depleted'].includes(getBalanceStatus(totals.used, totals.total));
  }).length;

  const lowCount = MOCK_ACCOUNTS.filter(acc => {
    const totals = calculateAccountTotals(acc);
    return getBalanceStatus(totals.used, totals.total) === 'low';
  }).length;

  const totalSessions = MOCK_ACCOUNTS
    .filter(a => a.accountType !== 'Agency')
    .reduce((sum, acc) => {
      const totals = calculateAccountTotals(acc);
      return sum + totals.total;
    }, 0);
  
  const usedSessions = MOCK_ACCOUNTS
    .filter(a => a.accountType !== 'Agency')
    .reduce((sum, acc) => {
      const totals = calculateAccountTotals(acc);
      return sum + totals.used;
    }, 0);

  const daysUntilExpiry = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-1">Contract Management</h1>
        <p className="text-sm text-gray-500">Manage and track all active contracts with multiple offers per account.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-[#0f2942] text-white">
          <p className="text-xs text-blue-200 mb-1">Total Contracts</p>
          <p className="text-2xl text-white">{totalContracts}</p>
          <p className="text-xs text-blue-300 mt-1">{MOCK_ACCOUNTS.length} accounts</p>
        </Card>
        <Card className="p-4 border-2 border-red-300 bg-red-50">
          <div className="flex items-center gap-1 mb-1"><AlertTriangle className="w-4 h-4 text-red-600" /><p className="text-xs text-red-700">Critical / Depleted</p></div>
          <p className="text-2xl text-red-600">{criticalCount}</p>
          <p className="text-xs text-gray-500 mt-1">Needs attention</p>
        </Card>
        <Card className="p-4 border-2 border-amber-300 bg-amber-50">
          <div className="flex items-center gap-1 mb-1"><TrendingDown className="w-4 h-4 text-amber-600" /><p className="text-xs text-amber-700">Low Balance</p></div>
          <p className="text-2xl text-amber-600">{lowCount}</p>
          <p className="text-xs text-gray-500 mt-1">≤ 30% remaining</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 mb-1">Session Utilisation</p>
          <p className="text-2xl text-gray-900">{totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0}%</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${totalSessions > 0 ? (usedSessions / totalSessions) * 100 : 0}%` }} />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search by name or account number..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Account Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Account Types</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Agency">Agency</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMembership} onValueChange={(v: any) => setFilterMembership(v)}>
              <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Membership Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Membership</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
                <SelectItem value="Diamond">Diamond</SelectItem>
                <SelectItem value="Sapphire">Sapphire</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="ok">OK</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <Label className="text-sm text-gray-600 lg:min-w-fit">Contract Expiry Date Range:</Label>
            <div className="flex flex-col sm:flex-row gap-2 items-center flex-1">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
                className="w-full sm:w-44"
              />
              <span className="text-gray-400">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
                className="w-full sm:w-44"
              />
            </div>
            <div className="flex gap-2 lg:ml-auto">
              <Button variant="outline" onClick={handleClearFilters} className="flex-1 lg:flex-none">
                Clear Filters
              </Button>
              <Button className="bg-[#0f2942] hover:bg-[#1a3d5c] flex-1 lg:flex-none" onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contracts</TableHead>
                <TableHead>Total Balance</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-10">No accounts found.</TableCell></TableRow>
              ) : filtered.flatMap(account => {
                const totals = calculateAccountTotals(account);
                const isExpanded = expandedRows.has(account.id);
                
                const accountRow = (
                  <TableRow key={`account-${account.id}`} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow(account.id)}>
                    <TableCell>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.accountNumber}</p>
                    </TableCell>
                    <TableCell>
                      {account.accountType === 'Corporate'
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800"><Building2 className="w-3 h-3" />Corporate</span>
                        : account.accountType === 'Agency'
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800"><Plane className="w-3 h-3" />Agency</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">Individual</span>}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-900">{account.contracts.length}</span>
                      <span className="text-xs text-gray-500 ml-1">active</span>
                    </TableCell>
                    <TableCell>
                      {account.accountType === 'Agency'
                        ? <CreditBar used={totals.used} total={totals.total} />
                        : <SessionBar used={totals.used} total={totals.total} />}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {account.accountType === 'Agency'
                        ? `HKD ${totals.used.toLocaleString()}/HKD ${totals.total.toLocaleString()}`
                        : `${totals.used}/${totals.total}`}
                    </TableCell>
                    <TableCell>
                      <BalanceBadge used={totals.used} total={totals.total} />
                    </TableCell>
                  </TableRow>
                );

                if (!isExpanded) {
                  return [accountRow];
                }

                const contractRows = account.contracts.map((contract, idx) => {
                  const days = daysUntilExpiry(contract.expiryDate);
                  const expiryColor = days < 30 ? 'text-red-600' : days < 90 ? 'text-amber-600' : 'text-gray-600';
                  
                  return (
                    <TableRow key={`contract-${contract.id}`} className="bg-gray-50/50">
                      <TableCell></TableCell>
                      <TableCell colSpan={6}>
                        <div className="pl-8 pr-4 py-3">
                          <div className="grid grid-cols-12 gap-4 items-start">
                            {/* Contract Info */}
                            <div className="col-span-3">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-900">{contract.contractNumber}</p>
                              </div>
                              <p className="text-xs text-gray-600 ml-6">{contract.offerName}</p>
                            </div>

                            {/* Dates */}
                            <div className="col-span-3">
                              <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500">Start: {contract.startDate}</p>
                                  <p className={`text-xs ${expiryColor}`}>Expiry: {contract.expiryDate}</p>
                                  <p className={`text-xs ${expiryColor} font-medium`}>
                                    {days < 0 ? 'Expired' : `${days} days left`}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Balance */}
                            <div className="col-span-3">
                              {account.accountType === 'Agency' ? (
                                <>
                                  <p className="text-xs text-gray-500 mb-1">Credit Balance</p>
                                  <CreditBar used={contract.creditUsed || 0} total={contract.creditLimit || 0} />
                                </>
                              ) : (
                                <>
                                  <p className="text-xs text-gray-500 mb-1">Session Balance</p>
                                  <SessionBar used={contract.sessionsUsed || 0} total={contract.sessionsTotal || 0} />
                                </>
                              )}
                            </div>

                            {/* Status, Notes & Actions */}
                            <div className="col-span-3">
                              <div className="flex items-center gap-2 mb-2">
                                <ContractStatusBadge status={contract.status} />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditContract(contract, account.accountType);
                                  }}
                                >
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                              {contract.notes && (
                                <p className="text-xs text-gray-500 italic">{contract.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                });

                return [accountRow, ...contractRows];
              })}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-3 border-t text-xs text-gray-500">
          Showing {filtered.length} accounts with {filtered.reduce((sum, acc) => sum + acc.contracts.length, 0)} total contracts
        </div>
      </Card>

      {/* Edit Contract Dialog */}
      <Dialog open={!!editingContract} onOpenChange={() => setEditingContract(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contract</DialogTitle>
            <DialogDescription>
              Update contract details for {editingContract?.contract.contractNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="mb-[10px] block">Expiry Date *</Label>
              <Input
                type="date"
                value={editForm.expiryDate}
                onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
              />
            </div>

            {editingContract?.accountType === 'Agency' ? (
              <>
                <div>
                  <Label className="mb-[10px] block">Credit Limit (HKD) *</Label>
                  <Input
                    type="number"
                    value={editForm.creditLimit}
                    onChange={(e) => setEditForm({ ...editForm, creditLimit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="mb-[10px] block">Credit Used (HKD) *</Label>
                  <Input
                    type="number"
                    value={editForm.creditUsed}
                    onChange={(e) => setEditForm({ ...editForm, creditUsed: Number(e.target.value) })}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="mb-[10px] block">Total Sessions *</Label>
                  <Input
                    type="number"
                    value={editForm.sessionsTotal}
                    onChange={(e) => setEditForm({ ...editForm, sessionsTotal: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="mb-[10px] block">Used Sessions *</Label>
                  <Input
                    type="number"
                    value={editForm.sessionsUsed}
                    onChange={(e) => setEditForm({ ...editForm, sessionsUsed: Number(e.target.value) })}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditingContract(null)}>
                Cancel
              </Button>
              <Button className="bg-[#0f2942] hover:bg-[#1a3d5c]" onClick={handleSaveContract}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}