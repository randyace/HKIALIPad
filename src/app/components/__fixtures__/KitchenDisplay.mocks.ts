/**
 * __fixtures__/KitchenDisplay.mocks.ts
 *
 * Fixture seed data for KitchenDisplay.tsx.
 * The component uses `initialOrders` from this file as its default prop so it
 * renders correctly in isolation (Storybook, design review, local dev).
 *
 * CI4 Smart Container usage:
 *   import { KitchenDisplay } from '../KitchenDisplay';
 *   <KitchenDisplay
 *     initialOrders={apiOrders}
 *     onItemToggled={(orderId, itemId, done) => patchCI4(orderId, itemId, done)}
 *     onOrderStatusChanged={(orderId, status) => patchCI4Status(orderId, status)}
 *     onRefresh={refetchOrders}
 *   />
 */

import type { KDSOrder } from '../KitchenDisplay';

const NOW = Date.now();
const minsAgo = (m: number) => new Date(NOW - m * 60_000);

export const mockKDSOrders: KDSOrder[] = [
  {
    id: 'KDS-001',
    posOrderNo: 'POS-20260316-000012',
    suiteName: 'VIP Suite A1',
    suiteNameZh: 'VIP貴賓廳 A1',
    guestName: 'Mr John Smith',
    guestCount: 3,
    placedAt: minsAgo(2),
    status: 'new',
    priority: 'rush',
    allergyAlert: 'Shellfish, Peanuts',
    allergyAlertZh: '介貝類、花生',
    items: [
      {
        id: 1, name: 'Grilled Salmon Fillet', nameZh: '香煎三文魚柳',
        category: 'Food', quantity: 2,
        notes: 'Medium-well, extra lemon', notesZh: '七成熟，多檸檬',
        allergyFlag: false, done: false,
      },
      {
        id: 2, name: 'Caesar Salad', nameZh: '凱撒沙律',
        category: 'Food', quantity: 1,
        allergyFlag: false, done: false,
      },
      {
        id: 3, name: 'Espresso', nameZh: '意式濃縮咖啡',
        category: 'Beverage', quantity: 3,
        allergyFlag: false, done: false,
      },
      {
        id: 4, name: 'Tiramisu', nameZh: '提拉米蘇',
        category: 'Dessert', quantity: 1,
        notes: 'No nuts', notesZh: '不加果仁',
        allergyFlag: true, done: false,
      },
    ],
  },
  {
    id: 'KDS-002',
    posOrderNo: 'POS-20260316-000015',
    suiteName: 'Executive Suite B2',
    suiteNameZh: '行政廳 B2',
    guestName: 'Mrs Mary Johnson',
    guestCount: 2,
    placedAt: minsAgo(5),
    status: 'new',
    priority: 'normal',
    items: [
      {
        id: 5, name: 'Club Sandwich', nameZh: '總匯三文治',
        category: 'Food', quantity: 2,
        allergyFlag: false, done: false,
      },
      {
        id: 6, name: 'French Fries', nameZh: '薯條',
        category: 'Snack', quantity: 2,
        allergyFlag: false, done: false,
      },
      {
        id: 7, name: 'Sparkling Water (500 ml)', nameZh: '氣泡水 (500毫升)',
        category: 'Beverage', quantity: 2,
        allergyFlag: false, done: false,
      },
    ],
  },
  {
    id: 'KDS-003',
    posOrderNo: 'POS-20260316-000009',
    suiteName: 'Premiere Suite C1',
    suiteNameZh: '首席廳 C1',
    guestName: 'Mr David Lee',
    guestCount: 4,
    placedAt: minsAgo(9),
    status: 'received',
    receivedAt: minsAgo(7),
    priority: 'normal',
    items: [
      {
        id: 8, name: 'Wagyu Beef Burger', nameZh: '和牛漢堡',
        category: 'Food', quantity: 2,
        notes: 'Well done', notesZh: '全熟',
        allergyFlag: false, done: false,
      },
      {
        id: 9, name: 'Tom Yum Soup', nameZh: '冬蔭功湯',
        category: 'Food', quantity: 2,
        allergyFlag: false, done: false,
      },
      {
        id: 10, name: 'Red Wine (Glass)', nameZh: '紅葡萄酒 (杯)',
        category: 'Beverage', quantity: 4,
        allergyFlag: false, done: false,
      },
      {
        id: 11, name: 'Cheese Platter', nameZh: '芝士拼盤',
        category: 'Snack', quantity: 1,
        allergyFlag: false, done: false,
      },
    ],
  },
  {
    id: 'KDS-004',
    posOrderNo: 'POS-20260316-000007',
    suiteName: 'VIP Suite A2',
    suiteNameZh: 'VIP貴賓廳 A2',
    guestName: 'Miss Sarah Chen',
    guestCount: 1,
    placedAt: minsAgo(14),
    status: 'received',
    receivedAt: minsAgo(12),
    priority: 'normal',
    allergyAlert: 'Dairy, Eggs',
    allergyAlertZh: '乳製品、雞蛋',
    items: [
      {
        id: 12, name: 'Seasonal Fruit Bowl', nameZh: '時令鮮果盤',
        category: 'Food', quantity: 1,
        allergyFlag: false, done: true,
      },
      {
        id: 13, name: 'Green Tea', nameZh: '綠茶',
        category: 'Beverage', quantity: 1,
        allergyFlag: false, done: false,
      },
    ],
  },
  {
    id: 'KDS-005',
    posOrderNo: 'POS-20260316-000003',
    suiteName: 'Business Suite D1',
    suiteNameZh: '商務廳 D1',
    guestName: 'Mr Robert Wang',
    guestCount: 2,
    placedAt: minsAgo(22),
    status: 'served',
    receivedAt: minsAgo(20),
    servedAt: minsAgo(5),
    priority: 'normal',
    items: [
      {
        id: 14, name: 'Dim Sum Set (3 pcs)', nameZh: '點心套餐 (3件)',
        category: 'Food', quantity: 2,
        allergyFlag: false, done: true,
      },
      {
        id: 15, name: 'Jasmine Tea', nameZh: '茉莉花茶',
        category: 'Beverage', quantity: 2,
        allergyFlag: false, done: true,
      },
    ],
  },
  {
    id: 'KDS-006',
    posOrderNo: 'POS-20260316-000001',
    suiteName: 'Open Lounge',
    suiteNameZh: '開放式貴賓室',
    guestName: 'Mrs Emma Wilson',
    guestCount: 3,
    placedAt: minsAgo(30),
    status: 'served',
    receivedAt: minsAgo(28),
    servedAt: minsAgo(12),
    priority: 'normal',
    items: [
      {
        id: 16, name: 'Afternoon Tea Set', nameZh: '下午茶套餐',
        category: 'Food', quantity: 3,
        allergyFlag: false, done: true,
      },
      {
        id: 17, name: 'Cappuccino', nameZh: '卡布奇諾',
        category: 'Beverage', quantity: 2,
        allergyFlag: false, done: true,
      },
      {
        id: 18, name: 'Orange Juice', nameZh: '橙汁',
        category: 'Beverage', quantity: 1,
        allergyFlag: false, done: true,
      },
    ],
  },
];

export const mockKitchenDisplayData = {
  initialOrders: mockKDSOrders,
  lastRefreshedAt: new Date(),
} as const;
