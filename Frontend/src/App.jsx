import React, { useState, useRef, useEffect } from "react";
//import { BrowserRouter as Router, Route, Switch } from "react-router-dom"; //NEW
//import MakeAccount from "./components/MakeAccount"; // The new Make Account page
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WorldMap from "./components/WorldMap";
import "tailwindcss/tailwind.css";

const App = () => {
  // State to store the selected climb
  const [selectedClimb, setSelectedClimb] = useState(null);
  // Reference to the WorldMap component
  const mapRef = useRef(null);

  // Effect to recenter the map when selectedClimb changes
  useEffect(() => {
    if (mapRef.current && selectedClimb) {
      mapRef.current.recenterMap();
    }
  }, [selectedClimb]);

  const handleSearch = (climb) => {
    setSelectedClimb(climb);
  };

  return (
    <div>
      <Header />
      <div>
        <div className="flex">
          <div className="w-2/4">
            <HeroSection onSearch={handleSearch} mapRef={mapRef} />
          </div>
          <div className="w-3/4">
            <WorldMap ref={mapRef} climb={selectedClimb} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
