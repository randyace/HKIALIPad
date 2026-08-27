// Mock service for the figma-ui / figma Make environment.
//
// Why this exists:
//   BookingEditDialog.tsx (and any future submodule component) does
//   `import { suiteService, type Suite } from '@/services/suiteService';`.
//   figma Make doesn't ship a real service layer, so the import
//   resolution fails and Vite logs "Failed to resolve import" for
//   anything that touches the dialog.
//
// What this provides:
//   - `suiteService` shape mirroring the real one in hkial-react
//   - `Suite` type with the same fields the real service uses
//   - `getSuites()` returns 8 suites (7 CIP + Function Room) and
//     8 lounge seats (Lobby 1-8), matching the data the backend
//     seeders populate in hkial-api.
//
// How to use it in figma Make:
//   1. Drop this file into <repo>/src/services/suiteService.ts
//      (or paste the contents in the figma Make editor).
//   2. The dialog will resolve `@/services/suiteService` and render
//      the Premiere Suite / Lounge Deluxe checkbox grids with mock
//      data. No API calls.

export interface Suite {
  id: number;
  suite_name: string;
  suite_code: string;
  floor?: string;
  features?: string;
  is_active: boolean;
  kind: 'suite' | 'lounge';
  status: 'available' | 'occupied' | 'food-served' | 'cleaning';
  current_booking_id?: number;
  status_updated_at?: string;
}

const CIP_SUITES: Suite[] = [
  { id: 1, suite_name: 'CIP 1', suite_code: 'CIP-01', floor: '5/F', features: 'shower,private-wc', is_active: true, kind: 'suite', status: 'available' },
  { id: 2, suite_name: 'CIP 2', suite_code: 'CIP-02', floor: '5/F', features: 'shower,private-wc', is_active: true, kind: 'suite', status: 'available' },
  { id: 3, suite_name: 'CIP 3', suite_code: 'CIP-03', floor: '5/F', features: 'shower,private-wc', is_active: true, kind: 'suite', status: 'available' },
  { id: 4, suite_name: 'CIP 4', suite_code: 'CIP-04', floor: '5/F', features: 'shower,private-wc', is_active: true, kind: 'suite', status: 'available' },
  { id: 5, suite_name: 'CIP 5', suite_code: 'CIP-05', floor: '5/F', features: 'shower,private-wc', is_active: true, kind: 'suite', status: 'available' },
  { id: 6, suite_name: 'CIP 6', suite_code: 'CIP-06', floor: '5/F', features: 'shower,private-wc', is_active: true, kind: 'suite', status: 'available' },
  { id: 7, suite_name: 'Function Room', suite_code: 'FN-01', floor: '5/F', features: 'meeting-table,private-wc', is_active: true, kind: 'suite', status: 'available' },
];

const LOUNGE_SEATS: Suite[] = [
  { id: 8,  suite_name: 'Lobby 1', suite_code: 'LBY-01', floor: '5/F', features: 'seat', is_active: true, kind: 'lounge', status: 'available' },
  { id: 9,  suite_name: 'Lobby 2', suite_code: 'LBY-02', floor: '5/F', features: 'seat', is_active: true, kind: 'lounge', status: 'available' },
  { id: 10, suite_name: 'Lobby 3', suite_code: 'LBY-03', floor: '5/F', features: 'seat', is_active: true, kind: 'lounge', status: 'available' },
  { id: 11, suite_name: 'Lobby 4', suite_code: 'LBY-04', floor: '5/F', features: 'seat', is_active: true, kind: 'lounge', status: 'available' },
  { id: 12, suite_name: 'Lobby 5', suite_code: 'LBY-05', floor: '5/F', features: 'seat', is_active: true, kind: 'lounge', status: 'available' },
  { id: 13, suite_name: 'Lobby 6', suite_code: 'LBY-06', floor: '5/F', features: 'seat', is_active: true, kind: 'lounge', status: 'available' },
  { id: 14, suite_name: 'Lobby 7', suite_code: 'LBY-07', floor: '5/F', features: 'seat', is_active: true, kind: 'lounge', status: 'available' },
  { id: 15, suite_name: 'Lobby 8', suite_code: 'LBY-08', floor: '5/F', features: 'seat', is_active: true, kind: 'lounge', status: 'available' },
];

const ALL_SUITES: Suite[] = [...CIP_SUITES, ...LOUNGE_SEATS];

export const suiteService = {
  async getSuites(): Promise<{ success: boolean; data: Suite[] }> {
    // Mirrors the real service's success/data shape so the dialog
    // doesn't need to special-case this stub.
    return {
      success: true,
      data: ALL_SUITES,
    };
  },
  async getSuitesByKind(kind: 'suite' | 'lounge'): Promise<{ success: boolean; data: Suite[] }> {
    return {
      success: true,
      data: ALL_SUITES.filter((s) => s.kind === kind),
    };
  },
};
