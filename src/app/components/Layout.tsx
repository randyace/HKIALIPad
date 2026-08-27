import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { POSFoodAlert, INITIAL_OVERDUE_COUNT } from './POSFoodAlert';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { Toaster } from 'sonner';

export interface LayoutProps {}

export function Layout({}: LayoutProps = {}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const isPOSPage = location.pathname.startsWith('/pos');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 flex-shrink-0 ${
          isSidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <Sidebar
          currentPath={location.pathname}
          onNavigate={(path) => navigate(path)}
          overdueOrdersCount={INITIAL_OVERDUE_COUNT}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </Button>
          <h1 className="text-gray-900">HKIA VIP Lounge Backend System</h1>
        </div>

        {/* POS Food Alert — pinned below top bar on all /pos pages */}
        {isPOSPage && (
          <POSFoodAlert
            onViewBooking={(bookingNo) => navigate(`/pos/booking/${bookingNo}`)}
          />
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}