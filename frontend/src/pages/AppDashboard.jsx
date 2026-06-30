import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Database, Activity, Sparkles, Clock, Upload, ChevronRight,
  AlertCircle, Pill, ShieldAlert, Cpu, Heart, CheckCircle2, ListFilter
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { api } from '../utils/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, AreaChart, Area, Legend
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e']

// Animated Counter component
function AnimatedCounter({ value, prefix = '', suffix = '' }) {
  const [displayVal, setDisplayVal] = useState('0')
  
  useEffect(() => {
    const strVal = String(value)
    const numMatch = strVal.match(/[\d.]+/)
    if (!numMatch) {
      setDisplayVal(strVal)
      return
    }
    const targetNum = parseFloat(numMatch[0])
    const currentSuffix = suffix || strVal.replace(numMatch[0], '')
    
    let start = 0
    const steps = 30
    const stepValue = targetNum / steps
    const stepTime = 15
    let currentStep = 0
    
    const timer = setInterval(() => {
      currentStep += 1
      start += stepValue
      if (currentStep >= steps) {
        clearInterval(timer)
        setDisplayVal(strVal)
      } else {
        const formatted = targetNum % 1 === 0 ? Math.floor(start) : start.toFixed(2)
        setDisplayVal(`${prefix}${parseFloat(formatted).toLocaleString()}${currentSuffix}`)
      }
    }, stepTime)
    
    return () => clearInterval(timer)
  }, [value, prefix, suffix])
  
  return <span>{displayVal}</span>
}

