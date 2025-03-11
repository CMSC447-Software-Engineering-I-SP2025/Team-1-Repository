import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 p-4 text-white bg-gray-800">
      <div className="container flex items-center justify-between mx-auto">
        <h1 className="text-2xl font-bold">
          <Link to="/" className="text-white">
            Boulder Buddy
          </Link>
        </h1>
        <nav>
          <Link to="/" className="px-3">
            Home
          </Link>
          <Link to="/about" className="px-3">
            About
          </Link>
          <Link to="/contact" className="px-3">
            Contact
          </Link>
          <Link to="/login" className="px-3">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;