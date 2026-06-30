import { useState, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, LayoutDashboard, Database, Pill,
  FileText, Settings, Upload, Bell, Search, ChevronRight,
  LogOut, User, Menu, X, Sparkles, HelpCircle, Wifi, WifiOff
} from 'lucide-react'
import { api } from '../utils/api'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app/dashboard' },
  { icon: Database, label: 'Dataset Manager', to: '/app/dataset-manager', badge: 'New' },
  { icon: Activity, label: 'Disease Analytics', to: '/app/disease-analytics' },
  { icon: Pill, label: 'Medicine Analytics', to: '/app/medicine-analytics' },
  { icon: Search, label: 'Pattern Explorer', to: '/app/pattern-explorer' },
  { icon: FileText, label: 'Reports', to: '/app/reports' },
  { icon: Settings, label: 'Settings', to: '/app/settings' },
]

function getActiveUser() {
  try {
    return JSON.parse(localStorage.getItem('hm_user') || '{"username":"Guest","role":"viewer"}')
  } catch (_) {
    return { username: "Guest", role: "viewer" }
  }
}

function Sidebar({ collapsed, setCollapsed }) {
  const user = getActiveUser()
  
  // Filter navItems based on roles
  const visibleItems = navItems.filter(item => {
    if (item.to === '/app/dataset-manager' || item.to === '/app/reports') {
      return ['admin', 'analyst'].includes(user.role)
    }
    return true
  })

  const getRoleBadgeClass = (role) => {
    if (role === 'admin') return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    if (role === 'analyst') return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    return 'bg-slate-700/50 text-slate-400 border border-slate-700/50'
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden lg:flex flex-col bg-slate-900 shrink-0 overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold text-white leading-none whitespace-nowrap">HealthMart</p>
              <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest whitespace-nowrap">Analytics</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">
            Main Menu
          </p>
        )}
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
                {!collapsed && isActive && <ChevronRight className="w-3 h-3 ml-auto shrink-0" />}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile details at bottom */}
      <div className="shrink-0 border-t border-slate-800 p-3 space-y-1">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-slate-200 truncate">{user.username}</p>
              <span className={`text-[8px] font-extrabold uppercase px-1 py-0.5 rounded mt-0.5 inline-block ${getRoleBadgeClass(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => api.logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-rose-900/30 hover:text-rose-400 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  )
}

function TopBar({ mobileMenuOpen, setMobileMenuOpen }) {
  const [backendStatus, setBackendStatus] = useState('checking') // 'checking' | 'online' | 'offline'
  const user = getActiveUser()

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        await api.checkHealth()
        if (!cancelled) setBackendStatus('online')
      } catch {
        if (!cancelled) setBackendStatus('offline')
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-4 shrink-0交代 sticky top-0 z-30">
      {/* Mobile menu toggle */}
      <button
        className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Global Search placeholder */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search symptoms, diagnoses, parameters..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Backend status indicator */}
        <div
          title={backendStatus === 'online' ? 'Backend API online' : backendStatus === 'offline' ? 'Backend API offline' : 'Checking backend...'}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all"
          style={{
            background: backendStatus === 'online' ? 'rgb(240 253 244)' : backendStatus === 'offline' ? 'rgb(255 241 242)' : 'rgb(248 250 252)',
            borderColor: backendStatus === 'online' ? 'rgb(187 247 208)' : backendStatus === 'offline' ? 'rgb(254 205 211)' : 'rgb(226 232 240)',
            color: backendStatus === 'online' ? 'rgb(21 128 61)' : backendStatus === 'offline' ? 'rgb(190 18 60)' : 'rgb(100 116 139)',
          }}
        >
          {backendStatus === 'online' ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />API Online</>
          ) : backendStatus === 'offline' ? (
            <><WifiOff className="w-3.5 h-3.5" />API Offline</>
          ) : (
            <><span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />Connecting...</>
          )}
        </div>

        {/* Upload button (hidden for Viewer role) */}
        {['admin', 'analyst'].includes(user.role) && (
          <NavLink
            to="/app/dataset-manager"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Dataset
          </NavLink>
        )}

        {/* User avatar displaying role */}
        <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left select-none">
            <p className="text-xs font-semibold text-slate-800">{user.username}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileSidebar({ open, onClose }) {
  const user = getActiveUser()
  
  const visibleItems = navItems.filter(item => {
    if (item.to === '/app/dataset-manager' || item.to === '/app/reports') {
      return ['admin', 'analyst'].includes(user.role)
    }
    return true
  })

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 z-50 flex flex-col lg:hidden"
          >
            <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">HealthMart</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Analytics</p>
              </div>
              <button onClick={onClose} className="ml-auto p-1 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{user.username}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => api.logout()}
                className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
