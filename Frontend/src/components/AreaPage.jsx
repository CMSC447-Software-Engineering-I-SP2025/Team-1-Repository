import React, { useEffect } from "react";

const AreaPage = ({ selectedArea, setSelectedClimb }) => {
  if (!selectedArea) {
    return <div className="text-center text-gray-500">No area selected</div>;
  }

  const handleClimbClick = (climb) => {
    const climbWithArea = { ...climb, area: selectedArea };
    setSelectedClimb(climbWithArea);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-blue-100 to-blue-200">
      <h1 className="text-5xl font-extrabold text-center text-gray-900">
        {selectedArea.areaName}
      </h1>
      <p className="mt-2 text-lg text-center text-gray-700">
        Location: {selectedArea.metadata.lat}, {selectedArea.metadata.lng}
      </p>
      <div className="mt-8">
        <h2 className="text-3xl font-semibold text-gray-800">Climbs</h2>
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {selectedArea.climbs.map((climb) => (
            <li
              key={climb.id}
              className="px-6 py-4 text-black transition duration-200 transform bg-white rounded-lg shadow-lg cursor-pointer hover:bg-gray-300 hover:scale-105"
              onClick={() => handleClimbClick(climb)}
            >
              <div className="font-bold text-gray-900 truncate">
                {climb.name}
              </div>
              <div className="text-sm text-gray-700 truncate">
                Grade:{" "}
                <span className="inline-block px-2 py-1 mt-1 text-center bg-gray-200 rounded">
                  {climb.grades.yds},{" "}
                  {climb.grades.french
                    ? climb.grades.french
                    : climb.grades.font}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AreaPage;
