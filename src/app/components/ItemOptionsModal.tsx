import { motion } from 'motion/react'
import { useState } from 'react'
import { X } from 'lucide-react'

const C = {
  bg: '#FFFFFF',
  bg2: '#E7E6DD',
  accent: '#DCB515',
  accentDim: '#DCB51522',
  text: '#403F34',
  textMid: '#403F3499',
  textLight: '#403F3455',
  border: '#D6D4C8',
}

const btnAccent = { background: C.accent, color: C.bg } as React.CSSProperties
const btnGhost = { background: C.bg2, color: C.text, border: `1px solid ${C.border}` } as React.CSSProperties

export interface SelectedMenuOption {
  optionId: number
  name: string
  groupName: string
}

export interface MenuOptionGroup {
  id: number
  name: string
  selectionType: 'single' | 'multiple'
  isRequired: boolean
  options: Array<{ id: number; name: string }>
}

export interface MenuItemForOptions {
  id: string
  name: string
  category: string
  optionGroups?: MenuOptionGroup[]
}

export interface ItemOptionsModalProps {
  item: MenuItemForOptions
  t: (key: string) => string
  onClose: () => void
  onConfirm: (selectedOptions: SelectedMenuOption[]) => void
}

export function ItemOptionsModal({ item, t, onClose, onConfirm }: ItemOptionsModalProps) {
  const groups = item.optionGroups ?? []
  const [selectedByGroup, setSelectedByGroup] = useState<Record<number, number[]>>(() => {
    const initial: Record<number, number[]> = {}
    for (const group of groups) {
      initial[group.id] = []
    }
    return initial
  })

  const toggleOption = (group: MenuOptionGroup, optionId: number) => {
    setSelectedByGroup((prev) => {
      const current = prev[group.id] ?? []
      if (group.selectionType === 'single') {
        return { ...prev, [group.id]: [optionId] }
      }
      return current.includes(optionId)
        ? { ...prev, [group.id]: current.filter((id) => id !== optionId) }
        : { ...prev, [group.id]: [...current, optionId] }
    })
  }

  const isValid = groups.every((group) => {
    const count = selectedByGroup[group.id]?.length ?? 0
    if (group.isRequired) {
      return count > 0
    }
    return true
  })

  const handleConfirm = () => {
    const selectedOptions: SelectedMenuOption[] = []
    for (const group of groups) {
      const optionIds = selectedByGroup[group.id] ?? []
      for (const optionId of optionIds) {
        const option = group.options.find((entry) => entry.id === optionId)
        if (option) {
          selectedOptions.push({
            optionId: option.id,
            name: option.name,
            groupName: group.name,
          })
        }
      }
    }
    onConfirm(selectedOptions)
  }

  return (
    <motion.div
      key="options-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="rounded-3xl p-7 w-[420px] max-h-[80vh] overflow-y-auto shadow-2xl"
        style={{ background: C.bg, border: `1px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="font-semibold" style={{ color: C.text }}>{item.name}</p>
            <p className="text-xs mt-0.5" style={{ color: C.textMid }}>{item.category}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: C.textLight, background: C.bg2 }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 mb-6">
          {groups.map((group) => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold" style={{ color: C.text }}>{group.name}</p>
                {group.isRequired && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {t('options.required')}
                  </span>
                )}
              </div>
              <p className="text-xs mb-2" style={{ color: C.textMid }}>
                {group.selectionType === 'single' ? t('options.selectOne') : t('options.selectMultiple')}
              </p>
              <div className="space-y-2">
                {group.options.map((option) => {
                  const checked = (selectedByGroup[group.id] ?? []).includes(option.id)
                  return (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors"
                      style={{
                        borderColor: checked ? C.accent : C.border,
                        background: checked ? C.accentDim : C.bg2,
                      }}
                    >
                      <input
                        type={group.selectionType === 'single' ? 'radio' : 'checkbox'}
                        name={`option-group-${group.id}`}
                        checked={checked}
                        onChange={() => toggleOption(group, option.id)}
                        className="w-4 h-4 accent-[#DCB515]"
                      />
                      <span className="text-sm" style={{ color: C.text }}>{option.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all"
            style={btnGhost}
          >
            {t('options.cancel')}
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
            style={btnAccent}
          >
            {t('options.confirm')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function hasMenuOptions(item: { optionGroups?: MenuOptionGroup[] }): boolean {
  return (item.optionGroups?.length ?? 0) > 0
}
