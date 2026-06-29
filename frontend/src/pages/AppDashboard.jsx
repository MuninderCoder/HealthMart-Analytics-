import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Database,
  Activity, Sparkles, Clock, MoreHorizontal,
  Upload, ChevronRight
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  topDiseases, topMedicines, symptomPatterns,
  medicineAssociations, recentUploads,
  diseaseChartData, medicineChartData, PIE_COLORS
} from '../data/dummyData'

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
      <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change}
        <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
      </div>
    </motion.div>
  )
}

export default function AppDashboard() {
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
          <p className="text-sm text-slate-500 mt-1">Welcome back. Here's what's happening with your healthcare data.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white outline-none focus:border-blue-400 transition-colors">
            <option>Last 6 Months</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
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
        <KpiCard title="Total Records" value="84,200" change="+12.4%" positive icon={Database} color="bg-blue-500" />
        <KpiCard title="Active Patterns" value="1,284" change="+8.1%" positive icon={Activity} color="bg-emerald-500" />
        <KpiCard title="Associations" value="342" change="+15.2%" positive icon={Sparkles} color="bg-violet-500" />
        <KpiCard title="Pending Jobs" value="7" change="-3 jobs" positive={false} icon={Clock} color="bg-amber-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Area chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Disease Trend Analysis</h3>
              <p className="text-[10px] text-slate-400">Jan – Jun 2025</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={diseaseChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="hypertension" name="Hypertension" stroke="#3b82f6" strokeWidth={2} fill="url(#dg1)" />
              <Area type="monotone" dataKey="diabetes" name="Diabetes" stroke="#10b981" strokeWidth={2} fill="url(#dg2)" />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Medicine Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={medicineChartData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {medicineChartData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data rows */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Top Diseases */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Top Diseases</h3>
            <NavLink to="/app/disease-analytics" className="text-xs text-blue-600 hover:underline">View all</NavLink>
          </div>
          <div className="space-y-3">
            {topDiseases.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{d.name}</span>
                    <span className={`text-[10px] font-semibold ${d.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}`}>{d.trend}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: d.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(d.count / 20000) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent uploads widget */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Uploads</h3>
            <NavLink to="/app/dataset-manager" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <Upload className="w-3 h-3" /> Upload new
            </NavLink>
          </div>
          <div className="space-y-2">
            {recentUploads.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Database className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{f.name}</p>
                  <p className="text-[10px] text-slate-400">{f.rows.toLocaleString()} rows · {f.time}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  f.status === 'analyzed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  f.status === 'processing' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Symptom patterns */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Frequent Symptom Patterns</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">DiffNodeset · Min Support 50%</p>
          </div>
          <span className="px-2 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-semibold rounded-full border border-violet-100">
            {symptomPatterns.length} patterns
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {symptomPatterns.map((sp, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-slate-700 leading-snug flex-1">{sp.pattern}</p>
                <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded shrink-0">
                  lift {sp.lift}x
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${sp.support * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.7 }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium shrink-0">{(sp.support * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
