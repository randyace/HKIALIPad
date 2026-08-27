/**
 * __fixtures__/PriceManagement.mocks.ts
 *
 * Fixture data for PriceManagement.tsx.
 * All amounts are HKD per EN_Price_List.pdf (source of truth, 2026-06-04).
 * Numbers match the PricingService worked examples in PRICING_RULES_FOR_FIGMA.md.
 *
 * Standalone / Storybook usage:
 *   import { mockPriceManagementData } from './__fixtures__/PriceManagement.mocks';
 *   <PriceManagement {...mockPriceManagementData} />
 */

import type {
  ProductPricing,
  ComboDiscount,
  WorkedExample,
  PriceManagementProps,
} from '../PriceManagement';

// ─── Lounge Deluxe ────────────────────────────────────────────────────────────

export const mockLoungeDeluxe: ProductPricing = {
  productId: 'lounge-deluxe',
  productName: 'Lounge Deluxe',
  basePrice: 5000,
  currency: 'HKD',
  freeAllowanceNote: '1 main flying pax included',
  standardDurationHours: 3,
  addOns: [
    {
      id: 'ld-flying-extra',
      label: 'Additional flying guest',
      price: null,
      unit: 'per person',
      notes: 'N/A — not offered for Lounge Deluxe',
    },
    {
      id: 'ld-child-under2',
      label: 'Child under 2',
      price: 0,
      unit: 'per child',
      notes: 'Always free',
    },
    {
      id: 'ld-child-2-11-first',
      label: 'Child 2–11 (1st & 2nd child)',
      price: 1000,
      unit: 'per child',
      notes: '',
    },
    {
      id: 'ld-child-2-11-third',
      label: 'Child 2–11 (3rd child onward)',
      price: 2500,
      unit: 'per child',
      notes: '',
    },
    {
      id: 'ld-non-flying',
      label: 'Non-flying guest (3-hour stay)',
      price: 1000,
      unit: 'per person',
      notes: 'All paid; max 3 (Note 4)',
    },
    {
      id: 'ld-extra-hour',
      label: 'Additional hour of stay',
      price: 1000,
      unit: 'per person per hour',
      notes: '',
    },
    {
      id: 'ld-limo',
      label: 'In-town Limousine Transfer',
      price: 1500,
      unit: 'per car per trip',
      notes: '',
    },
  ],
  caps: [
    {
      id: 'note4',
      noteRef: 'Note 4',
      description: 'Max 3 non-flying guests per booking',
      cap: 3,
    },
  ],
  includes: [
    '3 hours standard duration',
    'Meet & Greet',
    'Check-in, Security, Immigration and Customs Facilitation',
    'Tarmac Transfer',
    'Food & Beverages',
    'Common Resting Area',
    'Shower & Resting Facilities',
  ],
};

// ─── Premiere Suite ───────────────────────────────────────────────────────────

export const mockPremiereSuite: ProductPricing = {
  productId: 'premiere-suite',
  productName: 'Premiere Suite',
  basePrice: 18000,
  currency: 'HKD',
  freeAllowanceNote: '1 main flying + 2 accompanying (any type) = 3 guests free',
  standardDurationHours: 3,
  addOns: [
    {
      id: 'ps-flying-extra',
      label: 'Additional flying guest (4th onward)',
      price: 2000,
      unit: 'per person',
      notes: '4th flying pax onward',
    },
    {
      id: 'ps-child-under2',
      label: 'Child under 2',
      price: 0,
      unit: 'per child',
      notes: 'Always free',
    },
    {
      id: 'ps-child-2-11-first',
      label: 'Child 2–11 (1st & 2nd child)',
      price: 0,
      unit: 'per child',
      notes: 'Covered by 3-guest free block',
    },
    {
      id: 'ps-child-2-11-third',
      label: 'Child 2–11 (3rd child onward)',
      price: 1000,
      unit: 'per child',
      notes: '',
    },
    {
      id: 'ps-non-flying',
      label: 'Non-flying guest (4th onward)',
      price: 1000,
      unit: 'per person',
      notes: '1st–3rd non-flying covered by free block',
    },
    {
      id: 'ps-extra-hour',
      label: 'Additional hour of stay',
      price: 3000,
      unit: 'per suite per hour',
      notes: '',
    },
    {
      id: 'ps-limo',
      label: 'In-town Limousine Transfer',
      price: 1500,
      unit: 'per car per trip',
      notes: '',
    },
  ],
  caps: [
    {
      id: 'note5',
      noteRef: 'Note 5',
      description: 'Max 6 guests total (flying + non-flying + children)',
      cap: 6,
    },
  ],
  includes: [
    '3 hours standard duration',
    'Meet & Greet',
    'Check-in, Security, Immigration and Customs Facilitation',
    'Tarmac Transfer',
    'Food & Beverages',
    'Private Suite',
    'In-suite Shower & Resting Facilities',
  ],
};

