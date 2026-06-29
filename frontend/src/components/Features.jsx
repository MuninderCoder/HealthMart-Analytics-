import { motion } from 'framer-motion'
import {
  Activity, Pill, BarChart3, Sparkles, Cpu, ShieldCheck
} from 'lucide-react'
import { features } from '../data/dummyData'

const iconMap = { Activity, Pill, BarChart3, Sparkles, Cpu, ShieldCheck }

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    border: 'border-blue-100',
    hover: 'group-hover:bg-blue-600',
    dot: 'bg-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-100',
    hover: 'group-hover:bg-emerald-600',
    dot: 'bg-emerald-500',
  },
  violet: {
    bg: 'bg-violet-50',
    icon: 'bg-violet-100 text-violet-600',
    border: 'border-violet-100',
    hover: 'group-hover:bg-violet-600',
    dot: 'bg-violet-500',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    border: 'border-amber-100',
    hover: 'group-hover:bg-amber-600',
    dot: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'bg-rose-100 text-rose-600',
    border: 'border-rose-100',
    hover: 'group-hover:bg-rose-600',
    dot: 'bg-rose-500',
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'bg-teal-100 text-teal-600',
    border: 'border-teal-100',
    hover: 'group-hover:bg-teal-600',
    dot: 'bg-teal-500',
  },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white relative">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Powerful Capabilities
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Everything you need to{' '}
            <span className="text-gradient">analyze healthcare data</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            From raw datasets to actionable insights — our platform covers the entire analytics lifecycle for healthcare organizations.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feat) => {
            const Icon = iconMap[feat.icon]
            const c = colorMap[feat.color]
            return (
              <motion.div
                key={feat.id}
                variants={item}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-white rounded-2xl border border-slate-200 card-shadow p-6 cursor-pointer hover:border-slate-300 hover:card-shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Top color accent */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${feat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${c.icon} mb-4 transition-colors duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Badge */}
                <div className={`absolute top-5 right-5 w-2 h-2 rounded-full ${c.dot} opacity-40 group-hover:opacity-100 transition-opacity`} />

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feat.description}
                </p>

                {/* Learn more */}
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  Learn more
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
