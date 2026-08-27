/**
 * __fixtures__/GradingPackages.mocks.ts
 *
 * Fixture data for GradingPackages.tsx.
 * This file is the ONLY place GradingPackages mock data lives.
 * Import `mockGradingPackagesData` and spread it as default props during development.
 *
 * Smart Container usage:
 *   <GradingPackages packages={apiPackages} onSavePackage={handleSave} onToggleActive={handleToggle} />
 *
 * Standalone / Storybook usage:
 *   import { mockGradingPackagesData } from './__fixtures__/GradingPackages.mocks';
 *   <GradingPackages {...mockGradingPackagesData} />
 */

import type { GradingPackage, GradingPackagesProps } from '../GradingPackages';

// ─── Mock Packages ────────────────────────────────────────────────────────────

export const mockPackages: GradingPackage[] = [
  {
    id: 1,
    tier: 'Gold',
    price: 32000,
    currency: 'HKD',
    bookingCredits: 8,
    validityMonths: 12,
    description: 'Entry-level membership with 8 Lounge Deluxe entries per year and premium dining options.',
    benefits: [
      { id: 1, text: '8 Lounge Deluxe entries per year' },
      { id: 2, text: 'Paid upgrade to Premiere Suite Service (40% off)' },
      { id: 3, text: 'Birthday Month Special: Birthday cake' },
      { id: 4, text: 'Priority check-in & immigration assistance' },
      { id: 5, text: 'Complimentary à la carte dining' },
      { id: 6, text: 'Priority baggage handling' },
    ],
    isActive: true,
    memberCount: 142,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    badgeBg: 'bg-amber-100 text-amber-700',
  },
  {
    id: 2,
    tier: 'Platinum',
    price: 45000,
    currency: 'HKD',
    bookingCredits: 12,
    validityMonths: 12,
    description: 'Enhanced membership with 12 Lounge Deluxe entries per year and exclusive Platinum member benefits.',
    benefits: [
      { id: 1, text: '12 Lounge Deluxe entries per year' },
      { id: 2, text: 'Paid upgrade to Premiere Suite Service (40% off)' },
      { id: 3, text: 'Birthday Month Special: Birthday cake' },
      { id: 4, text: 'All Gold benefits included' },
      { id: 5, text: 'Exclusive Platinum lounge section' },
      { id: 6, text: 'Complimentary spa/shower facilities' },
      { id: 7, text: 'Guest passes (2 per visit)' },
    ],
    isActive: true,
    memberCount: 98,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    badgeBg: 'bg-purple-100 text-purple-700',
  },
  {
    id: 3,
    tier: 'Diamond',
    price: 84000,
    currency: 'HKD',
    bookingCredits: 24,
    validityMonths: 12,
    description: 'Premium membership with 24 Lounge Deluxe entries and 1 free Premiere Suite upgrade per year.',
    benefits: [
      { id: 1, text: '24 Lounge Deluxe entries per year' },
      { id: 2, text: '1 free upgrade to Premiere Suite Service per year' },
      { id: 3, text: 'Paid upgrade to Premiere Suite Service (40% off)' },
      { id: 4, text: 'Birthday Month Special: Birthday cake' },
      { id: 5, text: 'All Platinum benefits included' },
      { id: 6, text: 'Dedicated personal concierge' },
      { id: 7, text: 'Guest passes (3 per visit)' },
      { id: 8, text: 'Complimentary airport limousine (2 trips)' },
    ],
    isActive: true,
    memberCount: 56,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
    badgeBg: 'bg-sky-100 text-sky-700',
  },
  {
    id: 4,
    tier: 'Sapphire',
    price: 325000,
    currency: 'HKD',
    bookingCredits: -1,
    validityMonths: 12,
    description: 'Ultra-premium membership with unlimited Lounge Deluxe entries, 5 free Premiere Suite upgrades, and elite bespoke services.',
    benefits: [
      { id: 1, text: 'Unlimited Lounge Deluxe entries per year' },
      { id: 2, text: '5 free upgrades to Premiere Suite Service per year' },
      { id: 3, text: 'Paid upgrade to Premiere Suite Service (40% off)' },
      { id: 4, text: 'Birthday Month Special: Birthday cake' },
      { id: 5, text: 'All Diamond benefits included' },
      { id: 6, text: 'Unlimited airport limousine service' },
      { id: 7, text: 'Guest passes (5 per visit)' },
      { id: 8, text: '24/7 concierge hotline' },
      { id: 9, text: 'Priority rebooking assistance' },
    ],
    isActive: true,
    memberCount: 23,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    badgeBg: 'bg-indigo-100 text-indigo-700',
  },
];

// ─── Aggregated mock prop object ──────────────────────────────────────────────

export const mockGradingPackagesData: GradingPackagesProps = {
  packages: mockPackages,
  onSavePackage:   (pkg: GradingPackage) => console.log('[mock] onSavePackage', pkg),
  onToggleActive:  (id: number, isActive: boolean) => console.log('[mock] onToggleActive', id, isActive),
};
