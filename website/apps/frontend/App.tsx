import './App.css'
import { AuthProvider } from "./AuthContext";
import { HomePage } from './src/pages/homepage/HomePage'
import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { NavBar } from './src/components/NavBar'
import { About } from './src/pages/About';
import { NoteDashboard } from './src/pages/NoteDashboard'
import { AIStudyMaterial } from './src/pages/StudyMaterial'
import { ProtectedRoute } from './ProtectedRoute'
import { UserDashboard } from './src/pages/UserDashboard'

function App() {

  return (
    <AuthProvider>
      <div className="min-h-screen w-screen bg-[var(--page-bg)] text-white">
        <NavBar />
        <Routes>
          {/* Public routes are accessible to all users, regardless of their authentication status */}
          <Route path="/" element={<HomePage />} />

          <Route path="/about" element={<About />} />

          {/* Protected routes are used to ensure that only authenticated users can access the pages */}
          <Route path="/notes"
            element={
              <ProtectedRoute>
                <NoteDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/studymaterial"
             element={
              <ProtectedRoute>
                <AIStudyMaterial />
              </ProtectedRoute>
            }
          />
          
          <Route path="/userdashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App