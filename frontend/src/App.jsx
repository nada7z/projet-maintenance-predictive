import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import TechnicianDashboard from './components/TechnicianDashboard'
import EquipmentList from './components/EquipmentList'
import EquipmentForm from './components/EquipmentForm'
import EquipmentDetail from './components/EquipmentDetail'
import InterventionsList from './components/InterventionsList'
import InterventionForm from './components/InterventionForm'
import InterventionDetail from './components/InterventionDetail'
import AlertsList from './components/AlertsList'
import ReportsList from './components/ReportsList'
import ReportForm from './components/ReportForm'
import RoleGuard from './components/RoleGuard'

const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// 🧠 Router component that decides which dashboard to show
const DashboardRouter = () => {
  const { user } = useAuth()
  return user?.role === 'tech' ? <TechnicianDashboard /> : <Dashboard />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Dashboard – adapts to role */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardRouter />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Equipment – admin and supervisor only */}
        <Route
          path="/equipment"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['admin', 'supervisor']}>
                <Layout><EquipmentList /></Layout>
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/equipment/:id"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['admin', 'supervisor']}>
                <Layout><EquipmentDetail /></Layout>
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/equipment/new"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['admin', 'supervisor']}>
                <Layout><EquipmentForm /></Layout>
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/equipment/edit/:id"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['admin', 'supervisor']}>
                <Layout><EquipmentForm /></Layout>
              </RoleGuard>
            </PrivateRoute>
          }
        />

        {/* Interventions – tech can list and edit his own */}
        <Route
          path="/interventions"
          element={
            <PrivateRoute>
              <Layout><InterventionsList /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/interventions/new"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['admin', 'supervisor']}>
                <Layout><InterventionForm /></Layout>
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/interventions/:id/edit"
          element={
            <PrivateRoute>
              <Layout><InterventionForm /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/interventions/:id"
          element={
            <PrivateRoute>
              <Layout><InterventionDetail /></Layout>
            </PrivateRoute>
          }
        />

        {/* Alerts – everyone */}
        <Route
          path="/alerts"
          element={
            <PrivateRoute>
              <Layout><AlertsList /></Layout>
            </PrivateRoute>
          }
        />

        {/* Reports – admin and supervisor only */}
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['admin', 'supervisor']}>
                <Layout><ReportsList /></Layout>
              </RoleGuard>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/new"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={['admin', 'supervisor']}>
                <Layout><ReportForm /></Layout>
              </RoleGuard>
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App