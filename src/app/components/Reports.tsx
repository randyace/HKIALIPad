import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Download, FileText, Calendar, TrendingUp, Users, DollarSign,
  Clock, Target, AlertTriangle, Ticket, UserPlus, Heart,
  ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, ComposedChart,
} from 'recharts';

// ── Mock Data ────────────────────────────────────────────────────────────────

// Report 1 — Coupon to Conversion Analysis
const COUPON_MONTHLY = [
  { month: 'Nov', redeemed: 187, converted: 78 },
  { month: 'Dec', redeemed: 241, converted: 104 },
  { month: 'Jan', redeemed: 198, converted: 82 },
  { month: 'Feb', redeemed: 208, converted: 88 },
  { month: 'Mar', redeemed: 237, converted: 97 },
  { month: 'Apr', redeemed: 213, converted: 92 },
];

const TIME_TO_CONVERT = [
  { range: '1–15 days',  count: 97 },
  { range: '16–30 days', count: 184 },
  { range: '31–45 days', count: 152 },
  { range: '46–60 days', count: 65 },
  { range: '61–90 days', count: 43 },
];

const TTConvert_COLORS = ['#93c5fd', '#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa'];

// Report 2 — New Client Performance
const NEW_CLIENT_MONTHLY = [
  { month: 'Nov', clients: 82,  income: 234880 },
  { month: 'Dec', clients: 107, income: 307070 },
  { month: 'Jan', clients: 91,  income: 260910 },
  { month: 'Feb', clients: 98,  income: 281120 },
  { month: 'Mar', clients: 118, income: 338640 },
  { month: 'Apr', clients: 104, income: 298464 },
];

const SOURCE_ATTR = [
  { name: 'Free Trial Program', value: 42 },
  { name: 'Member Referral',    value: 23 },
  { name: 'Corporate Tie-up',   value: 18 },
  { name: 'Walk-in',            value: 11 },
  { name: 'Online Campaign',    value: 6  },
];
const SOURCE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

// Report 3 — Existing Customer Insights
const RETENTION_BY_TIER = [
  { tier: 'Sapphire', rate: 96, fill: '#0f2942' },
  { tier: 'Diamond',  rate: 91, fill: '#3b82f6' },
  { tier: 'Platinum', rate: 84, fill: '#8b5cf6' },
  { tier: 'Gold',     rate: 73, fill: '#f59e0b' },
];

const CLV_BY_TIER = [
  { tier: 'Gold',     clv: 28400,  fill: '#f59e0b' },
  { tier: 'Platinum', clv: 67800,  fill: '#8b5cf6' },
  { tier: 'Diamond',  clv: 124500, fill: '#3b82f6' },
  { tier: 'Sapphire', clv: 240000, fill: '#0f2942' },
];

const CHURN_TREND = [
  { month: 'Nov', churn: 12.1 },
  { month: 'Dec', churn: 11.8 },
  { month: 'Jan', churn: 13.4 },
  { month: 'Feb', churn: 14.8 },
  { month: 'Mar', churn: 15.2 },
  { month: 'Apr', churn: 14.2 },
];

// Report 3 — Existing Customer income data
const EXISTING_INCOME_MONTHLY = [
  { month: 'Nov', income: 612320 },
  { month: 'Dec', income: 817730 },
  { month: 'Jan', income: 671490 },
  { month: 'Feb', income: 697480 },
  { month: 'Mar', income: 748660 },
  { month: 'Apr', income: 755736 },
];

const EXISTING_INCOME_BY_TIER = [
  { month: 'Nov', Sapphire: 153080, Diamond: 183696, Platinum: 171450, Gold: 104094 },
  { month: 'Dec', Sapphire: 204433, Diamond: 245319, Platinum: 228964, Gold: 139014 },
  { month: 'Jan', Sapphire: 167873, Diamond: 201447, Platinum: 188017, Gold: 114153 },
  { month: 'Feb', Sapphire: 174370, Diamond: 209244, Platinum: 195294, Gold: 118572 },
  { month: 'Mar', Sapphire: 187165, Diamond: 224598, Platinum: 209625, Gold: 127272 },
  { month: 'Apr', Sapphire: 188934, Diamond: 226721, Platinum: 211606, Gold: 128475 },
];

