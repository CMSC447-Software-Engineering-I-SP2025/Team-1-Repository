import React from "react";
import { Link } from "react-router-dom";

const Header = ({ onHomeClick }) => {
  return (
    <header className="sticky top-0 z-50 p-4 text-white bg-gray-800">
      <div className="container flex items-center justify-between mx-auto">
        <h1 className="text-2xl font-bold cursor-pointer">
          <Link to="/" onClick={onHomeClick}>Boulder Buddy</Link>
        </h1>
        <nav>
          <Link to="/login" className="px-3">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
