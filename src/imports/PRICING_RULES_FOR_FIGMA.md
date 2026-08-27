# HKIAL Pricing Rules — for Figma handoff

**Source of truth:** EN_Price_List.pdf (client-provided, 2026-06-04)
**Last updated:** 2026-06-04

This document describes the two products, their add-on rates, the
free-allowance rules, and the boundary conditions. All amounts are
HKD. Use it as the spec when building the Figma components for the
booking form, the price preview banner, and the booking detail page.

---

## 1. Products

| Product | Base price | Free allowance | Capacity cap |
|---|---|---|---|
| **Lounge Deluxe** | HKD **5,000** | 1 main flying pax | Max 3 non-flying guests (Note 4) |
| **Premiere Suite** | HKD **18,000** | 1 main flying + 2 accompanying (any type) = 3 free | Max 6 guests total (Note 5) |

Both products include:

- 3 hours standard duration (from / before scheduled time of arrival or departure)
- Meet & Greet
- Check-in, Security, Immigration and Customs Facilitation
- Tarmac Transfer
- Food & Beverages
- Common Resting Area (Lounge Deluxe) / Shower & Resting Facilities (Lounge Deluxe)
- **Private Suite** (Premiere Suite only)
- **In-suite Shower & Resting Facilities** (Premiere Suite only)

---

## 2. Add-on rates

Each product has its own rate card for add-on guests. The free allowance
above is deducted first; the table below shows the charge per *additional*
guest.

| Add-on | Lounge Deluxe | Premiere Suite |
|---|---|---|
| Additional flying guest (3-hour stay) | **N/A** (not offered) | HKD **2,000** per person (4th flying onward) |
| Child under 2 | **FREE** | **FREE** |
| Child 2–11, 1st & 2nd child | HKD **1,000** per child | **FREE** (covered by 3-guest free block) |
| Child 2–11, 3rd child onward | HKD **2,500** per child | HKD **1,000** per child |
| Non-flying guest (3-hour stay) | HKD **1,000** per person (all paid, max 3) | HKD **1,000** per person (4th non-flying onward) |
| Additional hour of stay | HKD **1,000** per person | HKD **3,000** per suite |
| In-town Limousine Transfer | HKD **1,500** per car per trip | HKD **1,500** per car per trip |

---

## 3. Free-allowance model in detail

### Lounge Deluxe

- **1 main flying pax** is included in the base price.
- **No additional flying guest** is offered (the price list shows N/A for
  this add-on). Even if the form lets the user raise the flying-guest
  count, the price will not increase.
- **Non-flying guests** are charged from the first one at HKD 1,000 per
  person. Max 3 non-flying guests per booking (Note 4).
- **Children 2–11**: the 1st and 2nd child are charged at HKD 1,000 each;
  the 3rd child onward is HKD 2,500 each.
- **Children under 2** are always free.

### Premiere Suite

- **3-guest free block**: 1 main flying pax + 2 accompanying of any type
  (flying / non-flying / child 2–11) are included in the base price.
- **Additional flying guest** (4th flying onward) is HKD 2,000 per person.
- **Non-flying guests** up to 3 are covered by the free block; the 4th
  non-flying onward is HKD 1,000 per person.
- **Children 2–11**: 1st and 2nd child are free (covered by the 3-guest
  free block); 3rd child onward is HKD 1,000 per child.
- **Children under 2** are always free.

---

## 4. Boundary rules (caps and warnings)

These three rules come from the client's price list notes. The form should
enforce them; if a user exceeds a cap, the detail page should show a warning.

| # | Rule | Where it applies |
|---|---|---|
| **Note 4** | Lounge Deluxe allows **max 3 non-flying guests** per booking. | Lounge Deluxe only |
| **Note 5** | Premiere Suite allows **max 6 guests total** (flying + non-flying + child 2–11 + child under 2). | Premiere Suite only |
| **Note 7** | Arrival + Departure combo (same passenger, same package type, total stay ≤ 6 hours) — **2nd leg gets 60% off** the computed total. | Either product |

The 2nd-leg combo discount is applied to the *entire* computed total of
the 2nd leg (base + every add-on). It is *not* applied to the 1st leg.

---

## 5. Service-charge / tax / discount rules

There is **no separate service charge, no tax line, and no agency /
membership / promo-code discount handled by the pricing engine.** Those
flows are out of scope for the price engine. The price list in
EN_Price_List.pdf does not mention any of them.

