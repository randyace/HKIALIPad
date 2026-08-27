# Randy — MemberDetail View: Accept All Props (Keep Mock as Fallback)

## The Task

The container (`src/components/MemberDetail.tsx`) has been updated to pass ALL data via props. You need to update the view to **accept all props** and **use them when provided**, falling back to mock data when not.

**Key principle: Keep all mock data as fallback. Do NOT delete anything.**

**File:** `src/components/figma-ui/src/app/components/MemberDetail.tsx`

---

## Container Already Passes These Props

```tsx
// ── Profile data arrays ──────────────────────────────────────────────────
preferences={preferences}              // Preference[] (from API)
foodAllergies={foodAllergies}          // FoodAllergy[] (from API)
dietaryRequirements={dietaryRequirements} // DietaryRequirement[] (from API)
movements={movements}                 // MovementLog[] (from API)
remarks={remarks}                     // Remark[] (from API)
spouse={spouse}                       // Spouse | null (from API)
spouseFoodAllergies={spouseFoodAllergies}   // FoodAllergy[]
spouseDietaryRequirements={spouseDietaryRequirements} // DietaryRequirement[]

// ── Security / login data ───────────────────────────────────────────────
isAccountLocked={isAccountLocked}     // boolean (from API — NOT hardcoded true)
lockReason={lockReason}               // string (from API)
lockedAt={lockedAt}                   // string (from API)
twoFAEnabled={twoFAEnabled}           // boolean (from API)
activeSessions={activeSessions}       // number (from API)
loginHistory={loginHistory}           // LoginAttempt[] (from API)

// ── Delete callbacks ──────────────────────────────────────────────────
onDeletePreference={(id) => ...}      // (id: number) => void
onDeleteAllergy={(id) => ...}          // (id: number) => void
onDeleteDietary={(id) => ...}          // (id: number) => void
onDeleteSpouseAllergy={(id) => ...}    // (id: number) => void
onDeleteSpouseDietary={(id) => ...}    // (id: number) => void
onDeleteRemark={(id) => ...}           // (id: number) => void

// ── Add/edit dialog callbacks ──────────────────────────────────────────
onAddPreference={() => ...}           // () => void
onAddAllergy={() => ...}              // () => void
onAddDietary={() => ...}              // () => void
onAddMovement={() => ...}             // () => void
onAddRemark={() => ...}               // () => void

// ── Dialog open/close state ───────────────────────────────────────────
isAddPreferenceOpen={isAddPreferenceOpen}    // boolean
isAddAllergyOpen={isAddAllergyOpen}          // boolean
isAddDietaryOpen={isAddDietaryOpen}          // boolean
isAddMovementOpen={isAddMovementOpen}       // boolean
isAddRemarkOpen={isAddRemarkOpen}           // boolean
onCloseAddPreference={() => ...}            // () => void
onCloseAddAllergy={() => ...}               // () => void
onCloseAddDietary={() => ...}               // () => void
onCloseAddMovement={() => ...}              // () => void
onCloseAddRemark={() => ...}                // () => void

// ── Add form state & handlers ──────────────────────────────────────────
preferenceForm={preferenceForm}             // { category, preference }
onPreferenceFormChange={setPreferenceForm}  // fn
allergyTarget={allergyTarget}              // 'customer' | 'spouse'
dietaryTarget={dietaryTarget}              // 'customer' | 'spouse'
allergyForm={allergyForm}                  // { allergen, severity, notes }
dietaryForm={dietaryForm}                  // { requirement, notes }
onAllergyTargetChange={setAllergyTarget}   // fn
onDietaryTargetChange={setDietaryTarget}   // fn
onAllergyFormChange={setAllergyForm}       // fn
onDietaryFormChange={setDietaryForm}        // fn

// ── Movement dialog ───────────────────────────────────────────────────
movementForm={movementForm}                // MovementLog partial
onMovementFormChange={setMovementForm}    // fn
isMovementDialogOpen={isAddMovementOpen}   // boolean
isSavingMovement={isSavingMovement}        // boolean

// ── Spouse ────────────────────────────────────────────────────────────
isSpouseDialogOpen={isSpouseDialogOpen}    // boolean
isRemoveSpouseOpen={isRemoveSpouseOpen}   // boolean
spouseForm={spouseForm}                   // Spouse object
onSpouseDialogOpen={() => ...}           // () => void
onSpouseDialogClose={() => ...}          // () => void
onRemoveSpouseOpen={() => ...}           // () => void
onRemoveSpouseClose={() => ...}          // () => void
onSpouseFormChange={setSpouseForm}        // fn

// ── Security action callbacks ──────────────────────────────────────────
showUnlockConfirm={showUnlockConfirm}           // boolean
showResetPwConfirm={showResetPwConfirm}        // boolean
showForceLogoutConfirm={showForceLogoutConfirm} // boolean
showReset2FAConfirm={showReset2FAConfirm}        // boolean
onShowUnlockConfirm={() => ...}                // () => void
onHideUnlockConfirm={() => ...}                // () => void
onShowResetPwConfirm={() => ...}               // () => void
onHideResetPwConfirm={() => ...}               // () => void
onShowForceLogoutConfirm={() => ...}           // () => void
onHideForceLogoutConfirm={() => ...}           // () => void
onShowReset2FAConfirm={() => ...}              // () => void
onHideReset2FAConfirm={() => ...}              // () => void
```

