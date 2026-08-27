import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ArrowLeft, Save, Shuffle, Building2, Eye, Receipt } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { INITIAL_RECORDS, PurchaseRecord } from './PurchaseCreate';
import { toast } from 'sonner@2.0.3';
import type { GeneratedCodesData } from './PromoCodeGeneratedPage';

// ─── Get available contracts ──────────────────────────────────────────────────
function getAvailableContracts(): PurchaseRecord[] {
  return INITIAL_RECORDS.filter(r =>
    r.purchaseCategory === 'Corporate' || r.purchaseCategory === 'Agency'
  );
}

// ─── Generate short code from company name ────────────────────────────────────
function generateShortCode(companyName: string): string {
  const words = companyName.split(' ').filter(w => w.length > 0);
  let code = words.map(w => w[0].toUpperCase()).join('').slice(0, 4);
  if (code.length < 3 && words[0]) {
    code = words[0].substring(0, 4).toUpperCase();
  }
  return code.replace(/[^A-Z0-9]/g, '') || 'PROMO';
}

// ─── Generate unique codes ────────────────────────────────────────────────────
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randomSuffix(len = 6): string {
  let result = '';
  for (let i = 0; i < len; i++) result += CHARS[Math.floor(Math.random() * CHARS.length)];
  return result;
}

