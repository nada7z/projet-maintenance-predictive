import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import EquipmentList from './components/EquipmentList'
import EquipmentForm from './components/EquipmentForm'

// Composant pour protéger les routes
const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  // Si l'utilisateur n'est pas connecté, on redirige vers /login
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Page de connexion publique */}
        <Route path="/login" element={<Login />} />

        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <PrivateRoute>
              <Layout>
                <EquipmentList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/equipment/new"
          element={
            <PrivateRoute>
              <Layout>
                <EquipmentForm />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App