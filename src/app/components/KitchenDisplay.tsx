/**
 * KitchenDisplay.tsx — Integration-Ready Dumb UI Component
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  ZERO hardcoded seed orders live in this file.                          │
 * │  All order data comes through KitchenDisplayProps.                      │
 * │  For dev/design preview, initialOrders defaults from:                  │
 * │    __fixtures__/KitchenDisplay.mocks.ts → mockKDSOrders                 │
 * │                                                                         │
 * │  ❌ REMOVED: useEffect order simulation (was business/demo logic)       │
 * │  ✅ RETAINED: ElapsedBadge useEffect (pure UI — computes display text)  │
 * │                                                                         │
 * │  CI4 Smart Container wires:                                             │
 * │    initialOrders       → GET /api/kds/orders                            │
 * │    onItemToggled       → PATCH /api/kds/orders/{id}/items/{itemId}      │
 * │    onOrderStatusChanged→ PATCH /api/kds/orders/{id}/status              │
 * │    onRefresh           → re-call GET /api/kds/orders                    │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChefHat, Clock, CheckCircle2, Utensils, Bell, BellOff,
  RefreshCw, AlertCircle, Users, MapPin, CheckCheck, Eye,
  LayoutGrid, Languages,
} from 'lucide-react';
import { toast } from 'sonner';
import { mockKitchenDisplayData } from './__fixtures__/KitchenDisplay.mocks';

// ─── Language strings (pure UI — not data, not from backend) ─────────────────

type Lang = 'en' | 'zh';

const T = {
  en: {
    systemTitle:        'Kitchen Display System',
    systemSubtitle:     'HKIA VIP Lounge · Live Order Board',
    refreshedAt:        'Refreshed',
    refreshTitle:       'Refresh',
    muteNotif:          'Mute notifications',
    enableNotif:        'Enable notifications',
    newOrderBanner:     '🔔 New Order Incoming — Please Acknowledge!',
    tabAll:             'All Orders',
    tabNew:             'New Orders',
    tabReceived:        'Order Received',
    tabServed:          'Served',
    emptyAll:           'No orders yet',
    emptyNew:           'No new orders',
    emptyReceived:      'No orders in progress',
    emptyServed:        'No served orders yet',
    rush:               'RUSH',
    allergyBadge:       '⚠ Allergy',
    guests:             (n: number) => `${n} guest${n !== 1 ? 's' : ''}`,
    receivedAgo:        'rcvd',
    itemsAcknowledged:  'Items acknowledged',
    itemsReady:         'Items ready',
    allergyAlertTitle:  'Food Allergy Alert',
    checkAllergy:       '⚠ check allergy',
    btnReceived:        'Received',
    btnReady:           'Ready',
    btnUndo:            'Undo',
    markAllReceived:    'Mark All as Received',
    markAllReady:       'Mark All as Ready',
    allAcknowledgedHint:'All items acknowledged — order moved to In Progress',
    allReadyHint:       'All items ready — order marked as Served',
    servedStamp:        'Served',
    toastOrderReceived: 'Order Received!',
    toastFoodServed:    '🍽 Food Served!',
    toastNewOrder:      '🔔 New Order Received!',
    toastRefreshed:     'Display refreshed',
    legendNew:          'New — tap Received per item to acknowledge',
    legendReceived:     'In Progress — tap Ready per item once prepared',
    legendServed:       'Served — order complete',
    legendAllergy:      'Orange highlight = allergy / special note',
    switchLang:         '中文',
  },
  zh: {
    systemTitle:        '廚房顯示系統',
    systemSubtitle:     '香港國際機場貴賓室 · 實時訂單看板',
    refreshedAt:        '更新於',
    refreshTitle:       '重新整理',
    muteNotif:          '關閉提示音',
    enableNotif:        '開啟提示音',
    newOrderBanner:     '🔔 新訂單到達 — 請立即確認！',
    tabAll:             '全部訂單',
    tabNew:             '新訂單',
    tabReceived:        '備餐中',
    tabServed:          '已上菜',
    emptyAll:           '暫無訂單',
    emptyNew:           '暫無新訂單',
    emptyReceived:      '暫無備餐中訂單',
    emptyServed:        '暫無已上菜記錄',
    rush:               '加急',
    allergyBadge:       '⚠ 過敏',
    guests:             (n: number) => `${n} 位客人`,
    receivedAgo:        '已接',
    itemsAcknowledged:  '已確認項目',
    itemsReady:         '已備妥項目',
    allergyAlertTitle:  '食物過敏警示',
    checkAllergy:       '⚠ 請查過敏',
    btnReceived:        '已接單',
    btnReady:           '已備妥',
    btnUndo:            '撤回',
    markAllReceived:    '全部標為已接單',
    markAllReady:       '全部標為已備妥',
    allAcknowledgedHint:'所有項目已確認 — 訂單移至備餐中',
    allReadyHint:       '所有項目已備妥 — 訂單標記為已上菜',
    servedStamp:        '已上菜',
    toastOrderReceived: '訂單已接單！',
    toastFoodServed:    '🍽 食物已上菜！',
    toastNewOrder:      '🔔 新訂單到達！',
    toastRefreshed:     '已重新整理',
    legendNew:          '新訂單 — 點選「已接單」確認各項目',
    legendReceived:     '備餐中 — 完成後點選「已備妥」',
    legendServed:       '已上菜 — 訂單完成',
    legendAllergy:      '橙色標示 = 過敏 / 特別備註',
    switchLang:         'English',
  },
} as const;

// ─── Exported Data Types (CI4 Smart Container must map to these shapes) ───────

export type OrderStatus = 'new' | 'received' | 'served';
export type ItemCategory = 'Food' | 'Beverage' | 'Dessert' | 'Snack';

export interface KDSOrderItem {
  id: number;
  /** English name */
  name: string;
  /** Traditional Chinese name */
  nameZh: string;
  category: ItemCategory;
  quantity: number;
  /** English preparation notes */
  notes?: string;
  /** Chinese preparation notes */
  notesZh?: string;
  /** True when this specific item has an allergy concern */
  allergyFlag?: boolean;
  /** True when kitchen staff have acknowledged / prepared this item */
  done: boolean;
}

