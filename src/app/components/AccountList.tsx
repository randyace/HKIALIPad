import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search, Calendar, Eye, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

interface Account {
  id: number;
  accountNumber: string;
  type: 'Individual' | 'Corporate' | 'Agency';
  name: string;
  email: string;
  phone: string;
  internalGrouping: string;
  paymentMethod: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdDate: string;
  creditBalance?: number;
  membershipType?: 'Platinum' | 'Gold' | 'Sapphire' | 'Diamond';
  membershipExpiry?: string;
}

export interface AccountListProps {
  accounts?: Account[];
  loading?: boolean;
  isSearching?: boolean;
  error?: string | null;
  total?: number;
  itemsPerPage?: number;
  currentPage?: number;
  totalPages?: number;
  startIndex?: number;
  endIndex?: number;
  searchTerm?: string;
  typeFilter?: string;
  startDate?: string;
  endDate?: string;
  paginationModel?: number[];
  onSearchTermChange?: (value: string) => void;
  onTypeFilterChange?: (value: string) => void;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
  onClearFilters?: () => void;
  onPageChange?: (page: number) => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onViewDetail?: (accountNumber: string) => void;
  onDelete?: (accountNumber: string) => void;
  isMember?: (account: Account) => boolean;
  getTypeTone?: (type: string) => string;
  getTypeDisplay?: (type: string) => string;
  getStatusTone?: (status: string) => string;
  deletingAccountId?: number | null;
}

export function AccountList({
  accounts = [],
  loading = false,
  isSearching = false,
  error = null,
  total = 0,
  currentPage = 1,
  totalPages = 1,
  startIndex = 0,
  endIndex = 0,
  searchTerm = '',
  typeFilter = 'all',
  startDate = '',
  endDate = '',
  paginationModel = [],
  onSearchTermChange,
  onTypeFilterChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  onPageChange,
  onPrevPage,
  onNextPage,
  onViewDetail,
  onDelete,
  isMember,
  getTypeTone,
  getTypeDisplay,
  getStatusTone,
  deletingAccountId = null,
}: AccountListProps = {}) {
  const today = new Date().toISOString().split('T')[0];

  const getStatusBadge = (status: string) => {
    const tone = getStatusTone?.(status) ?? 'gray';
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-800',
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={`${colors[tone]} hover:${colors[tone]}`}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const tone = getTypeTone?.(type) ?? 'gray';
    const displayType = getTypeDisplay?.(type) ?? type;
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
    };
    return (
      <Badge className={`${colors[tone]} hover:${colors[tone]}`}>
        {displayType}
      </Badge>
    );
  };

  const renderPagination = () => {
    const pages = paginationModel?.length ? paginationModel : [1];

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={onPrevPage}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {pages.map((page, index) => {
            if (page === -1 || page === -2) {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange?.(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              onClick={onNextPage}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1>All Customers</h1>
          <p className="text-gray-600">View and manage all customer accounts</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1>All Customers</h1>
          <p className="text-gray-600">View and manage all customer accounts</p>
        </div>
        <div className="text-center py-12 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>All Customers</h1>
        <p className="text-gray-600">View and manage all customer accounts</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by account number, name, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => onSearchTermChange?.(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Agency">Agency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label>Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange?.(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <Calendar className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1">
              <label>End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange?.(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <Calendar className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={onClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Accounts Table */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-sm text-gray-500 flex items-center gap-1.5">
            <span>
              Showing {total > 0 ? `${startIndex + 1}-${Math.min(endIndex, total)}` : '0'} of {total} accounts
            </span>
            {isSearching && (
              <span className="text-blue-600 text-xs animate-pulse">Searching…</span>
            )}
          </div>
          <div>
            {renderPagination()}
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Grouping</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Credit Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.accountNumber} className="hover:bg-gray-50">
                  <TableCell>{account.id}</TableCell>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>
                    {isMember?.(account) ? (
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 w-fit">Member</Badge>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-500">{account.membershipType}</span>
                          <span className="text-xs text-amber-700">Exp: {account.membershipExpiry}</span>
                        </div>
                      </div>
                    ) : account.type === 'Individual' && account.membershipExpiry ? (
                      <div className="flex flex-col gap-1">
                        {getTypeBadge(account.type)}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-500">{account.membershipType}</span>
                          <span className="text-xs text-red-500">Exp: {account.membershipExpiry}</span>
                        </div>
                      </div>
                    ) : (
                      getTypeBadge(account.type)
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={() => onViewDetail?.(account.accountNumber)}
                    >
                      {account.name}
                    </button>
                  </TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.phone}</TableCell>
                  <TableCell>{account.internalGrouping}</TableCell>
                  <TableCell>{account.paymentMethod}</TableCell>
                  <TableCell>
                    {account.creditBalance !== undefined ? (
                      <span className="text-green-600">HK${account.creditBalance.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell>{account.createdDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail?.(account.accountNumber)}
                        className="h-8 w-8 p-0"
                        title="View/Edit Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(account.accountNumber)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        title="Delete Account"
                        disabled={deletingAccountId !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No accounts found matching your search criteria
          </div>
        )}

        {accounts.length > 0 && (
          <div className="p-4 border-t flex justify-end">
            {renderPagination()}
          </div>
        )}
      </Card>
    </div>
  );
}