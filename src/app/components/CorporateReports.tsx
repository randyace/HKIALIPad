import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Download, TrendingUp, Building2, Plane, Users, BarChart2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const MONTHLY_UTILISATION = [
  { month: 'Aug',  cathaySessions: 18, jardine: 24, wings: 14, hsbc: 6,  pacific: 0 },
  { month: 'Sep',  cathaySessions: 20, jardine: 22, wings: 16, hsbc: 8,  pacific: 0 },
  { month: 'Oct',  cathaySessions: 15, jardine: 25, wings: 18, hsbc: 5,  pacific: 0 },
  { month: 'Nov',  cathaySessions: 22, jardine: 20, wings: 20, hsbc: 7,  pacific: 0 },
  { month: 'Dec',  cathaySessions: 28, jardine: 25, wings: 18, hsbc: 9,  pacific: 0 },
  { month: 'Jan',  cathaySessions: 12, jardine: 22, wings: 14, hsbc: 3,  pacific: 0 },
  { month: 'Feb',  cathaySessions: 8,  jardine: 20, wings: 10, hsbc: 0,  pacific: 0 },
];

const COMPANY_SUMMARY = [
  { company: 'Cathay Pacific Airways', type: 'Corporate',     totalSessions: 20,  used: 15, utilPct: 75,  revenue: 161000, lastBooking: '2025-02-18' },
  { company: 'Jardine Matheson',       type: 'Corporate',     totalSessions: 100, used: 82, utilPct: 82,  revenue: 504000, lastBooking: '2025-02-20' },
  { company: 'HSBC Hong Kong',         type: 'Corporate',     totalSessions: 10,  used: 3,  utilPct: 30,  revenue: 9000,   lastBooking: '2025-01-15' },
  { company: 'AIA Group',              type: 'Corporate',     totalSessions: 10,  used: 7,  utilPct: 70,  revenue: 30000,  lastBooking: '2025-02-10' },
  { company: 'Wings Travel Agency',    type: 'Agency', totalSessions: 50,  used: 38, utilPct: 76,  revenue: 192000, lastBooking: '2025-02-19' },
  { company: 'Fortune Travel Group',   type: 'Agency', totalSessions: 50,  used: 43, utilPct: 86,  revenue: 220000, lastBooking: '2025-02-21' },
  { company: 'Pacific World Travel',   type: 'Agency', totalSessions: 20,  used: 0,  utilPct: 0,   revenue: 0,      lastBooking: '—'          },
];

const PIE_DATA = [
  { name: 'Corporate',     value: 107, color: '#3b82f6' },
  { name: 'Agency', value: 81,  color: '#8b5cf6' },
];

const REVENUE_TREND = [
  { month: 'Aug 24', corporate: 145000, agency: 98000  },
  { month: 'Sep 24', corporate: 158000, agency: 112000 },
  { month: 'Oct 24', corporate: 130000, agency: 125000 },
  { month: 'Nov 24', corporate: 162000, agency: 130000 },
  { month: 'Dec 24', corporate: 195000, agency: 140000 },
  { month: 'Jan 25', corporate: 110000, agency: 105000 },
  { month: 'Feb 25', corporate: 88000,  agency: 78000  },
];

// ── MOCK constants (isolated — container replaces via props) ──────────────────
const MOCK_MONTHLY_UTILISATION = MONTHLY_UTILISATION;
const MOCK_COMPANY_SUMMARY     = COMPANY_SUMMARY;
const MOCK_PIE_DATA            = PIE_DATA;
const MOCK_REVENUE_TREND       = REVENUE_TREND;

// ── Props interface ───────────────────────────────────────────────────────────
export interface CorporateReportsProps {
  monthlyUtilisation?: typeof MONTHLY_UTILISATION;
  companySummary?: typeof COMPANY_SUMMARY;
  pieData?: typeof PIE_DATA;
  revenueTrend?: typeof REVENUE_TREND;
  onGenerateReport?: (type: string) => void;
  isLoading?: boolean;
}

