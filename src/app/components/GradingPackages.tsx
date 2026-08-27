/**
 * GradingPackages.tsx — Pure presentational component.
 *
 * Rules:
 *  - Zero business state (packages[] comes entirely from props)
 *  - Dialog / draft-edit / benefit-input state are pure UI state — allowed
 *  - All mutations (save, toggle) reported via typed callbacks
 *  - Default props fall back to mockGradingPackagesData (fixture pattern)
 */

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import {
  Edit, Star, Gem, Award, Trophy,
  Plus, X, Check, DollarSign, CreditCard, Clock, Gift, Shuffle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { toast } from 'sonner';
import { mockGradingPackagesData } from './__fixtures__/GradingPackages.mocks';

// Suppress unused-import warning for Award (kept for future tiers)
void Award;

// ─── Public types ─────────────────────────────────────────────────────────────

export type PackageTier = 'Gold' | 'Platinum' | 'Diamond' | 'Sapphire';

export interface PackageBenefit {
  id:   number;
  text: string;
}

export interface GradingPackage {
  id:             number;
  tier:           PackageTier;
  price:          number;
  currency:       string;
  bookingCredits: number;
  validityMonths: number;
  description:    string;
  benefits:       PackageBenefit[];
  isActive:       boolean;
  memberCount:    number;
  /** Tailwind text-colour class */
  color:       string;
  /** Tailwind background-colour class */
  bgColor:     string;
  /** Tailwind border-colour class */
  borderColor: string;
  /** Tailwind badge background + text classes */
  badgeBg:     string;
}

export interface GradingPackagesProps {
  /** Full list of packages to display */
  packages?: GradingPackage[];
  /** Called when the user saves an edited package */
  onSavePackage?: (updatedPackage: GradingPackage) => void;
  /** Called when the user toggles a package's active state */
  onToggleActive?: (id: number, isActive: boolean) => void;
}

// ─── Static display config (not business data) ────────────────────────────────

const TIER_META: Record<PackageTier, { icon: React.ReactNode }> = {
  Gold:     { icon: <Star  className="w-8 h-8" /> },
  Platinum: { icon: <Trophy className="w-8 h-8" /> },
  Diamond:  { icon: <Gem  className="w-8 h-8" /> },
  Sapphire: { icon: <Gem  className="w-8 h-8" /> },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function GradingPackages({
  packages       = mockGradingPackagesData.packages ?? [],
  onSavePackage  = () => {},
  onToggleActive = () => {},
}: GradingPackagesProps) {

  // ── Pure UI state (dialog / in-progress edits) ─────────────────────────────
  const [isDialogOpen,   setIsDialogOpen]   = useState(false);
  const [editingPackage, setEditingPackage] = useState<GradingPackage | null>(null);
  const [newBenefitText, setNewBenefitText] = useState('');

  // ── Dialog helpers ─────────────────────────────────────────────────────────

  const openEdit = (pkg: GradingPackage) => {
    setEditingPackage(JSON.parse(JSON.stringify(pkg)) as GradingPackage);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPackage(null);
    setNewBenefitText('');
  };

  const handleSave = () => {
    if (!editingPackage) return;
    onSavePackage(editingPackage);
    toast.success(`${editingPackage.tier} package updated successfully.`);
    closeDialog();
  };

  const handleToggleActive = (pkg: GradingPackage) => {
    const next = !pkg.isActive;
    onToggleActive(pkg.id, next);
    toast.success(`${pkg.tier} package ${next ? 'activated' : 'deactivated'}.`);
  };

  // ── Benefit helpers (mutate the local editing draft only) ──────────────────

  const addBenefit = () => {
    if (!editingPackage || !newBenefitText.trim()) return;
    const newId = Math.max(0, ...editingPackage.benefits.map(b => b.id)) + 1;
    setEditingPackage({
      ...editingPackage,
      benefits: [...editingPackage.benefits, { id: newId, text: newBenefitText.trim() }],
    });
    setNewBenefitText('');
  };

  const removeBenefit = (benefitId: number) => {
    if (!editingPackage) return;
    setEditingPackage({
      ...editingPackage,
      benefits: editingPackage.benefits.filter(b => b.id !== benefitId),
    });
  };

  const updateBenefitText = (benefitId: number, text: string) => {
    if (!editingPackage) return;
    setEditingPackage({
      ...editingPackage,
      benefits: editingPackage.benefits.map(b => b.id === benefitId ? { ...b, text } : b),
    });
  };

  // ── Quick Fill (demo convenience only) ────────────────────────────────────

  const handleQuickFill = () => {
    if (!editingPackage) return;
    setEditingPackage({
      ...editingPackage,
      description: `Premium ${editingPackage.tier} membership package with exclusive airport lounge access, priority services, and complimentary refreshments.`,
      price: editingPackage.tier === 'Gold' ? 32000
           : editingPackage.tier === 'Platinum' ? 45000
           : editingPackage.tier === 'Diamond' ? 84000
           : 325000,
      bookingCredits: editingPackage.tier === 'Gold' ? 8
                    : editingPackage.tier === 'Platinum' ? 12
                    : editingPackage.tier === 'Diamond' ? 24
                    : -1,
      validityMonths: 12,
      isActive: true,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-1">Grading Package Management</h1>
        <p className="text-sm text-gray-500">
          Configure membership tiers, pricing, booking credits, and benefits for individual customers.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`p-4 border-2 ${pkg.borderColor} ${pkg.bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={pkg.color}>{TIER_META[pkg.tier].icon}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${pkg.badgeBg}`}>{pkg.tier}</span>
            </div>
            <p className="text-2xl text-gray-900">{pkg.memberCount}</p>
            <p className="text-xs text-gray-500 mt-1">Active Members</p>
          </Card>
        ))}
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`border-2 ${pkg.borderColor} overflow-hidden`}>
            {/* Card Header */}
            <div className={`${pkg.bgColor} px-6 py-4 border-b ${pkg.borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={pkg.color}>{TIER_META[pkg.tier].icon}</span>
                  <div>
                    <h3 className={`${pkg.color} text-lg`}>{pkg.tier} Package</h3>
                    <p className="text-xs text-gray-500">{pkg.validityMonths}-month validity</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={pkg.isActive}
                    onCheckedChange={() => handleToggleActive(pkg)}
                  />
                  <span className="text-xs text-gray-500">{pkg.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

              {/* Key Details */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <DollarSign className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-900">{pkg.currency} {pkg.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Price</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <CreditCard className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-900">{pkg.bookingCredits === -1 ? '∞' : pkg.bookingCredits}</p>
                  <p className="text-xs text-gray-500">Entries/yr</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-900">{pkg.validityMonths}mo</p>
                  <p className="text-xs text-gray-500">Validity</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Gift className="w-3 h-3" /> Benefits
                </p>
                <ul className="space-y-1">
                  {pkg.benefits.map((benefit) => (
                    <li key={benefit.id} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className={`w-4 h-4 ${pkg.color} mt-0.5 shrink-0`} />
                      {benefit.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Edit action */}
              <Button variant="outline" size="sm" className="w-full" onClick={() => openEdit(pkg)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Package
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => { if (!open) closeDialog(); }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage && (
                <span className={editingPackage.color}>
                  Edit {editingPackage.tier} Package
                </span>
              )}
            </DialogTitle>
            <Button
              type="button"
              variant="outline"
              onClick={handleQuickFill}
              className="gap-1 mt-2 w-fit bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border-yellow-400/50 text-yellow-700 hover:from-yellow-400/30 hover:to-amber-400/30 hover:border-yellow-500/70 hover:text-yellow-800 transition-all text-[10px] px-2 py-0.5 h-[25px]"
            >
              <Shuffle className="w-3 h-3" />
              Quick Fill Demo
            </Button>
          </DialogHeader>

          {editingPackage && (
            <div className="space-y-5 py-2">
              {/* Description */}
              <div>
                <Label htmlFor="edit-desc" className="mb-[10px] block">Package Description</Label>
                <Textarea
                  id="edit-desc"
                  value={editingPackage.description}
                  onChange={(e) =>
                    setEditingPackage({ ...editingPackage, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Pricing & Credits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-price" className="mb-[10px] block">Price (HKD)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min={0}
                    value={editingPackage.price}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, price: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-credits" className="mb-[10px] block">
                    Lounge Deluxe Entries/Year (-1 = Unlimited)
                  </Label>
                  <Input
                    id="edit-credits"
                    type="number"
                    min={-1}
                    value={editingPackage.bookingCredits}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, bookingCredits: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-validity" className="mb-[10px] block">Validity (Months)</Label>
                  <Input
                    id="edit-validity"
                    type="number"
                    min={1}
                    max={60}
                    value={editingPackage.validityMonths}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, validityMonths: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Benefits */}
              <div>
                <Label className="mb-[10px] block">Package Benefits</Label>
                <div className="space-y-2 mb-3">
                  {editingPackage.benefits.map((benefit) => (
                    <div key={benefit.id} className="flex gap-2 items-center">
                      <Check className={`w-4 h-4 ${editingPackage.color} shrink-0`} />
                      <Input
                        value={benefit.text}
                        onChange={(e) => updateBenefitText(benefit.id, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBenefit(benefit.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {/* Add Benefit */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new benefit..."
                    value={newBenefitText}
                    onChange={(e) => setNewBenefitText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
                  />
                  <Button variant="outline" size="sm" onClick={addBenefit} className="shrink-0">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Status toggle */}
              <div className="flex items-center gap-3">
                <Switch
                  id="edit-active"
                  checked={editingPackage.isActive}
                  onCheckedChange={(val) =>
                    setEditingPackage({ ...editingPackage, isActive: val })
                  }
                />
                <Label htmlFor="edit-active">Package is Active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
