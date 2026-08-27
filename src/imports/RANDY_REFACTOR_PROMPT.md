

## What "Props-Driven" Means

```tsx
// ✅ GOOD — data comes from props, mock data isolated
export interface BookingListProps {
  bookings?: Booking[];
  isLoading?: boolean;
  onView?: (id: string) => void;
}

const MOCK_BOOKINGS: Booking[] = [/* demo data */];

export function BookingList({ bookings: bp = [], isLoading }: BookingListProps) {
  const bookings = bp.length > 0 ? bp : MOCK_BOOKINGS;
  return <div>{bookings.map(...)}</div>;
}
```

```tsx
// ❌ BAD — hardcoded business data in useState
export function BookingList() {
  const [bookings] = useState([/* hardcoded */]); // WRONG
}
```

**Rules:**
- `useState` OK for pure UI state (search, dialog, selected tab)
- `useState` NOT OK for business data (bookings, users, etc.)
- All business data via props
- Zero API calls in views
- Mock data → `const MOCK_*` at top, fallback: `items.length > 0 ? items : MOCK_ITEMS`

---

## Complete List — 25 Files Need Refactor

### Priority 1 — Has NO interface at all (12 files)

**1. AccountList.tsx**
- Add: `export interface AccountListProps { accounts?: Account[]; isLoading?: boolean; onView?: (id: string) => void; }`
- Change function signature to accept props
- Move mock data to `const MOCK_ACCOUNTS`

**2. AuditLogs.tsx**
- Add: `export interface AuditLog { id, timestamp, user, action, module, details }`
- Add: `export interface AuditLogsProps { audits?: AuditLog[]; isLoading?: boolean; onFilter?: ... }`
- Change function signature to accept props
- Move mock data to `const MOCK_AUDITS`

**3. BookingManagement.tsx**
- Add: `export interface BookingManagementProps { bookings?: Booking[]; isLoading?: boolean; ... }`
- Change function signature to accept props
- Move mock data to `const MOCK_BOOKINGS`

**4. BookingSchedules.tsx**
- Add: `export interface BookingSchedulesProps { schedules?: Schedule[]; isLoading?: boolean; ... }`
- Change function signature to accept props
- Move mock data to `const MOCK_SCHEDULES`

**5. BookingSettings.tsx**
- Add: `export interface BookingSettingsProps { settings?: Settings; isLoading?: boolean; onSave?: ... }`
- Change function signature to accept props

**6. Reports.tsx**
- Add: `export interface ReportsProps { reportData?: ReportData; isLoading?: boolean; ... }`
- Change function signature to accept props

**7. TravelAgency.tsx**
- Add: `export interface TravelAgencyProps { agencies?: Agency[]; isLoading?: boolean; ... }`
- Change function signature to accept props
- Move mock data to `const MOCK_AGENCIES`

**8. MemberCompany.tsx**
- Add: `export interface MemberCompanyProps { companies?: Company[]; isLoading?: boolean; ... }`
- Change function signature to accept props
- Move mock data to `const MOCK_COMPANIES`

**9. POSCheckout.tsx**
- Add: `export interface POSCheckoutProps { order?: Order; onComplete?: ... }`
- Change function signature to accept props

**10. POSFoodAlert.tsx**
- Add: `export interface POSFoodAlertProps { alerts?: Alert[]; isLoading?: boolean; ... }`
- Change function signature to accept props

**11. PromoCodeList.tsx**
- Add: `export interface PromoCodeListProps { codes?: PromoCode[]; isLoading?: boolean; ... }`
- Change function signature to accept props
- Move mock data to `const MOCK_CODES`

**12. QREntryScanner.tsx**
- Add: `export interface QREntryScannerProps { onScan?: (data: string) => void; ... }`
- Change function signature to accept props

---

### Priority 2 — Has interface but NO *Props (4 files)

**13. SupervisingApprovalReview.tsx**
- Already has: `InvoiceLineItem`, `SupervisingBooking` interfaces
- Add: `export interface SupervisingApprovalReviewProps { booking?: SupervisingBooking; isLoading?: boolean; onApprove?: ... }`
- Change function signature to accept props
- Move mock data to `const MOCK_BOOKING`

**14. PromoCodeGeneratedPage.tsx**
- Already has: `GeneratedCodesData` interface
- Add: `export interface PromoCodeGeneratedPageProps { data?: GeneratedCodesData; isLoading?: boolean; ... }`
- Change function signature to accept props

**15. PurchaseCreate.tsx**
- Already has: `GradingPackage` interface
- Add: `export interface PurchaseCreateProps { packages?: GradingPackage[]; onSubmit?: ... }`
- Change function signature to accept props

**16. BookableItems.tsx**
- Already has: `BookableItem` interface
- Add: `export interface BookableItemsProps { items?: BookableItem[]; isLoading?: boolean; onEdit?: ... }`
- Change function signature to accept props

---

### Priority 3 — Minor / Layout files (9 files)

**17. BookableItemEdit.tsx**
- Add: `export interface BookableItemEditProps { item?: BookableItem; onSave?: ... }`
- Change function signature to accept props

**18. BookingReview.tsx**
- Add: `export interface BookingReviewProps { booking?: Booking; isLoading?: boolean; ... }`
- Change function signature to accept props

**19. BookingReviewPage.tsx**
- Add: `export interface BookingReviewPageProps { bookingId?: string; ... }`
- Change function signature to accept props

**20. CorporateProfiles.tsx**
- Add: `export interface CorporateProfilesProps { profiles?: Profile[]; isLoading?: boolean; ... }`
- Change function signature to accept props

**21. Layout.tsx**
- Add: `export interface LayoutProps { children?: ReactNode; }`
- Change function signature to accept props

**22. PromoCodeEdit.tsx**
- Add: `export interface PromoCodeEditProps { code?: PromoCode; onSave?: ... }`
- Change function signature to accept props

**23. PromoCodeUsage.tsx**
- Add: `export interface PromoCodeUsageProps { usage?: UsageRecord[]; ... }`
- Change function signature to accept props

**24. SuiteBookingSchedules.tsx**
- Add: `export interface SuiteBookingSchedulesProps { schedules?: Schedule[]; ... }`
- Change function signature to accept props

**25. TableBookingSchedules.tsx**
- Add: `export interface TableBookingSchedulesProps { schedules?: Schedule[]; ... }`
- Change function signature to accept props

---

## For Each File — Steps

1. Read the file
2. Find the function: `export function {Name}()`
3. Add `export interface {Name}Props { ... }` at the TOP (before function)
4. Change function to: `export function {Name}({ ... }: {Name}Props) {`
5. Find `useState` calls — if they hold business data, remove them and use props instead
6. Find hardcoded mock data — move to `const MOCK_*` at top with fallback pattern
7. Keep `useState` for pure UI (search, dialog, tabs) — these are fine
