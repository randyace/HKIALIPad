import { createBrowserRouter, useNavigate, useParams, useLocation, Navigate } from 'react-router';

import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AccountList } from './components/AccountList';
import { ApplicationReview } from './components/ApplicationReview';
import { AccountCreation } from './components/AccountCreation';
import { MemberCompany } from './components/MemberCompany';
import { CompanyEdit } from './components/CompanyEdit';
import { Reports } from './components/Reports';
import { TravelAgency } from './components/TravelAgency';
import { TravelAgencyDetail } from './components/TravelAgencyDetail';
import { MemberDetail } from './components/MemberDetail';
import { BookingManagement } from './components/BookingManagement';
import { CreateBooking } from './components/CreateBooking';
import { BookingDetail } from './components/BookingDetail';
import { BookingSettings } from './components/BookingSettings';
import { BookingApproval } from './components/BookingApproval';
import { SupervisingApproval } from './components/SupervisingApproval';
import { BookingSchedules } from './components/BookingSchedules';
import { SuiteBookingSchedules } from './components/SuiteBookingSchedules';
import { TableBookingSchedules } from './components/TableBookingSchedules';
import { BookableItems } from './components/BookableItems';
import { BookableItemEdit } from './components/BookableItemEdit';
import { POSFloorPlan } from './components/POSFloorPlan';
import { POSCheckout } from './components/POSCheckout';
import { POSBookingDetail } from './components/POSBookingDetail';
import { KitchenDisplay } from './components/KitchenDisplay';
import { KioskPreview } from './components/KioskPreview';
import { LoungeLayout } from './components/LoungeLayout';
import { SystemUsers } from './components/SystemUsers';
import { AuditLogs } from './components/AuditLogs';
import { PromoCodeList } from './components/PromoCodeList';
import { PromoCodeEdit } from './components/PromoCodeEdit';
import { PromoCodeUsage } from './components/PromoCodeUsage';
import { PromoCodeGeneratedPage, GeneratedCodesData } from './components/PromoCodeGeneratedPage';
import { GradingPackages } from './components/GradingPackages';
import { PurchaseManagement } from './components/PurchaseManagement';
import { BalanceTracker } from './components/BalanceTracker';
import { CorporateReports } from './components/CorporateReports';
import { OpportunityTracking } from './components/OpportunityTracking';
import { RefundReport } from './components/RefundReport';
import { PreOrderPage } from './components/PreOrderPage';
import { POSTransactions } from './components/POSTransactions';
import { PriceManagement } from './components/PriceManagement';
import { PriceManagementEdit } from './components/PriceManagementEdit';
import { mockLoungeDeluxe, mockPremiereSuite, mockComboDiscount } from './components/__fixtures__/PriceManagement.mocks';
import { GuestKiosk } from './components/GuestKiosk';

// ── Fallback for unknown routes ───────────────────────────────────────────────
function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="p-6 text-center">
      <h1 className="text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

// ── Page Wrappers ─────────────────────────────────────────────────────────────

function CustomerListPage() {
  const navigate = useNavigate();
  return (
    <AccountList
      onViewDetail={(accountNo) => navigate(`/customers/detail/${encodeURIComponent(accountNo)}`)}
    />
  );
}

function CustomerDetailPage() {
  const { accountNo } = useParams<{ accountNo: string }>();
  const navigate = useNavigate();
  if (!accountNo) return <Navigate to="/customers" replace />;
  return (
    <MemberDetail
      accountNumber={decodeURIComponent(accountNo)}
      onBack={() => navigate(-1)}
    />
  );
}

function CustomerCompanyPage() {
  const navigate = useNavigate();
  return (
    <MemberCompany
      onEditCompany={(id) => navigate(`/customers/company/edit/${id}`)}
      onCreateCompany={() => navigate('/customers/company/create')}
    />
  );
}

function CompanyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <CompanyEdit
      companyId={id ? parseInt(id) : null}
      onBack={() => navigate('/customers/company')}
    />
  );
}

function CompanyCreatePage() {
  const navigate = useNavigate();
  return <CompanyEdit companyId={null} onBack={() => navigate('/customers/company')} />;
}

function TravelAgencyPage() {
  const navigate = useNavigate();
  return (
    <TravelAgency
      onEditAgency={(id) => navigate(`/travel-agency/edit/${id}`)}
    />
  );
}

function TravelAgencyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <TravelAgencyDetail
      agencyId={id ? parseInt(id) : null}
      onBack={() => navigate('/travel-agency')}
    />
  );
}

function TravelAgencyCreatePage() {
  const navigate = useNavigate();
  return <TravelAgencyDetail agencyId={null} onBack={() => navigate('/travel-agency')} />;
}

function BookingListPage() {
  const navigate = useNavigate();
  return (
    <BookingManagement
      onViewDetail={(id) => navigate(`/bookings/detail/${id}`)}
    />
  );
}

function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/bookings" replace />;
  return (
    <BookingDetail
      bookingId={parseInt(id)}
      onBack={() => navigate(-1)}
    />
  );
}

