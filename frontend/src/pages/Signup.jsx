import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, ShieldAlert, Key, User, ArrowRight, Lock, UserPlus } from 'lucide-react'
import { api } from '../utils/api'
import { NavLink, useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('viewer') // Default to viewer
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.signup(username, password, role)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try a different username.')
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
            <h1 className="text-xl font-black text-white tracking-tight">Create Account</h1>
            <p className="text-xs text-slate-400 mt-1">Register new analyst or viewer profiles</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs font-semibold rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs font-semibold rounded-xl text-center">
            Registration successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-colors"
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="Choose secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-colors"
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Platform Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
              disabled={loading || success}
            >
              <option value="viewer">Viewer (Dashboard & Analytics Read-only)</option>
              <option value="analyst">Healthcare Analyst (Dataset uploads, runs mining, CSV exports)</option>
              <option value="admin">Administrator (Full Access & User control)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-blue-600/25"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Profile...' : 'Register User'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            Already have an account?{' '}
            <NavLink to="/login" className="text-blue-400 hover:text-blue-300 font-bold">
              Sign In
            </NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
