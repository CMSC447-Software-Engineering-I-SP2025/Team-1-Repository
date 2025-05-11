import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from "./components/UserProvider";
import LoginPage from "./components/LoginPage";
import CreateReview from "./components/CreateReview";
import AddFriendPage from "./components/AddFriendPage";
import AddGroupPage from "./components/AddGroupPage";
import CreateAccountPage from "./components/CreateAccountPage";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WorldMap from "./components/WorldMap";
import ClimbPage from "./components/ClimbPage";
import AreaPage from "./components/AreaPage";
import GroupPage from "./components/GroupPage";
import MyProfilePage from "./components/MyProfilePage";
import SettingsPage from "./components/SettingsPage";
import ForgotPassword from "./components/ForgotPassword";
import ViewReviewsPage from "./components/ViewReviewsPage";
import CreateEventPage from "./components/CreateEventPage";

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedClimb, setSelectedClimb] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedArea, setSelectedArea] = useState(null);
  const [areas, setAllAreas] = useState([]);
  const [allClimbs, setAllClimbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedClimbs, setRecommendedClimbs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState();
  const [stateName, setStateName] = useState("Maryland");

  const handleSaveUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("Areas:", areas);
        console.log("State name:", stateName);
        const response = await fetch(`/Search/State?state=${stateName}`, {
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
  }, [stateName]);

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

  const handleLoginClick = () => {
    setCurrentPage("login");
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
          <Header
            onHomeClick={handleHomeClick}
            onProfileClick={handleProfileClick}
            onSettingsClick={handleSettingsClick}
            isLoggedIn={!!user}
            setUser={setUser}
            setIsLoggedIn={setIsLoggedIn}
            setCurrentPage={setCurrentPage} // Pass setCurrentPage to Header
          />
          <Routes>
            <Route path="/signup" element={<CreateAccountPage />} />
            <Route
              path="/login"
              element={<LoginPage OnLoginClick={setCurrentPage} />} // Pass setCurrentPage as OnLoginClick
            />
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/view-reviews" element={<ViewReviewsPage selectedClimb={selectedClimb} />} />
            <Route path="/create-review" element={<CreateReview selectedClimb={selectedClimb} />} /> 
            <Route path="/add-friend" element={<AddFriendPage />} /> 
                      <Route path="/add-group" element={<AddGroupPage />} />
                      <Route path="/group" element={<GroupPage />} />
                      <Route path="/create-event" element={<CreateEventPage />} /> 

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
                          recommendedClimbs={recommendedClimbs}
                          isLoggedIn={isLoggedIn}
                        />
                      </div>
                      <div className="w-3/4">
                        <WorldMap
                          areas={areas}
                          area={selectedArea}
                          setSelectedArea={setSelectedArea}
                          isLoading={isLoading}
                          setStateName={setStateName}
                        />
                      </div>
                    </div>
                  );
                } else if (currentPage === "climb") {
                    return <ClimbPage selectedClimb={selectedClimb} isLoggedIn = {isLoggedIn} />;
                } else if (currentPage === "area") {
                  return (
                    <AreaPage
                      selectedArea={selectedArea}
                      setSelectedClimb={setSelectedClimb}
                    />
                  );
                } else if (currentPage === "profile") {
                  return (
                    <MyProfilePage user={currentUser} onSave={handleSaveUser} />
                  );
                } else if (currentPage === "settings") {
                  return <SettingsPage />;
                } else if (currentPage === "login") {
                  return <LoginPage OnLoginClick={setCurrentPage} />;
                } else if (currentPage === "signup") {
                  return <CreateAccountPage />;
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
