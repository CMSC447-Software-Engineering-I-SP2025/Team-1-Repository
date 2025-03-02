import React, { useState } from "react";
import climbs from "../data/climbs";

const SearchBar = ({ placeholder, onSearch, mapRef, onInputChange }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onInputChange(value);
  };

  const HandleSearch = () => {
    const climb = climbs.find(
      (climb) => climb.name.toLowerCase() === searchTerm.toLowerCase()
    );
    onSearch(climb || null);
    if (mapRef.current && climb) {
      mapRef.current.recenterMap();
    }
  };

  const handleButtonClick = () => {
    HandleSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      HandleSearch();
    }
  };

  return (
    <div className="flex items-center justify-center mt-6">
      <input
        type="text"
        className="px-4 py-2 text-black border rounded-l-lg focus:outline-none"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
      />
      <button
        className="px-4 py-2 text-white bg-blue-500 rounded-r-lg hover:bg-blue-600"
        onClick={handleButtonClick}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
