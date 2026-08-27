/**
 * Sidebar.tsx — Pure UI, zero routing hooks.
 *
 * REMOVED: useNavigate, useLocation, ITEM_URL record
 * ADDED:   currentPath prop (parent decides highlight — exact match only)
 *          onNavigate callback (parent handles routing)
 *          menuItems prop (full structure injectable from parent)
 *          user prop (injectable user profile)
 *          onLogout callback
 *
 * Demo mode: all props are optional — falls back to MOCK_MENU_ITEMS / MOCK_USER.
 */

import React, { useState } from 'react';
import {
  ChevronDown, LayoutDashboard, Users, Calendar, Package,
  Settings, Building2, CreditCard, LogOut, FileText, Tag, FileSignature, DollarSign,
} from 'lucide-react';
import logoImage from 'figma:asset/5314118f44483d10b69aeb99485c2f5942c726a2.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface SidebarMenuSubItem {
  id: string;
  label: string;
  path: string;
}

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  submenu?: SidebarMenuSubItem[];
}

export interface SidebarUser {
  name: string;
  role: string;
  /** Optional initials override — defaults to first 2 chars of name */
  avatar?: string;
}

export interface SidebarProps {
  /** Current active path — parent passes this, sidebar only renders visual state */
  currentPath?: string;
  /** Badge count shown on "Point of Sales" group */
  overdueOrdersCount?: number;
  /** Logged-in user info */
  user?: SidebarUser;
  /** Called when any menu item is clicked — parent handles actual routing */
  onNavigate?: (path: string) => void;
  /** Called when Logout is clicked */
  onLogout?: () => void;
  /** Full menu structure — if omitted, falls back to MOCK_MENU_ITEMS */
  menuItems?: SidebarMenuItem[];
}

// ─── MOCK data (isolated — replace by passing props from container) ───────────

