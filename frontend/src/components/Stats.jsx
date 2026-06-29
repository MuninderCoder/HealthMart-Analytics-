import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Building2, FileText, Pill, BarChart3 } from 'lucide-react'
import { stats } from '../data/dummyData'

const iconMap = { Hospital: Building2, FileText, Pill, BarChart3 }

function useCountUp(end, duration = 2000, started = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!started) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * end)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, end, duration])

  return count
}

function StatCard({ stat, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const Icon = iconMap[stat.icon] || BarChart3

  const displayValue = stat.value >= 1000
    ? useCountUp(stat.value, 2000, isInView).toLocaleString('en-US', { maximumFractionDigits: 0 })
    : useCountUp(stat.value, 2000, isInView).toFixed(1)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl border border-slate-200 card-shadow-md p-7 text-center overflow-hidden hover:border-blue-200 hover:card-shadow-lg transition-all duration-300"
    >
      {/* Gradient bg on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-emerald-100 mb-4">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>

        {/* Value */}
        <div className="flex items-baseline justify-center gap-0.5 mb-2">
          <span className="text-4xl font-extrabold text-slate-900 tabular-nums tracking-tight">
            {displayValue}
          </span>
          <span className="text-2xl font-bold text-gradient ml-0.5">{stat.suffix}</span>
        </div>

        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
      </div>
    </motion.div>
  )
}

export default function Stats() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Decorative orbs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-200/20 blur-3xl" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-200/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Trusted by Healthcare Leaders
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Numbers that speak{' '}
            <span className="text-gradient">for themselves</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Driving evidence-based decisions across hospitals, pharmacies, and research institutions worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <StatCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