export function CorporateReports({
  monthlyUtilisation: monthlyUtilisationProp,
  companySummary: companySummaryProp,
  pieData: pieDataProp,
  revenueTrend: revenueTrendProp,
  onGenerateReport,
  isLoading = false,
}: CorporateReportsProps = {}) {
  const displayMontly  = monthlyUtilisationProp ?? MOCK_MONTHLY_UTILISATION;
  const displaySummary = companySummaryProp     ?? MOCK_COMPANY_SUMMARY;
  const displayPie     = pieDataProp            ?? MOCK_PIE_DATA;
  const displayTrend   = revenueTrendProp       ?? MOCK_REVENUE_TREND;

  const [filterPeriod, setFilterPeriod] = useState<string>('last-6-months');
  const [filterType,   setFilterType]   = useState<string>('all');

  const filteredSummary = displaySummary.filter(c =>
    filterType === 'all' || c.type === filterType
  );

  const totalRevenue   = filteredSummary.reduce((s, c) => s + c.revenue, 0);
  const totalSessions  = filteredSummary.reduce((s, c) => s + c.used, 0);
  const avgUtil        = filteredSummary.length > 0 ? Math.round(filteredSummary.reduce((s, c) => s + c.utilPct, 0) / filteredSummary.length) : 0;
  const topCompany     = [...filteredSummary].sort((a, b) => b.utilPct - a.utilPct)[0];

  const utilBarColor = (pct: number) => pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">BD Usage Reports</h1>
          <p className="text-sm text-gray-500">Monthly utilisation analytics for Business Development review.</p>
        </div>
        <Button className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white"
          onClick={() => toast.success('Report exported!', { description: 'Corporate utilisation report downloaded as PDF.' })}>
          <Download className="w-4 h-4 mr-2" />Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            <SelectItem value="last-6-months">Last 6 Months</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Account Types</SelectItem>
            <SelectItem value="Corporate">Corporate Only</SelectItem>
            <SelectItem value="Agency">Agency Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-[#0f2942] text-white">
          <p className="text-xs text-blue-200 mb-1">Total Revenue</p>
          <p className="text-xl text-white">HKD {(totalRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-blue-300 mt-1">{filteredSummary.length} accounts</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1 mb-1"><BarChart2 className="w-4 h-4 text-blue-500" /><p className="text-xs text-gray-500">Sessions Used</p></div>
          <p className="text-2xl text-blue-600">{totalSessions}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1 mb-1"><TrendingUp className="w-4 h-4 text-green-500" /><p className="text-xs text-gray-500">Avg Utilisation</p></div>
          <p className="text-2xl text-green-600">{avgUtil}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1 mb-1"><Users className="w-4 h-4 text-purple-500" /><p className="text-xs text-gray-500">Top Account</p></div>
          <p className="text-sm text-purple-600 truncate">{topCompany?.company ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">{topCompany?.utilPct ?? 0}% utilised</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Monthly Sessions by Company */}
        <Card className="p-4 md:col-span-2">
          <p className="text-sm text-gray-700 mb-4">Monthly Sessions by Company</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={displayMontly} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="cathaySessions" name="Cathay Pacific" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="jardine"        name="Jardine"        fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="wings"          name="Wings Travel"  fill="#06b6d4" radius={[2, 2, 0, 0]} />
              <Bar dataKey="hsbc"           name="HSBC"           fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sessions by Account Type Pie */}
        <Card className="p-4">
          <p className="text-sm text-gray-700 mb-4">Sessions by Account Type</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={displayPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {displayPie.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {displayPie.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />{d.name}</div>
                <span className="text-gray-700">{d.value} sessions</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card className="p-4 mb-6">
        <p className="text-sm text-gray-700 mb-4">Revenue Trend — Corporate vs Agency (HKD)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={displayTrend} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => `HKD ${v.toLocaleString()}`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="corporate" name="Corporate"     stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="agency"    name="Agency" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Company Utilisation Table */}
      <Card>
        <div className="p-4 border-b">
          <p className="text-sm text-gray-700">Company Monthly Utilisation Summary</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sessions Used</TableHead>
                <TableHead>Utilisation</TableHead>
                <TableHead>Revenue (HKD)</TableHead>
                <TableHead>Last Booking</TableHead>
                <TableHead>BD Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSummary.map((c, i) => (
                <TableRow key={i} className="hover:bg-gray-50">
                  <TableCell className="text-sm text-gray-900">{c.company}</TableCell>
                  <TableCell>
                    {c.type === 'Corporate'
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700"><Building2 className="w-3 h-3" />Corporate</span>
                      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700"><Plane className="w-3 h-3" />Agency</span>}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{c.used}/{c.totalSessions}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${c.utilPct}%`, background: utilBarColor(c.utilPct) }} />
                      </div>
                      <span className="text-xs text-gray-700">{c.utilPct}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">{c.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-gray-600">{c.lastBooking}</TableCell>
                  <TableCell>
                    {c.utilPct === 0
                      ? <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">Re-engage</span>
                      : c.utilPct >= 80
                        ? <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">Upsell</span>
                        : c.utilPct < 40
                          ? <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Follow Up</span>
                          : <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">On Track</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}