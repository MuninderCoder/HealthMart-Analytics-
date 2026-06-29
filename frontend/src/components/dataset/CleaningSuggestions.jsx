import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Search, Sparkles, AlertCircle } from 'lucide-react'
import EmptyState from './EmptyState'

const PRIORITY_CONFIG = {
  high:   { label: 'High Priority',   color: 'bg-rose-50 text-rose-700 border-rose-200' },
  medium: { label: 'Medium Priority', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: 'Low Priority',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
}

export default function CleaningSuggestions({ suggestions = [] }) {
  const [search, setSearch] = useState('')
  const [activePriority, setActivePriority] = useState('all')

  const counts = useMemo(() => {
    const dict = { all: suggestions.length }
    suggestions.forEach((s) => {
      dict[s.priority] = (dict[s.priority] || 0) + 1
    })
    return dict
  }, [suggestions])

  const filtered = useMemo(() => {
    return suggestions.filter((s) => {
      const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                          s.description.toLowerCase().includes(search.toLowerCase())
      const matchPri = activePriority === 'all' || s.priority === activePriority
      return matchSearch && matchPri
    })
  }, [suggestions, search, activePriority])

  const tabs = [
    { id: 'all', label: 'All Suggestions' },
    { id: 'high', label: 'High Priority' },
    { id: 'medium', label: 'Medium Priority' },
    { id: 'low', label: 'Low Priority' },
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
            placeholder="Search recommendations…"
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {tabs.map((tab) => {
            const count = counts[tab.id] || 0
            if (tab.id !== 'all' && count === 0) return null
            const isActive = activePriority === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActivePriority(tab.id)}
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

      {/* List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <EmptyState
            key="empty"
            icon={Sparkles}
            title="All clear!"
            description="No suggestions match this filter. Your dataset is ready for transaction generation."
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filtered.map((item, idx) => {
              const cfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.low

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-350 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-bold text-slate-850 truncate">{item.title}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${cfg.color}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-405">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      Advice Only
                    </span>
                    <span className="font-semibold text-slate-400">Phase 2B Recommended</span>
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
