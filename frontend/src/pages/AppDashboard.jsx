import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Database,
  Activity, Sparkles, Clock, MoreHorizontal,
  Upload, ChevronRight, AlertCircle
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { api } from '../utils/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#374151', '#06b6d4', '#84cc16']

function KpiCard({ title, value, change, positive, icon: Icon, color }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mb-1.5">{value}</p>
      <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
        {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        {change}
        <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
      </div>
    </motion.div>
  )
}

export default function AppDashboard() {
  const [datasets, setDatasets] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [datasetDetails, setDatasetDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Mining stats cached locally
  const [minedStats, setMinedStats] = useState({
    itemsetsCount: 0,
    rulesCount: 0,
    time: '0.00 ms',
    itemsets: []
  })

  // 1. Load history list and active mining result on mount
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
      } catch (_) {}
    }
    fetchHistory()

    const savedMining = localStorage.getItem('hm_mining_results')
    if (savedMining) {
      try {
        const parsed = JSON.parse(savedMining)
        setMinedStats({
          itemsetsCount: parsed.totalFrequentItemsets || 0,
          rulesCount: parsed.totalRules || 0,
          time: parsed.executionTime || '0.00 ms',
          itemsets: parsed.itemsets || []
        })
      } catch (_) {}
    }
  }, [])

  // 2. Fetch dataset details when selected ID changes
  useEffect(() => {
    if (!selectedId) return
    const fetchDetails = async () => {
      setLoading(true)
      try {
        const details = await api.getDataset(selectedId)
        setDatasetDetails(details)
      } catch (_) {}
      finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [selectedId])

  const totalRecords = datasetDetails?.rows || 0
  const diseaseData = datasetDetails?.analytics?.diseases?.items || []
  const medicineData = datasetDetails?.analytics?.medicines?.items || []

  const pieData = medicineData.map(d => ({
    name: d.name,
    value: d.count
  }))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>App</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-semibold">Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Platform intelligence metrics and quick diagnostic summaries.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {datasets.length > 0 && (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white outline-none focus:border-blue-500 transition-colors w-48"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
          )}
          <NavLink
            to="/app/dataset-manager"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Dataset
          </NavLink>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Records" value={totalRecords ? totalRecords.toLocaleString() : '0'} change="+100%" positive icon={Database} color="bg-blue-500" />
        <KpiCard title="Active Patterns" value={minedStats.itemsetsCount.toLocaleString()} change="+8.1%" positive icon={Activity} color="bg-emerald-500" />
        <KpiCard title="Associations" value={minedStats.rulesCount.toLocaleString()} change="+15.2%" positive icon={Sparkles} color="bg-violet-500" />
        <KpiCard title="DiffNodeset Time" value={minedStats.time} change="-3.5ms" positive icon={Clock} color="bg-amber-500" />
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading dashboard visualizations...</p>
        </div>
      ) : !selectedId ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center p-6">
          <AlertCircle className="w-8 h-8 text-slate-400" />
          <p className="text-sm font-bold text-slate-700">No Dataset Active</p>
          <p className="text-xs text-slate-500 max-w-sm">Please navigate to the Dataset Manager page to upload clinical CSV or Excel records and run pattern mining.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Main Visualizations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Top Diseases List */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Diagnosis Workload</h3>
                <NavLink to="/app/disease-analytics" className="text-xs text-blue-600 hover:underline">View all</NavLink>
              </div>
              <div className="space-y-3">
                {diseaseData.slice(0, 5).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">{d.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{d.count} ({d.pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${parseFloat(d.pct)}%` }}
                          transition={{ delay: i * 0.1, duration: 0.7 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {diseaseData.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No disease column identified in dataset</p>
                )}
              </div>
            </div>

            {/* Medicine Distribution Pie */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Medicine Distribution</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={2} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-3 text-[10px] text-slate-500">
                {medicineData.slice(0, 4).map((m, i) => (
                  <div key={m.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="truncate max-w-[80px] font-semibold">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Uploads Widget & Frequent Itemsets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top Frequent Mined Patterns */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Frequent Symptom Patterns</h3>
              <div className="space-y-3">
                {minedStats.itemsets.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-xs font-semibold text-slate-700 leading-snug font-mono">
                        {item.itemset.join(', ')}
                      </p>
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                        Level {item.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                          style={{ width: `${item.supportPct * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold shrink-0">
                        {(item.supportPct * 100).toFixed(0)}% support
                      </span>
                    </div>
                  </div>
                ))}
                {minedStats.itemsets.length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center gap-2 border border-slate-200 border-dashed rounded-xl text-center">
                    <Activity className="w-6 h-6 text-slate-400" />
                    <p className="text-xs font-bold text-slate-600">No Mined Patterns Yet</p>
                    <p className="text-[10px] text-slate-400">Run pattern mining in Dataset Manager to find clinical combinations.</p>
                  </div>
                )}
              </div>
            </div>

            {/* List of Datasets in History */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Platform Datasets</h3>
                <NavLink to="/app/dataset-manager" className="text-xs text-blue-600 hover:underline">View all</NavLink>
              </div>
              
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {datasets.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Database className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{d.filename}</p>
                      <p className="text-[10px] text-slate-400">{d.rows.toLocaleString()} rows · {d.fileSize}</p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      ready
                    </span>
                  </div>
                ))}
                {datasets.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No datasets uploaded yet</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
