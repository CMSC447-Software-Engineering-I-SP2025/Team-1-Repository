import React from "react";
import climbs from "../data/climbs";

const ClimbPage = ({ currentClimb }) => {
  if (!currentClimb) {
    return (
      <div className="mt-10 text-center text-gray-500">No Climb Selected</div>
    );
  }

  const climb = climbs.find((climb) => climb.id === currentClimb.id);

  if (!climb) {
    return (
      <div className="mt-10 text-center text-gray-500">Climb not found</div>
    );
  }

  return (
    <div className="container p-6 mx-auto mt-10 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-blue-600">{climb.name}</h1>
      <p className="mt-4 text-lg text-gray-700">{climb.location}</p>
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-blue-600">Details</h2>
        <p className="mt-2 text-gray-700">Latitude: {climb.latitude}</p>
        <p className="mt-2 text-gray-700">Longitude: {climb.longitude}</p>
      </div>
    </div>
  );
};

export default ClimbPage;
