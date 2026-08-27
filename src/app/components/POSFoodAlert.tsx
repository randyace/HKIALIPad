import { useState } from 'react';
import { ChevronDown, ChevronUp, UtensilsCrossed, Clock, CheckCheck, X, AlertTriangle } from 'lucide-react';

interface PendingItem {
  name: string;
  qty: number;
  status: 'pending' | 'preparing';
  waitMinutes: number;
}

export interface FoodAlert {
  suiteId: string;
  suiteName: string;
  bookingNo: string;
  guestName: string;
  items: PendingItem[];
}

export interface POSFoodAlertProps {
  alerts?: FoodAlert[];
  isLoading?: boolean;
  onDismiss?: (id: string) => void;
  onRefresh?: () => void;
  /** Called when the user clicks the booking number — navigate to that booking */
  onViewBooking?: (bookingNo: string) => void;
}

// ── Mock live pending-food data ────────────────────────────────────────────
const MOCK_ALERTS: FoodAlert[] = [
  {
    suiteId: 'exec-1',
    suiteName: 'Executive Suite 1',
    bookingNo: 'A-202602-000002',
    guestName: 'Mary Johnson',
    items: [
      { name: 'Premium Breakfast Set', qty: 2, status: 'preparing', waitMinutes: 35 },
    ],
  },
  {
    suiteId: 'vip-a1',
    suiteName: 'VIP Suite A1',
    bookingNo: 'A-202602-000001',
    guestName: 'John Smith',
    items: [
      { name: 'Wagyu Beef Burger',  qty: 1, status: 'preparing', waitMinutes: 28 },
      { name: 'Dim Sum Platter',    qty: 1, status: 'pending',   waitMinutes: 12 },
    ],
  },
  {
    suiteId: 'business-4',
    suiteName: 'Business Suite 4',
    bookingNo: 'A-202602-000009',
    guestName: 'Sarah Chen',
    items: [
      { name: 'Lobster Salad',               qty: 1, status: 'pending', waitMinutes: 8 },
      { name: 'Champagne (Dom Pérignon)',     qty: 1, status: 'pending', waitMinutes: 8 },
    ],
  },
];

const OVERDUE_THRESHOLD = 20; // minutes

/** Number of pending orders that have at least one overdue item — used by Sidebar badge */
export const INITIAL_OVERDUE_COUNT = MOCK_ALERTS.filter(o =>
  o.items.some(i => i.waitMinutes >= OVERDUE_THRESHOLD)
).length;

export function POSFoodAlert({ alerts: alertsProp = [], isLoading, onDismiss, onRefresh, onViewBooking }: POSFoodAlertProps = {}) {
  const baseAlerts = alertsProp.length > 0 ? alertsProp : MOCK_ALERTS;
  const [orders, setOrders] = useState<FoodAlert[]>(baseAlerts);
  const [isExpanded, setIsExpanded]       = useState(true);
  const [dismissed, setDismissed]         = useState(false);

  if (dismissed || orders.length === 0) return null;

  const totalItems  = orders.reduce((s, o) => s + o.items.length, 0);
  const hasOverdue  = orders.some(o => o.items.some(i => i.waitMinutes >= OVERDUE_THRESHOLD));

  const markServed = (suiteId: string) => {
    setOrders(prev => prev.filter(o => o.suiteId !== suiteId));
    onDismiss?.(suiteId);
  };

  const statusLabel = (item: PendingItem) =>
    item.status === 'preparing' ? 'Preparing' : 'Pending';

  const statusCls = (item: PendingItem) =>
    item.status === 'preparing'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-yellow-100 text-yellow-700';

  const waitCls = (mins: number) =>
    mins >= OVERDUE_THRESHOLD ? 'text-red-600 font-semibold' : 'text-gray-500';

  return (
    <div className={`border-b transition-colors ${hasOverdue ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      {/* ── Collapsed / Header strip ─────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-2.5">
        {/* Icon */}
        <div className={`shrink-0 ${hasOverdue ? 'text-red-500' : 'text-amber-500'}`}>
          {hasOverdue
            ? <AlertTriangle className="w-4 h-4" />
            : <UtensilsCrossed className="w-4 h-4" />}
        </div>

        {/* Label + count */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`text-sm font-semibold ${hasOverdue ? 'text-red-700' : 'text-amber-700'}`}>
            {hasOverdue ? 'Overdue Food Orders' : 'Pending Food Orders'}
          </span>
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white font-bold ${
            hasOverdue ? 'bg-red-500' : 'bg-amber-500'
          } ${hasOverdue ? 'animate-pulse' : ''}`}>
            {orders.length}
          </span>
          <span className="text-xs text-gray-500 hidden sm:block">
            {orders.length} table{orders.length !== 1 ? 's' : ''} · {totalItems} item{totalItems !== 1 ? 's' : ''} waiting
          </span>
        </div>

        {/* Expand / Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsExpanded(v => !v)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              hasOverdue
                ? 'text-red-600 hover:bg-red-100'
                : 'text-amber-700 hover:bg-amber-100'
            }`}
          >
            {isExpanded ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Collapse</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> Expand</>
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            title="Dismiss alert"
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Expanded order rows ──────────────────────────────────────── */}
      {isExpanded && (
        <div className="px-5 pb-3 space-y-2">
          {/* Sort: longest wait first */}
          {[...orders]
            .sort((a, b) =>
              Math.max(...b.items.map(i => i.waitMinutes)) -
              Math.max(...a.items.map(i => i.waitMinutes))
            )
            .map(order => {
              const maxWait    = Math.max(...order.items.map(i => i.waitMinutes));
              const isOverdue  = maxWait >= OVERDUE_THRESHOLD;

              return (
                <div
                  key={order.suiteId}
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${
                    isOverdue
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-amber-200'
                  }`}
                >
                  {/* Suite + booking info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${isOverdue ? 'text-red-800' : 'text-gray-900'}`}>
                        {order.suiteName}
                      </span>
                      <span className="text-xs text-gray-400">{order.guestName}</span>
                      <button
                        onClick={() => onViewBooking?.(order.bookingNo)}
                        className="font-mono text-xs text-blue-600 hover:underline"
                      >
                        {order.bookingNo}
                      </button>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded text-xs">
                          <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                        </span>
                      )}
                    </div>

                    {/* Items list */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${
                            item.waitMinutes >= OVERDUE_THRESHOLD
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          {/* Status dot */}
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${statusCls(item)}`}>
                            {statusLabel(item)}
                          </span>
                          <span>{item.qty > 1 ? `${item.qty}× ` : ''}{item.name}</span>
                          <span className={`flex items-center gap-0.5 ${waitCls(item.waitMinutes)}`}>
                            <Clock className="w-3 h-3" />
                            {item.waitMinutes} min
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mark as Served */}
                  <button
                    onClick={() => markServed(order.suiteId)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark Served
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}