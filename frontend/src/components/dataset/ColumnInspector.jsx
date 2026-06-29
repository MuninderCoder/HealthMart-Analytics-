import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Info, HelpCircle, Columns, Filter, Hash, Type, FileSpreadsheet } from 'lucide-react'
import EmptyState from './EmptyState'

const TYPE_CONFIG = {
  identifier:  { label: 'Identifier',  color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  numeric:     { label: 'Numeric',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  categorical: { label: 'Categorical', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  date:        { label: 'Date',        color: 'bg-amber-50 text-amber-700 border-amber-200' },
  text:        { label: 'Text',        color: 'bg-slate-100 text-slate-700 border-slate-200' },
  boolean:     { label: 'Boolean',     color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  'multi-value':{ label: 'Multi-value', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  empty:       { label: 'Empty',       color: 'bg-rose-50 text-rose-700 border-rose-200' },
}

export default function ColumnInspector({ analysis = [] }) {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('all')

  const counts = useMemo(() => {
    const total = analysis.length
    const dict = { all: total }
    analysis.forEach((c) => {
      dict[c.type] = (dict[c.type] || 0) + 1
    })
    return dict
  }, [analysis])

  const filtered = useMemo(() => {
    return analysis.filter((c) => {
      const matchSearch = c.col.toLowerCase().includes(search.toLowerCase())
      const matchType = activeType === 'all' || c.type === activeType
      return matchSearch && matchType
    })
  }, [analysis, search, activeType])

  const tabs = [
    { id: 'all', label: 'All Columns' },
    { id: 'identifier', label: 'Identifier' },
    { id: 'numeric', label: 'Numeric' },
    { id: 'categorical', label: 'Categorical' },
    { id: 'multi-value', label: 'Multi-value' },
    { id: 'date', label: 'Date' },
    { id: 'boolean', label: 'Boolean' },
    { id: 'text', label: 'Text' },
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
            placeholder="Search columns…"
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {tabs.map((tab) => {
            const count = counts[tab.id] || 0
            if (tab.id !== 'all' && count === 0) return null
            const isActive = activeType === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id)}
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
            icon={Columns}
            title="No columns found"
            description="Try widening your search query or choosing another type filter."
          />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((item, idx) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.text
              const isMissing = item.missing > 0

              return (
                <motion.div
                  key={item.col}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-350 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3.5">
                      <p className="text-xs font-bold text-slate-800 truncate" title={item.col}>
                        {item.col}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-1.5 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Unique Values</span>
                        <span className="font-semibold text-slate-700">{item.unique.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Missing / Nulls</span>
                        <span className={`font-semibold ${isMissing ? 'text-amber-600' : 'text-slate-700'}`}>
                          {item.missing.toLocaleString()} ({item.missingPct}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Values */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Sample Values
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.sampleValues.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">No samples</span>
                      ) : (
                        item.sampleValues.map((val, sidx) => (
                          <span
                            key={sidx}
                            className="px-2 py-0.5 bg-slate-50 border border-slate-150 rounded text-[10px] text-slate-600 truncate max-w-[120px]"
                            title={val}
                          >
                            {val.length > 20 ? val.slice(0, 18) + '…' : val}
                          </span>
                        ))
                      )}
                    </div>
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
