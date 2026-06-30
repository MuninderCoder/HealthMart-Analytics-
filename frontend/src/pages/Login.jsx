import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, ShieldAlert, Key, User, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react'
import { api } from '../utils/api'
import { NavLink } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle Login submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.login(username, password)
      window.location.href = '/app/dashboard'
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Quick Seed Logins
  const handleQuickLogin = async (role) => {
    setLoading(true)
    setError('')
    let user = ''
    let pass = ''
    if (role === 'admin') {
      user = 'admin'
      pass = 'AdminPassword123!'
    } else if (role === 'analyst') {
      user = 'analyst'
      pass = 'AnalystPassword123!'
    } else {
      user = 'viewer'
      pass = 'ViewerPassword123!'
    }

    try {
      await api.login(user, pass)
      window.location.href = '/app/dashboard'
    } catch (_) {
      setError('Failed to seed quick login session.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-emerald-600/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6"
      >
        {/* Logo */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">HealthMart Analytics</h1>
            <p className="text-xs text-slate-400 mt-1">DiffNodeset Data Mining Engine Platform</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs font-semibold rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-slate-900 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Quick Demos
          </span>
        </div>

        {/* Quick Seed Buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => handleQuickLogin('admin')}
            className="px-2 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 rounded-xl transition-all"
            disabled={loading}
            type="button"
          >
            Admin Account
          </button>
          <button
            onClick={() => handleQuickLogin('analyst')}
            className="px-2 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 rounded-xl transition-all"
            disabled={loading}
            type="button"
          >
            Analyst Account
          </button>
          <button
            onClick={() => handleQuickLogin('viewer')}
            className="px-2 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 rounded-xl transition-all"
            disabled={loading}
            type="button"
          >
            Viewer Account
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            Don't have an account?{' '}
            <NavLink to="/signup" className="text-blue-400 hover:text-blue-300 font-bold">
              Sign Up
            </NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
