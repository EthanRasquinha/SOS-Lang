import './App.css'
import { HomePage } from './src/pages/homepage/HomePage'
import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavBar } from './src/components/NavBar'
import { About } from './src/components/About';
import { Contact } from './src/components/Contact';

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      </>
  );
}

export default App
