# Figma UI — Create Booking Price Breakdown Refactor Spec

---

## What the parent repo does today (do NOT change in figma-ui)

The parent `CreateBooking.tsx` (the one NOT in `figma-ui/`) already wires the backend live preview:

```ts
const pricePreview = usePricePreview({
  assignedSuiteIds, assignedLoungeIds,
  numberOfGuests: vipPS + vipLD,
  nonFlyingGuests: nonFlyingPS + nonFlyingLD,
  hasLimousine,
});
```

The parent renders a fixed bottom-right banner with `pricePreview.total` + `pricePreview.warnings` + `pricePreview.rulesApplied`. That banner IS the backend-authoritative total. The mismatch the user reports is the **Price Breakdown card inside the figma-ui view** — it still computes client-side using legacy constants and shows a different number.

---

## What the figma-ui Price Breakdown card must do

The figma-ui view does not (and should not) call the backend — the parent passes the backend's `breakdown` data down through props. **The card must render the backend's `breakdown` data when available, and fall back to nothing (not legacy math) when not.**

### Required props the parent will pass down (the card must accept these)

The parent will pass these additional props into the view through `viewProps`. The card must read them and use them as the source of truth:

| Prop | Type | When to render | Source |
|---|---|---|---|
| `liveBreakdown` | `Array<{ key: string; label: string; qty: number; unit_price: number; subtotal: number }>` | always, when length > 0 | backend `PricingService::compute()` |
| `liveTotal` | `number` | always, when not `null` | backend `PricingService::compute()` |
| `liveRulesApplied` | `string[]` | when length > 0 | backend warnings (`rules_applied` from the response) |
| `liveWarnings` | `string[]` | when length > 0 | backend warnings |

When `liveBreakdown` is empty / `liveTotal` is `null` (the user has not picked a resource yet, or the preview endpoint returned 422), the card must **not render at all** — do NOT fall back to the legacy `suiteCharge / nfCharge / subtotal` math.

### What the card must do for each line in `liveBreakdown`

For each item in `liveBreakdown`, render one row:

```tsx
<div className="flex justify-between py-1.5 border-b border-gray-100">
  <span className="text-gray-600">
    {item.label}{item.qty > 1 ? ` × ${item.qty}` : ''}
  </span>
  <span>HK${item.subtotal.toLocaleString()}</span>
</div>
```

The backend's `breakdown` array is **already in the order the user should see** (base, then flying-guest add-on, child tier 1, child tier 2, non-flying, additional hours, limo — per `PricingResult::toArray()` docblock). Do NOT re-sort. Do NOT add a unit-price column (the label and qty already carry the price info).

### What the card must do for the Subtotal / Total row

The backend's `breakdown` subtotals **sum to the backend's pre-discount `original_amount`**. The backend's `total_price` is what the booking will actually charge. The card must render:

```tsx
{/* Subtotal (sum of breakdown subtotals) — only if non-zero */}
{liveTotal !== null && (
  <div className="flex justify-between py-2 border-t border-gray-200">
    <span className="text-gray-700">Total</span>
    <span>HK${liveTotal.toLocaleString()}</span>
  </div>
)}
```

There is **no** separate "After Discount" / "Service Charge" / "Total Payable" row. The backend's `total_price` is final — there is no service charge or after-discount adjustment in `PricingService`. If you keep those rows from the legacy design, the user will see a number that doesn't match the backend's banner.

### What the card must do for `liveRulesApplied`

If `liveRulesApplied` is non-empty, render a small green-tinted list at the bottom of the card:

```tsx
{liveRulesApplied.length > 0 && (
  <ul className="mt-2 text-xs text-emerald-700 space-y-1">
    {liveRulesApplied.map((r, i) => <li key={i}>• {r}</li>)}
  </ul>
)}
```

Example rule: "Note 7 combo discount applied: 60% off 2nd leg (total stay 4h ≤ 6h)."

### What the card must do for `liveWarnings`

If `liveWarnings` is non-empty, render a small amber-tinted list at the bottom of the card:

```tsx
{liveWarnings.length > 0 && (
  <ul className="mt-2 text-xs text-amber-700 space-y-1">
    {liveWarnings.map((w, i) => <li key={i}>• {w}</li>)}
  </ul>
)}
```

Example warning: "Lounge Deluxe caps non-flying guests at 3 per booking (Note 4). 1 non-flying guest(s) above the cap will not be billed under this price list."

### What the card must NOT do

