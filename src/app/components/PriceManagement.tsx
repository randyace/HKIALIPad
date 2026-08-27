/**
 * PriceManagement.tsx — Pure presentational component.
 *
 * Rules:
 *  - Zero routing hooks — all navigation via props callbacks
 *  - Business data comes entirely from props (falls back to mock fixture)
 *  - Tab state is pure UI state — allowed
 *  - Editing is delegated to a separate page via onEditProduct / onEditComboDiscount
 *
 * Source of truth: EN_Price_List.pdf (2026-06-04)
 * Reference: PRICING_RULES_FOR_FIGMA.md
 */

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Edit2,
  DollarSign,
  AlertTriangle,
  Info,
  Clock,
  Users,
  Tag,
  FileText,
  Calculator,
} from 'lucide-react';
import { mockPriceManagementData } from './__fixtures__/PriceManagement.mocks';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface AddOnRate {
  id: string;
  label: string;
  /** null = N/A (not offered) */
  price: number | null;
  unit: string;
  notes?: string;
}

export interface CapRule {
  id: string;
  noteRef: string;
  description: string;
  cap: number;
}

export interface ProductPricing {
  productId: 'lounge-deluxe' | 'premiere-suite';
  productName: string;
  basePrice: number;
  currency: string;
  freeAllowanceNote: string;
  standardDurationHours: number;
  addOns: AddOnRate[];
  caps: CapRule[];
  includes: string[];
}

export interface ComboDiscount {
  id: string;
  noteRef: string;
  description: string;
  discountPercent: number;
  maxCombinedHours: number;
}

export interface WorkedExampleLine {
  label: string;
  qty: number;
  unit: number;
  subtotal: number;
}

export interface WorkedExample {
  id: string;
  title: string;
  subtitle: string;
  lines: WorkedExampleLine[];
  total: number;
  notes: string;
}

