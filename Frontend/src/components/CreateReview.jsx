import React, { useState } from 'react';
import "./css/LoginPage.css";

const LoginPage = ({ selectedClimb }) => {

    if (!selectedClimb) {
        return <div className="text-center text-gray-500">No climb selected</div>;
    }

  const [rating, setRating] = useState('');
  const [description, setDescription] = useState('');

  const createReview = (e) => {
    e.preventDefault();
    //onLogin(rating, password);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={createReview}>
       <h2>Create Review for {selectedClimb.name}</h2>
        <div className="form-group">
          <input
            type="range"
            max="10"
            min="1"
            id="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="What are your thoughts?"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default LoginPage;