function generateUniqueCodes(prefix: string, count: number): string[] {
  const codes = new Set<string>();
  const cleanPrefix = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  while (codes.size < count) codes.add(`${cleanPrefix}-${randomSuffix(6)}`);
  return Array.from(codes);
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PromoCodeEditInitialData {
  prefix: string;
  codeCount: number;
  codeType: 'Discount' | 'Free bookings';
  amount: number;
  useLimit: number;
  reusable: boolean;
  availability: boolean;
  startDate: string;
  endDate: string;
  titleEn: string;
  titleSimpChi: string;
  titleTradChi: string;
  descriptionEn: string;
  descriptionSimpChi: string;
  descriptionTradChi: string;
}

export interface PromoCodeEditProps {
  promoCodeId?: number | null;
  initialData?: PromoCodeEditInitialData | null;
  onBack?: () => void;
  onNavigateToCodesPage?: (data: GeneratedCodesData) => void;
}

// ─── Mock batch data for edit mode ───────────────────────────────────────────
const MOCK_BATCH_EDIT = {
  contractId: 101,
  prefix: 'CPA',
  codeCount: 20,
  titleEn: 'Cathay Pacific Welcome Offer',
  titleSimpChi: '国泰航空欢迎优惠',
  titleTradChi: '國泰航空歡迎優惠',
  codeType: 'Free bookings' as const,
  descriptionEn: 'Exclusive discount for Cathay Pacific employees',
  descriptionSimpChi: '国泰航空员工专享折扣',
  descriptionTradChi: '國泰航空員工專享折扣',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  amount: 1,
  useLimit: 1,
  reusable: false,
  availability: true,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function PromoCodeEdit({ promoCodeId, initialData, onBack, onNavigateToCodesPage }: PromoCodeEditProps) {
  const isEditMode = promoCodeId !== null;
  const availableContracts = getAvailableContracts();

  // ── Contract & prefix state ────────────────────────────────────────────────
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [prefix, setPrefix]     = useState('');
  const [codeCount, setCodeCount] = useState<number>(10);

  // ── Form fields ──────────────────────────────────────────────────────────
  const [codeType, setCodeType]   = useState<'Discount' | 'Free bookings'>('Free bookings');
  const [amount, setAmount]       = useState<number>(1);
  const [useLimit, setUseLimit]   = useState<number>(1);
  const [reusable, setReusable]   = useState(false);
  const [availability, setAvailability] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [titleEn, setTitleEn]               = useState('');
  const [titleSimpChi, setTitleSimpChi]     = useState('');
  const [titleTradChi, setTitleTradChi]     = useState('');
  const [descriptionEn, setDescriptionEn]           = useState('');
  const [descriptionSimpChi, setDescriptionSimpChi] = useState('');
  const [descriptionTradChi, setDescriptionTradChi] = useState('');

  // Show "Reusable by Same User" only when use limit > 1
  const showReusableSection = useLimit > 1;

  // ── Prefill in edit mode ─────────────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      setPrefix(initialData.prefix);
      setCodeCount(initialData.codeCount);
      setCodeType(initialData.codeType);
      setAmount(initialData.amount);
      setUseLimit(initialData.useLimit);
      setReusable(initialData.reusable);
      setAvailability(initialData.availability);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setTitleEn(initialData.titleEn);
      setTitleSimpChi(initialData.titleSimpChi);
      setTitleTradChi(initialData.titleTradChi);
      setDescriptionEn(initialData.descriptionEn);
      setDescriptionSimpChi(initialData.descriptionSimpChi);
      setDescriptionTradChi(initialData.descriptionTradChi);
    }
  }, [initialData]);

  // ── When contract changes, auto-fill prefix ───────────────────────────────
  const handleContractChange = (val: string) => {
    const id = Number(val);
    setSelectedContractId(id);
    const contract = availableContracts.find(c => c.id === id);
    if (contract) {
      setPrefix(generateShortCode(contract.primaryName));
      if (contract.sessionsAdded) setCodeCount(contract.sessionsAdded);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contract = selectedContract;
    const isCorporateOrTA = contract &&
      (contract.purchaseCategory === 'Corporate' || contract.purchaseCategory === 'Agency');

    toast.success('Promo code batch saved successfully!', {
      description: 'Batch record created. Generating unique codes…',
    });

    if (isCorporateOrTA && !isEditMode) {
      setTimeout(() => {
        toast.info('VIP Account Creation Request Sent', {
          description: `A request has been sent to create VIP accounts for ${contract.primaryName}.`,
          duration: 5000,
        });
      }, 500);
    }

    // Generate codes and navigate to full-page display
    setTimeout(() => {
      const generatedCodes = generateUniqueCodes(prefix, codeCount);
      onNavigateToCodesPage({
        prefix,
        codes: generatedCodes,
        companyName: contract?.primaryName,
        purchaseCategory: contract?.purchaseCategory as 'Corporate' | 'Agency' | undefined,
        mode: 'generate',
        // pass full form state through so container can call batch API
        codeType,
        amount,
        useLimit,
        reusable,
        startDate,
        endDate,
        titleEn,
        titleSimpChi,
        titleTradChi,
        descriptionEn,
        descriptionSimpChi,
        descriptionTradChi,
        selectedContractId,
      });
    }, 800);
  };

  // ── View codes (edit mode) ───────────────────────────────────────────────
  const handleViewCodes = () => {
    const generatedCodes = generateUniqueCodes(prefix, codeCount);
    onNavigateToCodesPage({
      prefix,
      codes: generatedCodes,
      companyName: selectedContract?.primaryName,
      purchaseCategory: selectedContract?.purchaseCategory as 'Corporate' | 'Agency' | undefined,
      mode: 'view',
    });
  };

  // ── Quick Fill for Demo ───────────────────────────────────────────────────
  const handleQuickFill = () => {
    setPrefix('HOLIDAY');
    setCodeCount(100);
    setCodeType('Free bookings');
    setAmount(1);
    setUseLimit(1);
    setReusable(false);
    setAvailability(true);
    setStartDate('2026-06-01');
    setEndDate('2026-12-31');
    setTitleEn('Holiday Promo 2026');
    setTitleSimpChi('2026 年假日促销');
    setTitleTradChi('2026 年假日促銷');
    setDescriptionEn('Special holiday offer for lounge bookings');
    setDescriptionSimpChi('休息室预订特别假日优惠');
    setDescriptionTradChi('休息室預訂特別假日優惠');
    toast.success('Demo data filled', { duration: 2000 });
  };

  const selectedContract = availableContracts.find(c => c.id === selectedContractId);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1>{isEditMode ? 'Edit Promo Code Batch' : 'Create Promo Code Batch'}</h1>
            <p className="text-gray-600 text-sm">
              {isEditMode
                ? 'Update settings for this promo code batch'
                : 'Select a contract and configure the promo code batch settings'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditMode && (
            <Button
              type="button"
              variant="outline"
              onClick={handleQuickFill}
              className="gap-1 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border-yellow-400/50 text-yellow-700 hover:from-yellow-400/30 hover:to-amber-400/30 text-[10px] px-2 py-0.5 h-[25px]"
            >
              <Shuffle className="w-3 h-3" />
              Quick Fill Demo
            </Button>
          )}
          {isEditMode && (
            <Button
              type="button"
              variant="outline"
              onClick={handleViewCodes}
              className="gap-2 border-[#0f2942] text-[#0f2942] hover:bg-[#0f2942] hover:text-white"
            >
              <Eye className="w-4 h-4" />
              View Generated Codes
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── STEP 1 : Contract & Prefix ─────────────────────────── */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-xs">1</div>
            <h2 className="text-base">Contract & Promo Code Settings</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Contract selector */}
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>
                <Receipt className="inline w-4 h-4 mr-1 text-gray-500" />
                Select Contract (Optional)
              </label>
              {isEditMode ? (
                <div className="flex flex-col gap-2 px-3 py-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{selectedContract?.primaryName ?? '—'}</span>
                    <Badge variant="outline" className="ml-auto text-xs font-mono">{prefix}</Badge>
                  </div>
                  {selectedContract && (
                    <div className="text-xs text-gray-500 pl-6 space-y-0.5">
                      <div>Contract ID: {selectedContract.purchaseRef}</div>
                      <div>Price: HKD {selectedContract.packagePrice.toLocaleString()}</div>
                      <div>Quantity: {selectedContract.sessionsAdded ?? 0}</div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Select
                    value={selectedContractId !== null ? String(selectedContractId) : ''}
                    onValueChange={handleContractChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contract (optional)…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {availableContracts.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-gray-500">No available contracts found.</div>
                      ) : (
                        availableContracts.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            <div className="flex flex-col gap-1 py-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{c.primaryName}</span>
                                <Badge variant="outline" className="text-xs font-mono">[{generateShortCode(c.primaryName)}]</Badge>
                              </div>
                              <div className="text-xs text-gray-500 space-x-3">
                                <span>Contract: {c.purchaseRef}</span>
                                <span>•</span>
                                <span>HKD {c.packagePrice.toLocaleString()}</span>
                                <span>•</span>
                                <span>Qty: {c.sessionsAdded ?? 0}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Optionally select a contract. If selected, the prefix and quantity will be auto-filled.
                  </p>
                </>
              )}
            </div>

            {/* Prefix & Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-blue-900 mb-2">
                  Promo Code Prefix *
                </label>
                <Input
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="e.g. CPA"
                  className="font-mono bg-white"
                  required
                  disabled={isEditMode}
                />
                <p className="text-xs text-blue-700 mt-1">
                  Format: <span className="font-mono font-medium">{prefix || 'PREFIX'}-XXXXXX</span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-900 mb-2">
                  Promo Code Quantity *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={codeCount}
                  onChange={(e) => setCodeCount(Math.max(1, Math.min(10000, Number(e.target.value))))}
                  placeholder="e.g. 100"
                  className="bg-white"
                  required
                  disabled={isEditMode}
                />
                <p className="text-xs text-blue-700 mt-1">Number of unique codes (1 – 10,000)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── STEP 2 : Code Type & Value ──────────────────────────────────── */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-xs">2</div>
            <h2 className="text-base">Code Type & Value</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>Code Type *</label>
              <select
                value={codeType}
                onChange={(e) => {
                  const t = e.target.value as 'Discount' | 'Free bookings';
                  setCodeType(t);
                  setAmount(t === 'Discount' ? 10 : 1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              >
                <option value="Free bookings">Free Bookings</option>
                <option value="Discount">Discount (%)</option>
              </select>
            </div>

            {codeType === 'Discount' && (
              <div>
                <label className="block text-sm" style={{ marginBottom: 10 }}>Discount Percentage (%) *</label>
                <Input
                  type="number" min={1} max={100}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 15"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Percentage discount applied at checkout.</p>
              </div>
            )}

            {codeType === 'Free bookings' && (
              <div>
                <label className="block text-sm" style={{ marginBottom: 10 }}>Number of Free Bookings *</label>
                <Input
                  type="number" min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Complimentary bookings granted per code use.</p>
              </div>
            )}

            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>Use Limit per Code *</label>
              <Input
                type="number" min={1}
                value={useLimit}
                onChange={(e) => setUseLimit(Number(e.target.value))}
                placeholder="e.g. 1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">How many times each individual code can be used.</p>
            </div>

            {/* Reusable by Same User — only shown when useLimit > 1 */}
            {showReusableSection && (
              <div>
                <label className="block text-sm" style={{ marginBottom: 10 }}>Reusable by Same User</label>
                <div className="flex items-center gap-6 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="reusable" checked={reusable === true}  onChange={() => setReusable(true)}  className="w-4 h-4" />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="reusable" checked={reusable === false} onChange={() => setReusable(false)} className="w-4 h-4" />
                    <span className="text-sm">No</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Can the same customer use this code more than once?</p>
              </div>
            )}
          </div>
        </Card>

        {/* ── STEP 3 : Validity & Availability ───────────────────────────── */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-xs">3</div>
            <h2 className="text-base">Validity Period & Availability</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>Start Date *</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>End Date *</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>Availability</label>
              <div className="flex items-center gap-6 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="availability" checked={availability === true}  onChange={() => setAvailability(true)}  className="w-4 h-4" />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="availability" checked={availability === false} onChange={() => setAvailability(false)} className="w-4 h-4" />
                  <span className="text-sm">Inactive</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Enable or disable all codes in this batch.</p>
            </div>
          </div>
        </Card>

        {/* ── STEP 4 : Title (Multilingual) ───────────────────────────────── */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-xs">4</div>
            <h2 className="text-base">Title <span className="text-gray-400 text-sm font-normal">(Multilingual — Optional)</span></h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>Title (English) <span className="text-gray-400 text-xs">(Optional)</span></label>
              <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Enter title in English" />
            </div>
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>Title (Simplified Chinese) <span className="text-gray-400 text-xs">(Optional)</span></label>
              <Input value={titleSimpChi} onChange={(e) => setTitleSimpChi(e.target.value)} placeholder="输入简体中文标题" />
            </div>
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>Title (Traditional Chinese) <span className="text-gray-400 text-xs">(Optional)</span></label>
              <Input value={titleTradChi} onChange={(e) => setTitleTradChi(e.target.value)} placeholder="輸入繁體中文標題" />
            </div>
          </div>
        </Card>

        {/* ── STEP 5 : Description (Multilingual) ────────────────────────── */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-xs">5</div>
            <h2 className="text-base">Description <span className="text-gray-400 text-sm font-normal">(Multilingual — Optional)</span></h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>Description (English) <span className="text-gray-400 text-xs">(Optional)</span></label>
              <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="Enter description in English" rows={3} />
            </div>
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>Description (Simplified Chinese) <span className="text-gray-400 text-xs">(Optional)</span></label>
              <Textarea value={descriptionSimpChi} onChange={(e) => setDescriptionSimpChi(e.target.value)} placeholder="输入简体中文描述" rows={3} />
            </div>
            <div>
              <label className="block text-sm" style={{ marginBottom: 10 }}>Description (Traditional Chinese) <span className="text-gray-400 text-xs">(Optional)</span></label>
              <Textarea value={descriptionTradChi} onChange={(e) => setDescriptionTradChi(e.target.value)} placeholder="輸入繁體中文描述" rows={3} />
            </div>
          </div>
        </Card>

        {/* ── Action Buttons ───────────────────────────────────────────────── */}
        <div className="flex gap-3 justify-end pb-4">
          <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
          <Button type="submit" className="bg-[#0f2942] hover:bg-[#1a3d5c] text-white gap-2">
            <Save className="w-4 h-4" />
            {isEditMode ? 'Update Batch' : 'Save & Generate Codes'}
          </Button>
        </div>
      </form>
    </div>
  );
}