const INCOME_BY_TIER_TOTAL = [
  { tier: 'Sapphire', income: 1075855, fill: '#0f2942' },
  { tier: 'Diamond',  income: 1291025, fill: '#3b82f6' },
  { tier: 'Platinum', income: 1204956, fill: '#8b5cf6' },
  { tier: 'Gold',     income:  731580, fill: '#f59e0b' },
];

// ── Shared sub-components ────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  blue:   'bg-blue-50 text-blue-600',
  green:  'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  amber:  'bg-amber-50 text-amber-600',
  red:    'bg-red-50 text-red-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  navy:   'bg-[#e8edf3] text-[#0f2942]',
};

function KpiCard({
  label, value, sub, icon: Icon, color = 'blue', up, trend,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color?: string;
  up?: boolean; trend?: string;
}) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 leading-tight">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${COLOR_MAP[color] ?? 'bg-gray-100 text-gray-600'} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
      {trend && (
        <div className={`text-xs font-medium flex items-center gap-1 ${up ? 'text-green-600' : 'text-red-600'}`}>
          {up
            ? <ArrowUpRight className="w-3 h-3" />
            : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </Card>
  );
}

function InsightBox({ color, icon: Icon, title, body }: { color: 'blue'|'green'|'amber'|'red'; icon: React.ElementType; title: string; body: string }) {
  const cls = {
    blue:  'bg-blue-50 border-blue-200 text-blue-600 text-blue-800 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-600 text-green-800 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-600 text-amber-800 text-amber-700',
    red:   'bg-red-50 border-red-200 text-red-600 text-red-800 text-red-700',
  }[color];
  const parts = cls.split(' ');
  return (
    <div className={`${parts[0]} border ${parts[1]} rounded-lg p-4 flex gap-3`}>
      <Icon className={`w-5 h-5 ${parts[2]} flex-shrink-0 mt-0.5`} />
      <div>
        <p className={`text-sm font-semibold ${parts[3]}`}>{title}</p>
        <p className={`text-sm ${parts[4]} mt-1`}>{body}</p>
      </div>
    </div>
  );
}

const chartTooltipStyle = { borderRadius: '8px', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' };

// ── Report 1: Coupon to Conversion Analysis ──────────────────────────────────
function CouponConversionReport() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Tracks the <strong>"Free to Paid"</strong> pipeline — helping management understand if coupons attract
          high-value returning customers or one-time opportunists. Report period: <strong>Nov 2025 – Apr 2026</strong>.
        </p>
      </div>

      {/* Visual Funnel */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Coupons Issued', value: '1,877', pct: '100%', bg: 'bg-blue-600' },
          { label: 'Coupons Redeemed', value: '1,284', pct: 'Redemption Rate: 68.4%', bg: 'bg-purple-600' },
          { label: 'Converted to Paid', value: '541', pct: 'Conversion Rate: 42.1%', bg: 'bg-emerald-600' },
        ].map((f) => (
          <div key={f.label} className={`${f.bg} text-white rounded-xl p-5 text-center`}>
            <p className="text-3xl font-bold">{f.value}</p>
            <p className="text-sm opacity-85 mt-1">{f.label}</p>
            <p className="text-xs opacity-65 mt-0.5">{f.pct}</p>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Redemption Rate" value="68.4%" sub="1,284 of 1,877 issued" icon={Ticket} color="blue" />
        <KpiCard label="Conversion Rate" value="42.1%" sub="541 of 1,284 redeemed" icon={Target} color="purple" />
        <KpiCard label="Avg Time-to-Convert" value="23.4 days" sub="First visit → Paid return" icon={Clock} color="indigo" />
        <KpiCard label="Acq. Cost (CAC)" value="HK$1,068" sub="Campaign cost ÷ converted" icon={DollarSign} color="amber" />
        <KpiCard label="Spending Uplift" value="+190%" sub="HK$3,480 paid vs HK$1,200 coupon" icon={ArrowUpRight} color="green" up trend="+190% uplift vs free cost" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Monthly Redemption vs. Conversion to Paid</h4>
          <p className="text-xs text-gray-500 mb-4">Tracking the free-to-paid pipeline each month (Nov 2025 – Apr 2026)</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={COUPON_MONTHLY} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="redeemed" name="Redeemed (Free)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="converted" name="Converted to Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Time-to-Conversion Distribution</h4>
          <p className="text-xs text-gray-500 mb-4">Days between first free visit and first paid return (n=541 converted clients)</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={TIME_TO_CONVERT} layout="vertical" barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v} clients`, 'Count']} />
              <Bar dataKey="count" name="Clients" radius={[0, 4, 4, 0]}>
                {TIME_TO_CONVERT.map((_, i) => <Cell key={i} fill={TTConvert_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <InsightBox
        color="green" icon={TrendingUp} title="Key Insight"
        body="The 16–30 day window captures 34% of all conversions — the most critical re-engagement period. A targeted follow-up campaign at the 2-week post-visit mark could push conversion rate above 50%. A 5% uplift translates to ~64 additional paying clients and ~HK$222K in additional first-visit income per 6-month cycle."
      />
    </div>
  );
}

// ── Report 2: New Client Performance ─────────────────────────────────────────
function NewClientReport() {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          Focuses on the <strong>"Inflow"</strong> of the business — tracking whether the new paying client base
          is growing, what they are worth, and where they come from. Period: <strong>Nov 2025 – Apr 2026</strong>.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="New Clients (Apr 2026)" value="104" sub="vs. 118 in Mar" icon={UserPlus} color="green" up={false} trend="-11.9% MoM" />
        <KpiCard label="Income from New Clients (Apr)" value="HK$298K" sub="of total lounge income" icon={DollarSign} color="blue" up={false} trend="-11.8% MoM" />
        <KpiCard label="Avg Transaction Value" value="HK$2,868" sub="per new client visit" icon={TrendingUp} color="purple" up trend="+2.1% vs Q4 2025" />
        <KpiCard label="New Client Penetration" value="28.3%" sub="of total Apr income" icon={Target} color="indigo" />
        <KpiCard label="6-Month New Clients" value="600" sub="Total across Nov–Apr" icon={Users} color="amber" up trend="+8.4% vs prior period" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Monthly New Client Count &amp; Income</h4>
          <p className="text-xs text-gray-500 mb-4">Bars = new client count (left axis) · Line = HK$ income from new clients (right axis)</p>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={NEW_CLIENT_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}K`}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v: number, name: string) =>
                  name === 'New Clients' ? [v, name] : [`HK$${Math.round(v / 1000)}K`, name]
                }
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="clients" name="New Clients" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="income" name="Income (HK$)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">New Client Source Attribution</h4>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={SOURCE_ATTR} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {SOURCE_ATTR.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {SOURCE_ATTR.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: SOURCE_COLORS[i] }} />
                  <span className="text-gray-600">{s.name}</span>
                </div>
                <span className="font-semibold text-gray-800">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <InsightBox
        color="blue" icon={UserPlus} title="Key Insight"
        body="The Free Trial Program is the single largest source of new paying clients at 42%, directly validating the coupon investment strategy. December 2025 saw the highest inflow (107 clients) driven by holiday corporate bookings — suggesting Q4 corporate event partnerships should be prioritised annually. ATV of HK$2,868 for new clients vs. an HK$1,200 free trial cost represents a 2.4× first-visit return on the acquisition spend."
      />
    </div>
  );
}

