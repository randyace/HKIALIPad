/**
 * PriceManagementEdit.tsx — Pure presentational component.
 *
 * Handles two editing modes via the `mode` prop:
 *   "product" — edit base price + add-on rates for Lounge Deluxe or Premiere Suite
 *   "combo"   — edit the Note 7 combo discount rule
 *
 * Rules:
 *  - Zero routing hooks — back/save communicated via typed callbacks
 *  - All mutations reported via onSave callback
 *  - Local draft state is pure UI state — allowed
 *  - Default props fall back to mock fixture
 */

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  ArrowLeft,
  Save,
  DollarSign,
  Tag,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ProductPricing, AddOnRate, ComboDiscount } from './PriceManagement';
import {
  mockPriceManagementEditLounge,
} from './__fixtures__/PriceManagementEdit.mocks';

// ─── Public types ─────────────────────────────────────────────────────────────

export type PriceManagementEditMode = 'product' | 'combo';

export type PriceManagementEditProps =
  | {
      mode: 'product';
      product: ProductPricing;
      comboDiscount?: never;
      onBack: () => void;
      onSave: (updated: ProductPricing) => void;
    }
  | {
      mode: 'combo';
      product?: never;
      comboDiscount: ComboDiscount;
      onBack: () => void;
      onSave: (updated: ComboDiscount) => void;
    };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePrice(raw: string): number | null {
  const s = raw.trim().toLowerCase();
  if (s === '' || s === 'n/a') return null;
  if (s === 'free' || s === '0') return 0;
  const n = parseInt(s.replace(/[^\d]/g, ''), 10);
  return isNaN(n) ? null : n;
}

