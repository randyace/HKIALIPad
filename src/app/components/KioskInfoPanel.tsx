import type { ReactNode } from 'react'
import { AlertTriangle, Clock, Leaf, MapPin, Plane, User, Users } from 'lucide-react'

const C = {
  bg: '#FFFFFF',
  bg2: '#E7E6DD',
  accent: '#DCB515',
  accentDim: '#DCB51522',
  text: '#403F34',
  textMid: '#403F3499',
  textLight: '#403F3455',
  border: '#D6D4C8',
} as const

export interface KioskInfoPanelAllergy {
  allergen: string
  severity?: 'Mild' | 'Moderate' | 'Severe'
}

export interface KioskInfoPanelGuestProfile {
  name: string
  relation: string
  allergies: Array<string | KioskInfoPanelAllergy>
  dietary: string[]
}

export interface KioskInfoPanelBooking {
  bookingNo: string
  memberName: string
  accountNo: string
  membershipTier?: string | null
  checkInTime?: string | null
  flightNo?: string | null
  flightTime?: string | null
  flightDestination?: string | null
  numberOfGuests?: number | null
  internalNotes?: string | null
  guestProfiles: KioskInfoPanelGuestProfile[]
}

export interface KioskInfoPanelProps {
  booking: KioskInfoPanelBooking
  t: (key: string, values?: Record<string, string | number>) => string
  footer?: ReactNode
  isLoading?: boolean
}

function normalizeAllergy(allergy: string | KioskInfoPanelAllergy): KioskInfoPanelAllergy {
  if (typeof allergy === 'string') {
    return { allergen: allergy, severity: 'Severe' }
  }

  return {
    allergen: allergy.allergen,
    severity: allergy.severity ?? 'Severe',
  }
}

function allergyTagClass(severity: KioskInfoPanelAllergy['severity']): string {
  if (severity === 'Moderate') {
    return 'bg-orange-50 text-orange-600 border-orange-200'
  }
  if (severity === 'Mild') {
    return 'bg-yellow-50 text-yellow-700 border-yellow-200'
  }
  return 'bg-red-50 text-red-600 border-red-200'
}

function displayValue(value: string | null | undefined, isLoading: boolean): string {
  if (isLoading && (!value || value.trim() === '' || value === '—')) {
    return '…'
  }
  return value?.trim() || '—'
}

function membershipTierPillClass(tier: string): string {
  const normalized = tier.trim().toLowerCase()
  if (normalized.includes('gold') || normalized.includes('platinum')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  return 'border'
}

export function KioskInfoPanel({ booking, t, footer, isLoading = false }: KioskInfoPanelProps) {
  const guestsWithRecords = booking.guestProfiles.filter(
    (guest) => guest.allergies.length > 0 || guest.dietary.length > 0,
  )

  return (
    <aside
      className="w-72 shrink-0 flex flex-col h-full overflow-hidden border-l"
      style={{ borderColor: C.border, background: C.bg2 }}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-1.5 mb-3">
            <User className="w-3.5 h-3.5" style={{ color: C.textMid }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: C.textMid }}>
              {t('info.member')}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold" style={{ color: C.text }}>
                  {displayValue(booking.memberName, isLoading)}
                </p>
                {booking.membershipTier?.trim() ? (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${membershipTierPillClass(booking.membershipTier)}`}
                    style={
                      membershipTierPillClass(booking.membershipTier) === 'border'
                        ? {
                            background: C.accentDim,
                            color: C.accent,
                            borderColor: `${C.accent}55`,
                          }
                        : undefined
                    }
                  >
                    {booking.membershipTier}
                  </span>
                ) : null}
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                <span className="text-xs uppercase tracking-wider mr-1" style={{ color: C.textMid }}>
                  {t('staff.account_no')}
                </span>
                {displayValue(booking.accountNo, isLoading)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5" style={{ color: C.textMid }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: C.textMid }}>
              {t('info.booking')}
            </span>
          </div>
          <p className="text-xs font-mono font-semibold mb-3" style={{ color: C.accent }}>
            {displayValue(booking.bookingNo, isLoading)}
          </p>
          <div className="space-y-2">
            {[
              { icon: Clock, label: t('info.check_in'), val: displayValue(booking.checkInTime, isLoading) },
              {
                icon: Users,
                label: t('info.guests'),
                val:
                  booking.numberOfGuests != null
                    ? t('occupied_dialog.pax', { count: booking.numberOfGuests })
                    : '—',
              },
              { icon: Plane, label: t('info.flight'), val: displayValue(booking.flightNo, isLoading) },
              { icon: null, label: t('info.departure'), val: displayValue(booking.flightTime, isLoading) },
              {
                icon: null,
                label: t('info.destination'),
                val: displayValue(booking.flightDestination, isLoading),
              },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5" style={{ color: C.textMid }}>
                  {Icon ? <Icon className="w-3 h-3" /> : null}
                  {label}
                </span>
                <span style={{ color: C.text }}>{val}</span>
              </div>
            ))}
          </div>
          {booking.internalNotes?.trim() ? (
            <div className="mt-4 rounded-xl border p-3" style={{ borderColor: C.border, background: C.bg }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: C.textMid }}>
                {t('staff_dashboard.internal_notes')}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: C.text }}>
                {booking.internalNotes}
              </p>
            </div>
          ) : null}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs uppercase tracking-wider text-red-500">
              {t('info.allergies_dietary')}
            </span>
          </div>
          <div className="space-y-3">
            {guestsWithRecords.map((guest) => (
              <div
                key={`${guest.name}-${guest.relation}`}
                className="rounded-xl p-3"
                style={{ background: C.bg, border: `1px solid ${C.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold" style={{ color: C.text }}>
                    {guest.name}
                  </p>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: C.bg2, color: C.textMid }}
                  >
                    {guest.relation}
                  </span>
                </div>
                {guest.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {guest.allergies.map((allergy, index) => {
                      const normalized = normalizeAllergy(allergy)
                      return (
                        <span
                          key={`${guest.name}-allergy-${normalized.allergen}-${index}`}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${allergyTagClass(normalized.severity)}`}
                        >
                          {normalized.severity === 'Severe' ? '⚠ ' : ''}
                          {normalized.allergen}
                        </span>
                      )
                    })}
                  </div>
                ) : null}
                {guest.dietary.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {guest.dietary.map((dietary) => (
                      <span
                        key={`${guest.name}-dietary-${dietary}`}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1"
                      >
                        <Leaf className="w-2.5 h-2.5" />
                        {dietary}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {footer ? (
        <div className="shrink-0 border-t p-4" style={{ borderColor: C.border, background: C.bg }}>
          {footer}
        </div>
      ) : null}
    </aside>
  )
}
