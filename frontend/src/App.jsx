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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* App (sidebar layout) */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<AppDashboard />} />
          <Route path="dataset-manager" element={<DatasetManager />} />
          <Route path="disease-analytics" element={<DiseaseAnalytics />} />
          <Route path="medicine-analytics" element={<MedicineAnalytics />} />
          <Route path="pattern-explorer" element={<PatternExplorer />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
