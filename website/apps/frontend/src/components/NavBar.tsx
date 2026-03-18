import React from 'react';
import { Link } from 'react-router-dom';

export const NavBar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-[#c1c4c7] sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="text-[#004d73] font-bold text-xl">
          SOS-Lang
        </Link>

        {/* MENU */}
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
          <li>
            <Link
              to="/contact"
              className="hover:text-[#004d73] transition-colors duration-200"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* GET STARTED BUTTON */}
        <Link
          to="/signup"
          className="hidden md:inline-block bg-[#dc6505] hover:bg-[#efb486] text-white font-semibold px-4 py-2 rounded transition-all duration-300 hover:scale-105"
        >
          Get Started
        </Link>

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