// ─── Combo Discount ───────────────────────────────────────────────────────────

export const mockComboDiscount: ComboDiscount = {
  id: 'note7',
  noteRef: 'Note 7',
  description:
    'Arrival + Departure combo (same passenger, same package type, total stay ≤ 6 hours) — 2nd leg gets 60% off the computed total.',
  discountPercent: 60,
  maxCombinedHours: 6,
};

// ─── Worked Examples ──────────────────────────────────────────────────────────

export const mockWorkedExamples: WorkedExample[] = [
  {
    id: 'example-a',
    title: 'Example A — Premiere Suite',
    subtitle: '1 flying + 2 non-flying + 1 child + 1 limo',
    lines: [
      { label: 'Premiere Suite — base (3-guest free block)', qty: 1, unit: 18000, subtotal: 18000 },
      { label: 'Limousine', qty: 1, unit: 1500, subtotal: 1500 },
    ],
    total: 19500,
    notes: '1 main flying pax, 2 non-flying, and 1 child 2–11 are all covered by the 3-guest free block.',
  },
  {
    id: 'example-b',
    title: 'Example B — Lounge Deluxe',
    subtitle: '1 main pax + 2 non-flying + 1 child + 1 limo',
    lines: [
      { label: 'Lounge Deluxe — base', qty: 1, unit: 5000, subtotal: 5000 },
      { label: 'Non-flying guest', qty: 2, unit: 1000, subtotal: 2000 },
      { label: 'Child 2–11 (1st and 2nd rate)', qty: 1, unit: 1000, subtotal: 1000 },
      { label: 'Limousine', qty: 1, unit: 1500, subtotal: 1500 },
    ],
    total: 9500,
    notes: '1 main flying pax included in base. 2 non-flying guests at HKD 1,000 each. 1st child at HKD 1,000.',
  },
  {
    id: 'example-c',
    title: 'Example C — Premiere Suite Combo (Note 7)',
    subtitle: '2nd leg with 60% off',
    lines: [
      { label: '1st leg — Premiere Suite (1 main flying)', qty: 1, unit: 18000, subtotal: 18000 },
      { label: '2nd leg — base (3 free + 1 paid flying)', qty: 1, unit: 18000, subtotal: 18000 },
      { label: '2nd leg — additional flying guest', qty: 1, unit: 2000, subtotal: 2000 },
      { label: '2nd leg — Note 7 combo discount (−60%)', qty: 1, unit: -12000, subtotal: -12000 },
    ],
    total: 26000,
    notes:
      '1st leg: HKD 18,000. 2nd leg raw: HKD 20,000. 60% off 2nd leg → HKD 8,000. Grand total: HKD 26,000.',
  },
];

// ─── Aggregated mock prop object ──────────────────────────────────────────────

export const mockPriceManagementData: PriceManagementProps = {
  loungeDeluxe: mockLoungeDeluxe,
  premiereSuite: mockPremiereSuite,
  comboDiscount: mockComboDiscount,
  workedExamples: mockWorkedExamples,
  lastUpdated: '2026-06-04',
  sourceDocument: 'EN_Price_List.pdf',
  onEditProduct: (id) => console.log('[mock] onEditProduct', id),
  onEditComboDiscount: () => console.log('[mock] onEditComboDiscount'),
};
