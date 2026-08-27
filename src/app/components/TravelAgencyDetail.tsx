import { useState, useEffect, type FormEvent, type ReactNode } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Save, FileText, Calendar, Edit2, AlertTriangle, CheckCircle, XCircle, Plus, Trash2, Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface TravelAgency {
  id: number;
  agencyName: string;
  agencyCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  paymentMethod: 'Upfront' | 'On-Credit' | 'Monthly Invoice';
  discountRate: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface ContactPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  offerName: string;
  purchaseDate: string;
  startDate: string;
  expiryDate: string;
  creditLimit: number;
  creditUsed: number;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  notes?: string;
}

export interface Member {
  id: number;
  accountNumber: string;
  name: string;
  email: string;
  phone: string;
  travelGroup?: string;
  memberType?: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin?: string;
}

export interface TravelAgencyDetailProps {
  agencyId?: number | null;
  agency?: TravelAgency | null;
  onBack: () => void;
  onEdit?: (e: FormEvent<HTMLFormElement>) => void;
  onAddContact?: () => void;
  contactPersons?: ContactPerson[];
  onContactPersonsChange?: (next: ContactPerson[]) => void;
  isLoading?: boolean;
  contracts?: Contract[];
  members?: Member[];
  onSaveContract?: (
    contract: Contract,
    form: { expiryDate: string; creditLimit: number; creditUsed: number }
  ) => void | Promise<unknown>;
  onDeleteContract?: (contractId: string) => void;
  onAddContract?: () => void;
  onAddMember?: () => void;
  onDeleteMember?: (memberId: number) => void;
}

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

