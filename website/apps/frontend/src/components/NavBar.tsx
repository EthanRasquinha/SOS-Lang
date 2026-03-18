import React from 'react';
import { Link } from 'react-router-dom';

export const NavBar: React.FC = () => {
    return (
        <nav className="w-full bg-[#dc6505] text-white px-4 py-3">
        <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">
            SOS Lang
            </Link>

            <ul className="flex gap-6">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            </ul>
        </div>
        </nav>
    );
};

export default NavBar;