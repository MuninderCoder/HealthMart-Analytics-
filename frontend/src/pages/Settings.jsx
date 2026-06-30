import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, ChevronRight, User, Bell, Shield, Database, Sliders, AlertTriangle } from 'lucide-react'

export default function Settings() {
  const [minSupport, setMinSupport] = useState(20)
  const [minConfidence, setMinConfidence] = useState(70)
  const [maxRuleLength, setMaxRuleLength] = useState(5)
  const [maxItemsetLength, setMaxItemsetLength] = useState(5)
  const [saveStatus, setSaveStatus] = useState('')

  // Load settings on mount
  useEffect(() => {
    const savedSupport = localStorage.getItem('hm_min_support')
    const savedConfidence = localStorage.getItem('hm_min_confidence')
    const savedMaxRule = localStorage.getItem('hm_max_rule_len')
    const savedMaxItemset = localStorage.getItem('hm_max_itemset_len')

    if (savedSupport) setMinSupport(parseFloat(savedSupport) * 100)
    if (savedConfidence) setMinConfidence(parseFloat(savedConfidence) * 100)
    if (savedMaxRule) setMaxRuleLength(parseInt(savedMaxRule))
    if (savedMaxItemset) setMaxItemsetLength(parseInt(savedMaxItemset))
  }, [])

  const handleSaveSettings = () => {
    localStorage.setItem('hm_min_support', (minSupport / 100).toString())
    localStorage.setItem('hm_min_confidence', (minConfidence / 100).toString())
    localStorage.setItem('hm_max_rule_len', maxRuleLength.toString())
    localStorage.setItem('hm_max_itemset_len', maxItemsetLength.toString())

    setSaveStatus('success')
    setTimeout(() => setSaveStatus(''), 3000)
  }

  const handleClearSession = () => {
    localStorage.removeItem('hm_active_dataset_id')
    localStorage.removeItem('hm_active_dataset_filename')
    localStorage.removeItem('hm_mining_results')
    setSaveStatus('cleared')
    setTimeout(() => setSaveStatus(''), 3000)
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>App</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your analysis parameters and session configuration.</p>
      </motion.div>

      {/* Save confirmation banner */}
      {saveStatus === 'success' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl"
        >
          ✓ Platform mining settings successfully saved and applied.
        </motion.div>
      )}
      {saveStatus === 'cleared' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl"
        >
          ✓ Session data and active datasets successfully cleared from state.
        </motion.div>
      )}

      {/* ─── 1. Mining Parameters ────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">DiffNodeset Mining Parameters</p>
            <p className="text-[11px] text-slate-400">Configure global thresholds for the association engine</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Min Support */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Minimum Support Count / Percentage</span>
              <span className="text-xs font-mono text-blue-600 font-bold">{minSupport}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={minSupport}
              onChange={(e) => setMinSupport(parseInt(e.target.value))}
              className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">Filters out itemsets that occur in fewer than this fraction of transactions.</p>
          </div>

          {/* Min Confidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Minimum Confidence</span>
              <span className="text-xs font-mono text-emerald-600 font-bold">{minConfidence}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseInt(e.target.value))}
              className="w-full accent-emerald-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">Rules A → C are kept only if the conditional probability P(C|A) is at least this threshold.</p>
          </div>

          {/* Max Itemset/Rule Length */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Max Itemset Size</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxItemsetLength}
                onChange={(e) => setMaxItemsetLength(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Max Rule Length</label>
              <input
                type="number"
                min="2"
                max="10"
                value={maxRuleLength}
                onChange={(e) => setMaxRuleLength(parseInt(e.target.value) || 2)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/20 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 hover:shadow-md transition-all active:scale-95"
          >
            Save Parameters
          </button>
        </div>
      </motion.div>

      {/* ─── 2. Account Profile (Placeholder info) ────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">User Profile</p>
            <p className="text-[11px] text-slate-400">Institutional analyst identification</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-xs font-medium text-slate-600 col-span-1">Full Name</label>
            <span className="col-span-2 text-xs text-slate-800 font-semibold">Healthcare Admin</span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-xs font-medium text-slate-600 col-span-1">Organization</label>
            <span className="col-span-2 text-xs text-slate-800 font-semibold">HealthMart Analytics Inc.</span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="text-xs font-medium text-slate-600 col-span-1">HIPAA Certification</label>
            <span className="col-span-2 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">Active</span>
          </div>
        </div>
      </motion.div>

      {/* ─── 3. Danger Zone ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-sm"
      >
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/30">
          <p className="text-sm font-bold text-rose-700">Danger Zone</p>
          <p className="text-[11px] text-slate-400">Irreversible actions — proceed with caution</p>
        </div>
        <div className="p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-800">Clear All Session Data</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Remove all active dataset assignments, parsed charts, and mining caches.</p>
          </div>
          <button
            onClick={handleClearSession}
            className="px-4 py-2 border border-rose-300 text-rose-600 text-xs font-semibold rounded-xl hover:bg-rose-50 transition-colors shrink-0 active:scale-95"
          >
            Clear Data
          </button>
        </div>
      </motion.div>
    </div>
  )
}
