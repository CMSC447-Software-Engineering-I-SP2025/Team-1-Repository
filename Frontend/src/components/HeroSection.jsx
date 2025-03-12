import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import climbs from "../data/climbs";

const HeroSection = ({ setSelectedClimb }) => {
  const [filteredClimbs, setFilteredClimbs] = useState([]);

  useEffect(() => {
    // Select up to 15 random climbs once when the component mounts
    const selectedClimbs = climbs.sort(() => 0.5 - Math.random()).slice(0, 15);
    setFilteredClimbs(selectedClimbs);

    const fetchData = async () => {
      try {
        const response = await fetch("/Search/State?state=Maryland", {
          method: "POST",
        });
        console.log(response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleClimbClick = (currentClimb) => {
    setSelectedClimb(currentClimb);
  };

  const handleInputChange = (searchTerm) => {
    const filtered = climbs.filter((climb) =>
      climb.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClimbs(filtered.slice(0, 15));
  };

  return (
    <section className="h-screen px-4 py-20 pb-10 text-white bg-gradient-to-r from-blue-500 to-green-500">
      <div className="container mx-auto text-center">
        <h1 className="mb-6 text-6xl font-extrabold">
          Welcome to Boulder Buddy
        </h1>
        <p className="mb-6 text-xl">Your ultimate climbing companion</p>
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
                  {climb.location}
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
