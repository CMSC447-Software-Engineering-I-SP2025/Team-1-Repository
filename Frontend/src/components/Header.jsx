import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import defaultProfilePic from "../../assets/default-profile.jpg";

const Header = ({
  onHomeClick,
  onProfileClick,
  onSettingsClick,
  isLoggedIn,
  setUser,
  setIsLoggedIn,
  setCurrentPage, // Receive setCurrentPage as a prop
  setCurrentUser,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown is closed by default
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // Log out the user
      setUser(null); // Reset user state
      setCurrentUser(null); // Reset current user state
      setIsLoggedIn(false); // Update login state
      console.log("You have successfully logged out.");
      setCurrentPage("login"); // Update current page to "login"
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoggedIn) {
    return (
      <header className="sticky top-0 z-50 p-4 text-white bg-gray-800">
        <div className="flex items-center justify-between mx-10">
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={onHomeClick}
          >
            Boulder Buddy
          </h1>
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-blue-500 rounded-full cursor-pointer">
              <img
                src={defaultProfilePic} // Use the default profile picture for now
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>
            {isDropdownOpen && (
              <div
                className="absolute right-0 w-40 mt-2 bg-white rounded shadow-lg"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="block w-full px-4 py-2 text-sm text-left text-gray-800 cursor-pointer hover:bg-gray-200"
                  onClick={onProfileClick}
                >
                  My Profile
                </div>
                <div
                  className="block w-full px-4 py-2 text-sm text-left text-gray-800 cursor-pointer hover:bg-gray-200"
                  onClick={onSettingsClick}
                >
                  Settings
                </div>
                <div
                  className="block w-full px-4 py-2 text-sm text-left text-gray-800 cursor-pointer hover:bg-gray-200"
                  onClick={handleLogout} // Call handleLogout on click
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  } else {
    return (
      <header className="sticky top-0 z-50 p-4 text-white bg-gray-800">
        <div className="flex items-center justify-between mx-10">
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={onHomeClick}
          >
            Boulder Buddy
          </h1>
          <nav className="items-center ml-auto /flex">
            <span
              className="px-1 cursor-pointer"
              onClick={() => setCurrentPage("signup")} // Navigate to signup
            >
              Sign up
            </span>
            <span
              className="cursor-pointer px-9"
              onClick={() => setCurrentPage("login")} // Navigate to login
            >
              Login
            </span>
          </nav>
        </div>
      </header>
    );
  }
};

export default Header;
