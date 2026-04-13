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

function App() {
  //const [role, setRole] = useState<"guest" | "user">("guest");
  
  return (
    <AuthProvider>
      <div className="min-h-screen w-screen bg-[var(--page-bg)] text-white">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/notes" element={<NoteDashboard />} />
          <Route path="/studymaterial" element={<AIStudyMaterial />} />
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
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App