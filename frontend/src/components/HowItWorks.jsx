import { motion } from 'framer-motion'
import { Upload, ScanSearch, Network, LayoutDashboard, FileDown } from 'lucide-react'
import { steps } from '../data/dummyData'

const iconMap = { Upload, ScanSearch, Network, LayoutDashboard, FileDown }

export default function HowItWorks() {
  return (
    <section id="about" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold mb-4">
            <Network className="w-3.5 h-3.5" />
            Simple Process
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            From raw data to{' '}
            <span className="text-gradient">actionable insights</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Our streamlined five-step pipeline transforms your healthcare datasets into structured, explainable insights in minutes.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-blue-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((step, i) => {
              const Icon = iconMap[step.icon]
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Step circle */}
                  <div className="relative mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-200/50 cursor-pointer relative z-10"
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">{step.id}</span>
                    </div>
                  </div>

                  {/* Arrow for mobile */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden mb-4 text-slate-300 text-xl">↓</div>
                  )}

                  <h3 className="text-sm font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[150px]">{step.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20 relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600" />
          <div className="absolute inset-0 opacity-10">
            <div className="dot-pattern h-full" />
          </div>
          <div className="relative p-10 sm:p-14 text-center text-white">
            <h3 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Ready to uncover hidden patterns in your data?
            </h3>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Join 2,800+ healthcare institutions already leveraging HealthMart Analytics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.querySelector('#dashboard')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 bg-white text-blue-700 font-bold text-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Explore Dashboard →
              </motion.button>
              <button className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold text-sm rounded-xl hover:bg-white/20 transition-all duration-300">
                Schedule a Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
