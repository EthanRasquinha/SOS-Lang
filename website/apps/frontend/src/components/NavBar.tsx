import { useAuth } from "../../AuthContext";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import bullImage from "../../assets/bull.jpg";
import { RegistrationForm } from "./RegistrationForm";
import { LoginForm } from "./LoginForm";

export const NavBar = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [activeTabPos, setActiveTabPos] = useState({ left: 0, width: 0 });
  const { role, setRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRefs = useRef<(HTMLLIElement | null)[]>([]);

  const openLogin = () => setLoginOpen(true);
  const openSignup = () => setSignupOpen(true);

  const closeLogin = () => setLoginOpen(false);
  const closeSignup = () => setSignupOpen(false);

  const handleSignOut = () => {
    setRole("guest");
    navigate("/");
  };

  const navItems = useMemo(() => [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    ...(role === "user"
      ? [
          { name: "New Note", path: "/newnote" },
          { name: "Study Material", path: "/studymaterial" },
        ]
      : []),
  ], [role]);

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
    <nav className="bg-white border-b border-[#c1c4c7] sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 py-4 flex items-center justify-between relative">
        {/* LOGO */}
        <Link to="/" className="flex items-center text-[#dc6505] font-bold font-['Poppins'] text-3xl">
          <img src={bullImage} className="w-11 h-12 mx-2" />
          <div>
            <p>SOS-LANG</p>
          </div>
        </Link>

        {/* Bubble Slider Navigation */}
        <div className="hidden md:flex relative p-1">
          {/* Large background pill */}
          <div className="absolute inset-0 rounded-full bg-[#f2f4f6] shadow-inner"></div>

          {/* Small sliding pill */}
          <div
            className="absolute top-0 h-full bg-[#dc6505] rounded-full transition-all duration-300 shadow-md"
            style={{
              left: activeTabPos.left + activeTabPos.width * 0.1,
              width: activeTabPos.width *.85,
              top: "10%",
              height: "80%",
            }}
          ></div>

          <ul className="flex space-x-7 relative z-10">
            {navItems.map((item, index) => (
              <li key={index} ref={(el) => (navRefs.current[index] = el)} className="relative px-3 text-l">
                <Link
                  to={item.path}
                  className={`px-3 py-2 rounded-full font-medium font-['Poppins'] text-center w-full block transition-all duration-300 ${
                    location.pathname === item.path
                      ? "text-white"
                      : "text-[#7c7f86] hover:text-[#004d73]"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth Buttons */}
        {role === "user" ? (
          <button
            onClick={handleSignOut}
            className="md:inline-block bg-[#dc6505] hover:bg-[#efb486] text-white font-['Poppins'] font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
          >
            Sign Out
          </button>
        ) : (
          <div className="flex">
            <button
              onClick={openLogin}
              className="bg-gray-100 mx-2 hover:bg-gray-300 text-black font-semibold font-['Poppins'] px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Login
            </button>
            <button
              onClick={openSignup}
              className="bg-[#dc6505] mx-2 hover:bg-[#efb486] text-white font-semibold font-['Poppins'] px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        )}

        <RegistrationForm
          open={signupOpen}
          onClose={closeSignup}
          onSuccess={() => {
            setRole("user");
            closeSignup();
          }}
        />

        <LoginForm
          open={loginOpen}
          onClose={closeLogin}
          onSuccess={() => {
            setRole("user");
            closeLogin();
          }}
        />

        {/* MOBILE MENU ICON */}
        <div className="md:hidden">
          <button className="text-[#004d73] font-bold text-2xl">☰</button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 