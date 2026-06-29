import { motion } from 'framer-motion'
import { Settings as SettingsIcon, ChevronRight, User, Bell, Shield, Database, Palette, Globe } from 'lucide-react'

const settingsSections = [
  {
    icon: User, title: 'Profile', subtitle: 'Manage your account details',
    fields: [
      { label: 'Full Name', value: 'Healthcare Admin', type: 'text' },
      { label: 'Email', value: 'admin@healthmart.ai', type: 'email' },
      { label: 'Organization', value: 'HealthMart Analytics Inc.', type: 'text' },
      { label: 'Role', value: 'Healthcare Analyst', type: 'text' },
    ]
  },
  {
    icon: Bell, title: 'Notifications', subtitle: 'Configure alert preferences',
    toggles: [
      { label: 'Email notifications for completed analyses', enabled: true },
      { label: 'Dataset upload confirmations', enabled: true },
      { label: 'Weekly pattern mining reports', enabled: false },
      { label: 'System maintenance alerts', enabled: true },
    ]
  },
  {
    icon: Shield, title: 'Privacy & Security', subtitle: 'Data handling and compliance',
    toggles: [
      { label: 'HIPAA compliance mode', enabled: true },
      { label: 'Anonymize patient identifiers', enabled: true },
      { label: 'Two-factor authentication', enabled: false },
    ]
  },
]

function Toggle({ enabled }) {
  return (
    <div className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-blue-500' : 'bg-slate-200'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
    </div>
  )
}

export default function Settings() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>App</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account, preferences, and platform configuration.</p>
      </motion.div>

      {settingsSections.map((section, si) => {
        const Icon = section.icon
        return (
          <motion.div key={section.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Icon className="w-4 h-4 text-slate-600" /></div>
              <div>
                <p className="text-sm font-bold text-slate-800">{section.title}</p>
                <p className="text-[11px] text-slate-400">{section.subtitle}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {section.fields?.map((f) => (
                <div key={f.label} className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-xs font-medium text-slate-600 col-span-1">{f.label}</label>
                  <input type={f.type} defaultValue={f.value}
                    className="col-span-2 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              ))}
              {section.toggles?.map((t) => (
                <div key={t.label} className="flex items-center justify-between py-1">
                  <p className="text-xs text-slate-700">{t.label}</p>
                  <Toggle enabled={t.enabled} />
                </div>
              ))}
            </div>
            {section.fields && (
              <div className="px-6 py-3.5 border-t border-slate-100 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
            )}
          </motion.div>
        )
      })}

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-rose-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-rose-100">
          <p className="text-sm font-bold text-rose-700">Danger Zone</p>
          <p className="text-[11px] text-slate-400">Irreversible actions — proceed with caution</p>
        </div>
        <div className="p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-800">Clear All Session Data</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Remove all uploaded datasets and analysis results from this session.</p>
          </div>
          <button className="px-4 py-2 border border-rose-300 text-rose-600 text-xs font-semibold rounded-xl hover:bg-rose-50 transition-colors shrink-0">
            Clear Data
          </button>
        </div>
      </motion.div>
    </div>
  )
}
