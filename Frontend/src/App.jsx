import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WorldMap from "./components/WorldMap";
import RecommendationTab from "./components/RecommendationTab";
import CreateAccountPage from "./components/CreateAccountPage";
import "tailwindcss/tailwind.css";

const App = () => {
  // State to store the selected climb
  const [selectedClimb, setSelectedClimb] = useState(null);
  // Reference to the WorldMap component
  const mapRef = useRef(null);
  // State to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Sample recommended climbs data
  const recommendedClimbs = [
    { name: "Climb A", location: "Location A" },
    { name: "Climb B", location: "Location B" },
    { name: "Climb C", location: "Location C" },
    { name: "Climb D", location: "Location D" },
    { name: "Climb E", location: "Location E" },
  ];

  // Effect to recenter the map when selectedClimb changes
  useEffect(() => {
    if (mapRef.current && selectedClimb) {
      mapRef.current.recenterMap();
    }
  }, [selectedClimb]);

  const handleSearch = (climb) => {
    setSelectedClimb(climb);
  };

  const handleLogin = (email, password) => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div>
                  <div className="flex">
                    <div className="w-2/4">
                      <HeroSection
                        onSearch={handleSearch}
                        mapRef={mapRef}
                        recommendedClimbs={recommendedClimbs}
                      />
                    </div>
                    <div className="w-3/4">
                      <WorldMap ref={mapRef} climb={selectedClimb} />
                    </div>
                  </div>
                </div>
              </>
            }
          />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;