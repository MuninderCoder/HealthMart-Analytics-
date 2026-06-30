import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Cpu, FileText, BarChart2, TrendingUp,
  Download, Search, Filter, ArrowUpDown, HelpCircle,
  Activity, Clock, Database, Sparkles, Layers
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts'

const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4']

export default function MiningDashboard({ results, filename }) {
  const [activeTab, setActiveTab] = useState('itemsets') // itemsets | rules | charts | diagnostics

  // ─── Itemsets Table States ──────────────────────────────────────────────────
  const [itemsetSearch, setItemsetSearch] = useState('')
  const [itemsetLevelFilter, setItemsetLevelFilter] = useState('all') // all | 1 | 2 | 3+
  const [itemsetSortKey, setItemsetSortKey] = useState('support') // support | level | name
  const [itemsetSortOrder, setItemsetSortOrder] = useState('desc')
  const [itemsetPage, setItemsetPage] = useState(1)
  const itemsPerPage = 10

  // ─── Rules Table States ─────────────────────────────────────────────────────
  const [ruleSearch, setRuleSearch] = useState('')
  const [minConfFilter, setMinConfFilter] = useState(0.0)
  const [minLiftFilter, setMinLiftFilter] = useState(0.0)
  const [ruleSortKey, setRuleSortKey] = useState('confidence') // confidence | support | lift | leverage
  const [ruleSortOrder, setRuleSortOrder] = useState('desc')
  const [rulePage, setRulePage] = useState(1)
  const rulesPerPage = 10

  // ─── Data Extraction ────────────────────────────────────────────────────────
  const rawItemsets = results?.itemsets || []
  const rawRules = results?.associationRules || []
  const stats = results?.stats || {}

  // ─── Filter & Sort Itemsets ─────────────────────────────────────────────────
  const filteredItemsets = useMemo(() => {
    let list = [...rawItemsets]

    // Search
    if (itemsetSearch.trim()) {
      const q = itemsetSearch.toLowerCase()
      list = list.filter(item => 
        item.itemset.some(i => i.toLowerCase().includes(q))
      )
    }

    // Level Filter
    if (itemsetLevelFilter !== 'all') {
      if (itemsetLevelFilter === '3+') {
        list = list.filter(item => item.level >= 3)
      } else {
        const lvl = parseInt(itemsetLevelFilter, 10)
        list = list.filter(item => item.level === lvl)
      }
    }

    // Sort
    list.sort((a, b) => {
      let valA, valB
      if (itemsetSortKey === 'support') {
        valA = a.support
        valB = b.support
      } else if (itemsetSortKey === 'level') {
        valA = a.level
        valB = b.level
      } else {
        valA = a.itemset.join(', ')
        valB = b.itemset.join(', ')
      }

      if (valA < valB) return itemsetSortOrder === 'asc' ? -1 : 1
      if (valA > valB) return itemsetSortOrder === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [rawItemsets, itemsetSearch, itemsetLevelFilter, itemsetSortKey, itemsetSortOrder])

  // ─── Filter & Sort Rules ────────────────────────────────────────────────────
  const filteredRules = useMemo(() => {
    let list = [...rawRules]

    // Search
    if (ruleSearch.trim()) {
      const q = ruleSearch.toLowerCase()
      list = list.filter(rule => 
        rule.antecedent.some(i => i.toLowerCase().includes(q)) ||
        rule.consequent.some(i => i.toLowerCase().includes(q))
      )
    }

    // Min Confidence Filter
    if (minConfFilter > 0) {
      list = list.filter(rule => rule.confidence >= minConfFilter)
    }

    // Min Lift Filter
    if (minLiftFilter > 0) {
      list = list.filter(rule => rule.lift >= minLiftFilter)
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[ruleSortKey]
      let valB = b[ruleSortKey]

      if (valA < valB) return ruleSortOrder === 'asc' ? -1 : 1
      if (valA > valB) return ruleSortOrder === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [rawRules, ruleSearch, minConfFilter, minLiftFilter, ruleSortKey, ruleSortOrder])

  // Paginated lists
  const paginatedItemsets = useMemo(() => {
    const startIdx = (itemsetPage - 1) * itemsPerPage
    return filteredItemsets.slice(startIdx, startIdx + itemsPerPage)
  }, [filteredItemsets, itemsetPage])

  const paginatedRules = useMemo(() => {
    const startIdx = (rulePage - 1) * rulesPerPage
    return filteredRules.slice(startIdx, startIdx + rulesPerPage)
  }, [filteredRules, rulePage])

  // Total pages
  const totalItemsetPages = Math.ceil(filteredItemsets.length / itemsPerPage) || 1
  const totalRulePages = Math.ceil(filteredRules.length / rulesPerPage) || 1

  // ─── Toggle Sorting helpers ─────────────────────────────────────────────────
  const toggleItemsetSort = (key) => {
    if (itemsetSortKey === key) {
      setItemsetSortOrder(p => p === 'asc' ? 'desc' : 'asc')
    } else {
      setItemsetSortKey(key)
      setItemsetSortOrder('desc')
    }
    setItemsetPage(1)
  }

  const toggleRuleSort = (key) => {
    if (ruleSortKey === key) {
      setRuleSortOrder(p => p === 'asc' ? 'desc' : 'asc')
    } else {
      setRuleSortKey(key)
      setRuleSortOrder('desc')
    }
    setRulePage(1)
  }

  // ─── Export CSV helpers ─────────────────────────────────────────────────────
  const exportItemsetsCSV = () => {
    const headers = ["Itemset", "SupportCount", "SupportPct", "Level"]
    const rows = filteredItemsets.map(item => [
      `"${item.itemset.join(', ')}"`,
      item.support,
      (item.supportPct * 100).toFixed(2) + '%',
      item.level
    ])
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${filename || 'dataset'}_frequent_itemsets.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportRulesCSV = () => {
    const headers = ["Antecedent", "Consequent", "SupportCount", "SupportPct", "Confidence", "Lift", "Leverage", "Conviction"]
    const rows = filteredRules.map(rule => [
      `"${rule.antecedent.join(', ')}"`,
      `"${rule.consequent.join(', ')}"`,
      rule.supportCount,
      (rule.support * 100).toFixed(2) + '%',
      (rule.confidence * 100).toFixed(2) + '%',
      rule.lift.toFixed(4),
      rule.leverage.toFixed(4),
      rule.conviction.toFixed(4)
    ])
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${filename || 'dataset'}_association_rules.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ─── Charts Data Preps ──────────────────────────────────────────────────────
  // Top 15 Frequent Patterns Chart Data
  const topPatternsData = useMemo(() => {
    return [...rawItemsets]
      .filter(item => item.level > 1) // Show combinations mostly
      .sort((a, b) => b.support - a.support)
      .slice(0, 15)
      .map(item => ({
        name: item.itemset.join(' + '),
        support: item.support,
        supportPct: item.supportPct * 100
      }))
  }, [rawItemsets])

  // Support Distribution Chart Data
  const supportDistData = useMemo(() => {
    const ranges = {
      '10-20%': 0,
      '20-40%': 0,
      '40-60%': 0,
      '60-80%': 0,
      '80-100%': 0
    }
    rawItemsets.forEach(item => {
      const pct = item.supportPct
      if (pct >= 0.8) ranges['80-100%']++
      else if (pct >= 0.6) ranges['60-80%']++
      else if (pct >= 0.4) ranges['40-60%']++
      else if (pct >= 0.2) ranges['20-40%']++
      else ranges['10-20%']++
    })
    return Object.keys(ranges).map(key => ({ range: key, count: ranges[key] }))
  }, [rawItemsets])

  // Rule Confidence Distribution Chart Data
  const confDistData = useMemo(() => {
    const ranges = {
      '50-60%': 0,
      '60-70%': 0,
      '70-80%': 0,
      '80-90%': 0,
      '90-100%': 0
    }
    rawRules.forEach(rule => {
      const conf = rule.confidence
      if (conf >= 0.9) ranges['90-100%']++
      else if (conf >= 0.8) ranges['80-90%']++
      else if (conf >= 0.7) ranges['70-80%']++
      else if (conf >= 0.6) ranges['60-70%']++
      else ranges['50-60%']++
    })
    return Object.keys(ranges).map(key => ({ range: key, count: ranges[key] }))
  }, [rawRules])

  return (
    <div className="space-y-6">
      {/* ─── KPI METRICS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between opacity-60 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Mined Patterns</span>
            <Database className="w-4 h-4" />
          </div>
          <p className="text-xl font-extrabold">{rawItemsets.length.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Frequent Itemsets</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between opacity-60 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Rules Generated</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xl font-extrabold">{rawRules.length.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Conf & Lift Filtered</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between opacity-60 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Execution Time</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-xl font-extrabold">{results?.executionTime}</p>
          <p className="text-[10px] text-slate-400 mt-1">C++ DiffNodeset</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between opacity-60 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Max Level</span>
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-xl font-extrabold">{stats.maxLevel} Lvl</p>
          <p className="text-[10px] text-slate-400 mt-1">Max pattern size</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between opacity-60 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Memory Est.</span>
            <Cpu className="w-4 h-4" />
          </div>
          <p className="text-xl font-extrabold">{results?.memoryUsage}</p>
          <p className="text-[10px] text-slate-400 mt-1">PPC Tree & N-lists</p>
        </div>
      </div>

      {/* ─── TAB NAVIGATION ───────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('itemsets')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'itemsets'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Frequent Itemsets ({filteredItemsets.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Association Rules ({filteredRules.length})
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'charts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Visualizations
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'diagnostics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Engine Diagnostics
        </button>
      </div>

      {/* ─── TAB CONTENT ──────────────────────────────────────────────────────── */}
      <div className="py-2">
        {/* ─── 1. FREQUENT ITEMSETS ─── */}
        {activeTab === 'itemsets' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search itemsets..."
                    value={itemsetSearch}
                    onChange={(e) => { setItemsetSearch(e.target.value); setItemsetPage(1) }}
                    className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-400 bg-white"
                  />
                </div>
                <select
                  value={itemsetLevelFilter}
                  onChange={(e) => { setItemsetLevelFilter(e.target.value); setItemsetPage(1) }}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white text-slate-600 outline-none"
                >
                  <option value="all">All Sizes</option>
                  <option value="1">1-Itemsets</option>
                  <option value="2">2-Itemsets</option>
                  <option value="3+">3+ Itemsets</option>
                </select>
              </div>
              <button
                onClick={exportItemsetsCSV}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-55 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100" onClick={() => toggleItemsetSort('name')}>
                      <div className="flex items-center gap-1">Itemset <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100" onClick={() => toggleItemsetSort('level')}>
                      <div className="flex items-center gap-1">Size <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100" onClick={() => toggleItemsetSort('support')}>
                      <div className="flex items-center gap-1">Support <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-5 py-3 text-right">Relative Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedItemsets.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400">
                        No frequent itemsets match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedItemsets.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-medium">
                          <div className="flex flex-wrap gap-1.5">
                            {item.itemset.map((val, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold">
                                {val}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-500">
                          {item.level}-item
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-900">
                          {item.support.toLocaleString()} <span className="font-normal text-slate-400 text-[10px]">records</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="font-bold text-slate-900 text-right">
                              {(item.supportPct * 100).toFixed(2)}%
                            </span>
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${item.supportPct * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalItemsetPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">
                    Showing Page <b>{itemsetPage}</b> of <b>{totalItemsetPages}</b> (<b>{filteredItemsets.length}</b> total patterns)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setItemsetPage(p => Math.max(1, p - 1))}
                      disabled={itemsetPage === 1}
                      className="px-2.5 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setItemsetPage(p => Math.min(totalItemsetPages, p + 1))}
                      disabled={itemsetPage === totalItemsetPages}
                      className="px-2.5 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 2. ASSOCIATION RULES ─── */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            {/* Toolbar / Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search rules..."
                    value={ruleSearch}
                    onChange={(e) => { setRuleSearch(e.target.value); setRulePage(1) }}
                    className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-400 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 whitespace-nowrap">Min Confidence:</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    placeholder="0.0"
                    value={minConfFilter || ''}
                    onChange={(e) => { setMinConfFilter(parseFloat(e.target.value) || 0); setRulePage(1) }}
                    className="w-16 border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-blue-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 whitespace-nowrap">Min Lift:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={minLiftFilter || ''}
                    onChange={(e) => { setMinLiftFilter(parseFloat(e.target.value) || 0); setRulePage(1) }}
                    className="w-16 border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>
              <button
                onClick={exportRulesCSV}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-55 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3">Rule (Antecedent → Consequent)</th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100" onClick={() => toggleRuleSort('support')}>
                      <div className="flex items-center gap-1">Support <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100" onClick={() => toggleRuleSort('confidence')}>
                      <div className="flex items-center gap-1">Confidence <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100" onClick={() => toggleRuleSort('lift')}>
                      <div className="flex items-center gap-1">Lift <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100" onClick={() => toggleRuleSort('leverage')}>
                      <div className="flex items-center gap-1">Leverage <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-5 py-3 text-right">Conviction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedRules.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        No association rules match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedRules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-medium">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex flex-wrap gap-1">
                              {rule.antecedent.map((val, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-semibold">
                                  {val}
                                </span>
                              ))}
                            </div>
                            <span className="text-slate-400 font-bold">➔</span>
                            <div className="flex flex-wrap gap-1">
                              {rule.consequent.map((val, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-semibold">
                                  {val}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-900">
                          {(rule.support * 100).toFixed(2)}%
                          <span className="block font-normal text-slate-400 text-[9px] mt-0.5">({rule.supportCount.toLocaleString()} rows)</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{(rule.confidence * 100).toFixed(1)}%</span>
                            <div className="w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rule.confidence >= 0.9 ? 'bg-emerald-500' :
                                  rule.confidence >= 0.7 ? 'bg-blue-500' :
                                  'bg-amber-500'
                                }`}
                                style={{ width: `${rule.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            rule.lift > 1.5 ? 'bg-emerald-50 text-emerald-700' :
                            rule.lift > 1.0 ? 'bg-blue-50 text-blue-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {rule.lift.toFixed(2)}x
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono font-semibold text-slate-500">
                          {rule.leverage > 0 ? '+' : ''}{rule.leverage.toFixed(4)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-semibold text-slate-500">
                          {rule.conviction > 10.0 ? '∞' : rule.conviction.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalRulePages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">
                    Showing Page <b>{rulePage}</b> of <b>{totalRulePages}</b> (<b>{filteredRules.length}</b> total rules)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRulePage(p => Math.max(1, p - 1))}
                      disabled={rulePage === 1}
                      className="px-2.5 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setRulePage(p => Math.min(totalRulePages, p + 1))}
                      disabled={rulePage === totalRulePages}
                      className="px-2.5 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 3. VISUALIZATIONS ─── */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Top 15 Patterns Bar Chart */}
            {topPatternsData.length > 0 ? (
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Top 15 Frequent Co-occurrences</h3>
                <p className="text-[10px] text-slate-400 mb-4">Patterns (size &gt;= 2) sorted by support count</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topPatternsData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 9 }} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9, width: 150 }} interval={0} />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Support']} />
                    <Bar dataKey="supportPct" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {topPatternsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                No patterns of size &gt;= 2 found to generate co-occurrence charts.
              </div>
            )}

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Support Distribution */}
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Support Distribution</h3>
                <p className="text-[10px] text-slate-400 mb-4">Number of itemsets falling in different support brackets</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={supportDistData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [value, 'Itemsets count']} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Rules Confidence Distribution */}
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Rule Confidence Distribution</h3>
                <p className="text-[10px] text-slate-400 mb-4">Number of rules falling in different confidence brackets</p>
                {rawRules.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={confDistData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value) => [value, 'Rules count']} />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-xs">
                    No rules generated to construct confidence distributions.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── 4. ENGINE DIAGNOSTICS ─── */}
        {activeTab === 'diagnostics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Engine parameters and timing details */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Execution Phase Timing
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">File Parsing</span>
                  <span className="font-mono font-bold text-slate-800">{stats.parseTimeMs?.toFixed(2)} ms</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">PPC Tree Build & Numbering</span>
                  <span className="font-mono font-bold text-slate-800">{stats.treeTimeMs?.toFixed(2)} ms</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">1-Itemset NodeSets Generation</span>
                  <span className="font-mono font-bold text-slate-800">{stats.nodeSetTimeMs?.toFixed(2)} ms</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">2-Itemset DiffNodeSets Header check</span>
                  <span className="font-mono font-bold text-slate-800">{stats.diffNodeSetTimeMs?.toFixed(2)} ms</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Recursive Patterns Mining (Level 2+)</span>
                  <span className="font-mono font-bold text-slate-800">{stats.miningTimeMs?.toFixed(2)} ms</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-600 font-bold">Total Mining Pipeline Time</span>
                  <span className="font-mono font-extrabold text-blue-700">{stats.totalTimeMs?.toFixed(2)} ms</span>
                </div>
              </div>
            </div>

            {/* Tree and Pattern Stats */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                Mining Tree Structure Stats
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Transactions Count</span>
                  <span className="font-bold text-slate-800">{stats.transactionCount?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">PPC Tree Node Count</span>
                  <span className="font-bold text-slate-800">{stats.treeNodeCount?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">PPC Tree Max Depth</span>
                  <span className="font-bold text-slate-800">{stats.treeDepth} levels</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Candidates Evaluated</span>
                  <span className="font-bold text-slate-800">{stats.candidatesCount?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Infrequent Candidates Pruned</span>
                  <span className="font-bold text-rose-600 font-mono">-{stats.prunedCount?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-600 font-bold">Total Frequent Patterns Mined</span>
                  <span className="font-extrabold text-emerald-700">{rawItemsets.length.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
