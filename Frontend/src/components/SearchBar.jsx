import React, { useState } from "react";

const SearchBar = ({ placeholder, onInputChange }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onInputChange(searchTerm); // Trigger search on Enter key press
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex items-center justify-center mt-6">
      <input
        type="text"
        className="px-4 py-2 text-black border rounded-full w-80 focus:outline-none"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown} // Use onKeyDown instead of onKeyPress
      />
    </div>
  );
};

export default SearchBar;
