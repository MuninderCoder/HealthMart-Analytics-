import { motion } from 'framer-motion'
import { Activity, ChevronRight, Upload } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { topDiseases, diseaseChartData } from '../data/dummyData'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export default function DiseaseAnalytics() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>App</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Disease Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Disease Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Discover frequent disease patterns from historical healthcare records.</p>
      </motion.div>

      {/* Coming soon banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden border border-blue-200 bg-gradient-to-r from-blue-50 to-violet-50 p-6 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Activity className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">Full analytics coming in Phase 3</p>
          <p className="text-xs text-slate-500 mt-0.5">Upload a dataset in the Dataset Manager to enable live disease pattern analysis.</p>
        </div>
        <NavLink to="/app/dataset-manager"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shrink-0"
        >
          <Upload className="w-3.5 h-3.5" /> Upload Data
        </NavLink>
      </motion.div>

      {/* Preview charts with mock data */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Disease Trend — 6 Month View</h3>
          <p className="text-[10px] text-slate-400 mb-4">Sample data · Connect dataset for live analysis</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={diseaseChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                <linearGradient id="dB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                <linearGradient id="dC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="hypertension" name="Hypertension" stroke="#3b82f6" strokeWidth={2} fill="url(#dA)" />
              <Area type="monotone" dataKey="diabetes" name="Diabetes" stroke="#10b981" strokeWidth={2} fill="url(#dB)" />
              <Area type="monotone" dataKey="asthma" name="Asthma" stroke="#8b5cf6" strokeWidth={2} fill="url(#dC)" />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Top 5 Diseases by Case Count</h3>
          <p className="text-[10px] text-slate-400 mb-4">Sample data</p>
          <div className="space-y-3">
            {topDiseases.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                <span className="text-xs text-slate-700 w-40 truncate">{d.name}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: d.color }}
                    initial={{ width: 0 }} whileInView={{ width: `${(d.count / 20000) * 100}%` }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.8 }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 w-16 text-right">{d.count.toLocaleString()}</span>
                <span className={`text-[10px] font-semibold w-10 ${d.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}`}>{d.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
