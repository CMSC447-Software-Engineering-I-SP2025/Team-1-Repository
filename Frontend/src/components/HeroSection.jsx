import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import SearchBar from "./SearchBar";
import RecommendationTab from "./RecommendationTab";
import { FaSpinner } from "react-icons/fa";

const HeroSection = ({
  setSelectedClimb,
  allClimbs,
  isLoading,
  isLoggedIn,
  stateName,
  setStateName,
  setAllAreas,
}) => {
  const [filteredClimbs, setFilteredClimbs] = useState([]);
  //FILTERS
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOptions, setFilterOptions] = useState({});
  const [minYds, setMinYds] = useState("");
  const [maxYds, setMaxYds] = useState("");
  const [minVscale, setMinVscale] = useState("");
  const [maxVscale, setMaxVscale] = useState("");
  const [minFrench, setMinFrench] = useState("");
  const [maxFrench, setMaxFrench] = useState("");
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isAidType, setIsAidType] = useState(false);
  const [isAlpineType, setIsAlpineType] = useState(false);
  const [isBoulderingType, setIsBoulderingType] = useState(false);
  const [isIceType, setIsIceType] = useState(false);
  const [isMixedType, setIsMixedType] = useState(false);
  const [isSnowType, setIsSnowType] = useState(false);
  const [isSportType, setIsSportType] = useState(false);
  const [isTrType, setIsTrType] = useState(false);
  const [isTradType, setIsTradType] = useState(true);

  const difficultyLevels = [
    "5.0",
    "5.1",
    "5.2",
    "5.3",
    "5.4",
    "5.5",
    "5.6",
    "5.7",
    "5.8",
    "5.9",
    "5.10a",
    "5.10b",
    "5.10c",
    "5.10d",
    "5.11a",
    "5.11b",
    "5.11c",
    "5.11d",
    "5.12a",
    "5.12b",
    "5.12c",
    "5.12d",
    "5.13a",
    "5.13b",
    "5.13c",
    "5.13d",
    "5.14a",
    "5.14b",
    "5.14c",
    "5.14d",
    "5.15a",
    "5.15b",
    "5.15c",
    "5.15d",
  ];

  const vScaleLevels = [
    "V0",
    "V1",
    "V2",
    "V3",
    "V4",
    "V5",
    "V6",
    "V7",
    "V8",
    "V9",
    "V10",
    "V11",
    "V12",
    "V13",
    "V14",
    "V15",
    "V16",
    "V17",
  ];
  const frenchScaleLevels = [
    "1-",
    "1",
    "1+",
    "2-",
    "2",
    "2+",
    "3-",
    "3",
    "3+",
    "4a",
    "4a+",
    "4b",
    "4b+",
    "4c",
    "4c+",
    "5a",
    "5a+",
    "5b",
    "5b+",
    "5c",
    "5c+",
    "6a",
    "6a+",
    "6b",
    "6b+",
    "6c",
    "6c+",
    "7a",
    "7a+",
    "7b",
    "7b+",
    "7c",
    "7c+",
    "8a",
    "8a+",
    "8b",
    "8b+",
    "8c",
    "8c+",
    "9a",
    "9a+",
    "9b",
    "9b+",
    "9c",
    "9c+",
  ];

  useEffect(() => {
    handleFilterChange();
  }, [
    minYds,
    maxYds,
    minVscale,
    maxVscale,
    minFrench,
    maxFrench,
    isAidType,
    isAlpineType,
    isBoulderingType,
    isIceType,
    isMixedType,
    isSnowType,
    isSportType,
    isTrType,
    isTradType,
  ]);

  const handleFilterChange = () => {
    let updatedFilterOptions = {};
    if (minYds !== "") {
      updatedFilterOptions.minYds = minYds;
    }
    if (maxYds !== "") {
      updatedFilterOptions.maxYds = maxYds;
    }
    if (minVscale !== "") {
      updatedFilterOptions.minVscale = minVscale;
    }
    if (maxVscale !== "") {
      updatedFilterOptions.maxVscale = maxVscale;
    }
    if (minFrench !== "") {
      updatedFilterOptions.minFrench = minFrench;
    }
    if (maxFrench !== "") {
      updatedFilterOptions.maxFrench = maxFrench;
    }
    updatedFilterOptions.isAidType = isAidType;
    updatedFilterOptions.isAlpineType = isAlpineType;
    updatedFilterOptions.isBoulderingType = isBoulderingType;
    updatedFilterOptions.isIceType = isIceType;
    updatedFilterOptions.isMixedType = isMixedType;
    updatedFilterOptions.isSnowType = isSnowType;
    updatedFilterOptions.isSportType = isSportType;
    updatedFilterOptions.isTrType = isTrType;
    updatedFilterOptions.isTradType = isTradType;
    setFilterOptions(updatedFilterOptions);
  };

  useEffect(() => {
    setFilteredClimbs(allClimbs);
  }, [allClimbs]);

  const handleClimbClick = (climb) => {
    setSelectedClimb(climb);
    console.log("Climb selected:", climb);
  };

  const handleInputChange = async (searchTerm) => {
    setSearchTerm(searchTerm);
    console.log("Search term:", searchTerm);
    console.log("Filter options:", filterOptions);
    try {
      const response = await axios.post(
        "https://localhost:7195/Search/StateWithFilters",
        {
          state: stateName,
          searchTerm,
          ...filterOptions,
        }
      );
      console.log("Search results:", response.data);
      setAllAreas(response.data);
      const allClimbsFromAreas = response.data.flatMap((area) =>
        (area.climbs || []).map((climb) => ({
          ...climb,
          area: area,
        }))
      );
      console.log("All climbs with area info:", allClimbsFromAreas);
      setFilteredClimbs(allClimbsFromAreas);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      handleInputChange(event.target.value);
    }
  };

  const handleStateChange = (event) => {
    setStateName(event.target.value);
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();

    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError("");
    }

    // Validate phone
    if (!validatePhone(phone)) {
      setPhoneError("Please enter a valid phone number (10-15 digits).");
      return;
    } else {
      setPhoneError("");
    }

    try {
      const updatedUser = {
        ...currentUser,
        firstName,
        lastName,
        email,
        phone,
        bio,
      };

      // Update user in the database
      const response = await axios.put(
        `/api/Database/user/${currentUser.id}`,
        updatedUser,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("User updated successfully:", response.data);

      // Update currentUser state
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const toggleFilterPopup = () => {
    setIsFilterPopupOpen(!isFilterPopupOpen);
    if (isFilterPopupOpen) {
      handleInputChange(searchTerm);
    }
  };

  const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
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
            onInputChange={handleInputChange} // Pass handleInputChange directly
            onKeyPress={handleSearchKeyPress}
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
      <div className="container h-full mx-auto text-center">
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
        <div className="mb-6">
          <div className="flex items-center justify-center">
            <SearchBar
              placeholder="Search for a climb by name"
              onInputChange={handleInputChange} // Pass handleInputChange directly
              onKeyPress={handleSearchKeyPress}
            />
          </div>
          <div className="flex items-center justify-center mt-4">
            <button
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              onClick={toggleFilterPopup}
            >
              Filters
            </button>
          </div>
        </div>

        {isFilterPopupOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            style={{ zIndex: 1000 }} // Ensure the popup is above other elements
          >
            <div className="w-11/12 max-w-lg p-6 bg-white rounded-lg shadow-lg">
              <h3 className="mb-4 text-lg font-bold">Filter Options</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Min and Max YDS */}
                <div>
                  <label
                    htmlFor="min-difficulty"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Min Difficulty (YDS)
                  </label>
                  <select
                    id="min-difficulty"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterOptions.minYds || ""}
                    onChange={(e) => setMinYds(e.target.value)}
                  >
                    <option value="">Select</option>
                    {difficultyLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="max-difficulty"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Max Difficulty (YDS)
                  </label>
                  <select
                    id="max-difficulty"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterOptions.maxYds || ""}
                    onChange={(e) => setMaxYds(e.target.value)}
                  >
                    <option value="">Select</option>
                    {difficultyLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min and Max V-scale */}
                <div>
                  <label
                    htmlFor="min-vscale"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Min Difficulty (V-scale)
                  </label>
                  <select
                    id="min-vscale"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterOptions.minVscale || ""}
                    onChange={(e) => setMinVscale(e.target.value)}
                  >
                    <option value="">Select</option>
                    {vScaleLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="max-vscale"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Max Difficulty (V-scale)
                  </label>
                  <select
                    id="max-vscale"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterOptions.maxVscale || ""}
                    onChange={(e) => setMaxVscale(e.target.value)}
                  >
                    <option value="">Select</option>
                    {vScaleLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min and Max French scale */}
                <div>
                  <label
                    htmlFor="min-french"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Min Difficulty (French)
                  </label>
                  <select
                    id="min-french"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterOptions.minFrench || ""}
                    onChange={(e) => setMinFrench(e.target.value)}
                  >
                    <option value="">Select</option>
                    {frenchScaleLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="max-french"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Max Difficulty (French)
                  </label>
                  <select
                    id="max-french"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterOptions.maxFrench || ""}
                    onChange={(e) => setMaxFrench(e.target.value)}
                  >
                    <option value="">Select</option>
                    {frenchScaleLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Checkboxes for climbing types */}
                <div className="col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Climbing Types
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isAidType}
                        onChange={(e) => setIsAidType(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Aid</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isAlpineType}
                        onChange={(e) => setIsAlpineType(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Alpine</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isBoulderingType}
                        onChange={(e) => setIsBoulderingType(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Bouldering</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isIceType}
                        onChange={(e) => setIsIceType(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Ice</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isMixedType}
                        onChange={(e) => setIsMixedType(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Mixed</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSnowType}
                        onChange={(e) => setIsSnowType(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Snow</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSportType}
                        onChange={(e) => setIsSportType(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Sport</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isTrType}
                        onChange={(e) => setIsTrType(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Top Rope</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isTradType}
                        onChange={(e) => setIsTradType(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Trad</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-right">
                <button
                  className="px-4 py-2 mr-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
                  onClick={toggleFilterPopup}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                  onClick={() => {
                    toggleFilterPopup();
                    console.log("Filters applied:", filterOptions, {
                      isAidType,
                      isAlpineType,
                      isBoulderingType,
                      isIceType,
                      isMixedType,
                      isSnowType,
                      isSportType,
                      isTrType,
                      isTradType,
                    });
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="mb-4 text-2xl font-bold">Current Climbs</h2>
          <div className="overflow-y-auto border border-gray-300 rounded-lg max-h-80">
            <ul className="grid max-h-screen grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredClimbs.map((climb) => (
                <li
                  key={climb.id}
                  className="px-4 py-2 text-black bg-white rounded-lg cursor-pointer hover:bg-gray-200"
                  onClick={() => handleClimbClick(climb)}
                >
                  <div className="font-bold truncate">{climb.name}</div>
                  <div className="text-sm text-gray-600 truncate">
                    {climb.area.areaName || "Unknown Area"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
