import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Loader2, Save, Shuffle } from 'lucide-react';
import { Textarea } from './ui/textarea';

export interface BookableItemFormData {
  nameEn: string;
  nameSimp: string;
  nameTrad: string;
  category: string;
  descriptionEn: string;
  descriptionSimp: string;
  descriptionTrad: string;
  price: number;
  discountRate: number;
  priceCalEquation: string;
  availability: string;
  stock: string;
  priority: number;
}

export interface BookableItemEditProps {
  itemId?: number | null;
  isLoading?: boolean;
  initialData?: BookableItemFormData;
  onBack?: () => void;
  onSave?: (formData: BookableItemFormData) => void;
}

export function BookableItemEdit({ itemId, isLoading, initialData, onBack, onSave }: BookableItemEditProps) {
  const isEditMode = !!itemId;

  const [formData, setFormData] = useState<BookableItemFormData>({
    nameEn: '',
    nameSimp: '',
    nameTrad: '',
    category: 'Suite',
    descriptionEn: '',
    descriptionSimp: '',
    descriptionTrad: '',
    price: 0,
    discountRate: 0,
    priceCalEquation: 'unitPrice',
    availability: 'available',
    stock: '',
    priority: 1,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  // ── Quick Fill for Demo ───────────────────────────────────────────────────
  const handleQuickFill = () => {
    setFormData({
      nameEn: 'Premium Champagne Lounge',
      nameSimp: '高级香槟休息室',
      nameTrad: '高級香檳休息室',
      category: 'Suite',
      descriptionEn: 'Exclusive champagne lounge with panoramic airport views and premium beverage service',
      descriptionSimp: '独享香槟休息室，拥有全景机场景观和高级饮品服务',
      descriptionTrad: '獨享香檳休息室，擁有全景機場景觀和高級飲品服務',
      price: 2500,
      discountRate: 10,
      priceCalEquation: '(qty * unitPrice) - discount',
      availability: 'available',
      stock: '',
      priority: 2,
    });
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookable Items
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>{isEditMode ? 'Edit Bookable Item' : 'Create New Bookable Item'}</h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update the details of the bookable item' : 'Enter the details of the new bookable item'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditMode && (
            <Button
              type="button"
              variant="outline"
              onClick={handleQuickFill}
              className="gap-1 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border-yellow-400/50 text-yellow-700 hover:from-yellow-400/30 hover:to-amber-400/30 hover:border-yellow-500/70 hover:text-yellow-800 transition-all text-[10px] px-2 py-0.5 h-[25px]"
            >
              <Shuffle className="w-3 h-3" />
              Quick Fill Demo
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2.5">Item English Name</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., VIP Suite A"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2.5">Item Simp Chi Name</label>
                  <input
                    type="text"
                    value={formData.nameSimp}
                    onChange={(e) => setFormData({ ...formData, nameSimp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 贵宾套房A"
                  />
                </div>
                <div>
                  <label className="block mb-2.5">Item Trad Chi Name</label>
                  <input
                    type="text"
                    value={formData.nameTrad}
                    onChange={(e) => setFormData({ ...formData, nameTrad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 貴賓套房A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="Suite">Suite</option>
                    <option value="Transfer Services">Transfer Services</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2.5">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="1"
                    min="1"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Descriptions */}
          <Card className="p-6">
            <h2 className="mb-4">Descriptions</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2.5">Description (English)</label>
                <Textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="Detailed description of the item in English..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block mb-2.5">Description (Simplified Chinese)</label>
                <Textarea
                  value={formData.descriptionSimp}
                  onChange={(e) => setFormData({ ...formData, descriptionSimp: e.target.value })}
                  placeholder="简体中文描述..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block mb-2.5">Description (Traditional Chinese)</label>
                <Textarea
                  value={formData.descriptionTrad}
                  onChange={(e) => setFormData({ ...formData, descriptionTrad: e.target.value })}
                  placeholder="繁體中文描述..."
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Pricing & Availability */}
          <Card className="p-6">
            <h2 className="mb-4">Pricing & Availability</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2.5">Base Price (HK$)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2.5">Discount Rate (%)</label>
                  <input
                    type="number"
                    value={formData.discountRate}
                    onChange={(e) => setFormData({ ...formData, discountRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2.5">Price Cal Equation</label>
                <input
                  type="text"
                  value={formData.priceCalEquation}
                  onChange={(e) => setFormData({ ...formData, priceCalEquation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md font-mono"
                  placeholder="e.g., unitPrice or (qty * unitPrice) - discount"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Define the calculation formula for pricing. Examples: <code className="bg-gray-100 px-1 rounded">unitPrice</code>, <code className="bg-gray-100 px-1 rounded">(qty * unitPrice) - discount</code>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2.5">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2.5">Stock Quantity (Optional)</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Leave blank for unlimited"
                    min="0"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Only applicable for items with limited availability
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <Card className="p-6">
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <Save className="w-4 h-4" />
                {isEditMode ? 'Save Changes' : 'Create Item'}
              </Button>
            </div>
          </Card>
        </div>
      </form>
      )}
    </div>
  );
}