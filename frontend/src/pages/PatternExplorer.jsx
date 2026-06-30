import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronRight, Sliders, AlertCircle, Database, Grid, Eye, CheckCircle, HelpCircle } from 'lucide-react'
import { api } from '../utils/api'
import { NavLink } from 'react-router-dom'

export default function PatternExplorer() {
  const [datasets, setDatasets] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [datasetDetails, setDatasetDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Mining results loaded from local storage
  const [miningResults, setMiningResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [supportFilter, setSupportFilter] = useState(0.0)
  const [sortBy, setSortBy] = useState('support-desc') // support-desc | support-asc | level-desc | level-asc
  const [expandedPattern, setExpandedPattern] = useState(null) // selected itemset object

  // Transaction pagination
  const [txPage, setTxPage] = useState(1)
  const txPerPage = 8

  // 1. Fetch history list on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const list = await api.getDatasets()
        setDatasets(list)
        
        const activeId = localStorage.getItem('hm_active_dataset_id')
        if (activeId && list.some(d => d.id === activeId)) {
          setSelectedId(activeId)
        } else if (list.length > 0) {
          setSelectedId(list[0].id)
        }
      } catch (_) {
        setError('Failed to fetch dataset list from server.')
      }
    }
    fetchHistory()

    const savedMining = localStorage.getItem('hm_mining_results')
    if (savedMining) {
      try {
        setMiningResults(JSON.parse(savedMining))
      } catch (_) {}
    }
  }, [])

  // 2. Fetch dataset details when selectedId changes
  useEffect(() => {
    if (!selectedId) return
    const fetchDetails = async () => {
      setLoading(true)
      setError('')
      try {
        const details = await api.getDataset(selectedId)
        setDatasetDetails(details)
      } catch (_) {
        setError('Failed to load dataset transactions.')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [selectedId])

  // Extract lookup tables for highlights
  const diseaseSet = useMemo(() => {
    const list = datasetDetails?.analytics?.diseases?.items || []
    return new Set(list.map(d => d.name.toLowerCase()))
  }, [datasetDetails])

  const medicineSet = useMemo(() => {
    const list = datasetDetails?.analytics?.medicines?.items || []
    return new Set(list.map(m => m.name.toLowerCase()))
  }, [datasetDetails])

  const helperGetItemType = (item) => {
    const itemLower = item.toLowerCase()
    if (diseaseSet.has(itemLower)) return 'disease'
    if (medicineSet.has(itemLower)) return 'medicine'
    return 'symptom'
  }

  // Filtered patterns
  const filteredPatterns = useMemo(() => {
    if (!miningResults || !miningResults.itemsets) return []
    let list = [...miningResults.itemsets]

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(item => 
        item.itemset.some(i => i.toLowerCase().includes(q))
      )
    }

    // 2. Support Filter
    if (supportFilter > 0) {
      list = list.filter(item => item.supportPct >= supportFilter)
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortBy === 'support-desc') return b.supportPct - a.supportPct
      if (sortBy === 'support-asc') return a.supportPct - b.supportPct
      if (sortBy === 'level-desc') return b.level - a.level
      if (sortBy === 'level-asc') return a.level - b.level
      return 0
    })

    return list
  }, [miningResults, searchQuery, supportFilter, sortBy])

  // Filter transactions containing active pattern
  const matchingTransactions = useMemo(() => {
    if (!expandedPattern || !datasetDetails || !datasetDetails.transactions) return []
    const txs = datasetDetails.transactions.transactions || []
    const patternItems = expandedPattern.itemset.map(i => i.toLowerCase())

    return txs.filter(tx => 
      patternItems.every(pi => tx.some(ti => ti.toLowerCase() === pi))
    )
  }, [expandedPattern, datasetDetails])

  // Reset pagination when expanded pattern changes
  useEffect(() => {
    setTxPage(1)
  }, [expandedPattern])

  // paginated transactions
  const paginatedTransactions = useMemo(() => {
    const start = (txPage - 1) * txPerPage
    return matchingTransactions.slice(start, start + txPerPage)
  }, [matchingTransactions, txPage])

  const totalTxPages = Math.max(1, Math.ceil(matchingTransactions.length / txPerPage))

  // Compute stats for matching transactions
  const matchingStats = useMemo(() => {
    if (matchingTransactions.length === 0) return null
    const diseaseCounts = {}
    const medicineCounts = {}

    matchingTransactions.forEach(tx => {
      tx.forEach(item => {
        const type = helperGetItemType(item)
        if (type === 'disease') diseaseCounts[item] = (diseaseCounts[item] || 0) + 1
        if (type === 'medicine') medicineCounts[item] = (medicineCounts[item] || 0) + 1
      })
    })

    const topDisease = Object.entries(diseaseCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'None'
    const topMedicine = Object.entries(medicineCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'None'

    return { topDisease, topMedicine }
  }, [matchingTransactions, diseaseSet, medicineSet])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
        <span>App</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Pattern Explorer</span>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Pattern Explorer</h1>
          <p className="text-sm text-slate-500 mt-1">Deep-dive into frequent symptom networks and transaction occurrences.</p>
        </div>
        
        {/* Dataset selector */}
        {datasets.length > 0 && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white outline-none focus:border-blue-500 transition-colors w-48 shrink-0"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id}>{d.filename}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading transactional database...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      ) : !selectedId || !miningResults ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center p-6">
          <AlertCircle className="w-8 h-8 text-slate-400" />
          <p className="text-sm font-bold text-slate-700">No Mined Patterns Found</p>
          <p className="text-xs text-slate-500 max-w-sm">Please upload a clinical dataset and run the pattern mining engine inside the Dataset Manager first.</p>
          <NavLink to="/app/dataset-manager" className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Upload & Mine
          </NavLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Left panel: Filters and Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search symptom or diagnosis patterns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white outline-none focus:border-blue-500 transition-colors shrink-0"
                >
                  <option value="support-desc">Support (Highest)</option>
                  <option value="support-asc">Support (Lowest)</option>
                  <option value="level-desc">Level (Highest)</option>
                  <option value="level-asc">Level (Lowest)</option>
                </select>
              </div>

              {/* Support Slider */}
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-500 shrink-0 font-medium">Min Support:</span>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={supportFilter}
                  onChange={(e) => setSupportFilter(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-mono text-blue-600 font-bold">{(supportFilter * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Patterns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatterns.map((item, idx) => {
                const isSelected = expandedPattern?.itemset.join(',') === item.itemset.join(',')
                return (
                  <div
                    key={idx}
                    onClick={() => setExpandedPattern(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex flex-wrap gap-1">
                        {item.itemset.map((val, vi) => (
                          <span
                            key={vi}
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-blue-500/50 text-white' : 'bg-blue-50 text-blue-700'
                      }`}>
                        L{item.level}
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>Support Percentage</span>
                      <span className="text-sm font-extrabold font-mono">
                        {(item.supportPct * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
              
              {filteredPatterns.length === 0 && (
                <div className="col-span-full h-40 flex flex-col items-center justify-center gap-2 border border-slate-200 border-dashed rounded-2xl bg-white text-center">
                  <Grid className="w-6 h-6 text-slate-400" />
                  <p className="text-xs font-bold text-slate-600">No Matching Patterns</p>
                  <p className="text-[10px] text-slate-400">Try adjusting your query or lowering the support percentage slider.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Transaction details */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Eye className="w-4.5 h-4.5 text-blue-500" />
              Transaction Inspector
            </h2>

            {expandedPattern ? (
              <div className="space-y-5">
                {/* Pattern metadata */}
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Target Combination</p>
                  <p className="text-xs font-bold text-slate-800 font-mono leading-relaxed mb-3">
                    {expandedPattern.itemset.join(' + ')}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Support Count:</span>
                      <span className="font-extrabold text-slate-800">{expandedPattern.support} records</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Frequency:</span>
                      <span className="font-extrabold text-slate-800">{(expandedPattern.supportPct * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Co-occurring highlights */}
                {matchingStats && (
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Top Linked Disease</p>
                      <p className="text-xs font-bold text-blue-600 truncate">{matchingStats.topDisease}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Top Linked Medicine</p>
                      <p className="text-xs font-bold text-emerald-600 truncate">{matchingStats.topMedicine}</p>
                    </div>
                  </div>
                )}

                {/* Transaction list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">Containing Transactions</p>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
                      Page {txPage} of {totalTxPages}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {paginatedTransactions.map((tx, ti) => (
                      <div key={ti} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span>Transaction #{((txPage - 1) * txPerPage + ti + 1)}</span>
                          <span className="flex items-center gap-0.5 text-emerald-600 font-semibold"><CheckCircle className="w-2.5 h-2.5" /> contains pattern</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {tx.map((item, ii) => {
                            const type = helperGetItemType(item)
                            const isPattern = expandedPattern.itemset.some(pi => pi.toLowerCase() === item.toLowerCase())
                            
                            return (
                              <span
                                key={ii}
                                className={`text-[9px] px-2 py-0.5 rounded-full font-bold border transition-colors ${
                                  isPattern
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                    : type === 'disease'
                                    ? 'bg-blue-50 border-blue-100 text-blue-700'
                                    : type === 'medicine'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 border-slate-200 text-slate-600'
                                }`}
                              >
                                {item}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalTxPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setTxPage(p => Math.max(1, p - 1))}
                        disabled={txPage === 1}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Prev
                      </button>
                      <span className="text-xs text-slate-500 font-medium">Page {txPage} of {totalTxPages}</span>
                      <button
                        onClick={() => setTxPage(p => Math.min(totalTxPages, p + 1))}
                        disabled={txPage === totalTxPages}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-2 border border-slate-200 border-dashed rounded-xl bg-slate-50/50 text-center p-6">
                <HelpCircle className="w-7 h-7 text-slate-400" />
                <p className="text-xs font-bold text-slate-600">No Pattern Selected</p>
                <p className="text-[10px] text-slate-400 max-w-[200px]">Click any mined pattern card on the left to inspect its transaction lists and co-prescriptions.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
