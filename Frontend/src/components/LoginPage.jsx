import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/LoginPage.css";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin(username.toLowerCase(), password);
  };

  const goToCreateAccount = () => {
    navigate('/create-account');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
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
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        <div className="info-box">
          <p>
            Don't have an account? <a href="#" onClick={goToCreateAccount}>Sign up</a>
          </p>
          <p>
            <a href="/forgot-password">Forgot Password?</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;