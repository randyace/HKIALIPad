import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from './ui/dialog';
import { Search, Plus, Eye, Edit, Building2, Plane, Phone, Mail, FileText, Calendar, Users, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type AccountType = 'Corporate' | 'Agency';

interface Contact {
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

interface Contract {
  contractRef: string;
  startDate: string;
  endDate: string;
  value: number;
  terms: string;
}

interface BookingHistorySummary {
  month: string;
  bookings: number;
  sessionsUsed: number;
  revenue: number;
}

interface CompanyProfile {
  id: number;
  accountNumber: string;
  companyName: string;
  accountType: AccountType;
  industry: string;
  country: string;
  address: string;
  website: string;
  status: 'Active' | 'Inactive' | 'Pending';
  creditBalance: number;
  currentSessions: number;
  totalSessionsAllotted: number;
  contracts: Contract[];
  contacts: Contact[];
  bookingHistory: BookingHistorySummary[];
  notes: string;
  joinedDate: string;
}

const MOCK_PROFILES: CompanyProfile[] = [
  {
    id: 1, accountNumber: 'CORP-2024-0001', companyName: 'Cathay Pacific Airways', accountType: 'Corporate',
    industry: 'Aviation', country: 'Hong Kong', address: '2 Scenic Rd, HK International Airport',
    website: 'www.cathaypacific.com', status: 'Active', creditBalance: 45000, currentSessions: 5,
    totalSessionsAllotted: 20, joinedDate: '2024-01-15', notes: 'Premier partner. Negotiated rate applies.',
    contracts: [{ contractRef: 'CTR-2024-001', startDate: '2024-01-15', endDate: '2025-01-14', value: 84000, terms: 'Annual corporate agreement with 20% volume discount.' }],
    contacts: [
      { name: 'Alice Lam', role: 'Corporate Relations Manager', email: 'alice.lam@cathaypacific.com', phone: '+852 2747 1234', isPrimary: true },
      { name: 'Ben Chan', role: 'Finance Director', email: 'ben.chan@cathaypacific.com', phone: '+852 2747 5678', isPrimary: false },
    ],
    bookingHistory: [
      { month: 'Feb 2025', bookings: 8,  sessionsUsed: 8,  revenue: 24000 },
      { month: 'Jan 2025', bookings: 12, sessionsUsed: 12, revenue: 36000 },
      { month: 'Dec 2024', bookings: 15, sessionsUsed: 15, revenue: 45000 },
    ],
  },
  {
    id: 2, accountNumber: 'CORP-2024-0002', companyName: 'HSBC Hong Kong', accountType: 'Corporate',
    industry: 'Banking & Finance', country: 'Hong Kong', address: "1 Queen's Road Central, HK",
    website: 'www.hsbc.com.hk', status: 'Active', creditBalance: 20000, currentSessions: 10,
    totalSessionsAllotted: 10, joinedDate: '2024-03-20', notes: 'New account — Basic Bundle. Potential for upgrade.',
    contracts: [{ contractRef: 'CTR-2024-002', startDate: '2024-03-20', endDate: '2024-09-19', value: 3800, terms: 'Basic Bundle, single-term.' }],
    contacts: [
      { name: 'Brian Wong', role: 'Executive Assistant', email: 'brian.wong@hsbc.com', phone: '+852 2822 1111', isPrimary: true },
    ],
    bookingHistory: [
      { month: 'Feb 2025', bookings: 0, sessionsUsed: 0, revenue: 0 },
      { month: 'Jan 2025', bookings: 3, sessionsUsed: 3, revenue: 9000 },
    ],
  },
  {
    id: 3, accountNumber: 'CORP-2024-0003', companyName: 'Jardine Matheson', accountType: 'Corporate',
    industry: 'Conglomerate', country: 'Hong Kong', address: '48/F Jardine House, 1 Connaught Pl, HK',
    website: 'www.jardines.com', status: 'Active', creditBalance: 120000, currentSessions: 18,
    totalSessionsAllotted: 100, joinedDate: '2024-02-01', notes: 'Enterprise client. Priority service.',
    contracts: [{ contractRef: 'CTR-2024-003', startDate: '2024-02-01', endDate: '2026-01-31', value: 280000, terms: '2-year enterprise contract with SLA.' }],
    contacts: [
      { name: 'Carol Chan', role: 'Group Travel Coordinator', email: 'carol.chan@jardine.com', phone: '+852 2843 8888', isPrimary: true },
      { name: 'Derek Lam', role: 'CFO', email: 'derek.lam@jardine.com', phone: '+852 2843 9999', isPrimary: false },
    ],
    bookingHistory: [
      { month: 'Feb 2025', bookings: 20, sessionsUsed: 20, revenue: 60000 },
      { month: 'Jan 2025', bookings: 22, sessionsUsed: 22, revenue: 66000 },
      { month: 'Dec 2024', bookings: 25, sessionsUsed: 25, revenue: 75000 },
    ],
  },
  {
    id: 4, accountNumber: 'TA-2024-0001', companyName: 'Wings Travel Agency', accountType: 'Agency',
    industry: 'Travel & Tourism', country: 'Hong Kong', address: 'Unit 5A, 22/F Tower 1, Times Square',
    website: 'www.wingstravel.hk', status: 'Active', creditBalance: 32000, currentSessions: 12,
    totalSessionsAllotted: 50, joinedDate: '2024-04-10', notes: 'High-volume agency. Monthly billing.',
    contracts: [{ contractRef: 'CTR-2024-004', startDate: '2024-04-10', endDate: '2025-04-09', value: 160000, terms: 'Business Bundle with monthly invoicing.' }],
    contacts: [
      { name: 'Eric Ng', role: 'Operations Manager', email: 'eric.ng@wingstravel.hk', phone: '+852 3128 4567', isPrimary: true },
    ],
    bookingHistory: [
      { month: 'Feb 2025', bookings: 10, sessionsUsed: 10, revenue: 30000 },
      { month: 'Jan 2025', bookings: 14, sessionsUsed: 14, revenue: 42000 },
      { month: 'Dec 2024', bookings: 18, sessionsUsed: 18, revenue: 54000 },
    ],
  },
  {
    id: 5, accountNumber: 'TA-2024-0002', companyName: 'Pacific World Travel', accountType: 'Agency',
    industry: 'Travel & Tourism', country: 'Hong Kong', address: '12/F Hennessy Centre, 500 Hennessy Rd',
    website: 'www.pacificworld.hk', status: 'Pending', creditBalance: 7000, currentSessions: 0,
    totalSessionsAllotted: 20, joinedDate: '2025-02-22', notes: 'Newly onboarded. Invoice pending.',
    contracts: [{ contractRef: 'CTR-2025-001', startDate: '2025-02-22', endDate: '2026-02-21', value: 7000, terms: 'Standard Bundle, trial period.' }],
    contacts: [
      { name: 'Fiona Cheung', role: 'Account Director', email: 'fiona@pacificworld.hk', phone: '+852 2339 8800', isPrimary: true },
    ],
    bookingHistory: [],
  },
];

export interface CorporateProfilesProps {
  profiles?: CompanyProfile[];
  isLoading?: boolean;
  onViewProfile?: (profileId: number) => void;
  onEditProfile?: (profileId: number) => void;
  onCreateProfile?: () => void;
}

export function CorporateProfiles({
  profiles: profilesProp,
  onViewProfile,
  onEditProfile,
  onCreateProfile,
}: CorporateProfilesProps = {}) {
  const profiles: CompanyProfile[] = profilesProp?.length ? profilesProp : MOCK_PROFILES;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | AccountType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive' | 'Pending'>('all');
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'contracts' | 'history'>('overview');

  const filtered = profiles.filter(p => {
    const matchSearch = !searchTerm || p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || p.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType   = filterType   === 'all' || p.accountType === filterType;
    const matchStatus = filterStatus === 'all' || p.status      === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const statusColor = (s: string) => {
    if (s === 'Active')   return 'bg-green-100 text-green-700';
    if (s === 'Pending')  return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-500';
  };

  const openDetail = (p: CompanyProfile) => { setSelectedProfile(p); setActiveTab('overview'); setIsDetailOpen(true); };

  const tabs = [
    { id: 'overview',   label: 'Overview'         },
    { id: 'contacts',   label: 'Contacts'          },
    { id: 'contracts',  label: 'Contracts'         },
    { id: 'history',    label: 'Booking History'   },
  ] as const;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Corporate & Agency Profiles</h1>
          <p className="text-sm text-gray-500">Centralized profiles with contracts, contacts, and booking history.</p>
        </div>
        <Button className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white shrink-0"
          onClick={() => onCreateProfile && onCreateProfile()}>
          <Plus className="w-4 h-4 mr-2" />Add Profile
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-[#0f2942] text-white"><p className="text-xs text-blue-200 mb-1">Total Profiles</p><p className="text-2xl text-white">{profiles.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 mb-1">Active</p><p className="text-2xl text-green-600">{profiles.filter(p => p.status === 'Active').length}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 mb-1">Corporate</p><p className="text-2xl text-blue-600">{profiles.filter(p => p.accountType === 'Corporate').length}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 mb-1">Agency</p><p className="text-2xl text-purple-600">{profiles.filter(p => p.accountType === 'Agency').length}</p></Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by company name or account number..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Agency">Agency</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(profile => {
          const utilizationPct = profile.totalSessionsAllotted > 0
            ? Math.round((profile.currentSessions / profile.totalSessionsAllotted) * 100) : 0;
          const remaining = profile.totalSessionsAllotted - profile.currentSessions;
          return (
            <Card key={profile.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(profile)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${profile.accountType === 'Corporate' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {profile.accountType === 'Corporate' ? <Building2 className="w-5 h-5 text-blue-600" /> : <Plane className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{profile.companyName}</p>
                    <p className="text-xs text-gray-500">{profile.accountNumber}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(profile.status)}`}>{profile.status}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{profile.industry} · {profile.country}</p>

              {/* Session Balance */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Sessions Remaining</span>
                  <span className="text-gray-900">{remaining}/{profile.totalSessionsAllotted}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${remaining / profile.totalSessionsAllotted > 0.5 ? 'bg-green-500' : remaining / profile.totalSessionsAllotted > 0.2 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${profile.totalSessionsAllotted > 0 ? (remaining / profile.totalSessionsAllotted) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{profile.contacts.length} contacts</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{profile.contracts.length} contract{profile.contracts.length !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1 text-blue-600">View <ChevronRight className="w-3 h-3" /></span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProfile && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedProfile.accountType === 'Corporate' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {selectedProfile.accountType === 'Corporate' ? <Building2 className="w-5 h-5 text-blue-600" /> : <Plane className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div>
                    <DialogTitle>{selectedProfile.companyName}</DialogTitle>
                    <p className="text-sm text-gray-500">{selectedProfile.accountNumber} · {selectedProfile.accountType}</p>
                  </div>
                </div>
              </DialogHeader>

              {/* Tabs */}
              <div className="flex gap-1 border-b mb-4">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${activeTab === tab.id ? 'border-[#0f2942] text-[#0f2942]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Industry', selectedProfile.industry],
                      ['Country', selectedProfile.country],
                      ['Website', selectedProfile.website],
                      ['Status', selectedProfile.status],
                      ['Joined', selectedProfile.joinedDate],
                      ['Credit Balance', `HKD ${selectedProfile.creditBalance.toLocaleString()}`],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500 mb-1">{k}</p>
                        <p className="text-gray-900">{v}</p>
                      </div>
                    ))}
                    <div className="bg-gray-50 rounded p-3 col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-gray-900">{selectedProfile.address}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-4">
                    <p className="text-xs text-gray-500 mb-2">Session Balance</p>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{selectedProfile.totalSessionsAllotted - selectedProfile.currentSessions}/{selectedProfile.totalSessionsAllotted} remaining</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${selectedProfile.totalSessionsAllotted > 0 ? ((selectedProfile.totalSessionsAllotted - selectedProfile.currentSessions) / selectedProfile.totalSessionsAllotted) * 100 : 0}%` }} />
                    </div>
                  </div>
                  {selectedProfile.notes && (
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{selectedProfile.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-3">
                  {selectedProfile.contacts.map((c, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-gray-900">{c.name}</p>
                            {c.isPrimary && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Primary</span>}
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{c.role}</p>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                            <span className="text-xs text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'contracts' && (
                <div className="space-y-3">
                  {selectedProfile.contracts.map((c, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-blue-700">{c.contractRef}</p>
                        <span className="text-sm text-gray-900">HKD {c.value.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div><p className="text-gray-500">Start</p><p className="text-gray-900">{c.startDate}</p></div>
                        <div><p className="text-gray-500">End</p><p className="text-gray-900">{c.endDate}</p></div>
                      </div>
                      <p className="text-xs text-gray-600 bg-gray-50 rounded p-2">{c.terms}</p>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  {selectedProfile.bookingHistory.length === 0
                    ? <p className="text-sm text-gray-500 text-center py-8">No booking history yet.</p>
                    : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead>Bookings</TableHead>
                            <TableHead>Sessions Used</TableHead>
                            <TableHead>Revenue (HKD)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProfile.bookingHistory.map((h, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-sm text-gray-900">{h.month}</TableCell>
                              <TableCell className="text-sm text-gray-700">{h.bookings}</TableCell>
                              <TableCell className="text-sm text-gray-700">{h.sessionsUsed}</TableCell>
                              <TableCell className="text-sm text-gray-900">{h.revenue.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                </div>
              )}
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
            <Button className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white"
              onClick={() => { onEditProfile && onEditProfile(selectedProfile?.id || 0); }}>
              <Edit className="w-4 h-4 mr-2" />Edit Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}