/**
 * __fixtures__/PriceManagementEdit.mocks.ts
 *
 * Fixture data for PriceManagementEdit.tsx.
 * Re-uses the canonical product/combo data from PriceManagement.mocks.ts
 * so numbers stay consistent across pages.
 */

import type { PriceManagementEditProps } from '../PriceManagementEdit';
import { mockLoungeDeluxe, mockPremiereSuite, mockComboDiscount } from './PriceManagement.mocks';

export const mockPriceManagementEditLounge: PriceManagementEditProps = {
  mode: 'product',
  product: mockLoungeDeluxe,
  onBack: () => console.log('[mock] onBack'),
  onSave: (p) => console.log('[mock] onSave product', p),
};

export const mockPriceManagementEditSuite: PriceManagementEditProps = {
  mode: 'product',
  product: mockPremiereSuite,
  onBack: () => console.log('[mock] onBack'),
  onSave: (p) => console.log('[mock] onSave product', p),
};

export const mockPriceManagementEditCombo: PriceManagementEditProps = {
  mode: 'combo',
  comboDiscount: mockComboDiscount,
  onBack: () => console.log('[mock] onBack'),
  onSave: (d) => console.log('[mock] onSave combo', d),
};
