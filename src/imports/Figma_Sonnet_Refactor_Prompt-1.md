# Prompt for Figma Sonnet — UI Refactor

## 目標

把所有 view 檔案（`src/components/figma-ui/src/app/components/*.tsx`）改為 **well-structured UI components with isolated mock data**.

每一個 view 只能有：
- ✅ JSX 結構
- ✅ Tailwind classes（視覺樣式）
- ✅ Props interfaces（清楚定義每個 prop 的 type）
- ✅ 純 UI 邏輯（如 hover、active state）
- ✅ Mock data（**但必須隔離，方便我哋日後替換**）

**唔可以有：**
- ❌ `useLocation`、`useNavigate` 等 routing hooks
- ❌ API calls 或 fetch
- ❌ Hardcoded paths（如 `'/customers'`）

**Mock data 可以保留**，但必須：
- 放在獨立 `const MOCK_*` 常量
- 唔好 hardcode 在 component 內部
- 方便我哋 container 層日後用 props 完全替換

---

## 重要原則

> **保留 mock data 是可以的**，但要確保佢係隔離的、可替換的。
> Demo 需要睇到靚仔嘅 output，但唔需要郁到 mock data 嘅位置 —
> 只要 props interface 係清楚定義，我哋喺 container 層可以自行替換。

---

## 通用 Template

```tsx
// Structure: imports → mock constants → interfaces → component

// ── Mock data (isolated, can be removed/replaced later) ──────────────────
const MOCK_ITEMS: Item[] = [...];

// ── Props interfaces (contract with parent container) ───────────────────
interface MyViewProps {
  items: Item[];           // If parent passes empty, view uses MOCK_ITEMS
  onAction: (id: string) => void;
  isLoading?: boolean;
}

// ── Component (pure UI) ─────────────────────────────────────────────────
export function MyView({ items, onAction, isLoading }: MyViewProps) {
  const displayItems = items.length > 0 ? items : MOCK_ITEMS;
  // Pure UI — render displayItems, call onAction, show isLoading
  // No useState for data, no useLocation, no hardcoded paths
}
```

---

## 每個檔案的具體要求

### 1. AccountCreation.tsx
```tsx
const MOCK_COMPANIES = [{ id: '1', name: 'Demo Corp', ... }];

interface AccountCreationProps {
  type?: 'individual' | 'corporate' | 'travel-agency';
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  // form field values + onChange handlers from parent
  // If parent passes empty arrays, view falls back to mock
}
```

### 2. ApplicationReview.tsx
```tsx
const MOCK_APPLICATIONS = [...];  // Well-isolated

interface ApplicationReviewProps {
  applications: Application[];  // Pass MOCK_APPLICATIONS for demo
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewDetail: (id: number) => void;
  isLoading?: boolean;
}
```

### 3. BookingApproval.tsx
```tsx
const MOCK_BOOKINGS = [...];

interface BookingApprovalProps {
  bookings: Booking[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isLoading?: boolean;
}
```

### 4. BookingDetail.tsx
```tsx
const MOCK_BOOKING = {...};

interface BookingDetailProps {
  booking: Booking | null;  // null = show MOCK_BOOKING for demo
  onEdit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

### 5. CompanyEdit.tsx
```tsx
const MOCK_COMPANY = {...};

