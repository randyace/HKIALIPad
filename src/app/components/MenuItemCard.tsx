import { AlertTriangle, Minus, Plus } from 'lucide-react'
import type { MenuItem } from '@figma/app/components/GuestKiosk'
import { hasMenuOptions } from '@figma/app/components/ItemOptionsModal'
import { getMatchedAllergens, hasAllergenWarning } from '@/lib/allergyWarning'

const C = {
  bg: '#FFFFFF',
  accent: '#DCB515',
  text: '#403F34',
  textMid: '#403F3499',
  border: '#D6D4C8',
  bg2: '#E7E6DD',
}

const btnAccent = { background: C.accent, color: C.bg } as React.CSSProperties
const btnGhost = { background: C.bg2, color: C.text, border: `1px solid ${C.border}` } as React.CSSProperties

function ProductThumbnail({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  return (
    <img
      src={imageUrl}
      alt={alt}
      loading="lazy"
      className="w-20 aspect-square object-cover shrink-0"
    />
  )
}

export interface MenuItemCardProps {
  item: MenuItem
  qty: number
  activeAllergens: Set<string>
  isStaffMode?: boolean
  onAdd: () => void
  onRemove: () => void
  onCardClick?: () => void
  t: (key: string, values?: Record<string, string | number>) => string
}

export function MenuItemCard({
  item,
  qty,
  activeAllergens,
  isStaffMode = false,
  onAdd,
  onRemove,
  onCardClick,
  t,
}: MenuItemCardProps) {
  const hasWarning = hasAllergenWarning(item.allergens, activeAllergens)
  const showAllergyWarning = isStaffMode && hasWarning
  const matchedAllergens = getMatchedAllergens(item.allergens, activeAllergens)
  const allergenList = item.allergens?.length ? item.allergens.join(', ') : null
  const handleCardClick = onCardClick ?? onAdd

  const cardClassName = `rounded-2xl flex flex-row text-left overflow-hidden relative cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
    showAllergyWarning ? 'border-2 border-red-500 bg-red-50' : ''
  }`

  const cardStyle = showAllergyWarning
    ? undefined
    : {
        background: C.bg,
        border: `1.5px solid ${qty > 0 ? C.accent : C.border}`,
        boxShadow: qty > 0 ? `0 0 0 3px ${C.accent}22` : undefined,
      }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Add ${item.name}`}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleCardClick()
        }
      }}
      className={cardClassName}
      style={cardStyle}
    >
      <div className="relative shrink-0 overflow-hidden pointer-events-none">
        <ProductThumbnail imageUrl={item.image} alt={item.name} />
        {showAllergyWarning ? (
          <div
            className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center bg-red-100 shadow"
            aria-hidden="true"
          >
            <AlertTriangle className="w-3 h-3 text-red-500" />
          </div>
        ) : null}
      </div>

      <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between pointer-events-none">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-sm leading-tight" style={{ color: C.text }}>
              {item.name}
            </p>
            {hasMenuOptions(item) ? (
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                {t('menu.options')}
              </span>
            ) : null}
            {(item.dietaryTags ?? []).map((tag) => (
              <span
                key={`${item.id}-${tag}`}
                className="px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 rounded-full uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[10px] font-medium uppercase tracking-wide mt-0.5" style={{ color: C.accent }}>
            {item.posCategoryName ?? item.category}
          </p>
          {allergenList ? (
            <p
              className={`text-xs leading-tight mt-0.5 line-clamp-2 ${
                showAllergyWarning ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              {showAllergyWarning
                ? `⚠️ ${t('menu.contains')}: ${matchedAllergens.join(', ')}`
                : `${t('menu.contains')}: ${allergenList}`}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="relative z-10 flex items-center pr-3 shrink-0 self-center"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {qty === 0 ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              event.preventDefault()
              onAdd()
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center active:scale-95 min-h-[44px] min-w-[44px] ${
              showAllergyWarning ? 'bg-red-600 text-white' : ''
            }`}
            style={showAllergyWarning ? undefined : btnAccent}
            aria-label={
              showAllergyWarning
                ? `${t('menu.addWithCaution')} ${item.name}`
                : `Add ${item.name}`
            }
          >
            {showAllergyWarning ? (
              <span className="text-[9px] font-bold leading-none px-1">!</span>
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                onRemove()
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all min-h-[44px] min-w-[44px]"
              style={btnGhost}
              aria-label={`Remove ${item.name}`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold w-5 text-center" style={{ color: C.text }}>
              {qty}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                onAdd()
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all min-h-[44px] min-w-[44px]"
              style={showAllergyWarning ? { background: '#dc2626', color: '#fff' } : btnAccent}
              aria-label={`Add another ${item.name}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
