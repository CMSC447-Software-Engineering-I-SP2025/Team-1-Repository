import React, { useState } from "react";
import climbs from "../data/climbs";

const SearchBar = ({ placeholder, onInputChange }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onInputChange(value);
  };

  return (
    <div className="flex items-center justify-center mt-6">
      <input
        type="text"
        className="px-4 py-2 text-black border rounded-full w-80 focus:outline-none"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default SearchBar;
