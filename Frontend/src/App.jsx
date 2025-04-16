import React, { useState, useEffect, use } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import { UserProvider } from "./components/UserProvider"; // Import UserProvider if needed
import LoginPage from "./components/LoginPage";
import CreateAccountPage from "./components/CreateAccountPage";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WorldMap from "./components/WorldMap";
import ClimbPage from "./components/ClimbPage";
import AreaPage from "./components/AreaPage";
import MyProfilePage from "./components/MyProfilePage";
import SettingsPage from "./components/SettingsPage";
import LoginPage from "./components/LoginPage";
import CreateAccountPage from "./components/CreateAccountPage";
import { UserProvider } from "./components/UserProvider";
import ForgotPassword from "./components/ForgotPassword";

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedClimb, setSelectedClimb] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedArea, setSelectedArea] = useState(null);
  const [areas, setAllAreas] = useState([]);
  const [allClimbs, setAllClimbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedClimbs, setRecommendedClimbs] = useState([]);

  const currentUser = {
    id: "12345",
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    phone: "123-456-7890",
    phoneCountry: "+1",
    boulderGradeRange: { min: "V0", max: "V5" },
    ropeGradeRange: { min: "5.8", max: "5.12" },
  };

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

  useEffect(() => {
    if (areas.length > 0) {
      const allClimbs = areas.flatMap((area) => area.climbs);
      const selectedClimbs = allClimbs
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
      setRecommendedClimbs(selectedClimbs);
    }
  }, [areas]);

  const handleHomeClick = () => {
    setCurrentPage("home");
    setSelectedClimb(null);
    setSelectedArea(null);
  };

  const handleProfileClick = () => {
    setCurrentPage("profile");
  };

  const handleSettingsClick = () => {
    setCurrentPage("settings");
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
    <UserProvider>
      <Router>
        <div>
          <Header onHomeClick={handleHomeClick} />
          <Routes>
            <Route path="/signup" element={<CreateAccountPage />} />
            <Route path="/login" element={<LoginPage onLogin={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route
              path="/"
              element={(() => {
                if (currentPage === "home") {
                  return (
                    <div className="flex">
                      <div className="w-2/4">
                        <HeroSection
                          setCurrentPage={setCurrentPage}
                          setSelectedClimb={setSelectedClimb}
                          allClimbs={allClimbs}
                          isLoading={isLoading}
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
                } else if (currentPage === "profile") {
                  return <MyProfilePage user={currentUser} />;
                } else if (currentPage === "settings") {
                  return <SettingsPage />;
                } else {
                  return null;
                }
              })()}
            />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