export interface KDSOrder {
  /** Internal KDS identifier, e.g. "KDS-001" */
  id: string;
  /** Linked POS order reference, e.g. "POS-20260316-000012" */
  posOrderNo: string;
  /** English suite / room name */
  suiteName: string;
  /** Chinese suite / room name */
  suiteNameZh: string;
  guestName: string;
  guestCount: number;
  /** ISO 8601 datetime or JS Date — when the order was placed in POS */
  placedAt: Date;
  status: OrderStatus;
  /** Set when status transitions new → received */
  receivedAt?: Date;
  /** Set when status transitions received → served */
  servedAt?: Date;
  items: KDSOrderItem[];
  priority: 'normal' | 'rush';
  /** English allergy / dietary alert text */
  allergyAlert?: string;
  /** Chinese allergy / dietary alert text */
  allergyAlertZh?: string;
}

// ─── Callback Interfaces ──────────────────────────────────────────────────────

export interface KitchenDisplayCallbacks {
  /**
   * Fired after a kitchen staff member toggles one item's done state.
   * CI4: PATCH /api/kds/orders/{orderId}/items/{itemId}  { done: newDoneState }
   */
  onItemToggled?: (
    orderId: string,
    itemId: number,
    newDoneState: boolean,
    updatedOrder: KDSOrder,
  ) => void;

  /**
   * Fired when an order's status advances (new→received or received→served),
   * whether triggered by toggling the last item or by "Mark All".
   * CI4: PATCH /api/kds/orders/{orderId}/status  { status: newStatus }
   */
  onOrderStatusChanged?: (
    orderId: string,
    newStatus: OrderStatus,
    updatedOrder: KDSOrder,
  ) => void;

  /**
   * Fired when the staff presses the manual Refresh button.
   * CI4: re-fetch GET /api/kds/orders and call setOrders / re-mount with key.
   */
  onRefresh?: () => void;
}

