import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import LandingPage from './pages/LandingPage'
import AppLayout from './layouts/AppLayout'
import AppDashboard from './pages/AppDashboard'
import DatasetManager from './pages/DatasetManager'
import DiseaseAnalytics from './pages/DiseaseAnalytics'
import MedicineAnalytics from './pages/MedicineAnalytics'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import PatternExplorer from './pages/PatternExplorer'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Protected Route Guard Component
function ProtectedRoute({ children, requiredRoles }) {
  const token = localStorage.getItem('hm_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles) {
    try {
      const userStr = localStorage.getItem('hm_user')
      if (!userStr) return <Navigate to="/login" replace />
      const user = JSON.parse(userStr)
      if (!requiredRoles.includes(user.role)) {
        // Redirect to dashboard if role is unauthorized
        return <Navigate to="/app/dashboard" replace />
      }
    } catch (_) {
      return <Navigate to="/login" replace />
    }
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected App Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<AppDashboard />} />
          
          <Route
            path="dataset-manager"
            element={
              <ProtectedRoute requiredRoles={['admin', 'analyst']}>
                <DatasetManager />
              </ProtectedRoute>
            }
          />
          
          <Route path="disease-analytics" element={<DiseaseAnalytics />} />
          <Route path="medicine-analytics" element={<MedicineAnalytics />} />
          <Route path="pattern-explorer" element={<PatternExplorer />} />
          
          <Route
            path="reports"
            element={
              <ProtectedRoute requiredRoles={['admin', 'analyst']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
