import { motion } from 'framer-motion'
import CircularHealthScore from './CircularHealthScore'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

export default function DatasetHealth({ health }) {
  if (!health) return null

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Circle panel */}
      <div className="flex flex-col items-center shrink-0">
        <CircularHealthScore
          score={health.score}
          grade={health.grade}
          color={health.color}
        />
        <p className="text-xs text-slate-500 font-medium text-center mt-2 max-w-[200px]">
          {health.desc}
        </p>
      </div>

      {/* Impact Breakdown list */}
      <div className="flex-1 w-full space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Health Breakdown & Impact
        </h3>
        
        {health.details.length === 0 ? (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-800 font-medium">
              Perfect score! No quality issues were found that impacted dataset health.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {health.details.map((detail, idx) => {
              const isHigh = detail.severity === 'high'
              const isMed = detail.severity === 'medium'
              return (
                <motion.div
                  key={detail.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                    isHigh
                      ? 'bg-rose-50/50 border-rose-100 hover:border-rose-200'
                      : isMed
                      ? 'bg-amber-50/50 border-amber-100 hover:border-amber-200'
                      : 'bg-blue-50/50 border-blue-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{detail.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{detail.value}</p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                    isHigh
                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                      : isMed
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {detail.impact}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
