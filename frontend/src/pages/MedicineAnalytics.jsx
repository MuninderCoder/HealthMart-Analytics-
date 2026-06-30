import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill, ChevronRight, Upload, ArrowUpRight, Database, AlertCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { api } from '../utils/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CHART_COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444', '#14b8a6']

export default function MedicineAnalytics() {
  const [datasets, setDatasets] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [datasetDetails, setDatasetDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Real association rules from local storage
  const [activeRules, setActiveRules] = useState([])

  // 1. Fetch available datasets on mount
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const list = await api.getDatasets()
        setDatasets(list)
        
        // Auto-select active dataset from localStorage if present
        const activeId = localStorage.getItem('hm_active_dataset_id')
        if (activeId && list.some(d => d.id === activeId)) {
          setSelectedId(activeId)
        } else if (list.length > 0) {
          setSelectedId(list[0].id)
        }
      } catch (err) {
        setError('Failed to fetch dataset list from server.')
      }
    }
    fetchDatasets()

    // Retrieve mined rules from local storage
    const savedMining = localStorage.getItem('hm_mining_results')
    if (savedMining) {
      try {
        const parsed = JSON.parse(savedMining)
        setActiveRules(parsed.associationRules || [])
      } catch (_) {}
    }
  }, [])

  // 2. Fetch selected dataset details when selectedId changes
  useEffect(() => {
    if (!selectedId) return
    const fetchDetails = async () => {
      setLoading(true)
      setError('')
      try {
        const details = await api.getDataset(selectedId)
        setDatasetDetails(details)
      } catch (err) {
        setError('Failed to load dataset details.')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [selectedId])

  const medicineData = datasetDetails?.analytics?.medicines?.items || []
  const hasMedicines = medicineData.length > 0
  const medicineColName = datasetDetails?.analytics?.medicines?.col || 'Medicines'

  // Format Recharts data
  const chartData = medicineData.map(d => ({
    name: d.name,
    value: d.count
  }))

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>App</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Medicine Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Medicine Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Identify frequently prescribed medicines and live association rules.</p>
      </motion.div>

      {/* Dataset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Active Pharmacy Dataset</p>
            <p className="text-[10px] text-slate-400">Select dataset for prescription and co-prescription analytics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {datasets.length > 0 ? (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white outline-none focus:border-emerald-500 transition-colors w-52"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-400 italic">No datasets uploaded yet</span>
          )}
          <NavLink to="/app/dataset-manager"
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-sm shadow-emerald-100"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Data
          </NavLink>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading prescription analytics...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      ) : !selectedId ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center p-6">
          <AlertCircle className="w-8 h-8 text-slate-400" />
          <p className="text-sm font-bold text-slate-700">No Dataset Selected</p>
          <p className="text-xs text-slate-500 max-w-sm">Please upload a clinical dataset in the Dataset Manager to inspect pharmacy patterns.</p>
        </div>
      ) : !hasMedicines ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center p-6">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <p className="text-sm font-bold text-slate-700">No Medicine Column Detected</p>
          <p className="text-xs text-slate-500 max-w-sm">We couldn't automatically locate a 'Medicines', 'Drug', 'Prescription', or 'Rx' column in the selected dataset to build prescription charts.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Top Medicines Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Top Prescribed Medications</h3>
                <p className="text-[10px] text-slate-400">Extracted from column: <span className="font-semibold text-slate-600 font-mono">"{medicineColName}"</span></p>
              </div>
              <Pill className="w-4 h-4 text-emerald-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                      {chartData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {medicineData.slice(0, 6).map((m, i) => (
                  <div key={m.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-slate-700 font-semibold truncate block w-28">{m.name}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">{m.count} ({m.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Association Rules */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Mined Co-prescription Rules</h3>
            <p className="text-[10px] text-slate-400 mb-4">
              {activeRules.length > 0
                ? `Mined ${activeRules.length} rules from DiffNodeset Engine`
                : 'No rules mined yet. Run pattern mining in Dataset Manager to populate'}
            </p>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-56">
              {activeRules.length > 0 ? (
                activeRules.slice(0, 5).map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 font-mono truncate">
                        {rule.antecedent.join(', ')} → {rule.consequent.join(', ')}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-400">
                        <span>Confidence: <span className="font-bold text-slate-600">{(rule.confidence * 100).toFixed(1)}%</span></span>
                        <span>Lift: <span className="font-bold text-emerald-600">{rule.lift.toFixed(2)}x</span></span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center gap-2 border border-slate-200 border-dashed rounded-xl bg-slate-50/50">
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                  <p className="text-xs font-bold text-slate-600">No Mined Rules Available</p>
                  <p className="text-[10px] text-slate-400 max-w-[220px]">Navigate to the Dataset Manager page, configure settings, and run the engine.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
