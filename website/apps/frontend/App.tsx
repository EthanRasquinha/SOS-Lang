import './App.css'
import { AuthProvider } from "./AuthContext";
import { HomePage } from './src/pages/homepage/HomePage'
import * as React from "react";
import { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import { NavBar } from './src/components/NavBar'
import { About } from './src/pages/About';
import { NoteDashboard } from './src/pages/NoteDashboard'
import { AIStudyMaterial } from './src/pages/StudyMaterial'

function App() {
  const [role, setRole] = useState<"guest" | "user">("guest");
  
  return (
    <AuthProvider>
      <div className="min-h-screen w-screen">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/newnote" element={<NoteDashboard />} />
          <Route path="/studymaterial" element={<AIStudyMaterial />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App