/**
 * SystemUsers.tsx — Pure presentational component.
 *
 * Rules:
 *  - Zero business state (users[] comes entirely from props)
 *  - Filter / pagination / dialog form state are pure UI state — allowed
 *  - All CRUD mutations reported via typed callbacks
 *  - Default props fall back to mockSystemUsersData (fixture pattern)
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, Search, Shield, Key, Calendar, Shuffle } from 'lucide-react';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { mockSystemUsersData } from './__fixtures__/SystemUsers.mocks';

// ─── Public types ─────────────────────────────────────────────────────────────

export type SystemUserRole   = 'System Admin' | 'Lounge Manager' | 'Supervisor' | 'Staff';
export type SystemUserStatus = 'active' | 'inactive';

export interface SystemUser {
  id:          number;
  name:        string;
  email:       string;
  role:        SystemUserRole;
  department:  string;
  status:      SystemUserStatus;
  lastLogin:   string;
  createdDate: string;
  permissions: string[];
}

export interface SystemUserFormData {
  name:        string;
  email:       string;
  role:        SystemUserRole;
  department:  string;
  permissions: string[];
  status:      SystemUserStatus;
}

export interface SystemUsersProps {
  /** Full list of system users to display */
  users?: SystemUser[];
  /** Called when the Create User form is submitted */
  onCreateUser?: (data: SystemUserFormData) => void;
  /** Called when the Edit User form is submitted */
  onUpdateUser?: (id: number, data: SystemUserFormData) => void;
  /** Called when the Delete button is clicked */
  onDeleteUser?: (id: number) => void;
  /** Called when the Manage Permissions (key) button is clicked */
  onManagePermissions?: (id: number) => void;
}

// ─── Permission options (static display config — not business data) ───────────

const ALL_PERMISSIONS = [
  'Approve Members',
  'Create Members',
  'Edit Members',
  'Approve Booking Request',
  'Create Bookings',
  'Edit Bookings',
  'Approve Invoices',
  'Process Payments',
  'View Reports',
  'Export Data',
  'Manage Staff',
  'Manage System Settings',
  'View Audit Logs',
  'Manage Bookable Items',
  'Daily Movement Log',
] as const;

// ─── Role / status colour helpers (pure functions — no state) ─────────────────

function getRoleColor(role: string): string {
  switch (role) {
    case 'System Admin':   return 'bg-purple-100 text-purple-700';
    case 'Lounge Manager': return 'bg-blue-100 text-blue-700';
    case 'Supervisor':     return 'bg-green-100 text-green-700';
    default:               return 'bg-gray-100 text-gray-700';
  }
}

function getStatusColor(status: string): string {
  return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
}

// ─── Pagination helper (pure function) ────────────────────────────────────────