export interface PriceManagementProps {
  loungeDeluxe?: ProductPricing;
  premiereSuite?: ProductPricing;
  comboDiscount?: ComboDiscount;
  workedExamples?: WorkedExample[];
  lastUpdated?: string;
  sourceDocument?: string;
  /** Called when user clicks "Edit Rates" on a product card */
  onEditProduct?: (productId: 'lounge-deluxe' | 'premiere-suite') => void;
  /** Called when user clicks "Edit Rule" on the combo discount card */
  onEditComboDiscount?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtHKD(amount: number | null): string {
  if (amount === null) return 'N/A';
  if (amount === 0) return 'FREE';
  return `HKD ${amount.toLocaleString()}`;
}

function fmtHKDSigned(amount: number): string {
  if (amount === 0) return 'FREE';
  const sign = amount < 0 ? '−' : '';
  return `${sign}HKD ${Math.abs(amount).toLocaleString()}`;
}

// ─── Add-on Table ─────────────────────────────────────────────────────────────

function AddOnTable({ addOns }: { addOns: AddOnRate[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-gray-600 font-medium">Add-on</th>
            <th className="text-right px-4 py-3 text-gray-600 font-medium w-36">Price</th>
            <th className="text-left px-4 py-3 text-gray-600 font-medium w-36">Unit</th>
            <th className="text-left px-4 py-3 text-gray-600 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {addOns.map((addon) => (
            <tr key={addon.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-800">{addon.label}</td>
              <td className="px-4 py-3 text-right font-mono">
                {addon.price === null ? (
                  <span className="text-gray-400 italic">N/A</span>
                ) : addon.price === 0 ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  <span className="text-gray-900">HKD {addon.price.toLocaleString()}</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{addon.unit}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{addon.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onEdit,
}: {
  product: ProductPricing;
  onEdit: () => void;
}) {
  const isLounge = product.productId === 'lounge-deluxe';
  const accentBg     = isLounge ? 'bg-blue-600'        : 'bg-purple-700';
  const accentLight  = isLounge ? 'bg-blue-50 border-blue-200'   : 'bg-purple-50 border-purple-200';
  const accentText   = isLounge ? 'text-blue-700'       : 'text-purple-700';
  const badgeBg      = isLounge ? 'bg-blue-100 text-blue-700'    : 'bg-purple-100 text-purple-700';

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className={`${accentBg} text-white px-6 py-4 flex items-center justify-between`}>
        <div>
          <h2 className="font-semibold text-lg">{product.productName}</h2>
          <p className="text-white/80 text-sm mt-0.5">{product.freeAllowanceNote}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-white/50 text-white bg-white/10 hover:bg-white/20 hover:text-white"
          onClick={onEdit}
        >
          <Edit2 className="w-3.5 h-3.5 mr-1.5" />
          Edit Rates
        </Button>
      </div>

      <div className="p-6 space-y-5">
        {/* Base price */}
        <div className={`rounded-xl border ${accentLight} p-4 flex items-center justify-between`}>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Base Price</p>
            <p className={`text-3xl font-bold ${accentText} mt-1`}>
              HKD {product.basePrice.toLocaleString()}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500 space-y-0.5">
            <div className="flex items-center gap-1.5 justify-end">
              <Clock className="w-3.5 h-3.5" />
              {product.standardDurationHours}h standard stay
            </div>
            {product.caps.map((cap) => (
              <div key={cap.id} className="flex items-center gap-1.5 justify-end">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>{cap.noteRef}: max {cap.cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Included services */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Included Services
          </p>
          <div className="flex flex-wrap gap-1.5">
            {product.includes.map((item) => (
              <Badge key={item} className={`${badgeBg} border-0 text-xs`}>
                {item}
              </Badge>
            ))}
          </div>
        </div>

        {/* Add-on rates */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Add-on Rates
          </p>
          <AddOnTable addOns={product.addOns} />
        </div>
      </div>
    </Card>
  );
}

// ─── Special Rules Tab ────────────────────────────────────────────────────────

function SpecialRulesTab({
  loungeDeluxe,
  premiereSuite,
  comboDiscount,
  onEditCombo,
}: {
  loungeDeluxe: ProductPricing;
  premiereSuite: ProductPricing;
  comboDiscount: ComboDiscount;
  onEditCombo: () => void;
}) {
  const allCaps = [
    ...loungeDeluxe.caps.map((c) => ({ ...c, product: loungeDeluxe.productName })),
    ...premiereSuite.caps.map((c) => ({ ...c, product: premiereSuite.productName })),
  ];

  return (
    <div className="space-y-6">
      {/* Combo Discount */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-amber-500 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5" />
            <div>
              <h2 className="font-semibold">{comboDiscount.noteRef} — Arrival + Departure Combo</h2>
              <p className="text-white/80 text-sm">Applied to the 2nd leg only</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-white/50 text-white bg-white/10 hover:bg-white/20 hover:text-white"
            onClick={onEditCombo}
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            Edit Rule
          </Button>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-8 py-4 text-center flex-shrink-0">
              <p className="text-4xl font-bold text-amber-600">{comboDiscount.discountPercent}%</p>
              <p className="text-sm text-amber-700 mt-0.5">discount on 2nd leg</p>
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-gray-700 text-sm leading-relaxed">{comboDiscount.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 text-amber-500" />
                Applies when combined arrival + departure stay is ≤ {comboDiscount.maxCombinedHours} hours
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <strong>Important:</strong> The discount is applied to the{' '}
                <em>entire computed total</em> of the 2nd leg (base + all add-ons). It is NOT applied
                to the 1st leg.
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Capacity Caps */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gray-700 text-white px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-300" />
          <div>
            <h2 className="font-semibold">Capacity Cap Rules</h2>
            <p className="text-white/70 text-sm">
              Enforced at booking creation; warnings shown on violation
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {allCaps.map((cap) => (
            <div
              key={cap.id}
              className="rounded-xl border border-gray-200 p-4 flex items-center justify-between"
            >
              <div className="flex items-start gap-3">
                <Badge className="bg-gray-100 text-gray-700 border-0 font-mono text-xs mt-0.5">
                  {cap.noteRef}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-gray-800">{cap.product}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{cap.description}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-2xl font-bold">{cap.cap}</span>
                </div>
                <p className="text-xs text-gray-400">max guests</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* No-tax note */}
      <Card className="border-0 shadow-md bg-blue-50">
        <div className="p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>No service charge, tax, or agency discount</strong> is handled by the pricing
            engine. Any promo code discount must be applied as a separate line item on top of the
            backend-computed total.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── Worked Examples Tab ──────────────────────────────────────────────────────

function ExamplesTab({ examples }: { examples: WorkedExample[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <Info className="w-4 h-4 flex-shrink-0" />
        These examples are computed by the same PricingService the backend uses. Use them for QA
        and to verify the price preview banner shows the correct totals.
      </div>

      {examples.map((ex) => (
        <Card key={ex.id} className="border-0 shadow-md overflow-hidden">
          <div className="bg-[#0f2942] text-white px-6 py-4">
            <h2 className="font-semibold">{ex.title}</h2>
            <p className="text-white/70 text-sm">{ex.subtitle}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 text-gray-600 font-medium">Line Item</th>
                    <th className="text-right px-4 py-2.5 text-gray-600 font-medium w-16">Qty</th>
                    <th className="text-right px-4 py-2.5 text-gray-600 font-medium w-28">Unit</th>
                    <th className="text-right px-4 py-2.5 text-gray-600 font-medium w-28">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ex.lines.map((line, i) => {
                    const isDiscount = line.subtotal < 0;
                    return (
                      <tr key={i} className={isDiscount ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className={`px-4 py-2.5 ${isDiscount ? 'text-red-700' : 'text-gray-800'}`}>
                          {line.label}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-500 font-mono">{line.qty}</td>
                        <td className={`px-4 py-2.5 text-right font-mono ${isDiscount ? 'text-red-600' : 'text-gray-700'}`}>
                          {fmtHKDSigned(line.unit)}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-mono font-medium ${isDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                          {fmtHKDSigned(line.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#0f2942] text-white">
                    <td className="px-4 py-3 font-semibold" colSpan={3}>Total</td>
                    <td className="px-4 py-3 text-right font-bold font-mono">
                      HKD {ex.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {ex.notes && (
              <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {ex.notes}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Cheat Sheet Tab ──────────────────────────────────────────────────────────

function CheatSheet({
  loungeDeluxe,
  premiereSuite,
}: {
  loungeDeluxe: ProductPricing;
  premiereSuite: ProductPricing;
}) {
  const getAddon = (product: ProductPricing, id: string) =>
    product.addOns.find((a) => a.id === id)?.price ?? null;

  const rows: { question: string; answer: string }[] = [
    { question: 'Lounge Deluxe base',                  answer: fmtHKD(loungeDeluxe.basePrice) },
    { question: 'Premiere Suite base',                  answer: fmtHKD(premiereSuite.basePrice) },
    { question: 'Lounge Deluxe — child 1st–2nd',        answer: fmtHKD(getAddon(loungeDeluxe, 'ld-child-2-11-first')) },
    { question: 'Lounge Deluxe — child 3rd+',           answer: fmtHKD(getAddon(loungeDeluxe, 'ld-child-2-11-third')) },
    { question: 'Premiere Suite — child 1st–2nd',       answer: fmtHKD(getAddon(premiereSuite, 'ps-child-2-11-first')) },
    { question: 'Premiere Suite — child 3rd+',          answer: fmtHKD(getAddon(premiereSuite, 'ps-child-2-11-third')) },
    { question: 'Non-flying guest (either product)',    answer: `HKD ${(getAddon(loungeDeluxe, 'ld-non-flying') ?? 0).toLocaleString()} per person` },
    { question: 'Additional flying — Premiere Suite',   answer: fmtHKD(getAddon(premiereSuite, 'ps-flying-extra')) + ' (4th flying onward)' },
    { question: 'Additional flying — Lounge Deluxe',    answer: 'N/A' },
    { question: 'Extra hour — Lounge Deluxe',           answer: fmtHKD(getAddon(loungeDeluxe, 'ld-extra-hour')) + ' per person' },
    { question: 'Extra hour — Premiere Suite',          answer: fmtHKD(getAddon(premiereSuite, 'ps-extra-hour')) + ' per suite' },
    { question: 'Limousine (either product)',           answer: fmtHKD(getAddon(loungeDeluxe, 'ld-limo')) + ' per car per trip' },
    { question: 'Note 4 cap',                           answer: 'Lounge Deluxe: max 3 non-flying guests' },
    { question: 'Note 5 cap',                           answer: 'Premiere Suite: max 6 guests total' },
    { question: 'Note 7 combo discount',                answer: '2nd leg 60% off if total stay ≤ 6 hours' },
  ];

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <div className="bg-[#0f2942] text-white px-6 py-4 flex items-center gap-3">
        <Calculator className="w-5 h-5" />
        <div>
          <h2 className="font-semibold">Quick Reference Cheat Sheet</h2>
          <p className="text-white/70 text-sm">Numbers reflect the current rate card above</p>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
            <span className="text-sm text-gray-600">{row.question}</span>
            <span className="text-sm font-medium text-gray-900 font-mono text-right max-w-xs">
              {row.answer}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PriceManagement({
  loungeDeluxe    = mockPriceManagementData.loungeDeluxe!,
  premiereSuite   = mockPriceManagementData.premiereSuite!,
  comboDiscount   = mockPriceManagementData.comboDiscount!,
  workedExamples  = mockPriceManagementData.workedExamples!,
  lastUpdated     = mockPriceManagementData.lastUpdated,
  sourceDocument  = mockPriceManagementData.sourceDocument,
  onEditProduct   = mockPriceManagementData.onEditProduct,
  onEditComboDiscount = mockPriceManagementData.onEditComboDiscount,
}: PriceManagementProps) {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#0f2942]" />
            Price Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage base prices, add-on rates, and special rules for all HKIA VIP Lounge products.
          </p>
        </div>
        <div className="text-right text-xs text-gray-400 space-y-0.5">
          {sourceDocument && (
            <div className="flex items-center gap-1.5 justify-end text-gray-500">
              <FileText className="w-3.5 h-3.5" />
              {sourceDocument}
            </div>
          )}
          {lastUpdated && <p>Last updated: {lastUpdated}</p>}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rate-cards">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="rate-cards" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Rate Cards
          </TabsTrigger>
          <TabsTrigger value="special-rules" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Special Rules
          </TabsTrigger>
          <TabsTrigger value="examples" className="gap-2">
            <Calculator className="w-4 h-4" />
            Worked Examples
          </TabsTrigger>
          <TabsTrigger value="cheat-sheet" className="gap-2">
            <FileText className="w-4 h-4" />
            Cheat Sheet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rate-cards" className="mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProductCard
              product={loungeDeluxe}
              onEdit={() => onEditProduct?.('lounge-deluxe')}
            />
            <ProductCard
              product={premiereSuite}
              onEdit={() => onEditProduct?.('premiere-suite')}
            />
          </div>
        </TabsContent>

        <TabsContent value="special-rules" className="mt-6">
          <SpecialRulesTab
            loungeDeluxe={loungeDeluxe}
            premiereSuite={premiereSuite}
            comboDiscount={comboDiscount}
            onEditCombo={() => onEditComboDiscount?.()}
          />
        </TabsContent>

        <TabsContent value="examples" className="mt-6">
          <ExamplesTab examples={workedExamples} />
        </TabsContent>

        <TabsContent value="cheat-sheet" className="mt-6">
          <CheatSheet loungeDeluxe={loungeDeluxe} premiereSuite={premiereSuite} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
