import { useState, useRef, useEffect } from'react'
import { Button } from'@maya/shared-ui-react'
import { useLocale } from'../../../shared/i18n'
import { WIDGET_REGISTRY } from'../widgets/registry'

function DashboardEditToolbar({ layout, onSave, onCancel, onAddWidget, onReset }) {
 const { t } = useLocale()
 const [dropdownOpen, setDropdownOpen] = useState(false)
 const dropdownRef = useRef(null)

 useEffect(() => {
 if (!dropdownOpen) return
 function handleClick(e) {
 if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
 }
 document.addEventListener('mousedown', handleClick)
 return () => document.removeEventListener('mousedown', handleClick)
 }, [dropdownOpen])

 const existingIds = new Set(layout.map((item) => item.i))
 const availableToAdd = Object.values(WIDGET_REGISTRY).filter((def) => !existingIds.has(def.id))

 return (<div className="sticky top-0 z-20 -mx-4 sm:-mx-6 mb-4 px-4 sm:px-6 py-2 bg-surface-container-low/95 backdrop-blur border-b border-outline">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="text-xs font-medium text-on-surface-variant mr-2">
 {t('dashboard.editMode')}
 </span>
 <Button variant="primary" size="xs" onClick={onSave}>
 {t('dashboard.save')}
 </Button>
 <Button variant="secondary" size="xs" onClick={onCancel}>
 {t('dashboard.cancel')}
 </Button>
 <div className="relative" ref={dropdownRef}>
 <Button
 variant="outlineWarning"
 size="xs"
 onClick={() => setDropdownOpen((v) => !v)}
 disabled={availableToAdd.length === 0}
 >
 + {t('dashboard.addWidget')}
 </Button>
 {dropdownOpen && availableToAdd.length > 0 && (<div
 role="menu"
 className="absolute left-0 top-full mt-1 z-[300] min-w-[180px] bg-surface-container-low border border-outline rounded-xl shadow-lg overflow-hidden"
 >
 {availableToAdd.map((def) => (<button
 key={def.id}
 type="button"
 role="menuitem"
 onClick={() => { onAddWidget(def.id); setDropdownOpen(false) }}
 className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface transition"
 >
 {t(def.titleKey)}
 </button>
 ))}
 </div>
 )}
 </div>
 <Button variant="outline" size="xs" onClick={onReset}>
 {t('dashboard.resetLayout')}
 </Button>
 </div>
 </div>
 )
}

export default DashboardEditToolbar
