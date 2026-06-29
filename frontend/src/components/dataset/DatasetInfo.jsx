import { motion } from 'framer-motion'
import { FileText, FileSpreadsheet, Clock, Rows, Columns, HardDrive } from 'lucide-react'

function InfoCard({ icon: Icon, label, value, color = 'blue', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        color === 'blue'    ? 'bg-blue-50'    :
        color === 'emerald' ? 'bg-emerald-50' :
        color === 'violet'  ? 'bg-violet-50'  :
        color === 'amber'   ? 'bg-amber-50'   :
        'bg-slate-50'
      }`}>
        <Icon className={`w-4.5 h-4.5 ${
          color === 'blue'    ? 'text-blue-600'    :
          color === 'emerald' ? 'text-emerald-600' :
          color === 'violet'  ? 'text-violet-600'  :
          color === 'amber'   ? 'text-amber-600'   :
          'text-slate-600'
        }`} style={{ width: '18px', height: '18px' }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value}</p>
      </div>
    </motion.div>
  )
}

function timeAgo(isoString) {
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function DatasetInfo({ file, summary, uploadTime }) {
  if (!file || !summary) return null

  const isExcel = summary.fileType?.includes('Excel')

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <InfoCard
        icon={isExcel ? FileSpreadsheet : FileText}
        label="File Name"
        value={file.name.length > 20 ? file.name.slice(0, 18) + '…' : file.name}
        color={isExcel ? 'emerald' : 'blue'}
        delay={0}
      />
      <InfoCard
        icon={isExcel ? FileSpreadsheet : FileText}
        label="File Type"
        value={summary.fileType}
        color={isExcel ? 'emerald' : 'blue'}
        delay={0.05}
      />
      <InfoCard
        icon={HardDrive}
        label="File Size"
        value={summary.fileSize}
        color="violet"
        delay={0.1}
      />
      <InfoCard
        icon={Clock}
        label="Uploaded"
        value={uploadTime ? timeAgo(uploadTime) : '—'}
        color="amber"
        delay={0.15}
      />
      <InfoCard
        icon={Rows}
        label="Total Rows"
        value={summary.records.toLocaleString()}
        color="blue"
        delay={0.2}
      />
      <InfoCard
        icon={Columns}
        label="Total Columns"
        value={summary.columns.toLocaleString()}
        color="emerald"
        delay={0.25}
      />
    </div>
  )
}