// ── Report 3: Existing Customer Insights ─────────────────────────────────────
function ExistingCustomerReport() {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          Measures the health and loyalty of the core <strong>"Bread and Butter"</strong> client base — tracking
          retention, visit frequency, lifetime value, and early churn signals. Period: <strong>Nov 2025 – Apr 2026</strong>.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Retention Rate (6-month)" value="72.8%" sub="Visited >1× in 6 months" icon={Heart} color="green" up trend="+1.4% vs prior period" />
        <KpiCard label="Avg Visit Frequency" value="1.8× / month" sub="Per existing customer" icon={RefreshCw} color="blue" up trend="+0.2× vs prior period" />
        <KpiCard label="Customer Lifetime Value" value="HK$48,400" sub="Avg across all active tiers" icon={DollarSign} color="purple" up trend="+6.2% YoY" />
        <KpiCard label="Churn Rate (Apr 2026)" value="14.2%" sub="No visit in 6+ months" icon={AlertTriangle} color="red" up trend="-1.0% vs Mar (improving)" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Retention Rate by Membership Tier</h4>
          <p className="text-xs text-gray-500 mb-4">% of tier members with ≥1 visit in past 6 months</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={RETENTION_BY_TIER} layout="vertical" barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="tier" type="category" tick={{ fontSize: 12 }} width={68} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v}%`, 'Retention Rate']} />
              <Bar dataKey="rate" name="Retention Rate" radius={[0, 5, 5, 0]}>
                {RETENTION_BY_TIER.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Monthly Churn Rate Trend</h4>
          <p className="text-xs text-gray-500 mb-4">% of previously active clients who lapsed (&gt;6 months without a visit)</p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={CHURN_TREND}>
              <defs>
                <linearGradient id="churnGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[9, 17]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, 'Churn Rate']} />
              <Area type="monotone" dataKey="churn" name="Churn Rate" stroke="#ef4444" strokeWidth={2.5} fill="url(#churnGradient)" dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Avg CLV by Membership Tier</h4>
          <p className="text-xs text-gray-500 mb-4">Total income generated per client since first visit (HK$)</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={CLV_BY_TIER} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="tier" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}K` : `${v}`} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`HK$${v.toLocaleString()}`, 'Avg CLV']} />
              <Bar dataKey="clv" name="Customer Lifetime Value" radius={[5, 5, 0, 0]}>
                {CLV_BY_TIER.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tier breakdown table */}
      <Card className="p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Membership Tier Health Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Tier', 'Active Members', 'Retention Rate', 'Avg Visits/Month', 'Avg CLV', 'Churn Risk'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { tier: 'Sapphire', color: 'bg-[#0f2942]', members: 127, retention: '96%', freq: '4.2×', clv: 'HK$240,000+', risk: 'Very Low', riskColor: 'bg-green-100 text-green-700' },
                { tier: 'Diamond',  color: 'bg-blue-600',  members: 384, retention: '91%', freq: '2.8×', clv: 'HK$124,500', risk: 'Low', riskColor: 'bg-green-100 text-green-700' },
                { tier: 'Platinum', color: 'bg-purple-600', members: 621, retention: '84%', freq: '2.1×', clv: 'HK$67,800', risk: 'Moderate', riskColor: 'bg-amber-100 text-amber-700' },
                { tier: 'Gold',     color: 'bg-amber-500', members: 1045, retention: '73%', freq: '1.4×', clv: 'HK$28,400', risk: 'High', riskColor: 'bg-red-100 text-red-700' },
              ].map(row => (
                <tr key={row.tier}>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                      <span className="font-medium text-gray-800">{row.tier}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600">{row.members.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-gray-800 font-medium">{row.retention}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{row.freq}</td>
                  <td className="py-2.5 pr-4 text-gray-800 font-medium">{row.clv}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.riskColor}`}>{row.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Income Performance Section ──────────────────────────────────── */}
      <div className="flex items-center gap-2 pt-2">
        <div className="flex-1 h-px bg-gray-200" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0f2942] rounded-full">
          <DollarSign className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-semibold text-white tracking-wide">INCOME PERFORMANCE</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Income KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Total Income (6-month)" value="HK$4.30M"
          sub="From existing clients, Nov–Apr"
          icon={DollarSign} color="navy"
          up trend="+12.4% vs prior 6-month period"
        />
        <KpiCard
          label="Apr 2026 Income" value="HK$755.7K"
          sub="From existing clients in Apr"
          icon={TrendingUp} color="green"
          up trend="+0.9% MoM vs Mar (HK$748.7K)"
        />
        <KpiCard
          label="Best Month" value="Dec 2025"
          sub="HK$817.7K — driven by holiday traffic"
          icon={ArrowUpRight} color="purple"
        />
        <KpiCard
          label="Existing Client Income Share" value="71.4%"
          sub="of total lounge income (Nov–Apr)"
          icon={Target} color="amber"
          up trend="+2.8% vs prior period"
        />
      </div>

      {/* Income Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly income trend — area */}
        <Card className="p-5 lg:col-span-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Monthly Income from Existing Customers</h4>
          <p className="text-xs text-gray-500 mb-4">Total HK$ income generated by returning clients each month (Nov 2025 – Apr 2026)</p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={EXISTING_INCOME_MONTHLY}>
              <defs>
                <linearGradient id="existingIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0f2942" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0f2942" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                domain={[500000, 900000]}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v: number) => [`HK$${(v / 1000).toFixed(1)}K`, 'Income']}
              />
              <Area
                type="monotone" dataKey="income" name="Income (HK$)"
                stroke="#0f2942" strokeWidth={2.5}
                fill="url(#existingIncomeGrad)"
                dot={{ r: 5, fill: '#0f2942', strokeWidth: 0 }}
                activeDot={{ r: 7, fill: '#3b82f6', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {/* MoM change row */}
          <div className="mt-3 grid grid-cols-6 gap-1">
            {EXISTING_INCOME_MONTHLY.map((d, i) => {
              const prev = EXISTING_INCOME_MONTHLY[i - 1];
              const change = prev ? ((d.income - prev.income) / prev.income * 100) : null;
              return (
                <div key={d.month} className="text-center">
                  <p className="text-xs text-gray-400">{d.month}</p>
                  <p className="text-xs font-semibold text-gray-800">{(d.income / 1000).toFixed(0)}K</p>
                  {change !== null && (
                    <p className={`text-[10px] font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Income by tier (6-month total) */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">6-Month Income by Tier</h4>
          <p className="text-xs text-gray-500 mb-4">Total income contribution per membership tier (Nov–Apr)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={INCOME_BY_TIER_TOTAL} layout="vertical" barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${Math.round(v / 1000)}K`}
              />
              <YAxis dataKey="tier" type="category" width={62} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`HK$${v.toLocaleString()}`, 'Income']} />
              <Bar dataKey="income" name="Income" radius={[0, 5, 5, 0]}>
                {INCOME_BY_TIER_TOTAL.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Tier income share */}
          <div className="mt-3 space-y-1.5">
            {INCOME_BY_TIER_TOTAL.slice().reverse().map((t) => {
              const total = INCOME_BY_TIER_TOTAL.reduce((s, x) => s + x.income, 0);
              const pct = (t.income / total * 100).toFixed(1);
              return (
                <div key={t.tier} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.fill }} />
                  <span className="text-gray-600 flex-1">{t.tier}</span>
                  <span className="text-gray-500">HK${(t.income / 1000).toFixed(0)}K</span>
                  <span className="font-semibold text-gray-800 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Monthly stacked bar by tier */}
      <Card className="p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Monthly Income Breakdown by Membership Tier</h4>
        <p className="text-xs text-gray-500 mb-4">Stacked monthly income (HK$) showing each tier's contribution — larger tiers grow in Dec, driven by year-end corporate visits</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={EXISTING_INCOME_BY_TIER} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(v: number, name: string) => [`HK$${v.toLocaleString()}`, name]}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Gold"     name="Gold"     stackId="a" fill="#f59e0b" />
            <Bar dataKey="Platinum" name="Platinum" stackId="a" fill="#8b5cf6" />
            <Bar dataKey="Diamond"  name="Diamond"  stackId="a" fill="#3b82f6" />
            <Bar dataKey="Sapphire" name="Sapphire" stackId="a" fill="#0f2942" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <InsightBox
        color="amber" icon={AlertTriangle} title="Key Insight"
        body="Churn peaked at 15.2% in March and is declining — a positive signal. Sapphire-tier clients show near-perfect retention (96%), confirming the unlimited-credit model drives deep loyalty. Gold-tier members (73% retention, highest churn risk) should be targeted with an upgrade incentive campaign to Platinum. Converting just 10% of at-risk Gold clients to Platinum would add ~HK$3.9M in cumulative CLV over their membership lifetime."
      />
    </div>
  );
}

// ── Operational report definitions ──────────────────────────────────────────

const OPERATIONAL_REPORTS = [
  { id: 'daily-bookings',  title: 'Daily Booking List',       description: 'List of all bookings for a specific date',             icon: Calendar,   color: 'text-blue-600 bg-blue-50',       fields: ['Booking No.', 'Guest Name', 'Suite', 'Time', 'Flight Info'] },
  { id: 'departure-list',  title: 'Departure List',           description: 'Departure information for retail team coordination',    icon: TrendingUp, color: 'text-green-600 bg-green-50',     fields: ['Booking No.', 'Passenger Names', 'Flight No.', 'Departure Time', 'Suite'] },
  { id: '48hr-bookings',   title: '48-Hour Booking Report',   description: 'Bookings scheduled within next 48 hours',              icon: Calendar,   color: 'text-orange-600 bg-orange-50',   fields: ['Booking No.', 'Guest Name', 'Time', 'Add-on Services', 'Special Requests'] },
  { id: 'movement-list',   title: 'Movement List',            description: 'Guest arrival and departure tracking',                 icon: Users,      color: 'text-purple-600 bg-purple-50',   fields: ['Guest Name', 'Arrival Time', 'Departure Time', 'Baggage Info', 'Staff Name'] },
  { id: 'room-allocation', title: 'Room Allocation Table',    description: 'Current suite allocation and availability',            icon: FileText,   color: 'text-indigo-600 bg-indigo-50',   fields: ['Suite Name', 'Guest Name', 'Check-in Time', 'Expected Departure', 'Status'] },
  { id: 'income-report',   title: 'Income Report',            description: 'Financial summary and income breakdown',               icon: DollarSign, color: 'text-emerald-600 bg-emerald-50', fields: ['Date', 'Total Bookings', 'Income', 'Payment Method', 'Discounts Applied'] },
  { id: 'member-report',   title: 'Member Activity Report',   description: 'Member usage statistics and patterns',                 icon: Users,      color: 'text-pink-600 bg-pink-50',       fields: ['Member Name', 'Account No.', 'Total Bookings', 'Last Visit', 'Membership Status'] },
  { id: 'sales-report',    title: 'Add-on Services Sales',    description: 'Sales breakdown for additional services',              icon: DollarSign, color: 'text-teal-600 bg-teal-50',       fields: ['Service Name', 'Quantity', 'Income', 'Discount Applied', 'Popular Times'] },
];

// ── Operational Reports ──────────────────────────────────────────────────────
function OperationalReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings',  value: '284',    icon: Calendar,   color: 'text-blue-600' },
          { label: 'Total Income',    value: 'HK$892K',icon: DollarSign, color: 'text-green-600' },
          { label: 'Active Members',  value: '2,177',  icon: Users,      color: 'text-purple-600' },
          { label: 'Avg. Occupancy',  value: '78%',    icon: TrendingUp, color: 'text-orange-600' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{s.label}</p>
                <h2 className="mt-1">{s.value}</h2>
              </div>
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Date Range */}
      <Card className="p-5">
        <h3 className="mb-4 text-gray-800">Report Period</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="mb-[10px] block text-sm text-gray-600">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="mb-[10px] block text-sm text-gray-600">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline">Apply Filter</Button>
        </div>
      </Card>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {OPERATIONAL_REPORTS.map((report) => (
          <Card key={report.id} className="p-5 flex flex-col">
            <div className={`w-11 h-11 rounded-lg ${report.color} flex items-center justify-center mb-4`}>
              <report.icon className="w-5 h-5" />
            </div>
            <h3 className="mb-1.5 text-gray-900 text-sm font-semibold">{report.title}</h3>
            <p className="text-xs text-gray-500 mb-4 flex-1">{report.description}</p>
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Included fields:</p>
              <div className="flex flex-wrap gap-1">
                {report.fields.slice(0, 3).map((f, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{f}</span>
                ))}
                {report.fields.length > 3 && (
                  <span className="text-xs text-gray-400 px-1.5 py-0.5">+{report.fields.length - 3} more</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
              <Button variant="outline" size="sm" className="flex-1">
                <FileText className="w-3.5 h-3.5 mr-1.5" />Preview
              </Button>
              <Button size="sm" className="flex-1 bg-[#0f2942] hover:bg-[#1a3a5c] text-white">
                <Download className="w-3.5 h-3.5 mr-1.5" />Export
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Export Options */}
      <Card className="p-5">
        <h3 className="mb-4 text-gray-800">Export Format Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { fmt: 'CSV Format',   desc: 'Spreadsheet-compatible format for data analysis in Excel / Google Sheets' },
            { fmt: 'PDF Format',   desc: 'Formatted document ready for printing and email distribution' },
            { fmt: 'Excel Format', desc: 'Advanced spreadsheet with calculated columns and pivot-ready layout' },
          ].map(o => (
            <div key={o.fmt} className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-semibold text-gray-800 mb-1">{o.fmt}</p>
              <p className="text-xs text-gray-500 mb-3">{o.desc}</p>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />Export as {o.fmt.split(' ')[0]}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Scheduled Reports */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800">Scheduled Reports</h3>
          <Button variant="outline" size="sm">Configure Schedule</Button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Daily Booking Summary',   cron: 'Sent every day at 8:00 AM' },
            { name: 'Weekly Income Report',    cron: 'Sent every Monday at 9:00 AM' },
            { name: 'Monthly Member Activity', cron: 'Sent on 1st of each month' },
          ].map(s => (
            <div key={s.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-500">{s.cron}</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Analytics report tab definitions ────────────────────────────────────────

const ANALYTICS_TABS = [
  {
    id: 'operational',
    label: 'Operational Reports',
    icon: FileText,
    accent: 'border-slate-500',
    badge: 'bg-slate-100 text-slate-700',
    Component: OperationalReports,
  },
  {
    id: 'coupon',
    label: 'Coupon to Conversion Analysis',
    icon: Ticket,
    accent: 'border-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    Component: CouponConversionReport,
  },
  {
    id: 'new-client',
    label: 'New Client Performance',
    icon: UserPlus,
    accent: 'border-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    Component: NewClientReport,
  },
  {
    id: 'existing',
    label: 'Existing Customer Insights',
    icon: Heart,
    accent: 'border-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    Component: ExistingCustomerReport,
  },
];

// ── Main Reports Component ───────────────────────────────────────────────────

export interface ReportsProps {
  isLoading?: boolean;
  onExport?: (reportType: string) => void;
}

export function Reports({}: ReportsProps = {}) {
  const [activeTab, setActiveTab] = useState<string>('operational');

  const activeReport = ANALYTICS_TABS.find(t => t.id === activeTab)!;
  const isAnalytics = activeTab !== 'operational';

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div>
        <h1>Reports &amp; Analytics</h1>
        <p className="text-gray-600">Operational report generation and strategic management analytics</p>
      </div>

      {/* ── Unified Tab Section ───────────────────────────────────────────── */}
      <section className="space-y-4">
        {/* Tab selector */}
        <div className="flex flex-col sm:flex-row gap-2 bg-gray-100 p-1.5 rounded-xl">
          {ANALYTICS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-gray-900 border-b-2 ' + tab.accent
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
              }`}
            >
              <tab.icon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? 'text-gray-700' : 'text-gray-400'}`} />
              <span className="text-left leading-tight">{tab.label}</span>
              {activeTab === tab.id && (
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${tab.badge}`}>Active</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content card */}
        <Card className="p-6">
          {/* Report header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${activeReport.badge} flex items-center justify-center flex-shrink-0`}>
                <activeReport.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-gray-900">{activeReport.label}</h3>
                <p className="text-xs text-gray-500">
                  {isAnalytics
                    ? 'Data period: Nov 2025 – Apr 2026 · Updated daily'
                    : 'Generate, preview and export operational data for daily team use'}
                </p>
              </div>
            </div>
            {isAnalytics && (
              <Button size="sm" className="bg-[#0f2942] hover:bg-[#1a3a5c] text-white gap-2 flex-shrink-0">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            )}
          </div>

          {/* Dynamic content */}
          <activeReport.Component />
        </Card>
      </section>
    </div>
  );
}