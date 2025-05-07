import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import RecommendationTab from "./RecommendationTab";
import { FaSpinner } from "react-icons/fa";

const HeroSection = ({
  setSelectedClimb,
  allClimbs,
  isLoading,
  isLoggedIn,
  stateName,
  setStateName, // Receive stateName and setStateName
}) => {
  const [filteredClimbs, setFilteredClimbs] = useState([]);

  useEffect(() => {
    // Select up to 15 random climbs once when the component mounts
    const selectedClimbs = allClimbs
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);
    setFilteredClimbs(selectedClimbs);
  }, [allClimbs]);

  const handleClimbClick = (climb) => {
    setSelectedClimb(climb);
    console.log("Climb selected:", climb);
  };

  const handleInputChange = (searchTerm) => {
    const filtered = allClimbs.filter((climb) =>
      climb.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClimbs(filtered.slice(0, 15));
  };

  const handleStateChange = (event) => {
    setStateName(event.target.value);
  };

  const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  if (isLoading) {
    return (
      <section className="h-screen px-4 py-20 pb-10 text-gray-900 bg-gradient-to-r from-blue-100 to-blue-200">
        <div className="container mx-auto text-center">
          <h1 className="mb-6 text-6xl font-extrabold">
            Welcome to Boulder Buddy
          </h1>
          <p className="mb-6 text-xl">Your ultimate climbing companion</p>
          <div className="mb-6">
            <label
              htmlFor="state-select"
              className="block mb-2 text-lg font-medium text-gray-700"
            >
              Select State:
            </label>
            <select
              id="state-select"
              value={stateName}
              onChange={handleStateChange}
              className="px-4 py-2 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <SearchBar
            placeholder="Search for a climb by name"
            onInputChange={handleInputChange}
          />
          <div className="mt-6">
            <h2 className="mb-4 text-2xl font-bold">Current Climbs</h2>
            <div className="flex items-center justify-center">
              <FaSpinner className="text-4xl animate-spin" />
              <h2 className="ml-4 text-2xl font-bold">Loading...</h2>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="h-screen px-4 py-20 pb-10 text-gray-900 bg-gradient-to-r from-blue-100 to-blue-200">
      <div className="container mx-auto text-center">
        <h1 className="mb-6 text-6xl font-extrabold">
          Welcome to Boulder Buddy
        </h1>
        <p className="mb-6 text-xl">Your ultimate climbing companion</p>
        <div className="mb-6">
          <label
            htmlFor="state-select"
            className="block mb-2 text-lg font-medium text-gray-700"
          >
            Select State:
          </label>
          <select
            id="state-select"
            value={stateName}
            onChange={handleStateChange}
            className="px-4 py-2 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <SearchBar
          placeholder="Search for a climb by name"
          onInputChange={handleInputChange}
        />
        <div className="mt-6">
          <h2 className="mb-4 text-2xl font-bold">Current Climbs</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredClimbs.map((climb) => (
              <li
                key={climb.id}
                className="px-4 py-2 text-black bg-white rounded-lg cursor-pointer hover:bg-gray-200"
                onClick={() => handleClimbClick(climb)}
              >
                <div className="font-bold truncate">{climb.name}</div>
                <div className="text-sm text-gray-600 truncate">
                  {climb.area.areaName}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
