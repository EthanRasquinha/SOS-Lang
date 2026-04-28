import './App.css'
import { AuthProvider, useAuth } from "./AuthContext";
import { HomePage } from './src/pages/homepage/HomePage'
import { RegisteredHomePage } from './src/pages/homepage/RegisteredHomePage'
import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { NavBar } from './src/components/NavBar'
import { About } from './src/pages/About';
import { NoteDashboard } from './src/pages/NoteDashboard'
import { AIStudyMaterial } from './src/pages/StudyMaterial'
import { ProtectedRoute } from './ProtectedRoute'
import { UserDashboard } from './src/pages/UserDashboard'

// Separated so it can access AuthContext (must be inside AuthProvider)
const AppRoutes = () => {
  const { user, loading } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
          loading ? null : user ? <RegisteredHomePage /> : <HomePage />
        }
      />

      <Route path="/about" element={<About />} />

      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <NoteDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/studymaterial">
        <Route
          index
          element={
            <ProtectedRoute>
              <AIStudyMaterial />
            </ProtectedRoute>
          }
        />
        <Route
          path=":setId"
          element={
            <ProtectedRoute>
              <AIStudyMaterial />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/userdashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-screen bg-[var(--page-bg)] text-white">
        <NavBar />
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}

export default App