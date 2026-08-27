import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Save, Shuffle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const MOCK_SETTINGS = {
  defaultCutoffHours: 3,
  maxGuestsPerBooking: 6,
  allowAdHocBookings: true,
  requireFlightInfo: true,
  enableSMSNotifications: true,
  enableEmailNotifications: true,
  autoApproveVIP: false,
  autoApproveCorporate: false,
  limousineLeadTime: 24,
  minBookingAdvance: 2,
  maxBookingAdvance: 90,
  allowNonFlyingGuests: true,
  requirePaymentForUpfront: true,
  paymentLinkExpiry: 48,
};

export type BookingSettingsData = typeof MOCK_SETTINGS;

export interface BookingSettingsProps {
  settings?: BookingSettingsData;
  onBack?: () => void;
  onSave?: (settings: BookingSettingsData) => void;
}

export function BookingSettings({ settings: settingsProp, onBack = () => {}, onSave }: BookingSettingsProps = {}) {
  const [settings, setSettings] = useState<BookingSettingsData>(settingsProp ?? MOCK_SETTINGS);

  const handleSave = () => {
    onSave?.(settings);
    toast.success('Booking settings updated successfully');
  };

  // ── Quick Fill for Demo ───────────────────────────────────────────────────
  const handleQuickFill = () => {
    setSettings({
      defaultCutoffHours: 4,
      maxGuestsPerBooking: 8,
      allowAdHocBookings: true,
      requireFlightInfo: true,
      enableSMSNotifications: true,
      enableEmailNotifications: true,
      autoApproveVIP: true,
      autoApproveCorporate: false,
      limousineLeadTime: 48,
      minBookingAdvance: 3,
      maxBookingAdvance: 120,
      allowNonFlyingGuests: true,
      requirePaymentForUpfront: true,
      paymentLinkExpiry: 72,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1>Booking Settings</h1>
          <p className="text-gray-600">Configure system-wide booking parameters</p>
        </div>
        <div className="ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleQuickFill}
            className="gap-1 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border-yellow-400/50 text-yellow-700 hover:from-yellow-400/30 hover:to-amber-400/30 hover:border-yellow-500/70 hover:text-yellow-800 transition-all text-[10px] px-2 py-0.5 h-[25px]"
          >
            <Shuffle className="w-3 h-3" />
            Quick Fill Demo
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <h3 className="mb-4">General Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Default Cutoff Hours</label>
            <input
              type="number"
              value={settings.defaultCutoffHours}
              onChange={(e) => setSettings({ ...settings, defaultCutoffHours: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              min="1"
              max="48"
            />
            <p className="text-sm text-gray-600 mt-1">Hours before flight time to cutoff booking</p>
          </div>
          <div>
            <label>Maximum Guests Per Booking</label>
            <input
              type="number"
              value={settings.maxGuestsPerBooking}
              onChange={(e) => setSettings({ ...settings, maxGuestsPerBooking: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              min="1"
              max="20"
            />
            <p className="text-sm text-gray-600 mt-1">Maximum number of guests allowed</p>
          </div>
          <div>
            <label>Minimum Booking Advance (hours)</label>
            <input
              type="number"
              value={settings.minBookingAdvance}
              onChange={(e) => setSettings({ ...settings, minBookingAdvance: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              min="1"
            />
            <p className="text-sm text-gray-600 mt-1">Minimum hours in advance for booking</p>
          </div>
          <div>
            <label>Maximum Booking Advance (days)</label>
            <input
              type="number"
              value={settings.maxBookingAdvance}
              onChange={(e) => setSettings({ ...settings, maxBookingAdvance: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              min="1"
            />
            <p className="text-sm text-gray-600 mt-1">Maximum days in advance for booking</p>
          </div>
        </div>
      </Card>

      {/* Booking Options */}
      <Card className="p-6">
        <h3 className="mb-4">Booking Options</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.allowAdHocBookings}
              onChange={(e) => setSettings({ ...settings, allowAdHocBookings: e.target.checked })}
              className="w-4 h-4"
            />
            <div>
              <div className="text-gray-900">Allow Ad-hoc Bookings</div>
              <p className="text-sm text-gray-600">Enable walk-in bookings without prior reservation</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.requireFlightInfo}
              onChange={(e) => setSettings({ ...settings, requireFlightInfo: e.target.checked })}
              className="w-4 h-4"
            />
            <div>
              <div className="text-gray-900">Require Flight Information</div>
              <p className="text-sm text-gray-600">Make flight details mandatory for all bookings</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.allowNonFlyingGuests}
              onChange={(e) => setSettings({ ...settings, allowNonFlyingGuests: e.target.checked })}
              className="w-4 h-4"
            />
            <div>
              <div className="text-gray-900">Allow Non-flying Guests</div>
              <p className="text-sm text-gray-600">Permit guests who are not flying (e.g., companions)</p>
            </div>
          </label>
        </div>
      </Card>

      {/* Approval Automation */}
      <Card className="p-6">
        <h3 className="mb-4">Approval Automation</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.autoApproveVIP}
              onChange={(e) => setSettings({ ...settings, autoApproveVIP: e.target.checked })}
              className="w-4 h-4"
            />
            <div>
              <div className="text-gray-900">Auto-approve VIP Bookings</div>
              <p className="text-sm text-gray-600">Automatically approve bookings from VIP customers</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.autoApproveCorporate}
              onChange={(e) => setSettings({ ...settings, autoApproveCorporate: e.target.checked })}
              className="w-4 h-4"
            />
            <div>
              <div className="text-gray-900">Auto-approve Corporate Bookings</div>
              <p className="text-sm text-gray-600">Automatically approve bookings from corporate accounts</p>
            </div>
          </label>
        </div>
      </Card>

      {/* Service Settings */}
      <Card className="p-6">
        <h3 className="mb-4">Service Settings</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label>Limousine Lead Time (hours)</label>
            <input
              type="number"
              value={settings.limousineLeadTime}
              onChange={(e) => setSettings({ ...settings, limousineLeadTime: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              min="1"
              max="72"
            />
            <p className="text-sm text-gray-600 mt-1">Minimum hours in advance to book limousine service</p>
          </div>
        </div>
      </Card>

      {/* Payment Settings */}
      <Card className="p-6">
        <h3 className="mb-4">Payment Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.requirePaymentForUpfront}
              onChange={(e) => setSettings({ ...settings, requirePaymentForUpfront: e.target.checked })}
              className="w-4 h-4"
            />
            <div>
              <div className="text-gray-900">Require Payment for Upfront Bookings</div>
              <p className="text-sm text-gray-600">Payment must be completed before confirmation</p>
            </div>
          </label>
          <div>
            <label>Payment Link Expiry (hours)</label>
            <input
              type="number"
              value={settings.paymentLinkExpiry}
              onChange={(e) => setSettings({ ...settings, paymentLinkExpiry: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              min="1"
              max="168"
            />
            <p className="text-sm text-gray-600 mt-1">Hours until payment link expires</p>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h3 className="mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableEmailNotifications}
              onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
              className="w-4 h-4"
            />
            <div>
              <div className="text-gray-900">Enable Email Notifications</div>
              <p className="text-sm text-gray-600">Send booking confirmations and updates via email</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableSMSNotifications}
              onChange={(e) => setSettings({ ...settings, enableSMSNotifications: e.target.checked })}
              className="w-4 h-4"
            />
            <div>
              <div className="text-gray-900">Enable SMS Notifications</div>
              <p className="text-sm text-gray-600">Send booking reminders and updates via SMS</p>
            </div>
          </label>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}