const STATUS_CONFIG: Record<BalanceStatus, { label: string; barColor: string; textColor: string; bg: string; icon: ReactNode }> = {
  full:     { label: 'Full',     barColor: 'bg-blue-500',   textColor: 'text-blue-700',  bg: 'bg-blue-50',   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  ok:       { label: 'OK',       barColor: 'bg-green-500',  textColor: 'text-green-700', bg: 'bg-green-50',  icon: <CheckCircle className="w-3.5 h-3.5" /> },
  low:      { label: 'Low',      barColor: 'bg-amber-500',  textColor: 'text-amber-700', bg: 'bg-amber-50',  icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  critical: { label: 'Critical', barColor: 'bg-red-500',    textColor: 'text-red-700',   bg: 'bg-red-50',    icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  depleted: { label: 'Depleted', barColor: 'bg-gray-300',   textColor: 'text-gray-500',  bg: 'bg-gray-50',   icon: <XCircle className="w-3.5 h-3.5" /> },
};

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

function BalanceBadge({ used, total }: { used: number; total: number }) {
  const status = getBalanceStatus(used, total);
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cfg.bg} ${cfg.textColor}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

export function TravelAgencyDetail({
  agencyId,
  agency: agencyProp,
  onBack,
  onEdit,
  onAddContact: _onAddContact,
  contactPersons: contactPersonsProp,
  onContactPersonsChange,
  isLoading = false,
  contracts: contractsProp,
  members: membersProp,
  onSaveContract,
  onDeleteContract,
  onAddContract,
  onAddMember,
  onDeleteMember,
}: TravelAgencyDetailProps) {
  const contracts = contractsProp ?? [];
  const members = membersProp ?? [];

  const [localContacts, setLocalContacts] = useState<ContactPerson[]>([
    { id: '1', name: '', email: '', phone: '' },
  ]);
  const contactPersons = contactPersonsProp ?? localContacts;

  const setContactPersonsNext = (next: ContactPerson[]) => {
    onContactPersonsChange?.(next);
    if (contactPersonsProp === undefined) {
      setLocalContacts(next);
    }
  };

  const [agency, setAgency] = useState<TravelAgency | null>(agencyProp ?? null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editForm, setEditForm] = useState({ expiryDate: '', creditLimit: 0, creditUsed: 0 });
  const [agencyStatus, setAgencyStatus] = useState<boolean>(agencyProp?.status === 'active');

  const isEditMode = agencyId !== null;

  useEffect(() => {
    setAgency(agencyProp ?? null);
    if (agencyProp) {
      setAgencyStatus(agencyProp.status === 'active');
      setContactPersonsNext([
        {
          id: '1',
          name: agencyProp.contactPerson || '',
          email: agencyProp.email || '',
          phone: agencyProp.phone || '',
        },
      ]);
    } else if (agencyId === null) {
      setContactPersonsNext([{ id: '1', name: '', email: '', phone: '' }]);
    }
  }, [agencyProp?.id, agencyId]);

  const handleAddContactPerson = () => {
    const newId = (contactPersons.length + 1).toString();
    setContactPersonsNext([...contactPersons, { id: newId, name: '', email: '', phone: '' }]);
  };

  const handleRemoveContactPerson = (id: string) => {
    if (contactPersons.length > 1) {
      setContactPersonsNext(contactPersons.filter(cp => cp.id !== id));
    }
  };

  const handleUpdateContactPerson = (id: string, field: keyof Omit<ContactPerson, 'id'>, value: string) => {
    setContactPersonsNext(contactPersons.map(cp =>
      cp.id === id ? { ...cp, [field]: value } : cp
    ));
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setEditForm({
      expiryDate: contract.expiryDate,
      creditLimit: contract.creditLimit,
      creditUsed: contract.creditUsed
    });
  };

  const handleSaveContract = async () => {
    if (!editingContract) return;
    try {
      if (onSaveContract) {
        await Promise.resolve(onSaveContract(editingContract, editForm));
      }
      setEditingContract(null);
    } catch {
      // Keep dialog open on failure
    }
  };

  const daysUntilExpiry = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const totalCredit = contracts.reduce((sum, c) => sum + c.creditLimit, 0);
  const usedCredit = contracts.reduce((sum, c) => sum + c.creditUsed, 0);
  const remainingCredit = totalCredit - usedCredit;

  if (isLoading && agencyId != null && agencyProp == null) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} type="button">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1>Agency</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[240px] text-gray-600 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" aria-hidden />
          <p className="text-sm">Loading agency details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1>{isEditMode ? 'Edit Agency' : 'Create New Agency'}</h1>
          <p className="text-gray-600">
            {isEditMode ? 'Edit the details of the agency' : 'Enter the details of the new agency'}
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="p-6">
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            void onEdit?.(e);
          }}
        >
          {/* Agency Information Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Agency Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Agency Name</label>
                <input
                  type="text"
                  defaultValue={agency?.agencyName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Wings Agency"
                />
              </div>
              <div>
                <label>Agency Code</label>
                <input
                  type="text"
                  defaultValue={agency?.agencyCode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., TA-WG-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label>Payment Method</label>
                <select
                  defaultValue={agency?.paymentMethod}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Upfront">Upfront Payment</option>
                  <option value="On-Credit">On Credit</option>
                  <option value="Monthly Invoice">Monthly Invoice</option>
                </select>
              </div>
              <div>
                <label>Discount Rate (%)</label>
                <input
                  type="number"
                  defaultValue={agency?.discountRate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label>Status</label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={agencyStatus}
                    onCheckedChange={setAgencyStatus}
                  />
                  <span className="text-sm text-gray-700">
                    {agencyStatus ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Persons Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Contact Persons</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddContactPerson}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contact Person
                </Button>
              </div>

              {contactPersons.map((contact, index) => (
                <div key={contact.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-700">Contact Person {index + 1}</h5>
                    {contactPersons.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveContactPerson(contact.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs">Name</label>
                      <Input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleUpdateContactPerson(contact.id, 'name', e.target.value)}
                        placeholder="Full name"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="text-xs">Email Address</label>
                      <Input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleUpdateContactPerson(contact.id, 'email', e.target.value)}
                        placeholder="email@agency.com"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="text-xs">Phone Number</label>
                      <Input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleUpdateContactPerson(contact.id, 'phone', e.target.value)}
                        placeholder="+852 1234 5678"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label>Business Address</label>
              <Textarea
                placeholder="Enter agency business address..."
                rows={3}
              />
            </div>

            <div>
              <label>Remarks / Notes</label>
              <Textarea
                placeholder="Any additional notes about this agency..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? 'Update Agency' : 'Create Agency'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Contracts Section (Only show when editing) */}
      {isEditMode && !isLoading && (
        <Card className="p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Active Contracts</h2>
              <p className="text-sm text-gray-600">View and manage all contracts for this travel agency</p>
            </div>
            {onAddContract && (
              <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onAddContract}>
                Add contract
              </Button>
            )}
          </div>

          {/* Contract Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-xs text-blue-700 mb-1">Total Contracts</p>
              <p className="text-2xl font-semibold text-blue-900">{contracts.length}</p>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-xs text-green-700 mb-1">Total Credit Limit</p>
              <p className="text-2xl font-semibold text-green-900">HKD {totalCredit.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">HKD {remainingCredit.toLocaleString()} remaining</p>
            </Card>
            <Card className="p-4 bg-gray-50 border-gray-200">
              <p className="text-xs text-gray-700 mb-1">Overall Balance</p>
              <div className="mt-2">
                <BalanceBadge used={usedCredit} total={totalCredit} />
              </div>
            </Card>
          </div>

          {/* Contracts List */}
          <div className="space-y-4">
            {contracts.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No contracts found for this agency.</p>
            ) : (
            contracts.map((contract) => {
              const days = daysUntilExpiry(contract.expiryDate);
              const expiryColor = days < 30 ? 'text-red-600' : days < 90 ? 'text-amber-600' : 'text-gray-600';
              
              return (
                <Card key={contract.id} className="p-4 bg-gray-50/50 border-gray-200">
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
                      <p className="text-xs text-gray-500 mb-1">Credit Balance</p>
                      <CreditBar used={contract.creditUsed} total={contract.creditLimit} />
                    </div>

                    {/* Status & Actions */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2 mb-2 flex-wrap justify-end">
                        <ContractStatusBadge status={contract.status} />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => handleEditContract(contract)}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {onDeleteContract && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-red-600 hover:bg-red-50"
                            onClick={() => onDeleteContract(contract.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      {contract.notes && (
                        <p className="text-xs text-gray-500 italic">{contract.notes}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
            )}
          </div>
        </Card>
      )}

      {/* Agency Members Section (Only show when editing) */}
      {isEditMode && !isLoading && (
        <Card className="p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Agency Members</h2>
              <p className="text-sm text-gray-600">All customer accounts associated with this travel agency</p>
            </div>
            {onAddMember && (
              <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onAddMember}>
                Add member
              </Button>
            )}
          </div>

          {/* Members Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-xs text-blue-700 mb-1">Total Members</p>
              <p className="text-2xl font-semibold text-blue-900">{members.length}</p>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-xs text-green-700 mb-1">Active</p>
              <p className="text-2xl font-semibold text-green-900">{members.filter(m => m.status === 'active').length}</p>
            </Card>
            <Card className="p-4 bg-gray-50 border-gray-200">
              <p className="text-xs text-gray-700 mb-1">Inactive</p>
              <p className="text-2xl font-semibold text-gray-900">{members.filter(m => m.status === 'inactive').length}</p>
            </Card>
            <Card className="p-4 bg-red-50 border-red-200">
              <p className="text-xs text-red-700 mb-1">Suspended</p>
              <p className="text-2xl font-semibold text-red-900">{members.filter(m => m.status === 'suspended').length}</p>
            </Card>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Travel Group</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  {onDeleteMember && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={onDeleteMember ? 9 : 8} className="px-4 py-8 text-center text-sm text-gray-500">
                      No members linked to this agency yet.
                    </td>
                  </tr>
                ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{member.accountNumber}</td>
                    <td className="px-4 py-3">
                      <button type="button" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        {member.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{member.travelGroup}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{member.memberType}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={
                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                        member.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    {onDeleteMember && (
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-red-600 hover:bg-red-50"
                          onClick={() => onDeleteMember(member.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Contract Dialog */}
      <Dialog open={!!editingContract} onOpenChange={() => setEditingContract(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contract</DialogTitle>
            <DialogDescription>
              Update contract details for {editingContract?.contractNumber}
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