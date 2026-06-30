import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ChevronRight, Upload, AlertCircle, Database, BarChart2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { api } from '../utils/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts'

const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#374151', '#06b6d4', '#84cc16']

export default function DiseaseAnalytics() {
  const [datasets, setDatasets] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [datasetDetails, setDatasetDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const diseaseData = datasetDetails?.analytics?.diseases?.items || []
  const hasDiseases = diseaseData.length > 0
  const diseaseColName = datasetDetails?.analytics?.diseases?.col || 'Diagnosis'

  // Format Recharts data
  const chartData = diseaseData.map(d => ({
    name: d.name,
    count: d.count,
    percentage: parseFloat(d.pct)
  }))

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>App</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Disease Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Disease Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Discover disease distributions and workloads directly from clinical records.</p>
      </motion.div>

      {/* Dataset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Active Analytics Dataset</p>
            <p className="text-[10px] text-slate-400">Select which dataset to visualize below</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {datasets.length > 0 ? (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white outline-none focus:border-blue-500 transition-colors w-52"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-400 italic">No datasets uploaded yet</span>
          )}
          <NavLink to="/app/dataset-manager"
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-sm shadow-blue-100"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Data
          </NavLink>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading disease demographics...</p>
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
          <p className="text-xs text-slate-500 max-w-sm">Please upload a clinical CSV or Excel spreadsheet inside the Dataset Manager to inspect disease trends.</p>
        </div>
      ) : !hasDiseases ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center p-6">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <p className="text-sm font-bold text-slate-700">No Diagnosis Column Detected</p>
          <p className="text-xs text-slate-500 max-w-sm">We couldn't automatically locate a 'Diagnosis', 'Disease', or 'ICD' column in the selected dataset to build disease summaries.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Main Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Top Diseases Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Case Frequency Distribution</h3>
                  <p className="text-[10px] text-slate-400">Extracted from column: <span className="font-semibold text-slate-600 font-mono">"{diseaseColName}"</span></p>
                </div>
                <BarChart2 className="w-4 h-4 text-slate-400" />
              </div>
              
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                  />
                  <Bar dataKey="count" name="Case Count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Diseases Table list */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Top Diagnostics Ranked</h3>
              <p className="text-[10px] text-slate-400 mb-4">Ordered by transaction frequency</p>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {diseaseData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700 truncate w-36 block">{d.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{d.count} ({d.pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${parseFloat(d.pct)}%` }}
                          transition={{ delay: i * 0.05, duration: 0.6 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
