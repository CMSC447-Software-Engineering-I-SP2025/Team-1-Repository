import React from "react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import defaultProfilePic from "../../assets/default-profile.jpg";

const Header = ({
  onHomeClick,
  onProfileClick,
  onSettingsClick,
  isLoggedIn,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 250); // 250ms delay
  };

  return (
    <header className="sticky top-0 z-50 p-4 text-white bg-gray-800">
      <div className="flex items-center justify-between mx-10">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={onHomeClick}>
          Boulder Buddy
        </h1>
        {isLoggedIn ? (
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-blue-500 rounded-full cursor-pointer">
              <img
                src={defaultProfilePic} // Use the default profile picture
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>
            {isDropdownOpen && (
              <div
                className="absolute right-0 w-40 mt-2 bg-white rounded shadow-lg"
                onMouseEnter={handleMouseEnter} // Keep open when hovering over the dropdown
                onMouseLeave={handleMouseLeave} // Close after delay when leaving the dropdown
              >
                <button
                  className="block w-full px-4 py-2 text-sm text-left text-gray-800 hover:bg-gray-200"
                  onClick={onProfileClick}
                >
                  My Profile
                </button>
                <button
                  className="block w-full px-4 py-2 text-sm text-left text-gray-800 hover:bg-gray-200"
                  onClick={onSettingsClick}
                >
                  Settings
                </button>
                <button
                  className="block w-full px-4 py-2 text-sm text-left text-gray-800 hover:bg-gray-200"
                  onClick={() => console.log("Logout clicked")}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <nav>
            <Link to="/signup" className="px-3">
              Sign up
            </Link>
            <Link to="/login" className="px-3">
              Login
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
