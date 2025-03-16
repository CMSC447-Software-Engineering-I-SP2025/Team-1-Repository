import React, { useState } from 'react';
import './css/RecommendationTab.css';

const RecommendationTab = ({ recommendedClimbs }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="recommendations-container">
      <h2 className="text-2xl font-bold">Recommended Climbs</h2>
      <button onClick={toggleCollapse} className="mt-2 mb-4 px-4 py-2 bg-blue-500 text-white rounded">
        {isCollapsed ? 'Show Recommendations' : 'Hide Recommendations'}
      </button>
      {!isCollapsed && (
        <div className="recommendation-list">
          {recommendedClimbs.map((climb, index) => (
            <div key={index} className="climb-card mb-4">
              <h3 className="font-bold">{climb.name}</h3>
              <p>{climb.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationTab;