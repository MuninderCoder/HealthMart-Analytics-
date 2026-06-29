import { useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileSpreadsheet, FileText, X, CloudUpload,
  CheckCircle, AlertCircle
} from 'lucide-react'

function FileTypeTag({ type }) {
  const isExcel = type === 'xlsx' || type === 'xls'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
      isExcel
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-blue-50 text-blue-700 border-blue-200'
    }`}>
      {isExcel ? <FileSpreadsheet className="w-2.5 h-2.5" /> : <FileText className="w-2.5 h-2.5" />}
      {type.toUpperCase()}
    </span>
  )
}

const ALLOWED_EXTS = ['csv', 'xlsx', 'xls']

export default function DatasetUpload({ onFileSelect, currentFile, status, progress = 0 }) {
  const [dragging, setDragging] = useState(false)
  const [dragError, setDragError] = useState('')

  const validateAndSelect = useCallback((file) => {
    if (!file) return
    setDragError('')
    const ext = file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTS.includes(ext)) {
      setDragError(`Unsupported file type ".${ext}". Please upload CSV or Excel (.xlsx, .xls) files only.`)
      return
    }
    onFileSelect(file)
  }, [onFileSelect])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    validateAndSelect(e.dataTransfer.files[0])
  }, [validateAndSelect])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false) }

  const handleInput = (e) => {
    validateAndSelect(e.target.files[0])
    e.target.value = ''
  }

  const ext = currentFile?.name.split('.').pop().toLowerCase()
  const isReady = status === 'ready'
  const isParsing = status === 'parsing'
  const isError = status === 'error'

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">

        {/* ─── Ready state ─── */}
        {isReady && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-4 p-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              {ext === 'csv' ? (
                <FileText className="w-6 h-6 text-emerald-600" />
              ) : (
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-slate-800 truncate">{currentFile.name}</p>
                <FileTypeTag type={ext} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {(currentFile.size / 1024).toFixed(1)} KB · Parsed successfully
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <button
              onClick={() => onFileSelect(null)}
              className="p-1.5 rounded-lg hover:bg-emerald-200 text-emerald-600 transition-colors shrink-0"
              aria-label="Remove uploaded file"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ─── Parsing / progress state ─── */}
        {isParsing && (
          <motion.div
            key="parsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl"
            role="status"
            aria-live="polite"
            aria-label="Parsing dataset"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Upload className="w-6 h-6 text-blue-600" />
                </motion.div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Parsing dataset…</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentFile?.name && `Reading ${currentFile.name}`}
                </p>
              </div>
              <span className="text-sm font-bold text-blue-600 tabular-nums">{progress}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full bg-blue-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* ─── Idle / drop zone ─── */}
        {!isReady && !isParsing && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.label
              htmlFor="file-input"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              animate={{
                borderColor: dragging ? '#3b82f6' : isError ? '#f43f5e' : '#e2e8f0',
                backgroundColor: dragging ? '#eff6ff' : isError ? '#fff1f2' : '#f8fafc',
                scale: dragging ? 1.01 : 1,
              }}
              className="flex flex-col items-center justify-center gap-5 p-10 sm:p-14 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200"
            >
              <motion.div
                animate={dragging ? { scale: 1.2, y: -6 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-18 h-18 rounded-2xl flex items-center justify-center transition-colors ${
                  dragging ? 'bg-blue-100' : isError ? 'bg-rose-50' : 'bg-white border border-slate-200 shadow-sm'
                }`}
                style={{ width: 72, height: 72 }}
              >
                <CloudUpload className={`w-9 h-9 transition-colors ${
                  dragging ? 'text-blue-600' : isError ? 'text-rose-400' : 'text-slate-300'
                }`} />
              </motion.div>

              <div className="text-center">
                <p className="text-base font-bold text-slate-700 mb-1">
                  {dragging ? '✦ Drop your file here' : 'Drag & drop your healthcare dataset'}
                </p>
                <p className="text-sm text-slate-400 mb-4">or click to browse from your computer</p>
                <div className="flex items-center justify-center gap-2">
                  <FileTypeTag type="csv" />
                  <FileTypeTag type="xlsx" />
                  <FileTypeTag type="xls" />
                  <span className="text-xs text-slate-400">· up to 50 MB</span>
                </div>
              </div>

              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Browse Files
              </motion.span>

              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleInput}
                aria-label="Upload healthcare dataset file"
              />
            </motion.label>

            {/* Drag error message */}
            <AnimatePresence>
              {dragError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <p className="text-xs text-rose-700">{dragError}</p>
                  <button
                    onClick={() => setDragError('')}
                    className="ml-auto text-rose-400 hover:text-rose-600"
                    aria-label="Dismiss error"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ─── Format hint cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '📋', label: 'CSV Files', desc: 'Comma-separated values' },
          { icon: '📊', label: 'Excel (.xlsx)', desc: 'Microsoft Excel format' },
          { icon: '🏥', label: 'Hospital Records', desc: 'Patient & disease data' },
          { icon: '💊', label: 'Pharmacy Data', desc: 'Prescription datasets' },
        ].map((h) => (
          <div key={h.label} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
            <span className="text-lg">{h.icon}</span>
            <div>
              <p className="text-[11px] font-semibold text-slate-700">{h.label}</p>
              <p className="text-[10px] text-slate-400">{h.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