- The card must NOT import or use any of the legacy constants `ENTRY_FEE_RATE`, `NON_FLYING_RATE`, `LIMO_RATE`, `SHOPPING_RATE`, `SECURITY_RATE`, `SERVICE_CHARGE_RATE`, `SUITE_RATES`. These are the legacy rate table and the user has explicitly asked to fit the price module. If you see these constants referenced inside the new card, remove them.
- The card must NOT compute `subtotal`, `afterDiscount`, `serviceCharge`, `totalPayable` from client-side math. All those are legacy.
- The card must NOT show "Agency Discount" / "Membership Discount" / "Promo Code" badges unless those are still being applied by the parent. The parent's promo + agency + membership discount logic is still in place (it lives in `handleSubmit`'s payload), but the Price Breakdown card itself only shows the backend's authoritative breakdown — the legacy discount badges inside the card are misleading because they show pre-discount math.
- The card must NOT show `ENTRY_FEE_RATE` × flyingGuests (the legacy "Entry Fee × N flying guests" line).

---

## The backend rule set the card is displaying (for context — do not duplicate this logic in the view)

The backend `App\Services\Pricing\PricingService` (Laravel, see `hkial-api/app/Services/Pricing/PricingService.php`) implements:

| Rule | Lounge Deluxe | Premiere Suite |
|---|---|---|
| Base price | HKD 5,000 (1 main flying pax included) | HKD 18,000 (3 free: 1 flying + 2 non-flying) |
| Additional flying guest | not offered (warning emitted) | HKD 2,000/pax (charged from 4th flying onward) |
| Non-flying guest | HKD 1,000/pax (max 3) | HKD 1,000/pax |
| Child age 2–11 (1st, 2nd) | HKD 1,000 each | free (covered by 3-guest free block) |
| Child age 2–11 (3rd onward) | HKD 2,500 each | HKD 1,000 each |
| Child under 2 | free | free |
| Additional hour | HKD 1,000/person | HKD 3,000/suite |
| Limousine transfer | HKD 1,500/car/trip | HKD 1,500/car/trip |
| Note 5 cap | (not applicable) | max 6 guests total per booking |
| Note 7 combo discount | 60% off 2nd leg (when total stay ≤ 6 h) | same |

The backend returns this as a `breakdown` array of line items + a `total_price` (already Note-7-discounted if applicable) + a `rules_applied` array + a `warnings` array. The card just renders whatever the backend sends.

---

## Concrete code change to make in figma-ui

Find this block (currently around line 1551–1637 of `app/components/CreateBooking.tsx`):

```tsx
{/* ════════════════════════════════════════
    10. PRICE BREAKDOWN
    ════════════════════════════════════════ */}
{showPriceBreakdown && (
  <Card className={...}>
    ...
    <h2>Price Breakdown</h2>
    {agencyDiscount > 0 && <Badge ...>Agency Discount</Badge>}
    {memDiscount > 0 && <Badge ...>{membershipTier} Discount</Badge>}
    {promoDiscount > 0 && <Badge ...>{promoApplied?.code}</Badge>}
    ...
    {suiteCharge > 0 && (... <span>Entry Fee × {flyingGuests} flying guest...</span> ...)}
    {nfCharge > 0 && (...)}
    {limoCharge > 0 && (...)}
    {shopCharge > 0 && (...)}
    {secCharge > 0 && (...)}
    <span>Subtotal</span> <span>HK${subtotal.toLocaleString()}</span>
    {agencyDiscount > 0 && (... Agency Discount ...)}
    {memDiscount > 0 && (... Membership Discount ...)}
    {promoDiscount > 0 && (... Promo: {code} ...)}
    <span>After Discount</span> <span>HK${afterDiscount.toLocaleString()}</span>
    <span>Service Charge (10%)</span> <span>+HK${serviceCharge.toLocaleString()}</span>
    <span>Total Payable</span> <span>HK${totalPayable.toLocaleString()}</span>
  </Card>
)}
```

Replace it with (read the new props `liveBreakdown`, `liveTotal`, `liveRulesApplied`, `liveWarnings` from the parent):

```tsx
{/* ════════════════════════════════════════
    10. PRICE BREAKDOWN (backend-live)
    ════════════════════════════════════════ */}
{liveBreakdown.length > 0 && liveTotal !== null && (
  <Card className="p-6">
    <div className="flex items-center gap-3 mb-5">
      <h2>Price Breakdown</h2>
      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs">
        Live · backend PricingService
      </Badge>
    </div>
    <div className="space-y-2 text-sm max-w-md ml-auto">
      {liveBreakdown.map((item, i) => (
        <div key={i} className="flex justify-between py-1.5 border-b border-gray-100">
          <span className="text-gray-600">
            {item.label}{item.qty > 1 ? ` × ${item.qty}` : ''}
          </span>
          <span>HK${item.subtotal.toLocaleString()}</span>
        </div>
      ))}
      <div className="flex justify-between py-2 border-t border-gray-200">
        <span className="font-semibold text-gray-900">Total</span>
        <span className="text-xl font-bold text-[#0f2942]">HK${liveTotal.toLocaleString()}</span>
      </div>
      {liveRulesApplied.length > 0 && (
        <ul className="mt-2 text-xs text-emerald-700 space-y-1">
          {liveRulesApplied.map((r, i) => <li key={i}>• {r}</li>)}
        </ul>
      )}
      {liveWarnings.length > 0 && (
        <ul className="mt-2 text-xs text-amber-700 space-y-1">
          {liveWarnings.map((w, i) => <li key={i}>• {w}</li>)}
        </ul>
      )}
    </div>
  </Card>
)}
```

