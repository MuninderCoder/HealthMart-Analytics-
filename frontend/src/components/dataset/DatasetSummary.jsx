import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, BarChart2, Database, HardDrive } from 'lucide-react'

function useAnimatedCounter(target, duration = 1200) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!target) { setCurrent(0); return }
    let frame = 0
    const totalFrames = Math.round(duration / 16)
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)

    const timer = setInterval(() => {
      frame++
      const progress = easeOut(Math.min(frame / totalFrames, 1))
      setCurrent(Math.round(progress * target))
      if (frame >= totalFrames) clearInterval(timer)
    }, 16)

    return () => clearInterval(timer)
  }, [target, duration])

  return current
}

function SummaryCard({ icon: Icon, label, value, suffix = '', raw, color, gradient, delay = 0 }) {
  const animated = useAnimatedCounter(raw || 0)
  const displayValue = raw !== undefined ? animated.toLocaleString() + suffix : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden group cursor-default"
    >
      {/* Gradient accent top-right */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${gradient}`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`w-2 h-2 rounded-full mt-1 animate-pulse ${
          color.includes('blue') ? 'bg-blue-400' :
          color.includes('emerald') ? 'bg-emerald-400' :
          color.includes('violet') ? 'bg-violet-400' :
          'bg-amber-400'
        }`} />
      </div>

      <p className="text-2xl font-extrabold text-slate-900 leading-none mb-1.5 tabular-nums">
        {displayValue}
      </p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </motion.div>
  )
}

export default function DatasetSummary({ summary }) {
  if (!summary) return null

  const cards = [
    {
      icon: FileText,
      label: 'Total Records',
      raw: summary.records,
      suffix: '',
      color: 'bg-blue-500',
      gradient: 'bg-blue-400',
      delay: 0,
    },
    {
      icon: BarChart2,
      label: 'Total Columns',
      raw: summary.columns,
      suffix: '',
      color: 'bg-emerald-500',
      gradient: 'bg-emerald-400',
      delay: 0.07,
    },
    {
      icon: Database,
      label: 'File Type',
      value: summary.fileType,
      color: 'bg-violet-500',
      gradient: 'bg-violet-400',
      delay: 0.14,
    },
    {
      icon: HardDrive,
      label: 'File Size',
      value: summary.fileSize,
      color: 'bg-amber-500',
      gradient: 'bg-amber-400',
      delay: 0.21,
    },
  ]

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </div>
  )
}
