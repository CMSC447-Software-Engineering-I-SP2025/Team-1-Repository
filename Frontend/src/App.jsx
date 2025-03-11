import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WorldMap from "./components/WorldMap";
import ClimbPage from "./components/ClimbPage";

const App = () => {
  const [selectedClimb, setSelectedClimb] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");

  const handleHomeClick = () => {
    setCurrentPage("home");
    setSelectedClimb(null);
  };

  useEffect(() => {
    if (selectedClimb) {
      setCurrentPage("climb");
    }
  }, [selectedClimb]);

  return (
    <div>
      <Header onHomeClick={handleHomeClick} />
      {(() => {
        if (currentPage === "home") {
          return (
            <div className="flex">
              <div className="w-2/4">
                <HeroSection
                  setCurrentPage={setCurrentPage}
                  setSelectedClimb={setSelectedClimb}
                />
              </div>
              <div className="w-3/4">
                <WorldMap
                  climb={selectedClimb}
                  setSelectedClimb={setSelectedClimb}
                />
              </div>
            </div>
          );
        } else if (currentPage === "climb") {
          return <ClimbPage currentClimb={selectedClimb} />;
        } else {
          return null;
        }
      })()}
    </div>
  );
};

export default App;
