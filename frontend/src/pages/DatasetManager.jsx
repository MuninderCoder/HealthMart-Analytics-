import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import {
  Upload, Eye, BarChart2, History, Cpu,
  ChevronRight, Info, Columns, AlertTriangle, Lightbulb,
  ArrowRightLeft, Sparkles, LayoutDashboard
} from 'lucide-react'

import DatasetUpload       from '../components/dataset/DatasetUpload'
import DatasetPreview      from '../components/dataset/DatasetPreview'
import DatasetInfo         from '../components/dataset/DatasetInfo'
import DatasetSummary      from '../components/dataset/DatasetSummary'
import UploadHistory       from '../components/dataset/UploadHistory'
import ToastContainer      from '../components/dataset/ToastContainer'

// New Phase 2B Components
import DatasetHealth       from '../components/dataset/DatasetHealth'
import ColumnInspector     from '../components/dataset/ColumnInspector'
import QualityInspector    from '../components/dataset/QualityInspector'
import CleaningSuggestions from '../components/dataset/CleaningSuggestions'
import TransactionPreview  from '../components/dataset/TransactionPreview'
import ReadinessCard       from '../components/dataset/ReadinessCard'
import AnalyticsOverview   from '../components/dataset/AnalyticsOverview'

import {
  summarizeDataset,
  analyzeColumnsFull,
  computeHealthScore,
  generateQualityChecks,
  generateCleaningSuggestions,
  generateTransactions,
  computeAnalyticsOverview
} from '../utils/datasetUtils'

