import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import {
  Search, Eye, BookOpen, Hash, TrendingUp, Tag, Building2,
  Package, FileSpreadsheet, CalendarIcon, X, Receipt, Clock,
  QrCode, CheckCircle2, LayoutList,
} from 'lucide-react';
import { toast } from 'sonner';

type CodeType = 'Free bookings';

function TypeBadge({ type }: { type: CodeType }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
      <BookOpen className="w-3 h-3" />Free bookings
    </span>
  );
}

// ── Batch-level usage data ────────────────────────────────────────────────────
interface PromoBatchUsage {
  id: number;
  batchRef: string;
  companyName: string;
  contractId: string;
  contractPrice: number;
  codePrefix: string;
  codeType: CodeType;
  freeBookings: number;       // Number of free bookings per code
  totalCodes: number;
  codesUsed: number;
  codesRemaining: number;
  usageRate: number;
  totalBookings: number;
  totalRevenueImpact: number;
  createdDate: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Inactive';
}

// ── Transaction record ────────────────────────────────────────────────────────
interface PromoTransaction {
  id: number;
  batchRef: string;
  companyName: string;
  codePrefix: string;
  uniqueCode: string;
  usedAt: string;             // datetime string
  bookingRef: string;
  guestName: string;
  freeBookingsGranted: number;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_BATCH_USAGE: PromoBatchUsage[] = [
  {
    id: 1,
    batchRef: 'BATCH-2025-001',
    companyName: 'Cathay Pacific Airways',
    contractId: 'BULK-2025-00001',
    contractPrice: 150000,
    codePrefix: 'CPA',
    codeType: 'Free bookings',
    freeBookings: 2,
    totalCodes: 500,
    codesUsed: 347,
    codesRemaining: 153,
    usageRate: 69.4,
    totalBookings: 694,
    totalRevenueImpact: 624600,
    createdDate: '2025-01-15',
    startDate: '2025-01-20',
    endDate: '2025-12-31',
    status: 'Active',
  },
  {
    id: 2,
    batchRef: 'BATCH-2025-002',
    companyName: 'HSBC Hong Kong',
    contractId: 'BULK-2025-00003',
    contractPrice: 200000,
    codePrefix: 'HSBC',
    codeType: 'Free bookings',
    freeBookings: 1,
    totalCodes: 800,
    codesUsed: 623,
    codesRemaining: 177,
    usageRate: 77.9,
    totalBookings: 623,
    totalRevenueImpact: 561900,
    createdDate: '2025-01-10',
    startDate: '2025-01-15',
    endDate: '2025-12-31',
    status: 'Active',
  },
  {
    id: 3,
    batchRef: 'BATCH-2024-089',
    companyName: 'Ernst & Young',
    contractId: 'BULK-2024-00087',
    contractPrice: 120000,
    codePrefix: 'EY',
    codeType: 'Free bookings',
    freeBookings: 1,
    totalCodes: 300,
    codesUsed: 285,
    codesRemaining: 15,
    usageRate: 95.0,
    totalBookings: 285,
    totalRevenueImpact: 256500,
    createdDate: '2024-11-01',
    startDate: '2024-11-15',
    endDate: '2025-02-28',
    status: 'Active',
  },
  {
    id: 4,
    batchRef: 'BATCH-2024-102',
    companyName: 'Swire Properties',
    contractId: 'BULK-2024-00098',
    contractPrice: 180000,
    codePrefix: 'SWR',
    codeType: 'Free bookings',
    freeBookings: 3,
    totalCodes: 600,
    codesUsed: 598,
    codesRemaining: 2,
    usageRate: 99.7,
    totalBookings: 1794,
    totalRevenueImpact: 1614600,
    createdDate: '2024-10-05',
    startDate: '2024-10-15',
    endDate: '2024-12-31',
    status: 'Expired',
  },
  {
    id: 5,
    batchRef: 'BATCH-2025-003',
    companyName: 'PwC Hong Kong',
    contractId: 'BULK-2025-00005',
    contractPrice: 95000,
    codePrefix: 'PWC',
    codeType: 'Free bookings',
    freeBookings: 1,
    totalCodes: 400,
    codesUsed: 156,
    codesRemaining: 244,
    usageRate: 39.0,
    totalBookings: 156,
    totalRevenueImpact: 140400,
    createdDate: '2025-01-20',
    startDate: '2025-02-01',
    endDate: '2025-12-31',
    status: 'Active',
  },
  {
    id: 6,
    batchRef: 'BATCH-2024-095',
    companyName: 'Bank of China',
    contractId: 'BULK-2024-00092',
    contractPrice: 140000,
    codePrefix: 'BOC',
    codeType: 'Free bookings',
    freeBookings: 2,
    totalCodes: 250,
    codesUsed: 203,
    codesRemaining: 47,
    usageRate: 81.2,
    totalBookings: 406,
    totalRevenueImpact: 365400,
    createdDate: '2024-09-10',
    startDate: '2024-09-20',
    endDate: '2025-03-31',
    status: 'Active',
  },
  {
    id: 7,
    batchRef: 'BATCH-2025-004',
    companyName: 'Standard Chartered',
    contractId: 'BULK-2025-00008',
    contractPrice: 175000,
    codePrefix: 'SCB',
    codeType: 'Free bookings',
    freeBookings: 2,
    totalCodes: 700,
    codesUsed: 89,
    codesRemaining: 611,
    usageRate: 12.7,
    totalBookings: 178,
    totalRevenueImpact: 160200,
    createdDate: '2025-02-01',
    startDate: '2025-02-10',
    endDate: '2025-12-31',
    status: 'Active',
  },
  {
    id: 8,
    batchRef: 'BATCH-2024-078',
    companyName: 'Deloitte',
    contractId: 'BULK-2024-00075',
    contractPrice: 110000,
    codePrefix: 'DLT',
    codeType: 'Free bookings',
    freeBookings: 1,
    totalCodes: 350,
    codesUsed: 350,
    codesRemaining: 0,
    usageRate: 100.0,
    totalBookings: 350,
    totalRevenueImpact: 315000,
    createdDate: '2024-08-01',
    startDate: '2024-08-15',
    endDate: '2024-12-15',
    status: 'Expired',
  },
];

// ── Mock Transaction Records ───────────────────────────────────────────────────
const GUEST_NAMES = [
  'James Hoffmann', 'Priya Nair', 'William Leung', 'Fatima Al-Hassan', 'Lucas Müller',
  'Chen Xiaoming', 'Yuki Tanaka', 'Amara Osei', 'Natasha Ivanova', 'Patrick O\'Brien',
  'Mei-Lin Chou', 'Rajan Sharma', 'Isabelle Dupont', 'Omar Al-Farsi', 'Elena Kozlov',
  'David Ng', 'Grace Yip', 'Henry Tsang', 'Irene Mak', 'Jason Lee',
];

function generateTransactions(): PromoTransaction[] {
  const txns: PromoTransaction[] = [];
  let id = 1;

  const sampleBatches = [
    { batchRef: 'BATCH-2025-001', companyName: 'Cathay Pacific Airways', codePrefix: 'CPA', freeBookings: 2 },
    { batchRef: 'BATCH-2025-002', companyName: 'HSBC Hong Kong', codePrefix: 'HSBC', freeBookings: 1 },
    { batchRef: 'BATCH-2024-089', companyName: 'Ernst & Young', codePrefix: 'EY', freeBookings: 1 },
    { batchRef: 'BATCH-2024-102', companyName: 'Swire Properties', codePrefix: 'SWR', freeBookings: 3 },
    { batchRef: 'BATCH-2025-003', companyName: 'PwC Hong Kong', codePrefix: 'PWC', freeBookings: 1 },
    { batchRef: 'BATCH-2024-095', companyName: 'Bank of China', codePrefix: 'BOC', freeBookings: 2 },
    { batchRef: 'BATCH-2025-004', companyName: 'Standard Chartered', codePrefix: 'SCB', freeBookings: 2 },
    { batchRef: 'BATCH-2024-078', companyName: 'Deloitte', codePrefix: 'DLT', freeBookings: 1 },
  ];

  const baseDates = [
    '2025-01-22 09:14', '2025-01-23 11:05', '2025-01-24 14:33', '2025-01-25 08:47',
    '2025-01-25 16:02', '2025-01-26 10:28', '2025-01-27 13:55', '2025-01-28 09:31',
    '2025-01-29 15:44', '2025-02-01 08:19', '2025-02-02 11:37', '2025-02-03 14:52',
    '2025-02-04 10:08', '2025-02-05 13:26', '2025-02-06 09:43', '2025-02-07 16:11',
    '2025-02-08 08:55', '2025-02-09 12:22', '2025-02-10 15:39', '2025-02-11 09:07',
    '2025-02-12 11:48', '2025-02-13 14:15', '2025-02-14 09:33', '2025-02-15 13:00',
    '2025-02-16 10:26', '2025-02-17 15:53', '2025-02-18 08:42', '2025-02-19 12:09',
    '2025-02-20 14:37', '2025-02-21 09:54',
  ];

  for (let i = 0; i < 30; i++) {
    const batch = sampleBatches[i % sampleBatches.length];
    const seqNum = String(1001 + Math.floor(i / sampleBatches.length) * 17 + (i % 17)).padStart(6, '0');
    txns.push({
      id: id++,
      batchRef: batch.batchRef,
      companyName: batch.companyName,
      codePrefix: batch.codePrefix,
      uniqueCode: `${batch.codePrefix}-${seqNum}`,
      usedAt: baseDates[i % baseDates.length],
      bookingRef: `A-202501-${String(100001 + i).slice(-6)}`,
      guestName: GUEST_NAMES[i % GUEST_NAMES.length],
      freeBookingsGranted: batch.freeBookings,
    });
  }
  return txns;
}

const MOCK_TRANSACTIONS: PromoTransaction[] = generateTransactions();

// ── Main Component ─────────────────────────────────────────────────────────────
export interface PromoCodeUsageProps {
  batchUsage?: PromoBatchUsage[];
  isLoading?: boolean;
  onViewBatch?: (batchId: number) => void;
  onExport?: () => void;
}

export function PromoCodeUsage({ batchUsage: batchUsageProp, isLoading, onViewBatch, onExport }: PromoCodeUsageProps = {}) {
  const batchData: PromoBatchUsage[] = batchUsageProp?.length ? batchUsageProp : MOCK_BATCH_USAGE;
  const [activeTab, setActiveTab] = useState<'batches' | 'transactions'>('batches');

  // ── Batch tab state ────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Expired' | 'Inactive'>('all');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [selectedBatch, setSelectedBatch] = useState<PromoBatchUsage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── Transaction tab state ──────────────────────────────────────────────────
  const [txnSearch, setTxnSearch]     = useState('');
  const [txnBatch, setTxnBatch]       = useState('all');
  const [txnDateFrom, setTxnDateFrom] = useState('');
  const [txnDateTo, setTxnDateTo]     = useState('');
  const [txnPage, setTxnPage]         = useState(1);

  const ITEMS_PER_PAGE = 10;

  // ── Batch filtering ────────────────────────────────────────────────────────
  const filtered = batchData.filter(batch => {
    const matchSearch = !searchTerm
      || batch.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      || batch.batchRef.toLowerCase().includes(searchTerm.toLowerCase())
      || batch.contractId.toLowerCase().includes(searchTerm.toLowerCase())
      || batch.codePrefix.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || batch.status === filterStatus;
    const matchFrom   = !dateFrom || batch.createdDate >= dateFrom;
    const matchTo     = !dateTo   || batch.createdDate <= dateTo;
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── Transaction filtering ──────────────────────────────────────────────────
  const filteredTxns = MOCK_TRANSACTIONS.filter(t => {
    const q = txnSearch.toLowerCase();
    const matchSearch = !txnSearch
      || t.uniqueCode.toLowerCase().includes(q)
      || t.guestName.toLowerCase().includes(q)
      || t.bookingRef.toLowerCase().includes(q)
      || t.companyName.toLowerCase().includes(q)
      || t.codePrefix.toLowerCase().includes(q);
    const matchBatch  = txnBatch === 'all' || t.batchRef === txnBatch;
    const dateStr     = t.usedAt.split(' ')[0];
    const matchFrom   = !txnDateFrom || dateStr >= txnDateFrom;
    const matchTo     = !txnDateTo   || dateStr <= txnDateTo;
    return matchSearch && matchBatch && matchFrom && matchTo;
  });

  const txnTotalPages = Math.ceil(filteredTxns.length / ITEMS_PER_PAGE);
  const paginatedTxns = filteredTxns.slice((txnPage - 1) * ITEMS_PER_PAGE, txnPage * ITEMS_PER_PAGE);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalBatches   = batchData.length;
  const activeBatches  = batchData.filter(b => b.status === 'Active').length;
  const totalCodesGen  = batchData.reduce((s, b) => s + b.totalCodes, 0);
  const totalCodesUsed = batchData.reduce((s, b) => s + b.codesUsed, 0);
  const totalRevImpact = batchData.reduce((s, b) => s + b.totalRevenueImpact, 0);
  const avgUsageRate   = totalCodesGen > 0 ? ((totalCodesUsed / totalCodesGen) * 100).toFixed(1) : '0.0';

  // ── Download Batch CSV ─────────────────────────────────────────────────────
  const handleDownloadExcel = () => {
    const headers = [
      'Batch Ref', 'Company Name', 'Contract ID', 'Code Prefix', 'Code Type', 'Free Bookings per Code',
      'Total Codes', 'Codes Used', 'Codes Remaining', 'Usage Rate (%)',
      'Total Bookings', 'Total Revenue Impact (HKD)', 'Created Date',
      'Start Date', 'End Date', 'Status',
    ];
    const rows = filtered.map(b => [
      b.batchRef, b.companyName, b.contractId, b.codePrefix, b.codeType, b.freeBookings,
      b.totalCodes, b.codesUsed, b.codesRemaining, b.usageRate.toFixed(1),
      b.totalBookings, b.totalRevenueImpact, b.createdDate, b.startDate, b.endDate, b.status,
    ]);
    const csvContent = [headers, ...rows]
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `promo-batch-usage-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Excel downloaded — ${filtered.length} records exported.`);
  };

  // ── Download Transaction CSV ───────────────────────────────────────────────
  const handleDownloadTxnExcel = () => {
    const headers = ['#', 'Batch Ref', 'Company Name', 'Code Prefix', 'Unique Code', 'Used At', 'Booking Ref', 'Guest Name', 'Free Bookings Granted'];
    const rows = filteredTxns.map((t, i) => [
      i + 1, t.batchRef, t.companyName, t.codePrefix, t.uniqueCode,
      t.usedAt, t.bookingRef, t.guestName, t.freeBookingsGranted,
    ]);
    const csvContent = [headers, ...rows]
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `promo-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Transaction log downloaded — ${filteredTxns.length} records exported.`);
  };

  function StatusBadge({ status }: { status: 'Active' | 'Expired' | 'Inactive' }) {
    if (status === 'Active')
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Active</span>;
    if (status === 'Expired')
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">Expired</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Inactive</span>;
  }

  function renderBatchPagination() {
    if (totalPages <= 1) return null;
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PaginationItem key={page}>
              <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }

  function renderTxnPagination() {
    if (txnTotalPages <= 1) return null;
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setTxnPage(p => Math.max(1, p - 1))} className={txnPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
          {Array.from({ length: txnTotalPages }, (_, i) => i + 1).map(page => (
            <PaginationItem key={page}>
              <PaginationLink onClick={() => setTxnPage(page)} isActive={txnPage === page} className="cursor-pointer">{page}</PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={() => setTxnPage(p => Math.min(txnTotalPages, p + 1))} className={txnPage === txnTotalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-gray-900 mb-1">Promo Code Usage</h1>
          <p className="text-sm text-gray-500">View batch usage statistics and individual unique-code transaction records.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 shrink-0"
          onClick={activeTab === 'batches' ? handleDownloadExcel : handleDownloadTxnExcel}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Download Excel
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 bg-[#0f2942] text-white">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-300" />
            <span className="text-xs text-blue-200">Total Batches</span>
          </div>
          <p className="text-2xl text-white">{totalBatches}</p>
          <p className="text-xs text-blue-300 mt-1">All time</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Active Batches</span>
          </div>
          <p className="text-2xl text-green-600">{activeBatches}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Codes Generated</span>
          </div>
          <p className="text-2xl text-blue-600">{totalCodesGen.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Codes Used</span>
          </div>
          <p className="text-2xl text-purple-600">{totalCodesUsed.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-xs text-gray-500">Revenue Impact</span>
          </div>
          <p className="text-base text-red-600">HKD {totalRevImpact.toLocaleString()}</p>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-0 border-b border-gray-200 bg-white rounded-t-lg overflow-hidden shadow-sm mb-4">
        <button
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'batches'
              ? 'border-blue-600 text-blue-700 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('batches')}
        >
          <LayoutList className="w-4 h-4" />
          Batch Summary
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === 'batches' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
            {batchData.length}
          </span>
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'transactions'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          <Receipt className="w-4 h-4" />
          Transaction Records
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === 'transactions' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
            {filteredTxns.length}
          </span>
        </button>
      </div>

      {/* ── BATCH TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'batches' && (
        <>
          {/* Filters */}
          <Card className="p-4 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by company, batch ref, contract ID, or code prefix..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-9"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(v: any) => { setFilterStatus(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                  <CalendarIcon className="w-4 h-4" />
                  Created Date:
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs text-gray-500 shrink-0">From</label>
                    <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs text-gray-500 shrink-0">To</label>
                    <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} className="flex-1" min={dateFrom || undefined} />
                  </div>
                  {(dateFrom || dateTo) && (
                    <Button size="sm" variant="ghost" className="gap-1 text-gray-500 hover:text-red-600 shrink-0"
                      onClick={() => { setDateFrom(''); setDateTo(''); setCurrentPage(1); }}>
                      <X className="w-3.5 h-3.5" /> Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Ref</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Code Prefix</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Free Bookings / Code</TableHead>
                    <TableHead>Total Codes</TableHead>
                    <TableHead>Codes Used</TableHead>
                    <TableHead>Codes Remaining</TableHead>
                    <TableHead>Usage Rate</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Revenue Impact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center text-gray-500 py-10">No usage records found.</TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((batch) => (
                      <TableRow key={batch.id} className="hover:bg-gray-50">
                        <TableCell className="text-sm text-blue-700">{batch.batchRef}</TableCell>
                        <TableCell className="text-sm text-gray-900">{batch.companyName}</TableCell>
                        <TableCell className="text-sm text-gray-500">{batch.contractId}</TableCell>
                        <TableCell className="text-sm font-mono text-gray-900">{batch.codePrefix}</TableCell>
                        <TableCell><TypeBadge type={batch.codeType} /></TableCell>
                        <TableCell className="text-sm text-gray-900 text-center">{batch.freeBookings}</TableCell>
                        <TableCell className="text-sm text-gray-900">{batch.totalCodes}</TableCell>
                        <TableCell className="text-sm text-gray-900">{batch.codesUsed}</TableCell>
                        <TableCell className="text-sm text-gray-900">{batch.codesRemaining}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(batch.usageRate, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-700">{batch.usageRate.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">{batch.totalBookings}</TableCell>
                        <TableCell className="text-sm text-gray-900">HKD {batch.totalRevenueImpact.toLocaleString()}</TableCell>
                        <TableCell><StatusBadge status={batch.status} /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedBatch(batch); setIsDetailOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t">{renderBatchPagination()}</div>
            )}
            <div className="px-4 py-3 border-t text-xs text-gray-500">
              Showing {paginated.length} of {filtered.length} records
            </div>
          </Card>
        </>
      )}

      {/* ── TRANSACTION TAB ────────────────────────────────────────────────── */}
      {activeTab === 'transactions' && (
        <>
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
            <Receipt className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-900">Promo Code Transaction Log</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                Each row represents a unique promo code that was redeemed — showing the exact code used, timestamp, linked booking, and free bookings granted.
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by unique code, guest name, booking ref, or company..."
                    value={txnSearch}
                    onChange={(e) => { setTxnSearch(e.target.value); setTxnPage(1); }}
                    className="pl-9"
                  />
                </div>
                <Select value={txnBatch} onValueChange={(v) => { setTxnBatch(v); setTxnPage(1); }}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="All Batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {MOCK_BATCH_USAGE.map(b => (
                      <SelectItem key={b.batchRef} value={b.batchRef}>{b.batchRef} — {b.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                  <CalendarIcon className="w-4 h-4" />
                  Used Date:
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs text-gray-500 shrink-0">From</label>
                    <Input type="date" value={txnDateFrom} onChange={(e) => { setTxnDateFrom(e.target.value); setTxnPage(1); }} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs text-gray-500 shrink-0">To</label>
                    <Input type="date" value={txnDateTo} onChange={(e) => { setTxnDateTo(e.target.value); setTxnPage(1); }} className="flex-1" min={txnDateFrom || undefined} />
                  </div>
                  {(txnDateFrom || txnDateTo) && (
                    <Button size="sm" variant="ghost" className="gap-1 text-gray-500 hover:text-red-600 shrink-0"
                      onClick={() => { setTxnDateFrom(''); setTxnDateTo(''); setTxnPage(1); }}>
                      <X className="w-3.5 h-3.5" /> Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Unique Code</TableHead>
                    <TableHead>Batch Ref</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Code Prefix</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Used At
                      </div>
                    </TableHead>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead>Guest Name</TableHead>
                    <TableHead className="text-center">Free Bookings Granted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTxns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-10">No transaction records found.</TableCell>
                    </TableRow>
                  ) : (
                    paginatedTxns.map((t, i) => (
                      <TableRow key={t.id} className="hover:bg-gray-50">
                        <TableCell className="text-xs text-gray-400">{(txnPage - 1) * ITEMS_PER_PAGE + i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <QrCode className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="font-mono text-sm text-emerald-700">{t.uniqueCode}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-blue-700">{t.batchRef}</TableCell>
                        <TableCell className="text-sm text-gray-900">{t.companyName}</TableCell>
                        <TableCell className="text-sm font-mono text-gray-600">{t.codePrefix}</TableCell>
                        <TableCell className="text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <div>
                              <div>{t.usedAt.split(' ')[0]}</div>
                              <div className="text-xs text-gray-400">{t.usedAt.split(' ')[1]}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono text-gray-700">{t.bookingRef}</TableCell>
                        <TableCell className="text-sm text-gray-900">{t.guestName}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                            <BookOpen className="w-3 h-3" />
                            {t.freeBookingsGranted} free
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {txnTotalPages > 1 && (
              <div className="p-4 border-t">{renderTxnPagination()}</div>
            )}
            <div className="px-4 py-3 border-t text-xs text-gray-500">
              Showing {paginatedTxns.length} of {filteredTxns.length} transaction records
            </div>
          </Card>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Batch Usage Detail</DialogTitle>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Batch Ref</p>
                  <p className="text-blue-700">{selectedBatch.batchRef}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Company Name</p>
                  <p className="text-gray-900">{selectedBatch.companyName}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Contract ID</p>
                  <p className="text-gray-900">{selectedBatch.contractId}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Code Prefix</p>
                  <p className="font-mono text-gray-900">{selectedBatch.codePrefix}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Code Type</p>
                  <TypeBadge type={selectedBatch.codeType} />
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Free Bookings per Code</p>
                  <p className="text-gray-900">{selectedBatch.freeBookings}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Total Codes</p>
                  <p className="text-gray-900">{selectedBatch.totalCodes}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Codes Used</p>
                  <p className="text-gray-900">{selectedBatch.codesUsed}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Codes Remaining</p>
                  <p className="text-gray-900">{selectedBatch.codesRemaining}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Usage Rate</p>
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(selectedBatch.usageRate, 100)}%` }} />
                    </div>
                    <p className="text-gray-900">{selectedBatch.usageRate.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
                  <p className="text-gray-900">{selectedBatch.totalBookings}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Revenue Impact</p>
                  <p className="text-gray-900">HKD {selectedBatch.totalRevenueImpact.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Date Range</p>
                  <p className="text-gray-900">{selectedBatch.startDate} → {selectedBatch.endDate}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <StatusBadge status={selectedBatch.status} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}