import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CircularHealthScore({ score = 100, grade = 'Excellent', color = 'emerald' }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1000
    const end = score
    if (start === end) {
      setAnimatedScore(end)
      return
    }
    const totalFrames = Math.round(duration / 16)
    let frame = 0
    const timer = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const current = Math.round(start + (end - start) * (1 - Math.pow(1 - progress, 3))) // easeOutCubic
      setAnimatedScore(current)
      if (frame >= totalFrames) {
        setAnimatedScore(end)
        clearInterval(timer)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [score])

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const getColorClasses = (c) => {
    switch (c) {
      case 'rose':
        return {
          stroke: 'stroke-rose-500',
          text: 'text-rose-600',
          bg: 'bg-rose-50',
          border: 'border-rose-100',
        }
      case 'amber':
        return {
          stroke: 'stroke-amber-500',
          text: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-100',
        }
      case 'blue':
        return {
          stroke: 'stroke-blue-500',
          text: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-100',
        }
      case 'emerald':
      default:
        return {
          stroke: 'stroke-emerald-500',
          text: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
        }
    }
  }

  const styles = getColorClasses(color)

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center w-36 h-36">
        {/* Background Track */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-100 fill-transparent"
            strokeWidth="10"
          />
          {/* Progress Ring */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            className={`fill-transparent stroke-linecap-round transition-all duration-300 ${styles.stroke}`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        {/* Score text inside */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-850 tabular-nums">
            {animatedScore}%
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 border uppercase tracking-wide ${styles.bg} ${styles.text} ${styles.border}`}>
            {grade}
          </span>
        </div>
      </div>
    </div>
  )
}