// ─── Composed Props Interface ─────────────────────────────────────────────────

export interface KitchenDisplayProps extends KitchenDisplayCallbacks {
  /**
   * Seed orders for the display.
   * In production the Smart Container fetches these from CI4 and passes them.
   * Defaults to fixture data so the component renders standalone.
   *
   * To re-sync after a server poll, change the `key` prop on this component
   * so React remounts it with the fresh initialOrders.
   */
  initialOrders?: KDSOrder[];

  /**
   * Server-supplied "last refreshed" timestamp.
   * When absent the component uses the mount time.
   */
  lastRefreshedAt?: Date;
}

// ─── Static UI Config (never from backend) ────────────────────────────────────

const CATEGORY_LABEL: Record<ItemCategory, { en: string; zh: string }> = {
  Food:     { en: 'Food',     zh: '食物' },
  Beverage: { en: 'Beverage', zh: '飲品' },
  Dessert:  { en: 'Dessert',  zh: '甜品' },
  Snack:    { en: 'Snack',    zh: '小食' },
};

const CATEGORY_COLOR: Record<ItemCategory, string> = {
  Food:     'bg-orange-100 text-orange-700 border border-orange-200',
  Beverage: 'bg-blue-100   text-blue-700   border border-blue-200',
  Dessert:  'bg-pink-100   text-pink-700   border border-pink-200',
  Snack:    'bg-yellow-100 text-yellow-700 border border-yellow-200',
};

// ─── Pure-UI helper hook (elapsed display string — not business logic) ────────

function useElapsedTime(date: Date, lang: Lang): string {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((Date.now() - date.getTime()) / 1000);
      if (lang === 'zh') {
        return diff < 60 ? `${diff}秒` : `${Math.floor(diff / 60)}分 ${diff % 60}秒`;
      }
      return diff < 60 ? `${diff}s` : `${Math.floor(diff / 60)}m ${diff % 60}s`;
    };
    setElapsed(calc());
    const id = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(id);
  }, [date, lang]);
  return elapsed;
}

function elapsedMinutes(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 60_000);
}

// ─── ElapsedBadge — pure display component ────────────────────────────────────

