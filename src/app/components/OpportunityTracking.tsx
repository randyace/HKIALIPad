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
import {
  Phone, Mail, Users, Plus, Eye, Edit, Calendar, TrendingUp,
  CheckCircle, XCircle, Clock, AlertCircle, Target, MessageSquare,
  Building2, Plane, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type DealStage = 'Prospecting' | 'Proposal Sent' | 'Negotiation' | 'Renewal Due' | 'Closed Won' | 'Closed Lost';
type InteractionType = 'Meeting' | 'Call' | 'Email' | 'Site Visit';
type AccountType = 'Corporate' | 'Agency';

interface Interaction {
  id: number;
  date: string;
  type: InteractionType;
  summary: string;
  followUpDate?: string;
  conductedBy: string;
}

interface Opportunity {
  id: number;
  opportunityRef: string;
  companyName: string;
  accountNumber: string;
  accountType: AccountType;
  contactName: string;
  contactEmail: string;
  stage: DealStage;
  estimatedValue: number;
  currency: string;
  expectedCloseDate: string;
  assignedTo: string;
  description: string;
  createdDate: string;
  lastActivityDate: string;
  interactions: Interaction[];
  notes: string;
}

const STAGE_CONFIG: Record<DealStage, { color: string; bg: string; border: string; icon: React.ReactNode; order: number }> = {
  'Prospecting':   { color: 'text-gray-700',   bg: 'bg-gray-100',   border: 'border-gray-300',  icon: <Target className="w-3.5 h-3.5" />,       order: 1 },
  'Proposal Sent': { color: 'text-blue-700',   bg: 'bg-blue-100',   border: 'border-blue-300',  icon: <Mail className="w-3.5 h-3.5" />,          order: 2 },
  'Negotiation':   { color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300',icon: <MessageSquare className="w-3.5 h-3.5" />, order: 3 },
  'Renewal Due':   { color: 'text-amber-700',  bg: 'bg-amber-100',  border: 'border-amber-300', icon: <AlertCircle className="w-3.5 h-3.5" />,   order: 4 },
  'Closed Won':    { color: 'text-green-700',  bg: 'bg-green-100',  border: 'border-green-300', icon: <CheckCircle className="w-3.5 h-3.5" />,   order: 5 },
  'Closed Lost':   { color: 'text-red-700',    bg: 'bg-red-100',    border: 'border-red-300',   icon: <XCircle className="w-3.5 h-3.5" />,       order: 6 },
};

const INTERACTION_ICONS: Record<InteractionType, React.ReactNode> = {
  Meeting:    <Users className="w-3.5 h-3.5" />,
  Call:       <Phone className="w-3.5 h-3.5" />,
  Email:      <Mail className="w-3.5 h-3.5" />,
  'Site Visit': <Building2 className="w-3.5 h-3.5" />,
};

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 1, opportunityRef: 'OPP-2025-0001', companyName: 'Cathay Pacific Airways', accountNumber: 'CORP-2024-0001',
    accountType: 'Corporate', contactName: 'Alice Lam', contactEmail: 'alice.lam@cathaypacific.com',
    stage: 'Renewal Due', estimatedValue: 168000, currency: 'HKD',
    expectedCloseDate: '2025-03-31', assignedTo: 'Kelly Chan', createdDate: '2024-12-01', lastActivityDate: '2025-02-18',
    description: 'Annual contract renewal. Client is happy but may seek Enterprise upgrade.',
    notes: 'Alice mentioned possible headcount growth. Explore Enterprise Bundle.',
    interactions: [
      { id: 1, date: '2025-02-18', type: 'Meeting', summary: 'Renewal discussion. Client satisfied. Interested in upgrade options.', followUpDate: '2025-03-01', conductedBy: 'Kelly Chan' },
      { id: 2, date: '2025-01-20', type: 'Call', summary: 'Check-in call. No issues. Confirmed renewal intent.', conductedBy: 'Kelly Chan' },
      { id: 3, date: '2024-12-15', type: 'Email', summary: 'Sent renewal proposal and pricing sheet.', conductedBy: 'Kelly Chan' },
    ],
  },
  {
    id: 2, opportunityRef: 'OPP-2025-0002', companyName: 'Goldman Sachs HK', accountNumber: 'PROSPECT-001',
    accountType: 'Corporate', contactName: 'Michael Yung', contactEmail: 'm.yung@gs.com',
    stage: 'Proposal Sent', estimatedValue: 280000, currency: 'HKD',
    expectedCloseDate: '2025-04-15', assignedTo: 'David Lau', createdDate: '2025-01-10', lastActivityDate: '2025-02-10',
    description: 'New enterprise prospect. CFO office has 30+ frequent flyers per month.',
    notes: 'Decision maker is CFO. Proposal sent for Enterprise Bundle.',
    interactions: [
      { id: 1, date: '2025-02-10', type: 'Meeting', summary: 'Presented Enterprise Bundle proposal. Price negotiation expected.', followUpDate: '2025-02-24', conductedBy: 'David Lau' },
      { id: 2, date: '2025-01-22', type: 'Site Visit', summary: 'Hosted Michael for lounge tour. Very positive feedback.', conductedBy: 'David Lau' },
      { id: 3, date: '2025-01-10', type: 'Call', summary: 'Initial discovery call. Identified 30+ travellers/month.', conductedBy: 'David Lau' },
    ],
  },
  {
    id: 3, opportunityRef: 'OPP-2025-0003', companyName: 'Fortune Travel Group', accountNumber: 'TA-2024-0003',
    accountType: 'Agency', contactName: 'Gary Tsang', contactEmail: 'gary.tsang@fortunetravel.com',
    stage: 'Negotiation', estimatedValue: 160000, currency: 'HKD',
    expectedCloseDate: '2025-03-15', assignedTo: 'Kelly Chan', createdDate: '2025-01-05', lastActivityDate: '2025-02-21',
    description: 'Upsell from Business to Enterprise Bundle. Balance nearly depleted.',
    notes: 'Gary is pushing for 5% discount on Enterprise. Approved by manager.',
    interactions: [
      { id: 1, date: '2025-02-21', type: 'Call', summary: 'Negotiating discount terms. Gary accepted 3%.', followUpDate: '2025-02-28', conductedBy: 'Kelly Chan' },
      { id: 2, date: '2025-02-05', type: 'Meeting', summary: 'Presented upsell options. Client interested in Enterprise.', conductedBy: 'Kelly Chan' },
    ],
  },
  {
    id: 4, opportunityRef: 'OPP-2025-0004', companyName: 'Pacific World Travel', accountNumber: 'TA-2024-0002',
    accountType: 'Agency', contactName: 'Fiona Cheung', contactEmail: 'fiona@pacificworld.hk',
    stage: 'Prospecting', estimatedValue: 32000, currency: 'HKD',
    expectedCloseDate: '2025-05-01', assignedTo: 'David Lau', createdDate: '2025-02-22', lastActivityDate: '2025-02-22',
    description: 'Newly onboarded. Standard Bundle trial. Assess utilisation for upsell in Q3.',
    notes: 'Monitor usage in first 3 months.',
    interactions: [
      { id: 1, date: '2025-02-22', type: 'Email', summary: 'Welcome email sent with onboarding guide.', conductedBy: 'David Lau' },
    ],
  },
  {
    id: 5, opportunityRef: 'OPP-2024-0005', companyName: 'HSBC Hong Kong', accountNumber: 'CORP-2024-0002',
    accountType: 'Corporate', contactName: 'Brian Wong', contactEmail: 'brian.wong@hsbc.com',
    stage: 'Closed Won', estimatedValue: 3800, currency: 'HKD',
    expectedCloseDate: '2024-03-20', assignedTo: 'Kelly Chan', createdDate: '2024-02-15', lastActivityDate: '2024-03-20',
    description: 'Basic Bundle sold. Entry-level package.',
    notes: 'Watch for utilisation — potential to upgrade to Standard.',
    interactions: [
      { id: 1, date: '2024-03-20', type: 'Call', summary: 'Contract signed. Basic Bundle activated.', conductedBy: 'Kelly Chan' },
      { id: 2, date: '2024-03-01', type: 'Meeting', summary: 'Signed off on Basic Bundle terms.', conductedBy: 'Kelly Chan' },
    ],
  },
  {
    id: 6, opportunityRef: 'OPP-2024-0006', companyName: 'DHL Express HK', accountNumber: 'PROSPECT-002',
    accountType: 'Corporate', contactName: 'Tom Leung', contactEmail: 't.leung@dhl.com',
    stage: 'Closed Lost', estimatedValue: 56000, currency: 'HKD',
    expectedCloseDate: '2024-11-30', assignedTo: 'David Lau', createdDate: '2024-09-01', lastActivityDate: '2024-11-30',
    description: 'Lost to competitor — preferred in-terminal lounge contract.',
    notes: 'Re-approach Q3 2025 when their contract expires.',
    interactions: [
      { id: 1, date: '2024-11-30', type: 'Email', summary: 'Client confirmed they signed with competitor.', conductedBy: 'David Lau' },
      { id: 2, date: '2024-10-15', type: 'Meeting', summary: 'Final pitch. Strong competition from CX Lounge.', conductedBy: 'David Lau' },
    ],
  },
];

