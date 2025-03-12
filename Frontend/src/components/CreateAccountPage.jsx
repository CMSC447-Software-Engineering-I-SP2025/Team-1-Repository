import React, { useState } from 'react';
import "./css/CreateAccountPage.css";

const CreateAccountPage = () => {
  const [username, setUsername] = useState(''); // Add state for username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCreateAccount = (e) => {
    e.preventDefault();
    alert(`Account created for ${username}`); // Update alert to include username
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="website-title">Boulder Buddy</div>
        <h2>New User</h2>
        <p>Sign up to continue</p>
        <form onSubmit={handleCreateAccount}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Continue</button>
        </form>
        <p className="login-text">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default CreateAccountPage;
