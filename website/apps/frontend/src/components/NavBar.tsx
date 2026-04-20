import { useAuth } from "../../AuthContext";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { RegistrationForm } from "./RegistrationForm";
import { supabase } from "@/lib/supabaseClient";
import { LoginForm } from "./LoginForm";
import logo from "../../assets/betterlogo.png";

export const NavBar = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [activeTabPos, setActiveTabPos] = useState({ left: 0, width: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRefs = useRef<(HTMLLIElement | null)[]>([]);

  const openLogin = () => setLoginOpen(true);
  const openSignup = () => setSignupOpen(true);

  const closeLogin = () => setLoginOpen(false);
  const closeSignup = () => setSignupOpen(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = useMemo(() => [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    ...(user
      ? [
          { name: "New Note", path: "/notes" },
          { name: "Study Material", path: "/studymaterial" },
          { name: "User Dashboard", path: "/userdashboard" },
        ]
      : []),
  ], [user]);

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
    <nav className="bg-[#07121d] border-b border-white/10 sticky top-0 z-50 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-1 py-2 flex items-center justify-between relative">
        {/* LOGO */}
        <img
    src={logo}
    alt="SOS-Lang Logo"
    className="h-14 w-15 flex-shrink-0 p-1"
  />
        <Link
  to="/"
  className="flex items-center gap-8 text-white font-bold font-['Poppins'] text-2xl tracking-tight"
>
  
  <p className="mr-2">SOS-LANG</p>
</Link>

        {/* Bubble Slider Navigation */}
        <div className="hidden md:flex relative p-1.5 bg-white/5 rounded-full shadow-inner border border-white/10">
          {/* Large background pill */}
          <div className="absolute inset-0 rounded-full bg-[#0b1b2b] opacity-95"></div>

          {/* Small sliding pill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-11 bg-[#dc6505] rounded-full transition-all duration-300 shadow-[0_20px_40px_rgba(220,101,5,0.35)]"
            style={{
              left: activeTabPos.left + activeTabPos.width * 0.1,
              width: activeTabPos.width * 0.9,
            }}
          ></div>

          <ul className="flex space-x-5 relative z-10 px-3">
            {navItems.map((item, index) => (
              <li key={index} ref={(el) => (navRefs.current[index] = el)} className="relative px-3 text-l">
                <Link
                  to={item.path}
                  className={`px-4 py-2 rounded-full font-medium font-['Poppins'] text-center w-full block transition-all duration-300 ${
                    location.pathname === item.path
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth Buttons */}
        {user ? (
          <button
            onClick={async () => await handleSignOut()}
            className="md:inline-block bg-[#dc6505] hover:bg-[#e37b2f] text-white font-['Poppins'] font-semibold px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_18px_40px_rgba(220,101,5,0.28)]"
          >
            Sign Out
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={openLogin}
              className="bg-[#0f2a44] hover:bg-[#11335a] text-white font-semibold font-['Poppins'] px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 border border-white/10"
            >
              Login
            </button>
            <button
              onClick={openSignup}
              className="bg-[#dc6505] mx-0 hover:bg-[#e37b2f] text-white font-semibold font-['Poppins'] px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_18px_40px_rgba(220,101,5,0.28)]"
            >
              Sign Up
            </button>
          </div>
        )}

        

        {/* MOBILE MENU ICON */}
        <div className="md:hidden">
          <button className="text-white font-bold text-2xl">☰</button>
        </div>
      </div>
    </nav>
    <RegistrationForm
          open={signupOpen}
          onClose={closeSignup}
          onSuccess={() => {
            closeSignup();
          }}
        />

        <LoginForm
          open={loginOpen}
          onClose={closeLogin}
          onSuccess={() => {
            closeLogin();
          }}
        />
        </>
  );
};

export default NavBar; 