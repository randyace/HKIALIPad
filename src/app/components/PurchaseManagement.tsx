import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from './ui/dialog';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from './ui/pagination';
import {
  Search, Plus, Eye, Building2, Plane, User,
  CheckCircle, FileText, Send, Clock, TrendingUp, Receipt,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import {
  PurchaseCreate,
  PurchaseCategory, Tier, PurchaseStatus,
  AccountOption, PurchaseRecord,
  MOCK_ACCOUNTS, INITIAL_RECORDS, BUNDLE_COLORS,
  TierBadge, CategoryBadge, StatusBadge,
} from './PurchaseCreate';

type TabView = 'all' | 'individual' | 'corporate';
const TIERS: Tier[] = ['Gold', 'Platinum', 'Diamond', 'Sapphire'];
const fmt = (d: string) => new Date(d).toLocaleDateString('en-HK', { day: '2-digit', month: 'long', year: 'numeric' });

// ── Props interface ───────────────────────────────────────────────────────────
export interface PurchaseManagementProps {
  /** Pass populated array from CI4; falls back to INITIAL_RECORDS when empty */
  purchases?: PurchaseRecord[];
  onViewDetail?: (id: string) => void;
  onCreateNew?: () => void;
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function PurchaseManagement({
  purchases: purchasesProp = [],
  onViewDetail,
  onCreateNew,
  isLoading = false,
}: PurchaseManagementProps = {}) {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [records, setRecords]   = useState<PurchaseRecord[]>(
    purchasesProp.length > 0 ? purchasesProp : INITIAL_RECORDS,
  );
  const [accounts, setAccounts] = useState<AccountOption[]>(MOCK_ACCOUNTS);

  // Tab & filters
  const [activeTab, setActiveTab]     = useState<TabView>('all');
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PurchaseStatus>('all');
  const [filterTier, setFilterTier]   = useState<'all' | Tier>('all');
  const [filterCat, setFilterCat]     = useState<'all' | PurchaseCategory>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Detail / Invoice dialogs
  const [isDetailOpen, setIsDetailOpen]   = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PurchaseRecord | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceTarget, setInvoiceTarget] = useState<PurchaseRecord | null>(null);
  
  // Success notification dialog
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  // ── Filtering ────────────────────────────────────────────────────────────────

  const filteredRecords = records.filter(r => {
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'individual' && r.purchaseCategory === 'Individual') ||
      (activeTab === 'corporate'  && (r.purchaseCategory === 'Corporate' || r.purchaseCategory === 'Agency'));
    const matchSearch = !searchTerm ||
      r.primaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purchaseRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchTier   = filterTier   === 'all' || r.newTier === filterTier;
    const matchCat    = filterCat    === 'all' || r.purchaseCategory === filterCat;
    return matchTab && matchSearch && matchStatus && matchTier && matchCat;
  });

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginated  = filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const totalRevenue = records.filter(r => r.status === 'Invoice Sent').reduce((s, r) => s + r.packagePrice, 0);
  const pendingCount = records.filter(r => r.status === 'Pending Invoice').length;
  const indivCount   = records.filter(r => r.purchaseCategory === 'Individual').length;
  const corpCount    = records.filter(r => r.purchaseCategory === 'Corporate').length;
  const taCount      = records.filter(r => r.purchaseCategory === 'Agency').length;

  // ── Tab helpers ──────────────────────────────────────────────────────────────

  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab); setCurrentPage(1);
    setSearchTerm(''); setFilterStatus('all'); setFilterTier('all'); setFilterCat('all');
  };

  // ── Invoice handling ─────────────────────────────────────────────────────────

  const handleSendInvoice = () => {
    if (!invoiceTarget) return;
    const today = new Date().toISOString().split('T')[0];

    setRecords(prev => prev.map(r =>
      r.id === invoiceTarget.id
        ? { ...r, status: 'Invoice Sent' as PurchaseStatus, invoiceSentDate: today }
        : r
    ));

    if (invoiceTarget.purchaseCategory === 'Individual') {
      setAccounts(prev => prev.map(a =>
        a.accountNumber === invoiceTarget.accountNumber
          ? { ...a, currentTier: invoiceTarget.newTier, currentCredits: (invoiceTarget.creditsAdded ?? 0) === -1 ? -1 : (a.currentCredits ?? 0) + (invoiceTarget.creditsAdded ?? 0) }
          : a
      ));
      toast.success('Invoice Sent!', {
        description: `${invoiceTarget.creditsAdded === -1 ? 'Unlimited' : invoiceTarget.creditsAdded} booking credits added to ${invoiceTarget.primaryName}'s account.`,
      });
    } else {
      setAccounts(prev => prev.map(a =>
        a.accountNumber === invoiceTarget.accountNumber
          ? { ...a, currentSessions: (a.currentSessions ?? 0) + (invoiceTarget.sessionsAdded ?? 0) }
          : a
      ));
      toast.success('Invoice Sent!', {
        description: `${invoiceTarget.sessionsAdded} sessions credited to ${invoiceTarget.primaryName}.`,
      });
    }

    if (selectedRecord?.id === invoiceTarget.id)
      setSelectedRecord(prev => prev ? { ...prev, status: 'Invoice Sent', invoiceSentDate: today } : prev);

    setIsInvoiceOpen(false); setInvoiceTarget(null);
  };

  // ── New purchase completion ──────────────────────────────────────────────────

  const handlePurchaseComplete = (record: PurchaseRecord) => {
    setRecords(prev => [record, ...prev]);
    toast.success('Purchase Record Created', {
      description: `${record.purchaseRef} created for ${record.primaryName}. Generate and send the invoice to activate.`,
    });
    setView('list');
  };

  // ── Sub-view: PurchaseCreate page ────────────────────────────────────────────

  if (view === 'create') {
    return (
      <PurchaseCreate
        accounts={accounts}
        existingIds={records.map(r => r.id)}
        onBack={() => setView('list')}
        onComplete={handlePurchaseComplete}
      />
    );
  }

  // ── List View ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Purchase Management</h1>
          <p className="text-sm text-gray-500">
            Manage grading package purchases for Individual members and session bundle purchases for Corporate & Travel Agency accounts.
          </p>
        </div>
        <Button
          className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white shrink-0"
          onClick={() => setView('create')}
        >
          <Plus className="w-4 h-4 mr-2" />New Contract
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 col-span-2 md:col-span-1 bg-[#0f2942] text-white">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-blue-300" />
            <span className="text-sm text-blue-200">Invoiced Revenue</span>
          </div>
          <p className="text-xl text-white">HKD {totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-blue-300 mt-1">{records.length} total records</p>
        </Card>
        <Card className="p-4 border-2 border-amber-300 bg-amber-50">
          <div className="flex items-center gap-1 mb-2"><Clock className="w-4 h-4 text-amber-600" /><span className="text-xs text-amber-700">Pending Invoice</span></div>
          <p className="text-xl text-amber-700">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting invoice</p>
        </Card>
        <Card className="p-4 border-2 border-green-200 bg-green-50">
          <div className="flex items-center gap-1 mb-2"><User className="w-4 h-4 text-green-600" /><span className="text-xs text-gray-600">Individual</span></div>
          <p className="text-xl text-green-700">{indivCount}</p>
          <p className="text-xs text-gray-500 mt-1">Grading packages</p>
        </Card>
        <Card className="p-4 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-1 mb-2"><Building2 className="w-4 h-4 text-blue-600" /><span className="text-xs text-gray-600">Corporate</span></div>
          <p className="text-xl text-blue-700">{corpCount}</p>
          <p className="text-xs text-gray-500 mt-1">Session bundles</p>
        </Card>
        <Card className="p-4 border-2 border-purple-200 bg-purple-50">
          <div className="flex items-center gap-1 mb-2"><Plane className="w-4 h-4 text-purple-600" /><span className="text-xs text-gray-600">Travel Agency</span></div>
          <p className="text-xl text-purple-700">{taCount}</p>
          <p className="text-xs text-gray-500 mt-1">Session bundles</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {([
          { key: 'all',        label: 'All Purchases' },
          { key: 'individual', label: 'Individual (Grading Package)' },
          { key: 'corporate',  label: 'Corporate & Travel Agency' },
        ] as { key: TabView; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-[#0f2942] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, account no. or purchase ref..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v: any) => { setFilterStatus(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending Invoice">Pending Invoice</SelectItem>
              <SelectItem value="Invoice Sent">Invoice Sent</SelectItem>
            </SelectContent>
          </Select>
          {activeTab === 'individual' && (
            <Select value={filterTier} onValueChange={(v: any) => { setFilterTier(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="All Tiers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {TIERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {(activeTab === 'corporate' || activeTab === 'all') && (
            <Select value={filterCat} onValueChange={(v: any) => { setFilterCat(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{activeTab === 'all' ? 'All Account Types' : 'All Types'}</SelectItem>
                {activeTab === 'all' && <SelectItem value="Individual">Individual</SelectItem>}
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Agency">Agency</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase Ref</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                {activeTab === 'all' && <TableHead>Type</TableHead>}
                <TableHead>{activeTab === 'corporate' ? 'Bundle' : activeTab === 'individual' ? 'Tier' : 'Package / Tier'}</TableHead>
                <TableHead>Credits / Sessions</TableHead>
                <TableHead>Price (HKD)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activeTab === 'all' ? 9 : 8} className="text-center text-gray-500 py-10">
                    No purchase records found.
                  </TableCell>
                </TableRow>
              ) : paginated.map(record => (
                <TableRow key={record.id} className="hover:bg-gray-50">
                  <TableCell className="text-sm text-blue-700">{record.purchaseRef}</TableCell>
                  <TableCell className="text-sm text-gray-600">{record.purchaseDate}</TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-900">{record.primaryName}</p>
                    <p className="text-xs text-gray-500">{record.accountNumber}</p>
                  </TableCell>

                  {activeTab === 'all' && (
                    <TableCell><CategoryBadge cat={record.purchaseCategory} /></TableCell>
                  )}

                  {/* Package / Tier column */}
                  <TableCell>
                    {record.purchaseCategory === 'Individual' && record.newTier ? (
                      <div className="flex items-center gap-1">
                        <TierBadge tier={record.previousTier ?? 'None'} />
                        <TrendingUp className="w-3 h-3 text-gray-400" />
                        <TierBadge tier={record.newTier} />
                      </div>
                    ) : record.bundleLabel ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${BUNDLE_COLORS[record.bundleLabel] ?? 'bg-gray-100 text-gray-700'}`}>
                        {record.bundleLabel}
                      </span>
                    ) : '—'}
                  </TableCell>

                  {/* Credits / Sessions */}
                  <TableCell>
                    {record.status === 'Invoice Sent' ? (
                      record.purchaseCategory === 'Individual' ? (
                        <>
                          <span className="text-green-700">{record.creditsAdded === -1 ? 'Unlimited' : `+${record.creditsAdded}`}</span>
                          <span className="text-gray-400 text-xs ml-1">credits ({record.totalCreditsAfter === -1 ? 'Unlimited' : `${record.totalCreditsAfter} total`})</span>
                        </>
                      ) : (
                        <>
                          <span className="text-green-700">+{record.sessionsAdded}</span>
                          <span className="text-gray-400 text-xs ml-1">sessions ({record.totalSessionsAfter} total)</span>
                        </>
                      )
                    ) : (
                      <span className="text-gray-400 text-xs">Pending</span>
                    )}
                  </TableCell>

                  <TableCell className="text-sm text-gray-900">{record.packagePrice.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={record.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {record.status === 'Pending Invoice' && (
                        <Button
                          variant="outline" size="sm"
                          className="text-[#0f2942] border-[#0f2942] hover:bg-[#0f2942] hover:text-white text-xs px-2"
                          onClick={() => { setInvoiceTarget(record); setIsInvoiceOpen(true); }}
                        >
                          <FileText className="w-3 h-3 mr-1" />Generate Invoice
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(record); setIsDetailOpen(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* ── Invoice Preview Dialog ─────────────────────────────────────────── */}
      <Dialog open={isInvoiceOpen} onOpenChange={o => { setIsInvoiceOpen(o); if (!o) setInvoiceTarget(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>Review the invoice before sending it to the customer.</DialogDescription>
          </DialogHeader>

          {invoiceTarget && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-[#0f2942] text-white p-6 flex items-start justify-between">
                <div>
                  <p className="text-lg text-white">HKIA VIP Lounge</p>
                  <p className="text-xs text-blue-200 mt-1">Hong Kong International Airport</p>
                  <p className="text-xs text-blue-200">Terminal 1, Departure Level</p>
                </div>
                <div className="text-right">
                  <p className="text-lg text-white">INVOICE</p>
                  <p className="text-sm text-blue-200 mt-1">{invoiceTarget.purchaseRef}</p>
                  <p className="text-xs text-blue-300 mt-1">Date: {fmt(invoiceTarget.purchaseDate)}</p>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-2">BILL TO</p>
                <p className="text-sm text-gray-900">{invoiceTarget.primaryName}</p>
                <p className="text-xs text-gray-500">{invoiceTarget.primaryEmail}</p>
                <p className="text-xs text-gray-500">{invoiceTarget.accountNumber}</p>
              </div>

              <div className="p-6 border-b border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-2 text-xs text-gray-500">Description</th>
                      <th className="text-right pb-2 text-xs text-gray-500">Amount (HKD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="pt-3 text-gray-900">
                        {invoiceTarget.purchaseCategory === 'Individual'
                          ? `${invoiceTarget.newTier} Grading Package`
                          : invoiceTarget.bundleLabel}
                        <p className="text-xs text-gray-500 mt-0.5">
                          {invoiceTarget.purchaseCategory === 'Individual'
                            ? `Includes ${invoiceTarget.creditsAdded === -1 ? 'Unlimited' : invoiceTarget.creditsAdded} booking credits · 12 months validity`
                            : `${invoiceTarget.sessionsAdded} lounge sessions`}
                        </p>
                      </td>
                      <td className="pt-3 text-right text-gray-900">{invoiceTarget.packagePrice.toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td className="pt-3 text-gray-900">Total</td>
                      <td className="pt-3 text-right text-gray-900">HKD {invoiceTarget.packagePrice.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="text-gray-900">{invoiceTarget.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Transaction Ref</p>
                  <p className="text-gray-900">{invoiceTarget.transactionRef}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {invoiceTarget.purchaseCategory === 'Individual' ? 'Credits to Apply' : 'Sessions to Credit'}
                  </p>
                  <p className="text-green-700">
                    {invoiceTarget.purchaseCategory === 'Individual'
                      ? (invoiceTarget.creditsAdded === -1 ? 'Unlimited booking credits' : `+${invoiceTarget.creditsAdded} booking credits`)
                      : `+${invoiceTarget.sessionsAdded} sessions`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Package Expiry</p>
                  <p className="text-gray-900">{fmt(invoiceTarget.expiryDate)}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setIsInvoiceOpen(false); setInvoiceTarget(null); }}>Cancel</Button>
            <Button className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white" onClick={handleSendInvoice}>
              <Send className="w-4 h-4 mr-2" />Send Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Purchase Detail</DialogTitle></DialogHeader>
          {selectedRecord && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {([
                  ['Purchase Ref',  selectedRecord.purchaseRef,   'text-blue-700'],
                  ['Purchase Date', selectedRecord.purchaseDate,  ''],
                  ['Account',       selectedRecord.primaryName,   ''],
                  ['Account No.',   selectedRecord.accountNumber, ''],
                  ...(selectedRecord.purchaseCategory === 'Individual' ? [
                    ['New Tier',  selectedRecord.newTier ?? '—', ''],
                    ['Credits',   selectedRecord.status === 'Invoice Sent'
                      ? (selectedRecord.creditsAdded === -1 ? 'Unlimited' : `+${selectedRecord.creditsAdded} (${selectedRecord.totalCreditsAfter === -1 ? 'Unlimited' : selectedRecord.totalCreditsAfter} total)`)
                      : 'Pending invoice',
                      selectedRecord.status === 'Invoice Sent' ? 'text-green-700' : 'text-amber-600'],
                  ] : [
                    ['Bundle',    selectedRecord.bundleLabel ?? '—', ''],
                    ['Sessions',  selectedRecord.status === 'Invoice Sent'
                      ? `+${selectedRecord.sessionsAdded} (${selectedRecord.totalSessionsAfter} total)`
                      : 'Pending invoice',
                      selectedRecord.status === 'Invoice Sent' ? 'text-green-700' : 'text-amber-600'],
                  ]),
                  ['Amount (HKD)',  selectedRecord.packagePrice.toLocaleString(), ''],
                  ['Payment',       selectedRecord.paymentMethod,    ''],
                  ['Invoice Date',  selectedRecord.invoiceSentDate ?? '—', ''],
                  ['Expiry',        selectedRecord.expiryDate,        ''],
                ] as [string, string, string][]).map(([label, val, color]) => (
                  <div key={label} className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className={color || 'text-gray-900'}>{val}</p>
                  </div>
                ))}
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <CategoryBadge cat={selectedRecord.purchaseCategory} />
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <StatusBadge status={selectedRecord.status} />
                </div>
              </div>
              {selectedRecord.notes && (
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{selectedRecord.notes}</p>
                </div>
              )}
              {selectedRecord.status === 'Pending Invoice' && (
                <Button className="w-full bg-[#0f2942] hover:bg-[#1a3d5c] text-white"
                  onClick={() => { setIsDetailOpen(false); setInvoiceTarget(selectedRecord); setIsInvoiceOpen(true); }}>
                  <FileText className="w-4 h-4 mr-2" />Generate Invoice
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Success Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contract Created Successfully</DialogTitle>
            <DialogDescription>
              The contract has been created and added to the management list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900 mb-1">VIP Account Creation Request Sent</p>
                  <p className="text-sm text-green-800">
                    VIP accounts creation request is sent to VIP Lounge team.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white"
              onClick={() => setIsSuccessDialogOpen(false)}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}