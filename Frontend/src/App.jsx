import React, { useState, useEffect, use } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import CreateAccountPage from "./components/CreateAccountPage";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WorldMap from "./components/WorldMap";
import ClimbPage from "./components/ClimbPage";
import AreaPage from "./components/AreaPage";

const App = () => {
  const [selectedClimb, setSelectedClimb] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedArea, setSelectedArea] = useState(null);
  const [areas, setAllAreas] = useState([]);
  const [allClimbs, setAllClimbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const recommendedClimbs = [
    { name: "Climb A", location: "Location A" },
    { name: "Climb B", location: "Location B" },
    { name: "Climb C", location: "Location C" },
    { name: "Climb D", location: "Location D" },
    { name: "Climb E", location: "Location E" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/Search/State?state=Maryland", { 
          method: "POST",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllAreas(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHomeClick = () => {
    setCurrentPage("home");
    setSelectedClimb(null);
    setSelectedArea(null);
  };

  useEffect(() => {
    if (selectedClimb) {
      setCurrentPage("climb");
    }
  }, [selectedClimb]);

  useEffect(() => {
    if (selectedArea) {
      setCurrentPage("area");
    }
  }, [selectedArea]);

  useEffect(() => {
    setAllClimbs(
      areas.flatMap((area) =>
        area.climbs.map((climb) => ({ ...climb, area: area }))
      )
    );
    console.log("All climbs:", allClimbs);
  }, [areas]);

  return (
    <Router>
      <div>
        <Header onHomeClick={handleHomeClick} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/" element={
            (() => {
              if (currentPage === "home") {
                return (
                  <div className="flex">
                    <div className="w-2/4">
                      <HeroSection
                        setCurrentPage={setCurrentPage}
                        setSelectedClimb={setSelectedClimb}
                        allClimbs={allClimbs}
                        isLoading={isLoading}
                        recommendedClimbs={recommendedClimbs} 
                      />
                    </div>
                    <div className="w-3/4">
                      <WorldMap
                        areas={areas}
                        area={selectedArea}
                        setSelectedArea={setSelectedArea}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                );
              } else if (currentPage === "climb") {
                return <ClimbPage selectedClimb={selectedClimb} />;
              } else if (currentPage === "area") {
                return (
                  <AreaPage
                    selectedArea={selectedArea}
                    setSelectedClimb={setSelectedClimb}
                  />
                );
              } else {
                return null;
              }
            })()
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
