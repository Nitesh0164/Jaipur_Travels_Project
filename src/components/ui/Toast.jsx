import { useUIStore } from '../../store/useUIStore'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const icons = { success: CheckCircle2, error: AlertCircle, info: Info }
const colors = {
  success: 'bg-white border-emerald-200 text-emerald-700',
  error:   'bg-white border-red-200 text-red-700',
  info:    'bg-white border-blue-200 text-blue-700',
}

export default function Toast() {
  const { toasts, showToast } = useUIStore()
  // expose globally so any file can call window.toast(...)
  if (typeof window !== 'undefined') {
    window.toast = showToast
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = icons[t.type] || CheckCircle2
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lift text-sm font-medium min-w-[240px] max-w-xs ${colors[t.type] || colors.success}`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1">{t.message}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