interface CompanyEditProps {
  companyId?: string;
  initialData?: Company | null;  // null = show MOCK_COMPANY for demo
  onSave: (data: CompanyFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}
```

### 6. CreateBooking.tsx
```tsx
const MOCK_GUESTS = [...];
const MOCK_ROOMS = [...];

interface CreateBookingProps {
  onSubmit: (data: BookingFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  // Parent passes form values + handlers
  // If not passed, show demo UI with mock data in background
}
```

### 7. KitchenDisplay.tsx
```tsx
const MOCK_ORDERS = [...];

interface KitchenDisplayProps {
  orders: KitchenOrder[];  // Pass MOCK_ORDERS for demo
  onComplete: (orderId: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}
```

### 8. MemberDetail.tsx
```tsx
const MOCK_MEMBER = {...};

interface MemberDetailProps {
  member: Member | null;  // null = show MOCK_MEMBER for demo
  onEdit: () => void;
  onUpgrade: (packageId: string) => void;
  isLoading?: boolean;
}
```

### 9. POSBookingDetail.tsx
```tsx
const MOCK_BOOKING_DETAIL = {...};

interface POSBookingDetailProps {
  booking: POSBooking | null;  // null = demo mode
  onCheckout: (paymentData: PaymentData) => void;
  onAddItem: (item: Item) => void;
  onRemoveItem: (itemId: string) => void;
  isLoading?: boolean;
}
```

### 10. POSFloorPlan.tsx
```tsx
const MOCK_TABLES = [...];

interface POSFloorPlanProps {
  tables: Table[];  // Pass MOCK_TABLES for demo
  onTableSelect: (tableId: string) => void;
  onTableStatusChange: (tableId: string, status: string) => void;
  isLoading?: boolean;
}
```

### 11. PreOrderPage.tsx
```tsx
const MOCK_MENU_ITEMS = [...];

interface PreOrderPageProps {
  items: MenuItem[];  // Pass MOCK_MENU_ITEMS for demo
  onAddToCart: (item: CartItem) => void;
  onCheckout: () => void;
  cartItems: CartItem[];
  isLoading?: boolean;
}
```

### 12. PurchaseManagement.tsx
```tsx
const MOCK_PURCHASES = [...];

interface PurchaseManagementProps {
  purchases: Purchase[];
  onViewDetail: (id: string) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

### 13. RefundReport.tsx
```tsx
const MOCK_REFUNDS = [...];

interface RefundReportProps {
  refunds: Refund[];
  onViewDetail: (id: string) => void;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

### 14. SupervisingApproval.tsx
```tsx
const MOCK_BOOKINGS = [...];

interface SupervisingApprovalProps {
  bookings: Booking[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onEscalate: (id: number) => void;
  isLoading?: boolean;
}
```

### 15. TravelAgencyDetail.tsx
```tsx
const MOCK_AGENCY = {...};

interface TravelAgencyDetailProps {
  agency: TravelAgency | null;  // null = show MOCK_AGENCY for demo
  onEdit: () => void;
  onAddContact: (contact: Contact) => void;
  isLoading?: boolean;
}
```

### 16. BalanceTracker.tsx
```tsx
const MOCK_CONTRACTS = [...];

interface BalanceTrackerProps {
  contracts: Contract[];
  onViewContract: (id: string) => void;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

### 17. OpportunityTracking.tsx
```tsx
const MOCK_OPPORTUNITIES = [...];

interface OpportunityTrackingProps {
  opportunities: Opportunity[];
  onUpdateStatus: (id: string, status: string) => void;
  isLoading?: boolean;
}
```

### 18. CorporateReports.tsx
```tsx
const MOCK_REPORT_DATA = [...];

interface CorporateReportsProps {
  reportData: ReportData[];
  onGenerateReport: (type: string) => void;
  isLoading?: boolean;
}
```

---

## 19. Sidebar.tsx — Special Case（最重要）

```tsx
// REMOVE:
const ITEM_URL: Record<string, string> = {...};  // ALL routes
useState, useLocation, useNavigate

// ADD props:
interface SidebarProps {
  overdueOrdersCount?: number;
  currentPath: string;        // Parent decides highlight
  user?: { name: string; role: string; avatar?: string };
  onLogout: () => void;
  menuItems: SidebarMenuItem[];  // Full menu structure from parent
}

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  submenu?: { id: string; label: string; path: string }[];
}

// Replace `figma:asset/logo.png` with normal import or prop
// Parent container handles ALL navigation logic

// IMPORTANT: Sidebar does NOT know which path is active.
// Parent passes currentPath. Sidebar only renders visual active state.
```

**Bug fix**: For highlight, do NOT use `startsWith` — use exact match `item.path === currentPath`.

---

## 20. 新做的 Views

### BookingApprovalQueueView.tsx
```tsx
const MOCK_QUEUE_BOOKINGS = [...];

export interface BookingApprovalQueueProps {
  bookings: Booking[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewDetail: (id: number) => void;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BookingApprovalQueue({ bookings, ... }: BookingApprovalQueueProps) {
  const displayBookings = bookings.length > 0 ? bookings : MOCK_QUEUE_BOOKINGS;
  // Pure UI
}
```

### BookingEditView.tsx
```tsx
const MOCK_BOOKING_FORM = {...};

export interface BookingEditProps {
  bookingId?: string;
  initialData?: Booking | null;
  onSave: (data: BookingFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  // form field props with onChange handlers from parent
}

export function BookingEdit({ bookingId, initialData, onSave, onCancel, isSubmitting, ...formProps }: BookingEditProps) {
  // Pure UI
}
```

---

## 總結清單

**需要 refactor（19個）:**
1. AccountCreation.tsx
2. ApplicationReview.tsx
3. BookingApproval.tsx
4. BookingDetail.tsx
5. CompanyEdit.tsx
6. CreateBooking.tsx
7. KitchenDisplay.tsx
8. MemberDetail.tsx
9. POSBookingDetail.tsx
10. POSFloorPlan.tsx
11. PreOrderPage.tsx
12. PurchaseManagement.tsx
13. RefundReport.tsx
14. SupervisingApproval.tsx
15. TravelAgencyDetail.tsx
16. BalanceTracker.tsx
17. OpportunityTracking.tsx
18. CorporateReports.tsx
19. Sidebar.tsx（special）

**需要新建（2個）:**
20. BookingApprovalQueueView.tsx
21. BookingEditView.tsx

---

## 完成之後

1. Push to `https://github.com/randyace/Hkialbackend183.git`
2. We pull via `git submodule update --remote`
3. Containers pass real API data → views render live data
4. Demo mode: containers pass empty arrays → views fallback to MOCK_*