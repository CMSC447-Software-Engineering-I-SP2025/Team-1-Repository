import React, { useEffect, useState } from 'react';
import { supabase } from "../lib/supabaseClient"; 
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserProvider';
import "./css/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password,
    });
  
    if (error) {
      alert(`Login failed: ${error.message}`);
    } else {
      alert('Logged in successfully'); 
      console.log('User ID:', data.user.id);
      console.log('Session:', data.session);

      const { user } = data;

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
      } else {
        navigate("/profile", { state: { user: profileData } }); // Redirect to My Profile page
      }
    }
  };
  
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <div className="website-title">Boulder Buddy</div>
        <h2>Welcome Back</h2>
        <p>Log in to continue</p>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group password-group">
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️" }
            </span>
          </div>
        </div>
        <button type="submit">Login</button>
        <div className="info-box">
          <p>
            Don't have an account? <a href="/create-account">Sign up</a>
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