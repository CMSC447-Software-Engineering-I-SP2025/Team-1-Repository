import React from "react";

const Header = ({ onHomeClick }) => {
  return (
    <header className="sticky top-0 z-50 p-4 text-white bg-gray-800">
      <div className="container flex items-center justify-between mx-auto">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={onHomeClick}>
          Boulder Buddy
        </h1>
      </div>
    </header>
  );
};

export default Header;