const MOCK_MENU_ITEMS: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    label: 'DashBoard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/dashboard',
  },
  {
    id: 'customers',
    label: 'Customers Management',
    icon: <Users className="w-5 h-5" />,
    submenu: [
      { id: 'all-customers',    label: 'All Customers',      path: '/customers' },
      { id: 'create-customers', label: 'Create Customer',    path: '/customers/create' },
      { id: 'customer-company', label: 'Customer Companies', path: '/customers/company' },
      { id: 'travel-agency',    label: 'Agency',             path: '/travel-agency' },
      { id: 'grading-packages', label: 'Grading Packages',   path: '/grading-packages' },
    ],
  },
  {
    id: 'contract',
    label: 'Contract Management',
    icon: <FileSignature className="w-5 h-5" />,
    submenu: [
      { id: 'purchase-management', label: 'New Contract', path: '/membership/purchase' },
      { id: 'balance-tracker',     label: 'All Contract', path: '/membership/balance' },
    ],
  },
  {
    id: 'bookings',
    label: 'Bookings Management',
    icon: <Calendar className="w-5 h-5" />,
    submenu: [
      { id: 'all-bookings',         label: 'All Bookings',            path: '/bookings' },
      { id: 'approve-bookings',     label: 'Approve Booking Request', path: '/bookings/approve' },
      { id: 'supervising-approval', label: 'Supervising Approval',    path: '/bookings/supervising-approval' },
      { id: 'create-bookings',      label: 'Create Booking',          path: '/bookings/create' },
      { id: 'bookings-settings',    label: 'Booking Settings',        path: '/bookings/settings' },
    ],
  },
  {
    id: 'booking-schedules',
    label: 'Booking Schedules',
    icon: <Calendar className="w-5 h-5" />,
    submenu: [
      { id: 'all-schedules',   label: 'All Booking Schedules',   path: '/bookings/schedules' },
      { id: 'suite-schedules', label: 'Suite Booking Schedules', path: '/suites' },
      { id: 'table-schedules', label: 'Table Booking Schedules', path: '/bookings/schedules/table' },
    ],
  },
  {
    id: 'bookable-items',
    label: 'Bookable Items Management',
    icon: <Package className="w-5 h-5" />,
    submenu: [
      { id: 'all-items',    label: 'All Bookable Items',    path: '/items' },
      { id: 'create-item',  label: 'Create Bookable Item',  path: '/items/create' },
    ],
  },
  {
    id: 'pos',
    label: 'Point of Sales',
    icon: <CreditCard className="w-5 h-5" />,
    submenu: [
      { id: 'pos-floor-plan',  label: 'POS Floor Plan',  path: '/pos' },
      { id: 'pos-transaction', label: 'Transaction',      path: '/pos/transactions' },
      { id: 'kitchen-display', label: 'Kitchen Display',  path: '/pos/kitchen' },
      { id: 'guest-kiosk',     label: 'Guest iPad Kiosk', path: '/kiosk' },
    ],
  },
  {
    id: 'lounge',
    label: 'Lounge Management',
    icon: <Building2 className="w-5 h-5" />,
    submenu: [
      { id: 'lounge-layout',    label: 'Lounge Layout Plan', path: '/lounge-layout' },
      { id: 'price-management', label: 'Price Management',   path: '/price-management' },
    ],
  },
  {
    id: 'promo',
    label: 'Promo Code',
    icon: <Tag className="w-5 h-5" />,
    submenu: [
      { id: 'all-promo-codes',   label: 'All Promo Codes',   path: '/promo-codes' },
      { id: 'create-promo-code', label: 'Create Promo Code', path: '/promo-codes/create' },
      { id: 'promo-code-usage',  label: 'Promo Code Usage',  path: '/promo-codes/usage' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: <FileText className="w-5 h-5" />,
    submenu: [
      { id: 'corporate-reports', label: 'BD Usage Reports', path: '/reports/corporate' },
      { id: 'refund-report',     label: 'Refund Report',    path: '/reports/refund' },
    ],
  },
  {
    id: 'system-users',
    label: 'System Users Management',
    icon: <Settings className="w-5 h-5" />,
    submenu: [
      { id: 'manage-system-users', label: 'Manage System Users', path: '/system-users' },
      { id: 'audit-logs',          label: 'Audit Logs',          path: '/audit-logs' },
    ],
  },
];

const MOCK_USER: SidebarUser = { name: 'HKIAL Staff', role: 'Administrator' };

// ─── Helper — derive which groups should start expanded based on currentPath ──

function getInitialOpenGroups(pathname: string): string[] {
  const groups: string[] = [];
  if (pathname === '/' || pathname === '/dashboard') return groups;
  if (
    pathname.startsWith('/customers') ||
    pathname.startsWith('/travel-agency') ||
    pathname.startsWith('/grading-packages')
  ) groups.push('customers');
  if (
    pathname.startsWith('/membership/purchase') ||
    pathname.startsWith('/membership/balance')
  ) groups.push('contract');
  if (pathname.startsWith('/bookings') && !pathname.startsWith('/bookings/schedules')) groups.push('bookings');
  if (pathname.startsWith('/bookings/schedules') || pathname.startsWith('/suites')) groups.push('booking-schedules');
  if (pathname.startsWith('/items'))        groups.push('bookable-items');
  if (pathname.startsWith('/pos') || pathname === '/kiosk') groups.push('pos');
  if (pathname.startsWith('/lounge-layout') || pathname.startsWith('/price-management')) groups.push('lounge');
  if (pathname.startsWith('/promo-codes'))  groups.push('promo');
  if (pathname.startsWith('/reports'))      groups.push('reports');
  if (pathname.startsWith('/system-users') || pathname.startsWith('/audit-logs')) groups.push('system-users');
  return groups;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar({
  currentPath    = '/dashboard',
  overdueOrdersCount = 0,
  user,
  onNavigate     = () => {},
  onLogout       = () => {},
  menuItems,
}: SidebarProps) {
  // Use prop-supplied menu items; fall back to mock for standalone demo
  const displayMenuItems = menuItems && menuItems.length > 0 ? menuItems : MOCK_MENU_ITEMS;
  const displayUser      = user ?? MOCK_USER;

  // Pure UI state — which accordion groups are open
  const [openMenus, setOpenMenus] = useState<string[]>(() =>
    getInitialOpenGroups(currentPath),
  );

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId],
    );
  };

  // ── Active check — EXACT match only (no startsWith) per spec ──────────────
  const isActive = (path: string): boolean => {
    if (path === '/dashboard') return currentPath === '/dashboard' || currentPath === '/';
    return currentPath === path;
  };

  // Initials for avatar fallback
  const initials = displayUser.avatar
    ?? displayUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="w-80 bg-[#0f2942] text-white flex flex-col h-full">

      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <img src={logoImage} alt="HKIA VIP Lounge" className="h-10" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {displayMenuItems.map(item => (
            <div key={item.id}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className="flex items-center justify-between w-full p-3 rounded hover:bg-gray-700/50 transition-colors text-white"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Overdue badge — only on the POS group */}
                      {item.id === 'pos' && overdueOrdersCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold leading-none shadow-sm">
                          {overdueOrdersCount > 99 ? '99+' : overdueOrdersCount}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openMenus.includes(item.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {openMenus.includes(item.id) && (
                    <div className="ml-11 mt-1 space-y-1">
                      {item.submenu.map(subItem => (
                        <button
                          key={subItem.id}
                          onClick={() => onNavigate(subItem.path)}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            isActive(subItem.path)
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                          }`}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => item.path && onNavigate(item.path)}
                  className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${
                    item.path && isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-white hover:bg-gray-700/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full hover:bg-gray-700/50 p-2 rounded transition-colors">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs">{initials}</span>
              </div>
              <div className="text-left">
                <p className="text-sm">{displayUser.name}</p>
                <p className="text-xs text-gray-400">{displayUser.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}