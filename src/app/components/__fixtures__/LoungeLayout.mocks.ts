/**
 * __fixtures__/LoungeLayout.mocks.ts
 *
 * Fixture data for LoungeLayout.tsx.
 * This file is the ONLY place LoungeLayout mock data lives.
 * Import `mockLoungeLayoutData` and spread it as default props during development.
 *
 * Smart Container usage:
 *   <LoungeLayout suites={apiSuites} onSaveLayout={handleSave} onResetLayout={handleReset} />
 *
 * Standalone / Storybook usage:
 *   import { mockLoungeLayoutData } from './__fixtures__/LoungeLayout.mocks';
 *   <LoungeLayout {...mockLoungeLayoutData} />
 */

import type { LoungeLayoutSuite, LoungeLayoutProps } from '../LoungeLayout';

// ─── Mock Suites ──────────────────────────────────────────────────────────────

export const mockSuites: LoungeLayoutSuite[] = [
  { id: 'vip-a1',     name: 'VIP Suite A1',       position: { x: 50,  y: 50  }, size: { width: 150, height: 120 } },
  { id: 'vip-a2',     name: 'VIP Suite A2',        position: { x: 220, y: 50  }, size: { width: 150, height: 120 } },
  { id: 'vip-b1',     name: 'VIP Suite B1',        position: { x: 50,  y: 190 }, size: { width: 150, height: 120 } },
  { id: 'vip-b2',     name: 'VIP Suite B2',        position: { x: 220, y: 190 }, size: { width: 150, height: 120 } },
  { id: 'exec-1',     name: 'Executive Suite 1',   position: { x: 390, y: 50  }, size: { width: 120, height: 100 } },
  { id: 'exec-2',     name: 'Executive Suite 2',   position: { x: 390, y: 170 }, size: { width: 120, height: 100 } },
  { id: 'business-1', name: 'Business Suite 1',    position: { x: 530, y: 50  }, size: { width: 120, height: 100 } },
  { id: 'business-2', name: 'Business Suite 2',    position: { x: 530, y: 170 }, size: { width: 120, height: 100 } },
  { id: 'family-1',   name: 'Family Suite',        position: { x: 50,  y: 330 }, size: { width: 200, height: 150 } },
  { id: 'business-3', name: 'Business Suite 3',    position: { x: 270, y: 330 }, size: { width: 120, height: 100 } },
  { id: 'business-4', name: 'Business Suite 4',    position: { x: 410, y: 330 }, size: { width: 120, height: 100 } },
  { id: 'business-5', name: 'Business Suite 5',    position: { x: 550, y: 330 }, size: { width: 120, height: 100 } },
];

// ─── Aggregated mock prop object ──────────────────────────────────────────────

export const mockLoungeLayoutData: LoungeLayoutProps = {
  suites: mockSuites,
  onSuitePositionChange: (suiteId, newPosition) => {
    console.log('[mock] onSuitePositionChange', suiteId, newPosition);
  },
  onSaveLayout: (suites) => {
    console.log('[mock] onSaveLayout', suites);
  },
  onResetLayout: () => {
    console.log('[mock] onResetLayout');
  },
};
