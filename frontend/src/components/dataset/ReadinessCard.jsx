import { motion } from 'framer-motion'
import { Cpu, CheckCircle2, Circle } from 'lucide-react'

export default function ReadinessCard({ parsed = false, preview = false, columns = false, quality = false, tx = false }) {
  const steps = [
    { label: 'Dataset Parsed', ready: parsed },
    { label: 'Dataset Preview Generated', ready: preview },
    { label: 'Columns & Types Detected', ready: columns },
    { label: 'Data Quality Checked', ready: quality },
    { label: 'Transactions Generated', ready: tx },
  ]

  const totalReady = steps.filter(s => s.ready).length
  const allReady = totalReady === steps.length

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-lg">
      {/* Decorative gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950" />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8 z-10">
        {/* Left column info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dataset Ready for Pattern Mining</h3>
              <p className="text-xs text-slate-400 mt-0.5">DiffNodeset engine status check</p>
            </div>
          </div>

          <p className="text-xs text-slate-350 leading-relaxed max-w-xl">
            Our diagnostic system has analyzed the structure, parsed columns, checked quality parameters, and structured the transactions to prepare them for mining.
          </p>

          <div className="pt-2">
            <span className="text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full font-semibold">
              🔒 DiffNodeset Mining Engine — Available in Phase 4
            </span>
          </div>
        </div>

        {/* Diagnostic Checklist */}
        <div className="w-full lg:w-72 shrink-0 bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-3.5">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-800 pb-2">
            Engine Diagnostics ({totalReady}/{steps.length})
          </p>

          <div className="space-y-2.5">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs">
                {step.ready ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-650 shrink-0" />
                )}
                <span className={step.ready ? 'text-slate-205 font-medium' : 'text-slate-500 font-medium'}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-850">
            <button
              disabled
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                allReady
                  ? 'bg-blue-600/40 border-blue-500/40 text-blue-300 cursor-not-allowed opacity-80'
                  : 'bg-slate-800/40 border-slate-700/40 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Run Pattern Mining
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
