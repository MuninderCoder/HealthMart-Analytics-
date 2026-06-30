import { motion } from 'framer-motion'
import { Pill, ChevronRight, Upload, ArrowUpRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { topMedicines, medicineAssociations, medicineChartData, PIE_COLORS } from '../data/dummyData'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function MedicineAnalytics() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>App</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Medicine Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Medicine Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Identify frequently co-prescribed medicines and association rules.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <Pill className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">Medicine association mining — Phase 4 (DiffNodeset)</p>
          <p className="text-xs text-slate-500 mt-0.5">Upload pharmacy or prescription data to discover co-prescription patterns using Apriori & DiffNodeset.</p>
        </div>
        <NavLink to="/app/dataset-manager"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors shrink-0"
        >
          <Upload className="w-3.5 h-3.5" /> Upload Data
        </NavLink>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Top medicines */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Top Prescribed Medicines</h3>
          <div className="space-y-2.5">
            {topMedicines.map((m) => (
              <div key={m.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${m.color}15` }}>
                  <Pill className="w-4 h-4" style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{m.name}</p>
                  <p className="text-[10px] text-slate-400">{m.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-900">{m.count.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">prescriptions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Association rules preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Association Rules</h3>
          <p className="text-[10px] text-slate-400 mb-4">Sample data · Phase 4 will generate live from your dataset</p>
          <div className="space-y-2.5">
            {medicineAssociations.map((ma, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 font-mono">{ma.rule}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-slate-500">conf: <span className="font-semibold text-slate-700">{(ma.confidence * 100).toFixed(0)}%</span></span>
                    <span className="text-[10px] text-slate-500">sup: <span className="font-semibold text-slate-700">{(ma.support * 100).toFixed(0)}%</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
