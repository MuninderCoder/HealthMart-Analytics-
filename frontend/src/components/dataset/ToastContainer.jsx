import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const CONFIG = {
  success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', iconClass: 'text-emerald-500' },
  error:   { icon: XCircle,     bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-800',    iconClass: 'text-rose-500'    },
  info:    { icon: Info,        bg: 'bg-blue-50',     border: 'border-blue-200',    text: 'text-blue-800',    iconClass: 'text-blue-500'    },
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon: Icon, bg, border, text, iconClass } = CONFIG[toast.type] || CONFIG.info
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${bg} ${border}`}
              role="alert"
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconClass}`} />
              <p className={`text-xs font-medium leading-relaxed flex-1 ${text}`}>{toast.message}</p>
              <button
                onClick={() => onDismiss(toast.id)}
                className={`ml-1 shrink-0 opacity-60 hover:opacity-100 transition-opacity ${text}`}
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
