import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, AlertCircle, Search, Sparkles } from 'lucide-react'
import EmptyState from './EmptyState'

const SEV_CONFIG = {
  high:   { label: 'High',   color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle, iconClass: 'text-rose-500' },
  medium: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle, iconClass: 'text-amber-500' },
  low:    { label: 'Low',    color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertTriangle, iconClass: 'text-blue-500' },
  pass:   { label: 'Pass',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, iconClass: 'text-emerald-500' },
}

export default function QualityInspector({ checks = [] }) {
  const [search, setSearch] = useState('')
  const [activeSeverity, setActiveSeverity] = useState('all')

  const counts = useMemo(() => {
    const dict = { all: checks.length }
    checks.forEach((c) => {
      dict[c.severity] = (dict[c.severity] || 0) + 1
    })
    return dict
  }, [checks])

  const filtered = useMemo(() => {
    return checks.filter((c) => {
      const matchSearch = c.label.toLowerCase().includes(search.toLowerCase()) ||
                          c.message.toLowerCase().includes(search.toLowerCase())
      const matchSev = activeSeverity === 'all' || c.severity === activeSeverity
      return matchSearch && matchSev
    })
  }, [checks, search, activeSeverity])

  const tabs = [
    { id: 'all', label: 'All Checks' },
    { id: 'high', label: 'High Severity' },
    { id: 'medium', label: 'Medium Severity' },
    { id: 'low', label: 'Low Severity' },
    { id: 'pass', label: 'Passed' },
  ]

  return (
    <div className="space-y-5">
      {/* Search & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search checks…"
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {tabs.map((tab) => {
            const count = counts[tab.id] || 0
            if (tab.id !== 'all' && count === 0) return null
            const isActive = activeSeverity === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSeverity(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 border border-transparent ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                  isActive ? 'bg-slate-800 text-white' : 'bg-slate-200/60 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <EmptyState
            key="empty"
            icon={Sparkles}
            title="No quality issues match"
            description="All checks meet current search filters. Your dataset is looking clean!"
          />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filtered.map((item, idx) => {
              const cfg = SEV_CONFIG[item.severity] || SEV_CONFIG.pass
              const Icon = cfg.icon

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`flex items-start gap-4 p-4 bg-white rounded-xl border hover:shadow-sm transition-all duration-200 ${
                    item.severity === 'high'
                      ? 'border-rose-100 hover:border-rose-200'
                      : item.severity === 'medium'
                      ? 'border-amber-100 hover:border-amber-200'
                      : item.severity === 'low'
                      ? 'border-blue-100 hover:border-blue-200'
                      : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.severity === 'high' ? 'bg-rose-50' :
                    item.severity === 'medium' ? 'bg-amber-50' :
                    item.severity === 'low' ? 'bg-blue-50' :
                    'bg-emerald-50'
                  }`}>
                    <Icon className={`w-4.5 h-4.5 ${cfg.iconClass}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.label}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-650 leading-relaxed">{item.message}</p>
                    {item.count > 0 && (
                      <p className="text-[10px] text-slate-400 font-medium mt-2">
                        Affected items: <span className="font-semibold text-slate-500">{item.count.toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
