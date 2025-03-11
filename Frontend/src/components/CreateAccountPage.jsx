import React, { useState } from 'react';
import "./CreateAccountPage.css";

const CreateAccountPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleCreateAccount = (e) => {
    e.preventDefault();
    // Simulate account creation
    alert(`Account created for ${username}`);
  };

  return (
    <div className="create-account-container">
      <form className="create-account-form" onSubmit={handleCreateAccount}>
        <h2>Create Account</h2>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Account</button>
        <div className="info-box">
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default CreateAccountPage;
