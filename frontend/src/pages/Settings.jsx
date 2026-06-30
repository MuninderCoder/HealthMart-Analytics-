import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, ChevronRight, User, Bell, Shield, Database,
  Sliders, AlertTriangle, Users, UserPlus, Trash2, CheckCircle2, ShieldCheck
} from 'lucide-react'
import { api } from '../utils/api'

export default function Settings() {
  const [minSupport, setMinSupport] = useState(20)
  const [minConfidence, setMinConfidence] = useState(70)
  const [maxRuleLength, setMaxRuleLength] = useState(5)
  const [maxItemsetLength, setMaxItemsetLength] = useState(5)
  const [saveStatus, setSaveStatus] = useState('')

  // Theme, notification, and preferences states
  const [theme, setTheme] = useState('light')
  const [toastsEnabled, setToastsEnabled] = useState(true)
  const [chartTransitions, setChartTransitions] = useState(true)

  // Auth user details
  const [currentUser, setCurrentUser] = useState({ username: '', role: 'viewer' })
  const [usersList, setUsersList] = useState([])
  
  // Register new user state (Admin panel)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('viewer')
  const [userError, setUserError] = useState('')
  const [userSuccess, setUserSuccess] = useState('')

  // 1. Load preferences and users list on mount
  useEffect(() => {
    const savedSupport = localStorage.getItem('hm_min_support')
    const savedConfidence = localStorage.getItem('hm_min_confidence')
    const savedMaxRule = localStorage.getItem('hm_max_rule_len')
    const savedMaxItemset = localStorage.getItem('hm_max_itemset_len')
    const savedTheme = localStorage.getItem('hm_theme') || 'light'
    const savedToasts = localStorage.getItem('hm_toasts') !== 'false'
    const savedTransitions = localStorage.getItem('hm_transitions') !== 'false'

    if (savedSupport) setMinSupport(parseFloat(savedSupport) * 100)
    if (savedConfidence) setMinConfidence(parseFloat(savedConfidence) * 100)
    if (savedMaxRule) setMaxRuleLength(parseInt(savedMaxRule))
    if (savedMaxItemset) setMaxItemsetLength(parseInt(savedMaxItemset))
    setTheme(savedTheme)
    setToastsEnabled(savedToasts)
    setChartTransitions(savedTransitions)

    try {
      const userStr = localStorage.getItem('hm_user')
      if (userStr) {
        const u = JSON.parse(userStr)
        setCurrentUser(u)
        if (u.role === 'admin') {
          fetchUsers()
        }
      }
    } catch (_) {}
  }, [])

  const fetchUsers = async () => {
    try {
      const list = await api.getUsers()
      setUsersList(list)
    } catch (_) {}
  }

  // 2. Save settings
  const handleSaveSettings = () => {
    localStorage.setItem('hm_min_support', (minSupport / 100).toString())
    localStorage.setItem('hm_min_confidence', (minConfidence / 100).toString())
    localStorage.setItem('hm_max_rule_len', maxRuleLength.toString())
    localStorage.setItem('hm_max_itemset_len', maxItemsetLength.toString())
    localStorage.setItem('hm_theme', theme)
    localStorage.setItem('hm_toasts', toastsEnabled.toString())
    localStorage.setItem('hm_transitions', chartTransitions.toString())

    setSaveStatus('success')
    setTimeout(() => setSaveStatus(''), 3000)
  }

  // 3. Clear data cache
  const handleClearSession = () => {
    localStorage.removeItem('hm_active_dataset_id')
    localStorage.removeItem('hm_active_dataset_filename')
    localStorage.removeItem('hm_mining_results')
    setSaveStatus('cleared')
    setTimeout(() => setSaveStatus(''), 3000)
  }

  // 4. Admin register user
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setUserError('')
    setUserSuccess('')
    if (!newUsername.trim() || !newPassword.trim()) {
      setUserError('Username and password are required.')
      return
    }
    try {
      await api.signup(newUsername, newPassword, newRole)
      setUserSuccess(`User "${newUsername}" successfully registered.`)
      setNewUsername('')
      setNewPassword('')
      setNewRole('viewer')
      fetchUsers()
      setTimeout(() => setUserSuccess(''), 3500)
    } catch (err) {
      setUserError(err.response?.data?.detail || 'Username already exists.')
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>App</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage analysis configurations, client preferences, and system access.</p>
      </div>

      {/* Save alerts */}
      {saveStatus === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          ✓ Platform configurations and settings saved successfully.
        </div>
      )}
      {saveStatus === 'cleared' && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl">
          ✓ Active dataset caches and mining results cleared successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left side: parameters & configs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mining thresholds */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <Sliders className="w-4.5 h-4.5 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">Mining Thresholds</p>
                <p className="text-[11px] text-slate-400">Configure default support and confidence limits</p>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Minimum Support Percentage</span>
                  <span className="font-mono text-blue-600 font-bold">{minSupport}%</span>
                </div>
                <input
                  type="range" min="5" max="100" step="5" value={minSupport}
                  onChange={(e) => setMinSupport(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Minimum Confidence Percentage</span>
                  <span className="font-mono text-emerald-600 font-bold">{minConfidence}%</span>
                </div>
                <input
                  type="range" min="10" max="100" step="5" value={minConfidence}
                  onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Max Pattern Size</label>
                  <input
                    type="number" min="1" max="10" value={maxItemsetLength}
                    onChange={(e) => setMaxItemsetLength(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Max Rule Length</label>
                  <input
                    type="number" min="2" max="10" value={maxRuleLength}
                    onChange={(e) => setMaxRuleLength(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <Bell className="w-4.5 h-4.5 text-indigo-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">Preferences & Theme</p>
                <p className="text-[11px] text-slate-400">Configure visual themes and notification settings</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block">UI Theme</span>
                  <span className="text-[10px] text-slate-400">Select application visual styling theme</span>
                </div>
                <select
                  value={theme} onChange={(e) => setTheme(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 text-xs bg-white focus:border-blue-500 outline-none"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="slate">Slate Modern</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-slate-700 block">Enable Toast Notifications</span>
                  <span className="text-[10px] text-slate-400">Show alert popup messages on upload or mining runs</span>
                </div>
                <input
                  type="checkbox" checked={toastsEnabled} onChange={(e) => setToastsEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-slate-700 block">Enable Chart Transitions</span>
                  <span className="text-[10px] text-slate-400">Animate bar and pie charts rendering</span>
                </div>
                <input
                  type="checkbox" checked={chartTransitions} onChange={(e) => setChartTransitions(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/20 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 hover:shadow-md transition-all active:scale-95"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Right side: User Profiles & Admin panel */}
        <div className="space-y-6">
          {/* User profile details */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <User className="w-4.5 h-4.5 text-slate-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">User Identification</p>
                <p className="text-[11px] text-slate-400">Institutional account roles</p>
              </div>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Username:</span>
                <span className="font-bold text-slate-800">{currentUser.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Role:</span>
                <span className="font-extrabold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{currentUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">HIPAA Compliance:</span>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5"><ShieldCheck className="w-3.5 h-3.5" /> SECURE</span>
              </div>
            </div>
          </div>

          {/* Admin panel: Users Management */}
          {currentUser.role === 'admin' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                <Users className="w-4.5 h-4.5 text-purple-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Platform Users</p>
                  <p className="text-[10px] text-slate-400">Register new clinical credentials</p>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {userError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-[10px] font-semibold rounded-lg">
                    {userError}
                  </div>
                )}
                {userSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-lg">
                    {userSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-3 border-b border-slate-100 pb-4">
                  <input
                    type="text" placeholder="Username" value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-500"
                  />
                  <input
                    type="password" placeholder="Password" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newRole} onChange={(e) => setNewRole(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="analyst">Analyst</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {usersList.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-xs text-slate-700 font-semibold">{user.username}</span>
                      <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-rose-100 bg-rose-50/30">
              <p className="text-xs font-bold text-rose-700">Danger Zone</p>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-800">Clear Caches</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">De-assign active datasets and purge all mined structures from browser memory.</p>
              </div>
              <button
                onClick={handleClearSession}
                className="w-full py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all active:scale-95"
              >
                Clear Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
