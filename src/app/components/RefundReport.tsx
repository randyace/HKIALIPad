import { useState, useMemo } from 'react';
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
import {
  RotateCcw,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  FileText,
  Calendar,
  User,
  Building2,
  Plane,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type RefundStatus = 'Pending Review' | 'Processing' | 'Completed' | 'Cancelled';
type AccountType = 'Individual' | 'Corporate' | 'Agency';
type AdjustmentReason =
  | 'Suite Downgrade'
  | 'Guest Count Reduction'
  | 'Add-on Service Removed'
  | 'Promo Code Applied'
  | 'Travel Agency Discount Correction'
  | 'Manual Adjustment by Staff'
  | 'Booking Date Change'
  | 'Flight Class Change';

interface RefundRecord {
  id: number;
  refundNo: string;
  bookingNo: string;
  accountNo: string;
  accountName: string;
  accountType: AccountType;
  bookingDate: string;
  adjustmentDate: string;
  originalAmount: number;
  revisedAmount: number;
  refundAmount: number;
  paymentMethod: 'Upfront' | 'Net Upfront' | 'On-Credit' | 'Bulk Purchase/Monthly Invoice';
  adjustmentReason: AdjustmentReason;
  adjustmentDetail: string;
  status: RefundStatus;
  processedDate?: string;
  processedBy?: string;
  financeNotes?: string;
  suite: string;
  flightNo: string;
  agencyDiscountApplied?: boolean;
  promoCodeApplied?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_REFUND_RECORDS: RefundRecord[] = [
  {
    id: 1,
    refundNo: 'RF-202601-000001',
    bookingNo: 'A-202601-000012',
    accountNo: 'ACC-2024-0012',
    accountName: 'John Smith',
    accountType: 'Individual',
    bookingDate: '2026-01-08',
    adjustmentDate: '2026-01-10',
    originalAmount: 8500,
    revisedAmount: 6200,
    refundAmount: 2300,
    paymentMethod: 'Upfront',
    adjustmentReason: 'Suite Downgrade',
    adjustmentDetail: 'Customer requested downgrade from VIP Suite A to Executive Suite due to availability concerns.',
    status: 'Completed',
    processedDate: '2026-01-12',
    processedBy: 'Alice Chan',
    financeNotes: 'Refund issued via original payment method. Confirmation sent to customer.',
    suite: 'Executive Suite',
    flightNo: 'CX234',
  },
  {
    id: 2,
    refundNo: 'RF-202601-000002',
    bookingNo: 'A-202601-000027',
    accountNo: 'CORP-2023-0045',
    accountName: 'HSBC Holdings Ltd',
    accountType: 'Corporate',
    bookingDate: '2026-01-12',
    adjustmentDate: '2026-01-14',
    originalAmount: 22000,
    revisedAmount: 17500,
    refundAmount: 4500,
    paymentMethod: 'On-Credit',
    adjustmentReason: 'Guest Count Reduction',
    adjustmentDetail: 'Corporate party reduced from 8 guests to 6 guests due to travel schedule change.',
    status: 'Processing',
    financeNotes: 'Credit note to be issued. Pending approval from finance manager.',
    suite: 'VIP Suite A',
    flightNo: 'BA028',
  },
  {
    id: 3,
    refundNo: 'RF-202601-000003',
    bookingNo: 'A-202601-000038',
    accountNo: 'TA-KL-001-ACC',
    accountName: 'Klook Travel',
    accountType: 'Agency',
    bookingDate: '2026-01-15',
    adjustmentDate: '2026-01-16',
    originalAmount: 15000,
    revisedAmount: 11250,
    refundAmount: 3750,
    paymentMethod: 'Bulk Purchase/Monthly Invoice',
    adjustmentReason: 'Travel Agency Discount Correction',
    adjustmentDetail: 'Agency discount rate of 25% was incorrectly not applied at time of booking. Corrected to standard rate.',
    status: 'Pending Review',
    suite: 'Premier Suite',
    flightNo: 'SQ001',
    agencyDiscountApplied: true,
  },
  {
    id: 4,
    refundNo: 'RF-202601-000004',
    bookingNo: 'A-202601-000051',
    accountNo: 'ACC-2024-0099',
    accountName: 'Mary Johnson',
    accountType: 'Individual',
    bookingDate: '2026-01-18',
    adjustmentDate: '2026-01-19',
    originalAmount: 5800,
    revisedAmount: 4800,
    refundAmount: 1000,
    paymentMethod: 'Upfront',
    adjustmentReason: 'Add-on Service Removed',
    adjustmentDetail: 'Limousine transfer service cancelled by customer 48 hours before booking.',
    status: 'Completed',
    processedDate: '2026-01-21',
    processedBy: 'Bob Leung',
    financeNotes: 'HK$1,000 refunded to original credit card ending in 4523.',
    suite: 'Business Suite',
    flightNo: 'QF30',
  },
  {
    id: 5,
    refundNo: 'RF-202601-000005',
    bookingNo: 'A-202601-000063',
    accountNo: 'CORP-2024-0018',
    accountName: 'Cathay Pacific Airways Ltd',
    accountType: 'Corporate',
    bookingDate: '2026-01-20',
    adjustmentDate: '2026-01-22',
    originalAmount: 35000,
    revisedAmount: 28000,
    refundAmount: 7000,
    paymentMethod: 'Bulk Purchase/Monthly Invoice',
    adjustmentReason: 'Manual Adjustment by Staff',
    adjustmentDetail: 'Price corrected following contract rate renegotiation. New corporate rate applied retroactively.',
    status: 'Pending Review',
    suite: 'VIP Suite A',
    flightNo: 'CX100',
  },
  {
    id: 6,
    refundNo: 'RF-202601-000006',
    bookingNo: 'A-202601-000074',
    accountNo: 'ACC-2025-0201',
    accountName: 'David Lee',
    accountType: 'Individual',
    bookingDate: '2026-01-22',
    adjustmentDate: '2026-01-23',
    originalAmount: 4200,
    revisedAmount: 3780,
    refundAmount: 420,
    paymentMethod: 'Upfront',
    adjustmentReason: 'Promo Code Applied',
    adjustmentDetail: 'Promo code DIAMOND15 applied retrospectively after guest verification confirmed Diamond membership.',
    status: 'Completed',
    processedDate: '2026-01-25',
    processedBy: 'Alice Chan',
    financeNotes: 'Refund processed. 10% discount applied to original booking total.',
    suite: 'Open Lounge',
    flightNo: 'NH872',
    promoCodeApplied: 'DIAMOND15',
  },
  {
    id: 7,
    refundNo: 'RF-202602-000001',
    bookingNo: 'A-202602-000008',
    accountNo: 'TA-EG-001-ACC',
    accountName: 'EGL Tours',
    accountType: 'Agency',
    bookingDate: '2026-02-03',
    adjustmentDate: '2026-02-05',
    originalAmount: 18500,
    revisedAmount: 14800,
    refundAmount: 3700,
    paymentMethod: 'Net Upfront',
    adjustmentReason: 'Booking Date Change',
    adjustmentDetail: 'Booking rescheduled to off-peak period resulting in lower pricing tier.',
    status: 'Processing',
    financeNotes: 'Awaiting bank transfer confirmation. Expected processing time 3-5 business days.',
    suite: 'VIP Suite B',
    flightNo: 'EK383',
    agencyDiscountApplied: true,
  },
  {
    id: 8,
    refundNo: 'RF-202602-000002',
    bookingNo: 'A-202602-000019',
    accountNo: 'ACC-2023-0334',
    accountName: 'Robert Wang',
    accountType: 'Individual',
    bookingDate: '2026-02-06',
    adjustmentDate: '2026-02-08',
    originalAmount: 9200,
    revisedAmount: 7360,
    refundAmount: 1840,
    paymentMethod: 'Upfront',
    adjustmentReason: 'Flight Class Change',
    adjustmentDetail: 'Flight class changed from First Class to Business Class. Suite rate adjusted accordingly.',
    status: 'Pending Review',
    suite: 'Executive Suite',
    flightNo: 'LH796',
  },
  {
    id: 9,
    refundNo: 'RF-202602-000003',
    bookingNo: 'A-202602-000032',
    accountNo: 'CORP-2024-0052',
    accountName: 'Standard Chartered Bank',
    accountType: 'Corporate',
    bookingDate: '2026-02-10',
    adjustmentDate: '2026-02-11',
    originalAmount: 12500,
    revisedAmount: 10000,
    refundAmount: 2500,
    paymentMethod: 'On-Credit',
    adjustmentReason: 'Guest Count Reduction',
    adjustmentDetail: 'Group booking reduced from 5 to 4 VIP passengers. Lounge Deluxe rate recalculated.',
    status: 'Cancelled',
    processedDate: '2026-02-13',
    processedBy: 'Carol Wong',
    financeNotes: 'Refund cancelled per customer request. Original amount retained as credit for future booking.',
    suite: 'VIP Suite B',
    flightNo: 'SQ891',
  },
  {
    id: 10,
    refundNo: 'RF-202602-000004',
    bookingNo: 'A-202602-000047',
    accountNo: 'TA-HT-001-ACC',
    accountName: 'Hong Thai Travel',
    accountType: 'Agency',
    bookingDate: '2026-02-14',
    adjustmentDate: '2026-02-15',
    originalAmount: 27000,
    revisedAmount: 22950,
    refundAmount: 4050,
    paymentMethod: 'Bulk Purchase/Monthly Invoice',
    adjustmentReason: 'Travel Agency Discount Correction',
    adjustmentDetail: 'Monthly invoice reconciliation found over-billing. Standard 15% agency rate re-applied.',
    status: 'Pending Review',
    suite: 'VIP Suite A',
    flightNo: 'CX758',
    agencyDiscountApplied: true,
  },
  {
    id: 11,
    refundNo: 'RF-202602-000005',
    bookingNo: 'A-202602-000058',
    accountNo: 'ACC-2025-0087',
    accountName: 'Emma Wilson',
    accountType: 'Individual',
    bookingDate: '2026-02-17',
    adjustmentDate: '2026-02-18',
    originalAmount: 6500,
    revisedAmount: 5200,
    refundAmount: 1300,
    paymentMethod: 'Upfront',
    adjustmentReason: 'Add-on Service Removed',
    adjustmentDetail: 'In-lounge shopping service removed from booking at customer request.',
    status: 'Completed',
    processedDate: '2026-02-20',
    processedBy: 'Bob Leung',
    financeNotes: 'Refund completed. Amount credited back to original payment source.',
    suite: 'Business Suite',
    flightNo: 'BA27',
  },
  {
    id: 12,
    refundNo: 'RF-202602-000006',
    bookingNo: 'A-202602-000071',
    accountNo: 'CORP-2023-0089',
    accountName: 'DHL Express HK Ltd',
    accountType: 'Corporate',
    bookingDate: '2026-02-20',
    adjustmentDate: '2026-02-22',
    originalAmount: 16800,
    revisedAmount: 13440,
    refundAmount: 3360,
    paymentMethod: 'Bulk Purchase/Monthly Invoice',
    adjustmentReason: 'Manual Adjustment by Staff',
    adjustmentDetail: 'Pricing error corrected — wrong rate tier applied at booking creation.',
    status: 'Processing',
    financeNotes: 'Credit note issued. Pending sign-off from department head.',
    suite: 'Premier Suite',
    flightNo: 'CX406',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RefundStatus, { color: string; icon: React.ReactNode; label: string }> = {
  'Pending Review': {
    color: 'bg-amber-100 text-amber-800 border border-amber-200',
    icon: <Clock className="w-3 h-3" />,
    label: 'Pending Review',
  },
  Processing: {
    color: 'bg-blue-100 text-blue-800 border border-blue-200',
    icon: <RefreshCw className="w-3 h-3" />,
    label: 'Processing',
  },
  Completed: {
    color: 'bg-green-100 text-green-800 border border-green-200',
    icon: <CheckCircle className="w-3 h-3" />,
    label: 'Completed',
  },
  Cancelled: {
    color: 'bg-gray-100 text-gray-700 border border-gray-200',
    icon: <XCircle className="w-3 h-3" />,
    label: 'Cancelled',
  },
};

const ACCOUNT_TYPE_COLOR: Record<AccountType, string> = {
  Individual: 'bg-violet-100 text-violet-700',
  Corporate: 'bg-sky-100 text-sky-700',
  'Agency': 'bg-teal-100 text-teal-700',
};

const fmtHKD = (v: number) => `HK$${v.toLocaleString()}`;

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function RefundDetailModal({
  record,
  onClose,
  onStatusChange,
}: {
  record: RefundRecord;
  onClose: () => void;
  onStatusChange: (id: number, status: RefundStatus, notes: string) => void;
}) {
  const [financeNotes, setFinanceNotes] = useState(record.financeNotes ?? '');
  const [newStatus, setNewStatus] = useState<RefundStatus>(record.status);
  const statusCfg = STATUS_CONFIG[record.status];

  const handleSave = () => {
    onStatusChange(record.id, newStatus, financeNotes);
    onClose();
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <RotateCcw className="w-5 h-5 text-blue-600" />
          Refund Detail — {record.refundNo}
        </DialogTitle>
        <DialogDescription>
          Price adjustment and refund information for finance follow-up
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 mt-2">
        {/* Status Banner */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${statusCfg.color}`}>
          {statusCfg.icon}
          <span className="text-sm">Current Status: <strong>{record.status}</strong></span>
        </div>

        {/* Booking & Account */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 space-y-3">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Booking Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking No.</span>
                <span className="font-mono">{record.bookingNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Suite</span>
                <span>{record.suite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Flight No.</span>
                <span className="flex items-center gap-1">
                  <Plane className="w-3 h-3 text-gray-400" /> {record.flightNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Date</span>
                <span>{record.bookingDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adjustment Date</span>
                <span>{record.adjustmentDate}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <User className="w-4 h-4" /> Account Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Account No.</span>
                <span className="font-mono">{record.accountNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Name</span>
                <span>{record.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Type</span>
                <Badge className={`text-xs ${ACCOUNT_TYPE_COLOR[record.accountType]}`}>
                  {record.accountType}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>
                <span>{record.paymentMethod}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Price Breakdown */}
        <Card className="p-4">
          <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" /> Price Adjustment Breakdown
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Original Amount</p>
              <p className="text-xl text-gray-700">{fmtHKD(record.originalAmount)}</p>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg">→</span>
              </div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Revised Amount</p>
              <p className="text-xl text-blue-700">{fmtHKD(record.revisedAmount)}</p>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 text-lg">=</span>
            </div>
            <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-xs text-red-500 mb-1">Refund Amount</p>
              <p className="text-xl text-red-600">{fmtHKD(record.refundAmount)}</p>
            </div>
          </div>
          <div className="mt-3 text-right">
            <span className="text-sm text-gray-500">Reduction: </span>
            <span className="text-sm text-red-600">
              -{((record.refundAmount / record.originalAmount) * 100).toFixed(1)}%
            </span>
          </div>
        </Card>

        {/* Adjustment Reason */}
        <Card className="p-4">
          <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Adjustment Reason
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">
                {record.adjustmentReason}
              </Badge>
              {record.agencyDiscountApplied && (
                <Badge className="bg-teal-50 text-teal-700 text-xs">Agency Discount</Badge>
              )}
              {record.promoCodeApplied && (
                <Badge className="bg-violet-50 text-violet-700 text-xs">
                  Promo: {record.promoCodeApplied}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">{record.adjustmentDetail}</p>
          </div>
        </Card>

        {/* Processing Info */}
        {(record.processedDate || record.processedBy) && (
          <Card className="p-4">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> Processing Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {record.processedDate && (
                <div>
                  <span className="text-gray-500">Processed Date</span>
                  <p>{record.processedDate}</p>
                </div>
              )}
              {record.processedBy && (
                <div>
                  <span className="text-gray-500">Processed By</span>
                  <p>{record.processedBy}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Finance Actions */}
        <Card className="p-4">
          <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-500" /> Finance Action
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-[10px]">Update Refund Status</label>
              <div className="relative">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RefundStatus)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm appearance-none pr-8"
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-[10px]">Finance Notes</label>
              <textarea
                rows={3}
                value={financeNotes}
                onChange={(e) => setFinanceNotes(e.target.value)}
                placeholder="Add notes for finance record keeping..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DialogContent>
  );
}

// ── Props interface ───────────────────────────────────────────────────────────
export interface RefundReportProps {
  /** Pass populated array from CI4; falls back to MOCK_REFUND_RECORDS when empty */
  refunds?: RefundRecord[];
  onViewDetail?: (id: number) => void;
  onUpdateStatus?: (id: number, status: RefundStatus, notes: string) => void;
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RefundReport({
  refunds: refundsProp = [],
  onViewDetail,
  onUpdateStatus,
  isLoading = false,
}: RefundReportProps = {}) {
  const [records, setRecords] = useState<RefundRecord[]>(
    refundsProp.length > 0 ? refundsProp : MOCK_REFUND_RECORDS,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'All'>('All');
  const [accountTypeFilter, setAccountTypeFilter] = useState<AccountType | 'All'>('All');
  const [reasonFilter, setReasonFilter] = useState<AdjustmentReason | 'All'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<RefundRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const pending = records.filter((r) => r.status === 'Pending Review').length;
    const processing = records.filter((r) => r.status === 'Processing').length;
    const completed = records.filter((r) => r.status === 'Completed').length;
    const totalRefundable = records
      .filter((r) => r.status !== 'Cancelled')
      .reduce((sum, r) => sum + r.refundAmount, 0);
    const completedAmount = records
      .filter((r) => r.status === 'Completed')
      .reduce((sum, r) => sum + r.refundAmount, 0);
    return { pending, processing, completed, totalRefundable, completedAmount };
  }, [records]);

  // Filtered records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        r.refundNo.toLowerCase().includes(q) ||
        r.bookingNo.toLowerCase().includes(q) ||
        r.accountNo.toLowerCase().includes(q) ||
        r.accountName.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchType = accountTypeFilter === 'All' || r.accountType === accountTypeFilter;
      const matchReason = reasonFilter === 'All' || r.adjustmentReason === reasonFilter;
      const matchStart = !startDate || r.adjustmentDate >= startDate;
      const matchEnd = !endDate || r.adjustmentDate <= endDate;
      return matchSearch && matchStatus && matchType && matchReason && matchStart && matchEnd;
    });
  }, [records, searchQuery, statusFilter, accountTypeFilter, reasonFilter, startDate, endDate]);

  const handleStatusChange = (id: number, status: RefundStatus, notes: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              financeNotes: notes,
              processedDate: status === 'Completed' ? new Date().toISOString().split('T')[0] : r.processedDate,
              processedBy: status === 'Completed' ? 'HKIAL Staff' : r.processedBy,
            }
          : r
      )
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setAccountTypeFilter('All');
    setReasonFilter('All');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== 'All' || accountTypeFilter !== 'All' || reasonFilter !== 'All' || startDate || endDate;

  const allReasons: AdjustmentReason[] = [
    'Suite Downgrade',
    'Guest Count Reduction',
    'Add-on Service Removed',
    'Promo Code Applied',
    'Travel Agency Discount Correction',
    'Manual Adjustment by Staff',
    'Booking Date Change',
    'Flight Class Change',
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-red-500" />
            Refund Report
          </h1>
          <p className="text-gray-500 mt-1">
            Track and manage refunds arising from booking price adjustments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 col-span-2 md:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Pending Review</p>
              <p className="text-2xl text-amber-600">{stats.pending}</p>
            </div>
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Processing</p>
              <p className="text-2xl text-blue-600">{stats.processing}</p>
            </div>
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Completed</p>
              <p className="text-2xl text-green-600">{stats.completed}</p>
            </div>
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Refundable</p>
              <p className="text-lg text-red-600">{fmtHKD(stats.totalRefundable)}</p>
            </div>
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Completed Refunds</p>
              <p className="text-lg text-green-600">{fmtHKD(stats.completedAmount)}</p>
            </div>
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by refund no., booking no., account no. or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 w-4 h-4 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-100">
            {/* Status */}
            <div>
              <label className="block text-xs text-gray-500 mb-[10px]">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as RefundStatus | 'All')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm appearance-none pr-7"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-xs text-gray-500 mb-[10px]">Account Type</label>
              <div className="relative">
                <select
                  value={accountTypeFilter}
                  onChange={(e) => setAccountTypeFilter(e.target.value as AccountType | 'All')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm appearance-none pr-7"
                >
                  <option value="All">All Types</option>
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Agency">Agency</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Adjustment Reason */}
            <div>
              <label className="block text-xs text-gray-500 mb-[10px]">Adjustment Reason</label>
              <div className="relative">
                <select
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value as AdjustmentReason | 'All')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm appearance-none pr-7"
                >
                  <option value="All">All Reasons</option>
                  {allReasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs text-gray-500 mb-[10px]">Adjustment Date From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs text-gray-500 mb-[10px]">Adjustment Date To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <strong>{filtered.length}</strong> of <strong>{records.length}</strong> refund records
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Filter className="w-3 h-3" />
          <span>Click a row to view details & update status</span>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                  Refund No.
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                  Booking No.
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                  Account
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                  Adj. Date
                </th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                  Original
                </th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                  Revised
                </th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                  Refund Amt
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                  Reason
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                  Payment
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400">
                    <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No refund records match your current filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const sc = STATUS_CONFIG[r.status];
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedRecord(r)}
                    >
                      {/* Refund No */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-700">{r.refundNo}</span>
                      </td>

                      {/* Booking No */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-blue-700">{r.bookingNo}</span>
                      </td>

                      {/* Account */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-900">{r.accountName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-gray-400 font-mono">{r.accountNo}</span>
                            <Badge className={`text-xs px-1.5 py-0 ${ACCOUNT_TYPE_COLOR[r.accountType]}`}>
                              {r.accountType === 'Agency' ? 'TA' : r.accountType.slice(0, 4)}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      {/* Adj Date */}
                      <td className="px-4 py-3 text-gray-600 text-xs">{r.adjustmentDate}</td>

                      {/* Original */}
                      <td className="px-4 py-3 text-right text-gray-600">
                        {fmtHKD(r.originalAmount)}
                      </td>

                      {/* Revised */}
                      <td className="px-4 py-3 text-right text-blue-600">
                        {fmtHKD(r.revisedAmount)}
                      </td>

                      {/* Refund Amt */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-red-600">{fmtHKD(r.refundAmount)}</span>
                        <p className="text-xs text-gray-400">
                          -{((r.refundAmount / r.originalAmount) * 100).toFixed(0)}%
                        </p>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3 max-w-[160px]">
                        <span className="text-xs text-gray-600 line-clamp-2">{r.adjustmentReason}</span>
                        {r.agencyDiscountApplied && (
                          <Badge className="mt-1 text-xs bg-teal-50 text-teal-700 px-1.5 py-0">
                            Agency Disc.
                          </Badge>
                        )}
                        {r.promoCodeApplied && (
                          <Badge className="mt-1 text-xs bg-violet-50 text-violet-700 px-1.5 py-0">
                            {r.promoCodeApplied}
                          </Badge>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{r.paymentMethod}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge className={`flex items-center gap-1 w-fit text-xs ${sc.color}`}>
                          {sc.icon}
                          {r.status}
                        </Badge>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecord(r)}
                          className="h-7 px-2"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Refund Trigger Conditions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allReasons.slice(0, 4).map((reason) => (
            <div key={reason} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
              <span className="text-xs text-gray-500">{reason}</span>
            </div>
          ))}
          {allReasons.slice(4).map((reason) => (
            <div key={reason} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
              <span className="text-xs text-gray-500">{reason}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => { if (!open) setSelectedRecord(null); }}>
        {selectedRecord && (
          <RefundDetailModal
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </Dialog>
    </div>
  );
}