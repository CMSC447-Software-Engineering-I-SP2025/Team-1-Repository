import React from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useState } from 'react';
import axios from "axios";

const ClimbPage = ({ selectedClimb }) => {
  if (!selectedClimb) {
    return <div className="text-center text-gray-500">No climb selected</div>;
  }

  const [score, setScore] = useState('');

  useEffect(() => {
    const fetchAvg = async () => {
      try {
        const res = await axios.get("https://localhost:7195/api/Database/ClimbAvgRating", {
          params: { id: selectedClimb.id },
        });
          console.log("Average Rating:", res.data);
          setScore(res.data / 2);
      } catch (err) {
          setScore(0);
          console.error("Could not fetch average rating:", err);
      }
    };

    fetchAvg();
  }, [selectedClimb]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-r from-blue-100 to-blue-200">
      <h1 className="text-5xl font-extrabold text-center text-gray-900">
        {selectedClimb.name}
      </h1>
      <p className="mt-2 text-lg text-center text-gray-700">
        Area: {selectedClimb.area.areaName}
      </p>
      <p className="mt-2 text-lg text-center text-gray-700">
        Location: {selectedClimb.metadata.lat}, {selectedClimb.metadata.lng}
      </p>
          {score === 0 ? (
              <p>No reviews for this climb.</p>
          ) : (
                  <p className="mt-2 text-lg text-center text-gray-700">
                      Rating: {score}
                  </p>
          )}
      <div className="mt-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800">
          Grade
        </h2>
        <div className="flex justify-center mt-4">
          <span className="inline-block px-4 py-2 text-lg text-center bg-gray-200 rounded">
            {selectedClimb.grades.yds},{" "}
            {selectedClimb.grades.french
              ? selectedClimb.grades.french
              : selectedClimb.grades.font}
          </span>
                  
              </div>
              <Link to="/create-review" className="px-3">
                  Click me to create a review for this climb!
              </Link>
              <Link to="/view-reviews" className="px-3">
                  Click me to view reviews for this climb!
              </Link>
      </div>
    </div>
  );
};

export default ClimbPage;
