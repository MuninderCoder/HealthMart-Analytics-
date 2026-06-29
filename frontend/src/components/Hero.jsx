import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Play, TrendingUp, Shield, Zap } from 'lucide-react'

const badges = [
  { icon: TrendingUp, label: 'Real-time Analytics', color: 'blue' },
  { icon: Shield, label: 'HIPAA Compliant', color: 'emerald' },
  { icon: Zap, label: 'AI-Powered Insights', color: 'violet' },
]

const HeroIllustration = () => (
  <div className="relative w-full max-w-lg mx-auto">
    {/* Glow background */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100 via-emerald-50 to-violet-100 blur-3xl opacity-60" />

    {/* Main card */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl bg-white border border-slate-200 card-shadow-xl p-5 overflow-hidden"
    >
      {/* Card top bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pattern Analysis</p>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">Disease Trends · Q2 2025</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Mini bar chart */}
      <div className="space-y-2.5">
        {[
          { name: 'Hypertension', value: 84, color: 'bg-blue-500' },
          { name: 'Type 2 Diabetes', value: 67, color: 'bg-emerald-500' },
          { name: 'Asthma', value: 52, color: 'bg-violet-500' },
          { name: 'Cardiovascular', value: 43, color: 'bg-amber-500' },
          { name: 'COPD', value: 31, color: 'bg-rose-500' },
        ].map((item, i) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-24 flex-shrink-0">{item.name}</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${item.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 w-8 text-right">{item.value}%</span>
          </div>
        ))}
      </div>

      {/* Bottom stat row */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        {[
          { label: 'Patterns Found', value: '1,284' },
          { label: 'Confidence', value: '94.2%' },
          { label: 'Data Points', value: '48K' },
        ].map(s => (
          <div key={s.label} className="flex-1 text-center">
            <p className="text-sm font-bold text-slate-900">{s.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>

    {/* Floating badge: Medicine Association */}
    <motion.div
      className="absolute -top-4 -right-4 bg-white rounded-xl border border-slate-200 card-shadow-md px-3 py-2 flex items-center gap-2"
      initial={{ opacity: 0, scale: 0.8, x: 10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay: 1.1, duration: 0.5 }}
      style={{ animation: 'float 5s ease-in-out infinite' }}
    >
      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
        <span className="text-sm">💊</span>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-700">New Association</p>
        <p className="text-[9px] text-slate-400">Metformin → Atorvastatin</p>
      </div>
    </motion.div>

    {/* Floating badge: AI Insight */}
    <motion.div
      className="absolute -bottom-4 -left-4 bg-white rounded-xl border border-slate-200 card-shadow-md px-3 py-2 flex items-center gap-2"
      initial={{ opacity: 0, scale: 0.8, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay: 1.3, duration: 0.5 }}
      style={{ animation: 'float 6s ease-in-out infinite 1s' }}
    >
      <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
        <span className="text-sm">✨</span>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-700">AI Insight Ready</p>
        <p className="text-[9px] text-slate-400">3 new patterns detected</p>
      </div>
    </motion.div>
  </div>
)

export default function Hero() {
  const navigate = useNavigate()
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 dot-pattern opacity-40" />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-100/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div>
            {/* Announcement badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Introducing DiffNodeset-powered analytics
              <ArrowRight className="w-3 h-3" />
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-slate-900 mb-6"
            >
              Healthcare
              <br />
              <span className="text-gradient">Intelligence</span>
              <br />
              Powered by
              <br />
              <span className="text-slate-700">Data Mining</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg"
            >
              Discover disease trends, medicine associations, and healthcare insights using advanced frequent pattern mining — built for hospitals, pharmacy chains, and researchers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4 mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/app/dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-300 cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
                </div>
                View Demo
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center gap-3"
            >
              {badges.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.65 + i * 0.08 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm text-xs font-medium text-slate-600"
                >
                  <badge.icon className="w-3.5 h-3.5 text-blue-500" />
                  {badge.label}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right column */}
          <div className="flex justify-center">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}
