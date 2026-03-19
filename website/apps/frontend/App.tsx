import './App.css'
import { HomePage } from './src/pages/homepage/HomePage'
import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavBar } from './src/components/NavBar'
import { About } from './src/pages/About';
import { Contact } from './src/pages/Contact';
import { Registration } from './src/pages/register/Registration'
import { NoteDashboard } from './src/pages/NoteDashboard'


function App() {
  
  return (
    <div className="min-h-screen w-screen">
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Registration />} />
        <Route path="/newnote" element={<NoteDashboard />} />
      </Routes>
      </div>
  );
}

export default App