export default function AppDashboard() {
  const [datasets, setDatasets] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [datasetDetails, setDatasetDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Mining stats cached locally
  const [minedResults, setMinedResults] = useState(null)

  // 1. Fetch available datasets and check local storage on mount
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
        setMinedResults(JSON.parse(savedMining))
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

  // Extract analytics metrics
  const totalDatasets = datasets.length
  const totalTransactions = datasetDetails?.transactions?.total || 0
  const totalItemsets = minedResults?.totalFrequentItemsets || 0
  const totalRules = minedResults?.totalRules || 0
  const executionTime = minedResults?.executionTime || '0.00 ms'
  const memoryUsage = minedResults?.memoryUsage || '0.00 KB'

  const diseaseItems = datasetDetails?.analytics?.diseases?.items || []
  const topDisease = diseaseItems[0]?.name || 'None'
  const topDiseasePct = diseaseItems[0]?.pct || '0'
  
  const medicineItems = datasetDetails?.analytics?.medicines?.items || []
  const topMedicine = medicineItems[0]?.name || 'None'
  
  const symptomItems = datasetDetails?.analytics?.symptoms?.items || []
  const topSymptom = symptomItems[0]?.name || 'None'

  // Chart data calculations
  const symptomPieData = useMemo(() => {
    return symptomItems.slice(0, 5).map(s => ({
      name: s.name,
      value: s.count
    }))
  }, [symptomItems])

  // Histogram of Support values (Binned: 0-20%, 20-40%, 40-60%, 60-80%, 80-100%)
  const supportHistogramData = useMemo(() => {
    if (!minedResults || !minedResults.itemsets) return []
    const bins = { '5-20%': 0, '20-40%': 0, '40-60%': 0, '60-80%': 0, '80-100%': 0 }
    
    minedResults.itemsets.forEach(item => {
      const pct = item.supportPct * 100
      if (pct <= 20) bins['5-20%'] += 1
      else if (pct <= 40) bins['20-40%'] += 1
      else if (pct <= 60) bins['40-60%'] += 1
      else if (pct <= 80) bins['60-80%'] += 1
      else bins['80-100%'] += 1
    })

    return Object.entries(bins).map(([bin, count]) => ({ bin, count }))
  }, [minedResults])

  // Scatter plot data for Confidence vs Lift, sized by Support
  const scatterPlotData = useMemo(() => {
    if (!minedResults || !minedResults.associationRules) return []
    return minedResults.associationRules.map((rule, idx) => ({
      id: idx,
      confidence: parseFloat((rule.confidence * 100).toFixed(1)),
      lift: parseFloat(rule.lift.toFixed(2)),
      support: parseFloat((rule.supportPct * 100).toFixed(1)),
      name: `${rule.antecedent.join(',')} → ${rule.consequent.join(',')}`
    }))
  }, [minedResults])

  // Timings timeline from engine stats
  const performanceTimeline = useMemo(() => {
    if (!minedResults || !minedResults.stats) return []
    const st = minedResults.stats
    return [
      { name: 'File Parsing', duration: parseFloat(st.parseTimeMs.toFixed(2)) },
      { name: 'Tree Build', duration: parseFloat(st.treeTimeMs.toFixed(2)) },
      { name: 'NodeSets Gen', duration: parseFloat(st.nodeSetTimeMs.toFixed(2)) },
      { name: 'DiffNodeset Join', duration: parseFloat(st.diffNodeSetTimeMs.toFixed(2)) },
    ]
  }, [minedResults])

  // Medical Insights templates
  const medicalInsights = useMemo(() => {
    if (!minedResults || !minedResults.associationRules) return []
    const rules = minedResults.associationRules
    const insights = []

    const symptomWords = ['fever', 'cough', 'ache', 'pain', 'cold', 'flu', 'sore', 'throat', 'headache', 'congestion']
    const diseaseWords = ['diabetes', 'hypertension', 'asthma', 'copd', 'heart', 'cardiology', 'stroke', 'kidney', 'cancer']
    const medicineWords = ['metformin', 'lisinopril', 'insulin', 'albuterol', 'aspirin', 'atorvastatin', 'paracetamol', 'ibuprofen']

    const checkType = (arr, keywords) => {
      return arr.some(item => keywords.some(k => item.toLowerCase().includes(k)))
    }

    rules.forEach(rule => {
      const isAntecedentSymptom = checkType(rule.antecedent, symptomWords)
      const isConsequentDisease = checkType(rule.consequent, diseaseWords)
      
      const isAntecedentDisease = checkType(rule.antecedent, diseaseWords)
      const isConsequentMedicine = checkType(rule.consequent, medicineWords)

      if (isAntecedentSymptom && isConsequentDisease) {
        insights.push({
          type: 'Symptom-Diagnosis',
          text: `Symptoms [${rule.antecedent.join(', ')}] are strongly linked with [${rule.consequent.join(', ')}] diagnoses (Confidence: ${(rule.confidence * 100).toFixed(0)}%).`
        })
      } else if (isAntecedentDisease && isConsequentMedicine) {
        insights.push({
          type: 'Disease-Medication',
          text: `Patients diagnosed with [${rule.antecedent.join(', ')}] frequently receive [${rule.consequent.join(', ')}] prescriptions (Confidence: ${(rule.confidence * 100).toFixed(0)}%).`
        })
      } else if (rule.confidence >= 0.8) {
        insights.push({
          type: 'General Co-occurrence',
          text: `Co-prescription pattern [${rule.antecedent.join(', ')}] indicates high occurrence of [${rule.consequent.join(', ')}] (Lift: ${rule.lift.toFixed(1)}x).`
        })
      }
    })

    return insights.slice(0, 4) // Show top 4
  }, [minedResults])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>App</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-semibold">Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Executive Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Platform intelligence metrics and quick diagnostic summaries.</p>
        </div>
        
        {/* Selector */}
        <div className="flex items-center gap-3">
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
          <NavLink
            to="/app/dataset-manager"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Dataset
          </NavLink>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Syncing visualization metrics...</p>
        </div>
      ) : !selectedId ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center p-6">
          <AlertCircle className="w-8 h-8 text-slate-400" />
          <p className="text-sm font-bold text-slate-700">No Dataset Active</p>
          <p className="text-xs text-slate-500 max-w-sm">Please navigate to the Dataset Manager page to upload clinical CSV or Excel records and run pattern mining.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-9 gap-4">
            {/* Row 1 */}
            <div className="xl:col-span-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Storage Datasets</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-extrabold text-slate-900"><AnimatedCounter value={totalDatasets} /></span>
                <span className="text-xs text-blue-600 font-semibold">files uploaded</span>
              </div>
            </div>
            <div className="xl:col-span-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Transactions</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-extrabold text-slate-900"><AnimatedCounter value={totalTransactions} /></span>
                <span className="text-xs text-emerald-600 font-semibold">records parsed</span>
              </div>
            </div>
            <div className="xl:col-span-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Frequent Itemsets</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-extrabold text-slate-900"><AnimatedCounter value={totalItemsets} /></span>
                <span className="text-xs text-violet-600 font-semibold">patterns found</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="xl:col-span-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Association Rules</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-extrabold text-slate-900"><AnimatedCounter value={totalRules} /></span>
                <span className="text-xs text-pink-600 font-semibold">rules extracted</span>
              </div>
            </div>
            <div className="xl:col-span-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Mining Execution Speed</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-extrabold text-slate-900 font-mono"><AnimatedCounter value={executionTime} /></span>
                <span className="text-xs text-amber-600 font-semibold">C++ processing</span>
              </div>
            </div>
            <div className="xl:col-span-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">RAM Usage</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-extrabold text-slate-900 font-mono"><AnimatedCounter value={memoryUsage} /></span>
                <span className="text-xs text-cyan-600 font-semibold">allocation cache</span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="xl:col-span-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Top Diagnosis Case</span>
              <p className="text-sm font-bold text-slate-800 truncate">{topDisease}</p>
              <p className="text-[10px] text-slate-400">{topDiseasePct}% prevalence</p>
            </div>
            <div className="xl:col-span-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Top Prescribed Medication</span>
              <p className="text-sm font-bold text-emerald-600 truncate">{topMedicine}</p>
              <p className="text-[10px] text-slate-400">frequency leader</p>
            </div>
            <div className="xl:col-span-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Top Patient Symptom</span>
              <p className="text-sm font-bold text-violet-600 truncate">{topSymptom}</p>
              <p className="text-[10px] text-slate-400">presenting complaint</p>
            </div>
          </div>

          {/* Charts visualizations grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart 1: Disease Case Counts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-500" /> Disease Prevalence
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diseaseItems.slice(0, 5)} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={75} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Medicine Prescriptions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1">
                <Pill className="w-4 h-4 text-emerald-500" /> Prescribed Medications
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={medicineItems.slice(0, 5)} margin={{ left: -25, right: 0, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Symptoms Pie */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1">
                <Activity className="w-4 h-4 text-violet-500" /> Patient Complaints
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={symptomPieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                      {symptomPieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 9, paddingTop: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Mining stats charts: Histogram, Scatter, and Performance */}
          {minedResults ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Histogram: Support Distribution */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1">
                  <ListFilter className="w-4 h-4 text-indigo-500" /> Support Histogram
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supportHistogramData} margin={{ left: -25, right: 0, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="bin" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                      <Bar dataKey="count" name="Itemsets" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Scatter: Confidence vs Lift */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-violet-500" /> Rule Confidence Matrix
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" dataKey="confidence" name="Confidence" unit="%" tick={{ fontSize: 9 }} />
                      <YAxis type="number" dataKey="lift" name="Lift" tick={{ fontSize: 9 }} />
                      <ZAxis type="number" dataKey="support" range={[40, 200]} name="Support" unit="%" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                      <Scatter name="Rules" data={scatterPlotData} fill="#8b5cf6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1">
                  <Cpu className="w-4 h-4 text-amber-500" /> C++ Engine Execution Timeline
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceTimeline} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                      <Area type="monotone" dataKey="duration" name="Duration (ms)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDur)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : null}

          {/* Medical Insights & Performance Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Medical Insights */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500" /> Discovered Clinical Summaries
              </h3>
              
              <div className="space-y-3 flex-1 overflow-y-auto max-h-64 pr-1">
                {medicalInsights.map((insight, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 hover:border-blue-200 transition-colors">
                    <span className="text-[9px] uppercase font-bold text-blue-600 block tracking-wider">{insight.type}</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{insight.text}</p>
                  </div>
                ))}
                
                {medicalInsights.length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center gap-2 border border-slate-200 border-dashed rounded-xl bg-slate-50/50">
                    <ShieldAlert className="w-6 h-6 text-slate-400" />
                    <p className="text-xs font-bold text-slate-600">No High-Confidence Insights</p>
                    <p className="text-[10px] text-slate-400 max-w-[200px]">Lower the minimum support and confidence thresholds in Settings to generate clinical rules.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Engine Pruning Stats */}
            {minedResults ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1">
                  <Cpu className="w-4 h-4 text-violet-500" /> PPC Pruning Efficiency
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Candidates Mined</span>
                      <span className="text-base font-extrabold text-slate-800 font-mono"><AnimatedCounter value={minedResults.stats.candidatesCount} /></span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Candidates Pruned</span>
                      <span className="text-base font-extrabold text-slate-800 font-mono"><AnimatedCounter value={minedResults.stats.prunedCount} /></span>
                    </div>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Tree Nodes vs Unique Items Ratio</span>
                      <span className="font-bold text-slate-700 font-mono">
                        {(minedResults.stats.treeNodeCount / Math.max(1, minedResults.stats.frequentItems)).toFixed(1)}x
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${Math.min(100, (minedResults.stats.treeNodeCount / Math.max(1, minedResults.stats.frequentItems)) * 10)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Represents the average path compression density achieved during prefix numbering.</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </div>
  )
}
