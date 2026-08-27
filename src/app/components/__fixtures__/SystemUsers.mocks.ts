/**
 * __fixtures__/SystemUsers.mocks.ts
 *
 * Fixture data for SystemUsers.tsx.
 * This file is the ONLY place SystemUsers mock data lives.
 * Import `mockSystemUsersData` and spread it as default props during development.
 *
 * Smart Container usage:
 *   <SystemUsers users={apiUsers} onCreateUser={handleCreate} onUpdateUser={handleUpdate} />
 *
 * Standalone / Storybook usage:
 *   import { mockSystemUsersData } from './__fixtures__/SystemUsers.mocks';
 *   <SystemUsers {...mockSystemUsersData} />
 */

import type { SystemUser, SystemUserFormData, SystemUsersProps } from '../SystemUsers';

// ─── Generator (deterministic, no randomness) ─────────────────────────────────

const FIRST_NAMES  = ['Wong', 'Chan', 'Lee', 'Lam', 'Cheng', 'Ng', 'Cheung', 'Ho', 'Leung', 'Tang', 'Yip', 'Fong', 'Tsang', 'Chow', 'Kwok'];
const LAST_NAMES   = ['Chi Ming', 'Siu Lan', 'Ka Wai', 'Mei Ling', 'Hoi Man', 'Yuk Fai', 'Wai Ying', 'Chun Kit', 'Sum Yi', 'Wing Sze'];
const ROLES: SystemUser['role'][]       = ['System Admin', 'Lounge Manager', 'Supervisor', 'Staff', 'Staff', 'Staff'];
const DEPARTMENTS  = ['IT Department', 'Lounge Operations', 'Guest Services', 'Finance', 'Management', 'Security', 'Housekeeping', 'F&B Services'];
const STATUSES: SystemUser['status'][]  = ['active', 'active', 'active', 'active', 'inactive'];

function generateMockUsers(): SystemUser[] {
  const users: SystemUser[] = [];
  for (let i = 1; i <= 45; i++) {
    const firstName  = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName   = LAST_NAMES[i % LAST_NAMES.length];
    const role       = ROLES[i % ROLES.length];
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const status     = STATUSES[i % STATUSES.length];

    const createdDate   = new Date(2023, Math.floor(i / 10), (i % 28) + 1);
    const lastLoginDate = new Date(2026, 0, 15 + (i % 8));
    const lastLoginHour = 8 + (i % 12);
    const lastLoginMin  = (i * 15) % 60;

    let permissions: string[];
    if (role === 'System Admin') {
      permissions = ['all'];
    } else if (role === 'Lounge Manager') {
      permissions = ['approve_invoices', 'manage_staff', 'view_reports', 'approve_bookings'];
    } else if (role === 'Supervisor') {
      permissions = ['approve_bookings', 'manage_bookings', 'view_reports', 'create_bookings'];
    } else {
      permissions = ['create_bookings', 'edit_bookings', 'view_guests'];
    }

    users.push({
      id:          i,
      name:        i === 1 ? 'HKIAL Staff' : `${firstName} ${lastName}`,
      email:       i === 1 ? 'admin@hkial.com' : `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}@hkial.com`,
      role,
      department,
      status,
      lastLogin:   `${lastLoginDate.toISOString().split('T')[0]} ${String(lastLoginHour).padStart(2, '0')}:${String(lastLoginMin).padStart(2, '0')}`,
      createdDate: createdDate.toISOString().split('T')[0],
      permissions,
    });
  }
  return users;
}

export const mockUsers: SystemUser[] = generateMockUsers();

// ─── Aggregated mock prop object ──────────────────────────────────────────────

export const mockSystemUsersData: SystemUsersProps = {
  users: mockUsers,
  onCreateUser:        (data: SystemUserFormData) => console.log('[mock] onCreateUser', data),
  onUpdateUser:        (id: number, data: SystemUserFormData) => console.log('[mock] onUpdateUser', id, data),
  onDeleteUser:        (id: number) => console.log('[mock] onDeleteUser', id),
  onManagePermissions: (id: number) => console.log('[mock] onManagePermissions', id),
};
