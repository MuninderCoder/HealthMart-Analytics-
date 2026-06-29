import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, FileSpreadsheet, Trash2, Eye, Clock,
  Rows, Columns, CheckCircle, History
} from 'lucide-react'
import EmptyState from './EmptyState'

function timeAgo(isoString) {
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000
  if (diff < 5) return 'Just now'
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function UploadHistory({ history, onView, onDelete }) {
  if (!history.length) {
    return (
      <EmptyState
        icon={History}
        title="No uploads yet"
        description="Datasets you upload this session will appear here."
      />
    )
  }

  return (
    <div className="space-y-2.5">
      <AnimatePresence initial={false}>
        {history.map((item, idx) => {
          const isExcel = item.fileType?.includes('Excel')
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group"
            >
              {/* File icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isExcel ? 'bg-emerald-50' : 'bg-blue-50'
              }`}>
                {isExcel
                  ? <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  : <FileText className="w-5 h-5 text-blue-600" />
                }
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.filename}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Rows className="w-2.5 h-2.5" /> {item.rows.toLocaleString()} rows
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Columns className="w-2.5 h-2.5" /> {item.columns} cols
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-2.5 h-2.5" /> {timeAgo(item.uploadTime)}
                  </span>
                  {item.fileSize && (
                    <span className="text-[10px] text-slate-400">{item.fileSize}</span>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <CheckCircle className="w-2.5 h-2.5" />
                Parsed
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {item.previewData && item.previewData.length > 0 && (
                  <button
                    onClick={() => onView(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 rounded-lg transition-all duration-200"
                    aria-label={`View dataset ${item.filename}`}
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                )}
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200"
                  aria-label={`Delete ${item.filename} from history`}
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