function ElapsedBadge({ since, warn, lang }: { since: Date; warn: number; lang: Lang }) {
  const elapsed = useElapsedTime(since, lang);
  const isWarn  = elapsedMinutes(since) >= warn;
  return (
    <span
      style={{ fontSize: '0.8em' }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono ${
        isWarn ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-600'
      }`}
    >
      <Clock className="w-3 h-3" />
      {elapsed}
    </span>
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: KDSOrder;
  lang: Lang;
  onToggleItem: (orderId: string, itemId: number) => void;
  onMarkAll:    (orderId: string) => void;
}

function OrderCard({ order, lang, onToggleItem, onMarkAll }: OrderCardProps) {
  const t          = T[lang];
  const isNew      = order.status === 'new';
  const isReceived = order.status === 'received';
  const isServed   = order.status === 'served';

  const doneCount  = order.items.filter(i => i.done).length;
  const totalCount = order.items.length;
  const allDone    = doneCount === totalCount;
  const progress   = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const borderClass = isNew
    ? 'border-red-400 shadow-red-200'
    : isReceived
    ? 'border-amber-400 shadow-amber-100'
    : 'border-green-400 shadow-green-100';

  const itemActionLabel = isNew ? t.btnReceived : isReceived ? t.btnReady : null;

  return (
    <div className={`bg-white rounded-xl border-2 ${borderClass} shadow-md overflow-hidden flex flex-col`}>

      {/* ── Header ── */}
      <div className={`px-4 py-3 flex items-start justify-between gap-2 ${
        isNew ? 'bg-red-50' : isReceived ? 'bg-amber-50' : 'bg-green-50'
      }`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: '0.8em' }} className="font-mono text-gray-500">{order.id}</span>
            {order.priority === 'rush' && (
              <span style={{ fontSize: '0.85em' }} className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                <AlertCircle className="w-3 h-3" /> {t.rush}
              </span>
            )}
            {order.allergyAlert && (
              <span style={{ fontSize: '0.85em' }} className="inline-flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded-full">
                {t.allergyBadge}
              </span>
            )}
          </div>
          <p style={{ fontSize: '1.15em' }} className="font-semibold text-gray-900 mt-0.5 truncate">
            {order.guestName}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span style={{ fontSize: '0.85em' }} className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              {lang === 'zh' ? order.suiteNameZh : order.suiteName}
            </span>
            <span style={{ fontSize: '0.85em' }} className="flex items-center gap-1 text-gray-500">
              <Users className="w-3.5 h-3.5" /> {t.guests(order.guestCount)}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1">
          <ElapsedBadge since={order.placedAt} warn={isNew ? 5 : isReceived ? 15 : 999} lang={lang} />
          {isReceived && order.receivedAt && (
            <span style={{ fontSize: '0.78em' }} className="text-gray-400">
              {t.receivedAgo} <ElapsedBadge since={order.receivedAt} warn={999} lang={lang} />
            </span>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      {!isServed && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: '0.85em' }} className="text-gray-500">
              {isNew ? t.itemsAcknowledged : t.itemsReady}
            </span>
            <span style={{ fontSize: '0.85em' }} className="font-semibold text-gray-700">
              {doneCount}/{totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                allDone
                  ? isNew ? 'bg-blue-500' : 'bg-green-500'
                  : isNew ? 'bg-[#0f2942]' : 'bg-amber-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Allergy Alert ── */}
      {order.allergyAlert && (
        <div className="mx-4 mt-3 px-3 py-2 bg-orange-50 border border-orange-300 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <p style={{ fontSize: '0.9em' }} className="font-semibold text-orange-800">
              {t.allergyAlertTitle}
            </p>
            <p style={{ fontSize: '0.85em' }} className="text-orange-700">
              {lang === 'zh' ? (order.allergyAlertZh ?? order.allergyAlert) : order.allergyAlert}
            </p>
          </div>
        </div>
      )}

      {/* ── Items List ── */}
      <div className="px-4 py-3 flex-1 space-y-2">
        {order.items.map(item => (
          <div
            key={item.id}
            className={`flex items-stretch rounded-lg overflow-hidden transition-colors border ${
              item.done
                ? isServed
                  ? 'bg-green-50 border-green-200'
                  : isNew
                  ? 'bg-blue-50 border-blue-200 opacity-70'
                  : 'bg-green-50 border-green-200 opacity-70'
                : item.allergyFlag
                ? 'bg-orange-50 border-orange-200'
                : 'bg-gray-50 border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 p-2 flex-1 min-w-0">
              {/* Quantity bubble */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 font-bold transition-colors ${
                  item.done ? 'bg-gray-300 text-gray-500' : 'bg-[#05C9CC] text-white'
                }`}
                style={{ fontSize: '1.15em' }}
              >
                {item.quantity}×
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    style={{ fontSize: '1.05em' }}
                    className={`font-medium transition-colors ${
                      item.done ? 'line-through text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {lang === 'zh' ? item.nameZh : item.name}
                  </span>
                  {item.allergyFlag && !item.done && (
                    <span style={{ fontSize: '0.85em' }} className="text-orange-600">
                      {t.checkAllergy}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.82em' }} className="text-gray-400">
                  {lang === 'zh' ? item.name : item.nameZh}
                </p>
                {item.notes && (
                  <p style={{ fontSize: '0.85em' }} className="text-gray-500 mt-0.5 italic">
                    {lang === 'zh'
                      ? `「${item.notesZh ?? item.notes}」`
                      : `"${item.notes}"`}
                  </p>
                )}
                <span
                  style={{ fontSize: '0.8em' }}
                  className={`inline-block mt-1 px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLOR[item.category]}`}
                >
                  {lang === 'zh'
                    ? CATEGORY_LABEL[item.category].zh
                    : CATEGORY_LABEL[item.category].en}
                </span>
              </div>
            </div>

            {/* Item action button */}
            {!isServed && (
              <button
                onClick={() => onToggleItem(order.id, item.id)}
                style={{ fontSize: '0.9em' }}
                className={`shrink-0 flex flex-col items-center justify-center gap-1 px-5 font-semibold transition-all active:scale-95 border-l ${
                  item.done
                    ? 'bg-gray-400 border-gray-400 text-white hover:bg-gray-500'
                    : isNew
                    ? 'bg-[#05C9CC] border-[#05C9CC] text-white hover:bg-[#04b3b6]'
                    : 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                }`}
                title={item.done ? t.btnUndo : itemActionLabel ?? ''}
              >
                {item.done ? (
                  <>
                    <CheckCheck className="w-5 h-5" />
                    <span>{t.btnUndo}</span>
                  </>
                ) : (
                  <>
                    {isNew ? <Eye className="w-5 h-5" /> : <CheckCheck className="w-5 h-5" />}
                    <span>{itemActionLabel}</span>
                  </>
                )}
              </button>
            )}

            {isServed && (
              <div className="flex items-center justify-center px-4 border-l border-green-200">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Mark All button ── */}
      {!isServed && (
        <div className="px-4 pb-3">
          <button
            onClick={() => onMarkAll(order.id)}
            disabled={allDone}
            style={{ fontSize: '1em' }}
            className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all active:scale-95 ${
              allDone
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isNew
                ? 'bg-[#05C9CC] hover:bg-[#04b3b6] text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <CheckCheck className="w-5 h-5" />
            {isNew ? t.markAllReceived : t.markAllReady}
          </button>
        </div>
      )}

      {/* ── Auto-advance hint ── */}
      {!isServed && allDone && (
        <div
          className={`mx-4 mb-4 px-3 py-2.5 rounded-lg flex items-center gap-2 font-semibold ${
            isNew
              ? 'bg-blue-100 border border-blue-300 text-blue-800'
              : 'bg-green-100 border border-green-300 text-green-800'
          }`}
          style={{ fontSize: '0.9em' }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {isNew ? t.allAcknowledgedHint : t.allReadyHint}
        </div>
      )}

      {/* ── POS ref ── */}
      <div className="px-4 pb-3">
        <p style={{ fontSize: '0.78em' }} className="text-gray-400 font-mono">
          {order.posOrderNo}
        </p>
      </div>

      {/* ── Served stamp ── */}
      {isServed && (
        <div className="px-4 pb-4">
          <div
            style={{ fontSize: '0.95em' }}
            className="w-full py-2.5 rounded-lg bg-green-100 border border-green-300 flex items-center justify-center gap-2 text-green-700"
          >
            <CheckCircle2 className="w-5 h-5" />
            {t.servedStamp}
            {order.servedAt && (
              <span style={{ fontSize: '0.85em' }} className="text-green-600 ml-1">
                · {order.servedAt.toLocaleTimeString('en-HK', {
                  hour: '2-digit', minute: '2-digit', hour12: false,
                })}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ActiveTab = 'all' | 'new' | 'received' | 'served';

export function KitchenDisplay({
  initialOrders   = mockKitchenDisplayData.initialOrders as KDSOrder[],
  lastRefreshedAt,
  onItemToggled,
  onOrderStatusChanged,
  onRefresh,
}: KitchenDisplayProps = {}) {

  // ── Pure UI state ──────────────────────────────────────────────────────────
  const [orders,        setOrders]        = useState<KDSOrder[]>(initialOrders);
  const [soundOn,       setSoundOn]       = useState(true);
  const [flashNew,      setFlashNew]      = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(lastRefreshedAt ?? new Date());
  const [activeTab,     setActiveTab]     = useState<ActiveTab>('all');
  const [lang,          setLang]          = useState<Lang>('en');

  const prevOrderCountRef = useRef(initialOrders.length);

  /**
   * UI-only effect: detect when the Smart Container re-feeds new orders
   * (e.g. after a server poll), sync local state, and flash the banner.
   * This is DISPLAY logic — not a data-fetch.
   */
  useEffect(() => {
    const incoming = initialOrders.length;
    if (incoming > prevOrderCountRef.current && soundOn) {
      setFlashNew(true);
      const id = setTimeout(() => setFlashNew(false), 3_000);
      prevOrderCountRef.current = incoming;
      return () => clearTimeout(id);
    }
    prevOrderCountRef.current = incoming;
    setOrders(initialOrders);
  }, [initialOrders]); // eslint-disable-line react-hooks/exhaustive-deps

  const t = T[lang];

  // ── Derived data ──────────────────────────────────────────────────────────
  const newOrders      = orders.filter(o => o.status === 'new');
  const receivedOrders = orders.filter(o => o.status === 'received');
  const servedOrders   = orders.filter(o => o.status === 'served');

  const tabOrders: Record<ActiveTab, KDSOrder[]> = {
    all: orders, new: newOrders, received: receivedOrders, served: servedOrders,
  };
  const tabCounts: Record<ActiveTab, number> = {
    all: orders.length, new: newOrders.length,
    received: receivedOrders.length, served: servedOrders.length,
  };
  const tabEmpty: Record<ActiveTab, string> = {
    all: t.emptyAll, new: t.emptyNew,
    received: t.emptyReceived, served: t.emptyServed,
  };

  const TABS: Array<{
    key: ActiveTab; label: string; icon: React.ReactNode;
    activeClass: string; badgeClass: string;
  }> = [
    { key: 'all',      label: t.tabAll,      icon: <LayoutGrid className="w-5 h-5" />,  activeClass: 'border-b-2 border-[#05C9CC] text-[#05C9CC] bg-cyan-50',  badgeClass: 'bg-[#05C9CC] text-white' },
    { key: 'new',      label: t.tabNew,      icon: <Bell className="w-5 h-5" />,         activeClass: 'border-b-2 border-red-500 text-red-600 bg-red-50',        badgeClass: 'bg-red-500 text-white'    },
    { key: 'received', label: t.tabReceived, icon: <Utensils className="w-5 h-5" />,     activeClass: 'border-b-2 border-amber-500 text-amber-600 bg-amber-50',   badgeClass: 'bg-amber-500 text-white'  },
    { key: 'served',   label: t.tabServed,   icon: <CheckCircle2 className="w-5 h-5" />, activeClass: 'border-b-2 border-green-600 text-green-700 bg-green-50',   badgeClass: 'bg-green-600 text-white'  },
  ];

  // ── Action handlers — mutate local state, then fire callback to parent ────

  const handleToggleItem = useCallback((orderId: string, itemId: number) => {
    setOrders(prev => {
      const next = prev.map(order => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map(item =>
          item.id === itemId ? { ...item, done: !item.done } : item,
        );
        const allDone = updatedItems.every(i => i.done);

        // new → received transition
        if (allDone && order.status === 'new') {
          toast.success(T[lang].toastOrderReceived, {
            description: `${lang === 'zh' ? order.suiteNameZh : order.suiteName} — ${order.guestName}`,
          });
          setTimeout(() => setActiveTab('received'), 600);
          const updated: KDSOrder = {
            ...order,
            items: updatedItems.map(i => ({ ...i, done: false })),
            status: 'received',
            receivedAt: new Date(),
          };
          onOrderStatusChanged?.(order.id, 'received', updated);
          return updated;
        }

        // received → served transition
        if (allDone && order.status === 'received') {
          toast.success(T[lang].toastFoodServed, {
            description: `${lang === 'zh' ? order.suiteNameZh : order.suiteName} — ${order.guestName}`,
          });
          setTimeout(() => setActiveTab('served'), 600);
          const updated: KDSOrder = {
            ...order,
            items: updatedItems,
            status: 'served',
            servedAt: new Date(),
          };
          onOrderStatusChanged?.(order.id, 'served', updated);
          return updated;
        }

        const updated = { ...order, items: updatedItems };
        const toggledItem = updatedItems.find(i => i.id === itemId)!;
        onItemToggled?.(order.id, itemId, toggledItem.done, updated);
        return updated;
      });
      return next;
    });
  }, [lang, onItemToggled, onOrderStatusChanged]);

  const handleMarkAll = useCallback((orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const updatedItems = order.items.map(item => ({ ...item, done: true }));

      if (order.status === 'new') {
        toast.success(T[lang].toastOrderReceived, {
          description: `${lang === 'zh' ? order.suiteNameZh : order.suiteName} — ${order.guestName}`,
        });
        setTimeout(() => setActiveTab('received'), 600);
        const updated: KDSOrder = {
          ...order,
          items: updatedItems.map(i => ({ ...i, done: false })),
          status: 'received',
          receivedAt: new Date(),
        };
        onOrderStatusChanged?.(order.id, 'received', updated);
        return updated;
      }

      if (order.status === 'received') {
        toast.success(T[lang].toastFoodServed, {
          description: `${lang === 'zh' ? order.suiteNameZh : order.suiteName} — ${order.guestName}`,
        });
        setTimeout(() => setActiveTab('served'), 600);
        const updated: KDSOrder = {
          ...order,
          items: updatedItems,
          status: 'served',
          servedAt: new Date(),
        };
        onOrderStatusChanged?.(order.id, 'served', updated);
        return updated;
      }

      return { ...order, items: updatedItems };
    }));
  }, [lang, onOrderStatusChanged]);

  const handleManualRefresh = () => {
    setLastRefreshed(new Date());
    toast.info(t.toastRefreshed);
    onRefresh?.();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-100" style={{ fontSize: '1.125rem' }}>

      {/* ── Top bar ── */}
      <div className={`bg-[#0f2942] px-6 py-4 flex items-center justify-between gap-4 transition-all ${
        flashNew ? 'ring-4 ring-red-500 ring-inset' : ''
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1em' }} className="text-white font-semibold">
              {t.systemTitle}
            </h2>
            <p style={{ fontSize: '0.8em' }} className="text-blue-200">
              {t.systemSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span style={{ fontSize: '0.8em' }} className="text-blue-200 hidden sm:block">
            {t.refreshedAt}{' '}
            {lastRefreshed.toLocaleTimeString('en-HK', {
              hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
            })}
          </span>

          {/* Language toggle — pure UI, not business state */}
          <button
            onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
            style={{ fontSize: '0.85em' }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors font-semibold"
            title="Switch Language / 切換語言"
          >
            <Languages className="w-4 h-4" />
            {t.switchLang}
          </button>

          <button
            onClick={handleManualRefresh}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={t.refreshTitle}
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSoundOn(p => !p)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={soundOn ? t.muteNotif : t.enableNotif}
          >
            {soundOn ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── New-order flash banner ── */}
      {flashNew && (
        <div
          style={{ fontSize: '1em' }}
          className="bg-red-500 text-white text-center py-2 font-semibold animate-pulse"
        >
          {t.newOrderBanner}
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-gray-200 flex items-stretch">
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{ fontSize: '1em' }}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors focus:outline-none ${
                isActive
                  ? tab.activeClass
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                style={{ fontSize: '0.85em' }}
                className={`px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? tab.badgeClass : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tabCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Order grid ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {tabOrders[activeTab].length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
            <Utensils className="w-12 h-12 opacity-30" />
            <p style={{ fontSize: '1em' }}>{tabEmpty[activeTab]}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {tabOrders[activeTab].map(order => (
              <OrderCard
                key={order.id}
                order={order}
                lang={lang}
                onToggleItem={handleToggleItem}
                onMarkAll={handleMarkAll}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Legend footer ── */}
      <div
        style={{ fontSize: '0.82em' }}
        className="bg-white border-t border-gray-200 px-6 py-2.5 flex flex-wrap gap-x-6 gap-y-1 text-gray-500"
      >
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
          {t.legendNew}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
          {t.legendReceived}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
          {t.legendServed}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-400 shrink-0" />
          {t.legendAllergy}
        </span>
      </div>
    </div>
  );
}
