import { useAuth } from "../../AuthContext";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { RegistrationForm } from "./RegistrationForm";
import { supabase } from "@/lib/supabaseClient";
import { LoginForm } from "./LoginForm";
import { InformedConsent } from "./InformedConsent";
import logo from "../../assets/sos-logo.png";

export const NavBar = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTabPos, setActiveTabPos] = useState({ left: 0, width: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRefs = useRef<(HTMLLIElement | null)[]>([]);

  const openLogin = () => { setLoginOpen(true); setMobileOpen(false); };
  const openSignup = () => { setConsentOpen(true); setMobileOpen(false); };
  const closeLogin = () => setLoginOpen(false);
  const closeSignup = () => setSignupOpen(false);
  const closeConsent = () => setConsentOpen(false);

  const handleConsentAccepted = () => {
    setConsentOpen(false);
    setSignupOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setMobileOpen(false);
  };

  const navItems = useMemo(() => [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    ...(user
      ? [
          { name: "New Note", path: "/notes" },
          { name: "Study Material", path: "/studymaterial" },
          { name: "Dashboard", path: "/userdashboard" },
        ]
      : []),
  ], [user]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const updateActiveTabPos = () => {
      const activeIndex = navItems.findIndex((item) => item.path === location.pathname);
      const currentTab = navRefs.current[activeIndex];
      if (currentTab) {
        const rect = currentTab.getBoundingClientRect();
        const parentRect = currentTab.parentElement!.getBoundingClientRect();
        setActiveTabPos({ left: rect.left - parentRect.left, width: rect.width });
      }
    };
    updateActiveTabPos();
    window.addEventListener("resize", updateActiveTabPos);
    return () => window.removeEventListener("resize", updateActiveTabPos);
  }, [location.pathname, navItems]);

  return (
    <>
      <style>{NAV_STYLES}</style>

      <nav className="bg-[#07121d]/95 border-b border-white/[0.07] sticky top-0 z-50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">

          {/* ── LOGO ── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            
              <img src={logo} alt="SOS" className="w-10 h-10 object-contain" />
            
            <span
              className="text-white font-bold text-xl tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em" }}
            >
              SOS<span style={{ color: "#dc6505" }}>-LANG</span>
            </span>
          </Link>

          {/* ── DESKTOP NAV PILL ── */}
          <div className="hidden md:flex relative py-1 rounded-full border border-white/[0.08]"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            {/* Sliding highlight */}
            <div
              className="absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ease-out"
              style={{
                left: activeTabPos.left + activeTabPos.width * 0.05,
                width: activeTabPos.width * 0.9,
                height: "calc(100% - 8px)",
                background: "linear-gradient(135deg, #dc6505, #b85204)",
                boxShadow: "0 0 20px rgba(220,101,5,0.3)",
              }}
            />

            <ul className="flex relative z-10">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={index} ref={(el) => (navRefs.current[index] = el)}>
                    <Link
                      to={item.path}
                      className="block px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: isActive ? "#fff" : "rgba(148,163,184,0.8)",
                      }}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── DESKTOP AUTH BUTTONS ── */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <button
                onClick={handleSignOut}
                className="nav-btn-primary"
              >
                Sign Out
              </button>
            ) : (
              <>
                <button onClick={openLogin} className="nav-btn-ghost">
                  Log In
                </button>
                <button onClick={openSignup} className="nav-btn-primary">
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* ── MOBILE HAMBURGER ── */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl border border-white/10 gap-1.5 transition-all hover:bg-white/5"
            aria-label="Toggle menu"
          >
            <span className={`block w-4.5 h-0.5 bg-white rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} style={{ width: "18px", height: "2px" }} />
            <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} style={{ width: "14px", height: "2px" }} />
            <span className={`block h-0.5 bg-white rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} style={{ width: "18px", height: "2px" }} />
          </button>
        </div>

        {/* ── MOBILE DROPDOWN ── */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300 ease-out"
          style={{ maxHeight: mobileOpen ? "400px" : "0px", opacity: mobileOpen ? 1 : 0 }}
        >
          <div className="px-5 pb-5 pt-2 flex flex-col gap-1 border-t border-white/[0.06]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    background: isActive ? "rgba(220,101,5,0.12)" : "transparent",
                    color: isActive ? "#dc6505" : "rgba(148,163,184,0.9)",
                    borderLeft: isActive ? "2px solid #dc6505" : "2px solid transparent",
                  }}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Mobile auth */}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/[0.06]">
              {user ? (
                <button onClick={handleSignOut} className="nav-btn-primary w-full">
                  Sign Out
                </button>
              ) : (
                <>
                  <button onClick={openLogin} className="nav-btn-ghost w-full">
                    Log In
                  </button>
                  <button onClick={openSignup} className="nav-btn-primary w-full">
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── MODALS ── */}
      <InformedConsent
        open={consentOpen}
        onClose={closeConsent}
        onConsent={handleConsentAccepted}
      />
      <RegistrationForm
        open={signupOpen}
        onClose={closeSignup}
        onSuccess={closeSignup}
      />
      <LoginForm
        open={loginOpen}
        onClose={closeLogin}
        onSuccess={closeLogin}
      />
    </>
  );
};

const NAV_STYLES = `
  .nav-btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1.1rem;
    border-radius: 9999px;
    font-size: 0.8125rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: white;
    background: linear-gradient(135deg, #dc6505, #b85204);
    box-shadow: 0 0 20px rgba(220,101,5,0.28);
    transition: transform 0.15s ease, opacity 0.15s ease;
    white-space: nowrap;
    border: none;
    cursor: pointer;
  }
  .nav-btn-primary:hover { opacity: 0.9; transform: scale(1.03); }
  .nav-btn-primary:active { transform: scale(0.97); }

  .nav-btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1.1rem;
    border-radius: 9999px;
    font-size: 0.8125rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: rgba(148,163,184,0.9);
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    transition: all 0.15s ease;
    white-space: nowrap;
    cursor: pointer;
  }
  .nav-btn-ghost:hover { color: white; background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.18); }
  .nav-btn-ghost:active { transform: scale(0.97); }
`;

export default NavBar;