import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
          <Icon className="w-9 h-9 text-slate-300" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
          <span className="text-[10px]">⟳</span>
        </div>
      </div>
      <p className="text-sm font-bold text-slate-600 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </motion.div>
  )
}
