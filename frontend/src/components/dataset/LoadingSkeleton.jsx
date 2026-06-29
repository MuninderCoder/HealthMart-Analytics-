import { motion } from 'framer-motion'

function SkeletonRow({ cols = 6, delay = 0 }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3 border-b border-slate-100">
          <div
            className="shimmer h-3.5 rounded-full"
            style={{ width: `${50 + Math.random() * 40}%` }}
          />
        </td>
      ))}
    </motion.tr>
  )
}

export default function LoadingSkeleton({ rows = 8, cols = 6 }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      {/* Fake header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="shimmer h-3 rounded-full" style={{ width: `${60 + i * 8}px` }} />
        ))}
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} delay={i * 0.04} />
          ))}
        </tbody>
      </table>
      {/* Fake pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
        <div className="shimmer h-3 w-24 rounded-full" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer h-7 w-7 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