// ─── Toast hook ──────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((type, message) => {
    const id = Date.now() + Math.random()
    setToasts((p) => [...p, { id, type, message }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id))
  }, [])

  return { toasts, show, dismiss }
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ id, icon: Icon, title, subtitle, badge, children }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-800">{title}</h2>
            {badge && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DatasetManager() {
  const toast = useToast()

  // ── Upload state ────────────────────────────────────────────────────────────
  const [status, setStatus]         = useState('idle')   // idle | parsing | ready | error
  const [progress, setProgress]     = useState(0)
  const [file, setFile]             = useState(null)
  const [rawData, setRawData]       = useState([])
  const [columns, setColumns]       = useState([])
  const [summary, setSummary]       = useState(null)
  const [uploadTime, setUploadTime] = useState(null)
  const [errorMsg, setErrorMsg]     = useState('')

  // Phase 2B specific states
  const [colAnalysis, setColAnalysis]   = useState([])
  const [health, setHealth]             = useState(null)
  const [qualityChecks, setQualityChecks] = useState([])
  const [suggestions, setSuggestions]   = useState([])
  const [transactions, setTransactions] = useState(null)
  const [analytics, setAnalytics]       = useState(null)

  // ── Session history ─────────────────────────────────────────────────────────
  const [history, setHistory] = useState([])

  // Progress interval ref
  const progressTimer = useRef(null)

  // ── Progress animation ──────────────────────────────────────────────────────
  const startProgressRamp = useCallback(() => {
    setProgress(0)
    let p = 0
    clearInterval(progressTimer.current)
    progressTimer.current = setInterval(() => {
      p += Math.random() * 18
      if (p >= 88) { p = 88; clearInterval(progressTimer.current) }
      setProgress(Math.floor(p))
    }, 120)
  }, [])

  const finishProgress = useCallback(() => {
    clearInterval(progressTimer.current)
    setProgress(100)
  }, [])

  // ── Process parsed data ─────────────────────────────────────────────────────
  const processData = useCallback((data, cols, uploadedFile) => {
    const sum = summarizeDataset(data, cols, uploadedFile)
    const now = new Date().toISOString()

    // Phase 2B calculations
    const analysis = analyzeColumnsFull(data, cols)
    const hlth = computeHealthScore(data, analysis)
    const qChecks = generateQualityChecks(data, cols, analysis)
    const suggs = generateCleaningSuggestions(analysis, qChecks)
    const tx = generateTransactions(data, analysis)
    const anly = computeAnalyticsOverview(data, analysis)

    finishProgress()
    setTimeout(() => {
      setRawData(data)
      setColumns(cols)
      setSummary(sum)
      setUploadTime(now)

      // Set Phase 2B states
      setColAnalysis(analysis)
      setHealth(hlth)
      setQualityChecks(qChecks)
      setSuggestions(suggs)
      setTransactions(tx)
      setAnalytics(anly)

      setStatus('ready')

      setHistory((prev) => [
        {
          id: Date.now(),
          filename: uploadedFile.name,
          rows: data.length,
          columns: cols.length,
          uploadTime: now,
          fileSize: sum.fileSize,
          fileType: sum.fileType,
          status: 'ready',
          // Store preview data for View functionality (capped at 500 rows)
          previewData: data.slice(0, 500),
          previewColumns: cols,
          colAnalysis: analysis,
          health: hlth,
          qualityChecks: qChecks,
          suggestions: suggs,
          transactions: tx,
          analytics: anly,
        },
        ...prev.slice(0, 9),
      ])

      toast.show('success', `✓ "${uploadedFile.name}" parsed — ${data.length.toLocaleString()} rows, ${cols.length} columns.`)
    }, 350) // let progress bar reach 100% visually first
  }, [finishProgress, toast])

  // ── File select handler ─────────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (selectedFile) => {
    if (!selectedFile) {
      setFile(null)
      setRawData([])
      setColumns([])
      setStatus('idle')
      setSummary(null)
      setUploadTime(null)
      setProgress(0)
      clearInterval(progressTimer.current)

      // Reset Phase 2B states
      setColAnalysis([])
      setHealth(null)
      setQualityChecks([])
      setSuggestions([])
      setTransactions(null)
      setAnalytics(null)
      return
    }

    setFile(selectedFile)
    setStatus('parsing')
    setErrorMsg('')
    startProgressRamp()

    const ext = selectedFile.name.split('.').pop().toLowerCase()

    try {
      if (ext === 'csv') {
        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            if (!results.data || results.data.length === 0) {
              clearInterval(progressTimer.current)
              setProgress(0)
              setStatus('error')
              setErrorMsg('The CSV file appears to be empty or has no valid rows.')
              toast.show('error', 'CSV file is empty or has no valid rows.')
              return
            }
            const cols = results.meta.fields || []
            processData(results.data, cols, selectedFile)
          },
          error: (err) => {
            clearInterval(progressTimer.current)
            setProgress(0)
            setStatus('error')
            const msg = err.message || 'Failed to parse CSV.'
            setErrorMsg(msg)
            toast.show('error', `CSV parse error: ${msg}`)
          },
        })
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await selectedFile.arrayBuffer()
        const wb = XLSX.read(buffer, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
        if (!data || data.length === 0) {
          clearInterval(progressTimer.current)
          setProgress(0)
          setStatus('error')
          setErrorMsg('The Excel file appears to be empty or has data in the first sheet.')
          toast.show('error', 'Excel file is empty or has data.')
          return
        }
        const cols = data.length > 0 ? Object.keys(data[0]) : []
        processData(data, cols, selectedFile)
      } else {
        clearInterval(progressTimer.current)
        setProgress(0)
        setStatus('error')
        setErrorMsg(`Unsupported file type ".${ext}". Please upload a CSV or Excel file.`)
        toast.show('error', `Unsupported file type ".${ext}". Use CSV or .xlsx only.`)
      }
    } catch (err) {
      clearInterval(progressTimer.current)
      setProgress(0)
      setStatus('error')
      const msg = err.message || 'Unexpected error while reading file.'
      setErrorMsg(msg)
      toast.show('error', msg)
    }
  }, [startProgressRamp, processData, toast])

  // ── View a history item ─────────────────────────────────────────────────────
  const handleViewHistory = useCallback((item) => {
    setRawData(item.previewData)
    setColumns(item.previewColumns)
    setSummary({
      records: item.rows,
      columns: item.columns,
      fileSize: item.fileSize,
      fileType: item.fileType,
    })
    setUploadTime(item.uploadTime)
    setFile({ name: item.filename, size: 0 })

    // Restore Phase 2B states from history item
    setColAnalysis(item.colAnalysis || [])
    setHealth(item.health || null)
    setQualityChecks(item.qualityChecks || [])
    setSuggestions(item.suggestions || [])
    setTransactions(item.transactions || null)
    setAnalytics(item.analytics || null)

    setStatus('ready')
    setProgress(100)
    toast.show('info', `Viewing "${item.filename}" from history.`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [toast])

  // ── Delete history item ─────────────────────────────────────────────────────
  const handleDeleteHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id))
    toast.show('info', 'Removed from upload history.')
  }, [toast])

  const isReady = status === 'ready'

  return (
    <div className="relative p-6 space-y-6 max-w-6xl mx-auto">

      {/* ─── Toasts ───────────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

      {/* ─── Page Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>App</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-semibold">Dataset Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Dataset Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-lg">
            Upload, parse, and preview healthcare datasets before running pattern analysis.
          </p>
        </div>

        <AnimatePresence>
          {isReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">Dataset Ready</span>
              <span className="text-xs text-emerald-500">— {rawData.length.toLocaleString()} rows</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── 1. Upload ────────────────────────────────────────────────────────── */}
      <Section
        id="upload"
        icon={Upload}
        title="Upload Dataset"
        subtitle="Drag & drop or browse · CSV and Excel supported"
      >
        <DatasetUpload
          onFileSelect={handleFileSelect}
          currentFile={file}
          status={status}
          progress={progress}
        />

        {/* Parse error banner */}
        <AnimatePresence>
          {status === 'error' && errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-200 rounded-xl"
            >
              <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-700">Parse Error</p>
                <p className="text-xs text-rose-600 mt-0.5">{errorMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* ─── 2. Readiness Diagnostic Card ────────────────────────────────────── */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            key="readiness"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <ReadinessCard
              parsed={isReady}
              preview={isReady && rawData.length > 0}
              columns={isReady && colAnalysis.length > 0}
              quality={isReady && qualityChecks.length > 0}
              tx={isReady && transactions !== null}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 3. Dataset Health Score (circular indicator) ────────────────────── */}
      <AnimatePresence>
        {isReady && health && (
          <motion.div
            key="health"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <Section
              id="health-score"
              icon={Sparkles}
              title="Dataset Health Score"
              subtitle="Overall analysis of file consistency, missing values, duplicates, and invalid inputs"
            >
              <DatasetHealth health={health} />
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 4. Dataset Info ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isReady && summary && (
          <motion.section
            key="info"
            id="info"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Dataset Information</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Automatically computed from your file</p>
              </div>
            </div>
            <div className="p-6">
              <DatasetInfo file={file} summary={summary} uploadTime={uploadTime} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── 5. Summary Cards ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isReady && summary && (
          <motion.section
            key="summary"
            id="summary"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Summary Statistics</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Key metrics from your dataset</p>
              </div>
            </div>
            <div className="p-6">
              <DatasetSummary summary={summary} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── 6. Smart Column Inspector ───────────────────────────────────────── */}
      <AnimatePresence>
        {isReady && colAnalysis.length > 0 && (
          <motion.div
            key="column-inspector"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <Section
              id="columns"
              icon={Columns}
              title="Column Inspector & Types"
              subtitle="Categorizes columns into Identifiers, Numeric, Categorical, Boolean, Date, Multi-value or Text"
            >
              <ColumnInspector analysis={colAnalysis} />
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 7. Quality Diagnostics ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isReady && qualityChecks.length > 0 && (
          <motion.div
            key="quality-inspector"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <Section
              id="quality"
              icon={AlertTriangle}
              title="Data Quality Diagnostics"
              subtitle="Locates inconsistencies, empty structures, duplicates, or format errors across rows and cells"
            >
              <QualityInspector checks={qualityChecks} />
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 8. Cleaning Advice Suggestions ──────────────────────────────────── */}
      <AnimatePresence>
        {isReady && suggestions.length > 0 && (
          <motion.div
            key="cleaning-suggestions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <Section
              id="suggestions"
              icon={Lightbulb}
              title="Data Cleaning Advice Recommendations"
              subtitle="Suggested non-destructive optimizations to maximize pattern mining accuracy in Phase 3"
            >
              <CleaningSuggestions suggestions={suggestions} />
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 9. Transaction Generator & Preview ──────────────────────────────── */}
      <AnimatePresence>
        {isReady && transactions && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <Section
              id="transactions-preview"
              icon={ArrowRightLeft}
              title="Transaction Preview (DiffNodeset Model)"
              subtitle="Structures tabular diagnostic fields into distinct transactional itemsets for pattern mining"
            >
              <TransactionPreview txData={transactions} />
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 10. Analytics Demographics ───────────────────────────────────────── */}
      <AnimatePresence>
        {isReady && analytics && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <Section
              id="analytics-overview"
              icon={LayoutDashboard}
              title="Clinical & Patient Analytics"
              subtitle="Aggregated clinical parameters, demographic divisions, and consulting physician statistics"
            >
              <AnalyticsOverview overview={analytics} />
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 11. Dataset Table Preview ───────────────────────────────────────── */}
      <Section
        id="preview"
        icon={Eye}
        title="Dataset Preview Table"
        subtitle={
          isReady
            ? `${rawData.length.toLocaleString()} rows · ${columns.length} columns · 20 rows per page · search & sort`
            : 'Upload a dataset to see the preview table'
        }
        badge={isReady ? `${rawData.length.toLocaleString()} rows` : undefined}
      >
        <DatasetPreview
          data={rawData}
          columns={columns}
          filename={file?.name}
          status={status}
        />
      </Section>

      {/* ─── 12. Upload History ───────────────────────────────────────────────── */}
      <Section
        id="history"
        icon={History}
        title="Upload History"
        subtitle="Datasets uploaded this session"
        badge={history.length > 0 ? `${history.length} file${history.length > 1 ? 's' : ''}` : undefined}
      >
        <UploadHistory
          history={history}
          onView={handleViewHistory}
          onDelete={handleDeleteHistory}
        />
      </Section>

      {/* ─── 13. Locked Phase 3 Engine Banner ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden border border-slate-200"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="grid-pattern h-full" />
        </div>
        <div className="absolute top-4 left-1/4 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-4 right-1/4 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8 z-10">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Cpu className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
              Ready to Run Pattern Mining?
            </h3>
            <p className="text-sm text-slate-400 max-w-lg">
              The DiffNodeset engine will be connected in Phase 3. Once activated, it will analyze
              your dataset to discover frequent symptom combinations, medicine associations, and
              treatment patterns.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 shrink-0">
            <button
              disabled
              className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-600/40 border border-blue-500/40 text-blue-300 font-bold text-sm rounded-xl cursor-not-allowed opacity-60 animate-pulse"
            >
              <Cpu className="w-4 h-4" />
              Run Pattern Mining
            </button>
            <span className="text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full font-semibold">
              🔒 Available in Phase 3
            </span>
          </div>
        </div>
      </motion.div>

    </div>
  )
}