function BookingSettingsPage() {
  const navigate = useNavigate();
  return <BookingSettings onBack={() => navigate('/bookings')} />;
}

function BookingApprovalPage() {
  const navigate = useNavigate();
  return (
    <BookingApproval
      onViewDetail={(id) => navigate(`/bookings/detail/${id}`)}
    />
  );
}

function SupervisingApprovalPage() {
  const navigate = useNavigate();
  return (
    <SupervisingApproval
      onViewDetail={(id) => navigate(`/bookings/detail/${id}`)}
    />
  );
}

function BookingSchedulesPage() {
  const navigate = useNavigate();
  return (
    <BookingSchedules
      onViewDetail={(id) => navigate(`/bookings/detail/${id}`)}
      onPreOrder={(booking) =>
        navigate('/bookings/pre-order', {
          state: { booking, originUrl: '/bookings/schedules' },
        })
      }
    />
  );
}

function SuiteBookingSchedulesPage() {
  const navigate = useNavigate();
  return (
    <SuiteBookingSchedules
      onViewDetail={(id) => navigate(`/bookings/detail/${id}`)}
      onPreOrder={(booking) =>
        navigate('/bookings/pre-order', {
          state: { booking, originUrl: '/suites' },
        })
      }
    />
  );
}

function TableBookingSchedulesPage() {
  const navigate = useNavigate();
  return (
    <TableBookingSchedules
      onViewDetail={(id) => navigate(`/bookings/detail/${id}`)}
      onPreOrder={(booking) =>
        navigate('/bookings/pre-order', {
          state: { booking, originUrl: '/bookings/schedules' },
        })
      }
    />
  );
}

function PreOrderRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const originUrl: string = location.state?.originUrl || '/bookings/schedules';
  if (!booking) return <Navigate to={originUrl} replace />;
  return (
    <PreOrderPage
      booking={booking}
      onBack={() => navigate(originUrl)}
      onSaved={() => navigate(originUrl)}
    />
  );
}

function BookableItemsPage() {
  const navigate = useNavigate();
  return (
    <BookableItems
      onEditItem={(id) => navigate(`/items/edit/${id}`)}
      onCreateItem={() => navigate('/items/create')}
    />
  );
}

function BookableItemEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <BookableItemEdit
      itemId={id ? parseInt(id) : null}
      onBack={() => navigate('/items')}
    />
  );
}

function BookableItemCreatePage() {
  const navigate = useNavigate();
  return <BookableItemEdit itemId={null} onBack={() => navigate('/items')} />;
}

function POSFloorPlanPage() {
  const navigate = useNavigate();
  return (
    <POSFloorPlan
      onViewBookingDetail={(bookingNo) => navigate(`/pos/booking/${encodeURIComponent(bookingNo)}`)}
      onCheckout={(bookingNo) => navigate(`/pos/checkout/${encodeURIComponent(bookingNo)}`)}
    />
  );
}

function POSBookingDetailPage() {
  const { bookingNo } = useParams<{ bookingNo: string }>();
  const navigate = useNavigate();
  if (!bookingNo) return <Navigate to="/pos" replace />;
  return (
    <POSBookingDetail
      bookingNo={decodeURIComponent(bookingNo)}
      onBack={() => navigate('/pos')}
    />
  );
}

function POSCheckoutPage() {
  const { bookingNo } = useParams<{ bookingNo: string }>();
  const navigate = useNavigate();
  if (!bookingNo) return <Navigate to="/pos" replace />;
  return (
    <POSCheckout
      bookingNo={decodeURIComponent(bookingNo)}
      onBack={() => navigate('/pos')}
    />
  );
}

function PromoCodeListPage() {
  const navigate = useNavigate();
  return (
    <PromoCodeList
      onEditPromoCode={(id) => navigate(`/promo-codes/edit/${id}`)}
      onCreatePromoCode={() => navigate('/promo-codes/create')}
    />
  );
}

function PromoCodeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <PromoCodeEdit
      promoCodeId={id ? parseInt(id) : null}
      onBack={() => navigate('/promo-codes')}
      onNavigateToCodesPage={(data: GeneratedCodesData) =>
        navigate('/promo-codes/generated', { state: { data } })
      }
    />
  );
}

function PromoCodeCreatePage() {
  const navigate = useNavigate();
  return (
    <PromoCodeEdit
      promoCodeId={null}
      onBack={() => navigate('/promo-codes')}
      onNavigateToCodesPage={(data: GeneratedCodesData) =>
        navigate('/promo-codes/generated', { state: { data } })
      }
    />
  );
}

function PromoCodeGeneratedRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data as GeneratedCodesData | undefined;
  if (!data) return <Navigate to="/promo-codes" replace />;
  return (
    <PromoCodeGeneratedPage
      data={data}
      onBack={() => navigate('/promo-codes')}
    />
  );
}

function CustomerCreatePage() {
  return <AccountCreation type="individual" />;
}

// ── Price Management ──────────────────────────────────────────────────────────

function PriceManagementPage() {
  const navigate = useNavigate();
  return (
    <PriceManagement
      onEditProduct={(productId) => navigate(`/price-management/edit/${productId}`)}
      onEditComboDiscount={() => navigate('/price-management/edit/combo')}
    />
  );
}

function PriceManagementEditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  if (productId === 'lounge-deluxe') {
    return (
      <PriceManagementEdit
        mode="product"
        product={mockLoungeDeluxe}
        onBack={() => navigate('/price-management')}
        onSave={(updated) => {
          console.log('save lounge', updated);
          navigate('/price-management');
        }}
      />
    );
  }
  if (productId === 'premiere-suite') {
    return (
      <PriceManagementEdit
        mode="product"
        product={mockPremiereSuite}
        onBack={() => navigate('/price-management')}
        onSave={(updated) => {
          console.log('save suite', updated);
          navigate('/price-management');
        }}
      />
    );
  }
  if (productId === 'combo') {
    return (
      <PriceManagementEdit
        mode="combo"
        comboDiscount={mockComboDiscount}
        onBack={() => navigate('/price-management')}
        onSave={(updated) => {
          console.log('save combo', updated);
          navigate('/price-management');
        }}
      />
    );
  }
  return <Navigate to="/price-management" replace />;
}

// ── Router ────────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  { path: '/kiosk', Component: GuestKiosk },
  {
    path: '/',
    Component: Layout,
    children: [
      // Default redirect to /dashboard
      { index: true, element: <Navigate to="/kiosk" replace /> },

      // Dashboard
      { path: 'dashboard', Component: Dashboard },

      // Customers
      { path: 'customers',                    Component: CustomerListPage },
      { path: 'customers/approve',            Component: ApplicationReview },
      { path: 'customers/create',             Component: CustomerCreatePage },
      { path: 'customers/detail/:accountNo',  Component: CustomerDetailPage },
      { path: 'customers/company',            Component: CustomerCompanyPage },
      { path: 'customers/company/create',     Component: CompanyCreatePage },
      { path: 'customers/company/edit/:id',   Component: CompanyEditPage },

      // Travel Agency
      { path: 'travel-agency',          Component: TravelAgencyPage },
      { path: 'travel-agency/create',   Component: TravelAgencyCreatePage },
      { path: 'travel-agency/edit/:id', Component: TravelAgencyEditPage },

      // Grading Packages
      { path: 'grading-packages', Component: GradingPackages },

      // Membership / Contracts
      { path: 'membership/purchase', Component: PurchaseManagement },
      { path: 'membership/balance',  Component: BalanceTracker },

      // Bookings
      { path: 'bookings',                      Component: BookingListPage },
      { path: 'bookings/approve',              Component: BookingApprovalPage },
      { path: 'bookings/supervising-approval', Component: SupervisingApprovalPage },
      { path: 'bookings/create',               Component: CreateBooking },
      { path: 'bookings/detail/:id',           Component: BookingDetailPage },
      { path: 'bookings/settings',             Component: BookingSettingsPage },
      { path: 'bookings/pre-order',            Component: PreOrderRoute },
      { path: 'bookings/schedules',            Component: BookingSchedulesPage },

      // Suites (suite booking schedules — top-level canonical route)
      { path: 'suites', Component: SuiteBookingSchedulesPage },

      // Bookable Items
      { path: 'items',          Component: BookableItemsPage },
      { path: 'items/create',   Component: BookableItemCreatePage },
      { path: 'items/edit/:id', Component: BookableItemEditPage },

      // POS
      { path: 'pos',                     Component: POSFloorPlanPage },
      { path: 'pos/transactions',        Component: POSTransactions },
      { path: 'pos/booking/:bookingNo',  Component: POSBookingDetailPage },
      { path: 'pos/checkout/:bookingNo', Component: POSCheckoutPage },
      { path: 'pos/kitchen',             Component: KitchenDisplay },
      { path: 'pos/kiosk-preview',       Component: KioskPreview },

      // Lounge
      { path: 'lounge-layout', Component: LoungeLayout },

      // Promo Codes
      { path: 'promo-codes',           Component: PromoCodeListPage },
      { path: 'promo-codes/create',    Component: PromoCodeCreatePage },
      { path: 'promo-codes/edit/:id',  Component: PromoCodeEditPage },
      { path: 'promo-codes/usage',     Component: PromoCodeUsage },
      { path: 'promo-codes/generated', Component: PromoCodeGeneratedRoute },

      // Reports & Analytics
      { path: 'reports/corporate', Component: CorporateReports },
      { path: 'reports/refund',    Component: RefundReport },
      { path: 'reports',           Component: Reports },

      // Price Management
      { path: 'price-management',                Component: PriceManagementPage },
      { path: 'price-management/edit/:productId', Component: PriceManagementEditProductPage },

      // System Users & Audit Logs
      { path: 'system-users', Component: SystemUsers },
      { path: 'audit-logs',   Component: AuditLogs },

      // CRM
      { path: 'crm/opportunities', Component: OpportunityTracking },

      // Table schedules (internal, not in sidebar)
      { path: 'bookings/schedules/table', Component: TableBookingSchedulesPage },

      // 404
      { path: '*', Component: NotFound },
    ],
  },
]);