Also remove the local compute block (currently around line 393–412) that derives `suiteCharge`, `nfCharge`, `limoCharge`, `shopCharge`, `secCharge`, `subtotal`, `agencyDiscount`, `memDiscount`, `promoDiscount`, `afterDiscount`, `serviceCharge`, `totalPayable`, `showPriceBreakdown`. None of these are needed anymore. The card no longer uses them, and the parent's `handleSubmit` builds the discount info into the booking payload separately.

Also remove the constant declarations at the top of the file (around line 46–52):

```ts
const ENTRY_FEE_RATE = 1800;
const NON_FLYING_RATE  = 500;
const LIMO_RATE        = 1500;
const SHOPPING_RATE    = 400;
const SECURITY_RATE    = 1200;
const SERVICE_CHARGE_RATE = 0.10;
```

And the type imports for `MEMBERSHIP_DISCOUNT` if they were only used in the discount logic.

---

## What the parent will do after the view is updated

The parent `CreateBooking.tsx` will then add four new props to `viewProps` (the call site is around line 837–928):

```ts
const viewProps = {
  // ... existing props ...
  liveBreakdown: pricePreview.breakdown,
  liveTotal: pricePreview.total,
  liveRulesApplied: pricePreview.rulesApplied,
  liveWarnings: pricePreview.warnings,
};
```

And the parent will add the four missing fields to the `usePricePreview` call (currently around line 932) so the backend gets the full input:

```ts
const pricePreview = usePricePreview({
  assignedSuiteIds: assignedSuiteIds,
  assignedLoungeIds: assignedLoungeIds,
  numberOfGuests: vipPS + vipLD,
  nonFlyingGuests: nonFlyingPS + nonFlyingLD,
  hasLimousine: hasLimousine,
  childrenUnder2: 0,           // admin form has no UI for this yet
  childrenAge2To11: 0,         // admin form has no UI for this yet
  additionalHours: 0,          // admin form has no UI for this yet
  limousineTrips: 1,           // 1 trip when hasLimousine is checked
});
```

(These are the four fields the parent is currently NOT sending. They are 0 / 1 by default until admin UI adds the form controls; backend will treat 0 as "no extra fee". The `combo` field is not sent by the admin form because the admin UI has no combo continuation toggle — backend will treat missing `combo` as "no discount".)

---

## Acceptance check

The refactor is correct when:

1. The Price Breakdown card does **not** render before the user has picked at least one resource (suite or lounge). The legacy `showPriceBreakdown = flyingGuests > 0` check is gone; the new check is `liveBreakdown.length > 0 && liveTotal !== null`, which is true only after the backend has returned a preview.
2. The card's line items come from `liveBreakdown` (not from `suiteCharge / nfCharge / limoCharge`).
3. The card's total is `liveTotal` (not `subtotal / afterDiscount / serviceCharge / totalPayable`).
4. The card shows the backend's `liveRulesApplied` and `liveWarnings` lists when present.
5. The constants `ENTRY_FEE_RATE`, `NON_FLYING_RATE`, `LIMO_RATE`, `SHOPPING_RATE`, `SECURITY_RATE`, `SERVICE_CHARGE_RATE` are not referenced anywhere in the file after the refactor.
6. The user sees the same number in the bottom-right "Live Price" banner as in the Price Breakdown card's Total row.

If any of those is false, the refactor is not done.

---

## What you do NOT need to do

- Do not add a "Service Charge" row — the backend's `total_price` is final, no service charge.
- Do not add a "Pre-discount / Strike-through" row — the backend's `original_amount` is on the booking row, not in the preview response. (We could add it later, but it would require the backend to add `original_amount` to the preview response — out of scope for this refactor.)
- Do not touch the parent's `CreateBooking.tsx` (outside `figma-ui/`). The parent will be updated separately by the agent after the figma-ui view is refactored.
- Do not touch any other view in `figma-ui/`. Only `CreateBooking.tsx` in this refactor.

---

## Reference docs (for the figma Make AI to read in full if needed)

- `PRICING_RULES_FOR_FIGMA.md` at the repo root — the same rule set in figma Make's preferred format
- `FIGMA_UI_BOUNDARY.md` at the repo root — the boundary rules for what lives in figma-ui vs the parent repo
- `hkial-api/references/live-price-preview-test-matrix.md` — the audit + invariants for the live preview endpoint (the wire shape you're consuming)
- `hkial-api/references/booking-pricing-apply-rules-test-matrix.md` — the audit + invariants for the `applyPricing` (post-commit) pipeline that mirrors the preview