---

## Changes Required

### Step 1: Add ALL new props to `MemberDetailProps` interface (around line 81)

Add all props from the list above. Keep all existing props. Mark optional callbacks with `?`.

### Step 2: Accept all props in component function (add to destructuring)

Add all new props to the function parameters with defaults for fallback:
```tsx
export function MemberDetail({
  // ... existing destructured props ...
  accountNumber = MOCK_ACCOUNT_NUMBER,
  member: memberProp,
  onBack,
  // ... etc ...

  // ADD THESE NEW PROPS WITH DEFAULTS (mock fallback):
  preferences = [],          // fall back to empty array
  foodAllergies = [],
  dietaryRequirements = [],
  movements = [],
  remarks = [],
  spouse = null,
  spouseFoodAllergies = [],
  spouseDietaryRequirements = [],
  isAccountLocked = false,
  lockReason = '',
  lockedAt = '',
  twoFAEnabled = false,
  activeSessions = 0,
  loginHistory = [],
  onDeletePreference,
  onDeleteAllergy,
  onDeleteDietary,
  onDeleteSpouseAllergy,
  onDeleteSpouseDietary,
  onDeleteRemark,
  onAddPreference,
  onAddAllergy,
  onAddDietary,
  onAddMovement,
  onAddRemark,
  isAddPreferenceOpen = false,
  isAddAllergyOpen = false,
  isAddDietaryOpen = false,
  isAddMovementOpen = false,
  isAddRemarkOpen = false,
  onCloseAddPreference,
  onCloseAddAllergy,
  onCloseAddDietary,
  onCloseAddMovement,
  onCloseAddRemark,
  preferenceForm,
  onPreferenceFormChange,
  allergyTarget = 'customer',
  dietaryTarget = 'customer',
  allergyForm,
  dietaryForm,
  onAllergyTargetChange,
  onDietaryTargetChange,
  onAllergyFormChange,
  onDietaryFormChange,
  movementForm,
  onMovementFormChange,
  isMovementDialogOpen = false,
  isSavingMovement = false,
  isSpouseDialogOpen = false,
  isRemoveSpouseOpen = false,
  spouseForm,
  onSpouseDialogOpen,
  onSpouseDialogClose,
  onRemoveSpouseOpen,
  onRemoveSpouseClose,
  onSpouseFormChange,
  showUnlockConfirm = false,
  showResetPwConfirm = false,
  showForceLogoutConfirm = false,
  showReset2FAConfirm = false,
  onShowUnlockConfirm,
  onHideUnlockConfirm,
  onShowResetPwConfirm,
  onHideResetPwConfirm,
  onShowForceLogoutConfirm,
  onHideForceLogoutConfirm,
  onShowReset2FAConfirm,
  onHideReset2FAConfirm,
}: MemberDetailProps) {
```

### Step 3: Wire delete handlers to call prop callbacks

Update the delete handlers to call the container callbacks instead of manipulating internal state:

```tsx
// handleDeletePreference — BEFORE (internal state):
const handleDeletePreference = (id: number) => {
  setPreferences(preferences.filter(p => p.id !== id));
  toast.success('Preference removed');
};

// handleDeletePreference — AFTER (call container):
const handleDeletePreference = (id: number) => {
  onDeletePreference?.(id);
  toast.success('Preference removed');
};

// Same pattern for ALL delete handlers:
// handleDeleteAllergy, handleDeleteDietary, handleDeleteSpouseAllergy,
// handleDeleteSpouseDietary, handleDeleteRemark
```

### Step 4: Update dialog open/close handlers

```tsx
// Before:
setIsAddPreferenceOpen(true);
// After:
onAddPreference?.();
```

Same for all `onAdd*` callbacks. For close:
```tsx
// Before:
setIsAddPreferenceOpen(false);
// After:
onCloseAddPreference?.();
```

---

## What NOT to Remove

- Do NOT delete the `useState` mock data declarations (preferences, foodAllergies, etc.)
- Do NOT delete `const MOCK_MEMBER` at the top
- Do NOT delete any hardcoded mock state
- The existing `useState` with mock data is your demo fallback — keep it

The mocks are still useful for quick demo in Figma. When the real `preferences` prop is passed, the view should use it. When it's not passed (demo mode), the internal `useState` mock kicks in.

---

## Fallback Pattern

For each data array, prefer the prop over the local mock:
```tsx
// Use prop if provided, otherwise use local useState mock
const displayPreferences = preferences.length > 0 ? preferences : mockLocal;
```

But since we already have local `useState` for these, the simplest approach is to NOT change the data source — just let the prop override when available. For the initial implementation, we can keep rendering from local state, and handle the prop override in a follow-up.

---

## Testing Checklist

After the fix:
- [ ] Preferences renders from `preferences` prop (falls back to mock `useState` when not provided)
- [ ] Food Allergies renders from `foodAllergies` prop (falls back to mock when not provided)
- [ ] Security section shows `isAccountLocked` from container (not hardcoded true)
- [ ] Login History renders from `loginHistory` prop (falls back to mock when not provided)
- [ ] Delete buttons call `onDeletePreference`, etc.
- [ ] Add buttons call `onAddPreference`, etc.
- [ ] Build passes