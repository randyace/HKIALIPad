// ── Shared Pre-Order Store (module-level singleton) ───────────────────────────
// Holds pre-ordered items keyed by bookingNo so any component can read/write.

export interface PreOrderItem {
  id: string;
  name: string;
  category: string;
  qty: number;
}

export interface PreOrderEntry {
  bookingNo: string;
  guestName: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfGuests: number;
  items: PreOrderItem[];
  savedAt: string; // ISO datetime
}

/** The store: bookingNo → PreOrderEntry */
export const preOrderStore: Record<string, PreOrderEntry> = {
  // ── Demo seed: Robert Wang (A-202603-000006) ────────────────────────────────
  'A-202603-000006': {
    bookingNo: 'A-202603-000006',
    guestName: 'Robert Wang',
    venue: 'Business Suite 2',
    date: '2026-03-15',
    startTime: '11:30',
    endTime: '14:30',
    numberOfGuests: 3,
    items: [
      { id: 'main-2',      name: 'Beef Noodles',              category: 'Main Course',       qty: 2 },
      { id: 'main-3',      name: 'Seafood Fried Rice',        category: 'Main Course',       qty: 1 },
      { id: 'alc-3',       name: 'Red Wine (Glass)',          category: 'Alcoholic Beverages', qty: 3 },
      { id: 'app-6',       name: 'Fresh Fruit Platter',       category: 'Appetiser',         qty: 1 },
      { id: 'dessert-2',   name: 'Mango Pudding',             category: 'Dessert',           qty: 3 },
    ],
    savedAt: new Date().toISOString(),
  },
  // ── Demo seed: Lisa Taylor (A-202603-000010) ────────────────────────────────
  'A-202603-000010': {
    bookingNo: 'A-202603-000010',
    guestName: 'Lisa Taylor',
    venue: 'VIP Suite A',
    date: '2026-03-15',
    startTime: '11:00',
    endTime: '14:30',
    numberOfGuests: 1,
    items: [
      { id: 'breakfast-2', name: 'Continental Breakfast',     category: 'Breakfast',         qty: 1 },
      { id: 'coffee-1',    name: 'Latte',                     category: 'Coffee',            qty: 2 },
      { id: 'alc-1',       name: 'Champagne (Dom Pérignon)',  category: 'Alcoholic Beverages', qty: 1 },
      { id: 'dessert-6',   name: 'Egg Tart',                  category: 'Dessert',           qty: 2 },
    ],
    savedAt: new Date().toISOString(),
  },
};

export function savePreOrder(entry: PreOrderEntry) {
  preOrderStore[entry.bookingNo] = { ...entry, savedAt: new Date().toISOString() };
}

export function getPreOrder(bookingNo: string): PreOrderEntry | null {
  return preOrderStore[bookingNo] ?? null;
}

export function clearPreOrder(bookingNo: string) {
  delete preOrderStore[bookingNo];
}