import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Activity, Pill, FileText, Settings,
  TrendingUp, TrendingDown, Upload, CheckCircle, Clock,
  AlertCircle, ChevronRight, MoreHorizontal, ArrowUpRight,
  Sparkles, Bell, Search, Database
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  topDiseases, topMedicines, symptomPatterns,
  medicineAssociations, recentUploads,
  diseaseChartData, medicineChartData, PIE_COLORS
} from '../data/dummyData'

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Activity, label: 'Disease Analytics' },
  { icon: Pill, label: 'Medicine Analytics' },
  { icon: FileText, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
]

function Sidebar() {
  const [active, setActive] = useState('Dashboard')

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 rounded-2xl p-4 gap-1 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
          <Activity className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-white leading-none">HealthMart</p>
          <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">Analytics</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1">
        <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Main Menu</p>
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 mb-0.5 ${
              active === item.label
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
            {active === item.label && <ChevronRight className="w-3 h-3 ml-auto" />}
          </button>
        ))}
      </div>

      {/* Upload pill */}
      <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <p className="text-[10px] font-semibold text-slate-300">Upload Dataset</p>
        </div>
        <p className="text-[9px] text-slate-500 mb-2.5">CSV or Excel files up to 50MB</p>
        <button className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold rounded-lg transition-colors">
          Browse Files
        </button>
      </div>
    </aside>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ title, value, change, positive, icon: Icon, color }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-200 card-shadow p-5 hover:card-shadow-md transition-all duration-200"
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

// ─── Disease List ─────────────────────────────────────────────────────────────
function DiseaseList() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Top Diseases</h3>
        <button className="text-xs text-blue-600 font-medium hover:underline">View all</button>
      </div>
      <div className="space-y-3">
        {topDiseases.map((d, i) => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700">{d.name}</span>
                <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${d.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {d.trend.startsWith('+') ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {d.trend}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: d.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(d.count / 20000) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                />
              </div>
              <span className="text-[10px] text-slate-400">{d.count.toLocaleString()} cases</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Medicine List ─────────────────────────────────────────────────────────────
function MedicineList() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Top Medicines</h3>
        <button className="text-xs text-blue-600 font-medium hover:underline">View all</button>
      </div>
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
  )
}

// ─── Symptom Patterns ─────────────────────────────────────────────────────────
function SymptomPatterns() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Frequent Symptom Patterns</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">DiffNodeset · Min Support 50%</p>
        </div>
        <span className="px-2 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-semibold rounded-full border border-violet-100">
          {symptomPatterns.length} patterns
        </span>
      </div>
      <div className="space-y-3">
        {symptomPatterns.map((sp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-violet-200 transition-colors"
          >
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
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium shrink-0">{(sp.support * 100).toFixed(0)}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Medicine Associations ────────────────────────────────────────────────────
function MedicineAssociations() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Medicine Associations</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Association rules · FP-Growth</p>
        </div>
        <button className="text-xs text-blue-600 font-medium hover:underline">Details</button>
      </div>
      <div className="space-y-2.5">
        {medicineAssociations.map((ma, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors group">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 font-mono">{ma.rule}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-slate-500">conf: <span className="font-semibold text-slate-700">{(ma.confidence * 100).toFixed(0)}%</span></span>
                <span className="text-[10px] text-slate-500">sup: <span className="font-semibold text-slate-700">{(ma.support * 100).toFixed(0)}%</span></span>
              </div>
            </div>
            <div className="w-10 h-10 shrink-0">
              <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke="#3b82f6" strokeWidth="3"
                  strokeDasharray={`${ma.confidence * 88} 88`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Recent Uploads ───────────────────────────────────────────────────────────
const statusConfig = {
  analyzed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Analyzed' },
  processing: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Processing' },
  queued: { icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Queued' },
}

function RecentUploads() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Recent Uploads</h3>
        <button className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
          <Upload className="w-3 h-3" />
          Upload new
        </button>
      </div>
      <div className="space-y-2.5">
        {recentUploads.map((file) => {
          const s = statusConfig[file.status]
          const Icon = s.icon
          return (
            <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-400">{file.rows.toLocaleString()} rows · {file.size} · {file.time}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.color} ${s.bg} shrink-0`}>
                <Icon className="w-2.5 h-2.5" />
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Disease Chart ─────────────────────────────────────────────────────────────
function DiseaseChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Disease Trend Analysis</h3>
          <p className="text-[10px] text-slate-400">Jan – Jun 2025</p>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={diseaseChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHyp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAst" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
          />
          <Area type="monotone" dataKey="hypertension" name="Hypertension" stroke="#3b82f6" strokeWidth={2} fill="url(#colorHyp)" />
          <Area type="monotone" dataKey="diabetes" name="Diabetes" stroke="#10b981" strokeWidth={2} fill="url(#colorDia)" />
          <Area type="monotone" dataKey="asthma" name="Asthma" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorAst)" />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Medicine Pie ─────────────────────────────────────────────────────────────
function MedicinePie() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Medicine Distribution</h3>
          <p className="text-[10px] text-slate-400">Prescription share</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={medicineChartData}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
          >
            {medicineChartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <section id="dashboard" className="py-24 bg-slate-50 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Analytics Dashboard
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Your analytics,{' '}
            <span className="text-gradient">all in one place</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Explore the full power of HealthMart Analytics through our intelligent dashboard — designed for clinicians, analysts, and administrators.
          </p>
        </motion.div>

        {/* Dashboard shell */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-slate-100 rounded-3xl p-3 border border-slate-200 card-shadow-xl"
        >
          {/* Browser chrome bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] text-slate-500 font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                app.healthmart-analytics.com/dashboard
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Dashboard layout */}
          <div className="flex gap-3 min-h-[640px]">
            <Sidebar />

            {/* Main content */}
            <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Overview Dashboard</h2>
                  <p className="text-[10px] text-slate-400">Last updated: 2 minutes ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <select className="text-[10px] border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white outline-none">
                    <option>Last 6 Months</option>
                    <option>Last 30 Days</option>
                    <option>This Year</option>
                  </select>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    <Sparkles className="w-3 h-3" />
                    AI Explain
                  </button>
                </div>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard title="Total Records" value="84,200" change="+12.4%" positive icon={Database} color="bg-blue-500" />
                <KpiCard title="Active Patterns" value="1,284" change="+8.1%" positive icon={Activity} color="bg-emerald-500" />
                <KpiCard title="Associations" value="342" change="+15.2%" positive icon={Sparkles} color="bg-violet-500" />
                <KpiCard title="Pending Jobs" value="7" change="-3 jobs" positive={false} icon={Clock} color="bg-amber-500" />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                <div className="xl:col-span-2">
                  <DiseaseChart />
                </div>
                <MedicinePie />
              </div>

              {/* Data tables row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <DiseaseList />
                <MedicineList />
              </div>

              {/* Patterns row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <SymptomPatterns />
                <MedicineAssociations />
              </div>

              {/* Uploads */}
              <RecentUploads />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