function buildPageList(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3)             return [1, 2, 3, 4, -1, totalPages];
  if (currentPage >= totalPages - 2) return [1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, -1, currentPage - 1, currentPage, currentPage + 1, -2, totalPages];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SystemUsers({
  users               = mockSystemUsersData.users ?? [],
  onCreateUser        = () => {},
  onUpdateUser        = () => {},
  onDeleteUser        = () => {},
  onManagePermissions = () => {},
}: SystemUsersProps) {

  // ── Pure UI state ──────────────────────────────────────────────────────────
  const [searchTerm,  setSearchTerm]  = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser,  setEditingUser]  = useState<SystemUser | null>(null);
  const [formName,       setFormName]       = useState('');
  const [formEmail,      setFormEmail]      = useState('');
  const [formRole,       setFormRole]       = useState<SystemUserRole>('Staff');
  const [formDepartment, setFormDepartment] = useState('IT Department');
  const [formPermissions,setFormPermissions]= useState<string[]>([]);
  const [formStatus,     setFormStatus]     = useState<SystemUserStatus>('active');

  // ── Derived display data (pure computation, no side-effects) ──────────────

  const filteredUsers = users
    .filter(u => {
      const q = searchTerm.toLowerCase();
      const matchSearch = u.name.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          u.role.toLowerCase().includes(q);
      const matchRole  = roleFilter === 'all' || u.role === roleFilter;
      const matchStart = !startDate || new Date(u.createdDate) >= new Date(startDate);
      const matchEnd   = !endDate   || new Date(u.createdDate) <= new Date(endDate);
      return matchSearch && matchRole && matchStart && matchEnd;
    })
    .sort((a, b) => b.id - a.id);

  const totalPages     = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex     = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // ── Dialog helpers ─────────────────────────────────────────────────────────

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormRole('Staff');
    setFormDepartment('IT Department');
    setFormPermissions([]);
    setFormStatus('active');
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: SystemUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDepartment(user.department);
    setFormPermissions(user.permissions);
    setFormStatus(user.status);
    setIsDialogOpen(true);
  };

  const handleQuickFill = () => {
    setFormName('Karen Leung');
    setFormEmail('karen.leung@hkial.com');
    setFormRole('Supervisor');
    setFormDepartment('Lounge Operations');
    setFormPermissions(['approve_bookings', 'manage_bookings', 'view_reports']);
    setFormStatus('active');
  };

  const togglePermission = (perm: string) => {
    setFormPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData: SystemUserFormData = {
      name:        formName,
      email:       formEmail,
      role:        formRole,
      department:  formDepartment,
      permissions: formPermissions,
      status:      formStatus,
    };
    if (editingUser) {
      onUpdateUser(editingUser.id, formData);
    } else {
      onCreateUser(formData);
    }
    setIsDialogOpen(false);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setRoleFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // ── Pagination renderer ────────────────────────────────────────────────────

  const renderPagination = () => {
    const pages = buildPageList(currentPage, totalPages);
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {pages.map((page, idx) =>
            page < 0 ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>System Users Management</h1>
          <p className="text-gray-600">Manage staff accounts, roles, and permissions</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="System Admin">System Admin</SelectItem>
                <SelectItem value="Lounge Manager">Lounge Manager</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="mb-[10px] block text-sm text-gray-700">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <Calendar className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-[10px] block text-sm text-gray-700">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <Calendar className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div>{renderPagination()}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={() => openEditDialog(user)}
                      >
                        {user.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        className="h-8 w-8 p-0"
                        title="Edit User"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onManagePermissions(user.id)}
                        className="h-8 w-8 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                        title="Manage Permissions"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteUser(user.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="p-4 border-t flex justify-end">
            {renderPagination()}
          </div>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="min-w-[1200px] max-w-[1200px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit System User' : 'Create New System User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Edit the details of an existing system user.'
                : 'Create a new system user with the following details.'}
            </DialogDescription>
            {!editingUser && (
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickFill}
                className="gap-1 mt-2 w-fit bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border-yellow-400/50 text-yellow-700 hover:from-yellow-400/30 hover:to-amber-400/30 hover:border-yellow-500/70 hover:text-yellow-800 transition-all text-[10px] px-2 py-0.5 h-[25px]"
              >
                <Shuffle className="w-3 h-3" />
                Quick Fill Demo
              </Button>
            )}
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-[10px] block text-sm text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Wong Chi Ming"
                  required
                />
              </div>
              <div>
                <label className="mb-[10px] block text-sm text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="email@hkial.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-[10px] block text-sm text-gray-700">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as SystemUserRole)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="System Admin">System Admin</option>
                  <option value="Lounge Manager">Lounge Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="mb-[10px] block text-sm text-gray-700">Department</label>
                <select
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="IT Department">IT Department</option>
                  <option value="Lounge Operations">Lounge Operations</option>
                  <option value="Guest Services">Guest Services</option>
                  <option value="Finance">Finance</option>
                  <option value="Management">Management</option>
                  <option value="Security">Security</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="F&B Services">F&amp;B Services</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-[10px] block text-sm text-gray-700">Permissions</label>
              <div className="grid grid-cols-2 gap-3 p-4 border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                {ALL_PERMISSIONS.map((permission) => (
                  <label key={permission} className="flex items-center gap-2 cursor-pointer mb-[10px]">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={formPermissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                    />
                    <span className="text-sm">{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-[10px] block text-sm text-gray-700">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as SystemUserStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
