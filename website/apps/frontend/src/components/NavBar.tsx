import { useAuth } from "../../AuthContext";
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import bullImage from '../../assets/bull.jpg'
import { RegistrationForm } from './RegistrationForm'

type Props = {
  role: "guest" | "user" | "admin";
  setRole: React.Dispatch<React.SetStateAction<"guest" | "user" | "admin">>;
};

export const NavBar = () => {
  const [popupVisible, setPopupVisible] = useState<boolean>(false)
  const { role, setRole } = useAuth();
  const navigate = useNavigate();


  function togglePopup() {
    setPopupVisible(!popupVisible)
  }

  const handleSignOut = () => {
    setRole("guest");        // update state
    navigate("/");           // redirect to home
  };

  return (
    <nav className="bg-white border-b border-[#c1c4c7] sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="text-[#004d73] font-bold text-xl">
          <div className="flex">
            <img src={bullImage} className="w-9 h-10" />
            <p className="p-2">
              SOS-Lang
            </p>
          </div>
        </Link>
        <ul className="hidden md:flex space-x-6 text-[#7c7f86] font-medium">
          <li>
            <Link
              to="/"
              className="hover:text-[#004d73] transition-colors duration-200"
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              to="/about"
              className="hover:text-[#004d73] transition-colors duration-200"
            >
              About
            </Link>
          </li>

          {role === "user" && (
            <>
              <li>
                <Link
                  to="/newnote"
                  className="hover:text-[#004d73] transition-colors duration-200"
                >
                  New Note
                </Link>
              </li>

              <li>
                <Link
                  to="/studymaterial"
                  className="hover:text-[#004d73] transition-colors duration-200"
                >
                  Study Material
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* GET STARTED BUTTON */}
        {role === "user" ? (
          <button onClick={handleSignOut} className="md:inline-block bg-[#dc6505] hover:bg-[#efb486] text-white font-semibold px-4 py-2 rounded transition-all duration-300 hover:scale-105">
          Sign Out
        </button>
        ) : (
          <div className="flex">
          <button onClick={togglePopup} className=" bg-[#dc6505] mx-2 hover:bg-[#efb486] text-white font-semibold px-4 py-2 rounded transition-all duration-300 hover:scale-105">
          Login
        </button>
          <button onClick={togglePopup} className=" bg-[#dc6505] mx-2 hover:bg-[#efb486] text-white font-semibold px-4 py-2 rounded transition-all duration-300 hover:scale-105">
          Sign Up
        </button>
        </div>
        )}
        



        <RegistrationForm
          open={popupVisible}
          onClose={togglePopup}
          onSuccess={() => { setRole("user"); 
                              togglePopup(); }}
        >
          {/* optional children here */}
        </RegistrationForm>
        {/* MOBILE MENU ICON */}
        <div className="md:hidden">
          {/* You can add a hamburger menu icon here later */}
          <button className="text-[#004d73] font-bold">☰</button>
        </div>

      </div>
    </nav>
  );
};

export default NavBar;