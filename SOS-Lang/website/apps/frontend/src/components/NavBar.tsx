import React from 'react';
import { Link } from 'react-router-dom';
import { useState} from 'react';
import bullImage from '../../assets/bull.jpg'
import {RegistrationForm} from './RegistrationForm'

type Props = {
    userRole: string;
    setUserRole: (newRole: string) => void;
};

export const NavBar: React.FC = ({userRole, setUserRole} : Props ) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [popupVisible, setPopupVisible] = useState<boolean>(false)

    function togglePopup() {
        setPopupVisible(!popupVisible)
    }    

  return (
    <nav className="bg-white border-b border-[#c1c4c7] sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="text-[#004d73] font-bold text-xl">
        <div className="flex">
        <img src={bullImage} className="w-9 h-10"/>
        <p className="p-2">
          SOS-Lang
          </p>
        </div>
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
              to="/newnote"
              className="hover:text-[#004d73] transition-colors duration-200"
            >
              New Note
            </Link>
          </li>
        </ul>

        {/* GET STARTED BUTTON */}
        <button onClick={togglePopup} className="md:inline-block bg-[#dc6505] hover:bg-[#efb486] text-white font-semibold px-4 py-2 rounded transition-all duration-300 hover:scale-105">
          Get Started
        </button>
        
        <RegistrationForm open={popupVisible} onClose={() => togglePopup()}/>

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