If the partner needs to show a discount in the Figma, it must be a
*separate line item* (e.g. "Promo code: −10%") computed on top of the
backend-computed total — not baked into the rate card.

---

## 6. Worked examples

These three scenarios are useful for laying out the Figma components.
Numbers are computed by the same PricingService that the backend uses,
so the Figma mock data can match these exactly.

### Example A — Premiere Suite, 1 flying + 2 non-flying + 1 child + 1 limo

- 1 main flying pax is covered by the 3-guest free block.
- 2 non-flying guests are covered by the 3-guest free block.
- 1 child 2–11 is covered by the 1st-and-2nd-child-free rule.
- Limo: 1 trip × HKD 1,500.

| Line | Qty | Unit | Subtotal |
|---|---|---|---|
| Premiere Suite — base (3-guest free block) | 1 | 18,000 | 18,000 |
| Limousine | 1 | 1,500 | 1,500 |
| **Total** | | | **HKD 19,500** |

### Example B — Lounge Deluxe, 1 main pax + 2 non-flying + 1 child + 1 limo

- 1 main flying pax is included.
- 2 non-flying guests × HKD 1,000 = 2,000.
- 1 child 2–11 × HKD 1,000 (1st-and-2nd-child rate) = 1,000.
- Limo: 1 trip × HKD 1,500.

| Line | Qty | Unit | Subtotal |
|---|---|---|---|
| Lounge Deluxe — base | 1 | 5,000 | 5,000 |
| Non-flying guest | 2 | 1,000 | 2,000 |
| Child 2–11 (1st and 2nd rate) | 1 | 1,000 | 1,000 |
| Limousine | 1 | 1,500 | 1,500 |
| **Total** | | | **HKD 9,500** |

### Example C — Premiere Suite combo, 2nd leg with 60% off

- 1st leg: Premiere Suite base only, 1 main flying pax → HKD 18,000.
- 2nd leg (same passenger, same package, total stay = 5 hours ≤ 6 hours): 4 flying
  pax (3 free + 1 paid) + 1 child 2–11 (free) → HKD 18,000 + HKD 2,000 = 20,000.
- 2nd leg total × 60% off → HKD 8,000.

| Leg | Subtotal | Discount | Charged |
|---|---|---|---|
| 1st leg | 18,000 | — | 18,000 |
| 2nd leg (combo) | 20,000 | −60% | 8,000 |
| **Total** | | | **HKD 26,000** |

---

## 7. UI display recommendations for Figma

When laying out the Figma components, the **backend-computed price and
breakdown line items** are the source of truth — *not* the free-allowance
or rate card. The form layer should:

1. **Show the running total** as a "Live price" banner while the user
   picks resources and guest counts. The total updates as inputs change.
2. **Show the breakdown** (line items) so the user can see what they
   paid for. Example breakdown shape:
   ```
   Premiere Suite — base ............ HKD 18,000
   Non-flying guest (4th onward) ..... HKD  1,000
   Limousine ....................... HKD  1,500
   ---
   Total ............................ HKD 20,500
   ```
3. **Show warnings** for cap violations (e.g. "Lounge Deluxe allows max 3
   non-flying guests; the 4th is not billable").
4. **Show the applied rules** (e.g. "Note 7 combo discount applied: 60%
   off 2nd leg").

The form should *not* compute prices locally. The rate card above is
for *display and QA* — the live total comes from the backend.

---

## 8. Numbers cheat sheet (for QA)

If the Figma components need a quick-lookup table for QA, here are the
most-asked numbers:

| Question | Answer |
|---|---|
| Lounge Deluxe base | HKD 5,000 |
| Premiere Suite base | HKD 18,000 |
| Lounge Deluxe child 1st–2nd | HKD 1,000 each |
| Lounge Deluxe child 3rd+ | HKD 2,500 each |
| Premiere Suite child 1st–2nd | FREE |
| Premiere Suite child 3rd+ | HKD 1,000 each |
| Non-flying guest (any product) | HKD 1,000 per person |
| Additional flying guest — Premiere Suite | HKD 2,000 (4th flying onward) |
| Additional flying guest — Lounge Deluxe | N/A |
| Additional hour — Lounge Deluxe | HKD 1,000 per person |
| Additional hour — Premiere Suite | HKD 3,000 per suite |
| Limousine (either product) | HKD 1,500 per car per trip |
| Note 4 cap | Lounge Deluxe: max 3 non-flying |
| Note 5 cap | Premiere Suite: max 6 guests total |
| Note 7 combo discount | 2nd leg 60% off if total stay ≤ 6 hours |
