/**
 * POSTransactions.tsx — Pure presentational component.
 * Lists all completed POS transactions with filtering and export actions.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Receipt,
  Search,
  Download,
  RefreshCw,
  CreditCard,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionStatus = 'completed' | 'refunded' | 'partially-refunded' | 'voided';
export type PaymentMethod = 'credit-card' | 'account-credit' | 'cash' | 'bank-transfer';

export interface POSTransactionItem {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface POSTransaction {
  id: string;
  transactionNo: string;
  bookingNo: string;
  guestName: string;
  accountNo: string;
  suiteName: string;
  date: string;
  time: string;
  items: POSTransactionItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  processedBy: string;
}

export interface POSTransactionsProps {
  transactions?: POSTransaction[];
  onViewDetail?: (transactionNo: string) => void;
  onExport?: () => void;
  onRefresh?: () => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TRANSACTIONS: POSTransaction[] = [
  {
    id: '1',
    transactionNo: 'TXN-2026-000041',
    bookingNo: 'A-202602-000041',
    guestName: 'Emily Cheung',
    accountNo: 'ACC-2024-008',
    suiteName: 'CIP 1',
    date: '2026-06-04',
    time: '14:32',
    items: [
      { name: 'Champagne Service',   qty: 1, unitPrice: 380 },
      { name: 'Fine Dining Menu',    qty: 2, unitPrice: 580 },
      { name: 'Airport Limousine',   qty: 1, unitPrice: 1500 },
    ],
    subtotal: 3040,
    discount: 0,
    total: 3040,
    paymentMethod: 'account-credit',
    status: 'completed',
    processedBy: 'Staff A',
  },
  {
    id: '2',
    transactionNo: 'TXN-2026-000040',
    bookingNo: 'A-202602-000039',
    guestName: 'Michael Wong',
    accountNo: 'ACC-2024-015',
    suiteName: 'CIP 3',
    date: '2026-06-04',
    time: '11:18',
    items: [
      { name: 'Espresso',            qty: 2, unitPrice: 45 },
      { name: 'Club Sandwich',       qty: 1, unitPrice: 180 },
      { name: 'Chocolate Soufflé',   qty: 1, unitPrice: 120 },
    ],
    subtotal: 390,
    discount: 0,
    total: 390,
    paymentMethod: 'credit-card',
    status: 'completed',
    processedBy: 'Staff B',
  },
  {
    id: '3',
    transactionNo: 'TXN-2026-000039',
    bookingNo: 'A-202601-000088',
    guestName: 'Sarah Lee',
    accountNo: 'ACC-2024-003',
    suiteName: 'Lobby 2',
    date: '2026-06-03',
    time: '16:45',
    items: [
      { name: 'Afternoon Tea Set',   qty: 3, unitPrice: 280 },
      { name: 'Premium Coffee & Tea',qty: 3, unitPrice: 60 },
    ],
    subtotal: 1020,
    discount: 102,
    total: 918,
    paymentMethod: 'account-credit',
    status: 'completed',
    processedBy: 'Staff A',
  },
  {
    id: '4',
    transactionNo: 'TXN-2026-000038',
    bookingNo: 'A-202601-000082',
    guestName: 'David Chan',
    accountNo: 'ACC-2024-021',
    suiteName: 'CIP 5',
    date: '2026-06-03',
    time: '09:10',
    items: [
      { name: 'Wine Tasting Experience', qty: 1, unitPrice: 880 },
      { name: 'Airport Limousine',       qty: 2, unitPrice: 1500 },
    ],
    subtotal: 3880,
    discount: 0,
    total: 3880,
    paymentMethod: 'credit-card',
    status: 'refunded',
    processedBy: 'Staff C',
  },
  {
    id: '5',
    transactionNo: 'TXN-2026-000037',
    bookingNo: 'A-202601-000077',
    guestName: 'Jennifer Lam',
    accountNo: 'ACC-2024-009',
    suiteName: 'CIP 2',
    date: '2026-06-02',
    time: '20:05',
    items: [
      { name: 'Private Chef Service', qty: 1, unitPrice: 3800 },
      { name: 'Sake Selection',       qty: 1, unitPrice: 480 },
      { name: 'Cocktail Service',     qty: 2, unitPrice: 220 },
    ],
    subtotal: 4720,
    discount: 472,
    total: 4248,
    paymentMethod: 'account-credit',
    status: 'completed',
    processedBy: 'Staff B',
  },
  {
    id: '6',
    transactionNo: 'TXN-2026-000036',
    bookingNo: 'A-202601-000071',
    guestName: 'Robert Ng',
    accountNo: 'ACC-2024-034',
    suiteName: 'Function Room',
    date: '2026-06-02',
    time: '13:22',
    items: [
      { name: 'Premium Catering',      qty: 1, unitPrice: 5800 },
    ],
    subtotal: 5800,
    discount: 0,
    total: 5800,
    paymentMethod: 'bank-transfer',
    status: 'completed',
    processedBy: 'Staff A',
  },
  {
    id: '7',
    transactionNo: 'TXN-2026-000035',
    bookingNo: 'A-202601-000064',
    guestName: 'Olivia Tsang',
    accountNo: 'ACC-2024-011',
    suiteName: 'Lobby 5',
    date: '2026-06-01',
    time: '08:55',
    items: [
      { name: 'Gourmet Breakfast',   qty: 2, unitPrice: 320 },
      { name: 'Premium Coffee & Tea',qty: 2, unitPrice: 60 },
    ],
    subtotal: 760,
    discount: 76,
    total: 684,
    paymentMethod: 'credit-card',
    status: 'partially-refunded',
    processedBy: 'Staff C',
  },
  {
    id: '8',
    transactionNo: 'TXN-2026-000034',
    bookingNo: 'A-202601-000059',
    guestName: 'Henry Fong',
    accountNo: 'ACC-2024-027',
    suiteName: 'CIP 4',
    date: '2026-06-01',
    time: '18:40',
    items: [
      { name: 'Glass of Champagne',  qty: 4, unitPrice: 250 },
      { name: 'Fine Dining Menu',    qty: 2, unitPrice: 580 },
      { name: 'Airport Limousine',   qty: 1, unitPrice: 1500 },
    ],
    subtotal: 3660,
    discount: 0,
    total: 3660,
    paymentMethod: 'account-credit',
    status: 'voided',
    processedBy: 'Staff A',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TransactionStatus, { label: string; className: string }> = {
  'completed':          { label: 'Completed',          className: 'bg-green-100 text-green-700' },
  'refunded':           { label: 'Refunded',            className: 'bg-red-100 text-red-700' },
  'partially-refunded': { label: 'Partial Refund',      className: 'bg-orange-100 text-orange-700' },
  'voided':             { label: 'Voided',              className: 'bg-gray-100 text-gray-500' },
};

const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; icon: React.ReactNode }> = {
  'credit-card':    { label: 'Credit Card',     icon: <CreditCard className="w-3.5 h-3.5" /> },
  'account-credit': { label: 'Account Credit',  icon: <DollarSign className="w-3.5 h-3.5" /> },
  'cash':           { label: 'Cash',            icon: <DollarSign className="w-3.5 h-3.5" /> },
  'bank-transfer':  { label: 'Bank Transfer',   icon: <Receipt className="w-3.5 h-3.5" /> },
};

// ─── Component ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export function POSTransactions({
  transactions = MOCK_TRANSACTIONS,
  onViewDetail = () => {},
  onExport     = () => {},
  onRefresh    = () => {},
}: POSTransactionsProps) {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<string>('all');
  const [methodFilter, setMethod]   = useState<string>('all');
  const [page, setPage]             = useState(1);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.transactionNo.toLowerCase().includes(q) ||
      t.bookingNo.toLowerCase().includes(q) ||
      t.guestName.toLowerCase().includes(q) ||
      t.accountNo.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Summary stats ──────────────────────────────────────────────────────────
  const completedTotal = transactions
    .filter((t) => t.status === 'completed')
    .reduce((s, t) => s + t.total, 0);
  const todayTotal = transactions
    .filter((t) => t.status === 'completed' && t.date === '2026-06-04')
    .reduce((s, t) => s + t.total, 0);
  const refundCount = transactions.filter(
    (t) => t.status === 'refunded' || t.status === 'partially-refunded',
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#0f2942]" />
            POS Transactions
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all Point of Sales transaction records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                HKD {todayTotal.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                HKD {completedTotal.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Refunds / Partials</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{refundCount}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by transaction #, booking #, guest..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="w-44">
            <Select value={statusFilter} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partially-refunded">Partial Refund</SelectItem>
                <SelectItem value="voided">Voided</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <Select value={methodFilter} onValueChange={(v) => { setMethod(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="account-credit">Account Credit</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Transaction table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Transaction</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Booking</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Guest</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Suite</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Date / Time</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Payment</th>
                <th className="text-right px-5 py-3 text-gray-600 font-medium">Total (HKD)</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-gray-400">
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                pageItems.map((txn) => {
                  const statusCfg  = STATUS_CONFIG[txn.status];
                  const methodCfg  = PAYMENT_CONFIG[txn.paymentMethod];
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono text-[#0f2942] font-medium">{txn.transactionNo}</p>
                        <p className="text-xs text-gray-400 mt-0.5">by {txn.processedBy}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-mono text-gray-700 text-xs">{txn.bookingNo}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{txn.accountNo}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-800">{txn.guestName}</td>
                      <td className="px-5 py-4 text-gray-600">{txn.suiteName}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {txn.date}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{txn.time}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          {methodCfg.icon}
                          <span className="text-xs">{methodCfg.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-semibold text-gray-900">
                        {txn.total.toLocaleString()}
                        {txn.discount > 0 && (
                          <p className="text-xs text-gray-400 font-normal">
                            −{txn.discount.toLocaleString()} discount
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={`${statusCfg.className} border-0 text-xs`}>
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewDetail(txn.transactionNo)}
                          className="text-gray-500 hover:text-[#0f2942]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-700 px-2">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