function displayPrice(price: number | null): string {
  if (price === null) return '';
  return String(price);
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-gray-800 font-semibold">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Product Edit Form ────────────────────────────────────────────────────────

function ProductEditForm({
  product,
  onBack,
  onSave,
}: {
  product: ProductPricing;
  onBack: () => void;
  onSave: (updated: ProductPricing) => void;
}) {
  const isLounge  = product.productId === 'lounge-deluxe';
  const accentBg  = isLounge ? 'bg-blue-600'  : 'bg-purple-700';
  const accentText = isLounge ? 'text-blue-700' : 'text-purple-700';
  const accentRing = isLounge ? 'focus:ring-blue-400' : 'focus:ring-purple-400';
  const accentBorder = isLounge ? 'border-blue-200 bg-blue-50' : 'border-purple-200 bg-purple-50';

  const [basePrice, setBasePrice] = useState(String(product.basePrice));
  const [addOns, setAddOns]       = useState<AddOnRate[]>(() =>
    product.addOns.map((a) => ({ ...a })),
  );
  const [hasUnsaved, setHasUnsaved] = useState(false);

  function markDirty() { setHasUnsaved(true); }

  function updateAddOn(id: string, field: keyof AddOnRate, value: string | number | null) {
    setAddOns((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    );
    markDirty();
  }

  function handleSave() {
    const parsedBase = parseInt(basePrice.replace(/[^\d]/g, ''), 10);
    if (isNaN(parsedBase) || parsedBase < 0) {
      toast.error('Base price must be a valid positive number');
      return;
    }
    const updated: ProductPricing = {
      ...product,
      basePrice: parsedBase,
      addOns,
    };
    onSave(updated);
    setHasUnsaved(false);
    toast.success(`${product.productName} pricing saved`);
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Price Management
          </button>
          <span className="text-gray-300">/</span>
          <div className={`flex items-center gap-2 ${accentText} font-semibold`}>
            <DollarSign className="w-4 h-4" />
            {product.productName}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsaved && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              Unsaved changes
            </span>
          )}
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className={`${accentBg} hover:opacity-90 text-white`}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Product identity banner */}
      <Card className={`border ${accentBorder} shadow-none`}>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Product</p>
            <p className={`font-semibold mt-0.5 ${accentText}`}>{product.productName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{product.freeAllowanceNote}</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            {product.standardDurationHours}h standard stay
          </div>
        </div>
      </Card>

      {/* Base Price */}
      <Section
        title="Base Price"
        subtitle="The flat charge applied to every booking before any add-ons."
      >
        <Card className="border-0 shadow-md p-6">
          <Label className="mb-[10px] block text-gray-700">
            Base Price <span className="text-gray-400 font-normal">(HKD)</span>
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm w-10">HKD</span>
            <Input
              type="number"
              min={0}
              value={basePrice}
              onChange={(e) => { setBasePrice(e.target.value); markDirty(); }}
              className={`w-48 font-mono text-xl ${accentText} focus:ring-2 ${accentRing}`}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">{product.freeAllowanceNote}</p>
        </Card>
      </Section>

      {/* Add-on Rates */}
      <Section
        title="Add-on Rates"
        subtitle='Enter the per-unit price in HKD. Leave blank or enter "0" for FREE. "N/A" add-ons are shown as not offered.'
      >
        <Card className="border-0 shadow-md overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_160px_180px_1fr] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>Add-on</span>
            <span>Price (HKD)</span>
            <span>Unit</span>
            <span>Notes</span>
          </div>

          <div className="divide-y divide-gray-100">
            {addOns.map((addon) => {
              const isNA = addon.id === 'ld-flying-extra';
              return (
                <div
                  key={addon.id}
                  className={`grid grid-cols-[1fr_160px_180px_1fr] gap-4 px-6 py-4 items-start ${isNA ? 'bg-gray-50' : 'hover:bg-gray-50/60'} transition-colors`}
                >
                  {/* Label */}
                  <div className="pt-1">
                    <p className="text-sm text-gray-800">{addon.label}</p>
                    {isNA && (
                      <Badge className="mt-1 bg-gray-200 text-gray-500 border-0 text-xs">
                        Not offered
                      </Badge>
                    )}
                  </div>

                  {/* Price input */}
                  <div>
                    <Label className="mb-[10px] block text-xs text-gray-400">HKD amount</Label>
                    {isNA ? (
                      <Input value="N/A" disabled className="w-full bg-gray-100 text-gray-400 font-mono" />
                    ) : (
                      <Input
                        type="number"
                        min={0}
                        value={displayPrice(addon.price)}
                        placeholder={addon.price === null ? 'N/A' : '0 = FREE'}
                        onChange={(e) =>
                          updateAddOn(addon.id, 'price', parsePrice(e.target.value))
                        }
                        className={`w-full font-mono focus:ring-2 ${accentRing}`}
                      />
                    )}
                    {addon.price === 0 && !isNA && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="w-3 h-3" /> FREE
                      </span>
                    )}
                  </div>

                  {/* Unit (read-only display) */}
                  <div className="pt-1">
                    <p className="text-xs text-gray-500 leading-snug">{addon.unit}</p>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label className="mb-[10px] block text-xs text-gray-400">Notes</Label>
                    <Input
                      value={addon.notes ?? ''}
                      onChange={(e) => updateAddOn(addon.id, 'notes', e.target.value)}
                      placeholder="Optional clarification"
                      className="w-full text-sm"
                      disabled={isNA}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Section>

      {/* Capacity Caps (read-only — controlled by rules, not free-form prices) */}
      <Section
        title="Capacity Caps"
        subtitle="These limits are enforced by the booking engine and cannot be overridden here."
      >
        <Card className="border-0 shadow-md overflow-hidden">
          {product.caps.map((cap, i) => (
            <div
              key={cap.id}
              className={`flex items-center justify-between px-6 py-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="flex items-start gap-3">
                <Badge className="bg-amber-100 text-amber-700 border-0 font-mono text-xs mt-0.5">
                  {cap.noteRef}
                </Badge>
                <p className="text-sm text-gray-700">{cap.description}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-500 ml-6">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Max {cap.cap}</span>
              </div>
            </div>
          ))}
        </Card>
      </Section>

      {/* Included services (read-only reference) */}
      <Section
        title="Included Services"
        subtitle="Services bundled in the base price. Contact tech team to change the service list."
      >
        <Card className="border-0 shadow-md p-5">
          <div className="flex flex-wrap gap-2">
            {product.includes.map((item) => (
              <Badge key={item} className={`${isLounge ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'} border-0 text-xs`}>
                {item}
              </Badge>
            ))}
          </div>
        </Card>
      </Section>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className={`${accentBg} hover:opacity-90 text-white`}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Combo Discount Edit Form ─────────────────────────────────────────────────

function ComboEditForm({
  comboDiscount,
  onBack,
  onSave,
}: {
  comboDiscount: ComboDiscount;
  onBack: () => void;
  onSave: (updated: ComboDiscount) => void;
}) {
  const [draft, setDraft]         = useState<ComboDiscount>({ ...comboDiscount });
  const [hasUnsaved, setHasUnsaved] = useState(false);

  function update<K extends keyof ComboDiscount>(key: K, value: ComboDiscount[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setHasUnsaved(true);
  }

  function handleSave() {
    if (draft.discountPercent < 0 || draft.discountPercent > 100) {
      toast.error('Discount must be between 0% and 100%');
      return;
    }
    if (draft.maxCombinedHours < 1) {
      toast.error('Max combined hours must be at least 1');
      return;
    }
    onSave(draft);
    setHasUnsaved(false);
    toast.success('Combo discount rule saved');
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Price Management
          </button>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-2 text-amber-600 font-semibold">
            <Tag className="w-4 h-4" />
            {comboDiscount.noteRef} — Combo Discount
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsaved && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              Unsaved changes
            </span>
          )}
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Rule banner */}
      <Card className="border border-amber-200 bg-amber-50 shadow-none">
        <div className="px-5 py-4 flex items-start gap-3">
          <Tag className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{comboDiscount.noteRef} — Arrival + Departure Combo</p>
            <p className="text-xs text-amber-700 mt-0.5">
              When the same passenger books both arrival and departure (same package type) within the
              max combined hours, the 2nd leg total is discounted.
            </p>
          </div>
        </div>
      </Card>

      {/* Discount % */}
      <Section
        title="Discount Percentage"
        subtitle="Applied to the entire computed total of the 2nd leg (base price + all add-ons)."
      >
        <Card className="border-0 shadow-md p-6">
          <Label className="mb-[10px] block text-gray-700">Discount on 2nd leg</Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={0}
              max={100}
              value={draft.discountPercent}
              onChange={(e) => update('discountPercent', parseInt(e.target.value) || 0)}
              className="w-28 font-mono text-xl text-amber-700 focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-2xl text-gray-400">%</span>
            <span className="text-sm text-gray-500">off the 2nd leg total</span>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <strong>Note:</strong> This discount is NOT applied to the 1st leg. The 1st leg is always
            billed at the full computed total.
          </div>
        </Card>
      </Section>

      {/* Max combined hours */}
      <Section
        title="Maximum Combined Hours"
        subtitle="The combo discount only applies if the total stay across both legs does not exceed this limit."
      >
        <Card className="border-0 shadow-md p-6">
          <Label className="mb-[10px] block text-gray-700">Max combined stay</Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={1}
              max={24}
              value={draft.maxCombinedHours}
              onChange={(e) => update('maxCombinedHours', parseInt(e.target.value) || 1)}
              className="w-24 font-mono text-xl focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-gray-500 text-sm">hours (arrival + departure combined)</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-amber-500" />
            Currently: ≤ {draft.maxCombinedHours}h triggers the combo discount
          </div>
        </Card>
      </Section>

      {/* Description */}
      <Section
        title="Rule Description"
        subtitle="Displayed in the admin UI and on booking detail pages for staff reference."
      >
        <Card className="border-0 shadow-md p-6">
          <Label className="mb-[10px] block text-gray-700">Description</Label>
          <textarea
            value={draft.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </Card>
      </Section>

      {/* Info callout */}
      <Card className="border-0 shadow-none bg-blue-50 border border-blue-100">
        <div className="p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            The pricing engine applies this rule automatically when the booking system detects a
            same-passenger arrival + departure combo within the max combined hours. No manual
            intervention required.
          </p>
        </div>
      </Card>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PriceManagementEdit(props: PriceManagementEditProps = mockPriceManagementEditLounge) {
  if (props.mode === 'combo') {
    return (
      <ComboEditForm
        comboDiscount={props.comboDiscount}
        onBack={props.onBack}
        onSave={props.onSave as (updated: ComboDiscount) => void}
      />
    );
  }

  return (
    <ProductEditForm
      product={props.product}
      onBack={props.onBack}
      onSave={props.onSave as (updated: ProductPricing) => void}
    />
  );
}
