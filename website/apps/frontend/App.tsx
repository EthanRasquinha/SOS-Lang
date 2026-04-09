import './App.css'
import { AuthProvider } from "./AuthContext";
import { HomePage } from './src/pages/homepage/HomePage'
import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { NavBar } from './src/components/NavBar'
import { About } from './src/pages/About';
import { NoteDashboard } from './src/pages/NoteDashboard'
import { AIStudyMaterial } from './src/pages/StudyMaterial'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-screen bg-[var(--page-bg)] text-white">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/notes" element={<NoteDashboard />} />
            <Route path="/studymaterial" element={<AIStudyMaterial />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App