import { motion } from 'framer-motion'
import { FileText, ChevronRight, Download, Eye, Calendar } from 'lucide-react'

const sampleReports = [
  { id: 1, title: 'Disease Pattern Report — Q2 2025', type: 'Disease Analytics', date: '2025-06-28', size: '2.4 MB', status: 'ready' },
  { id: 2, title: 'Medicine Association Summary', type: 'Medicine Analytics', date: '2025-06-25', size: '1.8 MB', status: 'ready' },
  { id: 3, title: 'Hospital Dataset Validation Report', type: 'Data Quality', date: '2025-06-20', size: '0.9 MB', status: 'ready' },
  { id: 4, title: 'Monthly Healthcare Trends', type: 'Dashboard Export', date: '2025-06-15', size: '3.1 MB', status: 'draft' },
]

export default function Reports() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>App</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Reports</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">View, download, and share generated analytics reports.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-100 flex items-center gap-4"
      >
        <FileText className="w-8 h-8 text-blue-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-slate-800">AI-Generated Reports — Phase 3</p>
          <p className="text-xs text-slate-500 mt-0.5">Reports with natural language explanations will auto-generate after dataset analysis runs.</p>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Sample Reports</h3>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Preview Mode</span>
        </div>
        <div className="divide-y divide-slate-100">
          {sampleReports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5 text-blue-500" style={{ width: 18, height: 18 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">{r.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-slate-400">{r.type}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400"><Calendar className="w-2.5 h-2.5" />{r.date}</span>
                  <span className="text-[10px] text-slate-400">{r.size}</span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                r.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>{r.status}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors" title="Preview"><Eye className="w-3.5 h-3.5 text-slate-500" /></button>
                <button className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors" title="Download"><Download className="w-3.5 h-3.5 text-blue-500" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
