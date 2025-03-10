import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 p-4 text-white bg-gray-800">
      <div className="container flex items-center justify-between mx-auto">
        <h1 className="text-2xl font-bold">Boulder Buddy</h1>
        <nav>
          <a href="#" className="px-3">
            Home
          </a>
          <a href="#" className="px-3">
            About
          </a>
          <a href="#" className="px-3">
            Contact
          </a>
          <a href="#" className="px-3">
            Create Account
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
