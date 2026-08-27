import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Filter, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: '1',  timestamp: '2024-10-22 14:30:25', user: 'HKIAL Staff',    action: 'Updated booking status',            module: 'Bookings',      details: 'Changed status from Pending to Approved for A-202602-000001',          ipAddress: '192.168.1.100', status: 'success' },
  { id: '2',  timestamp: '2024-10-22 14:15:12', user: 'Wong Chi Ming',  action: 'Approved customer application',      module: 'Customers',     details: 'Approved application APP-2024-015 and assigned account ACC-2024-0234', ipAddress: '192.168.1.105', status: 'success' },
  { id: '3',  timestamp: '2024-10-22 13:45:33', user: 'Chan Siu Lan',   action: 'Failed login attempt',               module: 'Authentication', details: 'Invalid password entered',                                              ipAddress: '192.168.1.120', status: 'failed'  },
  { id: '4',  timestamp: '2024-10-22 13:30:18', user: 'Lee Ka Wai',     action: 'Created new booking',               module: 'Bookings',      details: 'Created booking A-202602-000045 for guest John Smith',                  ipAddress: '192.168.1.108', status: 'success' },
  { id: '5',  timestamp: '2024-10-22 12:20:44', user: 'Lam Mei Ling',   action: 'Updated bookable item',             module: 'Items',         details: 'Changed price of VIP Suite A from HK$4,200 to HK$4,500',               ipAddress: '192.168.1.115', status: 'success' },
  { id: '6',  timestamp: '2024-10-22 11:55:09', user: 'HKIAL Staff',    action: 'Created system user',               module: 'System Users',  details: 'Created new staff account for Tang Wai Hong',                           ipAddress: '192.168.1.100', status: 'success' },
  { id: '7',  timestamp: '2024-10-22 11:30:22', user: 'Wong Chi Ming',  action: 'Exported report',                   module: 'Reports',       details: 'Generated and exported Daily Booking Report for 2024-10-22',            ipAddress: '192.168.1.105', status: 'success' },
  { id: '8',  timestamp: '2024-10-22 10:45:15', user: 'Lee Ka Wai',     action: 'Attempted unauthorized access',     module: 'System Users',  details: 'Tried to access System Users Management without permission',             ipAddress: '192.168.1.108', status: 'warning' },
  { id: '9',  timestamp: '2024-10-22 10:15:38', user: 'Chan Siu Lan',   action: 'Rejected booking',                  module: 'Bookings',      details: 'Rejected booking A-202602-000044 - Reason: Suite not available',        ipAddress: '192.168.1.120', status: 'success' },
  { id: '10', timestamp: '2024-10-22 09:30:51', user: 'HKIAL Staff',    action: 'Updated system settings',           module: 'Settings',      details: 'Changed email notification settings for booking confirmations',          ipAddress: '192.168.1.100', status: 'success' },
];

export interface AuditLogsProps {
  audits?: AuditLog[];
  isLoading?: boolean;
  onFilter?: (module: string, status: string) => void;
}

export function AuditLogs({ audits: auditsProp, isLoading }: AuditLogsProps = {}) {
  const logs: AuditLog[] = auditsProp?.length ? auditsProp : MOCK_AUDIT_LOGS;

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesModule && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Audit Logs</h1>
        <p className="text-gray-600">Track all system activities and user actions</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, action, or details..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="Bookings">Bookings</SelectItem>
              <SelectItem value="Customers">Customers</SelectItem>
              <SelectItem value="Items">Bookable Items</SelectItem>
              <SelectItem value="System Users">System Users</SelectItem>
              <SelectItem value="Reports">Reports</SelectItem>
              <SelectItem value="Authentication">Authentication</SelectItem>
              <SelectItem value="Settings">Settings</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Activities</p>
          <h2 className="mt-1">{logs.length}</h2>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Successful Actions</p>
          <h2 className="mt-1 text-green-600">{logs.filter(l => l.status === 'success').length}</h2>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Failed Actions</p>
          <h2 className="mt-1 text-red-600">{logs.filter(l => l.status === 'failed').length}</h2>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Warnings</p>
          <h2 className="mt-1 text-yellow-600">{logs.filter(l => l.status === 'warning').length}</h2>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline">{log.module}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.ipAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredLogs.length} of {logs.length} entries
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
            Previous
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            1
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
            2
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
            3
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}