function StageBadge({ stage }: { stage: DealStage }) {
  const cfg = STAGE_CONFIG[stage];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}{stage}
    </span>
  );
}

function InteractionIcon({ type }: { type: InteractionType }) {
  const COLORS: Record<InteractionType, string> = {
    Meeting: 'bg-blue-100 text-blue-600', Call: 'bg-green-100 text-green-600',
    Email: 'bg-gray-100 text-gray-600', 'Site Visit': 'bg-purple-100 text-purple-600',
  };
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${COLORS[type]}`}>
      {INTERACTION_ICONS[type]}
    </span>
  );
}

// ── Props interface ───────────────────────────────────────────────────────────
export interface OpportunityTrackingProps {
  /** Pass populated array from CI4; falls back to MOCK_OPPORTUNITIES when empty */
  opportunities?: Opportunity[];
  onUpdateStatus?: (id: string, status: DealStage) => void;
  onAddInteraction?: (id: string) => void;
  isLoading?: boolean;
}

export function OpportunityTracking({
  opportunities: opportunitiesProp = [],
  onUpdateStatus,
  onAddInteraction,
  isLoading = false,
}: OpportunityTrackingProps = {}) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(
    opportunitiesProp.length > 0 ? opportunitiesProp : MOCK_OPPORTUNITIES,
  );
  const [filterStage, setFilterStage]     = useState<'all' | DealStage>('all');
  const [filterType,  setFilterType]      = useState<'all' | AccountType>('all');
  const [searchTerm,  setSearchTerm]      = useState('');
  const [viewMode,    setViewMode]        = useState<'pipeline' | 'table'>('pipeline');

  const [selectedOpp, setSelectedOpp]   = useState<Opportunity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Log interaction dialog
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logOppId,  setLogOppId]  = useState<number | null>(null);
  const [logType,   setLogType]   = useState<InteractionType>('Meeting');
  const [logSummary, setLogSummary] = useState('');
  const [logDate,    setLogDate]   = useState(new Date().toISOString().split('T')[0]);
  const [logFollowUp, setLogFollowUp] = useState('');
  const [logBy,      setLogBy]     = useState('HKIAL Staff');

  const filtered = opportunities.filter(o => {
    const matchSearch = !searchTerm || o.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || o.opportunityRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStage  = filterStage === 'all' || o.stage === filterStage;
    const matchType   = filterType  === 'all' || o.accountType === filterType;
    return matchSearch && matchStage && matchType;
  });

  const PIPELINE_STAGES: DealStage[] = ['Prospecting', 'Proposal Sent', 'Negotiation', 'Renewal Due'];
  const CLOSED_STAGES:   DealStage[] = ['Closed Won', 'Closed Lost'];

  const totalPipelineValue = opportunities
    .filter(o => !CLOSED_STAGES.includes(o.stage))
    .reduce((s, o) => s + o.estimatedValue, 0);
  const closedWonValue = opportunities.filter(o => o.stage === 'Closed Won').reduce((s, o) => s + o.estimatedValue, 0);
  const renewalDueCount = opportunities.filter(o => o.stage === 'Renewal Due').length;

  const handleLogInteraction = () => {
    if (!logOppId || !logSummary.trim()) return;
    setOpportunities(prev => prev.map(o => {
      if (o.id !== logOppId) return o;
      const newInteraction: Interaction = {
        id: Math.max(...o.interactions.map(i => i.id), 0) + 1,
        date: logDate, type: logType, summary: logSummary,
        followUpDate: logFollowUp || undefined, conductedBy: logBy,
      };
      return { ...o, interactions: [newInteraction, ...o.interactions], lastActivityDate: logDate };
    }));
    toast.success('Interaction Logged', { description: `${logType} logged for ${opportunities.find(o => o.id === logOppId)?.companyName}` });
    // Also update selectedOpp if open
    if (selectedOpp?.id === logOppId) {
      setSelectedOpp(prev => prev ? {
        ...prev, lastActivityDate: logDate,
        interactions: [{ id: Math.max(...prev.interactions.map(i => i.id), 0) + 1, date: logDate, type: logType, summary: logSummary, followUpDate: logFollowUp || undefined, conductedBy: logBy }, ...prev.interactions],
      } : prev);
    }
    setIsLogOpen(false); setLogSummary(''); setLogFollowUp('');
  };

  const openLogDialog = (opp: Opportunity) => {
    setLogOppId(opp.id); setLogDate(new Date().toISOString().split('T')[0]);
    setLogType('Meeting'); setIsLogOpen(true);
  };

  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">CRM & Opportunity Tracking</h1>
          <p className="text-sm text-gray-500">Track deal pipeline, log client interactions, and manage renewal cycles.</p>
        </div>
        <Button className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white"
          onClick={() => toast.info('New opportunity form coming soon.')}>
          <Plus className="w-4 h-4 mr-2" />New Opportunity
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-[#0f2942] text-white">
          <p className="text-xs text-blue-200 mb-1">Pipeline Value</p>
          <p className="text-xl text-white">HKD {(totalPipelineValue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-blue-300 mt-1">{opportunities.filter(o => !CLOSED_STAGES.includes(o.stage)).length} open deals</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1 mb-1"><CheckCircle className="w-4 h-4 text-green-500" /><p className="text-xs text-gray-500">Closed Won</p></div>
          <p className="text-xl text-green-600">HKD {(closedWonValue / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-4 border-2 border-amber-300 bg-amber-50">
          <div className="flex items-center gap-1 mb-1"><AlertCircle className="w-4 h-4 text-amber-600" /><p className="text-xs text-amber-700">Renewal Due</p></div>
          <p className="text-2xl text-amber-600">{renewalDueCount}</p>
          <p className="text-xs text-gray-500 mt-1">Action required</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1 mb-1"><TrendingUp className="w-4 h-4 text-blue-500" /><p className="text-xs text-gray-500">Total Opportunities</p></div>
          <p className="text-2xl text-blue-600">{opportunities.length}</p>
        </Card>
      </div>

      {/* Filters + View Toggle */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Input placeholder="Search by company or opportunity ref..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="pl-4" />
          </div>
          <Select value={filterStage} onValueChange={(v: any) => setFilterStage(v)}>
            <SelectTrigger className="w-full md:w-52"><SelectValue placeholder="All Stages" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {(['Prospecting','Proposal Sent','Negotiation','Renewal Due','Closed Won','Closed Lost'] as DealStage[]).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Agency">Agency</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md overflow-hidden">
            <button onClick={() => setViewMode('pipeline')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'pipeline' ? 'bg-[#0f2942] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              Pipeline
            </button>
            <button onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'table' ? 'bg-[#0f2942] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              Table
            </button>
          </div>
        </div>
      </Card>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="space-y-6">
          {/* Active Stages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PIPELINE_STAGES.map(stage => {
              const cfg  = STAGE_CONFIG[stage];
              const opps = filtered.filter(o => o.stage === stage);
              return (
                <div key={stage} className={`rounded-lg border-2 ${cfg.border} ${cfg.bg} p-3`}>
                  <div className={`flex items-center justify-between mb-3`}>
                    <div className={`flex items-center gap-1 text-sm ${cfg.color}`}>{cfg.icon}{stage}</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white/70 ${cfg.color}`}>{opps.length}</span>
                  </div>
                  <div className="space-y-2">
                    {opps.length === 0
                      ? <p className="text-xs text-gray-400 text-center py-4">No deals</p>
                      : opps.map(o => (
                          <div key={o.id} onClick={() => { setSelectedOpp(o); setIsDetailOpen(true); }}
                            className="bg-white rounded p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100">
                            <p className="text-xs text-gray-900 mb-1">{o.companyName}</p>
                            <p className="text-xs text-gray-500 mb-2">{o.accountType === 'Corporate' ? '🏢' : '✈️'} {o.opportunityRef}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">HKD {(o.estimatedValue / 1000).toFixed(0)}K</span>
                              <span className={`text-xs ${daysUntil(o.expectedCloseDate) < 30 ? 'text-red-600' : 'text-gray-500'}`}>
                                {daysUntil(o.expectedCloseDate) < 0 ? 'Overdue' : `${daysUntil(o.expectedCloseDate)}d`}
                              </span>
                            </div>
                          </div>
                        ))}
                  </div>
                  {opps.length > 0 && (
                    <p className="text-xs text-center mt-2 pt-2 border-t border-gray-200 opacity-60">
                      HKD {opps.reduce((s, o) => s + o.estimatedValue, 0).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {/* Closed row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLOSED_STAGES.map(stage => {
              const cfg  = STAGE_CONFIG[stage];
              const opps = filtered.filter(o => o.stage === stage);
              return (
                <div key={stage} className={`rounded-lg border-2 ${cfg.border} ${cfg.bg} p-3`}>
                  <div className={`flex items-center justify-between mb-3`}>
                    <div className={`flex items-center gap-1 text-sm ${cfg.color}`}>{cfg.icon}{stage}</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white/70 ${cfg.color}`}>{opps.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opps.length === 0
                      ? <p className="text-xs text-gray-400 col-span-2 text-center py-3">No deals</p>
                      : opps.map(o => (
                          <div key={o.id} onClick={() => { setSelectedOpp(o); setIsDetailOpen(true); }}
                            className="bg-white rounded p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100">
                            <p className="text-xs text-gray-900">{o.companyName}</p>
                            <p className="text-xs text-gray-500">HKD {(o.estimatedValue / 1000).toFixed(0)}K</p>
                          </div>
                        ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Est. Value</TableHead>
                  <TableHead>Close Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(o => (
                  <TableRow key={o.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm text-blue-700">{o.opportunityRef}</TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{o.companyName}</p>
                      <p className="text-xs text-gray-500">{o.contactName}</p>
                    </TableCell>
                    <TableCell>
                      {o.accountType === 'Corporate'
                        ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"><Building2 className="w-3 h-3" />Corp</span>
                        : <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700"><Plane className="w-3 h-3" />Agency</span>}
                    </TableCell>
                    <TableCell><StageBadge stage={o.stage} /></TableCell>
                    <TableCell className="text-sm text-gray-900">HKD {o.estimatedValue.toLocaleString()}</TableCell>
                    <TableCell className={`text-sm ${daysUntil(o.expectedCloseDate) < 30 ? 'text-red-600' : 'text-gray-600'}`}>{o.expectedCloseDate}</TableCell>
                    <TableCell className="text-sm text-gray-700">{o.assignedTo}</TableCell>
                    <TableCell className="text-sm text-gray-600">{o.lastActivityDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" className="text-xs px-2"
                          onClick={() => openLogDialog(o)}>
                          <MessageSquare className="w-3 h-3 mr-1" />Log
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedOpp(o); setIsDetailOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ── Opportunity Detail Dialog ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOpp && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>{selectedOpp.companyName}</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">{selectedOpp.opportunityRef}</p>
                  </div>
                  <StageBadge stage={selectedOpp.stage} />
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Contact', selectedOpp.contactName],
                    ['Email', selectedOpp.contactEmail],
                    ['Est. Value', `HKD ${selectedOpp.estimatedValue.toLocaleString()}`],
                    ['Expected Close', selectedOpp.expectedCloseDate],
                    ['Assigned To', selectedOpp.assignedTo],
                    ['Last Activity', selectedOpp.lastActivityDate],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">{k}</p>
                      <p className="text-gray-900">{v}</p>
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded p-3 col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700 text-sm">{selectedOpp.description}</p>
                  </div>
                  {selectedOpp.notes && (
                    <div className="bg-amber-50 rounded p-3 col-span-2 border border-amber-200">
                      <p className="text-xs text-amber-700 mb-1">Notes / BD Flags</p>
                      <p className="text-amber-800 text-sm">{selectedOpp.notes}</p>
                    </div>
                  )}
                </div>

                {/* Interaction Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-700">Interaction History</p>
                    <Button variant="outline" size="sm" className="text-xs"
                      onClick={() => { openLogDialog(selectedOpp); }}>
                      <Plus className="w-3 h-3 mr-1" />Log Interaction
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {selectedOpp.interactions.map(intr => (
                      <div key={intr.id} className="flex gap-3">
                        <div className="mt-0.5 shrink-0"><InteractionIcon type={intr.type} /></div>
                        <div className="flex-1 bg-gray-50 rounded p-3">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs text-gray-500">{intr.date} · {intr.type}</span>
                            <span className="text-xs text-gray-400">{intr.conductedBy}</span>
                          </div>
                          <p className="text-sm text-gray-900">{intr.summary}</p>
                          {intr.followUpDate && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />Follow-up: {intr.followUpDate}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
                <Button className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white"
                  onClick={() => toast.info('Edit opportunity form coming soon.')}>
                  <Edit className="w-4 h-4 mr-2" />Edit Stage
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Log Interaction Dialog ── */}
      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
            <DialogDescription>{opportunities.find(o => o.id === logOppId)?.companyName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-[10px] block">Interaction Type *</Label>
              <Select value={logType} onValueChange={(v: any) => setLogType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Site Visit">Site Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-[10px] block">Date *</Label>
              <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-[10px] block">Summary *</Label>
              <Textarea rows={3} placeholder="What was discussed / agreed..." value={logSummary} onChange={(e) => setLogSummary(e.target.value)} />
            </div>
            <div>
              <Label className="mb-[10px] block">Follow-up Date</Label>
              <Input type="date" value={logFollowUp} onChange={(e) => setLogFollowUp(e.target.value)} />
            </div>
            <div>
              <Label className="mb-[10px] block">Conducted By</Label>
              <Input value={logBy} onChange={(e) => setLogBy(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogOpen(false)}>Cancel</Button>
            <Button className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white"
              disabled={!logSummary.trim()} onClick={handleLogInteraction}>
              <CheckCircle className="w-4 h-4 mr-2" />Save Interaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
