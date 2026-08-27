import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, Search, Building2, Calendar, Mail, Phone, User, DollarSign, Users, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

interface TravelAgency {
  id: number;
  agencyName: string;
  agencyCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  paymentMethod: 'Upfront' | 'Net Upfront' | 'On-Credit' | 'Monthly Invoice';
  creditLimit: number;
  creditBalance: number;
  discountRate: number;
  memberCount: number;
  totalBookings: number;
  status: 'active' | 'inactive' | 'suspended';
  createdDate: string;
}

export interface TravelAgencyProps {
  agencies?: TravelAgency[];
  isLoading?: boolean;
  onEditAgency?: (agencyId: number) => void;
  onCreateAgency?: () => void;
  // Controlled dialog props (container drives these)
  isDialogOpen?: boolean;
  onOpenDialog?: (open: boolean) => void;
  formData?: Record<string, string>;
  onFormChange?: (field: string, value: string) => void;
  onSubmit?: () => void;
  isEditing?: boolean;
  onDelete?: (id: number) => void;
  /** True while create/update mutation is in flight */
  isSubmitting?: boolean;
}

export function TravelAgency({ agencies: agenciesProp, onEditAgency, onCreateAgency, isDialogOpen: isDialogOpenProp, onOpenDialog, formData: formDataProp, onFormChange, onSubmit, isEditing, onDelete, isLoading = false, isSubmitting = false }: TravelAgencyProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // View-level state for when container doesn't provide controlled props
  const [internalIsDialogOpen, setInternalIsDialogOpen] = useState(false);
  const [internalEditingAgency, setInternalEditingAgency] = useState<TravelAgency | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use controlled props if provided, otherwise use internal state
  const isDialogOpen = isDialogOpenProp ?? internalIsDialogOpen;
  const setIsDialogOpen = onOpenDialog ? (v: boolean) => onOpenDialog(v) : setInternalIsDialogOpen;
  const editingAgency = isEditing !== undefined ? (isEditing ? internalEditingAgency : null) : internalEditingAgency;
  const setEditingAgency = setInternalEditingAgency;

  const agencies: TravelAgency[] = agenciesProp ?? [];

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.agencyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agency.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || agency.paymentMethod === paymentFilter;
    
    let matchesDate = true;
    if (startDate && endDate) {
      const agencyDate = new Date(agency.createdDate);
      matchesDate = agencyDate >= new Date(startDate) && agencyDate <= new Date(endDate);
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAgencies = filteredAgencies.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredAgencies.length / itemsPerPage));
    setCurrentPage((p) => (p > maxPage ? maxPage : p));
  }, [filteredAgencies.length, itemsPerPage]);

  const handleAddOrEdit = () => {
    setIsDialogOpen(false);
    setEditingAgency(null);
  };

  const handleEdit = (agency: TravelAgency) => {
    if (onEditAgency) {
      onEditAgency(agency.id);
    }
  };

  const handleDelete = (id: number) => {
    if (onDelete) {
      onDelete(id);
    } else if (confirm('Are you sure you want to delete this travel agency?')) {
      console.log('Deleting agency:', id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Agency Management</h1>
          <p className="text-gray-600">Manage agency partnerships and credit accounts</p>
        </div>
        <Button type="button" onClick={() => { setEditingAgency(null); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Agency
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Active Agencies</p>
              <p className="text-2xl text-green-900">{agencies.filter(a => a.status === 'active').length}</p>
            </div>
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Total Members</p>
              <p className="text-2xl text-blue-900">{agencies.reduce((sum, a) => sum + a.memberCount, 0)}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Total Bookings</p>
              <p className="text-2xl text-purple-900">{agencies.reduce((sum, a) => sum + a.totalBookings, 0)}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Credit Outstanding</p>
              <p className="text-2xl text-orange-900">
                HKD {agencies.reduce((sum, a) => sum + (a.creditLimit - a.creditBalance), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by agency name, code, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Methods</SelectItem>
              <SelectItem value="Upfront">Upfront</SelectItem>
              <SelectItem value="Net Upfront">Net Upfront</SelectItem>
              <SelectItem value="On-Credit">On-Credit</SelectItem>
              <SelectItem value="Monthly Invoice">Monthly Invoice</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setPaymentFilter('all');
            setStartDate('');
            setEndDate('');
          }}>
            Reset Filters
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label className="mb-2">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-2">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Agency List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agency Info</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistics</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-600">
                    <Loader2 className="w-8 h-8 animate-spin inline-block text-gray-400" aria-hidden />
                    <p className="mt-3 text-sm">Loading agencies…</p>
                  </td>
                </tr>
              ) : paginatedAgencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-600 text-sm">
                    No agencies found. {agencies.length === 0 ? 'Add an agency to get started.' : 'Try adjusting your filters.'}
                  </td>
                </tr>
              ) : paginatedAgencies.map((agency) => {
                const creditUsed = agency.creditLimit > 0 ? agency.creditLimit - agency.creditBalance : 0;
                const creditUtilization = agency.creditLimit > 0 ? (creditUsed / agency.creditLimit * 100).toFixed(1) : '0';
                return (
                  <tr key={agency.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-orange-600" />
                          <p className="font-semibold text-gray-900">{agency.agencyName}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{agency.agencyCode}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(agency.createdDate).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-3 h-3 text-gray-400" />
                          <span>{agency.contactPerson}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[200px]">{agency.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{agency.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={
                        agency.paymentMethod === 'On-Credit' ? 'default' : 
                        agency.paymentMethod === 'Monthly Invoice' ? 'secondary' : 
                        'outline'
                      }>
                        {agency.paymentMethod}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-2">Discount: {agency.discountRate}%</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Limit:</span>
                          <span className="font-semibold">HKD {agency.creditLimit.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Available:</span>
                          <span className={agency.creditBalance < agency.creditLimit * 0.2 ? 'font-semibold text-red-600' : 'font-semibold text-green-600'}>
                            HKD {agency.creditBalance.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              Number(creditUtilization) > 80 ? 'bg-red-500' : 
                              Number(creditUtilization) > 60 ? 'bg-orange-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${creditUtilization}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 text-right">{creditUtilization}% utilized</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span>{agency.memberCount} members</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{agency.totalBookings} bookings</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={
                        agency.status === 'active' ? 'default' : 
                        agency.status === 'suspended' ? 'destructive' : 
                        'secondary'
                      }>
                        {agency.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleEdit(agency); }}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(agency.id); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t p-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {isLoading
              ? 'Loading agencies…'
              : filteredAgencies.length === 0
                ? 'No agencies match your filters.'
                : `Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, filteredAgencies.length)} of ${filteredAgencies.length} agencies`}
          </p>
          {!isLoading && filteredAgencies.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 5 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(Math.max(1, totalPages), p + 1))}
                  className={currentPage === totalPages || totalPages === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          )}
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAgency ? 'Edit Agency' : 'Add New Agency'}</DialogTitle>
            <DialogDescription>
              {editingAgency ? 'Update agency information' : 'Create a new agency partnership'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Agency Name</Label>
                <Input
                  placeholder="Enter agency name"
                  value={formDataProp?.agency_name ?? ''}
                  onChange={e => onFormChange?.('agency_name', e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2">Agency Code</Label>
                <Input
                  placeholder="TA-XXX-001"
                  value={formDataProp?.agency_code ?? ''}
                  onChange={e => onFormChange?.('agency_code', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Contact Person</Label>
                <Input
                  placeholder="Enter contact name"
                  value={formDataProp?.contact_person ?? ''}
                  onChange={e => onFormChange?.('contact_person', e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2">Phone Number</Label>
                <Input
                  placeholder="+852 XXXX XXXX"
                  value={formDataProp?.contact_phone ?? ''}
                  onChange={e => onFormChange?.('contact_phone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2">Email Address</Label>
              <Input
                type="email"
                placeholder="contact@agency.com"
                value={formDataProp?.contact_email ?? ''}
                onChange={e => onFormChange?.('contact_email', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Payment Method</Label>
                <Select value={formDataProp?.payment_method ?? 'Upfront'} onValueChange={v => onFormChange?.('payment_method', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upfront">Upfront</SelectItem>
                    <SelectItem value="Net Upfront">Net Upfront</SelectItem>
                    <SelectItem value="On-Credit">On-Credit</SelectItem>
                    <SelectItem value="Monthly Invoice">Monthly Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2">Discount Rate (%)</Label>
                <Input
                  type="number"
                  placeholder="0-30"
                  min="0"
                  max="30"
                  value={formDataProp?.discount_rate ?? '10'}
                  onChange={e => onFormChange?.('discount_rate', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Credit Limit (HKD)</Label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={formDataProp?.credit_limit ?? ''}
                  onChange={e => onFormChange?.('credit_limit', e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2">Status</Label>
                <Select
                  value={(() => {
                    const s = formDataProp?.status;
                    if (!s) return 'Active';
                    if (s === 'Inactive' || s.toLowerCase() === 'inactive' || s.toLowerCase() === 'suspended') {
                      return 'Inactive';
                    }
                    return 'Active';
                  })()}
                  onValueChange={v => onFormChange?.('status', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2">Remarks / Notes</Label>
              <Textarea
                placeholder="Additional information about this agency..."
                rows={3}
                value={formDataProp?.remarks ?? ''}
                onChange={e => onFormChange?.('remarks', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              onClick={() => {
                onSubmit?.();
              }}
              className="min-w-[8.5rem]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" aria-hidden />
                  {editingAgency ? 'Saving…' : 'Creating…'}
                </>
              ) : (
                <>{editingAgency ? 'Update Agency' : 'Add Agency'}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}