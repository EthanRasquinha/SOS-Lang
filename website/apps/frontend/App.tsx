import "./App.css";
import { AuthProvider } from "./AuthContext";
import * as React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { NavBar } from "./src/components/NavBar";
import { HomePage } from "./src/pages/homepage/HomePage";
import { About } from "./src/pages/About";
import { NoteDashboard } from "./src/pages/NoteDashboard";
import { AIStudyMaterial } from "./src/pages/StudyMaterial";
import { UserDashboard } from "./src/pages/UserDashboard";
import { ProtectedRoute } from "./ProtectedRoute";
import { supabase } from "./src/lib/supabaseClient";



/* 🔁 Smart redirect home */
const HomeRoute = () => {
  const [loading, setLoading] = React.useState(true);
  const [loggedIn, setLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      setLoggedIn(!!data.session);
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return null;

  return loggedIn ? <Navigate to="/userdashboard" replace /> : <HomePage />;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-screen bg-[var(--page-bg)] text-white">
        <NavBar />

        <Routes>
          {/* ✅ HOME NOW SMART */}
          <Route path="/" element={<HomeRoute />} />

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
            <Route index element={<AIStudyMaterial />} />
            <Route path=":setId" element={<AIStudyMaterial />} />
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
      </div>
    </AuthProvider>
  );
}

export default App;