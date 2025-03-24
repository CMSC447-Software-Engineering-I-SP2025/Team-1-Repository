import React from "react";

const ClimbInfoBox = ({ name, location }) => {
  return (
    <div style={{ fontSize: "14px", padding: "5px" }}>
      <strong>{name}</strong>
      <br />
      <span>{location}</span>
    </div>
  );
};

export default ClimbInfoBox;
